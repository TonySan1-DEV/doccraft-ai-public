// MCP Context Block
/*
{
  file: "notifyReingestionResult.ts",
  role: "notification",
  allowedActions: ["notify", "alert", "report"],
  tier: "Admin",
  contentSensitivity: "medium",
  theme: "monitoring"
}
*/

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Types
export interface ReingestionNotification {
  successCount: number;
  failureCount: number;
  totalFiles: number;
  durationMs: number;
  errorSummary?: string[];
  status: "success" | "partial" | "failure";
  jobId?: string;
  timestamp?: string;
}

export interface SlackMessage {
  text: string;
  attachments: SlackAttachment[];
}

export interface SlackAttachment {
  color: string;
  title: string;
  fields: SlackField[];
  footer?: string;
  ts?: number;
}

export interface SlackField {
  title: string;
  value: string;
  short: boolean;
}

export interface WebhookPayload {
  event: string;
  status: string;
  files: number;
  success: number;
  failed: number;
  durationMs: number;
  timestamp: string;
  jobId?: string;
  errorSummary?: string[];
}

// Configuration
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const NOTIFY_WEBHOOK_URL = process.env.NOTIFY_WEBHOOK_URL;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// Utility functions
function generateJobId(): string {
  return `reingest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function determineStatus(successCount: number, failureCount: number): "success" | "partial" | "failure" {
  if (failureCount === 0) return "success";
  if (successCount === 0) return "failure";
  return "partial";
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case "success": return "✅";
    case "partial": return "⚠️";
    case "failure": return "❌";
    default: return "ℹ️";
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "success": return "good";
    case "partial": return "warning";
    case "failure": return "danger";
    default: return "#439FE0";
  }
}

function truncateErrors(errors: string[], maxLength: number = 200): string[] {
  if (!errors || errors.length === 0) return [];
  
  const truncated = [];
  let totalLength = 0;
  
  for (const error of errors) {
    if (totalLength + error.length > maxLength) {
      truncated.push(`${error.substring(0, maxLength - totalLength)}...`);
      break;
    }
    truncated.push(error);
    totalLength += error.length;
  }
  
  return truncated;
}

// Slack notification
async function sendSlackNotification(notification: ReingestionNotification): Promise<boolean> {
  if (!SLACK_WEBHOOK_URL) {
    console.log('⚠️  SLACK_WEBHOOK_URL not configured, skipping Slack notification');
    return false;
  }

  try {
    const emoji = getStatusEmoji(notification.status);
    const color = getStatusColor(notification.status);
    const duration = formatDuration(notification.durationMs);
    
    const fields: SlackField[] = [
      { title: "Status", value: notification.status.toUpperCase(), short: true },
      { title: "Files Processed", value: notification.totalFiles.toString(), short: true },
      { title: "Successes", value: notification.successCount.toString(), short: true },
      { title: "Failures", value: notification.failureCount.toString(), short: true },
      { title: "Duration", value: duration, short: true },
      { title: "Environment", value: ENVIRONMENT, short: true }
    ];

    // Add job ID if available
    if (notification.jobId) {
      fields.push({ title: "Job ID", value: notification.jobId, short: true });
    }

    const attachment: SlackAttachment = {
      color,
      title: `${emoji} Fallback Re-ingestion Result`,
      fields,
      footer: `DocCraft-AI Audit System`,
      ts: Math.floor(Date.now() / 1000)
    };

    // Add error summary for failures/partial
    if (notification.errorSummary && notification.errorSummary.length > 0) {
      const truncatedErrors = truncateErrors(notification.errorSummary, 1000);
      attachment.fields.push({
        title: "Error Summary",
        value: truncatedErrors.join('\n'),
        short: false
      });
    }

    const message: SlackMessage = {
      text: `${emoji} Fallback audit log re-ingestion ${notification.status}`,
      attachments: [attachment]
    };

    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
    }

    console.log('✅ Slack notification sent successfully');
    return true;

  } catch (error) {
    console.error('❌ Failed to send Slack notification:', error);
    return false;
  }
}

// Webhook notification
async function sendWebhookNotification(notification: ReingestionNotification): Promise<boolean> {
  if (!NOTIFY_WEBHOOK_URL) {
    console.log('⚠️  NOTIFY_WEBHOOK_URL not configured, skipping webhook notification');
    return false;
  }

  try {
    const payload: WebhookPayload = {
      event: "audit_reingestion_result",
      status: notification.status,
      files: notification.totalFiles,
      success: notification.successCount,
      failed: notification.failureCount,
      durationMs: notification.durationMs,
      timestamp: notification.timestamp || new Date().toISOString(),
      jobId: notification.jobId,
      errorSummary: notification.errorSummary
    };

    const response = await fetch(NOTIFY_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status} ${response.statusText}`);
    }

    console.log('✅ Webhook notification sent successfully');
    return true;

  } catch (error) {
    console.error('❌ Failed to send webhook notification:', error);
    return false;
  }
}

// Main notification function
export async function notifyReingestionResult({
  successCount,
  failureCount,
  totalFiles,
  durationMs,
  errorSummary,
  status
}: {
  successCount: number;
  failureCount: number;
  totalFiles: number;
  durationMs: number;
  errorSummary?: string[];
  status: "success" | "partial" | "failure";
}): Promise<void> {
  const notification: ReingestionNotification = {
    successCount,
    failureCount,
    totalFiles,
    durationMs,
    errorSummary,
    status,
    jobId: generateJobId(),
    timestamp: new Date().toISOString()
  };

  console.log('\n📢 Sending re-ingestion notifications...');
  console.log(`Job ID: ${notification.jobId}`);
  console.log(`Status: ${notification.status}`);
  console.log(`Files: ${totalFiles}, Success: ${successCount}, Failed: ${failureCount}`);
  console.log(`Duration: ${formatDuration(durationMs)}`);

  // Send notifications in parallel
  const results = await Promise.allSettled([
    sendSlackNotification(notification),
    sendWebhookNotification(notification)
  ]);

  // Log results
  const [slackResult, webhookResult] = results;
  
  if (slackResult.status === 'fulfilled') {
    console.log(`Slack: ${slackResult.value ? '✅ Sent' : '❌ Failed'}`);
  } else {
    console.log(`Slack: ❌ Error - ${slackResult.reason}`);
  }

  if (webhookResult.status === 'fulfilled') {
    console.log(`Webhook: ${webhookResult.value ? '✅ Sent' : '❌ Failed'}`);
  } else {
    console.log(`Webhook: ❌ Error - ${webhookResult.reason}`);
  }

  // Log payload for debugging (in development)
  if (ENVIRONMENT === 'development') {
    console.log('\n🔍 Notification payload:');
    console.log(JSON.stringify(notification, null, 2));
  }
}

// Test function for development
export async function testNotification(): Promise<void> {
  console.log('🧪 Testing notification system...');
  
  await notifyReingestionResult({
    successCount: 14,
    failureCount: 1,
    totalFiles: 15,
    durationMs: 4100,
    errorSummary: ['file3.json: Invalid schema', 'file7.json: Database connection timeout'],
    status: 'partial'
  });
}

// Run test if called directly
if (require.main === module) {
  testNotification().catch(console.error);
} 