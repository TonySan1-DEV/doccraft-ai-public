// MCP Context Block
/*
role: ai-engineer,
tier: Pro,
file: "src/services/enhancedCharacterInteraction.ts",
allowedActions: ["interact", "enhance", "analyze"],
theme: "character_interaction"
*/

import { CharacterPersona } from '../types/CharacterPersona';

// Helper functions to safely access character properties
function getPersonalityTraits(character: CharacterPersona): string[] {
  if (character.personalityDetails?.traits) {
    return character.personalityDetails.traits;
  }
  return [];
}

function getGoalsPrimary(character: CharacterPersona): string {
  if (character.goalsDetails?.primary) {
    return character.goalsDetails.primary;
  }
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

function getRelationships(
  character: CharacterPersona
): Array<{ name: string; relationship: string; description?: string }> {
  if (character.relationships) {
    return character.relationships;
  }
  return character.knownConnections || [];
}

// Enhanced interfaces for the chat component
export interface InteractionMode {
  type:
    | 'conversation'
    | 'interview'
    | 'therapy'
    | 'conflict'
    | 'bonding'
    | 'mentoring';
  intensity: number;
  focus: string;
  duration: number;
  goals: string[];
}

export interface InteractionContext {
  scene: string;
  mood: string;
  timeOfDay: string;
  location: string;
  otherCharacters: string[];
  recentEvents: string[];
  emotionalState: string;
  conversationTone: string;
}

export interface CharacterResponse {
  content: string;
  emotion?: string;
  intensity?: number;
  bodyLanguage?: string;
  voiceTone?: string;
  thoughtProcess?: string;
  memoryTriggered?: string;
  relationshipImpact?: string;
  developmentInsight?: string;
}

export interface ConversationFlow {
  id: string;
  characterId: string;
  mode: InteractionMode;
  context: InteractionContext;
  messages: CharacterResponse[];
  startTime: Date;
  developmentProgress: number;
  emotionalTrajectory: string[];
}

export interface CharacterInteraction {
  id: string;
  characterId: string;
  type: 'conversation' | 'conflict' | 'cooperation' | 'development';
  content: string;
  emotionalImpact: number;
  significance: number;
  timestamp: Date;
  context: string;
  tags: string[];
}

export interface InteractionFlow {
  id: string;
  characterId: string;
  interactions: CharacterInteraction[];
  currentEmotionalState: string;
  relationshipDynamics: Map<string, number>;
  developmentProgress: number;
  lastUpdated: Date;
}

export class EnhancedCharacterInteractionService {
  private interactionFlows: Map<string, InteractionFlow> = new Map();
  private characterStates: Map<string, CharacterPersona> = new Map();

  async getCharacterState(
    characterId: string
  ): Promise<CharacterPersona | null> {
    return this.characterStates.get(characterId) || null;
  }

  async updateCharacterState(
    characterId: string,
    character: CharacterPersona
  ): Promise<void> {
    this.characterStates.set(characterId, character);
  }

  async processInteraction(
    characterId: string,
    userInput: string,
    context: string
  ): Promise<CharacterInteraction> {
    const character = await this.getCharacterState(characterId);
    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    // Analyze character personality for response generation
    const traits = getPersonalityTraits(character);
    // const _strengths = getPersonalityStrengths(character);
    // const _weaknesses = getPersonalityWeaknesses(character);
    // const _fears = getPersonalityFears(character);
    // const _desires = getPersonalityDesires(character);

    // Generate contextual response based on personality
    let response = await this.generateContextualResponse(
      character,
      userInput,
      context
    );

    // Apply personality-based modifications
    if (traits.includes('curious')) {
      response = await this.addCuriosityElements(response, context);
    }

    if (traits.includes('ambitious')) {
      response = await this.addAmbitionElements(response, context);
    }

    // Create interaction record
    const interaction: CharacterInteraction = {
      id: `interaction_${Date.now()}`,
      characterId,
      type: 'conversation',
      content: response,
      emotionalImpact: this.calculateEmotionalImpact(userInput, response),
      significance: this.calculateSignificance(context),
      timestamp: new Date(),
      context,
      tags: ['enhanced', 'ai-generated'],
    };

    // Update interaction flow
    await this.updateInteractionFlow(characterId, interaction);

    // TODO: Implement insights extraction and application
    await this.extractAndApplyInsights(characterId, context, response);

    return interaction;
  }

  async generateContextualResponse(
    character: CharacterPersona,
    userInput: string,
    context: string
  ): Promise<string> {
    const traits = getPersonalityTraits(character);
    const goalsPrimary = getGoalsPrimary(character);
    const goalsInternal = getGoalsInternal(character);
    const goalsExternal = getGoalsExternal(character);

    // Build response based on character's personality and goals
    let response = `Based on my personality and current situation, `;

    if (traits.length > 0) {
      response += `I approach this with my characteristic traits. `;
    }

    if (goalsPrimary) {
      response += `This relates to my primary goal: ${goalsPrimary}. `;
    }

    if (goalsInternal) {
      response += `Internally, this affects my ${goalsInternal}. `;
    }

    if (goalsExternal) {
      response += `Externally, this impacts my ${goalsExternal}. `;
    }

    response += `I respond to your input: "${userInput}" in the context of ${context}.`;

    return response;
  }

  async addCuriosityElements(
    response: string,
    _context: string
  ): Promise<string> {
    return (
      response +
      ` I'm curious about the implications of this situation and want to explore it further.`
    );
  }

  async addAmbitionElements(
    response: string,
    _context: string
  ): Promise<string> {
    return (
      response +
      ` This presents an opportunity to advance my goals and I'm determined to make the most of it.`
    );
  }

  calculateEmotionalImpact(userInput: string, response: string): number {
    // Simple emotional impact calculation
    const emotionalWords = [
      'happy',
      'sad',
      'angry',
      'excited',
      'worried',
      'confident',
    ];
    const inputWords = userInput.toLowerCase().split(' ');
    const responseWords = response.toLowerCase().split(' ');

    const inputEmotionalCount = inputWords.filter(word =>
      emotionalWords.includes(word)
    ).length;
    const responseEmotionalCount = responseWords.filter(word =>
      emotionalWords.includes(word)
    ).length;

    return Math.min((inputEmotionalCount + responseEmotionalCount) / 10, 1.0);
  }

  calculateSignificance(context: string): number {
    // Simple significance calculation based on context length and keywords
    const significantKeywords = [
      'important',
      'critical',
      'urgent',
      'vital',
      'crucial',
    ];
    const contextWords = context.toLowerCase().split(' ');
    const significantCount = contextWords.filter(word =>
      significantKeywords.includes(word)
    ).length;

    return Math.min(significantCount / 5, 1.0);
  }

  async updateInteractionFlow(
    characterId: string,
    interaction: CharacterInteraction
  ): Promise<void> {
    let flow = this.interactionFlows.get(characterId);

    if (!flow) {
      flow = {
        id: `flow_${characterId}`,
        characterId,
        interactions: [],
        currentEmotionalState: 'neutral',
        relationshipDynamics: new Map(),
        developmentProgress: 0,
        lastUpdated: new Date(),
      };
    }

    flow.interactions.push(interaction);
    flow.lastUpdated = new Date();

    // Update emotional state based on interaction
    if (interaction.emotionalImpact > 0.7) {
      flow.currentEmotionalState = 'intense';
    } else if (interaction.emotionalImpact > 0.4) {
      flow.currentEmotionalState = 'moderate';
    } else {
      flow.currentEmotionalState = 'calm';
    }

    // Update development progress
    flow.developmentProgress = Math.min(
      flow.developmentProgress + interaction.significance * 0.1,
      1.0
    );

    this.interactionFlows.set(characterId, flow);
  }

  async extractAndApplyInsights(
    characterId: string,
    _flow: string,
    _response: string
  ): Promise<void> {
    // TODO: Implement insights extraction and application
    // This method should analyze the interaction and extract insights
    // that can be used to improve future interactions
    console.log(
      `Extracting insights from interaction for character ${characterId}`
    );
  }

  async extractInsightsFromConversation(_flow: string): Promise<string[]> {
    // TODO: Implement conversation analysis for insights
    return ['Interaction pattern detected', 'Emotional response analyzed'];
  }

  async createCharacterFromInteraction(
    characterId: string,
    _interaction: CharacterInteraction
  ): Promise<CharacterPersona> {
    // Create a basic character structure based on interaction
    const character: CharacterPersona = {
      id: characterId,
      user_id: 'system',
      name: `Character_${characterId}`,
      archetype: 'dynamic',
      goals: 'To engage meaningfully in conversations',
      voiceStyle: 'conversational',
      worldview: 'Open to new experiences and learning',
      personality: 'Adaptive and responsive',
      knownConnections: [],
      // TODO: Confirm this field structure with upstream schema
      personalityDetails: {
        traits: ['adaptive', 'responsive', 'curious'],
        strengths: ['communication', 'empathy'],
        weaknesses: ['uncertainty', 'indecision'],
        fears: ['misunderstanding', 'conflict'],
        desires: ['connection', 'understanding'],
      },
      goalsDetails: {
        primary: 'Build meaningful relationships',
        secondary: ['Learn from interactions', 'Grow personally'],
        internal: 'Develop self-understanding',
        external: 'Connect with others',
      },
      relationships: [],
    };

    return character;
  }

  async analyzeInteractionPatterns(characterId: string): Promise<string[]> {
    const flow = this.interactionFlows.get(characterId);
    if (!flow) {
      return ['No interaction patterns found'];
    }

    const patterns: string[] = [];

    if (flow.interactions.length > 10) {
      patterns.push('High interaction frequency');
    }

    if (flow.currentEmotionalState === 'intense') {
      patterns.push('Emotionally intense interactions');
    }

    if (flow.developmentProgress > 0.5) {
      patterns.push('Significant character development');
    }

    return patterns;
  }

  async getInteractionHistory(
    characterId: string
  ): Promise<CharacterInteraction[]> {
    const flow = this.interactionFlows.get(characterId);
    return flow?.interactions || [];
  }

  async getCurrentEmotionalState(characterId: string): Promise<string> {
    const flow = this.interactionFlows.get(characterId);
    return flow?.currentEmotionalState || 'neutral';
  }

  async getDevelopmentProgress(characterId: string): Promise<number> {
    const flow = this.interactionFlows.get(characterId);
    return flow?.developmentProgress || 0;
  }

  // Enhanced methods for the chat component
  async startConversation(
    characterId: string,
    mode: InteractionMode,
    context: InteractionContext
  ): Promise<ConversationFlow> {
    const flow: ConversationFlow = {
      id: `flow_${Date.now()}`,
      characterId,
      mode,
      context,
      messages: [],
      startTime: new Date(),
      developmentProgress: 0,
      emotionalTrajectory: ['neutral'],
    };

    // Store the flow for later use
    this.interactionFlows.set(characterId, {
      id: flow.id,
      characterId,
      interactions: [],
      currentEmotionalState: 'neutral',
      relationshipDynamics: new Map(),
      developmentProgress: 0,
      lastUpdated: new Date(),
    });

    return flow;
  }

  async generateResponse(
    characterId: string,
    userInput: string,
    flow: ConversationFlow,
    context: InteractionContext
  ): Promise<CharacterResponse> {
    // Get character state
    const character = this.characterStates.get(characterId);
    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    // Generate contextual response
    const content = await this.generateContextualResponse(
      character,
      userInput,
      context.scene
    );

    // Calculate emotional impact
    const emotionalImpact = this.calculateEmotionalImpact(userInput, content);

    // Determine emotion based on context and input
    const emotion = this.determineEmotion(userInput, content, context);
    const intensity = Math.min(emotionalImpact, 1.0);

    // Generate response details
    const response: CharacterResponse = {
      content,
      emotion,
      intensity,
      bodyLanguage: this.generateBodyLanguage(emotion, intensity),
      voiceTone: this.generateVoiceTone(emotion, intensity),
      thoughtProcess: this.generateThoughtProcess(
        character,
        userInput,
        context
      ),
      memoryTriggered: this.triggerMemory(character, userInput),
      relationshipImpact: this.calculateRelationshipImpact(
        character,
        userInput
      ),
      developmentInsight: this.generateDevelopmentInsight(
        character,
        userInput,
        flow
      ),
    };

    // Update flow
    flow.messages.push(response);
    flow.developmentProgress = Math.min(flow.developmentProgress + 0.1, 1.0);
    flow.emotionalTrajectory.push(emotion || 'neutral');

    return response;
  }

  async switchInteractionMode(
    flow: ConversationFlow,
    newMode: InteractionMode
  ): Promise<ConversationFlow> {
    return {
      ...flow,
      mode: newMode,
    };
  }

  async analyzeConversationFlow(flow: ConversationFlow): Promise<any> {
    const analysis = {
      duration: Date.now() - flow.startTime.getTime(),
      messageCount: flow.messages.length,
      developmentProgress: flow.developmentProgress,
      emotionalTrajectory: flow.emotionalTrajectory,
      mode: flow.mode.type,
      averageIntensity:
        flow.messages.reduce((sum, msg) => sum + (msg.intensity || 0), 0) /
        Math.max(flow.messages.length, 1),
    };

    return analysis;
  }

  // Helper methods for response generation
  private determineEmotion(
    _input: string,
    _response: string,
    _context: InteractionContext
  ): string {
    const emotions = [
      'joy',
      'sadness',
      'anger',
      'fear',
      'surprise',
      'contempt',
    ];
    const randomIndex = Math.floor(Math.random() * emotions.length);
    return emotions[randomIndex];
  }

  private generateBodyLanguage(emotion: string, _intensity: number): string {
    const bodyLanguageMap: Record<string, string> = {
      joy: 'Smiling, open posture',
      sadness: 'Slumped shoulders, downcast eyes',
      anger: 'Tense posture, clenched fists',
      fear: 'Hunched shoulders, wide eyes',
      surprise: 'Raised eyebrows, open mouth',
      contempt: 'Slight smirk, raised chin',
    };
    return bodyLanguageMap[emotion] || 'Neutral stance';
  }

  private generateVoiceTone(emotion: string, _intensity: number): string {
    const voiceToneMap: Record<string, string> = {
      joy: 'Warm and enthusiastic',
      sadness: 'Soft and melancholic',
      anger: 'Sharp and intense',
      fear: 'Trembling and uncertain',
      surprise: 'Excited and animated',
      contempt: 'Cool and dismissive',
    };
    return voiceToneMap[emotion] || 'Neutral tone';
  }

  private generateThoughtProcess(
    character: CharacterPersona,
    _input: string,
    _context: InteractionContext
  ): string {
    const traits = getPersonalityTraits(character);
    const primaryGoal = getGoalsPrimary(character);

    return `Processing input through ${traits.join(', ')} lens. Considering ${primaryGoal} in this context.`;
  }

  private triggerMemory(character: CharacterPersona, _input: string): string {
    const relationships = getRelationships(character);
    if (relationships.length > 0) {
      const randomRelation =
        relationships[Math.floor(Math.random() * relationships.length)];
      return `Recalls interaction with ${randomRelation.name}`;
    }
    return '';
  }

  private calculateRelationshipImpact(
    character: CharacterPersona,
    _input: string
  ): string {
    const relationships = getRelationships(character);
    if (relationships.length > 0) {
      return `Strengthens bond with ${relationships[0].name}`;
    }
    return '';
  }

  private generateDevelopmentInsight(
    _character: CharacterPersona,
    _input: string,
    _flow: ConversationFlow
  ): string {
    const insights = [
      'Gained new perspective on relationships',
      'Developed deeper self-awareness',
      'Learned to express emotions more clearly',
      'Built confidence in communication',
      'Discovered new aspects of personality',
    ];

    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    return randomInsight;
  }
}
