#!/usr/bin/env node

// MCP Context Block
/*
{
  file: "start-character-chat.js",
  role: "developer",
  allowedActions: ["start", "configure", "monitor"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "server_management"
}
*/

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Character Chat API Server...\n');

// Check if tsx is available, otherwise use node
const isTsxAvailable = () => {
  try {
    require.resolve('tsx');
    return true;
  } catch {
    return false;
  }
};

const serverPath = path.join(__dirname, '..', 'server', 'character-chat-api.ts');
const useTsx = isTsxAvailable();

if (useTsx) {
  console.log('📦 Using tsx for TypeScript execution');
  const child = spawn('npx', ['tsx', serverPath], {
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (error) => {
    console.error('❌ Failed to start character chat server:', error.message);
    process.exit(1);
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Character chat server exited with code ${code}`);
      process.exit(code);
    }
  });
} else {
  console.log('📦 Using node (TypeScript compilation required)');
  console.log('⚠️  Please ensure the TypeScript is compiled first');
  console.log('   Run: npm run server:build');
  
  const compiledPath = path.join(__dirname, '..', 'dist', 'server', 'character-chat-api.js');
  const child = spawn('node', [compiledPath], {
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (error) => {
    console.error('❌ Failed to start character chat server:', error.message);
    console.log('💡 Try running: npm run server:build first');
    process.exit(1);
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Character chat server exited with code ${code}`);
      process.exit(code);
    }
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down character chat server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down character chat server...');
  process.exit(0);
});

console.log('✅ Character chat server starting...');
console.log('🌐 API will be available at: http://localhost:3002');
console.log('📋 Health check: http://localhost:3002/api/health');
console.log('💬 Character chat: http://localhost:3002/api/character-chat');
console.log('\nPress Ctrl+C to stop the server\n'); 