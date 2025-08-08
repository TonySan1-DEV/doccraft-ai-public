// MCP Context Block
/*
{
  file: "useUserTier.ts",
  role: "developer",
  allowedActions: ["validate", "suggest", "secure"],
  tier: "Free",
  contentSensitivity: "low",
  theme: "user_management"
}
*/

import { useMemo } from 'react';

export type UserTier = 'Free' | 'Pro' | 'Admin';

export interface UseUserTierResult {
  tier: UserTier;
  isProUser: boolean;
  isAdmin?: boolean;
}

/**
 * Lightweight stub hook for user tier.
 * - Looks for `userTier` in localStorage ("Free" | "Pro" | "Admin").
 * - Defaults to "Free" if not present.
 *
 * TODO:
 * - Integrate with your real auth/session source (e.g., Supabase user metadata).
 * - Replace localStorage read with a context/provider or server-backed source.
 */
export function useUserTier(): UseUserTierResult {
  const tier = useMemo<UserTier>(() => {
    try {
      const stored =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('userTier')
          : null;
      if (stored === 'Pro' || stored === 'Admin' || stored === 'Free')
        return stored as UserTier;
    } catch (error) {
      // Log error in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.warn('useUserTier: Failed to read localStorage:', error);
      }
    }
    return 'Free';
  }, []);

  return {
    tier,
    isProUser: tier === 'Pro' || tier === 'Admin',
    isAdmin: tier === 'Admin',
  };
}
