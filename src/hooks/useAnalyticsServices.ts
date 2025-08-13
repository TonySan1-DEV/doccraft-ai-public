// Analytics Services Hook for DocCraft-AI
// Provides access to business intelligence, performance monitoring, and real-time analytics

import { useState, useEffect, useCallback, useRef } from 'react';
import { BusinessIntelligenceEngine } from '../services/analytics/businessIntelligence';
import { performanceMonitor } from '../monitoring/performanceMonitor';
import {
  BusinessInsights,
  DashboardData,
  RealtimeMetrics,
  TimeFrame,
  ModulePerformanceReport,
  AlertData,
} from '../types/analytics';

export interface AnalyticsServices {
  businessIntelligence: BusinessIntelligenceEngine;
  performanceMonitor: typeof performanceMonitor;
}

export interface UseAnalyticsServicesReturn {
  businessIntelligence: BusinessIntelligenceEngine;
  performanceMonitor: typeof performanceMonitor;
  realTimeMetrics: RealtimeMetrics;
  businessInsights: BusinessInsights | null;
  modulePerformance: ModulePerformanceReport | null;
  isLoading: boolean;
  error: string | null;
  refreshData: (timeframe: TimeFrame) => Promise<void>;
  subscribeToRealtimeMetrics: (
    callback: (metrics: RealtimeMetrics) => void
  ) => () => void;
  subscribeToBusinessInsights: (
    callback: (insights: BusinessInsights) => void
  ) => () => void;
  subscribeToModulePerformance: (
    callback: (performance: ModulePerformanceReport) => void
  ) => () => void;
}

export const useAnalyticsServices = (): UseAnalyticsServicesReturn => {
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealtimeMetrics>({
    avgResponseTime: 0,
    coordinationTime: 0,
    cacheHitRate: 0,
    securityScore: 0,
    activeUsers: 0,
    requestVolume: 0,
    errorRate: 0,
    throughput: 0,
    latency: 0,
    availability: 0,
  });

  const [businessInsights, setBusinessInsights] =
    useState<BusinessInsights | null>(null);
  const [modulePerformance, setModulePerformance] =
    useState<ModulePerformanceReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs to store subscription callbacks
  const realtimeCallbacks = useRef<Set<(metrics: RealtimeMetrics) => void>>(
    new Set()
  );
  const businessInsightsCallbacks = useRef<
    Set<(insights: BusinessInsights) => void>
  >(new Set());
  const modulePerformanceCallbacks = useRef<
    Set<(performance: ModulePerformanceReport) => void>
  >(new Set());

  // Initialize services
  const businessIntelligence = new BusinessIntelligenceEngine(
    {} as any, // Supabase client will be injected
    performanceMonitor
  );

  // Subscribe to real-time metrics from performance monitor
  useEffect(() => {
    const handleMetricsUpdate = (metrics: RealtimeMetrics) => {
      setRealTimeMetrics(metrics);

      // Notify all subscribers
      realtimeCallbacks.current.forEach(callback => {
        try {
          callback(metrics);
        } catch (err) {
          console.error('Error in real-time metrics callback:', err);
        }
      });
    };

    // Subscribe to performance monitor updates
    const unsubscribe =
      performanceMonitor.subscribeToMetrics(handleMetricsUpdate);

    return unsubscribe;
  }, []);

  // Subscribe to business insights updates
  useEffect(() => {
    const handleInsightsUpdate = (insights: BusinessInsights) => {
      setBusinessInsights(insights);

      // Notify all subscribers
      businessInsightsCallbacks.current.forEach(callback => {
        try {
          callback(insights);
        } catch (err) {
          console.error('Error in business insights callback:', err);
        }
      });
    };

    // Subscribe to business intelligence updates
    const unsubscribe =
      businessIntelligence.subscribeToInsights(handleInsightsUpdate);

    return unsubscribe;
  }, [businessIntelligence]);

  // Refresh data for a specific timeframe
  const refreshData = useCallback(
    async (timeframe: TimeFrame) => {
      try {
        setIsLoading(true);
        setError(null);

        // Load business insights
        const insights =
          await businessIntelligence.generateBusinessInsights(timeframe);
        setBusinessInsights(insights);

        // Load module performance
        const performance =
          await businessIntelligence.getModulePerformanceReport(timeframe);
        setModulePerformance(performance);

        // Load real-time metrics
        const metrics = performanceMonitor.getCurrentMetrics();
        setRealTimeMetrics(metrics);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to refresh analytics data'
        );
        console.error('Error refreshing analytics data:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [businessIntelligence]
  );

  // Subscribe to real-time metrics updates
  const subscribeToRealtimeMetrics = useCallback(
    (callback: (metrics: RealtimeMetrics) => void) => {
      realtimeCallbacks.current.add(callback);

      // Return unsubscribe function
      return () => {
        realtimeCallbacks.current.delete(callback);
      };
    },
    []
  );

  // Subscribe to business insights updates
  const subscribeToBusinessInsights = useCallback(
    (callback: (insights: BusinessInsights) => void) => {
      businessInsightsCallbacks.current.add(callback);

      // Return unsubscribe function
      return () => {
        businessInsightsCallbacks.current.delete(callback);
      };
    },
    []
  );

  // Subscribe to module performance updates
  const subscribeToModulePerformance = useCallback(
    (callback: (performance: ModulePerformanceReport) => void) => {
      modulePerformanceCallbacks.current.add(callback);

      // Return unsubscribe function
      return () => {
        modulePerformanceCallbacks.current.delete(callback);
      };
    },
    []
  );

  // Load initial data
  useEffect(() => {
    refreshData('24h');
  }, [refreshData]);

  return {
    businessIntelligence,
    performanceMonitor,
    realTimeMetrics,
    businessInsights,
    modulePerformance,
    isLoading,
    error,
    refreshData,
    subscribeToRealtimeMetrics,
    subscribeToBusinessInsights,
    subscribeToModulePerformance,
  };
};

// Specialized hooks for specific analytics features
export const useBusinessIntelligence = () => {
  const { businessIntelligence, businessInsights, isLoading, error } =
    useAnalyticsServices();

  return {
    businessIntelligence,
    businessInsights,
    isLoading,
    error,
  };
};

export const usePerformanceMonitoring = () => {
  const { performanceMonitor, realTimeMetrics, isLoading, error } =
    useAnalyticsServices();

  return {
    performanceMonitor,
    realTimeMetrics,
    isLoading,
    error,
  };
};

export const useModulePerformance = () => {
  const { modulePerformance, isLoading, error } = useAnalyticsServices();

  return {
    modulePerformance,
    isLoading,
    error,
  };
};

// Hook for real-time alerts
export const useAnalyticsAlerts = () => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (isSubscribed) return;

    // Subscribe to performance monitor alerts
    const unsubscribe = performanceMonitor.subscribeToAlerts(
      (alert: AlertData) => {
        setAlerts(prev => [alert, ...prev]);
      }
    );

    setIsSubscribed(true);

    return () => {
      unsubscribe();
      setIsSubscribed(false);
    };
  }, [isSubscribed]);

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, status: 'resolved' as const } : alert
      )
    );
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? { ...alert, status: 'acknowledged' as const }
          : alert
      )
    );
  }, []);

  const clearResolvedAlerts = useCallback(() => {
    setAlerts(prev => prev.filter(alert => alert.status !== 'resolved'));
  }, []);

  return {
    alerts,
    resolveAlert,
    acknowledgeAlert,
    clearResolvedAlerts,
  };
};

// Hook for analytics configuration
export const useAnalyticsConfig = () => {
  const [config, setConfig] = useState({
    refreshInterval: 30000, // 30 seconds
    realTimeUpdates: true,
    dataRetention: '90d',
    alertThresholds: {
      responseTime: 5000,
      errorRate: 0.05,
      securityScore: 90,
    },
  });

  const updateConfig = useCallback((updates: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig({
      refreshInterval: 30000,
      realTimeUpdates: true,
      dataRetention: '90d',
      alertThresholds: {
        responseTime: 5000,
        errorRate: 0.05,
        securityScore: 90,
      },
    });
  }, []);

  return {
    config,
    updateConfig,
    resetConfig,
  };
};

export default useAnalyticsServices;
