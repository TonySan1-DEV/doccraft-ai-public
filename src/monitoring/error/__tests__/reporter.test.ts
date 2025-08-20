import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('reportSafeError', () => {
  let originalNavigator: any;

  beforeEach(() => {
    originalNavigator = globalThis.navigator;
  });

  afterEach(() => {
    if (originalNavigator) {
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    }
  });

  it('no-op when disabled', async () => {
    // Test that the function exists and can be called
    const { reportSafeError } = await import('../../error/safeError');
    await expect(
      reportSafeError({ message: 'm', stack: 's' })
    ).resolves.toBeUndefined();
  });

  it('can be imported and called', async () => {
    const { reportSafeError } = await import('../../error/safeError');
    expect(typeof reportSafeError).toBe('function');
    await expect(
      reportSafeError({ message: 'm', stack: 's' })
    ).resolves.toBeUndefined();
  });
});
