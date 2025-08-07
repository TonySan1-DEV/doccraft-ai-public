// MCP Context Block
/*
{
  file: "CharacterInteractionSystem.tsx",
  role: "developer",
  allowedActions: ["simulate", "analyze", "develop", "interact"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "character_development"
}
*/

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  Brain,
  Heart,
  Target,
  Users,
  BookOpen,
  Zap,
  Send,
  Mic,
  MicOff,
  Star,
  TrendingUp,
  Lightbulb,
  Eye,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Enhanced Character Interface
export interface EnhancedCharacter {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  archetype: string;
  personality: {
    traits: string[];
    strengths: string[];
    weaknesses: string[];
    fears: string[];
    desires: string[];
    mbti?: string;
    enneagram?: string;
    bigFive?: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
  };
  background: {
    origin: string;
    family: string;
    education: string;
    occupation: string;
    significantEvents: string[];
    childhood: string;
    formativeExperiences: string[];
    culturalBackground: string;
    socioeconomicStatus: string;
  };
  goals: {
    primary: string;
    secondary: string[];
    internal: string;
    external: string;
    shortTerm: string[];
    longTerm: string[];
  };
  conflicts: {
    internal: string[];
    external: string[];
    relationships: string[];
    moralDilemmas: string[];
  };
  arc: {
    type: 'hero' | 'tragic' | 'flat' | 'growth';
    description: string;
    stages: string[];
    currentStage: number;
  };
  relationships: {
    allies: Array<{ name: string; relationship: string; description: string }>;
    enemies: Array<{ name: string; relationship: string; description: string }>;
    mentors: Array<{ name: string; relationship: string; description: string }>;
    loveInterests: Array<{
      name: string;
      relationship: string;
      description: string;
    }>;
  };
  development: {
    currentStage: number;
    totalStages: number;
    growthAreas: string[];
    achievements: string[];
    developmentNotes: string[];
  };
  communication: {
    speakingStyle: string;
    vocabulary: string;
    mannerisms: string[];
    emotionalExpression: string;
    communicationBarriers: string[];
  };
  psychology: {
    defenseMechanisms: string[];
    copingStrategies: string[];
    triggers: string[];
    comfortZones: string[];
    growthPotential: string[];
  };
  storyContext: {
    currentSituation: string;
    immediateGoals: string[];
    obstacles: string[];
    resources: string[];
    timeline: string;
  };
  interactionHistory: ChatMessage[];
  developmentPrompts: DevelopmentPrompt[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'character';
  content: string;
  timestamp: Date;
  emotion?: string;
  intensity?: number;
  context?: string;
}

interface DevelopmentPrompt {
  id: string;
  category:
    | 'personality'
    | 'background'
    | 'goals'
    | 'relationships'
    | 'psychology'
    | 'communication';
  question: string;
  description: string;
  importance: 'low' | 'medium' | 'high';
  completed: boolean;
  response?: string;
  timestamp: Date;
}

interface CharacterInteractionSystemProps {
  character: EnhancedCharacter;
  onCharacterUpdate: (character: EnhancedCharacter) => void;
  storyContext?: string;
  className?: string;
}

export default function CharacterInteractionSystem({
  character,
  onCharacterUpdate,
  className = '',
}: CharacterInteractionSystemProps) {
  const [activeTab, setActiveTab] = useState<
    'chat' | 'development' | 'analysis' | 'prompts'
  >('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    character.interactionHistory || []
  );
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [developmentPrompts, setDevelopmentPrompts] = useState<
    DevelopmentPrompt[]
  >(character.developmentPrompts || []);
  const [selectedPrompt, setSelectedPrompt] =
    useState<DevelopmentPrompt | null>(null);
  const [showCharacterProfile, setShowCharacterProfile] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<
    'personality' | 'relationships' | 'goals' | 'psychology'
  >('personality');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Generate character response using AI
  const generateCharacterResponse = useCallback(
    async (userMessage: string): Promise<string> => {
      // System prompt for character interactions (currently unused)
      /*
    const _systemPrompt = `
You are role-playing as ${character.name}, a fictional character with the following profile:

PERSONALITY:
- Archetype: ${character.archetype}
- Role: ${character.role}
- Traits: ${character.personality.traits.join(', ')}
- Strengths: ${character.personality.strengths.join(', ')}
- Weaknesses: ${character.personality.weaknesses.join(', ')}
- Fears: ${character.personality.fears.join(', ')}
- Desires: ${character.personality.desires.join(', ')}

BACKGROUND:
- Origin: ${character.background.origin}
- Family: ${character.background.family}
- Education: ${character.background.education}
- Occupation: ${character.background.occupation}
- Significant Events: ${character.background.significantEvents.join(', ')}

GOALS:
- Primary: ${character.goals.primary}
- Internal: ${character.goals.internal}
- External: ${character.goals.external}

COMMUNICATION STYLE:
- Speaking Style: ${character.communication.speakingStyle}
- Vocabulary: ${character.communication.vocabulary}
- Mannerisms: ${character.communication.mannerisms.join(', ')}

CURRENT SITUATION:
${character.storyContext.currentSituation}

Respond as ${character.name} would, maintaining their personality, speaking style, and worldview. Stay in character at all times.
`;
    */

      try {
        const response = await fetch(
          'http://localhost:3002/api/character-chat',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: userMessage,
              character: {
                name: character.name,
                archetype: character.archetype,
                personality: character.personality.traits.join(', '),
                goals: character.goals.primary,
                voiceStyle:
                  character.communication?.speakingStyle ||
                  'Natural and conversational',
                worldview: 'Optimistic and determined',
                backstory: character.background.origin,
                knownConnections: character.relationships.allies.map(ally => ({
                  name: ally.name,
                  relationship: ally.relationship,
                  description: ally.description,
                })),
              },
              context: character.storyContext?.currentSituation || '',
              conversationHistory: chatMessages.slice(-5).map(msg => ({
                sender: msg.sender,
                content: msg.content,
                timestamp: msg.timestamp.toISOString(),
              })),
            }),
          }
        );

        if (!response.ok) throw new Error('AI service unavailable');

        const data = await response.json();
        return data.response || `${character.name} seems lost in thought...`;
      } catch (error) {
        console.error('Character response generation failed:', error);
        return `${character.name} is momentarily distracted and doesn't respond clearly.`;
      }
    },
    [character, chatMessages]
  );

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const characterResponse = await generateCharacterResponse(inputMessage);

      const characterMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'character',
        content: characterResponse,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, characterMessage]);

      // Update character with new interaction history
      const updatedCharacter = {
        ...character,
        interactionHistory: [...chatMessages, userMessage, characterMessage],
      };
      onCharacterUpdate(updatedCharacter);
    } catch (error) {
      toast.error('Failed to generate character response');
    } finally {
      setIsTyping(false);
    }
  };

  // Generate development prompts
  const generateDevelopmentPrompts = useCallback(async () => {
    const promptCategories = [
      {
        category: 'personality',
        questions: [
          'What is your biggest fear and how does it affect your decisions?',
          'How do you typically react under pressure?',
          'What makes you feel most alive and fulfilled?',
          'How do you handle criticism from others?',
          'What is your greatest strength and how do you use it?',
        ],
      },
      {
        category: 'background',
        questions: [
          'What was the most defining moment of your childhood?',
          'How did your family shape who you are today?',
          'What was your first job and what did you learn from it?',
          'What cultural traditions are important to you?',
          'What was the hardest lesson you ever learned?',
        ],
      },
      {
        category: 'goals',
        questions: [
          'What is your ultimate dream in life?',
          'What would you sacrifice everything for?',
          'What do you want to achieve in the next year?',
          'What legacy do you want to leave behind?',
          'What would make you feel truly successful?',
        ],
      },
      {
        category: 'relationships',
        questions: [
          'Who do you trust most and why?',
          'What do you look for in a friend?',
          'How do you handle conflict with loved ones?',
          'What is your love language?',
          'How do you show affection to others?',
        ],
      },
      {
        category: 'psychology',
        questions: [
          'What triggers your anxiety or stress?',
          'How do you cope with difficult emotions?',
          'What helps you feel grounded and centered?',
          'How do you process grief or loss?',
          'What patterns do you notice in your behavior?',
        ],
      },
      {
        category: 'communication',
        questions: [
          'How do you express anger or frustration?',
          'What topics are hardest for you to discuss?',
          'How do you give feedback to others?',
          'What makes you feel heard and understood?',
          'How do you handle misunderstandings?',
        ],
      },
    ];

    const newPrompts: DevelopmentPrompt[] = promptCategories.flatMap(category =>
      category.questions.map((question, index) => ({
        id: `${category.category}-${index}`,
        category: category.category as
          | 'personality'
          | 'background'
          | 'goals'
          | 'relationships'
          | 'psychology'
          | 'communication',
        question,
        description: `Explore ${character.name}'s ${category.category} through this question`,
        importance:
          Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        completed: false,
        timestamp: new Date(),
      }))
    );

    setDevelopmentPrompts(newPrompts);

    const updatedCharacter = {
      ...character,
      developmentPrompts: newPrompts,
    };
    onCharacterUpdate(updatedCharacter);

    toast.success(
      `Generated ${newPrompts.length} development prompts for ${character.name}`
    );
  }, [character, onCharacterUpdate]);

  // Handle prompt response
  // Handle prompt responses (currently unused but kept for future implementation)
  /*
  const _handlePromptResponse = async (prompt: DevelopmentPrompt, response: string) => {
    const updatedPrompts = developmentPrompts.map(p => 
      p.id === prompt.id 
        ? { ...p, completed: true, response, timestamp: new Date() }
        : p
    );
    
    setDevelopmentPrompts(updatedPrompts);
    
    // Update character with new development information
    const updatedCharacter = {
      ...character,
      developmentPrompts: updatedPrompts,
      development: {
        ...character.development,
        developmentNotes: [...character.development.developmentNotes, `${prompt.question}: ${response}`]
      }
    };
    onCharacterUpdate(updatedCharacter);
    
    toast.success('Character development updated!');
  };
  */

  // Analyze character personality
  const analyzeCharacter = useCallback(
    async (analysisType: string) => {
      const analysisPrompt = `
Analyze ${character.name}'s ${analysisType} based on their profile:

PERSONALITY: ${JSON.stringify(character.personality)}
BACKGROUND: ${JSON.stringify(character.background)}
GOALS: ${JSON.stringify(character.goals)}
RELATIONSHIPS: ${JSON.stringify(character.relationships)}
PSYCHOLOGY: ${JSON.stringify(character.psychology)}

Provide insights about their ${analysisType} patterns, strengths, areas for growth, and how this affects their story arc.
`;

      try {
        const response = await fetch('/api/openai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content:
                  'You are a character development expert analyzing fictional characters.',
              },
              { role: 'user', content: analysisPrompt },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (!response.ok) throw new Error('Analysis service unavailable');

        const data = await response.json();
        return (
          data.choices?.[0]?.message?.content?.trim() || 'Analysis unavailable'
        );
      } catch (error) {
        console.error('Character analysis failed:', error);
        return 'Analysis failed. Please try again.';
      }
    },
    [character]
  );

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {character.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {character.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {character.archetype} • {character.role}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowCharacterProfile(!showCharacterProfile)}
              className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg"
            >
              <Eye className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <button
              onClick={generateDevelopmentPrompts}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Generate Prompts</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 mt-4">
          {[
            { id: 'chat', label: 'Chat', icon: MessageCircle },
            { id: 'development', label: 'Development', icon: Brain },
            { id: 'analysis', label: 'Analysis', icon: TrendingUp },
            { id: 'prompts', label: 'Prompts', icon: Target },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as 'chat' | 'development' | 'analysis' | 'prompts'
                )
              }
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'chat' && (
          <div className="space-y-4">
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with {character.name}</p>
                </div>
              ) : (
                chatMessages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg">
                    <p className="text-sm">{character.name} is typing...</p>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Chat with ${character.name}...`}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={isTyping}
              />
              <button
                onClick={() => setIsListening(!isListening)}
                className={`p-2 rounded-lg ${
                  isListening
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleSendMessage}
                disabled={isTyping || !inputMessage.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'development' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Character Stats */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Development Progress
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Arc Stage
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {character.arc.currentStage}/{character.arc.stages.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Growth Areas
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {character.development.growthAreas.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Achievements
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {character.development.achievements.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Development Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Development
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {character.development.developmentNotes
                    .slice(-5)
                    .map((note, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded"
                      >
                        {note}
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Growth Areas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Growth Areas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {character.development.growthAreas.map((area, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                  >
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {area}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Analysis Mode Selector */}
            <div className="flex space-x-2">
              {[
                { id: 'personality', label: 'Personality', icon: Brain },
                { id: 'relationships', label: 'Relationships', icon: Users },
                { id: 'goals', label: 'Goals', icon: Target },
                { id: 'psychology', label: 'Psychology', icon: Heart },
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() =>
                    setAnalysisMode(
                      mode.id as
                        | 'personality'
                        | 'goals'
                        | 'relationships'
                        | 'psychology'
                    )
                  }
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    analysisMode === mode.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <mode.icon className="w-4 h-4" />
                  <span>{mode.label}</span>
                </button>
              ))}
            </div>

            {/* Analysis Content */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {analysisMode.charAt(0).toUpperCase() + analysisMode.slice(1)}{' '}
                Analysis
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Click &quot;Run Analysis&quot; to get AI-powered insights about{' '}
                {character.name}&apos;s {analysisMode}.
              </p>
              <button
                onClick={() => analyzeCharacter(analysisMode)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Run Analysis</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'prompts' && (
          <div className="space-y-6">
            {/* Prompt Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  id: 'personality',
                  label: 'Personality',
                  icon: Brain,
                  color: 'blue',
                },
                {
                  id: 'background',
                  label: 'Background',
                  icon: BookOpen,
                  color: 'green',
                },
                { id: 'goals', label: 'Goals', icon: Target, color: 'purple' },
                {
                  id: 'relationships',
                  label: 'Relationships',
                  icon: Users,
                  color: 'pink',
                },
                {
                  id: 'psychology',
                  label: 'Psychology',
                  icon: Heart,
                  color: 'red',
                },
                {
                  id: 'communication',
                  label: 'Communication',
                  icon: MessageCircle,
                  color: 'orange',
                },
              ].map(category => {
                const categoryPrompts = developmentPrompts.filter(
                  p => p.category === category.id
                );
                const completedCount = categoryPrompts.filter(
                  p => p.completed
                ).length;
                const totalCount = categoryPrompts.length;

                return (
                  <div
                    key={category.id}
                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className={`w-8 h-8 bg-${category.color}-100 dark:bg-${category.color}-900/20 rounded-full flex items-center justify-center`}
                      >
                        <category.icon
                          className={`w-4 h-4 text-${category.color}-600 dark:text-${category.color}-400`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {category.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {completedCount}/{totalCount} completed
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {categoryPrompts.slice(0, 3).map(prompt => (
                        <button
                          key={prompt.id}
                          onClick={() => setSelectedPrompt(prompt)}
                          className={`w-full text-left p-2 rounded text-sm transition-colors ${
                            prompt.completed
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                              : 'bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{prompt.question}</span>
                            {prompt.completed && (
                              <Star className="w-3 h-3 text-green-500" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Prompt Modal */}
            {selectedPrompt && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {selectedPrompt.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedPrompt.description}
                  </p>
                  {selectedPrompt.completed ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                        <p className="text-green-700 dark:text-green-300 text-sm">
                          {selectedPrompt.response}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedPrompt(null)}
                        className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <textarea
                        placeholder="Enter your response..."
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        rows={4}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedPrompt(null)}
                          className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            // Handle prompt response
                            setSelectedPrompt(null);
                          }}
                          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                          Save Response
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Character Profile Sidebar */}
      {showCharacterProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {character.name}&apos;s Profile
              </h2>
              <button
                onClick={() => setShowCharacterProfile(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="sr-only">Close</span>×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personality */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Personality
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Traits:
                    </span>
                    <p className="text-gray-700 dark:text-gray-300">
                      {character.personality.traits.join(', ')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Strengths:
                    </span>
                    <p className="text-gray-700 dark:text-gray-300">
                      {character.personality.strengths.join(', ')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Weaknesses:
                    </span>
                    <p className="text-gray-700 dark:text-gray-300">
                      {character.personality.weaknesses.join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Background */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Background
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Origin:
                    </span>
                    <p className="text-gray-700 dark:text-gray-300">
                      {character.background.origin}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Family:
                    </span>
                    <p className="text-gray-700 dark:text-gray-300">
                      {character.background.family}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Occupation:
                    </span>
                    <p className="text-gray-700 dark:text-gray-300">
                      {character.background.occupation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Goals */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Goals
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Primary:
                    </span>
                    <p className="text-gray-700 dark:text-gray-300">
                      {character.goals.primary}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Internal:
                    </span>
                    <p className="text-gray-700 dark:text-gray-300">
                      {character.goals.internal}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      External:
                    </span>
                    <p className="text-gray-700 dark:text-gray-300">
                      {character.goals.external}
                    </p>
                  </div>
                </div>
              </div>

              {/* Communication */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Communication
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Speaking Style:
                    </span>
                    <p className="text-gray-700 dark:text-gray-300">
                      {character.communication.speakingStyle}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Vocabulary:
                    </span>
                    <p className="text-gray-700 dark:text-gray-300">
                      {character.communication.vocabulary}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Mannerisms:
                    </span>
                    <p className="text-gray-700 dark:text-gray-300">
                      {character.communication.mannerisms.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
