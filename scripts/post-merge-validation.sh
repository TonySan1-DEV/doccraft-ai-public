#!/bin/bash

# DocCraft-AI Post-Merge Validation Script
# This script validates the post-merge state of feature flags and endpoints

set -e

echo "🔍 DocCraft-AI Post-Merge Validation"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:5174"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to run tests
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_status="$3"
    
    echo -n "Testing: $test_name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((TESTS_FAILED++))
    fi
}

# Helper function to check HTTP status
check_http_status() {
    local test_name="$1"
    local url="$2"
    local expected_status="$3"
    local method="${4:-GET}"
    local headers="${5:-}"
    local data="${6:-}"
    
    echo -n "Testing: $test_name... "
    
    local status_code
    if [ -n "$data" ]; then
        status_code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url" $headers -d "$data")
    else
        status_code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url" $headers)
    fi
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS (${status_code})${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL (expected ${expected_status}, got ${status_code})${NC}"
        ((TESTS_FAILED++))
    fi
}

echo ""
echo "📋 Phase 1: Environment Validation"
echo "----------------------------------"

# Check if server is running
if curl -s "$SERVER_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server is not running at $SERVER_URL${NC}"
    echo "Please start the server first: npm run dev:server"
    exit 1
fi

# Check environment variables
echo ""
echo "🔧 Checking environment variables..."

if [ "$FEATURE_AUDIOBOOK" = "true" ]; then
    echo -e "${YELLOW}⚠ FEATURE_AUDIOBOOK is enabled${NC}"
else
    echo -e "${GREEN}✓ FEATURE_AUDIOBOOK is disabled (default)${NC}"
fi

if [ "$FEATURE_AGENTICS" = "true" ]; then
    echo -e "${YELLOW}⚠ FEATURE_AGENTICS is enabled${NC}"
else
    echo -e "${GREEN}✓ FEATURE_AGENTICS is disabled (default)${NC}"
fi

if [ -n "$OPENAI_API_KEY" ]; then
    echo -e "${YELLOW}⚠ OPENAI_API_KEY is set${NC}"
else
    echo -e "${GREEN}✓ OPENAI_API_KEY is unset (default)${NC}"
fi

echo ""
echo "📋 Phase 2: Negative Path Testing (Flags OFF)"
echo "----------------------------------------------"

# Test audio endpoint when disabled (should 404)
check_http_status \
    "Audio export when FEATURE_AUDIOBOOK=false" \
    "$SERVER_URL/api/export/audio" \
    "404" \
    "POST" \
    "-H 'content-type: application/json' -H 'x-user-id: u1'" \
    '{"text":"hello"}'

# Test agentics stream when disabled (should 404)
check_http_status \
    "Agentics stream when FEATURE_AGENTICS=false" \
    "$SERVER_URL/api/agentics/status/NOPE/stream" \
    "404" \
    "GET" \
    "-H 'x-user-id: u1'"

echo ""
echo "📋 Phase 3: Feature Testing (Flags ON)"
echo "---------------------------------------"

# Test audiobook when enabled
if [ "$FEATURE_AUDIOBOOK" = "true" ] && [ -n "$OPENAI_API_KEY" ]; then
    echo "Testing audiobook happy path..."
    check_http_status \
        "Audio export when FEATURE_AUDIOBOOK=true" \
        "$SERVER_URL/api/export/audio" \
        "200" \
        "POST" \
        "-H 'content-type: application/json' -H 'x-user-id: alice'" \
        '{"text":"Hello from DocCraft","provider":"openai","format":"mp3","voice":"narrator_f"}'
else
    echo -e "${YELLOW}⚠ Skipping audiobook tests (FEATURE_AUDIOBOOK=false or OPENAI_API_KEY unset)${NC}"
fi

# Test agentics when enabled
if [ "$FEATURE_AGENTICS" = "true" ]; then
    echo "Testing agentics SSE..."
    check_http_status \
        "Agentics stream when FEATURE_AGENTICS=true" \
        "$SERVER_URL/api/agentics/status/test-run/stream" \
        "200" \
        "GET" \
        "-H 'x-user-id: test-user'"
else
    echo -e "${YELLOW}⚠ Skipping agentics tests (FEATURE_AGENTICS=false)${NC}"
fi

echo ""
echo "📋 Phase 4: Frontend Flag Validation"
echo "------------------------------------"

# Check if frontend is running
if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
    
    # Check if feature flags are properly loaded
    if curl -s "$FRONTEND_URL" | grep -q "VITE_FEATURE_AUDIOBOOK"; then
        echo -e "${GREEN}✓ Frontend feature flags are loaded${NC}"
    else
        echo -e "${YELLOW}⚠ Frontend feature flags may not be loaded${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Frontend is not running at $FRONTEND_URL${NC}"
    echo "To test frontend flags, start the frontend: npm run dev"
fi

echo ""
echo "📊 Test Results Summary"
echo "======================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Post-merge validation successful.${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Please review the issues above.${NC}"
    exit 1
fi
