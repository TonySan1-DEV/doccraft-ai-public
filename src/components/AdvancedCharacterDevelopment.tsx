// Advanced Character Development Component
// Comprehensive character development with AI-powered features

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Brain, 
  Heart, 
  Users, 
  Target, 
  Zap, 
  TrendingUp, 
  Lightbulb,
  MessageCircle,
  Star,
  Shield,
  Sword,
  Crown,
  UserCheck,
  Settings,
  BarChart3,
  Network,
  GitBranch,
  Clock,
  Calendar,
  BookOpen,
  Eye,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { advancedCharacterAI } from '../services/advancedCharacterAI';
import { characterRelationshipEngine } from '../services/characterRelationshipEngine';
import { CharacterPersona } from '../types/CharacterPersona';

interface AdvancedCharacterDevelopmentProps {
  character: CharacterPersona;
  onCharacterUpdate: (character: CharacterPersona) => void;
  className?: string;
}

interface DevelopmentSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  focus: string;
  insights: string[];
  progress: number;
  notes: string[];
}

interface CharacterMetrics {
  personalityDepth: number;
  relationshipComplexity: number;
  emotionalRange: number;
  growthPotential: number;
  consistencyScore: number;
  evolutionStage: number;
}

export default function AdvancedCharacterDevelopment({
  character,
  onCharacterUpdate,
  className = ''
}: AdvancedCharacterDevelopmentProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'personality' | 'relationships' | 'evolution' | 'analytics'>('overview');
  const [developmentSession, setDevelopmentSession] = useState<DevelopmentSession | null>(null);
  const [characterMetrics, setCharacterMetrics] = useState<CharacterMetrics>({
    personalityDepth: 0.6,
    relationshipComplexity: 0.4,
    emotionalRange: 0.7,
    growthPotential: 0.8,
    consistencyScore: 0.75,
    evolutionStage: 0.5
  });
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);

  // Load character data on mount
  useEffect(() => {
    loadCharacterData();
  }, [character.id]);

  const loadCharacterData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load character relationships
      const characterRelationships = await characterRelationshipEngine.getAllRelationships(character.id);
      setRelationships(characterRelationships);
      
      // Generate insights
      const personalityInsights = await advancedCharacterAI.deepenPersonality(character.id);
      const conflictInsights = await advancedCharacterAI.generateInternalConflict(character.id);
      const growthInsights = await advancedCharacterAI.suggestCharacterGrowth(character.id);
      
      setInsights([...personalityInsights, ...conflictInsights, ...growthInsights]);
      
    } catch (error) {
      console.error('Failed to load character data:', error);
      toast.error('Failed to load character development data');
    } finally {
      setIsLoading(false);
    }
  }, [character.id]);

  const startDevelopmentSession = useCallback(async (focus: string) => {
    const session: DevelopmentSession = {
      id: `session-${Date.now()}`,
      startTime: new Date(),
      focus,
      insights: [],
      progress: 0,
      notes: []
    };
    
    setDevelopmentSession(session);
    toast.success(`Started development session: ${focus}`);
  }, []);

  const endDevelopmentSession = useCallback(async () => {
    if (!developmentSession) return;
    
    const endedSession = {
      ...developmentSession,
      endTime: new Date()
    };
    
    setDevelopmentSession(null);
    toast.success('Development session completed');
    
    // Update character with session insights
    const updatedCharacter = {
      ...character,
      developmentNotes: [...(character.developmentNotes || []), ...endedSession.insights]
    };
    onCharacterUpdate(updatedCharacter);
  }, [developmentSession, character, onCharacterUpdate]);

  const generateDeepInsight = useCallback(async (category: string) => {
    setIsLoading(true);
    try {
      let newInsights: string[] = [];
      
      switch (category) {
        case 'personality':
          newInsights = await advancedCharacterAI.deepenPersonality(character.id);
          break;
        case 'conflicts':
          newInsights = await advancedCharacterAI.generateInternalConflict(character.id);
          break;
        case 'growth':
          newInsights = await advancedCharacterAI.suggestCharacterGrowth(character.id);
          break;
        case 'relationships':
          const relationshipPrompts = await Promise.all(
            relationships.map(rel => characterRelationshipEngine.generateRelationshipPrompts(rel.id))
          );
          newInsights = relationshipPrompts.flat();
          break;
      }
      
      setInsights(prev => [...prev, ...newInsights]);
      toast.success(`Generated ${newInsights.length} new insights`);
      
    } catch (error) {
      console.error('Failed to generate insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setIsLoading(false);
    }
  }, [character.id, relationships]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Character Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Personality Depth</p>
              <p className="text-2xl font-bold text-blue-600">{Math.round(characterMetrics.personalityDepth * 100)}%</p>
            </div>
            <Brain className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Relationships</p>
              <p className="text-2xl font-bold text-green-600">{relationships.length}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Growth Potential</p>
              <p className="text-2xl font-bold text-purple-600">{Math.round(characterMetrics.growthPotential * 100)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => startDevelopmentSession('personality')}
          className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <Brain className="h-6 w-6 mr-3" />
          <div className="text-left">
            <p className="font-semibold">Deepen Personality</p>
            <p className="text-sm opacity-90">Explore character's inner world</p>
          </div>
        </button>
        
        <button
          onClick={() => startDevelopmentSession('relationships')}
          className="flex items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
        >
          <Users className="h-6 w-6 mr-3" />
          <div className="text-left">
            <p className="font-semibold">Explore Relationships</p>
            <p className="text-sm opacity-90">Develop character connections</p>
          </div>
        </button>
        
        <button
          onClick={() => startDevelopmentSession('conflicts')}
          className="flex items-center p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
        >
          <Sword className="h-6 w-6 mr-3" />
          <div className="text-left">
            <p className="font-semibold">Internal Conflicts</p>
            <p className="text-sm opacity-90">Explore character struggles</p>
          </div>
        </button>
        
        <button
          onClick={() => startDevelopmentSession('growth')}
          className="flex items-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all"
        >
          <TrendingUp className="h-6 w-6 mr-3" />
          <div className="text-left">
            <p className="font-semibold">Character Growth</p>
            <p className="text-sm opacity-90">Plan character evolution</p>
          </div>
        </button>
      </div>

      {/* Recent Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
          Recent Insights
        </h3>
        <div className="space-y-3">
          {insights.slice(0, 5).map((insight, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPersonality = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Personality Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Core Traits</h4>
            <div className="space-y-2">
              {character.personality.traits.map((trait, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{trait}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.random() * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Strengths & Weaknesses</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-green-600 mb-2">Strengths</p>
                <div className="space-y-1">
                  {character.personality.strengths.map((strength, index) => (
                    <div key={index} className="text-sm text-gray-600">• {strength}</div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-red-600 mb-2">Weaknesses</p>
                <div className="space-y-1">
                  {character.personality.weaknesses.map((weakness, index) => (
                    <div key={index} className="text-sm text-gray-600">• {weakness}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Deepen Personality</h3>
          <button
            onClick={() => generateDeepInsight('personality')}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Generate Insights'}
          </button>
        </div>
        <div className="space-y-3">
          {insights.filter(insight => insight.includes('personality') || insight.includes('belief') || insight.includes('value')).map((insight, index) => (
            <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRelationships = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Character Relationships</h3>
          <button
            onClick={() => generateDeepInsight('relationships')}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Relationships'}
          </button>
        </div>
        
        <div className="space-y-4">
          {relationships.map((relationship, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{relationship.characterA === character.id ? relationship.characterB : relationship.characterA}</h4>
                <span className="px-2 py-1 text-xs bg-gray-100 rounded">{relationship.relationshipType}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Trust: {Math.round(relationship.trust * 100)}%</p>
                  <p className="text-gray-600">Strength: {Math.round(relationship.strength * 100)}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Conflict: {Math.round(relationship.conflict * 100)}%</p>
                  <p className="text-gray-600">Status: {relationship.currentStatus}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEvolution = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Character Evolution</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Current Stage</h4>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all" 
                style={{ width: `${characterMetrics.evolutionStage * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">Character is {Math.round(characterMetrics.evolutionStage * 100)}% through their development</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Growth Areas</h4>
              <div className="space-y-2">
                {['Emotional Intelligence', 'Communication Skills', 'Self-Awareness'].map((area, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{area}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.random() * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Achievements</h4>
              <div className="space-y-2">
                {['Overcame initial fears', 'Built first meaningful relationship', 'Developed core values'].map((achievement, index) => (
                  <div key={index} className="flex items-center p-2 bg-green-50 rounded">
                    <Star className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Growth Opportunities</h3>
          <button
            onClick={() => generateDeepInsight('growth')}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Generate Growth Plan'}
          </button>
        </div>
        <div className="space-y-3">
          {insights.filter(insight => insight.includes('grow') || insight.includes('develop') || insight.includes('improve')).map((insight, index) => (
            <div key={index} className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Character Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Personality Depth</span>
                <span>{Math.round(characterMetrics.personalityDepth * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${characterMetrics.personalityDepth * 100}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Emotional Range</span>
                <span>{Math.round(characterMetrics.emotionalRange * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${characterMetrics.emotionalRange * 100}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Consistency</span>
                <span>{Math.round(characterMetrics.consistencyScore * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${characterMetrics.consistencyScore * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Development Progress</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Sessions Completed</span>
              <span className="font-semibold">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Insights Generated</span>
              <span className="font-semibold">{insights.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Relationships</span>
              <span className="font-semibold">{relationships.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Growth Score</span>
              <span className="font-semibold">{Math.round(characterMetrics.growthPotential * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-gray-50 min-h-screen ${className}`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Advanced Character Development
          </h1>
          <p className="text-gray-600">
            Comprehensive AI-powered character development for {character.name}
          </p>
        </div>

        {/* Development Session Banner */}
        {developmentSession && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Active Development Session</h3>
                <p className="text-sm text-blue-700">Focus: {developmentSession.focus}</p>
                <p className="text-xs text-blue-600">
                  Started: {developmentSession.startTime.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={endDevelopmentSession}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                End Session
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'personality', label: 'Personality', icon: Brain },
              { id: 'relationships', label: 'Relationships', icon: Users },
              { id: 'evolution', label: 'Evolution', icon: TrendingUp },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'personality' && renderPersonality()}
            {activeTab === 'relationships' && renderRelationships()}
            {activeTab === 'evolution' && renderEvolution()}
            {activeTab === 'analytics' && renderAnalytics()}
          </div>
        </div>
      </div>
    </div>
  );
} 