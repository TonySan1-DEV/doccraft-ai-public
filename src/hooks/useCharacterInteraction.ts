// MCP Context Block
/*
{
  file: "useCharacterInteraction.ts",
  role: "developer",
  allowedActions: ["manage", "simulate", "analyze", "develop"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "character_development"
}
*/

import { useState, useCallback, useEffect } from 'react';
import { CharacterPersona } from '../types/CharacterPersona';
import { 
  CharacterInteraction, 
  CharacterDevelopmentPrompt, 
  CharacterAnalysis,
  generateCharacterPrompts,
  simulateCharacterResponse,
  analyzeCharacterPersonality,
  generatePersonalityInsights,
  exportCharacterData,
  importCharacterData
} from '../services/characterDevelopmentService';

export interface UseCharacterInteractionOptions {
  autoAnalyze?: boolean;
  saveToLocalStorage?: boolean;
  maxInteractions?: number;
  enableVoice?: boolean;
}

export interface CharacterInteractionState {
  interactions: CharacterInteraction[];
  prompts: CharacterDevelopmentPrompt[];
  analysis: CharacterAnalysis | null;
  isLoading: boolean;
  error: string | null;
  sessionStartTime: Date;
  totalInteractions: number;
  completedPrompts: number;
  personalityInsights: string[];
}

export interface CharacterInteractionActions {
  sendMessage: (message: string, context?: string) => Promise<void>;
  generatePrompts: () => void;
  completePrompt: (promptId: string, response: string) => void;
  analyzeCharacter: () => Promise<void>;
  exportData: () => string;
  importData: (data: string) => void;
  clearSession: () => void;
  getSessionStats: () => {
    duration: number;
    averageResponseTime: number;
    mostCommonEmotion: string;
    interactionCount: number;
  };
}

export function useCharacterInteraction(
  character: CharacterPersona,
  options: UseCharacterInteractionOptions = {}
): [CharacterInteractionState, CharacterInteractionActions] {
  const {
    autoAnalyze = true,
    saveToLocalStorage = true,
    maxInteractions = 100
  } = options;

  // State
  const [interactions, setInteractions] = useState<CharacterInteraction[]>([]);
  const [prompts, setPrompts] = useState<CharacterDevelopmentPrompt[]>([]);
  const [analysis, setAnalysis] = useState<CharacterAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionStartTime] = useState(new Date());
  const [personalityInsights, setPersonalityInsights] = useState<string[]>([]);

  // Load saved data from localStorage
  useEffect(() => {
    if (saveToLocalStorage) {
      const savedData = localStorage.getItem(`character-interaction-${character.id}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setInteractions(parsed.interactions || []);
          setPrompts(parsed.prompts || []);
          setAnalysis(parsed.analysis || null);
        } catch (err) {
          console.warn('Failed to load saved character interaction data:', err);
        }
      }
    }
  }, [character.id, saveToLocalStorage]);

  // Save data to localStorage
  useEffect(() => {
    if (saveToLocalStorage && interactions.length > 0) {
      const dataToSave = {
        interactions,
        prompts,
        analysis,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(`character-interaction-${character.id}`, JSON.stringify(dataToSave));
    }
  }, [interactions, prompts, analysis, character.id, saveToLocalStorage]);

  // Generate personality insights
  useEffect(() => {
    const insights = generatePersonalityInsights(character);
    setPersonalityInsights(insights);
  }, [character]);

  // Auto-analyze character after significant interactions
  useEffect(() => {
    if (autoAnalyze && interactions.length > 0 && interactions.length % 10 === 0) {
      analyzeCharacter();
    }
  }, [interactions.length, autoAnalyze]);

  // Send message to character
  const sendMessage = useCallback(async (message: string, context: string = '') => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const interaction = await simulateCharacterResponse(
        message,
        character,
        context,
        interactions
      );

      setInteractions(prev => {
        const newInteractions = [...prev, interaction];
        // Keep only the last maxInteractions
        return newInteractions.slice(-maxInteractions);
      });

      // Generate prompts if this is one of the first few interactions
      if (interactions.length < 5 && prompts.length === 0) {
        const newPrompts = generateCharacterPrompts(character);
        setPrompts(newPrompts);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Character interaction error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [character, interactions, prompts.length, maxInteractions]);

  // Generate development prompts
  const generatePrompts = useCallback(() => {
    const newPrompts = generateCharacterPrompts(character);
    setPrompts(newPrompts);
  }, [character]);

  // Complete a development prompt
  const completePrompt = useCallback((promptId: string, response: string) => {
    setPrompts(prev => 
      prev.map(prompt => 
        prompt.id === promptId 
          ? { ...prompt, completed: true, response, timestamp: new Date() }
          : prompt
      )
    );

    // Add the response as an interaction for context
    const interaction: CharacterInteraction = {
      message: `Development Question: ${prompts.find(p => p.id === promptId)?.question}`,
      characterResponse: response,
      emotion: 'reflective',
      intensity: 0.6,
      context: 'character-development',
      timestamp: new Date()
    };

    setInteractions(prev => [...prev, interaction]);
  }, [prompts]);

  // Analyze character
  const analyzeCharacter = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const newAnalysis = await analyzeCharacterPersonality(character, interactions);
      setAnalysis(newAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze character');
      console.error('Character analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [character, interactions]);

  // Export character data
  const exportData = useCallback(() => {
    return exportCharacterData(character, interactions, prompts, analysis || {
      personalityInsights: [],
      relationshipPatterns: [],
      goalAlignment: [],
      psychologicalProfile: [],
      communicationStyle: [],
      developmentRecommendations: [],
      storyPotential: []
    });
  }, [character, interactions, prompts, analysis]);

  // Import character data
  const importData = useCallback((data: string) => {
    try {
      const imported = importCharacterData(data);
      setInteractions(imported.interactions);
      setPrompts(imported.prompts);
      setAnalysis(imported.analysis);
    } catch (err) {
      setError('Failed to import character data');
      console.error('Import error:', err);
    }
  }, []);

  // Clear session
  const clearSession = useCallback(() => {
    setInteractions([]);
    setPrompts([]);
    setAnalysis(null);
    setError(null);
    
    if (saveToLocalStorage) {
      localStorage.removeItem(`character-interaction-${character.id}`);
    }
  }, [character.id, saveToLocalStorage]);

  // Get session statistics
  const getSessionStats = useCallback(() => {
    const duration = Date.now() - sessionStartTime.getTime();
    const averageResponseTime = interactions.length > 0 
      ? interactions.reduce((sum, _interaction) => {
          // Calculate response time (simplified)
          return sum + 1000; // Assume 1 second average
        }, 0) / interactions.length
      : 0;

    const emotionCounts = interactions.reduce((counts, interaction) => {
      counts[interaction.emotion] = (counts[interaction.emotion] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const mostCommonEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';

    return {
      duration,
      averageResponseTime,
      mostCommonEmotion,
      interactionCount: interactions.length
    };
  }, [interactions, sessionStartTime]);

  // State object
  const state: CharacterInteractionState = {
    interactions,
    prompts,
    analysis,
    isLoading,
    error,
    sessionStartTime,
    totalInteractions: interactions.length,
    completedPrompts: prompts.filter(p => p.completed).length,
    personalityInsights
  };

  // Actions object
  const actions: CharacterInteractionActions = {
    sendMessage,
    generatePrompts,
    completePrompt,
    analyzeCharacter,
    exportData,
    importData,
    clearSession,
    getSessionStats
  };

  return [state, actions];
}

// Hook for voice interaction (placeholder for future implementation)
export function useVoiceInteraction() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = useCallback(() => {
    setIsListening(true);
    // TODO: Implement speech recognition
    console.log('Voice recognition not yet implemented');
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening
  };
}

// Hook for character development tracking
export function useCharacterDevelopment(_character: CharacterPersona) {
  const [developmentStage, setDevelopmentStage] = useState(1);
  const [developmentNotes, setDevelopmentNotes] = useState<string[]>([]);
  const [growthAreas, setGrowthAreas] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);

  const addDevelopmentNote = useCallback((note: string) => {
    setDevelopmentNotes(prev => [...prev, note]);
  }, []);

  const addGrowthArea = useCallback((area: string) => {
    setGrowthAreas(prev => [...new Set([...prev, area])]);
  }, []);

  const addAchievement = useCallback((achievement: string) => {
    setAchievements(prev => [...prev, achievement]);
  }, []);

  const advanceStage = useCallback(() => {
    setDevelopmentStage(prev => prev + 1);
  }, []);

  const getDevelopmentProgress = useCallback(() => {
    return {
      stage: developmentStage,
      notes: developmentNotes.length,
      growthAreas: growthAreas.length,
      achievements: achievements.length,
      progress: Math.min((developmentStage / 5) * 100, 100) // Assuming 5 stages
    };
  }, [developmentStage, developmentNotes.length, growthAreas.length, achievements.length]);

  return {
    developmentStage,
    developmentNotes,
    growthAreas,
    achievements,
    addDevelopmentNote,
    addGrowthArea,
    addAchievement,
    advanceStage,
    getDevelopmentProgress
  };
} 