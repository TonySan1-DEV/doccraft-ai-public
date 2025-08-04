// Enhanced Character Interaction Service
// Advanced AI-powered user-to-character interaction with sophisticated features

import { CharacterPersona } from '../types/CharacterPersona';
import { CharacterInteraction } from './characterDevelopmentService';
import { advancedCharacterAI } from './advancedCharacterAI';
import { characterRelationshipEngine } from './characterRelationshipEngine';

export interface InteractionContext {
  scene: string;
  mood: string;
  timeOfDay: string;
  location: string;
  otherCharacters: string[];
  recentEvents: string[];
  emotionalState: string;
  conversationTone: 'casual' | 'formal' | 'intimate' | 'confrontational' | 'playful';
}

export interface InteractionMode {
  type: 'conversation' | 'interview' | 'therapy' | 'conflict' | 'bonding' | 'mentoring';
  intensity: number; // 0-1 scale
  focus: string;
  duration: number; // minutes
  goals: string[];
}

export interface CharacterResponse {
  content: string;
  emotion: string;
  intensity: number;
  bodyLanguage: string;
  voiceTone: string;
  thoughtProcess: string;
  memoryTriggered?: string;
  relationshipImpact?: string;
  developmentInsight?: string;
}

export interface ConversationFlow {
  id: string;
  startTime: Date;
  mode: InteractionMode;
  context: InteractionContext;
  messages: CharacterResponse[];
  insights: string[];
  emotionalArc: string[];
  relationshipChanges: string[];
  developmentProgress: number;
}

export interface EnhancedCharacterInteraction {
  // Core Interaction
  startConversation(
    characterId: string,
    mode: InteractionMode,
    context: InteractionContext
  ): Promise<ConversationFlow>;
  
  generateResponse(
    characterId: string,
    userInput: string,
    flow: ConversationFlow,
    context: InteractionContext
  ): Promise<CharacterResponse>;
  
  // Advanced Features
  analyzeConversationFlow(flow: ConversationFlow): Promise<any>;
  suggestConversationTopics(characterId: string, context: InteractionContext): Promise<string[]>;
  detectEmotionalShifts(flow: ConversationFlow): Promise<string[]>;
  generateFollowUpQuestions(characterId: string, lastResponse: CharacterResponse): Promise<string[]>;
  
  // Interaction Modes
  switchInteractionMode(
    flow: ConversationFlow,
    newMode: InteractionMode
  ): Promise<ConversationFlow>;
  
  // Context Management
  updateInteractionContext(
    flow: ConversationFlow,
    context: Partial<InteractionContext>
  ): Promise<ConversationFlow>;
  
  // Memory and Learning
  extractInsightsFromConversation(flow: ConversationFlow): Promise<string[]>;
  updateCharacterFromConversation(characterId: string, flow: ConversationFlow): Promise<void>;
}

export class EnhancedCharacterInteractionService implements EnhancedCharacterInteraction {
  private activeConversations: Map<string, ConversationFlow> = new Map();

  async startConversation(
    characterId: string,
    mode: InteractionMode,
    context: InteractionContext
  ): Promise<ConversationFlow> {
    const flow: ConversationFlow = {
      id: `conversation-${Date.now()}`,
      startTime: new Date(),
      mode,
      context,
      messages: [],
      insights: [],
      emotionalArc: [],
      relationshipChanges: [],
      developmentProgress: 0
    };

    this.activeConversations.set(characterId, flow);
    return flow;
  }

  async generateResponse(
    characterId: string,
    userInput: string,
    flow: ConversationFlow,
    context: InteractionContext
  ): Promise<CharacterResponse> {
    // Get character's current state
    const character = await this.getCharacterState(characterId);
    
    // Analyze user input for emotional content and intent
    const inputAnalysis = await this.analyzeUserInput(userInput, context);
    
    // Generate contextual response using advanced AI
    const response = await this.generateAdvancedResponse(
      characterId,
      userInput,
      flow,
      context,
      inputAnalysis
    );
    
    // Update conversation flow
    flow.messages.push(response);
    flow.emotionalArc.push(response.emotion);
    
    // Extract insights and update character
    await this.extractAndApplyInsights(characterId, flow, response);
    
    return response;
  }

  async analyzeConversationFlow(flow: ConversationFlow): Promise<any> {
    const analysis = {
      duration: Date.now() - flow.startTime.getTime(),
      messageCount: flow.messages.length,
      emotionalRange: this.calculateEmotionalRange(flow.emotionalArc),
      conversationDepth: this.assessConversationDepth(flow.messages),
      relationshipImpact: flow.relationshipChanges.length,
      developmentProgress: flow.developmentProgress,
      insights: flow.insights,
      modeEffectiveness: this.assessModeEffectiveness(flow)
    };
    
    return analysis;
  }

  async suggestConversationTopics(
    characterId: string,
    context: InteractionContext
  ): Promise<string[]> {
    const character = await this.getCharacterState(characterId);
    const topics = [];
    
    // Personality-based topics
    if (character.personality.traits.includes('curious')) {
      topics.push('Ask about their latest discoveries or interests');
    }
    
    if (character.personality.traits.includes('ambitious')) {
      topics.push('Discuss their goals and aspirations');
    }
    
    // Context-based topics
    if (context.location === 'workplace') {
      topics.push('Ask about their professional challenges');
    }
    
    if (context.mood === 'melancholy') {
      topics.push('Offer emotional support and understanding');
    }
    
    // Relationship-based topics
    if (context.otherCharacters.length > 0) {
      topics.push('Discuss their relationships with others');
    }
    
    // Development-based topics
    topics.push('Explore their recent personal growth');
    topics.push('Ask about their fears and how they cope');
    topics.push('Discuss their values and beliefs');
    
    return topics.slice(0, 5); // Return top 5 suggestions
  }

  async detectEmotionalShifts(flow: ConversationFlow): Promise<string[]> {
    const shifts = [];
    const emotions = flow.emotionalArc;
    
    for (let i = 1; i < emotions.length; i++) {
      const previous = emotions[i - 1];
      const current = emotions[i];
      
      if (this.isSignificantEmotionalShift(previous, current)) {
        shifts.push(`Emotional shift from ${previous} to ${current} at message ${i}`);
      }
    }
    
    return shifts;
  }

  async generateFollowUpQuestions(
    characterId: string,
    lastResponse: CharacterResponse
  ): Promise<string[]> {
    const questions = [];
    
    // Emotion-based follow-ups
    if (lastResponse.emotion === 'sadness') {
      questions.push('What would help you feel better right now?');
      questions.push('Is there something specific that\'s troubling you?');
    }
    
    if (lastResponse.emotion === 'excitement') {
      questions.push('What excites you most about this?');
      questions.push('How can we build on this positive energy?');
    }
    
    // Content-based follow-ups
    if (lastResponse.content.includes('remember')) {
      questions.push('What other memories does this bring up?');
    }
    
    if (lastResponse.content.includes('feel')) {
      questions.push('How do you typically handle these feelings?');
    }
    
    // Development-based follow-ups
    if (lastResponse.developmentInsight) {
      questions.push('How has this realization changed your perspective?');
    }
    
    return questions.slice(0, 3); // Return top 3 follow-ups
  }

  async switchInteractionMode(
    flow: ConversationFlow,
    newMode: InteractionMode
  ): Promise<ConversationFlow> {
    flow.mode = newMode;
    
    // Generate transition message
    const transitionMessage = await this.generateModeTransitionMessage(flow);
    flow.messages.push(transitionMessage);
    
    return flow;
  }

  async updateInteractionContext(
    flow: ConversationFlow,
    context: Partial<InteractionContext>
  ): Promise<ConversationFlow> {
    flow.context = { ...flow.context, ...context };
    return flow;
  }

  async extractInsightsFromConversation(flow: ConversationFlow): Promise<string[]> {
    const insights = [];
    
    // Analyze emotional patterns
    const emotionalPatterns = this.analyzeEmotionalPatterns(flow.emotionalArc);
    insights.push(...emotionalPatterns);
    
    // Analyze conversation depth
    const depthInsights = this.analyzeConversationDepth(flow.messages);
    insights.push(...depthInsights);
    
    // Analyze relationship dynamics
    const relationshipInsights = this.analyzeRelationshipDynamics(flow);
    insights.push(...relationshipInsights);
    
    return insights;
  }

  async updateCharacterFromConversation(
    characterId: string,
    flow: ConversationFlow
  ): Promise<void> {
    const insights = await this.extractInsightsFromConversation(flow);
    
    // Update character with new insights
    await advancedCharacterAI.addMemory(characterId, {
      id: `conversation-${flow.id}`,
      type: 'conversation',
      content: `Conversation with ${flow.mode.type} mode`,
      emotionalImpact: this.calculateAverageEmotionalImpact(flow.emotionalArc),
      importance: this.calculateConversationImportance(flow),
      timestamp: flow.startTime,
      context: flow.context.scene,
      tags: [flow.mode.type, ...flow.context.otherCharacters]
    });
    
    // Update character development
    if (flow.developmentProgress > 0) {
      await advancedCharacterAI.suggestCharacterGrowth(characterId);
    }
  }

  // Private helper methods
  private async getCharacterState(characterId: string): Promise<CharacterPersona> {
    // This would fetch the current character state from your database
    // For now, returning a mock character
    return {
      id: characterId,
      name: 'Character',
      archetype: 'Hero',
      personality: {
        traits: ['brave', 'curious', 'loyal'],
        strengths: ['leadership', 'empathy'],
        weaknesses: ['impatience', 'self-doubt'],
        fears: ['failure', 'loss'],
        desires: ['recognition', 'connection']
      },
      goals: {
        primary: 'Save the world',
        secondary: ['Help others', 'Find purpose'],
        internal: 'Prove worth',
        external: 'Defeat villain'
      },
      voiceStyle: 'Confident and warm',
      worldview: 'Optimistic but realistic',
      backstory: 'Born to be a hero',
      relationships: [],
      developmentNotes: []
    };
  }

  private async analyzeUserInput(
    userInput: string,
    context: InteractionContext
  ): Promise<any> {
    // Analyze user input for emotional content, intent, and context
    const analysis = {
      emotion: this.detectEmotion(userInput),
      intensity: this.calculateIntensity(userInput),
      intent: this.detectIntent(userInput),
      contextRelevance: this.assessContextRelevance(userInput, context),
      relationshipImpact: this.assessRelationshipImpact(userInput)
    };
    
    return analysis;
  }

  private async generateAdvancedResponse(
    characterId: string,
    userInput: string,
    flow: ConversationFlow,
    context: InteractionContext,
    inputAnalysis: any
  ): Promise<CharacterResponse> {
    // Use the advanced character AI to generate contextual response
    const interaction = await advancedCharacterAI.generateContextualResponse(
      characterId,
      userInput,
      context.scene,
      inputAnalysis.emotion
    );
    
    // Enhance the response with additional context
    const enhancedResponse: CharacterResponse = {
      content: interaction.characterResponse,
      emotion: interaction.emotion,
      intensity: interaction.intensity,
      bodyLanguage: this.generateBodyLanguage(interaction.emotion, interaction.intensity),
      voiceTone: this.generateVoiceTone(interaction.emotion, flow.mode.type),
      thoughtProcess: this.generateThoughtProcess(characterId, userInput, interaction),
      memoryTriggered: this.identifyMemoryTrigger(characterId, userInput),
      relationshipImpact: this.assessRelationshipImpact(userInput),
      developmentInsight: this.generateDevelopmentInsight(characterId, interaction)
    };
    
    return enhancedResponse;
  }

  private detectEmotion(text: string): string {
    const emotions = {
      joy: ['happy', 'excited', 'great', 'wonderful', 'amazing', 'love'],
      sadness: ['sad', 'depressed', 'sorry', 'regret', 'miss', 'lonely'],
      anger: ['angry', 'furious', 'mad', 'upset', 'hate', 'frustrated'],
      fear: ['afraid', 'scared', 'worried', 'anxious', 'terrified'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished'],
      contempt: ['disgusted', 'revolted', 'appalled'],
      neutral: ['okay', 'fine', 'alright', 'normal']
    };
    
    const textLower = text.toLowerCase();
    for (const [emotion, keywords] of Object.entries(emotions)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        return emotion;
      }
    }
    
    return 'neutral';
  }

  private calculateIntensity(text: string): number {
    const intensityIndicators = {
      high: ['!', 'very', 'extremely', 'absolutely', 'completely', 'totally'],
      medium: ['quite', 'rather', 'somewhat', 'fairly', 'pretty'],
      low: ['slightly', 'a bit', 'kind of', 'sort of', 'maybe']
    };
    
    const textLower = text.toLowerCase();
    let intensity = 0.5;
    
    if (intensityIndicators.high.some(indicator => textLower.includes(indicator))) {
      intensity = 0.8;
    } else if (intensityIndicators.medium.some(indicator => textLower.includes(indicator))) {
      intensity = 0.6;
    } else if (intensityIndicators.low.some(indicator => textLower.includes(indicator))) {
      intensity = 0.3;
    }
    
    return intensity;
  }

  private detectIntent(text: string): string {
    const intents = {
      question: ['?', 'what', 'how', 'why', 'when', 'where', 'who'],
      statement: ['is', 'are', 'was', 'were', 'will', 'can', 'should'],
      command: ['do', 'make', 'go', 'come', 'stop', 'start'],
      emotion: ['feel', 'think', 'believe', 'hope', 'wish', 'want']
    };
    
    const textLower = text.toLowerCase();
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        return intent;
      }
    }
    
    return 'statement';
  }

  private generateBodyLanguage(emotion: string, intensity: number): string {
    const bodyLanguageMap = {
      joy: intensity > 0.7 ? 'Bouncing with excitement' : 'Warm smile',
      sadness: intensity > 0.7 ? 'Slumped shoulders, downcast eyes' : 'Slight frown',
      anger: intensity > 0.7 ? 'Clenched fists, tense posture' : 'Furrowed brow',
      fear: intensity > 0.7 ? 'Trembling, wide eyes' : 'Nervous fidgeting',
      surprise: intensity > 0.7 ? 'Mouth agape, raised eyebrows' : 'Raised eyebrows',
      contempt: intensity > 0.7 ? 'Sneer, turned away' : 'Slight smirk',
      neutral: 'Relaxed posture, attentive expression'
    };
    
    return bodyLanguageMap[emotion as keyof typeof bodyLanguageMap] || 'Neutral stance';
  }

  private generateVoiceTone(emotion: string, mode: string): string {
    const toneMap = {
      joy: mode === 'intimate' ? 'Warm and affectionate' : 'Bright and enthusiastic',
      sadness: mode === 'therapy' ? 'Gentle and understanding' : 'Soft and melancholic',
      anger: mode === 'conflict' ? 'Sharp and direct' : 'Tense and controlled',
      fear: mode === 'therapy' ? 'Reassuring and calm' : 'Nervous and uncertain',
      surprise: 'Animated and expressive',
      contempt: 'Cold and dismissive',
      neutral: mode === 'formal' ? 'Professional and measured' : 'Natural and conversational'
    };
    
    return toneMap[emotion as keyof typeof toneMap] || 'Natural and conversational';
  }

  private generateThoughtProcess(
    characterId: string,
    userInput: string,
    interaction: CharacterInteraction
  ): string {
    return `Processing the user's ${this.detectIntent(userInput)} about ${this.extractTopics(userInput)}. Considering how this relates to their core values and current emotional state.`;
  }

  private extractTopics(text: string): string {
    // Simple topic extraction - in a real implementation, this would use NLP
    const topics = text.toLowerCase().split(' ').filter(word => 
      word.length > 3 && !['what', 'when', 'where', 'this', 'that', 'with', 'from'].includes(word)
    );
    return topics.slice(0, 3).join(', ') || 'the conversation';
  }

  private identifyMemoryTrigger(characterId: string, userInput: string): string | undefined {
    // Check if user input triggers any character memories
    const memoryKeywords = ['remember', 'recall', 'think back', 'when you', 'that time'];
    const hasMemoryTrigger = memoryKeywords.some(keyword => 
      userInput.toLowerCase().includes(keyword)
    );
    
    return hasMemoryTrigger ? 'User input triggered a memory' : undefined;
  }

  private assessRelationshipImpact(userInput: string): string | undefined {
    const relationshipKeywords = ['relationship', 'friend', 'family', 'love', 'trust', 'betrayal'];
    const hasRelationshipContent = relationshipKeywords.some(keyword => 
      userInput.toLowerCase().includes(keyword)
    );
    
    return hasRelationshipContent ? 'This conversation may impact relationships' : undefined;
  }

  private generateDevelopmentInsight(
    characterId: string,
    interaction: CharacterInteraction
  ): string | undefined {
    // Generate character development insights based on the interaction
    if (interaction.emotion === 'contemplation' || interaction.intensity > 0.7) {
      return 'Character is experiencing significant personal growth';
    }
    return undefined;
  }

  private calculateEmotionalRange(emotionalArc: string[]): number {
    const uniqueEmotions = new Set(emotionalArc);
    return uniqueEmotions.size / 7; // Normalize by total possible emotions
  }

  private assessConversationDepth(messages: CharacterResponse[]): number {
    const avgIntensity = messages.reduce((sum, msg) => sum + msg.intensity, 0) / messages.length;
    const emotionalVariety = new Set(messages.map(msg => msg.emotion)).size;
    return (avgIntensity + emotionalVariety / 7) / 2;
  }

  private assessModeEffectiveness(flow: ConversationFlow): number {
    const messageCount = flow.messages.length;
    const developmentProgress = flow.developmentProgress;
    const insightsCount = flow.insights.length;
    
    return Math.min(1, (messageCount * 0.3 + developmentProgress * 0.4 + insightsCount * 0.3) / 10);
  }

  private isSignificantEmotionalShift(previous: string, current: string): boolean {
    const emotionalOpposites = {
      'joy': ['sadness', 'anger'],
      'sadness': ['joy', 'excitement'],
      'anger': ['joy', 'calm'],
      'fear': ['confidence', 'joy'],
      'surprise': ['calm', 'understanding']
    };
    
    return emotionalOpposites[previous as keyof typeof emotionalOpposites]?.includes(current) || false;
  }

  private analyzeEmotionalPatterns(emotionalArc: string[]): string[] {
    const insights = [];
    const emotionCounts = emotionalArc.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (dominantEmotion) {
      insights.push(`Conversation was predominantly ${dominantEmotion[0]}`);
    }
    
    return insights;
  }

  private analyzeConversationDepth(messages: CharacterResponse[]): string[] {
    const insights = [];
    const avgIntensity = messages.reduce((sum, msg) => sum + msg.intensity, 0) / messages.length;
    
    if (avgIntensity > 0.7) {
      insights.push('High emotional intensity throughout conversation');
    } else if (avgIntensity < 0.3) {
      insights.push('Conversation remained relatively calm');
    }
    
    return insights;
  }

  private analyzeRelationshipDynamics(flow: ConversationFlow): string[] {
    return flow.relationshipChanges.length > 0 
      ? [`${flow.relationshipChanges.length} relationship dynamics were explored`]
      : [];
  }

  private calculateAverageEmotionalImpact(emotionalArc: string[]): number {
    const emotionScores = {
      'joy': 0.8,
      'sadness': -0.6,
      'anger': -0.7,
      'fear': -0.5,
      'surprise': 0.3,
      'contempt': -0.8,
      'neutral': 0
    };
    
    const totalImpact = emotionalArc.reduce((sum, emotion) => 
      sum + (emotionScores[emotion as keyof typeof emotionScores] || 0), 0
    );
    
    return totalImpact / emotionalArc.length;
  }

  private calculateConversationImportance(flow: ConversationFlow): number {
    const duration = Date.now() - flow.startTime.getTime();
    const messageCount = flow.messages.length;
    const developmentProgress = flow.developmentProgress;
    const insightsCount = flow.insights.length;
    
    return Math.min(1, (duration / 60000 + messageCount * 0.1 + developmentProgress + insightsCount * 0.2) / 5);
  }

  private async generateModeTransitionMessage(flow: ConversationFlow): Promise<CharacterResponse> {
    const modeTransitions = {
      'conversation': 'Let\'s have a casual chat',
      'interview': 'I\'d like to ask you some questions',
      'therapy': 'Let\'s explore your feelings',
      'conflict': 'We need to address something important',
      'bonding': 'I want to get to know you better',
      'mentoring': 'I\'d like to share some guidance'
    };
    
    return {
      content: modeTransitions[flow.mode.type as keyof typeof modeTransitions] || 'Let\'s continue our conversation',
      emotion: 'neutral',
      intensity: 0.5,
      bodyLanguage: 'Adjusting posture',
      voiceTone: 'Transitional and clear',
      thoughtProcess: 'Adapting to new conversation mode',
      memoryTriggered: undefined,
      relationshipImpact: undefined,
      developmentInsight: undefined
    };
  }

  private assessContextRelevance(userInput: string, context: InteractionContext): number {
    const contextKeywords = [
      context.location,
      context.mood,
      context.timeOfDay,
      ...context.otherCharacters,
      ...context.recentEvents
    ].filter(Boolean);
    
    const inputWords = userInput.toLowerCase().split(' ');
    const relevantWords = contextKeywords.filter(keyword => 
      inputWords.some(word => word.includes(keyword.toLowerCase()))
    );
    
    return relevantWords.length / Math.max(contextKeywords.length, 1);
  }

  private assessRelationshipImpact(userInput: string): string | undefined {
    const relationshipKeywords = ['relationship', 'friend', 'family', 'love', 'trust', 'betrayal'];
    return relationshipKeywords.some(keyword => userInput.toLowerCase().includes(keyword))
      ? 'This may affect relationships'
      : undefined;
  }
}

// Export singleton instance
export const enhancedCharacterInteraction = new EnhancedCharacterInteractionService(); 