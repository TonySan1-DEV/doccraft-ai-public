// Pure and testable. Clamp sample to [0,1]. Injectable RNG for determinism.
export function shouldSample(
  sample: number,
  rand: () => number = Math.random
): boolean {
  const p = Math.max(0, Math.min(1, Number.isFinite(sample) ? sample : 0));
  if (p <= 0) return false;
  if (p >= 1) return true;
  return rand() < p;
}
