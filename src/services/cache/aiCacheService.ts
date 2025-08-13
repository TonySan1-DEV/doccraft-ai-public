// MCP Context Block
/*
{
  file: "aiCacheService.ts",
  role: "backend-developer",
  allowedActions: ["service", "cache", "ai", "performance"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "ai_caching"
}
*/

/**
 * AI Operation Interface
 * Represents an AI operation that can be cached
 */
export interface AIOperation {
  type: string;
  module?: string;
  input: any;
  parameters?: Record<string, any>;
}

/**
 * Cache Context Interface
 * Context information for cache operations
 */
export interface CacheContext {
  userProfile: any;
  writingContext: any;
  documentType: string;
  qualityLevel: string;
  timestamp?: number;
  sessionId?: string;
}

/**
 * Cached Response Interface
 * Cached AI response with metadata
 */
export interface CachedResponse {
  data: any;
  timestamp: number;
  ttl: number;
  contextHash: string;
  similarity: number;
  usageCount: number;
  lastAccessed: number;
  metadata: {
    operationType: string;
    module: string;
    inputSize: number;
    responseSize: number;
    qualityScore?: number;
  };
}

/**
 * Caching Strategy Interface
 * Defines how different modules should be cached
 */
export interface CachingStrategy {
  ttl: number;
  similarity: number;
  invalidateOn: string[];
  warmingPriority: number;
  moduleSpecific: boolean;
  maxMemorySize: number;
  maxPersistentSize: number;
}

/**
 * Cache Metrics Interface
 * Performance and usage metrics for the cache system
 */
export interface CacheMetrics {
  hitRate: number;
  memoryHitRate: number;
  persistentHitRate: number;
  averageResponseTime: number;
  cacheSize: number;
  costSavings: number;
  warmingAccuracy: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
}

/**
 * IndexedDB Cache Implementation
 * Persistent storage for AI responses
 */
class IndexedDBCache {
  private dbName: string;
  private dbVersion: number;
  private db: IDBDatabase | null = null;

  constructor(dbName: string) {
    this.dbName = dbName;
    this.dbVersion = 1;
    this.initializeDB();
  }

  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('aiResponses')) {
          const store = db.createObjectStore('aiResponses', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('module', 'module', { unique: false });
          store.createIndex('contextHash', 'contextHash', { unique: false });
        }

        if (!db.objectStoreNames.contains('cacheMetrics')) {
          db.createObjectStore('cacheMetrics', { keyPath: 'id' });
        }
      };
    });
  }

  async get(key: string): Promise<CachedResponse | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['aiResponses'], 'readonly');
      const store = transaction.objectStore('aiResponses');
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result && Date.now() - result.timestamp < result.ttl) {
          // Update access time
          this.updateAccessTime(key);
          resolve(result);
        } else {
          resolve(null);
        }
      };
    });
  }

  async set(key: string, value: CachedResponse): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['aiResponses'], 'readwrite');
      const store = transaction.objectStore('aiResponses');
      const request = store.put({ key, ...value });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['aiResponses'], 'readwrite');
      const store = transaction.objectStore('aiResponses');
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['aiResponses'], 'readwrite');
      const store = transaction.objectStore('aiResponses');
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getSize(): Promise<number> {
    if (!this.db) return 0;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['aiResponses'], 'readonly');
      const store = transaction.objectStore('aiResponses');
      const request = store.count();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  private async updateAccessTime(key: string): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['aiResponses'], 'readwrite');
    const store = transaction.objectStore('aiResponses');
    const getRequest = store.get(key);

    getRequest.onsuccess = () => {
      const result = getRequest.result;
      if (result) {
        result.lastAccessed = Date.now();
        result.usageCount++;
        store.put(result);
      }
    };
  }

  async findSimilarResponses(
    contextHash: string,
    similarity: number
  ): Promise<CachedResponse[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['aiResponses'], 'readonly');
      const store = transaction.objectStore('aiResponses');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result.filter(
          (item: CachedResponse) =>
            item.contextHash === contextHash &&
            item.similarity >= similarity &&
            Date.now() - item.timestamp < item.ttl
        );
        resolve(results);
      };
    });
  }
}

/**
 * Advanced AI Cache Service
 * Provides intelligent, context-aware caching for AI operations
 */
export class AICacheService {
  private memoryCache = new Map<string, CachedResponse>();
  private persistentCache: IndexedDBCache;
  private cacheMetrics: CacheMetrics;
  private moduleStrategies: Map<string, CachingStrategy>;
  private warmingQueue: Array<{
    operation: AIOperation;
    context: CacheContext;
    priority: number;
  }> = [];
  private isWarming = false;

  constructor(
    private writerProfile: any,
    private maxMemorySize: number = 100 * 1024 * 1024 // 100MB
  ) {
    this.persistentCache = new IndexedDBCache('doccraft-ai-cache');
    this.cacheMetrics = this.initializeMetrics();
    this.moduleStrategies = this.initializeModuleStrategies();
    this.startPeriodicCleanup();
  }

  /**
   * Initialize cache metrics
   */
  private initializeMetrics(): CacheMetrics {
    return {
      hitRate: 0,
      memoryHitRate: 0,
      persistentHitRate: 0,
      averageResponseTime: 0,
      cacheSize: 0,
      costSavings: 0,
      warmingAccuracy: 0,
      totalRequests: 0,
      totalHits: 0,
      totalMisses: 0,
    };
  }

  /**
   * Initialize module-specific caching strategies
   */
  private initializeModuleStrategies(): Map<string, CachingStrategy> {
    const strategies = new Map<string, CachingStrategy>();

    // Emotion Arc Module
    strategies.set('emotionArc', {
      ttl: 300000, // 5 minutes
      similarity: 0.8,
      invalidateOn: ['characterChange', 'sceneChange'],
      warmingPriority: 0.9,
      moduleSpecific: true,
      maxMemorySize: 20 * 1024 * 1024, // 20MB
      maxPersistentSize: 100 * 1024 * 1024, // 100MB
    });

    // Plot Structure Module
    strategies.set('plotStructure', {
      ttl: 600000, // 10 minutes
      similarity: 0.7,
      invalidateOn: ['plotChange', 'structureChange'],
      warmingPriority: 0.8,
      moduleSpecific: true,
      maxMemorySize: 25 * 1024 * 1024, // 25MB
      maxPersistentSize: 150 * 1024 * 1024, // 150MB
    });

    // Style Profile Module
    strategies.set('styleProfile', {
      ttl: 900000, // 15 minutes
      similarity: 0.9,
      invalidateOn: ['styleChange', 'voiceChange'],
      warmingPriority: 0.7,
      moduleSpecific: true,
      maxMemorySize: 15 * 1024 * 1024, // 15MB
      maxPersistentSize: 80 * 1024 * 1024, // 80MB
    });

    // Theme Analysis Module
    strategies.set('themeAnalysis', {
      ttl: 1200000, // 20 minutes
      similarity: 0.6,
      invalidateOn: ['themeChange', 'contentChange'],
      warmingPriority: 0.6,
      moduleSpecific: true,
      maxMemorySize: 20 * 1024 * 1024, // 20MB
      maxPersistentSize: 120 * 1024 * 1024, // 120MB
    });

    // Character Development Module
    strategies.set('characterDevelopment', {
      ttl: 450000, // 7.5 minutes
      similarity: 0.85,
      invalidateOn: ['characterChange', 'relationshipChange'],
      warmingPriority: 0.85,
      moduleSpecific: true,
      maxMemorySize: 30 * 1024 * 1024, // 30MB
      maxPersistentSize: 200 * 1024 * 1024, // 200MB
    });

    // Writing Orchestration (default)
    strategies.set('writing_orchestration', {
      ttl: 1800000, // 30 minutes
      similarity: 0.75,
      invalidateOn: ['majorContentChange', 'userPreferenceChange'],
      warmingPriority: 0.5,
      moduleSpecific: false,
      maxMemorySize: 50 * 1024 * 1024, // 50MB
      maxPersistentSize: 300 * 1024 * 1024, // 300MB
    });

    return strategies;
  }

  /**
   * Get cached AI response with intelligent fallback
   */
  async getCachedAIResponse(
    operation: AIOperation,
    context: CacheContext
  ): Promise<CachedResponse | null> {
    const startTime = performance.now();
    this.cacheMetrics.totalRequests++;

    try {
      const cacheKey = await this.generateContextualKey(operation, context);
      const strategy =
        this.moduleStrategies.get(
          operation.module || 'writing_orchestration'
        ) || this.getDefaultStrategy();

      // Check memory cache with contextual validation
      const memoryResult = this.memoryCache.get(cacheKey);
      if (
        memoryResult &&
        this.isValidCachedResponse(memoryResult, context, strategy)
      ) {
        this.cacheMetrics.totalHits++;
        this.cacheMetrics.memoryHitRate =
          this.cacheMetrics.totalHits / this.cacheMetrics.totalRequests;
        await this.updateUsageStats(memoryResult);

        const responseTime = performance.now() - startTime;
        this.updateAverageResponseTime(responseTime);

        return memoryResult;
      }

      // Check persistent cache with similarity matching
      const persistentResult = await this.findSimilarCachedResponse(
        cacheKey,
        context,
        strategy
      );
      if (persistentResult) {
        // Promote to memory cache if space allows
        if (this.canAddToMemoryCache(persistentResult, strategy)) {
          this.memoryCache.set(cacheKey, persistentResult);
        }

        this.cacheMetrics.totalHits++;
        this.cacheMetrics.persistentHitRate =
          this.cacheMetrics.totalHits / this.cacheMetrics.totalRequests;

        const responseTime = performance.now() - startTime;
        this.updateAverageResponseTime(responseTime);

        return persistentResult;
      }

      this.cacheMetrics.totalMisses++;
      this.updateHitRate();

      return null;
    } catch (error) {
      console.error('Cache lookup error:', error);
      return null;
    }
  }

  /**
   * Cache AI response with intelligent storage strategy
   */
  async cacheAIResponse(
    operation: AIOperation,
    context: CacheContext,
    response: any
  ): Promise<void> {
    try {
      const cacheKey = await this.generateContextualKey(operation, context);
      const strategy =
        this.moduleStrategies.get(
          operation.module || 'writing_orchestration'
        ) || this.getDefaultStrategy();

      const cachedResponse: CachedResponse = {
        data: response,
        timestamp: Date.now(),
        ttl: strategy.ttl,
        contextHash: await this.hashUserContext(context),
        similarity: 1.0, // Exact match for newly cached responses
        usageCount: 1,
        lastAccessed: Date.now(),
        metadata: {
          operationType: operation.type,
          module: operation.module || 'writing_orchestration',
          inputSize: JSON.stringify(operation.input).length,
          responseSize: JSON.stringify(response).length,
          qualityScore: this.extractQualityScore(response),
        },
      };

      // Store in memory cache if space allows
      if (this.canAddToMemoryCache(cachedResponse, strategy)) {
        this.memoryCache.set(cacheKey, cachedResponse);
      }

      // Always store in persistent cache
      await this.persistentCache.set(cacheKey, cachedResponse);

      // Update cache size metrics
      this.updateCacheSize();

      // Trigger cache warming for related operations
      this.queueCacheWarming(operation, context, strategy.warmingPriority);
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  /**
   * Generate contextual cache key
   */
  private async generateContextualKey(
    operation: AIOperation,
    context: CacheContext
  ): Promise<string> {
    const components = [
      operation.type,
      operation.module || 'core',
      await this.hashContent(operation.input),
      await this.hashUserContext(context),
      await this.hashWritingContext(context),
      context.documentType,
      context.qualityLevel,
    ];

    // Create semantic hash that accounts for similar contexts
    const semanticHash = await this.createSemanticHash(components);
    return `ai_cache_${semanticHash}`;
  }

  /**
   * Hash content for cache key generation
   */
  private async hashContent(content: any): Promise<string> {
    const contentStr = JSON.stringify(content);
    return this.simpleHash(contentStr);
  }

  /**
   * Hash user context for cache key generation
   */
  private async hashUserContext(context: CacheContext): Promise<string> {
    const userStr = JSON.stringify({
      profile: context.userProfile?.id || 'anonymous',
      preferences: context.userProfile?.preferences || {},
      session: context.sessionId || 'default',
    });
    return this.simpleHash(userStr);
  }

  /**
   * Hash writing context for cache key generation
   */
  private async hashWritingContext(context: CacheContext): Promise<string> {
    const writingStr = JSON.stringify({
      type: context.documentType,
      quality: context.qualityLevel,
      timestamp: context.timestamp || Date.now(),
    });
    return this.simpleHash(writingStr);
  }

  /**
   * Create semantic hash from components
   */
  private async createSemanticHash(components: string[]): Promise<string> {
    const combined = components.join('|');
    return this.simpleHash(combined);
  }

  /**
   * Simple hash function for cache keys
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if cached response is valid
   */
  private isValidCachedResponse(
    response: CachedResponse,
    context: CacheContext,
    strategy: CachingStrategy
  ): boolean {
    const now = Date.now();

    // Check TTL
    if (now - response.timestamp > response.ttl) {
      return false;
    }

    // Check context similarity
    if (response.similarity < strategy.similarity) {
      return false;
    }

    return true;
  }

  /**
   * Find similar cached response in persistent storage
   */
  private async findSimilarCachedResponse(
    cacheKey: string,
    context: CacheContext,
    strategy: CachingStrategy
  ): Promise<CachedResponse | null> {
    const contextHash = await this.hashUserContext(context);
    const similarResponses = await this.persistentCache.findSimilarResponses(
      contextHash,
      strategy.similarity
    );

    if (similarResponses.length === 0) {
      return null;
    }

    // Return the most recent and relevant response
    return similarResponses.sort((a, b) => {
      const aScore = a.usageCount * 0.3 + (Date.now() - a.timestamp) * 0.7;
      const bScore = b.usageCount * 0.3 + (Date.now() - b.timestamp) * 0.7;
      return bScore - aScore;
    })[0];
  }

  /**
   * Check if response can be added to memory cache
   */
  private canAddToMemoryCache(
    response: CachedResponse,
    strategy: CachingStrategy
  ): boolean {
    const currentMemorySize = this.getMemoryCacheSize();
    const responseSize = JSON.stringify(response).length;

    return currentMemorySize + responseSize <= strategy.maxMemorySize;
  }

  /**
   * Get current memory cache size
   */
  private getMemoryCacheSize(): number {
    let totalSize = 0;
    for (const [_, response] of this.memoryCache) {
      totalSize += JSON.stringify(response).length;
    }
    return totalSize;
  }

  /**
   * Update usage statistics
   */
  private async updateUsageStats(response: CachedResponse): Promise<void> {
    response.usageCount++;
    response.lastAccessed = Date.now();
  }

  /**
   * Update average response time
   */
  private updateAverageResponseTime(responseTime: number): void {
    const totalTime =
      this.cacheMetrics.averageResponseTime *
        (this.cacheMetrics.totalHits - 1) +
      responseTime;
    this.cacheMetrics.averageResponseTime =
      totalTime / this.cacheMetrics.totalHits;
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    this.cacheMetrics.hitRate =
      this.cacheMetrics.totalHits / this.cacheMetrics.totalRequests;
  }

  /**
   * Update cache size metrics
   */
  private updateCacheSize(): void {
    this.cacheMetrics.cacheSize = this.getMemoryCacheSize();
  }

  /**
   * Extract quality score from response
   */
  private extractQualityScore(response: any): number | undefined {
    if (response.qualityMetrics?.overall) {
      return response.qualityMetrics.overall;
    }
    if (response.qualityScore) {
      return response.qualityScore;
    }
    return undefined;
  }

  /**
   * Get default caching strategy
   */
  private getDefaultStrategy(): CachingStrategy {
    return {
      ttl: 300000, // 5 minutes
      similarity: 0.8,
      invalidateOn: [],
      warmingPriority: 0.5,
      moduleSpecific: false,
      maxMemorySize: 25 * 1024 * 1024, // 25MB
      maxPersistentSize: 100 * 1024 * 1024, // 100MB
    };
  }

  /**
   * Queue cache warming for related operations
   */
  private queueCacheWarming(
    operation: AIOperation,
    context: CacheContext,
    priority: number
  ): void {
    this.warmingQueue.push({ operation, context, priority });
    this.warmingQueue.sort((a, b) => b.priority - a.priority);

    if (!this.isWarming) {
      this.processWarmingQueue();
    }
  }

  /**
   * Process cache warming queue
   */
  private async processWarmingQueue(): Promise<void> {
    if (this.isWarming || this.warmingQueue.length === 0) {
      return;
    }

    this.isWarming = true;

    while (this.warmingQueue.length > 0) {
      const item = this.warmingQueue.shift();
      if (item) {
        try {
          await this.warmCacheForOperation(item.operation, item.context);
        } catch (error) {
          console.error('Cache warming error:', error);
        }
      }
    }

    this.isWarming = false;
  }

  /**
   * Warm cache for specific operation
   */
  private async warmCacheForOperation(
    operation: AIOperation,
    context: CacheContext
  ): Promise<void> {
    // Simulate cache warming by predicting related operations
    const relatedOperations = this.predictRelatedOperations(operation, context);

    for (const relatedOp of relatedOperations) {
      // In a real implementation, this would pre-compute and cache results
      console.log(`Warming cache for related operation: ${relatedOp.type}`);
    }
  }

  /**
   * Predict related operations for cache warming
   */
  private predictRelatedOperations(
    operation: AIOperation,
    context: CacheContext
  ): AIOperation[] {
    const related: AIOperation[] = [];

    // Predict based on operation type and context
    switch (operation.type) {
      case 'content_analysis':
        related.push(
          {
            type: 'content_optimization',
            module: operation.module,
            input: operation.input,
          },
          {
            type: 'content_synthesis',
            module: operation.module,
            input: operation.input,
          }
        );
        break;
      case 'content_generation':
        related.push({
          type: 'content_analysis',
          module: operation.module,
          input: operation.input,
        });
        break;
    }

    return related;
  }

  /**
   * Start periodic cache cleanup
   */
  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60000); // Every minute
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();

    // Clean memory cache
    for (const [key, response] of this.memoryCache.entries()) {
      if (now - response.timestamp > response.ttl) {
        this.memoryCache.delete(key);
      }
    }

    // Update metrics
    this.updateCacheSize();
  }

  /**
   * Get cache metrics
   */
  getCacheMetrics(): CacheMetrics {
    return { ...this.cacheMetrics };
  }

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<void> {
    this.memoryCache.clear();
    await this.persistentCache.clear();
    this.cacheMetrics = this.initializeMetrics();
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    memorySize: number;
    persistentSize: number;
    totalEntries: number;
    hitRate: number;
    averageResponseTime: number;
  }> {
    const persistentSize = await this.persistentCache.getSize();

    return {
      memorySize: this.getMemoryCacheSize(),
      persistentSize,
      totalEntries: this.memoryCache.size + persistentSize,
      hitRate: this.cacheMetrics.hitRate,
      averageResponseTime: this.cacheMetrics.averageResponseTime,
    };
  }
}
