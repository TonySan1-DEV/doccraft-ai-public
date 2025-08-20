import { describe, it, expect } from "vitest";

// Helper to reload the module with controlled env
async function loadWithEnv(vars: Record<string, string | undefined>) {
  const original = { ...import.meta.env };
  Object.assign(import.meta.env, vars);
  // dynamic import ensures evaluation with the modified env
  const mod = await import("@/config/flags");
  Object.assign(import.meta.env, original);
  return mod;
}

describe("Feature flags", () => {
  it("default flags are false when unset", async () => {
    const { isI18nEnabled, isAudiobookEnabled, isChildrenGenreEnabled, isAgenticsEnabled, isEnhancedImageryEnabled } =
      await loadWithEnv({});
    expect(isI18nEnabled()).toBe(false);
    expect(isAudiobookEnabled()).toBe(false);
    expect(isChildrenGenreEnabled()).toBe(false);
    expect(isAgenticsEnabled()).toBe(false);
    expect(isEnhancedImageryEnabled()).toBe(false);
  });

  it("truthy env values enable flags", async () => {
    const { isI18nEnabled, isAudiobookEnabled } = await loadWithEnv({
      VITE_FEATURE_I18N: "true",
      VITE_FEATURE_AUDIOBOOK: "1",
    });
    expect(isI18nEnabled()).toBe(true);
    expect(isAudiobookEnabled()).toBe(true);
  });
});
