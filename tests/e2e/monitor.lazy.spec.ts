import { test, expect } from '@playwright/test';

test.describe('Lazy Performance Monitor', () => {
  test('should load main app content without blocking on monitor', async ({
    page,
  }) => {
    // Set environment variables for testing
    await page.addInitScript(() => {
      // Mock environment variables for testing
      (window as any).__monitor_test_env = {
        VITE_MONITORING_ENABLED: 'true',
        VITE_MONITORING_SAMPLE: '1',
      };
    });

    // Navigate to home page
    await page.goto('/');

    // Assert main app content is visible within 2s
    await expect(page.locator('body')).toBeVisible({ timeout: 2000 });

    // Check that the page loaded successfully (basic content check)
    await expect(page.locator('body')).not.toHaveText('Application Error');

    // Wait a bit for any lazy loading to potentially occur
    await page.waitForTimeout(1000);

    // Verify the page is still functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle monitor failures gracefully', async ({ page }) => {
    // Set environment variables for testing
    await page.addInitScript(() => {
      // Mock environment variables for testing
      (window as any).__monitor_test_env = {
        VITE_MONITORING_ENABLED: 'true',
        VITE_MONITORING_SAMPLE: '1',
      };

      // Mock sessionStorage to simulate monitor being disabled
      Object.defineProperty(window, 'sessionStorage', {
        value: {
          getItem: (key: string) => {
            if (key === '__monitor_disabled_v1') return '1';
            return null;
          },
          setItem: () => {},
          removeItem: () => {},
          clear: () => {},
          key: () => null,
          length: 0,
        },
        writable: true,
      });
    });

    // Navigate to home page
    await page.goto('/');

    // Assert main app content is visible (monitor disabled shouldn't affect app)
    await expect(page.locator('body')).toBeVisible({ timeout: 2000 });

    // Check that the page loaded successfully
    await expect(page.locator('body')).not.toHaveText('Application Error');
  });
});
