/**
 * API Testing Integration Utilities for E2E Testing
 * 
 * MCP Context Block:
 * role: qa-engineer,
 * tier: Pro,
 * file: "tests/e2e/utils/api-test-helpers.ts",
 * allowedActions: ["test", "validate", "simulate", "mock"],
 * theme: "advanced_test_patterns"
 */

import { Page, APIRequestContext, request } from '@playwright/test';

/**
 * API configuration for testing
 */
export interface APIConfig {
  baseURL: string;
  headers: Record<string, string>;
  timeout: number;
  retries: number;
}

/**
 * API response wrapper with metadata
 */
export interface APIResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
  timestamp: number;
  duration: number;
}

/**
 * API test context for managing requests
 */
export class APITestContext {
  private requestContext: APIRequestContext;
  private config: APIConfig;
  private requestHistory: Array<{
    method: string;
    url: string;
    status: number;
    duration: number;
    timestamp: number;
  }> = [];

  constructor(requestContext: APIRequestContext, config: APIConfig = apiConfigs.local) {
    this.requestContext = requestContext;
    this.config = config;
  }

  /**
   * Initialize the API context
   */
  async initialize(): Promise<void> {
    // No additional initialization needed for Playwright's APIRequestContext
  }

  /**
   * Dispose of the API context
   */
  async dispose(): Promise<void> {
    // Cleanup any pending requests or resources
    if (this.requestContext) {
      await this.requestContext.dispose();
    }
  }

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string, options?: {
    headers?: Record<string, string>;
    params?: Record<string, string>;
    timeout?: number;
  }): Promise<APIResponse<T>> {
    const startTime = Date.now();
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${this.config.baseURL}${endpoint}`;
    
    try {
      const response = await this.requestContext.get(fullUrl, {
        headers: {
          ...this.config.headers,
          ...options?.headers
        },
        params: options?.params,
        timeout: options?.timeout || this.config.timeout
      });

      const duration = Date.now() - startTime;
      const responseData = await response.json().catch(() => null);

      this.recordRequest('GET', fullUrl, response.status(), duration);

      return {
        data: responseData,
        status: response.status(),
        headers: response.headers(),
        timestamp: Date.now(),
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordRequest('GET', fullUrl, 0, duration);
      throw error;
    }
  }

  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, data: any, options?: {
    headers?: Record<string, string>;
    timeout?: number;
  }): Promise<APIResponse<T>> {
    const startTime = Date.now();
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${this.config.baseURL}${endpoint}`;
    
    try {
      const response = await this.requestContext.post(fullUrl, {
        data,
        headers: {
          ...this.config.headers,
          ...options?.headers
        },
        timeout: options?.timeout || this.config.timeout
      });

      const duration = Date.now() - startTime;
      const responseData = await response.json().catch(() => null);

      this.recordRequest('POST', fullUrl, response.status(), duration);

      return {
        data: responseData,
        status: response.status(),
        headers: response.headers(),
        timestamp: Date.now(),
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordRequest('POST', fullUrl, 0, duration);
      throw error;
    }
  }

  /**
   * Make a PUT request
   */
  async put<T>(endpoint: string, data: any, options?: {
    headers?: Record<string, string>;
    timeout?: number;
  }): Promise<APIResponse<T>> {
    const startTime = Date.now();
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${this.config.baseURL}${endpoint}`;
    
    try {
      const response = await this.requestContext.put(fullUrl, {
        data,
        headers: {
          ...this.config.headers,
          ...options?.headers
        },
        timeout: options?.timeout || this.config.timeout
      });

      const duration = Date.now() - startTime;
      const responseData = await response.json().catch(() => null);

      this.recordRequest('PUT', fullUrl, response.status(), duration);

      return {
        data: responseData,
        status: response.status(),
        headers: response.headers(),
        timestamp: Date.now(),
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordRequest('PUT', fullUrl, 0, duration);
      throw error;
    }
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string, options?: {
    headers?: Record<string, string>;
    timeout?: number;
  }): Promise<APIResponse<T>> {
    const startTime = Date.now();
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${this.config.baseURL}${endpoint}`;
    
    try {
      const response = await this.requestContext.delete(fullUrl, {
        headers: {
          ...this.config.headers,
          ...options?.headers
        },
        timeout: options?.timeout || this.config.timeout
      });

      const duration = Date.now() - startTime;

      this.recordRequest('DELETE', fullUrl, response.status(), duration);

      return {
        data: null,
        status: response.status(),
        headers: response.headers(),
        timestamp: Date.now(),
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordRequest('DELETE', fullUrl, 0, duration);
      throw error;
    }
  }

  /**
   * Record request for analytics
   */
  private recordRequest(method: string, url: string, status: number, duration: number): void {
    this.requestHistory.push({
      method,
      url,
      status,
      duration,
      timestamp: Date.now()
    });
  }

  /**
   * Get request history
   */
  getRequestHistory() {
    return [...this.requestHistory];
  }

  /**
   * Clear request history
   */
  clearRequestHistory(): void {
    this.requestHistory = [];
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    if (this.requestHistory.length === 0) {
      return { avgResponseTime: 0, totalRequests: 0, successRate: 0 };
    }

    const totalRequests = this.requestHistory.length;
    const successfulRequests = this.requestHistory.filter(r => r.status >= 200 && r.status < 300).length;
    const avgResponseTime = this.requestHistory.reduce((sum, r) => sum + r.duration, 0) / totalRequests;
    const successRate = (successfulRequests / totalRequests) * 100;

    return {
      avgResponseTime,
      totalRequests,
      successRate,
      minResponseTime: Math.min(...this.requestHistory.map(r => r.duration)),
      maxResponseTime: Math.max(...this.requestHistory.map(r => r.duration))
    };
  }
}

/**
 * API testing utilities for common scenarios
 */
export class APITestUtils {
  /**
   * Wait for API endpoint to be available
   */
  static async waitForAPIEndpoint(
    apiContext: APITestContext,
    endpoint: string,
    timeout: number = 30000,
    interval: number = 1000
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        await apiContext.get(endpoint);
        return; // API is available
      } catch {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    
    throw new Error(`API endpoint ${endpoint} not available within ${timeout}ms`);
  }

  /**
   * Validate API response structure
   */
  static validateResponseStructure<T>(
    response: APIResponse<T>,
    expectedFields: string[],
    requiredFields: string[] = []
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!(field in response.data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Check expected fields
    for (const field of expectedFields) {
      if (!(field in response.data)) {
        errors.push(`Missing expected field: ${field}`);
      }
    }
    
    // Check response metadata
    if (response.status < 200 || response.status >= 300) {
      errors.push(`Unexpected status code: ${response.status}`);
    }
    
    if (response.duration > 5000) {
      errors.push(`Response time too slow: ${response.duration}ms`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Retry API request with exponential backoff
   */
  static async retryRequest<T>(
    requestFn: () => Promise<APIResponse<T>>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<APIResponse<T>> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Mock API response for testing
   */
  static createMockResponse<T>(
    data: T,
    status: number = 200,
    headers: Record<string, string> = {}
  ): APIResponse<T> {
    return {
      data,
      status,
      headers: {
        'content-type': 'application/json',
        ...headers
      },
      timestamp: Date.now(),
      duration: 100
    };
  }
}

/**
 * Predefined API configurations for different environments
 */
export const apiConfigs = {
  local: {
    baseURL: 'http://localhost:5173/api',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 10000,
    retries: 3
  },
  
  staging: {
    baseURL: 'https://staging.doccraft.ai/api',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Environment': 'staging'
    },
    timeout: 15000,
    retries: 3
  },
  
  production: {
    baseURL: 'https://api.doccraft.ai',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Environment': 'production'
    },
    timeout: 20000,
    retries: 2
  }
};

/**
 * Common API test patterns
 */
export const apiTestPatterns = {
  /**
   * Test CRUD operations for a resource
   */
  async testCRUD<T>(
    apiContext: APITestContext,
    endpoint: string,
    createData: any,
    updateData: any,
    expectedFields: string[]
  ) {
    // Create
    const createResponse = await apiContext.post<T>(endpoint, createData);
    expect(createResponse.status).toBe(201);
    expect(createResponse.data).toBeDefined();
    
    const createdId = createResponse.data.id;
    
    // Read
    const readResponse = await apiContext.get<T>(`${endpoint}/${createdId}`);
    expect(readResponse.status).toBe(200);
    expect(readResponse.data).toBeDefined();
    
    // Update
    const updateResponse = await apiContext.put<T>(`${endpoint}/${createdId}`, updateData);
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data).toBeDefined();
    
    // Delete
    const deleteResponse = await apiContext.delete(`${endpoint}/${createdId}`);
    expect(deleteResponse.status).toBe(204);
    
    // Verify deletion
    try {
      await apiContext.get<T>(`${endpoint}/${createdId}`);
      throw new Error('Resource should have been deleted');
    } catch (error) {
      // Expected error for deleted resource
    }
  },

  /**
   * Test pagination
   */
  async testPagination<T>(
    apiContext: APITestContext,
    endpoint: string,
    expectedFields: string[]
  ) {
    // Test first page
    const firstPage = await apiContext.get<T>(`${endpoint}?page=1&limit=10`);
    expect(firstPage.status).toBe(200);
    expect(firstPage.data.items).toBeDefined();
    expect(firstPage.data.items.length).toBeLessThanOrEqual(10);
    
    // Test second page
    const secondPage = await apiContext.get<T>(`${endpoint}?page=2&limit=10`);
    expect(secondPage.status).toBe(200);
    expect(secondPage.data.items).toBeDefined();
    
    // Verify different content
    if (firstPage.data.items.length > 0 && secondPage.data.items.length > 0) {
      expect(firstPage.data.items[0].id).not.toBe(secondPage.data.items[0].id);
    }
  }
};
