/**
 * Performance Tests for Optimized ModeAwareAIService
 *
 * Tests the performance optimizations including:
 * - Intelligent caching system
 * - Optimized validation
 * - Request debouncing
 * - Performance monitoring
 * - Target: <500ms mode transition times
 */

import { ModeAwareAIService } from '../services/modeAwareAIService';
import { runAIAction } from '../services/aiHelperService';
import { SystemMode, WritingContext } from '../types/systemModes';

// Mock the AI service for consistent testing
jest.mock('../services/aiHelperService');
const mockRunAIAction = runAIAction as jest.MockedFunction<typeof runAIAction>;

describe('ModeAwareAIService Performance Tests', () => {
  let service: ModeAwareAIService;
  let mockMCPRegistry: any;

  const mockWritingContext: WritingContext = {
    documentType: 'novel',
    userGoals: ['character development', 'plot structure', 'emotional depth'],
    writingPhase: 'drafting',
    userExperience: 'intermediate',
    currentMode: 'HYBRID',
    sessionDuration: 3600000, // 1 hour
    interactionPatterns: {
      frequentEdits: true,
      longWritingSessions: false,
      collaborativeWork: false,
      researchIntensive: true,
    },
  };

  const mockAIRequest = {
    type: 'style_enhancement' as const,
    content:
      'The protagonist walked through the dark forest, feeling the weight of their decision.',
    explicitUserInitiated: true,
    context: mockWritingContext,
    enhancementLevel: 'collaborative' as const,
    suggestionStyle: 'options_based' as const,
    creativityLevel: 'enhancement_focused' as const,
    userApprovalRequired: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockMCPRegistry = {};

    // Mock AI service to return quickly for performance testing
    mockRunAIAction.mockResolvedValue(
      'Enhanced content with improved style and emotional depth.'
    );

    service = new ModeAwareAIService(mockRunAIAction, mockMCPRegistry, {
      cacheTTL: 30000,
      maxCacheSize: 100,
      debounceDelay: 300,
      enableDetailedLogging: false,
    });
  });

  afterEach(() => {
    service.cleanup();
  });

  describe('Performance Targets', () => {
    test('should achieve <500ms mode transition time for cached requests', async () => {
      const startTime = performance.now();

      // First request (cache miss)
      await service.processRequest(mockAIRequest, mockWritingContext, 'HYBRID');
      const firstRequestTime = performance.now() - startTime;

      // Second request (cache hit)
      const cacheStartTime = performance.now();
      await service.processRequest(mockAIRequest, mockWritingContext, 'HYBRID');
      const cachedRequestTime = performance.now() - cacheStartTime;

      // Verify performance targets
      expect(cachedRequestTime).toBeLessThan(500); // Target: <500ms for cached requests
      expect(cachedRequestTime).toBeLessThan(firstRequestTime * 0.1); // Cache should be 10x faster

      console.log(`Performance results:
        First request (cache miss): ${firstRequestTime.toFixed(2)}ms
        Cached request: ${cachedRequestTime.toFixed(2)}ms
        Speed improvement: ${(firstRequestTime / cachedRequestTime).toFixed(2)}x`);
    });

    test('should achieve <500ms mode transition time for all modes', async () => {
      const modes: SystemMode[] = ['MANUAL', 'HYBRID', 'FULLY_AUTO'];
      const results: Record<SystemMode, number> = {} as Record<
        SystemMode,
        number
      >;

      for (const mode of modes) {
        const startTime = performance.now();
        await service.processRequest(mockAIRequest, mockWritingContext, mode);
        const duration = performance.now() - startTime;
        results[mode] = duration;

        // Verify each mode meets the performance target
        expect(duration).toBeLessThan(500);
      }

      console.log('Mode transition performance:', results);
    });

    test('should maintain performance under load with multiple concurrent requests', async () => {
      const concurrentRequests = 10;
      const promises: Promise<any>[] = [];

      const startTime = performance.now();

      // Launch concurrent requests
      for (let i = 0; i < concurrentRequests; i++) {
        const request = {
          ...mockAIRequest,
          content: `Request ${i}: ${mockAIRequest.content}`,
        };
        promises.push(
          service.processRequest(request, mockWritingContext, 'HYBRID')
        );
      }

      // Wait for all requests to complete
      await Promise.all(promises);
      const totalTime = performance.now() - startTime;
      const averageTime = totalTime / concurrentRequests;

      // Verify performance under load
      expect(averageTime).toBeLessThan(500);
      expect(totalTime).toBeLessThan(5000); // Total time should be reasonable

      console.log(`Concurrent performance results:
        Total time: ${totalTime.toFixed(2)}ms
        Average time per request: ${averageTime.toFixed(2)}ms
        Requests per second: ${(1000 / averageTime).toFixed(2)}`);
    });
  });

  describe('Caching System Performance', () => {
    test('should achieve >60% cache hit rate for repeated operations', async () => {
      const totalRequests = 20;
      const uniqueRequests = 5;

      // Make multiple requests with some repetition
      for (let i = 0; i < totalRequests; i++) {
        const request = {
          ...mockAIRequest,
          content: `Request ${i % uniqueRequests}: ${mockAIRequest.content}`,
        };
        await service.processRequest(request, mockWritingContext, 'HYBRID');
      }

      const performanceReport = service.getPerformanceReport() as any;
      const cacheHitRate = performanceReport.performance.cacheHitRate;

      // Verify cache hit rate target
      expect(cacheHitRate).toBeGreaterThan(60);

      console.log(`Cache performance:
        Total requests: ${totalRequests}
        Unique requests: ${uniqueRequests}
        Cache hit rate: ${cacheHitRate}%`);
    });

    test('should handle cache eviction efficiently', async () => {
      const largeContent = 'A'.repeat(1000); // Large content to test cache limits
      const requests = [];

      // Fill cache with large requests
      for (let i = 0; i < 150; i++) {
        // Exceeds max cache size
        const request = {
          ...mockAIRequest,
          content: `Large request ${i}: ${largeContent}`,
        };
        requests.push(
          service.processRequest(request, mockWritingContext, 'HYBRID')
        );
      }

      await Promise.all(requests);

      const performanceReport = service.getPerformanceReport() as any;
      const cacheStats = performanceReport.cache;

      // Verify cache size is maintained
      expect(cacheStats.size).toBeLessThanOrEqual(100);

      console.log(`Cache eviction test:
        Cache size: ${cacheStats.size}
        Max cache size: 100`);
    });
  });

  describe('Request Debouncing Performance', () => {
    test('should prevent rapid-fire requests and optimize performance', async () => {
      const rapidRequests = 20;
      const startTime = performance.now();

      // Launch rapid-fire requests
      const promises = Array.from({ length: rapidRequests }, (_, i) => {
        const request = {
          ...mockAIRequest,
          content: `Rapid request ${i}: ${mockAIRequest.content}`,
        };
        return service.processRequest(request, mockWritingContext, 'HYBRID');
      });

      await Promise.all(promises);
      const totalTime = performance.now() - startTime;

      // Verify debouncing prevents excessive requests
      const performanceReport = service.getPerformanceReport() as any;
      const debounceStats = performanceReport.debouncing;

      expect(debounceStats.activeTimers).toBeLessThan(rapidRequests);
      expect(totalTime).toBeLessThan(rapidRequests * 100); // Should be much faster than sequential

      console.log(`Debouncing performance:
        Rapid requests: ${rapidRequests}
        Active timers: ${debounceStats.activeTimers}
        Total time: ${totalTime.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage Optimization', () => {
    test('should maintain memory usage under 50MB additional overhead', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Process multiple requests to test memory usage
      for (let i = 0; i < 50; i++) {
        const request = {
          ...mockAIRequest,
          content: `Memory test ${i}: ${mockAIRequest.content}`,
        };
        await service.processRequest(request, mockWritingContext, 'HYBRID');
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      // Verify memory usage target
      expect(memoryIncreaseMB).toBeLessThan(50);

      console.log(`Memory usage test:
        Initial memory: ${(initialMemory / 1024 / 1024).toFixed(2)}MB
        Final memory: ${(finalMemory / 1024 / 1024).toFixed(2)}MB
        Memory increase: ${memoryIncreaseMB.toFixed(2)}MB`);
    });
  });

  describe('Validation Performance', () => {
    test('should perform fast validation without performance impact', async () => {
      const invalidRequests = [
        { ...mockAIRequest, type: 'invalid_type' as any },
        { ...mockAIRequest, content: '' },
        { ...mockAIRequest, explicitUserInitiated: 'not_boolean' as any },
        null,
        undefined,
      ];

      const startTime = performance.now();

      for (const invalidRequest of invalidRequests) {
        try {
          await service.processRequest(
            invalidRequest as any,
            mockWritingContext,
            'HYBRID'
          );
        } catch (error) {
          // Expected to fail validation
        }
      }

      const validationTime = performance.now() - startTime;

      // Validation should be very fast
      expect(validationTime).toBeLessThan(100);

      console.log(`Validation performance:
        Invalid requests processed: ${invalidRequests.length}
        Total validation time: ${validationTime.toFixed(2)}ms
        Average per request: ${(validationTime / invalidRequests.length).toFixed(2)}ms`);
    });
  });

  describe('Performance Monitoring', () => {
    test('should provide comprehensive performance metrics', async () => {
      // Process some requests to generate metrics
      for (let i = 0; i < 10; i++) {
        const request = {
          ...mockAIRequest,
          content: `Metrics test ${i}: ${mockAIRequest.content}`,
        };
        await service.processRequest(request, mockWritingContext, 'HYBRID');
      }

      const performanceReport = service.getPerformanceReport() as any;

      // Verify all required metrics are present
      expect(performanceReport.serviceName).toBe('ModeAwareAIService');
      expect(performanceReport.performance).toBeDefined();
      expect(performanceReport.cache).toBeDefined();
      expect(performanceReport.debouncing).toBeDefined();
      expect(performanceReport.recommendations).toBeDefined();

      // Verify performance metrics
      expect(performanceReport.performance.averageResponseTime).toBeGreaterThan(
        0
      );
      expect(performanceReport.performance.cacheHitRate).toBeGreaterThanOrEqual(
        0
      );
      expect(performanceReport.performance.totalRequests).toBeGreaterThan(0);

      console.log('Performance report structure:', {
        serviceName: performanceReport.serviceName,
        averageResponseTime: performanceReport.performance.averageResponseTime,
        cacheHitRate: performanceReport.performance.cacheHitRate,
        totalRequests: performanceReport.performance.totalRequests,
        recommendations: performanceReport.recommendations,
      });
    });

    test('should generate actionable optimization recommendations', async () => {
      // Process requests to generate recommendations
      for (let i = 0; i < 15; i++) {
        const request = {
          ...mockAIRequest,
          content: `Recommendations test ${i}: ${mockAIRequest.content}`,
        };
        await service.processRequest(request, mockWritingContext, 'HYBRID');
      }

      const performanceReport = service.getPerformanceReport() as any;
      const recommendations = performanceReport.recommendations;

      // Verify recommendations are generated
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);

      // Verify recommendations are actionable
      recommendations.forEach((recommendation: string) => {
        expect(typeof recommendation).toBe('string');
        expect(recommendation.length).toBeGreaterThan(10);
        expect(recommendation).toMatch(
          /consider|investigate|optimize|reduce|increase/i
        );
      });

      console.log('Optimization recommendations:', recommendations);
    });
  });

  describe('Service Health Monitoring', () => {
    test('should provide accurate health status based on performance', async () => {
      // Process requests to generate health data
      for (let i = 0; i < 20; i++) {
        const request = {
          ...mockAIRequest,
          content: `Health test ${i}: ${mockAIRequest.content}`,
        };
        await service.processRequest(request, mockWritingContext, 'HYBRID');
      }

      const healthStatus = service.getHealthStatus();

      // Verify health status structure
      expect(healthStatus.status).toMatch(/healthy|degraded|unhealthy/);
      expect(healthStatus.performanceMetrics).toBeDefined();
      expect(healthStatus.cache).toBeDefined();
      expect(healthStatus.debouncing).toBeDefined();

      // Verify status is based on actual performance
      if (healthStatus.performanceMetrics.averageResponseTime > 2000) {
        expect(healthStatus.status).toBe('degraded');
      } else if (healthStatus.performanceMetrics.averageResponseTime > 5000) {
        expect(healthStatus.status).toBe('unhealthy');
      } else {
        expect(healthStatus.status).toBe('healthy');
      }

      console.log('Health status:', {
        status: healthStatus.status,
        averageResponseTime:
          healthStatus.performanceMetrics.averageResponseTime,
        cacheHitRate: healthStatus.performanceMetrics.cacheHitRate,
      });
    });
  });

  describe('Performance Regression Prevention', () => {
    test('should maintain consistent performance across multiple test runs', async () => {
      const testRuns = 5;
      const performanceResults: number[] = [];

      for (let run = 0; run < testRuns; run++) {
        const startTime = performance.now();

        // Process a set of requests
        for (let i = 0; i < 10; i++) {
          const request = {
            ...mockAIRequest,
            content: `Regression test run ${run} request ${i}: ${mockAIRequest.content}`,
          };
          await service.processRequest(request, mockWritingContext, 'HYBRID');
        }

        const runTime = performance.now() - startTime;
        performanceResults.push(runTime);
      }

      // Calculate performance consistency
      const averageTime =
        performanceResults.reduce((sum, time) => sum + time, 0) / testRuns;
      const variance =
        performanceResults.reduce(
          (sum, time) => sum + Math.pow(time - averageTime, 2),
          0
        ) / testRuns;
      const standardDeviation = Math.sqrt(variance);
      const coefficientOfVariation = standardDeviation / averageTime;

      // Verify performance consistency (CV should be < 0.2 for 20% consistency)
      expect(coefficientOfVariation).toBeLessThan(0.2);

      console.log(`Performance consistency test:
        Test runs: ${testRuns}
        Average time: ${averageTime.toFixed(2)}ms
        Standard deviation: ${standardDeviation.toFixed(2)}ms
        Coefficient of variation: ${coefficientOfVariation.toFixed(3)}`);
    });
  });
});
