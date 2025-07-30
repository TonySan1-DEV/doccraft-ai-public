// MCP Context Block
/*
role: developer,
tier: Pro,
file: "modules/styleProfile/state/userStyleConfig.ts",
allowedActions: ["scaffold", "define", "persist"],
theme: "style_presets"
*/

import type { StyleTargetProfile } from '../types/styleTypes';

const STORAGE_KEY = 'userStyleProfiles';

export function createUserStyleProfile(profile: StyleTargetProfile): string {
  const id = `${profile.genre}-${Date.now()}`;
  const profiles = getUserStyleProfiles();
  const newProfile = { ...profile, id };
  const updated = [...profiles, newProfile];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[userStyleConfig] Created profile:', newProfile);
  }
  return id;
}

export function getUserStyleProfiles(): (StyleTargetProfile & { id: string })[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;
    return [];
  } catch {
    return [];
  }
}

export function deleteUserStyleProfile(id: string): void {
  const profiles = getUserStyleProfiles();
  const updated = profiles.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[userStyleConfig] Deleted profile:', id);
  }
}

export function exportUserStyleProfiles(): string {
  const profiles = getUserStyleProfiles();
  return JSON.stringify(profiles, null, 2);
}

export function importUserStyleProfiles(json: string): void {
  try {
    const arr = JSON.parse(json);
    if (Array.isArray(arr)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('[userStyleConfig] Imported profiles:', arr);
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[userStyleConfig] Failed to import profiles:', e);
    }
  }
} 