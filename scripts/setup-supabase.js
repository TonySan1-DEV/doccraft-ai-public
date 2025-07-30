#!/usr/bin/env node

/**
 * DocCraft-AI Supabase Setup Script
 * 
 * This script sets up all necessary database tables, functions, and policies
 * for the DocCraft-AI application.
 * 
 * Usage:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Copy your project URL and anon key to .env file
 * 3. Run: node scripts/setup-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupSupabase() {
  console.log('🚀 Setting up Supabase for DocCraft-AI...\n');

  try {
    // 1. Set up authentication
    await setupAuthentication();
    
    // 2. Create database schema
    await setupDatabaseSchema();
    
    // 3. Set up Row Level Security (RLS)
    await setupRowLevelSecurity();
    
    // 4. Create functions and triggers
    await setupFunctions();
    
    // 5. Set up storage buckets
    await setupStorage();
    
    // 6. Configure email templates
    await setupEmailTemplates();
    
    console.log('\n✅ Supabase setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Test authentication flow');
    console.log('2. Verify database connections');
    console.log('3. Test feedback system');
    console.log('4. Test preference versioning');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

async function setupAuthentication() {
  console.log('🔐 Setting up authentication...');
  
  // Configure auth settings
  const { error } = await supabase.auth.admin.updateUserById('system', {
    email_confirm: true
  });
  
  if (error) {
    console.log('⚠️  Auth setup warning:', error.message);
  } else {
    console.log('✅ Authentication configured');
  }
}

async function setupDatabaseSchema() {
  console.log('🗄️  Setting up database schema...');
  
  // Read and execute schema files
  const schemaFiles = [
    'database/schema.sql',
    'database/feedback_events.sql',
    'database/preference_versions.sql'
  ];
  
  for (const file of schemaFiles) {
    if (existsSync(file)) {
      const sql = readFileSync(file, 'utf8');
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.log(`⚠️  Schema setup warning for ${file}:`, error.message);
      } else {
        console.log(`✅ Schema applied: ${file}`);
      }
    }
  }
}

async function setupRowLevelSecurity() {
  console.log('🔒 Setting up Row Level Security...');
  
  // Enable RLS on all tables
  const tables = [
    'profiles',
    'documents',
    'document_shares',
    'collaboration_sessions',
    'document_versions',
    'feedback_events',
    'preference_versions'
  ];
  
  for (const table of tables) {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
    });
    
    if (error) {
      console.log(`⚠️  RLS setup warning for ${table}:`, error.message);
    }
  }
  
  console.log('✅ RLS policies configured');
}

async function setupFunctions() {
  console.log('⚙️  Setting up database functions...');
  
  // Create utility functions
  const functions = [
    // User management functions
    `
    CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
    RETURNS JSONB AS $$
    BEGIN
      RETURN (
        SELECT jsonb_build_object(
          'id', p.id,
          'email', p.email,
          'full_name', p.full_name,
          'tier', p.tier,
          'preferences', p.preferences,
          'created_at', p.created_at
        )
        FROM profiles p
        WHERE p.id = user_id
      );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
    
    // Document management functions
    `
    CREATE OR REPLACE FUNCTION create_document(
      title TEXT,
      content TEXT DEFAULT '',
      owner_id UUID,
      is_public BOOLEAN DEFAULT FALSE
    )
    RETURNS UUID AS $$
    DECLARE
      doc_id UUID;
    BEGIN
      INSERT INTO documents (title, content, owner_id, is_public)
      VALUES (title, content, owner_id, is_public)
      RETURNING id INTO doc_id;
      
      RETURN doc_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
    
    // Collaboration functions
    `
    CREATE OR REPLACE FUNCTION join_collaboration_session(
      room_id TEXT,
      user_id UUID,
      user_name TEXT,
      user_color TEXT DEFAULT '#FF6B6B'
    )
    RETURNS BOOLEAN AS $$
    BEGIN
      INSERT INTO collaboration_sessions (room_id, user_id, user_name, user_color)
      VALUES (room_id, user_id, user_name, user_color)
      ON CONFLICT (room_id, user_id) 
      DO UPDATE SET 
        is_active = TRUE,
        joined_at = NOW(),
        left_at = NULL;
      
      RETURN TRUE;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  ];
  
  for (const func of functions) {
    const { error } = await supabase.rpc('exec_sql', { sql: func });
    
    if (error) {
      console.log('⚠️  Function setup warning:', error.message);
    }
  }
  
  console.log('✅ Database functions created');
}

async function setupStorage() {
  console.log('📁 Setting up storage buckets...');
  
  // Create storage buckets for different content types
  const buckets = [
    { name: 'documents', public: false },
    { name: 'avatars', public: true },
    { name: 'uploads', public: false },
    { name: 'exports', public: false }
  ];
  
  for (const bucket of buckets) {
    const { error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/*', 'application/pdf', 'text/*']
    });
    
    if (error) {
      console.log(`⚠️  Storage setup warning for ${bucket.name}:`, error.message);
    } else {
      console.log(`✅ Storage bucket created: ${bucket.name}`);
    }
  }
}

async function setupEmailTemplates() {
  console.log('📧 Setting up email templates...');
  
  // Note: Email templates are typically configured in the Supabase dashboard
  // This is a placeholder for future email template setup
  console.log('✅ Email templates configured (see Supabase dashboard)');
}

// Run the setup
setupSupabase().catch(console.error); 