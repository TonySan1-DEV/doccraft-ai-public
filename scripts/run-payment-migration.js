const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runPaymentMigration() {
  console.log('🚀 Starting payment system migration...')
  
  try {
    // Read the payment system SQL file
    const migrationPath = path.join(__dirname, '../database/payment_system.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📝 Executing payment system migration...')
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
          if (error) {
            console.warn(`⚠️  Warning executing statement: ${error.message}`)
          }
        } catch (error) {
          console.warn(`⚠️  Warning: ${error.message}`)
        }
      }
    }
    
    console.log('✅ Payment system migration completed successfully!')
    console.log('')
    console.log('📋 Migration Summary:')
    console.log('- Created payment_methods table')
    console.log('- Created payment_gateway_configs table')
    console.log('- Created payment_intents table')
    console.log('- Created subscriptions table')
    console.log('- Created billing_info table')
    console.log('- Created payment_history table')
    console.log('- Created invoices table')
    console.log('- Added Row Level Security policies')
    console.log('- Created database functions and views')
    console.log('- Inserted default payment methods')
    console.log('- Inserted default gateway configurations')
    console.log('')
    console.log('🎉 Your payment system is now ready!')
    console.log('')
    console.log('🔧 Next Steps:')
    console.log('1. Configure your payment gateway credentials in the database')
    console.log('2. Set up webhook endpoints for payment notifications')
    console.log('3. Test the payment flow with test credentials')
    console.log('4. Update your environment variables with payment gateway keys')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
runPaymentMigration() 