# Agentics Local Runbook (End-to-End Smoke Test)

This runbook provides step-by-step instructions for testing the Agentics system locally with a real Supabase instance.

## Prerequisites

- Node.js and npm installed
- Access to a Supabase project
- PostgreSQL client (optional, for direct DB access)

## 0) Environment Setup (Server Only)

**⚠️ Security Warning**: These environment variables should NEVER be exposed to the client. They're server-side only.

```bash
# Enable agentics feature
export FEATURE_AGENTICS=true

# Supabase project credentials
export SUPABASE_URL="https://<your-project-id>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"

# Optional: Set a specific port for testing
export PORT=8000
```

## 1) Apply Database Migration

### Option A: Direct PostgreSQL Connection

```bash
# If you have the database connection string
psql "$SUPABASE_DB_URL" -f supabase/migrations/2025-08-20_agentics_blackboard.sql
```

### Option B: Supabase CLI

```bash
# If you have Supabase CLI linked to your project
supabase db push
```

### Option C: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/2025-08-20_agentics_blackboard.sql`
4. Execute the SQL

## 2) Start the Server

```bash
# Start the development server
npm run server:dev

# Or if you have a specific server script
npm run dev:server
```

The server should start and log that it's running on the specified port.

## 3) Test Basic Functionality

### Create a Run (User A)

```bash
curl -sS -X POST http://localhost:8000/api/agentics/run \
  -H "Content-Type: application/json" \
  -H "x-user-id: userA" \
  -d '{
    "goal": "Write 3-step outline about Europa missions",
    "ttlSeconds": 30,
    "budget": {"maxUsd": 0.05}
  }' | jq .
```

Expected response:

```json
{
  "runId": "uuid-here",
  "artifacts": [
    {
      "kind": "plan.graph",
      "label": "planner-output",
      "data": { ... }
    }
  ]
}
```

### Verify User Isolation (User B Cannot Access User A's Run)

```bash
# Copy the runId from the previous response
RUN_ID="<paste-run-id-here>"

# Try to access as user B (should fail)
curl -sS -i http://localhost:8000/api/agentics/status/$RUN_ID \
  -H "x-user-id: userB"
```

Expected response: `404 Not Found`

### Test TTL Cleanup

```bash
# Create a short-lived run
curl -sS -X POST http://localhost:8000/api/agentics/run \
  -H "Content-Type: application/json" \
  -H "x-user-id: userA" \
  -d '{
    "goal": "TTL test - short lived",
    "ttlSeconds": 5
  }' | jq .

# Wait for TTL to expire
sleep 7

# Trigger maintenance cleanup
curl -sS -X POST http://localhost:8000/api/agentics/maintenance/ttl \
  -H "x-user-id: userA" | jq .
```

Expected response: `{"ok": true}`

## 4) Run Automated Tests

### Basic Tests (Always Available)

```bash
npm test -- tests/agentics/basic.test.ts
```

### Live Supabase Tests (Requires Credentials)

```bash
# Make sure environment variables are set
npm test -- tests/agentics/supabase.live.test.ts
```

## 5) Verify Database State

### Check Runs Table

```sql
-- Connect to your Supabase database
SELECT
  id,
  user_id,
  status,
  created_at,
  updated_at
FROM agentics_runs
ORDER BY created_at DESC
LIMIT 5;
```

### Check Artifacts Table

```sql
SELECT
  id,
  run_id,
  user_id,
  kind,
  label,
  expires_at
FROM agentics_artifacts
ORDER BY created_at DESC
LIMIT 10;
```

### Verify RLS Policies

```sql
-- This should return 0 rows (no access without auth)
SELECT COUNT(*) FROM agentics_runs;
SELECT COUNT(*) FROM agentics_artifacts;
```

## 6) Optional: Enable Database-Side TTL Cleanup

If you prefer automated cleanup via pg_cron instead of API calls:

```sql
-- Enable pg_cron (if supported by your Supabase plan)
-- Run TTL cleanup every 5 minutes
SELECT cron.schedule(
  'agentics_ttl_every_5m',
  '*/5 * * * *',
  $$SELECT public.agentics_delete_expired_artifacts();$$
);
```

## 7) Troubleshooting

### Common Issues

#### Feature Flag Not Working

```bash
# Verify environment variable is set
echo $FEATURE_AGENTICS
# Should output: true
```

#### Supabase Connection Issues

```bash
# Test Supabase connection
curl -sS "$SUPABASE_URL/rest/v1/" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

#### Migration Errors

- Check that your Supabase project supports the required PostgreSQL extensions
- Verify the migration SQL syntax is compatible with your PostgreSQL version
- Ensure you have sufficient permissions to create tables and policies

### Debug Mode

Add debug logging by setting:

```bash
export DEBUG=agentics:*
```

## 8) Cleanup

### Remove Test Data

```sql
-- Clean up test runs (adjust user_id pattern as needed)
DELETE FROM agentics_artifacts
WHERE user_id LIKE 'user_live_%';

DELETE FROM agentics_runs
WHERE user_id LIKE 'user_live_%';
```

### Disable Feature (Optional)

```bash
export FEATURE_AGENTICS=false
```

## Security Checklist

- [ ] Service role key is server-side only
- [ ] Client never receives service credentials
- [ ] RLS policies are enforced
- [ ] User isolation works at API level
- [ ] User isolation works at database level
- [ ] TTL cleanup doesn't expose other users' data
- [ ] Feature flag properly gates all endpoints

## Next Steps

After successful local testing:

1. Deploy to staging environment
2. Run integration tests in staging
3. Verify production deployment
4. Monitor logs for any issues
5. Set up production TTL cleanup schedule
