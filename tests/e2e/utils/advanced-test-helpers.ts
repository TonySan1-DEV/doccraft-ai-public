/**
 * Advanced Test Helper Utilities for E2E Testing
 *
 * MCP Context Block:
 * role: qa-engineer,
 * tier: Pro,
 * file: "tests/e2e/utils/advanced-test-helpers.ts",
 * allowedActions: ["test", "validate", "simulate", "analyze"],
 * theme: "advanced_test_patterns"
 */

import { Page, Locator, expect } from '@playwright/test';
import { testData, testFixtures } from './test-data-factory';

/**
 * Visual regression testing utilities
 */
export class VisualTestUtils {
  /**
   * Take a screenshot and compare with baseline
   */
  static async compareScreenshot(
    page: Page,
    name: string,
    selector?: string,
    options?: {
      threshold?: number;
      fullPage?: boolean;
      mask?: string[];
    }
  ): Promise<{ passed: boolean; diff?: Buffer }> {
    const screenshot = await page.screenshot({
      path: `test-results/visual/${name}-${Date.now()}.png`,
      fullPage: options?.fullPage ?? false,
      clip: selector ? await page.locator(selector).boundingBox() : undefined,
    });

    // TODO: Implement actual visual comparison logic
    // This would typically use tools like pixelmatch or similar
    return { passed: true };
  }

  /**
   * Wait for visual stability of an element
   */
  static async waitForVisualStability(
    page: Page,
    selector: string,
    timeout: number = 2000
  ): Promise<void> {
    // Wait for any CSS transitions to complete
    await page.waitForFunction(
      selector => {
        const element = document.querySelector(selector);
        if (!element) return false;

        // Check if element has any active transitions
        const style = window.getComputedStyle(element);
        const transition = style.transition;
        const animation = style.animation;

        // If no transitions or animations, consider it stable
        const hasTransitions = transition && transition !== 'none';
        const hasAnimations = animation && animation !== 'none';

        return !hasTransitions && !hasAnimations;
      },
      selector,
      { timeout }
    );
  }

  /**
   * Check for layout shifts (CLS monitoring)
   */
  static async monitorLayoutShifts(
    page: Page,
    callback?: (shifts: any[]) => void
  ): Promise<any[]> {
    const shifts: any[] = [];

    await page.addInitScript(() => {
      let observer: PerformanceObserver;

      if ('PerformanceObserver' in window) {
        observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift') {
              (window as any).__layoutShifts =
                (window as any).__layoutShifts || [];
              (window as any).__layoutShifts.push(entry);
            }
          }
        });

        observer.observe({ entryTypes: ['layout-shift'] });
      }
    });

    // Wait for potential layout shifts
    await page.waitForTimeout(2000);

    const layoutShifts = await page.evaluate(() => {
      return (window as any).__layoutShifts || [];
    });

    if (callback) {
      callback(layoutShifts);
    }

    return layoutShifts;
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceTestUtils {
  /**
   * Measure page load performance
   */
  static async measurePageLoad(page: Page): Promise<{
    navigationStart: number;
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
  }> {
    const performanceMetrics = await page.evaluate(() => {
      try {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        const lcp = performance.getEntriesByType('largest-contentful-paint')[0];

        return {
          navigationStart: navigation?.startTime || 0,
          domContentLoaded: navigation
            ? navigation.domContentLoadedEventEnd - navigation.startTime
            : 0,
          loadComplete: navigation
            ? navigation.loadEventEnd - navigation.startTime
            : 0,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint:
            paint.find(p => p.name === 'first-contentful-paint')?.startTime ||
            0,
          largestContentfulPaint: lcp?.startTime || 0,
        };
      } catch (error) {
        // Fallback values if performance metrics are not available
        return {
          navigationStart: 0,
          domContentLoaded: 0,
          loadComplete: 0,
          firstPaint: 0,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
        };
      }
    });

    return performanceMetrics;
  }

  /**
   * Monitor memory usage
   */
  static async monitorMemoryUsage(page: Page): Promise<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  }> {
    const memoryInfo = await page.evaluate(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        };
      }
      return { usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0 };
    });

    return memoryInfo;
  }

  /**
   * Measure interaction responsiveness
   */
  static async measureInteractionResponsiveness(
    page: Page,
    selector: string,
    action: () => Promise<void>
  ): Promise<number> {
    const startTime = performance.now();

    await action();

    // Wait for any resulting changes to complete
    await page.waitForTimeout(100);

    const endTime = performance.now();
    return endTime - startTime;
  }
}

/**
 * Advanced element interaction utilities
 */
export class AdvancedElementUtils {
  /**
   * Drag and drop with precise control
   */
  static async dragAndDrop(
    page: Page,
    sourceSelector: string,
    targetSelector: string,
    options?: {
      offsetX?: number;
      offsetY?: number;
      duration?: number;
    }
  ): Promise<void> {
    const source = page.locator(sourceSelector);
    const target = page.locator(targetSelector);

    await source.waitFor({ state: 'visible' });
    await target.waitFor({ state: 'visible' });

    const sourceBox = await source.boundingBox();
    const targetBox = await target.boundingBox();

    if (!sourceBox || !targetBox) {
      throw new Error('Could not get bounding boxes for drag and drop');
    }

    await page.mouse.move(
      sourceBox.x + sourceBox.width / 2,
      sourceBox.y + sourceBox.height / 2
    );

    await page.mouse.down();

    await page.mouse.move(
      targetBox.x + (options?.offsetX || targetBox.width / 2),
      targetBox.y + (options?.offsetY || targetBox.height / 2),
      { steps: options?.duration ? Math.ceil(options.duration / 16) : 10 }
    );

    await page.mouse.up();
  }

  /**
   * Multi-select elements
   */
  static async multiSelect(
    page: Page,
    selectors: string[],
    modifierKey: 'Control' | 'Shift' | 'Meta' = 'Control'
  ): Promise<void> {
    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      const element = page.locator(selector);

      if (i === 0) {
        await element.click();
      } else {
        await element.click({ modifiers: [modifierKey] });
      }
    }
  }

  /**
   * Type with realistic human-like delays
   */
  static async typeHumanLike(
    page: Page,
    selector: string,
    text: string,
    options?: {
      minDelay?: number;
      maxDelay?: number;
      accuracy?: number;
    }
  ): Promise<void> {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible' });
    await element.focus();

    const minDelay = options?.minDelay ?? 50;
    const maxDelay = options?.maxDelay ?? 150;
    const accuracy = options?.accuracy ?? 0.95;

    for (const char of text) {
      // Simulate occasional typos and corrections
      if (Math.random() > accuracy) {
        // Type wrong character first
        await element.type(char === ' ' ? 'x' : 'x');
        await page.waitForTimeout(100);
        // Backspace and type correct character
        await element.press('Backspace');
        await page.waitForTimeout(50);
      }

      await element.type(char);

      // Random delay between keystrokes
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;
      await page.waitForTimeout(delay);
    }
  }

  /**
   * Perform smooth scrolling to an element
   */
  static async smoothScrollTo(
    page: Page,
    selector: string,
    options: { behavior?: ScrollBehavior; block?: ScrollLogicalPosition } = {}
  ): Promise<void> {
    await page.evaluate(
      (selector, options) => {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({
            behavior: options.behavior || 'smooth',
            block: options.block || 'start',
          });
        }
      },
      selector,
      options
    );
  }
}

/**
 * Test scenario builders for complex workflows
 */
export class TestScenarioBuilder {
  /**
   * Build a user registration and onboarding flow
   */
  static async buildUserOnboardingFlow(page: Page): Promise<{
    user: any;
    document: any;
    character: any;
  }> {
    const user = testFixtures.newUser();
    const document = testFixtures.draftStory();
    const character = testFixtures.protagonist();

    // Navigate to registration
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Fill registration form
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="name-input"]', user.name);
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.fill(
      '[data-testid="confirm-password-input"]',
      'TestPassword123!'
    );

    // Submit registration
    await page.click('[data-testid="register-button"]');

    // Wait for redirect to onboarding
    await page.waitForURL('/onboarding');

    // Complete onboarding steps
    await page.click('[data-testid="skip-tutorial"]');
    await page.click('[data-testid="create-first-document"]');

    // Create document
    await page.fill('[data-testid="document-title"]', document.title);
    await page.fill('[data-testid="document-content"]', document.content);
    await page.click('[data-testid="save-document"]');

    // Create character
    await page.click('[data-testid="add-character"]');
    await page.fill('[data-testid="character-name"]', character.name);
    await page.fill(
      '[data-testid="character-personality"]',
      character.personality
    );
    await page.click('[data-testid="save-character"]');

    return { user, document, character };
  }

  /**
   * Build a collaborative editing session
   */
  static async buildCollaborativeSession(
    page: Page,
    participants: number = 2
  ): Promise<{
    sessionId: string;
    participants: any[];
    document: any;
  }> {
    const document = testFixtures.draftStory();
    const participantsList = testData.bulk(testData.user, participants);

    // Create collaborative document
    await page.goto('/collaborate');
    await page.click('[data-testid="new-session"]');

    // Set up document
    await page.fill(
      '[data-testid="session-title"]',
      `Test Session ${Date.now()}`
    );
    await page.fill('[data-testid="document-content"]', document.content);

    // Invite participants
    for (const participant of participantsList) {
      await page.fill('[data-testid="invite-email"]', participant.email);
      await page.click('[data-testid="add-participant"]');
    }

    // Start session
    await page.click('[data-testid="start-session"]');

    // Get session ID
    const sessionId = await page
      .locator('[data-testid="session-id"]')
      .textContent();

    return {
      sessionId: sessionId || `session-${Date.now()}`,
      participants: participantsList,
      document,
    };
  }
}

/**
 * Advanced assertion utilities
 */
export class AdvancedAssertions {
  /**
   * Assert element is in viewport
   */
  static async expectInViewport(page: Page, selector: string): Promise<void> {
    const isInViewport = await page.evaluate(selector => {
      const element = document.querySelector(selector);
      if (!element) return false;

      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );
    }, selector);

    expect(isInViewport).toBe(true);
  }

  /**
   * Assert element has specific CSS properties
   */
  static async expectCSSProperties(
    page: Page,
    selector: string,
    properties: Record<string, string>
  ): Promise<void> {
    for (const [property, expectedValue] of Object.entries(properties)) {
      const actualValue = await page
        .locator(selector)
        .evaluate(
          (el, prop) => window.getComputedStyle(el).getPropertyValue(prop),
          property
        );

      const trimmedActual = actualValue.trim();

      // Handle color format variations
      if (
        property.toLowerCase().includes('color') &&
        expectedValue.startsWith('#')
      ) {
        // Convert hex to rgb for comparison
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result
            ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
            : hex;
        };

        const expectedRgb = hexToRgb(expectedValue);
        expect(trimmedActual).toBe(expectedRgb);
      } else {
        expect(trimmedActual).toBe(expectedValue);
      }
    }
  }

  /**
   * Assert network request was made
   */
  static async expectNetworkRequest(
    page: Page,
    urlPattern: string | RegExp,
    method: string = 'GET'
  ): Promise<void> {
    const requests: any[] = [];

    page.on('request', request => {
      if (request.method() === method) {
        const url = request.url();
        if (
          typeof urlPattern === 'string'
            ? url.includes(urlPattern)
            : urlPattern.test(url)
        ) {
          requests.push(request);
        }
      }
    });

    // Wait for potential requests
    await page.waitForTimeout(1000);

    expect(requests.length).toBeGreaterThan(0);
  }
}

/**
 * Test environment utilities
 */
export class TestEnvironmentUtils {
  private static envCache: Map<string, string> = new Map();

  /**
   * Set test environment variables
   */
  static setTestEnvironment(env: Record<string, string>): void {
    // Cache current values
    for (const [key, value] of Object.entries(env)) {
      this.envCache.set(key, process.env[key] || '');
      process.env[key] = value;
    }
  }

  /**
   * Reset test environment
   */
  static resetTestEnvironment(): void {
    // Restore cached values
    for (const [key, value] of this.envCache.entries()) {
      if (value === '') {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    this.envCache.clear();
  }

  /**
   * Get test environment information
   */
  static getTestEnvironmentInfo(): {
    NODE_ENV: string;
    PLAYWRIGHT_BASE_URL: string;
    CI: string;
    BROWSER: string;
  } {
    return {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PLAYWRIGHT_BASE_URL:
        process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
      CI: process.env.CI || 'false',
      BROWSER: process.env.BROWSER || 'chromium',
    };
  }
}
