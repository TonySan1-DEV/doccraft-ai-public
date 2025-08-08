// MCP Context Block
/*
{
  file: "pipelineTypes.ts",
  role: "typescript-developer",
  allowedActions: ["define", "type", "interface"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "pipeline_types"
}
*/

/**
 * Pipeline execution modes
 * 
 * @description Controls how the pipeline processes content
 * - auto: Fully automated processing with all features
 * - hybrid: Semi-automated with user-selected features
 * - manual: User-controlled processing with manual steps
 */
export type PipelineMode = 'auto' | 'hybrid' | 'manual';

/**
 * Available pipeline features
 * 
 * @description Individual processing capabilities that can be enabled/disabled
 * - script: Generate narration scripts for slides
 * - slides: Create presentation slides from document
 * - voiceover: Generate TTS narration audio
 */
export type PipelineFeature = 'script' | 'slides' | 'voiceover';

/**
 * Genre context for pipeline processing
 * 
 * @description Provides detailed genre information to influence content generation
 * 
 * @example
 * ```typescript
 * const genreContext: GenreContext = {
 *   category: 'fiction',
 *   subgenre: 'fantasy',
 *   targetAudience: ['young-adult', 'adult']
 * };
 * ```
 */
export interface GenreContext {
  /** Primary genre category */
  category: 'fiction' | 'nonfiction' | 'special';
  
  /** Specific subgenre within the category */
  subgenre?: string;
  
  /** Target audience demographics */
  targetAudience?: string[];
}

/**
 * MCP metadata for pipeline operations
 * 
 * @description Contains role and tier information for MCP compliance
 * 
 * @example
 * ```typescript
 * const mcpMetadata: MCPMetadata = {
 *   role: 'content-creator',
 *   tier: 'Pro',
 *   theme: 'document-processing'
 * };
 * ```
 */
export interface MCPMetadata {
  /** User role for access control */
  role: string;
  
  /** User tier for feature access */
  tier: string;
  
  /** Processing theme for context */
  theme: string;
}

/**
 * Pipeline input options
 * 
 * @description Configuration options for pipeline execution
 * 
 * @example
 * ```typescript
 * const pipelineInput: PipelineInput = {
 *   documentText: 'Your document content here...',
 *   mode: 'auto',
 *   features: ['slides', 'script'],
 *   userId: 'user-123',
 *   tier: 'Pro',
 *   genre: 'fantasy',
 *   genreContext: {
 *     category: 'fiction',
 *     subgenre: 'epic-fantasy',
 *     targetAudience: ['adult']
 *   },
 *   mcpMetadata: {
 *     role: 'content-creator',
 *     tier: 'Pro',
 *     theme: 'document-processing'
 *   }
 * };
 * ```
 */
export interface PipelineInput {
  /** Document text to process */
  documentText: string;
  
  /** Pipeline execution mode */
  mode: PipelineMode;
  
  /** Specific features to enable */
  features?: PipelineFeature[];
  
  /** User ID for tracking and permissions */
  userId?: string;
  
  /** User tier for feature access control */
  tier?: string;
  
  /** Primary genre for content generation */
  genre?: string;
  
  /** Detailed genre context for enhanced processing */
  genreContext?: GenreContext;
  
  /** MCP compliance metadata */
  mcpMetadata?: MCPMetadata;
}

/**
 * Pipeline options for service functions
 * 
 * @description Simplified options interface for individual pipeline services
 * 
 * @example
 * ```typescript
 * const options: PipelineOptions = {
 *   features: ['slides', 'script'],
 *   userId: 'user-123',
 *   tier: 'Pro',
 *   genre: 'mystery',
 *   genreContext: {
 *     category: 'fiction',
 *     subgenre: 'detective',
 *     targetAudience: ['adult']
 *   }
 * };
 * ```
 */
export interface PipelineOptions {
  /** Specific features to enable */
  features?: PipelineFeature[];
  
  /** User ID for tracking and permissions */
  userId?: string;
  
  /** User tier for feature access control */
  tier?: string;
  
  /** Document text to process */
  documentText?: string;
  
  /** Primary genre for content generation */
  genre?: string;
  
  /** Detailed genre context for enhanced processing */
  genreContext?: GenreContext;
  
  /** MCP compliance metadata */
  mcpMetadata?: MCPMetadata;
}

/**
 * Pipeline execution result
 * 
 * @description Contains all outputs and metadata from pipeline execution
 * 
 * @example
 * ```typescript
 * const result: PipelineResult = {
 *   success: true,
 *   outputs: {
 *     slides: slideDeck,
 *     narratedDeck: narratedDeck,
 *     tts: ttsNarration
 *   },
 *   storedRecords: {
 *     slideDeck: slideDeckRecord,
 *     narratedDeck: narratedDeckRecord,
 *     ttsNarration: ttsNarrationRecord
 *   },
 *   errors: [],
 *   processingTime: 15000,
 *   mode: 'auto',
 *   features: ['slides', 'script', 'voiceover']
 * };
 * ```
 */
export interface PipelineResult {
  /** Whether the pipeline completed successfully */
  success: boolean;
  
  /** Generated content outputs */
  outputs: {
    slides?: any; // SlideDeck type
    narratedDeck?: any; // NarratedSlideDeck type
    tts?: any; // TTSNarration type
  };
  
  /** Database records for stored content */
  storedRecords?: {
    slideDeck?: any; // SlideDeckRecord type
    narratedDeck?: any; // NarratedSlideDeckRecord type
    ttsNarration?: any; // TTSNarrationRecord type
  };
  
  /** Error messages if any occurred */
  errors: string[];
  
  /** Total processing time in milliseconds */
  processingTime: number;
  
  /** Pipeline mode that was used */
  mode: PipelineMode;
  
  /** Features that were processed */
  features: PipelineFeature[];
}

/**
 * Pipeline status tracking
 * 
 * @description Real-time status information for pipeline execution
 * 
 * @example
 * ```typescript
 * const status: PipelineStatus = {
 *   id: 'pipeline-123',
 *   status: 'processing',
 *   currentStep: 'generating_slides',
 *   progress: 45,
 *   errors: [],
 *   startTime: new Date(),
 *   endTime: undefined
 * };
 * ```
 */
export interface PipelineStatus {
  /** Unique pipeline identifier */
  id: string;
  
  /** Current pipeline status */
  status: 'processing' | 'completed' | 'failed' | 'paused';
  
  /** Current processing step */
  currentStep: string;
  
  /** Progress percentage (0-100) */
  progress: number;
  
  /** Error messages if any */
  errors: string[];
  
  /** Pipeline start timestamp */
  startTime: Date;
  
  /** Pipeline completion timestamp */
  endTime?: Date;
  
  /** Pipeline pause timestamp */
  pausedAt?: Date;
  
  /** Reason for pause if applicable */
  pauseReason?: string;
}

/**
 * Pipeline metrics for analytics
 * 
 * @description Aggregated statistics for pipeline performance monitoring
 * 
 * @example
 * ```typescript
 * const metrics: PipelineMetrics = {
 *   totalExecutions: 150,
 *   successfulExecutions: 142,
 *   failedExecutions: 8,
 *   averageProcessingTime: 12500,
 *   modeDistribution: {
 *     auto: 80,
 *     hybrid: 45,
 *     manual: 25
 *   },
 *   featureUsage: {
 *     slides: 150,
 *     script: 120,
 *     voiceover: 95
 *   }
 * };
 * ```
 */
export interface PipelineMetrics {
  /** Total number of pipeline executions */
  totalExecutions: number;
  
  /** Number of successful executions */
  successfulExecutions: number;
  
  /** Number of failed executions */
  failedExecutions: number;
  
  /** Average processing time in milliseconds */
  averageProcessingTime: number;
  
  /** Distribution of pipeline modes used */
  modeDistribution: Record<PipelineMode, number>;
  
  /** Usage statistics for each feature */
  featureUsage: Record<PipelineFeature, number>;
}

// Validation utilities
/**
 * Validates pipeline input parameters
 * 
 * @param input - Pipeline input to validate
 * @returns Validation result with errors if any
 * 
 * @example
 * ```typescript
 * const validation = validatePipelineInput({
 *   documentText: 'Sample content',
 *   mode: 'auto',
 *   userId: 'user-123'
 * });
 * 
 * if (!validation.isValid) {
 *   console.error('Validation errors:', validation.errors);
 * }
 * ```
 */
export function validatePipelineInput(input: PipelineInput): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input.documentText || input.documentText.trim().length < 10) {
    errors.push('Document text must be at least 10 characters long');
  }

  if (!input.mode || !['auto', 'hybrid', 'manual'].includes(input.mode)) {
    errors.push('Invalid pipeline mode');
  }

  if (input.features && !Array.isArray(input.features)) {
    errors.push('Features must be an array');
  }

  if (input.genreContext) {
    if (!['fiction', 'nonfiction', 'special'].includes(input.genreContext.category)) {
      errors.push('Invalid genre category');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates pipeline options
 * 
 * @param options - Pipeline options to validate
 * @returns Validation result with errors if any
 */
export function validatePipelineOptions(options: PipelineOptions): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (options.features && !Array.isArray(options.features)) {
    errors.push('Features must be an array');
  }

  if (options.tier && !['Free', 'Basic', 'Pro'].includes(options.tier)) {
    errors.push('Invalid tier specified');
  }

  if (options.genreContext) {
    if (!['fiction', 'nonfiction', 'special'].includes(options.genreContext.category)) {
      errors.push('Invalid genre category');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
