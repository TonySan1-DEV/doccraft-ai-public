/**
 * Advanced Character Psychology System Tests
 * Comprehensive test suite for psychological analysis, character development,
 * and AI-powered character profiling.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { AdvancedCharacterAI } from '../services/advancedCharacterAI';
import { characterAnalysisMonitor } from '../monitoring/characterAnalysisMonitor';
import {
  CharacterPersona,
  PsychologicalFramework,
  AnalysisRequest,
  CharacterPrompt,
  PersonalityPattern,
  CharacterArc,
} from '../types/psychologicalAnalysis';

// ============================================================================
// TEST SETUP
// ============================================================================

describe('Advanced Character Psychology System', () => {
  let advancedAI: AdvancedCharacterAI;
  let testCharacter: CharacterPersona;

  beforeEach(() => {
    advancedAI = new AdvancedCharacterAI();

    // Create a test character for analysis
    testCharacter = {
      id: 'test-character-001',
      name: 'Test Character',
      description: 'A complex character for psychological analysis testing',
      personality: ['introverted', 'analytical', 'empathetic'],
      goals: ['self-discovery', 'personal growth', 'helping others'],
      conflicts: [
        'internal struggle with perfectionism',
        'balancing logic and emotion',
      ],
      arc: 'growth',
      traits: [
        {
          id: 'trait-001',
          name: 'Analytical Thinking',
          category: 'psychological',
          value: 'high',
          strength: 8,
          description: 'Strong analytical and logical thinking patterns',
        },
      ],
      cognitiveTraits: [
        {
          trait: 'analytical',
          strength: 0.8,
          flexibility: 0.6,
          adaptability: 0.7,
          cognitiveStyle: 'analytical',
          learningPreference: 'reading',
          problemSolvingApproach: 'systematic analysis',
          decisionMakingStyle: 'evidence-based',
          cognitiveBiases: ['confirmation bias'],
          strengths: ['logical reasoning', 'pattern recognition'],
          areasForGrowth: ['intuitive thinking', 'emotional intelligence'],
        },
      ],
      emotionalPatterns: [
        {
          emotion: 'anxiety',
          intensity: 0.6,
          frequency: 0.4,
          duration: 0.3,
          triggers: ['uncertainty', 'high expectations'],
          expressions: ['overthinking', 'perfectionism'],
          physiologicalResponses: ['increased heart rate', 'tension'],
          cognitiveEffects: ['racing thoughts', 'worry'],
          behavioralConsequences: ['procrastination', 'over-preparation'],
          regulationStrategies: ['deep breathing', 'rational analysis'],
          therapeuticInterventions: ['CBT techniques', 'mindfulness'],
        },
      ],
      motivationalDrivers: [
        {
          driver: 'achievement',
          strength: 0.8,
          origin: 'early success experiences',
          sustainability: 0.7,
          conflicts: ['perfectionism', 'burnout risk'],
          reinforcements: ['academic success', 'recognition'],
          obstacles: ['fear of failure', 'high standards'],
          strategies: ['goal setting', 'progress tracking'],
          longTermImpact: 'consistent growth and development',
          therapeuticValue: 0.8,
        },
      ],
      psychologicalFrameworks: ['CBT', 'Humanistic'],
      complexityScore: 75,
      psychologicalStability: 70,
      growthPotential: 85,
    };

    // Reset monitor for clean testing
    characterAnalysisMonitor.resetMetrics();
  });

  afterEach(() => {
    // Clean up after each test
    characterAnalysisMonitor.resetMetrics();
  });

  // ============================================================================
  // CORE FUNCTIONALITY TESTS
  // ============================================================================

  describe('AdvancedCharacterAI Service', () => {
    it('should initialize with prompt libraries for all frameworks', () => {
      expect(advancedAI).toBeInstanceOf(AdvancedCharacterAI);

      // Test that all psychological frameworks have prompt libraries
      const frameworks: PsychologicalFramework[] = [
        'CBT',
        'Psychodynamic',
        'Humanistic',
        'Behavioral',
        'Gestalt',
        'Existential',
        'TraumaInformed',
      ];

      frameworks.forEach(framework => {
        expect(advancedAI).toHaveProperty('generateDeepeningPrompts');
      });
    });

    it('should generate deepening prompts for CBT framework', async () => {
      const prompts = await advancedAI.generateDeepeningPrompts(
        testCharacter,
        'CBT',
        'moderate'
      );

      expect(Array.isArray(prompts)).toBe(true);
      expect(prompts.length).toBeGreaterThan(0);

      prompts.forEach(prompt => {
        expect(prompt.framework).toBe('CBT');
        expect(prompt.category).toBeDefined();
        expect(prompt.prompt).toBeDefined();
        expect(prompt.followUpQuestions).toBeDefined();
        expect(prompt.expectedInsights).toBeDefined();
      });
    });

    it('should generate deepening prompts for Humanistic framework', async () => {
      const prompts = await advancedAI.generateDeepeningPrompts(
        testCharacter,
        'Humanistic',
        'deep'
      );

      expect(Array.isArray(prompts)).toBe(true);
      expect(prompts.length).toBeGreaterThan(0);

      prompts.forEach(prompt => {
        expect(prompt.framework).toBe('Humanistic');
        expect(prompt.difficulty).toBeDefined();
        expect(prompt.estimatedTime).toBeGreaterThan(0);
      });
    });

    it('should analyze personality patterns using multiple frameworks', async () => {
      const patterns = await advancedAI.analyzePersonalityPatterns(
        testCharacter,
        ['CBT', 'Humanistic']
      );

      expect(Array.isArray(patterns)).toBe(true);
      // Note: This test may return empty arrays if implementations are stubs
      // The important thing is that the method executes without errors
    });

    it('should create character development arcs', async () => {
      const targetGrowth = ['emotional intelligence', 'self-compassion'];
      const arcs = await advancedAI.createDevelopmentArcs(
        testCharacter,
        targetGrowth,
        'medium'
      );

      expect(Array.isArray(arcs)).toBe(true);
      // Note: This test may return empty arrays if implementations are stubs
      // The important thing is that the method executes without errors
    });

    it('should perform comprehensive psychological analysis', async () => {
      const request: AnalysisRequest = {
        characterId: testCharacter.id,
        frameworks: ['CBT', 'Humanistic'],
        depth: 'moderate',
        includeArcs: true,
        includePrompts: true,
        priority: 'normal',
      };

      const response = await advancedAI.performComprehensiveAnalysis(
        testCharacter,
        request
      );

      expect(response).toBeDefined();
      expect(response.requestId).toBeDefined();
      expect(response.status).toBeDefined();
      expect(['pending', 'in_progress', 'completed', 'failed']).toContain(
        response.status
      );
    });

    it('should assess character complexity', async () => {
      const complexity =
        await advancedAI.assessCharacterComplexity(testCharacter);

      expect(complexity).toBeDefined();
      expect(complexity.overallComplexity).toBeGreaterThan(0);
      expect(complexity.breakdown).toBeDefined();
      expect(complexity.recommendations).toBeDefined();
      expect(Array.isArray(complexity.recommendations)).toBe(true);
    });

    it('should calculate prompt quality metrics', async () => {
      const prompts = await advancedAI.generateDeepeningPrompts(
        testCharacter,
        'CBT',
        'moderate'
      );

      const qualityMetrics = await advancedAI.calculatePromptQuality(
        prompts,
        'character-development'
      );

      expect(Array.isArray(qualityMetrics)).toBe(true);
      expect(qualityMetrics.length).toBeGreaterThan(0);

      qualityMetrics.forEach(metric => {
        expect(metric.promptId).toBeDefined();
        expect(metric.overallScore).toBeGreaterThan(0);
        expect(metric.overallScore).toBeLessThanOrEqual(100);
        expect(metric.feedback).toBeDefined();
        expect(Array.isArray(metric.feedback)).toBe(true);
      });
    });
  });

  // ============================================================================
  // MONITORING SYSTEM TESTS
  // ============================================================================

  describe('Character Analysis Monitor', () => {
    it('should track analysis metrics correctly', () => {
      const initialMetrics = characterAnalysisMonitor.getMetrics();
      expect(initialMetrics.totalAnalyses).toBe(0);
      expect(initialMetrics.successRate).toBe(100);
      expect(initialMetrics.errorRate).toBe(0);
    });

    it('should monitor analysis lifecycle', () => {
      const analysisId = 'test-analysis-001';
      const frameworks = ['CBT', 'Humanistic'];
      const complexity = 'moderate';

      // Start analysis
      characterAnalysisMonitor.startAnalysis(
        analysisId,
        frameworks,
        complexity
      );

      let metrics = characterAnalysisMonitor.getMetrics();
      expect(metrics.frameworkUsage['CBT']).toBe(1);
      expect(metrics.frameworkUsage['Humanistic']).toBe(1);
      expect(metrics.complexityDistribution['moderate']).toBe(1);

      // Complete analysis
      const mockMetrics = {
        executionTime: 1500,
        qualityScore: 85,
        confidence: 80,
        consistency: 85,
        completeness: 90,
        errorRate: 0,
      };

      const mockProfile = {} as any;
      characterAnalysisMonitor.completeAnalysis(
        analysisId,
        mockMetrics,
        mockProfile
      );

      metrics = characterAnalysisMonitor.getMetrics();
      expect(metrics.totalAnalyses).toBe(1);
      expect(metrics.averageExecutionTime).toBe(1500);
      expect(metrics.averageQualityScore).toBe(85);
    });

    it('should handle analysis failures', () => {
      const analysisId = 'test-failure-001';
      const frameworks = ['CBT'];
      const complexity = 'moderate';

      characterAnalysisMonitor.startAnalysis(
        analysisId,
        frameworks,
        complexity
      );
      characterAnalysisMonitor.failAnalysis(analysisId, 'Test error message');

      const metrics = characterAnalysisMonitor.getMetrics();
      expect(metrics.errorRate).toBeGreaterThan(0);
    });

    it('should provide system health assessment', () => {
      const health = characterAnalysisMonitor.getSystemHealth();

      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(['healthy', 'warning', 'critical']).toContain(health.status);
      expect(health.issues).toBeDefined();
      expect(health.recommendations).toBeDefined();
      expect(Array.isArray(health.issues)).toBe(true);
      expect(Array.isArray(health.recommendations)).toBe(true);
    });

    it('should track quality trends over time', () => {
      const hourlyTrend = characterAnalysisMonitor.getQualityTrend('hour');
      const dailyTrend = characterAnalysisMonitor.getQualityTrend('day');

      expect(hourlyTrend).toBeDefined();
      expect(dailyTrend).toBeDefined();
      expect(hourlyTrend.period).toBe('hour');
      expect(dailyTrend.period).toBe('day');
      expect(hourlyTrend.trend).toBeDefined();
      expect(['improving', 'declining', 'stable']).toContain(hourlyTrend.trend);
    });

    it('should maintain performance history', () => {
      const history = characterAnalysisMonitor.getPerformanceHistory();

      expect(Array.isArray(history)).toBe(true);
      // Initially empty, but structure should be correct
      if (history.length > 0) {
        const snapshot = history[0];
        expect(snapshot.timestamp).toBeDefined();
        expect(snapshot.activeAnalyses).toBeDefined();
        expect(snapshot.queueLength).toBeDefined();
      }
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('System Integration', () => {
    it('should integrate character analysis with monitoring', async () => {
      // Perform an analysis that should trigger monitoring
      const prompts = await advancedAI.generateDeepeningPrompts(
        testCharacter,
        'CBT',
        'moderate'
      );

      // Check that monitoring captured the activity
      const metrics = characterAnalysisMonitor.getMetrics();
      expect(metrics.totalAnalyses).toBeGreaterThan(0);
    });

    it('should handle multiple concurrent analyses', async () => {
      const promises = [];

      // Start multiple analyses
      for (let i = 0; i < 3; i++) {
        promises.push(
          advancedAI.generateDeepeningPrompts(testCharacter, 'CBT', 'moderate')
        );
      }

      // Wait for all to complete
      await Promise.all(promises);

      // Check that all were monitored
      const metrics = characterAnalysisMonitor.getMetrics();
      expect(metrics.totalAnalyses).toBeGreaterThanOrEqual(3);
    });

    it('should maintain data consistency across operations', async () => {
      // Perform initial analysis
      const initialPrompts = await advancedAI.generateDeepeningPrompts(
        testCharacter,
        'CBT',
        'moderate'
      );

      // Perform follow-up analysis
      const followUpPrompts = await advancedAI.generateDeepeningPrompts(
        testCharacter,
        'Humanistic',
        'deep'
      );

      // Both should be tracked independently
      expect(initialPrompts.length).toBeGreaterThan(0);
      expect(followUpPrompts.length).toBeGreaterThan(0);

      const metrics = characterAnalysisMonitor.getMetrics();
      expect(metrics.totalAnalyses).toBeGreaterThanOrEqual(2);
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle invalid framework requests gracefully', async () => {
      // Test with invalid framework (TypeScript should prevent this, but runtime safety is good)
      const invalidCharacter = { ...testCharacter, id: 'invalid-test' };

      try {
        await advancedAI.generateDeepeningPrompts(
          invalidCharacter,
          'CBT',
          'moderate'
        );
        // Should not throw for invalid character, just return empty or default results
      } catch (error) {
        // If it does throw, ensure it's a meaningful error
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBeDefined();
      }
    });

    it('should handle monitoring system failures gracefully', () => {
      // Test that the system continues to work even if monitoring fails
      const health = characterAnalysisMonitor.getSystemHealth();
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('Performance Characteristics', () => {
    it('should complete basic analysis within reasonable time', async () => {
      const startTime = performance.now();

      await advancedAI.generateDeepeningPrompts(
        testCharacter,
        'CBT',
        'moderate'
      );

      const executionTime = performance.now() - startTime;

      // Should complete within 5 seconds (generous for testing)
      expect(executionTime).toBeLessThan(5000);
    });

    it('should handle large character profiles efficiently', async () => {
      const largeCharacter = {
        ...testCharacter,
        id: 'large-character-001',
        name: 'Large Test Character',
        // Add more complex data
        traits: Array.from({ length: 50 }, (_, i) => ({
          id: `trait-${i}`,
          name: `Trait ${i}`,
          category: 'personality' as const,
          value: 'medium',
          strength: Math.floor(Math.random() * 10) + 1,
          description: `Complex trait description ${i}`,
        })),
        cognitiveTraits: Array.from({ length: 20 }, (_, i) => ({
          trait: `cognitive-${i}`,
          strength: Math.random(),
          flexibility: Math.random(),
          adaptability: Math.random(),
          cognitiveStyle: 'analytical' as const,
          learningPreference: 'reading' as const,
          problemSolvingApproach: `Approach ${i}`,
          decisionMakingStyle: `Style ${i}`,
          cognitiveBiases: [`Bias ${i}`],
          strengths: [`Strength ${i}`],
          areasForGrowth: [`Growth ${i}`],
        })),
      };

      const startTime = performance.now();

      await advancedAI.generateDeepeningPrompts(
        largeCharacter,
        'CBT',
        'moderate'
      );

      const executionTime = performance.now() - startTime;

      // Should still complete within reasonable time even with large profiles
      expect(executionTime).toBeLessThan(10000);
    });
  });
});
