// Enterprise Performance Dashboard for DocCraft-AI
// Real-time monitoring with security metrics and performance analytics

import React, { useState, useEffect } from 'react';
import {
  DashboardMetrics,
  RealtimeData,
  Alert,
  SecurityStatusIndicator,
  PerformanceStatusIndicator,
} from '../types/security';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  target: number;
  trend: 'up' | 'down' | 'stable';
  critical?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  target,
  trend,
  critical = false,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
        critical ? 'border-red-500' : 'border-blue-500'
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <span className={`text-2xl ${getTrendColor()}`}>{getTrendIcon()}</span>
      </div>
      <div className="mt-2">
        <span className="text-3xl font-bold text-gray-900">
          {value.toFixed(1)}
        </span>
        <span className="text-lg text-gray-600 ml-1">{unit}</span>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        Target: {target.toFixed(1)} {unit}
      </div>
      {critical && (
        <div className="mt-2 text-sm text-red-600 font-medium">
          ⚠️ Critical threshold exceeded
        </div>
      )}
    </div>
  );
};

interface SecurityThreatChartProps {
  data: Array<{ timestamp: Date; threatLevel: number }>;
}

const SecurityThreatChart: React.FC<SecurityThreatChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Security Threat History
        </h3>
        <div className="text-gray-500 text-center py-8">
          No threat data available
        </div>
      </div>
    );
  }

  const maxThreat = Math.max(...data.map(d => d.threatLevel));
  const minThreat = Math.min(...data.map(d => d.threatLevel));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Security Threat History
      </h3>
      <div className="h-48 flex items-end space-x-1">
        {data.slice(-20).map((point, index) => {
          const height =
            ((point.threatLevel - minThreat) / (maxThreat - minThreat)) * 100;
          const color =
            point.threatLevel > 0.8
              ? 'bg-red-500'
              : point.threatLevel > 0.5
                ? 'bg-yellow-500'
                : 'bg-green-500';

          return (
            <div
              key={index}
              className={`${color} rounded-t flex-1`}
              style={{ height: `${Math.max(height, 5)}%` }}
              title={`${point.timestamp.toLocaleTimeString()}: ${(point.threatLevel * 100).toFixed(1)}%`}
            />
          );
        })}
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center">
        Last 20 data points
      </div>
    </div>
  );
};

interface ModulePerformanceBreakdownProps {
  data: Record<string, { responseTime: number; success: boolean }>;
}

const ModulePerformanceBreakdown: React.FC<ModulePerformanceBreakdownProps> = ({
  data,
}) => {
  const modules = Object.entries(data || {});

  if (modules.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Module Performance
        </h3>
        <div className="text-gray-500 text-center py-8">
          No module data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Module Performance
      </h3>
      <div className="space-y-3">
        {modules.map(([module, perf]) => (
          <div key={module} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 capitalize">
              {module.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <div className="flex items-center space-x-2">
              <span
                className={`text-sm px-2 py-1 rounded ${
                  perf.success
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {perf.success ? '✓' : '✗'}
              </span>
              <span className="text-sm text-gray-600">
                {perf.responseTime.toFixed(0)}ms
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface UserExperienceHeatmapProps {
  data: Array<{ satisfaction: number; timestamp: Date }>;
}

const UserExperienceHeatmap: React.FC<UserExperienceHeatmapProps> = ({
  data,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          User Experience
        </h3>
        <div className="text-gray-500 text-center py-8">
          No UX data available
        </div>
      </div>
    );
  }

  const avgSatisfaction =
    data.reduce((sum, d) => sum + d.satisfaction, 0) / data.length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        User Experience
      </h3>
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600">
          {avgSatisfaction.toFixed(1)}
        </div>
        <div className="text-lg text-gray-600">/ 5.0</div>
        <div className="mt-2 text-sm text-gray-500">
          Based on {data.length} responses
        </div>
      </div>
    </div>
  );
};

interface AlertStreamProps {
  alerts: Alert[];
  onResolve: (alertId: string) => void;
}

const AlertStream: React.FC<AlertStreamProps> = ({ alerts, onResolve }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return 'ℹ️';
      default:
        return '📝';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Active Alerts
        </h3>
        <div className="text-gray-500 text-center py-8">No active alerts</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Active Alerts
      </h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                <span className="text-lg">
                  {getSeverityIcon(alert.severity)}
                </span>
                <div>
                  <div className="font-medium text-gray-800">
                    {alert.message}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              {!alert.resolved && (
                <button
                  onClick={() => onResolve(alert.id)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const EnterprisePerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({});
  const [realTimeData, setRealTimeData] = useState<RealtimeData>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [securityMetrics, setSecurityMetrics] =
    useState<SecurityStatusIndicator>({
      level: 'secure',
      message: 'System operating normally',
      lastUpdate: new Date(),
    });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        avgResponseTime: Math.random() * 5000 + 1000,
        cacheHitRate: Math.random() * 30 + 70,
        avgSecurityScore: Math.random() * 20 + 80,
        avgSatisfaction: Math.random() * 1 + 4,
      }));
    }, 5000);

    // Simulate metrics loading
    const loadMetrics = async () => {
      // This would integrate with your actual performance monitor
      const mockMetrics: DashboardMetrics = {
        ai_performance: {
          current: 2500,
          trend: 'stable',
          history: [2000, 2200, 2400, 2500],
          target: 3000,
          critical: false,
        },
        security_metrics: {
          current: 95,
          trend: 'up',
          history: [90, 92, 94, 95],
          target: 95,
          critical: false,
        },
      };
      setMetrics(mockMetrics);
    };

    loadMetrics();

    return () => clearInterval(interval);
  }, []);

  const handleAlertResolve = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                DocCraft-AI Enterprise Monitor
              </h1>
              <p className="text-gray-600 mt-2">
                Real-time performance and security monitoring dashboard
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Last Updated</div>
                <div className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="AI Response Time"
            value={realTimeData.avgResponseTime || 0}
            unit="ms"
            target={3000}
            trend={metrics['ai_performance']?.trend || 'stable'}
            critical={(realTimeData.avgResponseTime || 0) > 5000}
          />

          <MetricCard
            title="Cache Hit Rate"
            value={realTimeData.cacheHitRate || 0}
            unit="%"
            target={85}
            trend={metrics['ai_performance']?.trend || 'stable'}
          />

          <MetricCard
            title="Security Score"
            value={realTimeData.avgSecurityScore || 0}
            unit="/100"
            target={95}
            trend={metrics['security_metrics']?.trend || 'stable'}
            critical={(realTimeData.avgSecurityScore || 0) < 90}
          />

          <MetricCard
            title="User Satisfaction"
            value={realTimeData.avgSatisfaction || 0}
            unit="/5"
            target={4.5}
            trend={metrics['ai_performance']?.trend || 'stable'}
          />
        </div>

        {/* Advanced Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SecurityThreatChart
            data={[
              { timestamp: new Date(Date.now() - 3600000), threatLevel: 0.1 },
              { timestamp: new Date(Date.now() - 2400000), threatLevel: 0.2 },
              { timestamp: new Date(Date.now() - 1200000), threatLevel: 0.05 },
              { timestamp: new Date(), threatLevel: 0.1 },
            ]}
          />

          <ModulePerformanceBreakdown
            data={{
              emotionArc: { responseTime: 1200, success: true },
              narrativeDashboard: { responseTime: 1800, success: true },
              plotStructure: { responseTime: 950, success: true },
              styleProfile: { responseTime: 2100, success: false },
              themeAnalysis: { responseTime: 1500, success: true },
            }}
          />
        </div>

        {/* User Experience and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UserExperienceHeatmap
            data={[
              { satisfaction: 4.5, timestamp: new Date() },
              { satisfaction: 4.8, timestamp: new Date() },
              { satisfaction: 4.2, timestamp: new Date() },
              { satisfaction: 4.7, timestamp: new Date() },
            ]}
          />

          <AlertStream alerts={alerts} onResolve={handleAlertResolve} />
        </div>

        {/* System Status Footer */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  System Status: Operational
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Security: Active</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Dashboard v1.0.0 | Last refresh: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
