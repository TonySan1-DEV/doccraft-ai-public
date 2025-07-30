// MCP Context Block
/*
{
  file: "reportSyncFailure.ts",
  role: "alert-manager",
  allowedActions: ["notify", "log", "alert"],
  tier: "Admin",
  contentSensitivity: "high",
  theme: "monitoring"
}
*/

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Types
interface SyncFailureReport {
  time: string;
  error: string;
  context: string;
  retryCount?: number;
  exportType?: 's3' | 'bigquery';
  checkpointData?: any;
}

interface SlackMessage {
  text: string;
  attachments: Array<{
    color: string;
    title: string;
    fields: Array<{
      title: string;
      value: string;
      short: boolean;
    }>;
    footer?: string;
    ts?: number;
  }>;
}

interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

// Initialize Supabase client for incident logging
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Utility functions
function log(message: string, level: 'info' | 'error' | 'warn' = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  console.log(logMessage);
  
  // Write to alert log file
  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  fs.appendFileSync(
    path.join(logDir, `sync-failures-${new Date().toISOString().split('T')[0]}.log`),
    logMessage + '\n'
  );
}

function formatErrorForDisplay(error: string): string {
  // Truncate long errors and remove sensitive data
  let cleanError = error;
  
  // Remove potential sensitive data
  cleanError = cleanError.replace(/AWS_SECRET_ACCESS_KEY=[^&\s]+/g, 'AWS_SECRET_ACCESS_KEY=***');
  cleanError = cleanError.replace(/SUPABASE_SERVICE_ROLE_KEY=[^&\s]+/g, 'SUPABASE_SERVICE_ROLE_KEY=***');
  cleanError = cleanError.replace(/password[^&\s]*=[^&\s]+/gi, 'password=***');
  cleanError = cleanError.replace(/key[^&\s]*=[^&\s]+/gi, 'key=***');
  
  // Truncate if too long
  if (cleanError.length > 500) {
    cleanError = cleanError.substring(0, 500) + '... (truncated)';
  }
  
  return cleanError;
}

function getEnvironmentInfo(): string {
  const env = process.env.NODE_ENV || 'development';
  const region = process.env.AWS_REGION || 'unknown';
  const exportType = process.env.EXPORT_TYPE || 'unknown';
  
  return `${env.toUpperCase()} | ${region} | ${exportType.toUpperCase()}`;
}

// Slack Alert Function
async function sendSlackAlert(report: SyncFailureReport): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    log('SLACK_WEBHOOK_URL not configured, skipping Slack alert', 'warn');
    return;
  }
  
  try {
    const message: SlackMessage = {
      text: ':rotating_light: DocCraft-AI Audit Sync Failed',
      attachments: [
        {
          color: '#ff0000',
          title: 'Failure Details',
          fields: [
            {
              title: 'Time',
              value: new Date(report.time).toLocaleString(),
              short: true
            },
            {
              title: 'Environment',
              value: getEnvironmentInfo(),
              short: true
            },
            {
              title: 'Context',
              value: report.context,
              short: true
            },
            {
              title: 'Export Type',
              value: report.exportType || 'unknown',
              short: true
            },
            {
              title: 'Error',
              value: formatErrorForDisplay(report.error),
              short: false
            }
          ],
          footer: 'DocCraft-AI Audit Sync Monitor',
          ts: Math.floor(new Date(report.time).getTime() / 1000)
        }
      ]
    };
    
    // Add retry information if available
    if (report.retryCount && report.retryCount > 0) {
      message.attachments[0].fields.push({
        title: 'Retry Count',
        value: report.retryCount.toString(),
        short: true
      });
    }
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.status} ${response.statusText}`);
    }
    
    log('Slack alert sent successfully');
  } catch (error) {
    log(`Failed to send Slack alert: ${error}`, 'error');
    throw error;
  }
}

// Email Alert Function
async function sendEmailAlert(report: SyncFailureReport): Promise<void> {
  const emailConfig = {
    to: process.env.ALERT_EMAIL_TO || 'alerts@doccraft.ai',
    from: process.env.ALERT_EMAIL_FROM || 'noreply@doccraft.ai',
    subject: 'DocCraft-AI Audit Sync Failure Alert',
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  };
  
  // Check if email is configured
  if (!emailConfig.smtp.host || !emailConfig.smtp.auth.user) {
    log('Email configuration incomplete, skipping email alert', 'warn');
    return;
  }
  
  try {
    const emailMessage: EmailMessage = {
      to: emailConfig.to,
      subject: emailConfig.subject,
      body: `
Audit Sync Failure Alert

Time: ${new Date(report.time).toLocaleString()}
Context: ${report.context}
Environment: ${getEnvironmentInfo()}
Export Type: ${report.exportType || 'unknown'}
Retry Count: ${report.retryCount || 0}

Error Details:
${formatErrorForDisplay(report.error)}

This is an automated alert from the DocCraft-AI audit sync system.
      `.trim(),
      html: `
        <h2>🚨 DocCraft-AI Audit Sync Failure</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>Time:</strong></td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${new Date(report.time).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>Context:</strong></td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${report.context}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>Environment:</strong></td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${getEnvironmentInfo()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>Export Type:</strong></td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${report.exportType || 'unknown'}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>Retry Count:</strong></td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${report.retryCount || 0}</td>
          </tr>
        </table>
        <h3>Error Details:</h3>
        <pre style="background-color: #f8f9fa; padding: 12px; border-radius: 4px; overflow-x: auto;">${formatErrorForDisplay(report.error)}</pre>
        <p><em>This is an automated alert from the DocCraft-AI audit sync system.</em></p>
      `
    };
    
    // Use nodemailer if available, otherwise use a simple SMTP client
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransporter(emailConfig.smtp);
      
      await transporter.sendMail({
        from: emailConfig.from,
        to: emailMessage.to,
        subject: emailMessage.subject,
        text: emailMessage.body,
        html: emailMessage.html
      });
      
      log('Email alert sent successfully');
    } catch (nodemailerError) {
      // Fallback to simple SMTP if nodemailer not available
      log('Nodemailer not available, using fallback SMTP', 'warn');
      await sendEmailFallback(emailMessage, emailConfig.smtp);
    }
    
  } catch (error) {
    log(`Failed to send email alert: ${error}`, 'error');
    throw error;
  }
}

// Fallback email function (simple SMTP)
async function sendEmailFallback(message: EmailMessage, smtpConfig: any): Promise<void> {
  // This is a simplified SMTP implementation
  // In production, you'd want to use a proper SMTP library
  log('Email fallback not implemented, skipping email alert', 'warn');
}

// Incident Logging to Supabase
async function logIncidentToSupabase(report: SyncFailureReport): Promise<void> {
  try {
    const { error } = await supabase
      .from('sync_errors')
      .insert({
        error_type: 'audit_export_failure',
        error_message: formatErrorForDisplay(report.error),
        context: report.context,
        export_type: report.exportType,
        retry_count: report.retryCount || 0,
        environment: getEnvironmentInfo(),
        created_at: new Date().toISOString(),
        resolved_at: null,
        status: 'open'
      });
    
    if (error) {
      log(`Failed to log incident to Supabase: ${error.message}`, 'error');
    } else {
      log('Incident logged to Supabase successfully');
    }
  } catch (error) {
    log(`Failed to log incident to Supabase: ${error}`, 'error');
  }
}

// Duplicate Alert Suppression
function shouldSuppressAlert(report: SyncFailureReport): boolean {
  const alertCacheFile = path.join(__dirname, '..', 'cache', 'alert-suppression.json');
  const cacheDir = path.dirname(alertCacheFile);
  
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  
  try {
    let alertCache: Record<string, { count: number; lastAlert: string }> = {};
    
    if (fs.existsSync(alertCacheFile)) {
      alertCache = JSON.parse(fs.readFileSync(alertCacheFile, 'utf8'));
    }
    
    const alertKey = `${report.context}-${report.exportType}`;
    const now = new Date().getTime();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    
    if (alertCache[alertKey]) {
      const lastAlert = new Date(alertCache[alertKey].lastAlert).getTime();
      const count = alertCache[alertKey].count;
      
      // Suppress if same error within 1 hour and more than 3 alerts
      if (now - lastAlert < oneHour && count >= 3) {
        log(`Suppressing duplicate alert for ${alertKey}`, 'warn');
        return true;
      }
      
      // Reset count if more than 1 hour has passed
      if (now - lastAlert >= oneHour) {
        alertCache[alertKey].count = 1;
      } else {
        alertCache[alertKey].count += 1;
      }
    } else {
      alertCache[alertKey] = { count: 1, lastAlert: now.toString() };
    }
    
    alertCache[alertKey].lastAlert = now.toString();
    fs.writeFileSync(alertCacheFile, JSON.stringify(alertCache, null, 2));
    
    return false;
  } catch (error) {
    log(`Error checking alert suppression: ${error}`, 'error');
    return false;
  }
}

// Main reporting function
export async function reportSyncFailure(report: SyncFailureReport): Promise<void> {
  log(`Reporting sync failure: ${report.context} - ${report.error}`, 'error');
  
  try {
    // Check for alert suppression
    if (shouldSuppressAlert(report)) {
      log('Alert suppressed due to duplicate detection');
      return;
    }
    
    // Log incident to Supabase
    await logIncidentToSupabase(report);
    
    // Send alerts in parallel
    const alertPromises = [];
    
    // Slack alert
    alertPromises.push(
      sendSlackAlert(report).catch(error => {
        log(`Slack alert failed: ${error}`, 'error');
      })
    );
    
    // Email alert
    alertPromises.push(
      sendEmailAlert(report).catch(error => {
        log(`Email alert failed: ${error}`, 'error');
      })
    );
    
    // Wait for all alerts to complete
    await Promise.allSettled(alertPromises);
    
    log('Sync failure reported successfully');
  } catch (error) {
    log(`Failed to report sync failure: ${error}`, 'error');
    throw error;
  }
}

// Utility function to check if alerts are configured
export function isAlertingConfigured(): boolean {
  const hasSlack = !!process.env.SLACK_WEBHOOK_URL;
  const hasEmail = !!(process.env.SMTP_HOST && process.env.SMTP_USER);
  
  return hasSlack || hasEmail;
}

// Test function for alert system
export async function testAlertSystem(): Promise<void> {
  const testReport: SyncFailureReport = {
    time: new Date().toISOString(),
    error: 'Test error message for alert system validation',
    context: 'Test Alert System',
    exportType: 's3',
    retryCount: 1
  };
  
  log('Testing alert system...');
  await reportSyncFailure(testReport);
  log('Alert system test completed');
} 