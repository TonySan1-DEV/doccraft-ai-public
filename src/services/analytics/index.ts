// Analytics Services Index for DocCraft-AI
// Central export point for all analytics and business intelligence services

export {
  BusinessIntelligenceEngine,
  businessIntelligence,
} from './businessIntelligence';

// Types
export type {
  TimeFrame,
  DashboardData,
  RealtimeMetrics,
  BusinessInsights,
  RevenueMetrics,
  UserMetrics,
  FeatureMetrics,
  PredictiveInsights,
  BusinessRecommendation,
  CompetitiveAnalysis,
  ModulePerformanceReport,
  ModuleAnalysis,
  CrossModuleInsights,
  OptimizationOpportunity,
  OverallPerformanceScore,
  ModuleRecommendation,
  UserSatisfactionMetrics,
  QualityMetrics,
  TrendData,
  SessionAnalytics,
  ConversionMetrics,
  RetentionMetrics,
  SecurityMetrics,
  SecurityViolation,
  ProtectionMetrics,
  AlertData,
  UserSegment,
  UserBehaviorMetrics,
  UsagePattern,
  TimeRange,
  ModuleInteraction,
  ModuleDependency,
  FeedbackAnalysis,
  QualityFactor,
  ConversionFunnelStep,
  ChurnAnalysis,
  ChurnPrediction,
  RevenueForecast,
  FeatureAdoptionPrediction,
  ScalingRecommendation,
  MarketTrend,
  SeasonalPattern,
  CompetitorBenchmark,
} from '../../types/analytics';

// Hooks
export {
  useAnalyticsServices,
  useBusinessIntelligence,
  usePerformanceMonitoring,
  useModulePerformance,
  useAnalyticsAlerts,
  useAnalyticsConfig,
} from '../../hooks/useAnalyticsServices';

// Components
export { default as EnterpriseAnalyticsDashboard } from '../../components/admin/EnterpriseAnalyticsDashboard';
export { EnterpriseAnalyticsDashboard as EnterpriseAnalyticsDashboardComponent } from '../../components/admin/EnterpriseAnalyticsDashboard';

// Constants
export const ANALYTICS_CONFIG = {
  DEFAULT_TIMEFRAME: '24h' as const,
  REFRESH_INTERVAL: 30000, // 30 seconds
  REAL_TIME_UPDATE_INTERVAL: 5000, // 5 seconds
  DATA_RETENTION_DAYS: 90,
  PERFORMANCE_TARGETS: {
    RESPONSE_TIME_MS: 3000,
    COORDINATION_TIME_MS: 5000,
    CACHE_HIT_RATE_PERCENT: 85,
    SECURITY_SCORE: 95,
    AVAILABILITY_PERCENT: 99.9,
  },
  ALERT_THRESHOLDS: {
    CRITICAL_RESPONSE_TIME_MS: 5000,
    WARNING_RESPONSE_TIME_MS: 4000,
    CRITICAL_ERROR_RATE: 0.1,
    WARNING_ERROR_RATE: 0.05,
    CRITICAL_SECURITY_SCORE: 80,
    WARNING_SECURITY_SCORE: 90,
  },
} as const;

// Utility functions
export const formatMetricValue = (value: number, unit: string): string => {
  if (unit === 'ms') {
    return `${value.toLocaleString()}ms`;
  }
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  }
  if (unit === '/100') {
    return `${value.toFixed(0)}/100`;
  }
  return `${value.toLocaleString()}${unit}`;
};

export const calculateTrendDirection = (
  current: number,
  previous: number
): 'up' | 'down' | 'stable' => {
  if (!previous || previous === 0) return 'stable';
  const change = ((current - previous) / previous) * 100;
  if (Math.abs(change) < 1) return 'stable';
  return change > 0 ? 'up' : 'down';
};

export const calculateTrendPercentage = (
  current: number,
  previous: number
): number => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const getPerformanceGrade = (
  score: number
): 'A' | 'B' | 'C' | 'D' | 'F' => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical':
      return 'text-red-600 bg-red-100';
    case 'error':
      return 'text-orange-600 bg-orange-100';
    case 'warning':
      return 'text-yellow-600 bg-yellow-100';
    case 'info':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Data processing utilities
export const aggregateMetricsByTimeframe = (
  data: Array<{ timestamp: Date; value: number }>,
  timeframe: TimeFrame
): Array<{ timestamp: Date; value: number }> => {
  if (!data || data.length === 0) return [];

  const sortedData = [...data].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );
  const now = new Date();
  const startTime = getTimeframeStart(now, timeframe);

  return sortedData.filter(item => item.timestamp >= startTime);
};

export const getTimeframeStart = (date: Date, timeframe: TimeFrame): Date => {
  const now = new Date(date);

  switch (timeframe) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000);
    case '6h':
      return new Date(now.getTime() - 6 * 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
};

export const calculateMovingAverage = (
  data: Array<{ timestamp: Date; value: number }>,
  windowSize: number = 5
): Array<{ timestamp: Date; value: number; movingAverage: number }> => {
  if (!data || data.length < windowSize) return [];

  return data.map((item, index) => {
    if (index < windowSize - 1) {
      return { ...item, movingAverage: item.value };
    }

    const window = data.slice(index - windowSize + 1, index + 1);
    const average = window.reduce((sum, d) => sum + d.value, 0) / windowSize;

    return {
      ...item,
      movingAverage: average,
    };
  });
};

// Export the analytics service as default
export default {
  BusinessIntelligenceEngine,
  businessIntelligence,
  ANALYTICS_CONFIG,
  formatMetricValue,
  calculateTrendDirection,
  calculateTrendPercentage,
  getPerformanceGrade,
  getSeverityColor,
  getPriorityColor,
  aggregateMetricsByTimeframe,
  getTimeframeStart,
  calculateMovingAverage,
};
