/**
 * @fileoverview TTS Sync Engine Service
 * @module modules/agent/services/ttsSyncEngine
 *
 * MCP Context Block:
 * - role: "ai-engineer"
 * - tier: "Pro"
 * - file: "modules/agent/services/ttsSyncEngine.ts"
 * - allowedActions: ["generate", "narration", "tts", "upload"]
 * - theme: "doc2video_voiceover"
 */

import { NarratedSlideDeck } from './scriptGenerator';
import {
  uploadNarrationAudio,
  getNarrationAudioUrl,
  generateAudioFileName,
  validateAudioFile,
} from './supabaseStorage';

/**
 * TTS Narration result with audio file and timeline
 */
export type TTSNarration = {
  audioFileUrl: string;
  timeline: {
    slideId: string;
    narration: string;
    startTime: number;
    endTime: number;
  }[];
  modelUsed?: string;
  title?: string;
};

/**
 * TTS generation options
 */
export interface TTSSyncOptions {
  voice?: string;
  language?: string;
  speed?: number;
  userId?: string;
  quality?: 'low' | 'medium' | 'high';
  format?: 'mp3' | 'wav' | 'ogg';
}

/**
 * Generate TTS narration from narrated slide deck
 * @param narratedDeck - Input narrated slide deck
 * @param options - TTS options including userId for storage
 * @returns Promise<TTSNarration>
 */
export async function generateTTSNarration(
  narratedDeck: NarratedSlideDeck,
  options?: TTSSyncOptions
): Promise<TTSNarration> {
  try {
    // Input validation: ensure narratedDeck.slides is not empty
    if (
      !narratedDeck ||
      !narratedDeck.slides ||
      narratedDeck.slides.length === 0
    ) {
      throw new Error(
        'Narrated slide deck is required and must contain slides'
      );
    }

    // Validate userId is provided for storage
    if (!options?.userId) {
      throw new Error(
        'UserId is required for uploading narration audio to Supabase Storage'
      );
    }

    console.log('🎤 Generating TTS narration...');

    // Generate timeline for each slide
    const timeline = generateTimeline(narratedDeck, options);

    // Generate audio file and upload to Supabase Storage
    const audioFileUrl = await generateAndUploadAudio(narratedDeck, options);

    // Create TTS narration result
    const ttsNarration: TTSNarration = {
      audioFileUrl,
      timeline,
      modelUsed: options?.voice || 'en-US-JennyNeural',
      title: narratedDeck.title,
    };

    console.log(`✅ Generated TTS narration with ${timeline.length} segments`);
    console.log(`📁 Audio uploaded to Supabase Storage: ${audioFileUrl}`);

    return ttsNarration;
  } catch (error) {
    console.error('TTS generation error:', error);
    throw new Error(
      `Failed to generate TTS narration: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate and upload audio file to Supabase Storage
 * @param narratedDeck - Narrated slide deck
 * @param options - TTS options
 * @returns Promise<string> - Signed URL for audio file
 */
async function generateAndUploadAudio(
  narratedDeck: NarratedSlideDeck,
  options: TTSSyncOptions
): Promise<string> {
  const {
    userId,
    voice: _voice,
    language: _language,
    speed: _speed,
    quality: _quality,
    format,
  } = options;

  if (!userId) {
    throw new Error('UserId is required for audio upload');
  }

  try {
    // Generate unique filename for the audio file
    const baseFileName = narratedDeck.title.replace(/\s+/g, '_').toLowerCase();
    const audioFileName = generateAudioFileName(
      baseFileName,
      `.${format || 'mp3'}`
    );

    console.log(`📝 Generating audio file: ${audioFileName}`);

    // Generate audio blob (replace with real TTS service integration)
    const audioBlob = await generateAudioBlob(narratedDeck, options);

    // Validate audio file before upload
    const validation = validateAudioFile(audioBlob);
    if (!validation.isValid) {
      throw new Error(`Audio file validation failed: ${validation.error}`);
    }

    console.log(`📤 Uploading audio to Supabase Storage...`);

    // Upload audio file to Supabase Storage
    await uploadNarrationAudio(userId, audioFileName, audioBlob, {
      contentType: `audio/${format || 'mpeg'}`,
      upsert: true,
      cacheControl: '3600', // Cache for 1 hour
    });

    // Generate signed URL for immediate access
    const signedUrlResponse = await getNarrationAudioUrl(
      userId,
      audioFileName,
      3600
    ); // 1 hour expiry

    console.log(`✅ Audio uploaded successfully`);
    console.log(
      `🔗 Signed URL generated: ${signedUrlResponse.signedUrl.substring(0, 50)}...`
    );

    return signedUrlResponse.signedUrl;
  } catch (error) {
    console.error('Audio upload error:', error);
    throw new Error(
      `Failed to upload audio file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate audio blob from narrated deck
 * @param narratedDeck - Narrated slide deck
 * @param options - TTS options
 * @returns Promise<Blob> - Audio blob
 */
async function generateAudioBlob(
  narratedDeck: NarratedSlideDeck,
  options: TTSSyncOptions
): Promise<Blob> {
  // TODO: Replace with real TTS service integration
  // This is a placeholder that generates mock audio data
  // In production, this would call OpenAI TTS, Azure Speech, ElevenLabs, etc.

  const {
    voice = 'en-US-JennyNeural',
    language = 'en',
    speed = 1.0,
    quality = 'medium',
  } = options;

  console.log(
    `🎵 Generating audio with voice: ${voice}, language: ${language}, speed: ${speed}, quality: ${quality}`
  );

  // Combine all narration text for processing
  const fullNarration = narratedDeck.slides
    .map(slide => slide.narration)
    .filter(Boolean)
    .join(' ');

  // Calculate estimated audio duration
  const wordCount = fullNarration.split(/\s+/).length;
  const estimatedDuration = Math.max(10, wordCount / 2.5); // ~2.5 words per second

  // Generate mock audio data (replace with real TTS)
  const mockAudioData = generateMockAudioData(estimatedDuration, quality);

  // Create blob with appropriate MIME type
  const mimeType =
    options.format === 'wav'
      ? 'audio/wav'
      : options.format === 'ogg'
        ? 'audio/ogg'
        : 'audio/mpeg';

  return new Blob([mockAudioData], { type: mimeType });
}

/**
 * Generate mock audio data for testing
 * @param durationSeconds - Duration in seconds
 * @param quality - Audio quality
 * @returns Uint8Array - Mock audio data
 */
function generateMockAudioData(
  durationSeconds: number,
  quality: 'low' | 'medium' | 'high'
): Uint8Array {
  // Generate a simple sine wave as mock audio
  const sampleRate =
    quality === 'high' ? 44100 : quality === 'medium' ? 22050 : 11025;
  const samples = Math.floor(durationSeconds * sampleRate);
  const audioData = new Uint8Array(samples);

  // Generate a simple tone (440 Hz sine wave)
  const frequency = 440;
  const amplitude = 0.3;

  for (let i = 0; i < samples; i++) {
    const time = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * time) * amplitude;
    audioData[i] = Math.floor((sample + 1) * 127); // Convert to 8-bit unsigned
  }

  return audioData;
}

/**
 * Generate timeline for slide synchronization
 * @param narratedDeck - Narrated slide deck
 * @param options - TTS options
 * @returns Timeline array
 */
function generateTimeline(
  narratedDeck: NarratedSlideDeck,
  options?: TTSSyncOptions
): TTSNarration['timeline'] {
  const timeline: TTSNarration['timeline'] = [];
  let currentTime = 0;
  const speed = options?.speed || 1.0;

  for (const slide of narratedDeck.slides) {
    if (!slide.narration) continue;

    // Calculate duration based on word count and speed
    const wordCount = slide.narration.split(/\s+/).length;
    const baseDuration = calculateDuration(wordCount, speed);

    const endTime = currentTime + baseDuration;

    timeline.push({
      slideId: slide.id,
      narration: slide.narration,
      startTime: currentTime,
      endTime: endTime,
    });

    currentTime = endTime;
  }

  return timeline;
}

/**
 * Calculate audio duration based on word count and speed
 * @param wordCount - Number of words
 * @param speed - Speaking speed multiplier
 * @returns Duration in seconds
 */
function calculateDuration(wordCount: number, speed: number): number {
  // Average speaking rate: 150 words per minute
  const wordsPerMinute = 150;
  const baseDuration = (wordCount / wordsPerMinute) * 60;

  // Apply speed multiplier and ensure minimum duration
  const adjustedDuration = baseDuration / speed;
  return Math.max(2, adjustedDuration); // Minimum 2 seconds per slide
}

/**
 * Generate TTS narration with audio upload for a specific user
 * @param narratedDeck - Narrated slide deck
 * @param userId - User ID for storage
 * @param options - TTS options
 * @returns Promise<TTSNarration>
 */
export async function generateTTSNarrationForUser(
  narratedDeck: NarratedSlideDeck,
  userId: string,
  options?: Omit<TTSSyncOptions, 'userId'>
): Promise<TTSNarration> {
  return generateTTSNarration(narratedDeck, {
    ...options,
    userId,
  });
}

/**
 * Generate mock TTS narration for testing (without storage)
 * @returns TTSNarration
 */
export function generateMockTTSNarration(): TTSNarration {
  return {
    audioFileUrl:
      '/mock/audio/narration-1234567890.mp3?voice=en-US-JennyNeural&language=en&speed=1.0',
    modelUsed: 'en-US-JennyNeural',
    title: 'Mock Presentation',
    timeline: [
      {
        slideId: 'slide-1',
        narration:
          "Welcome to our presentation on DocCraft-AI. Today we'll explore AI-powered content creation and how it's transforming document workflows.",
        startTime: 0,
        endTime: 7,
      },
      {
        slideId: 'slide-2',
        narration:
          "Let's talk about the key features. DocCraft-AI offers document analysis and enhancement, AI-powered writing assistance, real-time collaboration tools, and advanced analytics and insights.",
        startTime: 7,
        endTime: 15,
      },
      {
        slideId: 'slide-3',
        narration:
          'Now, consider this important aspect: Benefits and ROI. We see 50% faster content creation, improved content quality, reduced revision cycles, and enhanced team productivity.',
        startTime: 15,
        endTime: 22,
      },
      {
        slideId: 'slide-4',
        narration:
          'To summarize, here are your next steps: schedule a demo, start your free trial, contact our team, and join our community. These compelling points demonstrate the value of taking action.',
        startTime: 22,
        endTime: 28,
      },
    ],
  };
}

/**
 * Validate TTS options
 * @param options - TTS options to validate
 * @returns Validation result
 */
export function validateTTSSyncOptions(options?: TTSSyncOptions): {
  isValid: boolean;
  error?: string;
} {
  if (!options) {
    return { isValid: true };
  }

  // Validate speed
  if (
    options.speed !== undefined &&
    (options.speed < 0.5 || options.speed > 2.0)
  ) {
    return {
      isValid: false,
      error: 'Speed must be between 0.5 and 2.0',
    };
  }

  // Validate quality
  if (options.quality && !['low', 'medium', 'high'].includes(options.quality)) {
    return {
      isValid: false,
      error: 'Quality must be low, medium, or high',
    };
  }

  // Validate format
  if (options.format && !['mp3', 'wav', 'ogg'].includes(options.format)) {
    return {
      isValid: false,
      error: 'Format must be mp3, wav, or ogg',
    };
  }

  return { isValid: true };
}

/**
 * Regenerate TTS narration from existing script with new voice
 * @param pipelineId - Pipeline ID to regenerate narration for
 * @param voice - New voice to use for regeneration
 * @param options - Additional TTS options
 * @returns Promise<TTSNarration>
 */
export async function regenerateFromScript(
  pipelineId: string,
  voice: string,
  options?: Omit<TTSSyncOptions, 'voice' | 'userId'>
): Promise<TTSNarration> {
  try {
    console.log(
      `🔄 Regenerating TTS narration for pipeline ${pipelineId} with voice ${voice}`
    );

    // Get pipeline info from database
    const { data: pipeline, error: pipelineError } = await supabase
      .from('pipelines')
      .select('*')
      .eq('id', pipelineId)
      .single();

    if (pipelineError || !pipeline) {
      throw new Error(
        `Pipeline not found: ${pipelineError?.message || 'Unknown error'}`
      );
    }

    // MCP: Only allow regeneration for Hybrid/Manual pipelines
    if (pipeline.mode !== 'hybrid' && pipeline.mode !== 'manual') {
      throw new Error(
        'Regeneration is only allowed for Hybrid or Manual pipelines'
      );
    }

    // Get the narrated deck (script)
    const { data: narratedDeck, error: deckError } = await supabase
      .from('narrated_decks')
      .select('*')
      .eq('pipeline_id', pipelineId)
      .single();

    if (deckError || !narratedDeck) {
      throw new Error(
        `Narrated deck not found: ${deckError?.message || 'Unknown error'}`
      );
    }

    // Use edited script if available, otherwise use original
    const scriptToUse =
      narratedDeck.edited_script ||
      narratedDeck.slides.map((slide: any) => slide.narration).join(' ');

    // Create a NarratedSlideDeck object for TTS generation
    const narratedDeckForTTS = {
      title: narratedDeck.title,
      theme: narratedDeck.theme,
      slides: narratedDeck.slides.map((slide: any) => ({
        ...slide,
        narration: slide.narration,
      })),
    };

    // Update pipeline status to show regeneration in progress
    await supabase
      .from('pipelines')
      .update({
        status: 'running',
        currentStep: 'regenerating_tts_narration',
        progress: 75,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', pipelineId);

    console.log('🔄 Generating TTS narration with new voice...');

    // Generate TTS narration with new voice
    const ttsNarration = await generateTTSNarration(narratedDeckForTTS, {
      userId: pipeline.user_id,
      voice,
      speed: options?.speed || 1.0,
      quality: options?.quality || 'medium',
      format: options?.format || 'mp3',
      language: options?.language || 'en',
    });

    // Store new TTS narration in database
    const { data: storedTTS, error: storeError } = await supabase
      .from('tts_narrations')
      .insert({
        user_id: pipeline.user_id,
        audio_file_url: ttsNarration.audioFileUrl,
        timeline: ttsNarration.timeline,
        model_used: ttsNarration.modelUsed,
        voice,
        language: options?.language || 'en',
        speed: options?.speed || 1.0,
        tier: pipeline.tier,
        processing_time_ms: Date.now() - new Date(pipeline.createdAt).getTime(),
        total_duration:
          ttsNarration.timeline[ttsNarration.timeline.length - 1]?.endTime || 0,
        slide_count: narratedDeckForTTS.slides.length,
        total_words: scriptToUse.split(/\s+/).length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (storeError) {
      throw new Error(
        `Failed to store regenerated TTS narration: ${storeError.message}`
      );
    }

    // Update pipeline to link new TTS narration
    await supabase
      .from('pipelines')
      .update({
        ttsNarrationId: storedTTS.id,
        status: 'success',
        currentStep: 'tts_regeneration_completed',
        progress: 100,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', pipelineId);

    // MCP: Log regeneration for audit
    if (typeof window !== 'undefined' && (window as any).logTelemetryEvent) {
      (window as any).logTelemetryEvent('tts_regeneration_completed', {
        pipelineId,
        voice,
        originalVoice: narratedDeck.voice_used,
        userId: pipeline.user_id,
        tier: pipeline.tier,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(
      `✅ TTS narration regenerated successfully with voice ${voice}`
    );
    console.log(
      `📁 New audio URL: ${ttsNarration.audioFileUrl.substring(0, 50)}...`
    );

    return ttsNarration;
  } catch (error) {
    console.error('TTS regeneration error:', error);

    // Update pipeline status to failed
    await supabase
      .from('pipelines')
      .update({
        status: 'failed',
        errorMessage: `TTS regeneration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', pipelineId);

    throw new Error(
      `Failed to regenerate TTS narration: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// TODO: Future Enhancements
/*
1. REAL TTS INTEGRATION:
   - Replace mock audio generation with OpenAI TTS API
   - Add Azure Speech Services integration
   - Implement ElevenLabs voice cloning
   - Add Google Cloud Text-to-Speech support

2. AUDIO PROCESSING:
   - Add audio compression and optimization
   - Implement different quality levels
   - Add audio effects and enhancements
   - Support for multiple audio formats

3. CACHING AND OPTIMIZATION:
   - Cache generated audio files
   - Implement audio file deduplication
   - Add progressive audio loading
   - Optimize for mobile playback

4. ERROR HANDLING AND RETRIES:
   - Add retry logic for failed uploads
   - Implement circuit breaker pattern
   - Add fallback audio generation
   - Graceful degradation for offline scenarios

5. SECURITY AND VALIDATION:
   - Validate audio file integrity
   - Add virus scanning for audio files
   - Implement audio watermarking
   - Add access control and permissions

6. MONITORING AND ANALYTICS:
   - Track audio generation performance
   - Monitor storage usage and costs
   - Add audio quality metrics
   - Implement usage analytics

7. MULTI-LANGUAGE SUPPORT:
   - Add support for multiple languages
   - Implement language detection
   - Add accent and dialect support
   - Support for regional pronunciations

8. VOICE CUSTOMIZATION:
   - Add voice selection options
   - Implement voice cloning
   - Add emotion and tone control
   - Support for custom voice training
*/
