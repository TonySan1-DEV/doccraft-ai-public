// API Key Manager Service
// MCP: { role: "admin", allowedActions: ["manage", "secure", "validate"], theme: "security", contentSensitivity: "high", tier: "Pro" }

export interface APIKeyConfig {
  provider: string;
  apiKey: string;
  isActive: boolean;
  lastUsed?: Date;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface APIKeyValidationResult {
  isValid: boolean;
  error?: string;
  provider?: string;
  model?: string;
}

class APIKeyManager {
  private readonly STORAGE_KEY = "doccraft_api_keys";
  private keys: Map<string, APIKeyConfig> = new Map();

  constructor() {
    this.loadKeys();
  }

  /**
   * Load API keys from local storage
   */
  private loadKeys(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.keys.clear();
        parsed.forEach((key: any) => {
          // Convert date strings back to Date objects
          const config: APIKeyConfig = {
            ...key,
            lastUsed: key.lastUsed ? new Date(key.lastUsed) : undefined,
            createdAt: new Date(key.createdAt),
            updatedAt: new Date(key.updatedAt),
          };
          this.keys.set(key.provider, config);
        });
      }
    } catch (error) {
      console.error("Failed to load API keys:", error);
      this.keys.clear();
    }
  }

  /**
   * Save API keys to local storage
   */
  private saveKeys(): void {
    try {
      const keysArray = Array.from(this.keys.values());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(keysArray));
    } catch (error) {
      console.error("Failed to save API keys:", error);
    }
  }

  /**
   * Add or update an API key
   */
  addKey(provider: string, apiKey: string): APIKeyConfig {
    const now = new Date();
    const config: APIKeyConfig = {
      provider,
      apiKey,
      isActive: true,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    // If key already exists, preserve usage stats
    const existing = this.keys.get(provider);
    if (existing) {
      config.usageCount = existing.usageCount;
      config.lastUsed = existing.lastUsed;
      config.createdAt = existing.createdAt;
    }

    this.keys.set(provider, config);
    this.saveKeys();
    return config;
  }

  /**
   * Get an API key for a specific provider
   */
  getKey(provider: string): APIKeyConfig | null {
    const key = this.keys.get(provider);
    if (!key || !key.isActive) return null;
    return key;
  }

  /**
   * Get all API keys
   */
  getAllKeys(): APIKeyConfig[] {
    return Array.from(this.keys.values());
  }

  /**
   * Get active API keys
   */
  getActiveKeys(): APIKeyConfig[] {
    return Array.from(this.keys.values()).filter((key) => key.isActive);
  }

  /**
   * Remove an API key
   */
  removeKey(provider: string): boolean {
    const removed = this.keys.delete(provider);
    if (removed) {
      this.saveKeys();
    }
    return removed;
  }

  /**
   * Update key usage statistics
   */
  updateKeyUsage(provider: string): void {
    const key = this.keys.get(provider);
    if (key) {
      key.usageCount += 1;
      key.lastUsed = new Date();
      key.updatedAt = new Date();
      this.saveKeys();
    }
  }

  /**
   * Toggle key active status
   */
  toggleKeyActive(provider: string): boolean {
    const key = this.keys.get(provider);
    if (key) {
      key.isActive = !key.isActive;
      key.updatedAt = new Date();
      this.saveKeys();
      return key.isActive;
    }
    return false;
  }

  /**
   * Validate an API key by making a test call
   */
  async validateKey(
    provider: string,
    apiKey: string
  ): Promise<APIKeyValidationResult> {
    try {
      // Import the LLM service dynamically to avoid circular dependencies
      const { llmIntegration } = await import("./llmIntegrationService");

      // Create a test config
      const testConfig = {
        provider,
        model: this.getDefaultModel(provider),
        apiKey,
        temperature: 0.1,
        maxTokens: 10,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        systemPrompt: 'You are a test assistant. Respond with "OK" only.',
      };

      // Make a minimal test call
      const testMessages = [
        {
          id: "test",
          role: "user" as const,
          content: "test",
          timestamp: new Date(),
        },
      ];

      const response = await llmIntegration["callLLM"](
        testConfig,
        testMessages
      );

      return {
        isValid: !!response,
        provider,
        model: testConfig.model,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "Unknown error",
        provider,
      };
    }
  }

  /**
   * Get default model for provider
   */
  private getDefaultModel(provider: string): string {
    const defaultModels: { [key: string]: string } = {
      openai: "gpt-3.5-turbo",
      anthropic: "claude-3-haiku-20240307",
      google: "gemini-pro",
      mistral: "mistral-small",
      cohere: "command",
      ollama: "llama2",
    };
    return defaultModels[provider] || "gpt-3.5-turbo";
  }

  /**
   * Clear all API keys
   */
  clearAllKeys(): void {
    this.keys.clear();
    this.saveKeys();
  }

  /**
   * Export API keys (for backup)
   */
  exportKeys(): string {
    const keysArray = Array.from(this.keys.values());
    return JSON.stringify(keysArray, null, 2);
  }

  /**
   * Import API keys (from backup)
   */
  importKeys(jsonData: string): boolean {
    try {
      const keysArray = JSON.parse(jsonData);
      if (!Array.isArray(keysArray)) {
        throw new Error("Invalid format: expected array");
      }

      // Validate each key
      for (const key of keysArray) {
        if (!key.provider || !key.apiKey) {
          throw new Error("Invalid key format: missing provider or apiKey");
        }
      }

      // Clear existing keys and import new ones
      this.keys.clear();
      keysArray.forEach((key: any) => {
        const config: APIKeyConfig = {
          ...key,
          lastUsed: key.lastUsed ? new Date(key.lastUsed) : undefined,
          createdAt: new Date(key.createdAt || Date.now()),
          updatedAt: new Date(key.updatedAt || Date.now()),
        };
        this.keys.set(key.provider, config);
      });

      this.saveKeys();
      return true;
    } catch (error) {
      console.error("Failed to import API keys:", error);
      return false;
    }
  }

  /**
   * Get key statistics
   */
  getKeyStats(): {
    totalKeys: number;
    activeKeys: number;
    totalUsage: number;
    mostUsedProvider?: string;
  } {
    const activeKeys = Array.from(this.keys.values()).filter(
      (key) => key.isActive
    );
    const totalUsage = Array.from(this.keys.values()).reduce(
      (sum, key) => sum + key.usageCount,
      0
    );

    let mostUsedProvider: string | undefined;
    let maxUsage = 0;

    for (const [provider, key] of this.keys) {
      if (key.usageCount > maxUsage) {
        maxUsage = key.usageCount;
        mostUsedProvider = provider;
      }
    }

    return {
      totalKeys: this.keys.size,
      activeKeys: activeKeys.length,
      totalUsage,
      mostUsedProvider,
    };
  }

  /**
   * Check if a provider has a valid key
   */
  hasValidKey(provider: string): boolean {
    const key = this.keys.get(provider);
    return !!(key && key.isActive && key.apiKey);
  }

  /**
   * Get providers with valid keys
   */
  getProvidersWithKeys(): string[] {
    return Array.from(this.keys.keys()).filter((provider) =>
      this.hasValidKey(provider)
    );
  }
}

// Export singleton instance
export const apiKeyManager = new APIKeyManager();
