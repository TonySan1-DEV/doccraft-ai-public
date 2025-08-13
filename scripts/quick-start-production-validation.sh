#!/bin/bash
# scripts/quick-start-production-validation.sh
#
# Quick Start Guide for DocCraft-AI Production Validation
# 
# This script provides a step-by-step guide to running the production validation
# system and assessing launch readiness.

set -e

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}"
echo "🚀 DocCraft-AI Production Validation Quick Start"
echo "==============================================="
echo -e "${NC}"

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -d "tests/e2e" ]]; then
    echo "❌ Error: Please run this script from the DocCraft-AI project root directory"
    exit 1
fi

echo -e "${BLUE}Step 1: Environment Setup${NC}"
echo "----------------------------"

# Check if environment variables are set
echo "Checking environment variables..."
if [[ -z "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
    echo "⚠️  SUPABASE_SERVICE_ROLE_KEY not set"
    echo "   Please set this environment variable before proceeding"
    echo "   export SUPABASE_SERVICE_ROLE_KEY='your_key_here'"
else
    echo "✅ SUPABASE_SERVICE_ROLE_KEY is set"
fi

if [[ -z "$OPENAI_API_KEY" ]]; then
    echo "⚠️  OPENAI_API_KEY not set"
    echo "   Please set this environment variable before proceeding"
    echo "   export OPENAI_API_KEY='your_key_here'"
else
    echo "✅ OPENAI_API_KEY is set"
fi

if [[ -z "$JWT_SECRET" ]]; then
    echo "⚠️  JWT_SECRET not set"
    echo "   Please set this environment variable before proceeding"
    echo "   export JWT_SECRET='your_secret_here'"
else
    echo "✅ JWT_SECRET is set"
fi

echo ""
echo -e "${BLUE}Step 2: Install Dependencies${NC}"
echo "--------------------------------"

if command -v npm >/dev/null 2>&1; then
    echo "Installing npm dependencies..."
    npm install
    
    echo "Installing Playwright browsers..."
    npx playwright install
else
    echo "❌ Error: npm not found. Please install Node.js and npm first."
    exit 1
fi

echo ""
echo -e "${BLUE}Step 3: Run Production Validation Tests${NC}"
echo "--------------------------------------------"

echo "Choose your validation approach:"
echo ""
echo "1. 🧪 Run complete production validation suite"
echo "2. 🔒 Run security validation only"
echo "3. ⚡ Run load testing only"
echo "4. 📊 Run launch readiness assessment only"
echo "5. 🚀 Run everything (full validation)"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "Running complete production validation suite..."
        npm run test:production
        ;;
    2)
        echo "Running security validation only..."
        npm run test:security
        ;;
    3)
        echo "Running load testing only..."
        npm run test:load
        ;;
    4)
        echo "Running launch readiness assessment..."
        npm run test:readiness
        ;;
    5)
        echo "Running complete validation (tests + readiness assessment)..."
        echo ""
        echo "Step 3a: Running production validation tests..."
        npm run test:production
        
        echo ""
        echo "Step 3b: Running launch readiness assessment..."
        npm run test:readiness
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}Step 4: Review Results${NC}"
echo "---------------------------"

echo "Test results are available in:"
echo "  📁 HTML Report: playwright-report/index.html"
echo "  📁 Test Results: test-results/"
echo "  📊 Console Output: Above"

echo ""
echo -e "${BLUE}Step 5: Next Steps${NC}"
echo "------------------------"

echo "Based on your validation results:"
echo ""
echo "✅ If READY FOR LAUNCH:"
echo "   - Your system meets all production requirements"
echo "   - You can proceed with production deployment"
echo "   - Monitor system performance in production"
echo ""
echo "⚠️  If MOSTLY READY:"
echo "   - Address the identified warnings"
echo "   - Re-run validation after fixes"
echo "   - Consider delaying launch until 90%+ readiness"
echo ""
echo "❌ If NOT READY FOR LAUNCH:"
echo "   - Resolve all critical failures first"
echo "   - Address performance and security issues"
echo "   - Re-run validation after fixes"
echo "   - Do not launch until all critical issues are resolved"

echo ""
echo -e "${CYAN}Additional Commands${NC}"
echo "----------------------"
echo "npm run test:production -- --headed    # Run tests with visible browser"
echo "npm run test:production -- --ui        # Run tests with Playwright UI"
echo "npm run test:production -- --debug     # Run tests in debug mode"
echo "npm run test:readiness                 # Re-run readiness assessment"
echo "npm run test:coverage                  # Check test coverage"
echo "npm run test:performance               # Run performance tests only"

echo ""
echo -e "${GREEN}🎉 Production validation complete!${NC}"
echo ""
echo "For detailed documentation, see:"
echo "  📖 tests/e2e/PRODUCTION_VALIDATION_README.md"
echo "  📖 tests/e2e/README.md"
echo "  📖 tests/README.md"
