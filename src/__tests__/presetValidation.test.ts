// MCP Context Block
/*
{
  file: "presetValidation.test.ts",
  role: "test",
  allowedActions: ["test", "validate"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "testing"
}
*/

import {
  validatePresetPreferences,
  validatePresetName,
  validatePresetDescription,
  validatePresetTags,
  validatePresetObject,
  checkPresetMatch,
  getPresetDifference,
  sanitizePresetInput,
  VALID_PRESET_KEYS,
  VALID_PRESET_VALUES
} from '../utils/presetValidation';
import { AgentPrefs } from '../types/agentPreferences';

describe('Preset Validation', () => {
  const mockPreferences: AgentPrefs = {
    tone: 'friendly' as const,
    language: 'en' as const,
    copilotEnabled: true,
    memoryEnabled: true,
    defaultCommandView: 'list' as const,
    lockedFields: []
  };

  describe('validatePresetPreferences', () => {
    it('should validate valid preset preferences', () => {
      const validPreferences = {
        tone: 'friendly' as const,
        language: 'en' as const,
        copilotEnabled: true,
        memoryEnabled: false,
        defaultCommandView: 'grid' as const
      };

      const result = validatePresetPreferences(validPreferences);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitizedPreferences).toEqual(validPreferences);
    });

    it('should reject invalid preset keys', () => {
      const invalidPreferences = {
        ...mockPreferences,
        invalidKey: 'value',
        anotherInvalidKey: 123
      };

      const result = validatePresetPreferences(invalidPreferences as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid preset key: invalidKey');
      expect(result.errors).toContain('Invalid preset key: anotherInvalidKey');
    });

    it('should reject invalid tone values', () => {
      const invalidPreferences = {
        ...mockPreferences,
        tone: 'invalid-tone' as any
      };

      const result = validatePresetPreferences(invalidPreferences as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid value for tone: invalid-tone');
    });

    it('should reject invalid language values', () => {
      const invalidPreferences = {
        ...mockPreferences,
        language: 'invalid-language' as any
      };

      const result = validatePresetPreferences(invalidPreferences as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid value for language: invalid-language');
    });

    it('should reject invalid command view values', () => {
      const invalidPreferences = {
        ...mockPreferences,
        defaultCommandView: 'invalid-view' as any
      };

      const result = validatePresetPreferences(invalidPreferences as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid value for defaultCommandView: invalid-view');
    });

    it('should reject non-boolean values for toggles', () => {
      const invalidPreferences = {
        ...mockPreferences,
        copilotEnabled: 'not-a-boolean' as any
      };

      const result = validatePresetPreferences(invalidPreferences as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid type for copilotEnabled: expected boolean, got string');
    });

    it('should reject non-string values for string fields', () => {
      const invalidPreferences = {
        ...mockPreferences,
        tone: 123 as any
      };

      const result = validatePresetPreferences(invalidPreferences as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid type for tone: expected string, got number');
    });

    it('should only include valid keys in sanitized preferences', () => {
      const mixedPreferences = {
        tone: 'friendly',
        invalidKey: 'value',
        copilotEnabled: true,
        anotherInvalidKey: 123
      };

      const result = validatePresetPreferences(mixedPreferences as any);

      expect(result.isValid).toBe(false);
      expect(result.sanitizedPreferences).toEqual({
        tone: 'friendly',
        copilotEnabled: true
      });
    });
  });

  describe('validatePresetName', () => {
    it('should validate valid preset names', () => {
      const validNames = ['My Preset', 'Fast Draft 1', 'Test-V2', 'A'];

      validNames.forEach(name => {
        const result = validatePresetName(name);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject empty names', () => {
      const result = validatePresetName('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Preset name cannot be empty');
    });

    it('should reject names that are too short', () => {
      const result = validatePresetName('A');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Preset name must be at least 2 characters long');
    });

    it('should reject names that are too long', () => {
      const longName = 'A'.repeat(51);
      const result = validatePresetName(longName);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Preset name must be 50 characters or less');
    });

    it('should reject reserved names', () => {
      const reservedNames = ['default', 'custom', 'preset', 'settings'];

      reservedNames.forEach(name => {
        const result = validatePresetName(name);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Preset name cannot be a reserved word');
      });
    });

    it('should sanitize invalid characters', () => {
      const invalidName = 'Invalid<>:"/\\|?*Name';
      const result = validatePresetName(invalidName);
      expect(result.sanitizedName).toBe('InvalidName');
    });

    it('should trim whitespace', () => {
      const result = validatePresetName('  My Preset  ');
      expect(result.sanitizedName).toBe('My Preset');
    });
  });

  describe('validatePresetDescription', () => {
    it('should validate valid descriptions', () => {
      const validDescriptions = [
        'A great preset for writing',
        'Optimized for rapid content creation',
        'Test description'
      ];

      validDescriptions.forEach(description => {
        const result = validatePresetDescription(description);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject descriptions that are too long', () => {
      const longDescription = 'A'.repeat(201);
      const result = validatePresetDescription(longDescription);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Description must be 200 characters or less');
    });

    it('should remove script tags', () => {
      const descriptionWithScript = 'My preset<script>alert("xss")</script>';
      const result = validatePresetDescription(descriptionWithScript);
      expect(result.sanitizedDescription).toBe('My preset');
    });

    it('should trim whitespace', () => {
      const result = validatePresetDescription('  My description  ');
      expect(result.sanitizedDescription).toBe('My description');
    });
  });

  describe('validatePresetTags', () => {
    it('should validate valid tags', () => {
      const validTags = ['writing', 'fast', 'draft', 'custom'];

      const result = validatePresetTags(validTags);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitizedTags).toEqual(validTags.map(tag => tag.toLowerCase()));
    });

    it('should reject non-array tags', () => {
      const result = validatePresetTags('not-an-array' as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Tags must be an array');
    });

    it('should reject too many tags', () => {
      const tooManyTags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
      const result = validatePresetTags(tooManyTags);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Maximum 10 tags allowed');
    });

    it('should reject non-string tags', () => {
      const invalidTags = ['valid', 123, 'also-valid'];
      const result = validatePresetTags(invalidTags as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('All tags must be strings');
    });

    it('should sanitize tag characters', () => {
      const dirtyTags = ['My Tag!', 'Another@Tag', 'Tag#3'];
      const result = validatePresetTags(dirtyTags);
      expect(result.sanitizedTags).toEqual(['my-tag', 'another-tag', 'tag-3']);
    });

    it('should remove duplicate tags', () => {
      const duplicateTags = ['tag1', 'tag2', 'tag1', 'tag2'];
      const result = validatePresetTags(duplicateTags);
      expect(result.sanitizedTags).toEqual(['tag1', 'tag2']);
    });

    it('should reject tags that are too short', () => {
      const shortTags = ['a', 'b', 'valid'];
      const result = validatePresetTags(shortTags);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Tags must be at least 2 characters long');
    });
  });

  describe('validatePresetObject', () => {
    it('should validate a complete preset object', () => {
      const validPreset = {
        name: 'My Preset',
        description: 'A great preset for writing',
        category: 'writing',
        preferences: {
          tone: 'friendly' as const,
          copilotEnabled: true
        },
        tags: ['writing', 'fast']
      };

      const result = validatePresetObject(validPreset);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject preset with invalid name', () => {
      const invalidPreset = {
        name: '',
        description: 'A great preset for writing',
        category: 'writing',
        preferences: { tone: 'friendly' as const },
        tags: ['writing']
      };

      const result = validatePresetObject(invalidPreset as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Preset name cannot be empty');
    });

    it('should reject preset with invalid category', () => {
      const invalidPreset = {
        name: 'My Preset',
        description: 'A great preset for writing',
        category: 'invalid-category',
        preferences: { tone: 'friendly' as const },
        tags: ['writing']
      };

      const result = validatePresetObject(invalidPreset as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid category: invalid-category');
    });

    it('should reject preset with invalid preferences', () => {
      const invalidPreset = {
        name: 'My Preset',
        description: 'A great preset for writing',
        category: 'writing',
        preferences: { tone: 'invalid-tone' as any },
        tags: ['writing']
      };

      const result = validatePresetObject(invalidPreset as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid value for tone: invalid-tone');
    });
  });

  describe('checkPresetMatch', () => {
    it('should return true for exact matches', () => {
      const presetPreferences = {
        tone: 'friendly' as const,
        language: 'en' as const,
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list' as const
      };

      const result = checkPresetMatch(mockPreferences, presetPreferences);
      expect(result).toBe(true);
    });

    it('should return false for partial matches', () => {
      const presetPreferences = {
        tone: 'friendly' as const,
        copilotEnabled: true
        // Missing other preferences
      };

      const result = checkPresetMatch(mockPreferences, presetPreferences);
      expect(result).toBe(true); // Should match because only defined preferences are checked
    });

    it('should return false for different values', () => {
      const presetPreferences = {
        tone: 'formal' as const, // Different from mockPreferences
        language: 'en' as const,
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list' as const
      };

      const result = checkPresetMatch(mockPreferences, presetPreferences);
      expect(result).toBe(false);
    });
  });

  describe('getPresetDifference', () => {
    it('should return differences between preferences', () => {
      const presetPreferences = {
        tone: 'formal' as const,
        copilotEnabled: false
      };

      const result = getPresetDifference(mockPreferences, presetPreferences);
      expect(result).toEqual({
        tone: 'formal',
        copilotEnabled: false
      });
    });

    it('should return empty object for identical preferences', () => {
      const presetPreferences = {
        tone: 'friendly' as const,
        language: 'en' as const,
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list' as const
      };

      const result = getPresetDifference(mockPreferences, presetPreferences);
      expect(result).toEqual({});
    });

    it('should only include defined preset preferences', () => {
      const presetPreferences = {
        tone: 'formal' as const
        // Only tone is defined
      };

      const result = getPresetDifference(mockPreferences, presetPreferences);
      expect(result).toEqual({
        tone: 'formal'
      });
    });
  });

  describe('sanitizePresetInput', () => {
    it('should sanitize complete preset input', () => {
      const input = {
        name: '  My<>Preset  ',
        description: '  My description<script>alert("xss")</script>  ',
        category: 'writing',
        tags: ['My Tag!', 'Another@Tag']
      };

      const result = sanitizePresetInput(input);
      expect(result).toEqual({
        name: 'MyPreset',
        description: 'My description',
        category: 'writing',
        tags: ['my-tag', 'another-tag']
      });
    });

    it('should use defaults for missing fields', () => {
      const input = {
        name: 'My Preset'
        // Missing description, category, tags
      };

      const result = sanitizePresetInput(input);
      expect(result).toEqual({
        name: 'My Preset',
        description: '',
        category: 'writing',
        tags: []
      });
    });

    it('should handle invalid category', () => {
      const input = {
        name: 'My Preset',
        category: 'invalid-category'
      };

      const result = sanitizePresetInput(input);
      expect(result.category).toBe('writing');
    });
  });

  describe('Constants', () => {
    it('should have valid preset keys', () => {
      expect(VALID_PRESET_KEYS).toContain('tone');
      expect(VALID_PRESET_KEYS).toContain('language');
      expect(VALID_PRESET_KEYS).toContain('copilotEnabled');
      expect(VALID_PRESET_KEYS).toContain('memoryEnabled');
      expect(VALID_PRESET_KEYS).toContain('defaultCommandView');
    });

    it('should have valid values for each key', () => {
      expect(VALID_PRESET_VALUES.tone).toContain('friendly');
      expect(VALID_PRESET_VALUES.tone).toContain('formal');
      expect(VALID_PRESET_VALUES.tone).toContain('concise');

      expect(VALID_PRESET_VALUES.copilotEnabled).toContain(true);
      expect(VALID_PRESET_VALUES.copilotEnabled).toContain(false);

      expect(VALID_PRESET_VALUES.defaultCommandView).toContain('list');
      expect(VALID_PRESET_VALUES.defaultCommandView).toContain('grid');
    });
  });
}); 