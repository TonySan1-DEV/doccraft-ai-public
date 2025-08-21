# DocCraft AI Feature Flag Verification & Hardening

This document outlines the comprehensive verification plan and hardening improvements implemented for the DocCraft AI project.

## 🚀 Quick Start Verification

### Prerequisites

- Node.js 18+ installed
- curl or PowerShell available
- Server running on port 8000

### 1. Start the Server

```bash
# Ensure clean environment (flags OFF)
unset FEATURE_AUDIOBOOK FEATURE_AGENTICS INTERNAL_MAINT_TOKEN OPENAI_API_KEY

# Start development server
npm run dev:server
```

### 2. Run Verification Scripts

#### Linux/macOS

```bash
chmod +x scripts/verify-feature-flags.sh
./scripts/verify-feature-flags.sh
```

#### Windows PowerShell

```powershell
.\scripts\verify-feature-flags.ps1
```

## 📋 10-Minute Verification Plan

### Phase 0: Server Boot

- ✅ Server starts without errors
- ✅ Health endpoint responds at `/health`

### Phase 1: Feature Flags OFF

- ✅ Audio endpoint returns 404: `POST /api/export/audio`
- ✅ Agentics endpoint returns 404: `GET /api/agentics/status/NOPE/stream`

### Phase 2: Audiobook ON, Auth Enforced

- ✅ 401 without user authentication
- ✅ 400 for invalid payload (empty text)
- ✅ 400 for oversized payload (>20k chars)

### Phase 3: OpenAI TTS Smoke Test (Optional)

- ✅ Requires valid `OPENAI_API_KEY`
- ✅ Returns signed URL with 6-hour TTL
- ✅ Produces MP3 audio file

### Phase 4: Agentics SSE Protection

- ✅ 401 without user authentication
- ✅ Streams events with user authentication
- ✅ 30-second timeout enforced

### Phase 5: Maintenance Endpoint Security

- ✅ 403 without internal token
- ✅ 200 with valid `INTERNAL_MAINT_TOKEN`

## 🔒 Hardening Improvements Implemented

### 1. SSE Idle Clamp

```typescript
// server/routes/agentics.run.ts
const idleCutoff = setTimeout(() => {
  res.write(`event: bye\ndata: {"reason":"idle"}\n\n`);
  res.end();
}, 30_000);

req.on('close', () => clearTimeout(idleCutoff));
req.on('aborted', () => clearTimeout(idleCutoff));
```

**Benefits:**

- Deterministic timeout even if disconnect events are missed
- Prevents hanging sockets and resource leaks
- Consistent behavior across different client implementations

### 2. Rate Limit Error Bodies

```typescript
// server/middleware/ratelimit.ts
handler: (_req, res) => res.status(429).json({ error: 'rate_limited' });
```

**Benefits:**

- Machine-readable error responses
- Consistent API error format
- Better client error handling

### 3. Storage Key Normalization

```typescript
// server/util/sanitize.ts
export function normalizedKey(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/\/{2,}/g, '/')
    .replace(/^\//, '')
    .slice(0, 180);
}
```

**Benefits:**

- S3-compatible storage keys
- Predictable, low-ASCII characters
- Prevents path traversal attacks
- Consistent key format across environments

### 4. Numeric Parameter Clamping

```typescript
// server/services/audioExport.ts
const speed = clamp(args.speed ?? 1.0, 0.5, 2.0);
const sampleRate = clamp(args.sampleRate ?? 24000, 8_000, 48_000);
```

**Benefits:**

- Prevents API abuse with extreme values
- Ensures OpenAI compatibility
- Maintains audio quality standards

### 5. Enhanced Zod Validation

```typescript
// server/schemas/audio.ts
text: z.string()
  .min(1, 'Text cannot be empty')
  .max(AUDIO_MAX_TEXT, `Text cannot exceed ${AUDIO_MAX_TEXT} characters`);
```

**Benefits:**

- Clear error messages for validation failures
- Consistent validation across all endpoints
- Better debugging and user experience

### 6. CORS Configuration for SSE

```typescript
// server/routes/agentics.run.ts
const frontendOrigin = process.env.FRONTEND_ORIGIN;
if (frontendOrigin) {
  res.setHeader('Access-Control-Allow-Origin', frontendOrigin);
}
```

**Benefits:**

- No wildcard CORS policies
- Configurable origin for different environments
- Secure cross-origin requests

## 🧪 Test Coverage

### Unit Tests

```bash
# Test feature flags when OFF
npm run check:flags:off

# Test audio guards when ON
npm run check:audio:on:noauth

# Test agentics maintenance guards
npm run check:agentics:maint
```

### Integration Tests

- Feature flag behavior verification
- Authentication and authorization flows
- Rate limiting and error handling
- SSE streaming and timeout behavior

## 🔧 Environment Configuration

### Required Variables

```bash
# Feature Flags (default: OFF)
FEATURE_AUDIOBOOK=false
FEATURE_AGENTICS=false

# API Keys (when features enabled)
OPENAI_API_KEY=sk-...
INTERNAL_MAINT_TOKEN=your-secure-token

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server Configuration
PORT=8000
FRONTEND_ORIGIN=http://localhost:3000
```

### Environment Template

Copy `env.template` to `.env` and configure your values:

```bash
cp env.template .env
# Edit .env with your actual values
```

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Feature flags default to `false`
- [ ] Environment variables configured
- [ ] Tests passing locally
- [ ] Verification script successful

### Production Considerations

- [ ] Use strong, unique tokens
- [ ] Enable monitoring and logging
- [ ] Configure proper CORS origins
- [ ] Set up pg_cron for TTL cleanup (if using PostgreSQL)

### Monitoring

- [ ] Request logging (method, path, userId, status, ms)
- [ ] SSE connection tracking (open/close with duration)
- [ ] Error rate monitoring
- [ ] Performance metrics collection

## 🐛 Troubleshooting

### Common Issues

#### Server Won't Start

```bash
# Check environment variables
echo $FEATURE_AUDIOBOOK
echo $FEATURE_AGENTICS

# Verify port availability
lsof -i :8000
```

#### Feature Flags Not Working

```bash
# Ensure flags are set correctly
export FEATURE_AUDIOBOOK=true
export FEATURE_AGENTICS=true

# Restart server after changing flags
```

#### SSE Timeout Issues

```bash
# Check client implementation
# Verify 30-second timeout handling
# Check for proper cleanup on disconnect
```

#### Rate Limiting Problems

```bash
# Verify rate limit configuration
# Check client retry logic
# Monitor for legitimate high-traffic scenarios
```

## 📚 Additional Resources

### Documentation

- [API Documentation](docs/api/openapi.yaml)
- [Agentics Implementation](docs/ADVANCED_AGENT_COORDINATION_IMPLEMENTATION.md)
- [Audio Export Guide](docs/AUDIOBOOK_IMPLEMENTATION_SUMMARY.md)

### Examples

- [Advanced Agent Coordination](examples/AdvancedAgentCoordinationExample.tsx)
- [Multi-Agent Orchestration](examples/MultiAgentOrchestrationExample.tsx)

### Support

- Check [issues](../../issues) for known problems
- Review [test results](../../actions) for CI/CD status
- Consult [development guides](docs/dev/) for setup help

## 🎯 Success Metrics

### Security

- ✅ Zero unauthorized access to protected endpoints
- ✅ Proper rate limiting and abuse prevention
- ✅ Secure token-based authentication

### Reliability

- ✅ Consistent 404 responses when features disabled
- ✅ Proper error handling and validation
- ✅ SSE timeout and cleanup working correctly

### Performance

- ✅ Fast response times for enabled features
- ✅ Efficient resource cleanup
- ✅ Proper connection management

---

**Ready to ship checklist:**

- [x] Endpoint behavior matches flags (404 when OFF)
- [x] Zod rejects empty/oversized payloads
- [x] Rate limit returns 429 JSON
- [x] SSE sends hello/step/bye and honored 30s timeout
- [x] Maintenance requires x-internal-token
- [x] Audio TTS path produces signed URL with 6h TTL

🎉 **All hardening improvements implemented and verified!**
