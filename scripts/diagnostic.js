#!/usr/bin/env node

/**
 * DocCraft-AI v3 Diagnostic Script
 * Checks if the application is running properly
 */

import http from 'http';
import https from 'https';

console.log('🔧 DocCraft-AI v3 Diagnostic Script');
console.log('=====================================\n');

// Test configuration
const tests = [
    { name: 'Main App (Port 5173)', url: 'http://localhost:5173/', port: 5173 },
    { name: 'Demo Page', url: 'http://localhost:5173/demo', port: 5173 },
    { name: 'Home Page', url: 'http://localhost:5173/', port: 5173 }
];

async function testEndpoint(name, url, port) {
    return new Promise((resolve) => {
        const req = http.get(url, (res) => {
            console.log(`✅ ${name}: HTTP ${res.statusCode}`);
            resolve({ success: true, statusCode: res.statusCode });
        });

        req.on('error', (err) => {
            console.log(`❌ ${name}: ${err.message}`);
            resolve({ success: false, error: err.message });
        });

        req.setTimeout(5000, () => {
            console.log(`⏰ ${name}: Timeout`);
            req.destroy();
            resolve({ success: false, error: 'Timeout' });
        });
    });
}

async function checkPort(port) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}`, (res) => {
            resolve(true);
        });

        req.on('error', () => {
            resolve(false);
        });

        req.setTimeout(2000, () => {
            req.destroy();
            resolve(false);
        });
    });
}

async function runDiagnostics() {
    console.log('📊 Running diagnostics...\n');

    // Check if ports are available
    console.log('🔍 Checking available ports:');
    for (let port = 5173; port <= 5180; port++) {
        const isAvailable = await checkPort(port);
        console.log(`   Port ${port}: ${isAvailable ? '✅ In Use' : '❌ Available'}`);
    }
    console.log('');

    // Test endpoints
    console.log('🌐 Testing endpoints:');
    for (const test of tests) {
        await testEndpoint(test.name, test.url, test.port);
    }
    console.log('');

    // Check environment
    console.log('🔧 Environment check:');
    console.log(`   Node.js version: ${process.version}`);
    console.log(`   Platform: ${process.platform}`);
    console.log(`   Architecture: ${process.arch}`);
    console.log(`   Current directory: ${process.cwd()}`);
    console.log('');

    // Check for common issues
    console.log('⚠️  Common issues to check:');
    console.log('   1. Is the development server running? (npm run dev)');
    console.log('   2. Are there any TypeScript errors? (npx tsc --noEmit)');
    console.log('   3. Are all dependencies installed? (npm install)');
    console.log('   4. Is the .env file configured?');
    console.log('   5. Are there any console errors in the browser?');
    console.log('');

    console.log('🎯 Next steps:');
    console.log('   1. Open http://localhost:5173/ in your browser');
    console.log('   2. Check the browser console for errors (F12)');
    console.log('   3. If you see a white page, check the console for JavaScript errors');
    console.log('   4. Try accessing http://localhost:5173/demo for the demo page');
    console.log('');

    console.log('📝 If you see errors:');
    console.log('   - Check the terminal where npm run dev is running');
    console.log('   - Look for any error messages in the terminal output');
    console.log('   - Check if all imports are resolving correctly');
    console.log('   - Verify that all required files exist');
}

// Run diagnostics
runDiagnostics().catch(console.error); 