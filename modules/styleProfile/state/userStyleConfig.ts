export const mcpContext = {
  file: 'modules/styleProfile/state/userStyleConfig.ts',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import type { StyleTargetProfile } from '../types/styleTypes';

const STORAGE_KEY = 'userStyleProfiles';

export function createUserStyleProfile(profile: StyleTargetProfile): string {
  if (!profile || typeof profile !== 'object') {
    throw new Error('Invalid profile provided');
  }

  const id = `${profile.genre ?? 'unknown'}-${Date.now()}`;
  const profiles = getUserStyleProfiles();
  const newProfile = { ...profile, id };
  const updated = [...profiles, newProfile];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  if (process.env.NODE_ENV === 'development') {
    console.log('[userStyleConfig] Created profile:', newProfile);
  }
  return id;
}

export function getUserStyleProfiles(): (StyleTargetProfile & {
  id: string;
})[] {
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
  if (!id || typeof id !== 'string') {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[userStyleConfig] Invalid ID provided for deletion:', id);
    }
    return;
  }

  const profiles = getUserStyleProfiles();
  const updated = profiles.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  if (process.env.NODE_ENV === 'development') {
    console.log('[userStyleConfig] Deleted profile:', id);
  }
}

export function exportUserStyleProfiles(): string {
  const profiles = getUserStyleProfiles();
  return JSON.stringify(profiles, null, 2);
}

export function importUserStyleProfiles(json: string): void {
  if (!json || typeof json !== 'string') {
    if (process.env.NODE_ENV === 'development') {
      console.error('[userStyleConfig] Invalid JSON provided for import');
    }
    return;
  }

  try {
    const arr = JSON.parse(json);
    if (Array.isArray(arr)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      if (process.env.NODE_ENV === 'development') {
        console.log('[userStyleConfig] Imported profiles:', arr);
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.error('[userStyleConfig] Imported data is not an array');
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[userStyleConfig] Failed to import profiles:', e);
    }
  }
}
