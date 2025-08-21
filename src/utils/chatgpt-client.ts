import {
  ChatGPTQuery,
  ChatGPTResponse,
} from '../../mcp/providers/chatgpt-integration';

export interface ChatGPTClientConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  apiKey?: string;
}

export class ChatGPTClient {
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private apiKey?: string;

  constructor(config: ChatGPTClientConfig = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:4000';
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;
    this.apiKey = config.apiKey;
  }

  /**
   * Send a query to ChatGPT with codebase context
   */
  async query(
    query: string,
    context?: ChatGPTQuery['context'],
    options?: ChatGPTQuery['options']
  ): Promise<ChatGPTResponse> {
    const payload: ChatGPTQuery = {
      query,
      context,
      options,
    };

    return this.makeRequest('/chatgpt/query', {
      method: 'POST',
      body: payload,
    });
  }

  /**
   * Get codebase statistics
   */
  async getStats(): Promise<any> {
    return this.makeRequest('/chatgpt/stats', {
      method: 'GET',
    });
  }

  /**
   * Get MCP registry summary
   */
  async getRegistrySummary(): Promise<any> {
    return this.makeRequest('/mcp/registry/summary', {
      method: 'GET',
    });
  }

  /**
   * Get file context from MCP registry
   */
  async getFileContext(filePath: string): Promise<any> {
    return this.makeRequest(
      `/mcp/registry/file/${encodeURIComponent(filePath)}`,
      {
        method: 'GET',
      }
    );
  }

  /**
   * Search MCP registry by role or complexity
   */
  async searchRegistry(params: {
    role?: string;
    complexity?: 'low' | 'medium' | 'high';
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params.role) queryParams.append('role', params.role);
    if (params.complexity) queryParams.append('complexity', params.complexity);

    return this.makeRequest(`/mcp/registry/search?${queryParams.toString()}`, {
      method: 'GET',
    });
  }

  /**
   * Check server health
   */
  async healthCheck(): Promise<any> {
    return this.makeRequest('/health', {
      method: 'GET',
    });
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest(
    endpoint: string,
    options: RequestInit
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
            ...options.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `HTTP ${response.status}: ${errorData.message || response.statusText}`
          );
        }

        return await response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === this.retries) {
          throw new Error(
            `Request failed after ${this.retries} attempts. Last error: ${lastError.message}`
          );
        }

        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Convenience method for asking about a specific file
   */
  async askAboutFile(
    filePath: string,
    question: string,
    action?: string
  ): Promise<ChatGPTResponse> {
    return this.query(
      question,
      {
        filePath,
        action,
        complexity: 'medium',
      },
      {
        includeCode: true,
        includeDependencies: true,
        includeRelatedFiles: true,
      }
    );
  }

  /**
   * Convenience method for getting implementation guidance
   */
  async getImplementationGuidance(
    filePath: string,
    feature: string
  ): Promise<ChatGPTResponse> {
    return this.query(
      `How to implement ${feature} in ${filePath}?`,
      {
        filePath,
        task: 'implementation',
        complexity: 'medium',
      },
      {
        includeCode: true,
        includeDependencies: true,
        includeRelatedFiles: true,
      }
    );
  }

  /**
   * Convenience method for getting explanation
   */
  async getExplanation(
    filePath: string,
    concept: string
  ): Promise<ChatGPTResponse> {
    return this.query(
      `What is ${concept} in ${filePath}?`,
      {
        filePath,
        task: 'explanation',
        complexity: 'low',
      },
      {
        includeCode: false,
        includeDependencies: true,
        includeRelatedFiles: true,
      }
    );
  }

  /**
   * Convenience method for getting fix guidance
   */
  async getFixGuidance(
    filePath: string,
    issue: string
  ): Promise<ChatGPTResponse> {
    return this.query(
      `How to fix ${issue} in ${filePath}?`,
      {
        filePath,
        task: 'fix',
        complexity: 'medium',
      },
      {
        includeCode: true,
        includeDependencies: true,
        includeRelatedFiles: true,
      }
    );
  }

  /**
   * Batch query multiple questions
   */
  async batchQuery(
    queries: Array<{
      query: string;
      context?: ChatGPTQuery['context'];
      options?: ChatGPTQuery['options'];
    }>
  ): Promise<ChatGPTResponse[]> {
    const promises = queries.map(q =>
      this.query(q.query, q.context, q.options)
    );
    return Promise.all(promises);
  }

  /**
   * Stream query response (for long-running queries)
   */
  async *streamQuery(
    query: string,
    context?: ChatGPTQuery['context'],
    options?: ChatGPTQuery['options']
  ): AsyncGenerator<string> {
    // This is a simplified streaming implementation
    // In a real scenario, you might want to use Server-Sent Events or WebSockets

    const response = await this.query(query, context, options);

    // Simulate streaming by yielding parts of the response
    const parts = response.answer.split('\n\n');

    for (const part of parts) {
      yield part;
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// Default client instance
export const chatGPTClient = new ChatGPTClient();

// React hook for using ChatGPT client
export function useChatGPTClient() {
  return {
    query: chatGPTClient.query.bind(chatGPTClient),
    askAboutFile: chatGPTClient.askAboutFile.bind(chatGPTClient),
    getImplementationGuidance:
      chatGPTClient.getImplementationGuidance.bind(chatGPTClient),
    getExplanation: chatGPTClient.getExplanation.bind(chatGPTClient),
    getFixGuidance: chatGPTClient.getFixGuidance.bind(chatGPTClient),
    batchQuery: chatGPTClient.batchQuery.bind(chatGPTClient),
    streamQuery: chatGPTClient.streamQuery.bind(chatGPTClient),
    getStats: chatGPTClient.getStats.bind(chatGPTClient),
    getRegistrySummary: chatGPTClient.getRegistrySummary.bind(chatGPTClient),
    getFileContext: chatGPTClient.getFileContext.bind(chatGPTClient),
    searchRegistry: chatGPTClient.searchRegistry.bind(chatGPTClient),
    healthCheck: chatGPTClient.healthCheck.bind(chatGPTClient),
  };
}

export default ChatGPTClient;
