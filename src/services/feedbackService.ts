// MCP Context Block
/*
{
  file: "feedbackService.ts",
  role: "backend-developer",
  allowedActions: ["feedback", "analytics", "security"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "feedback_system"
}
*/

import { supabase } from '../lib/supabase';


// Feedback event interface
export interface FeedbackEvent {
  id: string;
  user_id: string;
  timestamp: string;
  feedback_type: 'positive' | 'negative';
  source_prompt: string;
  pattern_used: string;
  copilot_enabled: boolean;
  memory_enabled: boolean;
  session_id?: string;
  content_type?: string;
  context_data?: Record<string, any>;
}

// Feedback submission options
export interface FeedbackSubmissionOptions {
  sessionId?: string;
  contentType?: 'suggestion' | 'rewrite' | 'preview' | 'completion' | 'correction';
  contextData?: Record<string, any>;
  promptHash?: string;
}

// Feedback statistics
export interface FeedbackStats {
  pattern_used: string;
  total_feedback: number;
  positive_feedback: number;
  negative_feedback: number;
  positive_rate: number;
  avg_rating: number;
}

// Pattern analytics
export interface PatternAnalytics {
  pattern_used: string;
  total_usage: number;
  positive_rate: number;
  confidence_interval: number;
  trend_direction: 'improving' | 'declining' | 'stable';
}

// Feedback service class
export class FeedbackService {
  private static instance: FeedbackService;
  private submittedFeedback: Set<string> = new Set();
  private rateLimitMap: Map<string, number> = new Map();
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private readonly MAX_FEEDBACK_PER_WINDOW = 10;

  private constructor() {
    this.loadSubmittedFeedback();
  }

  static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService();
    }
    return FeedbackService.instance;
  }

  /**
   * Submit feedback for an AI-generated suggestion
   */
  async submitFeedback(
    feedbackType: 'positive' | 'negative',
    sourcePrompt: string,
    patternUsed: string,
    options: FeedbackSubmissionOptions = {}
  ): Promise<{ success: boolean; error?: string; feedbackId?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Rate limiting check
      const rateLimitKey = `${user.id}-${feedbackType}`;
      const now = Date.now();
      const lastSubmission = this.rateLimitMap.get(rateLimitKey) || 0;
      
      if (now - lastSubmission < this.RATE_LIMIT_WINDOW) {
        const submissionsInWindow = this.getSubmissionsInWindow(user.id, now);
        if (submissionsInWindow >= this.MAX_FEEDBACK_PER_WINDOW) {
          return { success: false, error: 'Rate limit exceeded. Please wait before submitting more feedback.' };
        }
      }

      // Generate prompt hash for deduplication
      const promptHash = options.promptHash || this.generatePromptHash(sourcePrompt);
      
      // Check for duplicate feedback
      const feedbackKey = `${user.id}-${promptHash}-${feedbackType}`;
      if (this.submittedFeedback.has(feedbackKey)) {
        return { success: false, error: 'Feedback already submitted for this prompt' };
      }

      // Get current preferences
      const preferences = this.getCurrentPreferences();
      
      // Create feedback event
      const { data, error } = await supabase.rpc('create_feedback_event', {
        p_user_id: user.id,
        p_feedback_type: feedbackType,
        p_source_prompt: sourcePrompt,
        p_pattern_used: patternUsed,
        p_copilot_enabled: preferences.copilotEnabled,
        p_memory_enabled: preferences.memoryEnabled,
        p_session_id: options.sessionId,
        p_content_type: options.contentType,
        p_context_data: options.contextData || {}
      });

      if (error) {
        console.error('Error submitting feedback:', error);
        return { success: false, error: 'Failed to submit feedback' };
      }

      // Update rate limiting
      this.rateLimitMap.set(rateLimitKey, now);
      
      // Mark as submitted
      this.submittedFeedback.add(feedbackKey);
      this.saveSubmittedFeedback();

      return { 
        success: true, 
        feedbackId: data 
      };

    } catch (error) {
      console.error('Error in submitFeedback:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get feedback statistics for patterns
   */
  async getFeedbackStats(
    userId?: string,
    patternUsed?: string,
    timeRange: string = '30 days'
  ): Promise<FeedbackStats[]> {
    try {
      const { data, error } = await supabase.rpc('get_feedback_stats', {
        p_user_id: userId,
        p_pattern_used: patternUsed,
        p_time_range: timeRange
      });

      if (error) {
        console.error('Error getting feedback stats:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFeedbackStats:', error);
      return [];
    }
  }

  /**
   * Get pattern analytics for system improvement
   */
  async getPatternAnalytics(timeRange: string = '30 days'): Promise<PatternAnalytics[]> {
    try {
      const { data, error } = await supabase.rpc('get_pattern_analytics', {
        p_time_range: timeRange
      });

      if (error) {
        console.error('Error getting pattern analytics:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPatternAnalytics:', error);
      return [];
    }
  }

  /**
   * Get user's recent feedback
   */
  async getUserRecentFeedback(limit: number = 10): Promise<FeedbackEvent[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const { data, error } = await supabase.rpc('get_user_recent_feedback', {
        p_user_id: user.id,
        p_limit: limit
      });

      if (error) {
        console.error('Error getting user recent feedback:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserRecentFeedback:', error);
      return [];
    }
  }

  /**
   * Get feedback summary from view
   */
  async getFeedbackSummary(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('feedback_summary')
        .select('*')
        .order('total_feedback', { ascending: false });

      if (error) {
        console.error('Error getting feedback summary:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFeedbackSummary:', error);
      return [];
    }
  }

  /**
   * Check if user has already submitted feedback for a prompt
   */
  async hasSubmittedFeedback(promptHash: string, feedbackType: 'positive' | 'negative'): Promise<boolean> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error('Failed to get user for feedback:', error);
        return false;
      }

      const feedbackKey = `${user.id}-${promptHash}-${feedbackType}`;
      return this.submittedFeedback.has(feedbackKey);
    } catch (error) {
      console.error('Error in hasSubmittedFeedback:', error);
      return false;
    }
  }

  /**
   * Clear feedback cache (useful for testing or user logout)
   */
  clearFeedbackCache(): void {
    this.submittedFeedback.clear();
    this.rateLimitMap.clear();
    localStorage.removeItem('submittedFeedback');
  }

  /**
   * Generate hash for prompt deduplication
   */
  private generatePromptHash(prompt: string): string {
    // Simple hash function for client-side deduplication
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get current user preferences
   */
  private getCurrentPreferences(): { copilotEnabled: boolean; memoryEnabled: boolean } {
    // This would ideally get from the context, but for now we'll use defaults
    // In a real implementation, you'd inject the preferences context
    return {
      copilotEnabled: true,
      memoryEnabled: true
    };
  }

  /**
   * Get submissions count in current window
   */
  private getSubmissionsInWindow(userId: string, now: number): number {
    let count = 0;
    for (const [key, timestamp] of this.rateLimitMap.entries()) {
      if (key.startsWith(userId) && (now - timestamp) < this.RATE_LIMIT_WINDOW) {
        count++;
      }
    }
    return count;
  }

  /**
   * Load submitted feedback from localStorage
   */
  private loadSubmittedFeedback(): void {
    try {
      const stored = localStorage.getItem('submittedFeedback');
      if (stored) {
        const feedbackArray = JSON.parse(stored);
        this.submittedFeedback = new Set(feedbackArray);
      }
    } catch (error) {
      console.error('Error loading submitted feedback:', error);
    }
  }

  /**
   * Save submitted feedback to localStorage
   */
  private saveSubmittedFeedback(): void {
    try {
      const feedbackArray = Array.from(this.submittedFeedback);
      localStorage.setItem('submittedFeedback', JSON.stringify(feedbackArray));
    } catch (error) {
      console.error('Error saving submitted feedback:', error);
    }
  }

  /**
   * Sanitize prompt text for storage
   */

}

// Export singleton instance
export const feedbackService = FeedbackService.getInstance(); 