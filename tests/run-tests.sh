#!/bin/bash

# DocCraft-AI Test Suite Runner Script
# This script provides easy access to run different test suites

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to install dependencies if needed
install_dependencies() {
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install
        print_success "Dependencies installed"
    else
        print_status "Dependencies already installed"
    fi
}

# Function to run comprehensive test suite
run_comprehensive_tests() {
    print_status "Running comprehensive test suite..."
    
    if command_exists tsx; then
        npx tsx tests/run-comprehensive-test-suite.ts
    else
        print_warning "tsx not found, installing..."
        npm install -g tsx
        npx tsx tests/run-comprehensive-test-suite.ts
    fi
    
    print_success "Comprehensive test suite completed"
}

# Function to run specific test category
run_test_category() {
    local category=$1
    local script_name=""
    
    case $category in
        "integration")
            script_name="test:integration"
            ;;
        "performance")
            script_name="test:performance"
            ;;
        "quality")
            script_name="test:quality"
            ;;
        "unit")
            script_name="test:unit"
            ;;
        "e2e")
            script_name="test:e2e"
            ;;
        *)
            print_error "Unknown test category: $category"
            print_status "Available categories: integration, performance, quality, unit, e2e"
            exit 1
            ;;
    esac
    
    print_status "Running $category tests..."
    npm run $script_name
    print_success "$category tests completed"
}

# Function to run tests with coverage
run_tests_with_coverage() {
    print_status "Running tests with coverage..."
    npm run test:coverage
    print_success "Coverage report generated"
}

# Function to show help
show_help() {
    echo "DocCraft-AI Test Suite Runner"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  comprehensive, enterprise    Run complete test suite (recommended)"
    echo "  integration                 Run integration tests only"
    echo "  performance                 Run performance benchmarks only"
    echo "  quality                     Run quality assurance audit only"
    echo "  unit                        Run unit tests only"
    echo "  e2e                         Run end-to-end tests only"
    echo "  coverage                    Run tests with coverage reporting"
    echo "  help, -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 comprehensive            # Run all tests"
    echo "  $0 integration              # Run integration tests only"
    echo "  $0 performance              # Run performance tests only"
    echo "  $0 coverage                 # Run tests with coverage"
    echo ""
    echo "For more information, see tests/README.md"
}

# Main script logic
main() {
    local action=${1:-comprehensive}
    
    case $action in
        "comprehensive"|"enterprise")
            check_prerequisites
            install_dependencies
            run_comprehensive_tests
            ;;
        "integration"|"performance"|"quality"|"unit"|"e2e")
            check_prerequisites
            install_dependencies
            run_test_category $action
            ;;
        "coverage")
            check_prerequisites
            install_dependencies
            run_tests_with_coverage
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown action: $action"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
