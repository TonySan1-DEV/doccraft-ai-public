// Advanced Rate Limiter for DocCraft-AI
// Tier-based rate limiting with adaptive limits and burst handling

// Base interface for rate limiting operations
export interface IRateLimiter {
  getTierInfo(): {
    tier: string;
    limit: number;
    window: number;
    burstLimit: number;
  };
  updateTier(newTier: string): void;
  handleRateLimitExceeded(): { retryAfter: number; message: string };
  isApproachingLimit(): boolean;
  getRateLimitHeaders(): Record<string, string>;
  increaseLimitTemporarily(increaseFactor: number, duration: number): void;
  getStatistics(): {
    totalRequests: number;
    averageRequestsPerWindow: number;
    peakRequests: number;
    limitUtilization: number;
  };
}

// Synchronous rate limiter interface
export interface ISyncRateLimiter extends IRateLimiter {
  checkLimit(): boolean;
  getCurrentUsage(): {
    requests: number;
    limit: number;
    remaining: number;
    resetTime: Date;
  };
}

// Asynchronous rate limiter interface
export interface IAsyncRateLimiter extends IRateLimiter {
  checkLimit(): Promise<boolean>;
  getCurrentUsage(): Promise<{
    requests: number;
    limit: number;
    remaining: number;
    resetTime: Date;
  }>;
}

// Abstract base class with common functionality
export abstract class BaseRateLimiter implements IRateLimiter {
  protected userId: string;
  protected userTier: string;
  protected limit: number;
  protected window: number; // milliseconds
  protected burstLimit: number;
  protected adaptiveLimits: Map<string, number>;

  constructor(userId: string, userTier: string) {
    this.userId = userId;
    this.userTier = userTier;
    this.limit = this.getTierLimit(userTier);
    this.window = this.getTierWindow(userTier);
    this.burstLimit = this.getBurstLimit(userTier);
    this.adaptiveLimits = new Map();

    // Initialize adaptive limits
    this.initializeAdaptiveLimits();
  }

  protected getTierLimit(userTier: string): number {
    const tierLimits = {
      Free: 100, // 100 requests per window
      Pro: 500, // 500 requests per window
      Admin: 2000, // 2000 requests per window
    };

    return tierLimits[userTier as keyof typeof tierLimits] || 100;
  }

  protected getTierWindow(userTier: string): number {
    const tierWindows = {
      Free: 60 * 60 * 1000, // 1 hour
      Pro: 60 * 60 * 1000, // 1 hour
      Admin: 60 * 60 * 1000, // 1 hour
    };

    return tierWindows[userTier as keyof typeof tierWindows] || 60 * 60 * 1000;
  }

  protected getBurstLimit(userTier: string): number {
    const burstLimits = {
      Free: 10, // 10 requests burst
      Pro: 50, // 50 requests burst
      Admin: 200, // 200 requests burst
    };

    return burstLimits[userTier as keyof typeof burstLimits] || 10;
  }

  protected initializeAdaptiveLimits(): void {
    // Initialize adaptive limits based on user behavior
    this.adaptiveLimits.set('normal', this.limit);
    this.adaptiveLimits.set('high_activity', this.limit * 1.5);
    this.adaptiveLimits.set('low_activity', this.limit * 0.7);
    this.adaptiveLimits.set('suspicious', this.limit * 0.3);
  }

  protected applyAdaptiveLimits(): void {
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

  protected assessUserBehavior():
    | 'normal'
    | 'high_activity'
    | 'low_activity'
    | 'suspicious' {
    // This would analyze user behavior patterns
    // For now, return normal behavior
    return 'normal';
  }

  // Public methods for external access
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
    const timeUntilReset = this.window - now.getTime();
    const retryAfter = Math.ceil(timeUntilReset / 1000); // Convert to seconds

    return {
      retryAfter: Math.max(0, retryAfter),
      message: `Rate limit exceeded. Try again in ${Math.max(0, retryAfter)} seconds.`,
    };
  }

  // Method to check if user is approaching limit
  isApproachingLimit(): boolean {
    // This will be implemented by subclasses
    return false;
  }

  // Method to get rate limit headers for API responses
  getRateLimitHeaders(): Record<string, string> {
    // This will be implemented by subclasses
    return {
      'X-RateLimit-Limit': this.limit.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': '0',
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
    // This will be implemented by subclasses
    return {
      totalRequests: 0,
      averageRequestsPerWindow: 0,
      peakRequests: 0,
      limitUtilization: 0,
    };
  }
}

export class RateLimiter extends BaseRateLimiter implements ISyncRateLimiter {
  private requests: number;
  private windowStart: Date;

  constructor(userId: string, userTier: string) {
    super(userId, userTier);
    this.requests = 0;
    this.windowStart = new Date();
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

  isApproachingLimit(): boolean {
    const usagePercentage = this.requests / this.limit;
    return usagePercentage >= 0.8; // 80% of limit
  }

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

  getStatistics(): {
    totalRequests: number;
    averageRequestsPerWindow: number;
    peakRequests: number;
    limitUtilization: number;
  } {
    return {
      totalRequests: this.requests,
      averageRequestsPerWindow: this.requests,
      peakRequests: this.requests,
      limitUtilization: (this.requests / this.limit) * 100,
    };
  }
}

// Advanced Rate Limiter with Redis backend (for production use)
export class RedisRateLimiter
  extends BaseRateLimiter
  implements IAsyncRateLimiter
{
  private redisClient: any; // Redis client instance
  private keyPrefix: string;
  private fallbackLimiter: RateLimiter;

  constructor(userId: string, userTier: string, redisClient: any) {
    super(userId, userTier);
    this.redisClient = redisClient;
    this.keyPrefix = `rate_limit:${userId}`;
    this.fallbackLimiter = new RateLimiter(userId, userTier);
  }

  // Override the base class methods to be async
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
      return this.fallbackLimiter.checkLimit();
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
      return this.fallbackLimiter.getCurrentUsage();
    }
  }

  // Implement remaining interface methods
  isApproachingLimit(): boolean {
    // This would need to be async in Redis, but for now return false
    // In a real implementation, you might want to make this async too
    return false;
  }

  getRateLimitHeaders(): Record<string, string> {
    // This would need to be async in Redis, but for now return basic info
    return {
      'X-RateLimit-Limit': this.limit.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': '0',
      'X-RateLimit-User-Tier': this.userTier,
    };
  }

  getStatistics(): {
    totalRequests: number;
    averageRequestsPerWindow: number;
    peakRequests: number;
    limitUtilization: number;
  } {
    // This would need to be async in Redis, but for now return basic info
    return {
      totalRequests: 0,
      averageRequestsPerWindow: 0,
      peakRequests: 0,
      limitUtilization: 0,
    };
  }
}

// Rate Limiter Factory
export class RateLimiterFactory {
  private static limiters = new Map<string, IRateLimiter>();
  private static redisClient: any;

  static setRedisClient(client: any): void {
    RateLimiterFactory.redisClient = client;
  }

  static getRateLimiter(userId: string, userTier: string): IRateLimiter {
    const key = `${userId}:${userTier}`;

    if (!RateLimiterFactory.limiters.has(key)) {
      let limiter: IRateLimiter;

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

  static getSyncRateLimiter(
    userId: string,
    userTier: string
  ): ISyncRateLimiter {
    const limiter = RateLimiterFactory.getRateLimiter(userId, userTier);
    if (this.isSyncRateLimiter(limiter)) {
      return limiter;
    }
    throw new Error('Redis rate limiter cannot be used as sync rate limiter');
  }

  static getAsyncRateLimiter(
    userId: string,
    userTier: string
  ): IAsyncRateLimiter {
    const limiter = RateLimiterFactory.getRateLimiter(userId, userTier);
    if (this.isAsyncRateLimiter(limiter)) {
      return limiter;
    }
    throw new Error(
      'In-memory rate limiter cannot be used as async rate limiter'
    );
  }

  private static isSyncRateLimiter(
    limiter: IRateLimiter
  ): limiter is ISyncRateLimiter {
    return (
      limiter instanceof RateLimiter && !(limiter instanceof RedisRateLimiter)
    );
  }

  private static isAsyncRateLimiter(
    limiter: IRateLimiter
  ): limiter is IAsyncRateLimiter {
    return limiter instanceof RedisRateLimiter;
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
    syncLimiters: number;
    asyncLimiters: number;
  } {
    const userTiers: Record<string, number> = {};
    let syncLimiters = 0;
    let asyncLimiters = 0;

    const entries = Array.from(RateLimiterFactory.limiters.entries());
    for (const [key, limiter] of entries) {
      const tier = limiter.getTierInfo().tier;
      userTiers[tier] = (userTiers[tier] || 0) + 1;

      if (this.isSyncRateLimiter(limiter)) {
        syncLimiters++;
      } else if (this.isAsyncRateLimiter(limiter)) {
        asyncLimiters++;
      }
    }

    return {
      totalLimiters: RateLimiterFactory.limiters.size,
      userTiers,
      syncLimiters,
      asyncLimiters,
    };
  }
}
