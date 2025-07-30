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
  ArcSegment,
  EmotionalBeat,
  OptimizationSuggestion,
  StoryOptimizationPlan,
  ArcSimulationResult,
  SceneEmotionData
} from '../types/emotionTypes';
import { TENSION_THRESHOLDS, ENGAGEMENT_THRESHOLDS } from '../constants/emotions';

export class SuggestionEngine {
  private suggestionTemplates: Map<string, string[]>;
  private riskAssessmentRules: Map<string, 'low' | 'medium' | 'high'>;

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
    const empathySuggestions = this.analyzeEmpathyOpportunities(arc, simulation);
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
    const estimatedImprovement = this.calculateEstimatedImprovement(suggestions);

    return {
      suggestions,
      overallScore,
      implementationOrder,
      riskAssessment,
      estimatedImprovement
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
      const currentBeat = sceneBeats.find(beat => beat.emotion === targetEmotion);
      
      if (currentBeat) {
        const intensityDiff = targetIntensity - currentBeat.intensity;
        
        if (intensityDiff > 20) {
          recommendations.push(`Increase ${targetEmotion} intensity by adding more emotional language and physical reactions`);
        } else if (intensityDiff < -20) {
          recommendations.push(`Reduce ${targetEmotion} intensity by softening language and reactions`);
        }
      } else {
        recommendations.push(`Introduce ${targetEmotion} emotion through character dialogue and internal thoughts`);
      }
    }
    
    // General pacing recommendations
    if (sceneBeats.length < 2) {
      recommendations.push('Add more emotional beats to create character depth');
    }
    
    if (sceneBeats.some(beat => beat.intensity > 80)) {
      recommendations.push('Consider easing emotional intensity to prevent reader fatigue');
    }
    
    if (sceneBeats.some(beat => beat.intensity < 20)) {
      recommendations.push('Add emotional stakes to increase reader engagement');
    }
    
    return recommendations;
  }

  /**
   * Analyzes pacing issues in the story
   */
  private analyzePacingIssues(simulation: ArcSimulationResult): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Check for slow sections
    if (simulation.pacingAnalysis.slowSections.length > 2) {
      suggestions.push({
        id: `pacing_slow_${Date.now()}`,
        type: 'pacing',
        priority: 'high',
        title: 'Pacing Lulls Detected',
        description: 'Multiple slow sections may cause reader disengagement',
        specificChanges: this.suggestionTemplates.get('pacing_slow') || [],
        expectedImpact: {
          tensionChange: 15,
          empathyChange: 5,
          engagementChange: 20,
          complexityChange: 10
        },
        targetPositions: simulation.pacingAnalysis.slowSections,
        riskLevel: 'medium',
        implementationDifficulty: 'medium',
        estimatedTime: 30
      });
    }
    
    // Check for overly fast sections
    if (simulation.pacingAnalysis.fastSections.length > 3) {
      suggestions.push({
        id: `pacing_fast_${Date.now()}`,
        type: 'pacing',
        priority: 'medium',
        title: 'Rapid Pacing Clusters',
        description: 'Too many fast-paced sections may overwhelm readers',
        specificChanges: this.suggestionTemplates.get('pacing_fast') || [],
        expectedImpact: {
          tensionChange: -10,
          empathyChange: 15,
          engagementChange: 5,
          complexityChange: -5
        },
        targetPositions: simulation.pacingAnalysis.fastSections,
        riskLevel: 'low',
        implementationDifficulty: 'easy',
        estimatedTime: 20
      });
    }
    
    return suggestions;
  }

  /**
   * Analyzes tension distribution issues
   */
  private analyzeTensionDistribution(simulation: ArcSimulationResult): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Check for tension gaps
    const tensionGaps = simulation.tensionCurve
      .filter(curve => curve.tension < TENSION_THRESHOLDS.low_tension)
      .map(curve => curve.position);
    
    if (tensionGaps.length > 2) {
      suggestions.push({
        id: `tension_gaps_${Date.now()}`,
        type: 'tension',
        priority: 'high',
        title: 'Tension Gaps Identified',
        description: 'Low tension sections may cause reader disengagement',
        specificChanges: this.suggestionTemplates.get('tension_gaps') || [],
        expectedImpact: {
          tensionChange: 25,
          empathyChange: 10,
          engagementChange: 20,
          complexityChange: 15
        },
        targetPositions: tensionGaps,
        riskLevel: 'low',
        implementationDifficulty: 'medium',
        estimatedTime: 45
      });
    }
    
    // Check for sustained high tension
    const highTensionSections = simulation.tensionCurve
      .filter(curve => curve.tension > TENSION_THRESHOLDS.high_tension)
      .map(curve => curve.position);
    
    if (highTensionSections.length > 3) {
      suggestions.push({
        id: `tension_high_${Date.now()}`,
        type: 'tension',
        priority: 'medium',
        title: 'Sustained High Tension',
        description: 'Extended high tension may exhaust readers',
        specificChanges: this.suggestionTemplates.get('tension_high') || [],
        expectedImpact: {
          tensionChange: -15,
          empathyChange: 20,
          engagementChange: 10,
          complexityChange: -10
        },
        targetPositions: highTensionSections,
        riskLevel: 'medium',
        implementationDifficulty: 'easy',
        estimatedTime: 25
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
    const lowEmpathySections = simulation.tensionCurve
      .filter(curve => curve.empathy < 40)
      .map(curve => curve.position);
    
    if (lowEmpathySections.length > 0) {
      suggestions.push({
        id: `empathy_low_${Date.now()}`,
        type: 'empathy',
        priority: 'medium',
        title: 'Empathy Enhancement Opportunities',
        description: 'Sections with low reader empathy potential',
        specificChanges: this.suggestionTemplates.get('empathy_low') || [],
        expectedImpact: {
          tensionChange: 5,
          empathyChange: 30,
          engagementChange: 15,
          complexityChange: 10
        },
        targetPositions: lowEmpathySections,
        riskLevel: 'low',
        implementationDifficulty: 'medium',
        estimatedTime: 35
      });
    }
    
    // Check for character development opportunities
    const characterBeats = arc.beats.filter(beat => beat.intensity > 60);
    const characterIds = [...new Set(characterBeats.map(beat => beat.characterId))];
    
    if (characterIds.length < 2) {
      suggestions.push({
        id: `character_dev_${Date.now()}`,
        type: 'empathy',
        priority: 'low',
        title: 'Character Development Balance',
        description: 'Consider developing secondary characters more deeply',
        specificChanges: this.suggestionTemplates.get('character_dev') || [],
        expectedImpact: {
          tensionChange: 10,
          empathyChange: 25,
          engagementChange: 15,
          complexityChange: 20
        },
        targetPositions: [0.3, 0.6, 0.8], // Suggest strategic positions
        riskLevel: 'low',
        implementationDifficulty: 'hard',
        estimatedTime: 60
      });
    }
    
    return suggestions;
  }

  /**
   * Analyzes engagement risks
   */
  private analyzeEngagementRisks(simulation: ArcSimulationResult): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Check for engagement drops
    if (simulation.readerEngagement.predictedDrops.length > 0) {
      suggestions.push({
        id: `engagement_drops_${Date.now()}`,
        type: 'engagement',
        priority: 'high',
        title: 'Reader Engagement Risks',
        description: 'Sections at risk of losing reader interest',
        specificChanges: this.suggestionTemplates.get('engagement_drops') || [],
        expectedImpact: {
          tensionChange: 20,
          empathyChange: 10,
          engagementChange: 30,
          complexityChange: 15
        },
        targetPositions: simulation.readerEngagement.predictedDrops,
        riskLevel: 'medium',
        implementationDifficulty: 'medium',
        estimatedTime: 40
      });
    }
    
    return suggestions;
  }

  /**
   * Analyzes complexity issues
   */
  private analyzeComplexityIssues(
    arc: EmotionalArc,
    simulation: ArcSimulationResult
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Check emotional complexity
    if (simulation.readerEngagement.emotionalComplexity > 80) {
      suggestions.push({
        id: `complexity_high_${Date.now()}`,
        type: 'complexity',
        priority: 'medium',
        title: 'Emotional Complexity Management',
        description: 'High emotional complexity may confuse readers',
        specificChanges: this.suggestionTemplates.get('complexity_high') || [],
        expectedImpact: {
          tensionChange: -10,
          empathyChange: 15,
          engagementChange: 10,
          complexityChange: -20
        },
        targetPositions: simulation.readerEngagement.highEngagementSections,
        riskLevel: 'medium',
        implementationDifficulty: 'hard',
        estimatedTime: 50
      });
    }
    
    return suggestions;
  }

  /**
   * Calculates overall optimization score
   */
  private calculateOptimizationScore(suggestions: OptimizationSuggestion[]): number {
    const priorityWeights = { high: 3, medium: 2, low: 1 };
    
    const totalScore = suggestions.reduce((score, suggestion) => {
      const weight = priorityWeights[suggestion.priority];
      const impactScore = (
        suggestion.expectedImpact.tensionChange +
        suggestion.expectedImpact.empathyChange +
        suggestion.expectedImpact.engagementChange
      ) / 3;
      
      return score + (weight * impactScore);
    }, 0);
    
    return Math.min(100, totalScore / suggestions.length);
  }

  /**
   * Determines implementation order for suggestions
   */
  private determineImplementationOrder(suggestions: OptimizationSuggestion[]): string[] {
    // Sort by priority and impact
    const sortedSuggestions = suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      const aImpact = a.expectedImpact.engagementChange;
      const bImpact = b.expectedImpact.engagementChange;
      return bImpact - aImpact;
    });
    
    return sortedSuggestions.map(suggestion => suggestion.title);
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
      const riskLevel = this.riskAssessmentRules.get(suggestion.type) || 'medium';
      
      if (riskLevel === 'high') {
        highRisk.push(suggestion.title);
      } else if (riskLevel === 'medium') {
        mediumRisk.push(suggestion.title);
      } else {
        lowRisk.push(suggestion.title);
      }
    });
    
    return { highRisk, mediumRisk, lowRisk };
  }

  /**
   * Calculates estimated improvements from suggestions
   */
  private calculateEstimatedImprovement(suggestions: OptimizationSuggestion[]): {
    tension: number;
    empathy: number;
    engagement: number;
    overall: number;
  } {
    const totalImpact = suggestions.reduce((total, suggestion) => ({
      tension: total.tension + suggestion.expectedImpact.tensionChange,
      empathy: total.empathy + suggestion.expectedImpact.empathyChange,
      engagement: total.engagement + suggestion.expectedImpact.engagementChange,
      overall: total.overall + (
        suggestion.expectedImpact.tensionChange +
        suggestion.expectedImpact.empathyChange +
        suggestion.expectedImpact.engagementChange
      ) / 3
    }), { tension: 0, empathy: 0, engagement: 0, overall: 0 });

    return {
      tension: Math.round(totalImpact.tension),
      empathy: Math.round(totalImpact.empathy),
      engagement: Math.round(totalImpact.engagement),
      overall: Math.round(totalImpact.overall)
    };
  }

  /**
   * Initializes suggestion templates
   */
  private initializeTemplates(): void {
    this.suggestionTemplates = new Map([
      ['pacing_slow', [
        'Add conflict or stakes to slow sections',
        'Introduce new character dynamics',
        'Increase scene urgency or time pressure'
      ]],
      ['pacing_fast', [
        'Add breathing room between intense scenes',
        'Include character reflection moments',
        'Balance action with emotional processing'
      ]],
      ['tension_gaps', [
        'Introduce minor conflicts or obstacles',
        'Add character internal struggles',
        'Create external pressures or deadlines'
      ]],
      ['tension_high', [
        'Add relief moments or humor',
        'Include character bonding scenes',
        'Provide emotional resolution opportunities'
      ]],
      ['empathy_low', [
        'Add character vulnerability moments',
        'Include character backstory or motivations',
        'Create shared emotional experiences'
      ]],
      ['character_dev', [
        'Add POV scenes for secondary characters',
        'Include character-specific emotional beats',
        'Create character relationship dynamics'
      ]],
      ['engagement_drops', [
        'Add plot twists or revelations',
        'Introduce new story elements',
        'Increase character stakes or consequences'
      ]],
      ['complexity_high', [
        'Simplify character emotional states',
        'Clarify character motivations',
        'Reduce simultaneous emotional conflicts'
      ]]
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
      ['complexity', 'medium']
    ]);
  }
} 