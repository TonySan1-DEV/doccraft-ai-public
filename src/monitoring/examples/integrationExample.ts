/**
 * Monitoring Integration Examples
 *
 * This file demonstrates how to integrate the enterprise monitoring system
 * with existing DocCraft-AI services and components.
 */

import {
  monitoringIntegration,
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

    // Initialize monitoring
    monitoringIntegration.initialize();
  }

  // Wrap existing methods with monitoring
  generateContent = wrapWithMonitoring(
    'aiService',
    'generateContent',
    this.originalService.generateContent.bind(this.originalService),
    { cacheKey: 'ai:generate:${prompt}' }
  );

  analyzeDocument = wrapWithMonitoring(
    'aiService',
    'analyzeDocument',
    this.originalService.analyzeDocument.bind(this.originalService),
    { cacheKey: 'ai:analyze:${documentId}' }
  );

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
      cooldown: 300000, // 5 minutes
    });

    // User engagement alerts
    performanceMonitor.addAlertRule({
      id: 'low_user_engagement',
      name: 'Low User Engagement',
      metric: 'user.engagement',
      threshold: 10,
      operator: 'lt',
      severity: 'medium',
      enabled: true,
      cooldown: 600000, // 10 minutes
    });

    // Cache performance alerts
    performanceMonitor.addAlertRule({
      id: 'cache_performance_degradation',
      name: 'Cache Performance Degradation',
      metric: 'ai.cache_hit_rate',
      threshold: 0.3, // 30%
      operator: 'lt',
      severity: 'critical',
      enabled: true,
      cooldown: 120000, // 2 minutes
    });
  }
}

// Example 4: React Component Integration
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
      sessionId: 'react_session',
      userId: 'current_user',
    });
  };

  const trackBusinessEvent = (
    metric: string,
    value: number,
    feature?: string
  ) => {
    trackBusinessMetric({
      metric,
      value,
      userId: 'current_user',
      tier: 'premium',
      feature,
    });
  };

  return {
    trackUserAction,
    trackBusinessEvent,
  };
};

// Example 5: Service Performance Monitoring
export class ServicePerformanceMonitor {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  // Monitor async operations
  async monitorAsyncOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    options?: { userId?: string; cacheKey?: string }
  ): Promise<T> {
    return wrapWithMonitoring(
      this.serviceName,
      operationName,
      operation,
      options
    )();
  }

  // Monitor sync operations
  monitorSyncOperation<T>(
    operationName: string,
    operation: () => T,
    options?: { userId?: string; cacheKey?: string }
  ): T {
    return wrapWithMonitoring(
      this.serviceName,
      operationName,
      operation,
      options
    )();
  }

  // Get service-specific metrics
  getServiceMetrics() {
    return performanceMonitor.getMetricsSummary(
      `${this.serviceName}.response_time`
    );
  }
}

// Example 6: Integration with Existing Services
export const integrateWithExistingServices = () => {
  // Example: Integrate with modeAwareAIService
  const originalService = {
    // Mock service methods
    async generateContent(prompt: string) {
      // Simulate AI content generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      return `Generated content for: ${prompt}`;
    },

    async analyzeDocument(document: string) {
      // Simulate document analysis
      await new Promise(resolve => setTimeout(resolve, 500));
      return `Analysis complete for document: ${document.substring(0, 50)}...`;
    },
  };

  // Create monitored version
  const monitoredService = new MonitoredAIService(originalService);

  // Use the monitored service
  const generateContent = async (prompt: string) => {
    const startTime = Date.now();

    try {
      const result = await monitoredService.generateContent(prompt);

      // Track business metric
      monitoredService.trackContentGeneration(
        'user123',
        'premium',
        'ai_writer'
      );

      return result;
    } catch (error) {
      // Error handling is automatic through monitoring
      throw error;
    }
  };

  return {
    generateContent,
    analyzeDocument: monitoredService.analyzeDocument,
  };
};

// Example 7: Dashboard Integration
export const getMonitoringDashboardData = () => {
  // Get real-time dashboard data
  const dashboardData = monitoringIntegration.getDashboardData();

  // Get specific metric summaries
  const aiPerformance = performanceMonitor.getMetricsSummary(
    'ai.response_time',
    3600000
  ); // Last hour
  const cachePerformance = performanceMonitor.getMetricsSummary(
    'ai.cache_hit_rate',
    3600000
  );

  return {
    dashboard: dashboardData,
    aiPerformance,
    cachePerformance,
  };
};

// Example 8: Error Monitoring Integration
export const setupErrorMonitoring = () => {
  // Listen for monitoring alerts
  performanceMonitor.on('alert', alert => {
    console.log('Alert triggered:', alert);

    // Send to external monitoring service
    // sendToSlack(alert);
    // sendToPagerDuty(alert);

    // Log critical alerts
    if (alert.rule.severity === 'critical') {
      console.error('CRITICAL ALERT:', alert);
    }
  });

  // Listen for metric updates
  performanceMonitor.on('metric', metric => {
    // Real-time metric processing
    if (metric.name === 'ai.response_time' && metric.value > 2000) {
      console.warn('Slow AI response detected:', metric);
    }
  });
};

// Example 9: Performance Testing Integration
export const runPerformanceTest = async () => {
  const testService = new ServicePerformanceMonitor('performanceTest');

  // Test multiple operations
  const results = await Promise.all([
    testService.monitorAsyncOperation('test_operation_1', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'Operation 1 complete';
    }),

    testService.monitorAsyncOperation('test_operation_2', async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return 'Operation 2 complete';
    }),

    testService.monitorAsyncOperation('test_operation_3', async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
      return 'Operation 3 complete';
    }),
  ]);

  // Get performance metrics
  const metrics = testService.getServiceMetrics();

  return {
    results,
    metrics,
    summary: {
      avgResponseTime: metrics.avg,
      maxResponseTime: metrics.max,
      totalOperations: metrics.count,
    },
  };
};

// Example 10: Production Deployment
export const deployMonitoring = () => {
  // Initialize monitoring system
  monitoringIntegration.initialize();

  // Setup custom alerts
  const alertManager = new CustomAlertManager();
  alertManager.setupCustomAlerts();

  // Setup error monitoring
  setupErrorMonitoring();

  // Start periodic health checks
  setInterval(() => {
    const health = performanceMonitor.getDashboardData().health;

    if (health.status === 'critical') {
      console.error('System health is CRITICAL:', health);
      // Trigger emergency procedures
    }
  }, 30000); // Check every 30 seconds

  console.log('Enterprise monitoring system deployed successfully');
};

// Export all examples
export default {
  MonitoredAIService,
  UserExperienceTracker,
  CustomAlertManager,
  useMonitoring,
  ServicePerformanceMonitor,
  integrateWithExistingServices,
  getMonitoringDashboardData,
  setupErrorMonitoring,
  runPerformanceTest,
  deployMonitoring,
};
