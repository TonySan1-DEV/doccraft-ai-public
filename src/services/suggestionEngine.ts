// MCP Context Block
/*
{
  file: "suggestionEngine.ts",
  role: "analyzer",
  allowedActions: ["analyze", "simulate", "visualize", "suggest"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_suite"
}
*/

import { EmotionalArc } from '../types/EmotionalArc';
import { ArcSimulationResult } from './arcSimulator';

export interface OptimizationSuggestion {
  type: 'pacing' | 'tension' | 'empathy' | 'engagement' | 'complexity';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  specificChanges: string[];
  expectedImpact: {
    tensionChange: number;
    empathyChange: number;
    engagementChange: number;
  };
  targetPositions: number[];
}

export interface StoryOptimizationPlan {
  suggestions: OptimizationSuggestion[];
  overallScore: number;
  implementationOrder: string[];
  riskAssessment: {
    highRisk: string[];
    mediumRisk: string[];
    lowRisk: string[];
  };
}

// AI-powered suggestion engine for story optimization
export function generateOptimizationSuggestions(
  arc: EmotionalArc,
  simulation: ArcSimulationResult
): StoryOptimizationPlan {
  const suggestions: OptimizationSuggestion[] = [];

  // Analyze pacing issues
  const pacingSuggestions = analyzePacingIssues(simulation);
  suggestions.push(...pacingSuggestions);

  // Analyze tension distribution
  const tensionSuggestions = analyzeTensionDistribution(simulation);
  suggestions.push(...tensionSuggestions);

  // Analyze empathy opportunities
  const empathySuggestions = analyzeEmpathyOpportunities(arc, simulation);
  suggestions.push(...empathySuggestions);

  // Analyze engagement risks
  const engagementSuggestions = analyzeEngagementRisks(simulation);
  suggestions.push(...engagementSuggestions);

  // Calculate overall optimization score
  const overallScore = calculateOptimizationScore(suggestions);

  // Determine implementation order
  const implementationOrder = determineImplementationOrder(suggestions);

  // Assess risks
  const riskAssessment = assessOptimizationRisks(suggestions);

  return {
    suggestions,
    overallScore,
    implementationOrder,
    riskAssessment,
  };
}

function analyzePacingIssues(
  simulation: ArcSimulationResult
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];

  // Check for slow sections
  if (simulation.pacingAnalysis?.slowSections?.length > 2) {
    suggestions.push({
      type: 'pacing',
      priority: 'high',
      title: 'Pacing Lulls Detected',
      description: 'Multiple slow sections may cause reader disengagement',
      specificChanges: [
        'Add conflict or stakes to slow sections',
        'Introduce new character dynamics',
        'Increase scene urgency or time pressure',
      ],
      expectedImpact: {
        tensionChange: 15,
        empathyChange: 5,
        engagementChange: 20,
      },
      targetPositions: simulation.pacingAnalysis?.slowSections || [],
    });
  }

  // Check for overly fast sections
  if (simulation.pacingAnalysis?.fastSections?.length > 3) {
    suggestions.push({
      type: 'pacing',
      priority: 'medium',
      title: 'Rapid Pacing Clusters',
      description: 'Too many fast-paced sections may overwhelm readers',
      specificChanges: [
        'Add breathing room between intense scenes',
        'Include character reflection moments',
        'Balance action with emotional processing',
      ],
      expectedImpact: {
        tensionChange: -10,
        empathyChange: 15,
        engagementChange: 5,
      },
      targetPositions: simulation.pacingAnalysis?.fastSections || [],
    });
  }

  return suggestions;
}

function analyzeTensionDistribution(
  simulation: ArcSimulationResult
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];

  // Check for tension gaps
  const tensionGaps =
    simulation.tensionCurve
      ?.filter(curve => curve.tension < 30)
      ?.map(curve => curve.position) || [];

  if (tensionGaps.length > 2) {
    suggestions.push({
      type: 'tension',
      priority: 'high',
      title: 'Tension Gaps Identified',
      description: 'Low tension sections may cause reader disengagement',
      specificChanges: [
        'Introduce minor conflicts or obstacles',
        'Add character internal struggles',
        'Create external pressures or deadlines',
      ],
      expectedImpact: {
        tensionChange: 25,
        empathyChange: 10,
        engagementChange: 20,
      },
      targetPositions: tensionGaps,
    });
  }

  // Check for sustained high tension
  const highTensionSections =
    simulation.tensionCurve
      ?.filter(curve => curve.tension > 80)
      ?.map(curve => curve.position) || [];

  if (highTensionSections.length > 3) {
    suggestions.push({
      type: 'tension',
      priority: 'medium',
      title: 'Sustained High Tension',
      description: 'Extended high tension may exhaust readers',
      specificChanges: [
        'Add relief moments or humor',
        'Include character bonding scenes',
        'Provide emotional resolution opportunities',
      ],
      expectedImpact: {
        tensionChange: -15,
        empathyChange: 20,
        engagementChange: 10,
      },
      targetPositions: highTensionSections,
    });
  }

  return suggestions;
}

function analyzeEmpathyOpportunities(
  arc: EmotionalArc,
  simulation: ArcSimulationResult
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];

  // Find low empathy sections
  const lowEmpathySections =
    simulation.tensionCurve
      ?.filter(curve => curve.empathy < 40)
      ?.map(curve => curve.position) || [];

  if (lowEmpathySections.length > 0) {
    suggestions.push({
      type: 'empathy',
      priority: 'medium',
      title: 'Empathy Enhancement Opportunities',
      description: 'Sections with low reader empathy potential',
      specificChanges: [
        'Add character vulnerability moments',
        'Include character backstory or motivations',
        'Create shared emotional experiences',
      ],
      expectedImpact: {
        tensionChange: 5,
        empathyChange: 30,
        engagementChange: 15,
      },
      targetPositions: lowEmpathySections,
    });
  }

  // Check for character development opportunities
  const characterBeats = arc.beats.filter(beat => beat.intensity > 60);
  const characterIds = [
    ...new Set(characterBeats.map(beat => beat.characterId)),
  ];

  if (characterIds.length < 2) {
    suggestions.push({
      type: 'empathy',
      priority: 'low',
      title: 'Character Development Balance',
      description: 'Consider developing secondary characters more deeply',
      specificChanges: [
        'Add POV scenes for secondary characters',
        'Include character-specific emotional beats',
        'Create character relationship dynamics',
      ],
      expectedImpact: {
        tensionChange: 10,
        empathyChange: 25,
        engagementChange: 15,
      },
      targetPositions: [0.3, 0.6, 0.8], // Suggest strategic positions
    });
  }

  return suggestions;
}

function analyzeEngagementRisks(
  simulation: ArcSimulationResult
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];

  // Check for engagement drops
  if (simulation.readerEngagement?.predictedDrops?.length > 0) {
    suggestions.push({
      type: 'engagement',
      priority: 'high',
      title: 'Reader Engagement Risks',
      description: 'Sections at risk of losing reader interest',
      specificChanges: [
        'Add plot twists or revelations',
        'Introduce new story elements',
        'Increase character stakes or consequences',
      ],
      expectedImpact: {
        tensionChange: 20,
        empathyChange: 10,
        engagementChange: 30,
      },
      targetPositions: simulation.readerEngagement?.predictedDrops || [],
    });
  }

  // Check emotional complexity
  if (simulation.readerEngagement?.emotionalComplexity > 80) {
    suggestions.push({
      type: 'complexity',
      priority: 'medium',
      title: 'Emotional Complexity Management',
      description: 'High emotional complexity may confuse readers',
      specificChanges: [
        'Simplify character emotional states',
        'Clarify character motivations',
        'Reduce simultaneous emotional conflicts',
      ],
      expectedImpact: {
        tensionChange: -10,
        empathyChange: 15,
        engagementChange: 10,
      },
        targetPositions: simulation.readerEngagement?.highEngagementSections || [],
    });
  }

  return suggestions;
}

function calculateOptimizationScore(
  suggestions: OptimizationSuggestion[]
): number {
  const priorityWeights = { high: 3, medium: 2, low: 1 };

  const totalScore = suggestions.reduce((score, suggestion) => {
    const weight = priorityWeights[suggestion.priority];
    const impactScore =
      (suggestion.expectedImpact.tensionChange +
        suggestion.expectedImpact.empathyChange +
        suggestion.expectedImpact.engagementChange) /
      3;

    return score + weight * impactScore;
  }, 0);

  return Math.min(100, totalScore / suggestions.length);
}

function determineImplementationOrder(
  suggestions: OptimizationSuggestion[]
): string[] {
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

function assessOptimizationRisks(suggestions: OptimizationSuggestion[]): {
  highRisk: string[];
  mediumRisk: string[];
  lowRisk: string[];
} {
  const highRisk: string[] = [];
  const mediumRisk: string[] = [];
  const lowRisk: string[] = [];

  suggestions.forEach(suggestion => {
    const riskLevel = assessSuggestionRisk(suggestion);

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

function assessSuggestionRisk(
  suggestion: OptimizationSuggestion
): 'high' | 'medium' | 'low' {
  // High risk: major structural changes or high tension modifications
  if (suggestion.type === 'pacing' && suggestion.priority === 'high') {
    return 'high';
  }

  // Medium risk: moderate changes to tension or empathy
  if (suggestion.type === 'tension' || suggestion.type === 'empathy') {
    return 'medium';
  }

  // Low risk: minor adjustments or complexity management
  return 'low';
}

// Generate specific edit recommendations for a scene
export function generateSceneEditRecommendations(
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
    recommendations.push('Add more emotional beats to create character depth');
  }

  if (sceneBeats.some(beat => beat.intensity > 80)) {
    recommendations.push(
      'Consider easing emotional intensity to prevent reader fatigue'
    );
  }

  return recommendations;
}
