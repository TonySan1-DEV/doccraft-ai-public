/*
role: ai-engineer,
tier: Pro,
file: "modules/agent/services/supabaseStorage.ts",
allowedActions: ["insert", "query", "delete", "upload", "serve"],
theme: "supabase_audio_storage"
*/

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SlideDeck } from './slideGenerator';
import { NarratedSlideDeck } from './scriptGenerator';
import { TTSNarration } from './ttsSyncEngine';

// Environment variable validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock Supabase client if environment variables are not set
let supabase: SupabaseClient;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Missing Supabase credentials in environment variables. Using mock client for development.'
  );
  // Create a mock client that doesn't actually connect to Supabase
  supabase = createClient('https://mock.supabase.co', 'mock-key');
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Export the Supabase client
export { supabase };

// Storage bucket configuration
const NARRATION_BUCKET = 'narrations';
const AUDIO_CONTENT_TYPE = 'audio/mpeg';

// Audio file management interfaces
export interface AudioFileMetadata {
  fileName: string;
  filePath: string;
  fileSize: number;
  duration?: number;
  contentType: string;
  uploadedAt: Date;
  userId: string;
}

export interface SignedUrlResponse {
  signedUrl: string;
  expiresAt: Date;
  fileName: string;
}

// Type definitions for database records
export interface SlideDeckRecord {
  id?: string;
  title: string;
  theme: string;
  slides: any[];
  metadata?: {
    wordCount: number;
    slideCount: number;
    processingTime: number;
    userRole: string;
    tier: string;
  };
  created_at?: string;
  user_id: string;
  tier: string;
}

export interface NarratedSlideDeckRecord {
  id?: string;
  title: string;
  theme: string;
  slides: any[];
  narration_metadata?: {
    tone: string;
    totalNarrationLength: number;
    averageNarrationLength: number;
  };
  analysis?: {
    totalWords: number;
    averageWordsPerSlide: number;
    tone: string;
    hasIntroduction: boolean;
    hasSummary: boolean;
  };
  size_metadata?: {
    totalSlides: number;
    totalNarrationBytes: number;
    estimatedStorageSize: number;
  };
  created_at?: string;
  user_id: string;
  tier: string;
}

export interface TTSNarrationRecord {
  id?: string;
  audio_file_url: string;
  timeline: any[];
  model_used: string;
  audio_metadata?: {
    totalDuration: number;
    slideCount: number;
    averageDurationPerSlide: number;
  };
  analysis?: {
    totalDuration: number;
    slideCount: number;
    averageDurationPerSlide: number;
    speedMultiplier: number;
    hasGaps: boolean;
    totalWords: number;
  };
  voice_settings?: {
    voice: string;
    language: string;
    speed: number;
    pitch: number;
    volume: number;
  };
  created_at?: string;
  user_id: string;
  tier: string;
}

export interface PipelineOutputRecord {
  id?: string;
  slide_deck_id: string;
  narrated_deck_id: string;
  tts_narration_id: string;
  status: 'processing' | 'completed' | 'failed';
  metadata?: {
    totalProcessingTime: number;
    slideCount: number;
    narrationLength: number;
    audioDuration: number;
    userRole: string;
    tier: string;
  };
  user_tier?: string;
  features_used?: string[];
  access_validated?: boolean;
  created_at?: string;
  user_id: string;
}

// =============================================================================
// AUDIO STORAGE FUNCTIONS
// =============================================================================

/**
 * Upload narration audio file to Supabase Storage
 * @param userId - User ID for file organization
 * @param fileName - Name of the audio file
 * @param file - Audio file as Blob or File
 * @param options - Upload options
 * @returns AudioFileMetadata with upload details
 */
export async function uploadNarrationAudio(
  userId: string,
  fileName: string,
  file: File | Blob,
  options: {
    contentType?: string;
    upsert?: boolean;
    cacheControl?: string;
  } = {}
): Promise<AudioFileMetadata> {
  try {
    // Validate inputs
    if (!userId || !fileName || !file) {
      throw new Error('Missing required parameters: userId, fileName, or file');
    }

    // Sanitize fileName for storage
    const sanitizedFileName = sanitizeFileName(fileName);

    // Upload file to Supabase Storage
    const { error } = await supabase.storage
      .from(NARRATION_BUCKET)
      .upload(sanitizedFileName, file, {
        contentType: options.contentType || AUDIO_CONTENT_TYPE,
        upsert: options.upsert || true,
        cacheControl: options.cacheControl || '3600',
      });

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`);
    }

    // Get file metadata
    const { data: fileData } = await supabase.storage
      .from(NARRATION_BUCKET)
      .list(userId, {
        limit: 1,
        offset: 0,
        search: sanitizedFileName,
      });

    const fileInfo = fileData?.[0];
    if (!fileInfo) {
      throw new Error('Failed to retrieve uploaded file metadata');
    }

    return {
      fileName: sanitizedFileName,
      filePath: `${userId}/${sanitizedFileName}`,
      fileSize: fileInfo.metadata?.size || 0,
      contentType: options.contentType || AUDIO_CONTENT_TYPE,
      uploadedAt: new Date(),
      userId,
    };
  } catch (error) {
    console.error('Error uploading narration audio:', error);
    throw error;
  }
}

/**
 * Generate signed URL for accessing narration audio file
 * @param userId - User ID for file organization
 * @param fileName - Name of the audio file
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns SignedUrlResponse with access URL
 */
export async function getNarrationAudioUrl(
  userId: string,
  fileName: string,
  expiresIn: number = 3600
): Promise<SignedUrlResponse> {
  try {
    // Validate inputs
    if (!userId || !fileName) {
      throw new Error('Missing required parameters: userId or fileName');
    }

    const sanitizedFileName = sanitizeFileName(fileName);
    const filePath = `${userId}/${sanitizedFileName}`;

    // Generate signed URL
    const { data, error } = await supabase.storage
      .from(NARRATION_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Supabase signed URL error: ${error.message}`);
    }

    if (!data?.signedUrl) {
      throw new Error('Failed to generate signed URL');
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      signedUrl: data.signedUrl,
      expiresAt,
      fileName: sanitizedFileName,
    };
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}

/**
 * Delete narration audio file from Supabase Storage
 * @param userId - User ID for file organization
 * @param fileName - Name of the audio file to delete
 * @returns Success status
 */
export async function deleteNarrationAudio(
  userId: string,
  fileName: string
): Promise<boolean> {
  try {
    // Validate inputs
    if (!userId || !fileName) {
      throw new Error('Missing required parameters: userId or fileName');
    }

    const sanitizedFileName = sanitizeFileName(fileName);

    // Delete file from Supabase Storage
    const { error } = await supabase.storage
      .from(NARRATION_BUCKET)
      .remove([`${userId}/${sanitizedFileName}`]);

    if (error) {
      throw new Error(`Supabase delete error: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting narration audio:', error);
    throw error;
  }
}

/**
 * List all audio files for a user
 * @param userId - User ID to list files for
 * @returns Array of AudioFileMetadata
 */
export async function listUserAudioFiles(
  userId: string
): Promise<AudioFileMetadata[]> {
  try {
    // Validate inputs
    if (!userId) {
      throw new Error('Missing required parameter: userId');
    }

    // List files in user's directory
    const { data, error } = await supabase.storage
      .from(NARRATION_BUCKET)
      .list(userId);

    if (error) {
      throw new Error(`Supabase list error: ${error.message}`);
    }

    return (data || []).map(file => ({
      fileName: file.name,
      filePath: `${userId}/${file.name}`,
      fileSize: file.metadata?.size || 0,
      contentType: file.metadata?.mimetype || AUDIO_CONTENT_TYPE,
      uploadedAt: new Date(file.updated_at || Date.now()),
      userId,
    }));
  } catch (error) {
    console.error('Error listing user audio files:', error);
    throw error;
  }
}

/**
 * Get public URL for audio file (if bucket is public)
 * @param userId - User ID for file organization
 * @param fileName - Name of the audio file
 * @returns Public URL string
 */
export function getNarrationPublicUrl(
  userId: string,
  fileName: string
): string {
  const sanitizedFileName = sanitizeFileName(fileName);
  return `${supabaseUrl}/storage/v1/object/public/${NARRATION_BUCKET}/${userId}/${sanitizedFileName}`;
}

/**
 * Check if audio file exists in storage
 * @param userId - User ID for file organization
 * @param fileName - Name of the audio file
 * @returns Boolean indicating file existence
 */
export async function audioFileExists(
  userId: string,
  fileName: string
): Promise<boolean> {
  try {
    const sanitizedFileName = sanitizeFileName(fileName);

    const { data, error } = await supabase.storage
      .from(NARRATION_BUCKET)
      .list(userId, {
        limit: 1,
        offset: 0,
        search: sanitizedFileName,
      });

    if (error) {
      console.error('Error checking file existence:', error);
      return false;
    }

    return (data || []).length > 0;
  } catch (error) {
    console.error('Error checking audio file existence:', error);
    return false;
  }
}

/**
 * Get file metadata from Supabase Storage
 * @param userId - User ID for file organization
 * @param fileName - Name of the audio file
 * @returns AudioFileMetadata or null if not found
 */
export async function getAudioFileMetadata(
  userId: string,
  fileName: string
): Promise<AudioFileMetadata | null> {
  try {
    const sanitizedFileName = sanitizeFileName(fileName);
    const filePath = `${userId}/${sanitizedFileName}`;

    const { data, error } = await supabase.storage
      .from(NARRATION_BUCKET)
      .list(userId, {
        limit: 1,
        offset: 0,
        search: sanitizedFileName,
      });

    if (error || !data || data.length === 0) {
      return null;
    }

    const fileInfo = data[0];
    return {
      fileName: sanitizedFileName,
      filePath,
      fileSize: fileInfo.metadata?.size || 0,
      contentType: fileInfo.metadata?.mimetype || AUDIO_CONTENT_TYPE,
      uploadedAt: new Date(fileInfo.updated_at || Date.now()),
      userId,
    };
  } catch (error) {
    console.error('Error getting audio file metadata:', error);
    return null;
  }
}

// =============================================================================
// UTILITY FUNCTIONS FOR AUDIO STORAGE
// =============================================================================

/**
 * Sanitize filename for safe storage
 * @param fileName - Original filename
 * @returns Sanitized filename
 */
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .toLowerCase(); // Convert to lowercase
}

/**
 * Generate unique filename for audio file
 * @param baseName - Base name for the file
 * @param extension - File extension (default: .mp3)
 * @returns Unique filename with timestamp
 */
export function generateAudioFileName(
  baseName: string,
  extension: string = '.mp3'
): string {
  const timestamp = Date.now();
  const sanitizedBaseName = sanitizeFileName(baseName);
  return `${sanitizedBaseName}_${timestamp}${extension}`;
}

/**
 * Validate audio file before upload
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 50MB)
 * @returns Validation result
 */
export function validateAudioFile(
  file: File | Blob,
  maxSizeMB: number = 50
): { isValid: boolean; error?: string } {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  // Check file type
  if (file instanceof File) {
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Only audio files are allowed.',
      };
    }
  }

  return { isValid: true };
}

/**
 * Create storage bucket if it doesn't exist
 * This should be called during app initialization
 */
export async function ensureNarrationBucketExists(): Promise<void> {
  try {
    // Check if bucket exists by trying to list files
    const { error } = await supabase.storage
      .from(NARRATION_BUCKET)
      .list('', { limit: 1 });

    if (error && error.message.includes('bucket')) {
      console.warn(
        `Storage bucket '${NARRATION_BUCKET}' does not exist. Please create it manually in Supabase dashboard or run the SQL command:`
      );
      console.warn(
        `INSERT INTO storage.buckets (id, name, public) VALUES ('${NARRATION_BUCKET}', '${NARRATION_BUCKET}', false) ON CONFLICT DO NOTHING;`
      );
    }
  } catch (error) {
    console.error('Error checking narration bucket:', error);
  }
}

// =============================================================================
// ENHANCED TTS NARRATION STORAGE WITH AUDIO FILE INTEGRATION
// =============================================================================

/**
 * Store TTS narration with audio file upload
 * @param tts - TTS narration object
 * @param userId - User ID
 * @param tier - User tier
 * @param audioFile - Audio file to upload
 * @returns TTSNarrationRecord with uploaded file URL
 */
export async function storeTTSNarrationWithAudio(
  tts: TTSNarration,
  userId: string,
  tier: string = 'Pro',
  audioFile: File | Blob
): Promise<TTSNarrationRecord> {
  try {
    validateTTSNarration(tts);

    // Validate audio file
    const validation = validateAudioFile(audioFile);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Generate unique filename
    const fileName = generateAudioFileName(tts.title || 'narration');

    // Upload audio file
    await uploadNarrationAudio(userId, fileName, audioFile);

    // Generate signed URL for immediate access
    const signedUrlResponse = await getNarrationAudioUrl(userId, fileName);

    // Create TTS narration record with uploaded file URL
    const enhancedTts: TTSNarration = {
      ...tts,
      audioFileUrl: signedUrlResponse.signedUrl,
    };

    // Store in database
    const record = await storeTTSNarration(enhancedTts, userId, tier);

    return record;
  } catch (error) {
    console.error('Error storing TTS narration with audio:', error);
    throw error;
  }
}

// =============================================================================
// EXISTING DATABASE FUNCTIONS (UNCHANGED)
// =============================================================================

// Utility functions for data validation and transformation
function validateSlideDeck(deck: SlideDeck): void {
  if (!deck.title || !deck.slides || !Array.isArray(deck.slides)) {
    throw new Error('Invalid SlideDeck: missing required fields');
  }
  if (deck.slides.length === 0) {
    throw new Error('Invalid SlideDeck: must contain at least one slide');
  }
}

function validateNarratedSlideDeck(deck: NarratedSlideDeck): void {
  if (!deck.title || !deck.slides || !Array.isArray(deck.slides)) {
    throw new Error('Invalid NarratedSlideDeck: missing required fields');
  }
  if (deck.slides.length === 0) {
    throw new Error(
      'Invalid NarratedSlideDeck: must contain at least one slide'
    );
  }
  deck.slides.forEach((slide: any, index) => {
    if (!slide.narration) {
      throw new Error(
        `Invalid NarratedSlideDeck: slide ${index} missing narration`
      );
    }
  });
}

function validateTTSNarration(tts: TTSNarration): void {
  if (!tts.audioFileUrl || !tts.timeline || !Array.isArray(tts.timeline)) {
    throw new Error('Invalid TTSNarration: missing required fields');
  }
  if (tts.timeline.length === 0) {
    throw new Error(
      'Invalid TTSNarration: must contain at least one timeline entry'
    );
  }
}

function sanitizeUserData(data: any): any {
  // Remove potentially sensitive information before storage
  const sanitized = { ...data };
  delete sanitized.apiKeys;
  delete sanitized.passwords;
  delete sanitized.tokens;
  return sanitized;
}

// Tier validation for feature access
export function validateTierAccess(tier: string, feature: string): boolean {
  const tierFeatures = {
    Free: ['slide_generation'],
    Basic: ['slide_generation', 'narration_generation'],
    Pro: ['slide_generation', 'narration_generation', 'tts_generation'],
  };
  return (
    tierFeatures[tier as keyof typeof tierFeatures]?.includes(feature) || false
  );
}

// Storage functions for SlideDeck
export async function storeSlideDeck(
  deck: SlideDeck,
  userId: string,
  tier: string = 'Pro'
): Promise<SlideDeckRecord> {
  try {
    validateSlideDeck(deck);

    const record: SlideDeckRecord = {
      title: deck.title,
      theme: deck.theme || 'default',
      slides: sanitizeUserData(deck.slides),
      metadata: {
        wordCount: deck.slides.reduce(
          (acc, slide) =>
            acc + (slide.bullets?.join(' ') || '').split(' ').length,
          0
        ),
        slideCount: deck.slides.length,
        processingTime: Date.now(),
        userRole: 'ai-engineer',
        tier,
      },
      created_at: new Date().toISOString(),
      user_id: userId,
      tier,
    };

    const { data, error } = await supabase
      .from('slide_decks')
      .insert(record)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to store SlideDeck: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error storing SlideDeck:', error);
    throw error;
  }
}

export async function getSlideDeck(
  id: string
): Promise<SlideDeckRecord | null> {
  try {
    const { data, error } = await supabase
      .from('slide_decks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to retrieve SlideDeck: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error retrieving SlideDeck:', error);
    throw error;
  }
}

export async function getSlideDecks(
  userId: string
): Promise<SlideDeckRecord[]> {
  try {
    const { data, error } = await supabase
      .from('slide_decks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to retrieve SlideDecks: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error retrieving SlideDecks:', error);
    throw error;
  }
}

// Storage functions for NarratedSlideDeck
export async function storeNarratedDeck(
  deck: NarratedSlideDeck,
  userId: string,
  tier: string = 'Pro'
): Promise<NarratedSlideDeckRecord> {
  try {
    validateNarratedSlideDeck(deck);

    const totalNarrationLength = deck.slides.reduce(
      (acc, slide: any) => acc + slide.narration.length,
      0
    );
    const averageNarrationLength = deck.slides.length > 0 ? totalNarrationLength / deck.slides.length : 0;
    const totalWords = deck.slides.reduce(
      (acc, slide: any) => acc + slide.narration.split(' ').length,
      0
    );

    const record: NarratedSlideDeckRecord = {
      title: deck.title,
      theme: deck.theme || 'default',
      slides: sanitizeUserData(deck.slides),
      narration_metadata: {
        tone: 'conversational', // Default, can be enhanced
        totalNarrationLength,
        averageNarrationLength,
      },
      analysis: {
        totalWords,
        averageWordsPerSlide: deck.slides.length > 0 ? totalWords / deck.slides.length : 0,
        tone: 'conversational',
        hasIntroduction: deck.slides.some(slide =>
          slide.title.toLowerCase().includes('introduction')
        ),
        hasSummary: deck.slides.some(slide =>
          slide.title.toLowerCase().includes('summary')
        ),
      },
      size_metadata: {
        totalSlides: deck.slides.length,
        totalNarrationBytes: JSON.stringify(deck.slides).length,
        estimatedStorageSize: JSON.stringify(deck).length,
      },
      created_at: new Date().toISOString(),
      user_id: userId,
      tier,
    };

    const { data, error } = await supabase
      .from('narrated_decks')
      .insert(record)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to store NarratedSlideDeck: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error storing NarratedSlideDeck:', error);
    throw error;
  }
}

export async function getNarratedDeck(
  id: string
): Promise<NarratedSlideDeckRecord | null> {
  try {
    const { data, error } = await supabase
      .from('narrated_decks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to retrieve NarratedSlideDeck: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error retrieving NarratedSlideDeck:', error);
    throw error;
  }
}

export async function getNarratedDecks(
  userId: string
): Promise<NarratedSlideDeckRecord[]> {
  try {
    const { data, error } = await supabase
      .from('narrated_decks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(
        `Failed to retrieve NarratedSlideDecks: ${error.message}`
      );
    }

    return data || [];
  } catch (error) {
    console.error('Error retrieving NarratedSlideDecks:', error);
    throw error;
  }
}

// Storage functions for TTSNarration
export async function storeTTSNarration(
  tts: TTSNarration,
  userId: string,
  tier: string = 'Pro'
): Promise<TTSNarrationRecord> {
  try {
    validateTTSNarration(tts);

    const totalDuration = tts.timeline[tts.timeline.length - 1]?.endTime || 0;
    const totalDurationPerSlide = tts.timeline.reduce(
      (acc, entry) => acc + (entry.endTime - entry.startTime),
      0
    );
    const averageDurationPerSlide = tts.timeline.length > 0 ? totalDurationPerSlide / tts.timeline.length : 0;
    const totalWords = tts.timeline.reduce(
      (acc, entry) => acc + entry.narration.split(' ').length,
      0
    );

    const record: TTSNarrationRecord = {
      audio_file_url: tts.audioFileUrl || '',
      timeline: sanitizeUserData(tts.timeline),
      model_used: tts.modelUsed || 'en-US-JennyNeural',
      audio_metadata: {
        totalDuration,
        slideCount: tts.timeline.length,
        averageDurationPerSlide,
      },
      analysis: {
        totalDuration,
        slideCount: tts.timeline.length,
        averageDurationPerSlide,
        speedMultiplier: 1.0, // Default, can be enhanced
        hasGaps: tts.timeline.some(
          (entry, index) =>
            index > 0 && entry.startTime !== tts.timeline[index - 1].endTime
        ),
        totalWords,
      },
      voice_settings: {
        voice: 'en-US-JennyNeural', // Default
        language: 'en',
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0,
      },
      created_at: new Date().toISOString(),
      user_id: userId,
      tier,
    };

    const { data, error } = await supabase
      .from('tts_narrations')
      .insert(record)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to store TTSNarration: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error storing TTSNarration:', error);
    throw error;
  }
}

export async function getTTSNarration(
  id: string
): Promise<TTSNarrationRecord | null> {
  try {
    const { data, error } = await supabase
      .from('tts_narrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to retrieve TTSNarration: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error retrieving TTSNarration:', error);
    throw error;
  }
}

export async function getTTSNarrations(
  userId: string
): Promise<TTSNarrationRecord[]> {
  try {
    const { data, error } = await supabase
      .from('tts_narrations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to retrieve TTSNarrations: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error retrieving TTSNarrations:', error);
    throw error;
  }
}

// Pipeline integration storage
export async function storePipelineOutput(
  slideDeckId: string,
  narratedDeckId: string,
  ttsNarrationId: string,
  userId: string,
  tier: string = 'Pro',
  metadata?: any
): Promise<PipelineOutputRecord> {
  try {
    // Validate tier access for full pipeline
    const pipelineFeatures = [
      'slide_generation',
      'narration_generation',
      'tts_generation',
    ];
    const hasAccess = pipelineFeatures.every(feature =>
      validateTierAccess(tier, feature)
    );

    if (!hasAccess) {
      throw new Error(
        `Access denied: Full pipeline requires Pro tier. Current tier: ${tier}`
      );
    }

    const record: PipelineOutputRecord = {
      slide_deck_id: slideDeckId,
      narrated_deck_id: narratedDeckId,
      tts_narration_id: ttsNarrationId,
      status: 'completed',
      metadata: metadata || {
        totalProcessingTime: Date.now(),
        slideCount: 0,
        narrationLength: 0,
        audioDuration: 0,
        userRole: 'ai-engineer',
        tier,
      },
      user_tier: tier,
      features_used: pipelineFeatures,
      access_validated: hasAccess,
      created_at: new Date().toISOString(),
      user_id: userId,
    };

    const { data, error } = await supabase
      .from('pipeline_outputs')
      .insert(record)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to store PipelineOutput: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error storing PipelineOutput:', error);
    throw error;
  }
}

export async function getPipelineOutput(
  id: string
): Promise<PipelineOutputRecord | null> {
  try {
    const { data, error } = await supabase
      .from('pipeline_outputs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to retrieve PipelineOutput: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error retrieving PipelineOutput:', error);
    throw error;
  }
}

export async function getPipelineOutputs(
  userId: string
): Promise<PipelineOutputRecord[]> {
  try {
    const { data, error } = await supabase
      .from('pipeline_outputs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to retrieve PipelineOutputs: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error retrieving PipelineOutputs:', error);
    throw error;
  }
}

// Delete functions for cleanup
export async function deleteSlideDeck(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('slide_decks').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete SlideDeck: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting SlideDeck:', error);
    throw error;
  }
}

export async function deleteNarratedDeck(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('narrated_decks')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete NarratedSlideDeck: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting NarratedSlideDeck:', error);
    throw error;
  }
}

export async function deleteTTSNarration(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tts_narrations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete TTSNarration: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting TTSNarration:', error);
    throw error;
  }
}

export async function deletePipelineOutput(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('pipeline_outputs')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete PipelineOutput: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting PipelineOutput:', error);
    throw error;
  }
}

// Batch operations for efficiency
export async function storeCompletePipeline(
  slideDeck: SlideDeck,
  narratedDeck: NarratedSlideDeck,
  ttsNarration: TTSNarration,
  userId: string,
  tier: string = 'Pro'
): Promise<{
  slideDeck: SlideDeckRecord;
  narratedDeck: NarratedSlideDeckRecord;
  ttsNarration: TTSNarrationRecord;
  pipelineOutput: PipelineOutputRecord;
}> {
  try {
    // Store all components
    const [storedSlideDeck, storedNarratedDeck, storedTTSNarration] =
      await Promise.all([
        storeSlideDeck(slideDeck, userId, tier),
        storeNarratedDeck(narratedDeck, userId, tier),
        storeTTSNarration(ttsNarration, userId, tier),
      ]);

    // Store pipeline output
    const pipelineOutput = await storePipelineOutput(
      storedSlideDeck.id!,
      storedNarratedDeck.id!,
      storedTTSNarration.id!,
      userId,
      tier
    );

    return {
      slideDeck: storedSlideDeck,
      narratedDeck: storedNarratedDeck,
      ttsNarration: storedTTSNarration,
      pipelineOutput,
    };
  } catch (error) {
    console.error('Error storing complete pipeline:', error);
    throw error;
  }
}

// Health check function
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('slide_decks')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase connection check failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Supabase connection check error:', error);
    return false;
  }
}

// =============================================================================
// TODO: Future enhancements
// =============================================================================

/*
TODO: Future Enhancements

1. AUDIO STORAGE ENHANCEMENTS:
   - Replace Blob stub with real TTS audio file from OpenAI / ElevenLabs
   - Add cleanup: delete old files when narration is regenerated
   - Add quota limits per user (via Supabase policies)
   - Implement audio file compression for storage optimization

2. SECURITY ENHANCEMENTS:
   - Add Row-Level Security policies for storage bucket
   - Implement file access logging and audit trails
   - Add virus scanning for uploaded audio files
   - Implement file encryption for sensitive content

3. PERFORMANCE OPTIMIZATIONS:
   - Add CDN integration for global audio file delivery
   - Implement audio file caching strategies
   - Add progressive audio loading for large files
   - Optimize file formats for different use cases

4. ANALYTICS AND MONITORING:
   - Track audio file usage and bandwidth consumption
   - Monitor storage costs and optimize usage
   - Add performance metrics for audio delivery
   - Implement usage alerts and quotas

5. INTEGRATION ENHANCEMENTS:
   - Add support for multiple audio formats (MP3, WAV, OGG)
   - Implement audio streaming for real-time playback
   - Add audio file metadata extraction and storage
   - Support for audio file editing and manipulation

6. USER EXPERIENCE:
   - Add audio file preview functionality
   - Implement audio file sharing and collaboration
   - Add audio file versioning and history
   - Support for audio file comments and annotations

7. SCALABILITY FEATURES:
   - Implement audio file archiving for old content
   - Add automatic backup and recovery procedures
   - Support for multi-region audio file storage
   - Add load balancing for audio file delivery

8. API INTEGRATION:
   - Add webhook support for audio file events
   - Implement real-time audio file processing
   - Add API rate limiting for audio operations
   - Support for third-party audio service integration
*/
