import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getDefaultLandingPage } from '../utils/userRedirect';
import { UserService } from '../lib/auth/userService';
import { logger } from '../lib/logger';

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
  logger.info('AuthProvider initializing');

  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to load user profile data including tier
  const loadUserProfile = async (supabaseUser: User): Promise<ExtendedUser> => {
    try {
      logger.info('Loading user profile', { userId: supabaseUser.id });

      // Check if UserService is available (Supabase connection)
      if (supabase.auth && typeof supabase.auth.getSession === 'function') {
        const profile = await UserService.getCurrentUser();

        if (profile) {
          logger.info('User profile loaded with tier', { tier: profile.tier });
          return {
            ...supabaseUser,
            tier: profile.tier,
          } as ExtendedUser;
        } else {
          logger.info('No profile found, using default tier');
          return {
            ...supabaseUser,
            tier: 'Free', // Default tier for new users
          } as ExtendedUser;
        }
      } else {
        // Demo mode - return mock user
        logger.info('Demo mode - using mock user profile');
        return {
          ...supabaseUser,
          tier: 'Pro', // Demo tier
        } as ExtendedUser;
      }
    } catch (error: unknown) {
      logger.error('Error loading user profile', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        ...supabaseUser,
        tier: 'Free', // Default tier on error
      } as ExtendedUser;
    }
  };

  useEffect(() => {
    logger.info('AuthProvider useEffect running');

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      logger.info('Auth timeout reached, setting loading to false');
      setLoading(false);
    }, 3000); // Reduced to 3 seconds for better UX

    // Check if Supabase is available
    if (supabase.auth && typeof supabase.auth.getSession === 'function') {
      // Get initial session
      supabase.auth
        .getSession()
        .then(async ({ data: { session } }: { data: { session: any } }) => {
          logger.info('Session loaded', { hasSession: !!session });

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
          logger.error('Error loading session', {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          setLoading(false);
          clearTimeout(timeout);
        });

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
        logger.info('Auth state changed', { hasSession: !!session });

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
      logger.info('Demo mode - no Supabase connection available');
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
        logger.info('Demo mode - simulating sign in');
        const mockUser = {
          id: 'demo-user-id',
          email: email,
          tier: 'Pro',
        } as ExtendedUser;
        setUser(mockUser);
      }
    } catch (error: unknown) {
      logger.error('Sign in error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
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
        logger.info('Demo mode - simulating sign up');
        const mockUser = {
          id: 'demo-user-id',
          email: email,
          tier: 'Pro',
        } as ExtendedUser;
        setUser(mockUser);
      }
    } catch (error: unknown) {
      logger.error('Sign up error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
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
      logger.error('Sign out error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
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

  logger.info('AuthProvider context value', { hasUser: !!user, loading });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
