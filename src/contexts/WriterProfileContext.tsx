import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { WriterProfile, ProfileAnalytics } from '../types/WriterProfile';
import { 
  getWriterProfile, 
  saveWriterProfile, 
  updateWriterProfile, 
  analyzeWriterProfile 
} from '../services/profileTrainer';
import toast from 'react-hot-toast';

interface WriterProfileContextType {
  profile: WriterProfile | null;
  analytics: ProfileAnalytics | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (updateData: Partial<WriterProfile>) => Promise<void>;
  saveProfile: (profile: WriterProfile) => Promise<void>;
  clearProfile: () => void;
}

const WriterProfileContext = createContext<WriterProfileContextType | undefined>(undefined);

interface WriterProfileProviderProps {
  children: React.ReactNode;
}

export const WriterProfileProvider: React.FC<WriterProfileProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<WriterProfile | null>(null);
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load profile when user changes
  useEffect(() => {
    if (user?.id) {
      loadProfile();
      loadAnalytics();
    } else {
      clearProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const userProfile = await getWriterProfile(user.id);
      setProfile(userProfile);
    } catch (err: any) {
      setError(err.message || 'Failed to load writer profile');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    if (!user?.id) return;

    try {
      const userAnalytics = await analyzeWriterProfile(user.id);
      setAnalytics(userAnalytics);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      // Don't set error for analytics as it's not critical
    }
  };

  const refreshProfile = async () => {
    await loadProfile();
    await loadAnalytics();
  };

  const updateProfile = async (updateData: Partial<WriterProfile>) => {
    if (!user?.id) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateWriterProfile(user.id, updateData);
      
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
  };

  const saveProfile = async (newProfile: WriterProfile) => {
    if (!user?.id) {
      toast.error('You must be logged in to save your profile');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await saveWriterProfile(user.id, newProfile);
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
  };

  const clearProfile = () => {
    setProfile(null);
    setAnalytics(null);
    setError(null);
  };

  const value: WriterProfileContextType = {
    profile,
    analytics,
    loading,
    error,
    refreshProfile,
    updateProfile,
    saveProfile,
    clearProfile
  };

  return (
    <WriterProfileContext.Provider value={value}>
      {children}
    </WriterProfileContext.Provider>
  );
};

export const useWriterProfileContext = (): WriterProfileContextType => {
  const context = useContext(WriterProfileContext);
  if (context === undefined) {
    throw new Error('useWriterProfileContext must be used within a WriterProfileProvider');
  }
  return context;
};

// Hook for accessing profile data with optional userId parameter
export const useWriterProfileData = () => {
  const context = useWriterProfileContext();
  
  // If a specific userId is provided and it's different from current user,
  // we would need to implement a different loading strategy
  // For now, we'll use the cached profile from context
  return context;
}; 