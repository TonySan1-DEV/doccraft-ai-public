// MCP Context Block
/*
{
  file: "preferenceVersionService.ts",
  role: "backend-developer",
  allowedActions: ["version", "rollback", "history"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "preference_versions"
}
*/

import { supabase } from '../lib/supabase';
import { AgentPrefs } from '../types/agentPreferences';

// Types for preference version management
export interface PreferenceVersion {
  id: string;
  user_id: string;
  created_at: string;
  preferences: AgentPrefs;
  label?: string;
  version_number: number;
  is_current: boolean;
  metadata?: Record<string, any>;
}

export interface CreateVersionOptions {
  label?: string;
  metadata?: Record<string, any>;
  reason?: string;
}

export interface VersionHistoryOptions {
  limit?: number;
  includeCurrent?: boolean;
}

// Service class for preference version management
export class PreferenceVersionService {
  private static instance: PreferenceVersionService;


  private constructor() {}

  static getInstance(): PreferenceVersionService {
    if (!PreferenceVersionService.instance) {
      PreferenceVersionService.instance = new PreferenceVersionService();
    }
    return PreferenceVersionService.instance;
  }

  /**
   * Create a new preference version
   */
  async createVersion(
    preferences: AgentPrefs,
    options: CreateVersionOptions = {}
  ): Promise<PreferenceVersion | null> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate preferences
      this.validatePreferences(preferences);

      // Prepare metadata
      const metadata = {
        ...options.metadata,
        reason: options.reason,
        created_via: 'manual_update',
        timestamp: new Date().toISOString()
      };

      // Call the database function to create version
      const { data, error } = await supabase.rpc('create_preference_version', {
        user_uuid: user.id,
        preference_data: preferences,
        version_label: options.label,
        version_metadata: metadata
      });

      if (error) {
        console.error('Failed to create preference version:', error);
        throw error;
      }

      // Fetch the created version
      return await this.getVersionById(data);
    } catch (error) {
      console.error('Error creating preference version:', error);
      return null;
    }
  }

  /**
   * Get current preference version for user
   */
  async getCurrentVersion(): Promise<PreferenceVersion | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_current_preference_version', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Failed to get current preference version:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const version = data[0];
      return {
        id: version.id,
        user_id: user.id,
        created_at: version.created_at,
        preferences: version.preferences,
        label: version.label,
        version_number: version.version_number,
        is_current: true,
        metadata: {}
      };
    } catch (error) {
      console.error('Error getting current preference version:', error);
      return null;
    }
  }

  /**
   * Get preference version by ID
   */
  async getVersionById(versionId: string): Promise<PreferenceVersion | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('preference_versions')
        .select('*')
        .eq('id', versionId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Failed to get preference version:', error);
        return null;
      }

      return this.mapDatabaseRowToVersion(data);
    } catch (error) {
      console.error('Error getting preference version by ID:', error);
      return null;
    }
  }

  /**
   * Get preference version history
   */
  async getVersionHistory(options: VersionHistoryOptions = {}): Promise<PreferenceVersion[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_preference_version_history', {
        user_uuid: user.id,
        limit_count: options.limit || 10
      });

      if (error) {
        console.error('Failed to get preference version history:', error);
        return [];
      }

      return data.map(this.mapDatabaseRowToVersion);
    } catch (error) {
      console.error('Error getting preference version history:', error);
      return [];
    }
  }

  /**
   * Restore a preference version
   */
  async restoreVersion(versionId: string): Promise<AgentPrefs | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Call the database function to restore version
      const { data, error } = await supabase.rpc('restore_preference_version', {
        user_uuid: user.id,
        version_id: versionId
      });

      if (error) {
        console.error('Failed to restore preference version:', error);
        throw error;
      }

      // Validate restored preferences
      this.validatePreferences(data);

      return data;
    } catch (error) {
      console.error('Error restoring preference version:', error);
      return null;
    }
  }

  /**
   * Delete a preference version
   */
  async deleteVersion(versionId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if this is the current version
      const version = await this.getVersionById(versionId);
      if (version?.is_current) {
        throw new Error('Cannot delete current version');
      }

      const { error } = await supabase
        .from('preference_versions')
        .delete()
        .eq('id', versionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to delete preference version:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting preference version:', error);
      return false;
    }
  }

  /**
   * Update version label
   */
  async updateVersionLabel(versionId: string, label: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('preference_versions')
        .update({ label })
        .eq('id', versionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to update version label:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating version label:', error);
      return false;
    }
  }

  /**
   * Validate preference data
   */
  private validatePreferences(preferences: AgentPrefs): void {
    if (!preferences || typeof preferences !== 'object') {
      throw new Error('Invalid preferences object');
    }

    const requiredFields = ['tone', 'language', 'copilotEnabled', 'memoryEnabled'];
    for (const field of requiredFields) {
      if (!(field in preferences)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate tone
    const validTones = ['friendly', 'formal', 'concise'];
    if (!validTones.includes(preferences.tone)) {
      throw new Error(`Invalid tone value: ${preferences.tone}`);
    }

    // Validate language
    const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'];
    if (!validLanguages.includes(preferences.language)) {
      throw new Error(`Invalid language value: ${preferences.language}`);
    }

    // Validate booleans
    if (typeof preferences.copilotEnabled !== 'boolean') {
      throw new Error('copilotEnabled must be a boolean');
    }

    if (typeof preferences.memoryEnabled !== 'boolean') {
      throw new Error('memoryEnabled must be a boolean');
    }
  }

  /**
   * Map database row to PreferenceVersion object
   */
  private mapDatabaseRowToVersion(row: any): PreferenceVersion {
    return {
      id: row.id,
      user_id: row.user_id,
      created_at: row.created_at,
      preferences: row.preferences,
      label: row.label,
      version_number: row.version_number,
      is_current: row.is_current,
      metadata: row.metadata || {}
    };
  }

  /**
   * Get version statistics
   */
  async getVersionStats(): Promise<{
    totalVersions: number;
    currentVersion: number | null;
    oldestVersion: number | null;
    newestVersion: number | null;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('preference_versions')
        .select('version_number, is_current')
        .eq('user_id', user.id)
        .order('version_number', { ascending: true });

      if (error) {
        console.error('Failed to get version stats:', error);
        return {
          totalVersions: 0,
          currentVersion: null,
          oldestVersion: null,
          newestVersion: null
        };
      }

      const versions = data || [];
      const currentVersion = versions.find((v: any) => v.is_current)?.version_number || null;
      const oldestVersion = versions.length > 0 ? versions[0].version_number : null;
      const newestVersion = versions.length > 0 ? versions[versions.length - 1].version_number : null;

      return {
        totalVersions: versions.length,
        currentVersion,
        oldestVersion,
        newestVersion
      };
    } catch (error) {
      console.error('Error getting version stats:', error);
      return {
        totalVersions: 0,
        currentVersion: null,
        oldestVersion: null,
        newestVersion: null
      };
    }
  }
}

// Export singleton instance
export const preferenceVersionService = PreferenceVersionService.getInstance(); 