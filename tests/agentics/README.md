# Agentics Tests

This directory contains tests for the Agentics system, which provides AI-powered document generation capabilities.

## Test Files

### `basic.test.ts`

Basic functionality tests that run in all environments:

- Feature flag behavior (404 when disabled)
- User authentication requirements (401 when missing user)
- Memory blackboard fallback behavior
- TTL maintenance endpoint availability

**Runs in**: CI, local development, all environments

### `supabase.live.test.ts`

Live Supabase integration tests for end-to-end verification:

- **Auto-skips** if Supabase credentials aren't available
- Tests real database operations with RLS enforcement
- Verifies TTL cleanup functionality
- Tests user isolation at both API and database levels

**Runs in**: Local development only (when credentials provided)
**Skips in**: CI, environments without Supabase setup

## Environment Requirements

### For Basic Tests

```bash
export FEATURE_AGENTICS=true
```

### For Live Supabase Tests

```bash
export FEATURE_AGENTICS=true
export SUPABASE_URL="https://<project>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
```

## Running Tests

### Basic Tests (Always Available)

```bash
npm test -- tests/agentics/basic.test.ts
```

### Live Supabase Tests (Conditional)

```bash
# Set up environment first
export FEATURE_AGENTICS=true
export SUPABASE_URL="https://<project>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"

# Run live tests
npm test -- tests/agentics/supabase.live.test.ts
```

## Auto-Skip Behavior

The live test automatically detects missing credentials and skips execution:

```typescript
const SHOULD_RUN =
  !!SUPABASE_URL && !!SUPABASE_SERVICE_ROLE_KEY && FEATURE_AGENTICS === 'true';

describe('LIVE Supabase ↔ Agentics blackboard (local only)', () => {
  if (!SHOULD_RUN) {
    it.skip('skipped (no live Supabase env or FEATURE_AGENTICS=false)', () => {});
    return;
  }
  // ... actual tests
});
```

This ensures:

- ✅ CI stays green without Supabase setup
- ✅ Local development works with or without credentials
- ✅ No manual test configuration needed
- ✅ Clear indication when tests are skipped

## Test Coverage

### Basic Tests

- [x] Feature flag gating
- [x] User authentication
- [x] Memory blackboard fallback
- [x] TTL maintenance endpoint

### Live Supabase Tests

- [x] Run creation and artifact generation
- [x] User isolation enforcement
- [x] TTL cleanup functionality
- [x] RLS policy verification

## Security Notes

- Live tests use service role keys for database verification
- Service keys are never exposed to client-side code
- Tests verify RLS policies are working correctly
- User isolation is tested at both API and database levels
