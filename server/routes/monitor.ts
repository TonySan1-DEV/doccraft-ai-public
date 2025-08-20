import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { getSupabaseAdmin } from '../lib/supabaseAdmin';

const router = Router();

type Payload = {
  message: string;
  stack: string;
  ts?: number;
  ua?: string;
  v?: number;
  tags?: Record<string, string | number | boolean>;
};

const MAX_MSG = 5_000;
const MAX_STACK = 12_000;

// Consolidated environment configuration
const CONFIG = {
  enabled: process.env.MONITORING_REPORT_ENABLED === 'true',
  sample: Math.max(
    0,
    Math.min(1, Number(process.env.MONITORING_REPORT_SAMPLE ?? '1'))
  ),
  persist: {
    enabled: process.env.MONITORING_PERSIST_ENABLED === 'true',
    sample: Math.max(
      0,
      Math.min(1, Number(process.env.MONITORING_PERSIST_SAMPLE ?? '0.25'))
    ),
    retentionDays: Math.max(
      1,
      Number(process.env.MONITORING_RETENTION_DAYS ?? '30') || 30
    ),
    logErrors: process.env.MONITORING_LOG_ERRORS === 'true',
  },
} as const;

// naive in‑memory token bucket per ip (or x-forwarded-for)
const bucket = new Map<string, { tokens: number; ts: number }>();
const CAP = 10; // 10 events
const REFILL_MS = 10_000; // per 10 seconds

function ipKey(req: Request): string {
  const xf = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
  return xf || req.socket.remoteAddress || 'unknown';
}

function allow(req: Request): boolean {
  const k = ipKey(req);
  const now = Date.now();
  const b = bucket.get(k) || { tokens: CAP, ts: now };
  const refill = Math.floor((now - b.ts) / REFILL_MS) * CAP;
  if (refill > 0) {
    b.tokens = Math.min(CAP, b.tokens + refill);
    b.ts = now;
  }
  if (b.tokens <= 0) {
    bucket.set(k, b);
    return false;
  }
  b.tokens -= 1;
  bucket.set(k, b);
  return true;
}

// Streamlined persistence helper
function shouldPersist(): boolean {
  if (!CONFIG.persist.enabled) return false;
  const sample = CONFIG.persist.sample;
  return Number.isFinite(sample) && sample > 0 && Math.random() < sample;
}

function hashIp(ip: string | undefined, msg: string): string | null {
  try {
    const salt = process.env.MONITORING_IP_SALT || 'doccraft';
    if (!ip) return null;
    return crypto
      .createHash('sha256')
      .update(ip + ':' + msg + ':' + salt)
      .digest('hex');
  } catch {
    return null;
  }
}

function reqIp(req: any): string | undefined {
  const xf = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
  return xf || req.socket?.remoteAddress || undefined;
}

// Prometheus counters via global registry if available
const metrics = (global as any).__PROM__ ?? {
  inc: (_name: string, _labels?: Record<string, string>) => {},
};

router.post('/error', expressJsonGuard, (req: Request, res: Response) => {
  if (!CONFIG.enabled) return res.status(404).end();
  if (Math.random() > CONFIG.sample) return res.status(202).end();
  if (!allow(req)) {
    metrics.inc('doccraft_monitor_dropped_total', { reason: 'rate_limit' });
    return res.status(429).end();
  }

  const p: Payload = req.body ?? {};
  if (typeof p?.message !== 'string' || typeof p?.stack !== 'string') {
    metrics.inc('doccraft_monitor_dropped_total', { reason: 'schema' });
    return res.status(400).end();
  }
  if (p.message.length > MAX_MSG || p.stack.length > MAX_STACK) {
    metrics.inc('doccraft_monitor_dropped_total', { reason: 'size' });
    return res.status(413).end();
  }

  // scrub again (defense in depth)
  const safeMsg = p.message.replace(/\s+/g, ' ').slice(0, MAX_MSG);
  const safeStack = p.stack.slice(0, MAX_STACK);
  const component = String(p.tags?.component ?? 'unknown');
  const env = process.env.NODE_ENV || 'development';

  // cheap event id
  const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

  metrics.inc('doccraft_monitor_errors_total', { component, env });

  // Optionally sample one line into logs for quick triage (omit stack in prod if you prefer)
  if (CONFIG.persist.logErrors) {
    // eslint-disable-next-line no-console
    console.warn(
      `[monitor:${component}]`,
      safeMsg,
      '\n',
      safeStack.split('\n').slice(0, 5).join('\n')
    );
  }

  // Streamlined persistence (non-blocking)
  (async () => {
    try {
      if (!shouldPersist()) return;

      const admin = getSupabaseAdmin();
      const ip = reqIp(req);
      const env = process.env.NODE_ENV || 'development';

      const { error } = await admin.from('monitor_events').insert({
        env,
        component,
        message: safeMsg,
        stack: safeStack,
        user_agent: p.ua?.slice(0, 400) ?? null,
        session_id:
          (req.headers['x-session-id'] as string)?.slice(0, 120) ?? null,
        ip_hash: hashIp(ip, safeMsg),
        tags: p.tags ?? {},
      });

      if (error) {
        metrics.inc('doccraft_monitor_dropped_total', { reason: 'db' });
        if (CONFIG.persist.logErrors) {
          console.warn('[monitor:persist]', error.message);
        }
      }
    } catch (err) {
      metrics.inc('doccraft_monitor_dropped_total', { reason: 'db_ex' });
      if (CONFIG.persist.logErrors) {
        console.warn(
          '[monitor:persist]',
          err instanceof Error ? err.message : 'Unknown error'
        );
      }
    }
  })();

  // TODO: push to a durable sink (e.g., PostgreSQL table, S3, or log drain) behind a feature flag.
  return res.status(202).json({ id });
});

// Streamlined retention cleanup
async function maybeDailyPurge(): Promise<void> {
  try {
    const key = '__monitor_purge_ts';
    const now = Date.now();
    const last = (global as any)[key] as number | undefined;

    // 6-hour gate to prevent excessive calls
    if (last && now - last < 6 * 60 * 60 * 1000) return;

    (global as any)[key] = now;

    const admin = getSupabaseAdmin();
    await admin.rpc('purge_old_monitor_events', {
      retention_days: CONFIG.persist.retentionDays,
    });
  } catch (err) {
    // Silent fail in production - metrics will show issues
    if (CONFIG.persist.logErrors) {
      console.warn(
        '[monitor:purge]',
        err instanceof Error ? err.message : 'Unknown error'
      );
    }
  }
}

// small JSON guard to avoid bringing in body-parser in some setups
function expressJsonGuard(req: Request, res: Response, next: Function) {
  if (req.is('application/json')) {
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', c => (raw += c));
    req.on('end', () => {
      try {
        req.body = raw ? JSON.parse(raw) : {};
      } catch {
        req.body = {};
      }
      next();
    });
  } else {
    req.body = {};
    next();
  }
}

export default router;
