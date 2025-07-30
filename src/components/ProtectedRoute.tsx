import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUserRedirectPath, getOnboardingRedirect } from '../utils/userRedirect'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedTiers?: ('Free' | 'Pro' | 'Admin')[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  allowedTiers = ['Free', 'Pro', 'Admin']
}) => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()


  useEffect(() => {
    if (loading) return // Wait for auth to load

    // If authentication is required but user is not logged in
    if (requireAuth && !user) {
      toast.error('Please sign in to access this page')
      navigate('/')
      return
    }

    // If user is logged in, check for redirects
    if (user) {
      // Check account status first
      checkAccountStatus()
      
      // Check for onboarding redirects first
      const onboardingRedirect = getOnboardingRedirect(user)
      if (onboardingRedirect && location.pathname !== onboardingRedirect.path) {
        console.log(`🔄 Redirecting to onboarding: ${onboardingRedirect.reason}`)
        toast.success(onboardingRedirect.reason)
        navigate(onboardingRedirect.path)
        return
      }

      // Check if user's tier is allowed for this route
      if (allowedTiers.length > 0 && user.tier && !allowedTiers.includes(user.tier)) {
        const redirectInfo = getUserRedirectPath(user)
        console.log(`🔄 Redirecting due to tier restriction: ${redirectInfo.reason}`)
        toast.error(`This feature requires a higher tier. You are currently on ${user.tier} tier.`)
        navigate(redirectInfo.path)
        return
      }

      // Check for general redirects based on user status
      const redirectInfo = getUserRedirectPath(user)
      if (redirectInfo.path !== location.pathname && location.pathname === '/') {
        console.log(`🔄 Redirecting to appropriate page: ${redirectInfo.reason}`)
        navigate(redirectInfo.path)
        return
      }
    }
  }, [user, loading, navigate, location.pathname, requireAuth, allowedTiers])

  const checkAccountStatus = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('writer_profiles')
        .select('account_status, pause_end_date')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      if (data) {
        // Handle different account statuses
        if (data.account_status === 'closed') {
          toast.error('Your account has been closed. Please contact support.')
          navigate('/')
          return
        }
        
        if (data.account_status === 'suspended') {
          toast.error('Your account has been suspended. Please contact support.')
          navigate('/')
          return
        }
        
        if (data.account_status === 'paused') {
          const pauseEndDate = data.pause_end_date ? new Date(data.pause_end_date) : null
          const isExpired = pauseEndDate && pauseEndDate <= new Date()
          
          if (!isExpired) {
            toast.error('Your account is currently paused. Please wait until the pause period ends.')
            navigate('/')
            return
          }
        }
      }
    } catch (error) {
      console.error('Error checking account status:', error)
    }
  }

  // Show loading spinner while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If authentication is required but user is not logged in, show loading
  if (requireAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute 