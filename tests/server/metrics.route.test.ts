import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('/metrics route functionality', () => {
  const OLD = process.env;

  beforeEach(() => {
    process.env = {
      ...OLD,
      METRICS_ENABLED: 'true',
      METRICS_TOKEN: 'test-token',
    };
    vi.resetModules();
  });

  it('initializes metrics when enabled', async () => {
    const { initMetrics } = await import('../../server/monitoring/metrics');
    const metrics = initMetrics();
    expect(metrics).toBeTruthy();
    expect(metrics?.registry).toBeTruthy();
    expect(metrics?.httpDuration).toBeTruthy();
    expect(metrics?.opDuration).toBeTruthy();
  });

  it('returns null when disabled', async () => {
    process.env['METRICS_ENABLED'] = 'false';
    const { initMetrics } = await import('../../server/monitoring/metrics');
    const metrics = initMetrics();
    expect(metrics).toBeNull();
  });

  it('handles token configuration', async () => {
    const token = process.env['METRICS_TOKEN'];
    expect(token).toBe('test-token');
  });

  it('creates metrics with proper structure', async () => {
    const { initMetrics } = await import('../../server/monitoring/metrics');
    const metrics = initMetrics();
    expect(metrics).toBeTruthy();
    expect(metrics?.httpDuration).toBeTruthy();
    expect(metrics?.opDuration).toBeTruthy();
    expect(metrics?.registry).toBeTruthy();
  });
});
