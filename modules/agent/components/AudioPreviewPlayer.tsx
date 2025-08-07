/*
role: ui-engineer,
tier: Pro,
file: "modules/agent/components/AudioPreviewPlayer.tsx",
allowedActions: ["play", "pause", "seek", "preview"],
theme: "audio_playback"
*/

/* MCP: doc2video_ui */

import React, { useState, useRef, useEffect } from 'react';

interface AudioPreviewPlayerProps {
  audioUrl?: string;
  voiceName?: string;
  voiceId?: string;
  duration?: number;
  pipelineId?: string;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Audio Preview Player Component for TTS narration playback
 * @component
 * @returns {JSX.Element}
 */
const AudioPreviewPlayer: React.FC<AudioPreviewPlayerProps> = ({
  audioUrl,
  voiceName,
  voiceId,
  duration,
  pipelineId,
  className = '',
  onPlay,
  onPause,
  onEnded,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: duration || 0,
    isLoading: false,
    error: null,
  });

  // Format time in MM:SS format
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage =
    audioState.duration > 0
      ? (audioState.currentTime / audioState.duration) * 100
      : 0;

  // Handle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (audioState.isPlaying) {
      audioRef.current.pause();
      onPause?.();
    } else {
      audioRef.current.play();
      onPlay?.();
    }
  };

  // Handle seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioState.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * audioState.duration;

    audioRef.current.currentTime = newTime;
    setAudioState(prev => ({ ...prev, currentTime: newTime }));
  };

  // Audio event handlers
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioState(prev => ({
        ...prev,
        duration: audioRef.current!.duration,
        isLoading: false,
      }));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setAudioState(prev => ({
        ...prev,
        currentTime: audioRef.current!.currentTime,
      }));
    }
  };

  const handlePlay = () => {
    setAudioState(prev => ({ ...prev, isPlaying: true }));

    // MCP: Log audio playback for audit
    if (typeof window !== 'undefined' && (window as any).logTelemetryEvent) {
      (window as any).logTelemetryEvent('audio_playback_started', {
        pipelineId,
        voiceId,
        voiceName,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handlePause = () => {
    setAudioState(prev => ({ ...prev, isPlaying: false }));
  };

  const handleEnded = () => {
    setAudioState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    onEnded?.();
  };

  const handleError = () => {
    setAudioState(prev => ({
      ...prev,
      error: 'Failed to load audio file',
      isLoading: false,
    }));
  };

  const handleLoadStart = () => {
    setAudioState(prev => ({ ...prev, isLoading: true, error: null }));
  };

  // Reset audio when URL changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      setAudioState(prev => ({
        ...prev,
        currentTime: 0,
        isPlaying: false,
        isLoading: false,
        error: null,
      }));
    }
  }, [audioUrl]);

  if (!audioUrl) {
    return (
      <div
        className={`p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 ${className}`}
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-lg mb-2">🎵</div>
          <p className="text-sm">No audio available</p>
          <p className="text-xs mt-1">
            Audio will be generated when narration is complete
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 ${className}`}
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
        onLoadStart={handleLoadStart}
        preload="metadata"
      />

      {/* Voice Information */}
      {voiceName && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-sm">
                🎤
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {voiceName}
              </p>
              {voiceId && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {voiceId}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-900 dark:text-white">
              {formatTime(audioState.currentTime)} /{' '}
              {formatTime(audioState.duration)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {Math.round(progressPercentage)}% complete
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-3">
        <div
          className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-150"
            style={{ width: `${progressPercentage}%` }}
          />
          <div
            className="absolute top-0 h-full w-1 bg-blue-800 rounded-full transform -translate-x-1/2"
            style={{ left: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={togglePlayPause}
            disabled={audioState.isLoading || !!audioState.error}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 
                       disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full 
                       transition-colors duration-200"
          >
            {audioState.isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : audioState.isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {audioState.isLoading
              ? 'Loading...'
              : audioState.isPlaying
                ? 'Playing'
                : 'Paused'}
          </div>
        </div>

        {/* Duration Display */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatTime(audioState.currentTime)} /{' '}
          {formatTime(audioState.duration)}
        </div>
      </div>

      {/* Error State */}
      {audioState.error && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-xs text-red-700 dark:text-red-300">
            ⚠️ {audioState.error}
          </p>
        </div>
      )}

      {/* Loading State */}
      {audioState.isLoading && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            🔄 Loading audio preview...
          </p>
        </div>
      )}
    </div>
  );
};

export default AudioPreviewPlayer;
