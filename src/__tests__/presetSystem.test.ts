// MCP Context Block
/*
{
  file: "presetSystem.test.ts",
  role: "test-developer",
  allowedActions: ["test", "validate"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "writer_presets"
}
*/

import {
  writerPresets,
  validatePresetPreferences,
  mergePresetWithCurrent,
  getPresetRecommendations,
} from '../constants/writerPresets';
import { presetService } from '../services/presetService';
import { AgentPrefs } from '../types/agentPreferences';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Preset System', () => {
  const mockPreferences: AgentPrefs = {
    tone: 'friendly' as const,
    language: 'en' as const,
    copilotEnabled: true,
    memoryEnabled: true,
    defaultCommandView: 'list' as const,
    lockedFields: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Preset Definitions', () => {
    it('should have valid preset definitions', () => {
      expect(writerPresets).toBeDefined();
      expect(Object.keys(writerPresets).length).toBeGreaterThan(0);
    });

    it('should have required preset properties', () => {
      Object.values(writerPresets).forEach(preset => {
        expect(preset).toHaveProperty('name');
        expect(preset).toHaveProperty('description');
        expect(preset).toHaveProperty('category');
        expect(preset).toHaveProperty('preferences');
        expect(preset).toHaveProperty('tags');
        expect(preset).toHaveProperty('icon');
      });
    });

    it('should have valid categories', () => {
      const validCategories = [
        'writing',
        'editing',
        'publishing',
        'specialized',
      ];
      Object.values(writerPresets).forEach(preset => {
        expect(validCategories).toContain(preset.category);
      });
    });

    it('should have popular presets marked', () => {
      const popularPresets = Object.values(writerPresets).filter(
        preset => preset.isPopular
      );
      expect(popularPresets.length).toBeGreaterThan(0);
    });
  });

  describe('Preset Validation', () => {
    it('should validate valid preset preferences', () => {
      const validPreferences = {
        tone: 'friendly' as const,
        language: 'en' as const,
        copilotEnabled: true,
        memoryEnabled: false,
        defaultCommandView: 'list' as const,
      };

      expect(validatePresetPreferences(validPreferences as any)).toBe(true);
    });

    it('should reject invalid tone values', () => {
      const invalidPreferences = {
        ...mockPreferences,
        tone: 'invalid-tone' as any,
      };

      expect(validatePresetPreferences(invalidPreferences as any)).toBe(false);
    });

    it('should reject invalid language values', () => {
      const invalidPreferences = {
        ...mockPreferences,
        language: 'invalid-language' as any,
      };

      expect(validatePresetPreferences(invalidPreferences as any)).toBe(false);
    });

    it('should reject invalid command view values', () => {
      const invalidPreferences = {
        ...mockPreferences,
        defaultCommandView: 'invalid-view' as any,
      };

      expect(validatePresetPreferences(invalidPreferences as any)).toBe(false);
    });

    it('should reject non-boolean values for toggles', () => {
      const invalidPreferences = {
        ...mockPreferences,
        copilotEnabled: 'not-a-boolean' as any,
      };

      expect(validatePresetPreferences(invalidPreferences as any)).toBe(false);
    });
  });

  describe('Preset Merging', () => {
    it('should merge preset preferences with current preferences', () => {
      const presetPreferences = {
        tone: 'formal' as const,
        copilotEnabled: false,
      };

      const result = mergePresetWithCurrent(
        presetPreferences as any,
        mockPreferences
      );

      expect(result.tone).toBe('formal');
      expect(result.copilotEnabled).toBe(false);
      expect(result.memoryEnabled).toBe(true); // Should remain unchanged
      expect(result.language).toBe('en'); // Should remain unchanged
    });

    it('should preserve current preferences when preset is empty', () => {
      const emptyPreset = {};

      const result = mergePresetWithCurrent(emptyPreset, mockPreferences);

      expect(result).toEqual(mockPreferences);
    });
  });

  describe('Preset Recommendations', () => {
    it('should return recommendations based on current preferences', () => {
      const recommendations = getPresetRecommendations(mockPreferences);

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeLessThanOrEqual(3);
    });

    it('should prioritize presets with matching tone', () => {
      const formalPreferences = { ...mockPreferences, tone: 'formal' as const };
      const recommendations = getPresetRecommendations(
        formalPreferences as any
      );

      // Should prioritize presets with formal tone
      const formalPresets = recommendations.filter(
        preset => preset.preferences.tone === 'formal'
      );

      expect(formalPresets.length).toBeGreaterThan(0);
    });

    it('should prioritize presets with matching copilot setting', () => {
      const noCopilotPreferences = {
        ...mockPreferences,
        copilotEnabled: false,
      };
      const recommendations = getPresetRecommendations(noCopilotPreferences);

      // Should prioritize presets with copilot disabled
      const noCopilotPresets = recommendations.filter(
        preset => preset.preferences.copilotEnabled === false
      );

      expect(noCopilotPresets.length).toBeGreaterThan(0);
    });
  });

  describe('Preset Service', () => {
    beforeEach(() => {
      // Reset service instance
      (presetService as any).instance = undefined;
    });

    it('should be a singleton', () => {
      // The presetService is already a singleton instance
      expect(presetService).toBeDefined();
      expect(typeof presetService).toBe('object');
    });

    it('should get all presets', () => {
      const allPresets = presetService.getAllPresets();
      expect(Array.isArray(allPresets)).toBe(true);
      expect(allPresets.length).toBeGreaterThan(0);
    });

    it('should get presets by category', () => {
      const writingPresets = presetService.getPresetsByCategory('writing');
      expect(Array.isArray(writingPresets)).toBe(true);
      writingPresets.forEach(preset => {
        expect(preset.category).toBe('writing');
      });
    });

    it('should search presets by query', () => {
      const searchResults = presetService.searchPresets('fast');
      expect(Array.isArray(searchResults)).toBe(true);

      searchResults.forEach(preset => {
        const matches =
          preset.name.toLowerCase().includes('fast') ||
          preset.description.toLowerCase().includes('fast') ||
          preset.tags.some(tag => tag.toLowerCase().includes('fast'));
        expect(matches).toBe(true);
      });
    });

    it('should get preset by name', () => {
      const fastDraftPreset = presetService.getPresetByName('Fast Draft');
      expect(fastDraftPreset).toBeDefined();
      expect(fastDraftPreset?.name).toBe('Fast Draft');
    });

    it('should return undefined for non-existent preset', () => {
      const nonExistentPreset = presetService.getPresetByName(
        'Non Existent Preset'
      );
      expect(nonExistentPreset).toBeUndefined();
    });

    it('should manage recently used presets', () => {
      const initialRecent = presetService.getRecentlyUsedPresets();
      expect(Array.isArray(initialRecent)).toBe(true);

      presetService.addToRecentlyUsed('Test Preset');
      const updatedRecent = presetService.getRecentlyUsedPresets();
      expect(updatedRecent).toContain('Test Preset');
    });

    it('should manage preset usage statistics', () => {
      const initialStats = presetService.getPresetUsageStats();
      expect(typeof initialStats).toBe('object');

      presetService.incrementPresetUsage('Test Preset');
      const updatedStats = presetService.getPresetUsageStats();
      expect(updatedStats['Test Preset']).toBe(1);
    });
  });

  describe('Custom Presets', () => {
    beforeEach(() => {
      // Reset service instance
      (presetService as any).instance = undefined;
    });

    it('should create custom preset', async () => {
      const customPreset = await presetService.createCustomPreset(
        {
          name: 'Test Custom Preset',
          description: 'A test custom preset',
          category: 'writing',
          preferences: {
            tone: 'friendly' as const,
            copilotEnabled: true,
            memoryEnabled: false,
          },
          tags: ['test', 'custom'],
        },
        'test-user-id'
      );

      expect(customPreset).toBeDefined();
      expect(customPreset?.name).toBe('Test Custom Preset');
      expect(customPreset?.isCustom).toBe(true);
    });

    it('should reject custom preset with invalid preferences', async () => {
      const customPreset = await presetService.createCustomPreset(
        {
          name: 'Invalid Preset',
          description: 'An invalid preset',
          category: 'writing',
          preferences: {
            tone: 'invalid-tone' as any,
            copilotEnabled: true,
          },
          tags: ['invalid'],
        },
        'test-user-id'
      );

      expect(customPreset).toBeNull();
    });

    it('should reject custom preset with duplicate name', async () => {
      // Create first preset
      await presetService.createCustomPreset(
        {
          name: 'Duplicate Preset',
          description: 'First preset',
          category: 'writing',
          preferences: { tone: 'friendly' as const },
          tags: ['first'],
        },
        'test-user-id'
      );

      // Try to create second preset with same name
      const duplicatePreset = await presetService.createCustomPreset(
        {
          name: 'Duplicate Preset',
          description: 'Second preset',
          category: 'writing',
          preferences: { tone: 'formal' as const },
          tags: ['second'],
        },
        'test-user-id'
      );

      expect(duplicatePreset).toBeNull();
    });

    it('should update custom preset', async () => {
      // Create preset first
      const originalPreset = await presetService.createCustomPreset(
        {
          name: 'Update Test Preset',
          description: 'Original description',
          category: 'writing',
          preferences: { tone: 'friendly' as const },
          tags: ['original'],
        },
        'test-user-id'
      );

      expect(originalPreset).toBeDefined();

      // Update the preset
      const updatedPreset = await presetService.updateCustomPreset(
        'Update Test Preset',
        {
          description: 'Updated description',
          preferences: { tone: 'formal' as const },
        },
        'test-user-id'
      );

      expect(updatedPreset).toBeDefined();
      expect(updatedPreset?.description).toBe('Updated description');
      expect(updatedPreset?.preferences.tone).toBe('formal');
    });

    it('should delete custom preset', async () => {
      // Create preset first
      await presetService.createCustomPreset(
        {
          name: 'Delete Test Preset',
          description: 'To be deleted',
          category: 'writing',
          preferences: { tone: 'friendly' as const },
          tags: ['delete'],
        },
        'test-user-id'
      );

      // Delete the preset
      const deleteResult = await presetService.deleteCustomPreset(
        'Delete Test Preset',
        'test-user-id'
      );
      expect(deleteResult).toBe(true);

      // Verify it's gone
      const deletedPreset = presetService.getPresetByName('Delete Test Preset');
      expect(deletedPreset).toBeUndefined();
    });
  });

  describe('Preset Application', () => {
    it('should apply preset successfully', async () => {
      const result = await presetService.applyPreset(
        'Fast Draft',
        mockPreferences,
        {
          createVersion: false,
          mergeMode: 'replace',
        }
      );

      expect(result.success).toBe(true);
      expect(result.appliedPreferences).toBeDefined();
      expect(result.appliedPreferences.tone).toBe('friendly');
      expect(result.appliedPreferences.copilotEnabled).toBe(true);
    });

    it('should handle non-existent preset', async () => {
      const result = await presetService.applyPreset(
        'Non Existent Preset',
        mockPreferences
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.appliedPreferences).toEqual(mockPreferences);
    });

    it('should handle invalid preset preferences', async () => {
      // Mock a preset with invalid preferences
      const originalPresets = { ...writerPresets };
      const mockWriterPresets = { ...originalPresets };
      mockWriterPresets['Invalid Preset'] = {
        name: 'Invalid Preset',
        description: 'Invalid preset',
        category: 'writing',
        preferences: { tone: 'invalid-tone' as any },
        tags: ['invalid'],
      };

      // Mock the preset service to use our modified presets
      const originalGetPresetByName = presetService.getPresetByName;
      presetService.getPresetByName = jest.fn((name: string) => {
        if (name === 'Invalid Preset') {
          return mockWriterPresets['Invalid Preset'];
        }
        return originalGetPresetByName.call(presetService, name);
      });

      const result = await presetService.applyPreset(
        'Invalid Preset',
        mockPreferences
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      // Restore original method
      presetService.getPresetByName = originalGetPresetByName;
    });

    it('should merge preset with current preferences', async () => {
      const result = await presetService.applyPreset(
        'Fast Draft',
        mockPreferences,
        {
          mergeMode: 'merge',
        }
      );

      expect(result.success).toBe(true);
      // Should preserve some current preferences while applying preset ones
      expect(result.appliedPreferences.language).toBe('en');
    });
  });

  describe('Preset Export/Import', () => {
    it('should export custom presets', () => {
      const exportData = presetService.exportCustomPresets();
      expect(typeof exportData).toBe('string');

      const parsed = JSON.parse(exportData);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('should import custom presets', async () => {
      const importData = JSON.stringify([
        {
          name: 'Imported Preset',
          description: 'Imported from test',
          category: 'writing',
          preferences: { tone: 'friendly' as const },
          tags: ['imported'],
          id: 'import-1',
          userId: 'test-user',
          createdAt: new Date().toISOString(),
          isCustom: true,
        },
      ]);

      const result = await presetService.importCustomPresets(
        importData,
        'test-user-id'
      );
      expect(result).toBe(true);

      const importedPreset = presetService.getPresetByName('Imported Preset');
      expect(importedPreset).toBeDefined();
    });
  });
});
