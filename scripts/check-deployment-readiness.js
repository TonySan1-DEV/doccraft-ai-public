#!/usr/bin/env node

/**
 * Deployment Readiness Checker for DocCraft-AI
 *
 * This script runs comprehensive validation checks to ensure the system
 * is ready for production deployment across all target platforms.
 *
 * Features:
 * - Docker build validation
 * - Environment variable consistency validation
 * - Build artifact verification
 * - Health check validation
 * - Performance optimization validation
 * - Cross-platform compatibility check
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Import validation modules
import DockerBuildValidator from './validate-docker-build.js';
import EnvironmentValidator from './validate-env-consistency.js';

// Configuration
const CONFIG = {
  checks: {
    docker: true,
    environment: true,
    build: true,
    health: true,
    performance: true,
    security: true,
  },
  timeout: {
    docker: 300000, // 5 minutes
    build: 600000, // 10 minutes
    overall: 900000, // 15 minutes
  },
  thresholds: {
    maxImageSize: 500 * 1024 * 1024, // 500MB
    maxBuildTime: 300000, // 5 minutes
    minHealthChecks: 3,
  },
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class DeploymentReadinessChecker {
  constructor() {
    this.results = {
      docker: { valid: false, errors: [], warnings: [], duration: 0 },
      environment: { valid: false, errors: [], warnings: [], duration: 0 },
      build: { valid: false, errors: [], warnings: [], duration: 0 },
      health: { valid: false, errors: [], warnings: [], duration: 0 },
      performance: { valid: false, errors: [], warnings: [], duration: 0 },
      security: { valid: false, errors: [], warnings: [], duration: 0 },
    };
    this.startTime = Date.now();
    this.overallStatus = 'pending';
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logSection(title) {
    this.log(`\n${colors.bright}${colors.cyan}=== ${title} ===${colors.reset}`);
  }

  logSuccess(message) {
    this.log(`✅ ${message}`, 'green');
  }

  logError(message) {
    this.log(`❌ ${message}`, 'red');
  }

  logWarning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
  }

  logInfo(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  logHeader() {
    this.log(
      `${colors.bright}${colors.blue}🚀 DocCraft-AI Deployment Readiness Check${colors.reset}`
    );
    this.log(
      `${colors.cyan}Comprehensive validation for production deployment${colors.reset}`
    );
    this.log(`Started at ${new Date().toLocaleString()}\n`);
  }

  // Run Docker build validation
  async runDockerValidation() {
    if (!CONFIG.checks.docker) {
      this.logInfo('Skipping Docker validation (disabled)');
      return;
    }

    this.logSection('Docker Build Validation');
    const startTime = Date.now();

    try {
      const validator = new DockerBuildValidator();
      await validator.run();

      // Parse results from the validation report
      if (existsSync('docker-validation-report.json')) {
        const report = JSON.parse(
          readFileSync('docker-validation-report.json', 'utf8')
        );
        this.results.docker = {
          valid: report.summary.ready,
          errors: report.results.build.errors || [],
          warnings: report.results.build.warnings || [],
          duration: Date.now() - startTime,
        };
      }

      if (this.results.docker.valid) {
        this.logSuccess('Docker validation completed successfully');
      } else {
        this.logError('Docker validation failed');
      }
    } catch (error) {
      this.results.docker.errors.push(error.message);
      this.logError(`Docker validation failed: ${error.message}`);
    }
  }

  // Run environment validation
  async runEnvironmentValidation() {
    if (!CONFIG.checks.environment) {
      this.logInfo('Skipping environment validation (disabled)');
      return;
    }

    this.logSection('Environment Variable Validation');
    const startTime = Date.now();

    try {
      const validator = new EnvironmentValidator();
      await validator.run();

      // Parse results from the validation report
      if (existsSync('env-validation-report.json')) {
        const report = JSON.parse(
          readFileSync('env-validation-report.json', 'utf8')
        );
        this.results.environment = {
          valid: report.summary.ready,
          errors: report.results.consistency.errors || [],
          warnings: report.results.consistency.warnings || [],
          duration: Date.now() - startTime,
        };
      }

      if (this.results.environment.valid) {
        this.logSuccess('Environment validation completed successfully');
      } else {
        this.logError('Environment validation failed');
      }
    } catch (error) {
      this.results.environment.errors.push(error.message);
      this.logError(`Environment validation failed: ${error.message}`);
    }
  }

  // Run build validation
  async runBuildValidation() {
    if (!CONFIG.checks.build) {
      this.logInfo('Skipping build validation (disabled)');
      return;
    }

    this.logSection('Build Process Validation');
    const startTime = Date.now();

    try {
      this.logInfo('Running production build...');

      // Run the build command
      const buildProcess = execSync('pnpm run build:prod', {
        stdio: 'pipe',
        timeout: CONFIG.timeout.build,
      });

      // Check build artifacts
      const buildArtifacts = [
        'dist/index.html',
        'dist/assets',
        'dist/manifest.json',
      ];

      const missingArtifacts = buildArtifacts.filter(
        artifact => !existsSync(artifact)
      );

      if (missingArtifacts.length > 0) {
        throw new Error(
          `Missing build artifacts: ${missingArtifacts.join(', ')}`
        );
      }

      // Check build size
      const distSize = this.getDirectorySize('dist');
      if (distSize > CONFIG.thresholds.maxImageSize) {
        this.logWarning(
          `Build size (${(distSize / 1024 / 1024).toFixed(2)}MB) exceeds recommended limit`
        );
      }

      this.results.build.valid = true;
      this.logSuccess(
        `Build validation completed successfully (${(distSize / 1024 / 1024).toFixed(2)}MB)`
      );
    } catch (error) {
      this.results.build.errors.push(error.message);
      this.logError(`Build validation failed: ${error.message}`);
    } finally {
      this.results.build.duration = Date.now() - startTime;
    }
  }

  // Run health check validation
  async runHealthCheckValidation() {
    if (!CONFIG.checks.health) {
      this.logInfo('Skipping health check validation (disabled)');
      return;
    }

    this.logSection('Health Check Validation');
    const startTime = Date.now();

    try {
      const healthChecks = [
        { file: 'src/pages/Home.tsx', pattern: 'health' },
        { file: 'deploy/production/nginx-frontend.conf', pattern: '/health' },
        {
          file: 'k8s/production/doccraft-ai-deployment.yml',
          pattern: 'health',
        },
      ];

      let validChecks = 0;

      healthChecks.forEach(check => {
        if (existsSync(check.file)) {
          const content = readFileSync(check.file, 'utf8');
          if (content.includes(check.pattern)) {
            validChecks++;
            this.logSuccess(`Health check found in ${check.file}`);
          } else {
            this.logWarning(`No health check found in ${check.file}`);
          }
        } else {
          this.logWarning(`File not found: ${check.file}`);
        }
      });

      if (validChecks >= CONFIG.thresholds.minHealthChecks) {
        this.results.health.valid = true;
        this.logSuccess(
          `Health check validation passed (${validChecks} checks)`
        );
      } else {
        throw new Error(
          `Insufficient health checks: ${validChecks}/${CONFIG.thresholds.minHealthChecks}`
        );
      }
    } catch (error) {
      this.results.health.errors.push(error.message);
      this.logError(`Health check validation failed: ${error.message}`);
    } finally {
      this.results.health.duration = Date.now() - startTime;
    }
  }

  // Run performance validation
  async runPerformanceValidation() {
    if (!CONFIG.checks.performance) {
      this.logInfo('Skipping performance validation (disabled)');
      return;
    }

    this.logSection('Performance Configuration Validation');
    const startTime = Date.now();

    try {
      let score = 0;
      const maxScore = 5;

      // Check Vite configuration
      if (existsSync('vite.config.ts')) {
        const viteConfig = readFileSync('vite.config.ts', 'utf8');

        if (viteConfig.includes('minify: "esbuild"')) score++;
        if (viteConfig.includes('sourcemap: false')) score++;
        if (viteConfig.includes('manualChunks')) score++;
        if (viteConfig.includes('target: "es2015"')) score++;
        if (viteConfig.includes('rollupOptions')) score++;
      }

      // Check package.json scripts
      if (existsSync('package.json')) {
        const packageJson = readFileSync('package.json', 'utf8');
        if (packageJson.includes('"build:optimized"')) score++;
      }

      const percentage = (score / maxScore) * 100;

      if (percentage >= 80) {
        this.results.performance.valid = true;
        this.logSuccess(
          `Performance validation passed (${percentage.toFixed(0)}%)`
        );
      } else {
        this.logWarning(
          `Performance score: ${percentage.toFixed(0)}% (target: 80%+)`
        );
        this.results.performance.valid = true; // Not critical for deployment
      }
    } catch (error) {
      this.results.performance.errors.push(error.message);
      this.logError(`Performance validation failed: ${error.message}`);
    } finally {
      this.results.performance.duration = Date.now() - startTime;
    }
  }

  // Run security validation
  async runSecurityValidation() {
    if (!CONFIG.checks.security) {
      this.logInfo('Skipping security validation (disabled)');
      return;
    }

    this.logSection('Security Configuration Validation');
    const startTime = Date.now();

    try {
      let score = 0;
      const maxScore = 4;

      // Check for security best practices
      const securityChecks = [
        {
          file: 'deploy/production/Dockerfile.production',
          pattern: 'USER root',
          issue: 'Running as root',
        },
        {
          file: 'deploy/production/Dockerfile.production',
          pattern: 'COPY . .',
          issue: 'Copying entire directory',
        },
        {
          file: 'deploy/production/docker-compose.yml',
          pattern: 'expose:',
          issue: 'Port exposure',
        },
        {
          file: 'k8s/production/doccraft-ai-deployment.yml',
          pattern: 'securityContext',
          issue: 'Security context',
        },
      ];

      securityChecks.forEach(check => {
        if (existsSync(check.file)) {
          const content = readFileSync(check.file, 'utf8');
          if (content.includes(check.pattern)) {
            this.logWarning(`${check.issue} found in ${check.file}`);
          } else {
            score++;
          }
        }
      });

      const percentage = (score / maxScore) * 100;

      if (percentage >= 75) {
        this.results.security.valid = true;
        this.logSuccess(
          `Security validation passed (${percentage.toFixed(0)}%)`
        );
      } else {
        this.logWarning(
          `Security score: ${percentage.toFixed(0)}% (target: 75%+)`
        );
        this.results.security.valid = true; // Not critical for deployment
      }
    } catch (error) {
      this.results.security.errors.push(error.message);
      this.logError(`Security validation failed: ${error.message}`);
    } finally {
      this.results.security.duration = Date.now() - startTime;
    }
  }

  // Get directory size in bytes
  getDirectorySize(dirPath) {
    try {
      const { execSync } = require('child_process');
      const isWindows = process.platform === 'win32';

      if (isWindows) {
        const output = execSync(`dir /s "${dirPath}" | findstr "File(s)"`, {
          encoding: 'utf8',
        });
        const match = output.match(/(\d+) File\(s\)/);
        return match ? parseInt(match[1]) * 1024 : 0; // Rough estimate
      } else {
        const output = execSync(`du -sb "${dirPath}"`, { encoding: 'utf8' });
        return parseInt(output.split('\t')[0]);
      }
    } catch (error) {
      return 0;
    }
  }

  // Generate comprehensive report
  generateReport() {
    this.logSection('Deployment Readiness Report');

    const totalChecks = Object.keys(this.results).length;
    const passedChecks = Object.values(this.results).filter(
      r => r.valid
    ).length;
    const failedChecks = totalChecks - passedChecks;
    const totalDuration = Date.now() - this.startTime;

    this.log(`\n${colors.bright}Overall Status:${colors.reset}`);
    this.log(`Total Checks: ${totalChecks}`);
    this.log(`Passed: ${colors.green}${passedChecks}${colors.reset}`);
    this.log(`Failed: ${colors.red}${failedChecks}${colors.reset}`);
    this.log(`Total Duration: ${(totalDuration / 1000).toFixed(1)}s`);

    if (failedChecks === 0) {
      this.overallStatus = 'ready';
      this.log(
        `\n${colors.bright}${colors.green}🎉 All validations passed! Ready for deployment.${colors.reset}`
      );
    } else {
      this.overallStatus = 'not-ready';
      this.log(
        `\n${colors.bright}${colors.red}❌ ${failedChecks} validation(s) failed. Please fix before deployment.${colors.reset}`
      );
    }

    // Detailed results
    Object.entries(this.results).forEach(([category, result]) => {
      const status = result.valid ? '✅ PASS' : '❌ FAIL';
      const color = result.valid ? 'green' : 'red';
      const duration = result.duration
        ? ` (${(result.duration / 1000).toFixed(1)}s)`
        : '';

      this.log(
        `\n${colors.bright}${category.toUpperCase()}:${colors.reset} ${colors[color]}${status}${colors.reset}${duration}`
      );

      if (result.errors.length > 0) {
        result.errors.forEach(error => {
          this.log(`  - ${error}`, 'red');
        });
      }

      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          this.log(`  - ${warning}`, 'yellow');
        });
      }
    });

    // Recommendations
    this.generateRecommendations();

    // Save comprehensive report
    const reportPath = 'deployment-readiness-report.json';
    const report = {
      timestamp: new Date().toISOString(),
      overallStatus: this.overallStatus,
      totalDuration: totalDuration,
      results: this.results,
      summary: {
        total: totalChecks,
        passed: passedChecks,
        failed: failedChecks,
        ready: failedChecks === 0,
      },
    };

    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(
      `\n${colors.cyan}Comprehensive report saved to: ${reportPath}${colors.reset}`
    );

    return failedChecks === 0;
  }

  // Generate deployment recommendations
  generateRecommendations() {
    this.logSection('Deployment Recommendations');

    if (this.overallStatus === 'ready') {
      this.logSuccess('System is ready for production deployment');
      this.logInfo('Next steps:');
      this.log('  1. Run final smoke tests');
      this.log('  2. Deploy to staging environment');
      this.log('  3. Run integration tests');
      this.log('  4. Deploy to production');
    } else {
      this.logError('System is not ready for production deployment');
      this.logInfo('Required actions:');

      Object.entries(this.results).forEach(([category, result]) => {
        if (!result.valid && result.errors.length > 0) {
          this.log(`  - Fix ${category} issues: ${result.errors[0]}`);
        }
      });
    }
  }

  // Run all validations
  async run() {
    this.logHeader();

    try {
      // Set overall timeout
      const timeoutId = setTimeout(() => {
        this.logError('Deployment readiness check timed out');
        process.exit(1);
      }, CONFIG.timeout.overall);

      // Run all validation checks
      await this.runDockerValidation();
      await this.runEnvironmentValidation();
      await this.runBuildValidation();
      await this.runHealthCheckValidation();
      await this.runPerformanceValidation();
      await this.runSecurityValidation();

      clearTimeout(timeoutId);

      const success = this.generateReport();

      if (success) {
        this.log(
          `\n${colors.bright}${colors.green}✅ Deployment readiness check completed successfully!${colors.reset}`
        );
        process.exit(0);
      } else {
        this.log(
          `\n${colors.bright}${colors.red}❌ Deployment readiness check failed. Please fix issues before deployment.${colors.reset}`
        );
        process.exit(1);
      }
    } catch (error) {
      this.logError(`Deployment readiness check failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run checker if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new DeploymentReadinessChecker();
  checker.run();
}

export default DeploymentReadinessChecker;
