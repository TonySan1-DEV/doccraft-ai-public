/**
 * Generate SQL Commands for Support System
 * DocCraft-AI v3 Support Module
 */

const fs = require('fs');
const path = require('path');

function readSchemaFile() {
  try {
    const schemaPath = path.join(__dirname, '..', 'database', 'apply-support-schema.sql');
    return fs.readFileSync(schemaPath, 'utf8');
  } catch (error) {
    console.error('❌ Error reading schema file:', error.message);
    return null;
  }
}

function generateSQLCommands() {
  console.log('📋 SQL Commands for Support System Setup');
  console.log('=========================================\n');
  
  const schemaSQL = readSchemaFile();
  if (!schemaSQL) {
    console.error('❌ Could not read schema file');
    process.exit(1);
  }

  console.log('🚀 Copy and paste the following SQL into your Supabase SQL Editor:\n');
  console.log('```sql');
  console.log(schemaSQL);
  console.log('```\n');
  
  console.log('📋 Step-by-Step Instructions:');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Select your project: drqrjfkmgkyvdlqvfync');
  console.log('3. Click "SQL Editor" in the left sidebar');
  console.log('4. Click "New query"');
  console.log('5. Copy the SQL above and paste it into the editor');
  console.log('6. Click "Run" (or press Ctrl+Enter)');
  console.log('7. Wait for all statements to complete');
  console.log('8. Go to "Table Editor" to verify tables were created');
  console.log('\n📋 Expected Tables:');
  console.log('   • support_tickets');
  console.log('   • ticket_messages');
  console.log('   • ticket_attachments');
  console.log('   • message_attachments');
  console.log('   • support_agents');
  console.log('   • chat_sessions');
  console.log('   • chat_messages');
  console.log('   • faq_items');
  console.log('   • support_preferences');
  console.log('\n🎯 After applying the schema:');
  console.log('1. Run: node scripts/test-support-system.cjs');
  console.log('2. Test in browser: http://localhost:5179/support');
  console.log('3. Create support agent accounts');
  console.log('4. Configure real-time subscriptions');
  
  // Also create individual SQL files for each table
  createIndividualSQLFiles();
}

function createIndividualSQLFiles() {
  console.log('\n📁 Creating individual SQL files for each table...');
  
  const tables = [
    {
      name: 'support_tickets',
      sql: `
-- Support Tickets Table
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
-- Ticket Messages Table
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
-- Support Agents Table
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
      name: 'faq_items',
      sql: `
-- FAQ Items Table
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
    }
  ];

  // Create individual SQL files
  tables.forEach(table => {
    const filePath = path.join(__dirname, '..', 'database', `${table.name}.sql`);
    fs.writeFileSync(filePath, table.sql.trim());
    console.log(`✅ Created: database/${table.name}.sql`);
  });

  console.log('\n📋 Individual SQL files created in database/ folder');
  console.log('You can run these individually if the main schema fails');
}

// Generate the SQL commands
generateSQLCommands(); 