import { describe, it, expect } from 'vitest';

describe('performanceMonitor hoist regression', () => {
  it('does not throw on import/construct (no use-before-init)', async () => {
    // Dynamic import simulates actual module graph evaluation order
    const mod = await import('../../monitoring/performanceMonitor');
    // If the module executed fine, default/exports should exist.
    expect(mod).toBeTruthy();
  });
});
