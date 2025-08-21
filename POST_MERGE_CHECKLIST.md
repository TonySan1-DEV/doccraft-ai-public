# DocCraft-AI Post-Merge Checklist & Validation

## 🚀 Overview

This document provides a comprehensive checklist for validating the post-merge state of DocCraft-AI, including feature flag validation, endpoint testing, and rollout procedures.

## 📋 Pre-Validation Setup

### Environment Configuration

Ensure the following environment variables are set correctly:

```bash
# Server-side (defaults: OFF)
FEATURE_AUDIOBOOK=false
FEATURE_AGENTICS=false
OPENAI_API_KEY=  # unset by default

# Frontend (defaults: OFF)
VITE_FEATURE_AUDIOBOOK=false
VITE_FEATURE_AGENTICS=false
```

### Service Startup

1. **Start the server:**

   ```bash
   npm run dev:server
   # Server should start on http://localhost:8000
   ```

2. **Start the frontend (optional for full validation):**
   ```bash
   npm run dev
   # Frontend should start on http://localhost:5174
   ```

## 🔍 Post-Merge Validation (15-min pass)

### Quick Validation Scripts

#### For Unix/Linux/macOS:

```bash
chmod +x scripts/post-merge-validation.sh
./scripts/post-merge-validation.sh
```

#### For Windows PowerShell:

```powershell
.\scripts\post-merge-validation.ps1
```

### Manual Validation Steps

#### 1. Negative Path Testing (Flags OFF)

**Audio Export (should 404):**

```bash
curl -i -X POST http://localhost:8000/api/export/audio \
  -H 'content-type: application/json' \
  -H 'x-user-id: u1' \
  -d '{"text":"hello"}'
```

**Expected:** `HTTP/1.1 404 Not Found`

**Agentics Stream (should 404):**

```bash
curl -i http://localhost:8000/api/agentics/status/NOPE/stream \
  -H 'x-user-id: u1'
```

**Expected:** `HTTP/1.1 404 Not Found`

#### 2. Feature Testing (Flags ON)

**Audiobook Happy Path:**

```bash
export FEATURE_AUDIOBOOK=true
export OPENAI_API_KEY=sk-...
# restart server, then:
curl -s -X POST http://localhost:8000/api/export/audio \
  -H 'content-type: application/json' \
  -H 'x-user-id: alice' \
  -d '{"text":"Hello from DocCraft","provider":"openai","format":"mp3","voice":"narrator_f"}'
```

**Expected:** `{"url":"<signed-url>"}`

**Agentics SSE Smoke Test:**

```bash
export FEATURE_AGENTICS=true
# restart server, then:
curl -N http://localhost:8000/api/agentics/status/test-run/stream \
  -H 'x-user-id: test-user'
```

**Expected:** SSE events with `event: step` and `event: ping` every 15s

## 🛡️ Quick Hardening Features

### 1. TTS Size Guards & Timeouts

**Implemented in:** `server/adapters/tts.openai.ts`

- ✅ **Text length cap:** Maximum 20,000 characters
- ✅ **Speed clamping:** Values clamped to [0.5, 2.0]
- ✅ **Fetch timeout:** 30-second timeout with AbortController
- ✅ **Error handling:** Graceful fallback and cleanup

**Example validation:**

```bash
# Should fail (text too long)
curl -X POST http://localhost:8000/api/export/audio \
  -H 'content-type: application/json' \
  -H 'x-user-id: test' \
  -d '{"text":"'$(printf 'a%.0s' {1..20001})'","voice":"narrator_f","format":"mp3"}'
```

### 2. SSE Heartbeat

**Implemented in:** `server/routes/agentics.run.ts`

- ✅ **Heartbeat interval:** Ping events every 15 seconds
- ✅ **Connection cleanup:** Proper cleanup on client disconnect
- ✅ **Proxy compatibility:** Keeps load balancers and proxies happy

**Example validation:**

```bash
# Watch for ping events
curl -N http://localhost:8000/api/agentics/status/test/stream \
  -H 'x-user-id: test' | grep "event: ping"
```

## 🧪 Testing

### Unit Tests

Run the comprehensive test suite:

```bash
npm test
```

**New test files added:**

- `tests/audio/export.audio.timeout.test.ts` - TTS timeout and size validation
- Enhanced `tests/agentics/stream.flag.test.ts` - SSE flag behavior and heartbeat

### Integration Tests

```bash
# Test audio export flags
npm test -- tests/audio/export.audio.flags.test.ts

# Test agentics streaming
npm test -- tests/agentics/stream.flag.test.ts

# Test TTS hardening
npm test -- tests/audio/export.audio.timeout.test.ts
```

## 📊 Observability

### TTS Logging

**Location:** `server/services/audioExport.ts`

```typescript
console.info('[tts.openai] upload_ok', {
  key,
  ms: Date.now() - start,
  fmt: args.format,
  voice: args.voice,
  bytes: buffer.length,
});
```

### SSE Logging

**Location:** `server/routes/agentics.run.ts`

```typescript
console.debug('[agentics.sse] step', {
  runId,
  agent: evt.agent,
  type: evt.type,
});
```

## 🚦 Rollout Plan

### Phase 1: Safe Deployment (Flags OFF)

- ✅ Deploy with `FEATURE_AUDIOBOOK=false`
- ✅ Deploy with `FEATURE_AGENTICS=false`
- ✅ Validate all endpoints return 404
- ✅ Monitor error logs for any unexpected behavior

### Phase 2: Staging Validation

- 🔄 Enable `FEATURE_AGENTICS=true` in staging
- 🔄 Validate SSE streaming with real-time monitoring
- 🔄 Test heartbeat events and connection stability

### Phase 3: Audiobook Testing

- 🔄 Enable `FEATURE_AUDIOBOOK=true` with non-prod OpenAI key
- 🔄 Generate test audio clips
- 🔄 Validate TTS timeout and size guards
- 🔄 Monitor upload performance and error rates

### Phase 4: Production Canary

- 🔄 Enable features for 5% of production traffic
- 🔄 Monitor error budgets:
  - TTS: upstream 429/5xx rates, timeout patterns
  - SSE: client disconnect rates, heartbeat delivery
- 🔄 Full enablement once error budget is clean

## 🔧 Troubleshooting

### Common Issues

**TTS Timeout Errors:**

- Check OpenAI API key validity
- Verify network connectivity to OpenAI
- Monitor for rate limiting (429 responses)

**SSE Connection Drops:**

- Check proxy/load balancer timeout settings
- Verify heartbeat events are being sent
- Monitor client disconnect patterns

**Feature Flag Issues:**

- Verify environment variable names (case-sensitive)
- Check server restart after env changes
- Validate frontend flag loading

### Debug Commands

```bash
# Check server environment
echo "FEATURE_AUDIOBOOK: $FEATURE_AUDIOBOOK"
echo "FEATURE_AGENTICS: $FEATURE_AGENTICS"
echo "OPENAI_API_KEY: ${OPENAI_API_KEY:0:10}..."

# Test server health
curl http://localhost:8000/health

# Check feature flag endpoints
curl -i http://localhost:8000/api/export/audio
curl -i http://localhost:8000/api/agentics/status/test/stream
```

## 📝 Success Criteria

### ✅ Post-Merge Validation Complete When:

1. **All negative paths return 404** when features are disabled
2. **TTS size guards** reject text > 20k characters
3. **TTS timeouts** prevent hung connections
4. **SSE heartbeat** sends ping events every 15s
5. **Feature flags** work correctly in both directions
6. **All tests pass** including new timeout and heartbeat tests
7. **Observability logging** provides clear debugging information

### 🎯 Rollout Success Metrics:

- **Error rate < 1%** for enabled features
- **TTS timeout rate < 0.1%** of requests
- **SSE connection stability > 99%** for active streams
- **Feature flag toggle** works without service disruption

## 🔗 Related Documentation

- [Audio Export Implementation](./docs/dev/13-audio-export.md)
- [Agentics System Overview](./docs/dev/15-agentics.md)
- [Feature Flag Configuration](./src/config/flags.ts)
- [Server Feature Flags](./server/util/featureFlags.ts)

---

**Last Updated:** $(date)
**Version:** Post-Merge v1.0
**Status:** Ready for validation
