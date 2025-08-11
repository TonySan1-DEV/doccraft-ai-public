/**
 * Global teardown for Playwright E2E tests
 *
 * MCP Context Block:
 * role: qa-engineer,
 * tier: Pro,
 * file: "tests/e2e/global-teardown.ts",
 * allowedActions: ["cleanup", "report", "validate"],
 * theme: "e2e_testing_infrastructure"
 */

import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E Test Environment Cleanup...');

  try {
    // Generate test summary report
    const resultsDir = path.join(process.cwd(), 'test-results');
    if (fs.existsSync(resultsDir)) {
      const files = fs.readdirSync(resultsDir);
      console.log(`📊 Test results generated: ${files.length} files`);

      // Check for test artifacts
      const hasResults = files.some(
        file => file.endsWith('.json') || file.endsWith('.xml')
      );
      if (hasResults) {
        console.log('✅ Test artifacts generated successfully');
      }
    }

    // Clean up temporary files if needed
    const tempDir = path.join(process.cwd(), '.playwright');
    if (fs.existsSync(tempDir)) {
      console.log('🗑️ Cleaning up temporary Playwright files...');
      // Note: Playwright handles most cleanup automatically
    }

    console.log('✅ E2E Test Environment Cleanup Complete');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    // Don't throw here as cleanup failures shouldn't fail the test run
  }
}

export default globalTeardown;
