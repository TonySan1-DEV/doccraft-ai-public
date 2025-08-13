// MCP Context Block
/*
{
  file: "ModeControllerDemo.tsx",
  role: "frontend-developer",
  allowedActions: ["ui", "demo", "showcase"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "demo_showcase"
}
*/

import React, { useState } from 'react';
import ModeController from '../components/ModeController';
import { SystemMode, ModeConfiguration } from '../types/systemModes';
import {
  BookOpen,
  PenTool,
  Users,
  Zap,
  Target,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  Play,
  Pause,
  Settings,
} from 'lucide-react';

interface DemoScenario {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  recommendedMode: SystemMode;
  context: string;
  benefits: string[];
}

const demoScenarios: DemoScenario[] = [
  {
    id: 'novel-writing',
    title: 'Novel Writing',
    description:
      'Long-form creative writing with complex character development',
    icon: BookOpen,
    recommendedMode: 'HYBRID',
    context:
      "You're working on a 100,000-word novel with multiple character arcs and plot threads.",
    benefits: [
      'Balanced AI assistance without overwhelming creativity',
      'Contextual suggestions for plot consistency',
      'Character development insights when needed',
    ],
  },
  {
    id: 'academic-paper',
    title: 'Academic Research Paper',
    description: 'Research-intensive academic writing with citations',
    icon: PenTool,
    recommendedMode: 'FULLY_AUTO',
    context:
      'Writing a research paper requiring extensive analysis, citations, and academic formatting.',
    benefits: [
      'Proactive research assistance',
      'Automatic citation management',
      'Continuous quality improvement',
    ],
  },
  {
    id: 'collaborative-blog',
    title: 'Collaborative Blog Post',
    description: 'Team writing with multiple contributors',
    icon: Users,
    recommendedMode: 'HYBRID',
    context:
      'Working with a team to create engaging blog content with multiple perspectives.',
    benefits: [
      'Team coordination features',
      'Shared insights and suggestions',
      'Consensus building tools',
    ],
  },
  {
    id: 'quick-email',
    title: 'Quick Email Response',
    description: 'Fast, professional communication',
    icon: Zap,
    recommendedMode: 'MANUAL',
    context:
      'Responding to an important email that requires your personal touch and tone.',
    benefits: [
      'Full control over message tone',
      'No AI interruptions',
      'Personal authenticity maintained',
    ],
  },
  {
    id: 'content-strategy',
    title: 'Content Strategy Planning',
    description: 'Strategic planning and content calendar creation',
    icon: Target,
    recommendedMode: 'FULLY_AUTO',
    context: 'Planning a comprehensive content strategy for the next quarter.',
    benefits: [
      'Market trend analysis',
      'Content gap identification',
      'Automated scheduling suggestions',
    ],
  },
  {
    id: 'creative-poetry',
    title: 'Creative Poetry',
    description: 'Personal artistic expression and poetry',
    icon: Lightbulb,
    recommendedMode: 'MANUAL',
    context:
      'Writing personal poetry that expresses your deepest emotions and artistic vision.',
    benefits: [
      'Pure creative freedom',
      'No AI interference with artistic vision',
      'Authentic personal expression',
    ],
  },
];

const ModeControllerDemo: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(
    null
  );
  const [currentMode, setCurrentMode] = useState<SystemMode>('HYBRID');
  const [showModeController, setShowModeController] = useState(true);

  const handleModeChange = (mode: SystemMode, config: ModeConfiguration) => {
    setCurrentMode(mode);
    console.log(`Mode changed to: ${mode}`, config);
  };

  const handleScenarioSelect = (scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    setShowModeController(false);

    // Auto-show mode controller after a brief delay
    setTimeout(() => {
      setShowModeController(true);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mode Controller Demo
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the power of DocCraft-AI's intelligent writing modes.
              See how different scenarios benefit from tailored AI assistance.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Current Mode Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Current Writing Mode
                </h2>
                <p className="text-gray-600">
                  {currentMode === 'MANUAL' &&
                    'Manual Mode - Full creative control'}
                  {currentMode === 'HYBRID' &&
                    'Hybrid Mode - Balanced collaboration'}
                  {currentMode === 'FULLY_AUTO' &&
                    'Fully Auto Mode - Maximum AI assistance'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  currentMode === 'MANUAL'
                    ? 'bg-green-500'
                    : currentMode === 'HYBRID'
                      ? 'bg-blue-500'
                      : 'bg-purple-500'
                }`}
              ></div>
              <span className="text-sm font-medium text-gray-700">
                {currentMode.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Demo Scenarios */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Choose a Writing Scenario
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoScenarios.map(scenario => (
              <div
                key={scenario.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleScenarioSelect(scenario)}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <scenario.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {scenario.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {scenario.description}
                    </p>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-xs font-medium text-gray-500">
                        Recommended:
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          scenario.recommendedMode === 'MANUAL'
                            ? 'bg-green-100 text-green-800'
                            : scenario.recommendedMode === 'HYBRID'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {scenario.recommendedMode.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors">
                      <span>Try this scenario</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Scenario Details */}
        {selectedScenario && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-start space-x-4 mb-6">
              <div className="p-4 bg-blue-100 rounded-lg">
                <selectedScenario.icon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedScenario.title}
                </h3>
                <p className="text-gray-600 text-lg mb-4">
                  {selectedScenario.context}
                </p>
                <div className="space-y-2">
                  {selectedScenario.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Why {selectedScenario.recommendedMode.replace('_', ' ')} Mode?
                </span>
              </div>
              <p className="text-blue-800">
                This scenario benefits from{' '}
                {selectedScenario.recommendedMode.toLowerCase()} mode because it
                provides the perfect balance of AI assistance and user control
                for {selectedScenario.title.toLowerCase()}.
              </p>
            </div>
          </div>
        )}

        {/* Mode Controller */}
        {showModeController && (
          <div className="animate-fade-in-up">
            <ModeController
              onModeChange={handleModeChange}
              showAdvancedSettings={true}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            />
          </div>
        )}

        {/* Usage Tips */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 mt-8">
          <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-6 h-6" />
            <span>Pro Tips for Best Results</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-green-800">
                    Start with Hybrid Mode
                  </h4>
                  <p className="text-green-700 text-sm">
                    Perfect for most writing scenarios and easy to adjust from
                    there.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-green-800">
                    Use Manual for Final Drafts
                  </h4>
                  <p className="text-green-700 text-sm">
                    Switch to manual mode when you need full creative control.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-green-800">
                    Leverage Auto Mode for Research
                  </h4>
                  <p className="text-green-700 text-sm">
                    Use fully auto mode for research-intensive projects.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-green-800">
                    Experiment and Learn
                  </h4>
                  <p className="text-green-700 text-sm">
                    Try different modes to discover what works best for your
                    style.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeControllerDemo;
