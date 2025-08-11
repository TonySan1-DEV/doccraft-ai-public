/**
 * Global setup for Playwright E2E tests
 *
 * MCP Context Block:
 * role: qa-engineer,
 * tier: Pro,
 * file: "tests/e2e/global-setup.ts",
 * allowedActions: ["setup", "configure", "validate"],
 * theme: "e2e_testing_infrastructure"
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  console.log('🚀 Starting E2E Test Environment Setup...');

  // Launch browser to verify environment
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Verify the application is accessible
    console.log(`📍 Verifying application accessibility at: ${baseURL}`);
    await page.goto(baseURL || 'http://localhost:5173');

    // Wait for the app to load
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Check if the app is responsive
    const title = await page.title();
    console.log(`✅ Application loaded successfully. Title: ${title}`);

    // Verify basic functionality is available
    const appElement = await page.locator('#root').first();
    if (await appElement.isVisible()) {
      console.log('✅ Root application element is visible');
    } else {
      console.warn('⚠️ Root application element not immediately visible');
    }
  } catch (error) {
    console.error('❌ Failed to verify application accessibility:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('✅ E2E Test Environment Setup Complete');
}

export default globalSetup;
