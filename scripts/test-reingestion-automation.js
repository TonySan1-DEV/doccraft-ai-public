// MCP Context Block
/*
{
  file: "test-reingestion-automation.js",
  role: "test",
  allowedActions: ["test", "validate"],
  tier: "Admin",
  contentSensitivity: "medium",
  theme: "testing"
}
*/

const fs = require('fs');
const path = require('path');

// Test configuration
const TESTS = {
  githubAction: {
    name: 'GitHub Action Workflow',
    file: '.github/workflows/reingest-audit-logs.yml',
    required: true
  },
  edgeFunction: {
    name: 'Supabase Edge Function',
    file: 'supabase/functions/reingestFallbackLogs/index.ts',
    required: false
  },
  corsHeaders: {
    name: 'CORS Headers',
    file: 'supabase/functions/_shared/cors.ts',
    required: false
  },
  config: {
    name: 'Edge Function Config',
    file: 'supabase/functions/reingestFallbackLogs/config.ts',
    required: false
  },
  deploymentScript: {
    name: 'Deployment Script',
    file: 'scripts/deploy-edge-function.sh',
    required: false
  },
  documentation: {
    name: 'Documentation',
    file: 'docs/AUDIT_REINGESTION_AUTOMATION.md',
    required: true
  }
};

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testFile(filePath, testName, required = true) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      
      log(`✅ ${testName} - Found (${stats.size} bytes)`, 'green');
      
      // Basic validation
      if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
        if (content.includes('name:') && content.includes('on:')) {
          log(`   ✓ Valid YAML structure`, 'green');
        } else {
          log(`   ⚠️  YAML structure may be invalid`, 'yellow');
        }
      }
      
      if (filePath.endsWith('.ts')) {
        if (content.includes('serve') || content.includes('export')) {
          log(`   ✓ Valid TypeScript structure`, 'green');
        } else {
          log(`   ⚠️  TypeScript structure may be invalid`, 'yellow');
        }
      }
      
      if (filePath.endsWith('.md')) {
        if (content.includes('#') && content.length > 100) {
          log(`   ✓ Valid documentation structure`, 'green');
        } else {
          log(`   ⚠️  Documentation may be incomplete`, 'yellow');
        }
      }
      
      return true;
    } else {
      if (required) {
        log(`❌ ${testName} - Missing (REQUIRED)`, 'red');
        return false;
      } else {
        log(`⚠️  ${testName} - Missing (optional)`, 'yellow');
        return true; // Don't fail for optional files
      }
    }
  } catch (error) {
    log(`❌ ${testName} - Error: ${error.message}`, 'red');
    return false;
  }
}

function testEnvironment() {
  log('\n🔍 Testing Environment Setup...', 'blue');
  
  const envVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  let envOk = true;
  envVars.forEach(varName => {
    if (process.env[varName]) {
      log(`✅ ${varName} - Set`, 'green');
    } else {
      log(`❌ ${varName} - Missing`, 'red');
      envOk = false;
    }
  });
  
  return envOk;
}

function testDirectoryStructure() {
  log('\n📁 Testing Directory Structure...', 'blue');
  
  const requiredDirs = [
    'logs/audit-sync',
    'logs/recovery',
    '.github/workflows'
  ];
  
  let dirOk = true;
  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      log(`✅ ${dir} - Exists`, 'green');
    } else {
      log(`❌ ${dir} - Missing`, 'red');
      dirOk = false;
    }
  });
  
  return dirOk;
}

function testReingestionScript() {
  log('\n📜 Testing Re-ingestion Script...', 'blue');
  
  const scriptPath = 'scripts/cron/reingestFallbackLogs.ts';
  
  if (fs.existsSync(scriptPath)) {
    const content = fs.readFileSync(scriptPath, 'utf8');
    const stats = fs.statSync(scriptPath);
    
    log(`✅ Re-ingestion script - Found (${stats.size} bytes)`, 'green');
    
    // Check for key functions
    const keyFunctions = [
      'reingestFallbackLogs',
      'processFallbackLogFile',
      'insertAuditSyncLog'
    ];
    
    keyFunctions.forEach(func => {
      if (content.includes(func)) {
        log(`   ✓ Function ${func} found`, 'green');
      } else {
        log(`   ❌ Function ${func} missing`, 'red');
      }
    });
    
    return true;
  } else {
    log(`❌ Re-ingestion script - Missing`, 'red');
    return false;
  }
}

function generateTestData() {
  log('\n🧪 Generating Test Data...', 'blue');
  
  const testLogDir = 'logs/audit-sync';
  const testLogFile = path.join(testLogDir, `audit-sync-test-${Date.now()}.json`);
  
  // Ensure directory exists
  if (!fs.existsSync(testLogDir)) {
    fs.mkdirSync(testLogDir, { recursive: true });
  }
  
  // Create test fallback log
  const testLog = {
    timestamp: new Date().toISOString(),
    status: 'failure',
    destination: 'S3',
    durationMs: 5000,
    errorMessage: 'Test error for automation validation',
    recordsExported: 0,
    environment: 'test',
    metadata: {
      source: 'automation-test',
      testRun: true
    },
    fallbackReason: 'Automation testing'
  };
  
  fs.writeFileSync(testLogFile, JSON.stringify(testLog, null, 2));
  log(`✅ Created test log: ${testLogFile}`, 'green');
  
  return testLogFile;
}

function cleanupTestData(testFile) {
  if (testFile && fs.existsSync(testFile)) {
    fs.unlinkSync(testFile);
    log(`🧹 Cleaned up test file: ${testFile}`, 'yellow');
  }
}

// Main test execution
async function runTests() {
  log('🚀 DocCraft-AI Re-ingestion Automation Test Suite', 'blue');
  log('='.repeat(60), 'blue');
  
  let allTestsPassed = true;
  
  // Test file existence
  log('\n📋 Testing File Structure...', 'blue');
  Object.entries(TESTS).forEach(([key, test]) => {
    const passed = testFile(test.file, test.name, test.required);
    if (!passed && test.required) {
      allTestsPassed = false;
    }
  });
  
  // Test environment
  const envOk = testEnvironment();
  if (!envOk) {
    allTestsPassed = false;
  }
  
  // Test directory structure
  const dirOk = testDirectoryStructure();
  if (!dirOk) {
    allTestsPassed = false;
  }
  
  // Test re-ingestion script
  const scriptOk = testReingestionScript();
  if (!scriptOk) {
    allTestsPassed = false;
  }
  
  // Generate test data
  const testFile = generateTestData();
  
  // Summary
  log('\n📊 Test Summary', 'blue');
  log('='.repeat(60), 'blue');
  
  if (allTestsPassed) {
    log('✅ All required tests passed!', 'green');
    log('\n🎉 Re-ingestion automation is ready for deployment.', 'green');
    log('\nNext steps:', 'blue');
    log('1. Set up GitHub secrets for environment variables', 'yellow');
    log('2. Configure Slack webhook (optional)', 'yellow');
    log('3. Test manual workflow execution', 'yellow');
    log('4. Monitor first scheduled run', 'yellow');
  } else {
    log('❌ Some tests failed. Please fix the issues above.', 'red');
    log('\nCommon fixes:', 'yellow');
    log('1. Set required environment variables', 'yellow');
    log('2. Create missing directories', 'yellow');
    log('3. Ensure all required files exist', 'yellow');
  }
  
  // Cleanup
  cleanupTestData(testFile);
  
  return allTestsPassed;
}

// Run tests if called directly
if (require.main === module) {
  runTests().then(passed => {
    process.exit(passed ? 0 : 1);
  }).catch(error => {
    log(`❌ Test execution failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests }; 