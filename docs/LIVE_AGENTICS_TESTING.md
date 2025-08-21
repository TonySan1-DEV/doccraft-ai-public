# Live Agentics Testing

## Overview

This project includes live integration testing for the Agentics system with Supabase backend. The tests run against a real HTTP server and database, providing end-to-end validation of the system.

## Quick Start

### 1. Set Environment Variables

```bash
export FEATURE_AGENTICS=1
export SUPABASE_URL="https://<project>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
export AGENTICS_MAINT_TOKEN="<long-random-string>"
```

### 2. Validate Environment

```bash
npm run agentics:env-check
```

### 3. Run the Test

```bash
npm run test:agentics:live
```

### 4. Quick Smoke Test (Manual)

```bash
npm run agentics:smoke
```

## What Happens

1. **Server Startup**: Spins up your DocCraft-AI server on port 4000 with agentics enabled
2. **Live Testing**: Runs comprehensive integration tests against the real Supabase backend
3. **Automatic Cleanup**: Tears down the server when tests complete

## Test Coverage

- ✅ **Run Creation**: Creates agentics runs with proper user isolation
- ✅ **Status Retrieval**: Verifies run status and artifact persistence
- ✅ **User Isolation**: Ensures users can only access their own runs
- ✅ **TTL Cleanup**: Tests automatic artifact cleanup after expiration
- ✅ **Run Listing**: Lists user's runs with proper scoping
- ✅ **Protected Maintenance**: Maintenance endpoint requires internal token

## Safety Features

- **Auto-skip**: Tests automatically skip if environment variables aren't set
- **Isolated**: Each test run uses unique user IDs to prevent conflicts
- **CI Safe**: Won't run in CI environments where secrets aren't available

## Dependencies

The following packages are required for live testing:

```json
{
  "devDependencies": {
    "concurrently": "^9.1.0",
    "wait-on": "^8.0.1",
    "cross-env": "^10.0.0",
    "vitest": "^2"
  }
}
```

## Troubleshooting

### Server Won't Start

- Ensure port 4000 is available
- Check that all environment variables are set
- Verify Supabase credentials are valid

### Tests Fail

- Check server logs for errors
- Verify Supabase connection
- Ensure agentics feature flag is enabled

### Port Conflicts

- The test uses port 4000 by default
- Modify the port in both the npm script and test file if needed

## Integration with CI/CD

The live tests are designed to be CI-safe:

- Automatically skip when environment variables aren't set
- No secrets required in CI configuration
- Can be run manually in staging environments for validation

## Manual Testing

You can also run the tests manually against a running server:

```bash
# Start your server manually
npm run dev -- --port=4000

# In another terminal, run tests
npx vitest run tests/agentics/live.supabase.test.ts
```

## Quick Commands

### Environment Check

```bash
npm run agentics:env-check
```

### Smoke Test (Comprehensive)

```bash
npm run agentics:smoke
```

### Manual Endpoint Testing

```bash
# Create a run (owner = alice)
RUN=$(curl -s -X POST http://localhost:4000/api/agentics/run \
  -H 'content-type: application/json' -H 'x-user-id: alice' \
  -d '{"goal":"Outline Europa mission","ttlSeconds":15}' | jq -r .runId)
echo "RUN=$RUN"

# Owner can see
curl -s http://localhost:4000/api/agentics/status/$RUN -H 'x-user-id: alice' | jq .

# Non-owner cannot
curl -s -i http://localhost:4000/api/agentics/status/$RUN -H 'x-user-id: bob' | head -n 1

# List runs (owner)
curl -s "http://localhost:4000/api/agentics/runs?limit=10" -H 'x-user-id: alice' | jq .

# After TTL window → protected cleanup
sleep 20
curl -s -X POST http://localhost:4000/api/agentics/maintenance/ttl \
  -H "x-internal-token: $AGENTICS_MAINT_TOKEN" | jq .

# Confirm artifacts gone for the run
curl -s http://localhost:4000/api/agentics/status/$RUN -H 'x-user-id: alice' | jq .
```

**Expected Results:**

- ✅ 200 for owner status
- ✅ 404 for non-owner
- ✅ runs in the listing
- ✅ { ok: true } from cleanup
- ✅ artifacts: [] for expired run
