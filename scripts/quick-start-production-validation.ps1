# scripts/quick-start-production-validation.ps1
#
# Quick Start Guide for DocCraft-AI Production Validation (PowerShell Version)
# 
# This script provides a step-by-step guide to running the production validation
# system and assessing launch readiness.

param(
    [switch]$SkipPrompts
)

# Error handling
$ErrorActionPreference = "Stop"

# Color codes for output
$Green = "Green"
$Blue = "Blue"
$Purple = "Magenta"
$Cyan = "Cyan"

Write-Host "🚀 DocCraft-AI Production Validation Quick Start" -ForegroundColor $Purple
Write-Host "===============================================" -ForegroundColor $Purple
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json") -or -not (Test-Path "tests/e2e")) {
    Write-Host "❌ Error: Please run this script from the DocCraft-AI project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Environment Setup" -ForegroundColor $Blue
Write-Host "----------------------------" -ForegroundColor $Blue

# Check if environment variables are set
Write-Host "Checking environment variables..."
$envVarsOk = $true

if ([string]::IsNullOrEmpty([Environment]::GetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY"))) {
    Write-Host "⚠️  SUPABASE_SERVICE_ROLE_KEY not set" -ForegroundColor Yellow
    Write-Host "   Please set this environment variable before proceeding" -ForegroundColor Yellow
    Write-Host "   `$env:SUPABASE_SERVICE_ROLE_KEY='your_key_here'" -ForegroundColor Yellow
    $envVarsOk = $false
} else {
    Write-Host "✅ SUPABASE_SERVICE_ROLE_KEY is set" -ForegroundColor Green
}

if ([string]::IsNullOrEmpty([Environment]::GetEnvironmentVariable("OPENAI_API_KEY"))) {
    Write-Host "⚠️  OPENAI_API_KEY not set" -ForegroundColor Yellow
    Write-Host "   Please set this environment variable before proceeding" -ForegroundColor Yellow
    Write-Host "   `$env:OPENAI_API_KEY='your_key_here'" -ForegroundColor Yellow
    $envVarsOk = $false
} else {
    Write-Host "✅ OPENAI_API_KEY is set" -ForegroundColor Green
}

if ([string]::IsNullOrEmpty([Environment]::GetEnvironmentVariable("JWT_SECRET"))) {
    Write-Host "⚠️  JWT_SECRET not set" -ForegroundColor Yellow
    Write-Host "   Please set this environment variable before proceeding" -ForegroundColor Yellow
    Write-Host "   `$env:JWT_SECRET='your_secret_here'" -ForegroundColor Yellow
    $envVarsOk = $false
} else {
    Write-Host "✅ JWT_SECRET is set" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Install Dependencies" -ForegroundColor $Blue
Write-Host "--------------------------------" -ForegroundColor $Blue

if (Get-Command "npm" -ErrorAction SilentlyContinue) {
    Write-Host "Installing npm dependencies..."
    npm install
    
    Write-Host "Installing Playwright browsers..."
    npx playwright install
} else {
    Write-Host "❌ Error: npm not found. Please install Node.js and npm first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Run Production Validation Tests" -ForegroundColor $Blue
Write-Host "--------------------------------------------" -ForegroundColor $Blue

if (-not $SkipPrompts) {
    Write-Host "Choose your validation approach:"
    Write-Host ""
    Write-Host "1. 🧪 Run complete production validation suite"
    Write-Host "2. 🔒 Run security validation only"
    Write-Host "3. ⚡ Run load testing only"
    Write-Host "4. 📊 Run launch readiness assessment only"
    Write-Host "5. 🚀 Run everything (full validation)"
    Write-Host ""
    
    $choice = Read-Host "Enter your choice (1-5)"
} else {
    $choice = "5"  # Default to running everything
}

switch ($choice) {
    "1" {
        Write-Host "Running complete production validation suite..." -ForegroundColor Green
        npm run test:production
    }
    "2" {
        Write-Host "Running security validation only..." -ForegroundColor Green
        npm run test:security
    }
    "3" {
        Write-Host "Running load testing only..." -ForegroundColor Green
        npm run test:load
    }
    "4" {
        Write-Host "Running launch readiness assessment..." -ForegroundColor Green
        npm run test:readiness:windows
    }
    "5" {
        Write-Host "Running complete validation (tests + readiness assessment)..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Step 3a: Running production validation tests..." -ForegroundColor $Blue
        npm run test:production
        
        Write-Host ""
        Write-Host "Step 3b: Running launch readiness assessment..." -ForegroundColor $Blue
        npm run test:readiness:windows
    }
    default {
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Step 4: Review Results" -ForegroundColor $Blue
Write-Host "---------------------------" -ForegroundColor $Blue

Write-Host "Test results are available in:"
Write-Host "  📁 HTML Report: playwright-report/index.html"
Write-Host "  📁 Test Results: test-results/"
Write-Host "  📊 Console Output: Above"

Write-Host ""
Write-Host "Step 5: Next Steps" -ForegroundColor $Blue
Write-Host "------------------------" -ForegroundColor $Blue

Write-Host "Based on your validation results:"
Write-Host ""
Write-Host "✅ If READY FOR LAUNCH:" -ForegroundColor Green
Write-Host "   - Your system meets all production requirements"
Write-Host "   - You can proceed with production deployment"
Write-Host "   - Monitor system performance in production"
Write-Host ""
Write-Host "⚠️  If MOSTLY READY:" -ForegroundColor Yellow
Write-Host "   - Address the identified warnings"
Write-Host "   - Re-run validation after fixes"
Write-Host "   - Consider delaying launch until 90%+ readiness"
Write-Host ""
Write-Host "❌ If NOT READY FOR LAUNCH:" -ForegroundColor Red
Write-Host "   - Resolve all critical failures first"
Write-Host "   - Address performance and security issues"
Write-Host "   - Re-run validation after fixes"
Write-Host "   - Do not launch until all critical issues are resolved"

Write-Host ""
Write-Host "Additional Commands" -ForegroundColor $Cyan
Write-Host "----------------------" -ForegroundColor $Cyan
Write-Host "npm run test:production -- --headed    # Run tests with visible browser"
Write-Host "npm run test:production -- --ui        # Run tests with Playwright UI"
Write-Host "npm run test:production -- --debug     # Run tests in debug mode"
Write-Host "npm run test:readiness:windows         # Re-run readiness assessment"
Write-Host "npm run test:coverage                  # Check test coverage"
Write-Host "npm run test:performance               # Run performance tests only"

Write-Host ""
Write-Host "🎉 Production validation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "For detailed documentation, see:"
Write-Host "  📖 tests/e2e/PRODUCTION_VALIDATION_README.md"
Write-Host "  📖 tests/e2e/README.md"
Write-Host "  📖 tests/README.md"
