import React, { useState, useEffect } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  Cpu,
  Settings,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { MonitoringDashboard } from './MonitoringDashboard';
import { AlertManagement } from './AlertManagement';
import { SystemHealth } from './SystemHealth';
import { monitoringIntegration } from '../../monitoring/monitoringIntegration';

type MonitoringView =
  | 'overview'
  | 'performance'
  | 'alerts'
  | 'system'
  | 'settings';

export const MainMonitoringDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<MonitoringView>('overview');
  const [isInitialized, setIsInitialized] = useState(false);
  const [quickStats, setQuickStats] = useState<any>(null);

  useEffect(() => {
    // Initialize monitoring integration
    monitoringIntegration.initialize();
    setIsInitialized(true);

    // Load quick stats
    const loadQuickStats = () => {
      const stats = monitoringIntegration.getDashboardData();
      setQuickStats(stats);
    };

    loadQuickStats();
    const interval = setInterval(loadQuickStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getViewIcon = (view: MonitoringView) => {
    switch (view) {
      case 'overview':
        return <BarChart3 className="h-5 w-5" />;
      case 'performance':
        return <TrendingUp className="h-5 w-5" />;
      case 'alerts':
        return <Bell className="h-5 w-5" />;
      case 'system':
        return <Cpu className="h-5 w-5" />;
      case 'settings':
        return <Settings className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getViewTitle = (view: MonitoringView) => {
    switch (view) {
      case 'overview':
        return 'Monitoring Overview';
      case 'performance':
        return 'Performance Metrics';
      case 'alerts':
        return 'Alert Management';
      case 'system':
        return 'System Health';
      case 'settings':
        return 'Monitoring Settings';
      default:
        return 'Monitoring Overview';
    }
  };

  const renderQuickStats = () => {
    if (!quickStats) return null;

    const { realTime, health } = quickStats;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-50 mr-3">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                AI Response Time
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(realTime.aiResponseTime)}ms
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-50 mr-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Cache Hit Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(realTime.cacheHitRate)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-50 mr-3">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {realTime.activeUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div
              className={`p-2 rounded-lg mr-3 ${
                health.status === 'healthy'
                  ? 'bg-green-50'
                  : health.status === 'warning'
                    ? 'bg-yellow-50'
                    : 'bg-red-50'
              }`}
            >
              <Activity
                className={`h-5 w-5 ${
                  health.status === 'healthy'
                    ? 'text-green-600'
                    : health.status === 'warning'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-gray-900">
                {health.score}/100
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            {renderQuickStats()}

            {/* System Status Summary */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  System Status Summary
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {quickStats?.realTime.requestsPerMinute || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      Requests per Minute
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {(100 - (quickStats?.realTime.errorRate || 0)).toFixed(1)}
                      %
                    </div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {Math.round(
                        (quickStats?.realTime.memoryUsage || 0) / (1024 * 1024)
                      )}
                      MB
                    </div>
                    <div className="text-sm text-gray-600">Memory Usage</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">
                        System health check completed
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">2 minutes ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">
                        Performance metrics updated
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">5 minutes ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">
                        Cache hit rate below threshold
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">8 minutes ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'performance':
        return <MonitoringDashboard />;
      case 'alerts':
        return <AlertManagement />;
      case 'system':
        return <SystemHealth />;
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Monitoring Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metrics Retention Period
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="1">1 hour</option>
                  <option value="6">6 hours</option>
                  <option value="24" selected>
                    24 hours
                  </option>
                  <option value="168">7 days</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Frequency
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="5">5 seconds</option>
                  <option value="10" selected>
                    10 seconds
                  </option>
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                </select>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 mr-2"
                    defaultChecked
                  />
                  <span className="text-sm text-gray-700">
                    Enable real-time alerts
                  </span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 mr-2"
                    defaultChecked
                  />
                  <span className="text-sm text-gray-700">
                    Auto-cleanup old metrics
                  </span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Send metrics to external monitoring
                  </span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Save Settings
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Initializing monitoring system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Enterprise Monitoring
              </h1>
              <p className="text-gray-600">
                DocCraft-AI System Monitoring & Observability
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          <nav className="mt-6">
            {(
              [
                'overview',
                'performance',
                'alerts',
                'system',
                'settings',
              ] as MonitoringView[]
            ).map(view => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`w-full flex items-center px-6 py-3 text-left text-sm font-medium transition-colors ${
                  activeView === view
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3">{getViewIcon(view)}</span>
                {getViewTitle(view)}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">{renderActiveView()}</div>
      </div>
    </div>
  );
};
