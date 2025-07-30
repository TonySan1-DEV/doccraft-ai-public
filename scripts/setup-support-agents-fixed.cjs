/**
 * Setup Support Agents (Fixed Version)
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

async function setupSupportAgents() {
  console.log('👥 Setting up Support Agent Accounts (Fixed Version)...');
  console.log('📡 Supabase URL:', supabaseUrl);
  
  try {
    // Check if support_agents table exists
    const { data: agents, error: agentsError } = await supabase
      .from('support_agents')
      .select('count')
      .limit(1);
    
    if (agentsError) {
      console.log('❌ Support agents table not found. Please apply the schema first.');
      console.log('📋 Run the fixed schema: database/apply-support-schema-fixed.sql');
      return;
    }
    
    console.log('✅ Support agents table found');
    
    // Insert sample support agents (using non-existent UUIDs that won't conflict)
    const sampleAgents = [
      {
        user_id: '11111111-1111-1111-1111-111111111111',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@doccraft-ai.com',
        department: 'Technical Support',
        skills: ['technical_issue', 'bug_report', 'integration_help'],
        availability: 'online',
        current_tickets: 0,
        max_tickets: 10,
        average_resolution_time: 150, // 2.5 hours in minutes
        satisfaction_score: 4.8,
        is_available: true,
        last_active_at: new Date().toISOString()
      },
      {
        user_id: '22222222-2222-2222-2222-222222222222',
        name: 'Mike Chen',
        email: 'mike.chen@doccraft-ai.com',
        department: 'Billing & Account',
        skills: ['billing', 'account_access', 'general_inquiry'],
        availability: 'online',
        current_tickets: 0,
        max_tickets: 8,
        average_resolution_time: 108, // 1.8 hours in minutes
        satisfaction_score: 4.9,
        is_available: true,
        last_active_at: new Date().toISOString()
      },
      {
        user_id: '33333333-3333-3333-3333-333333333333',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@doccraft-ai.com',
        department: 'Feature Requests',
        skills: ['feature_request', 'performance', 'general_inquiry'],
        availability: 'online',
        current_tickets: 0,
        max_tickets: 12,
        average_resolution_time: 192, // 3.2 hours in minutes
        satisfaction_score: 4.7,
        is_available: true,
        last_active_at: new Date().toISOString()
      }
    ];
    
    console.log('📋 Inserting sample support agents...');
    
    for (const agent of sampleAgents) {
      try {
        const { data, error } = await supabase
          .from('support_agents')
          .insert(agent)
          .select();
        
        if (error) {
          console.log(`⚠️  Error inserting agent ${agent.name}:`, error.message);
        } else {
          console.log(`✅ Created agent: ${agent.name} (${agent.department})`);
        }
      } catch (error) {
        console.log(`❌ Failed to create agent ${agent.name}:`, error.message);
      }
    }
    
    // Insert sample FAQ items
    console.log('\n📚 Setting up FAQ Items...');
    
    const sampleFAQs = [
      {
        question: 'How do I create my first document with DocCraft-AI?',
        answer: 'To create your first document, click the "New Document" button in the dashboard. You can choose from various templates or start with a blank document. Our AI will guide you through the writing process with helpful suggestions and prompts.',
        category: 'Getting Started',
        tags: ['document-creation', 'first-time', 'tutorial'],
        views: 0,
        helpful: 0,
        not_helpful: 0,
        is_published: true,
        related_tickets: []
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through Stripe. You can update your payment method anytime in your account settings.',
        category: 'Billing',
        tags: ['payment', 'billing', 'credit-card'],
        views: 0,
        helpful: 0,
        not_helpful: 0,
        is_published: true,
        related_tickets: []
      },
      {
        question: 'How do I export my documents?',
        answer: 'You can export your documents in multiple formats including PDF, Word (.docx), and plain text. Click the "Export" button in the document editor and select your preferred format. Premium users can also export to additional formats like EPUB and HTML.',
        category: 'Features',
        tags: ['export', 'download', 'formats'],
        views: 0,
        helpful: 0,
        not_helpful: 0,
        is_published: true,
        related_tickets: []
      },
      {
        question: 'Can I collaborate with team members?',
        answer: 'Yes! DocCraft-AI supports real-time collaboration. You can invite team members to your documents, assign roles and permissions, and work together simultaneously. All changes are synchronized in real-time with conflict resolution.',
        category: 'Collaboration',
        tags: ['team', 'collaboration', 'real-time'],
        views: 0,
        helpful: 0,
        not_helpful: 0,
        is_published: true,
        related_tickets: []
      },
      {
        question: 'How do I reset my password?',
        answer: 'To reset your password, go to the login page and click "Forgot Password". Enter your email address and we\'ll send you a secure link to reset your password. The link expires after 24 hours for security.',
        category: 'Account',
        tags: ['password', 'security', 'login'],
        views: 0,
        helpful: 0,
        not_helpful: 0,
        is_published: true,
        related_tickets: []
      }
    ];
    
    for (const faq of sampleFAQs) {
      try {
        const { data, error } = await supabase
          .from('faq_items')
          .insert(faq)
          .select();
        
        if (error) {
          console.log(`⚠️  Error inserting FAQ:`, error.message);
        } else {
          console.log(`✅ Created FAQ: ${faq.question.substring(0, 50)}...`);
        }
      } catch (error) {
        console.log(`❌ Failed to create FAQ:`, error.message);
      }
    }
    
    console.log('\n🎉 Support system setup completed!');
    console.log('📋 Next steps:');
    console.log('1. Test the support system in your browser');
    console.log('2. Configure real-time subscriptions');
    console.log('3. Set up file storage for attachments');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
setupSupportAgents().then(() => {
  console.log('\n✅ Support agents setup completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Setup failed:', error);
  process.exit(1);
}); 