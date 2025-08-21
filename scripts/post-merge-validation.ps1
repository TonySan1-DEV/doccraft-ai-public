# DocCraft-AI Post-Merge Validation Script (PowerShell)
# This script validates the post-merge state of feature flags and endpoints

param(
    [string]$ServerUrl = "http://localhost:8000",
    [string]$FrontendUrl = "http://localhost:5174"
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🔍 DocCraft-AI Post-Merge Validation" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Test counter
$TestsPassed = 0
$TestsFailed = 0

# Helper function to run tests
function Test-Endpoint {
    param(
        [string]$TestName,
        [string]$Url,
        [int]$ExpectedStatus,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = ""
    )
    
    Write-Host "Testing: $TestName... " -NoNewline
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        $statusCode = $response.StatusCode
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "✓ PASS ($statusCode)" -ForegroundColor Green
            $script:TestsPassed++
        } else {
            Write-Host "✗ FAIL (expected $ExpectedStatus, got $statusCode)" -ForegroundColor Red
            $script:TestsFailed++
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "✓ PASS ($statusCode)" -ForegroundColor Green
            $script:TestsPassed++
        } else {
            Write-Host "✗ FAIL (expected $ExpectedStatus, got $statusCode)" -ForegroundColor Red
            $script:TestsFailed++
        }
    }
}

Write-Host ""
Write-Host "📋 Phase 1: Environment Validation" -ForegroundColor Yellow
Write-Host "----------------------------------" -ForegroundColor Yellow

# Check if server is running
try {
    $healthResponse = Invoke-RestMethod -Uri "$ServerUrl/health" -Method GET -ErrorAction Stop
    Write-Host "✓ Server is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Server is not running at $ServerUrl" -ForegroundColor Red
    Write-Host "Please start the server first: npm run dev:server" -ForegroundColor Yellow
    exit 1
}

# Check environment variables
Write-Host ""
Write-Host "🔧 Checking environment variables..." -ForegroundColor Yellow

if ($env:FEATURE_AUDIOBOOK -eq "true") {
    Write-Host "⚠ FEATURE_AUDIOBOOK is enabled" -ForegroundColor Yellow
} else {
    Write-Host "✓ FEATURE_AUDIOBOOK is disabled (default)" -ForegroundColor Green
}

if ($env:FEATURE_AGENTICS -eq "true") {
    Write-Host "⚠ FEATURE_AGENTICS is enabled" -ForegroundColor Yellow
} else {
    Write-Host "✓ FEATURE_AGENTICS is disabled (default)" -ForegroundColor Green
}

if ($env:OPENAI_API_KEY) {
    Write-Host "⚠ OPENAI_API_KEY is set" -ForegroundColor Yellow
} else {
    Write-Host "✓ OPENAI_API_KEY is unset (default)" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Phase 2: Negative Path Testing (Flags OFF)" -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Yellow

# Test audio endpoint when disabled (should 404)
Test-Endpoint -TestName "Audio export when FEATURE_AUDIOBOOK=false" `
    -Url "$ServerUrl/api/export/audio" `
    -ExpectedStatus 404 `
    -Method "POST" `
    -Headers @{
        "Content-Type" = "application/json"
        "x-user-id" = "u1"
    } `
    -Body '{"text":"hello"}'

# Test agentics stream when disabled (should 404)
Test-Endpoint -TestName "Agentics stream when FEATURE_AGENTICS=false" `
    -Url "$ServerUrl/api/agentics/status/NOPE/stream" `
    -ExpectedStatus 404 `
    -Method "GET" `
    -Headers @{
        "x-user-id" = "u1"
    }

Write-Host ""
Write-Host "📋 Phase 3: Feature Testing (Flags ON)" -ForegroundColor Yellow
Write-Host "---------------------------------------" -ForegroundColor Yellow

# Test audiobook when enabled
if ($env:FEATURE_AUDIOBOOK -eq "true" -and $env:OPENAI_API_KEY) {
    Write-Host "Testing audiobook happy path..." -ForegroundColor Yellow
    Test-Endpoint -TestName "Audio export when FEATURE_AUDIOBOOK=true" `
        -Url "$ServerUrl/api/export/audio" `
        -ExpectedStatus 200 `
        -Method "POST" `
        -Headers @{
            "Content-Type" = "application/json"
            "x-user-id" = "alice"
        } `
        -Body '{"text":"Hello from DocCraft","provider":"openai","format":"mp3","voice":"narrator_f"}'
} else {
    Write-Host "⚠ Skipping audiobook tests (FEATURE_AUDIOBOOK=false or OPENAI_API_KEY unset)" -ForegroundColor Yellow
}

# Test agentics when enabled
if ($env:FEATURE_AGENTICS -eq "true") {
    Write-Host "Testing agentics SSE..." -ForegroundColor Yellow
    Test-Endpoint -TestName "Agentics stream when FEATURE_AGENTICS=true" `
        -Url "$ServerUrl/api/agentics/status/test-run/stream" `
        -ExpectedStatus 200 `
        -Method "GET" `
        -Headers @{
            "x-user-id" = "test-user"
        }
} else {
    Write-Host "⚠ Skipping agentics tests (FEATURE_AGENTICS=false)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Phase 4: Frontend Flag Validation" -ForegroundColor Yellow
Write-Host "------------------------------------" -ForegroundColor Yellow

# Check if frontend is running
try {
    $frontendResponse = Invoke-RestMethod -Uri $FrontendUrl -Method GET -ErrorAction Stop
    Write-Host "✓ Frontend is running" -ForegroundColor Green
    
    # Check if feature flags are properly loaded
    if ($frontendResponse -match "VITE_FEATURE_AUDIOBOOK") {
        Write-Host "✓ Frontend feature flags are loaded" -ForegroundColor Green
    } else {
        Write-Host "⚠ Frontend feature flags may not be loaded" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Frontend is not running at $FrontendUrl" -ForegroundColor Yellow
    Write-Host "To test frontend flags, start the frontend: npm run dev" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📊 Test Results Summary" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host "Tests Passed: $TestsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $TestsFailed" -ForegroundColor Red
Write-Host "Total Tests: $($TestsPassed + $TestsFailed)" -ForegroundColor White

if ($TestsFailed -eq 0) {
    Write-Host ""
    Write-Host "🎉 All tests passed! Post-merge validation successful." -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "❌ Some tests failed. Please review the issues above." -ForegroundColor Red
    exit 1
}
