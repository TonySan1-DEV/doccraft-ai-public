// MCP Context Block
/*
{
  file: "performanceMonitor.ts",
  role: "backend-developer",
  allowedActions: ["service", "monitoring", "performance", "metrics"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "performance_monitoring"
}
*/

/**
 * Orchestration Metrics Interface
 * Performance metrics for writing task orchestration
 */
export interface OrchestrationMetrics {
  taskType: string;
  executionTime: number;
  cacheHit: boolean;
  qualityScore: number;
  agentsUsed: number;
  modulesCoordinated: number;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

/**
 * Cache Performance Metrics Interface
 * Cache-specific performance metrics
 */
export interface CachePerformanceMetrics {
  operation: string;
  module: string;
  duration: number;
  cacheHit: boolean;
  success: boolean;
  requestSize: number;
  responseSize: number;
  userId?: string;
  timestamp: number;
}

/**
 * Error Metrics Interface
 * Error tracking and analysis
 */
export interface ErrorMetrics {
  service: string;
  errorMessage: string;
  context: Record<string, any>;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  sessionId?: string;
}

/**
 * System Health Interface
 * Overall system health and performance status
 */
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  performanceMetrics: {
    averageResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
    throughput: number;
  };
  resourceUsage: {
    memory: number;
    cpu: number;
    cacheSize: number;
    activeConnections: number;
  };
  lastUpdated: number;
  recommendations: string[];
}

/**
 * Performance Report Interface
 * Comprehensive performance analysis report
 */
export interface PerformanceReport {
  summary: {
    totalRequests: number;
    totalErrors: number;
    averageResponseTime: number;
    cacheHitRate: number;
    systemHealth: SystemHealth['status'];
  };
  trends: {
    responseTime: number[];
    cacheHitRate: number[];
    errorRate: number[];
    throughput: number[];
    timestamps: number[];
  };
  topIssues: Array<{
    issue: string;
    count: number;
    impact: 'low' | 'medium' | 'high';
    recommendation: string;
  }>;
  recommendations: string[];
  generatedAt: number;
}

/**
 * Performance Monitor Class
 * Comprehensive performance tracking and analysis system
 */
export class PerformanceMonitor {
  private orchestrationMetrics: OrchestrationMetrics[] = [];
  private cacheMetrics: CachePerformanceMetrics[] = [];
  private errorMetrics: ErrorMetrics[] = [];
  private systemHealth: SystemHealth;
  private maxMetricsHistory: number = 10000; // Keep last 10k metrics
  private healthUpdateInterval: NodeJS.Timeout | null = null;
  private performanceThresholds = {
    responseTime: {
      warning: 1000, // 1 second
      critical: 5000, // 5 seconds
    },
    errorRate: {
      warning: 0.05, // 5%
      critical: 0.15, // 15%
    },
    cacheHitRate: {
      warning: 0.6, // 60%
      critical: 0.4, // 40%
    },
  };

  constructor() {
    this.systemHealth = this.initializeSystemHealth();
    this.startHealthMonitoring();
  }

  /**
   * Initialize system health
   */
  private initializeSystemHealth(): SystemHealth {
    return {
      status: 'healthy',
      performanceMetrics: {
        averageResponseTime: 0,
        cacheHitRate: 0,
        errorRate: 0,
        throughput: 0,
      },
      resourceUsage: {
        memory: 0,
        cpu: 0,
        cacheSize: 0,
        activeConnections: 0,
      },
      lastUpdated: Date.now(),
      recommendations: [],
    };
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthUpdateInterval = setInterval(() => {
      this.updateSystemHealth();
    }, 30000); // Update every 30 seconds
  }

  /**
   * Record orchestration metrics
   */
  recordOrchestrationMetrics(
    metrics: Omit<OrchestrationMetrics, 'timestamp'>
  ): void {
    const fullMetrics: OrchestrationMetrics = {
      ...metrics,
      timestamp: Date.now(),
    };

    this.orchestrationMetrics.push(fullMetrics);
    this.trimMetricsHistory(this.orchestrationMetrics);
    this.updateSystemHealth();
  }

  /**
   * Record cache performance metrics
   */
  recordCachePerformance(
    metrics: Omit<CachePerformanceMetrics, 'timestamp'>
  ): void {
    const fullMetrics: CachePerformanceMetrics = {
      ...metrics,
      timestamp: Date.now(),
    };

    this.cacheMetrics.push(fullMetrics);
    this.trimMetricsHistory(this.cacheMetrics);
    this.updateSystemHealth();
  }

  /**
   * Record cache hit
   */
  recordCacheHit(module: string, operation: string): void {
    this.recordCachePerformance({
      operation,
      module,
      duration: 0, // Cache hits are instant
      cacheHit: true,
      success: true,
      requestSize: 0,
      responseSize: 0,
    });
  }

  /**
   * Record error
   */
  recordError(
    service: string,
    errorMessage: string,
    context: Record<string, any>
  ): void {
    const errorMetrics: ErrorMetrics = {
      service,
      errorMessage,
      context,
      timestamp: Date.now(),
      severity: this.calculateErrorSeverity(errorMessage, context),
      userId: context.userId,
      sessionId: context.sessionId,
    };

    this.errorMetrics.push(errorMetrics);
    this.trimMetricsHistory(this.errorMetrics);
    this.updateSystemHealth();
  }

  /**
   * Calculate error severity based on context
   */
  private calculateErrorSeverity(
    errorMessage: string,
    context: Record<string, any>
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Critical errors
    if (
      errorMessage.includes('fatal') ||
      errorMessage.includes('crash') ||
      errorMessage.includes('timeout')
    ) {
      return 'critical';
    }

    // High severity errors
    if (
      errorMessage.includes('failed') ||
      errorMessage.includes('error') ||
      context.taskId
    ) {
      return 'high';
    }

    // Medium severity errors
    if (errorMessage.includes('warning') || errorMessage.includes('retry')) {
      return 'medium';
    }

    // Default to low severity
    return 'low';
  }

  /**
   * Update system health based on current metrics
   */
  private updateSystemHealth(): void {
    const now = Date.now();
    const recentMetrics = this.getRecentMetrics(300000); // Last 5 minutes

    // Calculate performance metrics
    const avgResponseTime = this.calculateAverageResponseTime(recentMetrics);
    const cacheHitRate = this.calculateCacheHitRate(recentMetrics);
    const errorRate = this.calculateErrorRate(recentMetrics);
    const throughput = this.calculateThroughput(recentMetrics);

    // Calculate resource usage
    const memoryUsage = this.estimateMemoryUsage();
    const cpuUsage = this.estimateCPUUsage();
    const cacheSize = this.estimateCacheSize();
    const activeConnections = this.estimateActiveConnections();

    // Determine system status
    const status = this.determineSystemStatus(
      avgResponseTime,
      errorRate,
      cacheHitRate
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      avgResponseTime,
      errorRate,
      cacheHitRate,
      memoryUsage,
      cpuUsage
    );

    this.systemHealth = {
      status,
      performanceMetrics: {
        averageResponseTime: avgResponseTime,
        cacheHitRate,
        errorRate,
        throughput,
      },
      resourceUsage: {
        memory: memoryUsage,
        cpu: cpuUsage,
        cacheSize,
        activeConnections,
      },
      lastUpdated: now,
      recommendations,
    };
  }

  /**
   * Get recent metrics within specified time window
   */
  private getRecentMetrics(timeWindow: number): {
    orchestration: OrchestrationMetrics[];
    cache: CachePerformanceMetrics[];
    errors: ErrorMetrics[];
  } {
    const cutoff = Date.now() - timeWindow;

    return {
      orchestration: this.orchestrationMetrics.filter(
        m => m.timestamp >= cutoff
      ),
      cache: this.cacheMetrics.filter(m => m.timestamp >= cutoff),
      errors: this.errorMetrics.filter(m => m.timestamp >= cutoff),
    };
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(recentMetrics: any): number {
    const allMetrics = [
      ...recentMetrics.orchestration,
      ...recentMetrics.cache,
    ].filter(m => m.executionTime > 0);

    if (allMetrics.length === 0) return 0;

    const totalTime = allMetrics.reduce(
      (sum: number, m: any) => sum + m.executionTime,
      0
    );
    return totalTime / allMetrics.length;
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(recentMetrics: any): number {
    const cacheMetrics = recentMetrics.cache.filter(
      (m: any) => m.cacheHit !== undefined
    );

    if (cacheMetrics.length === 0) return 0;

    const hits = cacheMetrics.filter((m: any) => m.cacheHit).length;
    return hits / cacheMetrics.length;
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(recentMetrics: any): number {
    const totalRequests =
      recentMetrics.orchestration.length + recentMetrics.cache.length;

    if (totalRequests === 0) return 0;

    const totalErrors = recentMetrics.errors.length;
    return totalErrors / totalRequests;
  }

  /**
   * Calculate throughput (requests per second)
   */
  private calculateThroughput(recentMetrics: any): number {
    const totalRequests =
      recentMetrics.orchestration.length + recentMetrics.cache.length;
    const timeWindow = 300; // 5 minutes in seconds
    return totalRequests / timeWindow;
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    // Estimate based on metrics history size
    const totalMetrics =
      this.orchestrationMetrics.length +
      this.cacheMetrics.length +
      this.errorMetrics.length;
    return Math.min(totalMetrics * 0.1, 100); // Max 100% for display
  }

  /**
   * Estimate CPU usage
   */
  private estimateCPUUsage(): number {
    // Estimate based on recent activity
    const recentMetrics = this.getRecentMetrics(60000); // Last minute
    const activityLevel =
      recentMetrics.orchestration.length + recentMetrics.cache.length;
    return Math.min(activityLevel * 2, 100); // Max 100% for display
  }

  /**
   * Estimate cache size
   */
  private estimateCacheSize(): number {
    // Estimate based on cache metrics
    const uniqueModules = new Set(this.cacheMetrics.map(m => m.module)).size;
    return Math.min(uniqueModules * 10, 100); // Max 100% for display
  }

  /**
   * Estimate active connections
   */
  private estimateActiveConnections(): number {
    // Estimate based on recent activity
    const recentMetrics = this.getRecentMetrics(30000); // Last 30 seconds
    return recentMetrics.orchestration.length + recentMetrics.cache.length;
  }

  /**
   * Determine system status based on metrics
   */
  private determineSystemStatus(
    responseTime: number,
    errorRate: number,
    cacheHitRate: number
  ): 'healthy' | 'degraded' | 'unhealthy' {
    const {
      responseTime: rtThresholds,
      errorRate: erThresholds,
      cacheHitRate: chrThresholds,
    } = this.performanceThresholds;

    // Check for critical conditions
    if (
      responseTime > rtThresholds.critical ||
      errorRate > erThresholds.critical ||
      cacheHitRate < chrThresholds.critical
    ) {
      return 'unhealthy';
    }

    // Check for degraded conditions
    if (
      responseTime > rtThresholds.warning ||
      errorRate > erThresholds.warning ||
      cacheHitRate < chrThresholds.warning
    ) {
      return 'degraded';
    }

    return 'healthy';
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    responseTime: number,
    errorRate: number,
    cacheHitRate: number,
    memoryUsage: number,
    cpuUsage: number
  ): string[] {
    const recommendations: string[] = [];

    // Response time recommendations
    if (responseTime > this.performanceThresholds.responseTime.warning) {
      recommendations.push(
        'Consider optimizing AI model selection or reducing request complexity'
      );
    }

    // Error rate recommendations
    if (errorRate > this.performanceThresholds.errorRate.warning) {
      recommendations.push(
        'Review error logs and implement retry mechanisms for failed operations'
      );
    }

    // Cache hit rate recommendations
    if (cacheHitRate < this.performanceThresholds.cacheHitRate.warning) {
      recommendations.push(
        'Optimize cache invalidation strategy and increase cache warming'
      );
    }

    // Resource usage recommendations
    if (memoryUsage > 80) {
      recommendations.push(
        'Consider reducing cache size or implementing more aggressive cleanup'
      );
    }

    if (cpuUsage > 80) {
      recommendations.push(
        'Optimize task parallelization and reduce computational complexity'
      );
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push(
        'System performance is optimal. Continue monitoring for trends.'
      );
    }

    return recommendations;
  }

  /**
   * Trim metrics history to prevent memory bloat
   */
  private trimMetricsHistory<T>(metrics: T[]): void {
    if (metrics.length > this.maxMetricsHistory) {
      const excess = metrics.length - this.maxMetricsHistory;
      metrics.splice(0, excess);
    }
  }

  /**
   * Get current system health
   */
  getSystemHealth(): SystemHealth {
    return { ...this.systemHealth };
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): PerformanceReport {
    const now = Date.now();
    const recentMetrics = this.getRecentMetrics(3600000); // Last hour

    // Calculate trends (last 10 data points)
    const trendData = this.calculateTrends(recentMetrics);

    // Identify top issues
    const topIssues = this.identifyTopIssues(recentMetrics);

    // Generate recommendations
    const recommendations = this.generateReportRecommendations(
      trendData,
      topIssues
    );

    return {
      summary: {
        totalRequests:
          recentMetrics.orchestration.length + recentMetrics.cache.length,
        totalErrors: recentMetrics.errors.length,
        averageResponseTime: this.calculateAverageResponseTime(recentMetrics),
        cacheHitRate: this.calculateCacheHitRate(recentMetrics),
        systemHealth: this.systemHealth.status,
      },
      trends: trendData,
      topIssues,
      recommendations,
      generatedAt: now,
    };
  }

  /**
   * Calculate performance trends
   */
  private calculateTrends(recentMetrics: any): PerformanceReport['trends'] {
    const timeSlots = 10;
    const timeWindow = 3600000; // 1 hour
    const slotDuration = timeWindow / timeSlots;

    const responseTime: number[] = [];
    const cacheHitRate: number[] = [];
    const errorRate: number[] = [];
    const throughput: number[] = [];
    const timestamps: number[] = [];

    for (let i = 0; i < timeSlots; i++) {
      const slotStart = Date.now() - timeWindow + i * slotDuration;
      const slotEnd = slotStart + slotDuration;

      const slotMetrics = {
        orchestration: recentMetrics.orchestration.filter(
          (m: any) => m.timestamp >= slotStart && m.timestamp < slotEnd
        ),
        cache: recentMetrics.cache.filter(
          (m: any) => m.timestamp >= slotStart && m.timestamp < slotEnd
        ),
        errors: recentMetrics.errors.filter(
          (m: any) => m.timestamp >= slotStart && m.timestamp < slotEnd
        ),
      };

      responseTime.push(this.calculateAverageResponseTime(slotMetrics));
      cacheHitRate.push(this.calculateCacheHitRate(slotMetrics));
      errorRate.push(this.calculateErrorRate(slotMetrics));
      throughput.push(this.calculateThroughput(slotMetrics));
      timestamps.push(slotStart);
    }

    return { responseTime, cacheHitRate, errorRate, throughput, timestamps };
  }

  /**
   * Identify top performance issues
   */
  private identifyTopIssues(
    recentMetrics: any
  ): PerformanceReport['topIssues'] {
    const issues: Map<
      string,
      { count: number; impact: 'low' | 'medium' | 'high' }
    > = new Map();

    // Analyze orchestration issues
    recentMetrics.orchestration.forEach((m: any) => {
      if (m.executionTime > this.performanceThresholds.responseTime.warning) {
        const key = 'High Response Time';
        const current = issues.get(key) || {
          count: 0,
          impact: 'high' as const,
        };
        issues.set(key, { count: current.count + 1, impact: 'high' });
      }
    });

    // Analyze cache issues
    recentMetrics.cache.forEach((m: any) => {
      if (!m.cacheHit) {
        const key = 'Cache Miss';
        const current = issues.get(key) || {
          count: 0,
          impact: 'medium' as const,
        };
        issues.set(key, { count: current.count + 1, impact: 'medium' });
      }
    });

    // Analyze errors
    recentMetrics.errors.forEach((m: any) => {
      const key = `Error: ${m.service}`;
      const current = issues.get(key) || { count: 0, impact: m.severity };
      issues.set(key, { count: current.count + 1, impact: m.severity });
    });

    // Convert to array and sort by count
    return Array.from(issues.entries())
      .map(([issue, data]) => ({
        issue,
        count: data.count,
        impact: data.impact,
        recommendation: this.getIssueRecommendation(issue),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 issues
  }

  /**
   * Get recommendation for specific issue
   */
  private getIssueRecommendation(issue: string): string {
    switch (issue) {
      case 'High Response Time':
        return 'Optimize AI model selection and implement request batching';
      case 'Cache Miss':
        return 'Improve cache warming strategy and adjust TTL settings';
      case 'Error: writing_orchestration':
        return 'Review orchestration logic and implement better error handling';
      case 'Error: ai_cache':
        return 'Check cache storage and implement fallback mechanisms';
      default:
        return 'Monitor and analyze error patterns for root cause';
    }
  }

  /**
   * Generate report recommendations
   */
  private generateReportRecommendations(
    trends: PerformanceReport['trends'],
    topIssues: PerformanceReport['topIssues']
  ): string[] {
    const recommendations: string[] = [];

    // Trend-based recommendations
    const responseTimeTrend = this.calculateTrendDirection(trends.responseTime);
    if (responseTimeTrend === 'increasing') {
      recommendations.push(
        'Response time is trending upward. Consider performance optimization.'
      );
    }

    const cacheHitTrend = this.calculateTrendDirection(trends.cacheHitRate);
    if (cacheHitTrend === 'decreasing') {
      recommendations.push(
        'Cache hit rate is declining. Review caching strategy.'
      );
    }

    // Issue-based recommendations
    if (topIssues.some(issue => issue.impact === 'high')) {
      recommendations.push(
        'Address high-impact issues immediately to maintain system stability.'
      );
    }

    if (topIssues.length > 3) {
      recommendations.push(
        'Multiple performance issues detected. Consider comprehensive system review.'
      );
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push(
        'Performance is stable. Continue monitoring for trends.'
      );
    }

    return recommendations;
  }

  /**
   * Calculate trend direction
   */
  private calculateTrendDirection(
    values: number[]
  ): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const change = secondAvg - firstAvg;
    const threshold = firstAvg * 0.1; // 10% threshold

    if (change > threshold) return 'increasing';
    if (change < -threshold) return 'decreasing';
    return 'stable';
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.healthUpdateInterval) {
      clearInterval(this.healthUpdateInterval);
      this.healthUpdateInterval = null;
    }
  }
}
