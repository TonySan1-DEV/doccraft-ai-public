#!/usr/bin/env node

/**
 * Test Vercel Build Locally
 * This script simulates the Vercel build environment to catch deployment issues early
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(__filename);

console.log('🚀 Testing Vercel Build Locally...\n');

// Set Vercel environment
process.env.VERCEL = '1';
process.env.NODE_ENV = 'production';

try {
  // 1. Test TypeScript compilation
  console.log('📝 Testing TypeScript compilation...');
  execSync('npx tsc --noEmit -p tsconfig.vercel.json', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful\n');

  // 2. Test production build
  console.log('🔨 Testing production build...');
  execSync('npm run build:vercel', { stdio: 'inherit' });
  console.log('✅ Production build successful\n');

  // 3. Verify build output
  console.log('📁 Verifying build output...');
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('Build output directory "dist" not found');
  }

  const indexHtmlPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error('index.html not found in build output');
  }

  const assetsPath = path.join(distPath, 'assets');
  if (!fs.existsSync(assetsPath)) {
    throw new Error('Assets directory not found in build output');
  }

  console.log('✅ Build output verification successful\n');

  // 4. Test preview server
  console.log('🌐 Testing preview server...');
  const _previewProcess = execSync('npm run preview -- --port 4173 --host', {
    stdio: 'pipe',
    timeout: 30000,
  });
  console.log('✅ Preview server test successful\n');

  // 5. Check bundle size
  console.log('📊 Analyzing bundle size...');
  const distSize = getDirectorySize(distPath);
  console.log(
    `📦 Build output size: ${(distSize / 1024 / 1024).toFixed(2)} MB`
  );

  if (distSize > 50 * 1024 * 1024) {
    // 50MB warning
    console.log('⚠️  Warning: Build output is larger than 50MB');
  }

  console.log('\n🎉 All Vercel build tests passed!');
  console.log('🚀 Your application is ready for deployment to Vercel.');
} catch (error) {
  console.error('\n❌ Vercel build test failed:');
  console.error(error.message);

  if (error.stdout) {
    console.error('\nBuild output:');
    console.error(error.stdout.toString());
  }

  process.exit(1);
}

function getDirectorySize(dirPath) {
  let totalSize = 0;

  if (fs.statSync(dirPath).isDirectory()) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      totalSize += getDirectorySize(filePath);
    }
  } else {
    totalSize += fs.statSync(dirPath).size;
  }

  return totalSize;
}
