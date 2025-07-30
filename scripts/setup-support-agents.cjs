/**
 * Setup Support Agent Accounts
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
  console.log('👥 Setting up Support Agent Accounts...');
  console.log('📡 Supabase URL:', supabaseUrl);
  
  try {
    // First, check if tables exist
    console.log('\n1️⃣ Checking if support tables exist...');
    const { data: tablesData, error: tablesError } = await supabase
      .from('support_agents')
      .select('count')
      .limit(1);
    
    if (tablesError) {
      console.log('❌ Support tables not found. Please apply the schema first.');
      console.log('📋 Run the SQL schema in Supabase SQL Editor');
      return;
    }
    
    console.log('✅ Support tables exist');
    
    // Create sample support agents
    console.log('\n2️⃣ Creating sample support agents...');
    
    const sampleAgents = [
      {
        user_id: '00000000-0000-0000-0000-000000000001', // Placeholder UUID
        name: 'Sarah Johnson',
        email: 'sarah.johnson@doccraft-ai.com',
        department: 'Technical Support',
        skills: ['technical_issue', 'bug_report', 'integration_help'],
        availability: '9:00 AM - 6:00 PM EST',
        current_tickets: 0,
        max_tickets: 10,
        average_resolution_time: 2.5,
        satisfaction_score: 4.8,
        is_available: true,
        last_active_at: new Date().toISOString()
      },
      {
        user_id: '00000000-0000-0000-0000-000000000002', // Placeholder UUID
        name: 'Mike Chen',
        email: 'mike.chen@doccraft-ai.com',
        department: 'Billing & Account',
        skills: ['billing', 'account_access', 'general_inquiry'],
        availability: '8:00 AM - 5:00 PM EST',
        current_tickets: 0,
        max_tickets: 8,
        average_resolution_time: 1.8,
        satisfaction_score: 4.9,
        is_available: true,
        last_active_at: new Date().toISOString()
      },
      {
        user_id: '00000000-0000-0000-0000-000000000003', // Placeholder UUID
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@doccraft-ai.com',
        department: 'Feature Requests',
        skills: ['feature_request', 'performance', 'general_inquiry'],
        availability: '10:00 AM - 7:00 PM EST',
        current_tickets: 0,
        max_tickets: 12,
        average_resolution_time: 3.2,
        satisfaction_score: 4.7,
        is_available: true,
        last_active_at: new Date().toISOString()
      }
    ];
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const agent of sampleAgents) {
      try {
        const { data, error } = await supabase
          .from('support_agents')
          .insert(agent)
          .select();
        
        if (error) {
          console.log(`❌ Failed to create agent ${agent.name}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Created agent: ${agent.name} (${agent.department})`);
          successCount++;
        }
      } catch (error) {
        console.log(`❌ Error creating agent ${agent.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Agent Creation Results:`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    
    // Create sample FAQ items
    console.log('\n3️⃣ Creating sample FAQ items...');
    
    const sampleFAQs = [
      {
        question: 'How do I create my first document with DocCraft-AI?',
        answer: 'To create your first document, navigate to the Document Processor page, upload your content, and use our AI-powered tools to enhance and structure your writing. You can also use the Book Outliner for longer projects.',
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
        answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans. All payments are processed securely through Stripe.',
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
        answer: 'You can export your documents in multiple formats including PDF, DOCX, and plain text. Use the export button in the document editor or download from your document library.',
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
        answer: 'Yes! DocCraft-AI supports real-time collaboration. Invite team members to your workspace and work together on documents with live editing and commenting features.',
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
        answer: 'Click the "Forgot Password" link on the login page. Enter your email address and we\'ll send you a secure link to reset your password.',
        category: 'Account',
        tags: ['password', 'security', 'login'],
        views: 0,
        helpful: 0,
        not_helpful: 0,
        is_published: true,
        related_tickets: []
      }
    ];
    
    let faqSuccessCount = 0;
    let faqErrorCount = 0;
    
    for (const faq of sampleFAQs) {
      try {
        const { data, error } = await supabase
          .from('faq_items')
          .insert(faq)
          .select();
        
        if (error) {
          console.log(`❌ Failed to create FAQ: ${faq.question.substring(0, 50)}...`);
          faqErrorCount++;
        } else {
          console.log(`✅ Created FAQ: ${faq.question.substring(0, 50)}...`);
          faqSuccessCount++;
        }
      } catch (error) {
        console.log(`❌ Error creating FAQ: ${error.message}`);
        faqErrorCount++;
      }
    }
    
    console.log(`\n📊 FAQ Creation Results:`);
    console.log(`✅ Successful: ${faqSuccessCount}`);
    console.log(`❌ Failed: ${faqErrorCount}`);
    
    console.log('\n🎉 Support system setup completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Test the support system in the browser');
    console.log('2. Configure real-time subscriptions');
    console.log('3. Set up file storage for attachments');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
setupSupportAgents().then(() => {
  console.log('\n✅ Support agent setup completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Setup failed:', error);
  process.exit(1);
}); 