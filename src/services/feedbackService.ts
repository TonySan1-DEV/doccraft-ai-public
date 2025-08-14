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

export interface FeedbackContextData {
  sessionId?: string;
  contentType?:
    | 'suggestion'
    | 'rewrite'
    | 'preview'
    | 'completion'
    | 'correction';
  promptHash?: string;
  modelVersion?: string;
  responseTime?: number;
  tokenCount?: number;
  userTier?: string;
  featureFlags?: string[];
  userPreferences?: {
    tone: string;
    genre: string;
    copilotEnabled: boolean;
    memoryEnabled: boolean;
    defaultCommandView: string;
  };
  browserInfo?: {
    userAgent: string;
    language: string;
    timezone: string;
  };
  pageContext?: {
    url: string;
    title: string;
    component: string;
  };
  interactionData?: {
    clickCount: number;
    scrollDepth: number;
    timeOnPage: number;
  };
}

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
  context_data?: FeedbackContextData;
}

// Feedback submission options
export interface FeedbackSubmissionOptions {
  sessionId?: string;
  contentType?:
    | 'suggestion'
    | 'rewrite'
    | 'preview'
    | 'completion'
    | 'correction';
  contextData?: FeedbackContextData;
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

// Feedback summary data
export interface FeedbackSummaryItem {
  pattern: string;
  totalFeedback: number;
  positiveCount: number;
  negativeCount: number;
  positiveRate: number;
  avgResponseTime: number;
  userSatisfaction: number;
  commonIssues: string[];
  improvementSuggestions: string[];
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
   * Submit user feedback for a pattern
   * TODO: Unit test - test feedback submission with different types and options
   */
  async submitFeedback(
    feedbackType: 'positive' | 'negative',
    sourcePrompt: string,
    patternUsed: string,
    options: FeedbackSubmissionOptions = {}
  ): Promise<{ success: boolean; error?: string; feedbackId?: string }> {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
          return {
            success: false,
            error:
              'Rate limit exceeded. Please wait before submitting more feedback.',
          };
        }
      }

      // Generate prompt hash for deduplication
      const promptHash =
        options.promptHash || this.generatePromptHash(sourcePrompt);

      // Check for duplicate feedback
      const feedbackKey = `${user.id}-${promptHash}-${feedbackType}`;
      if (this.submittedFeedback.has(feedbackKey)) {
        return {
          success: false,
          error: 'Feedback already submitted for this prompt',
        };
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
        p_context_data: options.contextData || {},
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

      // Log telemetry
      this.logFeedbackTelemetry(feedbackType, patternUsed, options);

      return {
        success: true,
        feedbackId: data?.feedback_id,
      };
    } catch (error) {
      console.error('Error in submitFeedback:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Get feedback statistics for patterns
   * TODO: Unit test - test stats retrieval with different filters and time ranges
   */
  async getFeedbackStats(
    userId?: string,
    patternUsed?: string,
    timeRange: string = '30 days'
  ): Promise<FeedbackStats[]> {
    try {
      let query = supabase
        .from('feedback_events')
        .select('pattern_used, feedback_type, created_at');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (patternUsed) {
        query = query.eq('pattern_used', patternUsed);
      }

      if (timeRange) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
        query = query.gte('created_at', daysAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching feedback stats:', error);
        return [];
      }

      // Aggregate statistics
      const statsMap = new Map<string, FeedbackStats>();

      data?.forEach((event: any) => {
        const pattern = event.pattern_used;
        if (!statsMap.has(pattern)) {
          statsMap.set(pattern, {
            pattern_used: pattern,
            total_feedback: 0,
            positive_feedback: 0,
            negative_feedback: 0,
            positive_rate: 0,
            avg_rating: 0,
          });
        }

        const stats = statsMap.get(pattern)!;
        stats.total_feedback++;

        if (event.feedback_type === 'positive') {
          stats.positive_feedback++;
        } else {
          stats.negative_feedback++;
        }
      });

      // Calculate rates
      statsMap.forEach(stats => {
        stats.positive_rate =
          stats.total_feedback > 0
            ? (stats.positive_feedback / stats.total_feedback) * 100
            : 0;
        stats.avg_rating = stats.positive_rate / 20; // Convert to 1-5 scale
      });

      return Array.from(statsMap.values());
    } catch (error) {
      console.error('Error in getFeedbackStats:', error);
      return [];
    }
  }

  /**
   * Get pattern analytics with trend analysis
   */
  async getPatternAnalytics(
    timeRange: string = '30 days'
  ): Promise<PatternAnalytics[]> {
    try {
      const stats = await this.getFeedbackStats(
        undefined,
        undefined,
        timeRange
      );

      return stats.map(stat => {
        // Calculate confidence interval (simplified)
        const n = stat.total_feedback;
        const p = stat.positive_rate / 100;
        const se = Math.sqrt((p * (1 - p)) / n);
        const confidenceInterval = 1.96 * se * 100; // 95% confidence

        // Determine trend (simplified - would need historical data for real trend)
        const trendDirection: 'improving' | 'declining' | 'stable' =
          stat.positive_rate > 70
            ? 'improving'
            : stat.positive_rate < 50
              ? 'declining'
              : 'stable';

        return {
          pattern_used: stat.pattern_used,
          total_usage: stat.total_feedback,
          positive_rate: stat.positive_rate,
          confidence_interval: confidenceInterval,
          trend_direction: trendDirection,
        };
      });
    } catch (error) {
      console.error('Error in getPatternAnalytics:', error);
      return [];
    }
  }

  /**
   * Get recent feedback for a user
   */
  async getUserRecentFeedback(limit: number = 10): Promise<FeedbackEvent[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('feedback_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent feedback:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserRecentFeedback:', error);
      return [];
    }
  }

  /**
   * Get comprehensive feedback summary with insights
   * TODO: Unit test - test summary generation with different feedback datasets
   */
  async getFeedbackSummary(): Promise<FeedbackSummaryItem[]> {
    try {
      const stats = await this.getFeedbackStats();

      return stats.map(stat => {
        // Generate common issues based on negative feedback
        const commonIssues = this.generateCommonIssues(stat);
        const improvementSuggestions =
          this.generateImprovementSuggestions(stat);

        return {
          pattern: stat.pattern_used,
          totalFeedback: stat.total_feedback,
          positiveCount: stat.positive_feedback,
          negativeCount: stat.negative_feedback,
          positiveRate: stat.positive_rate,
          avgResponseTime: this.calculateAvgResponseTime(stat.pattern_used),
          userSatisfaction: stat.avg_rating,
          commonIssues,
          improvementSuggestions,
        };
      });
    } catch (error) {
      console.error('Error in getFeedbackSummary:', error);
      return [];
    }
  }

  /**
   * Check if user has already submitted feedback for a prompt
   */
  async hasSubmittedFeedback(
    promptHash: string,
    feedbackType: 'positive' | 'negative'
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const feedbackKey = `${user.id}-${promptHash}-${feedbackType}`;
      return this.submittedFeedback.has(feedbackKey);
    } catch (error) {
      console.error('Error in hasSubmittedFeedback:', error);
      return false;
    }
  }

  /**
   * Clear feedback cache (useful for testing)
   */
  clearFeedbackCache(): void {
    this.submittedFeedback.clear();
    this.rateLimitMap.clear();
    this.saveSubmittedFeedback();
  }

  // Private helper methods

  private generatePromptHash(prompt: string): string {
    // Simple hash function for prompt deduplication
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private getCurrentPreferences(): {
    copilotEnabled: boolean;
    memoryEnabled: boolean;
  } {
    // This would integrate with the actual preferences system
    return {
      copilotEnabled: true,
      memoryEnabled: true,
    };
  }

  private getSubmissionsInWindow(userId: string, now: number): number {
    let count = 0;
    this.rateLimitMap.forEach((timestamp, key) => {
      if (key.startsWith(userId) && now - timestamp < this.RATE_LIMIT_WINDOW) {
        count++;
      }
    });
    return count;
  }

  private loadSubmittedFeedback(): void {
    try {
      const stored = localStorage.getItem('submittedFeedback');
      if (stored) {
        this.submittedFeedback = new Set(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading submitted feedback:', error);
    }
  }

  private saveSubmittedFeedback(): void {
    try {
      localStorage.setItem(
        'submittedFeedback',
        JSON.stringify(Array.from(this.submittedFeedback))
      );
    } catch (error) {
      console.error('Error saving submitted feedback:', error);
    }
  }

  private logFeedbackTelemetry(
    feedbackType: 'positive' | 'negative',
    patternUsed: string,
    options: FeedbackSubmissionOptions
  ): void {
    if (typeof window !== 'undefined' && (window as any).logTelemetryEvent) {
      (window as any).logTelemetryEvent('feedback_submitted', {
        feedbackType,
        patternUsed,
        contentType: options.contentType,
        sessionId: options.sessionId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private generateCommonIssues(stat: FeedbackStats): string[] {
    const issues: string[] = [];

    if (stat.positive_rate < 50) {
      issues.push('Low user satisfaction');
    }
    if (stat.total_feedback < 10) {
      issues.push('Insufficient feedback data');
    }
    if (stat.negative_feedback > stat.positive_feedback) {
      issues.push('More negative than positive feedback');
    }

    return issues;
  }

  private generateImprovementSuggestions(stat: FeedbackStats): string[] {
    const suggestions: string[] = [];

    if (stat.positive_rate < 70) {
      suggestions.push('Review and improve pattern effectiveness');
    }
    if (stat.total_feedback < 20) {
      suggestions.push('Collect more user feedback');
    }
    if (stat.negative_feedback > 0) {
      suggestions.push(
        'Analyze negative feedback for improvement opportunities'
      );
    }

    return suggestions;
  }

  /**
   * Calculate average response time for a pattern
   * TODO: Unit test - test response time calculation with different patterns
   */
  private calculateAvgResponseTime(_pattern: string): number {
    // This would integrate with actual response time tracking
    return Math.random() * 2000 + 500; // Placeholder
  }
}

// Export singleton instance
export const feedbackService = FeedbackService.getInstance();
