#!/usr/bin/env node

// Simple test script for the monitor endpoint
const testMonitorEndpoint = async () => {
  const baseUrl = process.env.TEST_URL || 'http://localhost:1234';
  const endpoint = `${baseUrl}/api/monitor/error`;

  console.log(`🧪 Testing monitor endpoint: ${endpoint}`);

  const testPayload = {
    message: 'Test error message',
    stack: 'Error: Test error\n  at test:1:1\n  at script:2:2',
    tags: { component: 'test', label: 'smoke-test' },
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DocCraft-AI-Test/1.0',
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`📊 Response Status: ${response.status}`);
    console.log(
      `📊 Response Headers:`,
      Object.fromEntries(response.headers.entries())
    );

    if (response.ok || response.status === 202) {
      const body = await response.text();
      console.log(`✅ Success! Response: ${body}`);
    } else {
      console.log(`❌ Error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`💥 Network Error: ${error.message}`);
    console.log(`💡 Make sure the server is running on ${baseUrl}`);
    console.log(`💡 Start with: cd server && node collaboration-server.ts`);
  }
};

// Run the test
testMonitorEndpoint().catch(console.error);
