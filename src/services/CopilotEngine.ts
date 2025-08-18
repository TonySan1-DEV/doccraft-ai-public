// MCP Context Block
/*
{
  file: "CopilotEngine.ts",
  role: "service-developer",
  allowedActions: ["suggest", "auto-reply", "quick-prompt"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "agent_copilot"
}
*/

import { AgentTone, SupportedLanguage } from '../types/agentPreferences';

interface SuggestionContext {
  userInput: string;
  currentScene?: string;
  characterFocus?: string;
  tone?: AgentTone;
  language?: SupportedLanguage;
}

interface CopilotSuggestion {
  id: string;
  text: string;
  type: 'auto-reply' | 'quick-prompt' | 'smart-suggestion';
  confidence: number;
  context?: string;
}

class CopilotEngine {
  private enabled: boolean = true;
  private suggestions: CopilotSuggestion[] = [];
  private currentTone: AgentTone = 'friendly';
  private currentLanguage: SupportedLanguage = 'en';

  // Static method declarations
  static enable: () => void;
  static disable: () => void;
  static isEnabled: () => boolean;
  static setTone: (tone: AgentTone) => void;
  static setLanguage: (language: SupportedLanguage) => void;
  static generateSuggestions: (
    context: SuggestionContext
  ) => Promise<CopilotSuggestion[]>;
  static getCurrentSuggestions: () => CopilotSuggestion[];
  static clearSuggestions: () => void;
  static shouldShowSuggestions: () => boolean;
  static getSuggestionById: (id: string) => CopilotSuggestion | undefined;
  static updateSuggestionConfidence: (id: string, confidence: number) => void;
  static logSuggestionUsage: (suggestionId: string, accepted: boolean) => void;

  // Enable copilot suggestions
  enable(): void {
    this.enabled = true;
  }

  // Disable copilot suggestions
  disable(): void {
    this.enabled = false;
    this.suggestions = [];
  }

  // Check if copilot is enabled
  isEnabled(): boolean {
    return this.enabled;
  }

  // Set tone for suggestions
  setTone(tone: AgentTone): void {
    this.currentTone = tone;
  }

  // Set language for suggestions
  setLanguage(language: SupportedLanguage): void {
    this.currentLanguage = language;
  }

  // Generate suggestions based on context
  async generateSuggestions(): Promise<CopilotSuggestion[]> {
    if (!this.enabled) {
      return [];
    }

    try {
      // Mock suggestion generation - replace with actual LLM call
      const suggestions: CopilotSuggestion[] = [
        {
          id: `suggestion-${Date.now()}-1`,
          text: this.formatSuggestion('How can I help you with your story?'),
          type: 'auto-reply',
          confidence: 0.8,
          context: 'General assistance',
        },
        {
          id: `suggestion-${Date.now()}-2`,
          text: this.formatSuggestion(
            'Would you like me to analyze this scene?'
          ),
          type: 'quick-prompt',
          confidence: 0.7,
          context: 'Scene analysis',
        },
      ];

      this.suggestions = suggestions;
      return suggestions;
    } catch (error) {
      console.error('CopilotEngine: Failed to generate suggestions:', error);
      return [];
    }
  }

  // Format suggestion based on tone and language
  private formatSuggestion(text: string): string {
    let formatted = text;

    // Apply tone formatting
    switch (this.currentTone) {
      case 'formal':
        formatted = `I would be pleased to ${text.toLowerCase()}`;
        break;
      case 'concise':
        formatted = text.replace(/^How can I help you/, 'Help with');
        break;
      case 'friendly':
      default:
        // Keep original friendly tone
        break;
    }

    // Apply language formatting (simplified)
    if (this.currentLanguage !== 'en') {
      // In a real implementation, this would translate the text
      formatted = `[${this.currentLanguage.toUpperCase()}] ${formatted}`;
    }

    return formatted;
  }

  // Get current suggestions
  getCurrentSuggestions(): CopilotSuggestion[] {
    return this.enabled ? this.suggestions : [];
  }

  // Clear all suggestions
  clearSuggestions(): void {
    this.suggestions = [];
  }

  // Check if suggestions should be shown in UI
  shouldShowSuggestions(): boolean {
    return this.enabled && this.suggestions.length > 0;
  }

  // Get suggestion by ID
  getSuggestionById(id: string): CopilotSuggestion | undefined {
    return this.suggestions.find(s => s.id === id);
  }

  // Update suggestion confidence
  updateSuggestionConfidence(id: string, confidence: number): void {
    const suggestion = this.getSuggestionById(id);
    if (suggestion) {
      suggestion.confidence = confidence;
    }
  }

  // Log suggestion usage for telemetry
  logSuggestionUsage(suggestionId: string, accepted: boolean): void {
    if (window.logTelemetryEvent) {
      window.logTelemetryEvent('copilot_suggestion_used', {
        suggestionId,
        accepted,
        enabled: this.enabled,
        timestamp: Date.now(),
      });
    }
  }
}

// Export singleton instance
export const copilotEngine = new CopilotEngine();

// Add static methods to the class for global access
CopilotEngine.enable = () => copilotEngine.enable();
CopilotEngine.disable = () => copilotEngine.disable();
CopilotEngine.isEnabled = () => copilotEngine.isEnabled();
CopilotEngine.setTone = (tone: AgentTone) => copilotEngine.setTone(tone);
CopilotEngine.setLanguage = (language: SupportedLanguage) =>
  copilotEngine.setLanguage(language);
CopilotEngine.generateSuggestions = () => copilotEngine.generateSuggestions();
CopilotEngine.getCurrentSuggestions = () =>
  copilotEngine.getCurrentSuggestions();
CopilotEngine.clearSuggestions = () => copilotEngine.clearSuggestions();
CopilotEngine.shouldShowSuggestions = () =>
  copilotEngine.shouldShowSuggestions();
CopilotEngine.getSuggestionById = (id: string) =>
  copilotEngine.getSuggestionById(id);
CopilotEngine.updateSuggestionConfidence = (id: string, confidence: number) =>
  copilotEngine.updateSuggestionConfidence(id, confidence);
CopilotEngine.logSuggestionUsage = (suggestionId: string, accepted: boolean) =>
  copilotEngine.logSuggestionUsage(suggestionId, accepted);

// Export class for testing
export { CopilotEngine };
