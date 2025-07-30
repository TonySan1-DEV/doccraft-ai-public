import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { SceneConfig } from '../types/SceneConfig';
import { CharacterPersona } from '../types/CharacterPersona';

interface UseSceneConfigReturn {
  config: SceneConfig | null;
  updateScene: (updates: Partial<SceneConfig>) => void;
  saveScene: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Utility: Get current user ID from Supabase auth
async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user?.id) return null;
  return data.user.id;
}

export function useSceneConfig(sceneId?: string): UseSceneConfigReturn {
  const [config, setConfig] = useState<SceneConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(!!sceneId);
  const [error, setError] = useState<string | null>(null);

  // Load scene config from Supabase
  const fetchScene = useCallback(async () => {
    if (!sceneId) return;
    setLoading(true);
    setError(null);
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');
      const { data, error: dbError } = await supabase
        .from('scenes')
        .select('*, participants:character_personas(*)')
        .eq('id', sceneId)
        .eq('user_id', userId)
        .single();
      if (dbError) throw dbError;
      // Map participants to CharacterPersona[]
      const scene: SceneConfig = {
        id: data.id,
        title: data.title,
        setting: data.setting,
        tone: data.tone,
        objective: data.objective,
        participants: (data.participants as CharacterPersona[]) || [],
      };
      setConfig(scene);
    } catch (err: any) {
      setError(err.message || 'Failed to load scene');
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, [sceneId]);

  useEffect(() => {
    if (sceneId) fetchScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId]);

  // Update scene config locally
  const updateScene = useCallback((updates: Partial<SceneConfig>) => {
    setConfig((prev) => (prev ? { ...prev, ...updates } : { ...updates } as SceneConfig));
  }, []);

  // Save scene config to Supabase
  const saveScene = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    setError(null);
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');
      // Ensure all participants have an id
      const participantIds = (config.participants as CharacterPersona[]).map((p) => (p.id ? p.id : ''));
      if (participantIds.some((id) => !id)) throw new Error('All participants must have an id');
      const sceneData = {
        title: config.title,
        setting: config.setting,
        tone: config.tone,
        objective: config.objective,
        user_id: userId,
        // Store participant IDs
        participant_ids: participantIds,
      };
      if (config.id) {
        // Update existing
        const { error: dbError } = await supabase
          .from('scenes')
          .update(sceneData)
          .eq('id', config.id)
          .eq('user_id', userId);
        if (dbError) throw dbError;
      } else {
        // Insert new
        const { data, error: dbError } = await supabase
          .from('scenes')
          .insert([sceneData])
          .select()
          .single();
        if (dbError) throw dbError;
        setConfig((prev) => prev ? { ...prev, id: data.id } : prev);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save scene');
    } finally {
      setLoading(false);
    }
  }, [config]);

  return {
    config,
    updateScene,
    saveScene,
    loading,
    error,
  };
} 