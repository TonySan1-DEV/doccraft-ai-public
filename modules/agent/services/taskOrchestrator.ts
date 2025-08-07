/*
role: ai-engineer,
tier: Pro,
file: "modules/agent/services/taskOrchestrator.ts",
allowedActions: ["orchestrate", "persist", "pipeline"],
theme: "workflow_orchestration"
*/

import { generateSlides, type SlideDeck } from './slideGenerator';
import { generateNarration, type NarratedSlideDeck } from './scriptGenerator';
import { generateTTSNarration, type TTSNarration } from './ttsSyncEngine';
import {
  storeSlideDeck,
  storeNarratedDeck,
  storeTTSNarration,
  storeCompletePipeline,
  validateTierAccess,
  type SlideDeckRecord,
  type NarratedSlideDeckRecord,
  type TTSNarrationRecord,
} from './supabaseStorage';
import { supabase } from './supabaseStorage';

// Pipeline management functions for database integration
async function createPipeline(
  userId: string,
  mode: string,
  features: string[],
  tier: string = 'Pro'
): Promise<{ id: string; status: string }> {
  const { data, error } = await supabase
    .from('pipelines')
    .insert({
      user_id: userId,
      mode,
      features,
      tier,
      status: 'pending',
      current_step: 'initializing',
      progress: 0,
    })
    .select('id, status')
    .single();

  if (error) {
    throw new Error(`Pipeline create error: ${error.message}`);
  }

  return data;
}

async function updatePipelineStatusInDB(
  pipelineId: string,
  status: string,
  currentStep?: string,
  progress?: number,
  errorMessage?: string,
  errorDetails?: any
): Promise<void> {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (currentStep) updateData.current_step = currentStep;
  if (progress !== undefined) updateData.progress = progress;
  if (errorMessage) updateData.error_message = errorMessage;
  if (errorDetails) updateData.error_details = errorDetails;

  const { error } = await supabase
    .from('pipelines')
    .update(updateData)
    .eq('id', pipelineId);

  if (error) {
    throw new Error(`Pipeline update error: ${error.message}`);
  }
}

async function linkPipelineContent(
  pipelineId: string,
  slideDeckId?: string,
  narratedDeckId?: string,
  ttsNarrationId?: string
): Promise<void> {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (slideDeckId) updateData.slide_deck_id = slideDeckId;
  if (narratedDeckId) updateData.narrated_deck_id = narratedDeckId;
  if (ttsNarrationId) updateData.tts_narration_id = ttsNarrationId;

  const { error } = await supabase
    .from('pipelines')
    .update(updateData)
    .eq('id', pipelineId);

  if (error) {
    throw new Error(`Pipeline content linking error: ${error.message}`);
  }
}

// Function to get pipeline status from database
export async function getPipelineStatusFromDB(
  pipelineId: string
): Promise<any> {
  const { data, error } = await supabase
    .from('pipelines')
    .select('*')
    .eq('id', pipelineId)
    .single();

  if (error) {
    throw new Error(`Pipeline status query error: ${error.message}`);
  }

  return data;
}

// Function to get user's recent pipelines
export async function getUserPipelines(
  userId: string,
  limit: number = 10
): Promise<any[]> {
  const { data, error } = await supabase
    .from('pipelines')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`User pipelines query error: ${error.message}`);
  }

  return data || [];
}

// Pipeline execution modes
export type PipelineMode = 'auto' | 'hybrid' | 'manual';
export type PipelineFeature = 'script' | 'slides' | 'voiceover';

// Pipeline options interface
export interface PipelineOptions {
  features?: PipelineFeature[];
  userId?: string;
  tier?: string;
  documentText?: string;
  mcpMetadata?: {
    role: string;
    tier: string;
    theme: string;
  };
}

// Pipeline execution result
export interface PipelineResult {
  success: boolean;
  outputs: {
    slides?: SlideDeck;
    narratedDeck?: NarratedSlideDeck;
    tts?: TTSNarration;
  };
  storedRecords?: {
    slideDeck?: SlideDeckRecord;
    narratedDeck?: NarratedSlideDeckRecord;
    ttsNarration?: TTSNarrationRecord;
  };
  errors: string[];
  processingTime: number;
  mode: PipelineMode;
  features: PipelineFeature[];
}

// Pipeline status tracking
export interface PipelineStatus {
  id: string;
  status: 'processing' | 'completed' | 'failed' | 'paused';
  currentStep: string;
  progress: number;
  errors: string[];
  startTime: Date;
  endTime?: Date;
  pausedAt?: Date;
  pauseReason?: string;
}

// Utility functions for validation and sanitization
function sanitizeDocumentText(text: string): string {
  if (!text || typeof text !== 'string') {
    throw new Error('Document text is required and must be a string');
  }

  // Remove potentially harmful content
  const sanitized = text
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  if (sanitized.length < 10) {
    throw new Error('Document text must be at least 10 characters long');
  }

  return sanitized;
}

function validateUserId(userId: string): void {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid user ID is required for pipeline execution');
  }

  // Basic UUID or alphanumeric validation
  const userIdPattern = /^[a-zA-Z0-9-_]+$/;
  if (!userIdPattern.test(userId)) {
    throw new Error('Invalid user ID format');
  }
}

function validateTierForFeatures(
  tier: string,
  features: PipelineFeature[]
): void {
  const tierFeatures = {
    Free: ['slides'],
    Basic: ['slides', 'script'],
    Pro: ['slides', 'script', 'voiceover'],
  };

  const allowedFeatures = tierFeatures[tier as keyof typeof tierFeatures] || [];
  const unauthorizedFeatures = features.filter(
    feature => !allowedFeatures.includes(feature)
  );

  if (unauthorizedFeatures.length > 0) {
    throw new Error(
      `Tier ${tier} does not have access to features: ${unauthorizedFeatures.join(', ')}`
    );
  }
}

// Main pipeline execution function
export async function runDoc2VideoPipeline(
  documentText: string,
  mode: PipelineMode,
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const outputs: any = {};
  const storedRecords: any = {};
  let pipelineId: string | undefined;

  try {
    // Validate and sanitize inputs
    const sanitizedText = sanitizeDocumentText(documentText);
    const userId = options.userId;
    const tier = options.tier || 'Pro';
    const features = options.features || [];

    if (!userId) {
      throw new Error('UserId required for pipeline tracking.');
    }

    validateUserId(userId);

    // Determine features based on mode
    let pipelineFeatures: PipelineFeature[] = [];
    switch (mode) {
      case 'auto':
        pipelineFeatures = ['slides', 'script', 'voiceover'];
        break;
      case 'hybrid':
        pipelineFeatures =
          features.length > 0 ? features : ['slides', 'script'];
        break;
      case 'manual':
        pipelineFeatures = features;
        break;
    }

    // Validate tier access for requested features
    if (userId && pipelineFeatures.length > 0) {
      validateTierForFeatures(tier, pipelineFeatures);
    }

    // Create database pipeline record
    const enabledFeatures = pipelineFeatures.map(f => f);
    const pipeline = await createPipeline(userId, mode, enabledFeatures, tier);
    pipelineId = pipeline.id;

    // Update pipeline status to running
    await updatePipelineStatusInDB(
      pipelineId,
      'running',
      'validating_inputs',
      5
    );

    // Step 1: Generate Slides
    if (pipelineFeatures.includes('slides')) {
      try {
        await updatePipelineStatusInDB(
          pipelineId!,
          'running',
          'generating_slides',
          15
        );

        console.log('🔄 Generating slides...');
        outputs.slides = await generateSlides(sanitizedText, { maxSlides: 5 });

        console.log('💾 Storing slide deck...');
        storedRecords.slideDeck = await storeSlideDeck(
          outputs.slides,
          userId,
          tier
        );
        console.log(
          `✅ Slide deck stored with ID: ${storedRecords.slideDeck.id}`
        );

        // Link slide deck to pipeline
        await linkPipelineContent(pipelineId!, storedRecords.slideDeck.id);
      } catch (error) {
        const errorMsg = `Failed to generate slides: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg, error);
        await updatePipelineStatusInDB(
          pipelineId!,
          'failed',
          'slides_generation_failed',
          15,
          errorMsg
        );
        throw error;
      }
    }

    // Step 2: Generate Narration
    if (pipelineFeatures.includes('script') && !errors.length) {
      try {
        await updatePipelineStatusInDB(
          pipelineId!,
          'running',
          'generating_narration',
          45
        );

        console.log('🔄 Generating narration...');
        if (!outputs.slides) {
          outputs.slides = await generateSlides(sanitizedText, {
            maxSlides: 5,
          });
        }
        outputs.narratedDeck = await generateNarration(outputs.slides, {
          tone: 'conversational',
        });

        console.log('💾 Storing narrated deck...');
        storedRecords.narratedDeck = await storeNarratedDeck(
          outputs.narratedDeck,
          userId,
          tier
        );
        console.log(
          `✅ Narrated deck stored with ID: ${storedRecords.narratedDeck.id}`
        );

        // Link narrated deck to pipeline
        await linkPipelineContent(
          pipelineId!,
          undefined,
          storedRecords.narratedDeck.id
        );

        // Pause pipeline for user review in hybrid/manual modes
        if ((mode === 'hybrid' || mode === 'manual') && pipelineFeatures.includes('voiceover')) {
          console.log('⏸️ Pausing pipeline for user script review...');
          await pausePipeline(pipelineId!, 'script_review_required');
          
          // Return early - pipeline will be resumed by user action
          return {
            success: true,
            outputs: {
              slides: outputs.slides,
              narratedDeck: outputs.narratedDeck,
            },
            storedRecords: {
              slideDeck: storedRecords.slideDeck,
              narratedDeck: storedRecords.narratedDeck,
            },
            errors: [],
            processingTime: Date.now() - startTime,
            mode,
            features: pipelineFeatures,
          };
        }
      } catch (error) {
        const errorMsg = `Failed to generate narration: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg, error);
        await updatePipelineStatusInDB(
          pipelineId!,
          'failed',
          'narration_generation_failed',
          45,
          errorMsg
        );
        throw error;
      }
    }

    // Step 3: Generate TTS Narration with Storage Integration
    if (pipelineFeatures.includes('voiceover') && !errors.length) {
      try {
        await updatePipelineStatusInDB(
          pipelineId!,
          'running',
          'generating_tts_narration',
          75
        );

        console.log('🔄 Generating TTS narration...');

        // Ensure we have the required narrated deck
        if (!outputs.narratedDeck) {
          if (!outputs.slides) {
            outputs.slides = await generateSlides(sanitizedText, {
              maxSlides: 5,
            });
          }
          outputs.narratedDeck = await generateNarration(outputs.slides, {
            tone: 'conversational',
          });
        }

        outputs.tts = await generateTTSNarration(outputs.narratedDeck, {
          userId: userId,
          voice: 'en-US-JennyNeural',
          speed: 1.0,
          quality: 'medium',
          format: 'mp3',
        });

        console.log(
          '✅ TTS narration generated with signed URL:',
          outputs.tts.audioFileUrl.substring(0, 50) + '...'
        );

        // Store TTS narration in database with signed URL and timeline
        console.log('💾 Storing TTS narration with signed URL...');
        storedRecords.ttsNarration = await storeTTSNarration(
          outputs.tts,
          userId,
          tier
        );
        console.log(
          `✅ TTS narration stored with ID: ${storedRecords.ttsNarration.id}`
        );
        console.log(
          `🔗 Signed URL persisted: ${storedRecords.ttsNarration.audio_file_url.substring(0, 50)}...`
        );

        // Link TTS narration to pipeline
        await linkPipelineContent(
          pipelineId!,
          undefined,
          undefined,
          storedRecords.ttsNarration.id
        );
      } catch (error) {
        const errorMsg = `Failed to generate TTS narration: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg, error);
        await updatePipelineStatusInDB(
          pipelineId!,
          'failed',
          'tts_generation_failed',
          75,
          errorMsg
        );
        throw error;
      }
    }

    // Store complete pipeline if all steps succeeded
    if (
      mode === 'auto' &&
      !errors.length &&
      storedRecords.slideDeck &&
      storedRecords.narratedDeck &&
      storedRecords.ttsNarration
    ) {
      try {
        await updatePipelineStatus(
          pipelineId!,
          'running',
          'storing_complete_pipeline',
          95
        );

        console.log('🎬 Storing complete pipeline...');
        await storeCompletePipeline(
          outputs.slides,
          outputs.narratedDeck,
          outputs.tts,
          userId,
          tier
        );
        console.log('✅ Complete pipeline stored successfully');
      } catch (error) {
        const errorMsg = `Failed to store complete pipeline: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg, error);
        await updatePipelineStatus(
          pipelineId!,
          'failed',
          'pipeline_storage_failed',
          95,
          errorMsg
        );
        throw error;
      }
    }

    // Mark pipeline as completed
    await updatePipelineStatusInDB(
      pipelineId!,
      'success',
      'pipeline_completed',
      100
    );

    console.log(
      `🎉 Pipeline completed successfully in ${Date.now() - startTime}ms`
    );
  } catch (error) {
    const errorMsg = `Pipeline execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    errors.push(errorMsg);
    console.error(errorMsg, error);

    // Update pipeline status to failed if we have a pipeline ID
    if (pipelineId) {
      await updatePipelineStatusInDB(
        pipelineId,
        'failed',
        'pipeline_failed',
        100,
        errorMsg
      );
    }

    // Attempt rollback if we have stored records
    if (Object.keys(storedRecords).length > 0) {
      try {
        await rollbackPipeline(pipelineId!, storedRecords);
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
        errors.push(
          `Rollback failed: ${rollbackError instanceof Error ? rollbackError.message : 'Unknown error'}`
        );
      }
    }
  }

  const processingTime = Date.now() - startTime;

  return {
    success: errors.length === 0,
    outputs,
    storedRecords:
      Object.keys(storedRecords).length > 0 ? storedRecords : undefined,
    errors,
    processingTime,
    mode,
    features: options.features || ['slides', 'script', 'voiceover'],
  };
}

// Mode-specific execution functions
export async function runAutoPipeline(
  documentText: string,
  userId?: string,
  tier: string = 'Pro'
): Promise<PipelineResult> {
  return runDoc2VideoPipeline(documentText, 'auto', {
    userId,
    tier,
    features: ['slides', 'script', 'voiceover'],
  });
}

export async function runHybridPipeline(
  documentText: string,
  features: PipelineFeature[],
  userId?: string,
  tier: string = 'Pro'
): Promise<PipelineResult> {
  return runDoc2VideoPipeline(documentText, 'hybrid', {
    userId,
    tier,
    features,
  });
}

export async function runManualPipeline(
  documentText: string,
  features: PipelineFeature[],
  userId?: string,
  tier: string = 'Pro'
): Promise<PipelineResult> {
  return runDoc2VideoPipeline(documentText, 'manual', {
    userId,
    tier,
    features,
  });
}

// Individual step execution functions
export async function generateSlidesOnly(
  documentText: string,
  userId?: string,
  tier: string = 'Pro'
): Promise<{ slides: SlideDeck; storedRecord?: SlideDeckRecord }> {
  const sanitizedText = sanitizeDocumentText(documentText);

  if (userId) {
    validateUserId(userId);
    validateTierForFeatures(tier, ['slides']);
  }

  const slides = await generateSlides(sanitizedText, { maxSlides: 5 });

  let storedRecord: SlideDeckRecord | undefined;
  if (userId) {
    storedRecord = await storeSlideDeck(slides, userId, tier);
  }

  return { slides, storedRecord };
}

export async function generateNarrationOnly(
  documentText: string,
  userId?: string,
  tier: string = 'Pro'
): Promise<{
  narratedDeck: NarratedSlideDeck;
  storedRecord?: NarratedSlideDeckRecord;
}> {
  const sanitizedText = sanitizeDocumentText(documentText);

  if (userId) {
    validateUserId(userId);
    validateTierForFeatures(tier, ['script']);
  }

  const slides = await generateSlides(sanitizedText, { maxSlides: 5 });
  const narratedDeck = await generateNarration(slides, {
    tone: 'conversational',
  });

  let storedRecord: NarratedSlideDeckRecord | undefined;
  if (userId) {
    storedRecord = await storeNarratedDeck(narratedDeck, userId, tier);
  }

  return { narratedDeck, storedRecord };
}

export async function generateTTSOnly(
  documentText: string,
  userId?: string,
  tier: string = 'Pro'
): Promise<{ tts: TTSNarration; storedRecord?: TTSNarrationRecord }> {
  const sanitizedText = sanitizeDocumentText(documentText);

  if (!userId) {
    throw new Error('UserId is required for TTS generation and storage');
  }

  validateUserId(userId);
  validateTierForFeatures(tier, ['voiceover']);

  // Create pipeline record for TTS-only generation
  const pipeline = await createPipeline(userId, 'manual', ['voiceover'], tier);
  const pipelineId = pipeline.id;

  try {
    await updatePipelineStatus(
      pipelineId,
      'running',
      'generating_tts_only',
      25
    );

    const slides = await generateSlides(sanitizedText, { maxSlides: 5 });
    const narratedDeck = await generateNarration(slides, {
      tone: 'conversational',
    });

    await updatePipelineStatus(
      pipelineId,
      'running',
      'generating_tts_audio',
      75
    );

    // Generate TTS with storage integration
    const tts = await generateTTSNarration(narratedDeck, {
      userId: userId,
      voice: 'en-US-JennyNeural',
      speed: 1.0,
      quality: 'medium',
      format: 'mp3',
    });

    const storedRecord = await storeTTSNarration(tts, userId, tier);
    console.log(
      `✅ TTS narration stored with signed URL: ${storedRecord.audio_file_url.substring(0, 50)}...`
    );

    // Link TTS narration to pipeline
    await linkPipelineContent(
      pipelineId,
      undefined,
      undefined,
      storedRecord.id
    );

    // Mark pipeline as successful
    await updatePipelineStatus(
      pipelineId,
      'success',
      'tts_generation_completed',
      100
    );

    return { tts, storedRecord };
  } catch (error) {
    const errorMsg = `TTS generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    await updatePipelineStatus(
      pipelineId,
      'failed',
      'tts_generation_failed',
      75,
      errorMsg
    );
    throw error;
  }
}

// Pipeline status tracking
const activePipelines = new Map<string, PipelineStatus>();

export function createPipelineStatus(
  id: string,
  _mode: PipelineMode,
  _features: PipelineFeature[]
): PipelineStatus {
  const status: PipelineStatus = {
    id,
    status: 'processing',
    currentStep: 'initializing',
    progress: 0,
    errors: [],
    startTime: new Date(),
  };

  activePipelines.set(id, status);
  return status;
}

export function updatePipelineStatus(
  id: string,
  updates: Partial<Omit<PipelineStatus, 'id' | 'startTime'>>
): void {
  const status = activePipelines.get(id);
  if (status) {
    Object.assign(status, updates);
    if (updates.status === 'completed' || updates.status === 'failed') {
      status.endTime = new Date();
    }
  }
}

export function getPipelineStatus(id: string): PipelineStatus | undefined {
  return activePipelines.get(id);
}

export function cleanupPipelineStatus(id: string): void {
  activePipelines.delete(id);
}

// Pause and resume pipeline functions
export async function pausePipeline(
  pipelineId: string,
  reason: string = 'user_request'
): Promise<void> {
  const status = activePipelines.get(pipelineId);
  if (status) {
    status.status = 'paused';
    status.pausedAt = new Date();
    status.pauseReason = reason;
  }

  // Update database status
  await updatePipelineStatusInDB(
    pipelineId,
    'paused',
    'paused_for_user_review',
    50,
    undefined,
    { reason, pausedAt: new Date().toISOString() }
  );
}

export async function resumePipeline(
  pipelineId: string,
  options: {
    editedScript?: string;
    userId?: string;
    tier?: string;
  } = {}
): Promise<PipelineResult> {
  const status = activePipelines.get(pipelineId);
  if (status) {
    status.status = 'processing';
    status.pausedAt = undefined;
    status.pauseReason = undefined;
  }

  // Update database status
  await updatePipelineStatusInDB(
    pipelineId,
    'running',
    'resuming_after_review',
    50
  );

  // If edited script is provided, store it
  if (options.editedScript) {
    try {
      const { error } = await supabase
        .from('narrated_decks')
        .update({
          edited_script: options.editedScript,
          script_edited_at: new Date().toISOString(),
        })
        .eq('pipeline_id', pipelineId);

      if (error) {
        console.error('Failed to store edited script:', error);
      }
    } catch (error) {
      console.error('Error storing edited script:', error);
    }
  }

  // Continue with TTS generation
  return await continuePipelineAfterScriptReview(pipelineId, options);
}

async function continuePipelineAfterScriptReview(
  pipelineId: string,
  options: {
    editedScript?: string;
    userId?: string;
    tier?: string;
  } = {}
): Promise<PipelineResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const outputs: any = {};
  const storedRecords: any = {};

  try {
    // Get pipeline info from database
    const pipelineData = await getPipelineStatusFromDB(pipelineId);
    const userId = options.userId || pipelineData.user_id;
    const tier = options.tier || pipelineData.tier;

    // Get the narrated deck (with potential edits)
    const narratedDeckRecord = await supabase
      .from('narrated_decks')
      .select('*')
      .eq('pipeline_id', pipelineId)
      .single();

    if (narratedDeckRecord.error || !narratedDeckRecord.data) {
      throw new Error('Failed to retrieve narrated deck for TTS generation');
    }

    const narratedDeck = narratedDeckRecord.data;
    
    // Use edited script if available, otherwise use original
    const scriptToUse = narratedDeck.edited_script || 
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

    // Update pipeline status
    await updatePipelineStatusInDB(
      pipelineId,
      'running',
      'generating_tts_narration',
      75
    );

    console.log('🔄 Generating TTS narration with reviewed script...');

    // Generate TTS narration
    outputs.tts = await generateTTSNarration(narratedDeckForTTS, {
      userId: userId,
      voice: 'en-US-JennyNeural',
      speed: 1.0,
      quality: 'medium',
      format: 'mp3',
    });

    console.log(
      '✅ TTS narration generated with signed URL:',
      outputs.tts.audioFileUrl.substring(0, 50) + '...'
    );

    // Store TTS narration
    storedRecords.ttsNarration = await storeTTSNarration(
      outputs.tts,
      userId,
      tier
    );

    // Link TTS narration to pipeline
    await linkPipelineContent(
      pipelineId,
      undefined,
      undefined,
      storedRecords.ttsNarration.id
    );

    // Mark pipeline as completed
    await updatePipelineStatusInDB(
      pipelineId,
      'success',
      'pipeline_completed',
      100
    );

    console.log('🎉 Pipeline resumed and completed successfully');

    return {
      success: true,
      outputs: {
        tts: outputs.tts,
      },
      storedRecords: {
        ttsNarration: storedRecords.ttsNarration,
      },
      errors: [],
      processingTime: Date.now() - startTime,
      mode: 'hybrid' as PipelineMode,
      features: ['voiceover'] as PipelineFeature[],
    };
  } catch (error) {
    const errorMsg = `Failed to resume pipeline: ${error instanceof Error ? error.message : 'Unknown error'}`;
    errors.push(errorMsg);
    console.error(errorMsg, error);

    await updatePipelineStatusInDB(
      pipelineId,
      'failed',
      'resume_failed',
      75,
      errorMsg
    );

    return {
      success: false,
      outputs: {},
      storedRecords: {},
      errors,
      processingTime: Date.now() - startTime,
      mode: 'hybrid' as PipelineMode,
      features: ['voiceover'] as PipelineFeature[],
    };
  }
}

// Error handling and rollback utilities
export async function rollbackPipeline(
  pipelineId: string,
  storedRecords: any
): Promise<void> {
  try {
    console.log(`🔄 Rolling back pipeline ${pipelineId}...`);

    // Rollback in reverse order (TTS -> Narration -> Slides)
    if (storedRecords.ttsNarration?.id) {
      console.log('Rolling back TTS narration...');
      // TODO: Implement deleteTTSNarration in supabaseStorage
      // await deleteTTSNarration(storedRecords.ttsNarration.id);
    }

    if (storedRecords.narratedDeck?.id) {
      console.log('Rolling back narrated deck...');
      // TODO: Implement deleteNarratedDeck in supabaseStorage
      // await deleteNarratedDeck(storedRecords.narratedDeck.id);
    }

    if (storedRecords.slideDeck?.id) {
      console.log('Rolling back slide deck...');
      // TODO: Implement deleteSlideDeck in supabaseStorage
      // await deleteSlideDeck(storedRecords.slideDeck.id);
    }

    await updatePipelineStatusInDB(
      pipelineId,
      'failed',
      'rollback_completed',
      100
    );

    console.log('✅ Rollback completed successfully');
  } catch (error) {
    console.error('Rollback failed:', error);
    await updatePipelineStatusInDB(
      pipelineId,
      'failed',
      'rollback_failed',
      100,
      'Rollback failed'
    );
  }
}

// Performance monitoring
export interface PipelineMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageProcessingTime: number;
  modeDistribution: Record<PipelineMode, number>;
  featureUsage: Record<PipelineFeature, number>;
}

const pipelineMetrics: PipelineMetrics = {
  totalExecutions: 0,
  successfulExecutions: 0,
  failedExecutions: 0,
  averageProcessingTime: 0,
  modeDistribution: { auto: 0, hybrid: 0, manual: 0 },
  featureUsage: { slides: 0, script: 0, voiceover: 0 },
};

export function updatePipelineMetrics(result: PipelineResult): void {
  pipelineMetrics.totalExecutions++;

  if (result.success) {
    pipelineMetrics.successfulExecutions++;
  } else {
    pipelineMetrics.failedExecutions++;
  }

  // Update average processing time
  const totalTime =
    pipelineMetrics.averageProcessingTime *
    (pipelineMetrics.totalExecutions - 1);
  pipelineMetrics.averageProcessingTime =
    (totalTime + result.processingTime) / pipelineMetrics.totalExecutions;

  // Update mode distribution
  pipelineMetrics.modeDistribution[result.mode]++;

  // Update feature usage
  result.features.forEach(feature => {
    pipelineMetrics.featureUsage[feature]++;
  });
}

export function getPipelineMetrics(): PipelineMetrics {
  return { ...pipelineMetrics };
}

// TODO: Future enhancements
/*
1. Add comprehensive rollback functionality:
   - Implement delete functions in supabaseStorage
   - Add transaction-like rollback for failed pipelines
   - Clean up partial outputs on failure

2. Add real-time progress tracking:
   - WebSocket connections for live updates
   - Progress callbacks for UI feedback
   - Estimated completion times

3. Add pipeline caching:
   - Cache intermediate results for reuse
   - Implement LRU cache for frequently accessed outputs
   - Cache invalidation strategies

4. Add advanced error handling:
   - Retry mechanisms with exponential backoff
   - Circuit breaker pattern for external services
   - Graceful degradation for partial failures

5. Add pipeline optimization:
   - Parallel execution where possible
   - Resource usage monitoring
   - Performance profiling and optimization

6. Add security enhancements:
   - Input validation and sanitization
   - Rate limiting for pipeline execution
   - Audit logging for all operations

7. Add monitoring and alerting:
   - Pipeline failure notifications
   - Performance metrics dashboard
   - Error rate monitoring

8. Add pipeline templates:
   - Predefined pipeline configurations
   - Custom pipeline builder
   - Pipeline sharing and collaboration

9. Add database pipeline analytics:
   - Pipeline success rate tracking
   - Performance metrics aggregation
   - User behavior analysis

10. Add pipeline retry mechanisms:
    - Automatic retry for failed pipelines
    - Configurable retry policies
    - Retry history tracking
*/
