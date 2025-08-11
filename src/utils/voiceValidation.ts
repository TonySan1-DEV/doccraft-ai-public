// Voice validation utilities with runtime type checking and comprehensive validation

import {
  VoiceId,
  AudioUrl,
  LanguageCode,
  QualityRating,
  VoiceConfig,
  VoiceSelectorProps,
  VoiceSelectionError,
  VoiceErrorCode,
} from '../types/voiceTypes';

// ============================================================================
// CORE VALIDATION FUNCTIONS - Runtime type checking and validation
// ============================================================================

/**
 * Comprehensive validation result with detailed error information
 */
export interface ValidationResult<T> {
  readonly isValid: boolean;
  readonly value?: T;
  readonly errors: readonly ValidationError[];
  readonly warnings: readonly ValidationWarning[];
}

/**
 * Detailed validation error information
 */
export interface ValidationError {
  readonly field: string;
  readonly code: string;
  readonly message: string;
  readonly severity: 'error' | 'critical';
  readonly suggestion?: string;
}

/**
 * Validation warning information
 */
export interface ValidationWarning {
  readonly field: string;
  readonly code: string;
  readonly message: string;
  readonly suggestion?: string;
}

/**
 * Validates a voice ID with detailed error reporting
 */
export const validateVoiceId = (value: unknown): ValidationResult<VoiceId> => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (typeof value !== 'string') {
    errors.push({
      field: 'voiceId',
      code: 'TYPE_ERROR',
      message: 'Voice ID must be a string',
      severity: 'error',
      suggestion: 'Provide a valid string value',
    });
    return { isValid: false, errors, warnings };
  }

  if (value.length === 0) {
    errors.push({
      field: 'voiceId',
      code: 'EMPTY_VALUE',
      message: 'Voice ID cannot be empty',
      severity: 'error',
      suggestion: 'Provide a non-empty string',
    });
    return { isValid: false, errors, warnings };
  }

  if (!/^[a-z][a-z0-9-]*$/.test(value)) {
    errors.push({
      field: 'voiceId',
      code: 'INVALID_FORMAT',
      message:
        'Voice ID must start with lowercase letter and contain only lowercase letters, numbers, and hyphens',
      severity: 'error',
      suggestion: 'Use format like "emma", "liam-voice", "voice-123"',
    });
    return { isValid: false, errors, warnings };
  }

  if (value.length > 50) {
    warnings.push({
      field: 'voiceId',
      code: 'LENGTH_WARNING',
      message: 'Voice ID is longer than recommended (50 characters)',
      suggestion: 'Consider using a shorter, more descriptive ID',
    });
  }

  return {
    isValid: true,
    value: value as VoiceId,
    errors,
    warnings,
  };
};

/**
 * Validates an audio URL with comprehensive checks
 */
export const validateAudioUrl = (
  value: unknown
): ValidationResult<AudioUrl> => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (typeof value !== 'string') {
    errors.push({
      field: 'audioUrl',
      code: 'TYPE_ERROR',
      message: 'Audio URL must be a string',
      severity: 'error',
      suggestion: 'Provide a valid string value',
    });
    return { isValid: false, errors, warnings };
  }

  if (value.length === 0) {
    errors.push({
      field: 'audioUrl',
      code: 'EMPTY_VALUE',
      message: 'Audio URL cannot be empty',
      severity: 'error',
      suggestion: 'Provide a non-empty URL',
    });
    return { isValid: false, errors, warnings };
  }

  try {
    const url = new URL(value);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      errors.push({
        field: 'audioUrl',
        code: 'INVALID_PROTOCOL',
        message: 'Audio URL must use HTTP or HTTPS protocol',
        severity: 'error',
        suggestion: 'Use http:// or https:// URLs only',
      });
    }

    if (!url.hostname) {
      errors.push({
        field: 'audioUrl',
        code: 'INVALID_HOSTNAME',
        message: 'Audio URL must have a valid hostname',
        severity: 'error',
        suggestion: 'Provide a complete URL with hostname',
      });
    }

    // Check for common audio file extensions
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.flac'];
    const hasAudioExtension = audioExtensions.some(ext =>
      url.pathname.toLowerCase().endsWith(ext)
    );

    if (!hasAudioExtension) {
      warnings.push({
        field: 'audioUrl',
        code: 'NO_AUDIO_EXTENSION',
        message: 'Audio URL does not have a common audio file extension',
        suggestion:
          'Consider using .mp3, .wav, .ogg, .aac, .m4a, or .flac extensions',
      });
    }
  } catch (urlError) {
    errors.push({
      field: 'audioUrl',
      code: 'INVALID_URL_FORMAT',
      message: 'Audio URL is not a valid URL format',
      severity: 'error',
      suggestion: 'Provide a properly formatted URL',
    });
  }

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  return {
    isValid: true,
    value: value as AudioUrl,
    errors,
    warnings,
  };
};

/**
 * Validates a language code with ISO 639-1 compliance
 */
export const validateLanguageCode = (
  value: unknown
): ValidationResult<LanguageCode> => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (typeof value !== 'string') {
    errors.push({
      field: 'languageCode',
      code: 'TYPE_ERROR',
      message: 'Language code must be a string',
      severity: 'error',
      suggestion: 'Provide a valid string value',
    });
    return { isValid: false, errors, warnings };
  }

  if (value.length === 0) {
    errors.push({
      field: 'languageCode',
      code: 'EMPTY_VALUE',
      message: 'Language code cannot be empty',
      severity: 'error',
      suggestion: 'Provide a non-empty language code',
    });
    return { isValid: false, errors, warnings };
  }

  if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(value)) {
    errors.push({
      field: 'languageCode',
      code: 'INVALID_FORMAT',
      message:
        'Language code must be in ISO 639-1 format (e.g., "en", "en-US")',
      severity: 'error',
      suggestion: 'Use format like "en", "es", "fr", "en-US", "es-ES"',
    });
    return { isValid: false, errors, warnings };
  }

  // Common language codes for validation
  const commonLanguages = [
    'en',
    'es',
    'fr',
    'de',
    'it',
    'pt',
    'ru',
    'ja',
    'ko',
    'zh',
  ];
  const language = value.split('-')[0];

  if (!commonLanguages.includes(language)) {
    warnings.push({
      field: 'languageCode',
      code: 'UNCOMMON_LANGUAGE',
      message: `Language code "${language}" is not in the list of commonly supported languages`,
      suggestion: 'Verify this language is supported by your TTS system',
    });
  }

  return {
    isValid: true,
    value: value as LanguageCode,
    errors,
    warnings,
  };
};

/**
 * Validates a quality rating with range and type checking
 */
export const validateQualityRating = (
  value: unknown
): ValidationResult<QualityRating> => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (typeof value !== 'number') {
    errors.push({
      field: 'qualityRating',
      code: 'TYPE_ERROR',
      message: 'Quality rating must be a number',
      severity: 'error',
      suggestion: 'Provide a valid numeric value',
    });
    return { isValid: false, errors, warnings };
  }

  if (!Number.isInteger(value)) {
    errors.push({
      field: 'qualityRating',
      code: 'DECIMAL_VALUE',
      message: 'Quality rating must be an integer',
      severity: 'error',
      suggestion: 'Provide a whole number without decimals',
    });
    return { isValid: false, errors, warnings };
  }

  if (value < 1 || value > 10) {
    errors.push({
      field: 'qualityRating',
      code: 'OUT_OF_RANGE',
      message: 'Quality rating must be between 1 and 10',
      severity: 'error',
      suggestion: 'Provide a value between 1 (lowest) and 10 (highest)',
    });
    return { isValid: false, errors, warnings };
  }

  if (value < 5) {
    warnings.push({
      field: 'qualityRating',
      code: 'LOW_QUALITY',
      message: 'Quality rating is below recommended threshold (5)',
      suggestion:
        'Consider using a higher quality voice for better user experience',
    });
  }

  if (value > 8) {
    warnings.push({
      field: 'qualityRating',
      code: 'HIGH_QUALITY',
      message: 'Quality rating is very high (9-10)',
      suggestion: 'Verify this quality level is supported by your TTS system',
    });
  }

  return {
    isValid: true,
    value: value as QualityRating,
    errors,
    warnings,
  };
};

// ============================================================================
// COMPOSITE VALIDATION FUNCTIONS - Validating complex objects
// ============================================================================

/**
 * Validates a complete VoiceConfig object
 */
export const validateVoiceConfig = (
  config: unknown
): ValidationResult<VoiceConfig> => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (typeof config !== 'object' || config === null) {
    errors.push({
      field: 'voiceConfig',
      code: 'TYPE_ERROR',
      message: 'Voice config must be an object',
      severity: 'error',
      suggestion: 'Provide a valid configuration object',
    });
    return { isValid: false, errors, warnings };
  }

  const configObj = config as Record<string, unknown>;

  // Validate required fields
  const requiredFields = [
    'id',
    'label',
    'previewUrl',
    'language',
    'accent',
    'quality',
    'isAvailable',
    'metadata',
  ];
  for (const field of requiredFields) {
    if (!(field in configObj)) {
      errors.push({
        field,
        code: 'MISSING_FIELD',
        message: `Required field "${field}" is missing`,
        severity: 'error',
        suggestion: `Add the "${field}" property to the configuration`,
      });
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  // Validate individual fields
  const idValidation = validateVoiceId(configObj.id);
  const urlValidation = validateAudioUrl(configObj.previewUrl);
  const languageValidation = validateLanguageCode(configObj.language);
  const qualityValidation = validateQualityRating(configObj.quality);

  errors.push(
    ...idValidation.errors,
    ...urlValidation.errors,
    ...languageValidation.errors,
    ...qualityValidation.errors
  );
  warnings.push(
    ...idValidation.warnings,
    ...urlValidation.warnings,
    ...languageValidation.warnings,
    ...qualityValidation.warnings
  );

  // Validate label
  if (
    typeof configObj.label !== 'string' ||
    configObj.label.trim().length === 0
  ) {
    errors.push({
      field: 'label',
      code: 'INVALID_LABEL',
      message: 'Label must be a non-empty string',
      severity: 'error',
      suggestion: 'Provide a descriptive label for the voice',
    });
  }

  // Validate accent
  if (
    typeof configObj.accent !== 'string' ||
    configObj.accent.trim().length === 0
  ) {
    errors.push({
      field: 'accent',
      code: 'INVALID_ACCENT',
      message: 'Accent must be a non-empty string',
      severity: 'error',
      suggestion: 'Provide a valid accent identifier',
    });
  }

  // Validate isAvailable
  if (typeof configObj.isAvailable !== 'boolean') {
    errors.push({
      field: 'isAvailable',
      code: 'INVALID_AVAILABILITY',
      message: 'isAvailable must be a boolean value',
      severity: 'error',
      suggestion: 'Set to true or false',
    });
  }

  // Validate metadata
  if (typeof configObj.metadata !== 'object' || configObj.metadata === null) {
    errors.push({
      field: 'metadata',
      code: 'INVALID_METADATA',
      message: 'Metadata must be an object',
      severity: 'error',
      suggestion: 'Provide a valid metadata object',
    });
  }

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  return {
    isValid: true,
    value: config as VoiceConfig,
    errors,
    warnings,
  };
};

/**
 * Validates VoiceSelectorProps with comprehensive checking
 */
export const validateVoiceSelectorProps = (
  props: unknown
): ValidationResult<VoiceSelectorProps> => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (typeof props !== 'object' || props === null) {
    errors.push({
      field: 'props',
      code: 'TYPE_ERROR',
      message: 'Props must be an object',
      severity: 'error',
      suggestion: 'Provide a valid props object',
    });
    return { isValid: false, errors, warnings };
  }

  const propsObj = props as Record<string, unknown>;

  // Validate required fields
  if (!('selectedVoice' in propsObj)) {
    errors.push({
      field: 'selectedVoice',
      code: 'MISSING_FIELD',
      message: 'Required field "selectedVoice" is missing',
      severity: 'error',
      suggestion: 'Add the selectedVoice property',
    });
  }

  if (!('onChange' in propsObj)) {
    errors.push({
      field: 'onChange',
      code: 'MISSING_FIELD',
      message: 'Required field "onChange" is missing',
      severity: 'error',
      suggestion: 'Add the onChange callback function',
    });
  }

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  // Validate selectedVoice
  const voiceIdValidation = validateVoiceId(propsObj.selectedVoice);
  errors.push(...voiceIdValidation.errors);
  warnings.push(...voiceIdValidation.warnings);

  // Validate onChange
  if (typeof propsObj.onChange !== 'function') {
    errors.push({
      field: 'onChange',
      code: 'INVALID_CALLBACK',
      message: 'onChange must be a function',
      severity: 'error',
      suggestion: 'Provide a valid callback function',
    });
  }

  // Validate optional fields
  if ('className' in propsObj && typeof propsObj.className !== 'string') {
    warnings.push({
      field: 'className',
      code: 'INVALID_CLASSNAME',
      message: 'className should be a string',
      suggestion: 'Provide a valid CSS class name string',
    });
  }

  if ('size' in propsObj) {
    const validSizes = ['sm', 'md', 'lg'];
    if (!validSizes.includes(propsObj.size as string)) {
      warnings.push({
        field: 'size',
        code: 'INVALID_SIZE',
        message: `Size should be one of: ${validSizes.join(', ')}`,
        suggestion: 'Use a valid size value',
      });
    }
  }

  if (
    'showPreviews' in propsObj &&
    typeof propsObj.showPreviews !== 'boolean'
  ) {
    warnings.push({
      field: 'showPreviews',
      code: 'INVALID_SHOW_PREVIEWS',
      message: 'showPreviews should be a boolean',
      suggestion: 'Set to true or false',
    });
  }

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  return {
    isValid: true,
    value: props as VoiceSelectorProps,
    errors,
    warnings,
  };
};

// ============================================================================
// ERROR HANDLING AND CREATION - Standardized error creation
// ============================================================================

/**
 * Creates a standardized VoiceSelectionError
 */
export const createVoiceSelectionError = (
  code: VoiceErrorCode,
  message: string,
  details?: Record<string, unknown>,
  recoverable: boolean = true
): VoiceSelectionError => {
  return {
    code,
    message,
    details,
    timestamp: Date.now(),
    recoverable,
  };
};

/**
 * Creates a validation error from validation results
 */
export const createValidationError = (
  validationResult: ValidationResult<unknown>
): VoiceSelectionError => {
  const errorMessages = validationResult.errors
    .map(e => `${e.field}: ${e.message}`)
    .join('; ');

  return createVoiceSelectionError(
    'INVALID_VOICE_ID',
    `Validation failed: ${errorMessages}`,
    { validationErrors: validationResult.errors },
    false
  );
};

// ============================================================================
// UTILITY FUNCTIONS - Helper functions for common validation patterns
// ============================================================================

/**
 * Combines multiple validation results
 */
export const combineValidationResults = <T>(
  results: readonly ValidationResult<T>[]
): ValidationResult<T[]> => {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];
  const validValues: T[] = [];

  for (const result of results) {
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
    if (result.isValid && result.value !== undefined) {
      validValues.push(result.value);
    }
  }

  return {
    isValid: allErrors.length === 0,
    value: validValues,
    errors: allErrors,
    warnings: allWarnings,
  };
};

/**
 * Filters validation results by severity
 */
export const filterValidationBySeverity = (
  result: ValidationResult<unknown>,
  severity: 'error' | 'critical' | 'warning'
): ValidationResult<unknown> => {
  if (severity === 'warning') {
    return {
      isValid: result.isValid,
      value: result.value,
      errors: [],
      warnings: result.warnings,
    };
  }

  const filteredErrors = result.errors.filter(e => e.severity === severity);

  return {
    isValid: filteredErrors.length === 0,
    value: result.value,
    errors: filteredErrors,
    warnings: result.warnings,
  };
};

/**
 * Formats validation errors for display
 */
export const formatValidationErrors = (
  result: ValidationResult<unknown>
): string => {
  if (result.isValid) {
    return 'Validation passed';
  }

  const errorMessages = result.errors.map(e => `${e.field}: ${e.message}`);
  const warningMessages = result.warnings.map(
    w => `${w.field}: ${w.message} (warning)`
  );

  const messages = [...errorMessages, ...warningMessages];
  return messages.join('\n');
};

// All functions and types are already exported individually above
