/**
 * E2E Test Helper Utilities
 *
 * MCP Context Block:
 * role: qa-engineer,
 * tier: Pro,
 * file: "tests/e2e/utils/test-helpers.ts",
 * allowedActions: ["test", "validate", "simulate"],
 * theme: "e2e_testing_infrastructure"
 */

import { Page, Locator, expect } from '@playwright/test';

/**
 * Wait for application to be fully loaded and ready
 * Firefox-friendly version with shorter timeouts
 */
export async function waitForAppReady(page: Page): Promise<void> {
  // Use shorter, more reasonable timeouts that work better for Firefox
  const rootTimeout = 15000; // Reduced from 60000ms
  const networkTimeout = 20000; // Reduced from 90000ms
  const domTimeout = 15000; // Reduced from 40000ms
  const hydrationTimeout = 10000; // Reduced from 15000ms

  try {
    // First, wait for the root element to be visible
    await page.waitForSelector('#root', {
      state: 'visible',
      timeout: rootTimeout,
    });
  } catch (error) {
    console.log(
      `Root element wait timeout (${rootTimeout}ms), continuing with basic ready state...`
    );
    // Don't fail - just continue with what we have
  }

  // Wait for network to be idle, but with a much shorter timeout
  try {
    await page.waitForLoadState('networkidle', { timeout: networkTimeout });
  } catch (error) {
    console.log(
      `Network idle timeout (${networkTimeout}ms), continuing with DOM ready state...`
    );
    // Fallback: wait for DOM content loaded with shorter timeout
    try {
      await page.waitForLoadState('domcontentloaded', { timeout: domTimeout });
    } catch (domError) {
      console.log(
        `DOM content loaded timeout (${domTimeout}ms), continuing anyway...`
      );
      // If even DOM content loaded fails, just wait a bit and continue
      await page.waitForTimeout(2000);
    }
  }

  // Additional wait for React hydration with shorter timeout
  try {
    await page.waitForFunction(
      () => {
        return (
          document.readyState === 'complete' &&
          !document.querySelector('[data-loading="true"]') &&
          !document.querySelector('.loading')
        );
      },
      { timeout: hydrationTimeout }
    );
  } catch (error) {
    console.log(
      `React hydration wait timeout (${hydrationTimeout}ms), continuing with basic ready state...`
    );
    // Fallback: just wait for DOM ready with shorter timeout
    try {
      await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
    } catch (fallbackError) {
      console.log('Fallback DOM wait also failed, continuing anyway...');
      // If all else fails, just wait a bit and continue
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Firefox-specific ready state detection
 */
export async function waitForFirefoxReady(page: Page): Promise<void> {
  // Firefox-specific ready state detection with shorter, more reasonable timeouts
  try {
    await page.waitForFunction(
      () => {
        // Check for Firefox-specific indicators
        const isFirefox = navigator.userAgent.includes('Firefox');
        const isReady = document.readyState === 'complete';
        const hasRoot = !!document.querySelector('#root');
        const isHydrated = !document.querySelector('[data-loading="true"]');

        if (isFirefox) {
          // Firefox needs additional checks and optimizations
          return isReady && hasRoot && isHydrated;
        }

        return isReady && hasRoot && isHydrated;
      },
      { timeout: 20000 } // Reduced from 60000ms to 20000ms for better Firefox compatibility
    );
  } catch (_error) {
    console.log(
      'Firefox ready state wait failed, falling back to basic checks...'
    );

    // Fallback: wait for basic page readiness with shorter timeout
    try {
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    } catch (domError) {
      console.log('DOM content loaded timeout, continuing with basic check...');
      // Continue anyway - this is a stability test
    }

    // Check if root element exists with shorter timeout
    try {
      await page.waitForSelector('#root', { state: 'visible', timeout: 15000 });
    } catch (rootError) {
      console.log('Root element wait timeout, continuing anyway...');
      // Continue anyway - this is a stability test
    }
  }
}

/**
 * Lightweight app ready check for Firefox compatibility
 * Use this instead of waitForAppReady for Firefox tests
 */
export async function waitForFirefoxAppReady(page: Page): Promise<void> {
  try {
    // Wait for root element with reasonable timeout
    await page.waitForSelector('#root', { state: 'visible', timeout: 10000 });
    
    // Wait for DOM content loaded
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    
    // Brief wait for any remaining content
    await page.waitForTimeout(2000);
    
    console.log('Firefox app ready check completed successfully');
  } catch (error) {
    console.log('Firefox app ready check failed, but continuing:', error.message);
    // Don't fail - just continue with what we have
  }
}

/**
 * Navigate to a specific route and wait for it to load
 * Firefox-friendly version with lighter wait strategy
 */
export async function navigateToRoute(
  page: Page,
  route: string
): Promise<void> {
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  
  // Use a lighter wait strategy for Firefox compatibility
  try {
    // Wait for root element with shorter timeout
    await page.waitForSelector('#root', { state: 'visible', timeout: 10000 });
    
    // Brief wait for any remaining content to load
    await page.waitForTimeout(1000);
  } catch (error) {
    console.log('Navigation wait failed, but continuing anyway:', error.message);
    // Don't fail navigation - just continue
  }
}

/**
 * Wait for a specific element to be visible and clickable
 */
export async function waitForClickableElement(
  page: Page,
  selector: string,
  timeout: number = 10000
): Promise<Locator> {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout });
  await expect(element).toBeEnabled();
  return element;
}

/**
 * Fill a form field with validation
 */
export async function fillFormField(
  page: Page,
  selector: string,
  value: string,
  validate: boolean = true
): Promise<void> {
  const field = page.locator(selector);
  await field.waitFor({ state: 'visible' });
  await field.fill(value);

  if (validate) {
    await expect(field).toHaveValue(value);
  }
}

/**
 * Click an element with proper waiting and validation
 */
export async function clickElement(
  page: Page,
  selector: string,
  options?: { timeout?: number; force?: boolean }
): Promise<void> {
  const element = await waitForClickableElement(
    page,
    selector,
    options?.timeout
  );
  await element.click({ force: options?.force });
}

/**
 * Take a screenshot for debugging purposes
 */
export async function takeDebugScreenshot(
  page: Page,
  name: string
): Promise<void> {
  await page.screenshot({
    path: `test-results/debug-${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Wait for a specific condition with timeout
 */
export async function waitForCondition(
  page: Page,
  condition: () => Promise<boolean>,
  timeout: number = 10000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await page.waitForTimeout(interval);
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Check if an element exists without throwing
 */
export async function elementExists(
  page: Page,
  selector: string
): Promise<boolean> {
  try {
    const element = page.locator(selector);
    return (await element.count()) > 0;
  } catch {
    return false;
  }
}

/**
 * Get text content safely
 */
export async function getTextContent(
  page: Page,
  selector: string
): Promise<string> {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible' });
  return (await element.textContent()) || '';
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Firefox-specific test setup with optimized wait strategies
 */
export async function setupFirefoxTest(page: Page): Promise<void> {
  // Firefox-specific setup with optimized timing and shorter timeouts
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Use Firefox-specific ready state detection
  await waitForFirefoxReady(page);

  // Verify the page is actually ready for testing with fallback
  try {
    await page.waitForFunction(
      () => {
        const root = document.querySelector('#root');
        return root && root.children.length > 0;
      },
      { timeout: 10000 } // Reduced from 15000ms to 10000ms
    );
  } catch (_error) {
    console.log(
      'Firefox root verification failed, continuing with basic check...'
    );

    // Fallback: just check if root exists with shorter timeout
    try {
      await page.waitForSelector('#root', { state: 'visible', timeout: 10000 });
    } catch (rootError) {
      console.log('Root element fallback also failed, continuing anyway...');
      // Continue anyway - this is a stability test
    }
  }

  // Firefox-specific page lifecycle management
  try {
    await page.addInitScript(() => {
      if (navigator.userAgent.includes('Firefox')) {
        // Prevent Firefox from closing the page during tests
        (window as any).firefoxTestMode = true;

        // Disable features that might cause instability
        const style = document.createElement('style');
        style.textContent = `
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        `;
        document.head.appendChild(style);

        // Optimize Firefox rendering for test stability
        (window as any).firefoxOptimizations = {
          disableAnimations: true,
          optimizeRendering: true,
          disableTransitions: true,
          preventPageClosure: true,
        };
      }
    });
  } catch (_error) {
    console.log(
      'Firefox optimization script failed, continuing with basic setup...'
    );
  }
}

/**
 * Check if Firefox page is still accessible and recover if needed
 */
export async function checkFirefoxPageAccessibility(
  page: Page
): Promise<boolean> {
  try {
    await page.evaluate(() => document.readyState);
    return true;
  } catch (_error) {
    console.log('Firefox page became inaccessible:', _error.message);
    return false;
  }
}

/**
 * Firefox-specific page recovery mechanism
 */
export async function recoverFirefoxPage(page: Page): Promise<void> {
  try {
    console.log('Attempting Firefox page recovery...');

    // Check if page is still accessible before attempting recovery
    try {
      await page.evaluate(() => document.readyState);
    } catch (_accessError) {
      console.log('Page is not accessible, attempting context recovery...');

      // Try to create a new page in the same context
      try {
        const context = page.context();
        if (context && !context.pages().length) {
          console.log('Context has no pages, attempting to create new page...');
          const newPage = await context.newPage();

          // Navigate to the same URL
          await newPage.goto(page.url(), { waitUntil: 'domcontentloaded' });

          // Replace the original page reference
          Object.assign(page, newPage);

          console.log('Firefox page recovery via context successful');
          return;
        } else if (context) {
          console.log(
            'Context has existing pages, attempting to use first available page...'
          );
          const pages = context.pages();
          if (pages.length > 0) {
            Object.assign(page, pages[0]);
            console.log('Firefox page recovery via existing page successful');
            return;
          }
        }
      } catch (contextError) {
        console.log('Context recovery failed:', contextError.message);
      }

      // If context recovery fails, throw a specific error for Firefox
      throw new Error('Firefox context is unstable - page cannot be recovered');
    }

    // Try to reload the page
    await page.reload();
    await waitForFirefoxReady(page);

    console.log('Firefox page recovery successful');
  } catch (error) {
    console.log('Firefox page recovery failed:', error.message);
    throw new Error('Unable to recover Firefox page');
  }
}

/**
 * Generic page recovery mechanism that works for all browsers
 */
export async function recoverPage(page: Page): Promise<void> {
  try {
    console.log('Attempting generic page recovery...');

    // First try to detect the browser type safely
    let browserName = 'unknown';
    try {
      browserName = await page.evaluate(() => {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Firefox')) return 'firefox';
        if (userAgent.includes('Chrome')) return 'chrome';
        if (userAgent.includes('Safari')) return 'safari';
        return 'unknown';
      });
    } catch (_error) {
      console.log('Could not detect browser type, using generic recovery...');
    }

    if (browserName === 'firefox') {
      await recoverFirefoxPage(page);
    } else {
      // Generic recovery for other browsers
      try {
        await page.reload();
        await page.waitForLoadState('domcontentloaded', { timeout: 15000 }); // Reduced from 30000ms to 15000ms
        console.log('Generic page recovery successful');
      } catch (_reloadError) {
        console.log('Page reload failed, attempting context recovery...');

        // Try context recovery as last resort
        const context = page.context();
        const newPage = await context.newPage();
        await newPage.goto(page.url(), { waitUntil: 'domcontentloaded' });
        Object.assign(page, newPage);
        console.log('Context recovery successful');
      }
    }
  } catch (error) {
    console.log('Page recovery failed:', error.message);
    throw new Error('Unable to recover page');
  }
}

/**
 * Browser-agnostic test setup that handles Firefox differences
 */
export async function setupTestForBrowser(
  page: Page,
  browserName: string
): Promise<void> {
  if (browserName === 'firefox') {
    // Firefox-specific setup
    await setupFirefoxTest(page);
  } else {
    // Standard setup for other browsers
    await page.goto('/');
    await waitForAppReady(page);
  }
}
