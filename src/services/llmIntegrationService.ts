// LLM Integration Service
// MCP: { role: "admin", allowedActions: ["analyze", "process", "enhance"], theme: "llm_integration", contentSensitivity: "medium", tier: "Pro" }

export interface LLMProvider {
  id: string;
  name: string;
  description: string;
  logo: string;
  baseUrl: string;
  apiKeyRequired: boolean;
  models: LLMModel[];
  features: string[];
  pricing: {
    input: string;
    output: string;
    currency: string;
  };
  status: 'active' | 'beta' | 'deprecated';
}

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  contextLength: number;
  maxTokens: number;
  capabilities: string[];
  pricing: {
    input: number;
    output: number;
    currency: string;
  };
  status: 'available' | 'beta' | 'deprecated';
}

export interface LLMConfig {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt?: string;
  userPrompt?: string;
}

export interface LLMResponse {
  id: string;
  provider: string;
  model: string;
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata: {
    finishReason: string;
    responseTime: number;
    timestamp: Date;
  };
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    tokens: number;
    model: string;
    provider: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  provider: string;
  model: string;
  messages: ChatMessage[];
  config: LLMConfig;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    totalTokens: number;
    totalCost: number;
    messageCount: number;
  };
}

export class LLMIntegrationService {
  private providers: Map<string, LLMProvider> = new Map();
  private sessions: Map<string, ChatSession> = new Map();
  private configs: Map<string, LLMConfig> = new Map();

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize supported LLM providers
   */
  private initializeProviders(): void {
    // OpenAI
    this.providers.set('openai', {
      id: 'openai',
      name: 'OpenAI',
      description: 'Leading AI research company with GPT models',
      logo: '/logos/openai.svg',
      baseUrl: 'https://api.openai.com/v1',
      apiKeyRequired: true,
      models: [
        {
          id: 'gpt-4',
          name: 'GPT-4',
          provider: 'openai',
          contextLength: 8192,
          maxTokens: 4096,
          capabilities: ['text-generation', 'chat', 'code-generation', 'reasoning'],
          pricing: { input: 0.03, output: 0.06, currency: 'USD' },
          status: 'available'
        },
        {
          id: 'gpt-4-turbo',
          name: 'GPT-4 Turbo',
          provider: 'openai',
          contextLength: 128000,
          maxTokens: 4096,
          capabilities: ['text-generation', 'chat', 'code-generation', 'reasoning'],
          pricing: { input: 0.01, output: 0.03, currency: 'USD' },
          status: 'available'
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          provider: 'openai',
          contextLength: 16385,
          maxTokens: 4096,
          capabilities: ['text-generation', 'chat', 'code-generation'],
          pricing: { input: 0.0015, output: 0.002, currency: 'USD' },
          status: 'available'
        }
      ],
      features: ['Chat Completions', 'Function Calling', 'JSON Mode', 'Vision'],
      pricing: { input: 'Per 1K tokens', output: 'Per 1K tokens', currency: 'USD' },
      status: 'active'
    });

    // Anthropic (Claude)
    this.providers.set('anthropic', {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'AI safety research company with Claude models',
      logo: '/logos/anthropic.svg',
      baseUrl: 'https://api.anthropic.com',
      apiKeyRequired: true,
      models: [
        {
          id: 'claude-3-opus',
          name: 'Claude 3 Opus',
          provider: 'anthropic',
          contextLength: 200000,
          maxTokens: 4096,
          capabilities: ['text-generation', 'chat', 'code-generation', 'reasoning', 'vision'],
          pricing: { input: 0.015, output: 0.075, currency: 'USD' },
          status: 'available'
        },
        {
          id: 'claude-3-sonnet',
          name: 'Claude 3 Sonnet',
          provider: 'anthropic',
          contextLength: 200000,
          maxTokens: 4096,
          capabilities: ['text-generation', 'chat', 'code-generation', 'reasoning', 'vision'],
          pricing: { input: 0.003, output: 0.015, currency: 'USD' },
          status: 'available'
        },
        {
          id: 'claude-3-haiku',
          name: 'Claude 3 Haiku',
          provider: 'anthropic',
          contextLength: 200000,
          maxTokens: 4096,
          capabilities: ['text-generation', 'chat', 'code-generation', 'vision'],
          pricing: { input: 0.00025, output: 0.00125, currency: 'USD' },
          status: 'available'
        }
      ],
      features: ['Chat Completions', 'Function Calling', 'Vision', 'Long Context'],
      pricing: { input: 'Per 1K tokens', output: 'Per 1K tokens', currency: 'USD' },
      status: 'active'
    });

    // Google (Gemini)
    this.providers.set('google', {
      id: 'google',
      name: 'Google',
      description: 'Google AI with Gemini models',
      logo: '/logos/google.svg',
      baseUrl: 'https://generativelanguage.googleapis.com',
      apiKeyRequired: true,
      models: [
        {
          id: 'gemini-pro',
          name: 'Gemini Pro',
          provider: 'google',
          contextLength: 32768,
          maxTokens: 2048,
          capabilities: ['text-generation', 'chat', 'code-generation'],
          pricing: { input: 0.0005, output: 0.0015, currency: 'USD' },
          status: 'available'
        },
        {
          id: 'gemini-pro-vision',
          name: 'Gemini Pro Vision',
          provider: 'google',
          contextLength: 32768,
          maxTokens: 2048,
          capabilities: ['text-generation', 'chat', 'code-generation', 'vision'],
          pricing: { input: 0.0005, output: 0.0015, currency: 'USD' },
          status: 'available'
        }
      ],
      features: ['Chat Completions', 'Vision', 'Function Calling'],
      pricing: { input: 'Per 1K tokens', output: 'Per 1K tokens', currency: 'USD' },
      status: 'active'
    });

    // Mistral AI
    this.providers.set('mistral', {
      id: 'mistral',
      name: 'Mistral AI',
      description: 'European AI company with efficient models',
      logo: '/logos/mistral.svg',
      baseUrl: 'https://api.mistral.ai/v1',
      apiKeyRequired: true,
      models: [
        {
          id: 'mistral-large',
          name: 'Mistral Large',
          provider: 'mistral',
          contextLength: 32768,
          maxTokens: 4096,
          capabilities: ['text-generation', 'chat', 'code-generation'],
          pricing: { input: 0.007, output: 0.024, currency: 'EUR' },
          status: 'available'
        },
        {
          id: 'mistral-medium',
          name: 'Mistral Medium',
          provider: 'mistral',
          contextLength: 32768,
          maxTokens: 4096,
          capabilities: ['text-generation', 'chat', 'code-generation'],
          pricing: { input: 0.0024, output: 0.0061, currency: 'EUR' },
          status: 'available'
        },
        {
          id: 'mistral-small',
          name: 'Mistral Small',
          provider: 'mistral',
          contextLength: 32768,
          maxTokens: 4096,
          capabilities: ['text-generation', 'chat', 'code-generation'],
          pricing: { input: 0.0006, output: 0.0018, currency: 'EUR' },
          status: 'available'
        }
      ],
      features: ['Chat Completions', 'Function Calling', 'Efficient Models'],
      pricing: { input: 'Per 1K tokens', output: 'Per 1K tokens', currency: 'EUR' },
      status: 'active'
    });

    // Cohere
    this.providers.set('cohere', {
      id: 'cohere',
      name: 'Cohere',
      description: 'Enterprise-focused AI platform',
      logo: '/logos/cohere.svg',
      baseUrl: 'https://api.cohere.ai/v1',
      apiKeyRequired: true,
      models: [
        {
          id: 'command',
          name: 'Command',
          provider: 'cohere',
          contextLength: 32768,
          maxTokens: 4096,
          capabilities: ['text-generation', 'chat', 'code-generation'],
          pricing: { input: 0.0015, output: 0.002, currency: 'USD' },
          status: 'available'
        },
        {
          id: 'command-light',
          name: 'Command Light',
          provider: 'cohere',
          contextLength: 32768,
          maxTokens: 4096,
          capabilities: ['text-generation', 'chat', 'code-generation'],
          pricing: { input: 0.0006, output: 0.0006, currency: 'USD' },
          status: 'available'
        }
      ],
      features: ['Chat Completions', 'Enterprise Features', 'Custom Models'],
      pricing: { input: 'Per 1K tokens', output: 'Per 1K tokens', currency: 'USD' },
      status: 'active'
    });

    // Local Models (Ollama)
    this.providers.set('ollama', {
      id: 'ollama',
      name: 'Ollama',
      description: 'Local LLM deployment platform',
      logo: '/logos/ollama.svg',
      baseUrl: 'http://localhost:11434',
      apiKeyRequired: false,
      models: [
        {
          id: 'llama2',
          name: 'Llama 2',
          provider: 'ollama',
          contextLength: 4096,
          maxTokens: 2048,
          capabilities: ['text-generation', 'chat', 'code-generation'],
          pricing: { input: 0, output: 0, currency: 'USD' },
          status: 'available'
        },
        {
          id: 'codellama',
          name: 'Code Llama',
          provider: 'ollama',
          contextLength: 4096,
          maxTokens: 2048,
          capabilities: ['text-generation', 'chat', 'code-generation'],
          pricing: { input: 0, output: 0, currency: 'USD' },
          status: 'available'
        },
        {
          id: 'mistral',
          name: 'Mistral',
          provider: 'ollama',
          contextLength: 4096,
          maxTokens: 2048,
          capabilities: ['text-generation', 'chat', 'code-generation'],
          pricing: { input: 0, output: 0, currency: 'USD' },
          status: 'available'
        }
      ],
      features: ['Local Deployment', 'Free Usage', 'Custom Models'],
      pricing: { input: 'Free', output: 'Free', currency: 'USD' },
      status: 'active'
    });
  }

  /**
   * Get all available providers
   */
  getAllProviders(): LLMProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get a specific provider
   */
  getProvider(providerId: string): LLMProvider | null {
    return this.providers.get(providerId) || null;
  }

  /**
   * Get all models for a provider
   */
  getProviderModels(providerId: string): LLMModel[] {
    const provider = this.providers.get(providerId);
    return provider?.models || [];
  }

  /**
   * Get a specific model
   */
  getModel(providerId: string, modelId: string): LLMModel | null {
    const provider = this.providers.get(providerId);
    return provider?.models.find(m => m.id === modelId) || null;
  }

  /**
   * Create a new chat session
   */
  createChatSession(
    title: string,
    provider: string,
    model: string,
    config: Partial<LLMConfig>
  ): ChatSession {
    const sessionId = `session_${Date.now()}`;
    
    // Try to get API key from the API key manager if not provided
    let apiKey = config.apiKey || '';
    if (!apiKey) {
      try {
        const { apiKeyManager } = require('./apiKeyManager');
        const keyConfig = apiKeyManager.getKey(provider);
        if (keyConfig) {
          apiKey = keyConfig.apiKey;
          // Update usage statistics
          apiKeyManager.updateKeyUsage(provider);
        }
      } catch (error) {
        console.warn('API key manager not available, using provided key');
      }
    }

    const session: ChatSession = {
      id: sessionId,
      title,
      provider,
      model,
      messages: [],
      config: {
        provider,
        model,
        apiKey,
        baseUrl: config.baseUrl,
        temperature: config.temperature || 0.7,
        maxTokens: config.maxTokens || 2048,
        topP: config.topP || 1,
        frequencyPenalty: config.frequencyPenalty || 0,
        presencePenalty: config.presencePenalty || 0,
        systemPrompt: config.systemPrompt,
        userPrompt: config.userPrompt
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        totalTokens: 0,
        totalCost: 0,
        messageCount: 0
      }
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Get a chat session
   */
  getChatSession(sessionId: string): ChatSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all chat sessions
   */
  getAllChatSessions(): ChatSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Add a message to a chat session
   */
  addMessage(sessionId: string, role: 'system' | 'user' | 'assistant', content: string): ChatMessage | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      role,
      content,
      timestamp: new Date()
    };

    session.messages.push(message);
    session.updatedAt = new Date();
    session.metadata.messageCount++;

    return message;
  }

  /**
   * Send a message to the LLM and get response
   */
  async sendMessage(sessionId: string, content: string): Promise<LLMResponse | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Add user message
    this.addMessage(sessionId, 'user', content);

    try {
      const response = await this.callLLM(session.config, session.messages);
      
      if (response) {
        // Add assistant message
        this.addMessage(sessionId, 'assistant', response.content);
        
        // Update session metadata
        session.metadata.totalTokens += response.usage.totalTokens;
        session.metadata.totalCost += this.calculateCost(response, session.config);
      }

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  /**
   * Call the LLM API
   */
  private async callLLM(config: LLMConfig, messages: ChatMessage[]): Promise<LLMResponse | null> {
    const startTime = Date.now();

    try {
      switch (config.provider) {
        case 'openai':
          return await this.callOpenAI(config, messages);
        case 'anthropic':
          return await this.callAnthropic(config, messages);
        case 'google':
          return await this.callGoogle(config, messages);
        case 'mistral':
          return await this.callMistral(config, messages);
        case 'cohere':
          return await this.callCohere(config, messages);
        case 'ollama':
          return await this.callOllama(config, messages);
        default:
          throw new Error(`Unsupported provider: ${config.provider}`);
      }
    } catch (error) {
      console.error(`Error calling ${config.provider}:`, error);
      return null;
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(config: LLMConfig, messages: ChatMessage[]): Promise<LLMResponse> {
    const response = await fetch(`${config.baseUrl || 'https://api.openai.com/v1'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        top_p: config.topP,
        frequency_penalty: config.frequencyPenalty,
        presence_penalty: config.presencePenalty
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const responseTime = Date.now();

    return {
      id: data.id,
      provider: 'openai',
      model: config.model,
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      },
      metadata: {
        finishReason: data.choices[0].finish_reason,
        responseTime,
        timestamp: new Date()
      }
    };
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropic(config: LLMConfig, messages: ChatMessage[]): Promise<LLMResponse> {
    const response = await fetch(`${config.baseUrl || 'https://api.anthropic.com'}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        top_p: config.topP
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const responseTime = Date.now();

    return {
      id: data.id,
      provider: 'anthropic',
      model: config.model,
      content: data.content[0].text,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens
      },
      metadata: {
        finishReason: data.stop_reason,
        responseTime,
        timestamp: new Date()
      }
    };
  }

  /**
   * Call Google API
   */
  private async callGoogle(config: LLMConfig, messages: ChatMessage[]): Promise<LLMResponse> {
    const response = await fetch(`${config.baseUrl || 'https://generativelanguage.googleapis.com'}/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : msg.role,
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens,
          topP: config.topP
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const responseTime = Date.now();

    return {
      id: data.candidates[0].index.toString(),
      provider: 'google',
      model: config.model,
      content: data.candidates[0].content.parts[0].text,
      usage: {
        promptTokens: data.usageMetadata.promptTokenCount,
        completionTokens: data.usageMetadata.candidatesTokenCount,
        totalTokens: data.usageMetadata.totalTokenCount
      },
      metadata: {
        finishReason: data.candidates[0].finishReason,
        responseTime,
        timestamp: new Date()
      }
    };
  }

  /**
   * Call Mistral API
   */
  private async callMistral(config: LLMConfig, messages: ChatMessage[]): Promise<LLMResponse> {
    const response = await fetch(`${config.baseUrl || 'https://api.mistral.ai/v1'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        top_p: config.topP
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const responseTime = Date.now();

    return {
      id: data.id,
      provider: 'mistral',
      model: config.model,
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      },
      metadata: {
        finishReason: data.choices[0].finish_reason,
        responseTime,
        timestamp: new Date()
      }
    };
  }

  /**
   * Call Cohere API
   */
  private async callCohere(config: LLMConfig, messages: ChatMessage[]): Promise<LLMResponse> {
    const response = await fetch(`${config.baseUrl || 'https://api.cohere.ai/v1'}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        message: messages[messages.length - 1].content,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        top_p: config.topP
      })
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const responseTime = Date.now();

    return {
      id: data.response_id,
      provider: 'cohere',
      model: config.model,
      content: data.text,
      usage: {
        promptTokens: data.meta.input_tokens,
        completionTokens: data.meta.output_tokens,
        totalTokens: data.meta.input_tokens + data.meta.output_tokens
      },
      metadata: {
        finishReason: 'stop',
        responseTime,
        timestamp: new Date()
      }
    };
  }

  /**
   * Call Ollama API
   */
  private async callOllama(config: LLMConfig, messages: ChatMessage[]): Promise<LLMResponse> {
    const response = await fetch(`${config.baseUrl || 'http://localhost:11434'}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
        options: {
          temperature: config.temperature,
          num_predict: config.maxTokens,
          top_p: config.topP
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const responseTime = Date.now();

    return {
      id: `ollama_${Date.now()}`,
      provider: 'ollama',
      model: config.model,
      content: data.message.content,
      usage: {
        promptTokens: 0, // Ollama doesn't provide token usage
        completionTokens: 0,
        totalTokens: 0
      },
      metadata: {
        finishReason: 'stop',
        responseTime,
        timestamp: new Date()
      }
    };
  }

  /**
   * Calculate cost for a response
   */
  private calculateCost(response: LLMResponse, config: LLMConfig): number {
    const model = this.getModel(config.provider, config.model);
    if (!model) return 0;

    const inputCost = (response.usage.promptTokens / 1000) * model.pricing.input;
    const outputCost = (response.usage.completionTokens / 1000) * model.pricing.output;

    return inputCost + outputCost;
  }

  /**
   * Delete a chat session
   */
  deleteChatSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Update session title
   */
  updateSessionTitle(sessionId: string, title: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.title = title;
    session.updatedAt = new Date();
    return true;
  }

  /**
   * Export session as JSON
   */
  exportSession(sessionId: string): string | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return JSON.stringify(session, null, 2);
  }

  /**
   * Import session from JSON
   */
  importSession(sessionData: string): ChatSession | null {
    try {
      const session: ChatSession = JSON.parse(sessionData);
      this.sessions.set(session.id, session);
      return session;
    } catch (error) {
      console.error('Error importing session:', error);
      return null;
    }
  }
}

// Export singleton instance
export const llmIntegration = new LLMIntegrationService(); 