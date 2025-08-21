import { Router } from 'express';
import { isFeatureAgenticsEnabled } from '../util/featureFlags';
import { makeOrchestrator } from '../agentics/orchestrator';
import { makePlanner } from '../agentics/agents/planner';
import type { Request, Response } from 'express';
import { rlAgentics } from '../middleware/ratelimit';
import {
  RunIdSchema,
  UserIdSchema,
  MaintenanceSchema,
} from '../schemas/agentics';

export function makeAgenticsRunRouter(deps?: {
  orchestrator?: ReturnType<typeof makeOrchestrator>;
}) {
  const router = Router();

  router.post('/run', async (req, res) => {
    const featureOn = isFeatureAgenticsEnabled();
    if (!featureOn) return res.sendStatus(404);

    // Per-user isolation: require auth or header (dev)
    const userId = (req as any).user?.id ?? req.header('x-user-id') ?? null;
    if (!userId) return res.status(401).json({ error: 'missing user' });

    const orchestrator =
      deps?.orchestrator ??
      makeOrchestrator({
        planner: makePlanner(),
        featureAgentics: featureOn,
        env: {
          SUPABASE_URL: process.env.SUPABASE_URL,
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
      });

    try {
      const { input } = req.body ?? {};

      // Clamp TTL at the route (abuse-proof)
      const rawTtl = Number(req.body?.ttlSeconds ?? 3600);
      const ttlSeconds = Math.max(
        10,
        Math.min(86400, isFinite(rawTtl) ? rawTtl : 3600)
      );

      const { runId } = await orchestrator.run({ userId, input, ttlSeconds });
      return res.status(200).json({ runId });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'internal' });
    }
  });

  // List user's runs (owner-scoped)
  router.get('/runs', async (req, res) => {
    if (!isFeatureAgenticsEnabled()) return res.sendStatus(404);
    const userId = (req as any).user?.id ?? req.header('x-user-id') ?? null;
    if (!userId) return res.status(401).json({ error: 'missing user' });

    try {
      const limit = Math.max(1, Math.min(50, Number(req.query.limit ?? 20)));
      const orchestrator =
        deps?.orchestrator ??
        makeOrchestrator({
          planner: makePlanner(),
          featureAgentics: true,
          env: {
            SUPABASE_URL: process.env.SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
          },
        });

      // if your blackboard exposes listRuns, call that; otherwise rehydrate from artifacts if needed
      const bb: any = (orchestrator as any).__blackboard ?? undefined;
      if (bb?.listRuns) {
        const runs = await bb.listRuns(userId, { limit });
        return res.json({ runs });
      }

      // Fallback: return last N "heads" from whatever status source you maintain
      return res.json({ runs: [] });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message ?? 'internal' });
    }
  });

  // TTL cleanup endpoint (protected with internal token)
  router.post('/maintenance/ttl', rlAgentics, async (req, res) => {
    if (!isFeatureAgenticsEnabled()) return res.sendStatus(404);

    const token = req.header('x-internal-token');
    const expected = process.env.INTERNAL_MAINT_TOKEN;
    if (!expected || token !== expected)
      return res.status(403).json({ error: 'forbidden' });

    const body = MaintenanceSchema.safeParse(req.body ?? {});
    if (!body.success)
      return res.status(400).json({ error: 'invalid payload' });

    try {
      const orchestrator =
        deps?.orchestrator ??
        makeOrchestrator({
          planner: makePlanner(),
          featureAgentics: true,
          env: {
            SUPABASE_URL: process.env.SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
          },
        });

      const affected = await orchestrator.cleanupTTLs?.({
        maxRows: body.data.maxRows ?? 1000,
      });
      return res.json({ ok: true, affected: affected ?? 0 });
    } catch (e: any) {
      const msg = e instanceof Error ? e.message : 'internal';
      return res.status(500).json({ error: msg });
    }
  });

  /**
   * GET /api/agentics/status/:runId/stream
   * Server-Sent Events for live agent step updates.
   */
  router.get(
    '/status/:runId/stream',
    rlAgentics,
    async (req: Request, res: Response) => {
      if (!isFeatureAgenticsEnabled()) return res.sendStatus(404);

      const userId =
        (req as unknown as { user?: { id?: string } }).user?.id ??
        req.header('x-user-id');
      if (!userId || !UserIdSchema.safeParse(userId).success) {
        return res.status(401).json({ error: 'missing user' });
      }

      const runId = req.params.runId;
      if (!RunIdSchema.safeParse(runId).success) {
        return res.status(400).json({ error: 'invalid runId' });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      // CORS for SSE (tight control, no wildcards)
      const frontendOrigin = process.env.FRONTEND_ORIGIN;
      if (frontendOrigin) {
        res.setHeader('Access-Control-Allow-Origin', frontendOrigin);
      }
      res.flushHeaders?.();

      // SSE idle clamp - ensure deterministic timeout even if disconnect events are missed
      const idleCutoff = setTimeout(() => {
        res.write(`event: bye\ndata: {"reason":"idle"}\n\n`);
        res.end();
      }, 30_000);

      // heartbeat every 10s
      const heartbeat = setInterval(() => {
        res.write(`event: ping\n`);
        res.write(
          `data: ${JSON.stringify({ ts: new Date().toISOString() })}\n\n`
        );
      }, 10_000);

      // hard timeout after 30s to avoid hanging sockets
      const killer = setTimeout(() => {
        res.write(`event: bye\n`);
        res.write(`data: {"reason":"timeout"}\n\n`);
        res.end();
      }, 30_000);

      // Cleanup on disconnect
      req.on('close', () => {
        clearInterval(heartbeat);
        clearTimeout(killer);
        clearTimeout(idleCutoff);
      });
      req.on('aborted', () => {
        clearInterval(heartbeat);
        clearTimeout(killer);
        clearTimeout(idleCutoff);
      });

      // If you have a pubsub, subscribe here; otherwise send hello only:
      res.write(`event: step\n`);
      res.write(
        `data: ${JSON.stringify({ type: 'hello', runId, ts: new Date().toISOString() })}\n\n`
      );
    }
  );

  return router;
}
