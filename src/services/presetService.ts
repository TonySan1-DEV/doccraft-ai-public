// MCP Context Block
/*
{
  file: "presetService.ts",
  role: "backend-developer",
  allowedActions: ["presets", "preferences", "sync"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "writer_presets"
}
*/

import { AgentPrefs } from '../types/agentPreferences';
import { WriterPreset, writerPresets, validatePresetPreferences, mergePresetWithCurrent } from '../constants/writerPresets';
import { preferenceVersionService } from './preferenceVersionService';

// Custom preset interface
export interface CustomPreset extends WriterPreset {
  id: string;
  userId: string;
  createdAt: string;
  isCustom: true;
}

// Preset application result
export interface PresetApplicationResult {
  success: boolean;
  appliedPreferences: AgentPrefs;
  versionCreated?: string;
  error?: string;
}

// Preset service class
export class PresetService {
  private static instance: PresetService;
  private customPresets: Map<string, CustomPreset> = new Map();

  private constructor() {
    this.loadCustomPresets();
  }

  static getInstance(): PresetService {
    if (!PresetService.instance) {
      PresetService.instance = new PresetService();
    }
    return PresetService.instance;
  }

  /**
   * Apply a preset to current preferences
   */
  async applyPreset(
    presetName: string,
    currentPreferences: AgentPrefs,
    options: {
      createVersion?: boolean;
      versionLabel?: string;
      mergeMode?: 'replace' | 'merge';
    } = {}
  ): Promise<PresetApplicationResult> {
    try {
      const preset = writerPresets[presetName];
      if (!preset) {
        return {
          success: false,
          appliedPreferences: currentPreferences,
          error: `Preset "${presetName}" not found`
        };
      }

      // Validate preset preferences
      if (!validatePresetPreferences(preset.preferences)) {
        return {
          success: false,
          appliedPreferences: currentPreferences,
          error: `Invalid preset preferences for "${presetName}"`
        };
      }

      // Apply preset based on merge mode
      const appliedPreferences = options.mergeMode === 'merge' 
        ? mergePresetWithCurrent(preset.preferences, currentPreferences)
        : { ...currentPreferences, ...preset.preferences };

      // Create version if requested
      let versionCreated: string | undefined;
      if (options.createVersion) {
        const version = await preferenceVersionService.createVersion(appliedPreferences, {
          label: options.versionLabel || `Applied preset: ${presetName}`,
          reason: `Applied preset "${presetName}"`,
          metadata: {
            presetName,
            presetCategory: preset.category,
            mergeMode: options.mergeMode || 'replace'
          }
        });
        versionCreated = version?.id;
      }

      return {
        success: true,
        appliedPreferences,
        versionCreated
      };
    } catch (error) {
      console.error('Error applying preset:', error);
      return {
        success: false,
        appliedPreferences: currentPreferences,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all available presets (built-in + custom)
   */
  getAllPresets(): (WriterPreset | CustomPreset)[] {
    const builtInPresets = Object.values(writerPresets);
    const customPresets = Array.from(this.customPresets.values());
    return [...builtInPresets, ...customPresets];
  }

  /**
   * Get presets by category
   */
  getPresetsByCategory(category: string): (WriterPreset | CustomPreset)[] {
    return this.getAllPresets().filter(preset => preset.category === category);
  }

  /**
   * Search presets by name, description, or tags
   */
  searchPresets(query: string): (WriterPreset | CustomPreset)[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAllPresets().filter(preset => 
      preset.name.toLowerCase().includes(lowercaseQuery) ||
      preset.description.toLowerCase().includes(lowercaseQuery) ||
      preset.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Get preset by name (built-in or custom)
   */
  getPresetByName(name: string): WriterPreset | CustomPreset | undefined {
    return writerPresets[name] || this.customPresets.get(name);
  }

  /**
   * Create a custom preset
   */
  async createCustomPreset(
    preset: Omit<WriterPreset, 'isCustom'>,
    userId: string
  ): Promise<CustomPreset | null> {
    try {
      // Validate preset preferences
      if (!validatePresetPreferences(preset.preferences)) {
        throw new Error('Invalid preset preferences');
      }

      // Check if preset name already exists
      if (writerPresets[preset.name] || this.customPresets.has(preset.name)) {
        throw new Error(`Preset "${preset.name}" already exists`);
      }

      const customPreset: CustomPreset = {
        ...preset,
        id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        createdAt: new Date().toISOString(),
        isCustom: true
      };

      this.customPresets.set(preset.name, customPreset);
      this.saveCustomPresets();

      return customPreset;
    } catch (error) {
      console.error('Error creating custom preset:', error);
      return null;
    }
  }

  /**
   * Update a custom preset
   */
  async updateCustomPreset(
    presetName: string,
    updates: Partial<WriterPreset>,
    userId: string
  ): Promise<CustomPreset | null> {
    try {
      const existingPreset = this.customPresets.get(presetName);
      if (!existingPreset) {
        throw new Error(`Custom preset "${presetName}" not found`);
      }

      if (existingPreset.userId !== userId) {
        throw new Error('You can only update your own custom presets');
      }

      const updatedPreset: CustomPreset = {
        ...existingPreset,
        ...updates,
        id: existingPreset.id,
        userId: existingPreset.userId,
        createdAt: existingPreset.createdAt,
        isCustom: true
      };

      // Validate updated preferences
      if (!validatePresetPreferences(updatedPreset.preferences)) {
        throw new Error('Invalid preset preferences');
      }

      this.customPresets.set(presetName, updatedPreset);
      this.saveCustomPresets();

      return updatedPreset;
    } catch (error) {
      console.error('Error updating custom preset:', error);
      return null;
    }
  }

  /**
   * Delete a custom preset
   */
  async deleteCustomPreset(presetName: string, userId: string): Promise<boolean> {
    try {
      const preset = this.customPresets.get(presetName);
      if (!preset) {
        throw new Error(`Custom preset "${presetName}" not found`);
      }

      if (preset.userId !== userId) {
        throw new Error('You can only delete your own custom presets');
      }

      this.customPresets.delete(presetName);
      this.saveCustomPresets();

      return true;
    } catch (error) {
      console.error('Error deleting custom preset:', error);
      return false;
    }
  }

  /**
   * Get preset recommendations based on current preferences
   */
  getPresetRecommendations(currentPreferences: AgentPrefs): (WriterPreset | CustomPreset)[] {
    const recommendations: Array<{ preset: WriterPreset | CustomPreset; score: number }> = [];

    this.getAllPresets().forEach(preset => {
      let score = 0;

      // Score based on tone similarity
      if (preset.preferences.tone === currentPreferences.tone) {
        score += 3;
      }

      // Score based on copilot preference
      if (preset.preferences.copilotEnabled === currentPreferences.copilotEnabled) {
        score += 2;
      }

      // Score based on memory preference
      if (preset.preferences.memoryEnabled === currentPreferences.memoryEnabled) {
        score += 2;
      }

      // Score based on command view preference
      if (preset.preferences.defaultCommandView === currentPreferences.defaultCommandView) {
        score += 1;
      }

      // Bonus for custom presets
      if ('isCustom' in preset && preset.isCustom) {
        score += 1;
      }

      recommendations.push({ preset, score });
    });

    // Sort by score and return top 5
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(r => r.preset);
  }

  /**
   * Get recently used presets
   */
  getRecentlyUsedPresets(): string[] {
    const recent = localStorage.getItem('recentlyUsedPresets');
    return recent ? JSON.parse(recent) : [];
  }

  /**
   * Add preset to recently used
   */
  addToRecentlyUsed(presetName: string): void {
    const recent = this.getRecentlyUsedPresets();
    const updated = [presetName, ...recent.filter(name => name !== presetName)].slice(0, 10);
    localStorage.setItem('recentlyUsedPresets', JSON.stringify(updated));
  }

  /**
   * Get preset usage statistics
   */
  getPresetUsageStats(): Record<string, number> {
    const stats = localStorage.getItem('presetUsageStats');
    return stats ? JSON.parse(stats) : {};
  }

  /**
   * Increment preset usage count
   */
  incrementPresetUsage(presetName: string): void {
    const stats = this.getPresetUsageStats();
    stats[presetName] = (stats[presetName] || 0) + 1;
    localStorage.setItem('presetUsageStats', JSON.stringify(stats));
  }

  /**
   * Export custom presets
   */
  exportCustomPresets(): string {
    const customPresetsArray = Array.from(this.customPresets.values());
    return JSON.stringify(customPresetsArray, null, 2);
  }

  /**
   * Import custom presets
   */
  async importCustomPresets(jsonData: string, userId: string): Promise<boolean> {
    try {
      const presets = JSON.parse(jsonData);
      
      for (const preset of presets) {
        if (preset.isCustom) {
          await this.createCustomPreset({
            name: preset.name,
            description: preset.description,
            icon: preset.icon,
            category: preset.category,
            preferences: preset.preferences,
            tags: preset.tags
          }, userId);
        }
      }

      return true;
    } catch (error) {
      console.error('Error importing custom presets:', error);
      return false;
    }
  }

  /**
   * Load custom presets from localStorage
   */
  private loadCustomPresets(): void {
    try {
      const stored = localStorage.getItem('customPresets');
      if (stored) {
        const customPresetsArray = JSON.parse(stored);
        this.customPresets.clear();
        customPresetsArray.forEach((preset: CustomPreset) => {
          this.customPresets.set(preset.name, preset);
        });
      }
    } catch (error) {
      console.error('Error loading custom presets:', error);
    }
  }

  /**
   * Save custom presets to localStorage
   */
  private saveCustomPresets(): void {
    try {
      const customPresetsArray = Array.from(this.customPresets.values());
      localStorage.setItem('customPresets', JSON.stringify(customPresetsArray));
    } catch (error) {
      console.error('Error saving custom presets:', error);
    }
  }
}

// Export singleton instance
export const presetService = PresetService.getInstance(); 