# Safe Client→Server Monitor Telemetry

This document describes the safe client→server monitor telemetry system implemented in DocCraft AI, which provides non-invasive error reporting with rate limiting, Prometheus metrics, and optional Supabase persistence.

## Overview

The system consists of four main components:

1. **Client Reporter** - Safely reports errors using `navigator.sendBeacon` with fetch fallback
2. **Server Endpoint** - Validates, rate-limits, and processes error reports
3. **Prometheus Metrics** - Exposes monitoring counters for observability
4. **Supabase Persistence** - Optional storage of sampled events with automatic retention

## Features

- ✅ **Non-blocking** - Never blocks the main thread or user experience
- ✅ **Safe by design** - Payloads are sanitized both client and server-side
- ✅ **Rate limited** - Token bucket rate limiting per IP address
- ✅ **Configurable** - Environment-based feature flags
- ✅ **Observable** - Prometheus metrics for monitoring and alerting
- ✅ **Idempotent** - Safe to call multiple times
- ✅ **Persistent** - Optional Supabase storage with automatic cleanup

## Client-Side Configuration

### Environment Variables

```bash
# Enable/disable error reporting
VITE_MONITORING_REPORT=false

# Endpoint URL for error reports
VITE_MONITORING_REPORT_URL=/api/monitor/error
```

### Usage

The reporter is automatically hooked into the existing `safeRun` error handling:

```typescript
import { safeRun } from './monitoring/error/safeError';

// Errors are automatically reported when this fails
await safeRun(
  'myOperation',
  async () => {
    // Your code here
  },
  async payload => {
    // Custom error handling (optional)
    console.error('Operation failed:', payload.message);
  },
  { component: 'myComponent' }
);
```

### Manual Reporting

You can also report errors manually:

```typescript
import { reportSafeError } from './monitoring/error/safeError';

await reportSafeError({
  message: 'Something went wrong',
  stack: 'Error: Something went wrong\n  at myFunction:1:1',
  tags: { component: 'myComponent', severity: 'high' },
});
```

## Server-Side Configuration

### Environment Variables

```bash
# Enable/disable the monitoring endpoint
MONITORING_REPORT_ENABLED=false

# Sampling rate (0.0 to 1.0, where 1.0 = 100%)
MONITORING_REPORT_SAMPLE=1

# Log errors to console (useful for debugging)
MONITORING_LOG_ERRORS=false

# Enable Supabase persistence
MONITORING_PERSIST_ENABLED=false

# Persistence sampling rate (0.0 to 1.0)
MONITORING_PERSIST_SAMPLE=0.25

# Retention period in days
MONITORING_RETENTION_DAYS=30
```

### Endpoint

The monitor endpoint is available at `/api/monitor/error` and accepts POST requests with JSON payloads.

### Rate Limiting

- **Capacity**: 10 events per IP address
- **Refill Rate**: 10 events per 10 seconds
- **Headers**: Respects `X-Forwarded-For` for proxy setups

### Validation

- **Message**: Max 5,000 characters
- **Stack**: Max 12,000 characters
- **Schema**: Strict validation of required fields
- **Sanitization**: Additional server-side scrubbing

## Supabase Persistence

### Overview

When enabled, the system can persist sampled monitor events to a Supabase database for short-term analysis and debugging.

### Database Schema

The `monitor_events` table includes:

- **Event details**: message, stack trace, component, environment
- **Context**: user agent, session ID, hashed IP address
- **Metadata**: timestamp, tags, calculated byte size
- **Privacy**: IP addresses are hashed with salt (non-reversible)

### Automatic Retention

- **Default retention**: 30 days
- **Cleanup method**: pg_cron (if available) or server fallback
- **Schedule**: Daily at 02:00 UTC or every 24 hours

### Security Features

- **Row Level Security (RLS)**: Enabled by default
- **Service role access**: Server uses service role key (bypasses RLS)
- **No client access**: Application users cannot read/write this table
- **Data sanitization**: Only pre-sanitized error data is stored

### Migration

Apply the migration in your Supabase project:

```bash
# Via Supabase CLI
supabase db push

# Or manually in Supabase Console SQL Editor
# Run: database/migrations/20250819_monitor_events.sql
```

## Prometheus Metrics

The following metrics are exposed when Prometheus is configured:

```
# Error volume by component and environment
doccraft_monitor_errors_total{component="performanceMonitor",env="production"}

# Dropped events by reason
doccraft_monitor_dropped_total{reason="rate_limit"}
doccraft_monitor_dropped_total{reason="schema"}
doccraft_monitor_dropped_total{reason="size"}
doccraft_monitor_dropped_total{reason="db"}
doccraft_monitor_dropped_total{reason="db_ex"}
```

## Testing

### Client Tests

```bash
pnpm run test --run src/monitoring/error/__tests__/reporter.test.ts
```

### Server Tests

```bash
pnpm run test --run tests/server/monitor.route.test.ts
```

### Persistence Tests

```bash
pnpm run test --run tests/server/monitor.persist.test.ts
```

### Smoke Test

```bash
# Start the server (if not already running)
cd server && node collaboration-server.ts

# In another terminal, test the endpoint
node scripts/test-monitor-endpoint.js
```

## Security Considerations

1. **Payload Sanitization**: All inputs are validated and sanitized
2. **Rate Limiting**: Prevents abuse and DoS attacks
3. **Size Limits**: Prevents oversized payloads
4. **Environment Isolation**: Different configs for dev/staging/prod
5. **No Sensitive Data**: Only error messages and stack traces
6. **Database Security**: RLS enabled, service role access only
7. **IP Privacy**: IP addresses are hashed, not stored in plain text

## Monitoring and Alerting

### Recommended Alerts

```yaml
# High error rate
- alert: HighErrorRate
  expr: rate(doccraft_monitor_errors_total[5m]) > 10
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: 'High error rate detected'

# High drop rate
- alert: HighDropRate
  expr: rate(doccraft_monitor_dropped_total[5m]) > 5
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: 'High drop rate for monitor events'

# Database persistence failures
- alert: MonitorPersistenceFailure
  expr: rate(doccraft_monitor_dropped_total{reason=~"db.*"}[5m]) > 1
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: 'Monitor events failing to persist to database'
```

### Dashboards

Create Grafana dashboards to visualize:

- Error rates by component
- Drop rates by reason
- Geographic distribution (if IP geolocation available)
- Error patterns over time
- Database persistence success rates
- Retention cleanup statistics

## Troubleshooting

### Common Issues

1. **Endpoint returns 404**: Check `MONITORING_REPORT_ENABLED=true`
2. **Rate limited**: Reduce request frequency or increase rate limit
3. **Payload too large**: Check message/stack length limits
4. **No metrics**: Ensure Prometheus integration is configured
5. **Persistence disabled**: Check `MONITORING_PERSIST_ENABLED=true`
6. **Database errors**: Verify Supabase credentials and table exists

### Debug Mode

Enable debug logging:

```bash
MONITORING_LOG_ERRORS=true
```

This will log error details to the console for troubleshooting.

### Database Queries

Useful queries for monitoring the system:

```sql
-- Check recent events
SELECT ts, component, message, bytes
FROM monitor_events
ORDER BY ts DESC
LIMIT 10;

-- Component error counts
SELECT component, COUNT(*) as error_count
FROM monitor_events
WHERE ts > now() - interval '24 hours'
GROUP BY component
ORDER BY error_count DESC;

-- Check retention function
SELECT public.purge_old_monitor_events(30);
```

## Future Enhancements

- [x] Durable storage backend (PostgreSQL via Supabase)
- [ ] Error clustering and deduplication
- [ ] Advanced filtering and sampling
- [ ] Integration with external error tracking services
- [ ] Real-time error streaming
- [ ] Custom retention policies per component
- [ ] Data export and backup functionality

## Contributing

When modifying the monitoring system:

1. Maintain backward compatibility
2. Add comprehensive tests
3. Update this documentation
4. Consider security implications
5. Test rate limiting and validation logic
6. Verify database migrations work correctly
7. Test retention and cleanup processes
