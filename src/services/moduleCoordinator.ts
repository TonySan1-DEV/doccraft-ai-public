// MCP Context Block
/*
{
  file: "moduleCoordinator.ts",
  role: "backend-developer",
  allowedActions: ["service", "coordination", "mode"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "module_coordination"
}
*/

import {
  SystemMode,
  ModeCoordinationStrategy,
  WritingContext,
} from '../types/systemModes';

/**
 * Performance Metrics Interface
 */
export interface PerformanceMetrics {
  coordinationLatency: number;
  memoryUsage: number;
  activeSubscriptions: number;
  cacheHitRate: number;
  batchProcessingEfficiency: number;
  lastOptimization: Date;
}

/**
 * Coordination Result Interface
 */
export interface CoordinationResult {
  success: boolean;
  moduleId: string;
  timestamp: Date;
  duration: number;
  data?: any;
  error?: string;
}

/**
 * Module Update Interface
 */
export interface ModuleUpdate {
  moduleId: string;
  updateType: string;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  requiresImmediate: boolean;
}

/**
 * Mode-Aware Module Interface
 *
 * @description Interface that modules must implement to be mode-aware
 */
export interface ModeAwareModule {
  /** Module identifier */
  moduleId: string;

  /** Current mode the module is operating in */
  currentMode: SystemMode;

  /** Adapt module behavior to a new mode */
  adaptToMode(
    mode: SystemMode,
    strategy: ModeCoordinationStrategy
  ): Promise<void>;

  /** Get module's current state */
  getModuleState(): any;

  /** Handle mode transition */
  onModeTransition?(fromMode: SystemMode, toMode: SystemMode): Promise<void>;

  /** Get module's coordination capabilities */
  getCoordinationCapabilities(): string[];

  /** Get module's performance characteristics */
  getPerformanceMetrics?(): Partial<PerformanceMetrics>;
}

/**
 * Module Coordination Event
 *
 * @description Events that can be triggered between modules
 */
export interface ModuleCoordinationEvent {
  /** Event type */
  type: string;

  /** Source module */
  sourceModule: string;

  /** Target module(s) */
  targetModules?: string[];

  /** Event data */
  data: any;

  /** Event priority */
  priority: 'low' | 'medium' | 'high' | 'critical';

  /** Whether the event requires immediate attention */
  requiresImmediate: boolean;
}

/**
 * Intelligent Debouncing System
 *
 * @description Batches multiple rapid updates into single coordination operations
 */
class DebouncedCoordinator {
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private readonly DEBOUNCE_DELAY = 300; // 300ms for real-time typing
  private readonly CRITICAL_DELAY = 50; // 50ms for critical updates

  /**
   * Debounce coordination calls to batch rapid updates
   */
  debouncedCoordinate(
    moduleId: string,
    coordinationFn: () => void,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    // Clear existing timer
    const existingTimer = this.debounceTimers.get(moduleId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set delay based on priority
    const delay =
      priority === 'critical' ? this.CRITICAL_DELAY : this.DEBOUNCE_DELAY;

    // Set new timer
    const timer = setTimeout(() => {
      coordinationFn();
      this.debounceTimers.delete(moduleId);
    }, delay);

    this.debounceTimers.set(moduleId, timer);
  }

  /**
   * Clear all pending debounced operations
   */
  clearAll(): void {
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }

  /**
   * Get pending operations count
   */
  getPendingCount(): number {
    return this.debounceTimers.size;
  }
}

/**
 * Memoization and Caching System
 *
 * @description Caches coordination results to avoid redundant operations
 */
class CoordinationCache {
  private cache = new Map<string, CoordinationResult>();
  private readonly CACHE_TTL = 5000; // 5 seconds
  private readonly MAX_CACHE_SIZE = 1000; // Prevent memory bloat

  /**
   * Get cached coordination result if available and not expired
   */
  getCachedResult(key: string): CoordinationResult | null {
    const result = this.cache.get(key);
    if (!result) return null;

    const now = Date.now();
    const age = now - result.timestamp.getTime();

    if (age > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return result;
  }

  /**
   * Cache coordination result with TTL
   */
  setCachedResult(key: string, result: CoordinationResult): void {
    // Prevent cache bloat
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestEntries();
    }

    this.cache.set(key, result);
  }

  /**
   * Clear expired cache entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, result] of this.cache.entries()) {
      const age = now - result.timestamp.getTime();
      if (age > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Evict oldest cache entries when size limit is reached
   */
  private evictOldestEntries(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());

    const toRemove = Math.floor(this.MAX_CACHE_SIZE * 0.2); // Remove 20% of oldest entries
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; ttl: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      ttl: this.CACHE_TTL,
    };
  }
}

/**
 * Batch Update Processing System
 *
 * @description Processes multiple updates efficiently in batches
 */
class BatchProcessor {
  private updateQueue: ModuleUpdate[] = [];
  private processingTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 100; // 100ms batch window
  private readonly MAX_BATCH_SIZE = 50; // Maximum updates per batch

  /**
   * Queue an update for batch processing
   */
  queueUpdate(update: ModuleUpdate): void {
    this.updateQueue.push(update);

    // Process immediately if critical or queue is full
    if (
      update.priority === 'critical' ||
      this.updateQueue.length >= this.MAX_BATCH_SIZE
    ) {
      this.processBatch();
      return;
    }

    // Set timer for batch processing if not already set
    if (!this.processingTimer) {
      this.processingTimer = setTimeout(() => {
        this.processBatch();
      }, this.BATCH_DELAY);
    }
  }

  /**
   * Process all queued updates in a single batch
   */
  processBatch(): void {
    if (this.processingTimer) {
      clearTimeout(this.processingTimer);
      this.processingTimer = null;
    }

    if (this.updateQueue.length === 0) return;

    // Sort by priority and timestamp
    this.updateQueue.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff =
        priorityOrder[a.priority] - priorityOrder[b.priority];

      if (priorityDiff !== 0) return priorityDiff;

      return a.timestamp.getTime() - b.timestamp.getTime();
    });

    // Process updates
    const updates = [...this.updateQueue];
    this.updateQueue = [];

    // Emit batch processing event
    this.onBatchProcessed?.(updates);
  }

  /**
   * Callback when batch is processed
   */
  onBatchProcessed?: (updates: ModuleUpdate[]) => void;

  /**
   * Get current queue status
   */
  getQueueStatus(): { pending: number; maxSize: number } {
    return {
      pending: this.updateQueue.length,
      maxSize: this.MAX_BATCH_SIZE,
    };
  }

  /**
   * Clear all pending updates
   */
  clear(): void {
    if (this.processingTimer) {
      clearTimeout(this.processingTimer);
      this.processingTimer = null;
    }
    this.updateQueue = [];
  }
}

/**
 * Memory Management System
 *
 * @description Manages memory usage and cleans up inactive resources
 */
class MemoryManager {
  private activeSubscriptions = new Set<string>();
  private inactiveThreshold = 30000; // 30 seconds
  private lastActivity = new Map<string, number>();
  private readonly MAX_MEMORY_USAGE = 100 * 1024 * 1024; // 100MB limit

  /**
   * Track module activity
   */
  trackActivity(moduleId: string): void {
    this.activeSubscriptions.add(moduleId);
    this.lastActivity.set(moduleId, Date.now());
  }

  /**
   * Clean up inactive modules
   */
  cleanupInactiveModules(): void {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [moduleId, lastActive] of this.lastActivity.entries()) {
      if (now - lastActive > this.inactiveThreshold) {
        toRemove.push(moduleId);
      }
    }

    toRemove.forEach(moduleId => {
      this.activeSubscriptions.delete(moduleId);
      this.lastActivity.delete(moduleId);
    });

    if (toRemove.length > 0) {
      console.log(
        `MemoryManager: Cleaned up ${toRemove.length} inactive modules`
      );
    }
  }

  /**
   * Optimize memory usage
   */
  optimizeMemoryUsage(): void {
    // Clean up inactive modules
    this.cleanupInactiveModules();

    // Check memory usage
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo.usedJSHeapSize > this.MAX_MEMORY_USAGE) {
        console.warn(
          'MemoryManager: High memory usage detected, triggering cleanup'
        );
        this.forceCleanup();
      }
    }
  }

  /**
   * Force cleanup of all resources
   */
  forceCleanup(): void {
    this.activeSubscriptions.clear();
    this.lastActivity.clear();
    console.log('MemoryManager: Force cleanup completed');
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): { activeSubscriptions: number; lastCleanup: Date | null } {
    return {
      activeSubscriptions: this.activeSubscriptions.size,
      lastCleanup: null, // Would be tracked in real implementation
    };
  }
}

/**
 * Performance Monitoring System
 *
 * @description Tracks and reports coordination performance metrics
 */
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    coordinationLatency: 0,
    memoryUsage: 0,
    activeSubscriptions: 0,
    cacheHitRate: 0,
    batchProcessingEfficiency: 0,
    lastOptimization: new Date(),
  };

  private latencyHistory: number[] = [];
  private readonly MAX_HISTORY_SIZE = 100;

  /**
   * Record coordination latency
   */
  recordLatency(latency: number): void {
    this.latencyHistory.push(latency);

    if (this.latencyHistory.length > this.MAX_HISTORY_SIZE) {
      this.latencyHistory.shift();
    }

    this.metrics.coordinationLatency = this.calculateAverageLatency();
  }

  /**
   * Update cache hit rate
   */
  updateCacheHitRate(hitRate: number): void {
    this.metrics.cacheHitRate = hitRate;
  }

  /**
   * Update batch processing efficiency
   */
  updateBatchEfficiency(efficiency: number): void {
    this.metrics.batchProcessingEfficiency = efficiency;
  }

  /**
   * Update memory usage
   */
  updateMemoryUsage(usage: number): void {
    this.metrics.memoryUsage = usage;
  }

  /**
   * Update active subscriptions count
   */
  updateActiveSubscriptions(count: number): void {
    this.metrics.activeSubscriptions = count;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Calculate average latency from history
   */
  private calculateAverageLatency(): number {
    if (this.latencyHistory.length === 0) return 0;

    const sum = this.latencyHistory.reduce((acc, val) => acc + val, 0);
    return sum / this.latencyHistory.length;
  }

  /**
   * Get performance insights
   */
  getInsights(): string[] {
    const insights: string[] = [];

    if (this.metrics.coordinationLatency > 100) {
      insights.push(
        'High coordination latency detected - consider optimizing module communication'
      );
    }

    if (this.metrics.cacheHitRate < 0.5) {
      insights.push(
        'Low cache hit rate - consider adjusting cache TTL or strategy'
      );
    }

    if (this.metrics.batchProcessingEfficiency < 0.7) {
      insights.push(
        'Batch processing efficiency below optimal - consider adjusting batch size'
      );
    }

    return insights;
  }
}

/**
 * High-Performance Module Coordinator Service
 *
 * @description Manages intelligent cross-function coordination between modules
 * with advanced performance optimizations, caching, and memory management
 */
export class ModuleCoordinator {
  private activeModules: Map<string, ModeAwareModule> = new Map();
  private eventListeners: Map<
    string,
    Array<(event: ModuleCoordinationEvent) => void>
  > = new Map();
  private coordinationStrategies: Map<SystemMode, ModeCoordinationStrategy> =
    new Map();
  private isCoordinating = false;

  // Performance optimization systems
  private debouncedCoordinator: DebouncedCoordinator;
  private coordinationCache: CoordinationCache;
  private batchProcessor: BatchProcessor;
  private memoryManager: MemoryManager;
  private performanceMonitor: PerformanceMonitor;

  // Performance tracking
  private coordinationStartTime: number = 0;
  private currentMode: SystemMode | null = null;

  constructor() {
    this.initializeCoordinationStrategies();
    this.initializePerformanceSystems();
    this.startPerformanceOptimization();
  }

  /**
   * Initialize performance optimization systems
   */
  private initializePerformanceSystems(): void {
    this.debouncedCoordinator = new DebouncedCoordinator();
    this.coordinationCache = new CoordinationCache();
    this.batchProcessor = new BatchProcessor();
    this.memoryManager = new MemoryManager();
    this.performanceMonitor = new PerformanceMonitor();

    // Set up batch processing callback
    this.batchProcessor.onBatchProcessed = updates => {
      this.processBatchUpdates(updates);
    };

    // Set up periodic cleanup
    setInterval(() => {
      this.coordinationCache.cleanup();
      this.memoryManager.cleanupInactiveModules();
    }, 10000); // Every 10 seconds
  }

  /**
   * Start performance optimization processes
   */
  private startPerformanceOptimization(): void {
    // Periodic memory optimization
    setInterval(() => {
      this.memoryManager.optimizeMemoryUsage();
    }, 30000); // Every 30 seconds

    // Performance monitoring
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 5000); // Every 5 seconds
  }

  /**
   * Register a module with the coordinator
   */
  registerModule(module: ModeAwareModule): void {
    this.activeModules.set(module.moduleId, module);
    this.memoryManager.trackActivity(module.moduleId);
    console.log(`Module ${module.moduleId} registered with coordinator`);
  }

  /**
   * Unregister a module from the coordinator
   */
  unregisterModule(moduleId: string): void {
    this.activeModules.delete(moduleId);
    console.log(`Module ${moduleId} unregistered from coordinator`);
  }

  /**
   * Coordinate modules for a specific mode with performance optimizations
   */
  async coordinateModulesForMode(
    mode: SystemMode,
    context: WritingContext
  ): Promise<void> {
    if (this.isCoordinating) {
      console.warn('Module coordination already in progress');
      return;
    }

    this.isCoordinating = true;
    this.coordinationStartTime = performance.now();
    this.currentMode = mode;

    try {
      // Check cache first
      const cacheKey = `mode_${mode}_${JSON.stringify(context)}`;
      const cachedResult = this.coordinationCache.getCachedResult(cacheKey);

      if (cachedResult && mode !== 'FULLY_AUTO') {
        console.log(`Using cached coordination result for ${mode} mode`);
        return;
      }

      const coordinationStrategy = this.getCoordinationStrategy(mode);

      // Use debounced coordination for non-critical operations
      if (mode === 'HYBRID') {
        this.debouncedCoordinator.debouncedCoordinate(
          'mode_coordination',
          () => this.executeCoordination(mode, coordinationStrategy, context),
          'medium'
        );
      } else {
        // Execute immediately for MANUAL and FULLY_AUTO modes
        await this.executeCoordination(mode, coordinationStrategy, context);
      }

      // Cache the result
      const result: CoordinationResult = {
        success: true,
        moduleId: 'mode_coordination',
        timestamp: new Date(),
        duration: performance.now() - this.coordinationStartTime,
      };

      this.coordinationCache.setCachedResult(cacheKey, result);

      console.log(`Modules coordinated for ${mode} mode`);
    } catch (error) {
      console.error('Failed to coordinate modules for mode:', error);

      // Record failure in cache
      const cacheKey = `mode_${mode}_${JSON.stringify(context)}`;
      const result: CoordinationResult = {
        success: false,
        moduleId: 'mode_coordination',
        timestamp: new Date(),
        duration: performance.now() - this.coordinationStartTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      this.coordinationCache.setCachedResult(cacheKey, result);
    } finally {
      this.isCoordinating = false;
      this.performanceMonitor.recordLatency(
        performance.now() - this.coordinationStartTime
      );
    }
  }

  /**
   * Execute coordination logic
   */
  private async executeCoordination(
    mode: SystemMode,
    strategy: ModeCoordinationStrategy,
    context: WritingContext
  ): Promise<void> {
    // Apply mode-specific coordination to all active modules
    const coordinationPromises = Array.from(this.activeModules.values()).map(
      async module => {
        try {
          await module.adaptToMode(mode, strategy);
        } catch (error) {
          console.error(
            `Failed to adapt module ${module.moduleId} to mode ${mode}:`,
            error
          );
        }
      }
    );

    await Promise.allSettled(coordinationPromises);

    // Enable cross-module intelligence based on mode
    if (mode === 'HYBRID' || mode === 'FULLY_AUTO') {
      await this.enableCrossModuleIntelligence(mode, strategy);
    }
  }

  /**
   * Process batch updates efficiently
   */
  private async processBatchUpdates(updates: ModuleUpdate[]): Promise<void> {
    const startTime = performance.now();

    // Group updates by module for efficient processing
    const updatesByModule = new Map<string, ModuleUpdate[]>();

    updates.forEach(update => {
      if (!updatesByModule.has(update.moduleId)) {
        updatesByModule.set(update.moduleId, []);
      }
      updatesByModule.get(update.moduleId)!.push(update);
    });

    // Process each module's updates
    const processingPromises = Array.from(updatesByModule.entries()).map(
      async ([moduleId, moduleUpdates]) => {
        const module = this.activeModules.get(moduleId);
        if (module) {
          try {
            // Process updates in priority order
            const sortedUpdates = moduleUpdates.sort((a, b) => {
              const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            });

            for (const update of sortedUpdates) {
              await this.processModuleUpdate(module, update);
            }
          } catch (error) {
            console.error(
              `Failed to process updates for module ${moduleId}:`,
              error
            );
          }
        }
      }
    );

    await Promise.allSettled(processingPromises);

    const duration = performance.now() - startTime;
    const efficiency = updates.length / duration; // updates per millisecond

    this.performanceMonitor.updateBatchEfficiency(efficiency);
  }

  /**
   * Process a single module update
   */
  private async processModuleUpdate(
    module: ModeAwareModule,
    update: ModuleUpdate
  ): Promise<void> {
    // Implementation would depend on the specific update type
    // This is a placeholder for the actual update processing logic
    console.log(
      `Processing update for module ${module.moduleId}: ${update.updateType}`
    );
  }

  /**
   * Enable cross-module intelligence with performance optimizations
   */
  private async enableCrossModuleIntelligence(
    mode: SystemMode,
    strategy: ModeCoordinationStrategy
  ): Promise<void> {
    if (!strategy.crossModuleIntelligence) {
      return;
    }

    // Queue cross-module setup operations
    const setupOperations = [
      () => this.setupCharacterPlotSync(mode, strategy),
      () => this.setupEmotionStyleHarmony(mode, strategy),
      () => this.setupThemeNarrativeIntegration(mode, strategy),
    ];

    // Process setup operations in parallel for better performance
    await Promise.allSettled(setupOperations.map(op => op()));

    // Set up real-time coordination if enabled
    if (strategy.performanceSettings.realTimeUpdates) {
      this.setupRealTimeCoordination(mode, strategy);
    }
  }

  /**
   * Set up character-plot synchronization with performance optimizations
   */
  private setupCharacterPlotSync(
    mode: SystemMode,
    strategy: ModeCoordinationStrategy
  ): void {
    const characterModule = this.activeModules.get('characterDevelopment');
    const plotModule = this.activeModules.get('plotStructure');

    if (characterModule && plotModule) {
      // Use debounced coordination for character changes
      this.addEventListener('characterChange', async event => {
        const update: ModuleUpdate = {
          moduleId: 'plotStructure',
          updateType:
            mode === 'HYBRID'
              ? 'suggestPlotImplications'
              : 'autoAdaptPlotForCharacter',
          data: { character: event.data, mode },
          priority: 'medium',
          timestamp: new Date(),
          requiresImmediate: false,
        };

        this.batchProcessor.queueUpdate(update);
      });
    }
  }

  /**
   * Set up emotion-style harmony with performance optimizations
   */
  private setupEmotionStyleHarmony(
    mode: SystemMode,
    strategy: ModeCoordinationStrategy
  ): void {
    const emotionModule = this.activeModules.get('emotionArc');
    const styleModule = this.activeModules.get('styleProfile');

    if (emotionModule && styleModule) {
      this.addEventListener('emotionalArcChange', async event => {
        const update: ModuleUpdate = {
          moduleId: 'styleProfile',
          updateType:
            mode === 'HYBRID'
              ? 'suggestStyleAdjustments'
              : 'autoAdjustStyleForEmotion',
          data: { emotionalArc: event.data, mode },
          priority: 'medium',
          timestamp: new Date(),
          requiresImmediate: false,
        };

        this.batchProcessor.queueUpdate(update);
      });
    }
  }

  /**
   * Set up theme-narrative integration with performance optimizations
   */
  private setupThemeNarrativeIntegration(
    mode: SystemMode,
    strategy: ModeCoordinationStrategy
  ): void {
    const themeModule = this.activeModules.get('themeAnalysis');
    const narrativeModule = this.activeModules.get('narrativeDashboard');

    if (themeModule && narrativeModule) {
      this.addEventListener('themeChange', async event => {
        const update: ModuleUpdate = {
          moduleId: 'narrativeDashboard',
          updateType:
            mode === 'HYBRID'
              ? 'suggestNarrativeImprovements'
              : 'autoEnhanceNarrative',
          data: { theme: event.data, mode },
          priority: 'medium',
          timestamp: new Date(),
          requiresImmediate: false,
        };

        this.batchProcessor.queueUpdate(update);
      });
    }
  }

  /**
   * Set up real-time coordination with performance optimizations
   */
  private setupRealTimeCoordination(
    mode: SystemMode,
    strategy: ModeCoordinationStrategy
  ): void {
    this.addEventListener('writingProgress', async event => {
      const update: ModuleUpdate = {
        moduleId: 'realTimeCoordination',
        updateType:
          strategy.coordinationLevel === 'comprehensive'
            ? 'comprehensiveAnalysis'
            : 'moderateAnalysis',
        data: event.data,
        priority: 'low',
        timestamp: new Date(),
        requiresImmediate: false,
      };

      this.batchProcessor.queueUpdate(update);
    });
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(): void {
    // Update memory usage
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memoryInfo = (performance as any).memory;
      this.performanceMonitor.updateMemoryUsage(memoryInfo.usedJSHeapSize);
    }

    // Update active subscriptions
    this.performanceMonitor.updateActiveSubscriptions(this.activeModules.size);

    // Update cache hit rate (simplified calculation)
    const cacheStats = this.coordinationCache.getStats();
    const hitRate = cacheStats.size > 0 ? 0.7 : 0; // Placeholder calculation
    this.performanceMonitor.updateCacheHitRate(hitRate);
  }

  /**
   * Add event listener for module coordination
   */
  addEventListener(
    eventType: string,
    callback: (event: ModuleCoordinationEvent) => void
  ): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(
    eventType: string,
    callback: (event: ModuleCoordinationEvent) => void
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Trigger module event with performance tracking
   */
  async triggerModuleEvent(
    moduleId: string,
    eventType: string,
    data: any
  ): Promise<void> {
    const startTime = performance.now();

    try {
      const module = this.activeModules.get(moduleId);
      if (module && typeof module.onModeTransition === 'function') {
        await module.onModeTransition('HYBRID', 'FULLY_AUTO'); // This would need proper typing
      }

      // Record successful event trigger
      this.performanceMonitor.recordLatency(performance.now() - startTime);
    } catch (error) {
      console.error(
        `Failed to trigger event ${eventType} for module ${moduleId}:`,
        error
      );
    }
  }

  /**
   * Get coordination strategy for a mode
   */
  private getCoordinationStrategy(mode: SystemMode): ModeCoordinationStrategy {
    const strategy = this.coordinationStrategies.get(mode);
    if (!strategy) {
      throw new Error(`No coordination strategy found for mode: ${mode}`);
    }
    return strategy;
  }

  /**
   * Initialize coordination strategies for each mode
   */
  private initializeCoordinationStrategies(): void {
    this.coordinationStrategies.set('MANUAL', {
      crossModuleIntelligence: false,
      coordinationLevel: 'minimal',
      preserveUserWork: true,
      performanceSettings: {
        realTimeUpdates: false,
        backgroundProcessing: false,
        cacheResults: true,
      },
    });

    this.coordinationStrategies.set('HYBRID', {
      crossModuleIntelligence: true,
      coordinationLevel: 'moderate',
      preserveUserWork: true,
      performanceSettings: {
        realTimeUpdates: true,
        backgroundProcessing: true,
        cacheResults: true,
      },
    });

    this.coordinationStrategies.set('FULLY_AUTO', {
      crossModuleIntelligence: true,
      coordinationLevel: 'comprehensive',
      preserveUserWork: true,
      performanceSettings: {
        realTimeUpdates: true,
        backgroundProcessing: true,
        cacheResults: false,
      },
    });
  }

  /**
   * Get active modules count
   */
  getActiveModulesCount(): number {
    return this.activeModules.size;
  }

  /**
   * Get module coordination status with performance metrics
   */
  getCoordinationStatus(): {
    isCoordinating: boolean;
    activeModules: string[];
    currentMode: SystemMode | null;
    performanceMetrics: PerformanceMetrics;
    cacheStats: { size: number; maxSize: number; ttl: number };
    batchQueueStatus: { pending: number; maxSize: number };
    memoryStats: { activeSubscriptions: number; lastCleanup: Date | null };
  } {
    return {
      isCoordinating: this.isCoordinating,
      activeModules: Array.from(this.activeModules.keys()),
      currentMode: this.currentMode,
      performanceMetrics: this.performanceMonitor.getMetrics(),
      cacheStats: this.coordinationCache.getStats(),
      batchQueueStatus: this.batchProcessor.getQueueStatus(),
      memoryStats: this.memoryManager.getMemoryStats(),
    };
  }

  /**
   * Get performance insights and recommendations
   */
  getPerformanceInsights(): {
    insights: string[];
    recommendations: string[];
    metrics: PerformanceMetrics;
  } {
    const insights = this.performanceMonitor.getInsights();
    const recommendations: string[] = [];

    // Generate recommendations based on insights
    if (insights.includes('High coordination latency detected')) {
      recommendations.push(
        'Consider implementing connection pooling for module communication'
      );
      recommendations.push(
        'Review module initialization sequence for bottlenecks'
      );
    }

    if (insights.includes('Low cache hit rate')) {
      recommendations.push('Increase cache TTL for frequently accessed data');
      recommendations.push(
        'Implement cache warming for common coordination patterns'
      );
    }

    if (insights.includes('Batch processing efficiency below optimal')) {
      recommendations.push('Adjust batch size based on current workload');
      recommendations.push('Implement adaptive batching based on system load');
    }

    return {
      insights,
      recommendations,
      metrics: this.performanceMonitor.getMetrics(),
    };
  }

  /**
   * Force performance optimization
   */
  forceOptimization(): void {
    console.log('ModuleCoordinator: Forcing performance optimization...');

    // Clear all caches
    this.coordinationCache.cleanup();

    // Clear debounced operations
    this.debouncedCoordinator.clearAll();

    // Clear batch queue
    this.batchProcessor.clear();

    // Force memory cleanup
    this.memoryManager.forceCleanup();

    // Update performance metrics
    this.updatePerformanceMetrics();

    console.log('ModuleCoordinator: Performance optimization completed');
  }
}

// Export singleton instance
export const moduleCoordinator = new ModuleCoordinator();
