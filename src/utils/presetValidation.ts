// MCP Context Block
/*
{
  file: "presetValidation.ts",
  role: "backend-developer",
  allowedActions: ["validate", "security"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "preset_validation"
}
*/

import { AgentPrefs } from '../types/agentPreferences';

// Valid preset keys that can be applied
export const VALID_PRESET_KEYS: (keyof AgentPrefs)[] = [
  'tone',
  'language',
  'copilotEnabled',
  'memoryEnabled',
  'defaultCommandView',
];

// Valid values for each preset key
export const VALID_PRESET_VALUES: Record<
  keyof AgentPrefs,
  (string | boolean)[]
> = {
  tone: ['friendly', 'formal', 'concise'],
  language: ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh'],
  copilotEnabled: [true, false],
  memoryEnabled: [true, false],
  defaultCommandView: ['list', 'grid'],
  genre: [], // Not used in presets
  lockedFields: [], // Not used in presets
  memory: [true, false],
  copilot: [true, false],
};

/**
 * Validates preset preferences before applying them
 */
export function validatePresetPreferences(preferences: Partial<AgentPrefs>): {
  isValid: boolean;
  errors: string[];
  sanitizedPreferences: Partial<AgentPrefs>;
} {
  const errors: string[] = [];
  const sanitizedPreferences: Partial<AgentPrefs> = {};

  // Check each preference key
  for (const [key, value] of Object.entries(preferences)) {
    const presetKey = key as keyof AgentPrefs;

    // Check if key is allowed
    if (!VALID_PRESET_KEYS.includes(presetKey)) {
      errors.push(`Invalid preset key: ${key}`);
      continue;
    }

    // Check if value is valid for the key
    const validValues = VALID_PRESET_VALUES[presetKey];
    if (
      validValues.length > 0 &&
      !validValues.includes(value as string | boolean)
    ) {
      errors.push(`Invalid value for ${key}: ${value}`);
      continue;
    }

    // Check for type safety
    if (presetKey === 'copilotEnabled' || presetKey === 'memoryEnabled') {
      if (typeof value !== 'boolean') {
        errors.push(
          `Invalid type for ${key}: expected boolean, got ${typeof value}`
        );
        continue;
      }
    } else if (presetKey === 'defaultCommandView') {
      if (typeof value !== 'string') {
        errors.push(
          `Invalid type for ${key}: expected string, got ${typeof value}`
        );
        continue;
      }
    } else if (presetKey === 'tone' || presetKey === 'language') {
      if (typeof value !== 'string') {
        errors.push(
          `Invalid type for ${key}: expected string, got ${typeof value}`
        );
        continue;
      }
    }

    // Add to sanitized preferences if valid
    if (presetKey in sanitizedPreferences) {
      (sanitizedPreferences as any)[presetKey] = value;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedPreferences,
  };
}

/**
 * Sanitizes a preset name for safe storage
 */
export function sanitizePresetName(name: string): string {
  return name
    .trim()
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 50); // Limit length
}

/**
 * Validates a preset name
 */
export function validatePresetName(name: string): {
  isValid: boolean;
  errors: string[];
  sanitizedName: string;
} {
  const errors: string[] = [];
  const sanitizedName = sanitizePresetName(name);

  if (!sanitizedName) {
    errors.push('Preset name cannot be empty');
  }

  if (sanitizedName.length < 2) {
    errors.push('Preset name must be at least 2 characters long');
  }

  if (sanitizedName.length > 50) {
    errors.push('Preset name must be 50 characters or less');
  }

  // Check for reserved names
  const reservedNames = ['default', 'custom', 'preset', 'settings'];
  if (reservedNames.includes(sanitizedName.toLowerCase())) {
    errors.push('Preset name cannot be a reserved word');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedName,
  };
}

/**
 * Validates preset description
 */
export function validatePresetDescription(description: string): {
  isValid: boolean;
  errors: string[];
  sanitizedDescription: string;
} {
  const errors: string[] = [];
  const sanitizedDescription = description
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .substring(0, 200); // Limit length

  if (sanitizedDescription.length > 200) {
    errors.push('Description must be 200 characters or less');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedDescription,
  };
}

/**
 * Validates preset tags
 */
export function validatePresetTags(tags: string[]): {
  isValid: boolean;
  errors: string[];
  sanitizedTags: string[];
} {
  const errors: string[] = [];
  const sanitizedTags: string[] = [];

  if (!Array.isArray(tags)) {
    errors.push('Tags must be an array');
    return { isValid: false, errors, sanitizedTags };
  }

  if (tags.length > 10) {
    errors.push('Maximum 10 tags allowed');
  }

  for (const tag of tags) {
    if (typeof tag !== 'string') {
      errors.push('All tags must be strings');
      continue;
    }

    const sanitizedTag = tag
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Only allow letters, numbers, spaces, and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .substring(0, 20); // Limit length

    if (sanitizedTag.length < 2) {
      errors.push('Tags must be at least 2 characters long');
      continue;
    }

    if (sanitizedTag && !sanitizedTags.includes(sanitizedTag)) {
      sanitizedTags.push(sanitizedTag);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedTags,
  };
}

/**
 * Validates a complete preset object
 */
export function validatePresetObject(preset: {
  name: string;
  description: string;
  category: string;
  preferences: Partial<AgentPrefs>;
  tags: string[];
}): {
  isValid: boolean;
  errors: string[];
  sanitizedPreset: {
    name: string;
    description: string;
    category: string;
    preferences: Partial<AgentPrefs>;
    tags: string[];
  };
} {
  const errors: string[] = [];
  const sanitizedPreset: {
    name: string;
    description: string;
    category: string;
    preferences: Partial<AgentPrefs>;
    tags: string[];
  } = {
    name: '',
    description: '',
    category: '',
    preferences: {},
    tags: [],
  };

  // Validate name
  const nameValidation = validatePresetName(preset.name);
  if (!nameValidation.isValid) {
    errors.push(...nameValidation.errors);
  } else {
    sanitizedPreset.name = nameValidation.sanitizedName;
  }

  // Validate description
  const descriptionValidation = validatePresetDescription(preset.description);
  if (!descriptionValidation.isValid) {
    errors.push(...descriptionValidation.errors);
  } else {
    sanitizedPreset.description = descriptionValidation.sanitizedDescription;
  }

  // Validate category
  const validCategories = ['writing', 'editing', 'publishing', 'specialized'];
  if (!validCategories.includes(preset.category)) {
    errors.push(`Invalid category: ${preset.category}`);
  } else {
    sanitizedPreset.category = preset.category;
  }

  // Validate preferences
  const preferencesValidation = validatePresetPreferences(preset.preferences);
  if (!preferencesValidation.isValid) {
    errors.push(...preferencesValidation.errors);
  } else {
    sanitizedPreset.preferences = preferencesValidation.sanitizedPreferences;
  }

  // Validate tags
  const tagsValidation = validatePresetTags(preset.tags);
  if (!tagsValidation.isValid) {
    errors.push(...tagsValidation.errors);
  } else {
    sanitizedPreset.tags = tagsValidation.sanitizedTags;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedPreset,
  };
}

/**
 * Checks if current preferences match a preset exactly
 */
export function checkPresetMatch(
  currentPreferences: AgentPrefs,
  presetPreferences: Partial<AgentPrefs>
): boolean {
  for (const key of VALID_PRESET_KEYS) {
    if (
      presetPreferences[key] !== undefined &&
      currentPreferences[key] !== presetPreferences[key]
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Gets the difference between current preferences and a preset
 */
export function getPresetDifference(
  currentPreferences: AgentPrefs,
  presetPreferences: Partial<AgentPrefs>
): Partial<AgentPrefs> {
  const differences: Partial<AgentPrefs> = {};

  for (const key of VALID_PRESET_KEYS) {
    if (
      presetPreferences[key] !== undefined &&
      currentPreferences[key] !== presetPreferences[key]
    ) {
      (differences as any)[key] = presetPreferences[key];
    }
  }

  return differences;
}

/**
 * Sanitizes user input for preset creation
 */
export function sanitizePresetInput(input: {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
}): {
  name: string;
  description: string;
  category: string;
  tags: string[];
} {
  return {
    name: sanitizePresetName(input.name),
    description: input.description
      ? validatePresetDescription(input.description).sanitizedDescription
      : '',
    category:
      input.category &&
      ['writing', 'editing', 'publishing', 'specialized'].includes(
        input.category
      )
        ? input.category
        : 'writing',
    tags: input.tags ? validatePresetTags(input.tags).sanitizedTags : [],
  };
}
