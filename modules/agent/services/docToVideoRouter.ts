/**
 * @fileoverview Doc-to-Video Pipeline Router
 * @module modules/agent/services/docToVideoRouter
 *
 * MCP Context Block:
 * - role: "Document to Video Pipeline Orchestrator"
 * - tier: "Premium"
 * - file: "modules/agent/services/docToVideoRouter.ts"
 * - allowedActions: ["parseCommands", "orchestratePipeline", "validateInputs", "handleErrors"]
 * - theme: "Content Transformation"
 */

import { generateSlides } from './slideGenerator';
import { generateNarration, NarratedSlideDeck } from './scriptGenerator';
import { generateTTSNarration } from './ttsSyncEngine';

// Types for pipeline execution
export interface DocToVideoCommand {
  type: 'auto' | 'scriptOnly' | 'slidesOnly' | 'voiceoverOnly';
  documentContent?: string;
  documentPath?: string;
  options?: {
    // Slide generation options
    maxSlides?: number;
    style?: string;
    audience?: string;
    genre?: string;
    genreContext?: {
      category: 'fiction' | 'nonfiction' | 'special';
      subgenre?: string;
      targetAudience?: string[];
    };
    // Narration options
    tone?: 'formal' | 'conversational' | 'persuasive';
    length?: 'short' | 'medium' | 'long';
    language?: string;
    // TTS options
    voice?: string;
    speed?: number;
    quality?: 'low' | 'medium' | 'high';
    format?: 'mp3' | 'wav' | 'ogg';
    // Legacy options for backward compatibility
    slideCount?: number;
    narrationStyle?: 'professional' | 'casual' | 'educational';
    includeImages?: boolean;
    ttsVoice?: string;
  };
}

export interface PipelineResult {
  success: boolean;
  slides?: SlideData[];
  script?: ScriptData;
  narration?: NarrationData;
  error?: string;
  metadata: {
    processingTime: number;
    slideCount: number;
    wordCount: number;
  };
}

export interface SlideData {
  id: string;
  title: string;
  content: string[];
  imagePrompt?: string;
  narration?: string; // Optional - only present for narrated slides
  duration: number;
}

export interface ScriptData {
  slides: SlideData[];
  totalDuration: number;
  wordCount: number;
}

export interface NarrationData {
  audioUrl?: string;
  timeline: Array<{
    slideId: string;
    startTime: number;
    endTime: number;
    text: string;
  }>;
}

/**
 * Main router for doc-to-video pipeline commands
 * Handles command parsing and orchestrates service execution
 */
export class DocToVideoRouter {
  private static instance: DocToVideoRouter;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): DocToVideoRouter {
    if (!DocToVideoRouter.instance) {
      DocToVideoRouter.instance = new DocToVideoRouter();
    }
    return DocToVideoRouter.instance;
  }

  /**
   * Parse and execute doc-to-video commands
   * @param command - Raw command string from user input
   * @param documentContent - Optional document content to process
   * @returns Promise<PipelineResult>
   */
  public async executeCommand(
    command: string,
    documentContent?: string
  ): Promise<PipelineResult> {
    const startTime = Date.now();

    try {
      // Parse command
      const parsedCommand = this.parseCommand(command);

      // Validate inputs
      this.validateCommand(parsedCommand);

      // Execute pipeline based on command type
      const result = await this.executePipeline(parsedCommand, documentContent);

      return {
        ...result,
        metadata: {
          processingTime: Date.now() - startTime,
          slideCount: result.slides?.length || 0,
          wordCount: result.script?.wordCount || 0,
        },
      };
    } catch (error) {
      console.error('Doc-to-Video Pipeline Error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          processingTime: Date.now() - startTime,
          slideCount: 0,
          wordCount: 0,
        },
      };
    }
  }

  /**
   * Parse command string into structured command object
   * @param command - Raw command string
   * @returns DocToVideoCommand
   */
  private parseCommand(command: string): DocToVideoCommand {
    const normalizedCommand = command.toLowerCase().trim();

    // Extract command type
    let type: DocToVideoCommand['type'] = 'auto';

    if (normalizedCommand.includes('scriptonly')) {
      type = 'scriptOnly';
    } else if (normalizedCommand.includes('slidesonly')) {
      type = 'slidesOnly';
    } else if (normalizedCommand.includes('voiceoveronly')) {
      type = 'voiceoverOnly';
    } else if (normalizedCommand.includes('auto')) {
      type = 'auto';
    }

    // Extract options from command
    const options: DocToVideoCommand['options'] = {};

    if (normalizedCommand.includes('professional')) {
      options.narrationStyle = 'professional';
    } else if (normalizedCommand.includes('casual')) {
      options.narrationStyle = 'casual';
    } else if (normalizedCommand.includes('educational')) {
      options.narrationStyle = 'educational';
    }

    // Extract slide count if specified
    const slideMatch = normalizedCommand.match(/(\d+)\s*slides?/);
    if (slideMatch) {
      options.slideCount = parseInt(slideMatch[1]);
    }

    // Extract TTS voice if specified
    const voiceMatch = normalizedCommand.match(/voice[:\s]+(\w+)/);
    if (voiceMatch) {
      options.ttsVoice = voiceMatch[1];
    }

    // Check for image generation
    if (
      normalizedCommand.includes('images') ||
      normalizedCommand.includes('pictures')
    ) {
      options.includeImages = true;
    }

    return {
      type,
      options,
    };
  }

  /**
   * Validate command and inputs
   * @param command - Parsed command object
   */
  private validateCommand(command: DocToVideoCommand): void {
    if (!command.type) {
      throw new Error('Invalid command type');
    }

    // Validate slide count if specified
    if (command.options?.slideCount) {
      if (command.options.slideCount < 1 || command.options.slideCount > 50) {
        throw new Error('Slide count must be between 1 and 50');
      }
    }

    // Validate TTS voice if specified
    if (command.options?.ttsVoice) {
      const validVoices = [
        'en-US-JennyNeural',
        'en-US-GuyNeural',
        'en-GB-RyanNeural',
      ];
      if (!validVoices.includes(command.options.ttsVoice)) {
        throw new Error(
          `Invalid TTS voice. Valid options: ${validVoices.join(', ')}`
        );
      }
    }
  }

  /**
   * Execute the pipeline based on command type
   * @param command - Parsed command object
   * @param documentContent - Document content to process
   * @returns Promise<PipelineResult>
   */
  private async executePipeline(
    command: DocToVideoCommand,
    documentContent?: string
  ): Promise<PipelineResult> {
    const { type, options } = command;

    switch (type) {
      case 'auto':
        return await this.executeFullPipeline(documentContent, options);

      case 'scriptOnly':
        return await this.executeScriptOnly(documentContent, options);

      case 'slidesOnly':
        return await this.executeSlidesOnly(documentContent, options);

      case 'voiceoverOnly':
        return await this.executeVoiceoverOnly(documentContent, options);

      default:
        throw new Error(`Unknown command type: ${type}`);
    }
  }

  /**
   * Execute full pipeline: slides + script + narration
   */
  private async executeFullPipeline(
    documentContent?: string,
    options?: DocToVideoCommand['options']
  ): Promise<PipelineResult> {
    console.log('🚀 Executing full doc-to-video pipeline...');

    // Map options to slide generation parameters
    const slideOptions = {
      maxSlides: options?.maxSlides || options?.slideCount,
      style: options?.style,
      audience: options?.audience,
      genre: options?.genre,
      genreContext: options?.genreContext,
    };

    // Generate slides
    const slideDeck = await generateSlides(documentContent!, slideOptions);

    // Map options to narration parameters
    const narrationOptions = {
      tone:
        options?.tone ||
        (options?.narrationStyle === 'professional'
          ? 'formal'
          : 'conversational'),
      length: options?.length || 'medium',
      language: options?.language,
      genre: options?.genre,
      genreContext: options?.genreContext,
    };

    // Generate script for slides
    const narratedDeck: NarratedSlideDeck = await generateNarration(
      slideDeck,
      narrationOptions
    );

    // Map options to TTS parameters
    const ttsOptions = {
      voice: options?.voice || options?.ttsVoice,
      speed: options?.speed,
      quality: options?.quality,
      format: options?.format,
      userId: 'default', // TODO: Get actual userId from context
    };

    // Generate narration
    const ttsNarration = await generateTTSNarration(narratedDeck, ttsOptions);

    // Convert types to match PipelineResult interface
    const slides: SlideData[] = narratedDeck.slides.map(slide => ({
      id: slide.id,
      title: slide.title,
      content: slide.bullets,
      imagePrompt: slide.suggestedImagePrompt,
      narration: (slide as any).narration || '',
      duration: 10, // Default duration
    }));

    const script: ScriptData = {
      slides,
      totalDuration: slides.length * 10, // Default duration per slide
      wordCount: narratedDeck.slides.reduce(
        (total, slide) => total + ((slide as any).narration?.split(' ').length || 0),
        0
      ),
    };

    const narration: NarrationData = {
      audioUrl: ttsNarration.audioFileUrl,
      timeline: ttsNarration.timeline.map(item => ({
        slideId: item.slideId,
        startTime: item.startTime,
        endTime: item.endTime,
        text: item.narration,
      })),
    };

    return {
      success: true,
      slides,
      script,
      narration,
      metadata: {
        processingTime: Date.now() - Date.now(), // TODO: Add actual processing time tracking
        slideCount: slides.length,
        wordCount: script.wordCount,
      },
    };
  }

  /**
   * Execute script-only pipeline
   */
  private async executeScriptOnly(
    documentContent?: string,
    options?: DocToVideoCommand['options']
  ): Promise<PipelineResult> {
    console.log('📝 Generating script only...');

    // Map options to slide generation parameters
    const slideOptions = {
      maxSlides: options?.maxSlides || options?.slideCount,
      style: options?.style,
      audience: options?.audience,
      genre: options?.genre,
      genreContext: options?.genreContext,
    };

    // Generate basic slides for script generation
    const slideDeck = await generateSlides(documentContent!, slideOptions);

    // Map options to narration parameters
    const narrationOptions = {
      tone:
        options?.tone ||
        (options?.narrationStyle === 'professional'
          ? 'formal'
          : 'conversational'),
      length: options?.length || 'medium',
      language: options?.language,
      genre: options?.genre,
      genreContext: options?.genreContext,
    };

    // Generate script
    const narratedDeck: NarratedSlideDeck = await generateNarration(
      slideDeck,
      narrationOptions
    );

    // Convert types to match PipelineResult interface
    const slides: SlideData[] = narratedDeck.slides.map(slide => ({
      id: slide.id,
      title: slide.title,
      content: slide.bullets,
      imagePrompt: slide.suggestedImagePrompt,
      narration: (slide as any).narration || '',
      duration: 10, // Default duration
    }));

    const script: ScriptData = {
      slides,
      totalDuration: slides.length * 10, // Default duration per slide
      wordCount: narratedDeck.slides.reduce(
        (total, slide) => total + ((slide as any).narration?.split(' ').length || 0),
        0
      ),
    };

    return {
      success: true,
      slides,
      script,
      metadata: {
        processingTime: Date.now() - Date.now(), // TODO: Add actual processing time tracking
        slideCount: slides.length,
        wordCount: script.wordCount,
      },
    };
  }

  /**
   * Execute slides-only pipeline
   */
  private async executeSlidesOnly(
    documentContent?: string,
    options?: DocToVideoCommand['options']
  ): Promise<PipelineResult> {
    console.log('📊 Generating slides only...');

    // Map options to slide generation parameters
    const slideOptions = {
      maxSlides: options?.maxSlides || options?.slideCount,
      style: options?.style,
      audience: options?.audience,
      genre: options?.genre,
      genreContext: options?.genreContext,
    };

    // Generate slides
    const slideDeck = await generateSlides(documentContent!, slideOptions);

    // Convert types to match PipelineResult interface
    const slides: SlideData[] = slideDeck.slides.map(slide => ({
      id: slide.id,
      title: slide.title,
      content: slide.bullets,
      imagePrompt: slide.suggestedImagePrompt,
      narration: '', // Empty narration for slides-only mode
      duration: 10, // Default duration
    }));

    return {
      success: true,
      slides,
      metadata: {
        processingTime: Date.now() - Date.now(), // TODO: Add actual processing time tracking
        slideCount: slides.length,
        wordCount: 0, // No script generated
      },
    };
  }

  /**
   * Execute voiceover-only pipeline
   */
  private async executeVoiceoverOnly(
    documentContent?: string,
    options?: DocToVideoCommand['options']
  ): Promise<PipelineResult> {
    console.log('🎤 Generating voiceover only...');

    // Map options to slide generation parameters
    const slideOptions = {
      maxSlides: options?.maxSlides || options?.slideCount,
      style: options?.style,
      audience: options?.audience,
      genre: options?.genre,
      genreContext: options?.genreContext,
    };

    // Generate slides
    const slideDeck = await generateSlides(documentContent!, slideOptions);

    // Map options to narration parameters
    const narrationOptions = {
      tone:
        options?.tone ||
        (options?.narrationStyle === 'professional'
          ? 'formal'
          : 'conversational'),
      length: options?.length || 'medium',
      language: options?.language,
      genre: options?.genre,
      genreContext: options?.genreContext,
    };

    // Generate script
    const narratedDeck: NarratedSlideDeck = await generateNarration(
      slideDeck,
      narrationOptions
    );

    // Map options to TTS parameters
    const ttsOptions = {
      voice: options?.voice || options?.ttsVoice,
      speed: options?.speed,
      quality: options?.quality,
      format: options?.format,
      userId: 'default', // TODO: Get actual userId from context
    };

    // Generate TTS narration
    const ttsNarration = await generateTTSNarration(narratedDeck, ttsOptions);

    // Convert types to match PipelineResult interface
    const slides: SlideData[] = narratedDeck.slides.map(slide => ({
      id: slide.id,
      title: slide.title,
      content: slide.bullets,
      imagePrompt: slide.suggestedImagePrompt,
      narration: (slide as any).narration || '',
      duration: 10, // Default duration
    }));

    const narration: NarrationData = {
      audioUrl: ttsNarration.audioFileUrl,
      timeline: ttsNarration.timeline.map(item => ({
        slideId: item.slideId,
        startTime: item.startTime,
        endTime: item.endTime,
        text: item.narration,
      })),
    };

    return {
      success: true,
      slides,
      narration,
      metadata: {
        processingTime: Date.now() - Date.now(), // TODO: Add actual processing time tracking
        slideCount: slides.length,
        wordCount: narratedDeck.slides.reduce(
          (total, slide) => total + ((slide as any).narration?.split(' ').length || 0),
          0
        ),
      },
    };
  }
}

// Export singleton instance
export const docToVideoRouter = DocToVideoRouter.getInstance();
