import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useUserTier } from '@/hooks/useUserTier';
import { ProUpsell } from '@/components/ProUpsell';
import AudioPreviewPlayer from '@modules/agent/components/AudioPreviewPlayer';

/**
 * Voice configuration for narration
 */
interface VoiceConfig {
  /** Unique identifier for the voice */
  id: string;
  /** Display name and accent information */
  label: string;
  /** URL to audio preview file */
  previewUrl: string;
}

/**
 * Props for the VoiceSelector component
 */
interface VoiceSelectorProps {
  /** Currently selected voice ID */
  selectedVoice: string;
  /** Callback when voice selection changes */
  onChange: (voiceId: string) => void;
  /** Optional CSS class name */
  className?: string;
  /** Size variant for the voice cards */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show voice previews */
  showPreviews?: boolean;
}

/**
 * Available voices for narration
 * @remarks This could be fetched from an API or imported from a configuration file
 */
const availableVoices: VoiceConfig[] = [
  { id: 'emma', label: 'Emma (British)', previewUrl: '/previews/emma.mp3' },
  { id: 'liam', label: 'Liam (American)', previewUrl: '/previews/liam.mp3' },
  { id: 'sofia', label: 'Sofia (Spanish)', previewUrl: '/previews/sofia.mp3' },
];

/**
 * Voice selection component for Pro users
 *
 * @remarks
 * - Only available to Pro tier users
 * - Shows ProUpsell component for Free users
 * - Supports keyboard navigation and accessibility
 * - Includes audio preview functionality
 */
export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onChange,
  className = '',
  size = 'md',
  showPreviews = true,
}) => {
  const { isProUser } = useUserTier();

  // Show upsell for non-Pro users
  if (!isProUser) {
    return <ProUpsell message="Voice selection is a Pro feature." />;
  }

  const sizeClasses = {
    sm: 'grid-cols-1 md:grid-cols-2 gap-3',
    md: 'grid-cols-1 md:grid-cols-3 gap-4',
    lg: 'grid-cols-1 md:grid-cols-4 gap-6',
  };

  return (
    <div className={`grid ${sizeClasses[size]} ${className}`}>
      {availableVoices.map(voice => (
        <Card
          key={voice.id}
          className={`cursor-pointer transition-all duration-200 border-2 ${
            selectedVoice === voice.id
              ? 'border-blue-500 shadow-lg'
              : 'border-transparent'
          }`}
          onClick={() => onChange(voice.id)}
          role="button"
          tabIndex={0}
          aria-pressed={selectedVoice === voice.id}
          onKeyDown={(e: React.KeyboardEvent) =>
            e.key === 'Enter' && onChange(voice.id)
          }
        >
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="font-semibold mb-2">{voice.label}</span>
            {showPreviews && (
              <AudioPreviewPlayer
                audioUrl={voice.previewUrl}
                voiceName={voice.label}
              />
            )}
            {selectedVoice === voice.id && (
              <span className="mt-2 text-sm text-blue-600">Selected</span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// TODO: Write Jest test for VoiceSelector with mock voice data and selection event
// Test cases to cover:
// - Pro user sees voice selection interface
// - Free user sees ProUpsell component
// - Voice selection triggers onChange callback
// - Keyboard navigation (Enter key) works correctly
// - AudioPreviewPlayer receives correct props
// - Selected voice shows visual feedback
