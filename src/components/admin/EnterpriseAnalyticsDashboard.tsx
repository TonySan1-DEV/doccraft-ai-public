// Enterprise Analytics Dashboard for DocCraft-AI
// Comprehensive real-time performance monitoring with business intelligence and predictive analytics

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Shield,
  Brain,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Minus as MinusIcon,
  RefreshCw,
  Settings,
  Download,
  Filter,
  Calendar,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  BusinessInsights,
  DashboardData,
  RealtimeMetrics,
  TimeFrame,
  ModulePerformanceReport,
  BusinessRecommendation,
  AlertData,
  PerformanceMetricCard,
  ModuleAnalysis,
  OptimizationOpportunity,
} from '../../types/analytics';

// Performance Metric Card Component
interface PerformanceMetricCardProps {
  title: string;
  value: number;
  target: number;
  unit: string;
  trend: any;
  critical?: boolean;
  drill?: () => void;
  icon?: React.ReactNode;
}

const PerformanceMetricCard: React.FC<PerformanceMetricCardProps> = ({
  title,
  value,
  target,
  unit,
  trend,
  critical = false,
  drill,
  icon,
}) => {
  const getTrendIcon = (trend: any) => {
    if (!trend) return <MinusIcon className="w-4 h-4 text-gray-400" />;

    const change = trend.changePercent || 0;
    if (change > 5) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (change < -5) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <MinusIcon className="w-4 h-4 text-gray-400" />;
  };

  const getStatusColor = () => {
    if (critical) return 'border-red-300 bg-red-50';
    if (value >= target * 0.9) return 'border-green-300 bg-green-50';
    if (value >= target * 0.7) return 'border-yellow-300 bg-yellow-50';
    return 'border-red-300 bg-red-50';
  };

  const getValueColor = () => {
    if (critical) return 'text-red-700';
    if (value >= target * 0.9) return 'text-green-700';
    if (value >= target * 0.7) return 'text-yellow-700';
    return 'text-red-700';
  };

  return (
    <div
      className={`rounded-lg border-2 p-6 ${getStatusColor()} transition-all duration-200 hover:shadow-lg cursor-pointer`}
      onClick={drill}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          {icon || <Activity className="w-5 h-5 text-gray-600" />}
        </div>
        {getTrendIcon(trend)}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`text-2xl font-bold ${getValueColor()}`}>
          {value.toLocaleString()}
          {unit}
        </div>
        <div className="text-xs text-gray-500">
          Target: {target.toLocaleString()}
          {unit}
        </div>

        {trend && (
          <div className="text-xs">
            <span
              className={
                trend.changePercent > 0 ? 'text-green-600' : 'text-red-600'
              }
            >
              {trend.changePercent > 0 ? '+' : ''}
              {trend.changePercent?.toFixed(1)}%
            </span>
            <span className="text-gray-500 ml-1">vs previous period</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Dashboard Header Component
interface DashboardHeaderProps {
  metrics: RealtimeMetrics;
  insights: BusinessInsights;
  timeframe: TimeFrame;
  onTimeframeChange: (timeframe: TimeFrame) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  metrics,
  insights,
  timeframe,
  onTimeframeChange,
}) => {
  const timeframes: { value: TimeFrame; label: string }[] = [
    { value: '1h', label: '1 Hour' },
    { value: '6h', label: '6 Hours' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Enterprise Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time performance monitoring and business intelligence
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={timeframe}
              onChange={e => onTimeframeChange(e.target.value as TimeFrame)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeframes.map(tf => (
                <option key={tf.value} value={tf.value}>
                  {tf.label}
                </option>
              ))}
            </select>
          </div>

          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>

          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <Settings className="w-4 h-4" />
          </button>

          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {metrics.activeUsers}
          </div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            ${insights.revenue?.total?.toLocaleString() || '0'}
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {insights.userMetrics?.totalUsers?.toLocaleString() || '0'}
          </div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {metrics.availability?.toFixed(1) || '99.9'}%
          </div>
          <div className="text-sm text-gray-600">Uptime</div>
        </div>
      </div>
    </div>
  );
};

// Business Intelligence Panel Component
interface BusinessIntelligencePanelProps {
  revenue: any;
  userMetrics: any;
  featureAdoption: any;
  competitive: any;
}

const BusinessIntelligencePanel: React.FC<BusinessIntelligencePanelProps> = ({
  revenue,
  userMetrics,
  featureAdoption,
  competitive,
}) => {
  const revenueData = [
    {
      name: 'AI Character Chat',
      value: revenue?.revenueByModule?.['AI Character Chat'] || 0,
    },
    {
      name: 'Plot Structure',
      value: revenue?.revenueByModule?.['Plot Structure'] || 0,
    },
    {
      name: 'Emotion Arc',
      value: revenue?.revenueByModule?.['Emotion Arc'] || 0,
    },
    {
      name: 'Style Profile',
      value: revenue?.revenueByModule?.['Style Profile'] || 0,
    },
    {
      name: 'Theme Analysis',
      value: revenue?.revenueByModule?.['Theme Analysis'] || 0,
    },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-blue-600" />
          Business Intelligence
        </h2>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View Details
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3">
            Revenue by Module
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <RechartsPieChart>
              <Pie
                data={revenueData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={value => [`$${value?.toLocaleString()}`, 'Revenue']}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Key Metrics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">MRR:</span>
                <span className="text-sm font-medium">
                  ${revenue?.mrr?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">LTV:</span>
                <span className="text-sm font-medium">
                  ${revenue?.ltv?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Growth:</span>
                <span className="text-sm font-medium">
                  {revenue?.growth?.toFixed(1) || '0'}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Market Position
            </h3>
            <div className="text-sm text-gray-600">
              <div className="mb-1">
                Position:{' '}
                <span className="font-medium">
                  {competitive?.marketPosition}
                </span>
              </div>
              <div className="mb-1">
                Market Share:{' '}
                <span className="font-medium">{competitive?.marketShare}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Module Performance Breakdown Component
interface ModulePerformanceBreakdownProps {
  moduleMetrics: ModulePerformanceReport;
  userSatisfaction: any;
  qualityScores: any;
}

const ModulePerformanceBreakdown: React.FC<ModulePerformanceBreakdownProps> = ({
  moduleMetrics,
  userSatisfaction,
  qualityScores,
}) => {
  const performanceData =
    moduleMetrics.moduleAnalysis?.map(module => ({
      name: module.moduleName,
      responseTime: module.performance.responseTime,
      qualityScore: module.performance.qualityScore,
      userSatisfaction: module.performance.userSatisfaction,
      errorRate: module.performance.errorRate * 100,
    })) || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
          Module Performance Breakdown
        </h2>
        <button className="text-green-600 hover:text-green-800 text-sm font-medium">
          View Details
        </button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={performanceData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="responseTime"
            fill="#8884d8"
            name="Response Time (ms)"
          />
          <Bar dataKey="qualityScore" fill="#82ca9d" name="Quality Score" />
          <Bar
            dataKey="userSatisfaction"
            fill="#ffc658"
            name="User Satisfaction"
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600">
            {moduleMetrics.overallPerformance?.grade || 'B'}
          </div>
          <div className="text-sm text-blue-600">Overall Grade</div>
        </div>

        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {moduleMetrics.overallPerformance?.score?.toFixed(1) || '85.0'}
          </div>
          <div className="text-sm text-green-600">Performance Score</div>
        </div>

        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-lg font-bold text-purple-600">
            {moduleMetrics.optimizationOpportunities?.length || 0}
          </div>
          <div className="text-sm text-purple-600">
            Optimization Opportunities
          </div>
        </div>
      </div>
    </div>
  );
};

// User Experience Analytics Component
interface UserExperienceAnalyticsProps {
  sessionData: any;
  conversionMetrics: any;
  retentionAnalysis: any;
}

const UserExperienceAnalytics: React.FC<UserExperienceAnalyticsProps> = ({
  sessionData,
  conversionMetrics,
  retentionAnalysis,
}) => {
  const sessionChartData = [
    { time: '00:00', sessions: 45 },
    { time: '04:00', sessions: 23 },
    { time: '08:00', sessions: 89 },
    { time: '12:00', sessions: 156 },
    { time: '16:00', sessions: 134 },
    { time: '20:00', sessions: 98 },
    { time: '23:59', sessions: 67 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-600" />
          User Experience Analytics
        </h2>
        <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
          View Details
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3">
            Session Distribution (24h)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sessionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="sessions"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Session Metrics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Sessions:</span>
                <span className="text-sm font-medium">
                  {sessionData?.totalSessions?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Duration:</span>
                <span className="text-sm font-medium">
                  {sessionData?.averageSessionDuration || '0'} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bounce Rate:</span>
                <span className="text-sm font-medium">
                  {sessionData?.bounceRate || '0'}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Conversion Metrics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Conversion Rate:</span>
                <span className="text-sm font-medium">
                  {conversionMetrics?.conversionRate || '0'}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Retention Rate:</span>
                <span className="text-sm font-medium">
                  {retentionAnalysis?.retentionRate || '0'}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Security and Threat Monitoring Component
interface SecurityAndThreatMonitoringProps {
  threatLevels: any;
  violationHistory: any[];
  protectionEffectiveness: any;
}

const SecurityAndThreatMonitoring: React.FC<
  SecurityAndThreatMonitoringProps
> = ({ threatLevels, violationHistory, protectionEffectiveness }) => {
  const securityData = [
    {
      name: 'Firewall',
      value: protectionEffectiveness?.firewallEffectiveness || 95,
    },
    {
      name: 'Intrusion Detection',
      value: protectionEffectiveness?.intrusionDetection || 88,
    },
    {
      name: 'Data Protection',
      value: protectionEffectiveness?.dataProtection || 92,
    },
    {
      name: 'Access Control',
      value: protectionEffectiveness?.accessControl || 96,
    },
    {
      name: 'Monitoring',
      value: protectionEffectiveness?.monitoringCoverage || 90,
    },
  ];

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-red-600" />
          Security & Threat Monitoring
        </h2>
        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
          View Details
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3">
            Protection Effectiveness
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={securityData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Effectiveness"
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Current Status
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Threat Level:</span>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded-full ${getThreatLevelColor(threatLevels?.threatLevel)}`}
                >
                  {threatLevels?.threatLevel || 'low'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Blocked Attacks:</span>
                <span className="text-sm font-medium">
                  {threatLevels?.blockedAttacks || '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Compliance Score:</span>
                <span className="text-sm font-medium">
                  {threatLevels?.complianceScore || '0'}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Recent Violations
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {violationHistory?.slice(0, 3).map((violation, index) => (
                <div
                  key={index}
                  className="text-xs p-2 bg-red-50 rounded border-l-2 border-red-400"
                >
                  <div className="font-medium">{violation.type}</div>
                  <div className="text-gray-600">{violation.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Predictive Analytics Panel Component
interface PredictiveAnalyticsPanelProps {
  predictions: any;
  recommendations: BusinessRecommendation[];
  optimization: any;
}

const PredictiveAnalyticsPanel: React.FC<PredictiveAnalyticsPanelProps> = ({
  predictions,
  recommendations,
  optimization,
}) => {
  const forecastData = [
    { period: 'Current', revenue: 125000 },
    {
      period: 'Next Month',
      revenue: predictions?.revenueForecast?.nextMonth || 135000,
    },
    {
      period: 'Next Quarter',
      revenue: predictions?.revenueForecast?.nextQuarter || 155000,
    },
    {
      period: 'Next Year',
      revenue: predictions?.revenueForecast?.nextYear || 250000,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
          Predictive Analytics & Recommendations
        </h2>
        <button className="text-yellow-600 hover:text-yellow-800 text-sm font-medium">
          View Details
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3">
            Revenue Forecast
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip
                formatter={value => [`$${value?.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Top Recommendations
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recommendations?.slice(0, 3).map((rec, index) => (
                <div
                  key={index}
                  className="p-3 bg-blue-50 rounded-lg border-l-2 border-blue-400"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-blue-800">
                      {rec.title}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        rec.priority === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : rec.priority === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : rec.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <div className="text-xs text-blue-600">{rec.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Impact: ${rec.impact.revenue?.toLocaleString()} | Effort:{' '}
                    {rec.effort}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Alert Management Panel Component
interface AlertManagementPanelProps {
  alerts: AlertData[];
  onResolveAlert: (alertId: string) => void;
  onCreateAlert: (alert: Partial<AlertData>) => void;
}

const AlertManagementPanel: React.FC<AlertManagementPanelProps> = ({
  alerts,
  onResolveAlert,
  onCreateAlert,
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-400 bg-red-50';
      case 'error':
        return 'border-orange-400 bg-orange-50';
      case 'warning':
        return 'border-yellow-400 bg-yellow-50';
      case 'info':
        return 'border-blue-400 bg-blue-50';
      default:
        return 'border-gray-400 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'error':
        return <MinusIcon className="w-4 h-4 text-orange-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <MinusIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
          Alert Management
        </h2>
        <button className="text-orange-600 hover:text-orange-800 text-sm font-medium">
          View All
        </button>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {alerts?.slice(0, 5).map(alert => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getSeverityIcon(alert.severity)}
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {alert.title}
                  </div>
                  <div className="text-xs text-gray-600">{alert.message}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
                {alert.status === 'active' && (
                  <button
                    onClick={() => onResolveAlert(alert.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {(!alerts || alerts.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p>No active alerts</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Dashboard Component
export const EnterpriseAnalyticsDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>(
    {} as DashboardData
  );
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealtimeMetrics>({
    avgResponseTime: 1800,
    coordinationTime: 4500,
    cacheHitRate: 87,
    securityScore: 94,
    activeUsers: 890,
    requestVolume: 1250,
    errorRate: 0.02,
    throughput: 1500,
    latency: 120,
    availability: 99.9,
  });
  const [businessInsights, setBusinessInsights] = useState<BusinessInsights>(
    {} as BusinessInsights
  );
  const [alertsData, setAlertsData] = useState<AlertData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [showRealTimeUpdates, setShowRealTimeUpdates] = useState(true);

  // Mock data for development
  useEffect(() => {
    const loadMockData = async () => {
      setIsLoading(true);

      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      setDashboardData({
        modulePerformance: {
          moduleAnalysis: [],
          crossModuleInsights: {} as any,
          optimizationOpportunities: [],
          overallPerformance: {
            score: 87.5,
            grade: 'B',
            breakdown: {
              performance: 85,
              reliability: 92,
              efficiency: 88,
              userExperience: 86,
              security: 95,
            },
            trend: 'improving',
          },
          recommendations: [],
        },
        userSatisfaction: {} as any,
        qualityMetrics: {} as any,
        responseTimeTrend: {
          current: 1800,
          previous: 2100,
          change: -300,
          changePercent: -14.3,
          direction: 'up',
          data: [],
        },
        coordinationTrend: {
          current: 4500,
          previous: 4800,
          change: -300,
          changePercent: -6.3,
          direction: 'up',
          data: [],
        },
        cacheHitTrend: {
          current: 87,
          previous: 84,
          change: 3,
          changePercent: 3.6,
          direction: 'up',
          data: [],
        },
        securityTrend: {
          current: 94,
          previous: 92,
          change: 2,
          changePercent: 2.2,
          direction: 'up',
          data: [],
        },
        sessionAnalytics: {} as any,
        conversionMetrics: {} as any,
        retentionMetrics: {} as any,
        securityMetrics: {} as any,
        securityViolations: [],
        protectionMetrics: {} as any,
      });

      setBusinessInsights({
        revenue: {
          totalRevenue: 125000,
          revenuePerUser: 100,
          conversionRate: 12.5,
          churnRate: 3.2,
          ltv: 312500,
          mrr: 10416.67,
          growth: 11.1,
          revenueByModule: {
            'AI Character Chat': 45000,
            'Plot Structure': 32000,
            'Emotion Arc': 28000,
            'Style Profile': 15000,
            'Theme Analysis': 5000,
          },
          revenueByUserSegment: {
            Premium: 75000,
            Professional: 35000,
            Basic: 15000,
          },
        },
        userMetrics: {
          totalUsers: 1250,
          activeUsers: 890,
          newUsers: 45,
          returningUsers: 845,
          userEngagement: 78.5,
          sessionDuration: 420,
          pagesPerSession: 4.2,
          userSegments: [],
          userBehavior: {} as any,
        },
        featureAdoption: {} as any,
        predictions: {} as any,
        recommendations: [
          {
            id: 'perf_opt_001',
            type: 'optimization',
            priority: 'high',
            title: 'Optimize AI Response Time',
            description:
              'Current response time exceeds target. Implement caching and optimization.',
            impact: { revenue: 15000, users: 500, performance: 0.8 },
            effort: 'medium',
            timeline: '3-4 weeks',
            status: 'pending',
          },
        ],
        competitive: {} as any,
        timestamp: new Date(),
      });

      setAlertsData([
        {
          id: 'alert_001',
          type: 'performance',
          severity: 'warning',
          title: 'High Response Time',
          message: 'AI response time is approaching threshold',
          timestamp: new Date(),
          module: 'AI Character Chat',
          status: 'active',
        },
      ]);

      setIsLoading(false);
    };

    loadMockData();
  }, []);

  // Real-time updates simulation
  useEffect(() => {
    if (!showRealTimeUpdates) return;

    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        ...prev,
        avgResponseTime: prev.avgResponseTime + (Math.random() - 0.5) * 100,
        activeUsers: prev.activeUsers + Math.floor((Math.random() - 0.5) * 10),
        requestVolume:
          prev.requestVolume + Math.floor((Math.random() - 0.5) * 20),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [showRealTimeUpdates]);

  const handleAlertResolution = useCallback((alertId: string) => {
    setAlertsData(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, status: 'resolved' as const } : alert
      )
    );
  }, []);

  const handleAlertCreation = useCallback((alert: Partial<AlertData>) => {
    const newAlert: AlertData = {
      id: `alert_${Date.now()}`,
      type: alert.type || 'info',
      severity: alert.severity || 'info',
      title: alert.title || 'New Alert',
      message: alert.message || '',
      timestamp: new Date(),
      module: alert.module || 'system',
      status: 'active',
    };
    setAlertsData(prev => [newAlert, ...prev]);
  }, []);

  const updatePerformanceWidgets = useCallback((metrics: RealtimeMetrics) => {
    // Update specific dashboard widgets based on real-time metrics
    console.log('Updating performance widgets:', metrics);
  }, []);

  const updateSecurityWidgets = useCallback((metrics: RealtimeMetrics) => {
    // Update security-related widgets
    console.log('Updating security widgets:', metrics);
  }, []);

  const updateUserExperienceWidgets = useCallback(
    (metrics: RealtimeMetrics) => {
      // Update user experience widgets
      console.log('Updating UX widgets:', metrics);
    },
    []
  );

  const loadDashboardData = useCallback(async (timeframe: TimeFrame) => {
    // Load dashboard data for the selected timeframe
    console.log('Loading dashboard data for timeframe:', timeframe);
  }, []);

  const showDetailedPerformanceView = useCallback((metric: string) => {
    console.log('Showing detailed view for metric:', metric);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading Enterprise Analytics Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="enterprise-analytics-dashboard p-6 bg-gray-50 min-h-screen">
      {/* Executive Summary Header */}
      <DashboardHeader
        metrics={realTimeMetrics}
        insights={businessInsights}
        timeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
      />

      {/* Real-time Performance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <PerformanceMetricCard
          title="AI Response Time"
          value={realTimeMetrics.avgResponseTime}
          target={3000}
          unit="ms"
          trend={dashboardData.responseTimeTrend}
          critical={realTimeMetrics.avgResponseTime > 5000}
          drill={() => showDetailedPerformanceView('response_time')}
          icon={<Zap className="w-5 h-5 text-blue-600" />}
        />

        <PerformanceMetricCard
          title="Module Coordination"
          value={realTimeMetrics.coordinationTime}
          target={5000}
          unit="ms"
          trend={dashboardData.coordinationTrend}
          icon={<Target className="w-5 h-5 text-green-600" />}
        />

        <PerformanceMetricCard
          title="Cache Hit Rate"
          value={realTimeMetrics.cacheHitRate}
          target={85}
          unit="%"
          trend={dashboardData.cacheHitTrend}
          icon={<BarChart3 className="w-5 h-5 text-purple-600" />}
        />

        <PerformanceMetricCard
          title="Security Score"
          value={realTimeMetrics.securityScore}
          target={95}
          unit="/100"
          trend={dashboardData.securityTrend}
          critical={realTimeMetrics.securityScore < 90}
          icon={<Shield className="w-5 h-5 text-red-600" />}
        />
      </div>

      {/* Advanced Analytics Sections */}
      <div className="space-y-6 mb-6">
        <BusinessIntelligencePanel
          revenue={businessInsights.revenue}
          userMetrics={businessInsights.userMetrics}
          featureAdoption={businessInsights.featureAdoption}
          competitive={businessInsights.competitive}
        />

        <ModulePerformanceBreakdown
          moduleMetrics={dashboardData.modulePerformance}
          userSatisfaction={dashboardData.userSatisfaction}
          qualityScores={dashboardData.qualityMetrics}
        />

        <UserExperienceAnalytics
          sessionData={dashboardData.sessionAnalytics}
          conversionMetrics={dashboardData.conversionMetrics}
          retentionAnalysis={dashboardData.retentionMetrics}
        />

        <SecurityAndThreatMonitoring
          threatLevels={dashboardData.securityMetrics}
          violationHistory={dashboardData.securityViolations}
          protectionEffectiveness={dashboardData.protectionMetrics}
        />
      </div>

      {/* Predictive Analytics */}
      <div className="mb-6">
        <PredictiveAnalyticsPanel
          predictions={businessInsights.predictions}
          recommendations={businessInsights.recommendations}
          optimization={{}}
        />
      </div>

      {/* Alert Management */}
      <div className="mb-6">
        <AlertManagementPanel
          alerts={alertsData}
          onResolveAlert={handleAlertResolution}
          onCreateAlert={handleAlertCreation}
        />
      </div>

      {/* Real-time Updates Toggle */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setShowRealTimeUpdates(!showRealTimeUpdates)}
          className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
            showRealTimeUpdates
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-500 hover:bg-gray-600 text-white'
          }`}
          title={
            showRealTimeUpdates
              ? 'Disable Real-time Updates'
              : 'Enable Real-time Updates'
          }
        >
          {showRealTimeUpdates ? (
            <Eye className="w-5 h-5" />
          ) : (
            <EyeOff className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default EnterpriseAnalyticsDashboard;
