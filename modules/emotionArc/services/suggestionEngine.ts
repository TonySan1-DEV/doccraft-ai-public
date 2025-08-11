// MCP Context Block
/*
{
  file: "modules/emotionArc/services/suggestionEngine.ts",
  role: "developer",
  allowedActions: ["generate", "analyze", "extract"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_suite"
}
*/

import {
  EmotionalArc,
  OptimizationSuggestion,
  StoryOptimizationPlan,
  ArcSimulationResult,
} from '../types/emotionTypes';
import { TENSION_THRESHOLDS } from '../constants/emotions';

export class SuggestionEngine {
  private suggestionTemplates!: Map<string, string[]>;
  private riskAssessmentRules!: Map<string, 'low' | 'medium' | 'high'>;

  constructor() {
    this.initializeTemplates();
    this.initializeRiskRules();
  }

  /**
   * Generates optimization suggestions for story improvement
   */
  generateOptimizationSuggestions(
    arc: EmotionalArc,
    simulation: ArcSimulationResult
  ): StoryOptimizationPlan {
    const suggestions: OptimizationSuggestion[] = [];

    // Analyze pacing issues
    const pacingSuggestions = this.analyzePacingIssues(simulation);
    suggestions.push(...pacingSuggestions);

    // Analyze tension distribution
    const tensionSuggestions = this.analyzeTensionDistribution(simulation);
    suggestions.push(...tensionSuggestions);

    // Analyze empathy opportunities
    const empathySuggestions = this.analyzeEmpathyOpportunities(
      arc,
      simulation
    );
    suggestions.push(...empathySuggestions);

    // Analyze engagement risks
    const engagementSuggestions = this.analyzeEngagementRisks(simulation);
    suggestions.push(...engagementSuggestions);

    // Analyze complexity issues
    const complexitySuggestions = this.analyzeComplexityIssues(arc, simulation);
    suggestions.push(...complexitySuggestions);

    // Calculate overall optimization score
    const overallScore = this.calculateOptimizationScore(suggestions);

    // Determine implementation order
    const implementationOrder = this.determineImplementationOrder(suggestions);

    // Assess risks
    const riskAssessment = this.assessOptimizationRisks(suggestions);

    // Calculate estimated improvements
    const estimatedImprovement =
      this.calculateEstimatedImprovement(suggestions);

    return {
      suggestions,
      priority: this.determineOverallPriority(suggestions),
      estimatedImpact: this.calculateOverallEstimatedImpact(suggestions),
      overallScore,
      implementationOrder,
      riskAssessment,
      estimatedImprovement,
    };
  }

  /**
   * Generates scene-specific edit recommendations
   */
  generateSceneEditRecommendations(
    sceneId: string,
    arc: EmotionalArc,
    targetEmotion?: string,
    targetIntensity?: number
  ): string[] {
    const sceneBeats = arc.beats.filter(beat => beat.sceneId === sceneId);
    const recommendations: string[] = [];

    if (targetEmotion && targetIntensity) {
      const currentBeat = sceneBeats.find(
        beat => beat.emotion === targetEmotion
      );

      if (currentBeat) {
        const intensityDiff = targetIntensity - currentBeat.intensity;

        if (intensityDiff > 20) {
          recommendations.push(
            `Increase ${targetEmotion} intensity by adding more emotional language and physical reactions`
          );
        } else if (intensityDiff < -20) {
          recommendations.push(
            `Reduce ${targetEmotion} intensity by softening language and reactions`
          );
        }
      } else {
        recommendations.push(
          `Introduce ${targetEmotion} emotion through character dialogue and internal thoughts`
        );
      }
    }

    // General pacing recommendations
    if (sceneBeats.length < 2) {
      recommendations.push(
        'Add more emotional beats to create character depth'
      );
    }

    if (sceneBeats.some(beat => beat.intensity > 80)) {
      recommendations.push(
        'Consider easing emotional intensity to prevent reader fatigue'
      );
    }

    if (sceneBeats.some(beat => beat.intensity < 20)) {
      recommendations.push(
        'Add emotional stakes to increase reader engagement'
      );
    }

    return recommendations;
  }

  /**
   * Analyzes pacing issues in the story
   */
  private analyzePacingIssues(
    simulation: ArcSimulationResult
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Check for slow sections
    if (
      simulation.pacingAnalysis?.slowSections &&
      simulation.pacingAnalysis.slowSections.length > 2
    ) {
      suggestions.push({
        id: `pacing_slow_${Date.now()}`,
        message: 'Multiple slow sections may cause reader disengagement',
        type: 'tension',
        priority: 'high',
        title: 'Pacing Lulls Detected',
        description: 'Multiple slow sections may cause reader disengagement',
        specificChanges: this.suggestionTemplates.get('pacing_slow') || [],
        expectedImpact: {
          tensionChange: 15,
          empathyChange: 5,
          engagementChange: 20,
          complexityChange: 10,
        },
        targetPositions: simulation.pacingAnalysis?.slowSections || [],
        riskLevel: 'medium',
        implementationDifficulty: 'medium',
        estimatedTime: 30,
        impact: 'high',
        difficulty: 'medium',
        category: 'pacing',
        confidence: 0.8,
      });
    }

    // Check for overly fast sections
    if (
      simulation.pacingAnalysis?.fastSections &&
      simulation.pacingAnalysis.fastSections.length > 3
    ) {
      suggestions.push({
        id: `pacing_fast_${Date.now()}`,
        message: 'Too many fast-paced sections may overwhelm readers',
        type: 'tension',
        priority: 'medium',
        title: 'Rapid Pacing Clusters',
        description: 'Too many fast-paced sections may overwhelm readers',
        specificChanges: this.suggestionTemplates.get('pacing_fast') || [],
        expectedImpact: {
          tensionChange: -10,
          empathyChange: 15,
          engagementChange: 5,
          complexityChange: -5,
        },
        targetPositions: simulation.pacingAnalysis?.fastSections || [],
        riskLevel: 'low',
        implementationDifficulty: 'easy',
        estimatedTime: 20,
        impact: 'medium',
        difficulty: 'easy',
        category: 'pacing',
        confidence: 0.7,
      });
    }

    return suggestions;
  }

  /**
   * Analyzes tension distribution issues
   */
  private analyzeTensionDistribution(
    simulation: ArcSimulationResult
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Check for tension gaps
    const tensionGaps =
      simulation.tensionCurve
        ?.filter(curve => curve.tension < TENSION_THRESHOLDS.low_tension)
        ?.map(curve => curve.position) || [];

    if (tensionGaps.length > 2) {
      suggestions.push({
        id: `tension_gaps_${Date.now()}`,
        message: 'Low tension sections may cause reader disengagement',
        type: 'tension',
        priority: 'high',
        title: 'Tension Gaps Identified',
        description: 'Low tension sections may cause reader disengagement',
        specificChanges: this.suggestionTemplates.get('tension_gaps') || [],
        expectedImpact: {
          tensionChange: 25,
          empathyChange: 10,
          engagementChange: 20,
          complexityChange: 15,
        },
        targetPositions: tensionGaps,
        riskLevel: 'low',
        implementationDifficulty: 'medium',
        estimatedTime: 45,
        impact: 'high',
        difficulty: 'medium',
        category: 'tension',
        confidence: 0.8,
      });
    }

    // Check for sustained high tension
    const highTensionSections =
      simulation.tensionCurve
        ?.filter(curve => curve.tension > TENSION_THRESHOLDS.high_tension)
        ?.map(curve => curve.position) || [];

    if (highTensionSections.length > 3) {
      suggestions.push({
        id: `tension_high_${Date.now()}`,
        message: 'Extended high tension may exhaust readers',
        type: 'tension',
        priority: 'medium',
        title: 'Sustained High Tension',
        description: 'Extended high tension may exhaust readers',
        specificChanges: this.suggestionTemplates.get('tension_high') || [],
        expectedImpact: {
          tensionChange: -15,
          empathyChange: 20,
          engagementChange: 10,
          complexityChange: -10,
        },
        targetPositions: highTensionSections,
        riskLevel: 'medium',
        implementationDifficulty: 'easy',
        estimatedTime: 25,
        impact: 'medium',
        difficulty: 'easy',
        category: 'tension',
        confidence: 0.7,
      });
    }

    return suggestions;
  }

  /**
   * Analyzes empathy enhancement opportunities
   */
  private analyzeEmpathyOpportunities(
    arc: EmotionalArc,
    simulation: ArcSimulationResult
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Find low empathy sections
    const lowEmpathySections =
      simulation.tensionCurve
        ?.filter(curve => curve.empathy && curve.empathy < 40)
        ?.map(curve => curve.position) || [];

    if (lowEmpathySections.length > 0) {
      suggestions.push({
        id: `empathy_low_${Date.now()}`,
        message: 'Sections with low reader empathy potential',
        type: 'empathy',
        priority: 'medium',
        title: 'Empathy Enhancement Opportunities',
        description: 'Sections with low reader empathy potential',
        specificChanges: this.suggestionTemplates.get('empathy_low') || [],
        expectedImpact: {
          tensionChange: 5,
          empathyChange: 30,
          engagementChange: 15,
          complexityChange: 10,
        },
        targetPositions: lowEmpathySections,
        riskLevel: 'low',
        implementationDifficulty: 'medium',
        estimatedTime: 35,
        impact: 'medium',
        difficulty: 'medium',
        category: 'empathy',
        confidence: 0.8,
      });
    }

    // Check for character development opportunities
    const characterBeats = arc.beats.filter(beat => beat.intensity > 60);
    const characterIds = [
      ...new Set(characterBeats.map(beat => beat.characterId)),
    ];

    if (characterIds.length < 2) {
      suggestions.push({
        id: `character_dev_${Date.now()}`,
        message: 'Consider developing secondary characters more deeply',
        type: 'empathy',
        priority: 'low',
        title: 'Character Development Balance',
        description: 'Consider developing secondary characters more deeply',
        specificChanges: this.suggestionTemplates.get('character_dev') || [],
        expectedImpact: {
          tensionChange: 10,
          empathyChange: 25,
          engagementChange: 15,
          complexityChange: 20,
        },
        targetPositions: [0.3, 0.6, 0.8], // Suggest strategic positions
        riskLevel: 'low',
        implementationDifficulty: 'hard',
        estimatedTime: 60,
        impact: 'low',
        difficulty: 'hard',
        category: 'empathy',
        confidence: 0.6,
      });
    }

    return suggestions;
  }

  /**
   * Analyzes engagement risks
   */
  private analyzeEngagementRisks(
    simulation: ArcSimulationResult
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Check for engagement drops
    if (
      simulation.readerEngagement?.predictedDrops &&
      simulation.readerEngagement.predictedDrops.length > 0
    ) {
      suggestions.push({
        id: `engagement_drops_${Date.now()}`,
        message: 'Sections at risk of losing reader interest',
        type: 'engagement',
        priority: 'high',
        title: 'Reader Engagement Risks',
        description: 'Sections at risk of losing reader interest',
        specificChanges: this.suggestionTemplates.get('engagement_drops') || [],
        expectedImpact: {
          tensionChange: 20,
          empathyChange: 10,
          engagementChange: 30,
          complexityChange: 15,
        },
        targetPositions: simulation.readerEngagement?.predictedDrops || [],
        riskLevel: 'medium',
        implementationDifficulty: 'medium',
        estimatedTime: 40,
        impact: 'high',
        difficulty: 'medium',
        category: 'engagement',
        confidence: 0.9,
      });
    }

    return suggestions;
  }

  /**
   * Analyzes complexity issues
   */
  private analyzeComplexityIssues(
    _arc: EmotionalArc,
    simulation: ArcSimulationResult
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Check emotional complexity
    if (
      simulation.readerEngagement?.emotionalComplexity &&
      simulation.readerEngagement.emotionalComplexity > 80
    ) {
      suggestions.push({
        id: `complexity_high_${Date.now()}`,
        message: 'High emotional complexity may confuse readers',
        type: 'complexity',
        priority: 'medium',
        title: 'Emotional Complexity Management',
        description: 'High emotional complexity may confuse readers',
        specificChanges: this.suggestionTemplates.get('complexity_high') || [],
        expectedImpact: {
          tensionChange: -10,
          empathyChange: 15,
          engagementChange: 10,
          complexityChange: -20,
        },
        targetPositions:
          simulation.readerEngagement?.highEngagementSections || [],
        riskLevel: 'medium',
        implementationDifficulty: 'hard',
        estimatedTime: 50,
        impact: 'medium',
        difficulty: 'hard',
        category: 'complexity',
        confidence: 0.7,
      });
    }

    return suggestions;
  }

  /**
   * Calculates overall optimization score
   */
  private calculateOptimizationScore(
    suggestions: OptimizationSuggestion[]
  ): number {
    const priorityWeights = { high: 3, medium: 2, low: 1 };

    const totalScore = suggestions.reduce((score, suggestion) => {
      const weight = priorityWeights[suggestion.priority || 'medium'];
      const impactScore = suggestion.expectedImpact
        ? (suggestion.expectedImpact.tensionChange +
            suggestion.expectedImpact.empathyChange +
            suggestion.expectedImpact.engagementChange) /
          3
        : 0;

      return score + weight * impactScore;
    }, 0);

    return Math.min(100, totalScore / suggestions.length);
  }

  /**
   * Determines implementation order for suggestions
   */
  private determineImplementationOrder(
    suggestions: OptimizationSuggestion[]
  ): string[] {
    // Sort by priority and impact
    const sortedSuggestions = suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority || 'medium'];
      const bPriority = priorityOrder[b.priority || 'medium'];

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      const aImpact = a.expectedImpact?.engagementChange || 0;
      const bImpact = b.expectedImpact?.engagementChange || 0;
      return bImpact - aImpact;
    });

    return sortedSuggestions.map(
      suggestion => suggestion.title || 'Untitled suggestion'
    );
  }

  /**
   * Assesses risks for optimization suggestions
   */
  private assessOptimizationRisks(suggestions: OptimizationSuggestion[]): {
    highRisk: string[];
    mediumRisk: string[];
    lowRisk: string[];
  } {
    const highRisk: string[] = [];
    const mediumRisk: string[] = [];
    const lowRisk: string[] = [];

    suggestions.forEach(suggestion => {
      const riskLevel =
        this.riskAssessmentRules.get(suggestion.type || 'tension') || 'medium';

      if (riskLevel === 'high') {
        highRisk.push(suggestion.title || 'Untitled suggestion');
      } else if (riskLevel === 'medium') {
        mediumRisk.push(suggestion.title || 'Untitled suggestion');
      } else {
        lowRisk.push(suggestion.title || 'Untitled suggestion');
      }
    });

    return { highRisk, mediumRisk, lowRisk };
  }

  /**
   * Calculates estimated improvements from suggestions
   */
  private calculateEstimatedImprovement(
    suggestions: OptimizationSuggestion[]
  ): {
    tension: number;
    empathy: number;
    engagement: number;
    overall: number;
  } {
    const totalImpact = suggestions.reduce(
      (total, suggestion) => {
        const impact = suggestion.expectedImpact || {
          tensionChange: 0,
          empathyChange: 0,
          engagementChange: 0,
        };
        return {
          tension: total.tension + impact.tensionChange,
          empathy: total.empathy + impact.empathyChange,
          engagement: total.engagement + impact.engagementChange,
          overall:
            total.overall +
            (impact.tensionChange +
              impact.empathyChange +
              impact.engagementChange) /
              3,
        };
      },
      { tension: 0, empathy: 0, engagement: 0, overall: 0 }
    );

    return {
      tension: Math.round(totalImpact.tension),
      empathy: Math.round(totalImpact.empathy),
      engagement: Math.round(totalImpact.engagement),
      overall: Math.round(totalImpact.overall),
    };
  }

  /**
   * Initializes suggestion templates
   */
  private initializeTemplates(): void {
    this.suggestionTemplates = new Map([
      [
        'pacing_slow',
        [
          'Add conflict or stakes to slow sections',
          'Introduce new character dynamics',
          'Increase scene urgency or time pressure',
        ],
      ],
      [
        'pacing_fast',
        [
          'Add breathing room between intense scenes',
          'Include character reflection moments',
          'Balance action with emotional processing',
        ],
      ],
      [
        'tension_gaps',
        [
          'Introduce minor conflicts or obstacles',
          'Add character internal struggles',
          'Create external pressures or deadlines',
        ],
      ],
      [
        'tension_high',
        [
          'Add relief moments or humor',
          'Include character bonding scenes',
          'Provide emotional resolution opportunities',
        ],
      ],
      [
        'empathy_low',
        [
          'Add character vulnerability moments',
          'Include character backstory or motivations',
          'Create shared emotional experiences',
        ],
      ],
      [
        'character_dev',
        [
          'Add POV scenes for secondary characters',
          'Include character-specific emotional beats',
          'Create character relationship dynamics',
        ],
      ],
      [
        'engagement_drops',
        [
          'Add plot twists or revelations',
          'Introduce new story elements',
          'Increase character stakes or consequences',
        ],
      ],
      [
        'complexity_high',
        [
          'Simplify character emotional states',
          'Clarify character motivations',
          'Reduce simultaneous emotional conflicts',
        ],
      ],
    ]);
  }

  /**
   * Initializes risk assessment rules
   */
  private initializeRiskRules(): void {
    this.riskAssessmentRules = new Map([
      ['pacing', 'medium'],
      ['tension', 'medium'],
      ['empathy', 'low'],
      ['engagement', 'high'],
      ['complexity', 'medium'],
    ]);
  }

  /**
   * Determines overall priority based on suggestions
   */
  private determineOverallPriority(
    suggestions: OptimizationSuggestion[]
  ): 'high' | 'medium' | 'low' {
    const highPriorityCount = suggestions.filter(
      s => s.priority === 'high'
    ).length;
    const mediumPriorityCount = suggestions.filter(
      s => s.priority === 'medium'
    ).length;

    if (highPriorityCount > 0) return 'high';
    if (mediumPriorityCount > 0) return 'medium';
    return 'low';
  }

  /**
   * Calculates overall estimated impact from suggestions
   */
  private calculateOverallEstimatedImpact(
    suggestions: OptimizationSuggestion[]
  ): number {
    if (suggestions.length === 0) return 0;

    const totalImpact = suggestions.reduce((total, suggestion) => {
      const impact = suggestion.expectedImpact;
      if (impact) {
        return (
          total +
          (impact.tensionChange +
            impact.empathyChange +
            impact.engagementChange) /
            3
        );
      }
      return total;
    }, 0);

    return Math.round(totalImpact / suggestions.length);
  }
}
