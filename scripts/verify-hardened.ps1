# DocCraft AI Hardened Verification Script
# Runs the hardened verification tests with proper environment setup

Write-Host "🔒 DocCraft AI Hardened Verification Starting..." -ForegroundColor Green

# Set environment variables for testing
$env:PORT = "8000"
$env:NODE_ENV = "test"

# Check if required dependencies are available
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
try {
    $concurrently = Get-Command concurrently -ErrorAction Stop
    Write-Host "✅ concurrently available" -ForegroundColor Green
} catch {
    Write-Host "❌ concurrently not found. Install with: npm install -g concurrently" -ForegroundColor Red
    exit 1
}

try {
    $waitOn = Get-Command wait-on -ErrorAction Stop
    Write-Host "✅ wait-on available" -ForegroundColor Green
} catch {
    Write-Host "❌ wait-on not found. Install with: npm install -g wait-on" -ForegroundColor Red
    exit 1
}

# Run the hardened verification
Write-Host "🚀 Starting hardened verification..." -ForegroundColor Green
Write-Host "   This will start the server on port 8000 and run guardrail tests" -ForegroundColor Cyan

npm run verify:hardened

# Check exit code
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Hardened verification completed successfully!" -ForegroundColor Green
    Write-Host "   All security guardrails are working correctly" -ForegroundColor Cyan
} else {
    Write-Host "❌ Hardened verification failed!" -ForegroundColor Red
    Write-Host "   Check the test output above for details" -ForegroundColor Yellow
    exit $LASTEXITCODE
}

Write-Host "🔒 Hardened verification complete!" -ForegroundColor Green
