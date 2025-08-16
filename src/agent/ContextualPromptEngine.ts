// MCP Context Block
/*
{
  file: "ContextualPromptEngine.ts",
  role: "prompt-engine",
  allowedActions: ["generate", "contextualize", "pattern"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "creativity"
}
*/

import { PromptPatternLibrary } from './PromptPatternLibrary';
import { logger } from '../lib/logger';

// Type definitions
export interface UserPrefs {
  tone: string;
  language: string;
  genre: string;
}

export interface DocumentContext {
  scene: string;
  arc: 'setup' | 'rising' | 'climax' | 'resolution';
  characterName?: string;
}

export interface PromptHeader {
  header: string; // Injected at top of LLM prompt
  tone: string;
  language: string;
  genre: string;
  patternUsed?: string;
}

// Fallback diagnostics types
interface FallbackLog {
  genre: string;
  arc: string;
  usedFallback: string;
  timestamp: number;
  context?: string;
}

// Configuration
interface PromptEngineConfig {
  debug?: boolean;
  enableMemoization?: boolean;
  maxMemoizedEntries?: number;
  enableFallbackLogging?: boolean;
}

// Memoization cache
interface MemoizedEntry {
  prefs: UserPrefs;
  context: DocumentContext;
  result: PromptHeader;
  timestamp: number;
}

class ContextualPromptEngine {
  private config: PromptEngineConfig;
  private memoizedResults: MemoizedEntry[] = [];
  private lastUsedValues: {
    prefs?: UserPrefs;
    context?: DocumentContext;
    result?: PromptHeader;
  } = {};

  // Fallback diagnostics
  private loggedFallbacks: Set<string> = new Set();
  private fallbackLogs: FallbackLog[] = [];
  private maxFallbackLogs: number = 1000;

  constructor(config: PromptEngineConfig = {}) {
    this.config = {
      debug: false,
      enableMemoization: true,
      maxMemoizedEntries: 100,
      enableFallbackLogging: true,
      ...config,
    };
  }

  /**
   * Logs a fallback warning when the system defaults to a fallback pattern
   */
  public logFallbackWarning(
    genre: string,
    arc: string,
    usedFallback: string,
    debug?: boolean
  ): void {
    const shouldLog =
      debug === true || (debug === undefined && this.config.debug);

    if (!shouldLog) {
      return;
    }

    const memoizationKey = `${genre}|${arc}|${usedFallback}`;

    // Prevent duplicate logging
    if (this.loggedFallbacks.has(memoizationKey)) {
      return;
    }

    // Log the warning
    console.warn(
      `[PromptEngine] No pattern match for genre "${genre}" + arc "${arc}". Using fallback: [${usedFallback}]`
    );

    // Track for memoization
    this.loggedFallbacks.add(memoizationKey);

    // Add to diagnostics log
    this.addFallbackLog(genre, arc, usedFallback);
  }

  /**
   * Adds a fallback log entry for diagnostics
   */
  private addFallbackLog(
    genre: string,
    arc: string,
    usedFallback: string,
    context?: string
  ): void {
    if (!this.config.enableFallbackLogging) {
      return;
    }

    const logEntry: FallbackLog = {
      genre,
      arc,
      usedFallback,
      timestamp: Date.now(),
      context,
    };

    this.fallbackLogs.push(logEntry);

    // Maintain log size limit
    if (this.fallbackLogs.length > this.maxFallbackLogs) {
      this.fallbackLogs = this.fallbackLogs.slice(-this.maxFallbackLogs);
    }
  }

  /**
   * Gets fallback diagnostics for monitoring and debugging
   */
  public getDiagnostics(): FallbackLog[] {
    return [...this.fallbackLogs];
  }

  /**
   * Clears fallback diagnostics
   */
  public clearFallbackLogs(): void {
    this.fallbackLogs = [];
    this.loggedFallbacks.clear();
  }

  /**
   * Gets fallback statistics
   */
  public getFallbackStats(): {
    totalFallbacks: number;
    uniqueFallbacks: number;
    recentFallbacks: FallbackLog[];
    mostCommonFallbacks: Array<{ genre: string; arc: string; count: number }>;
  } {
    const recentFallbacks = this.fallbackLogs
      .filter(log => Date.now() - log.timestamp < 24 * 60 * 60 * 1000) // Last 24 hours
      .sort((a, b) => b.timestamp - a.timestamp);

    // Count most common fallbacks
    const fallbackCounts = new Map<string, number>();
    this.fallbackLogs.forEach(log => {
      const key = `${log.genre}|${log.arc}`;
      fallbackCounts.set(key, (fallbackCounts.get(key) || 0) + 1);
    });

    const mostCommonFallbacks = Array.from(fallbackCounts.entries())
      .map(([key, count]) => {
        const [genre, arc] = key.split('|');
        return { genre, arc, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalFallbacks: this.fallbackLogs.length,
      uniqueFallbacks: this.loggedFallbacks.size,
      recentFallbacks,
      mostCommonFallbacks,
    };
  }

  /**
   * Builds a contextual prompt header based on user preferences and document context
   */
  public buildContextualPromptHeader(
    prefs: UserPrefs,
    doc: DocumentContext
  ): PromptHeader {
    if (this.config.debug) {
      logger.debug('Building contextual prompt header');
      logger.debug('Prompt preferences', { prefs });
      logger.debug('Document context', { context: doc });
    }

    // Check memoization first
    const memoized = this.getMemoizedResult(prefs, doc);
    if (memoized) {
      if (this.config.debug) {
        logger.debug('Using memoized result');
      }
      return memoized;
    }

    // Validate and sanitize inputs
    const sanitizedPrefs = this.sanitizeUserPrefs(prefs);
    const sanitizedContext = this.sanitizeDocumentContext(doc);

    // Get pattern from library with fallback tracking
    const pattern = this.getPatternFromLibraryWithFallback(
      sanitizedPrefs.genre,
      sanitizedContext.arc
    );

    // Inject character name if provided
    const injectedPattern = this.injectCharacterName(
      pattern,
      sanitizedContext.characterName
    );

    // Build the header
    const header = this.buildPromptHeader(sanitizedPrefs, injectedPattern);

    // Create result object
    const result: PromptHeader = {
      header,
      tone: sanitizedPrefs.tone,
      language: sanitizedPrefs.language,
      genre: sanitizedPrefs.genre,
      patternUsed: injectedPattern,
    };

    // Memoize result
    this.memoizeResult(sanitizedPrefs, sanitizedContext, result);

    if (this.config.debug) {
      logger.debug('Generated header', { header: result });
    }

    return result;
  }

  /**
   * Gets pattern from library with fallback tracking
   */
  private getPatternFromLibraryWithFallback(
    genre: string,
    arc: string
  ): string {
    if (this.config.debug) {
      logger.debug('Looking for pattern', { genre, arc });
    }

    // Try exact match first
    let pattern = PromptPatternLibrary.getPattern(genre, arc);
    let usedFallback = '';

    if (pattern) {
      if (this.config.debug) {
        logger.debug('Found exact pattern', { genre, arc, pattern });
      }
      return pattern;
    }

    // Fallback to setup arc
    if (arc !== 'setup') {
      pattern = PromptPatternLibrary.getPattern(genre, 'setup');
      if (pattern) {
        usedFallback = `setup arc for ${genre}`;
        this.logFallbackWarning(genre, arc, usedFallback, this.config.debug);

        if (this.config.debug) {
          logger.debug('Using setup pattern', { genre, pattern });
        }
        return pattern;
      }
    }

    // Fallback to generic pattern
    pattern =
      PromptPatternLibrary.getPattern('DEFAULT', arc) ||
      PromptPatternLibrary.getPattern('DEFAULT', 'setup') ||
      'Create an engaging scene that advances the story';

    usedFallback = `DEFAULT pattern for ${genre} / ${arc}`;
    this.logFallbackWarning(genre, arc, usedFallback, this.config.debug);

    if (this.config.debug) {
      logger.debug('Using fallback pattern', { pattern });
    }

    return pattern;
  }

  /**
   * Sanitizes and validates user preferences with safe fallbacks
   */
  private sanitizeUserPrefs(prefs: UserPrefs): UserPrefs {
    const safeTones = [
      'friendly',
      'formal',
      'casual',
      'professional',
      'creative',
      'dramatic',
    ];
    const safeLanguages = [
      'en',
      'es',
      'fr',
      'de',
      'it',
      'pt',
      'ja',
      'ko',
      'zh',
    ];

    return {
      tone: safeTones.includes(prefs.tone) ? prefs.tone : 'friendly',
      language: safeLanguages.includes(prefs.language) ? prefs.language : 'en',
      genre: prefs.genre || 'General',
    };
  }

  /**
   * Sanitizes document context with safe fallbacks
   */
  private sanitizeDocumentContext(context: DocumentContext): DocumentContext {
    const safeArcs = ['setup', 'rising', 'climax', 'resolution'];

    return {
      scene: context.scene || '',
      arc: safeArcs.includes(context.arc) ? context.arc : 'setup',
      characterName: context.characterName || undefined,
    };
  }

  /**
   * Injects character name into pattern if provided
   */
  private injectCharacterName(pattern: string, characterName?: string): string {
    if (!characterName) {
      return pattern;
    }

    // Replace common placeholders
    let injected = pattern
      .replace(/\[CHARACTER\]/g, characterName)
      .replace(/\[OTHER\]/g, 'another character')
      .replace(/\[THEY\]/g, characterName)
      .replace(/\[THEIR\]/g, `${characterName}'s`);

    if (this.config.debug && pattern !== injected) {
      logger.debug('Injected character name', { original: pattern, injected });
    }

    return injected;
  }

  /**
   * Builds the final prompt header string
   */
  private buildPromptHeader(prefs: UserPrefs, pattern: string): string {
    const header = `/* Tone: ${prefs.tone} | Language: ${prefs.language} | Genre: ${prefs.genre} */\n/* Pattern: "${pattern}" */\n\n`;

    if (this.config.debug) {
      logger.debug('Built header', { header });
    }

    return header;
  }

  /**
   * Checks for memoized result to avoid duplicates
   */
  private getMemoizedResult(
    prefs: UserPrefs,
    context: DocumentContext
  ): PromptHeader | null {
    if (!this.config.enableMemoization) {
      return null;
    }

    // Check last used values first (most common case)
    if (
      this.lastUsedValues.prefs &&
      this.lastUsedValues.context &&
      this.lastUsedValues.result
    ) {
      if (
        this.arePrefsEqual(this.lastUsedValues.prefs, prefs) &&
        this.areContextsEqual(this.lastUsedValues.context, context)
      ) {
        return this.lastUsedValues.result;
      }
    }

    // Check memoization cache
    for (const entry of this.memoizedResults) {
      if (
        this.arePrefsEqual(entry.prefs, prefs) &&
        this.areContextsEqual(entry.context, context)
      ) {
        // Update last used values
        this.lastUsedValues = {
          prefs: entry.prefs,
          context: entry.context,
          result: entry.result,
        };
        return entry.result;
      }
    }

    return null;
  }

  /**
   * Memoizes result for future use
   */
  private memoizeResult(
    prefs: UserPrefs,
    context: DocumentContext,
    result: PromptHeader
  ): void {
    if (!this.config.enableMemoization) {
      return;
    }

    // Update last used values
    this.lastUsedValues = { prefs, context, result };

    // Add to memoization cache
    this.memoizedResults.push({
      prefs,
      context,
      result,
      timestamp: Date.now(),
    });

    // Clean up old entries if cache is too large
    if (this.memoizedResults.length > this.config.maxMemoizedEntries!) {
      this.memoizedResults.sort((a, b) => b.timestamp - a.timestamp);
      this.memoizedResults = this.memoizedResults.slice(
        0,
        this.config.maxMemoizedEntries!
      );
    }
  }

  /**
   * Compares user preferences for equality
   */
  private arePrefsEqual(prefs1: UserPrefs, prefs2: UserPrefs): boolean {
    return (
      prefs1.tone === prefs2.tone &&
      prefs1.language === prefs2.language &&
      prefs1.genre === prefs2.genre
    );
  }

  /**
   * Compares document contexts for equality
   */
  private areContextsEqual(
    context1: DocumentContext,
    context2: DocumentContext
  ): boolean {
    return (
      context1.scene === context2.scene &&
      context1.arc === context2.arc &&
      context1.characterName === context2.characterName
    );
  }

  /**
   * Clears memoization cache
   */
  public clearMemoizationCache(): void {
    this.memoizedResults = [];
    this.lastUsedValues = {};

    if (this.config.debug) {
      logger.info('Cleared memoization cache');
    }
  }

  /**
   * Gets cache statistics
   */
  public getCacheStats(): { size: number; lastUsed: boolean } {
    return {
      size: this.memoizedResults.length,
      lastUsed: !!this.lastUsedValues.result,
    };
  }

  /**
   * Updates engine configuration
   */
  public updateConfig(newConfig: Partial<PromptEngineConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (this.config.debug) {
      logger.info('Configuration updated', { config: this.config });
    }
  }
}

// Export singleton instance and factory function
const defaultEngine = new ContextualPromptEngine();

export function buildContextualPromptHeader(
  prefs: UserPrefs,
  doc: DocumentContext
): PromptHeader {
  return defaultEngine.buildContextualPromptHeader(prefs, doc);
}

// Export fallback diagnostics functions
export function logFallbackWarning(
  genre: string,
  arc: string,
  usedFallback: string,
  debug?: boolean
): void {
  defaultEngine.logFallbackWarning(genre, arc, usedFallback, debug);
}

export function getDiagnostics(): FallbackLog[] {
  return defaultEngine.getDiagnostics();
}

export { ContextualPromptEngine, defaultEngine };
export type { PromptEngineConfig };
