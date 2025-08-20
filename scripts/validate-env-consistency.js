#!/usr/bin/env node

/**
 * Environment Variable Consistency Validator for DocCraft-AI
 *
 * This script validates that environment variables are consistent across
 * all deployment targets: local development, Docker, and Vercel.
 *
 * Features:
 * - Cross-platform environment variable validation
 * - Docker Compose environment mapping verification
 * - Vercel environment variable consistency check
 * - Kubernetes secret mapping validation
 * - Environment variable type and format validation
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Configuration
const CONFIG = {
  files: {
    localEnv: '.env.local',
    envTemplate: 'env.template',
    productionEnv: 'deploy/production/env.production.template',
    dockerCompose: 'deploy/production/docker-compose.yml',
    k8sDeployment: 'k8s/production/doccraft-ai-deployment.yml',
    vercelConfig: '.vercel/project.json',
  },
  requiredVars: {
    core: ['NODE_ENV', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'],
    auth: ['SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'],
    ai: ['OPENAI_API_KEY'],
    database: [
      'DATABASE_URL',
      'POSTGRES_DB',
      'POSTGRES_USER',
      'POSTGRES_PASSWORD',
    ],
    redis: ['REDIS_URL'],
    monitoring: ['GRAFANA_PASSWORD'],
  },
  optionalVars: [
    'ANTHROPIC_API_KEY',
    'VITE_UNSPLASH_ACCESS_KEY',
    'VITE_ENABLE_COLLABORATION',
    'VITE_ENABLE_ANALYTICS',
    'VITE_ENABLE_VOICE_FEATURES',
  ],
  validationRules: {
    urlPattern: /^https?:\/\/.+/,
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    apiKeyPattern: /^(sk-|pk_|your-|example-)/,
    secretPattern: /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{32,}$/,
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

class EnvironmentValidator {
  constructor() {
    this.results = {
      local: { valid: false, errors: [], warnings: [] },
      docker: { valid: false, errors: [], warnings: [] },
      vercel: { valid: false, errors: [], warnings: [] },
      k8s: { valid: false, errors: [], warnings: [] },
      consistency: { valid: false, errors: [], warnings: [] },
    };
    this.environmentVars = {
      local: {},
      template: {},
      production: {},
      docker: {},
      k8s: {},
    };
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

  // Parse environment file content
  parseEnvFile(content) {
    const vars = {};
    const lines = content.split('\n');

    lines.forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const equalIndex = line.indexOf('=');
        if (equalIndex > 0) {
          const key = line.substring(0, equalIndex);
          const value = line.substring(equalIndex + 1);
          vars[key] = value;
        }
      }
    });

    return vars;
  }

  // Validate local environment
  validateLocal() {
    this.logSection('Validating Local Environment');

    try {
      if (!existsSync(CONFIG.files.localEnv)) {
        this.logWarning('Local environment file (.env.local) not found');
        this.results.local.valid = true; // Not required for validation
        return;
      }

      const localContent = readFileSync(CONFIG.files.localEnv, 'utf8');
      this.environmentVars.local = this.parseEnvFile(localContent);

      // Check for required variables
      const missingRequired = [];
      Object.entries(CONFIG.requiredVars).forEach(([category, vars]) => {
        vars.forEach(varName => {
          if (!this.environmentVars.local[varName]) {
            missingRequired.push(`${varName} (${category})`);
          }
        });
      });

      if (missingRequired.length > 0) {
        this.logWarning(
          `Missing required variables: ${missingRequired.join(', ')}`
        );
      } else {
        this.logSuccess('All required variables are present');
      }

      // Validate variable formats
      const formatIssues = [];
      Object.entries(this.environmentVars.local).forEach(([key, value]) => {
        if (
          key.includes('URL') &&
          !CONFIG.validationRules.urlPattern.test(value)
        ) {
          formatIssues.push(`${key}: Invalid URL format`);
        }
        if (
          key.includes('EMAIL') &&
          !CONFIG.validationRules.emailPattern.test(value)
        ) {
          formatIssues.push(`${key}: Invalid email format`);
        }
        if (
          key.includes('SECRET') &&
          !CONFIG.validationRules.secretPattern.test(value)
        ) {
          formatIssues.push(`${key}: Secret should be at least 32 characters`);
        }
      });

      if (formatIssues.length > 0) {
        formatIssues.forEach(issue => this.logWarning(issue));
      }

      this.results.local.valid = true;
      this.logSuccess(
        `Local environment validation completed (${Object.keys(this.environmentVars.local).length} variables)`
      );
    } catch (error) {
      this.results.local.errors.push(error.message);
      this.logError(`Local environment validation failed: ${error.message}`);
    }
  }

  // Validate environment templates
  validateTemplates() {
    this.logSection('Validating Environment Templates');

    try {
      // Check env.template
      if (existsSync(CONFIG.files.envTemplate)) {
        const templateContent = readFileSync(CONFIG.files.envTemplate, 'utf8');
        this.environmentVars.template = this.parseEnvFile(templateContent);
        this.logSuccess(
          `env.template loaded (${Object.keys(this.environmentVars.template).length} variables)`
        );
      }

      // Check production template
      if (existsSync(CONFIG.files.productionEnv)) {
        const productionContent = readFileSync(
          CONFIG.files.productionEnv,
          'utf8'
        );
        this.environmentVars.production = this.parseEnvFile(productionContent);
        this.logSuccess(
          `Production template loaded (${Object.keys(this.environmentVars.production).length} variables)`
        );
      }

      // Validate template completeness
      const allRequiredVars = Object.values(CONFIG.requiredVars).flat();
      const templateVars = Object.keys(this.environmentVars.template);
      const productionVars = Object.keys(this.environmentVars.production);

      const missingInTemplate = allRequiredVars.filter(
        v => !templateVars.includes(v)
      );
      const missingInProduction = allRequiredVars.filter(
        v => !productionVars.includes(v)
      );

      if (missingInTemplate.length > 0) {
        this.logWarning(
          `Missing in env.template: ${missingInTemplate.join(', ')}`
        );
      }
      if (missingInProduction.length > 0) {
        this.logWarning(
          `Missing in production template: ${missingInProduction.join(', ')}`
        );
      }

      if (missingInTemplate.length === 0 && missingInProduction.length === 0) {
        this.logSuccess('All required variables are documented in templates');
      }
    } catch (error) {
      this.logError(`Template validation failed: ${error.message}`);
    }
  }

  // Validate Docker Compose environment
  validateDocker() {
    this.logSection('Validating Docker Compose Environment');

    try {
      if (!existsSync(CONFIG.files.dockerCompose)) {
        throw new Error('Docker Compose file not found');
      }

      const composeContent = readFileSync(CONFIG.files.dockerCompose, 'utf8');

      // Extract environment variables from docker-compose
      const envMatches =
        composeContent.match(
          /^\s*-\s*([A-Z_][A-Z0-9_]*)=\$\{([A-Z_][A-Z0-9_]*)\}/gm
        ) || [];
      const dockerVars = {};

      envMatches.forEach(match => {
        const parts = match.match(
          /^\s*-\s*([A-Z_][A-Z0-9_]*)=\$\{([A-Z_][A-Z0-9_]*)\}/
        );
        if (parts) {
          dockerVars[parts[1]] = parts[2];
        }
      });

      this.environmentVars.docker = dockerVars;

      // Validate that all referenced variables exist in production template
      const undefinedVars = Object.values(dockerVars).filter(
        v => !Object.keys(this.environmentVars.production).includes(v)
      );

      if (undefinedVars.length > 0) {
        throw new Error(
          `Docker Compose references undefined variables: ${undefinedVars.join(', ')}`
        );
      }

      // Check for missing environment variables in services
      const services = ['doccraft-ai-frontend', 'doccraft-ai-backend'];
      services.forEach(service => {
        if (!composeContent.includes(service)) {
          this.logWarning(`Service ${service} not found in docker-compose.yml`);
        }
      });

      this.results.docker.valid = true;
      this.logSuccess(
        `Docker environment validation completed (${Object.keys(dockerVars).length} variables mapped)`
      );
    } catch (error) {
      this.results.docker.errors.push(error.message);
      this.logError(`Docker environment validation failed: ${error.message}`);
    }
  }

  // Validate Kubernetes environment
  validateKubernetes() {
    this.logSection('Validating Kubernetes Environment');

    try {
      if (!existsSync(CONFIG.files.k8sDeployment)) {
        this.logWarning('Kubernetes deployment file not found');
        this.results.k8s.valid = true; // Not required for validation
        return;
      }

      const k8sContent = readFileSync(CONFIG.files.k8sDeployment, 'utf8');

      // Extract environment variables from K8s
      const envMatches = k8sContent.match(/name:\s*([A-Z_][A-Z0-9_]*)/g) || [];
      const k8sVars = envMatches.map(match =>
        match.replace('name:', '').trim()
      );

      this.environmentVars.k8s = k8sVars.reduce((acc, varName) => {
        acc[varName] = 'k8s-secret';
        return acc;
      }, {});

      // Check for required variables
      const allRequiredVars = Object.values(CONFIG.requiredVars).flat();
      const missingInK8s = allRequiredVars.filter(v => !k8sVars.includes(v));

      if (missingInK8s.length > 0) {
        this.logWarning(
          `Missing required variables in K8s: ${missingInK8s.join(', ')}`
        );
      }

      // Check for secret references
      const secretRefs =
        k8sContent.match(/secretKeyRef:\s*\n\s*name:\s*([a-zA-Z0-9-]+)/g) || [];
      if (secretRefs.length === 0) {
        this.logWarning('No Kubernetes secrets configured');
      } else {
        this.logSuccess(`Kubernetes secrets configured: ${secretRefs.length}`);
      }

      this.results.k8s.valid = true;
      this.logSuccess(
        `Kubernetes environment validation completed (${k8sVars.length} variables)`
      );
    } catch (error) {
      this.results.k8s.errors.push(error.message);
      this.logError(
        `Kubernetes environment validation failed: ${error.message}`
      );
    }
  }

  // Validate Vercel environment
  validateVercel() {
    this.logSection('Validating Vercel Environment');

    try {
      if (!existsSync(CONFIG.files.vercelConfig)) {
        this.logWarning('Vercel configuration not found');
        this.results.vercel.valid = true; // Not required for validation
        return;
      }

      const vercelContent = readFileSync(CONFIG.files.vercelConfig, 'utf8');

      // Check for Vercel-specific configurations
      if (vercelContent.includes('projectId')) {
        this.logSuccess('Vercel project configuration found');
      } else {
        this.logWarning('Vercel project configuration incomplete');
      }

      // Check for Vercel-specific environment variables
      const vercelSpecificVars = [
        'VERCEL',
        'VERCEL_ENV',
        'VERCEL_URL',
        'VERCEL_GIT_COMMIT_SHA',
        'VERCEL_GIT_COMMIT_REF',
      ];

      const missingVercelVars = vercelSpecificVars.filter(
        v => !Object.keys(this.environmentVars.local).includes(v)
      );

      if (missingVercelVars.length > 0) {
        this.logInfo(
          `Vercel-specific variables (auto-injected): ${missingVercelVars.join(', ')}`
        );
      }

      this.results.vercel.valid = true;
      this.logSuccess('Vercel environment validation completed');
    } catch (error) {
      this.results.vercel.errors.push(error.message);
      this.logError(`Vercel environment validation failed: ${error.message}`);
    }
  }

  // Validate cross-platform consistency
  validateConsistency() {
    this.logSection('Validating Cross-Platform Consistency');

    try {
      const issues = [];

      // Check for variables that exist in one platform but not others
      const allVars = new Set([
        ...Object.keys(this.environmentVars.local),
        ...Object.keys(this.environmentVars.production),
        ...Object.keys(this.environmentVars.docker),
        ...Object.keys(this.environmentVars.k8s),
      ]);

      allVars.forEach(varName => {
        const platforms = [];
        if (this.environmentVars.local[varName]) platforms.push('local');
        if (this.environmentVars.production[varName])
          platforms.push('production');
        if (this.environmentVars.docker[varName]) platforms.push('docker');
        if (this.environmentVars.k8s[varName]) platforms.push('k8s');

        if (platforms.length === 1) {
          issues.push(`${varName}: Only defined in ${platforms[0]}`);
        } else if (platforms.length === 0) {
          issues.push(`${varName}: Not defined anywhere`);
        }
      });

      // Check for naming inconsistencies
      const namingIssues = [];
      const allKeys = Array.from(allVars);

      allKeys.forEach(key => {
        if (key.includes('VITE_') && !key.includes('VITE_')) {
          namingIssues.push(`${key}: Inconsistent VITE_ prefix usage`);
        }
      });

      if (issues.length > 0) {
        issues.forEach(issue => this.logWarning(issue));
      }
      if (namingIssues.length > 0) {
        namingIssues.forEach(issue => this.logWarning(issue));
      }

      if (issues.length === 0 && namingIssues.length === 0) {
        this.logSuccess('Cross-platform consistency validation passed');
      }

      this.results.consistency.valid =
        issues.length === 0 && namingIssues.length === 0;
    } catch (error) {
      this.results.consistency.errors.push(error.message);
      this.logError(`Consistency validation failed: ${error.message}`);
    }
  }

  // Generate validation report
  generateReport() {
    this.logSection('Environment Validation Report');

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
        `\n${colors.bright}${colors.green}🎉 All environment validations passed!${colors.reset}`
      );
    } else {
      this.log(
        `\n${colors.bright}${colors.red}❌ ${failedChecks} validation(s) failed.${colors.reset}`
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

      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          this.log(`  - ${warning}`, 'yellow');
        });
      }
    });

    // Save report to file
    const reportPath = 'env-validation-report.json';
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      environmentVars: this.environmentVars,
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
      `${colors.bright}${colors.blue}🔧 DocCraft-AI Environment Validation${colors.reset}`
    );
    this.log(`Starting validation at ${new Date().toLocaleString()}\n`);

    try {
      this.validateLocal();
      this.validateTemplates();
      this.validateDocker();
      this.validateKubernetes();
      this.validateVercel();
      this.validateConsistency();

      const success = this.generateReport();

      if (success) {
        this.log(
          `\n${colors.bright}${colors.green}✅ Environment validation completed successfully!${colors.reset}`
        );
        process.exit(0);
      } else {
        this.log(
          `\n${colors.bright}${colors.red}❌ Environment validation failed. Please fix issues.${colors.reset}`
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
  const validator = new EnvironmentValidator();
  validator.run();
}

export default EnvironmentValidator;
