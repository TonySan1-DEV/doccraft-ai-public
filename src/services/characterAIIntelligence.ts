// MCP Context Block
/*
role: ai-engineer,
tier: Pro,
file: "src/services/characterAIIntelligence.ts",
allowedActions: ["analyze", "enhance", "validate"],
theme: "character_intelligence"
*/

import { CharacterPersona } from '../types/CharacterPersona';

// Helper functions to safely access character properties
function getPersonalityTraits(character: CharacterPersona): string[] {
  // Try new structure first, fallback to legacy
  if (character.personalityDetails?.traits) {
    return character.personalityDetails.traits;
  }
  // TODO: Parse legacy personality string if needed
  return [];
}

function getPersonalityStrengths(character: CharacterPersona): string[] {
  if (character.personalityDetails?.strengths) {
    return character.personalityDetails.strengths;
  }
  return [];
}

function getPersonalityWeaknesses(character: CharacterPersona): string[] {
  if (character.personalityDetails?.weaknesses) {
    return character.personalityDetails.weaknesses;
  }
  return [];
}

function getPersonalityFears(character: CharacterPersona): string[] {
  if (character.personalityDetails?.fears) {
    return character.personalityDetails.fears;
  }
  return [];
}

function getPersonalityDesires(character: CharacterPersona): string[] {
  if (character.personalityDetails?.desires) {
    return character.personalityDetails.desires;
  }
  return [];
}

function getGoalsPrimary(character: CharacterPersona): string {
  if (character.goalsDetails?.primary) {
    return character.goalsDetails.primary;
  }
  // Fallback to legacy goals string
  return character.goals || '';
}

function getGoalsInternal(character: CharacterPersona): string {
  if (character.goalsDetails?.internal) {
    return character.goalsDetails.internal;
  }
  return '';
}

function getGoalsExternal(character: CharacterPersona): string {
  if (character.goalsDetails?.external) {
    return character.goalsDetails.external;
  }
  return '';
}

function getGoalsSecondary(character: CharacterPersona): string[] {
  if (character.goalsDetails?.secondary) {
    return character.goalsDetails.secondary;
  }
  return [];
}

function getRelationships(
  character: CharacterPersona
): Array<{ name: string; relationship: string; description?: string }> {
  if (character.relationships) {
    return character.relationships;
  }
  // Fallback to legacy knownConnections
  return character.knownConnections || [];
}

export class CharacterAIIntelligenceService {
  async analyzeCharacterDepth(character: CharacterPersona): Promise<string[]> {
    const insights: string[] = [];

    const traits = getPersonalityTraits(character);
    const strengths = getPersonalityStrengths(character);
    const weaknesses = getPersonalityWeaknesses(character);
    const fears = getPersonalityFears(character);
    const desires = getPersonalityDesires(character);
    const goalsPrimary = getGoalsPrimary(character);
    const goalsInternal = getGoalsInternal(character);
    const goalsExternal = getGoalsExternal(character);
    const relationships = getRelationships(character);

    // Analyze personality depth
    if (traits.length > 0) {
      insights.push(
        `Character has ${traits.length} defined traits`,
        `Traits provide foundation for consistent behavior`
      );
    }

    if (strengths.length > 0) {
      insights.push(
        `Character has ${strengths.length} identified strengths`,
        `Strengths can be leveraged in conflicts and challenges`
      );
    }

    if (weaknesses.length > 0) {
      insights.push(
        `Character has ${weaknesses.length} acknowledged weaknesses`,
        `Weaknesses create internal conflicts and growth opportunities`
      );
    }

    if (fears.length > 0) {
      insights.push(
        `Character has ${fears.length} specific fears`,
        `Fears drive motivation and create tension`
      );
    }

    if (desires.length > 0) {
      insights.push(
        `Character has ${desires.length} core desires`,
        `Desires create internal and external conflicts`
      );
    }

    // Analyze goals complexity
    if (goalsPrimary && goalsPrimary.length > 10) {
      insights.push(
        `Character has a well-defined primary goal`,
        `Primary goal provides clear direction`
      );
    }

    if (goalsInternal && goalsInternal.length > 10) {
      insights.push(
        `Character has internal motivations`,
        `Internal goals create depth and complexity`
      );
    }

    if (goalsExternal && goalsExternal.length > 10) {
      insights.push(
        `Character has external objectives`,
        `External goals drive plot and interactions`
      );
    }

    // Analyze relationships
    if (relationships.length > 0) {
      insights.push(
        `Character has ${relationships.length} defined relationships`,
        `Relationships create social dynamics and conflicts`
      );
    }

    return insights;
  }

  async validateCharacterCompleteness(
    character: CharacterPersona
  ): Promise<string[]> {
    const suggestions: string[] = [];

    const traits = getPersonalityTraits(character);
    const strengths = getPersonalityStrengths(character);
    const weaknesses = getPersonalityWeaknesses(character);
    const goalsPrimary = getGoalsPrimary(character);
    const goalsInternal = getGoalsInternal(character);
    const relationships = getRelationships(character);

    // Personality validation
    if (traits.length < 5) {
      suggestions.push(
        'Add more personality traits for depth',
        'Consider Big Five personality factors'
      );
    }

    if (strengths.length < 3) {
      suggestions.push(
        'Define character strengths',
        'Strengths should align with archetype'
      );
    }

    if (weaknesses.length < 2) {
      suggestions.push(
        'Add character weaknesses',
        'Weaknesses create internal conflicts'
      );
    }

    // Goals validation
    if (!goalsPrimary || goalsPrimary.length < 10) {
      suggestions.push(
        'Define a clear primary goal',
        'Primary goal should be specific and measurable'
      );
    }

    if (!goalsInternal || goalsInternal.length < 10) {
      suggestions.push(
        'Add internal motivations',
        'Internal goals create character depth'
      );
    }

    const goalsExternal = getGoalsExternal(character);
    if (!goalsExternal || goalsExternal.length < 10) {
      suggestions.push(
        'Define external objectives',
        'External goals drive plot progression'
      );
    }

    // Relationships validation
    if (relationships.length < 3) {
      suggestions.push(
        'Add more character relationships',
        'Relationships create social dynamics'
      );
    }

    return suggestions;
  }

  async generateDevelopmentPath(
    character: CharacterPersona
  ): Promise<string[]> {
    // TODO: Implement character development path generation
    const traits = getPersonalityTraits(character);
    const weaknesses = getPersonalityWeaknesses(character);
    const goalsInternal = getGoalsInternal(character);
    const relationships = getRelationships(character);

    const developmentSteps: string[] = [];

    // Personality development
    if (traits.length < 3) {
      developmentSteps.push(
        'Expand personality traits',
        'Add specific behavioral patterns',
        'Define emotional responses'
      );
    }

    if (weaknesses.length < 2) {
      developmentSteps.push(
        'Identify character flaws',
        'Create internal conflicts',
        'Define growth challenges'
      );
    }

    if (!goalsInternal) {
      developmentSteps.push(
        'Develop internal motivations',
        'Create personal stakes',
        'Define character arc'
      );
    }

    if (relationships.length < 2) {
      developmentSteps.push(
        'Establish key relationships',
        'Create social dynamics',
        'Define relationship conflicts'
      );
    }

    return developmentSteps;
  }

  async calculateCharacterScore(character: CharacterPersona): Promise<number> {
    let score = 0;

    const traits = getPersonalityTraits(character);
    const strengths = getPersonalityStrengths(character);
    const weaknesses = getPersonalityWeaknesses(character);
    const fears = getPersonalityFears(character);
    const desires = getPersonalityDesires(character);
    const goalsPrimary = getGoalsPrimary(character);
    const goalsInternal = getGoalsInternal(character);
    const goalsExternal = getGoalsExternal(character);
    const goalsSecondary = getGoalsSecondary(character);
    const relationships = getRelationships(character);

    // Personality scoring
    score += traits.length * 0.1;
    score += strengths.length * 0.1;
    score += weaknesses.length * 0.1;
    score += fears.length * 0.1;
    score += desires.length * 0.1;

    // Goals scoring
    if (goalsPrimary) score += 0.2;
    if (goalsInternal) score += 0.2;
    if (goalsExternal) score += 0.2;
    score += goalsSecondary.length * 0.1;

    // Relationships scoring
    if (relationships.length > 0) {
      score += Math.min(relationships.length / 3, 0.1);
    }

    // Bonus for complexity
    if (traits.length > 0 && goalsPrimary) {
      score += 0.1; // Personality-goal alignment
    }

    if (strengths.length >= 2) {
      score += 0.1; // Multiple strengths
    }

    if (weaknesses.length >= 2) {
      score += 0.1; // Internal conflicts
    }

    if (goalsPrimary && goalsInternal && goalsExternal) {
      score += 0.2; // Complete goal structure
    }

    if (relationships.length > 0) {
      score += Math.min(relationships.length / 3, 0.1);
    }

    return Math.min(score, 1.0); // Cap at 1.0
  }

  async generateCharacterInsights(
    character: CharacterPersona
  ): Promise<string[]> {
    const insights: string[] = [];

    const traits = getPersonalityTraits(character);
    const strengths = getPersonalityStrengths(character);
    const weaknesses = getPersonalityWeaknesses(character);
    const goalsPrimary = getGoalsPrimary(character);
    const goalsInternal = getGoalsInternal(character);
    const relationships = getRelationships(character);

    // Personality insights
    if (traits.length >= 3) {
      insights.push(
        'Character has well-defined personality',
        'Traits provide behavioral consistency'
      );
    }

    if (strengths.length >= 2) {
      insights.push(
        'Character has clear strengths',
        'Strengths can be leveraged in conflicts'
      );
    }

    if (goalsPrimary) {
      insights.push(
        'Character has clear motivation',
        'Primary goal drives plot progression'
      );
    }

    if (weaknesses.length > 0) {
      insights.push(
        'Character has internal conflicts',
        'Weaknesses create growth opportunities'
      );
    }

    if (!goalsInternal) {
      insights.push(
        'Character lacks internal motivations',
        'Internal goals would add depth'
      );
    }

    if (relationships.length > 0) {
      insights.push(
        'Character has social connections',
        'Relationships create dynamic interactions'
      );
    }

    return insights;
  }

  async suggestCharacterImprovements(
    character: CharacterPersona
  ): Promise<string[]> {
    const suggestions: string[] = [];

    const traits = getPersonalityTraits(character);
    const weaknesses = getPersonalityWeaknesses(character);
    const goalsInternal = getGoalsInternal(character);
    const relationships = getRelationships(character);

    // Improvement suggestions
    if (traits.length < 3) {
      suggestions.push(
        'Add more personality traits',
        'Define specific behavioral patterns'
      );
    }

    if (weaknesses.length < 2) {
      suggestions.push('Add character weaknesses', 'Create internal conflicts');
    }

    if (!goalsInternal) {
      suggestions.push('Develop internal motivations', 'Add personal stakes');
    }

    if (relationships.length < 2) {
      suggestions.push('Add more relationships', 'Create social dynamics');
    }

    return suggestions;
  }
}
