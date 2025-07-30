#!/usr/bin/env node

/**
 * Environment Variable Encryption Script
 * 
 * This script encrypts sensitive API keys and credentials in the .env file
 * for better security. It uses a simple encryption method for development.
 * 
 * For production, consider using:
 * - AWS KMS
 * - Azure Key Vault
 * - Google Cloud KMS
 * - HashiCorp Vault
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Encryption key (in production, this should be stored securely)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'doccraft-ai-secure-key-2024';

// Sensitive variables to encrypt
const SENSITIVE_VARS = [
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'VITE_SMTP_PASS',
  'VITE_ANALYTICS_ID'
];

function encrypt(text, key) {
  const iv = randomBytes(16);
  const salt = randomBytes(16);
  const derivedKey = scryptSync(key, salt, 32);
  const cipher = createCipheriv('aes-256-cbc', derivedKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${salt.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText, key) {
  const [ivHex, saltHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const salt = Buffer.from(saltHex, 'hex');
  const derivedKey = scryptSync(key, salt, 32);
  const decipher = createDecipheriv('aes-256-cbc', derivedKey, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function encryptEnvFile() {
  const envPath = join(__dirname, '..', '.env');
  const encryptedEnvPath = join(__dirname, '..', '.env.encrypted');
  
  if (!existsSync(envPath)) {
    console.error('❌ .env file not found');
    return;
  }

  try {
    const envContent = readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    const encryptedLines = [];

    for (const line of lines) {
      if (line.trim() === '' || line.startsWith('#')) {
        encryptedLines.push(line);
        continue;
      }

      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');

      if (SENSITIVE_VARS.includes(key.trim())) {
        const encryptedValue = encrypt(value, ENCRYPTION_KEY);
        encryptedLines.push(`${key}=ENCRYPTED:${encryptedValue}`);
      } else {
        encryptedLines.push(line);
      }
    }

    writeFileSync(encryptedEnvPath, encryptedLines.join('\n'));
    console.log('✅ Environment variables encrypted successfully');
    console.log(`📁 Encrypted file saved as: ${encryptedEnvPath}`);
    
    // Create a template file for reference
    const templatePath = join(__dirname, '..', '.env.template');
    const templateContent = lines.map(line => {
      if (line.trim() === '' || line.startsWith('#')) {
        return line;
      }
      const [key] = line.split('=');
      if (SENSITIVE_VARS.includes(key.trim())) {
        return `${key}=[ENCRYPTED_VALUE]`;
      }
      return line;
    }).join('\n');
    
    writeFileSync(templatePath, templateContent);
    console.log(`📁 Template file saved as: ${templatePath}`);
    
  } catch (error) {
    console.error('❌ Encryption failed:', error.message);
  }
}

function decryptEnvFile() {
  const encryptedEnvPath = join(__dirname, '..', '.env.encrypted');
  const decryptedEnvPath = join(__dirname, '..', '.env.decrypted');
  
  if (!existsSync(encryptedEnvPath)) {
    console.error('❌ .env.encrypted file not found');
    return;
  }

  try {
    const envContent = readFileSync(encryptedEnvPath, 'utf8');
    const lines = envContent.split('\n');
    const decryptedLines = [];

    for (const line of lines) {
      if (line.trim() === '' || line.startsWith('#')) {
        decryptedLines.push(line);
        continue;
      }

      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');

      if (value.startsWith('ENCRYPTED:')) {
        const encryptedValue = value.replace('ENCRYPTED:', '');
        const decryptedValue = decrypt(encryptedValue, ENCRYPTION_KEY);
        decryptedLines.push(`${key}=${decryptedValue}`);
      } else {
        decryptedLines.push(line);
      }
    }

    writeFileSync(decryptedEnvPath, decryptedLines.join('\n'));
    console.log('✅ Environment variables decrypted successfully');
    console.log(`📁 Decrypted file saved as: ${decryptedEnvPath}`);
    
  } catch (error) {
    console.error('❌ Decryption failed:', error.message);
  }
}

function createSecureEnvTemplate() {
  const templateContent = `# DocCraft-AI Secure Environment Template
# Copy this file to .env and fill in your actual values

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=[ENCRYPTED_VALUE]
SUPABASE_SERVICE_ROLE_KEY=[ENCRYPTED_VALUE]

# Authentication Configuration
VITE_AUTH_REDIRECT_URL=http://localhost:5174/auth/callback
VITE_AUTH_SITE_URL=http://localhost:5174

# Email Configuration (for password reset, etc.)
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your-email@gmail.com
VITE_SMTP_PASS=[ENCRYPTED_VALUE]

# Feature Flags
VITE_ENABLE_FEEDBACK_SYSTEM=true
VITE_ENABLE_PRESET_SYSTEM=true
VITE_ENABLE_PREFERENCE_VERSIONING=true
VITE_ENABLE_COLLABORATION=true
VITE_ENABLE_AUDIT_LOGS=true

# Rate Limiting
VITE_RATE_LIMIT_REQUESTS=100
VITE_RATE_LIMIT_WINDOW=900000

# Analytics
VITE_ENABLE_ANALYTICS=true
VITE_ANALYTICS_ID=[ENCRYPTED_VALUE]

# Development
NODE_ENV=development
VITE_DEV_MODE=true

# Encryption Key (for development only)
ENCRYPTION_KEY=doccraft-ai-secure-key-2024
`;

  const templatePath = join(__dirname, '..', '.env.secure.template');
  writeFileSync(templatePath, templateContent);
  console.log(`📁 Secure template saved as: ${templatePath}`);
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'encrypt':
    encryptEnvFile();
    break;
  case 'decrypt':
    decryptEnvFile();
    break;
  case 'template':
    createSecureEnvTemplate();
    break;
  default:
    console.log('🔐 DocCraft-AI Environment Encryption Tool');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/encrypt-env.js encrypt   - Encrypt sensitive variables');
    console.log('  node scripts/encrypt-env.js decrypt   - Decrypt variables');
    console.log('  node scripts/encrypt-env.js template  - Create secure template');
    console.log('');
    console.log('Sensitive variables that will be encrypted:');
    SENSITIVE_VARS.forEach(varName => console.log(`  - ${varName}`));
    console.log('');
    console.log('⚠️  For production, use proper key management systems!');
} 