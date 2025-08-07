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

import { slideGenerator } from './slideGenerator';
import { scriptGenerator } from './scriptGenerator';
import { ttsSyncEngine } from './ttsSyncEngine';

// Types for pipeline execution
export interface DocToVideoCommand {
  type: 'auto' | 'scriptOnly' | 'slidesOnly' | 'voiceoverOnly';
  documentContent?: string;
  documentPath?: string;
  options?: {
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
  narration?: string;
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

    // Generate slides
    const slides = await slideGenerator.generateSlides(
      documentContent,
      options
    );

    // Generate script for slides
    const script = await scriptGenerator.generateScript(slides, options);

    // Generate narration
    const narration = await ttsSyncEngine.generateNarration(script, options);

    return {
      success: true,
      slides,
      script,
      narration,
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

    // Generate basic slides for script generation
    const slides = await slideGenerator.generateSlides(
      documentContent,
      options
    );

    // Generate script
    const script = await scriptGenerator.generateScript(slides, options);

    return {
      success: true,
      slides,
      script,
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

    const slides = await slideGenerator.generateSlides(
      documentContent,
      options
    );

    return {
      success: true,
      slides,
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

    // Generate slides and script for narration
    const slides = await slideGenerator.generateSlides(
      documentContent,
      options
    );
    const script = await scriptGenerator.generateScript(slides, options);

    // Generate narration
    const narration = await ttsSyncEngine.generateNarration(script, options);

    return {
      success: true,
      script,
      narration,
    };
  }
}

// Export singleton instance
export const docToVideoRouter = DocToVideoRouter.getInstance();
