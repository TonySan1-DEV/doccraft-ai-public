# DocCraft-AI Test Suite Runner Script (PowerShell)
# This script provides easy access to run different test suites

param(
    [Parameter(Position=0)]
    [string]$Action = "comprehensive"
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check if command exists
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    if (-not (Test-Command "node")) {
        Write-Error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    }
    
    if (-not (Test-Command "npm")) {
        Write-Error "npm is not installed. Please install npm first."
        exit 1
    }
    
    if (-not (Test-Path "package.json")) {
        Write-Error "package.json not found. Please run this script from the project root."
        exit 1
    }
    
    Write-Success "Prerequisites check passed"
}

# Function to install dependencies if needed
function Install-Dependencies {
    if (-not (Test-Path "node_modules")) {
        Write-Status "Installing dependencies..."
        npm install
        Write-Success "Dependencies installed"
    } else {
        Write-Status "Dependencies already installed"
    }
}

# Function to run comprehensive test suite
function Run-ComprehensiveTests {
    Write-Status "Running comprehensive test suite..."
    
    if (Test-Command "tsx") {
        npx tsx tests/run-comprehensive-test-suite.ts
    } else {
        Write-Warning "tsx not found, installing..."
        npm install -g tsx
        npx tsx tests/run-comprehensive-test-suite.ts
    }
    
    Write-Success "Comprehensive test suite completed"
}

# Function to run specific test category
function Run-TestCategory {
    param([string]$Category)
    
    $scriptName = switch ($Category) {
        "integration" { "test:integration" }
        "performance" { "test:performance" }
        "quality" { "test:quality" }
        "unit" { "test:unit" }
        "e2e" { "test:e2e" }
        default { 
            Write-Error "Unknown test category: $Category"
            Write-Status "Available categories: integration, performance, quality, unit, e2e"
            exit 1
        }
    }
    
    Write-Status "Running $Category tests..."
    npm run $scriptName
    Write-Success "$Category tests completed"
}

# Function to run tests with coverage
function Run-TestsWithCoverage {
    Write-Status "Running tests with coverage..."
    npm run test:coverage
    Write-Success "Coverage report generated"
}

# Function to show help
function Show-Help {
    Write-Host "DocCraft-AI Test Suite Runner" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\run-tests.ps1 [OPTION]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor White
    Write-Host "  comprehensive, enterprise    Run complete test suite (recommended)" -ForegroundColor Yellow
    Write-Host "  integration                 Run integration tests only" -ForegroundColor Yellow
    Write-Host "  performance                 Run performance benchmarks only" -ForegroundColor Yellow
    Write-Host "  quality                     Run quality assurance audit only" -ForegroundColor Yellow
    Write-Host "  unit                        Run unit tests only" -ForegroundColor Yellow
    Write-Host "  e2e                         Run end-to-end tests only" -ForegroundColor Yellow
    Write-Host "  coverage                    Run tests with coverage reporting" -ForegroundColor Yellow
    Write-Host "  help, -h, --help           Show this help message" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\run-tests.ps1 comprehensive            # Run all tests" -ForegroundColor Gray
    Write-Host "  .\run-tests.ps1 integration              # Run integration tests only" -ForegroundColor Gray
    Write-Host "  .\run-tests.ps1 performance              # Run performance tests only" -ForegroundColor Gray
    Write-Host "  .\run-tests.ps1 coverage                 # Run tests with coverage" -ForegroundColor Gray
    Write-Host ""
    Write-Host "For more information, see tests/README.md" -ForegroundColor Gray
}

# Main script logic
function Main {
    param([string]$Action)
    
    switch ($Action) {
        { $_ -in @("comprehensive", "enterprise") } {
            Test-Prerequisites
            Install-Dependencies
            Run-ComprehensiveTests
        }
        { $_ -in @("integration", "performance", "quality", "unit", "e2e") } {
            Test-Prerequisites
            Install-Dependencies
            Run-TestCategory $Action
        }
        "coverage" {
            Test-Prerequisites
            Install-Dependencies
            Run-TestsWithCoverage
        }
        { $_ -in @("help", "-h", "--help") } {
            Show-Help
        }
        default {
            Write-Error "Unknown action: $Action"
            Show-Help
            exit 1
        }
    }
}

# Run main function
Main $Action
