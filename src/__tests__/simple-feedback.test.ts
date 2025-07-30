// Simple test to verify feedback system functionality
import { FeedbackService } from '../services/feedbackService';

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

describe('Feedback System - Simple Test', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    // Reset singleton
    (FeedbackService as any).instance = undefined;
  });

  it('should be a singleton', () => {
    const instance1 = FeedbackService.getInstance();
    const instance2 = FeedbackService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should handle authentication errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const feedbackService = FeedbackService.getInstance();
    const result = await feedbackService.submitFeedback(
      'positive',
      'test prompt',
      'test pattern'
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('User not authenticated');
  });

  it('should submit feedback successfully', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: 'feedback-id-123',
      error: null
    });

    const feedbackService = FeedbackService.getInstance();
    const result = await feedbackService.submitFeedback(
      'positive',
      'test prompt',
      'test pattern',
      {
        contentType: 'suggestion',
        contextData: { test: 'data' }
      }
    );

    expect(result.success).toBe(true);
    expect(result.feedbackId).toBe('feedback-id-123');
  });
}); 