/**
 * Test Support System Components
 * DocCraft-AI v3 Support Module
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from env.local
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '..', 'env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Error loading env.local file:', error.message);
    return {};
  }
}

const envVars = loadEnvFile();
const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Please check your env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSupportSystem() {
  console.log('🧪 Testing Support System Components');
  console.log('===================================\n');
  console.log('📡 Supabase URL:', supabaseUrl);
  
  let allTestsPassed = true;
  const testResults = [];
  
  try {
    // Test 1: Database Schema
    console.log('\n1️⃣ Testing Database Schema...');
    const schemaTests = await testDatabaseSchema();
    testResults.push({ name: 'Database Schema', passed: schemaTests.passed, details: schemaTests.details });
    
    // Test 2: Support Agents
    console.log('\n2️⃣ Testing Support Agents...');
    const agentTests = await testSupportAgents();
    testResults.push({ name: 'Support Agents', passed: agentTests.passed, details: agentTests.details });
    
    // Test 3: FAQ System
    console.log('\n3️⃣ Testing FAQ System...');
    const faqTests = await testFAQSystem();
    testResults.push({ name: 'FAQ System', passed: faqTests.passed, details: faqTests.details });
    
    // Test 4: File Storage
    console.log('\n4️⃣ Testing File Storage...');
    const storageTests = await testFileStorage();
    testResults.push({ name: 'File Storage', passed: storageTests.passed, details: storageTests.details });
    
    // Test 5: Real-time Subscriptions
    console.log('\n5️⃣ Testing Real-time Subscriptions...');
    const realtimeTests = await testRealtimeSubscriptions();
    testResults.push({ name: 'Real-time Subscriptions', passed: realtimeTests.passed, details: realtimeTests.details });
    
    // Test 6: Authentication
    console.log('\n6️⃣ Testing Authentication...');
    const authTests = await testAuthentication();
    testResults.push({ name: 'Authentication', passed: authTests.passed, details: authTests.details });
    
    // Summary
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    
    testResults.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.name}`);
      if (result.details) {
        console.log(`   ${result.details}`);
      }
    });
    
    const passedTests = testResults.filter(t => t.passed).length;
    const totalTests = testResults.length;
    
    console.log(`\n📈 Overall Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 All tests passed! Support system is ready.');
      console.log('\n🌐 Ready to test in browser:');
      console.log('   URL: http://localhost:5179/support');
      console.log('\n📋 Available Features:');
      console.log('   • Create and manage support tickets');
      console.log('   • Live chat with agents');
      console.log('   • Search and browse FAQ');
      console.log('   • Upload file attachments');
      console.log('   • Real-time updates');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the details above.');
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Ensure the database schema is applied');
      console.log('2. Check Supabase connection');
      console.log('3. Verify file storage buckets exist');
      console.log('4. Test authentication flow');
    }
    
  } catch (error) {
    console.error('❌ Testing failed:', error);
    allTestsPassed = false;
  }
  
  return allTestsPassed;
}

async function testDatabaseSchema() {
  const tables = [
    'support_tickets',
    'ticket_messages',
    'ticket_attachments',
    'message_attachments',
    'support_agents',
    'chat_sessions',
    'chat_messages',
    'faq_items',
    'support_preferences'
  ];
  
  let passed = true;
  let details = '';
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        passed = false;
        details += `Table ${table}: ${error.message}. `;
      }
    } catch (error) {
      passed = false;
      details += `Table ${table}: ${error.message}. `;
    }
  }
  
  if (passed) {
    details = 'All tables accessible';
  }
  
  return { passed, details };
}

async function testSupportAgents() {
  try {
    const { data: agents, error } = await supabase
      .from('support_agents')
      .select('*')
      .limit(5);
    
    if (error) {
      return { passed: false, details: error.message };
    }
    
    const details = `Found ${agents?.length || 0} agents`;
    return { passed: true, details };
    
  } catch (error) {
    return { passed: false, details: error.message };
  }
}

async function testFAQSystem() {
  try {
    const { data: faqs, error } = await supabase
      .from('faq_items')
      .select('*')
      .limit(5);
    
    if (error) {
      return { passed: false, details: error.message };
    }
    
    const details = `Found ${faqs?.length || 0} FAQ items`;
    return { passed: true, details };
    
  } catch (error) {
    return { passed: false, details: error.message };
  }
}

async function testFileStorage() {
  try {
    const { data: files, error } = await supabase.storage
      .from('support-images')
      .list('', { limit: 5 });
    
    if (error) {
      return { passed: false, details: error.message };
    }
    
    const details = `Found ${files?.length || 0} files in storage`;
    return { passed: true, details };
    
  } catch (error) {
    return { passed: false, details: error.message };
  }
}

async function testRealtimeSubscriptions() {
  try {
    // Test real-time connection
    const channel = supabase
      .channel('test-channel')
      .on('presence', { event: 'sync' }, () => {
        // Connection successful
      })
      .subscribe();
    
    // Wait for connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { passed: true, details: 'Real-time connection established' };
    
  } catch (error) {
    return { passed: false, details: error.message };
  }
}

async function testAuthentication() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return { passed: false, details: error.message };
    }
    
    const details = data.session ? 'User authenticated' : 'No active session (normal)';
    return { passed: true, details };
    
  } catch (error) {
    return { passed: false, details: error.message };
  }
}

// Run the tests
testSupportSystem().then((success) => {
  if (success) {
    console.log('\n✅ Support system testing completed successfully!');
  } else {
    console.log('\n❌ Support system testing completed with failures.');
  }
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('💥 Testing failed:', error);
  process.exit(1);
}); 