// MCP Context Block
/*
{
  file: "SessionMemory.ts",
  role: "service-developer",
  allowedActions: ["memory", "session", "context"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "agent_memory"
}
*/

interface MemoryEntry {
  id: string;
  timestamp: number;
  type: "conversation" | "preference" | "context" | "scene";
  content: string;
  metadata?: Record<string, unknown>;
}

interface SessionContext {
  sceneId?: string;
  characterId?: string;
  narrativeArc?: string;
  userPreferences?: Record<string, unknown>;
  conversationHistory?: MemoryEntry[];
}

class SessionMemory {
  private enabled: boolean = true;
  private memory: MemoryEntry[] = [];
  private sessionContext: SessionContext = {};
  private maxEntries: number = 100;

  // Static method declarations
  static enable: () => void;
  static disable: () => void;
  static clear: () => void;
  static isEnabled: () => boolean;
  static addEntry: (
    type: MemoryEntry["type"],
    content: string,
    metadata?: Record<string, unknown>
  ) => void;
  static getRecentEntries: (
    type?: MemoryEntry["type"],
    limit?: number
  ) => MemoryEntry[];
  static getSessionContext: () => SessionContext;
  static updateSessionContext: (context: Partial<SessionContext>) => void;
  static getConversationHistory: (limit?: number) => MemoryEntry[];
  static addConversationEntry: (content: string, isUser?: boolean) => void;
  static getSceneContext: (sceneId?: string) => MemoryEntry[];
  static addSceneContext: (
    sceneId: string,
    content: string,
    metadata?: Record<string, unknown>
  ) => void;
  static getCharacterContext: (characterId?: string) => MemoryEntry[];
  static addCharacterContext: (
    characterId: string,
    content: string,
    metadata?: Record<string, unknown>
  ) => void;
  static getMemorySummary: () => string;
  static searchMemory: (
    query: string,
    type?: MemoryEntry["type"]
  ) => MemoryEntry[];
  static getMemoryStats: () => {
    totalEntries: number;
    enabled: boolean;
    types: Record<string, number>;
    oldestEntry: number;
    newestEntry: number;
  };
  static exportMemory: () => {
    memory: MemoryEntry[];
    sessionContext: SessionContext;
    timestamp: number;
  };
  static importMemory: (data: {
    memory: MemoryEntry[];
    sessionContext: SessionContext;
  }) => void;
  static logMemoryUsage: (action: string, entryCount?: number) => void;

  // Enable session memory
  enable(): void {
    this.enabled = true;
    console.log("SessionMemory: Memory enabled");
  }

  // Disable session memory
  disable(): void {
    this.enabled = false;
    console.log("SessionMemory: Memory disabled");
  }

  // Clear all memory
  clear(): void {
    this.memory = [];
    this.sessionContext = {};
    console.log("SessionMemory: Memory cleared");
  }

  // Check if memory is enabled
  isEnabled(): boolean {
    return this.enabled;
  }

  // Add memory entry
  addEntry(
    type: MemoryEntry["type"],
    content: string,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.enabled) {
      console.log("SessionMemory: Memory disabled, skipping entry");
      return;
    }

    const entry: MemoryEntry = {
      id: `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      content,
      metadata,
    };

    this.memory.push(entry);

    // Maintain memory limit
    if (this.memory.length > this.maxEntries) {
      this.memory = this.memory.slice(-this.maxEntries);
      console.log(
        "SessionMemory: Memory limit reached, removed oldest entries"
      );
    }

    console.log(`SessionMemory: Added ${type} entry`);
  }

  // Get recent memory entries
  getRecentEntries(
    type?: MemoryEntry["type"],
    limit: number = 10
  ): MemoryEntry[] {
    if (!this.enabled) {
      return [];
    }

    let entries = this.memory;
    if (type) {
      entries = entries.filter((entry) => entry.type === type);
    }

    return entries.slice(-limit);
  }

  // Get session context
  getSessionContext(): SessionContext {
    if (!this.enabled) {
      return {};
    }

    return { ...this.sessionContext };
  }

  // Update session context
  updateSessionContext(context: Partial<SessionContext>): void {
    if (!this.enabled) {
      console.log("SessionMemory: Memory disabled, skipping context update");
      return;
    }

    this.sessionContext = { ...this.sessionContext, ...context };
    console.log("SessionMemory: Session context updated");
  }

  // Get conversation history
  getConversationHistory(limit: number = 20): MemoryEntry[] {
    return this.getRecentEntries("conversation", limit);
  }

  // Add conversation entry
  addConversationEntry(content: string, isUser: boolean = false): void {
    this.addEntry("conversation", content, { isUser });
  }

  // Get scene context
  getSceneContext(sceneId?: string): MemoryEntry[] {
    if (!this.enabled) {
      return [];
    }

    const targetSceneId = sceneId || this.sessionContext.sceneId;
    if (!targetSceneId) {
      return [];
    }

    return this.memory.filter(
      (entry) =>
        entry.type === "scene" && entry.metadata?.sceneId === targetSceneId
    );
  }

  // Add scene context
  addSceneContext(
    sceneId: string,
    content: string,
    metadata?: Record<string, unknown>
  ): void {
    this.addEntry("scene", content, { sceneId, ...metadata });
  }

  // Get character context
  getCharacterContext(characterId?: string): MemoryEntry[] {
    if (!this.enabled) {
      return [];
    }

    const targetCharacterId = characterId || this.sessionContext.characterId;
    if (!targetCharacterId) {
      return [];
    }

    return this.memory.filter(
      (entry) => entry.metadata?.characterId === targetCharacterId
    );
  }

  // Add character context
  addCharacterContext(
    characterId: string,
    content: string,
    metadata?: Record<string, unknown>
  ): void {
    this.addEntry("context", content, { characterId, ...metadata });
  }

  // Get memory summary for LLM context
  getMemorySummary(): string {
    if (!this.enabled || this.memory.length === 0) {
      return "No session memory available.";
    }

    const recentEntries = this.getRecentEntries(undefined, 5);
    const summary = recentEntries
      .map((entry) => `[${entry.type.toUpperCase()}] ${entry.content}`)
      .join("\n");

    return `Session Memory:\n${summary}`;
  }

  // Search memory by content
  searchMemory(query: string, type?: MemoryEntry["type"]): MemoryEntry[] {
    if (!this.enabled) {
      return [];
    }

    let entries = this.memory;
    if (type) {
      entries = entries.filter((entry) => entry.type === type);
    }

    return entries.filter((entry) =>
      entry.content.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Get memory statistics
  getMemoryStats(): {
    totalEntries: number;
    enabled: boolean;
    types: Record<string, number>;
    oldestEntry: number;
    newestEntry: number;
  } {
    const types = this.memory.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEntries: this.memory.length,
      enabled: this.enabled,
      types,
      oldestEntry: this.memory[0]?.timestamp || 0,
      newestEntry: this.memory[this.memory.length - 1]?.timestamp || 0,
    };
  }

  // Export memory for backup
  exportMemory(): {
    memory: MemoryEntry[];
    sessionContext: SessionContext;
    timestamp: number;
  } {
    return {
      memory: [...this.memory],
      sessionContext: { ...this.sessionContext },
      timestamp: Date.now(),
    };
  }

  // Import memory from backup
  importMemory(data: {
    memory: MemoryEntry[];
    sessionContext: SessionContext;
  }): void {
    if (!this.enabled) {
      console.log("SessionMemory: Memory disabled, skipping import");
      return;
    }

    this.memory = [...data.memory];
    this.sessionContext = { ...data.sessionContext };
    console.log("SessionMemory: Memory imported");
  }

  // Log memory usage for telemetry
  logMemoryUsage(action: string, entryCount?: number): void {
    if (window.logTelemetryEvent) {
      window.logTelemetryEvent("session_memory_used", {
        action,
        enabled: this.enabled,
        entryCount: entryCount || this.memory.length,
        timestamp: Date.now(),
      });
    }
  }
}

// Export singleton instance
export const sessionMemory = new SessionMemory();

// Add static methods to the class for global access
SessionMemory.enable = () => sessionMemory.enable();
SessionMemory.disable = () => sessionMemory.disable();
SessionMemory.clear = () => sessionMemory.clear();
SessionMemory.isEnabled = () => sessionMemory.isEnabled();
SessionMemory.addEntry = (
  type: MemoryEntry["type"],
  content: string,
  metadata?: Record<string, unknown>
) => sessionMemory.addEntry(type, content, metadata);
SessionMemory.getRecentEntries = (type?: MemoryEntry["type"], limit?: number) =>
  sessionMemory.getRecentEntries(type, limit);
SessionMemory.getSessionContext = () => sessionMemory.getSessionContext();
SessionMemory.updateSessionContext = (context: Partial<SessionContext>) =>
  sessionMemory.updateSessionContext(context);
SessionMemory.getConversationHistory = (limit?: number) =>
  sessionMemory.getConversationHistory(limit);
SessionMemory.addConversationEntry = (content: string, isUser?: boolean) =>
  sessionMemory.addConversationEntry(content, isUser);
SessionMemory.getSceneContext = (sceneId?: string) =>
  sessionMemory.getSceneContext(sceneId);
SessionMemory.addSceneContext = (
  sceneId: string,
  content: string,
  metadata?: Record<string, unknown>
) => sessionMemory.addSceneContext(sceneId, content, metadata);
SessionMemory.getCharacterContext = (characterId?: string) =>
  sessionMemory.getCharacterContext(characterId);
SessionMemory.addCharacterContext = (
  characterId: string,
  content: string,
  metadata?: Record<string, unknown>
) => sessionMemory.addCharacterContext(characterId, content, metadata);
SessionMemory.getMemorySummary = () => sessionMemory.getMemorySummary();
SessionMemory.searchMemory = (query: string, type?: MemoryEntry["type"]) =>
  sessionMemory.searchMemory(query, type);
SessionMemory.getMemoryStats = () => sessionMemory.getMemoryStats();
SessionMemory.exportMemory = () => sessionMemory.exportMemory();
SessionMemory.importMemory = (data: {
  memory: MemoryEntry[];
  sessionContext: SessionContext;
}) => sessionMemory.importMemory(data);
SessionMemory.logMemoryUsage = (action: string, entryCount?: number) =>
  sessionMemory.logMemoryUsage(action, entryCount);

// Export class for testing
export { SessionMemory };
