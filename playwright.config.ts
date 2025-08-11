import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 *
 * MCP Context Block:
 * role: qa-engineer,
 * tier: Pro,
 * file: "playwright.config.ts",
 * allowedActions: ["configure", "validate", "test"],
 * theme: "e2e_testing_infrastructure"
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',

    /* Global test timeout - increased for better stability */
    timeout: 120000, // 2 minutes for complex tests
    actionTimeout: 30000, // 30 seconds for actions
    navigationTimeout: 60000, // 60 seconds for navigation
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Firefox-specific settings for better test stability
        timeout: 120000, // Significantly increase timeout for Firefox
        expect: {
          timeout: 60000, // Increase expect timeout
        },
        // Firefox-specific viewport and performance settings
        viewport: { width: 1280, height: 720 },
        // Disable features that cause instability
        javaScriptEnabled: true,
        bypassCSP: true,
        // Increase action and navigation timeouts
        actionTimeout: 30000,
        navigationTimeout: 60000,
      },
      // Firefox-specific test setup
      setup: async ({ page }) => {
        // Firefox-specific initialization
        await page.addInitScript(() => {
          // Firefox-specific optimizations
          window.firefoxTestMode = true;
          
          // Disable features that might cause test instability
          if (navigator.userAgent.includes('Firefox')) {
            // Disable animations and transitions
            const style = document.createElement('style');
            style.textContent = `
              *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
              }
            `;
            document.head.appendChild(style);
            
            // Optimize rendering
            window.firefoxOptimizations = {
              disableAnimations: true,
              optimizeRendering: true,
              disableTransitions: true
            };
          }
        });
      }
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* Global setup and teardown */
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
});
