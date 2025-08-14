/**
 * Monitoring Integration Examples
 *
 * This file demonstrates how to integrate the enterprise monitoring system
 * with existing DocCraft-AI services and components.
 */

import {
  wrapWithMonitoring,
  trackUserExperience,
  trackBusinessMetric,
  performanceMonitor,
} from '../index';

// Example 1: Basic Monitoring Integration
export class MonitoredAIService {
  private originalService: any;

  constructor(originalService: any) {
    this.originalService = originalService;
  }

  // Wrap existing methods with monitoring
  generateContent = (prompt: string) => {
    return wrapWithMonitoring(
      'aiService',
      'generateContent',
      this.originalService.generateContent.bind(this.originalService),
      { cacheKey: `ai:generate:${prompt}` }
    )(prompt);
  };

  analyzeDocument = (documentId: string) => {
    return wrapWithMonitoring(
      'aiService',
      'analyzeDocument',
      this.originalService.analyzeDocument.bind(this.originalService),
      { cacheKey: `ai:analyze:${documentId}` }
    )(documentId);
  };

  // Track business metrics
  trackContentGeneration(userId: string, tier: string, contentType: string) {
    trackBusinessMetric({
      metric: 'content_generated',
      value: 1,
      userId,
      tier,
      feature: contentType,
    });
  }
}

// Example 2: User Experience Tracking
export class UserExperienceTracker {
  private sessionId: string;
  private userId?: string;

  constructor(sessionId: string, userId?: string) {
    this.sessionId = sessionId;
    this.userId = userId;
  }

  trackAction(
    action: string,
    duration: number,
    success: boolean,
    errorType?: string
  ) {
    trackUserExperience({
      action,
      duration,
      success,
      errorType,
      userId: this.userId,
      sessionId: this.sessionId,
    });
  }

  trackPageLoad(pageName: string, loadTime: number) {
    this.trackAction(`page_load_${pageName}`, loadTime, true);
  }

  trackFormSubmission(formName: string, duration: number, success: boolean) {
    this.trackAction(`form_submit_${formName}`, duration, success);
  }
}

// Example 3: Custom Alert Rules
export class CustomAlertManager {
  setupCustomAlerts() {
    // Business-specific alerts
    performanceMonitor.addAlertRule({
      id: 'high_content_generation',
      name: 'High Content Generation Rate',
      metric: 'business.content_generated',
      threshold: 100,
      operator: 'gt',
      severity: 'high',
      enabled: true,
    });

    // Performance alerts
    performanceMonitor.addAlertRule({
      id: 'slow_response_time',
      name: 'Slow Response Time',
      metric: 'performance.response_time',
      threshold: 5000,
      operator: 'gt',
      severity: 'medium',
      enabled: true,
    });

    // Error rate alerts
    performanceMonitor.addAlertRule({
      id: 'high_error_rate',
      name: 'High Error Rate',
      metric: 'errors.rate',
      threshold: 0.05,
      operator: 'gt',
      severity: 'critical',
      enabled: true,
    });
  }
}

// Example 4: Advanced Monitoring with Custom Metrics
export class AdvancedMonitoringService {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  async monitoredOperation<T>(operation: () => Promise<T>): Promise<T> {
    const wrappedOperation = wrapWithMonitoring(
      this.serviceName,
      'monitoredOperation',
      operation,
      { cacheKey: `${this.serviceName}:operation:${Date.now()}` }
    );
    return wrappedOperation();
  }

  async getPerformanceMetrics() {
    return performanceMonitor.getMetricsSummary(
      'performance.response_time',
      '1h'
    );
  }

  async getBusinessMetrics() {
    const metrics = await performanceMonitor.getMetricsSummary(
      'business.content_generated',
      '24h'
    );

    return {
      currentGeneration: metrics.current,
      averageGeneration: metrics.average,
      trend: metrics.trend,
      totalOperations: metrics.count,
    };
  }

  async getSystemHealth() {
    const health = await performanceMonitor.getDashboardData();
    return {
      overallHealth: health.health?.current || 0,
      cpuUsage: health.cpu?.current || 0,
      memoryUsage: health.memory?.current || 0,
      diskUsage: health.disk?.current || 0,
      networkLatency: health.network?.current || 0,
    };
  }
}

// Example 5: React Component Integration
export const useMonitoring = () => {
  const trackUserAction = (
    action: string,
    duration: number,
    success: boolean
  ) => {
    trackUserExperience({
      action,
      duration,
      success,
      sessionId: 'react-session',
    });
  };

  const trackBusinessMetricValue = (
    metric: string,
    value: number,
    userId: string,
    tier: string
  ) => {
    trackBusinessMetric({
      metric,
      value,
      userId,
      tier,
      feature: 'react_component',
    });
  };

  return {
    trackUserAction,
    trackBusinessMetric: trackBusinessMetricValue,
  };
};

// Example 6: Error Monitoring Integration
export const setupErrorMonitoring = () => {
  // Set up global error handling
  window.addEventListener('error', event => {
    performanceMonitor.recordError('browser', event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
  });

  // Set up unhandled promise rejection handling
  window.addEventListener('unhandledrejection', event => {
    performanceMonitor.recordError(
      'promise',
      event.reason?.message || 'Unhandled promise rejection',
      {
        reason: event.reason,
        promise: event.promise,
      }
    );
  });
};

// Example 7: Performance Testing Integration
export const runPerformanceTest = async () => {
  const testService = new AdvancedMonitoringService('performanceTest');

  // Test multiple operations
  const results = await Promise.all([
    testService.monitoredOperation(() => {
      return new Promise(resolve => setTimeout(resolve, 100));
    }),

    testService.monitoredOperation(() => {
      return new Promise(resolve => setTimeout(resolve, 200));
    }),

    testService.monitoredOperation(() => {
      return new Promise(resolve => setTimeout(resolve, 150));
    }),
  ]);

  // Get performance metrics
  const metrics = await testService.getPerformanceMetrics();

  return {
    results,
    metrics,
    summary: {
      totalOperations: results.length,
      averageResponseTime: metrics.average,
      trend: metrics.trend,
    },
  };
};
