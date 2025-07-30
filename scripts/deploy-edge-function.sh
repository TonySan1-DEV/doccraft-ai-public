#!/bin/bash

# MCP Context Block
# {
#   file: "deploy-edge-function.sh",
#   role: "deployment",
#   allowedActions: ["deploy", "configure"],
#   tier: "Admin",
#   contentSensitivity: "high",
#   theme: "deployment"
# }

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FUNCTION_NAME="reingestFallbackLogs"
PROJECT_DIR="supabase/functions/$FUNCTION_NAME"

echo -e "${GREEN}🚀 Deploying Supabase Edge Function: $FUNCTION_NAME${NC}"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found. Please install it first:${NC}"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo -e "${YELLOW}⚠️  Not in a Supabase project. Initializing...${NC}"
    supabase init
fi

# Create function directory if it doesn't exist
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}📁 Creating function directory...${NC}"
    mkdir -p "$PROJECT_DIR"
fi

# Check if function files exist
if [ ! -f "$PROJECT_DIR/index.ts" ]; then
    echo -e "${RED}❌ Function files not found. Please ensure the Edge Function is properly created.${NC}"
    exit 1
fi

# Validate environment variables
echo -e "${YELLOW}🔍 Validating environment variables...${NC}"

REQUIRED_VARS=(
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Please set these variables in your environment or .env file:"
    echo "export SUPABASE_URL='your-supabase-url'"
    echo "export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables validated${NC}"

# Deploy the function
echo -e "${YELLOW}📤 Deploying Edge Function...${NC}"

if supabase functions deploy "$FUNCTION_NAME" --project-ref "$SUPABASE_PROJECT_ID"; then
    echo -e "${GREEN}✅ Function deployed successfully!${NC}"
else
    echo -e "${RED}❌ Function deployment failed${NC}"
    exit 1
fi

# Test the function
echo -e "${YELLOW}🧪 Testing function...${NC}"

TEST_RESPONSE=$(curl -s -X POST \
    "https://$SUPABASE_PROJECT_ID.supabase.co/functions/v1/$FUNCTION_NAME" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d '{"dryRun": true, "verbose": false}')

if echo "$TEST_RESPONSE" | grep -q '"status":"success"'; then
    echo -e "${GREEN}✅ Function test successful${NC}"
    echo "Response: $TEST_RESPONSE"
else
    echo -e "${YELLOW}⚠️  Function test returned unexpected response:${NC}"
    echo "$TEST_RESPONSE"
fi

# Display usage information
echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "Function URL: https://$SUPABASE_PROJECT_ID.supabase.co/functions/v1/$FUNCTION_NAME"
echo ""
echo "Usage examples:"
echo "  # Dry run test"
echo "  curl -X POST https://$SUPABASE_PROJECT_ID.supabase.co/functions/v1/$FUNCTION_NAME \\"
echo "    -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"dryRun\": true}'"
echo ""
echo "  # Full re-ingestion"
echo "  curl -X POST https://$SUPABASE_PROJECT_ID.supabase.co/functions/v1/$FUNCTION_NAME \\"
echo "    -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"verbose\": true}'"
echo ""
echo "Available options:"
echo "  - dryRun: boolean (default: false)"
echo "  - verbose: boolean (default: false)"
echo "  - force: boolean (default: false)" 