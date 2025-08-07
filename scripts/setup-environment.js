#!/usr/bin/env node

/**
 * Environment Setup for DocCraft-AI
 * This script validates and sets up environment variables for the complete application.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), 'supabase-config.env.example');

function setupEnvironment() {
  console.log('🔧 Setting up environment configuration...\n');

  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file from template...');

    if (fs.existsSync(envExamplePath)) {
      const envExample = fs.readFileSync(envExamplePath, 'utf8');
      fs.writeFileSync(envPath, envExample);
      console.log('✅ Created .env file from template');
    } else {
      console.log('❌ No environment template found');
      return false;
    }
  } else {
    console.log('✅ .env file already exists');
  }

  // Load environment variables
  dotenv.config({ path: '.env' });

  // Validate required environment variables
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missingVars = [];
  const placeholderVars = [];

  for (const varName of requiredVars) {
    const value = process.env[varName];

    if (!value) {
      missingVars.push(varName);
    } else if (value.includes('your-') || value.includes('placeholder')) {
      placeholderVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.log('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\nPlease set these variables in your .env file');
    return false;
  }

  if (placeholderVars.length > 0) {
    console.log('⚠️  Environment variables still using placeholder values:');
    placeholderVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\nPlease update these with your actual Supabase credentials');
    return false;
  }

  console.log('✅ All required environment variables are set');

  // Validate Supabase URL format
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  if (!supabaseUrl.includes('supabase.co')) {
    console.log('⚠️  VITE_SUPABASE_URL may not be in the correct format');
    console.log('   Expected format: https://your-project-id.supabase.co');
  }

  // Validate Supabase key format
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseKey.startsWith('eyJ')) {
    console.log('⚠️  VITE_SUPABASE_ANON_KEY may not be in the correct format');
    console.log('   Expected format: eyJ... (JWT token)');
  }

  console.log('\n📋 Environment Configuration Summary:');
  console.log('✅ VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('✅ VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
  console.log(
    '✅ SUPABASE_SERVICE_ROLE_KEY:',
    process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing'
  );
  console.log(
    '✅ VITE_AUTH_REDIRECT_URL:',
    process.env.VITE_AUTH_REDIRECT_URL || 'http://localhost:5174/auth/callback'
  );
  console.log(
    '✅ VITE_AUTH_SITE_URL:',
    process.env.VITE_AUTH_SITE_URL || 'http://localhost:5174'
  );

  return true;
}

// Run the setup
if (setupEnvironment()) {
  console.log('\n🎉 Environment setup completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Run: node scripts/setup-complete-supabase.js');
  console.log(
    '2. Test the connection: node scripts/test-complete-connections.js'
  );
  console.log('3. Start the development server: npm run dev');
} else {
  console.log('\n❌ Environment setup failed. Please fix the issues above.');
  process.exit(1);
}
