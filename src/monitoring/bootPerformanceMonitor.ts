// src/monitoring/bootPerformanceMonitor.ts
/* Lazy boot helper for performance monitoring — safe, code-split, failure-proof */

import { safeRun, reportSafeError } from './error/safeError';

type IdleCb = (deadline: {
  didTimeout: boolean;
  timeRemaining: () => number;
}) => void;
const ric: (cb: IdleCb, opts?: { timeout: number }) => number =
  (globalThis as any).requestIdleCallback ??
  ((cb: IdleCb) =>
    setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 0));

interface BootOptions {
  enabled: boolean;
  supabase?: any;
  alertService?: any;
}

// Watchdog and sampling constants
const KEY_DISABLED = '__monitor_disabled_v1';
const KEY_ERRORS = '__monitor_errors_v1';
const MAX_ERRORS = 2;

function isDisabled(): boolean {
  try {
    return sessionStorage.getItem(KEY_DISABLED) === '1';
  } catch {
    return false; // sessionStorage not available
  }
}

function bumpError(): void {
  try {
    const n = Math.min(
      99,
      (parseInt(sessionStorage.getItem(KEY_ERRORS) || '0', 10) || 0) + 1
    );
    sessionStorage.setItem(KEY_ERRORS, String(n));
    if (n >= MAX_ERRORS) {
      sessionStorage.setItem(KEY_DISABLED, '1');
      if ((import.meta as any).env?.VITE_DEBUG_MONITOR === 'true') {
        console.debug('[perf-monitor] disabled after', n, 'errors');
      }
    }
  } catch {
    // sessionStorage not available, ignore
  }
}

function passesSampling(): boolean {
  const s = Number((import.meta as any).env?.VITE_MONITORING_SAMPLE ?? '0');
  if (!Number.isFinite(s) || s <= 0) return false;
  return Math.random() < s;
}

export async function bootPerformanceMonitor({
  enabled,
  supabase,
  alertService,
}: BootOptions) {
  if (!enabled || isDisabled() || !passesSampling()) return;

  ric(
    async () => {
      await safeRun(
        'monitor.start',
        async () => {
          // Dynamic import creates a separate chunk
          const mod = await import(
            /* webpackChunkName: "perf-monitor" */ './performanceMonitor'
          );
          // The module should export PerformanceMonitor (class) by name
          const { PerformanceMonitor } = mod as any;
          if (typeof PerformanceMonitor !== 'function') return;
          // Best-effort start, errors are contained
          const monitor = new PerformanceMonitor(supabase, alertService);
          if (typeof monitor.start === 'function') {
            await monitor.start();
          }
        },
        async payload => {
          // Bump error count for watchdog
          bumpError();
          // Optional: send to your /metrics or console.debug in non-prod
          if ((import.meta as any).env?.MODE !== 'production') {
            // eslint-disable-next-line no-console
            console.debug(
              '[monitor:error]',
              payload.message,
              '\n',
              payload.stack
            );
          }
          await reportSafeError(payload);
        },
        { component: 'performanceMonitor' }
      );
    },
    { timeout: 1500 }
  );
}
