import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('Agent Smoke Tests', () => {
  it('should run MCP validation successfully', async () => {
    const result = execSync('pnpm run mcp:validate', {
      encoding: 'utf8',
      cwd: process.cwd(),
    });

    expect(result).toContain('✅ MCP validate OK');
    expect(fs.existsSync('.artifacts/mcp-validate.json')).toBe(true);
  });

  it('should run prompts package tests successfully', async () => {
    const result = execSync('pnpm --filter @doccraft/prompts test', {
      encoding: 'utf8',
      cwd: process.cwd(),
    });

    // Check that the test completed successfully
    expect(result).toContain('tests/templates.test.ts');
    expect(result).toContain('9 tests');
    expect(result).toContain('passed');
  });

  it('should validate required file structure', () => {
    const requiredFiles = [
      'tools/mcp/validate.mjs',
      'tools/mcp/version.json',
      'tools/mcp/schema/minimal.schema.json',
      'tools/mcp/examples/tool-call.mcp.json',
      'packages/prompts/package.json',
      'packages/prompts/tsconfig.json',
      'packages/prompts/src/index.ts',
      'packages/prompts/tests/templates.test.ts',
      'tests/agents/smoke.plan-exec.test.mjs',
    ];

    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    expect(missingFiles).toHaveLength(0);
  });

  it('should validate package scripts availability', () => {
    const packageJsonPath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredScripts = ['mcp:validate', 'test:prompts', 'test:agents'];

    const missingScripts = requiredScripts.filter(
      script => !packageJson.scripts || !packageJson.scripts[script]
    );

    expect(missingScripts).toHaveLength(0);
  });

  it('should run the original smoke test script', async () => {
    // This test runs the original .mjs script to ensure it still works
    const result = execSync('node tests/agents/smoke.plan-exec.test.mjs', {
      encoding: 'utf8',
      cwd: process.cwd(),
    });

    // The script should complete without errors
    expect(result).toBeDefined();
  });
});
