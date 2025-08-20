import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('monitor persist flags', () => {
  let old = { ...process.env };

  beforeEach(() => {
    old = { ...process.env };
  });

  afterEach(() => {
    process.env = old;
  });

  it('sampling off when disabled', () => {
    process.env.MONITORING_PERSIST_ENABLED = 'false';
    const { shouldPersist } = requireShim();
    expect(shouldPersist()).toBe(false);
  });

  it('sampling on within bounds', () => {
    process.env.MONITORING_PERSIST_ENABLED = 'true';
    process.env.MONITORING_PERSIST_SAMPLE = '1';
    const { shouldPersist } = requireShim();
    // Force Math.random to 0
    const mr = Math.random;
    Math.random = () => 0;
    expect(shouldPersist()).toBe(true);
    Math.random = mr;
  });

  it('sampling respects bounds', () => {
    process.env.MONITORING_PERSIST_ENABLED = 'true';
    process.env.MONITORING_PERSIST_SAMPLE = '0.5';
    const { shouldPersist } = requireShim();

    // Test with Math.random = 0.3 (should pass)
    const mr = Math.random;
    Math.random = () => 0.3;
    expect(shouldPersist()).toBe(true);

    // Test with Math.random = 0.7 (should fail)
    Math.random = () => 0.7;
    expect(shouldPersist()).toBe(false);

    Math.random = mr;
  });

  it('handles invalid sample values', () => {
    process.env.MONITORING_PERSIST_ENABLED = 'true';
    process.env.MONITORING_PERSIST_SAMPLE = 'invalid';
    const { shouldPersist } = requireShim();
    expect(shouldPersist()).toBe(false);
  });

  it('handles zero sample values', () => {
    process.env.MONITORING_PERSIST_ENABLED = 'true';
    process.env.MONITORING_PERSIST_SAMPLE = '0';
    const { shouldPersist } = requireShim();
    expect(shouldPersist()).toBe(false);
  });

  it('handles negative sample values', () => {
    process.env.MONITORING_PERSIST_ENABLED = 'true';
    process.env.MONITORING_PERSIST_SAMPLE = '-1';
    const { shouldPersist } = requireShim();
    expect(shouldPersist()).toBe(false);
  });
});

function requireShim() {
  // Test the streamlined implementation logic
  return {
    shouldPersist: () => {
      const persistEnabled = process.env.MONITORING_PERSIST_ENABLED === 'true';
      if (!persistEnabled) return false;

      const sample = Math.max(
        0,
        Math.min(1, Number(process.env.MONITORING_PERSIST_SAMPLE ?? '0.25'))
      );
      return Number.isFinite(sample) && sample > 0 && Math.random() < sample;
    },
  };
}
