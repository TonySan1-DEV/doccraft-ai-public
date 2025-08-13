import React, { useEffect, useState } from 'react';
import { moduleCoordinator } from '../src/services/moduleCoordinator';
import { SystemMode, WritingContext } from '../src/types/systemModes';

/**
 * Example Component Demonstrating Optimized ModuleCoordinator Usage
 *
 * This example shows how to:
 * - Monitor performance metrics in real-time
 * - Use performance insights for optimization
 * - Handle different coordination modes
 * - Monitor system health
 */

interface PerformanceDashboardProps {
  title: string;
  children: React.ReactNode;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  title,
  children,
}) => (
  <div
    style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '16px',
      margin: '16px 0',
      backgroundColor: '#fafafa',
    }}
  >
    <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>{title}</h3>
    {children}
  </div>
);

const MetricCard: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
}> = ({ label, value, unit }) => (
  <div
    style={{
      display: 'inline-block',
      margin: '8px',
      padding: '12px',
      backgroundColor: 'white',
      borderRadius: '6px',
      border: '1px solid #e0e0e0',
      minWidth: '120px',
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
      {label}
    </div>
    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
      {value}
      {unit}
    </div>
  </div>
);

const OptimizedModuleCoordinatorExample: React.FC = () => {
  const [coordinationStatus, setCoordinationStatus] = useState<any>(null);
  const [performanceInsights, setPerformanceInsights] = useState<any>(null);
  const [currentMode, setCurrentMode] = useState<SystemMode>('MANUAL');
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Update status every second
  useEffect(() => {
    const updateStatus = () => {
      const status = moduleCoordinator.getCoordinationStatus();
      setCoordinationStatus(status);

      const insights = moduleCoordinator.getPerformanceInsights();
      setPerformanceInsights(insights);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle mode changes
  const handleModeChange = async (newMode: SystemMode) => {
    setCurrentMode(newMode);

    const context: WritingContext = {
      documentType: 'example',
      userGoals: ['demonstrate performance'],
      writingPhase: 'planning',
      userExperience: 'intermediate',
      currentMode: newMode,
      sessionDuration: 0,
      interactionPatterns: {
        frequentEdits: false,
        longWritingSessions: false,
        collaborativeWork: false,
        researchIntensive: false,
      },
    };

    try {
      await moduleCoordinator.coordinateModulesForMode(newMode, context);
    } catch (error) {
      console.error('Failed to coordinate modules:', error);
    }
  };

  // Force performance optimization
  const handleForceOptimization = () => {
    setIsOptimizing(true);
    moduleCoordinator.forceOptimization();

    // Reset after a short delay
    setTimeout(() => setIsOptimizing(false), 1000);
  };

  // Simulate high load for testing
  const simulateHighLoad = async () => {
    const context: WritingContext = {
      documentType: 'stress-test',
      userGoals: ['test performance'],
      writingPhase: 'drafting',
      userExperience: 'advanced',
      currentMode: currentMode,
      sessionDuration: 0,
      interactionPatterns: {
        frequentEdits: true,
        longWritingSessions: true,
        collaborativeWork: false,
        researchIntensive: false,
      },
    };

    // Simulate multiple rapid coordination calls
    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(
        moduleCoordinator.coordinateModulesForMode(currentMode, context)
      );
    }

    await Promise.allSettled(promises);
  };

  if (!coordinationStatus) {
    return <div>Loading performance data...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '24px' }}>
        🚀 Optimized ModuleCoordinator Performance Dashboard
      </h1>

      {/* Mode Selection */}
      <PerformanceDashboard title="🎛️ System Mode Control">
        <div style={{ marginBottom: '16px' }}>
          <label style={{ marginRight: '12px' }}>Current Mode:</label>
          <select
            value={currentMode}
            onChange={e => handleModeChange(e.target.value as SystemMode)}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
            <option value="MANUAL">Manual Mode</option>
            <option value="HYBRID">Hybrid Mode</option>
            <option value="FULLY_AUTO">Fully Auto Mode</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={handleForceOptimization}
            disabled={isOptimizing}
            style={{
              padding: '8px 16px',
              marginRight: '12px',
              backgroundColor: isOptimizing ? '#ccc' : '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isOptimizing ? 'not-allowed' : 'pointer',
            }}
          >
            {isOptimizing ? 'Optimizing...' : '🚀 Force Optimization'}
          </button>

          <button
            onClick={simulateHighLoad}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            📊 Simulate High Load
          </button>
        </div>
      </PerformanceDashboard>

      {/* Performance Metrics */}
      <PerformanceDashboard title="📊 Real-Time Performance Metrics">
        <div>
          <MetricCard
            label="Coordination Latency"
            value={coordinationStatus.performanceMetrics.coordinationLatency.toFixed(
              2
            )}
            unit="ms"
          />
          <MetricCard
            label="Memory Usage"
            value={(
              coordinationStatus.performanceMetrics.memoryUsage /
              (1024 * 1024)
            ).toFixed(1)}
            unit="MB"
          />
          <MetricCard
            label="Cache Hit Rate"
            value={(
              coordinationStatus.performanceMetrics.cacheHitRate * 100
            ).toFixed(1)}
            unit="%"
          />
          <MetricCard
            label="Batch Efficiency"
            value={coordinationStatus.performanceMetrics.batchProcessingEfficiency.toFixed(
              2
            )}
            unit=" ops/ms"
          />
          <MetricCard
            label="Active Subscriptions"
            value={coordinationStatus.performanceMetrics.activeSubscriptions}
          />
        </div>
      </PerformanceDashboard>

      {/* System Status */}
      <PerformanceDashboard title="🔧 System Status">
        <div>
          <MetricCard
            label="Active Modules"
            value={coordinationStatus.activeModules.length}
          />
          <MetricCard
            label="Is Coordinating"
            value={coordinationStatus.isCoordinating ? 'Yes' : 'No'}
          />
          <MetricCard
            label="Current Mode"
            value={coordinationStatus.currentMode || 'None'}
          />
          <MetricCard
            label="Cache Size"
            value={`${coordinationStatus.cacheStats.size}/${coordinationStatus.cacheStats.maxSize}`}
          />
          <MetricCard
            label="Batch Queue"
            value={`${coordinationStatus.batchQueueStatus.pending}/${coordinationStatus.batchQueueStatus.maxSize}`}
          />
        </div>
      </PerformanceDashboard>

      {/* Performance Insights */}
      <PerformanceDashboard title="💡 Performance Insights & Recommendations">
        {performanceInsights && (
          <div>
            {performanceInsights.insights.length > 0 ? (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ color: '#e67e22', marginBottom: '8px' }}>
                  🔍 Insights:
                </h4>
                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                  {performanceInsights.insights.map(
                    (insight: string, index: number) => (
                      <li
                        key={index}
                        style={{ marginBottom: '4px', color: '#555' }}
                      >
                        {insight}
                      </li>
                    )
                  )}
                </ul>
              </div>
            ) : (
              <div style={{ color: '#27ae60', fontStyle: 'italic' }}>
                ✅ All performance metrics are within optimal ranges
              </div>
            )}

            {performanceInsights.recommendations.length > 0 && (
              <div>
                <h4 style={{ color: '#3498db', marginBottom: '8px' }}>
                  💡 Recommendations:
                </h4>
                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                  {performanceInsights.recommendations.map(
                    (recommendation: string, index: number) => (
                      <li
                        key={index}
                        style={{ marginBottom: '4px', color: '#555' }}
                      >
                        {recommendation}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </PerformanceDashboard>

      {/* Cache Statistics */}
      <PerformanceDashboard title="🗄️ Cache Performance">
        <div>
          <MetricCard
            label="Cache TTL"
            value={coordinationStatus.cacheStats.ttl / 1000}
            unit="s"
          />
          <MetricCard
            label="Cache Efficiency"
            value={(
              (coordinationStatus.cacheStats.size /
                coordinationStatus.cacheStats.maxSize) *
              100
            ).toFixed(1)}
            unit="%"
          />
          <MetricCard
            label="Memory Threshold"
            value={(100 * 1024 * 1024) / (1024 * 1024)}
            unit="MB"
          />
        </div>
      </PerformanceDashboard>

      {/* Memory Management */}
      <PerformanceDashboard title="🧠 Memory Management">
        <div>
          <MetricCard
            label="Active Subscriptions"
            value={coordinationStatus.memoryStats.activeSubscriptions}
          />
          <MetricCard
            label="Last Cleanup"
            value={
              coordinationStatus.memoryStats.lastCleanup ? 'Recent' : 'None'
            }
          />
          <MetricCard label="Inactive Threshold" value="30" unit="s" />
        </div>
      </PerformanceDashboard>

      {/* Usage Instructions */}
      <PerformanceDashboard title="📖 Usage Instructions">
        <div style={{ color: '#555', lineHeight: '1.6' }}>
          <p>
            <strong>1. Mode Selection:</strong> Switch between MANUAL, HYBRID,
            and FULLY_AUTO modes to see how performance strategies change.
          </p>
          <p>
            <strong>2. Force Optimization:</strong> Click the red button to
            manually trigger performance optimization and cleanup.
          </p>
          <p>
            <strong>3. High Load Simulation:</strong> Click the blue button to
            simulate high coordination load and observe system behavior.
          </p>
          <p>
            <strong>4. Real-Time Monitoring:</strong> Watch metrics update in
            real-time as the system operates.
          </p>
          <p>
            <strong>5. Performance Insights:</strong> Review automatic insights
            and recommendations for system optimization.
          </p>
        </div>
      </PerformanceDashboard>

      {/* Technical Details */}
      <PerformanceDashboard title="🔧 Technical Implementation">
        <div style={{ color: '#555', lineHeight: '1.6' }}>
          <p>
            <strong>Debouncing:</strong> 300ms for normal operations, 50ms for
            critical updates
          </p>
          <p>
            <strong>Caching:</strong> 5-second TTL with 1000 entry limit and
            smart eviction
          </p>
          <p>
            <strong>Batch Processing:</strong> 100ms window with 50 update limit
          </p>
          <p>
            <strong>Memory Management:</strong> 30-second inactivity threshold
            with 100MB pressure limit
          </p>
          <p>
            <strong>Performance Monitoring:</strong> Real-time metrics with
            actionable insights
          </p>
        </div>
      </PerformanceDashboard>
    </div>
  );
};

export default OptimizedModuleCoordinatorExample;
