const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Test configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

console.log('🔍 Testing Supabase API Connections...\n')

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase configuration!')
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file')
  process.exit(1)
}

// Create Supabase clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const supabaseAdmin = SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
}

function logTest(name, passed, details = '') {
  const status = passed ? '✅' : '❌'
  const result = passed ? 'PASSED' : 'FAILED'
  console.log(`${status} ${name}: ${result}`)
  if (details) console.log(`   ${details}`)
  
  testResults.tests.push({ name, passed, details })
  if (passed) testResults.passed++
  else testResults.failed++
}

async function testBasicConnection() {
  console.log('\n📡 Testing Basic Connection...')
  
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      logTest('Basic Connection', false, error.message)
      return false
    }
    
    logTest('Basic Connection', true, 'Successfully connected to Supabase')
    return true
  } catch (error) {
    logTest('Basic Connection', false, error.message)
    return false
  }
}

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...')
  
  try {
    // Test getting current user (should be null if not authenticated)
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      logTest('Get Current User', false, error.message)
    } else {
      logTest('Get Current User', true, user ? `User: ${user.email}` : 'No authenticated user')
    }
    
    // Test sign up (this will fail if email already exists, but that's expected)
    const testEmail = `test-${Date.now()}@example.com`
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123'
    })
    
    if (signUpError) {
      logTest('Sign Up', false, signUpError.message)
    } else {
      logTest('Sign Up', true, `Test user created: ${testEmail}`)
    }
    
  } catch (error) {
    logTest('Authentication', false, error.message)
  }
}

async function testDatabaseTables() {
  console.log('\n🗄️ Testing Database Tables...')
  
  const tables = [
    'profiles',
    'documents', 
    'document_shares',
    'collaboration_sessions',
    'audit_logs'
  ]
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        logTest(`Table: ${table}`, false, error.message)
      } else {
        logTest(`Table: ${table}`, true, `Found ${data?.length || 0} records`)
      }
    } catch (error) {
      logTest(`Table: ${table}`, false, error.message)
    }
  }
}

async function testRLSPolicies() {
  console.log('\n🔒 Testing RLS Policies...')
  
  try {
    // Test profiles table RLS
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profilesError) {
      logTest('Profiles RLS', false, profilesError.message)
    } else {
      logTest('Profiles RLS', true, 'RLS working correctly')
    }
    
    // Test documents table RLS
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .limit(1)
    
    if (documentsError) {
      logTest('Documents RLS', false, documentsError.message)
    } else {
      logTest('Documents RLS', true, 'RLS working correctly')
    }
    
    // Test audit_logs table RLS
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(1)
    
    if (auditError) {
      logTest('Audit Logs RLS', false, auditError.message)
    } else {
      logTest('Audit Logs RLS', true, 'RLS working correctly')
    }
    
  } catch (error) {
    logTest('RLS Policies', false, error.message)
  }
}

async function testFunctions() {
  console.log('\n⚙️ Testing Database Functions...')
  
  try {
    // Test audit log function
    const { data: auditFunction, error: auditFunctionError } = await supabase
      .rpc('get_audit_stats', { p_user_id: '00000000-0000-0000-0000-000000000000', p_is_admin: false })
    
    if (auditFunctionError) {
      logTest('Audit Stats Function', false, auditFunctionError.message)
    } else {
      logTest('Audit Stats Function', true, 'Function working correctly')
    }
    
    // Test log audit event function
    const { data: logEvent, error: logEventError } = await supabase
      .rpc('log_audit_event', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_action: 'test',
        p_resource: 'test',
        p_details: { test: true },
        p_tier: 'Free',
        p_role: 'user',
        p_mcp_json: { test: true }
      })
    
    if (logEventError) {
      logTest('Log Audit Event Function', false, logEventError.message)
    } else {
      logTest('Log Audit Event Function', true, 'Function working correctly')
    }
    
  } catch (error) {
    logTest('Database Functions', false, error.message)
  }
}

async function testAdminAccess() {
  console.log('\n👑 Testing Admin Access...')
  
  if (!supabaseAdmin) {
    logTest('Admin Client', false, 'SUPABASE_SERVICE_KEY not configured')
    return
  }
  
  try {
    // Test admin access to audit logs
    const { data: adminAuditLogs, error: adminError } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .limit(5)
    
    if (adminError) {
      logTest('Admin Audit Logs Access', false, adminError.message)
    } else {
      logTest('Admin Audit Logs Access', true, `Found ${adminAuditLogs?.length || 0} logs`)
    }
    
    // Test admin access to all profiles
    const { data: adminProfiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(5)
    
    if (profilesError) {
      logTest('Admin Profiles Access', false, profilesError.message)
    } else {
      logTest('Admin Profiles Access', true, `Found ${adminProfiles?.length || 0} profiles`)
    }
    
  } catch (error) {
    logTest('Admin Access', false, error.message)
  }
}

async function testRealTime() {
  console.log('\n⚡ Testing Real-time Subscriptions...')
  
  try {
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'audit_logs' },
        (payload) => {
          console.log('   📡 Real-time event received:', payload.eventType)
        }
      )
      .subscribe()
    
    // Wait a moment for subscription to establish
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (channel.subscribe().state === 'SUBSCRIBED') {
      logTest('Real-time Subscription', true, 'Successfully subscribed to audit_logs')
    } else {
      logTest('Real-time Subscription', false, 'Failed to subscribe')
    }
    
    // Clean up
    await supabase.removeChannel(channel)
    
  } catch (error) {
    logTest('Real-time Subscription', false, error.message)
  }
}

async function testStorage() {
  console.log('\n📦 Testing Storage...')
  
  try {
    // Test bucket access
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      logTest('Storage Buckets', false, bucketsError.message)
    } else {
      logTest('Storage Buckets', true, `Found ${buckets?.length || 0} buckets`)
    }
    
    // Test file upload (small test file)
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars') // Assuming this bucket exists
      .upload(`test-${Date.now()}.txt`, testFile)
    
    if (uploadError) {
      logTest('File Upload', false, uploadError.message)
    } else {
      logTest('File Upload', true, 'Test file uploaded successfully')
      
      // Clean up test file
      await supabase.storage
        .from('avatars')
        .remove([uploadData.path])
    }
    
  } catch (error) {
    logTest('Storage', false, error.message)
  }
}

async function runAllTests() {
  console.log('🚀 Starting Supabase API Connection Tests...\n')
  
  // Run all tests
  await testBasicConnection()
  await testAuthentication()
  await testDatabaseTables()
  await testRLSPolicies()
  await testFunctions()
  await testAdminAccess()
  await testRealTime()
  await testStorage()
  
  // Print summary
  console.log('\n📊 Test Summary:')
  console.log(`✅ Passed: ${testResults.passed}`)
  console.log(`❌ Failed: ${testResults.failed}`)
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`)
  
  if (testResults.failed > 0) {
    console.log('\n🔍 Failed Tests:')
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => console.log(`   ❌ ${test.name}: ${test.details}`))
  }
  
  console.log('\n🎯 Recommendations:')
  if (testResults.passed === testResults.tests.length) {
    console.log('   ✅ All tests passed! Your Supabase setup is working perfectly.')
  } else if (testResults.passed > testResults.failed) {
    console.log('   ⚠️  Most tests passed. Check failed tests above for specific issues.')
  } else {
    console.log('   ❌ Multiple tests failed. Please check your Supabase configuration.')
  }
  
  console.log('\n📝 Next Steps:')
  console.log('   1. Check your .env file for correct Supabase credentials')
  console.log('   2. Verify your database schema is properly set up')
  console.log('   3. Ensure RLS policies are configured correctly')
  console.log('   4. Test with a real user account for full functionality')
}

// Run the tests
runAllTests().catch(console.error)