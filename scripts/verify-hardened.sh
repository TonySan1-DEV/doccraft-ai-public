#!/bin/bash

# DocCraft AI Hardened Verification Script
# Runs the hardened verification tests with proper environment setup

echo "🔒 DocCraft AI Hardened Verification Starting..."

# Set environment variables for testing
export PORT=8000
export NODE_ENV=test

# Check if required dependencies are available
echo "📦 Checking dependencies..."
if ! command -v concurrently &> /dev/null; then
    echo "❌ concurrently not found. Install with: npm install -g concurrently"
    exit 1
fi

if ! command -v wait-on &> /dev/null; then
    echo "❌ wait-on not found. Install with: npm install -g wait-on"
    exit 1
fi

echo "✅ All dependencies available"

# Run the hardened verification
echo "🚀 Starting hardened verification..."
echo "   This will start the server on port 8000 and run guardrail tests"

npm run verify:hardened

# Check exit code
if [ $? -eq 0 ]; then
    echo "✅ Hardened verification completed successfully!"
    echo "   All security guardrails are working correctly"
else
    echo "❌ Hardened verification failed!"
    echo "   Check the test output above for details"
    exit 1
fi

echo "🔒 Hardened verification complete!"
