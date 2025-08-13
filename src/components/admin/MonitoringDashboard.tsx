import React, { useState, useEffect } from 'react';
import { Line, Area, Bar, ResponsiveContainer } from 'recharts';
import {
  Activity,
  Zap,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { performanceMonitor } from '../../monitoring/performanceMonitor';

interface MetricCardProps {
  title: string;
  value: string;
  target: string;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  target,
  status,
  icon,
  trend,
}) => {
  const statusColors = {
    good: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    critical: 'bg-red-50 border-red-200 text-red-800',
  };

  const trendIcons = {
    up: '↗️',
    down: '↘️',
    neutral: '→',
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${statusColors[status]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white rounded-lg">{icon}</div>
        <span className="text-lg">{trendIcons[trend]}</span>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium opacity-80">{title}</h3>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs opacity-70">{target}</div>
      </div>
    </div>
  );
};

const getTrend = (
  data: Array<{ timestamp: number; value: number }>
): 'up' | 'down' | 'neutral' => {
  if (!data || data.length < 2) return 'neutral';
  const recent = data.slice(-5); // Last 5 data points
  const trend = recent[recent.length - 1].value - recent[0].value;
  if (Math.abs(trend) < 0.1) return 'neutral';
  return trend > 0 ? 'up' : 'down';
};

const ResponsiveContainer: React.FC<{
  width: string;
  height: number;
  children: React.ReactNode;
}> = ({ width, height, children }) => (
  <div style={{ width, height }}>{children}</div>
);

export const MonitoringDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    '1h' | '6h' | '24h'
  >('1h');

  useEffect(() => {
    const updateDashboard = () => {
      const data = performanceMonitor.getDashboardData();
      setDashboardData(data);
      setIsLoading(false);
    };

    // Initial load
    updateDashboard();

    // Real-time updates every 10 seconds
    const interval = setInterval(updateDashboard, 10000);

    // Listen for real-time metric updates
    const handleMetricUpdate = (metric: any) => {
      updateDashboard();
    };

    performanceMonitor.on('metric', handleMetricUpdate);

    return () => {
      clearInterval(interval);
      performanceMonitor.off('metric', handleMetricUpdate);
    };
  }, []);

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading monitoring dashboard...</p>
        </div>
      </div>
    );
  }

  const { realTime, trends, alerts, health } = dashboardData;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            System Monitoring
          </h1>
          <p className="text-gray-600">
            Real-time performance and health monitoring
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={e => setSelectedTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
          </select>
          <div
            className={`flex items-center px-3 py-2 rounded-full ${
              health.status === 'healthy'
                ? 'bg-green-100 text-green-800'
                : health.status === 'warning'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
            }`}
          >
            {health.status === 'healthy' && (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            {health.status === 'warning' && (
              <AlertTriangle className="h-4 w-4 mr-2" />
            )}
            {health.status === 'critical' && (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            <span className="font-medium capitalize">{health.status}</span>
            <span className="ml-2 text-sm">({health.score}/100)</span>
          </div>
        </div>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="AI Response Time"
          value={`${Math.round(realTime.aiResponseTime)}ms`}
          target="< 500ms"
          status={
            realTime.aiResponseTime < 500
              ? 'good'
              : realTime.aiResponseTime < 1000
                ? 'warning'
                : 'critical'
          }
          icon={<Zap className="h-5 w-5" />}
          trend={getTrend(trends['ai.response_time'])}
        />

        <MetricCard
          title="Cache Hit Rate"
          value={`${Math.round(realTime.cacheHitRate)}%`}
          target="> 60%"
          status={
            realTime.cacheHitRate > 60
              ? 'good'
              : realTime.cacheHitRate > 40
                ? 'warning'
                : 'critical'
          }
          icon={<TrendingUp className="h-5 w-5" />}
          trend={getTrend(trends['ai.cache_hit_rate'])}
        />

        <MetricCard
          title="Active Users"
          value={realTime.activeUsers.toString()}
          target="Real-time"
          status="good"
          icon={<Users className="h-5 w-5" />}
          trend={getTrend(trends['ai.active_users'] || [])}
        />

        <MetricCard
          title="Requests/Min"
          value={realTime.requestsPerMinute.toString()}
          target="Live"
          status={
            realTime.errorRate < 1
              ? 'good'
              : realTime.errorRate < 5
                ? 'warning'
                : 'critical'
          }
          icon={<Activity className="h-5 w-5" />}
          trend={getTrend(trends['ai.requests_per_minute'] || [])}
        />
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Response Time Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            AI Response Time Trend
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <Line
              data={trends['ai.response_time']}
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
            />
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Target: &lt; 500ms</span>
            <span>Current: {Math.round(realTime.aiResponseTime)}ms</span>
          </div>
        </div>

        {/* Cache Performance Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cache Hit Rate
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <Area
              data={trends['ai.cache_hit_rate']}
              dataKey="value"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.3}
            />
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Target: &gt; 60%</span>
            <span>Current: {Math.round(realTime.cacheHitRate)}%</span>
          </div>
        </div>

        {/* Memory Usage Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Memory Usage
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <Area
              data={trends['system.memory.heap_used']}
              dataKey="value"
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={0.3}
            />
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Current: {Math.round(realTime.memoryUsage / (1024 * 1024))}MB
            </span>
            <span>Target: &lt; 500MB</span>
          </div>
        </div>

        {/* Error Rate Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Error Rate
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <Bar
              data={trends['error_rate'] || []}
              dataKey="value"
              fill="#EF4444"
            />
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Current: {realTime.errorRate.toFixed(2)}%</span>
            <span>Target: &lt; 1%</span>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Alerts
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <AlertTriangle
                    className={`h-5 w-5 mr-3 ${
                      alert.rule.severity === 'critical'
                        ? 'text-red-500'
                        : alert.rule.severity === 'high'
                          ? 'text-orange-500'
                          : 'text-yellow-500'
                    }`}
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {alert.rule.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Triggered {alert.count} times in the last hour
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {new Date(alert.lastSeen).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Insights */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(realTime.cacheHitRate)}%
            </div>
            <div className="text-sm text-gray-600">Cache Efficiency</div>
            <div className="text-xs text-gray-500 mt-1">
              {realTime.cacheHitRate > 70
                ? 'Excellent'
                : realTime.cacheHitRate > 50
                  ? 'Good'
                  : 'Needs Improvement'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(realTime.aiResponseTime)}ms
            </div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
            <div className="text-xs text-gray-500 mt-1">
              {realTime.aiResponseTime < 300
                ? 'Excellent'
                : realTime.aiResponseTime < 500
                  ? 'Good'
                  : 'Slow'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(100 - realTime.errorRate).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
            <div className="text-xs text-gray-500 mt-1">
              {realTime.errorRate < 0.1
                ? 'Excellent'
                : realTime.errorRate < 1
                  ? 'Good'
                  : 'Concerning'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
