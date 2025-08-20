// src/monitoring/error/safeError.ts
import { sanitizeStack } from './stackSanitizer';

// at top
const REPORT_FLAG = (import.meta as any).env?.VITE_MONITORING_REPORT === 'true';
const REPORT_URL =
  (import.meta as any).env?.VITE_MONITORING_REPORT_URL || '/api/monitor/error';
const MAX_BYTES = 12 * 1024; // soft cap

function trySendBeacon(url: string, body: string): boolean {
  try {
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([body], { type: 'application/json' });
      return (navigator as any).sendBeacon(url, blob);
    }
  } catch {}
  return false;
}

export async function reportSafeError(
  payload: SafeErrorPayload
): Promise<void> {
  if (!REPORT_FLAG) return;
  try {
    const body = JSON.stringify({
      ...payload,
      ts: Date.now(),
      ua: typeof navigator !== 'undefined' ? navigator.userAgent : 'node',
      v: 1,
    });
    if (body.length > MAX_BYTES) return; // drop oversized payloads on client
    if (!trySendBeacon(REPORT_URL, body)) {
      // non‑blocking fallback; ignore failures
      if (typeof fetch !== 'undefined') {
        void fetch(REPORT_URL, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body,
        });
      }
    }
  } catch {}
}

export type SafeErrorPayload = {
  message: string;
  stack: string;
  tags?: Record<string, string | number | boolean>;
};

export async function captureSafeError(
  err: unknown,
  tags?: SafeErrorPayload['tags']
): Promise<SafeErrorPayload> {
  const { message, stack } = await sanitizeStack(err);
  return { message, stack, tags };
}

// Helper to run actions safely; never throws to caller.
export async function safeRun<T>(
  label: string,
  fn: () => Promise<T> | T,
  onError?: (p: SafeErrorPayload) => void | Promise<void>,
  tags?: SafeErrorPayload['tags']
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (e) {
    const payload = await captureSafeError(e, { ...tags, label });
    try {
      await onError?.(payload);
    } catch {}
    // never rethrow — monitoring must not break UX.
    return undefined;
  }
}
