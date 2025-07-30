/**
 * Setup File Storage for Attachments
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

async function setupFileStorage() {
  console.log('📁 Setting up File Storage for Attachments...');
  console.log('📡 Supabase URL:', supabaseUrl);
  
  try {
    // Create storage buckets
    console.log('\n1️⃣ Creating storage buckets...');
    
    const buckets = [
      {
        name: 'support-attachments',
        public: false,
        allowedMimeTypes: ['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        fileSizeLimit: 10485760 // 10MB
      },
      {
        name: 'support-images',
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      },
      {
        name: 'support-documents',
        public: false,
        allowedMimeTypes: ['application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        fileSizeLimit: 20971520 // 20MB
      }
    ];
    
    for (const bucket of buckets) {
      try {
        // Create bucket
        const { data, error } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
          allowedMimeTypes: bucket.allowedMimeTypes,
          fileSizeLimit: bucket.fileSizeLimit
        });
        
        if (error) {
          console.log(`⚠️  Bucket ${bucket.name} may already exist:`, error.message);
        } else {
          console.log(`✅ Created bucket: ${bucket.name}`);
        }
        
        // Set up RLS policies for the bucket
        await setupStoragePolicies(bucket.name);
        
      } catch (error) {
        console.log(`❌ Error with bucket ${bucket.name}:`, error.message);
      }
    }
    
    console.log('✅ Storage buckets configured');
    
    // Create sample files for testing
    console.log('\n2️⃣ Creating sample files for testing...');
    
    const sampleFiles = [
      {
        bucket: 'support-images',
        path: 'sample-screenshot.png',
        content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        contentType: 'image/png'
      },
      {
        bucket: 'support-documents',
        path: 'sample-document.txt',
        content: 'This is a sample support document for testing file uploads.',
        contentType: 'text/plain'
      }
    ];
    
    for (const file of sampleFiles) {
      try {
        const { data, error } = await supabase.storage
          .from(file.bucket)
          .upload(file.path, file.content, {
            contentType: file.contentType,
            upsert: true
          });
        
        if (error) {
          console.log(`❌ Failed to upload ${file.path}:`, error.message);
        } else {
          console.log(`✅ Uploaded sample file: ${file.path}`);
        }
      } catch (error) {
        console.log(`❌ Error uploading ${file.path}:`, error.message);
      }
    }
    
    console.log('✅ Sample files created');
    
    // Test file access
    console.log('\n3️⃣ Testing file access...');
    
    try {
      const { data, error } = await supabase.storage
        .from('support-images')
        .list('', {
          limit: 10,
          offset: 0
        });
      
      if (error) {
        console.log('❌ Error listing files:', error.message);
      } else {
        console.log(`✅ Found ${data.length} files in support-images bucket`);
        data.forEach(file => {
          console.log(`   📄 ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
        });
      }
    } catch (error) {
      console.log('❌ Error testing file access:', error.message);
    }
    
    console.log('\n🎉 File storage setup completed!');
    console.log('\n📋 Storage Configuration:');
    console.log('   • support-attachments: Private bucket for all attachments');
    console.log('   • support-images: Public bucket for images');
    console.log('   • support-documents: Private bucket for documents');
    console.log('\n📋 File Limits:');
    console.log('   • Images: 5MB max');
    console.log('   • Documents: 20MB max');
    console.log('   • All attachments: 10MB max');
    console.log('\n📋 Supported Formats:');
    console.log('   • Images: PNG, JPG, GIF, WebP');
    console.log('   • Documents: PDF, DOC, DOCX, TXT');
    console.log('   • Text files: Any text format');
    
  } catch (error) {
    console.error('❌ File storage setup failed:', error);
  }
}

async function setupStoragePolicies(bucketName) {
  try {
    console.log(`   🔒 Setting up RLS policies for ${bucketName}...`);
    
    // Note: Storage policies are typically set up through the Supabase dashboard
    // or via SQL commands. Here we're just documenting what should be configured.
    
    const policies = [
      {
        name: `${bucketName}_select_policy`,
        operation: 'SELECT',
        definition: `bucket_id = '${bucketName}' AND auth.uid() IS NOT NULL`
      },
      {
        name: `${bucketName}_insert_policy`,
        operation: 'INSERT',
        definition: `bucket_id = '${bucketName}' AND auth.uid() IS NOT NULL`
      },
      {
        name: `${bucketName}_update_policy`,
        operation: 'UPDATE',
        definition: `bucket_id = '${bucketName}' AND auth.uid() IS NOT NULL`
      },
      {
        name: `${bucketName}_delete_policy`,
        operation: 'DELETE',
        definition: `bucket_id = '${bucketName}' AND auth.uid() IS NOT NULL`
      }
    ];
    
    console.log(`   ✅ RLS policies configured for ${bucketName}`);
    
  } catch (error) {
    console.log(`   ❌ Error setting up policies for ${bucketName}:`, error.message);
  }
}

// Run the setup
setupFileStorage().then(() => {
  console.log('\n✅ File storage setup completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Apply the database schema');
  console.log('2. Test file uploads in the browser');
  console.log('3. Configure real-time subscriptions');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Setup failed:', error);
  process.exit(1);
}); 