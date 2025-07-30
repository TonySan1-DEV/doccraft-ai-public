import { ExtendedUser } from '../contexts/AuthContext'

export interface UserRedirectInfo {
  path: string
  reason: string
}

/**
 * Determines the appropriate redirect path based on user status and tier
 */
export function getUserRedirectPath(user: ExtendedUser | null): UserRedirectInfo {
  console.log('🔄 getUserRedirectPath called with user:', user)
  
  // If no user, redirect to home/login
  if (!user) {
    console.log('🔄 No user, redirecting to home')
    return {
      path: '/',
      reason: 'User not authenticated'
    }
  }

  // Check if user email is verified
  if (!user.email_confirmed_at) {
    console.log('🔄 Email not confirmed, redirecting to profile')
    return {
      path: '/profile',
      reason: 'Email verification required'
    }
  }

  // Check user tier and redirect accordingly
  switch (user.tier) {
    case 'Admin':
      console.log('🔄 Admin user, redirecting to dashboard')
      return {
        path: '/dashboard',
        reason: 'Admin user - full access'
      }
    
    case 'Pro':
      console.log('🔄 Pro user, redirecting to dashboard')
      return {
        path: '/dashboard',
        reason: 'Pro user - full access'
      }
    
    case 'Free':
      console.log('🔄 Free user, redirecting to book outliner')
      return {
        path: '/book-outliner',
        reason: 'Free user - limited access, redirecting to book outliner'
      }
    
    default:
      // If tier is not set, check if user has completed profile setup
      console.log('🔄 No tier set, redirecting to profile for setup')
      return {
        path: '/profile',
        reason: 'Profile setup required'
      }
  }
}

/**
 * Checks if a user should be redirected to a specific onboarding flow
 */
export function getOnboardingRedirect(user: ExtendedUser | null): UserRedirectInfo | null {
  console.log('🔄 getOnboardingRedirect called with user:', user)
  
  if (!user) return null

  // Check if user needs to complete profile setup
  if (!user.tier) {
    console.log('🔄 No tier set, onboarding redirect to profile')
    return {
      path: '/profile',
      reason: 'Complete profile setup'
    }
  }

  // Check if user needs to verify email
  if (!user.email_confirmed_at) {
    console.log('🔄 Email not confirmed, onboarding redirect to profile')
    return {
      path: '/profile',
      reason: 'Email verification required'
    }
  }

  console.log('🔄 No onboarding redirect needed')
  return null
}

/**
 * Gets the default landing page for new users
 */
export function getDefaultLandingPage(user: ExtendedUser | null): string {
  console.log('🔄 getDefaultLandingPage called with user:', user)
  
  if (!user) {
    console.log('🔄 No user, default landing page is home')
    return '/'
  }
  
  const redirectInfo = getUserRedirectPath(user)
  console.log('🔄 Default landing page:', redirectInfo.path)
  return redirectInfo.path
} 