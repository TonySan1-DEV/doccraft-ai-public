type Env = Record<string, string | undefined>;

const E = import.meta.env as unknown as Env;

// Safe getters (never leak secrets to UI; use only for VITE_* on client)
export const env = {
  get<T extends string = string>(k: string, fallback?: T): T {
    const v = E[k];
    if (v == null) {
      if (fallback !== undefined) return fallback;
      throw new Error(`Missing required env: ${k}`);
    }
    return v as T;
  },
  has(k: string): boolean {
    return E[k] != null;
  }
};
