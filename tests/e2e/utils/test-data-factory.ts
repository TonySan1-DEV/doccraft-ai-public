/**
 * Test Data Factory for E2E Testing
 *
 * MCP Context Block:
 * role: qa-engineer,
 * tier: Pro,
 * file: "tests/e2e/utils/test-data-factory.ts",
 * allowedActions: ["create", "manage", "seed", "cleanup"],
 * theme: "advanced_test_patterns"
 */

import { Page } from '@playwright/test';

/**
 * Test data types for DocCraft AI
 */
export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'moderator';
  preferences: Record<string, any>;
}

export interface TestDocument {
  id: string;
  title: string;
  content: string;
  type: 'story' | 'article' | 'script' | 'document';
  status: 'draft' | 'published' | 'archived';
  genre: string;
  metadata: Record<string, any>;
}

export interface TestCharacter {
  id: string;
  name: string;
  personality: string;
  role: 'protagonist' | 'antagonist' | 'supporting';
  traits: string[];
}

export interface TestEmotionArc {
  id: string;
  characterId: string;
  emotions: Array<{
    emotion: string;
    intensity: number;
    timestamp: number;
  }>;
}

/**
 * Test Data Factory Class
 */
export class TestDataFactory {
  private static instance: TestDataFactory;
  private dataCache: Map<string, any> = new Map();
  private cleanupQueue: Array<() => Promise<void>> = [];

  private constructor() {}

  static getInstance(): TestDataFactory {
    if (!TestDataFactory.instance) {
      TestDataFactory.instance = new TestDataFactory();
    }
    return TestDataFactory.instance;
  }

  /**
   * Create a test user with realistic data
   */
  createUser(overrides: Partial<TestUser> = {}): TestUser {
    const baseUser: TestUser = {
      id: `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: `testuser${Date.now()}@example.com`,
      name: `Test User ${Date.now()}`,
      role: 'user',
      preferences: {
        theme: 'dark',
        language: 'en',
        notifications: 'true',
      },
      ...overrides,
    };

    this.dataCache.set(baseUser.id, baseUser);
    return baseUser;
  }

  /**
   * Create a test document with realistic content
   */
  createDocument(overrides: Partial<TestDocument> = {}): TestDocument {
    const baseDocument: TestDocument = {
      id: `test-doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `Test Document ${Date.now()}`,
      content: this.generateLoremIpsum(100),
      type: 'story',
      status: 'draft',
      genre: 'fiction',
      metadata: {
        wordCount: 100,
        createdAt: new Date().toISOString(),
        tags: ['test', 'automation'],
      },
      ...overrides,
    };

    this.dataCache.set(baseDocument.id, baseDocument);
    return baseDocument;
  }

  /**
   * Create a test character with personality
   */
  createCharacter(overrides: Partial<TestCharacter> = {}): TestCharacter {
    const baseCharacter: TestCharacter = {
      id: `test-char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Test Character ${Date.now()}`,
      personality:
        'A curious and adventurous individual who loves to explore new ideas.',
      role: 'protagonist',
      traits: ['curious', 'adventurous', 'creative', 'determined'],
      ...overrides,
    };

    this.dataCache.set(baseCharacter.id, baseCharacter);
    return baseCharacter;
  }

  /**
   * Create an emotion arc for testing
   */
  createEmotionArc(overrides: Partial<TestEmotionArc> = {}): TestEmotionArc {
    const baseArc: TestEmotionArc = {
      id: `test-arc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      characterId: overrides.characterId || `test-char-${Date.now()}`,
      emotions: [
        { emotion: 'joy', intensity: 0.8, timestamp: Date.now() - 10000 },
        { emotion: 'sadness', intensity: 0.3, timestamp: Date.now() - 5000 },
        { emotion: 'excitement', intensity: 0.9, timestamp: Date.now() },
      ],
      ...overrides,
    };

    this.dataCache.set(baseArc.id, baseArc);
    return baseArc;
  }

  /**
   * Generate realistic Lorem Ipsum content
   */
  private generateLoremIpsum(wordCount: number): string {
    const words = [
      'lorem',
      'ipsum',
      'dolor',
      'sit',
      'amet',
      'consectetur',
      'adipiscing',
      'elit',
      'sed',
      'do',
      'eiusmod',
      'tempor',
      'incididunt',
      'ut',
      'labore',
      'et',
      'dolore',
      'magna',
      'aliqua',
      'ut',
      'enim',
      'ad',
      'minim',
      'veniam',
      'quis',
      'nostrud',
      'exercitation',
      'ullamco',
      'laboris',
      'nisi',
      'ut',
      'aliquip',
      'ex',
      'ea',
      'commodo',
      'consequat',
      'duis',
      'aute',
      'irure',
      'dolor',
      'in',
      'reprehenderit',
    ];

    let result = '';
    for (let i = 0; i < wordCount; i++) {
      if (i > 0 && i % 10 === 0) {
        result += '. ';
      }
      result += words[Math.floor(Math.random() * words.length)];
      if (i < wordCount - 1) {
        result += ' ';
      }
    }
    result += '.';
    return result;
  }

  /**
   * Create multiple test entities for bulk testing
   */
  createBulkData(options: {
    users?: number;
    documents?: number;
    characters?: number;
    emotionArcs?: number;
  }): {
    users: TestUser[];
    documents: TestDocument[];
    characters: TestCharacter[];
    emotionArcs: TestEmotionArc[];
  } {
    const result = {
      users: [] as TestUser[],
      documents: [] as TestDocument[],
      characters: [] as TestCharacter[],
      emotionArcs: [] as TestEmotionArc[],
    };

    if (options.users) {
      for (let i = 0; i < options.users; i++) {
        result.users.push(this.createUser());
      }
    }

    if (options.documents) {
      for (let i = 0; i < options.documents; i++) {
        result.documents.push(this.createDocument());
      }
    }

    if (options.characters) {
      for (let i = 0; i < options.characters; i++) {
        result.characters.push(this.createCharacter());
      }
    }

    if (options.emotionArcs) {
      for (let i = 0; i < options.emotionArcs; i++) {
        result.emotionArcs.push(this.createEmotionArc());
      }
    }

    return result;
  }

  /**
   * Add cleanup task to queue
   */
  addCleanupTask(cleanupFn: () => Promise<void>): void {
    this.cleanupQueue.push(cleanupFn);
  }

  /**
   * Execute all cleanup tasks
   */
  async cleanup(): Promise<void> {
    for (const cleanupTask of this.cleanupQueue) {
      try {
        await cleanupTask();
      } catch (error) {
        console.warn('Cleanup task failed:', error);
      }
    }
    this.cleanupQueue = [];
    this.dataCache.clear();
  }

  /**
   * Get cached data by ID
   */
  getCachedData<T>(id: string): T | undefined {
    return this.dataCache.get(id);
  }

  /**
   * Clear specific cached data
   */
  clearCachedData(id: string): boolean {
    return this.dataCache.delete(id);
  }

  /**
   * Get all cached data
   */
  getAllCachedData(): Map<string, any> {
    return new Map(this.dataCache);
  }
}

/**
 * Convenience functions for common test data creation
 */
export const testData = {
  user: (overrides?: Partial<TestUser>) =>
    TestDataFactory.getInstance().createUser(overrides),
  document: (overrides?: Partial<TestDocument>) =>
    TestDataFactory.getInstance().createDocument(overrides),
  character: (overrides?: Partial<TestCharacter>) =>
    TestDataFactory.getInstance().createCharacter(overrides),
  emotionArc: (overrides?: Partial<TestEmotionArc>) =>
    TestDataFactory.getInstance().createEmotionArc(overrides),
  bulk: <T>(factory: () => T, count: number, overrides?: Partial<T>[]) =>
    TestDataFactory.getInstance().createBulkData(factory, count, overrides),
  cleanup: () => TestDataFactory.getInstance().cleanup(),
};

/**
 * Test data fixtures for common scenarios
 */
export const testFixtures = {
  // User scenarios
  newUser: testData.user({ role: 'user', preferences: { theme: 'light' } }),
  adminUser: testData.user({ role: 'admin', preferences: { theme: 'dark' } }),
  moderatorUser: testData.user({ role: 'moderator' }),

  // Document scenarios
  draftStory: testData.document({ type: 'story', status: 'draft' }),
  publishedArticle: testData.document({ type: 'article', status: 'published' }),
  sampleDocument: testData.document({ type: 'story', status: 'published' }),
  archivedScript: testData.document({ type: 'script', status: 'archived' }),

  // Character scenarios
  protagonist: testData.character({ role: 'protagonist' }),
  antagonist: testData.character({ role: 'antagonist' }),
  supporting: testData.character({ role: 'supporting' }),

  // Emotion arc scenarios
  positiveArc: testData.emotionArc({
    emotions: [
      { emotion: 'joy', intensity: 0.9, timestamp: Date.now() - 20000 },
      { emotion: 'excitement', intensity: 0.8, timestamp: Date.now() - 10000 },
      { emotion: 'contentment', intensity: 0.7, timestamp: Date.now() },
    ],
  }),
  negativeArc: testData.emotionArc({
    emotions: [
      { emotion: 'fear', intensity: 0.6, timestamp: Date.now() - 20000 },
      { emotion: 'sadness', intensity: 0.8, timestamp: Date.now() - 10000 },
      { emotion: 'anger', intensity: 0.5, timestamp: Date.now() },
    ],
  }),
};
