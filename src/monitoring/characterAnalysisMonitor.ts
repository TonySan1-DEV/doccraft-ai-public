/**
 * Character Analysis Monitor
 * Browser-compatible monitoring system for tracking character analysis performance,
 * quality metrics, and system health.
 */

import {
  AnalysisMetrics,
  PromptQualityMetrics,
  PsychologicalProfile,
} from '../types/psychologicalAnalysis';

// ============================================================================
// MONITORING INTERFACES
// ============================================================================

export interface CharacterAnalysisMetrics {
  totalAnalyses: number;
  averageExecutionTime: number;
  averageQualityScore: number;
  averageConfidence: number;
  successRate: number;
  errorRate: number;
  frameworkUsage: Record<string, number>;
  complexityDistribution: Record<string, number>;
  userSatisfaction: number;
  lastUpdated: Date;
}

export interface PerformanceSnapshot {
  timestamp: Date;
  activeAnalyses: number;
  queueLength: number;
  averageResponseTime: number;
  errorCount: number;
  successCount: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface QualityTrend {
  period: 'hour' | 'day' | 'week' | 'month';
  data: {
    timestamp: Date;
    qualityScore: number;
    confidence: number;
    userSatisfaction: number;
  }[];
  trend: 'improving' | 'declining' | 'stable';
  changeRate: number;
}

// ============================================================================
// BROWSER-COMPATIBLE EVENT EMITTER
// ============================================================================

class BrowserEventEmitter {
  private events: Record<string, Function[]> = {};

  on(event: string, listener: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  emit(event: string, ...args: any[]): void {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(...args));
    }
  }

  off(event: string, listener: Function): void {
    if (this.events[event]) {
      const index = this.events[event].indexOf(listener);
      if (index > -1) {
        this.events[event].splice(index, 1);
      }
    }
  }
}

// ============================================================================
// CHARACTER ANALYSIS MONITOR
// ============================================================================

export class CharacterAnalysisMonitor extends BrowserEventEmitter {
  private metrics: CharacterAnalysisMetrics;
  private performanceHistory: PerformanceSnapshot[] = [];
  private qualityHistory: QualityTrend['data'] = [];
  private activeAnalyses: Set<string> = new Set();
  private analysisQueue: string[] = [];
  private startTime: Date;

  constructor() {
    super();
    this.startTime = new Date();
    this.metrics = this.initializeMetrics();
    this.startPeriodicMonitoring();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private initializeMetrics(): CharacterAnalysisMetrics {
    return {
      totalAnalyses: 0,
      averageExecutionTime: 0,
      averageQualityScore: 0,
      averageConfidence: 0,
      successRate: 100,
      errorRate: 0,
      frameworkUsage: {},
      complexityDistribution: {},
      userSatisfaction: 0,
      lastUpdated: new Date(),
    };
  }

  // ============================================================================
  // ANALYSIS TRACKING
  // ============================================================================

  startAnalysis(
    analysisId: string,
    frameworks: string[],
    complexity: string
  ): void {
    this.activeAnalyses.add(analysisId);
    this.analysisQueue.push(analysisId);

    // Update framework usage
    frameworks.forEach(framework => {
      this.metrics.frameworkUsage[framework] =
        (this.metrics.frameworkUsage[framework] || 0) + 1;
    });

    // Update complexity distribution
    this.metrics.complexityDistribution[complexity] =
      (this.metrics.complexityDistribution[complexity] || 0) + 1;

    this.emit('analysisStarted', { analysisId, frameworks, complexity });
    this.updateMetrics();
  }

  completeAnalysis(
    analysisId: string,
    metrics: AnalysisMetrics,
    profile: PsychologicalProfile
  ): void {
    this.activeAnalyses.delete(analysisId);
    const queueIndex = this.analysisQueue.indexOf(analysisId);
    if (queueIndex > -1) {
      this.analysisQueue.splice(queueIndex, 1);
    }

    // Update metrics
    this.metrics.totalAnalyses++;
    this.updateAverageMetrics(metrics);
    this.updateSuccessRate(true);

    // Record performance snapshot
    this.recordPerformanceSnapshot();

    // Update quality history
    this.updateQualityHistory(metrics);

    this.emit('analysisCompleted', { analysisId, metrics, profile });
    this.updateMetrics();
  }

  failAnalysis(analysisId: string, error: string): void {
    this.activeAnalyses.delete(analysisId);
    const queueIndex = this.analysisQueue.indexOf(analysisId);
    if (queueIndex > -1) {
      this.analysisQueue.splice(queueIndex, 1);
    }

    this.updateSuccessRate(false);
    this.emit('analysisFailed', { analysisId, error });
    this.updateMetrics();
  }

  // ============================================================================
  // METRICS CALCULATION
  // ============================================================================

  private updateAverageMetrics(metrics: AnalysisMetrics): void {
    const currentTotal =
      this.metrics.averageExecutionTime * (this.metrics.totalAnalyses - 1);
    this.metrics.averageExecutionTime =
      (currentTotal + metrics.executionTime) / this.metrics.totalAnalyses;

    const currentQualityTotal =
      this.metrics.averageQualityScore * (this.metrics.totalAnalyses - 1);
    this.metrics.averageQualityScore =
      (currentQualityTotal + metrics.qualityScore) / this.metrics.totalAnalyses;

    const currentConfidenceTotal =
      this.metrics.averageConfidence * (this.metrics.totalAnalyses - 1);
    this.metrics.averageConfidence =
      (currentConfidenceTotal + metrics.confidence) /
      this.metrics.totalAnalyses;
  }

  private updateSuccessRate(success: boolean): void {
    const totalAttempts = this.metrics.totalAnalyses;

    if (totalAttempts === 0) {
      // Handle the case where this is the first analysis
      if (success) {
        this.metrics.successRate = 100;
        this.metrics.errorRate = 0;
      } else {
        this.metrics.successRate = 0;
        this.metrics.errorRate = 100;
      }
      return;
    }

    const currentSuccesses = Math.round(
      (this.metrics.successRate / 100) * totalAttempts
    );

    if (success) {
      this.metrics.successRate = ((currentSuccesses + 1) / totalAttempts) * 100;
    } else {
      this.metrics.successRate = (currentSuccesses / totalAttempts) * 100;
    }

    this.metrics.errorRate = 100 - this.metrics.successRate;
  }

  private updateQualityHistory(metrics: AnalysisMetrics): void {
    const qualityData = {
      timestamp: new Date(),
      qualityScore: metrics.qualityScore,
      confidence: metrics.confidence,
      userSatisfaction: metrics.userSatisfaction || 0,
    };

    this.qualityHistory.push(qualityData);

    // Keep only last 100 entries for memory management
    if (this.qualityHistory.length > 100) {
      this.qualityHistory.shift();
    }
  }

  // ============================================================================
  // PERFORMANCE MONITORING
  // ============================================================================

  private recordPerformanceSnapshot(): void {
    const snapshot: PerformanceSnapshot = {
      timestamp: new Date(),
      activeAnalyses: this.activeAnalyses.size,
      queueLength: this.analysisQueue.length,
      averageResponseTime: this.metrics.averageExecutionTime,
      errorCount: Math.round(
        (this.metrics.errorRate / 100) * this.metrics.totalAnalyses
      ),
      successCount: Math.round(
        (this.metrics.successRate / 100) * this.metrics.totalAnalyses
      ),
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: this.getCpuUsage(),
    };

    this.performanceHistory.push(snapshot);

    // Keep only last 50 snapshots
    if (this.performanceHistory.length > 50) {
      this.performanceHistory.shift();
    }
  }

  private getMemoryUsage(): number | undefined {
    // Browser-compatible memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory
        ? Math.round(memory.usedJSHeapSize / 1024 / 1024)
        : undefined;
    }
    return undefined;
  }

  private getCpuUsage(): number | undefined {
    // Browser-compatible CPU usage estimation
    if ('getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0] as PerformanceNavigationTiming;
        const loadTime = nav.loadEventEnd - nav.loadEventStart;
        return loadTime > 0 ? Math.round((loadTime / 1000) * 100) : undefined;
      }
    }
    return undefined;
  }

  // ============================================================================
  // PERIODIC MONITORING
  // ============================================================================

  private startPeriodicMonitoring(): void {
    // Update metrics every 30 seconds
    setInterval(() => {
      this.updateMetrics();
      this.emit('metricsUpdated', this.metrics);
    }, 30000);

    // Record performance snapshot every minute
    setInterval(() => {
      this.recordPerformanceSnapshot();
    }, 60000);

    // Clean up old data every 5 minutes
    setInterval(() => {
      this.cleanupOldData();
    }, 300000);
  }

  private cleanupOldData(): void {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Clean up performance history older than 1 hour
    this.performanceHistory = this.performanceHistory.filter(
      snapshot => snapshot.timestamp > oneHourAgo
    );

    // Clean up quality history older than 1 hour
    this.qualityHistory = this.qualityHistory.filter(
      data => data.timestamp > oneHourAgo
    );
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  getMetrics(): CharacterAnalysisMetrics {
    return { ...this.metrics };
  }

  getPerformanceHistory(): PerformanceSnapshot[] {
    return [...this.performanceHistory];
  }

  getQualityTrend(period: 'hour' | 'day' | 'week' | 'month'): QualityTrend {
    const now = new Date();
    let cutoffTime: Date;

    switch (period) {
      case 'hour':
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const periodData = this.qualityHistory.filter(
      data => data.timestamp > cutoffTime
    );

    if (periodData.length < 2) {
      return {
        period,
        data: periodData,
        trend: 'stable',
        changeRate: 0,
      };
    }

    const firstScore = periodData[0].qualityScore;
    const lastScore = periodData[periodData.length - 1].qualityScore;
    const changeRate = ((lastScore - firstScore) / firstScore) * 100;

    let trend: 'improving' | 'declining' | 'stable';
    if (changeRate > 5) trend = 'improving';
    else if (changeRate < -5) trend = 'declining';
    else trend = 'stable';

    return {
      period,
      data: periodData,
      trend,
      changeRate: Math.round(changeRate * 100) / 100,
    };
  }

  getSystemHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check error rate
    if (this.metrics.errorRate > 20) {
      issues.push(`High error rate: ${this.metrics.errorRate.toFixed(1)}%`);
      recommendations.push(
        'Review recent analysis failures and improve error handling'
      );
    }

    // Check response time
    if (this.metrics.averageExecutionTime > 10000) {
      issues.push(
        `Slow response time: ${this.metrics.averageExecutionTime.toFixed(0)}ms`
      );
      recommendations.push('Optimize analysis algorithms and consider caching');
    }

    // Check queue length
    if (this.analysisQueue.length > 10) {
      issues.push(`Long analysis queue: ${this.analysisQueue.length} items`);
      recommendations.push(
        'Scale up processing capacity or implement priority queuing'
      );
    }

    // Check quality scores
    if (this.metrics.averageQualityScore < 70) {
      issues.push(
        `Low quality scores: ${this.metrics.averageQualityScore.toFixed(1)}/100`
      );
      recommendations.push('Review and improve analysis algorithms');
    }

    let status: 'healthy' | 'warning' | 'critical';
    if (issues.length === 0) {
      status = 'healthy';
    } else if (issues.length <= 2) {
      status = 'warning';
    } else {
      status = 'critical';
    }

    return { status, issues, recommendations };
  }

  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
    this.performanceHistory = [];
    this.qualityHistory = [];
    this.activeAnalyses.clear();
    this.analysisQueue = [];
    this.startTime = new Date();
    this.emit('metricsReset');
  }

  private updateMetrics(): void {
    this.metrics.lastUpdated = new Date();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const characterAnalysisMonitor = new CharacterAnalysisMonitor();
