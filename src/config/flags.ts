// src/config/flags.ts
export type FlagKey =
  | "VITE_FEATURE_I18N"
  | "VITE_FEATURE_AGENTICS"
  | "VITE_FEATURE_AUDIOBOOK"
  | "VITE_FEATURE_CHILDRENS_GENRE"
  | "VITE_FEATURE_ENHANCED_IMAGERY";

function toBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.toLowerCase();
    return s === "1" || s === "true" || s === "on" || s === "yes";
  }
  return false;
}

export const Flags: Readonly<Record<FlagKey, boolean>> = {
  VITE_FEATURE_I18N: toBool(import.meta.env['VITE_FEATURE_I18N']),
  VITE_FEATURE_AGENTICS: toBool(import.meta.env['VITE_FEATURE_AGENTICS']),
  VITE_FEATURE_AUDIOBOOK: toBool(import.meta.env['VITE_FEATURE_AUDIOBOOK']),
  VITE_FEATURE_CHILDRENS_GENRE: toBool(import.meta.env['VITE_FEATURE_CHILDRENS_GENRE']),
  VITE_FEATURE_ENHANCED_IMAGERY: toBool(import.meta.env['VITE_FEATURE_ENHANCED_IMAGERY']),
};

export const isI18nEnabled = () => Flags.VITE_FEATURE_I18N;
export const isAgenticsEnabled = () => Flags.VITE_FEATURE_AGENTICS;
export const isAudiobookEnabled = () => Flags.VITE_FEATURE_AUDIOBOOK;
export const isChildrenGenreEnabled = () => Flags.VITE_FEATURE_CHILDRENS_GENRE;
export const isEnhancedImageryEnabled = () => Flags.VITE_FEATURE_ENHANCED_IMAGERY;
