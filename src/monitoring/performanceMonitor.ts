// Enhanced Performance Monitor for DocCraft-AI
// Integrated with security system and real-time monitoring

// Browser-compatible EventEmitter implementation
class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, listener: Function): this {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  off(event: string, listener: Function): this {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(...args));
      return true;
    }
    return false;
  }
}
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

// Export types that are referenced in index.ts
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

// Simple alert service interface
interface AlertService {
  triggerAlert(
    type: string,
    severity: string,
    message: string,
    data: any
  ): Promise<void>;
}

import { DashboardUpdater } from './dashboardUpdater';

export class PerformanceMonitor extends EventEmitter {
  private metrics: Map<string, MetricTimeSeries> = new Map();
  private realTimeStreams: Map<string, RealtimeStream> = new Map();
  private alertThresholds: AlertThresholds;
  private dashboardUpdater: DashboardUpdater;
  private supabase: SupabaseClient;
  private alertService: AlertService;
  private updateInterval: number | null = null;
  private alertRules: Map<string, AlertRule> = new Map();
  private cacheHits: Map<string, number> = new Map();
  private cacheMisses: Map<string, number> = new Map();
  private requestLatencies: number[] = [];
  private memoryUsage: number[] = [];
  private activeSubscriptions: number = 0;
  private batchEfficiency: number = 0;

  constructor(supabase: SupabaseClient, alertService: AlertService) {
    super();
    this.supabase = supabase;
    this.alertService = alertService;
    this.alertThresholds = this.loadAlertThresholds();
    this.dashboardUpdater = new DashboardUpdater();
    this.startMetricCollection();
  }

  // Event emitter methods that components expect
  public on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  public off(event: string, listener: (...args: any[]) => void): this {
    return super.off(event, listener);
  }

  public emit(event: string, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  // Add missing methods that other files are calling
  public recordErrorMetrics(error: Error | any, context: any): void {
    const errorData = {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      context,
      timestamp: new Date(),
      severity: context?.severity || 'medium',
    };

    this.storeMetric('error_metrics', errorData);
    this.checkAlertThresholds('error_metrics', errorData);
    this.broadcastRealtimeUpdate('error_metrics', errorData);
    this.emit('error', errorData);
  }

  public recordError(module: string, errorMessage: string, context: any): void {
    this.recordErrorMetrics(new Error(errorMessage), { module, ...context });
  }

  public recordCacheHit(module: string, operation: string): void {
    const key = `${module}:${operation}`;
    this.cacheHits.set(key, (this.cacheHits.get(key) || 0) + 1);

    const data = { module, operation, hit: true, timestamp: new Date() };
    this.storeMetric('cache_performance', data);
    this.emit('cache_hit', data);
  }

  public recordCacheMiss(module: string, operation: string): void {
    const key = `${module}:${operation}`;
    this.cacheMisses.set(key, (this.cacheMisses.get(key) || 0) + 1);

    const data = { module, operation, hit: false, timestamp: new Date() };
    this.storeMetric('cache_performance', data);
    this.emit('cache_miss', data);
  }

  public recordLatency(latency: number): void {
    this.requestLatencies.push(latency);
    if (this.requestLatencies.length > 1000) {
      this.requestLatencies = this.requestLatencies.slice(-1000);
    }

    const data = { latency, timestamp: new Date() };
    this.storeMetric('request_latency', data);
    this.emit('latency', data);
  }

  public recordRequest(
    duration: number,
    cacheHit: boolean,
    userMode: string
  ): void {
    const data = { duration, cacheHit, userMode, timestamp: new Date() };
    this.storeMetric('request_performance', data);
    this.emit('request', data);
  }

  public updateMemoryUsage(usage: number): void {
    this.memoryUsage.push(usage);
    if (this.memoryUsage.length > 100) {
      this.memoryUsage = this.memoryUsage.slice(-100);
    }

    const data = { usage, timestamp: new Date() };
    this.storeMetric('memory_usage', data);
    this.emit('memory_update', data);
  }

  public updateActiveSubscriptions(count: number): void {
    this.activeSubscriptions = count;
    const data = { count, timestamp: new Date() };
    this.storeMetric('active_subscriptions', data);
    this.emit('subscription_update', data);
  }

  public updateBatchEfficiency(efficiency: number): void {
    this.batchEfficiency = efficiency;
    const data = { efficiency, timestamp: new Date() };
    this.storeMetric('batch_efficiency', data);
    this.emit('batch_efficiency_update', data);
  }

  public updateCacheHitRate(hitRate: number): void {
    const data = { hitRate, timestamp: new Date() };
    this.storeMetric('cache_hit_rate', data);
    this.emit('cache_hit_rate_update', data);
  }

  public recordOrchestrationMetrics(metrics: any): void {
    const data = { ...metrics, timestamp: new Date() };
    this.storeMetric('orchestration_performance', data);
    this.emit('orchestration_metrics', data);
  }

  public addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    this.emit('alert_rule_added', rule);
  }

  public removeAlertRule(ruleId: string): void {
    this.alertRules.delete(ruleId);
    this.emit('alert_rule_removed', ruleId);
  }

  public getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  public subscribeToMetrics(callback: (metrics: any) => void): () => void {
    this.on('metric', callback);
    return () => this.off('metric', callback);
  }

  public subscribeToAlerts(callback: (alert: any) => void): () => void {
    this.on('alert', callback);
    return () => this.off('alert', callback);
  }

  public getCurrentMetrics(): any {
    const currentMetrics: any = {};
    for (const [name, metric] of Array.from(this.metrics.entries())) {
      if (metric.data.length > 0) {
        currentMetrics[name] = metric.data[metric.data.length - 1];
      }
    }
    return currentMetrics;
  }

  public getMetrics(): any {
    return this.getCurrentMetrics();
  }

  public getInsights(): any {
    const insights: any = {};

    // Cache performance insights
    let totalHits = 0;
    let totalMisses = 0;
    for (const hits of Array.from(this.cacheHits.values())) totalHits += hits;
    for (const misses of Array.from(this.cacheMisses.values()))
      totalMisses += misses;

    insights.cacheHitRate =
      totalHits + totalMisses > 0 ? totalHits / (totalHits + totalMisses) : 0;
    insights.averageLatency =
      this.requestLatencies.length > 0
        ? this.requestLatencies.reduce((sum, lat) => sum + lat, 0) /
          this.requestLatencies.length
        : 0;
    insights.memoryTrend =
      this.memoryUsage.length > 1
        ? this.memoryUsage[this.memoryUsage.length - 1] - this.memoryUsage[0]
        : 0;
    insights.activeSubscriptions = this.activeSubscriptions;
    insights.batchEfficiency = this.batchEfficiency;

    return insights;
  }

  public getPerformanceReport(): any {
    return {
      metrics: this.getCurrentMetrics(),
      insights: this.getInsights(),
      alertRules: this.getAlertRules(),
      timestamp: new Date(),
    };
  }

  public getPerformanceData(timeframe: string): any {
    return this.getHistoricalMetrics(timeframe as '1h' | '24h' | '7d');
  }

  public reset(): void {
    this.metrics.clear();
    this.realTimeStreams.clear();
    this.cacheHits.clear();
    this.cacheMisses.clear();
    this.requestLatencies = [];
    this.memoryUsage = [];
    this.activeSubscriptions = 0;
    this.batchEfficiency = 0;
    this.emit('reset');
  }

  public sendToExternalMonitoring(metrics: any): Promise<void> {
    // Implementation for external monitoring systems
    return Promise.resolve();
  }

  // Fix the realtimeStreams vs realTimeStreams naming issue
  get realtimeStreams() {
    return this.realTimeStreams;
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

      // Store in database if supabase is available
      if (this.supabase && typeof this.supabase.from === 'function') {
        await this.supabase.from('performance_metrics').insert({
          metric_name: metricName,
          data: data,
          timestamp: data.timestamp.toISOString(),
        });
      } else {
        // Fallback: log to console if supabase is not available
        if (import.meta.env?.MODE !== 'production') {
          console.debug(`[monitor] Metric ${metricName}:`, data);
        }
      }
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
    // Use the global alert thresholds for all metrics
    const thresholds = this.alertThresholds;

    let shouldAlert = false;
    let alertMessage = '';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check response time thresholds
    if (
      typeof data.responseTime === 'number' &&
      data.responseTime > thresholds.responseTime
    ) {
      shouldAlert = true;
      alertMessage = `High response time detected: ${data.responseTime}ms`;
      severity =
        data.responseTime > thresholds.responseTime * 2 ? 'critical' : 'high';
    }

    // Check threat score thresholds
    if (
      typeof data.threatScore === 'number' &&
      data.threatScore > thresholds.threatScore
    ) {
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
    const stream = this.realTimeStreams.get(metricName);
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
        memoryUsage: this.getBrowserMemoryUsage(),
        cpuUsage: this.getBrowserCpuUsage(),
        uptime: this.getBrowserUptime(),
        timestamp: new Date(),
      };

      await this.storeMetric('system_metrics', systemMetrics);

      // Check system health
      await this.checkSystemHealth(systemMetrics);
    } catch (error) {
      console.error('Failed to collect system metrics:', error);
    }
  }

  // Browser-compatible system metrics methods
  private getBrowserMemoryUsage(): {
    heapUsed: number;
    heapTotal: number;
    external: number;
  } {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const mem = (performance as any).memory;
      return {
        heapUsed: mem.usedJSHeapSize || 0,
        heapTotal: mem.totalJSHeapSize || 0,
        external: mem.jsHeapSizeLimit || 0,
      };
    }
    // Fallback for browsers without performance.memory
    return {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
    };
  }

  private getBrowserCpuUsage(): { user: number; system: number } {
    // Browser doesn't have CPU usage, return placeholder
    return {
      user: 0,
      system: 0,
    };
  }

  private getBrowserUptime(): number {
    // Browser doesn't have uptime, return time since page load
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now() / 1000; // Convert to seconds
    }
    return 0;
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

  // Method for simplified performance recording (used by monitoring integration)
  async recordMetric(metricData: {
    name: string;
    value: number;
    unit?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const data = {
      ...metricData,
      timestamp: new Date(),
    };
    await this.storeMetric(metricData.name, data);
  }

  // Method for user experience metrics
  async recordUserExperience(data: {
    userId: string;
    sessionId: string;
    pageLoadTime: number;
    interactionResponseTime: number;
    satisfaction: number;
    errors: string[];
  }): Promise<void> {
    await this.recordUserExperienceMetrics(data.userId, data.sessionId, data);
  }

  // Method for business metrics
  async recordBusinessMetric(data: {
    name: string;
    value: number;
    category: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.recordMetric({
      name: `business_${data.name}`,
      value: data.value,
      unit: data.category,
      metadata: data.metadata,
    });
  }

  // Method for dashboard data
  async getDashboardData(): Promise<DashboardMetrics> {
    return this.getHistoricalMetrics('24h');
  }

  // Method for metrics summary
  async getMetricsSummary(
    metricName: string,
    timeRange: '1h' | '24h' | '7d'
  ): Promise<{
    current: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
    count: number;
  }> {
    const metrics = await this.getHistoricalMetrics(timeRange);
    const metric = metrics[metricName];

    if (!metric) {
      return {
        current: 0,
        average: 0,
        trend: 'stable',
        count: 0,
      };
    }

    const values = metric.history;
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;

    return {
      current: metric.current,
      average,
      trend: metric.trend,
      count: values.length,
    };
  }

  // Method for system health recording
  async recordSystemHealth(): Promise<void> {
    await this.collectSystemMetrics();
  }

  async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      const securityMetric = this.metrics.get('security_metrics');
      if (!securityMetric || securityMetric.data.length === 0) {
        return this.getDefaultSecurityMetrics();
      }

      const recentData = securityMetric.data.slice(-10); // Last 10 data points

      const avgThreatLevel =
        recentData.reduce(
          (sum, d) => sum + (Number(d.metadata?.threatLevel) || 0),
          0
        ) / recentData.length;
      const avgValidationAccuracy =
        recentData.reduce(
          (sum, d) => sum + (Number(d.metadata?.validationAccuracy) || 0),
          0
        ) / recentData.length;
      const avgResponseTime =
        recentData.reduce(
          (sum, d) => sum + (Number(d.metadata?.responseTime) || 0),
          0
        ) / recentData.length;
      const totalBlockedAttacks = recentData.reduce(
        (sum, d) => sum + (Number(d.metadata?.blockedAttacks) || 0),
        0
      );
      const totalFalsePositives = recentData.reduce(
        (sum, d) => sum + (Number(d.metadata?.falsePositives) || 0),
        0
      );
      const avgEncryptionCoverage =
        recentData.reduce(
          (sum, d) => sum + (Number(d.metadata?.encryptionCoverage) || 0),
          0
        ) / recentData.length;
      const avgComplianceScore =
        recentData.reduce(
          (sum, d) => sum + (Number(d.metadata?.complianceScore) || 0),
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

    for (const [metricName, metric] of Array.from(this.metrics.entries())) {
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

// Create and export a default instance
export const performanceMonitor = new PerformanceMonitor(
  {} as SupabaseClient, // Placeholder - should be injected properly
  {
    triggerAlert: async (
      type: string,
      severity: string,
      message: string,
      data: any
    ) => {},
  } as AlertService
);
