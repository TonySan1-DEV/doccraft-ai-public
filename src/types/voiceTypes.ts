// Advanced TypeScript types for voice functionality with branded types and strict validation

// ============================================================================
// BRANDED TYPES - Type-safe identifiers that prevent mixing up different string types
// ============================================================================

/**
 * Branded type for voice IDs - prevents accidental mixing with other strings
 */
export type VoiceId = string & { readonly __brand: 'VoiceId' };

/**
 * Branded type for audio URLs - ensures only valid audio URLs are accepted
 */
export type AudioUrl = string & { readonly __brand: 'AudioUrl' };

/**
 * Branded type for language codes - ISO 639-1 format
 */
export type LanguageCode = string & { readonly __brand: 'LanguageCode' };

/**
 * Branded type for accent identifiers
 */
export type AccentId = string & { readonly __brand: 'AccentId' };

/**
 * Branded type for quality ratings (1-10 scale)
 */
export type QualityRating = number & { readonly __brand: 'QualityRating' };

// ============================================================================
// VALIDATION UTILITIES - Runtime type guards and validation functions
// ============================================================================

/**
 * Type guard to check if a string is a valid VoiceId
 */
export const isValidVoiceId = (value: unknown): value is VoiceId => {
  return typeof value === 'string' && /^[a-z][a-z0-9-]*$/.test(value);
};

/**
 * Type guard to check if a string is a valid AudioUrl
 */
export const isValidAudioUrl = (value: unknown): value is AudioUrl => {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Type guard to check if a string is a valid LanguageCode
 */
export const isValidLanguageCode = (value: unknown): value is LanguageCode => {
  return typeof value === 'string' && /^[a-z]{2}(-[A-Z]{2})?$/.test(value);
};

/**
 * Type guard to check if a number is a valid QualityRating
 */
export const isValidQualityRating = (
  value: unknown
): value is QualityRating => {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 10
  );
};

export const isValidAccentId = (value: unknown): value is AccentId => {
  return typeof value === 'string' && value.length > 0;
};

// ============================================================================
// CORE INTERFACES - Main type definitions with strict constraints
// ============================================================================

/**
 * Voice configuration with strict typing and validation
 */
export interface VoiceConfig {
  /** Unique identifier for the voice - must be valid VoiceId */
  readonly id: VoiceId;
  /** Display name and accent information */
  readonly label: string;
  /** URL to audio preview file - must be valid AudioUrl */
  readonly previewUrl: AudioUrl;
  /** Language code for the voice - ISO 639-1 format */
  readonly language: LanguageCode;
  /** Accent identifier */
  readonly accent: AccentId;
  /** Quality rating from 1-10 */
  readonly quality: QualityRating;
  /** Whether this voice is available for the current user tier */
  readonly isAvailable: boolean;
  /** Metadata for advanced features */
  readonly metadata: VoiceMetadata;
}

/**
 * Extended metadata for voice features
 */
export interface VoiceMetadata {
  /** Gender of the voice */
  readonly gender: 'male' | 'female' | 'neutral';
  /** Age range of the voice */
  readonly ageRange: 'child' | 'young' | 'adult' | 'elderly';
  /** Emotional range capabilities */
  readonly emotionalRange: readonly EmotionCapability[];
  /** Technical specifications */
  readonly technicalSpecs: TechnicalSpecs;
  /** Usage restrictions or requirements */
  readonly restrictions: VoiceRestrictions;
}

/**
 * Emotional capabilities of a voice
 */
export interface EmotionCapability {
  readonly emotion: 'happy' | 'sad' | 'angry' | 'calm' | 'excited' | 'serious';
  readonly intensity: QualityRating;
  readonly naturalness: QualityRating;
}

/**
 * Technical specifications for voice quality
 */
export interface TechnicalSpecs {
  readonly sampleRate: 22050 | 44100 | 48000;
  readonly bitDepth: 16 | 24 | 32;
  readonly channels: 1 | 2;
  readonly format: 'mp3' | 'wav' | 'ogg' | 'aac';
}

/**
 * Usage restrictions for voices
 */
export interface VoiceRestrictions {
  /** Minimum user tier required */
  readonly minTier: 'Free' | 'Pro' | 'Admin';
  /** Whether voice cloning is allowed */
  readonly allowCloning: boolean;
  /** Maximum usage per month */
  readonly monthlyUsageLimit?: number;
  /** Geographic restrictions */
  readonly geoRestrictions?: readonly string[];
}

// ============================================================================
// ENHANCED PROPS INTERFACES - Component props with advanced typing
// ============================================================================

/**
 * Enhanced props for VoiceSelector with strict validation
 */
export interface VoiceSelectorProps {
  /** Currently selected voice ID - must be valid VoiceId */
  readonly selectedVoice: VoiceId;
  /** Callback when voice selection changes - receives validated VoiceId */
  readonly onChange: (voiceId: VoiceId) => void;
  /** Optional CSS class name */
  readonly className?: string;
  /** Size variant for the voice cards */
  readonly size?: VoiceSelectorSize;
  /** Whether to show voice previews */
  readonly showPreviews?: boolean;
  /** Custom voice filter function */
  readonly filterVoices?: (voice: VoiceConfig) => boolean;
  /** Callback for voice preview events */
  readonly onPreviewEvent?: (event: VoicePreviewEvent) => void;
  /** Accessibility options */
  readonly accessibility?: VoiceSelectorAccessibility;
}

/**
 * Size variants for voice selector
 */
export const VOICE_SELECTOR_SIZES = ['sm', 'md', 'lg'] as const;
export type VoiceSelectorSize = (typeof VOICE_SELECTOR_SIZES)[number];

/**
 * Voice preview events for analytics and monitoring
 */
export interface VoicePreviewEvent {
  readonly type: 'play' | 'pause' | 'stop' | 'error';
  readonly voiceId: VoiceId;
  readonly timestamp: number;
  readonly duration?: number;
  readonly error?: string;
}

/**
 * Accessibility options for voice selector
 */
export interface VoiceSelectorAccessibility {
  /** ARIA label for the voice selector */
  readonly ariaLabel?: string;
  /** Whether to enable keyboard navigation */
  readonly enableKeyboardNav?: boolean;
  /** Screen reader announcements */
  readonly screenReaderAnnouncements?: boolean;
  /** High contrast mode support */
  readonly highContrast?: boolean;
}

// ============================================================================
// STATE MANAGEMENT TYPES - For complex state handling
// ============================================================================

/**
 * Voice selection state with validation
 */
export interface VoiceSelectionState {
  readonly selectedVoice: VoiceId;
  readonly availableVoices: readonly VoiceConfig[];
  readonly filteredVoices: readonly VoiceConfig[];
  readonly isLoading: boolean;
  readonly error: VoiceSelectionError | null;
  readonly lastUpdated: number;
}

/**
 * Voice selection errors with detailed information
 */
export interface VoiceSelectionError {
  readonly code: VoiceErrorCode;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp: number;
  readonly recoverable: boolean;
}

/**
 * Error codes for voice selection
 */
export const VOICE_ERROR_CODES = [
  'VOICE_NOT_FOUND',
  'VOICE_UNAVAILABLE',
  'INVALID_VOICE_ID',
  'NETWORK_ERROR',
  'PERMISSION_DENIED',
  'RATE_LIMIT_EXCEEDED',
  'UNKNOWN_ERROR',
] as const;
export type VoiceErrorCode = (typeof VOICE_ERROR_CODES)[number];

// ============================================================================
// FACTORY FUNCTIONS - Type-safe creation of voice objects
// ============================================================================

/**
 * Factory function to create a valid VoiceId
 * @throws {Error} if the provided value is not a valid voice ID
 */
export const createVoiceId = (value: string): VoiceId => {
  if (!isValidVoiceId(value)) {
    throw new Error(
      `Invalid voice ID: ${value}. Must be lowercase alphanumeric with optional hyphens.`
    );
  }
  return value as VoiceId;
};

/**
 * Factory function to create a valid AudioUrl
 * @throws {Error} if the provided value is not a valid audio URL
 */
export const createAudioUrl = (value: string): AudioUrl => {
  if (!isValidAudioUrl(value)) {
    throw new Error(
      `Invalid audio URL: ${value}. Must be a valid HTTP/HTTPS URL.`
    );
  }
  return value as AudioUrl;
};

/**
 * Factory function to create a valid LanguageCode
 * @throws {Error} if the provided value is not a valid language code
 */
export const createLanguageCode = (value: string): LanguageCode => {
  if (!isValidLanguageCode(value)) {
    throw new Error(
      `Invalid language code: ${value}. Must be ISO 639-1 format (e.g., 'en', 'en-US').`
    );
  }
  return value as LanguageCode;
};

/**
 * Factory function to create a valid QualityRating
 * @throws {Error} if the provided value is not a valid quality rating
 */
export const createQualityRating = (value: number): QualityRating => {
  if (!isValidQualityRating(value)) {
    throw new Error(
      `Invalid quality rating: ${value}. Must be an integer between 1 and 10.`
    );
  }
  return value as QualityRating;
};

export const createAccentId = (value: string): AccentId => {
  if (!isValidAccentId(value)) {
    throw new Error(`Invalid accent ID: ${value}`);
  }
  return value as AccentId;
};

/**
 * Factory function to create a complete VoiceConfig with validation
 */
export const createVoiceConfig = (
  config: Omit<VoiceConfig, 'id' | 'previewUrl' | 'language' | 'quality'> & {
    id: string;
    previewUrl: string;
    language: string;
    quality: number;
  }
): VoiceConfig => {
  return {
    ...config,
    id: createVoiceId(config.id),
    previewUrl: createAudioUrl(config.previewUrl),
    language: createLanguageCode(config.language),
    quality: createQualityRating(config.quality),
  };
};

// ============================================================================
// UTILITY TYPES - Helper types for common patterns
// ============================================================================

/**
 * Partial voice config for updates
 */
export type PartialVoiceConfig = Partial<Omit<VoiceConfig, 'id'>> & {
  readonly id: VoiceId;
};

/**
 * Voice selection result with success/error handling
 */
export type VoiceSelectionResult =
  | { readonly success: true; readonly voice: VoiceConfig }
  | { readonly success: false; readonly error: VoiceSelectionError };

/**
 * Async voice operation result
 */
export type AsyncVoiceResult<T> = Promise<
  VoiceSelectionResult & { readonly data?: T }
>;

/**
 * Voice filter function type
 */
export type VoiceFilter = (voice: VoiceConfig) => boolean;

/**
 * Voice comparison function type
 */
export type VoiceComparator = (a: VoiceConfig, b: VoiceConfig) => number;

// ============================================================================
// CONSTANTS - Predefined voice configurations and settings
// ============================================================================

/**
 * Default voice configurations with strict typing
 */
export const DEFAULT_VOICES: readonly VoiceConfig[] = [
  createVoiceConfig({
    id: 'emma',
    label: 'Emma (British)',
    previewUrl: 'https://example.com/previews/emma.mp3',
    language: 'en-GB',
    accent: createAccentId('british'),
    quality: createQualityRating(9),
    isAvailable: true,
    metadata: {
      gender: 'female',
      ageRange: 'adult',
      emotionalRange: [
        {
          emotion: 'happy',
          intensity: createQualityRating(8),
          naturalness: createQualityRating(9),
        },
        {
          emotion: 'calm',
          intensity: createQualityRating(7),
          naturalness: createQualityRating(9),
        },
        {
          emotion: 'serious',
          intensity: createQualityRating(8),
          naturalness: createQualityRating(8),
        },
      ],
      technicalSpecs: {
        sampleRate: 48000,
        bitDepth: 24,
        channels: 2,
        format: 'mp3',
      },
      restrictions: {
        minTier: 'Pro',
        allowCloning: false,
        monthlyUsageLimit: 1000,
      },
    },
  }),
  createVoiceConfig({
    id: 'liam',
    label: 'Liam (American)',
    previewUrl: 'https://example.com/previews/liam.mp3',
    language: 'en-US',
    accent: createAccentId('american'),
    quality: createQualityRating(8),
    isAvailable: true,
    metadata: {
      gender: 'male',
      ageRange: 'adult',
      emotionalRange: [
        {
          emotion: 'excited',
          intensity: createQualityRating(9),
          naturalness: createQualityRating(8),
        },
        {
          emotion: 'calm',
          intensity: createQualityRating(6),
          naturalness: createQualityRating(8),
        },
        {
          emotion: 'serious',
          intensity: createQualityRating(7),
          naturalness: createQualityRating(7),
        },
      ],
      technicalSpecs: {
        sampleRate: 48000,
        bitDepth: 24,
        channels: 2,
        format: 'mp3',
      },
      restrictions: {
        minTier: 'Pro',
        allowCloning: false,
        monthlyUsageLimit: 1000,
      },
    },
  }),
  createVoiceConfig({
    id: 'sofia',
    label: 'Sofia (Spanish)',
    previewUrl: 'https://example.com/previews/sofia.mp3',
    language: 'es',
    accent: createAccentId('castilian'),
    quality: createQualityRating(7),
    isAvailable: true,
    metadata: {
      gender: 'female',
      ageRange: 'young',
      emotionalRange: [
        {
          emotion: 'happy',
          intensity: createQualityRating(9),
          naturalness: createQualityRating(7),
        },
        {
          emotion: 'calm',
          intensity: createQualityRating(6),
          naturalness: createQualityRating(7),
        },
        {
          emotion: 'excited',
          intensity: createQualityRating(8),
          naturalness: createQualityRating(6),
        },
      ],
      technicalSpecs: {
        sampleRate: 44100,
        bitDepth: 16,
        channels: 1,
        format: 'mp3',
      },
      restrictions: {
        minTier: 'Pro',
        allowCloning: false,
        monthlyUsageLimit: 500,
      },
    },
  }),
] as const;

/**
 * Voice selector size class mappings
 */
export const VOICE_SELECTOR_SIZE_CLASSES: Record<VoiceSelectorSize, string> = {
  sm: 'grid-cols-1 md:grid-cols-2 gap-3',
  md: 'grid-cols-1 md:grid-cols-3 gap-4',
  lg: 'grid-cols-1 md:grid-cols-4 gap-6',
} as const;

// All types are already exported individually above
