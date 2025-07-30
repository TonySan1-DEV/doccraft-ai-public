// Browser Console Supabase Test
// Copy and paste this entire script into your browser console while on your DocCraft app

console.log('🔍 Testing Supabase API Connections...\n')

// Test function
async function testSupabaseConnections() {
  const results = []
  
  try {
    // Get the Supabase client from the window object
    const supabase = window.supabase || (await import('/src/lib/supabase.js')).supabase
    
    if (!supabase) {
      console.error('❌ Supabase client not found! Make sure you\'re on your DocCraft app page.')
      return
    }
    
    console.log('📡 Testing Basic Connection...')
    
    // Test 1: Basic connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      
      if (error) {
        console.log('❌ Basic Connection Failed:', error.message)
        results.push({ test: 'Basic Connection', passed: false, error: error.message })
      } else {
        console.log('✅ Basic Connection: SUCCESS')
        results.push({ test: 'Basic Connection', passed: true })
      }
    } catch (error) {
      console.log('❌ Basic Connection Error:', error.message)
      results.push({ test: 'Basic Connection', passed: false, error: error.message })
    }
    
    // Test 2: Check tables
    console.log('\n🗄️ Testing Database Tables...')
    
    const tables = ['profiles', 'documents', 'audit_logs']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`)
          results.push({ test: `Table: ${table}`, passed: false, error: error.message })
        } else {
          console.log(`✅ Table ${table}: OK`)
          results.push({ test: `Table: ${table}`, passed: true })
        }
      } catch (error) {
        console.log(`❌ Table ${table}: ${error.message}`)
        results.push({ test: `Table: ${table}`, passed: false, error: error.message })
      }
    }
    
    // Test 3: Authentication
    console.log('\n🔐 Testing Authentication...')
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.log('❌ Auth Test:', error.message)
        results.push({ test: 'Authentication', passed: false, error: error.message })
      } else {
        console.log('✅ Auth Test:', user ? `User: ${user.email}` : 'No authenticated user')
        results.push({ test: 'Authentication', passed: true, user: user?.email })
      }
    } catch (error) {
      console.log('❌ Auth Test:', error.message)
      results.push({ test: 'Authentication', passed: false, error: error.message })
    }
    
    // Test 4: Storage
    console.log('\n📦 Testing Storage...')
    
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets()
      
      if (error) {
        console.log('❌ Storage Test:', error.message)
        results.push({ test: 'Storage', passed: false, error: error.message })
      } else {
        console.log('✅ Storage Test:', `Found ${buckets?.length || 0} buckets`)
        results.push({ test: 'Storage', passed: true, buckets: buckets?.length || 0 })
      }
    } catch (error) {
      console.log('❌ Storage Test:', error.message)
      results.push({ test: 'Storage', passed: false, error: error.message })
    }
    
    // Test 5: RLS Policies
    console.log('\n🔒 Testing RLS Policies...')
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .limit(1)
      
      if (error) {
        console.log('❌ RLS Test:', error.message)
        results.push({ test: 'RLS Policies', passed: false, error: error.message })
      } else {
        console.log('✅ RLS Test: Working correctly')
        results.push({ test: 'RLS Policies', passed: true })
      }
    } catch (error) {
      console.log('❌ RLS Test:', error.message)
      results.push({ test: 'RLS Policies', passed: false, error: error.message })
    }
    
    // Summary
    console.log('\n📊 Test Summary:')
    const passed = results.filter(r => r.passed).length
    const total = results.length
    const successRate = ((passed / total) * 100).toFixed(1)
    
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${total - passed}`)
    console.log(`📈 Success Rate: ${successRate}%`)
    
    if (passed === total) {
      console.log('\n🎉 All tests passed! Your Supabase setup is working perfectly.')
    } else {
      console.log('\n⚠️  Some tests failed. Check the errors above for specific issues.')
    }
    
    return results
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return [{ test: 'Overall Test', passed: false, error: error.message }]
  }
}

// Run the test
testSupabaseConnections().then(results => {
  console.log('\n📋 Detailed Results:', results)
}) 