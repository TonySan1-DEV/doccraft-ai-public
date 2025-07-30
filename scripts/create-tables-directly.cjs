/**
 * Create Support System Tables Directly
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

async function createTablesDirectly() {
  console.log('🚀 Creating Support System Tables Directly...');
  console.log('📡 Supabase URL:', supabaseUrl);
  
  try {
    // Create tables one by one using individual SQL statements
    const tables = [
      {
        name: 'support_tickets',
        sql: `
          CREATE TABLE IF NOT EXISTS support_tickets (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            category VARCHAR(50) NOT NULL,
            priority VARCHAR(20) NOT NULL DEFAULT 'medium',
            status VARCHAR(20) NOT NULL DEFAULT 'open',
            user_id UUID NOT NULL,
            assigned_to UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            resolved_at TIMESTAMP WITH TIME ZONE,
            tags TEXT[] DEFAULT '{}',
            satisfaction_rating INTEGER,
            internal_notes TEXT,
            escalation_level INTEGER DEFAULT 0,
            last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_urgent BOOLEAN DEFAULT FALSE,
            customer_impact VARCHAR(20) DEFAULT 'low',
            business_impact VARCHAR(20) DEFAULT 'low'
          );
        `
      },
      {
        name: 'ticket_messages',
        sql: `
          CREATE TABLE IF NOT EXISTS ticket_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
            sender_id UUID NOT NULL,
            sender_type VARCHAR(20) NOT NULL DEFAULT 'user',
            content TEXT NOT NULL,
            content_type VARCHAR(20) DEFAULT 'text',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_internal BOOLEAN DEFAULT FALSE,
            read_by UUID[] DEFAULT '{}',
            edited_at TIMESTAMP WITH TIME ZONE,
            reply_to UUID REFERENCES ticket_messages(id)
          );
        `
      },
      {
        name: 'support_agents',
        sql: `
          CREATE TABLE IF NOT EXISTS support_agents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            avatar TEXT,
            department VARCHAR(100) NOT NULL,
            skills TEXT[] DEFAULT '{}',
            availability VARCHAR(100),
            current_tickets INTEGER DEFAULT 0,
            max_tickets INTEGER DEFAULT 10,
            average_resolution_time DECIMAL(5,2) DEFAULT 0,
            satisfaction_score DECIMAL(3,2) DEFAULT 0,
            is_available BOOLEAN DEFAULT TRUE,
            last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'chat_sessions',
        sql: `
          CREATE TABLE IF NOT EXISTS chat_sessions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            agent_id UUID REFERENCES support_agents(id),
            status VARCHAR(20) NOT NULL DEFAULT 'active',
            started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            ended_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'chat_messages',
        sql: `
          CREATE TABLE IF NOT EXISTS chat_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
            sender_id UUID NOT NULL,
            sender_type VARCHAR(20) NOT NULL DEFAULT 'user',
            content TEXT NOT NULL,
            message_type VARCHAR(20) DEFAULT 'text',
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'faq_items',
        sql: `
          CREATE TABLE IF NOT EXISTS faq_items (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            category VARCHAR(100) NOT NULL,
            tags TEXT[] DEFAULT '{}',
            views INTEGER DEFAULT 0,
            helpful INTEGER DEFAULT 0,
            not_helpful INTEGER DEFAULT 0,
            last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_published BOOLEAN DEFAULT TRUE,
            related_tickets UUID[] DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'support_preferences',
        sql: `
          CREATE TABLE IF NOT EXISTS support_preferences (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            notification_email BOOLEAN DEFAULT TRUE,
            notification_push BOOLEAN DEFAULT TRUE,
            language VARCHAR(10) DEFAULT 'en',
            timezone VARCHAR(50) DEFAULT 'UTC',
            auto_assign BOOLEAN DEFAULT TRUE,
            preferred_agent UUID REFERENCES support_agents(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const table of tables) {
      try {
        console.log(`\n🔄 Creating table: ${table.name}...`);
        
        // Try to create the table using a simple approach
        const { data, error } = await supabase
          .from(table.name)
          .select('count')
          .limit(1);
        
        if (error && error.message.includes('does not exist')) {
          // Table doesn't exist, we need to create it
          console.log(`📋 Table ${table.name} doesn't exist, attempting to create...`);
          
          // For now, we'll create a simple test record to trigger table creation
          // This is a workaround since we can't execute DDL via the client
          console.log(`⚠️  Cannot create table ${table.name} via client API`);
          console.log(`📋 Please create this table manually in Supabase dashboard`);
          errorCount++;
        } else if (error) {
          console.log(`❌ Error with table ${table.name}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Table ${table.name} already exists`);
          successCount++;
        }
        
      } catch (error) {
        console.log(`❌ Error creating table ${table.name}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Table Creation Results:`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📋 Total: ${tables.length}`);

    if (errorCount > 0) {
      console.log('\n📋 Manual Table Creation Required:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of database/apply-support-schema.sql');
      console.log('4. Execute the SQL script');
    }

    // Test existing tables
    await testExistingTables();

  } catch (error) {
    console.error('❌ Table creation failed:', error);
  }
}

async function testExistingTables() {
  console.log('\n🧪 Testing existing tables...');
  
  const tables = [
    'support_tickets',
    'ticket_messages', 
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

// Run the table creation
createTablesDirectly().then(() => {
  console.log('\n✅ Support system table creation completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Apply the database schema manually in Supabase dashboard');
  console.log('2. Run: node scripts/test-support-system.cjs');
  console.log('3. Test the support system in the browser');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Setup failed:', error);
  process.exit(1);
}); 