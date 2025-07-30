#!/usr/bin/env node

/**
 * Secure Environment Loader
 * 
 * This module provides secure loading of encrypted environment variables
 * for the DocCraft-AI application.
 */

import { createDecipheriv, scryptSync } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Encryption key (in production, this should be stored securely)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'doccraft-ai-secure-key-2024';

// Sensitive variables that should be encrypted
const SENSITIVE_VARS = [
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'VITE_SMTP_PASS',
  'VITE_ANALYTICS_ID'
];

function decrypt(encryptedText, key) {
  try {
    const [ivHex, saltHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const salt = Buffer.from(saltHex, 'hex');
    const derivedKey = scryptSync(key, salt, 32);
    const decipher = createDecipheriv('aes-256-cbc', derivedKey, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('❌ Decryption failed:', error.message);
    return null;
  }
}

function loadSecureEnv() {
  const envPath = join(__dirname, '..', '.env');
  const encryptedEnvPath = join(__dirname, '..', '.env.encrypted');
  
  let envContent = '';
  
  // Try to load from encrypted file first
  if (existsSync(encryptedEnvPath)) {
    envContent = readFileSync(encryptedEnvPath, 'utf8');
    console.log('🔐 Loading encrypted environment variables...');
  } else if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf8');
    console.log('📁 Loading plain environment variables...');
  } else {
    console.error('❌ No environment file found');
    return {};
  }

  const lines = envContent.split('\n');
  const envVars = {};

  for (const line of lines) {
    if (line.trim() === '' || line.startsWith('#')) {
      continue;
    }

    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=');

    if (value.startsWith('ENCRYPTED:')) {
      const encryptedValue = value.replace('ENCRYPTED:', '');
      const decryptedValue = decrypt(encryptedValue, ENCRYPTION_KEY);
      if (decryptedValue) {
        envVars[key.trim()] = decryptedValue;
      }
    } else {
      envVars[key.trim()] = value;
    }
  }

  return envVars;
}

function validateEnvVars(envVars) {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missing = requiredVars.filter(varName => !envVars[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`  - ${varName}`));
    return false;
  }

  return true;
}

function getSecureEnv() {
  const envVars = loadSecureEnv();
  
  if (!validateEnvVars(envVars)) {
    throw new Error('Invalid environment configuration');
  }

  return envVars;
}

// Export for use in other modules
export { getSecureEnv, loadSecureEnv, validateEnvVars };

// If run directly, load and display environment status
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const envVars = getSecureEnv();
    console.log('✅ Environment loaded successfully');
    console.log('');
    console.log('Environment variables:');
    Object.keys(envVars).forEach(key => {
      if (SENSITIVE_VARS.includes(key)) {
        console.log(`  ${key}: [ENCRYPTED]`);
      } else {
        console.log(`  ${key}: ${envVars[key]}`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to load environment:', error.message);
    process.exit(1);
  }
} 