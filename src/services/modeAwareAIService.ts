// MCP Context Block
/*
{
  file: "modeAwareAIService.ts",
  role: "backend-developer",
  allowedActions: ["service", "ai", "mode"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "ai_service"
}
*/

import { runAIAction } from './aiHelperService';
import {
  SystemMode,
  ModeConfiguration,
  WritingContext,
  ModeValidationError,
  MODE_ERROR_CODES,
  validateModeConfiguration,
  validateWritingContext,
  validateModeCompatibility,
  isSystemMode,
  isModeConfiguration,
  isWritingContext,
} from '../types/systemModes';
import { MCPContext } from '../types/domain';
import { performanceMonitor } from '../monitoring/performanceMonitor';

/**
 * Enhanced Cached Response Interface
 */
interface CachedResponse {
  response: AIResponse;
  timestamp: number;
  mode: SystemMode;
  contextHash: string;
  requestHash: string;
}

/**
 * Comprehensive Performance Metrics Interface
 */
interface PerformanceMetrics {
  requestCount: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  slowRequestCount: number;
  lastOptimized: number;
  memoryUsage: number;
  modeTransitionTimes: Map<SystemMode, number[]>;
}

/**
 * AI Request Interface
 */
export interface AIRequest {
  type:
    | 'emotion_analysis'
    | 'plot_suggestion'
    | 'style_enhancement'
    | 'theme_analysis'
    | 'general_writing';

  content: string;
  explicitUserInitiated: boolean;
  context: WritingContext;
  enhancementLevel?: 'minimal' | 'collaborative' | 'comprehensive';
  suggestionStyle?: 'factual_only' | 'options_based' | 'proactive_assistance';
  creativityLevel?: 'none' | 'enhancement_focused' | 'vision_amplification';
  userApprovalRequired?: boolean;
  autoEnhancements?: Array<{
    type: string;
    content: string;
    confidence: number;
    reasoning: string;
  }>;
}

/**
 * AI Response Interface
 */
export interface AIResponse {
  type: 'content' | 'suggestion' | 'silent' | 'enhancement';
  content: string | null;
  suggestions?: Array<{
    type: string;
    content: string;
    priority: 'low' | 'medium' | 'high';
    reasoning: string;
  }>;
  requiresApproval?: boolean;
  modeMetadata?: {
    initiativeLevel: string;
    userControlLevel: number;
    interventionStyle: string;
  };
  error?: ModeValidationError;
  isFallback?: boolean;
  autoEnhancements?: Array<{
    type: string;
    content: string;
    confidence: number;
    reasoning: string;
  }>;
}

/**
 * Service Configuration Interface
 */
export interface ModeAwareAIServiceConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  enableGracefulDegradation: boolean;
  fallbackMode: SystemMode;
  requestTimeout: number;
  enableDetailedLogging: boolean;
  cacheTTL: number;
  maxCacheSize: number;
  debounceDelay: number;
}

/**
 * Intelligent Request Cache System
 * Optimized for high-performance caching with LRU eviction
 */
class RequestCache {
  private cache = new Map<string, CachedResponse>();
  private readonly CACHE_TTL = 30000; // 30 seconds
  private readonly MAX_CACHE_SIZE = 100;
  private readonly CLEANUP_INTERVAL = 60000; // 1 minute
  private cleanupTimer: NodeJS.Timeout | null = null;
  private accessOrder = new Map<string, number>(); // For LRU tracking

  constructor() {
    this.startCleanupTimer();
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.CACHE_TTL) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.accessOrder.delete(key);
    });

    // LRU eviction if cache is still too large
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.accessOrder.entries());
      entries.sort((a, b) => a[1] - b[1]);

      const toRemove = entries.slice(0, entries.length - this.MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => {
        this.cache.delete(key);
        this.accessOrder.delete(key);
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `Cache cleanup: ${expiredKeys.length} expired, ${this.cache.size} remaining`
      );
    }
  }

  get(key: string): AIResponse | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      // Update access order for LRU
      this.accessOrder.set(key, Date.now());
      return cached.response;
    }

    if (cached) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
    }
    return null;
  }

  set(
    key: string,
    response: AIResponse,
    mode: SystemMode,
    contextHash: string,
    requestHash: string
  ): void {
    // Implement LRU eviction before adding
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestEntry = Array.from(this.accessOrder.entries()).sort(
        (a, b) => a[1] - b[1]
      )[0];
      if (oldestEntry) {
        this.cache.delete(oldestEntry[0]);
        this.accessOrder.delete(oldestEntry[0]);
      }
    }

    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      mode,
      contextHash,
      requestHash,
    });
    this.accessOrder.set(key, Date.now());
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }

  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // Will be calculated by the service
    };
  }
}

/**
 * Optimized Hashing and Validation Utilities
 * Lightweight and fast for performance-critical paths
 */
class HashingUtils {
  static hashContext(context: WritingContext): string {
    // Create lightweight hash of only relevant context properties
    const relevantContext = {
      documentType: context.documentType,
      writingPhase: context.writingPhase,
      userGoals: context.userGoals?.slice(0, 3), // Limit for performance
      userExperience: context.userExperience,
    };

    try {
      const jsonString = JSON.stringify(relevantContext);
      return btoa(jsonString).slice(0, 16);
    } catch (error) {
      console.warn('Context hashing failed:', error);
      return 'default-context';
    }
  }

  static hashRequest(request: AIRequest): string {
    // Create fast hash without processing large content
    const requestSummary = {
      type: request.type,
      contentLength: request.content?.length || 0,
      contentHash: request.content
        ? this.simpleStringHash(request.content.slice(0, 100))
        : '',
      enhancementLevel: request.enhancementLevel,
      explicitUserInitiated: request.explicitUserInitiated,
    };

    try {
      const jsonString = JSON.stringify(requestSummary);
      return btoa(jsonString).slice(0, 16);
    } catch (error) {
      console.warn('Request hashing failed:', error);
      return 'default-request';
    }
  }

  private static simpleStringHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}

/**
 * Optimized Validation Schemas with Lazy Loading
 * Fast validation without Zod for performance-critical paths
 */
class OptimizedValidation {
  private static schemaCache = new Map<string, any>();

  static validateRequest(request: AIRequest): boolean {
    // Fast validation without Zod for performance-critical paths
    if (!request || typeof request !== 'object') return false;
    if (!request.type || typeof request.type !== 'string') return false;
    if (request.type.length > 50) return false;
    if (request.content && request.content.length > 50000) return false; // 50KB limit
    if (typeof request.explicitUserInitiated !== 'boolean') return false;

    return true;
  }

  static validateMode(mode: any): mode is SystemMode {
    return mode === 'MANUAL' || mode === 'HYBRID' || mode === 'FULLY_AUTO';
  }

  static validateContext(context: WritingContext): boolean {
    // Lightweight context validation
    if (!context || typeof context !== 'object') return false;
    if (!context.documentType || typeof context.documentType !== 'string')
      return false;
    return true;
  }
}

/**
 * Performance Monitor with Comprehensive Metrics
 * Tracks and analyzes performance for optimization
 */
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    slowRequestCount: 0,
    lastOptimized: Date.now(),
    memoryUsage: 0,
    modeTransitionTimes: new Map(),
  };

  private responseTimes: number[] = [];
  private readonly MAX_RESPONSE_TIME_SAMPLES = 100;
  private readonly SLOW_REQUEST_THRESHOLD = 1000; // 1 second

  recordRequest(duration: number, cacheHit: boolean, mode: SystemMode): void {
    this.metrics.requestCount++;

    if (cacheHit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }

    // Track response times
    this.responseTimes.push(duration);
    if (this.responseTimes.length > this.MAX_RESPONSE_TIME_SAMPLES) {
      this.responseTimes.shift();
    }

    // Update average
    this.metrics.averageResponseTime =
      this.responseTimes.reduce((sum, time) => sum + time, 0) /
      this.responseTimes.length;

    // Track slow requests
    if (duration > this.SLOW_REQUEST_THRESHOLD) {
      this.metrics.slowRequestCount++;
    }

    // Track mode transition times
    if (!this.metrics.modeTransitionTimes.has(mode)) {
      this.metrics.modeTransitionTimes.set(mode, []);
    }
    const modeTimes = this.metrics.modeTransitionTimes.get(mode)!;
    modeTimes.push(duration);
    if (modeTimes.length > 50) {
      modeTimes.shift();
    }

    // Update memory usage if available
    if ('memory' in performance) {
      this.metrics.memoryUsage =
        (performance as any).memory?.usedJSHeapSize || 0;
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getCacheHitRate(): number {
    const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
    return totalRequests > 0 ? this.metrics.cacheHits / totalRequests : 0;
  }

  getPerformanceReport(): {
    averageResponseTime: number;
    cacheHitRate: number;
    slowRequestPercentage: number;
    totalRequests: number;
    memoryUsageMB: number;
    modePerformance: Record<
      SystemMode,
      { average: number; count: number; target: number }
    >;
  } {
    const modePerformance: Record<
      SystemMode,
      { average: number; count: number; target: number }
    > = {
      MANUAL: { average: 0, count: 0, target: 500 },
      HYBRID: { average: 0, count: 0, target: 500 },
      FULLY_AUTO: { average: 0, count: 0, target: 500 },
    };

    // Calculate mode performance metrics
    for (const [mode, times] of this.metrics.modeTransitionTimes.entries()) {
      const average = times.reduce((sum, time) => sum + time, 0) / times.length;
      modePerformance[mode] = {
        average,
        count: times.length,
        target: 500, // Target: <500ms
      };
    }

    return {
      averageResponseTime: Math.round(this.metrics.averageResponseTime),
      cacheHitRate: Math.round(this.getCacheHitRate() * 100),
      slowRequestPercentage: Math.round(
        (this.metrics.slowRequestCount / this.metrics.requestCount) * 100
      ),
      totalRequests: this.metrics.requestCount,
      memoryUsageMB: Math.round(this.metrics.memoryUsage / 1024 / 1024),
      modePerformance,
    };
  }

  reset(): void {
    this.metrics = {
      requestCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      slowRequestCount: 0,
      lastOptimized: Date.now(),
      memoryUsage: 0,
      modeTransitionTimes: new Map(),
    };
    this.responseTimes = [];
  }
}

/**
 * Request Debouncing System
 * Prevents rapid-fire requests and optimizes performance
 */
class RequestDebouncer {
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private pendingRequests = new Map<string, Promise<any>>();
  private readonly DEBOUNCE_DELAY = 300; // 300ms

  async debounce<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // If there's already a pending request for this key, return it
    const existingRequest = this.pendingRequests.get(key);
    if (existingRequest) {
      return existingRequest as Promise<T>;
    }

    return new Promise<T>((resolve, reject) => {
      // Clear existing timer
      const existingTimer = this.debounceTimers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new timer
      const timer = setTimeout(async () => {
        try {
          this.debounceTimers.delete(key);

          // Create and track the request promise
          const requestPromise = requestFn();
          this.pendingRequests.set(key, requestPromise);

          const result = await requestPromise;
          this.pendingRequests.delete(key);
          resolve(result);
        } catch (error) {
          this.pendingRequests.delete(key);
          reject(error);
        }
      }, this.DEBOUNCE_DELAY);

      this.debounceTimers.set(key, timer);
    });
  }

  cleanup(): void {
    // Clear all timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
    this.pendingRequests.clear();
  }

  getStats(): { activeTimers: number; pendingRequests: number } {
    return {
      activeTimers: this.debounceTimers.size,
      pendingRequests: this.pendingRequests.size,
    };
  }
}

/**
 * Optimized ModeAwareAIService
 * Production-grade performance with intelligent caching and monitoring
 */
export class ModeAwareAIService {
  private requestCache = new RequestCache();
  private performanceMonitor = new PerformanceMonitor();
  private requestDebouncer = new RequestDebouncer();
  private readonly SERVICE_NAME = 'ModeAwareAIService';
  private config: ModeAwareAIServiceConfig;

  constructor(
    private baseAIService: typeof runAIAction,
    private mcpRegistry: any,
    config?: Partial<ModeAwareAIServiceConfig>
  ) {
    this.config = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      enableGracefulDegradation: true,
      fallbackMode: 'HYBRID',
      requestTimeout: 30000,
      enableDetailedLogging: true,
      cacheTTL: 30000,
      maxCacheSize: 100,
      debounceDelay: 300,
      ...config,
    };

    // Setup cleanup on process exit
    if (typeof process !== 'undefined') {
      process.on('beforeExit', () => this.cleanup());
    }
  }

  /**
   * Main request processing method with comprehensive optimization
   */
  async processRequest(
    request: AIRequest,
    context: WritingContext,
    userMode: SystemMode
  ): Promise<AIResponse> {
    const startTime = performance.now();
    const requestSize = JSON.stringify(request).length;
    let success = true;
    let responseSize = 0;

    try {
      // Fast validation
      if (
        !OptimizedValidation.validateRequest(request) ||
        !OptimizedValidation.validateMode(userMode) ||
        !OptimizedValidation.validateContext(context)
      ) {
        throw new Error('Invalid request parameters');
      }

      // Create cache keys
      const contextHash = HashingUtils.hashContext(context);
      const requestHash = HashingUtils.hashRequest(request);
      const cacheKey = `${userMode}-${requestHash}-${contextHash}`;

      // Check cache first
      const cachedResponse = this.requestCache.get(cacheKey);
      if (cachedResponse) {
        const duration = performance.now() - startTime;
        this.performanceMonitor.recordRequest(duration, true, userMode);

        // Record comprehensive performance metrics for cache hit
        performanceMonitor.recordAIPerformance({
          mode: userMode,
          operation: request.type,
          duration,
          cacheHit: true,
          success: true,
          requestSize,
          responseSize: JSON.stringify(cachedResponse).length,
          userId: context.documentType, // Using documentType as identifier
        });

        return cachedResponse;
      }

      // Debounce similar requests
      const debounceKey = `${userMode}-${request.type}-${contextHash}`;

      const response = await this.requestDebouncer.debounce(
        debounceKey,
        async () => {
          return this.processRequestInternal(request, context, userMode);
        }
      );

      responseSize = JSON.stringify(response).length;

      // Cache successful response
      this.requestCache.set(
        cacheKey,
        response,
        userMode,
        contextHash,
        requestHash
      );

      // Record performance metrics
      const duration = performance.now() - startTime;
      this.performanceMonitor.recordRequest(duration, false, userMode);

      // Log slow requests
      if (duration > 1000) {
        console.warn(
          `Slow request detected: ${Math.round(duration)}ms for ${request.type} in ${userMode} mode`
        );
      }

      return response;
    } catch (error) {
      success = false;
      const duration = performance.now() - startTime;
      this.performanceMonitor.recordRequest(duration, false, userMode);
      throw error;
    } finally {
      const duration = performance.now() - startTime;

      // Record comprehensive performance metrics
      performanceMonitor.recordAIPerformance({
        mode: userMode,
        operation: request.type,
        duration,
        cacheHit: this.wasCacheHit(request),
        success,
        requestSize,
        responseSize,
        userId: context.documentType, // Using documentType as identifier
      });

      // Record user experience metrics
      performanceMonitor.recordUserExperience({
        action: `ai_${request.type}`,
        duration,
        success,
        errorType: success ? undefined : 'ai_processing_error',
        userId: context.documentType, // Using documentType as identifier
        sessionId: context.documentType, // Using documentType as session identifier
      });

      // Record business metrics
      if (success) {
        performanceMonitor.recordBusinessMetric({
          metric: 'ai_request_completed',
          value: 1,
          userId: context.documentType, // Using documentType as identifier
          tier: context.userExperience, // Using userExperience as tier
          feature: request.type,
        });
      }
    }
  }

  /**
   * Internal request processing with mode-specific logic
   */
  private async processRequestInternal(
    request: AIRequest,
    context: WritingContext,
    userMode: SystemMode
  ): Promise<AIResponse> {
    const modeConfig = this.getModeConfiguration(userMode);
    const enhancedRequest = await this.enhanceRequestForMode(
      request,
      modeConfig,
      context
    );

    // Apply mode-specific behavior
    switch (userMode) {
      case 'MANUAL':
        return this.processManualModeRequest(enhancedRequest, context);
      case 'HYBRID':
        return this.processHybridModeRequest(enhancedRequest, context);
      case 'FULLY_AUTO':
        return this.processFullyAutoModeRequest(enhancedRequest, context);
      default:
        return this.processHybridModeRequest(enhancedRequest, context);
    }
  }

  /**
   * Process request in Manual mode
   */
  private async processManualModeRequest(
    request: AIRequest,
    context: WritingContext
  ): Promise<AIResponse> {
    if (!request.explicitUserInitiated) {
      return {
        type: 'silent',
        content: null,
        modeMetadata: {
          initiativeLevel: 'MINIMAL',
          userControlLevel: 100,
          interventionStyle: 'SILENT',
        },
      };
    }

    try {
      const result = await this.baseAIService(
        'suggest',
        request.content,
        context.userExperience,
        {
          role: 'user',
          allowedActions: ['edit'],
          tier: 'Pro',
        } as MCPContext
      );

      return {
        type: 'content',
        content: result,
        requiresApproval: true,
        modeMetadata: {
          initiativeLevel: 'MINIMAL',
          userControlLevel: 100,
          interventionStyle: 'SILENT',
        },
      };
    } catch (error) {
      console.error('Manual mode request processing failed:', error);
      throw error;
    }
  }

  /**
   * Process request in Hybrid mode
   */
  private async processHybridModeRequest(
    request: AIRequest,
    context: WritingContext
  ): Promise<AIResponse> {
    try {
      const suggestions = await this.generateContextualSuggestions(
        request.content,
        context
      );

      const result = await this.baseAIService(
        'suggest',
        request.content,
        context.userExperience,
        {
          role: 'user',
          allowedActions: ['edit'],
          tier: 'Pro',
        } as MCPContext
      );

      return {
        type: 'suggestion',
        content: result,
        suggestions,
        requiresApproval: true,
        modeMetadata: {
          initiativeLevel: 'RESPONSIVE',
          userControlLevel: 70,
          interventionStyle: 'GENTLE',
        },
      };
    } catch (error) {
      console.error('Hybrid mode request processing failed:', error);
      throw error;
    }
  }

  /**
   * Process request in Fully Auto mode
   */
  private async processFullyAutoModeRequest(
    request: AIRequest,
    context: WritingContext
  ): Promise<AIResponse> {
    try {
      const proactiveEnhancements =
        await this.generateProactiveEnhancements(context);

      const result = await this.baseAIService(
        'suggest',
        request.content,
        context.userExperience,
        {
          role: 'user',
          allowedActions: ['edit'],
          tier: 'Pro',
        } as MCPContext
      );

      return {
        type: 'enhancement',
        content: result,
        autoEnhancements: proactiveEnhancements,
        requiresApproval: false,
        modeMetadata: {
          initiativeLevel: 'PROACTIVE',
          userControlLevel: 30,
          interventionStyle: 'COMPREHENSIVE',
        },
      };
    } catch (error) {
      console.error('Fully auto mode request processing failed:', error);
      throw error;
    }
  }

  /**
   * Get mode configuration
   */
  private getModeConfiguration(mode: SystemMode): ModeConfiguration {
    const defaultConfigs: Record<SystemMode, ModeConfiguration> = {
      MANUAL: {
        mode: 'MANUAL',
        aiInitiativeLevel: 'MINIMAL',
        suggestionFrequency: 'ON_REQUEST',
        userControlLevel: 100,
        interventionStyle: 'SILENT',
        autoEnhancement: false,
        realTimeAnalysis: false,
        proactiveSuggestions: false,
      },
      HYBRID: {
        mode: 'HYBRID',
        aiInitiativeLevel: 'RESPONSIVE',
        suggestionFrequency: 'CONTEXTUAL',
        userControlLevel: 70,
        interventionStyle: 'GENTLE',
        autoEnhancement: true,
        realTimeAnalysis: true,
        proactiveSuggestions: true,
      },
      FULLY_AUTO: {
        mode: 'FULLY_AUTO',
        aiInitiativeLevel: 'PROACTIVE',
        suggestionFrequency: 'CONTINUOUS',
        userControlLevel: 30,
        interventionStyle: 'COMPREHENSIVE',
        autoEnhancement: true,
        realTimeAnalysis: true,
        proactiveSuggestions: true,
      },
    };

    return defaultConfigs[mode];
  }

  /**
   * Enhance request based on mode configuration
   */
  private async enhanceRequestForMode(
    request: AIRequest,
    modeConfig: ModeConfiguration,
    context: WritingContext
  ): Promise<AIRequest> {
    return {
      ...request,
      enhancementLevel: this.mapInitiativeToEnhancement(
        modeConfig.aiInitiativeLevel
      ),
      suggestionStyle: this.mapFrequencyToStyle(modeConfig.suggestionFrequency),
      creativityLevel: this.mapInterventionToCreativity(
        modeConfig.interventionStyle
      ),
      userApprovalRequired: modeConfig.userControlLevel > 50,
    };
  }

  /**
   * Generate contextual suggestions
   */
  private async generateContextualSuggestions(
    content: string,
    context: WritingContext
  ): Promise<
    Array<{
      type: string;
      content: string;
      priority: 'low' | 'medium' | 'high';
      reasoning: string;
    }>
  > {
    return [
      {
        type: 'style_enhancement',
        content: 'Consider adding more descriptive language here',
        priority: 'medium',
        reasoning: 'The current text could benefit from more vivid imagery',
      },
      {
        type: 'structure_improvement',
        content: 'This paragraph might flow better if reorganized',
        priority: 'low',
        reasoning: 'The logical flow could be improved for better readability',
      },
    ];
  }

  /**
   * Generate proactive enhancements
   */
  private async generateProactiveEnhancements(context: WritingContext): Promise<
    Array<{
      type: string;
      content: string;
      confidence: number;
      reasoning: string;
    }>
  > {
    return [
      {
        type: 'character_development',
        content: 'Enhanced character motivation based on plot context',
        confidence: 0.85,
        reasoning:
          "The character's actions align with established personality traits",
      },
      {
        type: 'emotional_arc',
        content: 'Adjusted emotional progression for better tension',
        confidence: 0.78,
        reasoning:
          'The emotional journey follows established narrative patterns',
      },
    ];
  }

  /**
   * Mapping utilities
   */
  private mapInitiativeToEnhancement(
    initiative: string
  ): 'minimal' | 'collaborative' | 'comprehensive' {
    switch (initiative) {
      case 'MINIMAL':
        return 'minimal';
      case 'RESPONSIVE':
        return 'collaborative';
      case 'PROACTIVE':
        return 'comprehensive';
      default:
        return 'collaborative';
    }
  }

  private mapFrequencyToStyle(
    frequency: string
  ): 'factual_only' | 'options_based' | 'proactive_assistance' {
    switch (frequency) {
      case 'NONE':
        return 'factual_only';
      case 'ON_REQUEST':
        return 'factual_only';
      case 'CONTEXTUAL':
        return 'options_based';
      case 'CONTINUOUS':
        return 'proactive_assistance';
      default:
        return 'options_based';
    }
  }

  private mapInterventionToCreativity(
    intervention: string
  ): 'none' | 'enhancement_focused' | 'vision_amplification' {
    switch (intervention) {
      case 'SILENT':
        return 'none';
      case 'GENTLE':
        return 'enhancement_focused';
      case 'ACTIVE':
        return 'enhancement_focused';
      case 'COMPREHENSIVE':
        return 'vision_amplification';
      default:
        return 'enhancement_focused';
    }
  }

  /**
   * Get comprehensive performance report
   */
  getPerformanceReport(): object {
    const cacheStats = this.requestCache.getStats();
    const debounceStats = this.requestDebouncer.getStats();
    const performanceReport = this.performanceMonitor.getPerformanceReport();

    return {
      serviceName: this.SERVICE_NAME,
      performance: performanceReport,
      cache: cacheStats,
      debouncing: debounceStats,
      recommendations:
        this.generateOptimizationRecommendations(performanceReport),
    };
  }

  /**
   * Generate optimization recommendations
   */
  private generateOptimizationRecommendations(report: any): string[] {
    const recommendations: string[] = [];

    if (report.cacheHitRate < 40) {
      recommendations.push(
        'Consider increasing cache TTL or cache size - low hit rate detected'
      );
    }

    if (report.averageResponseTime > 800) {
      recommendations.push(
        'Average response time is high - consider optimizing AI service calls'
      );
    }

    if (report.slowRequestPercentage > 20) {
      recommendations.push(
        'High percentage of slow requests - investigate request patterns'
      );
    }

    if (report.memoryUsageMB > 100) {
      recommendations.push(
        'Memory usage is high - consider reducing cache size or implementing more aggressive cleanup'
      );
    }

    return recommendations;
  }

  /**
   * Get service health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    performanceMetrics: any;
    cache: any;
    debouncing: any;
  } {
    const performanceReport = this.performanceMonitor.getPerformanceReport();
    const cacheStats = this.requestCache.getStats();
    const debounceStats = this.requestDebouncer.getStats();

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (performanceReport.averageResponseTime > 2000) {
      status = 'degraded';
    } else if (performanceReport.averageResponseTime > 5000) {
      status = 'unhealthy';
    }

    if (performanceReport.cacheHitRate < 30) {
      status = 'degraded';
    }

    return {
      status,
      performanceMetrics: performanceReport,
      cache: cacheStats,
      debouncing: debounceStats,
    };
  }

  /**
   * Check if a request was served from cache
   */
  private wasCacheHit(request: AIRequest): boolean {
    // This is a simplified check - in a real implementation, you might want to track this more precisely
    // For now, we'll assume it's not a cache hit since we're already recording cache hits separately
    return false;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.requestCache.destroy();
    this.requestDebouncer.cleanup();
    this.performanceMonitor.reset();
  }
}
