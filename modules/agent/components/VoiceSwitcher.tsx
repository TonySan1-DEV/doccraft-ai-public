/*
role: ui-engineer,
tier: Pro,
file: "modules/agent/components/VoiceSwitcher.tsx",
allowedActions: ["select", "preview", "regenerate"],
theme: "tts_voice_selection"
*/

/* MCP: doc2video_ui */

import React, { useState, useEffect } from 'react';

interface VoiceOption {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female';
  accent?: string;
  preview?: string;
}

interface VoiceSwitcherProps {
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  userTier: string;
  pipelineId?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Voice Switcher Component for TTS voice selection
 * @component
 * @returns {JSX.Element}
 */
const VoiceSwitcher: React.FC<VoiceSwitcherProps> = ({
  selectedVoice,
  onVoiceChange,
  userTier,
  pipelineId,
  disabled = false,
  className = '',
}) => {
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MCP: Tier-based voice access control
  const getAvailableVoices = (tier: string): VoiceOption[] => {
    const allVoices: VoiceOption[] = [
      {
        id: 'en-US-JennyNeural',
        name: 'Jenny',
        language: 'en-US',
        gender: 'female',
        accent: 'American',
        preview: "Hello, I'm Jenny. I'll be narrating your content today.",
      },
      {
        id: 'en-US-GuyNeural',
        name: 'Guy',
        language: 'en-US',
        gender: 'male',
        accent: 'American',
        preview: "Hi there, I'm Guy. Ready to bring your story to life.",
      },
      {
        id: 'en-GB-RyanNeural',
        name: 'Ryan',
        language: 'en-GB',
        gender: 'male',
        accent: 'British',
        preview: "Good day, I'm Ryan. Let me narrate your presentation.",
      },
      {
        id: 'en-GB-SoniaNeural',
        name: 'Sonia',
        language: 'en-GB',
        gender: 'female',
        accent: 'British',
        preview: "Hello, I'm Sonia. I'll be your narrator today.",
      },
      {
        id: 'en-AU-NatashaNeural',
        name: 'Natasha',
        language: 'en-AU',
        gender: 'female',
        accent: 'Australian',
        preview: "G'day, I'm Natasha. Ready to narrate your content.",
      },
      {
        id: 'en-CA-ClaraNeural',
        name: 'Clara',
        language: 'en-CA',
        gender: 'female',
        accent: 'Canadian',
        preview: "Hello, I'm Clara. I'll be narrating your presentation.",
      },
    ];

    // MCP: Free tier gets default voice only
    if (tier === 'Free') {
      return allVoices.filter(voice => voice.id === 'en-US-JennyNeural');
    }

    // MCP: Pro tier gets standard voices
    if (tier === 'Pro') {
      return allVoices.filter(voice =>
        ['en-US-JennyNeural', 'en-US-GuyNeural', 'en-GB-RyanNeural'].includes(
          voice.id
        )
      );
    }

    // MCP: Premium/Enterprise get all voices
    if (tier === 'Premium' || tier === 'Enterprise') {
      return allVoices;
    }

    // Default to Pro tier access
    return allVoices.filter(voice =>
      ['en-US-JennyNeural', 'en-US-GuyNeural', 'en-GB-RyanNeural'].includes(
        voice.id
      )
    );
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const voices = getAvailableVoices(userTier);
      setAvailableVoices(voices);

      // Ensure selected voice is available for current tier
      const isSelectedVoiceAvailable = voices.some(
        voice => voice.id === selectedVoice
      );
      if (!isSelectedVoiceAvailable && voices.length > 0) {
        onVoiceChange(voices[0].id);
      }
    } catch (err) {
      setError('Failed to load available voices');
      console.error('Voice loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [userTier, selectedVoice, onVoiceChange]);

  const handleVoiceChange = (voiceId: string) => {
    if (disabled) return;

    // MCP: Log voice selection for audit
    if (typeof window !== 'undefined' && (window as any).logTelemetryEvent) {
      (window as any).logTelemetryEvent('voice_selected', {
        voiceId,
        userTier,
        pipelineId,
        timestamp: new Date().toISOString(),
      });
    }

    onVoiceChange(voiceId);
  };

  const getSelectedVoiceInfo = () => {
    return availableVoices.find(voice => voice.id === selectedVoice);
  };

  const selectedVoiceInfo = getSelectedVoiceInfo();

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Loading voices...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-sm text-red-600 dark:text-red-400 ${className}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        TTS Voice
        {userTier === 'Free' && (
          <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">
            (Upgrade for more voices)
          </span>
        )}
      </label>

      <select
        value={selectedVoice}
        onChange={e => handleVoiceChange(e.target.value)}
        disabled={disabled || availableVoices.length === 0}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
      >
        {availableVoices.map(voice => (
          <option key={voice.id} value={voice.id}>
            {voice.name} ({voice.accent})
          </option>
        ))}
      </select>

      {/* Voice Preview */}
      {selectedVoiceInfo && (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedVoiceInfo.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {selectedVoiceInfo.language} • {selectedVoiceInfo.gender}
            </span>
          </div>
          {selectedVoiceInfo.preview && (
            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
              "{selectedVoiceInfo.preview}"
            </p>
          )}
        </div>
      )}

      {/* Tier Information */}
      {userTier === 'Free' && (
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 Upgrade to Pro for more voice options (Jenny, Guy, Ryan)
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceSwitcher;
