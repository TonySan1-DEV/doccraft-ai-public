// Advanced Image Placement Engine
// MCP: { role: "placer", allowedActions: ["calculate", "optimize", "validate"], theme: "responsive_design", contentSensitivity: "low", tier: "Pro" }

export interface ImageConfig {
  width: number;
  height: number;
  aspectRatio: number;
  maxWidth: number;
  maxHeight: number;
  objectFit: 'cover' | 'contain' | 'fill' | 'scale-down';
  borderRadius: number;
  shadow: string;
  margin: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface ResponsiveConfig {
  mobile: ImageConfig;
  tablet: ImageConfig;
  desktop: ImageConfig;
  print: ImageConfig;
}

export interface PlacementStrategy {
  position:
    | 'top'
    | 'inline'
    | 'end'
    | 'full-width'
    | 'sidebar'
    | 'hero'
    | 'gallery';
  size: 'thumbnail' | 'small' | 'medium' | 'large' | 'hero' | 'full';
  responsive: ResponsiveConfig;
  context: {
    readingFlow: boolean;
    visualBreak: boolean;
    emphasis: boolean;
    accessibility: boolean;
  };
  performance: {
    lazyLoad: boolean;
    preload: boolean;
    compression: 'low' | 'medium' | 'high';
    format: 'webp' | 'jpg' | 'png' | 'svg';
  };
}

export interface ContentStructure {
  wordCount: number;
  paragraphCount: number;
  headingCount: number;
  listCount: number;
  blockquoteCount: number;
  codeBlockCount: number;
  averageParagraphLength: number;
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
  contentType: 'narrative' | 'technical' | 'academic' | 'creative' | 'business';
}

export class AdvancedImagePlacer {
  private readonly BREAKPOINTS = {
    mobile: 768,
    tablet: 1024,
    desktop: 1440,
  };

  private readonly ASPECT_RATIOS = {
    square: 1,
    portrait: 4 / 3,
    landscape: 16 / 9,
    wide: 21 / 9,
    ultra: 32 / 9,
  };

  /**
   * Calculates optimal image placement based on content and context
   */
  calculateOptimalPlacement(
    content: string,
    image: Record<string, unknown>
  ): PlacementStrategy {
    const contentStructure = this.analyzeContentStructure(content);
    const readingFlow = this.assessReadingFlow(contentStructure);
    const visualHierarchy = this.determineVisualHierarchy(contentStructure);
    const deviceContext = this.getDeviceContext();

    const position = this.determinePosition(contentStructure, readingFlow);
    const size = this.determineSize(contentStructure, visualHierarchy);
    const responsive = this.generateResponsiveLayout({
      position,
      size,
      responsive: {} as ResponsiveConfig,
      context: {} as PlacementStrategy['context'],
      performance: {} as PlacementStrategy['performance'],
    });
    const context = this.assessContext(contentStructure, readingFlow);
    const performance = this.optimizePerformance(image, deviceContext);

    return {
      position,
      size,
      responsive,
      context,
      performance,
    };
  }

  /**
   * Generates responsive configuration for different devices
   */
  generateResponsiveLayout(strategy: PlacementStrategy): ResponsiveConfig {
    const { size } = strategy;

    // Base configuration
    const baseConfig = this.getBaseImageConfig(size);

    // Generate device-specific configurations
    return {
      mobile: this.optimizeForMobile(baseConfig, strategy),
      tablet: this.optimizeForTablet(baseConfig, strategy),
      desktop: this.optimizeForDesktop(baseConfig, strategy),
      print: this.optimizeForPrint(baseConfig, strategy),
    };
  }

  /**
   * Validates if placement maintains good reading flow
   */
  validateReadingFlow(placement: PlacementStrategy): boolean {
    const { position, context } = placement;

    // Check if placement disrupts reading flow
    if (position === 'inline' && !context.readingFlow) {
      return false;
    }

    // Validate visual break placement
    if (position === 'full-width' && !context.visualBreak) {
      return false;
    }

    // Check emphasis placement
    if (position === 'hero' && !context.emphasis) {
      return false;
    }

    return true;
  }

  /**
   * Analyzes content structure for placement decisions
   */
  private analyzeContentStructure(content: string): ContentStructure {
    const words = content.trim().split(/\s+/);
    const paragraphs = content
      .split(/\n\s*\n/)
      .filter(p => p.trim().length > 0);
    const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
    const lists = content.match(/^[\s]*[-*+]\s+.+$/gm) || [];
    const blockquotes = content.match(/^>\s+.+$/gm) || [];
    const codeBlocks = content.match(/```[\s\S]*?```/gm) || [];

    const avgParagraphLength =
      paragraphs.length > 0
        ? paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) /
          paragraphs.length
        : 0;

    const readingLevel = this.assessReadingLevel(content);
    const contentType = this.determineContentType(content);

    return {
      wordCount: words.length,
      paragraphCount: paragraphs.length,
      headingCount: headings.length,
      listCount: lists.length,
      blockquoteCount: blockquotes.length,
      codeBlockCount: codeBlocks.length,
      averageParagraphLength: avgParagraphLength,
      readingLevel,
      contentType,
    };
  }

  /**
   * Assesses reading flow characteristics
   */
  private assessReadingFlow(structure: ContentStructure): {
    naturalFlow: boolean;
    visualBreaks: number;
    emphasisPoints: number;
    distractionLevel: 'low' | 'medium' | 'high';
  } {
    const naturalFlow =
      structure.paragraphCount > 2 && structure.averageParagraphLength > 20;
    const visualBreaks = structure.headingCount + structure.listCount;
    const emphasisPoints = structure.blockquoteCount + structure.codeBlockCount;

    let distractionLevel: 'low' | 'medium' | 'high' = 'low';
    if (structure.wordCount < 100) distractionLevel = 'high';
    else if (structure.wordCount < 500) distractionLevel = 'medium';

    return {
      naturalFlow,
      visualBreaks,
      emphasisPoints,
      distractionLevel,
    };
  }

  /**
   * Determines visual hierarchy needs
   */
  private determineVisualHierarchy(structure: ContentStructure): {
    needsEmphasis: boolean;
    needsBreaks: boolean;
    needsStructure: boolean;
  } {
    const needsEmphasis =
      structure.headingCount === 0 && structure.wordCount > 300;
    const needsBreaks =
      structure.paragraphCount > 5 && structure.averageParagraphLength > 50;
    const needsStructure =
      structure.headingCount < 2 && structure.wordCount > 500;

    return {
      needsEmphasis,
      needsBreaks,
      needsStructure,
    };
  }

  /**
   * Determines optimal image position
   */
  private determinePosition(
    structure: ContentStructure,
    _readingFlow: {
      naturalFlow: boolean;
      visualBreaks: number;
      emphasisPoints: number;
      distractionLevel: 'low' | 'medium' | 'high';
    }
  ): PlacementStrategy['position'] {
    // Short content → top placement
    if (structure.wordCount < 100) return 'top';

    // Content with many headings → inline for structure
    if (structure.headingCount > 2) return 'inline';

    // Long content with few breaks → inline for visual relief
    if (structure.wordCount > 500 && structure.paragraphCount > 3)
      return 'inline';

    // Content with lists → inline to break monotony
    if (structure.listCount > 0) return 'inline';

    // Very long content → end as conclusion
    if (structure.wordCount > 1000) return 'end';

    // Content with blockquotes → sidebar for emphasis
    if (structure.blockquoteCount > 0) return 'sidebar';

    // Technical content → inline for context
    if (structure.codeBlockCount > 0) return 'inline';

    // Default to inline for medium content
    return 'inline';
  }

  /**
   * Determines optimal image size
   */
  private determineSize(
    structure: ContentStructure,
    _hierarchy: {
      needsEmphasis: boolean;
      needsBreaks: boolean;
      needsStructure: boolean;
    }
  ): PlacementStrategy['size'] {
    // Hero content needs large images
    if (structure.wordCount < 200) return 'hero';

    // Technical content needs medium for clarity
    if (structure.codeBlockCount > 0) return 'medium';

    // Long content can use smaller images
    if (structure.wordCount > 1000) return 'small';

    // Content with many images should use thumbnails
    if (structure.headingCount > 5) return 'thumbnail';

    // Default to medium for balanced presentation
    return 'medium';
  }

  /**
   * Assesses context for placement decisions
   */
  private assessContext(
    structure: ContentStructure,
    readingFlow: {
      naturalFlow: boolean;
      visualBreaks: number;
      emphasisPoints: number;
      distractionLevel: 'low' | 'medium' | 'high';
    }
  ): PlacementStrategy['context'] {
    return {
      readingFlow: readingFlow.naturalFlow,
      visualBreak: readingFlow.visualBreaks > 0,
      emphasis: structure.blockquoteCount > 0 || structure.headingCount === 0,
      accessibility:
        structure.readingLevel === 'beginner' || structure.wordCount < 300,
    };
  }

  /**
   * Optimizes performance settings
   */
  private optimizePerformance(
    _image: Record<string, unknown>,
    deviceContext: {
      screenWidth: number;
      screenHeight: number;
      connectionSpeed: 'fast' | 'medium' | 'slow';
      deviceType: 'mobile' | 'tablet' | 'desktop';
    }
  ): PlacementStrategy['performance'] {
    const isMobile = deviceContext.screenWidth < this.BREAKPOINTS.mobile;
    const isSlowConnection = deviceContext.connectionSpeed === 'slow';

    return {
      lazyLoad: true,
      preload: !isMobile && !isSlowConnection,
      compression: isMobile || isSlowConnection ? 'high' : 'medium',
      format: isMobile ? 'webp' : 'jpg',
    };
  }

  /**
   * Gets current device context
   */
  private getDeviceContext(): {
    screenWidth: number;
    screenHeight: number;
    connectionSpeed: 'fast' | 'medium' | 'slow';
    deviceType: 'mobile' | 'tablet' | 'desktop';
  } {
    // In a real implementation, this would get actual device info
    const screenWidth = window.innerWidth || 1024;
    const screenHeight = window.innerHeight || 768;

    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (screenWidth < this.BREAKPOINTS.mobile) deviceType = 'mobile';
    else if (screenWidth < this.BREAKPOINTS.tablet) deviceType = 'tablet';

    return {
      screenWidth,
      screenHeight,
      connectionSpeed: 'medium', // Would be detected in real implementation
      deviceType,
    };
  }

  /**
   * Gets base image configuration for size
   */
  private getBaseImageConfig(size: PlacementStrategy['size']): ImageConfig {
    const configs = {
      thumbnail: {
        width: 150,
        height: 150,
        aspectRatio: this.ASPECT_RATIOS.square,
        maxWidth: 200,
        maxHeight: 200,
        objectFit: 'cover' as const,
        borderRadius: 8,
        shadow: '0 2px 4px rgba(0,0,0,0.1)',
        margin: { top: 8, bottom: 8, left: 0, right: 0 },
      },
      small: {
        width: 300,
        height: 200,
        aspectRatio: this.ASPECT_RATIOS.landscape,
        maxWidth: 400,
        maxHeight: 300,
        objectFit: 'cover' as const,
        borderRadius: 12,
        shadow: '0 4px 8px rgba(0,0,0,0.15)',
        margin: { top: 16, bottom: 16, left: 0, right: 0 },
      },
      medium: {
        width: 500,
        height: 350,
        aspectRatio: this.ASPECT_RATIOS.landscape,
        maxWidth: 600,
        maxHeight: 400,
        objectFit: 'cover' as const,
        borderRadius: 16,
        shadow: '0 8px 16px rgba(0,0,0,0.2)',
        margin: { top: 24, bottom: 24, left: 0, right: 0 },
      },
      large: {
        width: 800,
        height: 500,
        aspectRatio: this.ASPECT_RATIOS.landscape,
        maxWidth: 900,
        maxHeight: 600,
        objectFit: 'cover' as const,
        borderRadius: 20,
        shadow: '0 12px 24px rgba(0,0,0,0.25)',
        margin: { top: 32, bottom: 32, left: 0, right: 0 },
      },
      hero: {
        width: 1200,
        height: 600,
        aspectRatio: this.ASPECT_RATIOS.wide,
        maxWidth: 1400,
        maxHeight: 700,
        objectFit: 'cover' as const,
        borderRadius: 24,
        shadow: '0 16px 32px rgba(0,0,0,0.3)',
        margin: { top: 40, bottom: 40, left: 0, right: 0 },
      },
      full: {
        width: 100,
        height: 100,
        aspectRatio: this.ASPECT_RATIOS.landscape,
        maxWidth: 100,
        maxHeight: 100,
        objectFit: 'cover' as const,
        borderRadius: 0,
        shadow: 'none',
        margin: { top: 0, bottom: 0, left: 0, right: 0 },
      },
    };

    return configs[size];
  }

  /**
   * Optimizes configuration for mobile devices
   */
  private optimizeForMobile(
    baseConfig: ImageConfig,
    _strategy: PlacementStrategy
  ): ImageConfig {
    return {
      ...baseConfig,
      width: Math.min(baseConfig.width, 300),
      height: Math.min(baseConfig.height, 200),
      maxWidth: Math.min(baseConfig.maxWidth, 350),
      maxHeight: Math.min(baseConfig.maxHeight, 250),
      borderRadius: Math.min(baseConfig.borderRadius, 12),
      margin: {
        top: Math.min(baseConfig.margin.top, 12),
        bottom: Math.min(baseConfig.margin.bottom, 12),
        left: 0,
        right: 0,
      },
    };
  }

  /**
   * Optimizes configuration for tablet devices
   */
  private optimizeForTablet(
    baseConfig: ImageConfig,
    _strategy: PlacementStrategy
  ): ImageConfig {
    return {
      ...baseConfig,
      width: Math.min(baseConfig.width, 500),
      height: Math.min(baseConfig.height, 350),
      maxWidth: Math.min(baseConfig.maxWidth, 600),
      maxHeight: Math.min(baseConfig.maxHeight, 400),
      margin: {
        top: Math.min(baseConfig.margin.top, 20),
        bottom: Math.min(baseConfig.margin.bottom, 20),
        left: 0,
        right: 0,
      },
    };
  }

  /**
   * Optimizes configuration for desktop devices
   */
  private optimizeForDesktop(
    baseConfig: ImageConfig,
    _strategy: PlacementStrategy
  ): ImageConfig {
    return baseConfig; // Use full configuration for desktop
  }

  /**
   * Optimizes configuration for print
   */
  private optimizeForPrint(
    baseConfig: ImageConfig,
    _strategy: PlacementStrategy
  ): ImageConfig {
    return {
      ...baseConfig,
      shadow: 'none',
      borderRadius: 0,
      margin: {
        top: 16,
        bottom: 16,
        left: 0,
        right: 0,
      },
    };
  }

  /**
   * Assesses reading level of content
   */
  private assessReadingLevel(
    content: string
  ): ContentStructure['readingLevel'] {
    const words = content.split(/\s+/);
    const sentences = content.split(/[.!?]+/).length;
    const syllables = this.countSyllables(content);

    const avgWordsPerSentence = words.length / sentences;
    const avgSyllablesPerWord = syllables / words.length;

    // Flesch Reading Ease approximation
    const fleschScore =
      206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    if (fleschScore > 80) return 'beginner';
    if (fleschScore > 60) return 'intermediate';
    return 'advanced';
  }

  /**
   * Determines content type
   */
  private determineContentType(
    content: string
  ): ContentStructure['contentType'] {
    const textLower = content.toLowerCase();

    if (
      textLower.includes('function') ||
      textLower.includes('code') ||
      textLower.includes('system')
    ) {
      return 'technical';
    }
    if (
      textLower.includes('research') ||
      textLower.includes('study') ||
      textLower.includes('analysis')
    ) {
      return 'academic';
    }
    if (
      textLower.includes('creative') ||
      textLower.includes('artistic') ||
      textLower.includes('imaginative')
    ) {
      return 'creative';
    }
    if (
      textLower.includes('business') ||
      textLower.includes('corporate') ||
      textLower.includes('professional')
    ) {
      return 'business';
    }

    return 'narrative';
  }

  /**
   * Counts syllables in text (simplified)
   */
  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    return words.reduce((total, word) => {
      const syllables = word.match(/[aeiouy]+/g)?.length || 1;
      return total + Math.max(syllables, 1);
    }, 0);
  }
}

// Export singleton instance
export const advancedImagePlacer = new AdvancedImagePlacer();
