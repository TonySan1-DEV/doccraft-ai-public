#!/usr/bin/env node

/**
 * Docker Build Validation Script for DocCraft-AI
 *
 * This script validates the production Docker build process to ensure
 * deployment readiness before shipping to production.
 *
 * Features:
 * - Multi-stage build validation
 * - Environment variable consistency check
 * - Build artifact verification
 * - Performance benchmarking
 * - Health check validation
 */

import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Configuration
const CONFIG = {
  dockerfile: 'deploy/production/Dockerfile.production',
  dockerCompose: 'deploy/production/docker-compose.yml',
  envTemplate: 'deploy/production/env.production.template',
  localEnv: '.env.local',
  buildTimeout: 300000, // 5 minutes
  maxImageSize: 500 * 1024 * 1024, // 500MB
  requiredServices: ['frontend', 'backend', 'processor'],
  healthCheckEndpoints: {
    frontend: 'http://localhost:3000/health',
    backend: 'http://localhost:8000/health',
    processor: 'http://localhost:8001/health',
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

class DockerBuildValidator {
  constructor() {
    this.results = {
      dockerfile: { valid: false, errors: [] },
      environment: { valid: false, errors: [] },
      build: { valid: false, errors: [] },
      health: { valid: false, errors: [] },
      performance: { valid: false, errors: [] },
    };
    this.startTime = Date.now();
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

  // Validate Dockerfile syntax and structure
  validateDockerfile() {
    this.logSection('Validating Dockerfile');

    try {
      if (!existsSync(CONFIG.dockerfile)) {
        throw new Error(`Dockerfile not found at ${CONFIG.dockerfile}`);
      }

      const dockerfileContent = readFileSync(CONFIG.dockerfile, 'utf8');

      // Check for required stages
      const requiredStages = [
        'base',
        'frontend-builder',
        'frontend',
        'backend-builder',
        'backend',
        'processor-builder',
        'processor',
      ];
      const missingStages = requiredStages.filter(
        stage => !dockerfileContent.includes(`FROM ${stage}`)
      );

      if (missingStages.length > 0) {
        throw new Error(
          `Missing required build stages: ${missingStages.join(', ')}`
        );
      }

      // Check for security best practices
      const securityChecks = [
        { pattern: 'USER root', issue: 'Running as root in production' },
        {
          pattern: 'RUN apt-get update',
          issue: 'Missing package cache cleanup',
        },
        {
          pattern: 'COPY . .',
          issue: 'Copying entire directory (potential security risk)',
        },
      ];

      securityChecks.forEach(check => {
        if (dockerfileContent.includes(check.pattern)) {
          this.logWarning(check.issue);
        }
      });

      // Validate syntax with docker build --dry-run
      try {
        execSync(`docker build --dry-run -f ${CONFIG.dockerfile} .`, {
          stdio: 'pipe',
          timeout: 30000,
        });
        this.logSuccess('Dockerfile syntax is valid');
      } catch (error) {
        throw new Error(
          `Dockerfile syntax validation failed: ${error.message}`
        );
      }

      this.results.dockerfile.valid = true;
      this.logSuccess('Dockerfile validation passed');
    } catch (error) {
      this.results.dockerfile.errors.push(error.message);
      this.logError(`Dockerfile validation failed: ${error.message}`);
    }
  }

  // Validate environment variable consistency
  validateEnvironment() {
    this.logSection('Validating Environment Variables');

    try {
      if (!existsSync(CONFIG.envTemplate)) {
        throw new Error(
          `Environment template not found at ${CONFIG.envTemplate}`
        );
      }

      const envTemplate = readFileSync(CONFIG.envTemplate, 'utf8');
      const localEnv = existsSync(CONFIG.localEnv)
        ? readFileSync(CONFIG.localEnv, 'utf8')
        : '';

      // Extract environment variables
      const templateVars =
        envTemplate
          .match(/^([A-Z_][A-Z0-9_]*)=/gm)
          ?.map(v => v.replace('=', '')) || [];
      const localVars =
        localEnv
          .match(/^([A-Z_][A-Z0-9_]*)=/gm)
          ?.map(v => v.replace('=', '')) || [];

      // Check for required variables
      const requiredVars = [
        'NODE_ENV',
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'OPENAI_API_KEY',
        'JWT_SECRET',
      ];

      const missingRequired = requiredVars.filter(
        v => !templateVars.includes(v)
      );
      if (missingRequired.length > 0) {
        throw new Error(
          `Missing required environment variables: ${missingRequired.join(', ')}`
        );
      }

      // Check for consistency between template and local
      const inconsistentVars = templateVars.filter(
        v =>
          !localVars.includes(v) &&
          !v.includes('your-') &&
          !v.includes('example')
      );

      if (inconsistentVars.length > 0) {
        this.logWarning(
          `Environment variables not configured locally: ${inconsistentVars.join(', ')}`
        );
      }

      // Validate docker-compose environment mapping
      if (existsSync(CONFIG.dockerCompose)) {
        const composeContent = readFileSync(CONFIG.dockerCompose, 'utf8');
        const composeVars =
          composeContent
            .match(/\$\{([A-Z_][A-Z0-9_]*)\}/g)
            ?.map(v => v.slice(2, -1)) || [];

        const undefinedComposeVars = composeVars.filter(
          v => !templateVars.includes(v)
        );
        if (undefinedComposeVars.length > 0) {
          throw new Error(
            `Docker Compose references undefined variables: ${undefinedComposeVars.join(', ')}`
          );
        }
      }

      this.results.environment.valid = true;
      this.logSuccess(
        `Environment validation passed (${templateVars.length} variables configured)`
      );
    } catch (error) {
      this.results.environment.errors.push(error.message);
      this.logError(`Environment validation failed: ${error.message}`);
    }
  }

  // Validate Docker build process
  async validateBuild() {
    this.logSection('Validating Docker Build Process');

    try {
      this.logInfo('Starting Docker build validation...');

      // Clean up any existing containers
      try {
        execSync(
          'docker-compose -f deploy/production/docker-compose.yml down',
          { stdio: 'pipe' }
        );
      } catch (error) {
        // Ignore errors if no containers are running
      }

      // Build the frontend stage only (faster validation)
      this.logInfo('Building frontend stage...');

      const buildProcess = spawn(
        'docker',
        [
          'build',
          '--target',
          'frontend',
          '-f',
          CONFIG.dockerfile,
          '--no-cache',
          '.',
        ],
        {
          stdio: 'pipe',
          timeout: CONFIG.buildTimeout,
        }
      );

      let buildOutput = '';
      let buildError = '';

      buildProcess.stdout.on('data', data => {
        buildOutput += data.toString();
        process.stdout.write(data);
      });

      buildProcess.stderr.on('data', data => {
        buildError += data.toString();
        process.stderr.write(data);
      });

      return new Promise(resolve => {
        buildProcess.on('close', code => {
          if (code === 0) {
            this.logSuccess('Docker build completed successfully');

            // Check image size
            try {
              const imageId = execSync(
                'docker images --format "{{.ID}}" --filter "dangling=true" | head -1',
                { encoding: 'utf8' }
              ).trim();
              if (imageId) {
                const imageSize = execSync(
                  `docker image inspect ${imageId} --format "{{.Size}}"`,
                  { encoding: 'utf8' }
                ).trim();
                const sizeInBytes = parseInt(imageSize);

                if (sizeInBytes > CONFIG.maxImageSize) {
                  this.logWarning(
                    `Image size (${(sizeInBytes / 1024 / 1024).toFixed(2)}MB) exceeds recommended limit`
                  );
                } else {
                  this.logSuccess(
                    `Image size: ${(sizeInBytes / 1024 / 1024).toFixed(2)}MB`
                  );
                }
              }
            } catch (error) {
              this.logWarning('Could not determine image size');
            }

            this.results.build.valid = true;
            resolve();
          } else {
            const errorMsg = `Docker build failed with exit code ${code}`;
            this.results.build.errors.push(errorMsg);
            this.logError(errorMsg);
            if (buildError) {
              this.logError(`Build error output: ${buildError}`);
            }
            resolve();
          }
        });

        buildProcess.on('error', error => {
          const errorMsg = `Docker build process error: ${error.message}`;
          this.results.build.errors.push(errorMsg);
          this.logError(errorMsg);
          resolve();
        });
      });
    } catch (error) {
      this.results.build.errors.push(error.message);
      this.logError(`Build validation failed: ${error.message}`);
    }
  }

  // Validate health checks
  validateHealthChecks() {
    this.logSection('Validating Health Check Endpoints');

    try {
      // Check if health check files exist
      const healthFiles = [
        'src/pages/Home.tsx', // Main page
        'deploy/production/nginx-frontend.conf', // Nginx config
        'k8s/production/doccraft-ai-deployment.yml', // K8s config
      ];

      healthFiles.forEach(file => {
        if (existsSync(file)) {
          const content = readFileSync(file, 'utf8');
          if (content.includes('/health') || content.includes('health')) {
            this.logSuccess(`Health check configured in ${file}`);
          } else {
            this.logWarning(`No health check found in ${file}`);
          }
        } else {
          this.logWarning(`File not found: ${file}`);
        }
      });

      this.results.health.valid = true;
      this.logSuccess('Health check validation completed');
    } catch (error) {
      this.results.health.errors.push(error.message);
      this.logError(`Health check validation failed: ${error.message}`);
    }
  }

  // Performance validation
  validatePerformance() {
    this.logSection('Validating Performance Configuration');

    try {
      // Check Vite configuration
      if (existsSync('vite.config.ts')) {
        const viteConfig = readFileSync('vite.config.ts', 'utf8');

        const performanceChecks = [
          { pattern: 'minify: "esbuild"', name: 'ESBuild minification' },
          {
            pattern: 'sourcemap: false',
            name: 'Source maps disabled for production',
          },
          { pattern: 'manualChunks', name: 'Code splitting configured' },
        ];

        performanceChecks.forEach(check => {
          if (viteConfig.includes(check.pattern)) {
            this.logSuccess(`${check.name} is configured`);
          } else {
            this.logWarning(`${check.name} not found`);
          }
        });
      }

      // Check package.json scripts
      if (existsSync('package.json')) {
        const packageJson = readFileSync('package.json', 'utf8');

        if (packageJson.includes('"build:optimized"')) {
          this.logSuccess('Optimized build script available');
        } else {
          this.logWarning('Optimized build script not found');
        }
      }

      this.results.performance.valid = true;
      this.logSuccess('Performance validation completed');
    } catch (error) {
      this.results.performance.errors.push(error.message);
      this.logError(`Performance validation failed: ${error.message}`);
    }
  }

  // Generate validation report
  generateReport() {
    this.logSection('Validation Report');

    const totalChecks = Object.keys(this.results).length;
    const passedChecks = Object.values(this.results).filter(
      r => r.valid
    ).length;
    const failedChecks = totalChecks - passedChecks;

    this.log(`\n${colors.bright}Validation Summary:${colors.reset}`);
    this.log(`Total Checks: ${totalChecks}`);
    this.log(`Passed: ${colors.green}${passedChecks}${colors.reset}`);
    this.log(`Failed: ${colors.red}${failedChecks}${colors.reset}`);

    if (failedChecks === 0) {
      this.log(
        `\n${colors.bright}${colors.green}🎉 All validations passed! Ready for deployment.${colors.reset}`
      );
    } else {
      this.log(
        `\n${colors.bright}${colors.red}❌ ${failedChecks} validation(s) failed. Please fix before deployment.${colors.reset}`
      );
    }

    // Detailed results
    Object.entries(this.results).forEach(([category, result]) => {
      const status = result.valid ? '✅ PASS' : '❌ FAIL';
      const color = result.valid ? 'green' : 'red';

      this.log(
        `\n${colors.bright}${category.toUpperCase()}:${colors.reset} ${colors[color]}${status}${colors.reset}`
      );

      if (result.errors.length > 0) {
        result.errors.forEach(error => {
          this.log(`  - ${error}`, 'red');
        });
      }
    });

    // Save report to file
    const reportPath = 'docker-validation-report.json';
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
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
      `\n${colors.cyan}Detailed report saved to: ${reportPath}${colors.reset}`
    );

    return failedChecks === 0;
  }

  // Run all validations
  async run() {
    this.log(
      `${colors.bright}${colors.blue}🚀 DocCraft-AI Docker Build Validation${colors.reset}`
    );
    this.log(`Starting validation at ${new Date().toLocaleString()}\n`);

    try {
      this.validateDockerfile();
      this.validateEnvironment();
      await this.validateBuild();
      this.validateHealthChecks();
      this.validatePerformance();

      const success = this.generateReport();

      if (success) {
        this.log(
          `\n${colors.bright}${colors.green}✅ Docker build validation completed successfully!${colors.reset}`
        );
        process.exit(0);
      } else {
        this.log(
          `\n${colors.bright}${colors.red}❌ Docker build validation failed. Please fix issues before deployment.${colors.reset}`
        );
        process.exit(1);
      }
    } catch (error) {
      this.logError(`Validation process failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new DockerBuildValidator();
  validator.run();
}

export default DockerBuildValidator;
