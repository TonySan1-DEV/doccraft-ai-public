import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { getDefaultLandingPage } from '../utils/userRedirect'

// Extended user type with tier property
export interface ExtendedUser extends User {
  tier?: 'Free' | 'Pro' | 'Admin'
}

interface AuthContextType {
  user: ExtendedUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  redirectToAppropriatePage: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('🔐 AuthProvider initializing...')
  
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("🔐 AuthProvider useEffect running...")
    
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log("🔐 Auth timeout reached, setting loading to false")
      setLoading(false)
    }, 5000) // 5 second timeout
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("🔐 Session loaded:", session ? "User logged in" : "No session")
      setUser(session?.user ?? null)
      setLoading(false)
      clearTimeout(timeout)
    }).catch((error) => {
      console.error("🔐 Error loading session:", error)
      setLoading(false)
      clearTimeout(timeout)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("🔐 Auth state changed:", session ? "User logged in" : "User logged out")
        setUser(session?.user ?? null)
        setLoading(false)
        clearTimeout(timeout)
        
        // Handle automatic redirections after auth state changes
        if (event === 'SIGNED_IN' && session?.user) {
          // Small delay to ensure state is updated
          setTimeout(() => {
            const defaultPath = getDefaultLandingPage(session.user as ExtendedUser)
            if (typeof window !== 'undefined' && window.location.pathname === '/') {
              window.location.href = defaultPath
            }
          }, 500)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const redirectToAppropriatePage = () => {
    const defaultPath = getDefaultLandingPage(user)
    if (typeof window !== 'undefined' && window.location.pathname !== defaultPath) {
      window.location.href = defaultPath
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    redirectToAppropriatePage,
  }

  console.log('🔐 AuthProvider rendering with loading:', loading, 'user:', user)

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading authentication...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}
