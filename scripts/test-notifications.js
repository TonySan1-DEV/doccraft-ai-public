// MCP Context Block
/*
{
  file: "test-notifications.js",
  role: "test",
  allowedActions: ["test", "validate"],
  tier: "Admin",
  contentSensitivity: "medium",
  theme: "testing"
}
*/

const { notifyReingestionResult } = require('./cron/utils/notifyReingestionResult');

// Test scenarios
const testScenarios = [
  {
    name: 'Success - All files processed successfully',
    data: {
      successCount: 15,
      failureCount: 0,
      totalFiles: 15,
      durationMs: 2500,
      status: 'success'
    }
  },
  {
    name: 'Partial Success - Some failures',
    data: {
      successCount: 12,
      failureCount: 3,
      totalFiles: 15,
      durationMs: 4100,
      errorSummary: [
        'file3.json: Invalid schema',
        'file7.json: Database connection timeout',
        'file12.json: Duplicate entry detected'
      ],
      status: 'partial'
    }
  },
  {
    name: 'Complete Failure - All files failed',
    data: {
      successCount: 0,
      failureCount: 8,
      totalFiles: 8,
      durationMs: 1500,
      errorSummary: [
        'Database connection failed',
        'Invalid credentials',
        'Network timeout'
      ],
      status: 'failure'
    }
  },
  {
    name: 'Large Dataset - Many files',
    data: {
      successCount: 95,
      failureCount: 5,
      totalFiles: 100,
      durationMs: 45000,
      errorSummary: [
        'file23.json: Schema validation failed',
        'file47.json: Connection reset',
        'file89.json: Timeout error',
        'file91.json: Invalid JSON format',
        'file99.json: Database constraint violation'
      ],
      status: 'partial'
    }
  }
];

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

async function runTestScenario(scenario, index) {
  log(`\n${colors.cyan}🧪 Test ${index + 1}: ${scenario.name}${colors.reset}`);
  log('='.repeat(60));
  
  log(`📊 Test Data:`, 'blue');
  log(`  Files: ${scenario.data.totalFiles}`);
  log(`  Success: ${scenario.data.successCount}`);
  log(`  Failed: ${scenario.data.failureCount}`);
  log(`  Duration: ${formatDuration(scenario.data.durationMs)}`);
  log(`  Status: ${scenario.data.status}`);
  
  if (scenario.data.errorSummary) {
    log(`  Errors: ${scenario.data.errorSummary.length}`);
    scenario.data.errorSummary.forEach((error, i) => {
      log(`    ${i + 1}. ${error}`);
    });
  }
  
  try {
    log(`\n📢 Sending notification...`, 'yellow');
    const startTime = Date.now();
    
    await notifyReingestionResult(scenario.data);
    
    const notificationTime = Date.now() - startTime;
    log(`✅ Notification sent in ${notificationTime}ms`, 'green');
    
  } catch (error) {
    log(`❌ Notification failed: ${error.message}`, 'red');
    return false;
  }
  
  return true;
}

async function testEnvironmentSetup() {
  log(`\n${colors.blue}🔍 Testing Environment Setup...${colors.reset}`);
  
  const envVars = [
    'SLACK_WEBHOOK_URL',
    'NOTIFY_WEBHOOK_URL',
    'NODE_ENV'
  ];
  
  let allSet = true;
  envVars.forEach(varName => {
    if (process.env[varName]) {
      log(`✅ ${varName} - Set`, 'green');
    } else {
      log(`❌ ${varName} - Not set`, 'red');
      allSet = false;
    }
  });
  
  if (!allSet) {
    log(`\n${colors.yellow}⚠️  Some environment variables are not set.${colors.reset}`);
    log(`This is normal for testing - notifications will be skipped.`);
  }
  
  return allSet;
}

async function runAllTests() {
  log(`${colors.blue}🚀 DocCraft-AI Notification System Test Suite${colors.reset}`);
  log('='.repeat(60));
  
  // Test environment
  const envOk = await testEnvironmentSetup();
  
  // Run test scenarios
  log(`\n${colors.magenta}📋 Running Test Scenarios...${colors.reset}`);
  
  let passedTests = 0;
  let totalTests = testScenarios.length;
  
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    const success = await runTestScenario(scenario, i);
    
    if (success) {
      passedTests++;
    }
    
    // Add delay between tests to avoid rate limiting
    if (i < testScenarios.length - 1) {
      log(`\n⏳ Waiting 2 seconds before next test...`, 'yellow');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Summary
  log(`\n${colors.blue}📊 Test Summary${colors.reset}`);
  log('='.repeat(60));
  log(`Total Tests: ${totalTests}`);
  log(`Passed: ${passedTests}`);
  log(`Failed: ${totalTests - passedTests}`);
  
  if (passedTests === totalTests) {
    log(`\n${colors.green}🎉 All tests passed! Notification system is working correctly.${colors.reset}`);
  } else {
    log(`\n${colors.red}❌ Some tests failed. Check the errors above.${colors.reset}`);
  }
  
  if (!envOk) {
    log(`\n${colors.yellow}💡 To enable actual notifications, set these environment variables:${colors.reset}`);
    log(`export SLACK_WEBHOOK_URL="your-slack-webhook-url"`);
    log(`export NOTIFY_WEBHOOK_URL="your-webhook-url"`);
  }
  
  return passedTests === totalTests;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    log(`❌ Test execution failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runAllTests, testScenarios }; 