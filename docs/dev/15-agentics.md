# Agentics (Scaffold)

- Flag-gated end-to-end path:
- POST `/api/agentics/run` → planner produces `plan.graph` artifact.
- No DB dependency (in-memory blackboard).
- Swap to Supabase-backed blackboard later without API changes.
- Frontend hook: `useAgentics()`.

## Required Environment Variables

### For Local Development (Memory Blackboard)

```bash
export FEATURE_AGENTICS=true
```

### For Supabase Integration (Production/Staging)

```bash
export FEATURE_AGENTICS=true
export SUPABASE_URL="https://<project>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
```

**⚠️ Security Note**: The service role key should NEVER be exposed to the client. It's used server-side only for database operations that bypass RLS for maintenance tasks.

## Storage & Blackboards

- Default scaffold uses in-memory blackboard.
- When FEATURE_AGENTICS=true and SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are set, the system
- switches to a Supabase-backed blackboard automatically (same interface).
- All runs and artifacts are isolated per user via RLS.
- Artifacts support optional TTL; expired artifacts are deleted by either pg_cron or
- POST /api/agentics/maintenance/ttl (ops-only).

## API Endpoints

- `POST /api/agentics/run` - Create a new agentics run
- `GET /api/agentics/runs?limit=20` - List user's runs (paginated, max 100)
- `POST /api/agentics/maintenance/ttl` - Trigger TTL cleanup (ops-only)

## Streaming (SSE)

When `FEATURE_AGENTICS=true`, you may subscribe to live agent step events:

- `GET /api/agentics/status/:runId/stream` (content-type: `text/event-stream`)

Events (JSON payloads on `event: step`): `start`, `log`, `artifact`, `done`, `error`.

## Audiobook with OpenAI TTS

When `FEATURE_AUDIOBOOK=true` and `OPENAI_API_KEY` is set:

- `POST /api/export/audio` with body:
  `{ "text": "...", "format": "mp3|wav|ogg|m4a", "voice": "narrator_f|narrator_m|warm_f|bright_m|neutral_f", "provider": "openai" }`

Response: `{ "url": "<signed-url>" }` (6h TTL).

## Testing

### Basic Tests

Run the basic functionality tests:

```bash
npm test -- tests/agentics/basic.test.ts
```

### Live Supabase Integration Tests

For end-to-end verification with a real Supabase instance:

```bash
# Set up environment variables first
export FEATURE_AGENTICS=true
export SUPABASE_URL="https://<project>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"

# Run live tests
npm test -- tests/agentics/supabase.live.test.ts
```

**Note**: Live tests auto-skip if Supabase credentials aren't available, keeping CI green.

### Safety & Guardrails (API)

- **Flags**: All endpoints return `404` unless `FEATURE_AGENTICS=true` / `FEATURE_AUDIOBOOK=true`.
- **Auth**: Routes require `x-user-id` (or server session). Missing → `401`.
- **Rate Limiting**: Audio (30/min), Agentics (60/min).
- **Validation**: Zod payload schemas; invalid → `400`.
- **SSE**: Heartbeat every 10s, auto‑close after 30s.
- **Maintenance**: `POST /api/agentics/maintenance/ttl` requires `x-internal-token = INTERNAL_MAINT_TOKEN`.
- **Storage**: Keys sanitized, signed URL TTL 6h.
