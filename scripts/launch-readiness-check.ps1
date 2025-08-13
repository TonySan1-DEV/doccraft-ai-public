# DocCraft-AI Launch Readiness Assessment Script
# PowerShell Version for Windows

# Global variables
$script:ReadinessScore = 0
$script:CriticalFailures = @()
$script:Warnings = @()
$script:TotalPoints = 100

# Function to write colored status messages
function Write-Status {
    param(
        [string]$Type,
        [string]$Message
    )
    
    switch ($Type) {
        "SUCCESS" { Write-Host "SUCCESS: $Message" -ForegroundColor Green }
        "ERROR" { Write-Host "ERROR: $Message" -ForegroundColor Red }
        "WARNING" { Write-Host "WARNING: $Message" -ForegroundColor Yellow }
        "INFO" { Write-Host "INFO: $Message" -ForegroundColor Cyan }
        "SECTION" { Write-Host "SECTION: $Message" -ForegroundColor Magenta }
        default { Write-Host "INFO: $Message" -ForegroundColor White }
    }
}

# Function to update score
function Update-Score {
    param(
        [int]$Points,
        [string]$Description
    )
    
    $script:ReadinessScore += $Points
    $message = $Description + " plus " + $Points + " points"
    Write-Status "SUCCESS" $message
}

# Function to add critical failure
function Add-CriticalFailure {
    param([string]$Description)
    
    $script:CriticalFailures += $Description
    Write-Status "ERROR" $Description
}

# Function to add warning
function Add-Warning {
    param([string]$Description)
    
    $script:Warnings += $Description
    Write-Status "WARNING" $Description
}

# Function to check if command exists
function Test-Command {
    param([string]$Command)
    
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to check environment variables
function Test-EnvironmentVariable {
    param(
        [string]$VarName,
        [bool]$Required = $false
    )
    
    $value = [Environment]::GetEnvironmentVariable($VarName)
    
    if ([string]::IsNullOrEmpty($value)) {
        if ($Required) {
            Add-CriticalFailure "Missing required environment variable: $VarName"
            return $false
        }
        else {
            Add-Warning "Missing optional environment variable: $VarName"
            return $false
        }
    }
    else {
        Write-Status "SUCCESS" "Environment variable $VarName is set"
        return $true
    }
}

# Function to check file existence
function Test-FileExists {
    param(
        [string]$FilePath,
        [string]$Description,
        [int]$Points = 0
    )
    
    if (Test-Path $FilePath) {
        if ($Points -gt 0) {
            Update-Score $Points $Description
        }
        return $true
    }
    else {
        Add-CriticalFailure "$Description - File not found at $FilePath"
        return $false
    }
}

# Function to check directory existence
function Test-DirectoryExists {
    param(
        [string]$DirectoryPath,
        [string]$Description,
        [int]$Points = 0
    )
    
    if (Test-Path $DirectoryPath -PathType Container) {
        if ($Points -gt 0) {
            Update-Score $Points $Description
        }
        return $true
    }
    else {
        Add-CriticalFailure "$Description - Directory not found at $DirectoryPath"
        return $false
    }
}

# Function to run npm command
function Invoke-NpmCommand {
    param(
        [string]$Command,
        [string]$Description,
        [int]$Points = 0
    )
    
    try {
        $result = npm run $Command 2>&1
        if ($LASTEXITCODE -eq 0) {
            if ($Points -gt 0) {
                Update-Score $Points $Description
            }
            return $true
        }
        else {
            Add-CriticalFailure "$Description failed"
            return $false
        }
    }
    catch {
        Add-CriticalFailure "$Description failed: $($_.Exception.Message)"
        return $false
    }
}

# Main assessment function
function Start-LaunchReadinessAssessment {
    Write-Host "DocCraft-AI Launch Readiness Assessment" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    
    # 1. Code Quality & Testing (25 points)
    Write-Status "SECTION" "Code Quality and Testing Assessment"
    if (Invoke-NpmCommand "test:production" "Production test suite passes" 10) {
        Write-Status "SUCCESS" "Production test suite executed successfully"
    }
    
    if (Invoke-NpmCommand "test:unit" "Unit tests pass" 5) {
        Write-Status "SUCCESS" "Unit tests executed successfully"
    }
    
    if (Invoke-NpmCommand "test:e2e" "E2E tests pass" 5) {
        Write-Status "SUCCESS" "E2E tests executed successfully"
    }
    
    # Check test coverage
    try {
        $coverageResult = npm run test:coverage 2>&1
        if ($LASTEXITCODE -eq 0) {
            if ($coverageResult -match "(\d+)%") {
                $coverage = $matches[1]
                if ([int]$coverage -ge 95) {
                    $msg = "Test coverage >= 95 percent - " + $coverage + " percent"
                    Update-Score 5 $msg
                }
                elseif ([int]$coverage -ge 80) {
                    $msg = "Test coverage >= 80 percent - " + $coverage + " percent"
                    Update-Score 3 $msg
                }
                else {
                    $msg = "Test coverage below 80 percent - " + $coverage + " percent"
                    Add-Warning $msg
                }
            }
        }
    }
    catch {
        Add-Warning "Could not determine test coverage"
    }
    
    Write-Host ""
    
    # 2. Security & Compliance (25 points)
    Write-Status "SECTION" "Security and Compliance Assessment"
    
    # Check security tests
    if (Invoke-NpmCommand "test:security" "Security tests pass" 10) {
        Write-Status "SUCCESS" "Security tests executed successfully"
    }
    
    # Check for security vulnerabilities
    try {
        $auditResult = npm audit --audit-level=high 2>&1
        if ($LASTEXITCODE -eq 0) {
            Update-Score 10 "No high-severity security vulnerabilities found"
        }
        else {
            Add-CriticalFailure "High-severity security vulnerabilities detected"
        }
    }
    catch {
        Add-Warning "Could not run security audit"
    }
    
    # Check environment security
    Test-EnvironmentVariable "SUPABASE_URL" $true
    Test-EnvironmentVariable "SUPABASE_ANON_KEY" $true
    Test-EnvironmentVariable "OPENAI_API_KEY" $true
    
    # Check for sensitive files
    if (-not (Test-Path ".env")) {
        Update-Score 5 "No .env file in repository (good security practice)"
    }
    else {
        Add-Warning ".env file found in repository (security risk)"
    }
    
    Write-Host ""
    
    # 3. Performance & Scalability (20 points)
    Write-Status "SECTION" "Performance and Scalability Assessment"
    
    # Check performance tests
    if (Invoke-NpmCommand "test:load" "Load tests pass" 10) {
        Write-Status "SUCCESS" "Load tests executed successfully"
    }
    
    # Check build performance
    if (Invoke-NpmCommand "build" "Production build successful" 5) {
        Write-Status "SUCCESS" "Production build completed"
    }
    
    # Check bundle analysis
    if (Test-Command "npx") {
        try {
            $bundleResult = npx vite-bundle-analyzer --version 2>$null
            if ($LASTEXITCODE -eq 0) {
                Update-Score 5 "Bundle analyzer available for performance optimization"
            }
        }
        catch {
            Add-Warning "Bundle analyzer not available"
        }
    }
    
    Write-Host ""
    
    # 4. Infrastructure & Deployment (15 points)
    Write-Status "SECTION" "Infrastructure and Deployment Assessment"
    
    # Check Docker
    if (Test-Command "docker") {
        Update-Score 5 "Docker available for containerization"
        try {
            $dockerVersion = docker --version
            Write-Status "INFO" "Docker version: $dockerVersion"
        }
        catch {
            Add-Warning "Could not get Docker version"
        }
    }
    else {
        Add-Warning "Docker not available"
    }
    
    # Check deployment scripts
    Test-FileExists "deploy/production/docker-compose.yml" "Production Docker Compose file exists" 5
    Test-FileExists "deploy/production/Dockerfile.production" "Production Dockerfile exists" 5
    
    Write-Host ""
    
    # 5. Monitoring & Observability (10 points)
    Write-Status "SECTION" "Monitoring and Observability Assessment"
    
    # Check monitoring configuration
    Test-DirectoryExists "monitoring" "Monitoring directory exists" 3
    Test-FileExists "monitoring/prometheus.yml" "Prometheus configuration exists" 3
    Test-DirectoryExists "monitoring/grafana/dashboards" "Grafana dashboards exist" 2
    Test-FileExists "monitoring/alerts.yml" "Alerting configuration exists" 2
    
    Write-Host ""
    
    # 6. Business Intelligence & Analytics (5 points)
    Write-Status "SECTION" "Business Intelligence Assessment"
    
    # Check analytics services
    Test-DirectoryExists "src/services/analytics" "Analytics services exist" 3
    Test-FileExists "src/hooks/useAnalyticsServices.ts" "Analytics hooks exist" 2
    
    Write-Host ""
    
    # 7. Disaster Recovery & Failover (5 points)
    Write-Status "SECTION" "Disaster Recovery Assessment"
    
    # Check backup and recovery
    Test-DirectoryExists "supabase/migrations" "Database migrations exist" 3
    Test-FileExists "scripts/apply-schema-step-by-step.cjs" "Database recovery scripts exist" 2
    
    Write-Host ""
    
    # Generate final report
    Write-Status "SECTION" "Final Assessment Report"
    Write-Host "=====================================" -ForegroundColor Cyan
    
    $percentage = [math]::Round(($script:ReadinessScore / $script:TotalPoints) * 100, 1)
    
    if ($percentage -ge 90) {
        $msg = "LAUNCH READY! Overall Score: " + $percentage + " percent (" + $script:ReadinessScore + "/" + $script:TotalPoints + ")"
        Write-Status "SUCCESS" $msg
    }
    elseif ($percentage -ge 75) {
        $msg = "NEARLY READY. Overall Score: " + $percentage + " percent (" + $script:ReadinessScore + "/" + $script:TotalPoints + ")"
        Write-Status "WARNING" $msg
    }
    else {
        $msg = "NOT READY FOR LAUNCH. Overall Score: " + $percentage + " percent (" + $script:ReadinessScore + "/" + $script:TotalPoints + ")"
        Write-Status "ERROR" $msg
    }
    
    Write-Host ""
    
    if ($script:CriticalFailures.Count -gt 0) {
        Write-Status "ERROR" "Critical Failures ($($script:CriticalFailures.Count)):"
        foreach ($failure in $script:CriticalFailures) {
            Write-Host "  ERROR: $failure" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($script:Warnings.Count -gt 0) {
        Write-Status "WARNING" "Warnings ($($script:Warnings.Count)):"
        foreach ($warning in $script:Warnings) {
            Write-Host "  WARNING: $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    # Launch criteria check
    Write-Status "SECTION" "Launch Criteria Assessment"
    $launchReady = $true
    $launchCriteria = @()
    
    if ($percentage -lt 90) {
        $launchReady = $false
        $launchCriteria += "Readiness score below 90 percent"
    }
    
    if ($script:CriticalFailures.Count -gt 0) {
        $launchReady = $false
        $launchCriteria += "Critical failures present"
    }
    
    if ($launchReady) {
        Write-Status "SUCCESS" "ALL LAUNCH CRITERIA MET - SYSTEM IS READY FOR PRODUCTION LAUNCH!"
    }
    else {
        Write-Status "ERROR" "LAUNCH CRITERIA NOT MET:"
        foreach ($criterion in $launchCriteria) {
            Write-Host "  ERROR: $criterion" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Status "INFO" "Assessment completed at $(Get-Date)"
    Write-Status "INFO" "Run 'npm run quick-start:validation:windows' for interactive setup"
}

# Run the assessment
Start-LaunchReadinessAssessment
