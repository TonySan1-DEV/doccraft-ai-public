/**
 * Test Support System Database Connection
 * DocCraft-AI v3 Support Module
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupportConnection() {
  console.log('🧪 Testing Support System Database Connection...');
  console.log('📡 Supabase URL:', supabaseUrl);
  
  try {
    // Test basic connection
    console.log('\n1️⃣ Testing basic connection...');
    const { data, error } = await supabase.from('support_tickets').select('count').limit(1);
    
    if (error) {
      console.log('⚠️  Support tickets table not found, this is expected if schema not applied yet');
      console.log('📋 Error details:', error.message);
    } else {
      console.log('✅ Support tickets table exists and is accessible');
    }

    // Test FAQ items table
    console.log('\n2️⃣ Testing FAQ items table...');
    const { data: faqData, error: faqError } = await supabase.from('faq_items').select('*').limit(5);
    
    if (faqError) {
      console.log('⚠️  FAQ items table not found, this is expected if schema not applied yet');
      console.log('📋 Error details:', faqError.message);
    } else {
      console.log(`✅ FAQ items table exists and is accessible (${faqData?.length || 0} items found)`);
    }

    // Test support agents table
    console.log('\n3️⃣ Testing support agents table...');
    const { data: agentsData, error: agentsError } = await supabase.from('support_agents').select('*').limit(5);
    
    if (agentsError) {
      console.log('⚠️  Support agents table not found, this is expected if schema not applied yet');
      console.log('📋 Error details:', agentsError.message);
    } else {
      console.log(`✅ Support agents table exists and is accessible (${agentsData?.length || 0} agents found)`);
    }

    // Test authentication
    console.log('\n4️⃣ Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('⚠️  Authentication test failed:', authError.message);
    } else {
      console.log('✅ Authentication is working');
      if (authData.session) {
        console.log('👤 User is authenticated');
      } else {
        console.log('👤 No active session (this is normal for testing)');
      }
    }

    console.log('\n📋 Database Setup Instructions:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of database/apply-support-schema.sql');
    console.log('4. Execute the SQL script');
    console.log('5. Run this test script again to verify the setup');

    console.log('\n🎯 Next Steps:');
    console.log('- Apply the database schema using the SQL file');
    console.log('- Test the support system in the browser');
    console.log('- Create support agent accounts');
    console.log('- Configure real-time subscriptions');

  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

// Run the test
testSupportConnection().then(() => {
  console.log('\n✅ Support system connection test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed:', error);
  process.exit(1);
}); 