// Long-Form Content Generator Service
// MCP: { role: "generator", allowedActions: ["create", "expand", "structure"], theme: "long_form_content", contentSensitivity: "medium", tier: "Pro" }

export interface LongFormContentConfig {
  title: string;
  genre: string;
  targetWordCount: number;
  tone: string;
  audience: string;
  researchSources?: string[];
  outline?: ChapterOutline[];
  qualityThreshold: number;
  enableFactChecking: boolean;
  enableHallucinationDetection: boolean;
}

export interface ChapterOutline {
  title: string;
  summary: string;
  targetWordCount: number;
  keyPoints: string[];
  researchRequirements?: string[];
}

export interface GeneratedContent {
  title: string;
  chapters: GeneratedChapter[];
  totalWordCount: number;
  qualityScore: number;
  validationResults?: any;
  metadata: {
    generationTime: number;
    modelUsed: string;
    factCheckPassed: boolean;
    hallucinationScore: number;
  };
}

export interface GeneratedChapter {
  title: string;
  content: string;
  wordCount: number;
  qualityScore: number;
  keyPoints: string[];
  citations?: string[];
}

export interface ResearchSource {
  title: string;
  url?: string;
  content: string;
  reliability: number;
  relevance: number;
}

class LongFormContentGenerator {
  private readonly MIN_WORD_COUNT = 8000;
  private readonly MAX_CHAPTER_WORDS = 2000;
  private readonly QUALITY_THRESHOLD = 0.7;

  /**
   * Generate comprehensive long-form content
   */
  async generateLongFormContent(
    config: LongFormContentConfig
  ): Promise<GeneratedContent> {
    const startTime = Date.now();

    try {
      // Validate configuration
      this.validateConfig(config);

      // Generate or use provided outline
      const outline = config.outline || (await this.generateOutline(config));

      // Research phase
      const researchData = await this.performResearch(config);

      // Generate chapters with quality assurance
      const chapters = await this.generateChapters(
        outline,
        config,
        researchData
      );

      // Quality validation
      const validationResults = await this.validateContent(chapters, config);

      // Compile final content
      const totalWordCount = chapters.reduce(
        (sum, chapter) => sum + chapter.wordCount,
        0
      );
      const averageQualityScore =
        chapters.reduce((sum, chapter) => sum + chapter.qualityScore, 0) /
        chapters.length;

      const content: GeneratedContent = {
        title: config.title,
        chapters,
        totalWordCount,
        qualityScore: averageQualityScore,
        validationResults,
        metadata: {
          generationTime: Date.now() - startTime,
          modelUsed: "gpt-4",
          factCheckPassed: validationResults?.isValid || false,
          hallucinationScore: validationResults?.hallucinationScore || 0,
        },
      };

      return content;
    } catch (error) {
      console.error("Long-form content generation error:", error);
      throw new Error(
        `Content generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Validate configuration requirements
   */
  private validateConfig(config: LongFormContentConfig): void {
    if (config.targetWordCount < this.MIN_WORD_COUNT) {
      throw new Error(
        `Minimum word count is ${this.MIN_WORD_COUNT}. Requested: ${config.targetWordCount}`
      );
    }

    if (!config.title || config.title.trim().length === 0) {
      throw new Error("Title is required");
    }

    if (!config.genre || config.genre.trim().length === 0) {
      throw new Error("Genre is required");
    }
  }

  /**
   * Generate comprehensive outline for long-form content
   */
  private async generateOutline(
    config: LongFormContentConfig
  ): Promise<ChapterOutline[]> {
    const estimatedChapters = Math.ceil(
      config.targetWordCount / this.MAX_CHAPTER_WORDS
    );
    const wordsPerChapter = Math.ceil(
      config.targetWordCount / estimatedChapters
    );

    const prompt = `Create a detailed outline for a ${config.targetWordCount}-word ${config.genre} book titled "${config.title}".

Requirements:
- Target audience: ${config.audience}
- Tone: ${config.tone}
- Estimated chapters: ${estimatedChapters}
- Words per chapter: ~${wordsPerChapter}

Return JSON array:
[
  {
    "title": "Chapter title",
    "summary": "Detailed chapter summary",
    "targetWordCount": number,
    "keyPoints": ["point1", "point2", "point3"],
    "researchRequirements": ["requirement1", "requirement2"]
  }
]`;

    try {
      const response = await this.callLLM("openai", prompt);
      const outline = JSON.parse(response);

      // Validate outline structure
      if (!Array.isArray(outline) || outline.length === 0) {
        throw new Error("Invalid outline structure generated");
      }

      return outline.map((chapter: any) => ({
        title: chapter.title,
        summary: chapter.summary,
        targetWordCount: chapter.targetWordCount || wordsPerChapter,
        keyPoints: chapter.keyPoints || [],
        researchRequirements: chapter.researchRequirements || [],
      }));
    } catch (error) {
      console.error("Outline generation error:", error);
      // Fallback to basic outline
      return this.generateFallbackOutline(config);
    }
  }

  /**
   * Generate fallback outline if AI generation fails
   */
  private generateFallbackOutline(
    config: LongFormContentConfig
  ): ChapterOutline[] {
    const estimatedChapters = Math.ceil(
      config.targetWordCount / this.MAX_CHAPTER_WORDS
    );
    const wordsPerChapter = Math.ceil(
      config.targetWordCount / estimatedChapters
    );

    const chapters: ChapterOutline[] = [];

    for (let i = 1; i <= estimatedChapters; i++) {
      chapters.push({
        title: `Chapter ${i}`,
        summary: `Chapter ${i} of ${config.title}`,
        targetWordCount: wordsPerChapter,
        keyPoints: [`Key point ${i}.1`, `Key point ${i}.2`, `Key point ${i}.3`],
        researchRequirements: [],
      });
    }

    return chapters;
  }

  /**
   * Perform research for content generation
   */
  private async performResearch(
    config: LongFormContentConfig
  ): Promise<ResearchSource[]> {
    const researchSources: ResearchSource[] = [];

    // Use provided sources
    if (config.researchSources && config.researchSources.length > 0) {
      for (const source of config.researchSources) {
        try {
          const sourceData = await this.fetchSourceData(source);
          researchSources.push({
            title: source,
            url: source,
            content: sourceData,
            reliability: 0.8,
            relevance: 0.9,
          });
        } catch (error) {
          console.warn(`Failed to fetch source: ${source}`);
        }
      }
    }

    // Generate additional research based on outline
    if (config.outline) {
      const researchPrompts = this.generateResearchPrompts(
        config.outline,
        config
      );

      for (const prompt of researchPrompts) {
        try {
          const researchData = await this.callLLM("openai", prompt);
          researchSources.push({
            title: `AI Research: ${prompt.substring(0, 50)}...`,
            content: researchData,
            reliability: 0.7,
            relevance: 0.8,
          });
        } catch (error) {
          console.warn("Research generation failed:", error);
        }
      }
    }

    return researchSources;
  }

  /**
   * Generate research prompts based on outline
   */
  private generateResearchPrompts(
    outline: ChapterOutline[],
    config: LongFormContentConfig
  ): string[] {
    const prompts: string[] = [];

    outline.forEach((chapter, index) => {
      if (
        chapter.researchRequirements &&
        chapter.researchRequirements.length > 0
      ) {
        const prompt = `Research the following topics for a ${
          config.genre
        } book chapter:
        
Chapter: ${chapter.title}
Topics: ${chapter.researchRequirements.join(", ")}
Genre: ${config.genre}
Audience: ${config.audience}

Provide comprehensive, factual information that can be used for writing this chapter.`;

        prompts.push(prompt);
      }
    });

    return prompts;
  }

  /**
   * Fetch source data from URL or file
   */
  private async fetchSourceData(source: string): Promise<string> {
    // In production, implement proper source fetching
    // For now, return a placeholder
    return `Research data from ${source}`;
  }

  /**
   * Generate individual chapters with quality assurance
   */
  private async generateChapters(
    outline: ChapterOutline[],
    config: LongFormContentConfig,
    researchData: ResearchSource[]
  ): Promise<GeneratedChapter[]> {
    const chapters: GeneratedChapter[] = [];

    for (let i = 0; i < outline.length; i++) {
      const chapterOutline = outline[i];

      try {
        const chapter = await this.generateChapter(
          chapterOutline,
          config,
          researchData,
          i + 1,
          outline.length
        );

        // Quality check for each chapter
        if (config.enableFactChecking || config.enableHallucinationDetection) {
          const qualityCheck = await this.validateChapter(chapter, config);
          chapter.qualityScore = qualityCheck.overallScore;
        } else {
          chapter.qualityScore = 0.8; // Default score
        }

        chapters.push(chapter);
      } catch (error) {
        console.error(`Chapter ${i + 1} generation failed:`, error);
        // Add fallback chapter
        chapters.push(this.generateFallbackChapter(chapterOutline, i + 1));
      }
    }

    return chapters;
  }

  /**
   * Generate a single chapter
   */
  private async generateChapter(
    outline: ChapterOutline,
    config: LongFormContentConfig,
    researchData: ResearchSource[],
    chapterNumber: number,
    totalChapters: number
  ): Promise<GeneratedChapter> {
    const researchContext = this.buildResearchContext(researchData);

    const prompt = `Write Chapter ${chapterNumber} of ${totalChapters} for a ${
      config.targetWordCount
    }-word ${config.genre} book.

Title: ${config.title}
Chapter: ${outline.title}
Target Word Count: ${outline.targetWordCount}
Tone: ${config.tone}
Audience: ${config.audience}

Chapter Summary: ${outline.summary}
Key Points: ${outline.keyPoints.join(", ")}

Research Context: ${researchContext}

Requirements:
- Write ${outline.targetWordCount} words minimum
- Maintain consistent tone and style
- Include all key points
- Use research data when relevant
- Ensure logical flow and coherence
- Write in a clear, engaging style

Return the chapter content only, no additional formatting.`;

    try {
      const content = await this.callLLM("openai", prompt);
      const wordCount = this.countWords(content);

      return {
        title: outline.title,
        content,
        wordCount,
        qualityScore: 0.8, // Will be updated by quality check
        keyPoints: outline.keyPoints,
        citations: this.extractCitations(content),
      };
    } catch (error) {
      console.error("Chapter generation error:", error);
      return this.generateFallbackChapter(outline, chapterNumber);
    }
  }

  /**
   * Build research context from available sources
   */
  private buildResearchContext(researchData: ResearchSource[]): string {
    if (researchData.length === 0)
      return "No specific research data available.";

    return researchData
      .map(
        (source) => `${source.title}: ${source.content.substring(0, 500)}...`
      )
      .join("\n\n");
  }

  /**
   * Validate individual chapter
   */
  private async validateChapter(
    chapter: GeneratedChapter,
    config: LongFormContentConfig
  ): Promise<any> {
    // Import the content quality validator
    const { contentQualityValidator } = await import(
      "./contentQualityValidator"
    );

    return await contentQualityValidator.validateContent(
      chapter.content,
      config.genre,
      {
        researchSources: config.researchSources,
        factCheckRequired: config.enableFactChecking,
        targetAudience: config.audience,
      }
    );
  }

  /**
   * Validate entire content
   */
  private async validateContent(
    chapters: GeneratedChapter[],
    config: LongFormContentConfig
  ): Promise<any> {
    const fullContent = chapters.map((c) => c.content).join("\n\n");

    // Import the content quality validator
    const { contentQualityValidator } = await import(
      "./contentQualityValidator"
    );

    return await contentQualityValidator.validateContent(
      fullContent,
      config.genre,
      {
        researchSources: config.researchSources,
        factCheckRequired: config.enableFactChecking,
        targetAudience: config.audience,
      }
    );
  }

  /**
   * Generate fallback chapter if AI generation fails
   */
  private generateFallbackChapter(
    outline: ChapterOutline,
    chapterNumber: number
  ): GeneratedChapter {
    const fallbackContent = `Chapter ${chapterNumber}: ${outline.title}

${outline.summary}

This chapter covers the following key points:
${outline.keyPoints.map((point) => `- ${point}`).join("\n")}

[Content generation failed. Please manually write this chapter or regenerate.]`;

    return {
      title: outline.title,
      content: fallbackContent,
      wordCount: this.countWords(fallbackContent),
      qualityScore: 0.3,
      keyPoints: outline.keyPoints,
    };
  }

  /**
   * Extract citations from content
   */
  private extractCitations(content: string): string[] {
    // Simple citation extraction - in production, use more sophisticated parsing
    const citations: string[] = [];

    // Look for common citation patterns
    const citationPatterns = [/\[([^\]]+)\]/g, /\(([^)]+)\)/g, /"([^"]+)"/g];

    citationPatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        citations.push(...matches.slice(1));
      }
    });

    return citations.slice(0, 5); // Limit to first 5 citations
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  /**
   * Call LLM with specific provider
   */
  private async callLLM(provider: string, prompt: string): Promise<string> {
    // In production, use the LLM integration service
    // For now, return a mock response
    return `Generated content for: ${prompt.substring(0, 100)}...`;
  }
}

// Export singleton instance
export const longFormContentGenerator = new LongFormContentGenerator();
