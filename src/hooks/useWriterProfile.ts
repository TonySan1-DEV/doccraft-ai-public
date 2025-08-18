import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  saveWriterProfile,
  getWriterProfile,
  updateWriterProfile,
  analyzeWriterProfile,
  generatePersonalizedSuggestions,
  learnFromUserAction,
} from '../services/profileTrainer';
import {
  WriterProfile,
  ProfileUpdateData,
  ProfileAnalytics,
  PersonalizedSuggestion,
} from '../types/WriterProfile';
import toast from 'react-hot-toast';

interface UseWriterProfileReturn {
  profile: WriterProfile | null;
  analytics: ProfileAnalytics | null;
  loading: boolean;
  error: string | null;
  saveProfile: (profile: WriterProfile) => Promise<void>;
  updateProfile: (updateData: ProfileUpdateData) => Promise<void>;
  getSuggestions: (
    context: string,
    currentContent?: string
  ) => Promise<PersonalizedSuggestion[]>;
  recordAction: (
    action: string,
    context: string,
    outcome: 'success' | 'failure'
  ) => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  setProfile: (profile: WriterProfile | null) => void;
}

export function useWriterProfile(userId?: string): UseWriterProfileReturn {
  const { user } = useAuth();
  const [profile, setProfile] = useState<WriterProfile | null>(null);
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use provided userId or fall back to authenticated user
  const targetUserId = userId || user?.id;

  // Load profile on mount or user change
  useEffect(() => {
    if (targetUserId) {
      loadProfile();
      loadAnalytics();
    } else {
      setProfile(null);
      setAnalytics(null);
    }
  }, [targetUserId]);

  const loadProfile = useCallback(async () => {
    if (!targetUserId) return;

    setLoading(true);
    setError(null);

    try {
      const userProfile = await getWriterProfile(targetUserId);
      setProfile(userProfile);
    } catch (err: any) {
      setError(err.message || 'Failed to load writer profile');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  const loadAnalytics = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const userAnalytics = await analyzeWriterProfile(targetUserId);
      setAnalytics(userAnalytics);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      // Don't set error for analytics as it's not critical
    }
  }, [targetUserId]);

  const saveProfile = useCallback(
    async (newProfile: WriterProfile) => {
      if (!targetUserId) {
        toast.error('You must be logged in to save your profile');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await saveWriterProfile(targetUserId, newProfile);
        setProfile(newProfile);
        toast.success('Writer profile saved successfully!');

        // Refresh analytics after profile update
        await loadAnalytics();
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to save writer profile';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error saving profile:', err);
      } finally {
        setLoading(false);
      }
    },
    [targetUserId, loadAnalytics]
  );

  const updateProfile = useCallback(
    async (updateData: ProfileUpdateData) => {
      if (!targetUserId) {
        toast.error('You must be logged in to update your profile');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await updateWriterProfile(targetUserId, updateData);

        // Update local state
        if (profile) {
          const updatedProfile = { ...profile, ...updateData };
          setProfile(updatedProfile);
        }

        toast.success('Profile updated successfully!');

        // Refresh analytics after profile update
        await loadAnalytics();
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to update writer profile';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error updating profile:', err);
      } finally {
        setLoading(false);
      }
    },
    [targetUserId, profile, loadAnalytics]
  );

  const getSuggestions = useCallback(
    async (
      context: string,
      currentContent?: string
    ): Promise<PersonalizedSuggestion[]> => {
      if (!targetUserId) {
        return [];
      }

      try {
        const suggestions = await generatePersonalizedSuggestions(
          targetUserId,
          context,
          currentContent
        );
        return suggestions;
      } catch (err: any) {
        console.error('Error getting suggestions:', err);
        return [];
      }
    },
    [targetUserId]
  );

  const recordAction = useCallback(
    async (action: string, context: string, outcome: 'success' | 'failure') => {
      if (!targetUserId) return;

      try {
        await learnFromUserAction(targetUserId, action, context, outcome);

        // Optionally show feedback for successful learning
        if (outcome === 'success') {
        }
      } catch (err: any) {
        console.error('Error recording action:', err);
        // Don't show error to user as this is background learning
      }
    },
    [targetUserId]
  );

  const refreshAnalytics = useCallback(async () => {
    await loadAnalytics();
  }, [loadAnalytics]);

  return {
    profile,
    analytics,
    loading,
    error,
    saveProfile,
    updateProfile,
    getSuggestions,
    recordAction,
    refreshAnalytics,
    setProfile,
  };
}

// Hook for profile initialization (first-time setup)
export function useProfileSetup() {
  const { user } = useAuth();
  const [isSetup, setIsSetup] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkProfileSetup();
    }
  }, [user?.id]);

  const checkProfileSetup = async () => {
    if (!user?.id) return;

    try {
      const { getWriterProfile } = await import('../services/profileTrainer');
      const profile = await getWriterProfile(user.id);
      setIsSetup(!!profile);
    } catch (err) {
      console.error('Error checking profile setup:', err);
      setIsSetup(false);
    }
  };

  const initializeProfile = async (initialProfile: WriterProfile) => {
    if (!user?.id) return;

    setSetupLoading(true);
    try {
      const { saveWriterProfile } = await import('../services/profileTrainer');
      await saveWriterProfile(user.id, initialProfile);
      setIsSetup(true);
      toast.success('Writer profile initialized successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to initialize profile');
      console.error('Error initializing profile:', err);
    } finally {
      setSetupLoading(false);
    }
  };

  return {
    isSetup,
    setupLoading,
    initializeProfile,
    checkProfileSetup,
  };
}
