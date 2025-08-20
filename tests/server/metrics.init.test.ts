import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('metrics init', () => {
  // Danger: mutates process.env—reset between tests.
  const OLD = process.env;

  beforeEach(() => {
    process.env = { ...OLD };
    // Clear module cache to ensure fresh imports
    vi.resetModules();
  });

  it('returns null when disabled', async () => {
    process.env.METRICS_ENABLED = 'false';
    const { initMetrics } = await import('../../server/monitoring/metrics');
    expect(initMetrics()).toBeNull();
  });

  it('creates registry and histograms when enabled', async () => {
    process.env.METRICS_ENABLED = 'true';
    const { initMetrics } = await import('../../server/monitoring/metrics');
    const m = initMetrics();
    expect(m?.registry).toBeTruthy();
    expect(m?.httpDuration).toBeTruthy();
    expect(m?.opDuration).toBeTruthy();
  });

  it('handles custom bucket configuration', async () => {
    process.env.METRICS_ENABLED = 'true';
    process.env.METRICS_DEFAULT_BUCKETS = '0.1,0.5,1.0';
    const { initMetrics } = await import('../../server/monitoring/metrics');
    const m = initMetrics();
    expect(m).toBeTruthy();
  });

  it('handles invalid bucket configuration gracefully', async () => {
    process.env.METRICS_ENABLED = 'true';
    process.env.METRICS_DEFAULT_BUCKETS = 'invalid,0.5,1.0';
    const { initMetrics } = await import('../../server/monitoring/metrics');
    const m = initMetrics();
    expect(m).toBeTruthy();
    // Should filter out invalid values and use defaults
  });

  it('caches metrics instance', async () => {
    process.env.METRICS_ENABLED = 'true';
    const { initMetrics } = await import('../../server/monitoring/metrics');
    const m1 = initMetrics();
    const m2 = initMetrics();
    expect(m1).toBe(m2); // Same instance
  });
});
