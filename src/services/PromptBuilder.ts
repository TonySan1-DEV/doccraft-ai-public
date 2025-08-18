// MCP Context Block
/*
{
  file: "PromptBuilder.ts",
  role: "service-developer",
  allowedActions: ["build", "format", "prompt"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "agent_prompt"
}
*/

import { AgentTone, SupportedLanguage } from '../types/agentPreferences';

interface PromptContext {
  userQuery: string;
  sceneId?: string;
  characterId?: string;
  narrativeContext?: string;
  [key: string]: any;
}

interface MCPPromptOptions {
  includeTone?: boolean;
  includeLanguage?: boolean;
  includeMemory?: boolean;
  customHeaders?: Record<string, string>;
}

interface PromptHeaderOptions {
  tone?: AgentTone;
  language?: SupportedLanguage;
  includeTranslationCue?: boolean;
  customHeaders?: Record<string, string>;
}

class PromptBuilder {
  private currentTone: AgentTone = 'friendly';
  private currentLanguage: SupportedLanguage = 'en';
  private memoryEnabled: boolean = true;

  // Static method declarations
  static setTone: (tone: AgentTone) => void;
  static setLanguage: (language: SupportedLanguage) => void;
  static setMemoryEnabled: (enabled: boolean) => void;
  static generatePromptHeader: (options?: PromptHeaderOptions) => string;
  static buildMCPPrompt: (
    context: PromptContext,
    options?: MCPPromptOptions
  ) => string;
  static buildSimplePrompt: (context: PromptContext) => string;
  static buildConversationPrompt: (
    userMessage: string,
    conversationHistory?: string[],
    options?: MCPPromptOptions
  ) => string;
  static formatResponse: (response: string) => string;
  static getCurrentConfig: () => {
    tone: AgentTone;
    language: SupportedLanguage;
    memoryEnabled: boolean;
  };
  static reset: () => void;
  static needsRegeneration: (
    oldTone: AgentTone,
    oldLanguage: SupportedLanguage
  ) => boolean;
  static getPromptStats: () => {
    currentTone: AgentTone;
    currentLanguage: SupportedLanguage;
    memoryEnabled: boolean;
    lastUpdate: number;
  };

  // Set tone for prompt formatting
  setTone(tone: AgentTone): void {
    this.currentTone = tone;
  }

  // Set language for prompt formatting
  setLanguage(language: SupportedLanguage): void {
    this.currentLanguage = language;
  }

  // Set memory preference
  setMemoryEnabled(enabled: boolean): void {
    this.memoryEnabled = enabled;
  }

  // Generate prompt header with tone and language
  generatePromptHeader(options: PromptHeaderOptions = {}): string {
    const {
      tone = this.currentTone,
      language = this.currentLanguage,
      includeTranslationCue = true,
      customHeaders = {},
    } = options;

    let header = '';

    // Core tone and language header
    header += `/* Tone: ${tone} | Language: ${language} */\n`;

    // Translation cue if enabled and not English
    if (includeTranslationCue && language !== 'en') {
      header += `/* Respond in ${language.toUpperCase()} */\n`;
    }

    // Custom headers
    Object.entries(customHeaders).forEach(([key, value]) => {
      header += `/* ${key}: ${value} */\n`;
    });

    return header;
  }

  // Build MCP-formatted prompt with tone and language headers
  buildMCPPrompt(
    context: PromptContext,
    options: MCPPromptOptions = {}
  ): string {
    const {
      includeTone = true,
      includeLanguage = true,
      includeMemory = true,
      customHeaders = {},
    } = options;

    let prompt = '';

    // MCP Context Block
    prompt += '/* MCP Context Block\n';
    prompt += '{\n';
    prompt += '  role: "ai-assistant",\n';
    prompt += '  allowedActions: ["respond", "suggest", "analyze"],\n';
    prompt += '  tier: "Pro",\n';
    prompt += '  contentSensitivity: "medium",\n';
    prompt += '  theme: "narrative_assistance"\n';
    prompt += '}\n';
    prompt += '*/\n\n';

    // Dynamic tone and language header
    if (includeTone || includeLanguage) {
      prompt += this.generatePromptHeader({
        tone: includeTone ? this.currentTone : undefined,
        language: includeLanguage ? this.currentLanguage : undefined,
        customHeaders,
      });
    }

    // Memory context header
    if (includeMemory && this.memoryEnabled) {
      prompt += '/* MEMORY CONTEXT: ENABLED */\n';
      prompt += this.getMemoryInstructions();
    } else if (includeMemory) {
      prompt += '/* MEMORY CONTEXT: DISABLED */\n';
      prompt += '// No session memory available\n';
    }

    prompt += '\n';

    // User query with language-specific formatting
    const formattedQuery = this.formatUserQuery(context.userQuery);
    prompt += `USER QUERY: ${formattedQuery}\n\n`;

    // Additional context
    if (context.sceneId) {
      prompt += `SCENE CONTEXT: ${context.sceneId}\n`;
    }
    if (context.characterId) {
      prompt += `CHARACTER FOCUS: ${context.characterId}\n`;
    }
    if (context.narrativeContext) {
      prompt += `NARRATIVE CONTEXT: ${context.narrativeContext}\n`;
    }

    return prompt;
  }

  // Format user query based on language
  private formatUserQuery(query: string): string {
    if (this.currentLanguage === 'en') {
      return query;
    }

    // Add language indicator for non-English queries
    return `[${this.currentLanguage.toUpperCase()}] ${query}`;
  }

  // Build simple prompt with tone/language header
  buildSimplePrompt(context: PromptContext): string {
    let prompt = '';

    // Add tone and language header
    prompt += this.generatePromptHeader();
    prompt += '\n';

    // Add user query
    prompt += this.formatUserQuery(context.userQuery);

    return prompt;
  }

  // Build conversation prompt with context
  buildConversationPrompt(
    userMessage: string,
    conversationHistory?: string[],
    options: MCPPromptOptions = {}
  ): string {
    let prompt = '';

    // Add MCP and preference headers
    prompt += this.buildMCPPrompt({ userQuery: userMessage }, options);
    prompt += '\n';

    // Add conversation history if available
    if (conversationHistory && conversationHistory.length > 0) {
      prompt += 'CONVERSATION HISTORY:\n';
      conversationHistory.forEach((msg, index) => {
        prompt += `${index + 1}. ${msg}\n`;
      });
      prompt += '\n';
    }

    // Add response instruction based on tone
    prompt += `RESPONSE INSTRUCTION: ${this.getToneResponseInstruction()}\n`;

    return prompt;
  }

  // Get tone-specific response instruction
  private getToneResponseInstruction(): string {
    switch (this.currentTone) {
      case 'formal':
        return 'Provide a professional, structured response using formal language.';
      case 'concise':
        return 'Provide a brief, direct response with minimal elaboration.';
      case 'friendly':
      default:
        return 'Provide a warm, approachable response using conversational language.';
    }
  }

  // Get memory instructions
  private getMemoryInstructions(): string {
    return '// Include relevant session context and previous interactions\n';
  }

  // Format response based on tone and language
  formatResponse(response: string): string {
    let formatted = response;

    // Apply tone formatting
    switch (this.currentTone) {
      case 'formal':
        formatted = this.makeFormal(formatted);
        break;
      case 'concise':
        formatted = this.makeConcise(formatted);
        break;
      case 'friendly':
      default:
        // Keep friendly tone as is
        break;
    }

    // Apply language formatting
    if (this.currentLanguage !== 'en') {
      formatted = this.translateResponse(formatted);
    }

    return formatted;
  }

  // Make response more formal
  private makeFormal(text: string): string {
    return text
      .replace(/I'm/g, 'I am')
      .replace(/you're/g, 'you are')
      .replace(/don't/g, 'do not')
      .replace(/can't/g, 'cannot')
      .replace(/won't/g, 'will not');
  }

  // Make response more concise
  private makeConcise(text: string): string {
    return text
      .replace(/I would like to/g, 'I want to')
      .replace(/I am pleased to/g, 'I can')
      .replace(/it would be my pleasure to/g, 'I can')
      .replace(/if you would like/g, 'if you want');
  }

  // Translate response (simplified)
  private translateResponse(text: string): string {
    // In a real implementation, this would use a translation service
    return `[${this.currentLanguage.toUpperCase()}] ${text}`;
  }

  // Get current configuration
  getCurrentConfig(): {
    tone: AgentTone;
    language: SupportedLanguage;
    memoryEnabled: boolean;
  } {
    return {
      tone: this.currentTone,
      language: this.currentLanguage,
      memoryEnabled: this.memoryEnabled,
    };
  }

  // Reset to defaults
  reset(): void {
    this.currentTone = 'friendly';
    this.currentLanguage = 'en';
    this.memoryEnabled = true;
  }

  // Utility to check if prompt needs regeneration
  needsRegeneration(
    oldTone: AgentTone,
    oldLanguage: SupportedLanguage
  ): boolean {
    return oldTone !== this.currentTone || oldLanguage !== this.currentLanguage;
  }

  // Get prompt statistics
  getPromptStats(): {
    currentTone: AgentTone;
    currentLanguage: SupportedLanguage;
    memoryEnabled: boolean;
    lastUpdate: number;
  } {
    return {
      currentTone: this.currentTone,
      currentLanguage: this.currentLanguage,
      memoryEnabled: this.memoryEnabled,
      lastUpdate: Date.now(),
    };
  }
}

// Export singleton instance
export const promptBuilder = new PromptBuilder();

// Add static methods to the class for global access
PromptBuilder.setTone = (tone: AgentTone) => promptBuilder.setTone(tone);
PromptBuilder.setLanguage = (language: SupportedLanguage) =>
  promptBuilder.setLanguage(language);
PromptBuilder.setMemoryEnabled = (enabled: boolean) =>
  promptBuilder.setMemoryEnabled(enabled);
PromptBuilder.generatePromptHeader = (options?: PromptHeaderOptions) =>
  promptBuilder.generatePromptHeader(options);
PromptBuilder.buildMCPPrompt = (
  context: PromptContext,
  options?: MCPPromptOptions
) => promptBuilder.buildMCPPrompt(context, options);
PromptBuilder.buildSimplePrompt = (context: PromptContext) =>
  promptBuilder.buildSimplePrompt(context);
PromptBuilder.buildConversationPrompt = (
  userMessage: string,
  conversationHistory?: string[],
  options?: MCPPromptOptions
) =>
  promptBuilder.buildConversationPrompt(
    userMessage,
    conversationHistory,
    options
  );
PromptBuilder.formatResponse = (response: string) =>
  promptBuilder.formatResponse(response);
PromptBuilder.getCurrentConfig = () => promptBuilder.getCurrentConfig();
PromptBuilder.reset = () => promptBuilder.reset();
PromptBuilder.needsRegeneration = (
  oldTone: AgentTone,
  oldLanguage: SupportedLanguage
) => promptBuilder.needsRegeneration(oldTone, oldLanguage);
PromptBuilder.getPromptStats = () => promptBuilder.getPromptStats();

// Export class for testing
export { PromptBuilder };
