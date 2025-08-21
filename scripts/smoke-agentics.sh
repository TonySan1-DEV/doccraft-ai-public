#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Starting Agentics smoke test..."

# Check if server is running
if ! curl -s http://localhost:4000/api/agentics/maintenance/ttl > /dev/null; then
  echo "❌ Server not running on port 4000"
  echo "   Start with: npm run dev -- --port=4000"
  exit 1
fi

echo "✅ Server is running on port 4000"

# Create a run (owner = alice)
echo "📝 Creating a run for alice..."
RUN=$(curl -s -X POST http://localhost:4000/api/agentics/run \
  -H 'content-type: application/json' -H 'x-user-id: alice' \
  -d '{"goal":"Outline Europa mission","ttlSeconds":15}' | jq -r .runId)

if [[ "$RUN" == "null" || -z "$RUN" ]]; then
  echo "❌ Failed to create run"
  exit 1
fi

echo "✅ Created run: $RUN"

# Owner can see
echo "👀 Checking owner access..."
curl -s http://localhost:4000/api/agentics/status/$RUN -H 'x-user-id: alice' | jq .

# Non-owner cannot
echo "🚫 Checking non-owner access (should 404)..."
curl -s -i http://localhost:4000/api/agentics/status/$RUN -H 'x-user-id: bob' | head -n 1

# List runs (owner)
echo "📋 Listing runs for alice..."
curl -s "http://localhost:4000/api/agentics/runs?limit=10" -H 'x-user-id: alice' | jq .

# Wait for TTL window, then cleanup
echo "⏰ Waiting 20 seconds for TTL to expire..."
sleep 20

echo "🧹 Running TTL cleanup..."
curl -s -X POST http://localhost:4000/api/agentics/maintenance/ttl \
  -H "x-internal-token: $AGENTICS_MAINT_TOKEN" | jq .

# Confirm artifacts gone for the run
echo "🔍 Checking if artifacts were cleaned up..."
curl -s http://localhost:4000/api/agentics/status/$RUN -H 'x-user-id: alice' | jq .

echo "✅ Smoke test complete!"
echo "   Expected results:"
echo "   - 200 for owner status"
echo "   - 404 for non-owner"
echo "   - runs in the listing"
echo "   - { ok: true } from cleanup"
echo "   - artifacts: [] for expired run"
