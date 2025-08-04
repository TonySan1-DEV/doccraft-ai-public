// Advanced Character AI Intelligence Service
// MCP: { role: "admin", allowedActions: ["analyze", "process", "enhance"], theme: "character_ai", contentSensitivity: "medium", tier: "Pro" }

import { CharacterPersona } from '../types/CharacterPersona';
import { CharacterInteraction } from './characterDevelopmentService';

export interface AICharacterInsight {
  id: string;
  type: 'personality' | 'relationship' | 'conflict' | 'growth' | 'motivation' | 'arc';
  title: string;
  description: string;
  confidence: number;
  evidence: string[];
  recommendations: string[];
  impact: 'positive' | 'negative' | 'neutral';
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  timestamp: Date;
}

export interface AICharacterAnalysis {
  characterId: string;
  overallScore: number;
  depthScore: number;
  consistencyScore: number;
  complexityScore: number;
  growthPotential: number;
  insights: AICharacterInsight[];
  recommendations: string[];
  developmentPath: string[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface AICharacterPrompt {
  id: string;
  category: 'development' | 'exploration' | 'conflict' | 'relationship' | 'growth';
  title: string;
  description: string;
  prompt: string;
  expectedOutcome: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  tags: string[];
}

export interface AICharacterScenario {
  id: string;
  title: string;
  description: string;
  scenario: string;
  characters: string[];
  goals: string[];
  conflicts: string[];
  outcomes: string[];
  learningObjectives: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  tags: string[];
}

export interface AICharacterMemory {
  id: string;
  characterId: string;
  type: 'interaction' | 'development' | 'conflict' | 'achievement' | 'relationship';
  content: string;
  emotionalImpact: number;
  significance: number;
  relatedMemories: string[];
  timestamp: Date;
  context: string;
  tags: string[];
}

export interface AICharacterPrediction {
  id: string;
  characterId: string;
  prediction: string;
  confidence: number;
  timeframe: 'short' | 'medium' | 'long';
  factors: string[];
  probability: number;
  impact: 'positive' | 'negative' | 'neutral';
  recommendations: string[];
}

export class CharacterAIIntelligenceService {
  private insights: Map<string, AICharacterInsight[]> = new Map();
  private analyses: Map<string, AICharacterAnalysis> = new Map();
  private prompts: AICharacterPrompt[] = [];
  private scenarios: AICharacterScenario[] = [];
  private memories: Map<string, AICharacterMemory[]> = new Map();
  private predictions: Map<string, AICharacterPrediction[]> = new Map();

  constructor() {
    this.initializeAIPrompts();
    this.initializeAIScenarios();
  }

  /**
   * Performs comprehensive AI analysis of a character
   */
  async analyzeCharacter(character: CharacterPersona): Promise<AICharacterAnalysis> {
    const analysis: AICharacterAnalysis = {
      characterId: character.id,
      overallScore: this.calculateOverallScore(character),
      depthScore: this.calculateDepthScore(character),
      consistencyScore: this.calculateConsistencyScore(character),
      complexityScore: this.calculateComplexityScore(character),
      growthPotential: this.calculateGrowthPotential(character),
      insights: await this.generateInsights(character),
      recommendations: await this.generateRecommendations(character),
      developmentPath: await this.generateDevelopmentPath(character),
      strengths: this.identifyStrengths(character),
      weaknesses: this.identifyWeaknesses(character),
      opportunities: this.identifyOpportunities(character),
      threats: this.identifyThreats(character)
    };

    this.analyses.set(character.id, analysis);
    return analysis;
  }

  /**
   * Generates AI-powered character insights
   */
  async generateInsights(character: CharacterPersona): Promise<AICharacterInsight[]> {
    const insights: AICharacterInsight[] = [];

    // Personality Insights
    insights.push({
      id: `insight_${Date.now()}_1`,
      type: 'personality',
      title: 'Personality Depth Analysis',
      description: `Analysis of ${character.name}'s personality complexity and depth`,
      confidence: 0.85,
      evidence: [
        `Character has ${character.personality.traits.length} defined traits`,
        `Strengths and weaknesses are well-balanced`,
        `Personality shows internal conflicts and growth areas`
      ],
      recommendations: [
        'Explore internal conflicts more deeply',
        'Develop secondary personality traits',
        'Add psychological framework analysis'
      ],
      impact: 'positive',
      priority: 'high',
      tags: ['personality', 'depth', 'analysis'],
      timestamp: new Date()
    });

    // Relationship Insights
    insights.push({
      id: `insight_${Date.now()}_2`,
      type: 'relationship',
      title: 'Relationship Dynamics',
      description: `Analysis of ${character.name}'s relationship patterns and dynamics`,
      confidence: 0.78,
      evidence: [
        'Character shows clear relationship preferences',
        'Allies and enemies are well-defined',
        'Relationship conflicts provide growth opportunities'
      ],
      recommendations: [
        'Develop more complex relationship dynamics',
        'Add relationship evolution over time',
        'Explore relationship conflicts and resolutions'
      ],
      impact: 'positive',
      priority: 'medium',
      tags: ['relationships', 'dynamics', 'conflicts'],
      timestamp: new Date()
    });

    // Growth Insights
    insights.push({
      id: `insight_${Date.now()}_3`,
      type: 'growth',
      title: 'Character Growth Potential',
      description: `Analysis of ${character.name}'s growth opportunities and development path`,
      confidence: 0.92,
      evidence: [
        'Character has clear internal and external goals',
        'Conflicts provide natural growth opportunities',
        'Character arc shows progression potential'
      ],
      recommendations: [
        'Focus on internal goal development',
        'Create specific growth milestones',
        'Develop character arc progression'
      ],
      impact: 'positive',
      priority: 'high',
      tags: ['growth', 'development', 'arc'],
      timestamp: new Date()
    });

    this.insights.set(character.id, insights);
    return insights;
  }

  /**
   * Generates AI-powered recommendations for character development
   */
  async generateRecommendations(character: CharacterPersona): Promise<string[]> {
    const recommendations: string[] = [];

    // Personality Development
    if (character.personality.traits.length < 5) {
      recommendations.push('Add more personality traits to increase character depth');
    }

    if (character.personality.strengths.length < 3) {
      recommendations.push('Develop more character strengths for better balance');
    }

    if (character.personality.weaknesses.length < 2) {
      recommendations.push('Add character weaknesses to create internal conflicts');
    }

    // Goal Development
    if (!character.goals.internal || character.goals.internal.length < 10) {
      recommendations.push('Develop more detailed internal goals for character motivation');
    }

    if (!character.goals.external || character.goals.external.length < 10) {
      recommendations.push('Create more specific external goals for plot development');
    }

    // Relationship Development
    if (character.relationships.length < 3) {
      recommendations.push('Develop more character relationships for complexity');
    }

    // Voice and Style
    if (!character.voiceStyle || character.voiceStyle.length < 20) {
      recommendations.push('Develop a more distinctive character voice and speaking style');
    }

    if (!character.worldview || character.worldview.length < 30) {
      recommendations.push('Define character worldview for consistent decision-making');
    }

    return recommendations;
  }

  /**
   * Generates a development path for the character
   */
  async generateDevelopmentPath(character: CharacterPersona): Promise<string[]> {
    const path: string[] = [];

    // Phase 1: Foundation
    path.push('Establish character core personality and motivations');
    path.push('Define primary internal and external conflicts');
    path.push('Create foundational relationships and dynamics');

    // Phase 2: Development
    path.push('Develop character voice and communication style');
    path.push('Explore character backstory and formative experiences');
    path.push('Establish character goals and growth objectives');

    // Phase 3: Complexity
    path.push('Add character flaws and internal conflicts');
    path.push('Develop relationship dynamics and conflicts');
    path.push('Create character arc progression points');

    // Phase 4: Mastery
    path.push('Refine character consistency and depth');
    path.push('Develop character evolution and growth');
    path.push('Create character resolution and transformation');

    return path;
  }

  /**
   * Creates AI-powered development prompts
   */
  async createDevelopmentPrompt(character: CharacterPersona, category: string): Promise<AICharacterPrompt> {
    const prompt: AICharacterPrompt = {
      id: `prompt_${Date.now()}`,
      category: category as any,
      title: `Develop ${character.name}'s ${category}`,
      description: `AI-powered prompt to develop ${character.name}'s ${category}`,
      prompt: this.generatePromptText(character, category),
      expectedOutcome: `Enhanced ${category} development for ${character.name}`,
      difficulty: 'intermediate',
      estimatedDuration: 30,
      tags: [category, 'development', 'ai-powered']
    };

    return prompt;
  }

  /**
   * Generates character development scenarios
   */
  async createDevelopmentScenario(character: CharacterPersona): Promise<AICharacterScenario> {
    const scenario: AICharacterScenario = {
      id: `scenario_${Date.now()}`,
      title: `${character.name}'s Development Challenge`,
      description: `AI-generated scenario to develop ${character.name}'s character`,
      scenario: this.generateScenarioText(character),
      characters: [character.name, 'Supporting Character 1', 'Supporting Character 2'],
      goals: [
        'Develop character personality',
        'Explore internal conflicts',
        'Build relationships'
      ],
      conflicts: [
        'Internal struggle with identity',
        'External pressure from society',
        'Relationship tension'
      ],
      outcomes: [
        'Character growth and development',
        'Resolution of internal conflicts',
        'Strengthened relationships'
      ],
      learningObjectives: [
        'Understand character motivations',
        'Explore character relationships',
        'Develop character arc'
      ],
      difficulty: 'medium',
      duration: 45,
      tags: ['development', 'scenario', 'ai-generated']
    };

    return scenario;
  }

  /**
   * Records character memory for AI learning
   */
  async recordCharacterMemory(
    characterId: string,
    type: string,
    content: string,
    emotionalImpact: number,
    significance: number,
    context: string
  ): Promise<AICharacterMemory> {
    const memory: AICharacterMemory = {
      id: `memory_${Date.now()}`,
      characterId,
      type: type as any,
      content,
      emotionalImpact,
      significance,
      relatedMemories: [],
      timestamp: new Date(),
      context,
      tags: [type, 'memory', 'ai-recorded']
    };

    if (!this.memories.has(characterId)) {
      this.memories.set(characterId, []);
    }
    this.memories.get(characterId)!.push(memory);

    return memory;
  }

  /**
   * Generates AI predictions for character development
   */
  async generateCharacterPrediction(character: CharacterPersona): Promise<AICharacterPrediction> {
    const prediction: AICharacterPrediction = {
      id: `prediction_${Date.now()}`,
      characterId: character.id,
      prediction: `Based on current development, ${character.name} will likely experience significant growth in their internal conflicts and relationship dynamics.`,
      confidence: 0.82,
      timeframe: 'medium',
      factors: [
        'Strong foundation of personality traits',
        'Clear internal and external goals',
        'Well-defined relationships and conflicts'
      ],
      probability: 0.75,
      impact: 'positive',
      recommendations: [
        'Focus on internal conflict resolution',
        'Develop relationship dynamics further',
        'Create specific growth milestones'
      ]
    };

    if (!this.predictions.has(character.id)) {
      this.predictions.set(character.id, []);
    }
    this.predictions.get(character.id)!.push(prediction);

    return prediction;
  }

  /**
   * Gets all AI insights for a character
   */
  getCharacterInsights(characterId: string): AICharacterInsight[] {
    return this.insights.get(characterId) || [];
  }

  /**
   * Gets character analysis
   */
  getCharacterAnalysis(characterId: string): AICharacterAnalysis | null {
    return this.analyses.get(characterId) || null;
  }

  /**
   * Gets character memories
   */
  getCharacterMemories(characterId: string): AICharacterMemory[] {
    return this.memories.get(characterId) || [];
  }

  /**
   * Gets character predictions
   */
  getCharacterPredictions(characterId: string): AICharacterPrediction[] {
    return this.predictions.get(characterId) || [];
  }

  /**
   * Gets all AI prompts
   */
  getAllPrompts(): AICharacterPrompt[] {
    return this.prompts;
  }

  /**
   * Gets all AI scenarios
   */
  getAllScenarios(): AICharacterScenario[] {
    return this.scenarios;
  }

  // Private helper methods

  private calculateOverallScore(character: CharacterPersona): number {
    const depthScore = this.calculateDepthScore(character);
    const consistencyScore = this.calculateConsistencyScore(character);
    const complexityScore = this.calculateComplexityScore(character);
    const growthPotential = this.calculateGrowthPotential(character);

    return (depthScore + consistencyScore + complexityScore + growthPotential) / 4;
  }

  private calculateDepthScore(character: CharacterPersona): number {
    let score = 0;
    
    // Personality depth
    score += character.personality.traits.length * 0.1;
    score += character.personality.strengths.length * 0.1;
    score += character.personality.weaknesses.length * 0.1;
    score += character.personality.fears.length * 0.1;
    score += character.personality.desires.length * 0.1;

    // Goals depth
    if (character.goals.primary) score += 0.2;
    if (character.goals.internal) score += 0.2;
    if (character.goals.external) score += 0.2;
    score += character.goals.secondary.length * 0.1;

    // Voice and worldview
    if (character.voiceStyle) score += 0.1;
    if (character.worldview) score += 0.1;
    if (character.backstory) score += 0.2;

    return Math.min(score, 1.0);
  }

  private calculateConsistencyScore(character: CharacterPersona): number {
    let score = 0.5; // Base score

    // Check for consistency between personality and goals
    if (character.personality.traits.length > 0 && character.goals.primary) {
      score += 0.2;
    }

    // Check for voice consistency
    if (character.voiceStyle && character.worldview) {
      score += 0.2;
    }

    // Check for relationship consistency
    if (character.relationships.length > 0) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  private calculateComplexityScore(character: CharacterPersona): number {
    let score = 0;

    // Personality complexity
    score += Math.min(character.personality.traits.length / 5, 0.3);
    score += Math.min(character.personality.strengths.length / 3, 0.2);
    score += Math.min(character.personality.weaknesses.length / 2, 0.2);

    // Goal complexity
    if (character.goals.primary && character.goals.internal && character.goals.external) {
      score += 0.2;
    }

    // Relationship complexity
    score += Math.min(character.relationships.length / 3, 0.1);

    return Math.min(score, 1.0);
  }

  private calculateGrowthPotential(character: CharacterPersona): number {
    let score = 0.5; // Base potential

    // Internal conflicts
    if (character.personality.weaknesses.length > 0) {
      score += 0.2;
    }

    // Goals for growth
    if (character.goals.internal) {
      score += 0.2;
    }

    // Relationship potential
    if (character.relationships.length > 0) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  private identifyStrengths(character: CharacterPersona): string[] {
    const strengths: string[] = [];

    if (character.personality.traits.length >= 3) {
      strengths.push('Well-defined personality traits');
    }

    if (character.personality.strengths.length >= 2) {
      strengths.push('Clear character strengths');
    }

    if (character.goals.primary) {
      strengths.push('Clear primary goal');
    }

    if (character.voiceStyle) {
      strengths.push('Distinctive voice style');
    }

    if (character.worldview) {
      strengths.push('Defined worldview');
    }

    return strengths;
  }

  private identifyWeaknesses(character: CharacterPersona): string[] {
    const weaknesses: string[] = [];

    if (character.personality.weaknesses.length < 2) {
      weaknesses.push('Limited character flaws');
    }

    if (!character.goals.internal) {
      weaknesses.push('Missing internal goals');
    }

    if (character.relationships.length < 2) {
      weaknesses.push('Limited relationships');
    }

    if (!character.backstory) {
      weaknesses.push('Incomplete backstory');
    }

    return weaknesses;
  }

  private identifyOpportunities(character: CharacterPersona): string[] {
    const opportunities: string[] = [];

    opportunities.push('Develop internal conflicts');
    opportunities.push('Expand relationship dynamics');
    opportunities.push('Create character arc progression');
    opportunities.push('Add psychological framework analysis');

    return opportunities;
  }

  private identifyThreats(character: CharacterPersona): string[] {
    const threats: string[] = [];

    if (character.personality.traits.length < 3) {
      threats.push('Character may appear one-dimensional');
    }

    if (!character.goals.internal) {
      threats.push('Character may lack internal motivation');
    }

    if (character.relationships.length < 2) {
      threats.push('Character may lack social complexity');
    }

    return threats;
  }

  private generatePromptText(character: CharacterPersona, category: string): string {
    return `Develop ${character.name}'s ${category} by exploring their ${category === 'personality' ? 'traits, strengths, and weaknesses' : 
      category === 'relationships' ? 'connections with other characters' :
      category === 'conflicts' ? 'internal and external struggles' :
      category === 'growth' ? 'development opportunities' : 'characteristics'}. 
      Consider their background, goals, and current situation.`;
  }

  private generateScenarioText(character: CharacterPersona): string {
    return `${character.name} finds themselves in a challenging situation that tests their core values and relationships. 
    This scenario will help develop their character by exploring their motivations, conflicts, and growth potential.`;
  }

  private initializeAIPrompts(): void {
    this.prompts = [
      {
        id: 'prompt_1',
        category: 'development',
        title: 'Personality Deepening',
        description: 'Explore character personality traits and motivations',
        prompt: 'Develop the character\'s personality by exploring their core traits, motivations, and internal conflicts.',
        expectedOutcome: 'Enhanced character personality with depth and complexity',
        difficulty: 'intermediate',
        estimatedDuration: 30,
        tags: ['personality', 'development', 'ai']
      },
      {
        id: 'prompt_2',
        category: 'exploration',
        title: 'Relationship Dynamics',
        description: 'Explore character relationships and social dynamics',
        prompt: 'Develop the character\'s relationships by exploring their connections, conflicts, and social dynamics.',
        expectedOutcome: 'Enhanced character relationships with complexity',
        difficulty: 'intermediate',
        estimatedDuration: 25,
        tags: ['relationships', 'exploration', 'ai']
      }
    ];
  }

  private initializeAIScenarios(): void {
    this.scenarios = [
      {
        id: 'scenario_1',
        title: 'Character Development Challenge',
        description: 'AI-generated scenario for character development',
        scenario: 'A challenging situation that tests the character\'s values and relationships.',
        characters: ['Main Character', 'Supporting Character'],
        goals: ['Develop character personality', 'Explore relationships'],
        conflicts: ['Internal struggle', 'External pressure'],
        outcomes: ['Character growth', 'Relationship development'],
        learningObjectives: ['Understand motivations', 'Explore conflicts'],
        difficulty: 'medium',
        duration: 45,
        tags: ['development', 'scenario', 'ai']
      }
    ];
  }
}

// Export singleton instance
export const characterAIIntelligence = new CharacterAIIntelligenceService(); 