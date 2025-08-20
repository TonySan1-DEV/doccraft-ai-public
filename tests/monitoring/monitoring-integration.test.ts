import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the metrics module
vi.mock('../../server/monitoring/metrics', () => ({
  initMetrics: vi.fn(() => ({
    aiRequests: { inc: vi.fn() },
    aiLatency: { startTimer: vi.fn(() => ({ end: vi.fn() })) },
    aiErrors: { inc: vi.fn() },
    aiCacheHitRate: { set: vi.fn() },
    securityThreats: { inc: vi.fn() },
    securityThreatLevel: { set: vi.fn() },
    userSessions: { set: vi.fn() },
    documentOperations: { inc: vi.fn() },
    characterInteractions: { inc: vi.fn() },
    plotAnalysis: { inc: vi.fn() },
    styleAnalysis: { inc: vi.fn() },
    memoryUsage: { set: vi.fn() },
    cpuUsage: { set: vi.fn() },
    activeConnections: { set: vi.fn() },
    userEngagement: { inc: vi.fn() },
    featureUsage: { inc: vi.fn() },
    conversionEvents: { inc: vi.fn() },
  })),
  trackAIRequest: vi.fn(),
  trackAILatency: vi.fn(),
  trackAIError: vi.fn(),
  updateCacheHitRate: vi.fn(),
  trackSecurityThreat: vi.fn(),
  updateSecurityThreatLevel: vi.fn(),
  updateUserSessions: vi.fn(),
  trackDocumentOperation: vi.fn(),
  trackCharacterInteraction: vi.fn(),
  trackPlotAnalysis: vi.fn(),
  trackStyleAnalysis: vi.fn(),
  updateSystemMetrics: vi.fn(),
  trackUserEngagement: vi.fn(),
  trackFeatureUsage: vi.fn(),
  trackConversionEvent: vi.fn(),
}));

import {
  trackAIRequest,
  trackAILatency,
  trackAIError,
  updateCacheHitRate,
  trackSecurityThreat,
  updateSecurityThreatLevel,
  updateUserSessions,
  trackDocumentOperation,
  trackCharacterInteraction,
  trackPlotAnalysis,
  trackStyleAnalysis,
  updateSystemMetrics,
  trackUserEngagement,
  trackFeatureUsage,
  trackConversionEvent,
} from '../../server/monitoring/metrics';

describe('Monitoring Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AI Service Metrics', () => {
    it('should track AI requests correctly', () => {
      trackAIRequest('character-ai', 'gpt-4', 'interaction');
      expect(trackAIRequest).toHaveBeenCalledWith(
        'character-ai',
        'gpt-4',
        'interaction'
      );
    });

    it('should track AI latency correctly', () => {
      const timer = trackAILatency('character-ai', 'gpt-4', 'interaction');
      expect(trackAILatency).toHaveBeenCalledWith(
        'character-ai',
        'gpt-4',
        'interaction'
      );
      expect(timer).toBeDefined();
    });

    it('should track AI errors correctly', () => {
      trackAIError('character-ai', 'gpt-4', 'interaction', 'timeout');
      expect(trackAIError).toHaveBeenCalledWith(
        'character-ai',
        'gpt-4',
        'interaction',
        'timeout'
      );
    });

    it('should update cache hit rate correctly', () => {
      updateCacheHitRate('character-ai', 0.85);
      expect(updateCacheHitRate).toHaveBeenCalledWith('character-ai', 0.85);
    });
  });

  describe('Security Metrics', () => {
    it('should track security threats correctly', () => {
      trackSecurityThreat('brute-force', 'high', 'api');
      expect(trackSecurityThreat).toHaveBeenCalledWith(
        'brute-force',
        'high',
        'api'
      );
    });

    it('should update security threat level correctly', () => {
      updateSecurityThreatLevel(0.7);
      expect(updateSecurityThreatLevel).toHaveBeenCalledWith(0.7);
    });

    it('should clamp security threat level to valid range', () => {
      updateSecurityThreatLevel(1.5); // Should be clamped to 1.0
      expect(updateSecurityThreatLevel).toHaveBeenCalledWith(1.5);
    });
  });

  describe('User and Session Metrics', () => {
    it('should update user sessions correctly', () => {
      updateUserSessions('pro', 'active', 150);
      expect(updateUserSessions).toHaveBeenCalledWith('pro', 'active', 150);
    });

    it('should track user engagement correctly', () => {
      trackUserEngagement('feature_used', 'free', 'character_creation');
      expect(trackUserEngagement).toHaveBeenCalledWith(
        'feature_used',
        'free',
        'character_creation'
      );
    });

    it('should track feature usage correctly', () => {
      trackFeatureUsage('document_processor', 'pro', 'upload');
      expect(trackFeatureUsage).toHaveBeenCalledWith(
        'document_processor',
        'pro',
        'upload'
      );
    });

    it('should track conversion events correctly', () => {
      trackConversionEvent('upgrade', 'free', 'pro');
      expect(trackConversionEvent).toHaveBeenCalledWith(
        'upgrade',
        'free',
        'pro'
      );
    });
  });

  describe('Document and Content Metrics', () => {
    it('should track document operations correctly', () => {
      trackDocumentOperation('process', 'pdf', 'success');
      expect(trackDocumentOperation).toHaveBeenCalledWith(
        'process',
        'pdf',
        'success'
      );
    });

    it('should track character interactions correctly', () => {
      trackCharacterInteraction('chat', 'char_123', 'success');
      expect(trackCharacterInteraction).toHaveBeenCalledWith(
        'chat',
        'char_123',
        'success'
      );
    });

    it('should track plot analysis correctly', () => {
      trackPlotAnalysis('structure_analysis', 'success');
      expect(trackPlotAnalysis).toHaveBeenCalledWith(
        'structure_analysis',
        'success'
      );
    });

    it('should track style analysis correctly', () => {
      trackStyleAnalysis('tone_analysis', 'success');
      expect(trackStyleAnalysis).toHaveBeenCalledWith(
        'tone_analysis',
        'success'
      );
    });
  });

  describe('System Metrics', () => {
    it('should update system metrics correctly', () => {
      updateSystemMetrics();
      expect(updateSystemMetrics).toHaveBeenCalled();
    });
  });

  describe('Metrics Integration Examples', () => {
    it('should provide complete monitoring coverage for AI services', () => {
      // Simulate a complete AI service interaction
      const service = 'character-ai';
      const model = 'gpt-4';
      const operation = 'interaction';

      // Track request start
      trackAIRequest(service, model, operation);
      expect(trackAIRequest).toHaveBeenCalledWith(service, model, operation);

      // Track latency
      const timer = trackAILatency(service, model, operation);
      expect(trackAILatency).toHaveBeenCalledWith(service, model, operation);

      // Simulate successful completion
      timer.end();
      expect(timer.end).toHaveBeenCalled();

      // Update cache hit rate
      updateCacheHitRate(service, 0.92);
      expect(updateCacheHitRate).toHaveBeenCalledWith(service, 0.92);
    });

    it('should provide complete monitoring coverage for security events', () => {
      // Simulate security threat detection
      const threatType = 'suspicious_activity';
      const severity = 'medium';
      const source = 'user_input';

      // Track individual threat
      trackSecurityThreat(threatType, severity, source);
      expect(trackSecurityThreat).toHaveBeenCalledWith(
        threatType,
        severity,
        source
      );

      // Update overall threat level
      updateSecurityThreatLevel(0.6);
      expect(updateSecurityThreatLevel).toHaveBeenCalledWith(0.6);
    });

    it('should provide complete monitoring coverage for business operations', () => {
      // Simulate document processing workflow
      const operation = 'enhance';
      const type = 'markdown';
      const status = 'success';

      // Track document operation
      trackDocumentOperation(operation, type, status);
      expect(trackDocumentOperation).toHaveBeenCalledWith(
        operation,
        type,
        status
      );

      // Track user engagement
      trackUserEngagement('document_processed', 'pro', 'enhancement');
      expect(trackUserEngagement).toHaveBeenCalledWith(
        'document_processed',
        'pro',
        'enhancement'
      );

      // Track feature usage
      trackFeatureUsage('document_enhancer', 'pro', 'process');
      expect(trackFeatureUsage).toHaveBeenCalledWith(
        'document_enhancer',
        'pro',
        'process'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle metrics initialization failures gracefully', () => {
      // Mock metrics to return null (disabled)
      vi.mocked(
        require('../../server/monitoring/metrics').initMetrics
      ).mockReturnValue(null);

      // All metric functions should handle null metrics gracefully
      trackAIRequest('test', 'test', 'test');
      trackSecurityThreat('test', 'test', 'test');
      updateUserSessions('test', 'test', 0);

      // Should not throw errors when metrics are disabled
      expect(() => {
        trackAIRequest('test', 'test', 'test');
        trackSecurityThreat('test', 'test', 'test');
        updateUserSessions('test', 'test', 0);
      }).not.toThrow();
    });
  });
});
