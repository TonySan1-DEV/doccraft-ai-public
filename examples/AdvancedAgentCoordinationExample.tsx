// MCP Context Block
/*
{
  file: "AdvancedAgentCoordinationExample.tsx",
  role: "frontend-developer",
  allowedActions: ["example", "demonstration", "integration"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "advanced_coordination"
}
*/

import React, { useState, useEffect } from 'react';
import {
  AdvancedCoordinationEngine,
  IntelligentConflictResolver,
  QualityAssuranceCoordinator,
  WritingGoal,
  CoordinatedResult,
  ModuleCapability,
  InterModuleConflict,
  ConflictResolution,
  QualityValidation,
} from '../src/services/agenticAI';
import { SystemMode, WritingContext } from '../src/types/systemModes';
import { PerformanceMonitor } from '../src/services/cache/performanceMonitor';

// ============================================================================
// EXAMPLE COMPONENT
// ============================================================================

export const AdvancedAgentCoordinationExample: React.FC = () => {
  const [coordinationEngine, setCoordinationEngine] =
    useState<AdvancedCoordinationEngine | null>(null);
  const [conflictResolver, setConflictResolver] =
    useState<IntelligentConflictResolver | null>(null);
  const [qualityAssurance, setQualityAssurance] =
    useState<QualityAssuranceCoordinator | null>(null);

  const [isCoordinating, setIsCoordinating] = useState(false);
  const [coordinationResult, setCoordinationResult] =
    useState<CoordinatedResult | null>(null);
  const [moduleStatus, setModuleStatus] = useState<
    Map<string, ModuleCapability>
  >(new Map());
  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const [conflictHistory, setConflictHistory] = useState<ConflictResolution[]>(
    []
  );
  const [qualityHistory, setQualityHistory] = useState<QualityValidation[]>([]);

  // Initialize the coordination system
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        // Create performance monitor (simulated)
        const performanceMonitor = new PerformanceMonitor();

        // Create user preferences (simulated)
        const userPreferences = {
          preferredResolutionStyle: 'balanced',
          qualityThreshold: 0.85,
          autonomyLevel: 'high',
        };

        // Initialize coordination engine
        const engine = new AdvancedCoordinationEngine(
          performanceMonitor,
          userPreferences
        );
        setCoordinationEngine(engine);

        // Initialize conflict resolver
        const resolver = new IntelligentConflictResolver();
        setConflictResolver(resolver);

        // Initialize quality assurance
        const qa = new QualityAssuranceCoordinator();
        setQualityAssurance(qa);

        // Get initial module status
        setModuleStatus(engine.getModuleStatus());

        console.log(
          'Advanced Agent Coordination System initialized successfully'
        );
      } catch (error) {
        console.error('Failed to initialize coordination system:', error);
      }
    };

    initializeSystem();
  }, []);

  // Update performance stats periodically
  useEffect(() => {
    if (!coordinationEngine || !conflictResolver || !qualityAssurance) return;

    const updateStats = () => {
      setPerformanceStats({
        coordination: coordinationEngine.getPerformanceStats(),
        conflictResolution: conflictResolver.getPerformanceStats(),
        qualityAssurance: qualityAssurance.getPerformanceStats(),
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, [coordinationEngine, conflictResolver, qualityAssurance]);

  // Update conflict and quality history
  useEffect(() => {
    if (!conflictResolver || !qualityAssurance) return;

    const updateHistory = () => {
      setConflictHistory(conflictResolver.getResolutionHistory());
      setQualityHistory(qualityAssurance.getValidationHistory());
    };

    updateHistory();
    const interval = setInterval(updateHistory, 3000);
    return () => clearInterval(interval);
  }, [conflictResolver, qualityAssurance]);

  // Example writing goal for coordination
  const createExampleWritingGoal = (): WritingGoal => ({
    id: `goal-${Date.now()}`,
    title: 'Advanced Character Development Scene',
    description:
      'Create a complex character development scene with emotional depth, narrative coherence, and thematic resonance',
    type: 'content_synthesis',
    priority: 'high',
    requirements: {
      needsEmotionalAnalysis: true,
      needsStructuralAnalysis: true,
      needsStyleAnalysis: true,
      needsThematicAnalysis: true,
      needsCharacterDevelopment: true,
      qualityLevel: 'polished',
      targetAudience: 'adult_fiction',
      genre: 'literary_fiction',
    },
    constraints: {
      maxExecutionTime: 15000,
      qualityThreshold: 0.85,
      userPreferences: {
        style: 'contemplative',
        pacing: 'moderate',
        complexity: 'high',
      },
      collaborationMode: 'autonomous',
    },
    context: {
      documentType: 'novel',
      userGoals: [
        'character_development',
        'emotional_depth',
        'thematic_coherence',
      ],
      writingPhase: 'planning',
      userExperience: 'advanced',
      currentMode: 'FULLY_AUTO',
      sessionDuration: 1800000, // 30 minutes
      interactionPatterns: {
        frequentEdits: false,
        longWritingSessions: true,
        collaborativeWork: false,
        researchIntensive: true,
      },
    },
  });

  // Execute coordinated multi-module task
  const executeCoordinatedTask = async () => {
    if (!coordinationEngine) return;

    setIsCoordinating(true);
    try {
      const writingGoal = createExampleWritingGoal();
      console.log('Executing coordinated task:', writingGoal);

      const result = await coordinationEngine.coordinateMultiModuleTask(
        writingGoal,
        writingGoal.context
      );

      setCoordinationResult(result);
      console.log('Coordination completed:', result);

      // Update module status
      setModuleStatus(coordinationEngine.getModuleStatus());
    } catch (error) {
      console.error('Coordination failed:', error);
    } finally {
      setIsCoordinating(false);
    }
  };

  // Simulate conflict detection and resolution
  const simulateConflictResolution = async () => {
    if (!conflictResolver) return;

    try {
      // Create simulated conflicts
      const conflicts: InterModuleConflict[] = [
        {
          id: `conflict-${Date.now()}`,
          type: 'emotional_narrative_mismatch',
          severity: 'medium',
          description:
            'Character emotional state conflicts with narrative progression',
          modules: ['emotionArc', 'narrativeDashboard'],
          conflictingData: {
            emotionArc: { emotionalState: 'conflicted', confidence: 0.9 },
            narrativeDashboard: { narrativeFlow: 0.6, confidence: 0.8 },
          },
          detectedAt: new Date(),
          impact: {
            narrativeCoherence: 0.6,
            userExperience: 0.7,
            qualityScore: 0.65,
          },
          context: {
            writingPhase: 'planning',
            genre: 'literary_fiction',
            targetAudience: 'adult_fiction',
            userMode: 'FULLY_AUTO',
          },
        },
      ];

      console.log('Resolving conflicts:', conflicts);

      const resolutions = await conflictResolver.resolveConflicts(
        conflicts,
        createExampleWritingGoal().context
      );

      console.log('Conflicts resolved:', resolutions);
      setConflictHistory(conflictResolver.getResolutionHistory());
    } catch (error) {
      console.error('Conflict resolution failed:', error);
    }
  };

  // Simulate quality assurance validation
  const simulateQualityValidation = async () => {
    if (!qualityAssurance) return;

    try {
      // Create simulated module results
      const moduleResults = [
        {
          moduleName: 'emotionArc',
          result: { emotionalDepth: 'high', characterDevelopment: 'strong' },
          executionTime: 2500,
          qualityMetrics: {
            emotionalCoherence: 0.88,
            characterConsistency: 0.92,
            motivationClarity: 0.85,
          },
          metadata: {
            timestamp: new Date(),
            version: '1.0.0',
            configuration: { analysisDepth: 'comprehensive' },
          },
        },
        {
          moduleName: 'narrativeDashboard',
          result: { storyStructure: 'three_act', narrativeFlow: 'smooth' },
          executionTime: 1800,
          qualityMetrics: {
            structuralCoherence: 0.85,
            narrativePacing: 0.88,
            plotLogic: 0.82,
          },
          metadata: {
            timestamp: new Date(),
            version: '1.0.0',
            configuration: { optimizationLevel: 'high' },
          },
        },
      ];

      console.log('Validating module results:', moduleResults);

      const validation = await qualityAssurance.validateResults(
        moduleResults,
        createExampleWritingGoal()
      );

      console.log('Quality validation completed:', validation);
      setQualityHistory(qualityAssurance.getValidationHistory());
    } catch (error) {
      console.error('Quality validation failed:', error);
    }
  };

  // Render module status cards
  const renderModuleStatus = () => {
    const modules = Array.from(moduleStatus.values());

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {modules.map(module => (
          <div
            key={module.moduleName}
            className="bg-white rounded-lg shadow-md p-4"
          >
            <h3 className="text-lg font-semibold text-gray-800 capitalize mb-2">
              {module.moduleName.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    module.currentStatus === 'idle'
                      ? 'bg-green-100 text-green-800'
                      : module.currentStatus === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : module.currentStatus === 'busy'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                  }`}
                >
                  {module.currentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Quality Score:</span>
                <span className="text-sm font-medium">
                  {(module.performanceMetrics.qualityScore * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Success Rate:</span>
                <span className="text-sm font-medium">
                  {(module.performanceMetrics.successRate * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render performance statistics
  const renderPerformanceStats = () => {
    if (!performanceStats) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Performance Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Coordination</h4>
            <div className="space-y-1 text-sm">
              <div>
                Total Tasks: {performanceStats.coordination?.totalTasks || 0}
              </div>
              <div>
                Success Rate:{' '}
                {(
                  (performanceStats.coordination?.successRate || 0) * 100
                ).toFixed(1)}
                %
              </div>
              <div>
                Avg Time:{' '}
                {performanceStats.coordination?.averageExecutionTime?.toFixed(
                  0
                ) || 0}
                ms
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">
              Conflict Resolution
            </h4>
            <div className="space-y-1 text-sm">
              <div>
                Total Conflicts:{' '}
                {performanceStats.conflictResolution?.totalConflicts || 0}
              </div>
              <div>
                Success Rate:{' '}
                {(
                  (performanceStats.conflictResolution?.successRate || 0) * 100
                ).toFixed(1)}
                %
              </div>
              <div>
                Avg Time:{' '}
                {performanceStats.conflictResolution?.averageResolutionTime?.toFixed(
                  0
                ) || 0}
                ms
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">
              Quality Assurance
            </h4>
            <div className="space-y-1 text-sm">
              <div>
                Total Validations:{' '}
                {performanceStats.qualityAssurance?.totalValidations || 0}
              </div>
              <div>
                Improvement Rate:{' '}
                {(
                  (performanceStats.qualityAssurance?.qualityImprovementRate ||
                    0) * 100
                ).toFixed(1)}
                %
              </div>
              <div>
                Critical Issues:{' '}
                {(
                  (performanceStats.qualityAssurance?.criticalIssueRate || 0) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render coordination result
  const renderCoordinationResult = () => {
    if (!coordinationResult) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Coordination Result
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Overall Quality</h4>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">
                {(coordinationResult.quality.overallScore * 100).toFixed(0)}%
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  coordinationResult.quality.passed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {coordinationResult.quality.passed ? 'PASSED' : 'FAILED'}
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">
              Execution Summary
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                Execution Time: {coordinationResult.executionTime.toFixed(0)}ms
              </div>
              <div>Conflicts Resolved: {coordinationResult.conflicts}</div>
              <div>
                Modules Involved:{' '}
                {coordinationResult.metadata.modulesInvolved.length}
              </div>
              <div>
                Confidence:{' '}
                {(coordinationResult.result.confidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">
              Module Contributions
            </h4>
            <div className="space-y-2">
              {coordinationResult.moduleContributions.map(
                (contribution, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span className="capitalize">
                      {contribution.moduleName
                        .replace(/([A-Z])/g, ' $1')
                        .trim()}
                    </span>
                    <div className="flex items-center space-x-4 text-sm">
                      <span>
                        Impact: {(contribution.impact * 100).toFixed(0)}%
                      </span>
                      <span>
                        Quality: {(contribution.quality * 100).toFixed(0)}%
                      </span>
                      <span>
                        Time: {contribution.executionTime.toFixed(0)}ms
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {coordinationResult.quality.improvements.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Improvement Suggestions
              </h4>
              <div className="space-y-2">
                {coordinationResult.quality.improvements
                  .slice(0, 5)
                  .map((improvement, index) => (
                    <div
                      key={index}
                      className="p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-700">
                          {improvement.suggestion}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            improvement.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : improvement.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {improvement.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Impact: {(improvement.estimatedImpact * 100).toFixed(0)}
                        % | Effort: {improvement.effort}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render conflict resolution history
  const renderConflictHistory = () => {
    if (conflictHistory.length === 0) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Conflict Resolutions
        </h3>
        <div className="space-y-3">
          {conflictHistory
            .slice(-5)
            .reverse()
            .map(resolution => (
              <div
                key={resolution.conflictId}
                className="p-3 border border-gray-200 rounded"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {resolution.resolution.type} Resolution
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      resolution.userAligned
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {resolution.userAligned
                      ? 'User Aligned'
                      : 'System Decision'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {resolution.rationale}
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    Confidence: {(resolution.confidence * 100).toFixed(0)}%
                  </span>
                  <span>
                    Narrative Impact:{' '}
                    {(resolution.narrativeImpact * 100).toFixed(0)}%
                  </span>
                  <span>Strategy: {resolution.metadata.strategyUsed}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  // Render quality validation history
  const renderQualityHistory = () => {
    if (qualityHistory.length === 0) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Quality Validations
        </h3>
        <div className="space-y-3">
          {qualityHistory
            .slice(-5)
            .reverse()
            .map((validation, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Quality Score: {(validation.overallScore * 100).toFixed(0)}%
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      validation.passed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {validation.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {validation.metadata.passedChecks} of{' '}
                  {validation.metadata.totalChecks} checks passed
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    Critical Issues: {validation.metadata.criticalIssues}
                  </span>
                  <span>Improvements: {validation.improvements.length}</span>
                  <span>
                    Time:{' '}
                    {validation.metadata.validationTime.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Advanced Agent Coordination System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sophisticated multi-agent coordination with intelligent conflict
            resolution and quality assurance
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Control Panel
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={executeCoordinatedTask}
              disabled={isCoordinating || !coordinationEngine}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCoordinating ? 'Coordinating...' : 'Execute Coordinated Task'}
            </button>

            <button
              onClick={simulateConflictResolution}
              disabled={!conflictResolver}
              className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Simulate Conflict Resolution
            </button>

            <button
              onClick={simulateQualityValidation}
              disabled={!qualityAssurance}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Simulate Quality Validation
            </button>
          </div>
        </div>

        {/* Module Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Module Status
          </h2>
          {renderModuleStatus()}
        </div>

        {/* Performance Statistics */}
        {renderPerformanceStats()}

        {/* Coordination Result */}
        {renderCoordinationResult()}

        {/* Conflict Resolution History */}
        {renderConflictHistory()}

        {/* Quality Validation History */}
        {renderQualityHistory()}

        {/* System Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            System Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Multi-module coordination across all 5 modules</li>
                <li>• Intelligent conflict detection and resolution</li>
                <li>• Comprehensive quality assurance validation</li>
                <li>• Real-time performance monitoring</li>
                <li>• User preference alignment</li>
                <li>• Narrative coherence analysis</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Performance Targets
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Multi-module coordination: &lt;5s for complex tasks</li>
                <li>• Conflict resolution: &lt;2s for typical conflicts</li>
                <li>• Quality validation: &gt;90% accuracy</li>
                <li>• User preference alignment: &gt;85% satisfaction</li>
                <li>• Narrative coherence: &gt;80% threshold</li>
                <li>• Overall quality: &gt;85% threshold</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAgentCoordinationExample;
