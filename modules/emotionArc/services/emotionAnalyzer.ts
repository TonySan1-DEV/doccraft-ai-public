// MCP Context Block
/*
{
  file: "modules/emotionArc/services/emotionAnalyzer.ts",
  role: "developer",
  allowedActions: ["generate", "analyze", "extract"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_suite"
}
*/

import {
  EmotionalBeat,
  EmotionAnalysis,
  SceneEmotionData,
  EmotionAnalyzerConfig,
  SceneInput,
  ValidationResult,
  BasicEmotion,
  CharacterEmotionData,
  getIntensity,
  getDominantEmotion,
  getContextClues,
  getSecondaryEmotions,
  getConfidence,
} from '../types/emotionTypes';
import {
  EMOTION_CATEGORIES,
  EMOTION_CONTEXT_PATTERNS,
  PUNCTUATION_INTENSITY,
} from '../constants/emotions';

export class EmotionAnalyzer {
  private config: EmotionAnalyzerConfig;
  private cache: Map<string, EmotionAnalysis> = new Map();

  constructor(config: Partial<EmotionAnalyzerConfig> = {}) {
    this.config = {
      model: 'gpt-4',
      sensitivity: 0.7,
      contextWindow: 4000,
      modelProvider: 'openai',
      modelName: 'gpt-4',
      temperature: 0.3,
      maxTokens: 500,
      batchSize: 5,
      enableCache: true,
      cacheExpiry: 3600, // 1 hour
      confidenceThreshold: 0.7,
      maxRetries: 3,
      timeout: 30000, // 30 seconds
      ...config,
    } as EmotionAnalyzerConfig;
  }

  /**
   * Analyzes a single piece of text for emotional content
   */
  async analyzeEmotion(
    text: string,
    characterId?: string,
    context?: string
  ): Promise<EmotionAnalysis> {
    const startTime = Date.now();

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(text, characterId);
      if (this.config.enableCache && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        if (
          Date.now() - (cached.processingTime || 0) <
          (this.config.cacheExpiry || 3600) * 1000
        ) {
          return cached;
        }
      }

      // Perform analysis based on model provider
      let result: EmotionAnalysis;

      switch (this.config.modelProvider || 'openai') {
        case 'openai':
          result = await this.analyzeWithOpenAI(text, characterId, context);
          break;
        case 'anthropic':
          result = await this.analyzeWithAnthropic(text, characterId, context);
          break;
        case 'local':
          result = await this.analyzeWithLocalModel(text, characterId, context);
          break;
        default:
          result = await this.analyzeWithKeywordExtraction(
            text,
            characterId || undefined,
            context || undefined
          );
      }

      // Add processing metadata
      result.processingTime = Date.now() - startTime;
      // Model confidence calculation removed - not part of EmotionAnalysis interface

      // Validate result
      const validation = this.validateAnalysisResult(result);
      if (!validation.isValid) {
        throw new Error(
          `Validation failed: ${validation.errors?.join(', ') || 'Unknown validation error'}`
        );
      }

      // Cache result
      if (this.config.enableCache) {
        this.cache.set(cacheKey, result);
      }

      return result;
    } catch (error) {
      throw this.createAnalysisError(error as Error);
    }
  }

  /**
   * Analyzes multiple scenes for emotional content
   */
  async analyzeStoryEmotions(
    scenes: SceneInput[],
    focusCharacter?: string
  ): Promise<SceneEmotionData[]> {
    const results: SceneEmotionData[] = [];

    // Process scenes in batches
    const batchSize = this.config.batchSize || 5;
    for (let i = 0; i < scenes.length; i += batchSize) {
      const batch = scenes.slice(i, i + batchSize);
      const batchPromises = batch.map(scene =>
        this.analyzeSceneEmotions(scene, focusCharacter)
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Analyzes a single scene for emotional content
   */
  async analyzeSceneEmotions(
    scene: SceneInput,
    focusCharacter?: string
  ): Promise<SceneEmotionData> {
    const startTime = Date.now();
    const characterEmotions = new Map<string, EmotionAnalysis>();

    // Split scene into character-specific sections
    const characterSections = this.splitSceneByCharacter(
      scene.text,
      scene.characters
    );

    // Analyze each character's emotional state
    for (const [characterId, section] of characterSections) {
      if (focusCharacter && characterId !== focusCharacter) {
        continue;
      }

      const emotionResult = await this.analyzeEmotion(
        section,
        characterId,
        scene.text
      );
      characterEmotions.set(characterId, emotionResult);
    }

    // Calculate overall scene sentiment
    const allEmotions = Array.from(characterEmotions.values());
    const overallSentiment = this.calculateOverallSentiment(allEmotions);
    const tensionLevel = this.calculateTensionLevel(allEmotions);

    // Convert EmotionAnalysis to CharacterEmotionData
    const characterEmotionData = new Map<string, CharacterEmotionData>();
    for (const [characterId, emotion] of characterEmotions) {
      characterEmotionData.set(characterId, {
        characterId,
        primaryEmotion: getDominantEmotion(emotion),
        dominantEmotion: getDominantEmotion(emotion),
        intensity: getIntensity(emotion),
        secondaryEmotions: getSecondaryEmotions(emotion),
        confidence: getConfidence(emotion),
        context: getContextClues(emotion).join(', '),
        emotionalComplexity: emotion.emotionalComplexity,
        contextClues: getContextClues(emotion),
        modelConfidence: getConfidence(emotion),
        processingTime: emotion.processingTime,
      });
    }

    // Generate emotional beats for the scene
    const emotionalBeats: EmotionalBeat[] = Array.from(
      characterEmotions.entries()
    ).map(([characterId, emotion]) => ({
      id: `beat_${scene.id || 'unknown'}_${characterId}_${Date.now()}`,
      sceneId: scene.id ?? 'unknown',
      characterId,
      emotion: getDominantEmotion(emotion),
      intensity: getIntensity(emotion),
      narrativePosition: 0.5, // Default to middle of scene
      timestamp: Date.now(),
      context: getContextClues(emotion).join(', '),
      confidence: getConfidence(emotion),
      secondaryEmotions: getSecondaryEmotions(emotion),
    }));

    return {
      sceneId: scene.id || 'unknown',
      sceneText: scene.text,
      characterEmotions: characterEmotionData,
      overallSentiment,
      tensionLevel,
      emotionalBeats,
      processingMetadata: {
        modelVersion: this.config.modelName || 'gpt-4',
        processingTime: Date.now() - startTime,
        confidence: 0.8,
        analysisMethod: 'emotion-analyzer',
        timestamp: Date.now(),
        wordCount: scene.text.split(/\s+/).length,
        characterCount: characterEmotions.size,
        analysisTime: Date.now() - startTime,
      },
    };
  }

  /**
   * OpenAI-based emotion analysis
   */
  private async analyzeWithOpenAI(
    text: string,
    characterId?: string,
    context?: string
  ): Promise<EmotionAnalysis> {
    const prompt = this.buildAnalysisPrompt(text, characterId, context);

    try {
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.modelName || 'gpt-4',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert at analyzing emotional content in text. Extract the primary emotion, intensity (0-100), and provide context clues.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: this.config.temperature || 0.3,
          max_tokens: this.config.maxTokens || 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseOpenAIResponse(data.choices[0]?.message?.content || '');
    } catch (error) {
      throw new Error(`OpenAI analysis failed: ${error}`);
    }
  }

  /**
   * Anthropic-based emotion analysis
   */
  private async analyzeWithAnthropic(
    text: string,
    characterId?: string,
    context?: string
  ): Promise<EmotionAnalysis> {
    const prompt = this.buildAnalysisPrompt(text, characterId, context);

    try {
      const response = await fetch('/api/anthropic/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: this.config.maxTokens || 500,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseAnthropicResponse(data.content[0]?.text || '');
    } catch (error) {
      throw new Error(`Anthropic analysis failed: ${error}`);
    }
  }

  /**
   * Local model-based emotion analysis
   */
  private async analyzeWithLocalModel(
    text: string,
    characterId?: string,
    context?: string
  ): Promise<EmotionAnalysis> {
    // Fallback to keyword extraction for local models
    return this.analyzeWithKeywordExtraction(text, characterId, context);
  }

  /**
   * Keyword-based emotion extraction (fallback method)
   */
  private async analyzeWithKeywordExtraction(
    text: string,
    _characterId?: string,
    _context?: string
  ): Promise<EmotionAnalysis> {
    const words = text.toLowerCase().split(/\s+/);
    const emotionScores: Record<string, number> = {};

    // Initialize emotion scores
    Object.keys(EMOTION_CATEGORIES).forEach(emotion => {
      emotionScores[emotion] = 0;
    });

    // Analyze text for emotional indicators
    words.forEach(word => {
      Object.entries(EMOTION_CATEGORIES).forEach(([emotion, category]) => {
        if (category.keywords.some(keyword => word.includes(keyword))) {
          emotionScores[emotion] = (emotionScores[emotion] || 0) + 1;
        }
      });
    });

    // Analyze punctuation and capitalization for intensity
    const intensityModifier = this.calculatePunctuationIntensity(text);

    // Find primary emotion
    const sortedEmotions = Object.entries(emotionScores).sort(
      ([, a], [, b]) => b - a
    );
    const primaryEmotion = sortedEmotions[0]?.[0] || 'neutral';

    const intensity = Math.min(
      100,
      (emotionScores[primaryEmotion] || 0) * 15 + intensityModifier
    );

    // Calculate emotional complexity
    const nonZeroEmotions = Object.values(emotionScores).filter(
      score => score > 0
    );
    const emotionalComplexity =
      nonZeroEmotions.length > 1
        ? Math.min(100, (nonZeroEmotions.length - 1) * 25)
        : 0;

    // Get secondary emotions
    const secondaryEmotions = Object.entries(emotionScores)
      .filter(
        ([, score]) => score > 0 && score < (emotionScores[primaryEmotion] || 0)
      )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([emotion]) => emotion);

    // Context clues extraction
    const contextClues = this.extractContextClues(text);

    return {
      sceneId: 'unknown',
      dominantEmotion: primaryEmotion as BasicEmotion,
      primaryEmotion,
      intensity: Math.round(intensity),
      confidence: Math.min(100, (emotionScores[primaryEmotion] || 0) * 20),
      secondaryEmotions,
      emotionalComplexity,
      contextClues,
      processingTime: 0,
      modelVersion: 'keyword-extraction',
      analysisMethod: 'keyword-extraction',
      timestamp: Date.now(),
    };
  }

  /**
   * Builds analysis prompt for AI models
   */
  private buildAnalysisPrompt(
    text: string,
    characterId?: string,
    context?: string
  ): string {
    return `Analyze the emotional content of this text and return a JSON response with the following structure:
{
  "primaryEmotion": "joy|fear|anger|sadness|surprise|disgust|love|conflict",
  "intensity": 0-100,
  "confidence": 0-100,
  "secondaryEmotions": ["emotion1", "emotion2"],
  "emotionalComplexity": 0-100,
  "contextClues": ["clue1", "clue2", "clue3"]
}

Text to analyze: "${text}"
${characterId ? `Character focus: ${characterId}` : ''}
${context ? `Context: ${context}` : ''}

Consider emotional keywords, punctuation, dialogue patterns, and physical reactions.`;
  }

  /**
   * Parses OpenAI response
   */
  private parseOpenAIResponse(content: string): EmotionAnalysis {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        sceneId: 'unknown',
        dominantEmotion: (parsed.primaryEmotion ||
          parsed.dominantEmotion ||
          'neutral') as BasicEmotion,
        primaryEmotion:
          parsed.primaryEmotion || parsed.dominantEmotion || 'unknown',
        intensity: Math.min(100, Math.max(0, parsed.intensity || 0)),
        confidence: Math.min(100, Math.max(0, parsed.confidence || 0)),
        secondaryEmotions: parsed.secondaryEmotions || [],
        emotionalComplexity: Math.min(
          100,
          Math.max(0, parsed.emotionalComplexity || 0)
        ),
        contextClues: parsed.contextClues || [],
        processingTime: 0,
        modelVersion: this.config.modelName || 'gpt-4',
        analysisMethod: 'openai',
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new Error(`Failed to parse OpenAI response: ${error}`);
    }
  }

  /**
   * Parses Anthropic response
   */
  private parseAnthropicResponse(content: string): EmotionAnalysis {
    // Similar to OpenAI parsing but adapted for Anthropic's format
    return this.parseOpenAIResponse(content);
  }

  /**
   * Splits scene text by character
   */
  private splitSceneByCharacter(
    sceneText: string,
    characterIds: string[]
  ): Map<string, string> {
    const sections = new Map<string, string>();

    characterIds.forEach(characterId => {
      const dialoguePattern = new RegExp(`(${characterId}[^.!?]*[.!?])`, 'gi');
      const matches = sceneText.match(dialoguePattern);
      if (matches) {
        sections.set(characterId, matches.join(' '));
      } else {
        // If no direct dialogue, assign general scene context
        sections.set(characterId, sceneText);
      }
    });

    return sections;
  }

  /**
   * Calculates overall sentiment from multiple emotions
   */
  private calculateOverallSentiment(emotions: EmotionAnalysis[]): string {
    const emotionCounts: Record<string, number> = {};

    emotions.forEach(emotion => {
      emotionCounts[emotion.dominantEmotion] =
        (emotionCounts[emotion.dominantEmotion] || 0) + 1;
    });

    const sortedEmotions = Object.entries(emotionCounts).sort(
      ([, a], [, b]) => b - a
    );
    const dominantEmotion = sortedEmotions[0]?.[0] || 'neutral';

    return dominantEmotion;
  }

  /**
   * Calculates tension level from emotions
   */
  private calculateTensionLevel(emotions: EmotionAnalysis[]): number {
    const tensionEmotions = ['fear', 'anger', 'conflict', 'surprise'];
    const tensionScore = emotions.reduce((total, emotion) => {
      const intensity = getIntensity(emotion);
      if (tensionEmotions.includes(emotion.dominantEmotion)) {
        return total + intensity * 0.8;
      }
      return total + intensity * 0.3;
    }, 0);

    return Math.min(100, tensionScore / emotions.length);
  }

  /**
   * Calculates punctuation-based intensity
   */
  private calculatePunctuationIntensity(text: string): number {
    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;
    const capsCount = (text.match(/[A-Z]/g) || []).length;

    return Math.min(
      100,
      exclamationCount * PUNCTUATION_INTENSITY.exclamation +
        capsCount * PUNCTUATION_INTENSITY.caps_word +
        questionCount * PUNCTUATION_INTENSITY.question
    );
  }

  /**
   * Extracts context clues from text
   */
  private extractContextClues(text: string): string[] {
    const clues: string[] = [];

    EMOTION_CONTEXT_PATTERNS.feeling_patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        clues.push(...matches.slice(0, 3));
      }
    });

    return clues.slice(0, 5);
  }

  /**
   * Validates analysis result
   */
  private validateAnalysisResult(result: EmotionAnalysis): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!result.dominantEmotion) {
      errors.push('Dominant emotion is required');
    }

    const intensity = getIntensity(result);
    if (intensity < 0 || intensity > 100) {
      errors.push('Intensity must be between 0 and 100');
    }

    if (
      result.confidence !== undefined &&
      (result.confidence < 0 || result.confidence > 100)
    ) {
      errors.push('Confidence must be between 0 and 100');
    }

    if (
      result.emotionalComplexity !== undefined &&
      (result.emotionalComplexity < 0 || result.emotionalComplexity > 100)
    ) {
      errors.push('Emotional complexity must be between 0 and 100');
    }

    if (
      result.confidence !== undefined &&
      result.confidence < (this.config.confidenceThreshold || 70)
    ) {
      warnings.push('Low confidence result - consider manual review');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions: [],
    };
  }

  /**
   * Creates cache key
   */
  private generateCacheKey(text: string, characterId?: string): string {
    const hash = this.simpleHash(text + (characterId || ''));
    return `emotion_${hash}`;
  }

  /**
   * Simple hash function
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Creates analysis error
   */
  private createAnalysisError(error: Error): any {
    return {
      code: 'MODEL_ERROR',
      message: error.message,
      details: error,
      retryable: true,
      suggestedAction: 'Retry with different model or parameters',
    };
  }

  /**
   * Updates configuration
   */
  updateConfig(newConfig: Partial<EmotionAnalyzerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Clears cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Gets cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses for accurate rate
    };
  }
}
