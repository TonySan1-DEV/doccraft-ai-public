import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getDefaultLandingPage } from '../utils/userRedirect';
import { UserService } from '../lib/auth/userService';

// Extended user type with tier property
export interface ExtendedUser extends User {
  tier?: 'Free' | 'Pro' | 'Admin';
}

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  redirectToAppropriatePage: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('🔐 AuthProvider initializing...');

  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to load user profile data including tier
  const loadUserProfile = async (supabaseUser: User): Promise<ExtendedUser> => {
    try {
      console.log('🔐 Loading user profile for:', supabaseUser.id);

      // Check if UserService is available (Supabase connection)
      if (supabase.auth && typeof supabase.auth.getSession === 'function') {
        const profile = await UserService.getCurrentUser();

        if (profile) {
          console.log('🔐 User profile loaded with tier:', profile.tier);
          return {
            ...supabaseUser,
            tier: profile.tier,
          } as ExtendedUser;
        } else {
          console.log('🔐 No profile found, using default tier');
          return {
            ...supabaseUser,
            tier: 'Free', // Default tier for new users
          } as ExtendedUser;
        }
      } else {
        // Demo mode - return mock user
        console.log('🔐 Demo mode - using mock user profile');
        return {
          ...supabaseUser,
          tier: 'Pro', // Demo tier
        } as ExtendedUser;
      }
    } catch (error: unknown) {
      console.error('🔐 Error loading user profile:', error);
      return {
        ...supabaseUser,
        tier: 'Free', // Default tier on error
      } as ExtendedUser;
    }
  };

  useEffect(() => {
    console.log('🔐 AuthProvider useEffect running...');

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('🔐 Auth timeout reached, setting loading to false');
      setLoading(false);
    }, 3000); // Reduced to 3 seconds for better UX

    // Check if Supabase is available
    if (supabase.auth && typeof supabase.auth.getSession === 'function') {
      // Get initial session
      supabase.auth
        .getSession()
        .then(async ({ data: { session } }: { data: { session: any } }) => {
          console.log(
            '🔐 Session loaded:',
            session ? 'User logged in' : 'No session'
          );

          if (session?.user) {
            // Load user profile data including tier
            const extendedUser = await loadUserProfile(session.user);
            setUser(extendedUser);
          } else {
            setUser(null);
          }

          setLoading(false);
          clearTimeout(timeout);
        })
        .catch((error: unknown) => {
          console.error('🔐 Error loading session:', error);
          setLoading(false);
          clearTimeout(timeout);
        });

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
        console.log(
          '🔐 Auth state changed:',
          session ? 'User logged in' : 'User logged out'
        );

        if (session?.user) {
          // Load user profile data including tier
          const extendedUser = await loadUserProfile(session.user);
          setUser(extendedUser);
        } else {
          setUser(null);
        }

        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Demo mode - no Supabase connection
      console.log('🔐 Demo mode - no Supabase connection available');
      setLoading(false);
      clearTimeout(timeout);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      if (
        supabase.auth &&
        typeof supabase.auth.signInWithPassword === 'function'
      ) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // Demo mode - simulate successful sign in
        console.log('🔐 Demo mode - simulating sign in');
        const mockUser = {
          id: 'demo-user-id',
          email: email,
          tier: 'Pro',
        } as ExtendedUser;
        setUser(mockUser);
      }
    } catch (error: unknown) {
      console.error('🔐 Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      if (supabase.auth && typeof supabase.auth.signUp === 'function') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        // Demo mode - simulate successful sign up
        console.log('🔐 Demo mode - simulating sign up');
        const mockUser = {
          id: 'demo-user-id',
          email: email,
          tier: 'Pro',
        } as ExtendedUser;
        setUser(mockUser);
      }
    } catch (error: unknown) {
      console.error('🔐 Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (supabase.auth && typeof supabase.auth.signOut === 'function') {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      setUser(null);
    } catch (error: unknown) {
      console.error('🔐 Sign out error:', error);
      throw error;
    }
  };

  const redirectToAppropriatePage = () => {
    if (user) {
      const defaultPage = getDefaultLandingPage(user);
      window.location.href = defaultPage;
    } else {
      window.location.href = '/';
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    redirectToAppropriatePage,
  };

  console.log('🔐 AuthProvider context value:', { user: !!user, loading });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
