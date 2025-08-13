// MCP Context Block
/*
{
  file: "UnifiedModeSystemExample.tsx",
  role: "frontend-developer",
  allowedActions: ["example", "integration", "demo"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "unified_mode_example"
}
*/

import React, { useState, useEffect } from 'react';
import { ModeController } from '../src/components/ModeController';
import { useAgentPreferences } from '../src/contexts/AgentPreferencesContext';
import { ModeAwareAIService } from '../src/services/modeAwareAIService';
import { moduleCoordinator } from '../src/services/moduleCoordinator';
import { SystemMode, WritingContext } from '../src/types/systemModes';

/**
 * Unified Mode System Integration Example
 *
 * @description This example demonstrates how to integrate the Unified Mode System
 * into existing components and how to use the mode-aware services
 */
export const UnifiedModeSystemExample: React.FC = () => {
  const { preferences } = useAgentPreferences();
  const [currentMode, setCurrentMode] = useState<SystemMode>('HYBRID');
  const [modeAwareService] = useState(
    () =>
      new ModeAwareAIService(
        require('../src/services/aiHelperService').aiHelperService,
        require('../src/mcpRegistry').mcpRegistry
      )
  );
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Update current mode when preferences change
  useEffect(() => {
    setCurrentMode(preferences.systemMode || 'HYBRID');
  }, [preferences.systemMode]);

  /**
   * Example of using the mode-aware AI service
   */
  const handleModeAwareAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      const writingContext: WritingContext = {
        documentType: 'example',
        userGoals: ['demonstration', 'learning'],
        writingPhase: 'drafting',
        userExperience: 'intermediate',
        currentMode,
        sessionDuration: 300000, // 5 minutes
        interactionPatterns: {
          frequentEdits: true,
          longWritingSessions: false,
          collaborativeWork: false,
          researchIntensive: false,
        },
      };

      const request = {
        type: 'general_writing' as const,
        content: 'This is an example text for mode-aware analysis.',
        explicitUserInitiated: true,
        context: writingContext,
      };

      const response = await modeAwareService.processRequest(
        request,
        writingContext,
        currentMode
      );

      setAnalysisResult(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('Mode-aware analysis failed:', error);
      setAnalysisResult('Analysis failed: ' + (error as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Example of module coordination
   */
  const handleModuleCoordination = async () => {
    try {
      // Simulate a writing context change
      const writingContext: WritingContext = {
        documentType: 'novel',
        userGoals: ['character_development', 'plot_structure'],
        writingPhase: 'planning',
        userExperience: 'advanced',
        currentMode,
        sessionDuration: 600000, // 10 minutes
        interactionPatterns: {
          frequentEdits: false,
          longWritingSessions: true,
          collaborativeWork: false,
          researchIntensive: true,
        },
      };

      // Coordinate modules for the current mode
      await moduleCoordinator.coordinateModulesForMode(
        currentMode,
        writingContext
      );

      console.log('Modules coordinated successfully for', currentMode, 'mode');
    } catch (error) {
      console.error('Module coordination failed:', error);
    }
  };

  /**
   * Example of mode-specific behavior
   */
  const renderModeSpecificContent = () => {
    switch (currentMode) {
      case 'MANUAL':
        return (
          <div className="manual-mode-example p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-blue-800 font-medium mb-2">
              Manual Mode Example
            </h3>
            <p className="text-blue-700 text-sm mb-3">
              In Manual mode, AI assistance is only available when explicitly
              requested.
            </p>
            <button
              onClick={handleModeAwareAnalysis}
              disabled={isAnalyzing}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isAnalyzing ? 'Analyzing...' : 'Request AI Analysis'}
            </button>
          </div>
        );

      case 'HYBRID':
        return (
          <div className="hybrid-mode-example p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="text-green-800 font-medium mb-2">
              Hybrid Mode Example
            </h3>
            <p className="text-green-700 text-sm mb-3">
              In Hybrid mode, AI provides contextual suggestions that you can
              review and apply.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleModeAwareAnalysis}
                disabled={isAnalyzing}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 mr-2"
              >
                {isAnalyzing ? 'Analyzing...' : 'Get AI Suggestions'}
              </button>
              <button
                onClick={handleModuleCoordination}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Coordinate Modules
              </button>
            </div>
          </div>
        );

      case 'FULLY_AUTO':
        return (
          <div className="auto-mode-example p-4 bg-purple-50 border border-purple-200 rounded-md">
            <h3 className="text-purple-800 font-medium mb-2">
              Fully Auto Mode Example
            </h3>
            <p className="text-purple-700 text-sm mb-3">
              In Fully Auto mode, AI continuously analyzes and enhances your
              writing automatically.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleModeAwareAnalysis}
                disabled={isAnalyzing}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 mr-2"
              >
                {isAnalyzing ? 'Auto-Analyzing...' : 'Start Auto-Analysis'}
              </button>
              <button
                onClick={handleModuleCoordination}
                className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
              >
                Enable Cross-Module Intelligence
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="unified-mode-system-example max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Unified Mode System Integration Example
        </h1>
        <p className="text-gray-600">
          This example demonstrates how to integrate the Unified Mode System
          into your components and how to use the mode-aware services for
          intelligent AI assistance.
        </p>
      </div>

      {/* Mode Controller */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Mode Selection
        </h2>
        <ModeController />
      </div>

      {/* Current Mode Display */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Current Mode: {currentMode}
        </h2>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-gray-700">
            <strong>Mode Configuration:</strong>{' '}
            {JSON.stringify(preferences.modeConfiguration, null, 2)}
          </p>
        </div>
      </div>

      {/* Mode-Specific Examples */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Mode-Specific Behavior
        </h2>
        {renderModeSpecificContent()}
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Analysis Results
          </h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto">
            <pre className="text-sm">{analysisResult}</pre>
          </div>
        </div>
      )}

      {/* Integration Guide */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Integration Guide
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-blue-800 font-medium mb-2">How to Integrate</h3>
          <ol className="text-blue-700 text-sm space-y-2 list-decimal list-inside">
            <li>Import the mode system components and services</li>
            <li>Use the ModeController for mode selection</li>
            <li>Access current mode from AgentPreferencesContext</li>
            <li>Use ModeAwareAIService for AI requests</li>
            <li>Register modules with ModuleCoordinator</li>
            <li>Implement mode-specific behavior in your components</li>
          </ol>
        </div>
      </div>

      {/* Code Examples */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Code Examples
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              1. Access Current Mode
            </h3>
            <div className="bg-gray-900 text-green-400 p-3 rounded-md">
              <pre className="text-sm">
                {`const { preferences } = useAgentPreferences();
const currentMode = preferences.systemMode || 'HYBRID';`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              2. Use Mode-Aware AI Service
            </h3>
            <div className="bg-gray-900 text-green-400 p-3 rounded-md">
              <pre className="text-sm">
                {`const modeAwareService = new ModeAwareAIService(aiHelperService, mcpRegistry);
const response = await modeAwareService.processRequest(request, context, currentMode);`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              3. Implement Mode-Specific Behavior
            </h3>
            <div className="bg-gray-900 text-green-400 p-3 rounded-md">
              <pre className="text-sm">
                {`switch(currentMode) {
  case 'MANUAL':
    // Only respond to explicit requests
    break;
  case 'HYBRID':
    // Offer contextual suggestions
    break;
  case 'FULLY_AUTO':
    // Provide proactive assistance
    break;
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              4. Register with Module Coordinator
            </h3>
            <div className="bg-gray-900 text-green-400 p-3 rounded-md">
              <pre className="text-sm">
                {`const moduleInterface = {
  moduleId: 'myModule',
  currentMode,
  adaptToMode: async (mode, strategy) => {
    // Adapt module behavior
  },
  getModuleState: () => ({ /* module state */ }),
  getCoordinationCapabilities: () => ['feature1', 'feature2']
};

moduleCoordinator.registerModule(moduleInterface);`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Best Practices
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-green-800 font-medium mb-2">✅ Do</h3>
            <ul className="text-green-700 text-sm space-y-1 list-disc list-inside">
              <li>Always check current mode before implementing behavior</li>
              <li>Provide clear visual indicators for each mode</li>
              <li>Implement graceful mode transitions</li>
              <li>Use the ModuleCoordinator for cross-module communication</li>
              <li>Test your components across all three modes</li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-red-800 font-medium mb-2">❌ Don't</h3>
            <ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
              <li>Hardcode mode-specific behavior</li>
              <li>Ignore user mode preferences</li>
              <li>Implement mode changes without validation</li>
              <li>Forget to handle mode transitions</li>
              <li>Skip testing mode-specific functionality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedModeSystemExample;
