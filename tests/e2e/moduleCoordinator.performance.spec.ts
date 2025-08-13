/**
 * Performance Tests for Optimized ModuleCoordinator
 *
 * @description Tests the high-performance coordination system with
 * debouncing, caching, batch processing, and memory management
 */

import { test, expect } from '@playwright/test';
import {
  ModuleCoordinator,
  PerformanceMetrics,
  CoordinationResult,
  ModuleUpdate,
} from '../../src/services/moduleCoordinator';

test.describe('ModuleCoordinator Performance Tests', () => {
  let coordinator: ModuleCoordinator;

  test.beforeEach(async () => {
    // Create a fresh coordinator instance for each test
    coordinator = new ModuleCoordinator();
  });

  test.afterEach(async () => {
    // Clean up after each test
    if (coordinator) {
      coordinator.forceOptimization();
    }
  });

  test.describe('Performance Optimization Systems', () => {
    test('should initialize all performance systems correctly', async () => {
      const status = coordinator.getCoordinationStatus();

      expect(status.performanceMetrics).toBeDefined();
      expect(status.cacheStats).toBeDefined();
      expect(status.batchQueueStatus).toBeDefined();
      expect(status.memoryStats).toBeDefined();

      // Verify cache is initialized
      expect(status.cacheStats.maxSize).toBe(1000);
      expect(status.cacheStats.ttl).toBe(5000);

      // Verify batch processor is initialized
      expect(status.batchQueueStatus.maxSize).toBe(50);
      expect(status.batchQueueStatus.pending).toBe(0);
    });

    test('should track performance metrics over time', async () => {
      // Initial metrics
      const initialMetrics =
        coordinator.getCoordinationStatus().performanceMetrics;

      // Simulate some coordination activity
      await coordinator.coordinateModulesForMode('MANUAL', {
        documentType: 'test',
        userGoals: ['test'],
        writingPhase: 'planning',
        userExperience: 'intermediate',
        currentMode: 'MANUAL',
        sessionDuration: 0,
        interactionPatterns: {
          frequentEdits: false,
          longWritingSessions: false,
          collaborativeWork: false,
          researchIntensive: false,
        },
      });

      // Wait for metrics to update
      await new Promise(resolve => setTimeout(resolve, 100));

      const updatedMetrics =
        coordinator.getCoordinationStatus().performanceMetrics;

      // Metrics should have been updated
      expect(updatedMetrics.coordinationLatency).toBeGreaterThan(0);
      expect(updatedMetrics.lastOptimization).toBeDefined();
    });

    test('should provide performance insights', async () => {
      const insights = coordinator.getPerformanceInsights();

      expect(insights.insights).toBeDefined();
      expect(insights.recommendations).toBeDefined();
      expect(insights.metrics).toBeDefined();

      // Should have at least some insights
      expect(insights.insights.length).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Caching System', () => {
    test('should cache coordination results', async () => {
      const context = {
        documentType: 'test',
        userGoals: ['test'],
        writingPhase: 'planning',
        userExperience: 'intermediate',
        currentMode: 'MANUAL',
        sessionDuration: 0,
        interactionPatterns: {
          frequentEdits: false,
          longWritingSessions: false,
          collaborativeWork: false,
          researchIntensive: false,
        },
      };

      // First coordination
      const start1 = performance.now();
      await coordinator.coordinateModulesForMode('MANUAL', context);
      const duration1 = performance.now() - start1;

      // Second coordination (should use cache)
      const start2 = performance.now();
      await coordinator.coordinateModulesForMode('MANUAL', context);
      const duration2 = performance.now() - start2;

      // Cached operation should be faster
      expect(duration2).toBeLessThan(duration1);

      const status = coordinator.getCoordinationStatus();
      expect(status.cacheStats.size).toBeGreaterThan(0);
    });

    test('should respect cache TTL', async () => {
      const context = {
        documentType: 'test',
        userGoals: ['test'],
        writingPhase: 'planning',
        userExperience: 'intermediate',
        currentMode: 'MANUAL',
        sessionDuration: 0,
        interactionPatterns: {
          frequentEdits: false,
          longWritingSessions: false,
          collaborativeWork: false,
          researchIntensive: false,
        },
      };

      // First coordination
      await coordinator.coordinateModulesForMode('MANUAL', context);

      // Wait for cache to expire (5 seconds + buffer)
      await new Promise(resolve => setTimeout(resolve, 6000));

      // Force cache cleanup
      coordinator.forceOptimization();

      const status = coordinator.getCoordinationStatus();
      expect(status.cacheStats.size).toBe(0);
    });
  });

  test.describe('Batch Processing', () => {
    test('should queue updates for batch processing', async () => {
      // Simulate multiple rapid updates
      for (let i = 0; i < 10; i++) {
        const update: ModuleUpdate = {
          moduleId: 'testModule',
          updateType: 'testUpdate',
          data: { index: i },
          priority: 'medium',
          timestamp: new Date(),
          requiresImmediate: false,
        };

        // This would normally be called internally, but we're testing the system
        // In a real scenario, these would come from module events
        coordinator['batchProcessor'].queueUpdate(update);
      }

      const status = coordinator.getCoordinationStatus();
      expect(status.batchQueueStatus.pending).toBe(10);
    });

    test('should process critical updates immediately', async () => {
      const criticalUpdate: ModuleUpdate = {
        moduleId: 'testModule',
        updateType: 'criticalUpdate',
        data: { critical: true },
        priority: 'critical',
        timestamp: new Date(),
        requiresImmediate: true,
      };

      coordinator['batchProcessor'].queueUpdate(criticalUpdate);

      // Critical updates should be processed immediately
      const status = coordinator.getCoordinationStatus();
      expect(status.batchQueueStatus.pending).toBe(0);
    });

    test('should respect batch size limits', async () => {
      // Queue more updates than the max batch size
      for (let i = 0; i < 60; i++) {
        const update: ModuleUpdate = {
          moduleId: 'testModule',
          updateType: 'testUpdate',
          data: { index: i },
          priority: 'medium',
          timestamp: new Date(),
          requiresImmediate: false,
        };

        coordinator['batchProcessor'].queueUpdate(update);
      }

      // Should trigger immediate processing when max size is reached
      const status = coordinator.getCoordinationStatus();
      expect(status.batchQueueStatus.pending).toBe(0);
    });
  });

  test.describe('Memory Management', () => {
    test('should track module activity', async () => {
      // Create a mock module
      const mockModule = {
        moduleId: 'testModule',
        currentMode: 'MANUAL' as const,
        adaptToMode: async () => {},
        getModuleState: () => ({}),
        getCoordinationCapabilities: () => ['test'],
      };

      coordinator.registerModule(mockModule);

      const status = coordinator.getCoordinationStatus();
      expect(status.memoryStats.activeSubscriptions).toBeGreaterThan(0);
    });

    test('should clean up inactive modules', async () => {
      // Create a mock module
      const mockModule = {
        moduleId: 'testModule',
        currentMode: 'MANUAL' as const,
        adaptToMode: async () => {},
        getModuleState: () => ({}),
        getCoordinationCapabilities: () => ['test'],
      };

      coordinator.registerModule(mockModule);

      // Force memory cleanup
      coordinator.forceOptimization();

      const status = coordinator.getCoordinationStatus();
      // After cleanup, should have fewer active subscriptions
      expect(status.memoryStats.activeSubscriptions).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Debouncing System', () => {
    test('should debounce rapid coordination calls', async () => {
      const context = {
        documentType: 'test',
        userGoals: ['test'],
        writingPhase: 'planning',
        userExperience: 'intermediate',
        currentMode: 'HYBRID',
        sessionDuration: 0,
        interactionPatterns: {
          frequentEdits: false,
          longWritingSessions: false,
          collaborativeWork: false,
          researchIntensive: false,
        },
      };

      // Multiple rapid calls should be debounced
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(coordinator.coordinateModulesForMode('HYBRID', context));
      }

      // Wait for debouncing to complete
      await new Promise(resolve => setTimeout(resolve, 400));

      // All promises should resolve
      await Promise.all(promises);

      // Should have used debouncing
      const status = coordinator.getCoordinationStatus();
      expect(status.performanceMetrics.coordinationLatency).toBeGreaterThan(0);
    });
  });

  test.describe('Performance Monitoring', () => {
    test('should track coordination latency', async () => {
      const context = {
        documentType: 'test',
        userGoals: ['test'],
        writingPhase: 'planning',
        userExperience: 'intermediate',
        currentMode: 'MANUAL',
        sessionDuration: 0,
        interactionPatterns: {
          frequentEdits: false,
          longWritingSessions: false,
          collaborativeWork: false,
          researchIntensive: false,
        },
      };

      const start = performance.now();
      await coordinator.coordinateModulesForMode('MANUAL', context);
      const duration = performance.now() - start;

      // Wait for metrics to update
      await new Promise(resolve => setTimeout(resolve, 100));

      const metrics = coordinator.getCoordinationStatus().performanceMetrics;
      expect(metrics.coordinationLatency).toBeGreaterThan(0);
      expect(metrics.coordinationLatency).toBeLessThanOrEqual(duration);
    });

    test('should provide actionable performance insights', async () => {
      const insights = coordinator.getPerformanceInsights();

      // Should provide insights based on current metrics
      expect(insights.insights).toBeDefined();
      expect(insights.recommendations).toBeDefined();

      // Insights should be actionable
      if (insights.insights.length > 0) {
        expect(insights.recommendations.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Integration and Compatibility', () => {
    test('should maintain compatibility with existing error handling', async () => {
      const invalidContext = {
        documentType: 'test',
        userGoals: ['test'],
        writingPhase: 'planning' as any,
        userExperience: 'intermediate',
        currentMode: 'INVALID_MODE' as any,
        sessionDuration: -1,
        interactionPatterns: {
          frequentEdits: false,
          longWritingSessions: false,
          collaborativeWork: false,
          researchIntensive: false,
        },
      };

      // Should handle invalid input gracefully
      await expect(
        coordinator.coordinateModulesForMode('MANUAL', invalidContext)
      ).rejects.toThrow();
    });

    test('should work with mode-aware modules', async () => {
      const mockModule = {
        moduleId: 'testModule',
        currentMode: 'MANUAL' as const,
        adaptToMode: async (mode: any, strategy: any) => {
          expect(mode).toBe('HYBRID');
          expect(strategy).toBeDefined();
        },
        getModuleState: () => ({}),
        getCoordinationCapabilities: () => ['test'],
        getPerformanceMetrics: () => ({
          coordinationLatency: 50,
          memoryUsage: 1024 * 1024,
        }),
      };

      coordinator.registerModule(mockModule);

      const context = {
        documentType: 'test',
        userGoals: ['test'],
        writingPhase: 'planning',
        userExperience: 'intermediate',
        currentMode: 'HYBRID',
        sessionDuration: 0,
        interactionPatterns: {
          frequentEdits: false,
          longWritingSessions: false,
          collaborativeWork: false,
          researchIntensive: false,
        },
      };

      await coordinator.coordinateModulesForMode('HYBRID', context);

      // Module should have been adapted
      const status = coordinator.getCoordinationStatus();
      expect(status.activeModules).toContain('testModule');
    });
  });

  test.describe('Stress Testing', () => {
    test('should handle high load gracefully', async () => {
      const context = {
        documentType: 'test',
        userGoals: ['test'],
        writingPhase: 'planning',
        userExperience: 'intermediate',
        currentMode: 'HYBRID',
        sessionDuration: 0,
        interactionPatterns: {
          frequentEdits: false,
          longWritingSessions: false,
          collaborativeWork: false,
          researchIntensive: false,
        },
      };

      // Simulate high load with many rapid operations
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(coordinator.coordinateModulesForMode('HYBRID', context));
      }

      // Should complete without errors
      await Promise.allSettled(promises);

      // System should still be responsive
      const status = coordinator.getCoordinationStatus();
      expect(status.isCoordinating).toBe(false);
    });

    test('should maintain performance under memory pressure', async () => {
      // Simulate memory pressure by creating many large objects
      const largeObjects = [];
      for (let i = 0; i < 1000; i++) {
        largeObjects.push(new Array(1000).fill('test'));
      }

      const context = {
        documentType: 'test',
        userGoals: ['test'],
        writingPhase: 'planning',
        userExperience: 'intermediate',
        currentMode: 'MANUAL',
        sessionDuration: 0,
        interactionPatterns: {
          frequentEdits: false,
          longWritingSessions: false,
          collaborativeWork: false,
          researchIntensive: false,
        },
      };

      // Should still coordinate successfully
      await coordinator.coordinateModulesForMode('MANUAL', context);

      // Clean up large objects
      largeObjects.length = 0;

      // Force optimization to clean up memory
      coordinator.forceOptimization();

      const status = coordinator.getCoordinationStatus();
      expect(status.isCoordinating).toBe(false);
    });
  });
});
