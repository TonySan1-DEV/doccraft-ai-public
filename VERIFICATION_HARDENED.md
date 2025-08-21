# DocCraft AI Hardened Verification Guide

## Overview

This guide covers the hardened verification system that ensures all security guardrails are working correctly in your DocCraft AI application.

## Quick Start

### Windows

```powershell
.\scripts\verify-hardened.ps1
```

### Unix/Linux/macOS

```bash
./scripts/verify-hardened.sh
```

### Direct npm command

```bash
npm run verify:hardened
```

## What the Verification Tests

The hardened verification system runs the following tests to ensure security:

### 1. Audio Route Guardrails

- **Flag OFF**: Routes return 404 (not found)
- **Flag ON**: Proper authentication (401) and validation (400) responses
- **Rate Limiting**: 429 responses with request ID tracking

### 2. Agentics Route Guardrails

- **Flag OFF**: Routes return 404 (not found)
- **Flag ON**: Maintenance token validation (403/200)
- **SSE Security**: Proper connection closure within 30s

### 3. Security Hardening

- **JSON Body Limits**: 512KB maximum to prevent abuse
- **Request ID Tracking**: UUID generation for correlation
- **CORS Protection**: Origin validation when FRONTEND_ORIGIN is set
- **Rate Limit Responses**: Consistent JSON with request IDs

## Test Matrix

### Flags OFF → 404 (Security by Default)

```bash
# Audio routes should 404
curl -si -X POST http://localhost:8000/api/export/audio | head -n1
# Expected: HTTP/1.1 404 Not Found

# Agentics routes should 404
curl -si http://localhost:8000/api/agentics/status/NOPE/stream | head -n1
# Expected: HTTP/1.1 404 Not Found
```

### AUDIO Flag ON → Proper Guardrails

```bash
export FEATURE_AUDIOBOOK=true

# Missing auth → 401
curl -si -X POST http://localhost:8000/api/export/audio \
  -H 'content-type: application/json' -d '{"text":"hi"}' | head -n1
# Expected: HTTP/1.1 401 Unauthorized

# Invalid input → 400
curl -si -X POST http://localhost:8000/api/export/audio \
  -H 'content-type: application/json' -H 'x-user-id: u1' -d '{"text":""}' | head -n1
# Expected: HTTP/1.1 400 Bad Request

# Rate limit → 429 with request ID
# (Make multiple rapid requests)
curl -si -X POST http://localhost:8000/api/export/audio \
  -H 'content-type: application/json' -H 'x-user-id: u1' -d '{"text":"test"}' | head -n1
# Expected: HTTP/1.1 429 Too Many Requests
# Response: {"error":"rate_limited","rid":"<uuid>"}
```

### AGENTICS Flag ON → Maintenance Guards

```bash
export FEATURE_AGENTICS=true

# Missing maintenance token → 403
curl -si -X POST http://localhost:8000/api/agentics/maintenance/ttl \
  -H 'content-type: application/json' -d '{"op":"ttl_cleanup"}' | head -n1
# Expected: HTTP/1.1 403 Forbidden

# Valid maintenance token → 200
export INTERNAL_MAINT_TOKEN=dev-secret
curl -si -X POST http://localhost:8000/api/agentics/maintenance/ttl \
  -H 'content-type: application/json' -H 'x-internal-token: dev-secret' \
  -d '{"op":"ttl_cleanup"}' | head -n1
# Expected: HTTP/1.1 200 OK
```

## Environment Variables

### Required for Testing

- `PORT=8000` (verification server port)
- `NODE_ENV=test` (test environment)

### Feature Flags

- `FEATURE_AUDIOBOOK=true/false` (audio route access)
- `FEATURE_AGENTICS=true/false` (agentics route access)
- `INTERNAL_MAINT_TOKEN=<secret>` (maintenance operations)

### Security Configuration

- `FRONTEND_ORIGIN=<url>` (CORS origin restriction)

## Success Criteria

✅ **Audio + Agentics routes 404 with flags OFF**  
✅ **With flags ON, guards return 401/400/429 as expected**  
✅ **SSE emits hello/step/bye and closes in ≤30s**  
✅ **Rate limits return consistent JSON with request IDs**  
✅ **Health endpoint includes request ID tracking**  
✅ **JSON body size limited to 512KB**  
✅ **CORS origin validation when configured**

## Troubleshooting

### Common Issues

1. **Port 8000 already in use**

   ```bash
   # Kill process on port 8000
   lsof -ti:8000 | xargs kill -9  # Unix
   netstat -ano | findstr :8000   # Windows
   ```

2. **Dependencies missing**

   ```bash
   npm install -g concurrently wait-on
   ```

3. **Tests failing**
   - Check environment variables are set correctly
   - Verify server is running on port 8000
   - Check test logs for specific failure details

### Debug Mode

Run with verbose output:

```bash
npm run verify:hardened -- --reporter=verbose
```

## Security Notes

- **INTERNAL_MAINT_TOKEN**: Rotate regularly; treat as a secret
- **FRONTEND_ORIGIN**: Set in production to restrict SSE to your app only
- **Request IDs**: All responses include correlation IDs for debugging
- **Body Limits**: 512KB prevents abuse while allowing normal operations

## Integration

This verification system integrates with:

- CI/CD pipelines for automated security testing
- Development workflows for pre-commit validation
- Production deployment validation
- Security audit compliance

## Next Steps

After successful verification:

1. Deploy to staging environment
2. Run verification in staging
3. Deploy to production
4. Run verification in production
5. Monitor logs for security events
