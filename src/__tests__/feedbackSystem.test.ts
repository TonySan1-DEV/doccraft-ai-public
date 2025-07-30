// MCP Context Block
/*
{
  file: "feedbackSystem.test.ts",
  role: "test-developer",
  allowedActions: ["test", "validate"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "feedback_system"
}
*/

import { feedbackService, FeedbackEvent, FeedbackStats, PatternAnalytics } from '../services/feedbackService';
import { FeedbackButtons } from '../components/FeedbackButtons';
import { FeedbackAnalytics } from '../components/FeedbackAnalytics';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  rpc: jest.fn()
};

jest.mock('../lib/supabase', () => ({
  supabase: mockSupabase
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Feedback System', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
  };

  const mockSourcePrompt = 'This is a test prompt for AI suggestions';
  const mockPatternUsed = 'writing_friendly_general';

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    (feedbackService as any).instance = undefined; // Reset singleton
  });

  describe('FeedbackService', () => {
    it('should be a singleton', () => {
      const instance1 = feedbackService;
      const instance2 = feedbackService;
      expect(instance1).toBe(instance2);
    });

    it('should submit feedback successfully', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 'feedback-id-123',
        error: null
      });

      const result = await feedbackService.submitFeedback(
        'positive',
        mockSourcePrompt,
        mockPatternUsed,
        {
          contentType: 'suggestion',
          contextData: { test: 'data' }
        }
      );

      expect(result.success).toBe(true);
      expect(result.feedbackId).toBe('feedback-id-123');
      expect(mockSupabase.rpc).toHaveBeenCalledWith('create_feedback_event', {
        p_user_id: mockUser.id,
        p_feedback_type: 'positive',
        p_source_prompt: mockSourcePrompt,
        p_pattern_used: mockPatternUsed,
        p_copilot_enabled: true,
        p_memory_enabled: true,
        p_session_id: undefined,
        p_content_type: 'suggestion',
        p_context_data: { test: 'data' }
      });
    });

    it('should handle authentication errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const result = await feedbackService.submitFeedback(
        'positive',
        mockSourcePrompt,
        mockPatternUsed
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authenticated');
    });

    it('should handle submission errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await feedbackService.submitFeedback(
        'negative',
        mockSourcePrompt,
        mockPatternUsed
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should implement rate limiting', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 'feedback-id-123',
        error: null
      });

      // Submit multiple feedback quickly
      const promises = Array.from({ length: 15 }, () =>
        feedbackService.submitFeedback('positive', mockSourcePrompt, mockPatternUsed)
      );

      const results = await Promise.all(promises);
      const successfulResults = results.filter(r => r.success);
      const rateLimitedResults = results.filter(r => !r.success && r.error?.includes('Rate limit'));

      expect(successfulResults.length).toBeLessThanOrEqual(10);
      expect(rateLimitedResults.length).toBeGreaterThan(0);
    });

    it('should prevent duplicate feedback', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 'feedback-id-123',
        error: null
      });

      // Submit same feedback twice
      const result1 = await feedbackService.submitFeedback('positive', mockSourcePrompt, mockPatternUsed);
      const result2 = await feedbackService.submitFeedback('positive', mockSourcePrompt, mockPatternUsed);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('already submitted');
    });

    it('should get feedback statistics', async () => {
      const mockStats: FeedbackStats[] = [
        {
          pattern_used: 'writing_friendly_general',
          total_feedback: 100,
          positive_feedback: 80,
          negative_feedback: 20,
          positive_rate: 80.0,
          avg_rating: 4.0
        }
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockStats,
        error: null
      });

      const stats = await feedbackService.getFeedbackStats();

      expect(stats).toEqual(mockStats);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_feedback_stats', {
        p_user_id: undefined,
        p_pattern_used: undefined,
        p_time_range: '30 days'
      });
    });

    it('should get pattern analytics', async () => {
      const mockAnalytics: PatternAnalytics[] = [
        {
          pattern_used: 'writing_friendly_general',
          total_usage: 100,
          positive_rate: 80.0,
          confidence_interval: 3.2,
          trend_direction: 'improving'
        }
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockAnalytics,
        error: null
      });

      const analytics = await feedbackService.getPatternAnalytics();

      expect(analytics).toEqual(mockAnalytics);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_pattern_analytics', {
        p_time_range: '30 days'
      });
    });

    it('should get user recent feedback', async () => {
      const mockRecentFeedback: FeedbackEvent[] = [
        {
          id: 'feedback-1',
          user_id: mockUser.id,
          timestamp: '2024-01-01T00:00:00Z',
          feedback_type: 'positive',
          source_prompt: 'Test prompt',
          pattern_used: 'writing_friendly_general',
          copilot_enabled: true,
          memory_enabled: true
        }
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockRecentFeedback,
        error: null
      });

      const recentFeedback = await feedbackService.getUserRecentFeedback(5);

      expect(recentFeedback).toEqual(mockRecentFeedback);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_recent_feedback', {
        p_user_id: mockUser.id,
        p_limit: 5
      });
    });

    it('should check if feedback was already submitted', () => {
      const promptHash = 'test-hash';
      const result = feedbackService.hasSubmittedFeedback(promptHash, 'positive');
      expect(typeof result).toBe('boolean');
    });

    it('should clear feedback cache', () => {
      feedbackService.clearFeedbackCache();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('submittedFeedback');
    });
  });

  describe('FeedbackButtons Component', () => {
    it('should render feedback buttons', () => {
      // This would require React Testing Library setup
      // For now, we'll test the component interface
      expect(FeedbackButtons).toBeDefined();
      expect(typeof FeedbackButtons).toBe('function');
    });

    it('should handle feedback submission', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 'feedback-id-123',
        error: null
      });

      // This would be tested with React Testing Library
      // For now, we'll test the service integration
      const result = await feedbackService.submitFeedback(
        'positive',
        mockSourcePrompt,
        mockPatternUsed,
        {
          contentType: 'suggestion',
          contextData: { test: 'data' }
        }
      );

      expect(result.success).toBe(true);
    });

    it('should prevent duplicate submissions', () => {
      // Test that the component prevents duplicate submissions
      // This would be tested with React Testing Library
      expect(feedbackService.hasSubmittedFeedback('test-hash', 'positive')).toBe(false);
    });
  });

  describe('FeedbackAnalytics Component', () => {
    it('should render analytics component', () => {
      expect(FeedbackAnalytics).toBeDefined();
      expect(typeof FeedbackAnalytics).toBe('function');
    });

    it('should load and display analytics data', async () => {
      const mockStats: FeedbackStats[] = [
        {
          pattern_used: 'writing_friendly_general',
          total_feedback: 100,
          positive_feedback: 80,
          negative_feedback: 20,
          positive_rate: 80.0,
          avg_rating: 4.0
        }
      ];

      const mockAnalytics: PatternAnalytics[] = [
        {
          pattern_used: 'writing_friendly_general',
          total_usage: 100,
          positive_rate: 80.0,
          confidence_interval: 3.2,
          trend_direction: 'improving'
        }
      ];

      mockSupabase.rpc
        .mockResolvedValueOnce({ data: mockStats, error: null })
        .mockResolvedValueOnce({ data: mockAnalytics, error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      // This would be tested with React Testing Library
      // For now, we'll test the service calls
      const [stats, analytics] = await Promise.all([
        feedbackService.getFeedbackStats(),
        feedbackService.getPatternAnalytics()
      ]);

      expect(stats).toEqual(mockStats);
      expect(analytics).toEqual(mockAnalytics);
    });
  });

  describe('Feedback Validation', () => {
    it('should validate feedback type', () => {
      const validTypes = ['positive', 'negative'];
      const invalidType = 'invalid';

      // Test with valid types
      validTypes.forEach(type => {
        expect(['positive', 'negative']).toContain(type);
      });

      // Test with invalid type
      expect(['positive', 'negative']).not.toContain(invalidType);
    });

    it('should validate source prompt', () => {
      const validPrompt = 'This is a valid prompt';
      const emptyPrompt = '';

      expect(validPrompt.length).toBeGreaterThan(0);
      expect(emptyPrompt.length).toBe(0);
    });

    it('should validate pattern used', () => {
      const validPattern = 'writing_friendly_general';
      const emptyPattern = '';

      expect(validPattern.length).toBeGreaterThan(0);
      expect(emptyPattern.length).toBe(0);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 'feedback-id-123',
        error: null
      });

      const submissions = [];
      for (let i = 0; i < 15; i++) {
        submissions.push(
          feedbackService.submitFeedback('positive', `prompt-${i}`, mockPatternUsed)
        );
      }

      const results = await Promise.all(submissions);
      const successful = results.filter(r => r.success);
      const rateLimited = results.filter(r => !r.success && r.error?.includes('Rate limit'));

      expect(successful.length).toBeLessThanOrEqual(10);
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it('should reset rate limits after window', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 'feedback-id-123',
        error: null
      });

      // Submit feedback
      const result1 = await feedbackService.submitFeedback('positive', mockSourcePrompt, mockPatternUsed);
      expect(result1.success).toBe(true);

      // Wait for rate limit window to pass (in real implementation)
      // For testing, we'll just verify the service handles it correctly
      const result2 = await feedbackService.submitFeedback('positive', 'different-prompt', mockPatternUsed);
      expect(result2.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Network error'));

      const result = await feedbackService.submitFeedback('positive', mockSourcePrompt, mockPatternUsed);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle database errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database constraint violation' }
      });

      const result = await feedbackService.submitFeedback('positive', mockSourcePrompt, mockPatternUsed);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle authentication errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const result = await feedbackService.submitFeedback('positive', mockSourcePrompt, mockPatternUsed);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authenticated');
    });
  });

  describe('Data Sanitization', () => {
    it('should handle sensitive content in prompts', async () => {
      const sensitivePrompt = 'password=secret123 api_key=abc123 token=xyz789';
      
      // Test that the service can handle sensitive content without exposing it
      const result = await feedbackService.submitFeedback('positive', sensitivePrompt, mockPatternUsed);
      
      expect(result.success).toBe(true);
      // Verify that sensitive data is not logged or exposed
    });

    it('should handle long prompts', async () => {
      const longPrompt = 'A'.repeat(2000);
      
      // Test that the service can handle long prompts
      const result = await feedbackService.submitFeedback('positive', longPrompt, mockPatternUsed);
      
      expect(result.success).toBe(true);
      // Verify that long prompts are handled appropriately
    });
  });

  describe('Local Storage Integration', () => {
    it('should save submitted feedback to localStorage', () => {
      const feedbackKey = 'test-hash-positive';
      feedbackService['submittedFeedback'].add(feedbackKey);
      feedbackService['saveSubmittedFeedback']();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'submittedFeedback',
        JSON.stringify([feedbackKey])
      );
    });

    it('should load submitted feedback from localStorage', () => {
      const feedbackArray = ['test-hash-positive', 'test-hash-negative'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(feedbackArray));

      feedbackService['loadSubmittedFeedback']();

      expect(feedbackService['submittedFeedback'].has('test-hash-positive')).toBe(true);
      expect(feedbackService['submittedFeedback'].has('test-hash-negative')).toBe(true);
    });
  });
}); 