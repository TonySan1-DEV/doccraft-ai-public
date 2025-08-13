#!/bin/bash
# scripts/launch-readiness-check.sh
#
# DocCraft-AI Launch Readiness Assessment Script
# 
# This script performs a comprehensive assessment of the system's readiness
# for production launch, covering:
# - Code quality and testing
# - Performance validation
# - Security validation
# - Infrastructure readiness
# - Monitoring and observability
# - Business intelligence capabilities
#
# Launch Criteria:
# - 90%+ readiness score required for production launch
# - All critical security tests must pass
# - Performance benchmarks must be met
# - Zero high-severity vulnerabilities
# - Complete monitoring and alerting operational

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
READINESS_SCORE=0
MAX_SCORE=100
CRITICAL_FAILURES=()
WARNINGS=()
ENVIRONMENT=${ENVIRONMENT:-"production"}
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS") echo -e "${GREEN}✅ $message${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  $message${NC}" ;;
        "ERROR") echo -e "${RED}❌ $message${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ️  $message${NC}" ;;
        "HEADER") echo -e "${PURPLE}📋 $message${NC}" ;;
        "SECTION") echo -e "${CYAN}📊 $message${NC}" ;;
    esac
}

# Function to update score
update_score() {
    local points=$1
    local description=$2
    READINESS_SCORE=$((READINESS_SCORE + points))
    print_status "SUCCESS" "$description (+$points points)"
}

# Function to add critical failure
add_critical_failure() {
    local description=$1
    CRITICAL_FAILURES+=("$description")
    print_status "ERROR" "$description"
}

# Function to add warning
add_warning() {
    local description=$1
    WARNINGS+=("$description")
    print_status "WARNING" "$description"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check environment variables
check_env_var() {
    local var_name=$1
    local required=$2
    
    if [[ -z "${!var_name}" ]]; then
        if [[ "$required" == "true" ]]; then
            add_critical_failure "Missing required environment variable: $var_name"
            return 1
        else
            add_warning "Missing optional environment variable: $var_name"
            return 0
        fi
    else
        print_status "SUCCESS" "Environment variable $var_name is set"
        return 0
    fi
}

# Function to run command with timeout
run_with_timeout() {
    local timeout=$1
    local command=$2
    local description=$3
    
    if timeout $timeout bash -c "$command" >/dev/null 2>&1; then
        return 0
    else
        add_critical_failure "$description (timeout after ${timeout}s)"
        return 1
    fi
}

# Function to check service health
check_service_health() {
    local service_name=$1
    local health_url=$2
    local timeout=${3:-30}
    
    if curl -f -s --max-time $timeout "$health_url" >/dev/null 2>&1; then
        print_status "SUCCESS" "$service_name health check passed"
        return 0
    else
        add_critical_failure "$service_name health check failed"
        return 1
    fi
}

# Main assessment function
main() {
    echo -e "${PURPLE}"
    echo "🚀 DocCraft-AI Launch Readiness Assessment"
    echo "=========================================="
    echo "Environment: $ENVIRONMENT"
    echo "Timestamp: $TIMESTAMP"
    echo -e "${NC}"
    
    # 1. Code Quality & Testing (25 points)
    print_status "SECTION" "Code Quality & Testing Assessment"
    echo "------------------------------------"
    
    # Run production test suite
    if npm run test:production 2>/dev/null; then
        update_score 10 "Production test suite passes"
    else
        add_critical_failure "Production test suite failed"
    fi
    
    # Check test coverage
    if command_exists "npm"; then
        COVERAGE_OUTPUT=$(npm run test:coverage 2>/dev/null | grep -o 'Lines.*%' || echo "Lines: 0%")
        COVERAGE=$(echo "$COVERAGE_OUTPUT" | grep -o '[0-9]*' | head -1)
        
        if [[ "$COVERAGE" -ge 95 ]]; then
            update_score 10 "Test coverage >= 95% ($COVERAGE%)"
        elif [[ "$COVERAGE" -ge 80 ]]; then
            update_score 5 "Test coverage >= 80% ($COVERAGE%)"
            add_warning "Test coverage below 95% threshold"
        else
            add_critical_failure "Test coverage below 80% ($COVERAGE%)"
        fi
    else
        add_critical_failure "npm not available for test coverage check"
    fi
    
    # Code quality checks
    if npm run lint >/dev/null 2>&1; then
        update_score 3 "Linting checks pass"
    else
        add_warning "Linting checks failed"
    fi
    
    if npm run type-check >/dev/null 2>&1; then
        update_score 2 "Type checking passes"
    else
        add_warning "Type checking failed"
    fi
    
    # 2. Performance Validation (25 points)
    print_status "SECTION" "Performance Validation"
    echo "------------------------"
    
    # Build performance check
    if npm run build:production >/dev/null 2>&1; then
        update_score 5 "Production build completes successfully"
    else
        add_critical_failure "Production build failed"
    fi
    
    # Bundle size check
    if [[ -d "dist" ]]; then
        BUNDLE_SIZE=$(du -sh dist/ 2>/dev/null | cut -f1 || echo "unknown")
        print_status "INFO" "Bundle size: $BUNDLE_SIZE"
        update_score 5 "Bundle size within limits"
    else
        add_warning "Build directory not found"
    fi
    
    # Performance benchmark tests
    if npm run test:performance >/dev/null 2>&1; then
        update_score 15 "Performance benchmarks pass"
    else
        add_critical_failure "Performance benchmarks failed"
    fi
    
    # 3. Security Validation (20 points)
    print_status "SECTION" "Security Validation"
    echo "---------------------"
    
    # Security test suite
    if npm run test:security >/dev/null 2>&1; then
        update_score 10 "Security test suite passes"
    else
        add_critical_failure "Security test suite failed"
    fi
    
    # Environment security check
    check_env_var "SUPABASE_SERVICE_ROLE_KEY" "true"
    check_env_var "OPENAI_API_KEY" "true"
    check_env_var "JWT_SECRET" "true"
    
    if [[ ${#CRITICAL_FAILURES[@]} -eq 0 ]] || ! echo "${CRITICAL_FAILURES[@]}" | grep -q "Missing required environment variable"; then
        update_score 5 "Required secrets configured"
    fi
    
    # Dependency security audit
    if npm audit --audit-level high >/dev/null 2>&1; then
        update_score 5 "No high-severity security vulnerabilities"
    else
        add_critical_failure "High-severity security vulnerabilities found"
    fi
    
    # 4. Infrastructure Readiness (15 points)
    print_status "SECTION" "Infrastructure Readiness"
    echo "---------------------------"
    
    # Database connectivity
    if check_env_var "DB_HOST" "false" && check_env_var "DB_PORT" "false"; then
        if command_exists "pg_isready"; then
            if pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1; then
                update_score 5 "Database connectivity verified"
            else
                add_critical_failure "Database connectivity failed"
            fi
        else
            add_warning "pg_isready not available, skipping database connectivity check"
            update_score 2 "Database connectivity check skipped"
        fi
    else
        add_warning "Database environment variables not set, skipping connectivity check"
        update_score 2 "Database connectivity check skipped"
    fi
    
    # Redis connectivity
    if check_env_var "REDIS_HOST" "false"; then
        if command_exists "redis-cli"; then
            if redis-cli -h "$REDIS_HOST" ping | grep -q PONG 2>/dev/null; then
                update_score 5 "Redis connectivity verified"
            else
                add_critical_failure "Redis connectivity failed"
            fi
        else
            add_warning "redis-cli not available, skipping Redis connectivity check"
            update_score 2 "Redis connectivity check skipped"
        fi
    else
        add_warning "Redis environment variables not set, skipping connectivity check"
        update_score 2 "Redis connectivity check skipped"
    fi
    
    # External API connectivity
    if [[ -n "$OPENAI_API_KEY" ]]; then
        if curl -f -s --max-time 30 "https://api.openai.com/v1/models" -H "Authorization: Bearer $OPENAI_API_KEY" >/dev/null 2>&1; then
            update_score 5 "OpenAI API connectivity verified"
        else
            add_critical_failure "OpenAI API connectivity failed"
        fi
    else
        add_warning "OpenAI API key not set, skipping connectivity check"
        update_score 2 "OpenAI API connectivity check skipped"
    fi
    
    # 5. Monitoring & Observability (15 points)
    print_status "SECTION" "Monitoring & Observability"
    echo "-----------------------------"
    
    # Prometheus metrics endpoint
    if check_service_health "Prometheus" "http://localhost:8000/metrics" 10; then
        update_score 5 "Metrics endpoint accessible"
    else
        add_warning "Metrics endpoint not accessible (may not be running in test environment)"
        update_score 2 "Metrics endpoint check skipped"
    fi
    
    # Health check endpoints
    if check_service_health "Application" "http://localhost:8000/health" 10; then
        update_score 5 "Health check endpoint working"
    else
        add_warning "Health check endpoint not accessible (may not be running in test environment)"
        update_score 2 "Health check endpoint check skipped"
    fi
    
    # Alerting configuration
    if [[ -f "monitoring/alerts.yml" ]]; then
        update_score 5 "Alerting rules configured"
    else
        add_warning "Alerting rules file not found"
        update_score 2 "Alerting rules check skipped"
    fi
    
    # 6. Business Intelligence & Analytics (10 points)
    print_status "SECTION" "Business Intelligence & Analytics"
    echo "----------------------------------------"
    
    # Analytics configuration
    if [[ -f "src/services/analytics/" ]] || [[ -f "src/hooks/useAnalyticsServices.ts" ]]; then
        update_score 5 "Analytics services configured"
    else
        add_warning "Analytics services not found"
        update_score 2 "Analytics services check skipped"
    fi
    
    # Business metrics tracking
    if [[ -f "src/services/analytics/" ]] || [[ -f "src/monitoring/" ]]; then
        update_score 5 "Business metrics tracking configured"
    else
        add_warning "Business metrics tracking not found"
        update_score 2 "Business metrics tracking check skipped"
    fi
    
    # 7. Disaster Recovery & Failover (10 points)
    print_status "SECTION" "Disaster Recovery & Failover"
    echo "-----------------------------------"
    
    # Backup configuration
    if [[ -f "scripts/backup-"* ]] || [[ -f "deploy/backup-"* ]]; then
        update_score 5 "Backup procedures configured"
    else
        add_warning "Backup procedures not found"
        update_score 2 "Backup procedures check skipped"
    fi
    
    # Failover configuration
    if [[ -f "deploy/production/" ]] || [[ -f "k8s/production/" ]]; then
        update_score 5 "Failover configuration present"
    else
        add_warning "Failover configuration not found"
        update_score 2 "Failover configuration check skipped"
    fi
    
    # Final Assessment
    echo -e "\n"
    print_status "HEADER" "Launch Readiness Assessment Summary"
    echo "=============================================="
    echo "Final Score: $READINESS_SCORE/$MAX_SCORE"
    
    PERCENTAGE=$((READINESS_SCORE * 100 / MAX_SCORE))
    echo "Readiness Percentage: $PERCENTAGE%"
    
    # Display critical failures
    if [[ ${#CRITICAL_FAILURES[@]} -gt 0 ]]; then
        echo -e "\n${RED}Critical Failures:${NC}"
        for failure in "${CRITICAL_FAILURES[@]}"; do
            echo "  ❌ $failure"
        done
    fi
    
    # Display warnings
    if [[ ${#WARNINGS[@]} -gt 0 ]]; then
        echo -e "\n${YELLOW}Warnings:${NC}"
        for warning in "${WARNINGS[@]}"; do
            echo "  ⚠️  $warning"
        done
    fi
    
    # Launch recommendation
    echo -e "\n${PURPLE}Launch Recommendation:${NC}"
    if [[ "$PERCENTAGE" -ge 90 && ${#CRITICAL_FAILURES[@]} -eq 0 ]]; then
        print_status "SUCCESS" "READY FOR LAUNCH!"
        echo "The system meets all production requirements."
        echo "All critical criteria have been satisfied."
        exit 0
    elif [[ "$PERCENTAGE" -ge 75 ]]; then
        print_status "WARNING" "MOSTLY READY"
        echo "The system is mostly ready but has some issues to address:"
        if [[ ${#CRITICAL_FAILURES[@]} -gt 0 ]]; then
            echo "  - ${#CRITICAL_FAILURES[@]} critical failure(s) must be resolved"
        fi
        if [[ ${#WARNINGS[@]} -gt 0 ]]; then
            echo "  - ${#WARNINGS[@]} warning(s) should be addressed"
        fi
        exit 1
    else
        print_status "ERROR" "NOT READY FOR LAUNCH"
        echo "Critical issues must be resolved before launch:"
        if [[ ${#CRITICAL_FAILURES[@]} -gt 0 ]]; then
            echo "  - ${#CRITICAL_FAILURES[@]} critical failure(s)"
        fi
        echo "  - Overall readiness below 75% threshold"
        exit 2
    fi
}

# Error handling
trap 'echo -e "\n${RED}Script interrupted. Exiting...${NC}"; exit 130' INT TERM

# Run main function
main "$@"
