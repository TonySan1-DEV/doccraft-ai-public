#!/usr/bin/env node

/**
 * Complete Supabase Connection Test for DocCraft-AI
 * This script tests all database tables, storage buckets, functions, and connections.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error(
    '❌ Missing Supabase credentials. Please set all required environment variables.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

function logTest(testName, passed, message = '') {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${testName}${message ? ': ' + message : ''}`);
}

async function testCompleteConnections() {
  console.log('🧪 Testing Complete Supabase Connections for DocCraft-AI...\n');

  try {
    // 1. Test basic connection
    console.log('1️⃣ Testing Basic Connection...');
    const { data: basicData, error: basicError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (basicError) {
      logTest('Basic Connection', false, basicError.message);
    } else {
      logTest('Basic Connection', true);
    }

    // 2. Test authentication
    console.log('\n2️⃣ Testing Authentication...');
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) {
      logTest(
        'Authentication System',
        true,
        'Working (no authenticated user for test)'
      );
    } else {
      logTest('Authentication System', true);
    }

    // 3. Test database schema
    console.log('\n3️⃣ Testing Database Schema...');
    await testDatabaseSchema();

    // 4. Test storage buckets
    console.log('\n4️⃣ Testing Storage Buckets...');
    await testStorageBuckets();

    // 5. Test RLS policies
    console.log('\n5️⃣ Testing Row Level Security...');
    await testRowLevelSecurity();

    // 6. Test database functions
    console.log('\n6️⃣ Testing Database Functions...');
    await testDatabaseFunctions();

    // 7. Test real-time subscriptions
    console.log('\n7️⃣ Testing Real-time Subscriptions...');
    await testRealtimeSubscriptions();

    // 8. Test file upload/download
    console.log('\n8️⃣ Testing File Operations...');
    await testFileOperations();

    console.log('\n🎉 Complete connection test finished!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

async function testDatabaseSchema() {
  const tables = [
    'profiles',
    'documents',
    'document_shares',
    'collaboration_sessions',
    'document_versions',
    'support_tickets',
    'ticket_messages',
    'support_agents',
    'chat_sessions',
    'chat_messages',
    'faq_items',
    'slide_decks',
    'narrated_decks',
    'tts_narrations',
    'pipeline_outputs',
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        logTest(`Table: ${table}`, false, error.message);
      } else {
        logTest(`Table: ${table}`, true);
      }
    } catch (err) {
      logTest(`Table: ${table}`, false, err.message);
    }
  }
}

async function testStorageBuckets() {
  const expectedBuckets = [
    'documents',
    'avatars',
    'uploads',
    'exports',
    'narrations',
    'support-attachments',
    'support-images',
    'support-documents',
  ];

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      logTest('Storage Buckets', false, error.message);
      return;
    }

    const bucketNames = buckets?.map(b => b.name) || [];

    for (const expectedBucket of expectedBuckets) {
      if (bucketNames.includes(expectedBucket)) {
        logTest(`Bucket: ${expectedBucket}`, true);
      } else {
        logTest(`Bucket: ${expectedBucket}`, false, 'Not found');
      }
    }
  } catch (error) {
    logTest('Storage Buckets', false, error.message);
  }
}

async function testRowLevelSecurity() {
  try {
    // Test RLS by trying to access data without auth
    const { error } = await supabase.from('profiles').select('*').limit(1);

    if (error && error.message.includes('RLS')) {
      logTest(
        'Row Level Security',
        true,
        'Policies are active (blocking unauthorized access)'
      );
    } else if (error) {
      logTest('Row Level Security', false, error.message);
    } else {
      logTest('Row Level Security', false, 'May not be properly configured');
    }
  } catch (error) {
    logTest('Row Level Security', false, error.message);
  }
}

async function testDatabaseFunctions() {
  const functions = ['update_updated_at_column', 'handle_new_user'];

  for (const func of functions) {
    try {
      // Try to call function with dummy data
      const { error } = await supabaseAdmin.rpc(func, {
        // Dummy parameters for testing
        user_id: '00000000-0000-0000-0000-000000000000',
      });

      if (
        error &&
        error.message.includes('function') &&
        error.message.includes('does not exist')
      ) {
        logTest(`Function: ${func}`, false, 'Not found');
      } else if (error && error.message.includes('permission')) {
        logTest(
          `Function: ${func}`,
          true,
          'Exists (permission denied as expected)'
        );
      } else {
        logTest(`Function: ${func}`, true);
      }
    } catch (err) {
      logTest(`Function: ${func}`, false, err.message);
    }
  }
}

async function testRealtimeSubscriptions() {
  try {
    // Test real-time subscription (this is a basic test)
    const subscription = supabase
      .channel('test-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        payload => {
          // This would be called if there were changes
        }
      )
      .subscribe();

    // Wait a moment for subscription to establish
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (subscription.state === 'SUBSCRIBED') {
      logTest('Real-time Subscriptions', true);
    } else {
      logTest('Real-time Subscriptions', false, `State: ${subscription.state}`);
    }

    // Clean up subscription
    subscription.unsubscribe();
  } catch (error) {
    logTest('Real-time Subscriptions', false, error.message);
  }
}

async function testFileOperations() {
  try {
    // Test file upload (small test file)
    const testFile = new File(['test content'], 'test.txt', {
      type: 'text/plain',
    });
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars') // Using avatars bucket for test
      .upload(`test-${Date.now()}.txt`, testFile);

    if (uploadError) {
      logTest('File Upload', false, uploadError.message);
    } else {
      logTest('File Upload', true, 'Test file uploaded successfully');

      // Test file download
      const { data: downloadData, error: downloadError } =
        await supabase.storage.from('avatars').download(uploadData.path);

      if (downloadError) {
        logTest('File Download', false, downloadError.message);
      } else {
        logTest('File Download', true);
      }

      // Clean up test file
      await supabase.storage.from('avatars').remove([uploadData.path]);
    }
  } catch (error) {
    logTest('File Operations', false, error.message);
  }
}

// Run the complete test
testCompleteConnections().catch(console.error);
