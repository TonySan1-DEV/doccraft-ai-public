export function safeObjectKey(...parts: string[]): string {
  const joined = parts.join('/').replace(/(\.\.|\/\/)/g, '');
  return joined.replace(/[^a-zA-Z0-9/_-]/g, '_').replace(/^\/+/, '');
}

export function clamp<T extends number>(v: T, min: T, max: T): T {
  return Math.max(min, Math.min(max, v)) as T;
}

export function normalizedKey(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/\/{2,}/g, '/')
    .replace(/^\//, '')
    .slice(0, 180);
}
