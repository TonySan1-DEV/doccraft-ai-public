// Enhanced Performance Monitor for DocCraft-AI
// Integrated with security system and real-time monitoring

import { SupabaseClient } from '@supabase/supabase-js';
import {
  AIOperation,
  AIResult,
  PerformanceMetrics,
  SecurityMetrics,
  AlertThresholds,
  MetricTimeSeries,
  RealtimeStream,
  DashboardMetrics,
  RealtimeData,
} from '../types/security';
// Simple alert service interface
interface AlertService {
  triggerAlert(
    type: string,
    severity: string,
    message: string,
    data: any
  ): Promise<void>;
}

export class PerformanceMonitor {
  private metrics: Map<string, MetricTimeSeries> = new Map();
  private realTimeStreams: Map<string, RealtimeStream> = new Map();
  private alertThresholds: AlertThresholds;
  private dashboardUpdater: DashboardUpdater;
  private supabase: SupabaseClient;
  private alertService: AlertService;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(supabase: SupabaseClient, alertService: AlertService) {
    this.supabase = supabase;
    this.alertService = alertService;
    this.alertThresholds = this.loadAlertThresholds();
    this.dashboardUpdater = new DashboardUpdater();
    this.startMetricCollection();
  }

  async recordAIPerformance(
    operation: AIOperation,
    result: AIResult,
    metrics: PerformanceMetrics
  ): Promise<void> {
    const performanceData = {
      operation: operation.type,
      module: operation.module,
      responseTime: metrics.responseTime,
      qualityScore: result.qualityScore,
      cacheHit: metrics.cacheHit,
      tokenUsage: metrics.tokenUsage,
      userSatisfaction: result.userFeedback?.rating,
      securityLevel: metrics.securityLevel,
      threatScore: metrics.threatScore,
      timestamp: new Date(),
    };

    await this.storeMetric('ai_performance', performanceData);
    await this.checkAlertThresholds('ai_performance', performanceData);
    this.broadcastRealtimeUpdate('ai_performance', performanceData);

    // Update dashboard in real-time
    await this.dashboardUpdater.updateMetrics(performanceData);
  }

  async recordSecurityMetrics(
    requestId: string,
    metrics: SecurityMetrics
  ): Promise<void> {
    const securityData = {
      requestId,
      threatLevel: metrics.threatLevel,
      validationAccuracy: metrics.validationAccuracy,
      responseTime: metrics.responseTime,
      blockedAttacks: metrics.blockedAttacks,
      falsePositives: metrics.falsePositives,
      encryptionCoverage: metrics.encryptionCoverage,
      complianceScore: metrics.complianceScore,
      timestamp: metrics.lastUpdated,
    };

    await this.storeMetric('security_metrics', securityData);
    await this.checkAlertThresholds('security_metrics', securityData);
    this.broadcastRealtimeUpdate('security_metrics', securityData);

    // Update security dashboard
    await this.dashboardUpdater.updateSecurityMetrics(securityData);
  }

  async recordModulePerformance(
    moduleName: string,
    operation: string,
    metrics: {
      responseTime: number;
      success: boolean;
      error?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> {
    const moduleData = {
      module: moduleName,
      operation,
      responseTime: metrics.responseTime,
      success: metrics.success,
      error: metrics.error,
      metadata: metrics.metadata,
      timestamp: new Date(),
    };

    await this.storeMetric('module_performance', moduleData);
    await this.checkAlertThresholds('module_performance', moduleData);
    this.broadcastRealtimeUpdate('module_performance', moduleData);
  }

  async recordUserExperienceMetrics(
    userId: string,
    sessionId: string,
    metrics: {
      pageLoadTime: number;
      interactionResponseTime: number;
      satisfaction: number;
      errors: string[];
    }
  ): Promise<void> {
    const uxData = {
      userId,
      sessionId,
      pageLoadTime: metrics.pageLoadTime,
      interactionResponseTime: metrics.interactionResponseTime,
      satisfaction: metrics.satisfaction,
      errors: metrics.errors,
      timestamp: new Date(),
    };

    await this.storeMetric('user_experience', uxData);
    await this.checkAlertThresholds('user_experience', uxData);
    this.broadcastRealtimeUpdate('user_experience', uxData);
  }

  private async storeMetric(metricName: string, data: any): Promise<void> {
    try {
      // Store in memory for real-time access
      if (!this.metrics.has(metricName)) {
        this.metrics.set(metricName, {
          metric: metricName,
          data: [],
          aggregation: 'avg',
        });
      }

      const metric = this.metrics.get(metricName)!;
      metric.data.push({
        timestamp: data.timestamp,
        value: this.extractMetricValue(data),
        metadata: data,
      });

      // Keep only last 1000 data points
      if (metric.data.length > 1000) {
        metric.data = metric.data.slice(-1000);
      }

      // Store in database
      await this.supabase.from('performance_metrics').insert({
        metric_name: metricName,
        data: data,
        timestamp: data.timestamp.toISOString(),
      });
    } catch (error) {
      console.error(`Failed to store metric ${metricName}:`, error);
    }
  }

  private extractMetricValue(data: any): number {
    // Extract the primary numeric value from the data
    if (typeof data.responseTime === 'number') return data.responseTime;
    if (typeof data.threatLevel === 'number') return data.threatLevel;
    if (typeof data.qualityScore === 'number') return data.qualityScore;
    if (typeof data.satisfaction === 'number') return data.satisfaction;
    if (typeof data.pageLoadTime === 'number') return data.pageLoadTime;

    return 0;
  }

  private async checkAlertThresholds(
    metricName: string,
    data: any
  ): Promise<void> {
    const thresholds =
      this.alertThresholds[metricName as keyof AlertThresholds];
    if (!thresholds) return;

    let shouldAlert = false;
    let alertMessage = '';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check response time thresholds
    if (data.responseTime && data.responseTime > thresholds.responseTime) {
      shouldAlert = true;
      alertMessage = `High response time detected: ${data.responseTime}ms`;
      severity =
        data.responseTime > thresholds.responseTime * 2 ? 'critical' : 'high';
    }

    // Check threat score thresholds
    if (data.threatScore && data.threatScore > thresholds.threatScore) {
      shouldAlert = true;
      alertMessage = `High threat score detected: ${data.threatScore}`;
      severity = data.threatScore > 0.9 ? 'critical' : 'high';
    }

    // Check error rate thresholds
    if (
      data.success === false &&
      this.calculateErrorRate(metricName) > thresholds.errorRate
    ) {
      shouldAlert = true;
      alertMessage = `High error rate detected for ${metricName}`;
      severity = 'high';
    }

    if (shouldAlert) {
      await this.alertService.triggerAlert(
        'performance',
        severity,
        alertMessage,
        data
      );
    }
  }

  private calculateErrorRate(metricName: string): number {
    const metric = this.metrics.get(metricName);
    if (!metric || metric.data.length === 0) return 0;

    const recentData = metric.data.slice(-100); // Last 100 data points
    const errors = recentData.filter(d => d.metadata?.success === false).length;

    return errors / recentData.length;
  }

  private broadcastRealtimeUpdate(metricName: string, data: any): void {
    const stream = this.realtimeStreams.get(metricName);
    if (stream) {
      stream.data.push(data);
      stream.lastUpdate = new Date();

      // Keep only last 100 updates
      if (stream.data.length > 100) {
        stream.data = stream.data.slice(-100);
      }

      // Notify subscribers
      this.notifySubscribers(metricName, data);
    }
  }

  private notifySubscribers(metricName: string, data: any): void {
    // This would integrate with WebSocket or Server-Sent Events
    // For now, just log the update
    console.log(`Real-time update for ${metricName}:`, data);
  }

  private startMetricCollection(): void {
    // Start periodic metric collection
    this.updateInterval = setInterval(async () => {
      await this.collectSystemMetrics();
    }, 30000); // Every 30 seconds
  }

  private async collectSystemMetrics(): Promise<void> {
    try {
      // Collect system-level metrics
      const systemMetrics = {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        uptime: process.uptime(),
        timestamp: new Date(),
      };

      await this.storeMetric('system_metrics', systemMetrics);

      // Check system health
      await this.checkSystemHealth(systemMetrics);
    } catch (error) {
      console.error('Failed to collect system metrics:', error);
    }
  }

  private async checkSystemHealth(metrics: any): Promise<void> {
    const memoryUsagePercent =
      (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100;

    if (memoryUsagePercent > 90) {
      await this.alertService.triggerAlert(
        'system',
        'critical',
        'High memory usage detected',
        {
          memoryUsage: memoryUsagePercent,
          ...metrics,
        }
      );
    }

    if (memoryUsagePercent > 80) {
      await this.alertService.triggerAlert(
        'system',
        'high',
        'Elevated memory usage detected',
        {
          memoryUsage: memoryUsagePercent,
          ...metrics,
        }
      );
    }
  }

  private loadAlertThresholds(): AlertThresholds {
    return {
      responseTime: 5000, // 5 seconds
      threatScore: 0.8, // 80% threat level
      errorRate: 0.1, // 10% error rate
      securityViolations: 5, // 5 violations per hour
      performanceDegradation: 0.3, // 30% performance drop
    };
  }

  // Public methods for external access
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      const securityMetric = this.metrics.get('security_metrics');
      if (!securityMetric || securityMetric.data.length === 0) {
        return this.getDefaultSecurityMetrics();
      }

      const recentData = securityMetric.data.slice(-10); // Last 10 data points

      const avgThreatLevel =
        recentData.reduce((sum, d) => sum + (d.metadata.threatLevel || 0), 0) /
        recentData.length;
      const avgValidationAccuracy =
        recentData.reduce(
          (sum, d) => sum + (d.metadata.validationAccuracy || 0),
          0
        ) / recentData.length;
      const avgResponseTime =
        recentData.reduce((sum, d) => sum + (d.metadata.responseTime || 0), 0) /
        recentData.length;
      const totalBlockedAttacks = recentData.reduce(
        (sum, d) => sum + (d.metadata.blockedAttacks || 0),
        0
      );
      const totalFalsePositives = recentData.reduce(
        (sum, d) => sum + (d.metadata.falsePositives || 0),
        0
      );
      const avgEncryptionCoverage =
        recentData.reduce(
          (sum, d) => sum + (d.metadata.encryptionCoverage || 0),
          0
        ) / recentData.length;
      const avgComplianceScore =
        recentData.reduce(
          (sum, d) => sum + (d.metadata.complianceScore || 0),
          0
        ) / recentData.length;

      return {
        threatLevel: avgThreatLevel,
        validationAccuracy: avgValidationAccuracy,
        responseTime: avgResponseTime,
        blockedAttacks: totalBlockedAttacks,
        falsePositives: totalFalsePositives,
        encryptionCoverage: avgEncryptionCoverage,
        complianceScore: avgComplianceScore,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      return this.getDefaultSecurityMetrics();
    }
  }

  private getDefaultSecurityMetrics(): SecurityMetrics {
    return {
      threatLevel: 0,
      validationAccuracy: 100,
      responseTime: 0,
      blockedAttacks: 0,
      falsePositives: 0,
      encryptionCoverage: 100,
      complianceScore: 100,
      lastUpdated: new Date(),
    };
  }

  async getHistoricalMetrics(
    duration: '1h' | '24h' | '7d'
  ): Promise<DashboardMetrics> {
    const now = Date.now();
    let cutoffTime: number;

    switch (duration) {
      case '1h':
        cutoffTime = now - 60 * 60 * 1000;
        break;
      case '24h':
        cutoffTime = now - 24 * 60 * 60 * 1000;
        break;
      case '7d':
        cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      default:
        cutoffTime = now - 24 * 60 * 60 * 1000;
    }

    const metrics: DashboardMetrics = {};

    for (const [metricName, metric] of this.metrics) {
      const recentData = metric.data.filter(
        d => d.timestamp.getTime() > cutoffTime
      );

      if (recentData.length > 0) {
        const current = recentData[recentData.length - 1].value;
        const history = recentData.map(d => d.value);
        const target = this.getTargetValue(metricName);
        const trend = this.calculateTrend(history);
        const critical = this.isCritical(metricName, current);

        metrics[metricName] = {
          current,
          trend,
          history,
          target,
          critical,
        };
      }
    }

    return metrics;
  }

  private getTargetValue(metricName: string): number {
    const targets: Record<string, number> = {
      ai_performance: 3000, // 3 seconds
      security_metrics: 95, // 95% security score
      module_performance: 2000, // 2 seconds
      user_experience: 4.5, // 4.5/5 satisfaction
      system_metrics: 80, // 80% system health
    };

    return targets[metricName] || 0;
  }

  private calculateTrend(history: number[]): 'up' | 'down' | 'stable' {
    if (history.length < 2) return 'stable';

    const recent = history.slice(-5);
    const older = history.slice(-10, -5);

    if (recent.length === 0 || older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (change > 10) return 'up';
    if (change < -10) return 'down';
    return 'stable';
  }

  private isCritical(metricName: string, value: number): boolean {
    const criticalThresholds: Record<string, number> = {
      ai_performance: 10000, // 10 seconds
      security_metrics: 70, // 70% security score
      module_performance: 8000, // 8 seconds
      user_experience: 3.0, // 3.0/5 satisfaction
      system_metrics: 50, // 50% system health
    };

    const threshold = criticalThresholds[metricName];
    if (!threshold) return false;

    // For metrics where lower is better (response time), check if value > threshold
    // For metrics where higher is better (scores), check if value < threshold
    const lowerIsBetter = [
      'ai_performance',
      'module_performance',
      'system_metrics',
    ];

    if (lowerIsBetter.includes(metricName)) {
      return value > threshold;
    } else {
      return value < threshold;
    }
  }

  subscribeToRealtimeUpdates(callback: (data: any) => void): () => void {
    // This would implement a subscription system
    // For now, return a no-op unsubscribe function
    return () => {};
  }

  // Cleanup method
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

// Dashboard Updater
class DashboardUpdater {
  async updateMetrics(performanceData: any): Promise<void> {
    // Update dashboard with new performance data
    // This would integrate with your dashboard system
    console.log('Dashboard updated with performance data:', performanceData);
  }

  async updateSecurityMetrics(securityData: any): Promise<void> {
    // Update security dashboard with new metrics
    // This would integrate with your security dashboard
    console.log('Security dashboard updated:', securityData);
  }
}
