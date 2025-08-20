import { describe, it, expect, vi } from 'vitest';

// Simulate absence or failure of the monitor module
vi.mock('../../monitoring/performanceMonitor', () => {
  throw new Error('simulate dynamic import failure');
});

describe('lazy boot: monitoring never blocks app', () => {
  it('bootPerformanceMonitor resolves regardless of import failure', async () => {
    const { bootPerformanceMonitor } = await import(
      '../../monitoring/bootPerformanceMonitor'
    );
    await expect(
      bootPerformanceMonitor({ enabled: true })
    ).resolves.toBeUndefined();
  });

  it('no-op when disabled', async () => {
    const { bootPerformanceMonitor } = await import(
      '../../monitoring/bootPerformanceMonitor'
    );
    await expect(
      bootPerformanceMonitor({ enabled: false })
    ).resolves.toBeUndefined();
  });
});
