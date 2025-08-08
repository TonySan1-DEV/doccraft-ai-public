import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useUserTier } from '@/hooks/useUserTier';
import { ProUpsell } from '@/components/ProUpsell';
import AudioPreviewPlayer from '@modules/agent/components/AudioPreviewPlayer';

// Sample voice data (this could be fetched or imported)
const availableVoices = [
  { id: 'emma', label: 'Emma (British)', previewUrl: '/previews/emma.mp3' },
  { id: 'liam', label: 'Liam (American)', previewUrl: '/previews/liam.mp3' },
  { id: 'sofia', label: 'Sofia (Spanish)', previewUrl: '/previews/sofia.mp3' },
];

interface VoiceSelectorProps {
  selectedVoice: string;
  onChange: (voiceId: string) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onChange,
}) => {
  const { isProUser } = useUserTier();

  if (!isProUser) {
    return <ProUpsell message="Voice selection is a Pro feature." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <AudioPreviewPlayer
              audioUrl={voice.previewUrl}
              voiceName={voice.label}
            />
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
