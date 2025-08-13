// MCP Context Block
/*
{
  file: "qualityAssuranceCoordinator.ts",
  role: "backend-developer",
  allowedActions: ["service", "ai", "quality", "validation"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "quality_assurance"
}
*/

import { ModuleNameType } from '../../types/security';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Quality Standard Interface
 * Defines quality requirements for each module
 */
export interface QualityStandard {
  moduleName: ModuleNameType;
  minimumScore: number;
  targetScore: number;
  criticalThresholds: {
    coherence: number;
    accuracy: number;
    consistency: number;
    completeness: number;
  };
  validationRules: string[];
  qualityMetrics: string[];
}

/**
 * Quality Check Interface
 * Result of individual quality validation
 */
export interface QualityCheck {
  moduleName: ModuleNameType;
  checkType: string;
  passed: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
  metadata: {
    timestamp: Date;
    validationTime: number;
    rulesApplied: string[];
  };
}

/**
 * Quality Validation Interface
 * Comprehensive quality assessment across all modules
 */
export interface QualityValidation {
  overallScore: number;
  moduleScores: Map<ModuleNameType, number>;
  passed: boolean;
  improvements: ImprovementSuggestion[];
  validationDetails: QualityCheck[];
  metadata: {
    validationTime: Date;
    totalChecks: number;
    passedChecks: number;
    criticalIssues: number;
  };
}

/**
 * Improvement Suggestion Interface
 * Specific recommendations for quality improvement
 */
export interface ImprovementSuggestion {
  moduleName: ModuleNameType;
  suggestion: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: number;
  implementation: string;
  effort: 'minimal' | 'moderate' | 'significant';
}

/**
 * Cross-Module Validator Interface
 * Validates quality across multiple modules
 */
export interface CrossModuleValidator {
  name: string;
  description: string;
  validate(moduleResults: any[], writingGoal: any): Promise<QualityCheck>;
  applicableModules: ModuleNameType[];
  validationRules: string[];
}

/**
 * Module Result Interface
 * Result from individual module execution
 */
export interface ModuleResult {
  moduleName: ModuleNameType;
  result: any;
  executionTime: number;
  qualityMetrics: any;
  metadata: {
    timestamp: Date;
    version: string;
    configuration: any;
  };
}

/**
 * Writing Goal Interface
 * High-level writing objective for quality validation
 */
export interface WritingGoal {
  id: string;
  type: string;
  requirements: {
    qualityLevel: 'draft' | 'polished' | 'publication_ready';
    targetAudience: string;
    genre: string;
    [key: string]: any;
  };
  constraints: {
    qualityThreshold: number;
    [key: string]: any;
  };
}

// ============================================================================
// QUALITY ASSURANCE COORDINATOR
// ============================================================================

/**
 * Quality Assurance Coordinator
 * Comprehensive quality validation and improvement system across all modules
 */
export class QualityAssuranceCoordinator {
  private qualityMetrics: QualityMetric[];
  private moduleStandards: Map<ModuleNameType, QualityStandard>;
  private crossModuleValidators: CrossModuleValidator[];
  private validationHistory: QualityValidation[];
  private performanceMetrics: {
    totalValidations: number;
    averageValidationTime: number;
    qualityImprovementRate: number;
    criticalIssueRate: number;
  };

  constructor() {
    this.qualityMetrics = this.initializeQualityMetrics();
    this.moduleStandards = this.initializeModuleStandards();
    this.crossModuleValidators = this.initializeCrossModuleValidators();
    this.validationHistory = [];
    this.performanceMetrics = {
      totalValidations: 0,
      averageValidationTime: 0,
      qualityImprovementRate: 0,
      criticalIssueRate: 0,
    };
  }

  /**
   * Initialize quality metrics for tracking
   */
  private initializeQualityMetrics(): QualityMetric[] {
    return [
      {
        name: 'coherence',
        description: 'Narrative and thematic coherence',
        weight: 0.25,
        measurement: 'score',
        range: [0, 1],
      },
      {
        name: 'accuracy',
        description: 'Factual and logical accuracy',
        weight: 0.2,
        measurement: 'score',
        range: [0, 1],
      },
      {
        name: 'consistency',
        description: 'Style and voice consistency',
        weight: 0.2,
        measurement: 'score',
        range: [0, 1],
      },
      {
        name: 'completeness',
        description: 'Content completeness and coverage',
        weight: 0.15,
        measurement: 'score',
        range: [0, 1],
      },
      {
        name: 'engagement',
        description: 'Reader engagement and interest',
        weight: 0.2,
        measurement: 'score',
        range: [0, 1],
      },
    ];
  }

  /**
   * Initialize quality standards for each module
   */
  private initializeModuleStandards(): Map<ModuleNameType, QualityStandard> {
    const standards = new Map<ModuleNameType, QualityStandard>();

    // Emotion Arc Module Standards
    standards.set('emotionArc', {
      moduleName: 'emotionArc',
      minimumScore: 0.75,
      targetScore: 0.9,
      criticalThresholds: {
        coherence: 0.8,
        accuracy: 0.85,
        consistency: 0.8,
        completeness: 0.75,
      },
      validationRules: [
        'emotional_arc_progression',
        'character_consistency',
        'emotional_coherence',
        'motivation_clarity',
      ],
      qualityMetrics: [
        'emotional_depth',
        'character_development',
        'emotional_progression',
        'relationship_dynamics',
      ],
    });

    // Narrative Dashboard Module Standards
    standards.set('narrativeDashboard', {
      moduleName: 'narrativeDashboard',
      minimumScore: 0.8,
      targetScore: 0.92,
      criticalThresholds: {
        coherence: 0.85,
        accuracy: 0.8,
        consistency: 0.85,
        completeness: 0.8,
      },
      validationRules: [
        'story_structure',
        'narrative_flow',
        'plot_progression',
        'scene_transitions',
      ],
      qualityMetrics: [
        'structural_coherence',
        'narrative_pacing',
        'plot_logic',
        'story_completeness',
      ],
    });

    // Plot Structure Module Standards
    standards.set('plotStructure', {
      moduleName: 'plotStructure',
      minimumScore: 0.78,
      targetScore: 0.88,
      criticalThresholds: {
        coherence: 0.8,
        accuracy: 0.85,
        consistency: 0.8,
        completeness: 0.75,
      },
      validationRules: [
        'plot_coherence',
        'conflict_resolution',
        'story_beats',
        'structural_integrity',
      ],
      qualityMetrics: [
        'plot_complexity',
        'conflict_development',
        'resolution_satisfaction',
        'structural_soundness',
      ],
    });

    // Style Profile Module Standards
    standards.set('styleProfile', {
      moduleName: 'styleProfile',
      minimumScore: 0.82,
      targetScore: 0.93,
      criticalThresholds: {
        coherence: 0.85,
        accuracy: 0.8,
        consistency: 0.9,
        completeness: 0.8,
      },
      validationRules: [
        'voice_consistency',
        'style_coherence',
        'tone_appropriateness',
        'language_quality',
      ],
      qualityMetrics: [
        'style_consistency',
        'voice_authenticity',
        'tone_effectiveness',
        'language_clarity',
      ],
    });

    // Theme Analysis Module Standards
    standards.set('themeAnalysis', {
      moduleName: 'themeAnalysis',
      minimumScore: 0.75,
      targetScore: 0.87,
      criticalThresholds: {
        coherence: 0.8,
        accuracy: 0.85,
        consistency: 0.8,
        completeness: 0.75,
      },
      validationRules: [
        'thematic_coherence',
        'symbol_consistency',
        'meaning_depth',
        'theme_development',
      ],
      qualityMetrics: [
        'thematic_strength',
        'symbol_effectiveness',
        'meaning_clarity',
        'theme_integration',
      ],
    });

    return standards;
  }

  /**
   * Initialize cross-module validators
   */
  private initializeCrossModuleValidators(): CrossModuleValidator[] {
    return [
      {
        name: 'Narrative Coherence Validator',
        description: 'Validates coherence across narrative elements',
        applicableModules: [
          'emotionArc',
          'narrativeDashboard',
          'plotStructure',
        ],
        validationRules: [
          'narrative_flow',
          'character_consistency',
          'plot_logic',
        ],
        validate: this.validateNarrativeCoherence.bind(this),
      },
      {
        name: 'Thematic Integration Validator',
        description: 'Validates thematic consistency across modules',
        applicableModules: ['emotionArc', 'themeAnalysis', 'plotStructure'],
        validationRules: [
          'thematic_coherence',
          'symbol_alignment',
          'meaning_consistency',
        ],
        validate: this.validateThematicIntegration.bind(this),
      },
      {
        name: 'Style Voice Alignment Validator',
        description: 'Validates style and voice consistency',
        applicableModules: ['styleProfile', 'emotionArc', 'narrativeDashboard'],
        validationRules: [
          'voice_consistency',
          'style_coherence',
          'character_authenticity',
        ],
        validate: this.validateStyleVoiceAlignment.bind(this),
      },
      {
        name: 'Quality Threshold Validator',
        description: 'Validates overall quality thresholds',
        applicableModules: [
          'emotionArc',
          'narrativeDashboard',
          'plotStructure',
          'styleProfile',
          'themeAnalysis',
        ],
        validationRules: [
          'quality_thresholds',
          'critical_standards',
          'overall_coherence',
        ],
        validate: this.validateQualityThresholds.bind(this),
      },
    ];
  }

  /**
   * Validate results across all modules with comprehensive quality assessment
   */
  async validateResults(
    moduleResults: ModuleResult[],
    writingGoal: WritingGoal
  ): Promise<QualityValidation> {
    const startTime = performance.now();
    const validations: QualityCheck[] = [];

    try {
      // Individual module quality validation
      for (const result of moduleResults) {
        const moduleStandard = this.moduleStandards.get(result.moduleName);
        if (moduleStandard) {
          const validation = await this.validateModuleResult(
            result,
            moduleStandard
          );
          validations.push(validation);
        }
      }

      // Cross-module coherence validation
      for (const validator of this.crossModuleValidators) {
        const crossValidation = await validator.validate(
          moduleResults,
          writingGoal
        );
        validations.push(crossValidation);
      }

      // Overall quality scoring
      const overallQuality = this.calculateOverallQuality(validations);
      const improvementSuggestions = await this.generateImprovementSuggestions(
        validations,
        writingGoal
      );

      const validation: QualityValidation = {
        overallScore: overallQuality.score,
        moduleScores: overallQuality.moduleBreakdown,
        passed:
          overallQuality.score >= writingGoal.constraints.qualityThreshold,
        improvements: improvementSuggestions,
        validationDetails: validations,
        metadata: {
          validationTime: new Date(),
          totalChecks: validations.length,
          passedChecks: validations.filter(v => v.passed).length,
          criticalIssues: validations.filter(
            v => !v.passed && this.isCriticalIssue(v)
          ).length,
        },
      };

      // Store validation result
      this.validationHistory.push(validation);
      if (this.validationHistory.length > 100) {
        this.validationHistory.shift();
      }

      // Update performance metrics
      const validationTime = performance.now() - startTime;
      this.updatePerformanceMetrics(validationTime, validation.passed);

      return validation;
    } catch (error) {
      console.error('Quality validation error:', error);
      throw error;
    }
  }

  /**
   * Validate individual module result against standards
   */
  private async validateModuleResult(
    result: ModuleResult,
    standard: QualityStandard
  ): Promise<QualityCheck> {
    const startTime = performance.now();
    const issues: string[] = [];
    const suggestions: string[] = [];

    try {
      // Extract quality metrics from result
      const qualityMetrics = result.qualityMetrics || {};

      // Validate against critical thresholds
      let overallScore = 0;
      let passedChecks = 0;
      let totalChecks = 0;

      for (const metric of standard.qualityMetrics) {
        const value = qualityMetrics[metric] || 0;
        const threshold =
          standard.criticalThresholds[
            metric as keyof typeof standard.criticalThresholds
          ] || 0.8;

        totalChecks++;
        if (value >= threshold) {
          passedChecks++;
        } else {
          issues.push(`${metric} below threshold: ${value} < ${threshold}`);
          suggestions.push(`Improve ${metric} to meet quality standards`);
        }

        overallScore += value;
      }

      // Calculate average score
      overallScore = totalChecks > 0 ? overallScore / totalChecks : 0;

      // Determine if passed
      const passed = overallScore >= standard.minimumScore;

      // Generate additional suggestions if needed
      if (!passed) {
        suggestions.push(
          `Overall quality needs improvement to meet ${standard.minimumScore} threshold`
        );
      }

      if (overallScore < standard.targetScore) {
        suggestions.push(
          `Consider optimizations to reach target score of ${standard.targetScore}`
        );
      }

      const validationTime = performance.now() - startTime;

      return {
        moduleName: result.moduleName,
        checkType: 'module_validation',
        passed,
        score: overallScore,
        issues,
        suggestions,
        metadata: {
          timestamp: new Date(),
          validationTime,
          rulesApplied: standard.validationRules,
        },
      };
    } catch (error) {
      console.error(`Error validating module ${result.moduleName}:`, error);

      return {
        moduleName: result.moduleName,
        checkType: 'module_validation',
        passed: false,
        score: 0,
        issues: [
          `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
        suggestions: ['Review module output and retry validation'],
        metadata: {
          timestamp: new Date(),
          validationTime: performance.now() - startTime,
          rulesApplied: [],
        },
      };
    }
  }

  /**
   * Validate narrative coherence across modules
   */
  private async validateNarrativeCoherence(
    moduleResults: ModuleResult[],
    writingGoal: WritingGoal
  ): Promise<QualityCheck> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Analyze emotional and narrative alignment
    const emotionResult = moduleResults.find(
      r => r.moduleName === 'emotionArc'
    );
    const narrativeResult = moduleResults.find(
      r => r.moduleName === 'narrativeDashboard'
    );
    const plotResult = moduleResults.find(
      r => r.moduleName === 'plotStructure'
    );

    let coherenceScore = 0.8; // Base score

    if (emotionResult && narrativeResult) {
      const emotionalCoherence =
        emotionResult.qualityMetrics?.emotionalCoherence || 0.8;
      const narrativeFlow =
        narrativeResult.qualityMetrics?.narrativeFlow || 0.8;

      // Check for alignment issues
      if (Math.abs(emotionalCoherence - narrativeFlow) > 0.2) {
        issues.push('Emotional and narrative elements are misaligned');
        suggestions.push(
          'Reconcile emotional states with narrative progression'
        );
        coherenceScore -= 0.2;
      }
    }

    if (narrativeResult && plotResult) {
      const narrativeStructure =
        narrativeResult.qualityMetrics?.structuralCoherence || 0.8;
      const plotLogic = plotResult.qualityMetrics?.plotLogic || 0.8;

      if (Math.abs(narrativeStructure - plotLogic) > 0.15) {
        issues.push('Narrative structure and plot logic are inconsistent');
        suggestions.push('Align plot structure with narrative flow');
        coherenceScore -= 0.15;
      }
    }

    const passed = coherenceScore >= 0.7;

    return {
      moduleName: 'narrativeDashboard', // Primary module for this validation
      checkType: 'cross_module_coherence',
      passed,
      score: coherenceScore,
      issues,
      suggestions,
      metadata: {
        timestamp: new Date(),
        validationTime: 0,
        rulesApplied: ['narrative_flow', 'character_consistency', 'plot_logic'],
      },
    };
  }

  /**
   * Validate thematic integration across modules
   */
  private async validateThematicIntegration(
    moduleResults: ModuleResult[],
    writingGoal: WritingGoal
  ): Promise<QualityCheck> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    const emotionResult = moduleResults.find(
      r => r.moduleName === 'emotionArc'
    );
    const themeResult = moduleResults.find(
      r => r.moduleName === 'themeAnalysis'
    );
    const plotResult = moduleResults.find(
      r => r.moduleName === 'plotStructure'
    );

    let thematicScore = 0.8; // Base score

    if (themeResult && plotResult) {
      const thematicCoherence =
        themeResult.qualityMetrics?.thematicCoherence || 0.8;
      const plotThematicSupport =
        plotResult.qualityMetrics?.thematicSupport || 0.8;

      if (Math.abs(thematicCoherence - plotThematicSupport) > 0.2) {
        issues.push('Thematic elements and plot support are misaligned');
        suggestions.push('Strengthen plot support for thematic elements');
        thematicScore -= 0.2;
      }
    }

    if (emotionResult && themeResult) {
      const emotionalThemes =
        emotionResult.qualityMetrics?.emotionalThemes || 0.8;
      const thematicEmotionalSupport =
        themeResult.qualityMetrics?.emotionalSupport || 0.8;

      if (Math.abs(emotionalThemes - thematicEmotionalSupport) > 0.15) {
        issues.push('Emotional themes lack thematic support');
        suggestions.push(
          'Develop emotional themes with stronger thematic foundation'
        );
        thematicScore -= 0.15;
      }
    }

    const passed = thematicScore >= 0.7;

    return {
      moduleName: 'themeAnalysis',
      checkType: 'cross_module_thematic',
      passed,
      score: thematicScore,
      issues,
      suggestions,
      metadata: {
        timestamp: new Date(),
        validationTime: 0,
        rulesApplied: [
          'thematic_coherence',
          'symbol_alignment',
          'meaning_consistency',
        ],
      },
    };
  }

  /**
   * Validate style and voice alignment
   */
  private async validateStyleVoiceAlignment(
    moduleResults: ModuleResult[],
    writingGoal: WritingGoal
  ): Promise<QualityCheck> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    const styleResult = moduleResults.find(
      r => r.moduleName === 'styleProfile'
    );
    const emotionResult = moduleResults.find(
      r => r.moduleName === 'emotionArc'
    );
    const narrativeResult = moduleResults.find(
      r => r.moduleName === 'narrativeDashboard'
    );

    let alignmentScore = 0.8; // Base score

    if (styleResult && emotionResult) {
      const voiceConsistency =
        styleResult.qualityMetrics?.voiceConsistency || 0.8;
      const characterVoice =
        emotionResult.qualityMetrics?.characterVoice || 0.8;

      if (Math.abs(voiceConsistency - characterVoice) > 0.2) {
        issues.push('Style voice and character voice are misaligned');
        suggestions.push(
          'Align style choices with character voice authenticity'
        );
        alignmentScore -= 0.2;
      }
    }

    if (styleResult && narrativeResult) {
      const styleCoherence = styleResult.qualityMetrics?.styleCoherence || 0.8;
      const narrativeStyle =
        narrativeResult.qualityMetrics?.narrativeStyle || 0.8;

      if (Math.abs(styleCoherence - narrativeStyle) > 0.15) {
        issues.push('Style coherence and narrative style are inconsistent');
        suggestions.push('Maintain consistent style throughout narrative');
        alignmentScore -= 0.15;
      }
    }

    const passed = alignmentScore >= 0.7;

    return {
      moduleName: 'styleProfile',
      checkType: 'cross_module_style',
      passed,
      score: alignmentScore,
      issues,
      suggestions,
      metadata: {
        timestamp: new Date(),
        validationTime: 0,
        rulesApplied: [
          'voice_consistency',
          'style_coherence',
          'character_authenticity',
        ],
      },
    };
  }

  /**
   * Validate overall quality thresholds
   */
  private async validateQualityThresholds(
    moduleResults: ModuleResult[],
    writingGoal: WritingGoal
  ): Promise<QualityCheck> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Calculate overall quality metrics
    let overallScore = 0;
    let moduleCount = 0;

    for (const result of moduleResults) {
      const standard = this.moduleStandards.get(result.moduleName);
      if (standard && result.qualityMetrics) {
        const moduleScore =
          Object.values(result.qualityMetrics).reduce(
            (sum, value) => sum + (value || 0),
            0
          ) / Object.keys(result.qualityMetrics).length;
        overallScore += moduleScore;
        moduleCount++;
      }
    }

    overallScore = moduleCount > 0 ? overallScore / moduleCount : 0;

    // Check against writing goal constraints
    const qualityThreshold = writingGoal.constraints.qualityThreshold || 0.8;
    const passed = overallScore >= qualityThreshold;

    if (!passed) {
      issues.push(
        `Overall quality ${overallScore.toFixed(2)} below threshold ${qualityThreshold}`
      );
      suggestions.push('Improve module outputs to meet quality requirements');
    }

    if (overallScore < qualityThreshold + 0.1) {
      suggestions.push('Consider additional optimizations for higher quality');
    }

    return {
      moduleName: 'system', // System-wide validation
      checkType: 'overall_quality',
      passed,
      score: overallScore,
      issues,
      suggestions,
      metadata: {
        timestamp: new Date(),
        validationTime: 0,
        rulesApplied: [
          'quality_thresholds',
          'critical_standards',
          'overall_coherence',
        ],
      },
    };
  }

  /**
   * Calculate overall quality score and module breakdown
   */
  private calculateOverallQuality(validations: QualityCheck[]): {
    score: number;
    moduleBreakdown: Map<ModuleNameType, number>;
  } {
    const moduleBreakdown = new Map<ModuleNameType, number>();
    let totalScore = 0;
    let validScoreCount = 0;

    for (const validation of validations) {
      if (validation.score > 0) {
        totalScore += validation.score;
        validScoreCount++;

        // Update module breakdown
        if (!moduleBreakdown.has(validation.moduleName)) {
          moduleBreakdown.set(validation.moduleName, 0);
        }
        const currentScore = moduleBreakdown.get(validation.moduleName)!;
        moduleBreakdown.set(
          validation.moduleName,
          (currentScore + validation.score) / 2
        );
      }
    }

    const overallScore = validScoreCount > 0 ? totalScore / validScoreCount : 0;

    return {
      score: overallScore,
      moduleBreakdown,
    };
  }

  /**
   * Generate improvement suggestions based on validation results
   */
  private async generateImprovementSuggestions(
    validations: QualityCheck[],
    writingGoal: WritingGoal
  ): Promise<ImprovementSuggestion[]> {
    const suggestions: ImprovementSuggestion[] = [];

    for (const validation of validations) {
      if (!validation.passed || validation.score < 0.8) {
        // Generate high-priority suggestions for failed validations
        for (const suggestion of validation.suggestions) {
          suggestions.push({
            moduleName: validation.moduleName,
            suggestion,
            priority: validation.passed ? 'medium' : 'high',
            estimatedImpact: validation.passed ? 0.1 : 0.3,
            implementation: `Address ${validation.checkType} issues in ${validation.moduleName}`,
            effort: validation.passed ? 'minimal' : 'moderate',
          });
        }
      } else if (validation.score < 0.9) {
        // Generate medium-priority suggestions for good but improvable results
        suggestions.push({
          moduleName: validation.moduleName,
          suggestion: `Optimize ${validation.checkType} for higher quality`,
          priority: 'medium',
          estimatedImpact: 0.1,
          implementation: `Fine-tune ${validation.moduleName} parameters`,
          effort: 'minimal',
        });
      }
    }

    // Sort by priority and impact
    suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.estimatedImpact - a.estimatedImpact;
    });

    return suggestions.slice(0, 10); // Limit to top 10 suggestions
  }

  /**
   * Check if a validation issue is critical
   */
  private isCriticalIssue(validation: QualityCheck): boolean {
    return !validation.passed && validation.score < 0.6;
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(
    validationTime: number,
    passed: boolean
  ): void {
    this.performanceMetrics.totalValidations++;

    // Update average validation time
    const currentTotal =
      this.performanceMetrics.averageValidationTime *
      (this.performanceMetrics.totalValidations - 1);
    this.performanceMetrics.averageValidationTime =
      (currentTotal + validationTime) /
      this.performanceMetrics.totalValidations;

    // Update quality improvement rate
    if (this.validationHistory.length > 1) {
      const currentQuality =
        this.validationHistory[this.validationHistory.length - 1].overallScore;
      const previousQuality =
        this.validationHistory[this.validationHistory.length - 2].overallScore;
      const improvement = currentQuality - previousQuality;

      this.performanceMetrics.qualityImprovementRate =
        this.performanceMetrics.qualityImprovementRate * 0.9 +
        improvement * 0.1;
    }

    // Update critical issue rate
    if (!passed) {
      this.performanceMetrics.criticalIssueRate =
        this.performanceMetrics.criticalIssueRate * 0.9 + 0.1;
    }
  }

  /**
   * Get quality assurance performance statistics
   */
  getPerformanceStats(): {
    totalValidations: number;
    averageValidationTime: number;
    qualityImprovementRate: number;
    criticalIssueRate: number;
    recentValidations: number;
  } {
    const recentValidations = this.validationHistory.slice(-10).length;

    return {
      ...this.performanceMetrics,
      recentValidations,
    };
  }

  /**
   * Get validation history
   */
  getValidationHistory(): QualityValidation[] {
    return [...this.validationHistory];
  }

  /**
   * Get module quality standards
   */
  getModuleStandards(): Map<ModuleNameType, QualityStandard> {
    return new Map(this.moduleStandards);
  }

  /**
   * Get available cross-module validators
   */
  getCrossModuleValidators(): CrossModuleValidator[] {
    return [...this.crossModuleValidators];
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

/**
 * Quality Metric Interface
 * Defines individual quality metrics and their properties
 */
export interface QualityMetric {
  name: string;
  description: string;
  weight: number;
  measurement: 'score' | 'percentage' | 'count';
  range: [number, number];
}

/**
 * Performance Metrics Interface
 * Tracks quality assurance system performance
 */
export interface QualityAssurancePerformance {
  totalValidations: number;
  averageValidationTime: number;
  qualityImprovementRate: number;
  criticalIssueRate: number;
  modulePerformance: Map<
    ModuleNameType,
    {
      totalChecks: number;
      passedChecks: number;
      averageScore: number;
      lastOptimization: Date;
    }
  >;
}
