import React, { useCallback, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { useUserTier } from '../hooks/useUserTier';
import { ProUpsell } from './ProUpsell';
import AudioPreviewPlayer from '../../modules/agent/components/AudioPreviewPlayer';
import {
  VoiceId,
  VoiceConfig,
  VoiceSelectorProps,
  VoiceSelectorAccessibility,
  DEFAULT_VOICES,
  VOICE_SELECTOR_SIZE_CLASSES,
} from '../types/voiceTypes';
import {
  validateVoiceSelectorProps,
  createVoiceSelectionError,
} from '../utils/voiceValidation';
import useVoiceManagement from '../hooks/useVoiceManagement';

/**
 * Enhanced VoiceSelector component with advanced TypeScript features and validation
 *
 * @remarks
 * - Uses branded types for type safety
 * - Comprehensive runtime validation
 * - Advanced voice management capabilities
 * - Enhanced accessibility features
 * - Performance optimizations with memoization
 */
export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onChange,
  className = '',
  size = 'md',
  showPreviews = true,
  filterVoices,
  onPreviewEvent,
  accessibility = {
    ariaLabel: 'Voice selector',
    role: 'listbox',
    ariaDescribedby: 'voice-selector-description',
    highContrast: false,
    enableKeyboardNav: true,
  } as VoiceSelectorAccessibility,
}) => {
  const { isProUser } = useUserTier();

  // ============================================================================
  // VALIDATION - Runtime type checking and validation
  // ============================================================================

  // Validate props at runtime in development
  if (process.env.NODE_ENV === 'development') {
    const validation = validateVoiceSelectorProps({
      selectedVoice,
      onChange,
      className,
      size,
      showPreviews,
      filterVoices,
      onPreviewEvent,
      accessibility,
    });

    if (!validation.isValid) {
      console.error(
        'VoiceSelector props validation failed:',
        validation.errors
      );

      // In development, we might want to show validation errors
      if (validation.errors.some((error) => error.severity === 'critical')) {
        throw new Error(
          `Critical validation error: ${validation.errors[0]?.message}`
        );
      }
    }

    if (validation.warnings.length > 0) {
      console.warn(
        'VoiceSelector props validation warnings:',
        validation.warnings
      );
    }
  }

  // ============================================================================
  // VOICE MANAGEMENT - Advanced voice state management
  // ============================================================================

  const voiceManagement = useVoiceManagement(DEFAULT_VOICES, selectedVoice);

  // ============================================================================
  // COMPUTED VALUES - Memoized derived state
  // ============================================================================

  const availableVoices = useMemo(() => {
    let voices = voiceManagement.availableVoices;

    // Apply custom filter if provided
    if (filterVoices) {
      voices = voices.filter(filterVoices);
    }

    return voices;
  }, [voiceManagement.availableVoices, filterVoices]);

  const sizeClasses = useMemo(() => {
    return VOICE_SELECTOR_SIZE_CLASSES[size];
  }, [size]);

  const selectedVoiceConfig = useMemo(() => {
    return voiceManagement.getVoiceById(selectedVoice);
  }, [selectedVoice, voiceManagement]);

  // ============================================================================
  // EVENT HANDLERS - Type-safe event handling
  // ============================================================================

  const handleVoiceSelect = useCallback(
    (voiceId: VoiceId) => {
      try {
        // Validate the voice ID
        if (!voiceManagement.isVoiceAvailable(voiceId)) {
          const error = createVoiceSelectionError(
            'VOICE_UNAVAILABLE',
            'Selected voice is not available',
            { voiceId }
          );

          console.error('Voice selection error:', error);
          return;
        }

        // Call the onChange callback with validated VoiceId
        onChange(voiceId);

        // Update internal state
        voiceManagement.selectVoice(voiceId);
      } catch (error) {
        console.error('Error selecting voice:', error);
      }
    },
    [onChange, voiceManagement]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, voiceId: VoiceId) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleVoiceSelect(voiceId);
      }
    },
    [handleVoiceSelect]
  );

  const handlePreviewEvent = useCallback(() => {
    // Log preview events for analytics
    console.debug('Voice preview event triggered');
  }, []);

  const handleFavoriteToggle = useCallback(
    (voiceId: VoiceId, e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation(); // Prevent voice selection
      voiceManagement.toggleFavorite(voiceId);
    },
    [voiceManagement]
  );

  // ============================================================================
  // ACCESSIBILITY - Enhanced accessibility features
  // ============================================================================

  const accessibilityProps = useMemo(() => {
    const baseProps: Record<string, string> = {
      'aria-label': accessibility.ariaLabel || 'Voice selection interface',
      role: 'grid',
      'aria-describedby': 'voice-selector-description',
    };

    if (accessibility.highContrast) {
      baseProps['data-high-contrast'] = 'true';
    }

    return baseProps;
  }, [accessibility]);

  // ============================================================================
  // RENDER HELPERS - Component rendering utilities
  // ============================================================================

  const renderVoiceCard = useCallback(
    (voice: VoiceConfig) => {
      const isSelected = selectedVoice === voice.id;
      const isFavorite = voiceManagement.isVoiceFavorite(voice.id);
      const quality = voiceManagement.getVoiceQuality(voice.id);

      return (
        <Card
          key={voice.id}
          className={`cursor-pointer transition-all duration-200 border-2 ${
            isSelected
              ? 'border-blue-500 shadow-lg bg-blue-50'
              : 'border-transparent hover:border-gray-300 hover:shadow-md'
          } ${accessibility.highContrast ? 'ring-2 ring-offset-2' : ''}`}
          onClick={() => handleVoiceSelect(voice.id)}
          role="gridcell"
          tabIndex={accessibility.enableKeyboardNav !== false ? 0 : -1}
          aria-pressed={isSelected}
          aria-label={`${voice.label}, Quality: ${quality}/10, ${isSelected ? 'Selected' : 'Not selected'}`}
          onKeyDown={
            accessibility.enableKeyboardNav !== false
              ? (e: React.KeyboardEvent<HTMLDivElement>) => handleKeyDown(e, voice.id)
              : undefined
          }
        >
          <CardContent className="p-4 flex flex-col items-center justify-center relative">
            {/* Voice Label */}
            <span className="font-semibold mb-2 text-center">
              {voice.label}
            </span>

            {/* Quality Indicator */}
            {quality && (
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs text-gray-500">Quality:</span>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < quality ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Language and Accent */}
            <div className="text-xs text-gray-600 mb-2 text-center">
              <div>{voice.language}</div>
              <div>{voice.accent}</div>
            </div>

            {/* Audio Preview */}
            {showPreviews && (
              <AudioPreviewPlayer
                audioUrl={voice.previewUrl}
                voiceName={voice.label}
                onPlay={handlePreviewEvent}
              />
            )}

            {/* Selection Indicator */}
            {isSelected && (
              <span className="mt-2 text-sm text-blue-600 font-medium">
                Selected
              </span>
            )}

            {/* Favorite Button */}
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleFavoriteToggle(voice.id, e)}
              className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${
                isFavorite
                  ? 'text-yellow-500 hover:text-yellow-600'
                  : 'text-gray-400 hover:text-yellow-500'
              }`}
              aria-label={
                isFavorite ? 'Remove from favorites' : 'Add to favorites'
              }
            >
              <svg
                className="w-4 h-4"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>

            {/* Metadata Badges */}
            <div className="flex gap-1 mt-2 flex-wrap justify-center">
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                {voice.metadata.gender}
              </span>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                {voice.metadata.ageRange}
              </span>
            </div>
          </CardContent>
        </Card>
      );
    },
    [
      selectedVoice,
      showPreviews,
      accessibility,
      voiceManagement,
      handleVoiceSelect,
      handleKeyDown,
      handlePreviewEvent,
      handleFavoriteToggle,
    ]
  );

  // ============================================================================
  // MAIN RENDER - Component output
  // ============================================================================

  // Show upsell for non-Pro users
  if (!isProUser) {
    return <ProUpsell message="Voice selection is a Pro feature." />;
  }

  // Show error state if there are critical errors
  if (voiceManagement.hasErrors) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <h3 className="text-red-800 font-medium mb-2">Voice Selection Error</h3>
        <p className="text-red-600 text-sm">
          {voiceManagement.error?.message || 'An unknown error occurred'}
        </p>
        {voiceManagement.error?.recoverable && (
          <button
            onClick={() => voiceManagement.resetToDefaults()}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Reset to Defaults
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Accessibility Description */}
      <div id="voice-selector-description" className="sr-only">
        Voice selection interface with {availableVoices.length} available
        voices. Use Tab to navigate between voices, Enter or Space to select a
        voice.
      </div>

      {/* Voice Statistics */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          {availableVoices.length} voices available
          {voiceManagement.filteredVoicesCount !== availableVoices.length &&
            ` (${voiceManagement.filteredVoicesCount} filtered)`}
        </span>
        <span>Selected: {selectedVoiceConfig?.label || 'None'}</span>
      </div>

      {/* Voice Grid */}
      <div
        className={`grid ${sizeClasses} ${className}`}
        {...accessibilityProps}
      >
        {availableVoices.map(renderVoiceCard)}
      </div>

      {/* No Voices Message */}
      {availableVoices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No voices available with the current filters.</p>
          <button
            onClick={() => voiceManagement.clearFilters()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default VoiceSelector;
