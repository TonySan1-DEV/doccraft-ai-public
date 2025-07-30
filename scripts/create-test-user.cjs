const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', 'env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ env.local file not found')
    process.exit(1)
  }

  const envContent = fs.readFileSync(envPath, 'utf8')
  const envVars = {}

  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim()
      if (value && !key.startsWith('#')) {
        envVars[key.trim()] = value.replace(/^["']|["']$/g, '')
      }
    }
  })

  return envVars
}

const env = loadEnvFile()
const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestUser() {
  console.log('👤 Creating test user account...')
  
  const testEmail = 'test@doccraft-ai.com'
  const testPassword = 'testpassword123'
  
  try {
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        tier: 'Pro'
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ Test user already exists')
        console.log('📧 Email:', testEmail)
        console.log('🔑 Password:', testPassword)
        console.log('\n🔗 Login at: http://localhost:5179/login')
        return
      }
      throw authError
    }

    console.log('✅ Test user created successfully!')
    console.log('📧 Email:', testEmail)
    console.log('🔑 Password:', testPassword)
    console.log('\n🔗 Login at: http://localhost:5179/login')
    
    // Create user profile in users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: testEmail,
        tier: 'Pro',
        created_at: new Date().toISOString()
      })

    if (profileError) {
      console.log('⚠️  User profile creation failed (this is okay if table doesn\'t exist):', profileError.message)
    } else {
      console.log('✅ User profile created')
    }

  } catch (error) {
    console.error('❌ Error creating test user:', error.message)
  }
}

createTestUser() 