type ClientReport = {
  name?: string;
  message?: string;
  stack?: string;
  componentStack?: string;
  url?: string;
  userAgent?: string;
};

const enabled =
  typeof window !== 'undefined' &&
  String(import.meta.env?.VITE_MONITORING_PERSIST_ENABLED ?? 'true') === 'true';

export async function reportClientError(
  err: unknown,
  info?: { componentStack?: string }
) {
  if (!enabled) return;

  // Conservative extraction; your server already sanitizes further.
  const e = err as any;
  const payload: ClientReport = {
    name: e?.name,
    message: e?.message,
    stack: typeof e?.stack === 'string' ? e.stack.slice(0, 4000) : undefined,
    componentStack: info?.componentStack,
    url: typeof window !== 'undefined' ? window.location?.href : undefined,
    userAgent:
      typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };

  try {
    // Try to send to the monitor endpoint
    const response = await fetch('/api/monitor/client-error', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // so it can send during unload
    });

    if (!response.ok) {
      // If endpoint doesn't exist, log to console in development
      if (import.meta.env?.MODE !== 'production') {
        console.debug(
          '[monitor] Client error (endpoint not available):',
          payload
        );
      }
    }
  } catch {
    // Fallback: log to console in development
    if (import.meta.env?.MODE !== 'production') {
      console.debug('[monitor] Client error (network failed):', payload);
    }
  }
}
