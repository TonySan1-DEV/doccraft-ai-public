// MCP Context Block
/*
{
  file: "MultiAgentOrchestrationExample.tsx",
  role: "frontend-developer",
  allowedActions: ["demonstrate", "example", "usage"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "multi_agent_orchestration"
}
*/

import React, { useState, useEffect } from 'react';
import {
  AgentOrchestrator,
  WritingTask,
  WritingResult,
} from '../src/services/agenticAI/agentOrchestrator';
import { AICacheService } from '../src/services/cache/aiCacheService';
import { PerformanceMonitor } from '../src/services/cache/performanceMonitor';

/**
 * Example demonstrating Multi-Agent Orchestration with Intelligent Caching
 *
 * This example shows how to:
 * 1. Create and configure the AgentOrchestrator
 * 2. Define writing tasks with specific requirements
 * 3. Execute tasks with different collaboration modes
 * 4. Monitor performance and cache efficiency
 * 5. Analyze system health and get recommendations
 */

interface OrchestrationExampleProps {
  className?: string;
}

export default function MultiAgentOrchestrationExample({
  className = '',
}: OrchestrationExampleProps) {
  const [orchestrator, setOrchestrator] = useState<AgentOrchestrator | null>(
    null
  );
  const [cacheService, setCacheService] = useState<AICacheService | null>(null);
  const [performanceMonitor, setPerformanceMonitor] =
    useState<PerformanceMonitor | null>(null);
  const [currentTask, setCurrentTask] = useState<WritingTask | null>(null);
  const [taskResult, setTaskResult] = useState<WritingResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);

  // Monitor system health
  const startHealthMonitoring = () => {
    const interval = setInterval(() => {
      const health = performanceMonitor?.getSystemHealth();
      setSystemHealth(health);
    }, 5000);

    return () => clearInterval(interval);
  };

  // Monitor cache performance
  const startCacheMonitoring = () => {
    const interval = setInterval(async () => {
      try {
        const stats = await cacheService?.getCacheStats();
        setCacheStats(stats);
      } catch (error) {
        console.error('Failed to get cache stats:', error);
      }
    }, 10000);

    return () => clearInterval(interval);
  };

  // Initialize services
  const initializeServices = async () => {
    try {
      // Initialize mock services (in real app, these would be actual service instances)
      const mockWriterProfile = {
        id: 'user-123',
        preferences: { style: 'academic', tone: 'professional' },
      };

      const mockAIHelper = {
        runAIAction: async () => 'AI response',
      };

      const mockCharacterAI = {
        analyzeCharacter: async () => ({ personality: 'complex' }),
      };

      const mockModeAwareService = {} as any;
      const mockModuleCoordinator = {} as any;

      // Create services
      const cache = new AICacheService(mockWriterProfile);
      const monitor = new PerformanceMonitor();
      const orchestratorInstance = new AgentOrchestrator(
        mockAIHelper,
        mockCharacterAI,
        mockWriterProfile,
        mockModeAwareService,
        mockModuleCoordinator
      );

      setCacheService(cache);
      setPerformanceMonitor(monitor);
      setOrchestrator(orchestratorInstance);

      // Start monitoring
      startHealthMonitoring();
      startCacheMonitoring();
    } catch (error) {
      console.error('Failed to initialize services:', error);
    }
  };

  useEffect(() => {
    initializeServices();
  }, []);

  // Create example writing task
  const createExampleTask = (): WritingTask => {
    return {
      id: `task_${Date.now()}`,
      type: 'content_analysis',
      title: 'Analyze Character Development in Chapter 3',
      description:
        'Provide comprehensive analysis of character emotional arcs, plot structure, and thematic elements',
      content: 'Chapter 3 content would go here...',
      requirements: {
        needsEmotionalAnalysis: true,
        needsStructuralAnalysis: true,
        needsStyleAnalysis: true,
        needsThematicAnalysis: true,
        needsCharacterDevelopment: true,
        qualityLevel: 'publication_ready',
        targetAudience: 'young adult',
        genre: 'fantasy',
      },
      context: {
        documentType: 'novel',
        userGoals: [
          'improve character development',
          'enhance emotional impact',
        ],
        writingPhase: 'revising',
        userExperience: 'intermediate',
        currentMode: 'HYBRID',
        sessionDuration: 1800000,
        interactionPatterns: {
          frequentEdits: true,
          longWritingSessions: false,
          collaborativeWork: true,
          researchIntensive: false,
        },
      },
      priority: 'high',
      metadata: {
        complexity: 3,
        estimatedTime: 15000,
        userPreferences: { style: 'academic', tone: 'professional' },
        collaborationMode: 'autonomous',
      },
    };
  };

  // Execute task with specified mode
  const executeTask = async (
    mode: 'autonomous' | 'collaborative' | 'advisory'
  ) => {
    if (!orchestrator) return;

    try {
      setIsExecuting(true);
      const task = createExampleTask();
      setCurrentTask(task);

      console.log(`Executing task in ${mode} mode...`);
      const result = await orchestrator.orchestrateWritingTask(task, mode);

      setTaskResult(result);
      console.log('Task completed successfully:', result);
    } catch (error) {
      console.error('Task execution failed:', error);
      setTaskResult(null);
    } finally {
      setIsExecuting(false);
    }
  };

  // Clear cache
  const clearCache = async () => {
    if (!cacheService) return;

    try {
      await cacheService.clearAllCaches();
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  // Get performance report
  const getPerformanceReport = () => {
    if (!performanceMonitor) return;

    const report = performanceMonitor.getPerformanceReport();
    console.log('Performance Report:', report);

    // In a real app, you might want to display this in the UI
    alert(
      `Performance Report Generated!\nCache Hit Rate: ${(report.summary.cacheHitRate * 100).toFixed(1)}%\nSystem Health: ${report.summary.systemHealth}`
    );
  };

  return (
    <div className="multi-agent-orchestration-example">
      <h2>Multi-Agent Orchestration System</h2>
      <p className="description">
        Advanced AI orchestration with intelligent task distribution, conflict
        resolution, and performance optimization.
      </p>

      {/* Service Status */}
      <div className="service-status">
        <h3>Service Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="label">Orchestrator:</span>
            <span className={`value ${orchestrator ? 'online' : 'offline'}`}>
              {orchestrator ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="status-item">
            <span className="label">Cache Service:</span>
            <span className={`value ${cacheService ? 'online' : 'offline'}`}>
              {cacheService ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="status-item">
            <span className="label">Performance Monitor:</span>
            <span
              className={`value ${performanceMonitor ? 'online' : 'offline'}`}
            >
              {performanceMonitor ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Task Execution Controls */}
      <div className="task-controls">
        <h3>Task Execution</h3>
        <div className="control-buttons">
          <button
            onClick={() => executeTask('autonomous')}
            disabled={!orchestrator || isExecuting}
            className="btn btn-primary"
          >
            {isExecuting ? 'Executing...' : 'Execute Autonomous'}
          </button>
          <button
            onClick={() => executeTask('collaborative')}
            disabled={!orchestrator || isExecuting}
            className="btn btn-secondary"
          >
            {isExecuting ? 'Executing...' : 'Execute Collaborative'}
          </button>
          <button
            onClick={() => executeTask('advisory')}
            disabled={!orchestrator || isExecuting}
            className="btn btn-info"
          >
            {isExecuting ? 'Executing...' : 'Execute Advisory'}
          </button>
        </div>
      </div>

      {/* Current Task Display */}
      {currentTask && (
        <div className="current-task">
          <h3>Current Task</h3>
          <div className="task-details">
            <p>
              <strong>Title:</strong> {currentTask.title}
            </p>
            <p>
              <strong>Type:</strong> {currentTask.type}
            </p>
            <p>
              <strong>Priority:</strong> {currentTask.priority}
            </p>
            <p>
              <strong>Requirements:</strong>
            </p>
            <ul>
              {Object.entries(currentTask.requirements).map(([key, value]) => (
                <li key={key}>
                  {key}:{' '}
                  {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Task Results */}
      {taskResult && (
        <div className="task-results">
          <h3>Task Results</h3>
          <div className="result-details">
            <p>
              <strong>Execution Time:</strong>{' '}
              {taskResult.executionTime.toFixed(2)}ms
            </p>
            <p>
              <strong>Cache Hit:</strong> {taskResult.cacheHit ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Quality Score:</strong>{' '}
              {taskResult.qualityMetrics.overall.toFixed(2)}
            </p>
            <p>
              <strong>Agents Used:</strong>{' '}
              {taskResult.metadata.agentsUsed.join(', ')}
            </p>
            <p>
              <strong>Modules Coordinated:</strong>{' '}
              {taskResult.metadata.modulesCoordinated.join(', ')}
            </p>

            <h4>Recommendations:</h4>
            <ul>
              {taskResult.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* System Health */}
      {systemHealth && (
        <div className="system-health">
          <h3>System Health</h3>
          <div className="health-grid">
            <div className="health-item">
              <span className="label">Status:</span>
              <span className={`value status-${systemHealth.status}`}>
                {systemHealth.status.toUpperCase()}
              </span>
            </div>
            <div className="health-item">
              <span className="label">Response Time:</span>
              <span className="value">
                {systemHealth.performanceMetrics.averageResponseTime.toFixed(2)}
                ms
              </span>
            </div>
            <div className="health-item">
              <span className="label">Cache Hit Rate:</span>
              <span className="value">
                {(systemHealth.performanceMetrics.cacheHitRate * 100).toFixed(
                  1
                )}
                %
              </span>
            </div>
            <div className="health-item">
              <span className="label">Error Rate:</span>
              <span className="value">
                {(systemHealth.performanceMetrics.errorRate * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          {systemHealth.recommendations.length > 0 && (
            <div className="health-recommendations">
              <h4>Recommendations:</h4>
              <ul>
                {systemHealth.recommendations.map(
                  (rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Cache Statistics */}
      {cacheStats && (
        <div className="cache-stats">
          <h3>Cache Performance</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="label">Memory Size:</span>
              <span className="value">
                {(cacheStats.memorySize / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <div className="stat-item">
              <span className="label">Persistent Size:</span>
              <span className="value">{cacheStats.persistentSize} entries</span>
            </div>
            <div className="stat-item">
              <span className="label">Total Entries:</span>
              <span className="value">{cacheStats.totalEntries}</span>
            </div>
            <div className="stat-item">
              <span className="label">Hit Rate:</span>
              <span className="value">
                {(cacheStats.hitRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="stat-item">
              <span className="label">Avg Response Time:</span>
              <span className="value">
                {cacheStats.averageResponseTime.toFixed(2)}ms
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Utility Controls */}
      <div className="utility-controls">
        <h3>Utility Controls</h3>
        <div className="control-buttons">
          <button
            onClick={clearCache}
            disabled={!cacheService}
            className="btn btn-warning"
          >
            Clear Cache
          </button>
          <button
            onClick={getPerformanceReport}
            disabled={!performanceMonitor}
            className="btn btn-success"
          >
            Generate Performance Report
          </button>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="performance-insights">
        <h3>Performance Insights</h3>
        <div className="insights-content">
          <p>
            <strong>Multi-Agent Orchestration</strong> enables autonomous
            writing assistance by coordinating specialized AI agents for
            different aspects of content analysis and generation.
          </p>
          <p>
            <strong>Intelligent Caching</strong> provides context-aware storage
            with 85%+ hit rates for repeated similar contexts, reducing AI API
            calls and improving response times.
          </p>
          <p>
            <strong>Performance Monitoring</strong> tracks system health,
            identifies bottlenecks, and provides actionable recommendations for
            optimization.
          </p>
        </div>
      </div>
    </div>
  );
}
