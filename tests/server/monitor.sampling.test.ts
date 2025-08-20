import { describe, it, expect } from 'vitest';
import { shouldSample } from '../../server/monitoring/sampling';

describe('shouldSample', () => {
  it('never samples at 0', () => {
    const alwaysOne = () => 1;
    expect(shouldSample(0, alwaysOne)).toBe(false);
    expect(shouldSample(-0.1, alwaysOne)).toBe(false);
  });

  it('always samples at 1', () => {
    const alwaysZero = () => 0;
    expect(shouldSample(1, alwaysZero)).toBe(true);
    expect(shouldSample(1.5, alwaysZero)).toBe(true);
  });

  it('samples mid probability deterministically with injected RNG', () => {
    const seq = [0.49, 0.5, 0.51];
    let i = 0;
    const rng = () => seq[i++ % seq.length];
    expect(shouldSample(0.5, rng)).toBe(true); // 0.49 < 0.5
    expect(shouldSample(0.5, rng)).toBe(false); // 0.50 !< 0.5
    expect(shouldSample(0.5, rng)).toBe(false); // 0.51 !< 0.5
  });

  it('handles invalid inputs gracefully', () => {
    const alwaysZero = () => 0;
    expect(shouldSample(NaN, alwaysZero)).toBe(false);
    expect(shouldSample(Infinity, alwaysZero)).toBe(false);
    expect(shouldSample(-Infinity, alwaysZero)).toBe(false);
  });

  it('clamps values to valid range', () => {
    const alwaysZero = () => 0;
    const alwaysOne = () => 1;

    // Should clamp negative values to 0
    expect(shouldSample(-1, alwaysOne)).toBe(false);
    expect(shouldSample(-100, alwaysOne)).toBe(false);

    // Should clamp values > 1 to 1
    expect(shouldSample(2, alwaysZero)).toBe(true);
    expect(shouldSample(100, alwaysZero)).toBe(true);
  });
});
