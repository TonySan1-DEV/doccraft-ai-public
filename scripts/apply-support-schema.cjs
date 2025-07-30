/**
 * Apply Support System Database Schema
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
  console.error('📋 Found URL:', supabaseUrl ? '✅' : '❌');
  console.error('📋 Found Service Key:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read the SQL schema file
function readSchemaFile() {
  try {
    const schemaPath = path.join(__dirname, '..', 'database', 'apply-support-schema.sql');
    return fs.readFileSync(schemaPath, 'utf8');
  } catch (error) {
    console.error('❌ Error reading schema file:', error.message);
    return null;
  }
}

async function applySchema() {
  console.log('🚀 Applying Support System Database Schema...');
  console.log('📡 Supabase URL:', supabaseUrl);
  
  const schemaSQL = readSchemaFile();
  if (!schemaSQL) {
    console.error('❌ Could not read schema file');
    process.exit(1);
  }

  try {
    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements and comments
      if (!statement || statement.startsWith('--')) {
        continue;
      }

      try {
        console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}...`);
        
        // Execute the SQL statement using RPC
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        });

        if (error) {
          console.log(`⚠️  Statement ${i + 1} failed:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }

      } catch (error) {
        console.log(`❌ Statement ${i + 1} error:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Schema Application Results:`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📋 Total: ${statements.length}`);

    if (errorCount === 0) {
      console.log('\n🎉 Schema applied successfully!');
    } else {
      console.log('\n⚠️  Some statements failed. Check the logs above.');
    }

    // Test the tables after applying schema
    await testTables();

  } catch (error) {
    console.error('❌ Schema application failed:', error);
  }
}

async function testTables() {
  console.log('\n🧪 Testing newly created tables...');
  
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
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: Accessible`);
      }
    } catch (error) {
      console.log(`❌ Table ${table}: ${error.message}`);
    }
  }
}

// Run the schema application
applySchema().then(() => {
  console.log('\n✅ Support system database schema setup completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Test the support system in the browser');
  console.log('2. Create support agent accounts');
  console.log('3. Configure real-time subscriptions');
  console.log('4. Set up file storage for attachments');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Setup failed:', error);
  process.exit(1);
}); 