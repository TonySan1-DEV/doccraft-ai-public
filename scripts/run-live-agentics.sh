#!/usr/bin/env bash
set -euo pipefail

: "${SUPABASE_URL:?SUPABASE_URL is required}"
: "${SUPABASE_SERVICE_ROLE_KEY:?SUPABASE_SERVICE_ROLE_KEY is required}"

export FEATURE_AGENTICS=1

echo "🚀 Starting live Agentics test..."
echo "   Server will boot on port 4000"
echo "   Tests will run against live Supabase"
echo "   Auto-teardown when complete"
echo ""

# Start server + run test; tear down automatically
npx concurrently -k -s first \
  "npm run dev -- --port=4000" \
  "npx wait-on http://localhost:4000 && npx vitest run tests/agentics/live.supabase.test.ts"
