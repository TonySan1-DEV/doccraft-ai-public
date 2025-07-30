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

async function runMigration() {
  console.log('🚀 Starting account status migration...')
  
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../database/account_status_migration.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📝 Executing migration SQL...')
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    }
    
    console.log('✅ Account status migration completed successfully!')
    console.log('')
    console.log('📋 Migration Summary:')
    console.log('- Added account_status field to writer_profiles table')
    console.log('- Added pause_start_date and pause_end_date fields')
    console.log('- Added closed_date field')
    console.log('- Created indexes for better performance')
    console.log('- Added automatic reactivation function')
    console.log('- Created account status monitoring view')
    console.log('')
    console.log('🎉 Your database is now ready for account management features!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
runMigration() 