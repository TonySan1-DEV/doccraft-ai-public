// MCP Context Block
/*
{
  file: "ModeController.tsx",
  role: "frontend-developer",
  allowedActions: ["ui", "mode", "preferences"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "mode_control"
}
*/

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAgentPreferences } from '../contexts/AgentPreferencesContext';
import { useMCP } from '../useMCP';
import {
  SystemMode,
  validateModeConfiguration,
  isSystemMode,
  ModeConfiguration,
  DEFAULT_MODE_CONFIGS,
  WritingContext,
} from '../types/systemModes';
import { ModeErrorBoundary } from './ModeErrorBoundary';
import {
  User,
  Users,
  Bot,
  Lightbulb,
  Check,
  ArrowRight,
  Settings,
  Zap,
  Shield,
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Info,
  BarChart3,
  Star,
  Crown,
  Rocket,
  Palette,
  BookOpen,
  PenTool,
  Layers,
  Activity,
  BarChart,
  PieChart,
  LineChart,
  Target as TargetIcon,
  Zap as ZapIcon,
  Shield as ShieldIcon,
  Brain as BrainIcon,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Types for component props
interface ModeCardProps {
  mode: SystemMode;
  isActive: boolean;
  isRecommended: boolean;
  confidence?: number;
  onClick: () => void;
  onPreview: () => void;
  loading?: boolean;
}

interface ModeRecommendation {
  mode: SystemMode;
  confidence: number;
  reason: string;
  benefits: string[];
  tip: string;
}

interface ModeControllerProps {
  onModeChange?: (mode: SystemMode, config: ModeConfiguration) => void;
  showAdvancedSettings?: boolean;
  className?: string;
}

interface TransitionPreview {
  fromMode: SystemMode;
  toMode: SystemMode;
  changes: Array<{
    feature: string;
    from: string;
    to: string;
    impact: 'positive' | 'neutral' | 'negative';
  }>;
}

// Mode configuration with visual design
const modeConfig = {
  MANUAL: {
    icon: User,
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    activeColor: 'bg-green-500',
    hoverColor: 'hover:bg-green-100',
    description: 'Complete creative control. AI assists only when you ask.',
    features: [
      'Full user control',
      'No interruptions',
      'Pure artistic expression',
    ],
    bestFor: 'Experienced writers, final drafts, sensitive content',
  },
  HYBRID: {
    icon: Users,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    activeColor: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-100',
    description: 'Perfect balance. AI suggests, you decide.',
    features: ['Smart collaboration', 'Contextual help', 'Flexible assistance'],
    bestFor: 'All skill levels, collaborative writing, learning',
  },
  FULLY_AUTO: {
    icon: Bot,
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    activeColor: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-100',
    description: 'Maximum assistance. AI proactively enhances your writing.',
    features: [
      'Proactive optimization',
      'Continuous analysis',
      'Maximum productivity',
    ],
    bestFor: 'Productivity focus, complex projects, rapid iteration',
  },
};

// Animated Mode Preview Component
const AnimatedModePreview: React.FC<{
  mode: SystemMode;
  isActive: boolean;
}> = ({ mode, isActive }) => {
  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setAnimationFrame(frame => (frame + 1) % 3);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const previewConfig = {
    MANUAL: {
      frames: [
        { text: 'You type...', activity: 'user', icon: PenTool },
        { text: 'AI waits silently', activity: 'none', icon: Pause },
        { text: 'You ask for help', activity: 'request', icon: Target },
      ],
    },
    HYBRID: {
      frames: [
        { text: 'You type...', activity: 'user', icon: PenTool },
        { text: 'AI suggests options', activity: 'suggest', icon: Lightbulb },
        { text: 'You choose direction', activity: 'decide', icon: Check },
      ],
    },
    FULLY_AUTO: {
      frames: [
        { text: 'You type...', activity: 'user', icon: PenTool },
        { text: 'AI enhances actively', activity: 'enhance', icon: Zap },
        { text: 'Continuous optimization', activity: 'optimize', icon: Rocket },
      ],
    },
  };

  const currentFrame = previewConfig[mode].frames[animationFrame];
  const IconComponent = currentFrame.icon;

  return (
    <div className="relative h-24 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <IconComponent
            className={`w-6 h-6 ${
              currentFrame.activity === 'user'
                ? 'text-blue-600'
                : currentFrame.activity === 'none'
                  ? 'text-gray-400'
                  : currentFrame.activity === 'suggest'
                    ? 'text-green-600'
                    : currentFrame.activity === 'decide'
                      ? 'text-purple-600'
                      : currentFrame.activity === 'enhance'
                        ? 'text-orange-600'
                        : 'text-blue-600'
            }`}
          />
        </div>
        <p className="text-sm font-medium text-gray-700">{currentFrame.text}</p>
        <div className="flex justify-center mt-2 space-x-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === animationFrame ? 'bg-blue-500 scale-125' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Smart Recommendation System Component
const SmartRecommendations: React.FC<{ currentMode: SystemMode }> = ({
  currentMode,
}) => {
  const [recommendation, setRecommendation] =
    useState<ModeRecommendation | null>(null);

  useEffect(() => {
    analyzeUserPatterns().then(setRecommendation);
  }, []);

  const analyzeUserPatterns = async (): Promise<ModeRecommendation> => {
    // Simulate user pattern analysis
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock recommendation logic - in real app, this would analyze actual user data
    const mockUserMetrics = {
      writingFrequency: 0.8,
      preferredControl: 0.6,
      projectComplexity: 0.7,
      collaborationLevel: 0.7,
      aiAcceptanceRate: 0.6,
    };

    if (
      mockUserMetrics.preferredControl > 0.8 &&
      mockUserMetrics.aiAcceptanceRate < 0.3
    ) {
      return {
        mode: 'MANUAL',
        confidence: 0.92,
        reason:
          'You prefer full creative control and rarely accept AI suggestions',
        benefits: [
          'Complete creative freedom',
          'No interruptions',
          'Pure artistic expression',
        ],
        tip: 'Perfect for experienced writers who know exactly what they want',
      };
    }

    if (
      mockUserMetrics.collaborationLevel > 0.6 &&
      mockUserMetrics.aiAcceptanceRate > 0.5
    ) {
      return {
        mode: 'HYBRID',
        confidence: 0.88,
        reason:
          'You enjoy collaboration and often accept helpful AI suggestions',
        benefits: [
          'Best of both worlds',
          'Flexible assistance',
          'Learning opportunities',
        ],
        tip: 'Ideal for writers who want smart help without losing control',
      };
    }

    if (
      mockUserMetrics.projectComplexity > 0.7 &&
      mockUserMetrics.writingFrequency > 0.8
    ) {
      return {
        mode: 'FULLY_AUTO',
        confidence: 0.85,
        reason:
          'Your complex projects and high writing volume benefit from maximum AI assistance',
        benefits: [
          'Faster completion',
          'Comprehensive analysis',
          'Automatic optimization',
        ],
        tip: 'Perfect for productive writers tackling ambitious projects',
      };
    }

    return {
      mode: 'HYBRID',
      confidence: 0.75,
      reason: 'Balanced approach works well for most writing scenarios',
      benefits: [
        'Flexible collaboration',
        'Smart suggestions',
        'Easy to adjust',
      ],
      tip: 'Great starting point - you can always change later',
    };
  };

  if (!recommendation) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              Smart Recommendations
            </h3>
            <p className="text-blue-700">Analyzing your writing patterns...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-blue-200 rounded w-3/4"></div>
          <div className="h-4 bg-blue-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const isCurrentMode = recommendation.mode === currentMode;
  const config = modeConfig[recommendation.mode];

  return (
    <div
      className={`bg-gradient-to-r from-${config.color}-50 to-${config.color}-100 rounded-xl p-6 border border-${config.borderColor} relative overflow-hidden`}
    >
      {isCurrentMode && (
        <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
          <Check className="w-4 h-4 inline mr-1" />
          Current Mode
        </div>
      )}

      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg bg-${config.color}-200`}>
          <config.icon className={`w-8 h-8 text-${config.color}-700`} />
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {recommendation.mode.replace('_', ' ')} Mode
            </h3>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-gray-700">
                {Math.round(recommendation.confidence * 100)}% match
              </span>
            </div>
          </div>

          <p className="text-gray-700 mb-3">{recommendation.reason}</p>

          <div className="space-y-2 mb-4">
            {recommendation.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="bg-white bg-opacity-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Pro Tip</span>
            </div>
            <p className="text-sm text-gray-700">{recommendation.tip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mode Comparison Table Component
const ModeComparisonTable: React.FC = () => {
  const features = [
    {
      category: 'AI Assistance',
      manual: { level: 'On Request Only', icon: '🔕', color: 'text-green-600' },
      hybrid: {
        level: 'Contextual Suggestions',
        icon: '💡',
        color: 'text-blue-600',
      },
      auto: {
        level: 'Proactive & Continuous',
        icon: '🚀',
        color: 'text-purple-600',
      },
    },
    {
      category: 'User Control',
      manual: { level: '100%', icon: '👑', color: 'text-green-600' },
      hybrid: { level: '75%', icon: '🤝', color: 'text-blue-600' },
      auto: { level: '60%', icon: '🤖', color: 'text-purple-600' },
    },
    {
      category: 'Learning Speed',
      manual: { level: 'Self-Paced', icon: '🐌', color: 'text-green-600' },
      hybrid: { level: 'Guided', icon: '📈', color: 'text-blue-600' },
      auto: { level: 'Accelerated', icon: '⚡', color: 'text-purple-600' },
    },
    {
      category: 'Best For',
      manual: {
        level: 'Experienced Writers',
        icon: '🎯',
        color: 'text-green-600',
      },
      hybrid: { level: 'All Skill Levels', icon: '🌟', color: 'text-blue-600' },
      auto: {
        level: 'Productivity Focus',
        icon: '💪',
        color: 'text-purple-600',
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Mode Comparison</h3>
        <p className="text-sm text-gray-600">
          Compare features across all writing modes
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feature
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-green-600 uppercase tracking-wider">
                Manual
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-blue-600 uppercase tracking-wider">
                Hybrid
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-purple-600 uppercase tracking-wider">
                Fully Auto
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {features.map((feature, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {feature.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-lg">{feature.manual.icon}</span>
                    <span
                      className={`text-sm font-medium ${feature.manual.color}`}
                    >
                      {feature.manual.level}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-lg">{feature.hybrid.icon}</span>
                    <span
                      className={`text-sm font-medium ${feature.hybrid.color}`}
                    >
                      {feature.hybrid.level}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-lg">{feature.auto.icon}</span>
                    <span
                      className={`text-sm font-medium ${feature.auto.color}`}
                    >
                      {feature.auto.level}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Individual Mode Card Component
const ModeCard: React.FC<ModeCardProps> = ({
  mode,
  isActive,
  isRecommended,
  confidence,
  onClick,
  onPreview,
  loading,
}) => {
  const config = modeConfig[mode];
  const IconComponent = config.icon;

  return (
    <div
      className={`
        relative group cursor-pointer transition-all duration-300 transform hover:scale-105
        ${
          isActive
            ? `ring-2 ring-${config.color}-500 bg-${config.color}-100 border-${config.color}-300`
            : `bg-white border-gray-200 hover:border-${config.color}-300 hover:bg-${config.color}-50`
        }
        border-2 rounded-xl p-6 shadow-sm hover:shadow-lg
      `}
      onClick={onClick}
    >
      {/* Recommendation Badge */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-medium shadow-lg">
          <Star className="w-4 h-4 inline mr-1" />
          Recommended
        </div>
      )}

      {/* Active State Indicator */}
      {isActive && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* Confidence Score */}
      {confidence && (
        <div className="absolute top-4 right-4">
          <div className="bg-white rounded-full p-2 shadow-sm">
            <div className="w-8 h-8 rounded-full border-4 border-gray-200 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700">
                {Math.round(confidence * 100)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mode Icon */}
      <div
        className={`w-16 h-16 rounded-xl bg-${config.color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        <IconComponent className={`w-8 h-8 text-${config.color}-600`} />
      </div>

      {/* Mode Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
        {mode.replace('_', ' ')} Mode
      </h3>

      {/* Mode Description */}
      <p className="text-gray-600 mb-4 leading-relaxed">{config.description}</p>

      {/* Key Features */}
      <div className="space-y-2 mb-6">
        {config.features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full bg-${config.color}-400`}
            ></div>
            <span className="text-sm text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      {/* Best For */}
      <div className="bg-gray-50 rounded-lg p-3 mb-6">
        <div className="flex items-center space-x-2 mb-1">
          <Target className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600">Best For</span>
        </div>
        <p className="text-sm text-gray-700">{config.bestFor}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={e => {
            e.stopPropagation();
            onPreview();
          }}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-${config.color}-300 text-${config.color}-700 bg-white hover:bg-${config.color}-50 transition-colors duration-200`}
        >
          <Play className="w-4 h-4 inline mr-2" />
          Preview
        </button>

        <button
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-${config.color}-600 text-white hover:bg-${config.color}-700 transition-colors duration-200 flex items-center justify-center`}
          disabled={loading}
        >
          {loading ? (
            <RotateCcw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {isActive ? (
                <>
                  <Check className="w-4 h-4 inline mr-2" />
                  Active
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 inline mr-2" />
                  Activate
                </>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Main Mode Controller Component
const ModeController: React.FC<ModeControllerProps> = ({
  onModeChange,
  showAdvancedSettings = false,
  className = '',
}) => {
  const { preferences, updatePreferences } = useAgentPreferences();
  const mcpContext = useMCP('ModeController.tsx');

  const [currentMode, setCurrentMode] = useState<SystemMode>('HYBRID');
  const [selectedMode, setSelectedMode] = useState<SystemMode>('HYBRID');
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<SystemMode>('HYBRID');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionPreview, setTransitionPreview] =
    useState<TransitionPreview | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [writingContext, setWritingContext] = useState<WritingContext>({
    documentType: 'general',
    userGoals: ['writing', 'improvement'],
    writingPhase: 'drafting',
    userExperience: 'intermediate',
    currentMode: 'HYBRID',
    sessionDuration: 0,
    interactionPatterns: {
      frequentEdits: false,
      longWritingSessions: false,
      collaborativeWork: false,
      researchIntensive: false,
    },
  });

  // Initialize from preferences
  useEffect(() => {
    if (preferences.systemMode && isSystemMode(preferences.systemMode)) {
      setCurrentMode(preferences.systemMode);
      setSelectedMode(preferences.systemMode);
      setWritingContext(prev => ({
        ...prev,
        currentMode: preferences.systemMode || 'HYBRID',
      }));
    }
  }, [preferences.systemMode]);

  // Handle mode switching with transition preview
  const handleModeSwitch = useCallback(
    async (newMode: SystemMode) => {
      if (newMode === currentMode || isLoading) return;

      setIsTransitioning(true);

      try {
        // Show transition preview
        setTransitionPreview({
          fromMode: currentMode,
          toMode: newMode,
          changes: calculateModeChanges(currentMode, newMode),
        });

        // Validate mode configuration
        const config = DEFAULT_MODE_CONFIGS[newMode];
        const validation = validateModeConfiguration(config);

        if (!validation.valid) {
          throw new Error(
            `Invalid mode configuration: ${validation.errors.join(', ')}`
          );
        }

        // Check MCP permissions
        if (mcpContext.role === 'viewer') {
          throw new Error('Insufficient permissions to change modes');
        }

        // Perform transition with loading state
        const success = await updatePreferences(
          {
            systemMode: newMode,
            modeConfiguration: config,
            lastModeChange: new Date(),
          },
          {
            label: `Switched to ${newMode} mode`,
            reason: `Mode transition from ${currentMode} to ${newMode}`,
          }
        );

        if (success) {
          setCurrentMode(newMode);
          setWritingContext(prev => ({ ...prev, currentMode: newMode }));
          toast.success(
            `Successfully switched to ${newMode.replace('_', ' ')} mode`
          );
          setShowSuccessAnimation(true);

          // Notify parent component
          if (onModeChange) {
            onModeChange(newMode, config);
          }
        }
      } catch (error) {
        console.error('Mode switch failed:', error);
        toast.error(
          `Failed to switch modes: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      } finally {
        setIsTransitioning(false);
        setTransitionPreview(null);
      }
    },
    [currentMode, isLoading, updatePreferences, mcpContext.role, onModeChange]
  );

  // Calculate mode changes for transition preview
  const calculateModeChanges = (fromMode: SystemMode, toMode: SystemMode) => {
    const fromConfig = DEFAULT_MODE_CONFIGS[fromMode];
    const toConfig = DEFAULT_MODE_CONFIGS[toMode];

    return [
      {
        feature: 'AI Initiative',
        from: fromConfig.aiInitiativeLevel,
        to: toConfig.aiInitiativeLevel,
        impact: (toConfig.aiInitiativeLevel === 'PROACTIVE'
          ? 'positive'
          : toConfig.aiInitiativeLevel === 'MINIMAL'
            ? 'negative'
            : 'neutral') as 'positive' | 'neutral' | 'negative',
      },
      {
        feature: 'User Control',
        from: `${fromConfig.userControlLevel}%`,
        to: `${toConfig.userControlLevel}%`,
        impact: (toConfig.userControlLevel > fromConfig.userControlLevel
          ? 'positive'
          : toConfig.userControlLevel < fromConfig.userControlLevel
            ? 'negative'
            : 'neutral') as 'positive' | 'neutral' | 'negative',
      },
      {
        feature: 'Auto Enhancement',
        from: fromConfig.autoEnhancement ? 'Enabled' : 'Disabled',
        to: toConfig.autoEnhancement ? 'Enabled' : 'Disabled',
        impact: (toConfig.autoEnhancement ? 'positive' : 'neutral') as
          | 'positive'
          | 'neutral'
          | 'negative',
      },
    ];
  };

  // Handle mode preview
  const handleModePreview = useCallback((mode: SystemMode) => {
    setPreviewMode(mode);
    setShowPreview(true);
  }, []);

  // Close preview
  const handleClosePreview = useCallback(() => {
    setShowPreview(false);
  }, []);

  // Get recommendation for current context
  const getRecommendation = useMemo(() => {
    // Simple recommendation logic - in real app, this would be more sophisticated
    if (writingContext.writingPhase === 'polishing') return 'MANUAL';
    if (writingContext.userExperience === 'beginner') return 'HYBRID';
    if (writingContext.interactionPatterns.researchIntensive)
      return 'FULLY_AUTO';
    return 'HYBRID';
  }, [writingContext]);

  // Accessibility props
  const accessibilityProps = {
    role: 'radiogroup',
    'aria-label': 'Writing mode selection',
    'aria-describedby': 'mode-description',
  };

  return (
    <ModeErrorBoundary
      fallbackMode="HYBRID"
      onError={(error, errorInfo) => {
        console.error('ModeController error:', error, errorInfo);
        toast.error('Mode system encountered an error. Please try again.');
      }}
      onRecovery={recoveredMode => {
        console.log('ModeController recovered to mode:', recoveredMode);
        setCurrentMode(recoveredMode);
        toast.success(`System recovered to ${recoveredMode} mode`);
      }}
    >
      <div className={`mode-controller-container ${className}`}>
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Writing Mode Controller
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your perfect writing experience. Each mode offers a unique
            balance of AI assistance and creative control.
          </p>
        </div>

        {/* Smart Recommendations */}
        <div className="mb-8">
          <SmartRecommendations currentMode={currentMode} />
        </div>

        {/* Mode Selection Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          {...accessibilityProps}
        >
          {(['MANUAL', 'HYBRID', 'FULLY_AUTO'] as SystemMode[]).map(mode => (
            <ModeCard
              key={mode}
              mode={mode}
              isActive={currentMode === mode}
              isRecommended={getRecommendation === mode}
              confidence={0.85}
              onClick={() => handleModeSwitch(mode)}
              onPreview={() => handleModePreview(mode)}
              loading={isTransitioning && selectedMode === mode}
            />
          ))}
        </div>

        {/* Mode Comparison Table */}
        <div className="mb-8">
          <ModeComparisonTable />
        </div>

        {/* Transition Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {previewMode.replace('_', ' ')} Mode Preview
                  </h2>
                  <button
                    onClick={handleClosePreview}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <AnimatedModePreview mode={previewMode} isActive={true} />

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    How it works:
                  </h3>
                  <div className="space-y-3">
                    {modeConfig[previewMode].features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => {
                      handleClosePreview();
                      handleModeSwitch(previewMode);
                    }}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Activate {previewMode.replace('_', ' ')} Mode
                  </button>
                  <button
                    onClick={handleClosePreview}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Animation */}
        {showSuccessAnimation && (
          <div className="fixed inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white rounded-full p-8 shadow-2xl animate-ping">
              <Check className="w-16 h-16 text-green-600" />
            </div>
          </div>
        )}

        {/* Transition Preview Overlay */}
        {transitionPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Mode Transition Preview
              </h3>
              <div className="space-y-4">
                {transitionPreview.changes.map((change, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-700">
                      {change.feature}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">{change.from}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span
                        className={`font-medium ${
                          change.impact === 'positive'
                            ? 'text-green-600'
                            : change.impact === 'negative'
                              ? 'text-red-600'
                              : 'text-gray-600'
                        }`}
                      >
                        {change.to}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setTransitionPreview(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModeErrorBoundary>
  );
};

export default ModeController;
