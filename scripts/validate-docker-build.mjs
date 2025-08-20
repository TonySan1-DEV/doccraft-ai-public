#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const dockerfile = 'deploy/production/Dockerfile.production';
if (!fs.existsSync(dockerfile)) {
  console.error(`❌ Missing ${dockerfile}`);
  process.exit(2);
}

// Check Dockerfile syntax by doing a dry-run build
const IMAGE = 'doccraft-ai:validation';
try {
  console.log('🔍 Validating Dockerfile syntax...');
  // Just check if Docker can parse the Dockerfile without building
  execSync(`docker build -f ${dockerfile} --target base --no-cache .`, {
    stdio: 'inherit',
    timeout: 60000, // 1 minute timeout
  });
  console.log('✅ Docker build validation passed');
} catch (e) {
  console.error('❌ Docker build validation failed');
  console.error('This may be due to missing dependencies or build errors');
  console.error(
    'For deployment readiness, ensure Dockerfile syntax is correct'
  );
  process.exit(1);
}

console.log('✅ Docker validation OK - Dockerfile syntax is valid');
console.log(
  'ℹ️  Full build test skipped for validation (would require all dependencies)'
);
