export const mcpContext = {
  file: 'modules/themeAnalysis/services/themeAnalysisEngine.ts',
  role: 'developer',
  allowedActions: ['create', 'harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import type {
  ThemeCategory,
  ThemeVector,
  SceneThemeFingerprint,
  ThemeConflictReason,
} from '../themeTypes';
import { clamp01, clamp100 } from '../../emotionArc/utils/scaling';

export interface ThemeAnalysisContext {
  genre?: string;
  targetAudience?: string;
  narrativeArc?: 'heroic' | 'tragic' | 'redemptive' | 'coming-of-age';
  complexityLevel?: 'simple' | 'moderate' | 'complex';
}

export interface ThemeAnalysisResult {
  primaryThemes: string[];
  secondaryThemes: string[];
  themeVector: ThemeVector;
  alignmentScore: number; // 0-100
  complexityScore: number; // 0-100
  coherenceScore: number; // 0-100
  suggestions: string[];
  warnings: string[];
}

export interface ThemeComplexityMetrics {
  density: number; // themes per scene
  variety: number; // unique themes
  balance: number; // distribution evenness
  progression: number; // theme development over scenes
}

/**
 * Advanced theme analysis engine with Category 2 features
 * Provides comprehensive thematic analysis with null safety and scaling correctness
 */
export class ThemeAnalysisEngine {
  private readonly defaultContext: Required<ThemeAnalysisContext> = {
    genre: 'general',
    targetAudience: 'adult',
    narrativeArc: 'heroic',
    complexityLevel: 'moderate',
  };

  /**
   * Analyze theme complexity and provide metrics
   * @param scenes Array of scene theme fingerprints
   * @param context Optional analysis context
   * @returns Theme complexity metrics with proper scaling
   */
  public analyzeThemeComplexity(
    scenes: SceneThemeFingerprint[],
    context?: ThemeAnalysisContext
  ): ThemeComplexityMetrics {
    if (!scenes || scenes.length === 0) {
      return {
        density: 0,
        variety: 0,
        balance: 0,
        progression: 0,
      };
    }

    // Apply context-based complexity adjustments
    const mergedContext = { ...this.defaultContext, ...context };
    const complexityMultiplier = this.getComplexityMultiplier(mergedContext);

    // Calculate theme density (themes per scene)
    const totalThemes = scenes.reduce(
      (sum, scene) => sum + (scene.themes?.length || 0),
      0
    );
    const density = clamp100(
      (totalThemes / scenes.length) * 10 * complexityMultiplier
    ); // Scale to 0-100

    // Calculate theme variety (unique themes)
    const uniqueThemes = new Set<string>();
    scenes.forEach(scene => {
      scene.themes?.forEach(signal => {
        if (signal.theme) {
          uniqueThemes.add(signal.theme.toLowerCase());
        }
      });
    });
    const variety = clamp100((uniqueThemes.size / 20) * 100); // Normalize to 0-100

    // Calculate theme balance (distribution evenness)
    const themeCounts: Record<string, number> = {};
    scenes.forEach(scene => {
      scene.themes?.forEach(signal => {
        if (signal.theme) {
          const theme = signal.theme.toLowerCase();
          themeCounts[theme] =
            (themeCounts[theme] || 0) + (signal.strength || 0);
        }
      });
    });

    const counts = Object.values(themeCounts);
    if (counts.length === 0) {
      return { density, variety, balance: 0, progression: 0 };
    }

    const mean = counts.reduce((sum, count) => sum + count, 0) / counts.length;
    const variance =
      counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) /
      counts.length;
    const standardDeviation = Math.sqrt(variance);
    const balance = clamp100(Math.max(0, 100 - standardDeviation * 10)); // Lower std dev = higher balance

    // Calculate theme progression (development over scenes)
    const progression = this.calculateThemeProgression(scenes);

    return {
      density: clamp100(density),
      variety: clamp100(variety),
      balance: clamp100(balance),
      progression: clamp100(progression),
    };
  }

  /**
   * Generate comprehensive theme analysis with Category 2 features
   * @param scenes Array of scene theme fingerprints
   * @param context Optional analysis context
   * @returns Complete theme analysis result
   */
  public generateThemeAnalysis(
    scenes: SceneThemeFingerprint[],
    context?: ThemeAnalysisContext
  ): ThemeAnalysisResult {
    if (!scenes || scenes.length === 0) {
      return {
        primaryThemes: [],
        secondaryThemes: [],
        themeVector: {},
        alignmentScore: 0,
        complexityScore: 0,
        coherenceScore: 0,
        suggestions: ['No scenes provided for analysis'],
        warnings: ['Empty scene data'],
      };
    }

    const mergedContext = { ...this.defaultContext, ...context };
    const complexityMetrics = this.analyzeThemeComplexity(
      scenes,
      mergedContext
    );

    // Generate theme vector
    const themeVector = this.generateThemeVector(scenes);

    // Identify primary and secondary themes
    const { primaryThemes, secondaryThemes } =
      this.categorizeThemes(themeVector);

    // Calculate alignment score
    const alignmentScore = this.calculateAlignmentScore(scenes, primaryThemes);

    // Calculate complexity score
    const complexityScore = this.calculateComplexityScore(
      complexityMetrics,
      mergedContext
    );

    // Calculate coherence score
    const coherenceScore = this.calculateCoherenceScore(scenes, primaryThemes);

    // Generate suggestions and warnings
    const { suggestions, warnings } = this.generateAnalysisFeedback(
      complexityMetrics,
      alignmentScore,
      coherenceScore,
      mergedContext
    );

    return {
      primaryThemes,
      secondaryThemes,
      themeVector,
      alignmentScore: clamp100(alignmentScore),
      complexityScore: clamp100(complexityScore),
      coherenceScore: clamp100(coherenceScore),
      suggestions,
      warnings,
    };
  }

  /**
   * Detect theme conflicts with enhanced reasoning
   * @param scenes Array of scene theme fingerprints
   * @param primaryThemes Array of primary themes
   * @param context Optional analysis context
   * @returns Array of theme conflict reasons
   */
  public detectThemeConflicts(
    scenes: SceneThemeFingerprint[],
    primaryThemes: string[],
    context?: ThemeAnalysisContext
  ): ThemeConflictReason[] {
    if (!scenes || !primaryThemes || primaryThemes.length === 0) {
      return [];
    }

    const mergedContext = { ...this.defaultContext, ...context };
    const conflicts: ThemeConflictReason[] = [];

    // Check for theme conflicts within scenes
    scenes.forEach(scene => {
      if (!scene.themes || scene.themes.length < 2) return;

      const sceneThemes = scene.themes.map(t => t.theme.toLowerCase());

      // Check for conflicting theme pairs
      for (let i = 0; i < sceneThemes.length; i++) {
        for (let j = i + 1; j < sceneThemes.length; j++) {
          const theme1 = sceneThemes[i];
          const theme2 = sceneThemes[j];

          if (this.areThemesConflicting(theme1, theme2, mergedContext)) {
            conflicts.push({
              theme: theme1,
              conflictWith: theme2,
              conflictReason: this.generateConflictReason(
                theme1,
                theme2,
                scene,
                mergedContext
              ),
            });
          }
        }
      }
    });

    return conflicts;
  }

  /**
   * Generate theme vector from scenes
   * @param scenes Array of scene theme fingerprints
   * @returns Normalized theme vector
   */
  private generateThemeVector(scenes: SceneThemeFingerprint[]): ThemeVector {
    const themeVector: ThemeVector = {};

    scenes.forEach(scene => {
      scene.themes?.forEach(signal => {
        if (signal.theme && typeof signal.strength === 'number') {
          const theme = signal.theme.toLowerCase() as ThemeCategory;
          const currentStrength = themeVector[theme] || 0;
          themeVector[theme] = clamp01(currentStrength + signal.strength);
        }
      });
    });

    return themeVector;
  }

  /**
   * Categorize themes into primary and secondary
   * @param themeVector Normalized theme vector
   * @returns Object with primary and secondary themes
   */
  private categorizeThemes(themeVector: ThemeVector): {
    primaryThemes: string[];
    secondaryThemes: string[];
  } {
    const sortedThemes = Object.entries(themeVector)
      .sort(([, a], [, b]) => (b || 0) - (a || 0))
      .map(([theme]) => theme);

    const primaryCount = Math.min(3, sortedThemes.length);
    const primaryThemes = sortedThemes.slice(0, primaryCount);
    const secondaryThemes = sortedThemes.slice(primaryCount);

    return { primaryThemes, secondaryThemes };
  }

  /**
   * Calculate theme progression over scenes
   * @param scenes Array of scene theme fingerprints
   * @returns Progression score (0-100)
   */
  private calculateThemeProgression(scenes: SceneThemeFingerprint[]): number {
    if (scenes.length < 2) return 50; // Neutral score for single scene

    let progressionScore = 0;
    const totalScenes = scenes.length;

    for (let i = 1; i < scenes.length; i++) {
      const prevScene = scenes[i - 1];
      const currScene = scenes[i];

      if (!prevScene.themes || !currScene.themes) continue;

      const prevThemes = new Set(
        prevScene.themes.map(t => t.theme.toLowerCase())
      );
      const currThemes = new Set(
        currScene.themes.map(t => t.theme.toLowerCase())
      );

      // Check for theme development (new themes introduced)
      const newThemes =
        currThemes.size - new Set([...prevThemes, ...currThemes]).size;
      if (newThemes > 0) {
        progressionScore += 20;
      }

      // Check for theme continuity
      const commonThemes = [...prevThemes].filter(theme =>
        currThemes.has(theme)
      );
      if (commonThemes.length > 0) {
        progressionScore += 15;
      }
    }

    return clamp100((progressionScore / totalScenes) * 100);
  }

  /**
   * Calculate alignment score between scenes and primary themes
   * @param scenes Array of scene theme fingerprints
   * @param primaryThemes Array of primary themes
   * @returns Alignment score (0-100)
   */
  private calculateAlignmentScore(
    scenes: SceneThemeFingerprint[],
    primaryThemes: string[]
  ): number {
    if (primaryThemes.length === 0) return 0;

    let alignedScenes = 0;
    const totalScenes = scenes.length;

    scenes.forEach(scene => {
      if (!scene.themes) return;

      const sceneThemes = scene.themes.map(t => t.theme.toLowerCase());
      const hasPrimaryTheme = primaryThemes.some(theme =>
        sceneThemes.includes(theme.toLowerCase())
      );

      if (hasPrimaryTheme) {
        alignedScenes++;
      }
    });

    return clamp100((alignedScenes / totalScenes) * 100);
  }

  /**
   * Calculate complexity score based on metrics and context
   * @param metrics Theme complexity metrics
   * @param context Analysis context
   * @returns Complexity score (0-100)
   */
  private calculateComplexityScore(
    metrics: ThemeComplexityMetrics,
    context: Required<ThemeAnalysisContext>
  ): number {
    let score = 0;

    // Base complexity from metrics
    score += metrics.density * 0.3;
    score += metrics.variety * 0.3;
    score += metrics.balance * 0.2;
    score += metrics.progression * 0.2;

    // Adjust based on context
    switch (context.complexityLevel) {
      case 'simple':
        score = Math.min(score, 40);
        break;
      case 'moderate':
        score = Math.min(score, 70);
        break;
      case 'complex':
        score = Math.min(score, 100);
        break;
    }

    return clamp100(score);
  }

  /**
   * Calculate coherence score for theme consistency
   * @param scenes Array of scene theme fingerprints
   * @param primaryThemes Array of primary themes
   * @returns Coherence score (0-100)
   */
  private calculateCoherenceScore(
    scenes: SceneThemeFingerprint[],
    primaryThemes: string[]
  ): number {
    if (primaryThemes.length === 0) return 0;

    let coherenceScore = 0;
    const totalScenes = scenes.length;

    scenes.forEach(scene => {
      if (!scene.themes) return;

      const sceneThemes = scene.themes.map(t => t.theme.toLowerCase());
      const primaryThemeCount = primaryThemes.filter(theme =>
        sceneThemes.includes(theme.toLowerCase())
      ).length;

      // Higher score for scenes with multiple primary themes
      if (primaryThemeCount > 0) {
        coherenceScore += (primaryThemeCount / primaryThemes.length) * 100;
      }
    });

    return clamp100(coherenceScore / totalScenes);
  }

  /**
   * Check if two themes are conflicting
   * @param theme1 First theme
   * @param theme2 Second theme
   * @param context Analysis context
   * @returns True if themes conflict
   */
  private areThemesConflicting(
    theme1: string,
    theme2: string,
    context: Required<ThemeAnalysisContext>
  ): boolean {
    const conflictingPairs: Record<string, string[]> = {
      loyalty: ['betrayal', 'treason'],
      trust: ['deceit', 'betrayal', 'paranoia'],
      hope: ['despair', 'fear', 'doubt'],
      love: ['hate', 'jealousy', 'betrayal'],
      justice: ['injustice', 'corruption', 'revenge'],
      truth: ['lies', 'deception', 'secrets'],
      freedom: ['control', 'oppression', 'slavery'],
      peace: ['war', 'violence', 'conflict'],
      innocence: ['guilt', 'corruption', 'sin'],
      faith: ['doubt', 'heresy', 'blasphemy'],
    };

    const normalizedTheme1 = theme1.toLowerCase();
    const normalizedTheme2 = theme2.toLowerCase();

    // Check for direct conflicts
    const hasDirectConflict =
      conflictingPairs[normalizedTheme1]?.includes(normalizedTheme2) ||
      conflictingPairs[normalizedTheme2]?.includes(normalizedTheme1);

    if (hasDirectConflict) {
      return true;
    }

    // Genre-specific conflict detection using context
    if (context.genre) {
      switch (context.genre) {
        case 'noir':
          // In noir, certain theme combinations that might be acceptable in other genres
          // are considered conflicting due to moral ambiguity
          if (
            (normalizedTheme1 === 'justice' &&
              normalizedTheme2 === 'revenge') ||
            (normalizedTheme1 === 'truth' && normalizedTheme2 === 'secrets') ||
            (normalizedTheme1 === 'trust' && normalizedTheme2 === 'paranoia')
          ) {
            return true;
          }
          break;
        case 'romance':
          // In romance, love-hate dynamics might not be conflicting
          if (
            (normalizedTheme1 === 'love' && normalizedTheme2 === 'hate') ||
            (normalizedTheme1 === 'passion' && normalizedTheme2 === 'anger')
          ) {
            return false; // These are often complementary in romance
          }
          break;
        case 'thriller':
          // In thrillers, fear and hope can coexist to create tension
          if (
            (normalizedTheme1 === 'fear' && normalizedTheme2 === 'hope') ||
            (normalizedTheme1 === 'suspense' && normalizedTheme2 === 'relief')
          ) {
            return false; // These create the desired tension
          }
          break;
        case 'literary':
          // In literary fiction, thematic opposition is often intentional
          // and not necessarily conflicting
          if (
            (normalizedTheme1 === 'freedom' &&
              normalizedTheme2 === 'control') ||
            (normalizedTheme1 === 'innocence' &&
              normalizedTheme2 === 'experience')
          ) {
            return false; // These create rich symbolic meaning
          }
          break;
      }
    }

    // Audience-specific considerations
    if (context.targetAudience === 'young-adult') {
      // YA audiences can handle more complex theme relationships
      if (
        (normalizedTheme1 === 'innocence' &&
          normalizedTheme2 === 'corruption') ||
        (normalizedTheme1 === 'hope' && normalizedTheme2 === 'doubt')
      ) {
        return false; // These are common coming-of-age themes
      }
    }

    return false;
  }

  /**
   * Generate conflict reason with context awareness
   * @param theme1 First theme
   * @param theme2 Second theme
   * @param scene Scene context
   * @param context Analysis context
   * @returns Conflict reason string
   */
  private generateConflictReason(
    theme1: string,
    theme2: string,
    scene: SceneThemeFingerprint,
    context: Required<ThemeAnalysisContext>
  ): string {
    const baseReason = `Scene "${scene.sceneId}" contains conflicting themes: "${theme1}" and "${theme2}". `;

    switch (context.genre) {
      case 'noir':
        return `${baseReason}This creates a morally ambiguous atmosphere typical of noir narratives.`;
      case 'romance':
        return `${baseReason}This tension may enhance romantic conflict and character development.`;
      case 'thriller':
        return `${baseReason}This conflict heightens suspense and psychological tension.`;
      case 'literary':
        return `${baseReason}This thematic opposition creates rich symbolic meaning.`;
      default:
        return `${baseReason}Consider whether this conflict serves the narrative purpose.`;
    }
  }

  /**
   * Generate analysis feedback with suggestions and warnings
   * @param metrics Theme complexity metrics
   * @param alignmentScore Alignment score
   * @param coherenceScore Coherence score
   * @param context Analysis context
   * @returns Object with suggestions and warnings
   */
  private generateAnalysisFeedback(
    metrics: ThemeComplexityMetrics,
    alignmentScore: number,
    coherenceScore: number,
    context: Required<ThemeAnalysisContext>
  ): { suggestions: string[]; warnings: string[] } {
    const suggestions: string[] = [];
    const warnings: string[] = [];

    // Complexity feedback
    if (metrics.density < 30) {
      suggestions.push(
        'Consider adding more thematic elements to scenes for richer storytelling.'
      );
    } else if (metrics.density > 80) {
      warnings.push(
        'Theme density is very high - consider simplifying to avoid overwhelming readers.'
      );
    }

    if (metrics.variety < 40) {
      suggestions.push(
        'Expand thematic variety to create more nuanced character development.'
      );
    }

    if (metrics.balance < 50) {
      suggestions.push(
        'Balance theme distribution across scenes for more even storytelling.'
      );
    }

    // Alignment feedback
    if (alignmentScore < 60) {
      suggestions.push(
        'Strengthen primary themes in scenes to improve narrative coherence.'
      );
      warnings.push(
        'Low theme alignment may confuse readers about story direction.'
      );
    }

    // Coherence feedback
    if (coherenceScore < 50) {
      suggestions.push(
        'Focus on developing consistent thematic threads throughout the narrative.'
      );
      warnings.push('Low thematic coherence may weaken overall story impact.');
    }

    // Context-specific feedback
    if (context.complexityLevel === 'simple' && metrics.density > 60) {
      suggestions.push('Consider simplifying themes for your target audience.');
    }

    if (context.narrativeArc === 'coming-of-age' && metrics.progression < 40) {
      suggestions.push(
        'Enhance theme progression to reflect character growth and development.'
      );
    }

    return { suggestions, warnings };
  }

  /**
   * Get complexity multiplier based on context
   * @param context Analysis context
   * @returns Complexity multiplier (0.5 to 2.0)
   */
  private getComplexityMultiplier(
    context: Required<ThemeAnalysisContext>
  ): number {
    let multiplier = 1.0;

    // Genre-based adjustments
    switch (context.genre) {
      case 'literary':
        multiplier *= 1.3; // Literary fiction can handle more complexity
        break;
      case 'noir':
        multiplier *= 1.2; // Noir benefits from thematic complexity
        break;
      case 'romance':
        multiplier *= 0.8; // Romance typically simpler themes
        break;
      case 'thriller':
        multiplier *= 1.1; // Thrillers can be moderately complex
        break;
    }

    // Audience-based adjustments
    switch (context.targetAudience) {
      case 'young-adult':
        multiplier *= 0.9; // YA can handle some complexity but not overwhelming
        break;
      case 'children':
        multiplier *= 0.6; // Children need simpler themes
        break;
      case 'adult':
        multiplier *= 1.1; // Adults can handle more complexity
        break;
    }

    // Narrative arc adjustments
    switch (context.narrativeArc) {
      case 'heroic':
        multiplier *= 1.1; // Heroic arcs can handle moderate complexity
        break;
      case 'tragic':
        multiplier *= 1.2; // Tragic arcs benefit from thematic depth
        break;
      case 'redemptive':
        multiplier *= 1.1; // Redemptive arcs can handle some complexity
        break;
      case 'coming-of-age':
        multiplier *= 1.0; // Coming-of-age arcs work well with balanced complexity
        break;
    }

    // Complexity level adjustments
    switch (context.complexityLevel) {
      case 'complex':
        multiplier *= 1.3;
        break;
      case 'moderate':
        multiplier *= 1.0;
        break;
      case 'simple':
        multiplier *= 0.7;
        break;
    }

    // Clamp to reasonable bounds
    return Math.max(0.5, Math.min(2.0, multiplier));
  }
}
