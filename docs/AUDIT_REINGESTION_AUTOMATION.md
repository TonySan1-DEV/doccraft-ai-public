# Audit Log Re-ingestion Automation

## Overview

DocCraft-AI uses a robust fallback logging system that creates JSON files when audit log exports fail. This document describes the automated re-ingestion systems that ensure these fallback logs are eventually processed and stored in the database.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Export Jobs   │───▶│  Fallback Logs   │───▶│ Re-ingestion    │
│   (3 AM UTC)    │    │   (JSON files)   │    │   (4 AM UTC)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   GitHub Action  │    │ Supabase Edge   │
                       │   (Primary)      │    │ Function        │
                       │                  │    │ (Backup)        │
                       └──────────────────┘    └─────────────────┘
```

## Option A: GitHub Actions (Recommended)

### Configuration

**File**: `.github/workflows/reingest-audit-logs.yml`

**Schedule**: Every night at 4 AM UTC (after main export at 3 AM)

**Manual Trigger**: Available with options:
- `dry_run`: Test run without database changes
- `verbose`: Detailed processing information
- `force`: Override recent processing checks

### Features

✅ **Automated Scheduling**
- Runs nightly at 4 AM UTC
- Skips if no fallback logs exist
- Configurable via GitHub UI

✅ **Manual Control**
- One-click manual execution
- Dry-run mode for testing
- Verbose logging for debugging

✅ **Error Handling**
- Comprehensive error reporting
- Artifact uploads for failed runs
- Slack notifications on failure/success

✅ **Logging & Monitoring**
- Recovery logs stored for 30 days
- Failed logs stored for 7 days
- Processing time tracking

### Setup

1. **Environment Variables** (GitHub Secrets):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SLACK_WEBHOOK_URL=your_slack_webhook (optional)
   ```

2. **Manual Execution**:
   - Go to GitHub Actions → "Reingest Fallback Audit Logs"
   - Click "Run workflow"
   - Configure options as needed

### Example Usage

```bash
# Check workflow status
gh workflow list

# Run manually with dry-run
gh workflow run reingest-audit-logs.yml -f dry_run=true

# View logs
gh run list --workflow=reingest-audit-logs.yml
```

## Option B: Supabase Edge Function (Backup)

### Configuration

**File**: `supabase/functions/reingestFallbackLogs/index.ts`

**Endpoint**: `POST /functions/v1/reingestFallbackLogs`

**Authentication**: Requires service role key

### Features

✅ **Serverless Execution**
- Runs within Supabase infrastructure
- No external dependencies
- Automatic scaling

✅ **REST API Interface**
- HTTP POST endpoint
- JSON request/response
- CORS support

✅ **Configurable Options**
- Dry-run mode
- Verbose logging
- Force processing

### Setup

1. **Deploy Function**:
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Deploy function
   supabase functions deploy reingestFallbackLogs
   ```

2. **Environment Variables**:
   ```bash
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Test Function**:
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/reingestFallbackLogs \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"dryRun": true}'
   ```

### API Reference

**Endpoint**: `POST /functions/v1/reingestFallbackLogs`

**Headers**:
```
Authorization: Bearer YOUR_ANON_KEY
Content-Type: application/json
```

**Request Body**:
```json
{
  "dryRun": false,    // Optional: Test run without changes
  "verbose": false,    // Optional: Detailed logging
  "force": false       // Optional: Force processing
}
```

**Response**:
```json
{
  "status": "success",
  "summary": {
    "totalFiles": 5,
    "successfulInserts": 4,
    "failedInserts": 1,
    "totalRecords": 5,
    "processingTime": 1250,
    "errors": ["file3.json: Invalid schema"]
  },
  "timestamp": "2024-01-15T04:00:00.000Z"
}
```

## Monitoring & Alerting

### GitHub Actions

**Success Notifications**:
- Slack message on successful completion
- Artifact uploads for logs
- Processing time tracking

**Failure Handling**:
- Automatic retry logic
- Detailed error reporting
- Failed log preservation

### Edge Function

**Logging**:
- Console logs in Supabase dashboard
- Error tracking via function logs
- Performance monitoring

**Health Checks**:
```bash
# Check function health
curl -X POST https://your-project.supabase.co/functions/v1/reingestFallbackLogs \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"dryRun": true}'
```

## Troubleshooting

### Common Issues

1. **No Fallback Logs Found**
   - Check `logs/audit-sync/` directory
   - Verify export jobs are running
   - Review fallback logging configuration

2. **Database Connection Errors**
   - Verify Supabase credentials
   - Check network connectivity
   - Validate service role permissions

3. **Duplicate Entry Errors**
   - Normal behavior for already processed logs
   - Check `audit_sync_status` table
   - Review duplicate detection logic

### Debug Commands

```bash
# Check fallback log directory
ls -la logs/audit-sync/

# Test database connection
npx ts-node scripts/cron/reingestFallbackLogs.ts --dry-run --verbose

# View recent audit sync status
psql -h your-db-host -U postgres -d postgres -c "
  SELECT timestamp, status, destination, error_message 
  FROM audit_sync_status 
  ORDER BY timestamp DESC 
  LIMIT 10;
"
```

## Security Considerations

### GitHub Actions
- ✅ Secrets stored securely in GitHub
- ✅ Service role key with minimal permissions
- ✅ No sensitive data in logs
- ✅ Artifact retention limits

### Edge Function
- ✅ Service role authentication required
- ✅ CORS headers properly configured
- ✅ Input validation and sanitization
- ✅ Error messages don't expose sensitive data

## Performance Optimization

### Batch Processing
- Process files in batches of 10-100
- Configurable batch size via environment
- Memory-efficient file handling

### Error Recovery
- Individual file error isolation
- Continue processing on partial failures
- Detailed error reporting per file

### Monitoring
- Processing time tracking
- Success/failure rate monitoring
- Resource usage optimization

## Future Enhancements

### Planned Features
- [ ] Real-time webhook notifications
- [ ] Advanced retry logic with exponential backoff
- [ ] Integration with external monitoring tools
- [ ] Automated cleanup of old archived files
- [ ] Performance metrics dashboard

### Integration Opportunities
- [ ] Slack bot for manual triggers
- [ ] Grafana dashboards for monitoring
- [ ] PagerDuty integration for critical failures
- [ ] Automated testing in CI/CD pipeline 