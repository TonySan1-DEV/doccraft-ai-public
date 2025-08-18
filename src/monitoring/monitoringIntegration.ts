import { performanceMonitor } from './performanceMonitor';

/**
 * Monitoring Integration Service
 *
 * This service provides automatic instrumentation and monitoring integration
 * for existing DocCraft-AI services. It wraps service calls with performance
 * monitoring and automatically tracks metrics.
 */

export class MonitoringIntegration {
  private static instance: MonitoringIntegration;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): MonitoringIntegration {
    if (!MonitoringIntegration.instance) {
      MonitoringIntegration.instance = new MonitoringIntegration();
    }
    return MonitoringIntegration.instance;
  }

  /**
   * Initialize monitoring integration
   * Sets up automatic system health monitoring and periodic checks
   */
  initialize(): void {
    if (this.isInitialized) return;

    // Start system health monitoring
    this.startSystemHealthMonitoring();

    // Start periodic cleanup and maintenance
    this.startPeriodicMaintenance();

    // Set up global error handling
    this.setupGlobalErrorHandling();

    // Set up performance monitoring for common operations
    this.setupPerformanceMonitoring();

    this.isInitialized = true;
  }

  /**
   * Wrap a service function with performance monitoring
   * Automatically tracks execution time, success/failure, and other metrics
   */
  wrapWithMonitoring<T extends any[], R>(
    serviceName: string,
    operationName: string,
    fn: (...args: T) => Promise<R> | R,
    options?: {
      userId?: string;
      cacheKey?: string;
      additionalTags?: Record<string, string>;
    }
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      const startTime = Date.now();
      const cacheKey =
        options?.cacheKey ||
        `${serviceName}:${operationName}:${JSON.stringify(args)}`;

      try {
        // Check if we have a cached result
        const cachedResult = this.getCachedResult(cacheKey);
        if (cachedResult) {
          // Record cache hit
          performanceMonitor.recordAIPerformance(
            {
              type: operationName,
              module: serviceName,
              userId: options?.userId || 'anonymous',
              timestamp: new Date(),
              metadata: { cacheHit: true, serviceName, operationName },
            },
            {
              content: `Cached result for ${operationName}`,
              qualityScore: 1.0,
              userFeedback: { rating: 5 },
              metadata: { cacheHit: true, serviceName, operationName },
            },
            {
              responseTime: Date.now() - startTime,
              cacheHit: true,
              tokenUsage: 0,
              securityLevel: 'high',
              threatScore: 0,
              metadata: { cacheHit: true, serviceName, operationName },
            }
          );
          return cachedResult;
        }

        // Execute the actual function
        const result = await fn(...args);

        // Cache the result
        this.cacheResult(cacheKey, result);

        // Record successful execution
        performanceMonitor.recordAIPerformance(
          {
            type: operationName,
            module: serviceName,
            userId: options?.userId || 'anonymous',
            timestamp: new Date(),
            metadata: { cacheHit: false, serviceName, operationName },
          },
          {
            content: `Successful execution of ${operationName}`,
            qualityScore: 1.0,
            userFeedback: { rating: 5 },
            metadata: { cacheHit: false, serviceName, operationName },
          },
          {
            responseTime: Date.now() - startTime,
            cacheHit: false,
            tokenUsage: 0,
            securityLevel: 'high',
            threatScore: 0,
            metadata: { cacheHit: false, serviceName, operationName },
          }
        );

        return result;
      } catch (error) {
        // Record failed execution
        performanceMonitor.recordAIPerformance(
          {
            type: operationName,
            module: serviceName,
            userId: options?.userId || 'anonymous',
            timestamp: new Date(),
            metadata: {
              cacheHit: false,
              serviceName,
              operationName,
              error: true,
            },
          },
          {
            content: `Failed execution of ${operationName}`,
            qualityScore: 0.0,
            userFeedback: { rating: 1 },
            metadata: {
              cacheHit: false,
              serviceName,
              operationName,
              error: true,
            },
          },
          {
            responseTime: Date.now() - startTime,
            cacheHit: false,
            tokenUsage: 0,
            securityLevel: 'low',
            threatScore: 0.5,
            metadata: {
              cacheHit: false,
              serviceName,
              operationName,
              error: true,
            },
          }
        );

        // Record error metric
        performanceMonitor.recordMetric({
          name: 'service.error',
          value: 1,
          unit: 'count',
          metadata: {
            service: serviceName,
            operation: operationName,
            error_type: (error as Error).constructor.name,
            error_message:
              (error as Error).message?.substring(0, 100) || 'Unknown error',
          },
        });

        throw error;
      }
    };
  }

  /**
   * Track user experience metrics
   * Monitors user interactions and response times
   */
  trackUserExperience(data: {
    action: string;
    duration: number;
    success: boolean;
    errorType?: string;
    userId?: string;
    sessionId: string;
  }): void {
    performanceMonitor.recordUserExperience({
      userId: data.userId || 'anonymous',
      sessionId: data.sessionId,
      pageLoadTime: data.action === 'page_load' ? data.duration : 0,
      interactionResponseTime: data.action !== 'page_load' ? data.duration : 0,
      satisfaction: data.success ? 5 : 1,
      errors: data.success ? [] : [data.errorType || 'unknown'],
    });
  }

  /**
   * Track business metrics
   * Monitors business-related KPIs and user behavior
   */
  trackBusinessMetric(data: {
    metric: string;
    value: number;
    userId?: string;
    tier?: string;
    feature?: string;
  }): void {
    performanceMonitor.recordBusinessMetric({
      name: data.metric,
      value: data.value,
      category: data.tier || 'general',
      metadata: { userId: data.userId, feature: data.feature },
    });
  }

  /**
   * Get monitoring dashboard data
   * Returns real-time monitoring information for the dashboard
   */
  getDashboardData() {
    return performanceMonitor.getDashboardData();
  }

  /**
   * Get metrics summary for a specific metric
   * Returns statistical summary over a specified time range
   */
  getMetricsSummary(
    metricName: string,
    timeRange: '1h' | '24h' | '7d' = '24h'
  ) {
    return performanceMonitor.getMetricsSummary(metricName, timeRange);
  }

  /**
   * Start system health monitoring
   * Periodically records system health metrics
   */
  private startSystemHealthMonitoring(): void {
    // Record system health every 30 seconds
    setInterval(() => {
      performanceMonitor.recordSystemHealth();
    }, 30000);

    // Initial system health check
    performanceMonitor.recordSystemHealth();
  }

  /**
   * Start periodic maintenance tasks
   * Handles cleanup and maintenance operations
   */
  private startPeriodicMaintenance(): void {
    // Clean up old metrics every 5 minutes
    setInterval(() => {
      // This is handled by the performance monitor internally
    }, 300000);
  }

  /**
   * Set up global error handling
   * Catches unhandled errors and records them
   */
  private setupGlobalErrorHandling(): void {
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      performanceMonitor.recordMetric({
        name: 'system.unhandled_rejection',
        value: 1,
        unit: 'count',
        metadata: {
          reason: reason?.toString() || 'Unknown',
          promise_id: promise.toString(),
        },
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', error => {
      performanceMonitor.recordMetric({
        name: 'system.uncaught_exception',
        value: 1,
        unit: 'count',
        metadata: {
          error_type: error.constructor.name,
          error_message: error.message?.substring(0, 100) || 'Unknown error',
        },
      });
    });

    // Handle browser errors if in browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('error', event => {
        performanceMonitor.recordMetric({
          name: 'browser.error',
          value: 1,
          unit: 'count',
          metadata: {
            error_type: 'javascript_error',
            error_message: event.message?.substring(0, 100) || 'Unknown error',
            filename: event.filename || 'unknown',
            lineno: event.lineno?.toString() || 'unknown',
          },
        });
      });

      window.addEventListener('unhandledrejection', event => {
        performanceMonitor.recordMetric({
          name: 'browser.unhandled_rejection',
          value: 1,
          unit: 'count',
          metadata: {
            reason: event.reason?.toString()?.substring(0, 100) || 'Unknown',
          },
        });
      });
    }
  }

  /**
   * Set up performance monitoring for common operations
   * Automatically instruments common browser and system operations
   */
  private setupPerformanceMonitoring(): void {
    // Monitor page load performance
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          performanceMonitor.recordMetric({
            name: 'page.load_time',
            value: navigation.loadEventEnd - navigation.loadEventStart,
            unit: 'ms',
            metadata: { page: window.location.pathname },
          });

          performanceMonitor.recordMetric({
            name: 'page.dom_content_loaded',
            value:
              navigation.domContentLoadedEventEnd -
              navigation.domContentLoadedEventStart,
            unit: 'ms',
            metadata: { page: window.location.pathname },
          });
        }
      });

      // Monitor long tasks
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver(list => {
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) {
                // Long task threshold
                performanceMonitor.recordMetric({
                  name: 'performance.long_task',
                  value: entry.duration,
                  unit: 'ms',
                  metadata: {
                    task_name: entry.name || 'unknown',
                    start_time: entry.startTime.toString(),
                  },
                });
              }
            }
          });
          observer.observe({ entryTypes: ['longtask'] });
        } catch (e) {
          console.warn('Long task monitoring not supported:', e);
        }
      }
    }
  }

  /**
   * Simple in-memory cache for monitoring results
   * In production, this would use Redis or similar
   */
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private getCachedResult(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private cacheResult(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    // Clean up old cache entries
    if (this.cache.size > 1000) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  /**
   * Cleanup and destroy monitoring integration
   */
  destroy(): void {
    this.isInitialized = false;
    performanceMonitor.destroy();
    this.cache.clear();
  }
}

// Export singleton instance
export const monitoringIntegration = MonitoringIntegration.getInstance();

// Export convenience functions for easy integration
export const wrapWithMonitoring = monitoringIntegration.wrapWithMonitoring.bind(
  monitoringIntegration
);
export const trackUserExperience =
  monitoringIntegration.trackUserExperience.bind(monitoringIntegration);
export const trackBusinessMetric =
  monitoringIntegration.trackBusinessMetric.bind(monitoringIntegration);
export const getDashboardData = monitoringIntegration.getDashboardData.bind(
  monitoringIntegration
);
export const getMetricsSummary = monitoringIntegration.getMetricsSummary.bind(
  monitoringIntegration
);
