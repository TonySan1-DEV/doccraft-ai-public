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

  // Initialize services
  useEffect(() => {
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
        startHealthMonitoring(monitor);
        startCacheMonitoring(cache);
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }
    };

    initializeServices();
  }, []);

  // Monitor system health
  const startHealthMonitoring = (monitor: PerformanceMonitor) => {
    const interval = setInterval(() => {
      const health = monitor.getSystemHealth();
      setSystemHealth(health);
    }, 5000);

    return () => clearInterval(interval);
  };

  // Monitor cache performance
  const startCacheMonitoring = (cache: AICacheService) => {
    const interval = setInterval(async () => {
      try {
        const stats = await cache.getCacheStats();
        setCacheStats(stats);
      } catch (error) {
        console.error('Failed to get cache stats:', error);
      }
    }, 10000);

    return () => clearInterval(interval);
  };

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
        writingPhase: 'revision',
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
    <div className={`multi-agent-orchestration-example ${className}`}>
      <h2>Multi-Agent Orchestration with Intelligent Caching</h2>

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

      <style jsx>{`
        .multi-agent-orchestration-example {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          font-family:
            -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        h2 {
          color: #2c3e50;
          border-bottom: 3px solid #3498db;
          padding-bottom: 10px;
          margin-bottom: 30px;
        }

        h3 {
          color: #34495e;
          margin-top: 30px;
          margin-bottom: 15px;
        }

        .service-status,
        .task-controls,
        .current-task,
        .task-results,
        .system-health,
        .cache-stats,
        .utility-controls,
        .performance-insights {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .status-grid,
        .health-grid,
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }

        .status-item,
        .health-item,
        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: white;
          border-radius: 6px;
          border: 1px solid #dee2e6;
        }

        .label {
          font-weight: 600;
          color: #495057;
        }

        .value {
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.9em;
        }

        .online {
          background: #d4edda;
          color: #155724;
        }
        .offline {
          background: #f8d7da;
          color: #721c24;
        }
        .status-healthy {
          background: #d4edda;
          color: #155724;
        }
        .status-degraded {
          background: #fff3cd;
          color: #856404;
        }
        .status-unhealthy {
          background: #f8d7da;
          color: #721c24;
        }

        .control-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 15px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        .btn-info {
          background: #17a2b8;
          color: white;
        }
        .btn-warning {
          background: #ffc107;
          color: #212529;
        }
        .btn-success {
          background: #28a745;
          color: white;
        }

        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .task-details,
        .result-details {
          background: white;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #dee2e6;
        }

        .task-details ul,
        .result-details ul {
          margin: 10px 0;
          padding-left: 20px;
        }

        .task-details li,
        .result-details li {
          margin: 5px 0;
        }

        .health-recommendations {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }

        .insights-content p {
          margin: 15px 0;
          line-height: 1.6;
          color: #495057;
        }

        .insights-content strong {
          color: #2c3e50;
        }
      `}</style>
    </div>
  );
}
