// Advanced AI Character Development Component
// MCP: { role: "admin", allowedActions: ["analyze", "process", "enhance"], theme: "character_ai", contentSensitivity: "medium", tier: "Pro" }

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Users, 
  Heart, 
  Zap,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Target as TargetIcon,
  Heart as HeartIcon,
  Brain as BrainIcon,
  Users as UsersIcon,
  Zap as ZapIcon,
  Star as StarIcon,
  AlertTriangle,
  ArrowRight,
  Play,
  Pause,
  SkipForward,
  Settings,
  Download,
  Share,
  BookOpen,
  MessageCircle,
  Sparkles,
  Crown,
  Shield,
  Sword,
  Book,
  Award,
  Calendar,
  MapPin,
  User,
  Users2,
  Activity as ActivityIcon,
  BarChart3 as BarChart3Icon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CharacterPersona } from '../types/CharacterPersona';
import { characterAIIntelligence, AICharacterAnalysis, AICharacterInsight, AICharacterPrompt, AICharacterScenario, AICharacterMemory, AICharacterPrediction } from '../services/characterAIIntelligence';

interface AICharacterDevelopmentProps {
  character: CharacterPersona;
  onCharacterUpdate: (character: CharacterPersona) => void;
  className?: string;
}

export default function AICharacterDevelopment({
  character,
  onCharacterUpdate,
  className = ''
}: AICharacterDevelopmentProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'insights' | 'prompts' | 'scenarios' | 'memories' | 'predictions' | 'development'>('overview');
  const [analysis, setAnalysis] = useState<AICharacterAnalysis | null>(null);
  const [insights, setInsights] = useState<AICharacterInsight[]>([]);
  const [prompts, setPrompts] = useState<AICharacterPrompt[]>([]);
  const [scenarios, setScenarios] = useState<AICharacterScenario[]>([]);
  const [memories, setMemories] = useState<AICharacterMemory[]>([]);
  const [predictions, setPredictions] = useState<AICharacterPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<AICharacterPrompt | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<AICharacterScenario | null>(null);

  // Load AI data on mount
  useEffect(() => {
    loadAIData();
  }, [character.id]);

  const loadAIData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load AI analysis
      const characterAnalysis = await characterAIIntelligence.analyzeCharacter(character);
      setAnalysis(characterAnalysis);

      // Load AI insights
      const characterInsights = characterAIIntelligence.getCharacterInsights(character.id);
      setInsights(characterInsights);

      // Load AI prompts
      const allPrompts = characterAIIntelligence.getAllPrompts();
      setPrompts(allPrompts);

      // Load AI scenarios
      const allScenarios = characterAIIntelligence.getAllScenarios();
      setScenarios(allScenarios);

      // Load character memories
      const characterMemories = characterAIIntelligence.getCharacterMemories(character.id);
      setMemories(characterMemories);

      // Load character predictions
      const characterPredictions = characterAIIntelligence.getCharacterPredictions(character.id);
      setPredictions(characterPredictions);

    } catch (error) {
      console.error('Failed to load AI data:', error);
      toast.error('Failed to load AI character development data');
    } finally {
      setIsLoading(false);
    }
  }, [character.id]);

  const handleCreatePrompt = useCallback(async (category: string) => {
    try {
      const newPrompt = await characterAIIntelligence.createDevelopmentPrompt(character, category);
      setPrompts(prev => [...prev, newPrompt]);
      setSelectedPrompt(newPrompt);
      toast.success('AI prompt created successfully');
    } catch (error) {
      console.error('Failed to create prompt:', error);
      toast.error('Failed to create AI prompt');
    }
  }, [character]);

  const handleCreateScenario = useCallback(async () => {
    try {
      const newScenario = await characterAIIntelligence.createDevelopmentScenario(character);
      setScenarios(prev => [...prev, newScenario]);
      setSelectedScenario(newScenario);
      toast.success('AI scenario created successfully');
    } catch (error) {
      console.error('Failed to create scenario:', error);
      toast.error('Failed to create AI scenario');
    }
  }, [character]);

  const handleRecordMemory = useCallback(async (type: string, content: string) => {
    try {
      const memory = await characterAIIntelligence.recordCharacterMemory(
        character.id,
        type,
        content,
        0.7, // emotionalImpact
        0.8, // significance
        'User interaction'
      );
      setMemories(prev => [...prev, memory]);
      toast.success('Character memory recorded');
    } catch (error) {
      console.error('Failed to record memory:', error);
      toast.error('Failed to record character memory');
    }
  }, [character.id]);

  const handleGeneratePrediction = useCallback(async () => {
    try {
      const prediction = await characterAIIntelligence.generateCharacterPrediction(character);
      setPredictions(prev => [...prev, prediction]);
      toast.success('AI prediction generated');
    } catch (error) {
      console.error('Failed to generate prediction:', error);
      toast.error('Failed to generate AI prediction');
    }
  }, [character]);

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 0.6) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const tabs = [
    { id: 'overview', label: 'AI Overview', icon: Brain },
    { id: 'analysis', label: 'AI Analysis', icon: BarChart3 },
    { id: 'insights', label: 'AI Insights', icon: Lightbulb },
    { id: 'prompts', label: 'AI Prompts', icon: Target },
    { id: 'scenarios', label: 'AI Scenarios', icon: Users },
    { id: 'memories', label: 'AI Memories', icon: Heart },
    { id: 'predictions', label: 'AI Predictions', icon: TrendingUp },
    { id: 'development', label: 'AI Development', icon: Activity }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <span>AI Character Development</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Advanced AI-powered character development and analysis
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleGeneratePrediction}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center space-x-2"
            >
              <Brain className="w-4 h-4" />
              <span>Generate AI Prediction</span>
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
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
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
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading AI data...</span>
          </div>
        )}

        {!isLoading && (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-gray-900 dark:text-white">AI Score</span>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(analysis?.overallScore || 0)}`}>
                      {((analysis?.overallScore || 0) * 100).toFixed(0)}%
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Overall AI Assessment</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TargetIcon className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900 dark:text-white">Depth</span>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(analysis?.depthScore || 0)}`}>
                      {((analysis?.depthScore || 0) * 100).toFixed(0)}%
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Character Depth</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-900 dark:text-white">Growth</span>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(analysis?.growthPotential || 0)}`}>
                      {((analysis?.growthPotential || 0) * 100).toFixed(0)}%
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Growth Potential</p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-gray-900 dark:text-white">Insights</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {insights.length}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">AI Insights</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>AI Strengths</span>
                    </h3>
                    <div className="space-y-2">
                      {analysis?.strengths.map((strength, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-900 dark:text-white">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span>AI Opportunities</span>
                    </h3>
                    <div className="space-y-2">
                      {analysis?.opportunities.map((opportunity, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <ArrowRight className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-900 dark:text-white">{opportunity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analysis' && analysis && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Analysis Scores</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Overall Score</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getScoreBgColor(analysis.overallScore)}`}
                              style={{ width: `${analysis.overallScore * 100}%` }}
                            ></div>
                          </div>
                          <span className={`font-semibold ${getScoreColor(analysis.overallScore)}`}>
                            {(analysis.overallScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Depth Score</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getScoreBgColor(analysis.depthScore)}`}
                              style={{ width: `${analysis.depthScore * 100}%` }}
                            ></div>
                          </div>
                          <span className={`font-semibold ${getScoreColor(analysis.depthScore)}`}>
                            {(analysis.depthScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Consistency Score</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getScoreBgColor(analysis.consistencyScore)}`}
                              style={{ width: `${analysis.consistencyScore * 100}%` }}
                            ></div>
                          </div>
                          <span className={`font-semibold ${getScoreColor(analysis.consistencyScore)}`}>
                            {(analysis.consistencyScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Complexity Score</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getScoreBgColor(analysis.complexityScore)}`}
                              style={{ width: `${analysis.complexityScore * 100}%` }}
                            ></div>
                          </div>
                          <span className={`font-semibold ${getScoreColor(analysis.complexityScore)}`}>
                            {(analysis.complexityScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Growth Potential</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getScoreBgColor(analysis.growthPotential)}`}
                              style={{ width: `${analysis.growthPotential * 100}%` }}
                            ></div>
                          </div>
                          <span className={`font-semibold ${getScoreColor(analysis.growthPotential)}`}>
                            {(analysis.growthPotential * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Recommendations</h3>
                    <div className="space-y-2">
                      {analysis.recommendations.map((recommendation, index) => (
                        <div key={index} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <Lightbulb className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-900 dark:text-white">{recommendation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Development Path</h3>
                  <div className="space-y-2">
                    {analysis.developmentPath.map((step, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="text-gray-900 dark:text-white">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{insights.length} insights</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.map(insight => (
                    <div key={insight.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            insight.impact === 'positive' ? 'bg-green-500' :
                            insight.impact === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{insight.title}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          insight.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {insight.priority}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{insight.description}</p>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Confidence:</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                              <div 
                                className="h-1 bg-purple-600 rounded-full"
                                style={{ width: `${insight.confidence * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {(insight.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Recommendations:</span>
                        <div className="mt-1 space-y-1">
                          {insight.recommendations.slice(0, 2).map((rec, index) => (
                            <div key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                              <ArrowRight className="w-3 h-3" />
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'prompts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Development Prompts</h3>
                  <div className="flex space-x-2">
                    {['personality', 'relationships', 'conflicts', 'growth'].map(category => (
                      <button
                        key={category}
                        onClick={() => handleCreatePrompt(category)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded"
                      >
                        Create {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prompts.map(prompt => (
                    <div key={prompt.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{prompt.title}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          prompt.difficulty === 'advanced' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          prompt.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {prompt.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{prompt.description}</p>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Prompt:</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{prompt.prompt}</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Duration: {prompt.estimatedDuration}min</span>
                          <span>Expected: {prompt.expectedOutcome}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'scenarios' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Development Scenarios</h3>
                  <button
                    onClick={handleCreateScenario}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
                  >
                    Create Scenario
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scenarios.map(scenario => (
                    <div key={scenario.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{scenario.title}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          scenario.difficulty === 'hard' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          scenario.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {scenario.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{scenario.description}</p>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Scenario:</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{scenario.scenario}</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Duration: {scenario.duration}min</span>
                          <span>Characters: {scenario.characters.length}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'memories' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Character Memories</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{memories.length} memories</span>
                </div>

                <div className="space-y-4">
                  {memories.map(memory => (
                    <div key={memory.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            memory.type === 'achievement' ? 'bg-green-500' :
                            memory.type === 'conflict' ? 'bg-red-500' :
                            memory.type === 'relationship' ? 'bg-blue-500' :
                            memory.type === 'development' ? 'bg-purple-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{memory.type}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {memory.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{memory.content}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Emotional Impact: {(memory.emotionalImpact * 100).toFixed(0)}%</span>
                        <span>Significance: {(memory.significance * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'predictions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Character Predictions</h3>
                  <button
                    onClick={handleGeneratePrediction}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
                  >
                    Generate Prediction
                  </button>
                </div>

                <div className="space-y-4">
                  {predictions.map(prediction => (
                    <div key={prediction.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            prediction.impact === 'positive' ? 'bg-green-500' :
                            prediction.impact === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{prediction.timeframe} term</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {(prediction.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{prediction.prediction}</p>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Factors:</span>
                          <div className="mt-1 space-y-1">
                            {prediction.factors.map((factor, index) => (
                              <div key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                                <ArrowRight className="w-3 h-3" />
                                <span>{factor}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Probability: {(prediction.probability * 100).toFixed(0)}%</span>
                          <span>Impact: {prediction.impact}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'development' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Development Tools</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleCreatePrompt('personality')}
                        className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded flex items-center space-x-2"
                      >
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span>Create Personality Prompt</span>
                      </button>
                      <button
                        onClick={() => handleCreatePrompt('relationships')}
                        className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded flex items-center space-x-2"
                      >
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>Create Relationship Prompt</span>
                      </button>
                      <button
                        onClick={handleCreateScenario}
                        className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded flex items-center space-x-2"
                      >
                        <Target className="w-4 h-4 text-green-600" />
                        <span>Create Development Scenario</span>
                      </button>
                      <button
                        onClick={handleGeneratePrediction}
                        className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded flex items-center space-x-2"
                      >
                        <TrendingUp className="w-4 h-4 text-yellow-600" />
                        <span>Generate AI Prediction</span>
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">AI Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Insights:</span>
                        <span className="font-medium">{insights.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Prompts:</span>
                        <span className="font-medium">{prompts.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Scenarios:</span>
                        <span className="font-medium">{scenarios.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Memories:</span>
                        <span className="font-medium">{memories.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Predictions:</span>
                        <span className="font-medium">{predictions.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 