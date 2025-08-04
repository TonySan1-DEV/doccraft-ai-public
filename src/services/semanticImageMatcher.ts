// Semantic Image Matcher Service
// MCP: { role: "matcher", allowedActions: ["analyze", "match", "validate"], theme: "semantic_analysis", contentSensitivity: "medium", tier: "Pro" }

export interface ContentAnalysis {
  topics: string[];
  emotions: string[];
  tone: 'formal' | 'casual' | 'professional' | 'creative' | 'academic' | 'technical';
  audience: 'general' | 'professional' | 'academic' | 'creative' | 'children' | 'senior';
  complexity: 'simple' | 'moderate' | 'complex';
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  keywords: string[];
  themes: string[];
  culturalContext: string[];
}

export interface VisualStyle {
  colorPalette: string[];
  composition: 'centered' | 'rule-of-thirds' | 'asymmetric' | 'minimalist';
  mood: 'calm' | 'energetic' | 'serious' | 'playful' | 'inspirational' | 'professional';
  style: 'realistic' | 'illustrative' | 'abstract' | 'photographic' | 'artistic';
  lighting: 'natural' | 'artificial' | 'dramatic' | 'soft';
}

export interface SemanticMatch {
  imageId: string;
  relevanceScore: number;
  semanticAlignment: number;
  contextMatch: {
    topics: string[];
    emotions: string[];
    tone: string;
    audience: string;
  };
  visualStyle: VisualStyle;
  culturalAppropriateness: number;
  accessibilityScore: number;
}

export interface ImageMatch {
  id: string;
  url: string;
  caption: string;
  source: 'ai' | 'stock' | 'upload';
  semanticMatch: SemanticMatch;
  metadata: {
    author?: string;
    platform?: string;
    prompt?: string;
    tags: string[];
  };
}

export class SemanticImageMatcher {
  private readonly CONTENT_ANALYSIS_PROMPT = `
    Analyze the following text content and extract:
    1. Main topics and themes
    2. Emotional tone and sentiment
    3. Target audience characteristics
    4. Complexity level
    5. Cultural context
    6. Key visual elements mentioned
    
    Content: {content}
    
    Provide a structured analysis in JSON format.
  `;

  private readonly STYLE_MATCHING_PROMPT = `
    Given the following content analysis, suggest visual style characteristics:
    1. Color palette preferences
    2. Composition style
    3. Mood and atmosphere
    4. Artistic style
    5. Lighting preferences
    
    Analysis: {analysis}
    
    Provide visual style recommendations in JSON format.
  `;

  /**
   * Analyzes text content to extract semantic information
   */
  async analyzeContent(text: string): Promise<ContentAnalysis> {
    try {
      // Simulate AI-powered content analysis
      await new Promise(resolve => setTimeout(resolve, 1000));

      const words = text.toLowerCase().split(/\s+/);
      const topics = this.extractTopics(text);
      const emotions = this.analyzeEmotions(text);
      const tone = this.determineTone(text);
      const audience = this.determineAudience(text);
      const complexity = this.assessComplexity(text);
      const sentiment = this.analyzeSentiment(text);
      const keywords = this.extractKeywords(text);
      const themes = this.extractThemes(text);
      const culturalContext = this.identifyCulturalContext(text);

      return {
        topics,
        emotions,
        tone,
        audience,
        complexity,
        sentiment,
        keywords,
        themes,
        culturalContext
      };
    } catch (error) {
      console.error('Error analyzing content:', error);
      throw new Error('Failed to analyze content');
    }
  }

  /**
   * Finds images that semantically match the content analysis
   */
  async findMatchingImages(analysis: ContentAnalysis): Promise<ImageMatch[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const visualStyle = await this.generateVisualStyle(analysis);
      const mockImages = this.generateMockImages(analysis, visualStyle);
      
      return mockImages.map(image => ({
        id: image.id,
        url: image.url,
        caption: image.caption,
        source: image.source,
        semanticMatch: image.semanticMatch,
        metadata: image.metadata
      }));
    } catch (error) {
      console.error('Error finding matching images:', error);
      throw new Error('Failed to find matching images');
    }
  }

  /**
   * Validates the contextual relevance of an image match
   */
  async validateContextualRelevance(image: ImageMatch, content: string): Promise<number> {
    try {
      const contentAnalysis = await this.analyzeContent(content);
      
      // Calculate relevance based on multiple factors
      const topicRelevance = this.calculateTopicRelevance(image.semanticMatch.contextMatch.topics, contentAnalysis.topics);
      const emotionalRelevance = this.calculateEmotionalRelevance(image.semanticMatch.contextMatch.emotions, contentAnalysis.emotions);
      const toneRelevance = this.calculateToneRelevance(image.semanticMatch.contextMatch.tone, contentAnalysis.tone);
      const audienceRelevance = this.calculateAudienceRelevance(image.semanticMatch.contextMatch.audience, contentAnalysis.audience);
      
      // Weighted average of all relevance factors
      const relevanceScore = (
        topicRelevance * 0.4 +
        emotionalRelevance * 0.25 +
        toneRelevance * 0.2 +
        audienceRelevance * 0.15
      );

      return Math.min(Math.max(relevanceScore, 0), 1);
    } catch (error) {
      console.error('Error validating contextual relevance:', error);
      return 0.5; // Default fallback score
    }
  }

  /**
   * Generates visual style recommendations based on content analysis
   */
  private async generateVisualStyle(analysis: ContentAnalysis): Promise<VisualStyle> {
    const colorPalette = this.determineColorPalette(analysis);
    const composition = this.determineComposition(analysis);
    const mood = this.determineMood(analysis);
    const style = this.determineStyle(analysis);
    const lighting = this.determineLighting(analysis);

    return {
      colorPalette,
      composition,
      mood,
      style,
      lighting
    };
  }

  /**
   * Extracts main topics from text content
   */
  private extractTopics(text: string): string[] {
    const topics = new Set<string>();
    const words = text.toLowerCase().split(/\s+/);
    
    // Simple keyword extraction (in a real implementation, this would use NLP)
    const topicKeywords = [
      'business', 'technology', 'science', 'health', 'education', 'finance',
      'art', 'culture', 'sports', 'politics', 'environment', 'food',
      'travel', 'fashion', 'music', 'film', 'literature', 'history'
    ];

    topicKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        topics.add(keyword);
      }
    });

    return Array.from(topics);
  }

  /**
   * Analyzes emotional content in text
   */
  private analyzeEmotions(text: string): string[] {
    const emotions = new Set<string>();
    const textLower = text.toLowerCase();

    const emotionKeywords = {
      joy: ['happy', 'joy', 'excited', 'pleased', 'delighted'],
      sadness: ['sad', 'depressed', 'melancholy', 'sorrow', 'grief'],
      anger: ['angry', 'furious', 'irritated', 'annoyed', 'mad'],
      fear: ['afraid', 'scared', 'terrified', 'anxious', 'worried'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned'],
      trust: ['confident', 'trusting', 'reliable', 'secure', 'assured'],
      anticipation: ['eager', 'excited', 'hopeful', 'optimistic', 'enthusiastic']
    };

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        emotions.add(emotion);
      }
    });

    return Array.from(emotions);
  }

  /**
   * Determines the tone of the content
   */
  private determineTone(text: string): ContentAnalysis['tone'] {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('research') || textLower.includes('study') || textLower.includes('analysis')) {
      return 'academic';
    }
    if (textLower.includes('business') || textLower.includes('corporate') || textLower.includes('professional')) {
      return 'professional';
    }
    if (textLower.includes('creative') || textLower.includes('artistic') || textLower.includes('imaginative')) {
      return 'creative';
    }
    if (textLower.includes('technical') || textLower.includes('code') || textLower.includes('system')) {
      return 'technical';
    }
    if (textLower.includes('casual') || textLower.includes('informal') || textLower.includes('friendly')) {
      return 'casual';
    }
    
    return 'formal';
  }

  /**
   * Determines the target audience
   */
  private determineAudience(text: string): ContentAnalysis['audience'] {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('children') || textLower.includes('kids') || textLower.includes('young')) {
      return 'children';
    }
    if (textLower.includes('academic') || textLower.includes('research') || textLower.includes('scholarly')) {
      return 'academic';
    }
    if (textLower.includes('professional') || textLower.includes('business') || textLower.includes('corporate')) {
      return 'professional';
    }
    if (textLower.includes('creative') || textLower.includes('artistic') || textLower.includes('design')) {
      return 'creative';
    }
    if (textLower.includes('senior') || textLower.includes('elderly') || textLower.includes('retirement')) {
      return 'senior';
    }
    
    return 'general';
  }

  /**
   * Assesses content complexity
   */
  private assessComplexity(text: string): ContentAnalysis['complexity'] {
    const words = text.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const sentenceCount = text.split(/[.!?]+/).length;
    const avgSentenceLength = words.length / sentenceCount;

    if (avgWordLength > 6 || avgSentenceLength > 25) {
      return 'complex';
    }
    if (avgWordLength > 4 || avgSentenceLength > 15) {
      return 'moderate';
    }
    return 'simple';
  }

  /**
   * Analyzes overall sentiment
   */
  private analyzeSentiment(text: string): ContentAnalysis['sentiment'] {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'positive', 'success'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'failure', 'problem'];
    
    const textLower = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount === negativeCount && positiveCount > 0) return 'mixed';
    return 'neutral';
  }

  /**
   * Extracts keywords from content
   */
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    return words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10);
  }

  /**
   * Extracts themes from content
   */
  private extractThemes(text: string): string[] {
    const themes = new Set<string>();
    const textLower = text.toLowerCase();

    const themePatterns = {
      'innovation': ['innovation', 'creative', 'new', 'breakthrough'],
      'growth': ['growth', 'development', 'progress', 'improvement'],
      'collaboration': ['team', 'collaboration', 'partnership', 'together'],
      'sustainability': ['environment', 'sustainable', 'green', 'eco-friendly'],
      'technology': ['technology', 'digital', 'tech', 'software'],
      'wellness': ['health', 'wellness', 'fitness', 'wellbeing']
    };

    Object.entries(themePatterns).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        themes.add(theme);
      }
    });

    return Array.from(themes);
  }

  /**
   * Identifies cultural context
   */
  private identifyCulturalContext(text: string): string[] {
    const contexts = new Set<string>();
    const textLower = text.toLowerCase();

    const culturalPatterns = {
      'western': ['western', 'american', 'european'],
      'asian': ['asian', 'chinese', 'japanese', 'korean'],
      'middle_eastern': ['middle eastern', 'arabic', 'islamic'],
      'african': ['african', 'tribal', 'traditional'],
      'latin': ['latin', 'hispanic', 'spanish'],
      'indigenous': ['indigenous', 'native', 'tribal']
    };

    Object.entries(culturalPatterns).forEach(([context, keywords]) => {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        contexts.add(context);
      }
    });

    return Array.from(contexts);
  }

  /**
   * Determines appropriate color palette
   */
  private determineColorPalette(analysis: ContentAnalysis): string[] {
    if (analysis.tone === 'professional') {
      return ['#3B82F6', '#1E40AF', '#64748B', '#F8FAFC'];
    }
    if (analysis.tone === 'creative') {
      return ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];
    }
    if (analysis.tone === 'academic') {
      return ['#374151', '#6B7280', '#9CA3AF', '#F3F4F6'];
    }
    if (analysis.sentiment === 'positive') {
      return ['#10B981', '#34D399', '#6EE7B7', '#D1FAE5'];
    }
    if (analysis.sentiment === 'negative') {
      return ['#EF4444', '#F87171', '#FCA5A5', '#FEE2E2'];
    }
    
    return ['#6B7280', '#9CA3AF', '#D1D5DB', '#F9FAFB'];
  }

  /**
   * Determines composition style
   */
  private determineComposition(analysis: ContentAnalysis): VisualStyle['composition'] {
    if (analysis.tone === 'professional') return 'centered';
    if (analysis.tone === 'creative') return 'asymmetric';
    if (analysis.complexity === 'simple') return 'minimalist';
    return 'rule-of-thirds';
  }

  /**
   * Determines mood
   */
  private determineMood(analysis: ContentAnalysis): VisualStyle['mood'] {
    if (analysis.sentiment === 'positive') return 'energetic';
    if (analysis.sentiment === 'negative') return 'serious';
    if (analysis.tone === 'professional') return 'professional';
    if (analysis.tone === 'creative') return 'playful';
    return 'calm';
  }

  /**
   * Determines visual style
   */
  private determineStyle(analysis: ContentAnalysis): VisualStyle['style'] {
    if (analysis.tone === 'creative') return 'artistic';
    if (analysis.tone === 'professional') return 'photographic';
    if (analysis.tone === 'academic') return 'realistic';
    return 'illustrative';
  }

  /**
   * Determines lighting style
   */
  private determineLighting(analysis: ContentAnalysis): VisualStyle['lighting'] {
    if (analysis.sentiment === 'positive') return 'natural';
    if (analysis.sentiment === 'negative') return 'dramatic';
    if (analysis.tone === 'professional') return 'artificial';
    return 'soft';
  }

  /**
   * Generates mock images based on analysis
   */
  private generateMockImages(analysis: ContentAnalysis, visualStyle: VisualStyle): ImageMatch[] {
    const mockImages = [
      {
        id: 'semantic-1',
        url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
        caption: `Professional ${analysis.topics[0] || 'business'} visualization`,
        source: 'stock' as const,
        semanticMatch: {
          imageId: 'semantic-1',
          relevanceScore: 0.85 + Math.random() * 0.1,
          semanticAlignment: 0.8 + Math.random() * 0.15,
          contextMatch: {
            topics: analysis.topics.slice(0, 3),
            emotions: analysis.emotions.slice(0, 2),
            tone: analysis.tone,
            audience: analysis.audience
          },
          visualStyle,
          culturalAppropriateness: 0.9,
          accessibilityScore: 0.85
        },
        metadata: {
          author: 'Professional Photographer',
          platform: 'Unsplash',
          tags: analysis.keywords.slice(0, 5)
        }
      },
      {
        id: 'semantic-2',
        url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
        caption: `Creative ${analysis.themes[0] || 'innovation'} illustration`,
        source: 'ai' as const,
        semanticMatch: {
          imageId: 'semantic-2',
          relevanceScore: 0.75 + Math.random() * 0.15,
          semanticAlignment: 0.7 + Math.random() * 0.2,
          contextMatch: {
            topics: analysis.topics.slice(0, 2),
            emotions: analysis.emotions.slice(0, 1),
            tone: analysis.tone,
            audience: analysis.audience
          },
          visualStyle,
          culturalAppropriateness: 0.85,
          accessibilityScore: 0.8
        },
        metadata: {
          platform: 'AI Generator',
          prompt: `Create a ${visualStyle.style} image about ${analysis.topics[0] || 'business'}`,
          tags: analysis.keywords.slice(0, 4)
        }
      }
    ];

    return mockImages;
  }

  /**
   * Calculates topic relevance score
   */
  private calculateTopicRelevance(imageTopics: string[], contentTopics: string[]): number {
    const intersection = imageTopics.filter(topic => contentTopics.includes(topic));
    return intersection.length / Math.max(imageTopics.length, contentTopics.length);
  }

  /**
   * Calculates emotional relevance score
   */
  private calculateEmotionalRelevance(imageEmotions: string[], contentEmotions: string[]): number {
    const intersection = imageEmotions.filter(emotion => contentEmotions.includes(emotion));
    return intersection.length / Math.max(imageEmotions.length, contentEmotions.length);
  }

  /**
   * Calculates tone relevance score
   */
  private calculateToneRelevance(imageTone: string, contentTone: string): number {
    return imageTone === contentTone ? 1 : 0.3;
  }

  /**
   * Calculates audience relevance score
   */
  private calculateAudienceRelevance(imageAudience: string, contentAudience: string): number {
    return imageAudience === contentAudience ? 1 : 0.4;
  }
}

// Export singleton instance
export const semanticImageMatcher = new SemanticImageMatcher(); 