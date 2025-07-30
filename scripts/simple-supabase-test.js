// Simple Supabase API Connection Test
// This script tests basic Supabase connectivity

console.log('🔍 Testing Supabase API Connections...\n')

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  console.log('🌐 Browser Environment Detected')
  
  // Test using the existing Supabase client
  const { supabase } = await import('../src/lib/supabase.js')
  
  async function testSupabaseConnection() {
    try {
      console.log('📡 Testing Basic Connection...')
      
      // Test 1: Basic connection
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      
      if (error) {
        console.log('❌ Connection Failed:', error.message)
        return false
      }
      
      console.log('✅ Basic Connection: SUCCESS')
      
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
          } else {
            console.log(`✅ Table ${table}: OK`)
          }
        } catch (err) {
          console.log(`❌ Table ${table}: ${err.message}`)
        }
      }
      
      // Test 3: Authentication
      console.log('\n🔐 Testing Authentication...')
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.log('❌ Auth Test:', authError.message)
      } else {
        console.log('✅ Auth Test:', user ? `User: ${user.email}` : 'No authenticated user')
      }
      
      // Test 4: Storage
      console.log('\n📦 Testing Storage...')
      
      try {
        const { data: buckets, error: storageError } = await supabase.storage.listBuckets()
        
        if (storageError) {
          console.log('❌ Storage Test:', storageError.message)
        } else {
          console.log('✅ Storage Test:', `Found ${buckets?.length || 0} buckets`)
        }
      } catch (err) {
        console.log('❌ Storage Test:', err.message)
      }
      
      console.log('\n🎉 Supabase API Connection Test Complete!')
      return true
      
    } catch (error) {
      console.log('❌ Test Failed:', error.message)
      return false
    }
  }
  
  // Run the test
  testSupabaseConnection()
  
} else {
  console.log('❌ This test needs to run in a browser environment')
  console.log('💡 Please run this test from your React app or use the browser console')
} 