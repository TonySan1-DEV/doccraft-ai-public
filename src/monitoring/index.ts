// Export all monitoring systems
export { performanceMonitor } from './performanceMonitor';
export { alertSystem } from './alertSystem';
export { characterAnalysisMonitor } from './characterAnalysisMonitor';

// Convenience functions
export {
  wrapWithMonitoring,
  trackUserExperience,
  trackBusinessMetric,
  getDashboardData,
  getMetricsSummary,
} from './monitoringIntegration';

// Types and interfaces
export type { PerformanceMetric, AlertRule } from './performanceMonitor';
export type { AlertChannel, AlertNotification } from './alertSystem';
