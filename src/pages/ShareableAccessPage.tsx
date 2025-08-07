/*
role: ui-engineer,
tier: Pro,
file: "src/pages/ShareableAccessPage.tsx",
allowedActions: ["display", "play", "track"],
theme: "public_sharing"
*/

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { logTelemetryEvent } from '../utils/telemetryLogger';

// Types for shareable content
interface PipelineData {
  id: string;
  title: string;
  status: string;
  mode: string;
  tier: string;
  created_at: string;
  slide_deck_id?: string;
  narrated_deck_id?: string;
  tts_narration_id?: string;
}

interface SlideDeck {
  id: string;
  title: string;
  slides: Array<{
    id: string;
    title: string;
    content: string;
    image_url?: string;
  }>;
  theme: string;
  created_at: string;
}

interface NarratedDeck {
  id: string;
  title: string;
  slides: Array<{
    id: string;
    title: string;
    content: string;
    narration: string;
    timing: number;
  }>;
  total_duration: number;
  created_at: string;
}

interface TTSNarration {
  id: string;
  audio_file_url: string;
  duration: number;
  voice_used: string;
  created_at: string;
}

interface ShareableAccessPageState {
  loading: boolean;
  error: string | null;
  pipeline: PipelineData | null;
  slideDeck: SlideDeck | null;
  narratedDeck: NarratedDeck | null;
  ttsNarration: TTSNarration | null;
  currentSlide: number;
  isPlaying: boolean;
  audioProgress: number;
  showTranscript: boolean;
  accessCount: number;
}

export default function ShareableAccessPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [state, setState] = useState<ShareableAccessPageState>({
    loading: true,
    error: null,
    pipeline: null,
    slideDeck: null,
    narratedDeck: null,
    ttsNarration: null,
    currentSlide: 0,
    isPlaying: false,
    audioProgress: 0,
    showTranscript: false,
    accessCount: 0,
  });

  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  useEffect(() => {
    if (!token) {
      setState(prev => ({
        ...prev,
        error: 'Invalid share link',
        loading: false,
      }));
      return;
    }

    verifyTokenAndLoadContent();
  }, [token]);

  useEffect(() => {
    // Set up audio element
    const audio = new Audio();
    audio.preload = 'metadata';

    audio.addEventListener('timeupdate', handleAudioTimeUpdate);
    audio.addEventListener('ended', handleAudioEnded);
    audio.addEventListener('error', handleAudioError);

    setAudioElement(audio);

    return () => {
      audio.removeEventListener('timeupdate', handleAudioTimeUpdate);
      audio.removeEventListener('ended', handleAudioEnded);
      audio.removeEventListener('error', handleAudioError);
      audio.pause();
    };
  }, []);

  const verifyTokenAndLoadContent = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Call the edge function to verify token
      const { data, error } = await supabase.functions.invoke(
        'verifyLinkToken',
        {
          body: {
            token,
            visitor_user_agent: navigator.userAgent,
            referrer: document.referrer,
          },
        }
      );

      if (error || !data.success) {
        throw new Error(data?.error || 'Failed to verify token');
      }

      const { pipeline_data, access_count } = data;

      // Load pipeline content
      await loadPipelineContent(pipeline_data);

      // Log telemetry
      logTelemetryEvent('shareable_link_accessed', {
        pipeline_id: pipeline_data.id,
        token: token,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
      });

      setState(prev => ({
        ...prev,
        pipeline: pipeline_data,
        accessCount: access_count || 0,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading shareable content:', error);
      setState(prev => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Failed to load content',
        loading: false,
      }));
    }
  };

  const loadPipelineContent = async (pipeline: PipelineData) => {
    try {
      // Load slide deck
      if (pipeline.slide_deck_id) {
        const { data: slideDeck, error: slideError } = await supabase
          .from('slide_decks')
          .select('*')
          .eq('id', pipeline.slide_deck_id)
          .single();

        if (!slideError && slideDeck) {
          setState(prev => ({ ...prev, slideDeck }));
        }
      }

      // Load narrated deck
      if (pipeline.narrated_deck_id) {
        const { data: narratedDeck, error: narratedError } = await supabase
          .from('narrated_decks')
          .select('*')
          .eq('id', pipeline.narrated_deck_id)
          .single();

        if (!narratedError && narratedDeck) {
          setState(prev => ({ ...prev, narratedDeck }));
        }
      }

      // Load TTS narration
      if (pipeline.tts_narration_id) {
        const { data: ttsNarration, error: ttsError } = await supabase
          .from('tts_narrations')
          .select('*')
          .eq('id', pipeline.tts_narration_id)
          .single();

        if (!ttsError && ttsNarration) {
          setState(prev => ({ ...prev, ttsNarration }));

          // Set up audio source
          if (audioElement && ttsNarration.audio_file_url) {
            audioElement.src = ttsNarration.audio_file_url;
          }
        }
      }
    } catch (error) {
      console.error('Error loading pipeline content:', error);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioElement) {
      const progress = (audioElement.currentTime / audioElement.duration) * 100;
      setState(prev => ({ ...prev, audioProgress: progress }));

      // Sync with slide timing if available
      if (state.narratedDeck) {
        const currentTime = audioElement.currentTime;
        const slideIndex = state.narratedDeck.slides.findIndex(
          slide => slide.timing > currentTime
        );
        if (slideIndex !== -1 && slideIndex !== state.currentSlide) {
          setState(prev => ({
            ...prev,
            currentSlide: Math.max(0, slideIndex - 1),
          }));
        }
      }
    }
  };

  const handleAudioEnded = () => {
    setState(prev => ({ ...prev, isPlaying: false, audioProgress: 0 }));
  };

  const handleAudioError = () => {
    setState(prev => ({ ...prev, error: 'Failed to load audio file' }));
  };

  const togglePlayPause = () => {
    if (!audioElement) return;

    if (state.isPlaying) {
      audioElement.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    } else {
      audioElement.play();
      setState(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioElement) return;

    const progress = parseFloat(e.target.value);
    const newTime = (progress / 100) * audioElement.duration;
    audioElement.currentTime = newTime;
    setState(prev => ({ ...prev, audioProgress: progress }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goToSlide = (index: number) => {
    setState(prev => ({ ...prev, currentSlide: index }));

    // Seek to slide timing if available
    if (state.narratedDeck && audioElement) {
      const slide = state.narratedDeck.slides[index];
      if (slide && slide.timing) {
        audioElement.currentTime = slide.timing;
        setState(prev => ({
          ...prev,
          audioProgress: (slide.timing / audioElement.duration) * 100,
        }));
      }
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared content...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Content Unavailable
          </h1>
          <p className="text-gray-600 mb-6">{state.error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!state.pipeline) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No content found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {state.pipeline.title || 'Shared Presentation'}
              </h1>
              <p className="text-sm text-gray-500">
                Created{' '}
                {new Date(state.pipeline.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {state.accessCount} views
              </span>
              <button
                onClick={() =>
                  setState(prev => ({
                    ...prev,
                    showTranscript: !prev.showTranscript,
                  }))
                }
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {state.showTranscript ? 'Hide' : 'Show'} Transcript
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Slide Viewer */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Presentation</h2>

              {state.slideDeck && state.slideDeck.slides.length > 0 ? (
                <div className="space-y-4">
                  {/* Slide Navigation */}
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {state.slideDeck.slides.map((slide, index) => (
                      <button
                        key={slide.id}
                        onClick={() => goToSlide(index)}
                        className={`px-3 py-1 text-sm rounded ${
                          index === state.currentSlide
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  {/* Current Slide */}
                  <div className="border rounded-lg p-6 min-h-[300px]">
                    <h3 className="text-xl font-semibold mb-4">
                      {state.slideDeck.slides[state.currentSlide]?.title}
                    </h3>
                    <div className="prose max-w-none">
                      {state.slideDeck.slides[state.currentSlide]?.content}
                    </div>
                    {state.slideDeck.slides[state.currentSlide]?.image_url && (
                      <img
                        src={
                          state.slideDeck.slides[state.currentSlide].image_url
                        }
                        alt="Slide content"
                        className="mt-4 max-w-full h-auto rounded"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No slides available
                </div>
              )}
            </div>
          </div>

          {/* Audio Player and Transcript */}
          <div className="space-y-6">
            {/* Audio Player */}
            {state.ttsNarration && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Audio Narration</h2>

                <div className="space-y-4">
                  {/* Play/Pause Button */}
                  <div className="flex items-center justify-center">
                    <button
                      onClick={togglePlayPause}
                      className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                    >
                      {state.isPlaying ? (
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={state.audioProgress}
                      onChange={handleSeek}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>
                        {audioElement
                          ? formatTime(audioElement.currentTime)
                          : '0:00'}
                      </span>
                      <span>
                        {audioElement
                          ? formatTime(audioElement.duration)
                          : '0:00'}
                      </span>
                    </div>
                  </div>

                  {/* Voice Info */}
                  <div className="text-sm text-gray-600">
                    Voice: {state.ttsNarration.voice_used}
                  </div>
                </div>
              </div>
            )}

            {/* Transcript */}
            {state.showTranscript && state.narratedDeck && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Transcript</h2>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {state.narratedDeck.slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`p-3 rounded ${
                        index === state.currentSlide
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">
                          Slide {index + 1}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {formatTime(slide.timing)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{slide.narration}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Watermark for anonymous access */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Shared via DocCraft AI •
            <a href="/" className="text-blue-600 hover:text-blue-700 ml-1">
              Create your own presentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
