// Advanced Rate Limiter for DocCraft-AI
// Tier-based rate limiting with adaptive limits and burst handling

export class RateLimiter {
  private userId: string;
  private userTier: string;
  private requests: number;
  private windowStart: Date;
  private limit: number;
  private window: number; // milliseconds
  private burstLimit: number;
  private adaptiveLimits: Map<string, number>;

  constructor(userId: string, userTier: string) {
    this.userId = userId;
    this.userTier = userTier;
    this.requests = 0;
    this.windowStart = new Date();
    this.limit = this.getTierLimit(userTier);
    this.window = this.getTierWindow(userTier);
    this.burstLimit = this.getBurstLimit(userTier);
    this.adaptiveLimits = new Map();

    // Initialize adaptive limits
    this.initializeAdaptiveLimits();
  }

  checkLimit(): boolean {
    const now = new Date();
    const timeSinceWindowStart = now.getTime() - this.windowStart.getTime();

    // Check if we need to reset the window
    if (timeSinceWindowStart >= this.window) {
      this.resetWindow();
    }

    // Check if current requests exceed the limit
    if (this.requests >= this.limit) {
      return false; // Rate limit exceeded
    }

    // Increment request count
    this.requests++;

    // Check burst limit
    if (this.requests > this.burstLimit) {
      return false; // Burst limit exceeded
    }

    return true; // Request allowed
  }

  private resetWindow(): void {
    this.requests = 0;
    this.windowStart = new Date();

    // Apply adaptive limits if available
    this.applyAdaptiveLimits();
  }

  private getTierLimit(userTier: string): number {
    const tierLimits = {
      Free: 100, // 100 requests per window
      Pro: 500, // 500 requests per window
      Admin: 2000, // 2000 requests per window
    };

    return tierLimits[userTier as keyof typeof tierLimits] || 100;
  }

  private getTierWindow(userTier: string): number {
    const tierWindows = {
      Free: 60 * 60 * 1000, // 1 hour
      Pro: 60 * 60 * 1000, // 1 hour
      Admin: 60 * 60 * 1000, // 1 hour
    };

    return tierWindows[userTier as keyof typeof tierWindows] || 60 * 60 * 1000;
  }

  private getBurstLimit(userTier: string): number {
    const burstLimits = {
      Free: 10, // 10 requests burst
      Pro: 50, // 50 requests burst
      Admin: 200, // 200 requests burst
    };

    return burstLimits[userTier as keyof typeof burstLimits] || 10;
  }

  private initializeAdaptiveLimits(): void {
    // Initialize adaptive limits based on user behavior
    this.adaptiveLimits.set('normal', this.limit);
    this.adaptiveLimits.set('high_activity', this.limit * 1.5);
    this.adaptiveLimits.set('low_activity', this.limit * 0.7);
    this.adaptiveLimits.set('suspicious', this.limit * 0.3);
  }

  private applyAdaptiveLimits(): void {
    // Apply adaptive limits based on user behavior patterns
    const userBehavior = this.assessUserBehavior();

    if (userBehavior === 'suspicious') {
      this.limit = this.adaptiveLimits.get('suspicious') || this.limit;
    } else if (userBehavior === 'high_activity') {
      this.limit = this.adaptiveLimits.get('high_activity') || this.limit;
    } else if (userBehavior === 'low_activity') {
      this.limit = this.adaptiveLimits.get('low_activity') || this.limit;
    } else {
      this.limit = this.adaptiveLimits.get('normal') || this.limit;
    }
  }

  private assessUserBehavior():
    | 'normal'
    | 'high_activity'
    | 'low_activity'
    | 'suspicious' {
    // This would analyze user behavior patterns
    // For now, return normal behavior
    return 'normal';
  }

  // Public methods for external access
  getCurrentUsage(): {
    requests: number;
    limit: number;
    remaining: number;
    resetTime: Date;
  } {
    const remaining = Math.max(0, this.limit - this.requests);
    const resetTime = new Date(this.windowStart.getTime() + this.window);

    return {
      requests: this.requests,
      limit: this.limit,
      remaining,
      resetTime,
    };
  }

  getTierInfo(): {
    tier: string;
    limit: number;
    window: number;
    burstLimit: number;
  } {
    return {
      tier: this.userTier,
      limit: this.limit,
      window: this.window,
      burstLimit: this.burstLimit,
    };
  }

  updateTier(newTier: string): void {
    this.userTier = newTier;
    this.limit = this.getTierLimit(newTier);
    this.window = this.getTierWindow(newTier);
    this.burstLimit = this.getBurstLimit(newTier);

    // Reinitialize adaptive limits for new tier
    this.initializeAdaptiveLimits();
  }

  // Method to handle rate limit exceeded
  handleRateLimitExceeded(): { retryAfter: number; message: string } {
    const now = new Date();
    const timeUntilReset =
      this.windowStart.getTime() + this.window - now.getTime();
    const retryAfter = Math.ceil(timeUntilReset / 1000); // Convert to seconds

    return {
      retryAfter,
      message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
    };
  }

  // Method to check if user is approaching limit
  isApproachingLimit(): boolean {
    const usagePercentage = this.requests / this.limit;
    return usagePercentage >= 0.8; // 80% of limit
  }

  // Method to get rate limit headers for API responses
  getRateLimitHeaders(): Record<string, string> {
    const usage = this.getCurrentUsage();

    return {
      'X-RateLimit-Limit': usage.limit.toString(),
      'X-RateLimit-Remaining': usage.remaining.toString(),
      'X-RateLimit-Reset': Math.floor(
        usage.resetTime.getTime() / 1000
      ).toString(),
      'X-RateLimit-User-Tier': this.userTier,
    };
  }

  // Method to temporarily increase limits for special circumstances
  increaseLimitTemporarily(increaseFactor: number, duration: number): void {
    const originalLimit = this.limit;
    this.limit = Math.floor(this.limit * increaseFactor);

    // Reset to original limit after duration
    setTimeout(() => {
      this.limit = originalLimit;
    }, duration);
  }

  // Method to get rate limit statistics
  getStatistics(): {
    totalRequests: number;
    averageRequestsPerWindow: number;
    peakRequests: number;
    limitUtilization: number;
  } {
    // This would track statistics over time
    // For now, return basic information
    return {
      totalRequests: this.requests,
      averageRequestsPerWindow: this.requests,
      peakRequests: this.requests,
      limitUtilization: (this.requests / this.limit) * 100,
    };
  }
}

// Advanced Rate Limiter with Redis backend (for production use)
export class RedisRateLimiter extends RateLimiter {
  private redisClient: any; // Redis client instance
  private keyPrefix: string;

  constructor(userId: string, userTier: string, redisClient: any) {
    super(userId, userTier);
    this.redisClient = redisClient;
    this.keyPrefix = `rate_limit:${userId}`;
  }

  async checkLimit(): Promise<boolean> {
    try {
      const now = Date.now();
      const windowKey = `${this.keyPrefix}:${Math.floor(now / this.window)}`;

      // Use Redis pipeline for atomic operations
      const pipeline = this.redisClient.pipeline();

      // Increment request count
      pipeline.incr(windowKey);

      // Set expiration for the window key
      pipeline.expire(windowKey, Math.ceil(this.window / 1000));

      // Get current count
      pipeline.get(windowKey);

      const results = await pipeline.exec();
      const currentCount = parseInt(results[2][1] as string, 10);

      // Check if limit exceeded
      if (currentCount > this.limit) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Redis rate limiter error:', error);
      // Fallback to in-memory rate limiting
      return super.checkLimit();
    }
  }

  async getCurrentUsage(): Promise<{
    requests: number;
    limit: number;
    remaining: number;
    resetTime: Date;
  }> {
    try {
      const now = Date.now();
      const windowKey = `${this.keyPrefix}:${Math.floor(now / this.window)}`;

      const currentCount = await this.redisClient.get(windowKey);
      const requests = currentCount ? parseInt(currentCount, 10) : 0;
      const remaining = Math.max(0, this.limit - requests);
      const resetTime = new Date(
        Math.floor(now / this.window) * this.window + this.window
      );

      return {
        requests,
        limit: this.limit,
        remaining,
        resetTime,
      };
    } catch (error) {
      console.error('Redis rate limiter error:', error);
      // Fallback to in-memory rate limiting
      return super.getCurrentUsage();
    }
  }
}

// Rate Limiter Factory
export class RateLimiterFactory {
  private static limiters = new Map<string, RateLimiter>();
  private static redisClient: any;

  static setRedisClient(client: any): void {
    RateLimiterFactory.redisClient = client;
  }

  static getRateLimiter(userId: string, userTier: string): RateLimiter {
    const key = `${userId}:${userTier}`;

    if (!RateLimiterFactory.limiters.has(key)) {
      let limiter: RateLimiter;

      if (RateLimiterFactory.redisClient) {
        limiter = new RedisRateLimiter(
          userId,
          userTier,
          RateLimiterFactory.redisClient
        );
      } else {
        limiter = new RateLimiter(userId, userTier);
      }

      RateLimiterFactory.limiters.set(key, limiter);
    }

    return RateLimiterFactory.limiters.get(key)!;
  }

  static updateUserTier(userId: string, newTier: string): void {
    const key = `${userId}:${newTier}`;
    const oldKey = Array.from(RateLimiterFactory.limiters.keys()).find(k =>
      k.startsWith(`${userId}:`)
    );

    if (oldKey) {
      const limiter = RateLimiterFactory.limiters.get(oldKey);
      if (limiter) {
        limiter.updateTier(newTier);
        RateLimiterFactory.limiters.delete(oldKey);
        RateLimiterFactory.limiters.set(key, limiter);
      }
    }
  }

  static clearLimiters(): void {
    RateLimiterFactory.limiters.clear();
  }

  static getLimiterStats(): {
    totalLimiters: number;
    userTiers: Record<string, number>;
  } {
    const userTiers: Record<string, number> = {};

    for (const [key, limiter] of RateLimiterFactory.limiters) {
      const tier = limiter.getTierInfo().tier;
      userTiers[tier] = (userTiers[tier] || 0) + 1;
    }

    return {
      totalLimiters: RateLimiterFactory.limiters.size,
      userTiers,
    };
  }
}
