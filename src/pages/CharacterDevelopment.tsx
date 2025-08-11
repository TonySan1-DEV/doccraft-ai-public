import { useState } from 'react';

import {
  Users,
  Brain,
  Target,
  Plus,
  Trash2,
  Eye,
  TrendingUp,
  BookOpen,
  UserCheck,
  MessageCircle,
  Sparkles,
  Activity,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import CharacterInteractionSystem from '../components/CharacterInteractionSystem';
import EnhancedCharacterChat from '../components/EnhancedCharacterChat';
import AdvancedCharacterDevelopment from '../components/AdvancedCharacterDevelopment';
import { CharacterPersona } from '../types/CharacterPersona';
import type { EnhancedCharacter } from '../components/CharacterInteractionSystem';
// import { useCharacterInteraction, useCharacterDevelopment } from '../hooks/useCharacterInteraction'

interface Character {
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
    allies: string[];
    enemies: string[];
    mentors: string[];
    loveInterests: string[];
  };
  development: {
    currentStage: number;
    totalStages: number;
    growthAreas: string[];
    achievements: string[];
    developmentNotes: string[];
  };
  voiceStyle: string;
  worldview: string;
  backstory: string;
}

export default function CharacterDevelopment() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'personality'
    | 'background'
    | 'goals'
    | 'relationships'
    | 'arc'
    | 'interaction'
    | 'enhanced-interaction'
    | 'advanced-development'
  >('overview');
  const [showInteractionSystem, setShowInteractionSystem] = useState(false);
  const [showEnhancedChat, setShowEnhancedChat] = useState(false);
  const [showAdvancedDevelopment, setShowAdvancedDevelopment] = useState(false);

  const createCharacter = () => {
    const newCharacter: Character = {
      id: Date.now().toString(),
      name: 'New Character',
      role: 'protagonist',
      archetype: 'Hero',
      personality: {
        traits: ['Brave', 'Curious', 'Determined'],
        strengths: ['Leadership', 'Courage', 'Loyalty'],
        weaknesses: ['Impatience', 'Stubbornness', 'Trust issues'],
        fears: ['Failure', 'Loss of loved ones', 'Unknown'],
        desires: ['Recognition', 'Love', 'Purpose'],
        mbti: 'ENFP',
        enneagram: 'Type 7',
        bigFive: {
          openness: 0.8,
          conscientiousness: 0.6,
          extraversion: 0.7,
          agreeableness: 0.8,
          neuroticism: 0.4,
        },
      },
      background: {
        origin: 'Small town upbringing',
        family: 'Middle-class family',
        education: 'High school graduate',
        occupation: 'Student/Apprentice',
        significantEvents: [
          'Lost a parent at young age',
          'Discovered special abilities',
        ],
        childhood: 'Happy but sheltered childhood',
        formativeExperiences: ['First major failure', 'Meeting mentor'],
        culturalBackground: 'Western, middle-class',
        socioeconomicStatus: 'Middle class',
      },
      goals: {
        primary: 'Find the lost artifact',
        secondary: ['Protect family', 'Prove worth', 'Find love'],
        internal: 'Overcome fear of failure',
        external: 'Defeat the antagonist',
        shortTerm: ['Complete training', 'Gather allies'],
        longTerm: ['Save the world', 'Find true love'],
      },
      conflicts: {
        internal: ['Self-doubt', 'Fear of responsibility', 'Identity crisis'],
        external: [
          'Antagonist threat',
          'Society pressure',
          'Natural disasters',
        ],
        relationships: [
          'Love triangle',
          'Family expectations',
          'Mentor conflict',
        ],
        moralDilemmas: ['Ends justify means?', 'Personal vs. greater good'],
      },
      arc: {
        type: 'hero',
        description: "Hero's journey from ordinary to extraordinary",
        stages: [
          'Call to adventure',
          'Crossing threshold',
          'Tests and trials',
          'Return with elixir',
        ],
        currentStage: 0,
      },
      relationships: {
        allies: ['Mentor', 'Best friend', 'Love interest'],
        enemies: ['Main antagonist', 'Rival'],
        mentors: ['Wise old sage'],
        loveInterests: ['Childhood friend', 'Mysterious stranger'],
      },
      development: {
        currentStage: 0,
        totalStages: 4,
        growthAreas: [
          'Emotional intelligence',
          'Leadership skills',
          'Self-confidence',
        ],
        achievements: ['Completed basic training'],
        developmentNotes: ['Character shows strong potential for growth'],
      },
      voiceStyle: 'Confident and warm',
      worldview: 'Optimistic but realistic',
      backstory: 'Born to be a hero, raised in a small town with big dreams',
    };

    setCharacters(prev => [...prev, newCharacter]);
    setSelectedCharacter(newCharacter);
    toast.success('New character created!');
  };

  const deleteCharacter = (characterId: string) => {
    setCharacters(prev => prev.filter(char => char.id !== characterId));
    if (selectedCharacter?.id === characterId) {
      setSelectedCharacter(null);
    }
    toast.success('Character deleted!');
  };

  const updateCharacter = (updatedCharacter: Character) => {
    setCharacters(prev =>
      prev.map(char =>
        char.id === updatedCharacter.id ? updatedCharacter : char
      )
    );
    if (selectedCharacter?.id === updatedCharacter.id) {
      setSelectedCharacter(updatedCharacter);
    }
    toast.success('Character updated!');
  };

  const convertToCharacterPersona = (
    character: Character
  ): CharacterPersona => {
    return {
      id: character.id,
      name: character.name,
      description:
        character.backstory ||
        `A ${character.role} character with ${character.archetype} archetype`,
      archetype: character.archetype,
      personality: character.personality.traits, // Use array directly
      goals: character.goals.primary ? [character.goals.primary] : [], // Convert to array
      conflicts: [
        ...character.conflicts.internal,
        ...character.conflicts.external,
        ...character.conflicts.relationships,
        ...character.conflicts.moralDilemmas,
      ],
      arc: character.arc.description,
      voiceStyle: character.voiceStyle,
      worldview: character.worldview,
      backstory: character.backstory,
      personalityDetails: {
        traits: character.personality.traits,
        strengths: character.personality.strengths,
        weaknesses: character.personality.weaknesses,
        fears: character.personality.fears,
        desires: character.personality.desires,
      },
      goalsDetails: {
        primary: character.goals.primary,
        secondary: character.goals.secondary,
        internal: character.goals.internal,
        external: character.goals.external,
      },
      relationships: character.relationships.allies.map(ally => ({
        name: ally,
        relationship: 'ally',
      })),
      developmentNotes: character.development.developmentNotes,
      knownConnections: character.relationships.allies.map(ally => ({
        name: ally,
        relationship: 'ally',
        description: '',
      })),
    };
  };

  // Convert Character to EnhancedCharacter for components that expect it
  const convertToEnhancedCharacter = (
    character: Character
  ): EnhancedCharacter => {
    return {
      ...character,
      communication: {
        speakingStyle: character.voiceStyle || 'Natural and conversational',
        vocabulary: 'Standard',
        mannerisms: [],
        emotionalExpression: 'Moderate',
        communicationBarriers: [],
      },
      psychology: {
        defenseMechanisms: [],
        copingStrategies: [],
        triggers: [],
        comfortZones: [],
        growthPotential: character.development.growthAreas,
      },
      storyContext: {
        currentSituation: '',
        immediateGoals: character.goals.shortTerm,
        obstacles: [],
        resources: [],
        timeline: '',
      },
      interactionHistory: [],
      developmentPrompts: [],
      relationships: {
        allies: character.relationships.allies.map(ally => ({
          name: ally,
          relationship: 'ally',
          description: '',
        })),
        enemies: character.relationships.enemies.map(enemy => ({
          name: enemy,
          relationship: 'enemy',
          description: '',
        })),
        mentors: character.relationships.mentors.map(mentor => ({
          name: mentor,
          relationship: 'mentor',
          description: '',
        })),
        loveInterests: character.relationships.loveInterests.map(love => ({
          name: love,
          relationship: 'love interest',
          description: '',
        })),
      },
    };
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'personality', label: 'Personality', icon: Brain },
    { id: 'background', label: 'Background', icon: BookOpen },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'relationships', label: 'Relationships', icon: Users },
    { id: 'arc', label: 'Character Arc', icon: TrendingUp },
    { id: 'interaction', label: 'Basic Chat', icon: MessageCircle },
    { id: 'enhanced-interaction', label: 'Enhanced Chat', icon: Sparkles },
    {
      id: 'advanced-development',
      label: 'Advanced Development',
      icon: Activity,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Character Development
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create, develop, and interact with your fictional characters
          </p>
        </div>

        {/* Character Management */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Character List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Characters
                </h2>
                <button
                  onClick={createCharacter}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {characters.map(character => (
                  <div
                    key={character.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCharacter?.id === character.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedCharacter(character)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedCharacter(character);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {character.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {character.role} • {character.archetype}
                        </p>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteCharacter(character.id);
                        }}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {characters.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No characters yet</p>
                  <p className="text-sm">
                    Create your first character to get started
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Character Details */}
          <div className="lg:col-span-3">
            {selectedCharacter ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                {/* Character Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedCharacter.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedCharacter.role} • {selectedCharacter.archetype}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setShowInteractionSystem(!showInteractionSystem)
                        }
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Basic Chat</span>
                      </button>
                      <button
                        onClick={() => setShowEnhancedChat(!showEnhancedChat)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center space-x-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Enhanced Chat</span>
                      </button>
                      <button
                        onClick={() =>
                          setShowAdvancedDevelopment(!showAdvancedDevelopment)
                        }
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2"
                      >
                        <Activity className="w-4 h-4" />
                        <span>Advanced Dev</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="flex space-x-8 px-6">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
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
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Character Overview
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Role:
                              </span>
                              <p className="text-gray-900 dark:text-white">
                                {selectedCharacter.role}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Archetype:
                              </span>
                              <p className="text-gray-900 dark:text-white">
                                {selectedCharacter.archetype}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Primary Goal:
                              </span>
                              <p className="text-gray-900 dark:text-white">
                                {selectedCharacter.goals.primary}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Character Arc:
                              </span>
                              <p className="text-gray-900 dark:text-white">
                                {selectedCharacter.arc.type}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Development Progress
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Current Stage:
                              </span>
                              <p className="text-gray-900 dark:text-white">
                                {selectedCharacter.development.currentStage + 1}{' '}
                                of {selectedCharacter.development.totalStages}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Growth Areas:
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedCharacter.development.growthAreas.map(
                                  (area, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded"
                                    >
                                      {area}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Achievements:
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedCharacter.development.achievements.map(
                                  (achievement, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded"
                                    >
                                      {achievement}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'personality' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Personality Traits
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Traits:
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedCharacter.personality.traits.map(
                                  (trait, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded"
                                    >
                                      {trait}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Strengths:
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedCharacter.personality.strengths.map(
                                  (strength, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded"
                                    >
                                      {strength}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Weaknesses:
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedCharacter.personality.weaknesses.map(
                                  (weakness, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs rounded"
                                    >
                                      {weakness}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Psychological Profile
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Fears:
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedCharacter.personality.fears.map(
                                  (fear, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded"
                                    >
                                      {fear}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Desires:
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedCharacter.personality.desires.map(
                                  (desire, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs rounded"
                                    >
                                      {desire}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                            {selectedCharacter.personality.mbti && (
                              <div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  MBTI:
                                </span>
                                <p className="text-gray-900 dark:text-white">
                                  {selectedCharacter.personality.mbti}
                                </p>
                              </div>
                            )}
                            {selectedCharacter.personality.enneagram && (
                              <div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Enneagram:
                                </span>
                                <p className="text-gray-900 dark:text-white">
                                  {selectedCharacter.personality.enneagram}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'background' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Background Information
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Origin:
                              </span>
                              <p className="text-gray-900 dark:text-white">
                                {selectedCharacter.background.origin}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Family:
                              </span>
                              <p className="text-gray-900 dark:text-white">
                                {selectedCharacter.background.family}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Education:
                              </span>
                              <p className="text-gray-900 dark:text-white">
                                {selectedCharacter.background.education}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Occupation:
                              </span>
                              <p className="text-gray-900 dark:text-white">
                                {selectedCharacter.background.occupation}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Significant Events
                          </h3>
                          <div className="space-y-2">
                            {selectedCharacter.background.significantEvents.map(
                              (event, index) => (
                                <div
                                  key={index}
                                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
                                >
                                  <p className="text-gray-900 dark:text-white text-sm">
                                    {event}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'goals' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Primary Goals
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Primary Goal:
                              </span>
                              <p className="text-gray-900 dark:text-white">
                                {selectedCharacter.goals.primary}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Internal Goal:
                              </span>
                              <p className="text-gray-900 dark:text-white">
                                {selectedCharacter.goals.internal}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                External Goal:
                              </span>
                              <p className="text-gray-900 dark:text-white">
                                {selectedCharacter.goals.external}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Secondary Goals
                          </h3>
                          <div className="space-y-2">
                            {selectedCharacter.goals.secondary.map(
                              (goal, index) => (
                                <div
                                  key={index}
                                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
                                >
                                  <p className="text-gray-900 dark:text-white text-sm">
                                    {goal}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'relationships' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Allies & Friends
                          </h3>
                          <div className="space-y-2">
                            {selectedCharacter.relationships.allies.map(
                              (ally, index) => (
                                <div
                                  key={index}
                                  className="p-3 bg-green-50 dark:bg-green-900/20 rounded"
                                >
                                  <p className="text-gray-900 dark:text-white text-sm">
                                    {ally}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Enemies & Rivals
                          </h3>
                          <div className="space-y-2">
                            {selectedCharacter.relationships.enemies.map(
                              (enemy, index) => (
                                <div
                                  key={index}
                                  className="p-3 bg-red-50 dark:bg-red-900/20 rounded"
                                >
                                  <p className="text-gray-900 dark:text-white text-sm">
                                    {enemy}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'arc' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Character Arc
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Arc Type:
                            </span>
                            <p className="text-gray-900 dark:text-white">
                              {selectedCharacter.arc.type}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Description:
                            </span>
                            <p className="text-gray-900 dark:text-white">
                              {selectedCharacter.arc.description}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Stages:
                            </span>
                            <div className="space-y-2 mt-2">
                              {selectedCharacter.arc.stages.map(
                                (stage, index) => (
                                  <div
                                    key={index}
                                    className={`p-3 rounded ${
                                      index ===
                                      selectedCharacter.development.currentStage
                                        ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                                        : 'bg-gray-50 dark:bg-gray-700'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <p className="text-gray-900 dark:text-white text-sm">
                                        {index + 1}. {stage}
                                      </p>
                                      {index ===
                                        selectedCharacter.development
                                          .currentStage && (
                                        <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                                          Current
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'interaction' && (
                    <div>
                      <CharacterInteractionSystem
                        character={convertToEnhancedCharacter(
                          selectedCharacter
                        )}
                        onCharacterUpdate={updatedEnhancedCharacter => {
                          // Convert EnhancedCharacter back to Character
                          const updatedCharacter: Character = {
                            ...selectedCharacter,
                            name: updatedEnhancedCharacter.name,
                            personality: updatedEnhancedCharacter.personality,
                            goals: updatedEnhancedCharacter.goals,
                            voiceStyle:
                              updatedEnhancedCharacter.communication
                                ?.speakingStyle || selectedCharacter.voiceStyle,
                            worldview: selectedCharacter.worldview, // EnhancedCharacter doesn't have worldview
                            backstory: selectedCharacter.backstory, // EnhancedCharacter doesn't have backstory
                            development: updatedEnhancedCharacter.development,
                            relationships: {
                              allies:
                                updatedEnhancedCharacter.relationships.allies.map(
                                  a => a.name
                                ),
                              enemies:
                                updatedEnhancedCharacter.relationships.enemies.map(
                                  e => e.name
                                ),
                              mentors:
                                updatedEnhancedCharacter.relationships.mentors.map(
                                  m => m.name
                                ),
                              loveInterests:
                                updatedEnhancedCharacter.relationships.loveInterests.map(
                                  l => l.name
                                ),
                            },
                          };
                          updateCharacter(updatedCharacter);
                        }}
                      />
                    </div>
                  )}

                  {activeTab === 'enhanced-interaction' && (
                    <div>
                      <EnhancedCharacterChat
                        character={convertToCharacterPersona(selectedCharacter)}
                        onCharacterUpdate={updatedCharacterPersona => {
                          // Convert CharacterPersona back to Character
                          const updatedCharacter: Character = {
                            ...selectedCharacter,
                            name: updatedCharacterPersona.name,
                            personality: {
                              traits:
                                updatedCharacterPersona.personalityDetails
                                  ?.traits || [],
                              strengths:
                                updatedCharacterPersona.personalityDetails
                                  ?.strengths || [],
                              weaknesses:
                                updatedCharacterPersona.personalityDetails
                                  ?.weaknesses || [],
                              fears:
                                updatedCharacterPersona.personalityDetails
                                  ?.fears || [],
                              desires:
                                updatedCharacterPersona.personalityDetails
                                  ?.desires || [],
                            },
                            goals: {
                              primary:
                                updatedCharacterPersona.goalsDetails?.primary ||
                                '',
                              secondary:
                                updatedCharacterPersona.goalsDetails
                                  ?.secondary || [],
                              internal:
                                updatedCharacterPersona.goalsDetails
                                  ?.internal || '',
                              external:
                                updatedCharacterPersona.goalsDetails
                                  ?.external || '',
                              shortTerm: [],
                              longTerm: [],
                            },
                            voiceStyle:
                              updatedCharacterPersona.voiceStyle ||
                              selectedCharacter.voiceStyle,
                            worldview:
                              updatedCharacterPersona.worldview ||
                              selectedCharacter.worldview,
                            backstory:
                              updatedCharacterPersona.backstory ||
                              selectedCharacter.backstory ||
                              '',
                            development: {
                              ...selectedCharacter.development,
                              developmentNotes:
                                updatedCharacterPersona.developmentNotes ||
                                selectedCharacter.development
                                  .developmentNotes ||
                                [],
                            },
                            relationships: {
                              allies:
                                updatedCharacterPersona.relationships?.map(
                                  r => r.name
                                ) || selectedCharacter.relationships.allies,
                              enemies: selectedCharacter.relationships.enemies,
                              mentors: selectedCharacter.relationships.mentors,
                              loveInterests:
                                selectedCharacter.relationships.loveInterests,
                            },
                          };
                          updateCharacter(updatedCharacter);
                        }}
                      />
                    </div>
                  )}

                  {activeTab === 'advanced-development' && (
                    <div>
                      <AdvancedCharacterDevelopment
                        character={convertToCharacterPersona(selectedCharacter)}
                        onCharacterUpdate={updatedCharacterPersona => {
                          // Convert CharacterPersona back to Character
                          const updatedCharacter: Character = {
                            ...selectedCharacter,
                            name: updatedCharacterPersona.name,
                            personality: {
                              traits:
                                updatedCharacterPersona.personalityDetails
                                  ?.traits || [],
                              strengths:
                                updatedCharacterPersona.personalityDetails
                                  ?.strengths || [],
                              weaknesses:
                                updatedCharacterPersona.personalityDetails
                                  ?.weaknesses || [],
                              fears:
                                updatedCharacterPersona.personalityDetails
                                  ?.fears || [],
                              desires:
                                updatedCharacterPersona.personalityDetails
                                  ?.desires || [],
                            },
                            goals: {
                              primary:
                                updatedCharacterPersona.goalsDetails?.primary ||
                                '',
                              secondary:
                                updatedCharacterPersona.goalsDetails
                                  ?.secondary || [],
                              internal:
                                updatedCharacterPersona.goalsDetails
                                  ?.internal || '',
                              external:
                                updatedCharacterPersona.goalsDetails
                                  ?.external || '',
                              shortTerm: [],
                              longTerm: [],
                            },
                            voiceStyle:
                              updatedCharacterPersona.voiceStyle ||
                              selectedCharacter.voiceStyle,
                            worldview:
                              updatedCharacterPersona.worldview ||
                              selectedCharacter.worldview,
                            backstory:
                              updatedCharacterPersona.backstory ||
                              selectedCharacter.backstory ||
                              '',
                            development: {
                              ...selectedCharacter.development,
                              developmentNotes:
                                updatedCharacterPersona.developmentNotes ||
                                selectedCharacter.development
                                  .developmentNotes ||
                                [],
                            },
                            relationships: {
                              allies:
                                updatedCharacterPersona.relationships?.map(
                                  r => r.name
                                ) || selectedCharacter.relationships.allies,
                              enemies: selectedCharacter.relationships.enemies,
                              mentors: selectedCharacter.relationships.mentors,
                              loveInterests:
                                selectedCharacter.relationships.loveInterests,
                            },
                          };
                          updateCharacter(updatedCharacter);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Character Selected
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Select a character from the list or create a new one to get
                  started
                </p>
                <button
                  onClick={createCharacter}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create New Character</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
