// src/monitoring/error/stackSanitizer.ts
// Minimal, sourcemap-safe stack sanitizer: redact secrets, strip queries, collapse paths.
// Optional mapping hook via global/window: __MAP_STACK__(stack: string): Promise<string>|string

const SECRET_KEYS = [
  'token', 'apikey', 'api_key', 'authorization', 'auth', 'password', 'secret', 'supabase', 'openai', 'anthropic'
];

const REDACT = '<redacted>';

function stripQuery(u: string): string {
  try {
    const url = new URL(u);
    // remove all search params
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    // Not a URL—best-effort strip common query shapes
    return u.replace(/\?[^)\s]*/g, '');
  }
}

function redactSecrets(text: string): string {
  let out = text;
  // redact key=value pairs in query-like segments
  out = out.replace(
    new RegExp(`(${SECRET_KEYS.join('|')})=([^&\\s)]+)`, 'gi'),
    (_, k) => `${k}=${REDACT}`
  );
  // redact "Bearer <token>" or similar
  out = out.replace(/\bBearer\s+[A-Za-z0-9._\-+/=]+/gi, `Bearer ${REDACT}`);
  // redact long base64-ish tokens
  out = out.replace(/[A-Za-z0-9+/_-]{24,}\.?[A-Za-z0-9+/_-]{0,}\.?[A-Za-z0-9+/_-]{0,}/g, REDACT);
  return out;
}

function collapseAbsolutePaths(text: string): string {
  // remove absolute FS roots and user dirs, keep filename:line:col
  return text
    .replace(/file:\/\/\/?[A-Za-z]:[\\/][^)\s]+/g, (m) => m.split(/[\\/]/).slice(-1)[0]) // win
    .replace(/\/(?:Users|home|var|opt|private)\/[^)\s]+/g, (m) => m.split('/').slice(-1)[0]); // unix
}

function normalizeLines(stack: string): string[] {
  return stack.split(/\r?\n/).map((line) => {
    // strip URL queries
    line = line.replace(/\((https?:\/\/[^)\s]+)\)/g, (_, url) => `(${stripQuery(url)})`);
    line = stripQuery(line);
    line = collapseAbsolutePaths(line);
    line = redactSecrets(line);
    return line.trimEnd();
  });
}

export async function sanitizeStack(err: unknown): Promise<{ message: string; stack: string }> {
  const e = err instanceof Error ? err : new Error(String(err));
  const raw = e.stack || `${e.name || 'Error'}: ${e.message}`;
  const mapped = await maybeMap(raw);
  const lines = normalizeLines(mapped);
  // keep at most 20 frames
  const trimmed = [lines[0], ...lines.slice(1, 21)].join('\n');
  const msg = redactSecrets(String(e.message || e.name || 'Error'));
  return { message: msg, stack: trimmed };
}

// Optional sourcemap mapping hook: a hosting layer (Sentry, etc.) can provide it.
// We do NOT fetch .map files or leak any details; if the hook is missing, we keep raw frames.
async function maybeMap(stack: string): Promise<string> {
  const g: any = (globalThis as any);
  try {
    const mapFn = g.__MAP_STACK__;
    if (!mapFn) return stack;
    const res = mapFn.call(g, stack);
    return typeof res?.then === 'function' ? await res : String(res);
  } catch {
    return stack;
  }
}
