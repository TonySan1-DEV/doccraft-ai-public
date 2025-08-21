# Agentics Security Guidelines

## Server-Side Safeguards

### 1. Maintenance Endpoint Protection

The `/api/agentics/maintenance/ttl` endpoint should be protected with one of these methods:

#### Option A: Internal Token Header

```typescript
// In your maintenance endpoint
const internalToken = req.headers['x-internal-token'];
if (internalToken !== process.env.AGENTICS_MAINT_TOKEN) {
  return res.status(403).json({ error: 'Unauthorized' });
}
```

#### Option B: IP Range Restriction

```typescript
// If using a private runner
const clientIP = req.ip;
const allowedIPs = process.env.AGENTICS_ALLOWED_IPS?.split(',') || [];
if (!allowedIPs.includes(clientIP)) {
  return res.status(403).json({ error: 'IP not allowed' });
}
```

### 2. TTL Clamping

Always clamp `ttlSeconds` to prevent abuse:

```typescript
// Clamp TTL to sane range (10 seconds to 24 hours)
const ttl = Math.max(10, Math.min(Number(req.body?.ttlSeconds ?? 3600), 86400));

// Use the clamped value
const run = await createRun({
  ...req.body,
  ttlSeconds: ttl,
});
```

### 3. Observability Logging

Add structured logging for debugging:

```typescript
// On run creation
log.info({
  evt: 'agentics_run_create',
  runId,
  userId,
  ttlSeconds: ttl,
  timestamp: new Date().toISOString(),
});

// On status retrieval
log.info({
  evt: 'agentics_run_status',
  runId,
  userId,
  artifacts: artifacts.length,
  timestamp: new Date().toISOString(),
});
```

## Environment Variables

Add these to your `.env` file:

```bash
# Required for live testing
FEATURE_AGENTICS=1
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Security (optional but recommended)
AGENTICS_MAINT_TOKEN=your_secure_token_here
AGENTICS_ALLOWED_IPS=127.0.0.1,::1  # localhost only
```

## Smoke Test Commands

Test your endpoints manually:

```bash
# Create a run
curl -s -X POST http://localhost:4000/api/agentics/run \
  -H 'content-type: application/json' \
  -H 'x-user-id: alice' \
  -d '{"goal":"Outline Europa mission", "ttlSeconds": 20}' | jq .

# List runs for user alice
curl -s http://localhost:4000/api/agentics/runs -H 'x-user-id: alice' | jq .

# Check status (should 404 for wrong user)
curl -i http://localhost:4000/api/agentics/status/<RUN_ID> \
  -H 'x-user-id: bob'

# Run cleanup (protected endpoint)
curl -s -X POST http://localhost:4000/api/agentics/maintenance/ttl \
  -H 'x-user-id: alice' \
  -H 'x-internal-token: your_token_here' | jq .
```
