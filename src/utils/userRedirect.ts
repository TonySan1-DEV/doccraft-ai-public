import { ExtendedUser } from '../contexts/AuthContext';

export interface UserRedirectInfo {
  path: string;
  reason: string;
}

/**
 * Determines the appropriate redirect path based on user status and tier
 */
export function getUserRedirectPath(
  user: ExtendedUser | null
): UserRedirectInfo {
  // If no user, redirect to home/login
  if (!user) {
    return {
      path: '/',
      reason: 'User not authenticated',
    };
  }

  // Check if user email is verified
  if (!user.email_confirmed_at) {
    return {
      path: '/profile',
      reason: 'Email verification required',
    };
  }

  // Check user tier and redirect accordingly
  switch (user.tier) {
    case 'Admin':
      return {
        path: '/dashboard',
        reason: 'Admin user - full access',
      };

    case 'Pro':
      return {
        path: '/dashboard',
        reason: 'Pro user - full access',
      };

    case 'Free':
      return {
        path: '/book-outliner',
        reason: 'Free user - limited access, redirecting to book outliner',
      };

    default:
      // If tier is not set, check if user has completed profile setup

      return {
        path: '/profile',
        reason: 'Profile setup required',
      };
  }
}

/**
 * Checks if a user should be redirected to a specific onboarding flow
 */
export function getOnboardingRedirect(
  user: ExtendedUser | null
): UserRedirectInfo | null {
  if (!user) return null;

  // Check if user needs to complete profile setup
  if (!user.tier) {
    return {
      path: '/profile',
      reason: 'Complete profile setup',
    };
  }

  // Check if user needs to verify email
  if (!user.email_confirmed_at) {
    return {
      path: '/profile',
      reason: 'Email verification required',
    };
  }

  return null;
}

/**
 * Gets the default landing page for new users
 */
export function getDefaultLandingPage(user: ExtendedUser | null): string {
  if (!user) {
    return '/';
  }

  const redirectInfo = getUserRedirectPath(user);

  return redirectInfo.path;
}
