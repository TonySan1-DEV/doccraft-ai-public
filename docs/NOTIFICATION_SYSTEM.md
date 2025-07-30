# Notification System for Audit Re-ingestion

## Overview

DocCraft-AI's notification system provides real-time operational visibility for audit log re-ingestion jobs. It supports multiple notification channels and comprehensive error reporting.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Re-ingestion    │───▶│ Notification      │───▶│ Slack Channel   │
│ Job Complete    │    │ System           │    │ (Primary)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ Generic Webhook  │
                       │ (Secondary)      │
                       └──────────────────┘
```

## Notification Channels

### 1. Slack (Primary)

**Configuration**: `SLACK_WEBHOOK_URL` environment variable

**Message Format**:
```json
{
  "text": "✅ Fallback audit log re-ingestion success",
  "attachments": [
    {
      "color": "good",
      "title": "✅ Fallback Re-ingestion Result",
      "fields": [
        { "title": "Status", "value": "SUCCESS", "short": true },
        { "title": "Files Processed", "value": "15", "short": true },
        { "title": "Successes", "value": "14", "short": true },
        { "title": "Failures", "value": "1", "short": true },
        { "title": "Duration", "value": "4.1s", "short": true },
        { "title": "Environment", "value": "production", "short": true },
        { "title": "Job ID", "value": "reingest-1705123456789-abc123", "short": true }
      ],
      "footer": "DocCraft-AI Audit System",
      "ts": 1705123456
    }
  ]
}
```

**Status Colors**:
- 🟢 **Success**: `good` (green)
- 🟡 **Partial**: `warning` (yellow) 
- 🔴 **Failure**: `danger` (red)

### 2. Generic Webhook (Secondary)

**Configuration**: `NOTIFY_WEBHOOK_URL` environment variable

**Payload Format**:
```json
{
  "event": "audit_reingestion_result",
  "status": "partial",
  "files": 15,
  "success": 14,
  "failed": 1,
  "durationMs": 4100,
  "timestamp": "2024-01-15T04:00:00.000Z",
  "jobId": "reingest-1705123456789-abc123",
  "errorSummary": [
    "file3.json: Invalid schema"
  ]
}
```

## Setup Instructions

### 1. Slack Webhook Setup

1. **Create Slack App**:
   - Go to https://api.slack.com/apps
   - Click "Create New App" → "From scratch"
   - Name: "DocCraft-AI Audit Notifications"

2. **Configure Incoming Webhooks**:
   - Go to "Incoming Webhooks"
   - Toggle "Activate Incoming Webhooks"
   - Click "Add New Webhook to Workspace"
   - Select channel: `#audit-alerts` (or your preferred channel)
   - Copy the webhook URL

3. **Set Environment Variable**:
   ```bash
   export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
   ```

### 2. Generic Webhook Setup (Optional)

1. **Create Webhook Endpoint**:
   - Set up an HTTP endpoint to receive notifications
   - Ensure it can handle POST requests with JSON payloads

2. **Set Environment Variable**:
   ```bash
   export NOTIFY_WEBHOOK_URL="https://your-webhook-endpoint.com/notify"
   ```

### 3. GitHub Actions Integration

Add secrets to your GitHub repository:

1. Go to Settings → Secrets and variables → Actions
2. Add these secrets:
   ```
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   NOTIFY_WEBHOOK_URL=https://your-webhook-endpoint.com/notify
   ```

### 4. Local Development

Create a `.env` file in your project root:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Notifications (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
NOTIFY_WEBHOOK_URL=https://your-webhook-endpoint.com/notify

# Environment
NODE_ENV=development
```

## Usage Examples

### 1. Manual Testing

```bash
# Test notification system
node scripts/test-notifications.js

# Test specific scenario
node -e "
const { notifyReingestionResult } = require('./scripts/cron/utils/notifyReingestionResult');
notifyReingestionResult({
  successCount: 10,
  failureCount: 2,
  totalFiles: 12,
  durationMs: 3000,
  errorSummary: ['file1.json: Error 1', 'file2.json: Error 2'],
  status: 'partial'
});
"
```

### 2. GitHub Actions

The notification system is automatically integrated into the re-ingestion workflow:

```yaml
# .github/workflows/reingest-audit-logs.yml
- name: Run re-ingestion script
  run: npx ts-node scripts/cron/reingestFallbackLogs.ts
  env:
    NODE_ENV: production
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
    NOTIFY_WEBHOOK_URL: ${{ secrets.NOTIFY_WEBHOOK_URL }}
```

### 3. Supabase Edge Function

```typescript
// supabase/functions/reingestFallbackLogs/index.ts
import { notifyReingestionResult } from '../../scripts/cron/utils/notifyReingestionResult';

// After processing
await notifyReingestionResult({
  successCount: summary.successfulInserts,
  failureCount: summary.failedInserts,
  totalFiles: summary.totalFiles,
  durationMs: summary.processingTime,
  errorSummary: summary.errors,
  status: determineStatus(summary.successfulInserts, summary.failedInserts)
});
```

## Message Types

### Success Notification
- **Trigger**: All files processed successfully
- **Color**: Green
- **Icon**: ✅
- **Content**: Summary of successful processing

### Partial Success Notification
- **Trigger**: Some files succeeded, some failed
- **Color**: Yellow
- **Icon**: ⚠️
- **Content**: Success/failure counts + error summary

### Failure Notification
- **Trigger**: All files failed to process
- **Color**: Red
- **Icon**: ❌
- **Content**: Failure count + detailed error summary

## Error Handling

### Notification Failures
- Notifications are sent in parallel
- Individual notification failures don't stop the process
- All errors are logged to console
- Graceful degradation if webhooks are unavailable

### Rate Limiting
- Built-in delays between tests (2 seconds)
- Error truncation for large error summaries
- Respects webhook rate limits

### Security
- No sensitive data in notifications
- Error messages are sanitized
- Job IDs are randomly generated
- Environment-specific configurations

## Monitoring & Debugging

### 1. Check Notification Status

```bash
# View notification logs
tail -f logs/recovery/reingest-*.log | grep "notification"

# Test webhook connectivity
curl -X POST $SLACK_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text":"Test notification"}'
```

### 2. Debug Mode

Set `NODE_ENV=development` to see detailed payloads:

```bash
export NODE_ENV=development
node scripts/test-notifications.js
```

### 3. Common Issues

**Slack Notifications Not Working**:
- Verify webhook URL is correct
- Check Slack app permissions
- Ensure channel exists and bot has access

**Webhook Timeouts**:
- Increase timeout in webhook configuration
- Check network connectivity
- Verify endpoint is accessible

**Rate Limiting**:
- Add delays between notifications
- Implement exponential backoff
- Monitor webhook quotas

## Advanced Configuration

### Custom Message Formatting

Modify `scripts/cron/utils/notifyReingestionResult.ts`:

```typescript
// Custom Slack message format
const customMessage: SlackMessage = {
  text: `🚀 DocCraft-AI: ${notification.status.toUpperCase()}`,
  attachments: [{
    color: getStatusColor(notification.status),
    title: 'Custom Title',
    fields: customFields
  }]
};
```

### Multiple Slack Channels

```typescript
// Send to multiple channels
const channels = ['#audit-alerts', '#ops-alerts'];
for (const channel of channels) {
  await sendSlackNotification(notification, channel);
}
```

### Custom Webhook Headers

```typescript
// Add custom headers
const response = await fetch(NOTIFY_WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'DocCraft-AI',
    'Authorization': 'Bearer your-token'
  },
  body: JSON.stringify(payload)
});
```

## Best Practices

### 1. Security
- Use environment variables for sensitive data
- Validate webhook URLs
- Implement proper error handling
- Sanitize error messages

### 2. Reliability
- Send notifications in parallel
- Don't fail the main process for notification errors
- Implement retry logic for failed notifications
- Log all notification attempts

### 3. Monitoring
- Track notification success rates
- Monitor webhook response times
- Set up alerts for notification failures
- Regular testing of notification channels

### 4. Performance
- Keep payloads small and focused
- Truncate long error messages
- Use appropriate timeouts
- Implement rate limiting

## Troubleshooting

### Notification Not Sent
1. Check environment variables
2. Verify webhook URLs are valid
3. Test network connectivity
4. Check console logs for errors

### Duplicate Notifications
1. Ensure job IDs are unique
2. Check for multiple execution
3. Verify notification logic

### Rate Limiting Issues
1. Add delays between notifications
2. Implement exponential backoff
3. Monitor webhook quotas
4. Use multiple webhook endpoints

## Future Enhancements

### Planned Features
- [ ] Email notifications
- [ ] SMS alerts for critical failures
- [ ] PagerDuty integration
- [ ] Custom notification templates
- [ ] Notification preferences per user
- [ ] A/B testing for message formats

### Integration Opportunities
- [ ] Grafana dashboards
- [ ] Prometheus metrics
- [ ] ELK stack logging
- [ ] Custom alerting rules
- [ ] Notification analytics 