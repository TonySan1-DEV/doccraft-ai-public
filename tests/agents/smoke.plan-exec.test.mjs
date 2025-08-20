#!/usr/bin/env node

/**
 * DocCraft AI Agents Smoke Test Suite
 * Implements plan → execute → reflect → retry pattern
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class AgentSmokeTest {
  constructor() {
    this.testResults = [];
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async plan() {
    this.log('🎯 Planning smoke test execution...');

    const testPlan = {
      name: 'DocCraft AI Agents Smoke Test',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      tests: [
        {
          id: 'mcp-validation',
          name: 'MCP Schema Validation',
          command: 'npm run mcp:validate',
          expected: 'Schema validation passes',
          critical: true,
        },
        {
          id: 'prompts-package',
          name: 'Prompts Package Tests',
          command: 'cd packages/prompts && pnpm test',
          expected: 'All vitest cases pass',
          critical: true,
        },
        {
          id: 'file-structure',
          name: 'File Structure Validation',
          command: 'check-files',
          expected: 'Required files exist',
          critical: true,
        },
        {
          id: 'package-scripts',
          name: 'Package Scripts Availability',
          command: 'check-scripts',
          expected: 'New scripts are available',
          critical: false,
        },
      ],
    };

    this.log(`📋 Test plan created with ${testPlan.tests.length} tests`);
    return testPlan;
  }

  async execute(test) {
    this.log(`🚀 Executing: ${test.name}`);

    try {
      let result;

      if (test.command === 'check-files') {
        result = await this.checkFileStructure();
      } else if (test.command === 'check-scripts') {
        result = await this.checkPackageScripts();
      } else {
        result = await this.runCommand(test.command);
      }

      return {
        testId: test.id,
        name: test.name,
        status: 'PASS',
        output: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        testId: test.id,
        name: test.name,
        status: 'FAIL',
        error: error.message,
        output: error.stdout || error.stderr || 'No output',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async runCommand(command) {
    try {
      const output = execSync(command, {
        encoding: 'utf8',
        timeout: 30000,
        cwd: process.cwd(),
      });
      return output;
    } catch (error) {
      throw new Error(`Command failed: ${command}\n${error.message}`);
    }
  }

  async checkFileStructure() {
    const requiredFiles = [
      'tools/mcp/validate.mjs',
      'tools/mcp/version.json',
      'tools/mcp/schema/minimal.schema.json',
      'tools/mcp/examples/tool-call.mcp.json',
      '.github/workflows/mcp-validate.yml',
      'packages/prompts/package.json',
      'packages/prompts/tsconfig.json',
      'packages/prompts/src/index.ts',
      'packages/prompts/tests/templates.test.ts',
      'tests/agents/smoke.plan-exec.test.mjs',
    ];

    const missingFiles = [];
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }

    return `✅ All ${requiredFiles.length} required files exist`;
  }

  async checkPackageScripts() {
    const packageJsonPath = 'package.json';
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found');
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredScripts = ['mcp:validate', 'test:prompts', 'test:agents'];

    const missingScripts = requiredScripts.filter(
      script => !packageJson.scripts || !packageJson.scripts[script]
    );

    if (missingScripts.length > 0) {
      throw new Error(`Missing required scripts: ${missingScripts.join(', ')}`);
    }

    return `✅ All ${requiredScripts.length} required scripts are available`;
  }

  async reflect(testResult) {
    this.log(`🤔 Reflecting on test result: ${testResult.name}`);

    if (testResult.status === 'PASS') {
      this.log(`✅ Test passed: ${testResult.name}`);
      return { shouldRetry: false, reason: 'Test passed successfully' };
    } else {
      this.log(`❌ Test failed: ${testResult.name}`);
      this.log(`Error: ${testResult.error}`);
      return { shouldRetry: true, reason: 'Test failed, retry recommended' };
    }
  }

  async retry(test, attempt = 1) {
    if (attempt > this.maxRetries) {
      this.log(
        `🔄 Max retries (${this.maxRetries}) reached for test: ${test.name}`
      );
      return false;
    }

    this.log(
      `🔄 Retry attempt ${attempt}/${this.maxRetries} for test: ${test.name}`
    );
    await this.sleep(this.retryDelay * attempt); // Exponential backoff

    try {
      const result = await this.execute(test);
      if (result.status === 'PASS') {
        this.log(`✅ Retry successful for test: ${test.name}`);
        return true;
      }
    } catch (error) {
      this.log(`❌ Retry attempt ${attempt} failed: ${error.message}`);
    }

    return await this.retry(test, attempt + 1);
  }

  async run() {
    this.log('🚀 Starting DocCraft AI Agents Smoke Test Suite');

    // Phase 1: Plan
    const plan = await this.plan();

    // Phase 2: Execute
    this.log('⚡ Executing test plan...');
    for (const test of plan.tests) {
      let testResult = await this.execute(test);

      // Phase 3: Reflect
      const reflection = await this.reflect(testResult);

      // Phase 4: Retry if needed
      if (reflection.shouldRetry && test.critical) {
        this.log(`🔄 Critical test failed, attempting retry: ${test.name}`);
        const retrySuccess = await this.retry(test);
        if (retrySuccess) {
          testResult.status = 'PASS';
          testResult.output = 'Test passed after retry';
        }
      }

      this.testResults.push(testResult);
    }

    // Generate final report
    await this.generateReport(plan);

    // Exit with appropriate code
    const criticalFailures = this.testResults.filter(
      r =>
        r.status === 'FAIL' && plan.tests.find(t => t.id === r.testId)?.critical
    );

    if (criticalFailures.length > 0) {
      this.log(
        `❌ Smoke test suite failed with ${criticalFailures.length} critical failures`
      );
      process.exit(1);
    } else {
      this.log('✅ Smoke test suite completed successfully');
      process.exit(0);
    }
  }

  async generateReport(plan) {
    const report = {
      ...plan,
      executionResults: this.testResults,
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(r => r.status === 'PASS').length,
        failed: this.testResults.filter(r => r.status === 'FAIL').length,
        successRate: `${((this.testResults.filter(r => r.status === 'PASS').length / this.testResults.length) * 100).toFixed(1)}%`,
      },
    };

    // Ensure artifacts directory exists
    const artifactsDir = '.artifacts';
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
    }

    // Write report
    const reportPath = path.join(artifactsDir, 'agents-smoke-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log(`📊 Test report generated: ${reportPath}`);
    this.log(`📈 Success Rate: ${report.summary.successRate}`);
  }
}

// Run the smoke test suite
if (import.meta.url === `file://${process.argv[1]}`) {
  const smokeTest = new AgentSmokeTest();
  smokeTest.run().catch(error => {
    console.error('❌ Smoke test suite crashed:', error);
    process.exit(1);
  });
}

export default AgentSmokeTest;
