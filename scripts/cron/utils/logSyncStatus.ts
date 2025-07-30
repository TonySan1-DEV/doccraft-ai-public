// MCP Context Block
/*
{
  file: "logSyncStatus.ts",
  role: "sync-logger",
  allowedActions: ["log", "track", "monitor"],
  tier: "Admin",
  contentSensitivity: "high",
  theme: "monitoring"
}
*/

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { writeFallbackSyncLog } from './fallbackJsonLogger';

// Load environment variables
dotenv.config();

// Types for sync status logging
export interface AuditSyncStatusLog {
  status: 'success' | 'failure';
  destination: 'S3' | 'BigQuery' | 'Postgres' | 'Azure';
  durationMs: number;
  errorMessage?: string;
  recordsExported?: number;
  environment?: string;
  metadata?: Record<string, any>;
}

export interface SyncStatusRecord {
  id: string;
  timestamp: string;
  status: 'success' | 'failure';
  destination: 'S3' | 'BigQuery' | 'Postgres' | 'Azure';
  duration_ms: number;
  error_message?: string;
  records_exported?: number;
  environment?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Utility functions
function log(message: string, level: 'info' | 'error' | 'warn' = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  console.log(logMessage);
  
  // Write to sync log file
  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  fs.appendFileSync(
    path.join(logDir, `sync-status-${new Date().toISOString().split('T')[0]}.log`),
    logMessage + '\n'
  );
}

function sanitizeErrorMessage(errorMessage?: string): string | null {
  if (!errorMessage) return null;
  
  // Remove sensitive data from error messages
  let sanitized = errorMessage;
  
  // Remove AWS credentials
  sanitized = sanitized.replace(/AWS_[A-Z_]+=[^&\s]+/g, 'AWS_***');
  
  // Remove Supabase credentials
  sanitized = sanitized.replace(/SUPABASE_[A-Z_]+=[^&\s]+/g, 'SUPABASE_***');
  
  // Remove Google Cloud credentials
  sanitized = sanitized.replace(/GOOGLE_[A-Z_]+=[^&\s]+/g, 'GOOGLE_***');
  
  // Remove passwords and keys
  sanitized = sanitized.replace(/password[^&\s]*=[^&\s]+/gi, 'password=***');
  sanitized = sanitized.replace(/key[^&\s]*=[^&\s]+/gi, 'key=***');
  sanitized = sanitized.replace(/secret[^&\s]*=[^&\s]+/gi, 'secret=***');
  
  // Truncate if too long
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000) + '... (truncated)';
  }
  
  return sanitized;
}

function getEnvironmentInfo(): string {
  const env = process.env.NODE_ENV || 'development';
  const region = process.env.AWS_REGION || process.env.GOOGLE_CLOUD_REGION || 'unknown';
  const project = process.env.GOOGLE_CLOUD_PROJECT_ID || 'unknown';
  
  return `${env.toUpperCase()} | ${region} | ${project}`;
}

function validateSyncStatusLog(logData: AuditSyncStatusLog): boolean {
  // Validate required fields
  if (!logData.status || !['success', 'failure'].includes(logData.status)) {
    log('Invalid status: must be "success" or "failure"', 'error');
    return false;
  }
  
  if (!logData.destination || !['S3', 'BigQuery', 'Postgres', 'Azure'].includes(logData.destination)) {
    log('Invalid destination: must be "S3", "BigQuery", "Postgres", or "Azure"', 'error');
    return false;
  }
  
  if (typeof logData.durationMs !== 'number' || logData.durationMs < 0) {
    log('Invalid duration: must be a non-negative number', 'error');
    return false;
  }
  
  // Validate error message for failure status
  if (logData.status === 'failure' && !logData.errorMessage) {
    log('Warning: failure status should include error message', 'warn');
  }
  
  return true;
}

// Main logging function
export async function logAuditSyncStatus(logData: AuditSyncStatusLog): Promise<void> {
  log(`Logging sync status: ${logData.status} to ${logData.destination} (${logData.durationMs}ms)`, 'info');
  
  try {
    // Validate input
    if (!validateSyncStatusLog(logData)) {
      throw new Error('Invalid sync status log data');
    }
    
    // Sanitize error message
    const sanitizedErrorMessage = sanitizeErrorMessage(logData.errorMessage);
    
    // Prepare record for Supabase
    const record = {
      status: logData.status,
      destination: logData.destination,
      duration_ms: logData.durationMs,
      error_message: sanitizedErrorMessage,
      records_exported: logData.recordsExported || null,
      environment: logData.environment || getEnvironmentInfo(),
      metadata: logData.metadata || {},
      timestamp: new Date().toISOString()
    };
    
    // Insert into Supabase
    const { data, error } = await supabase
      .from('audit_sync_status')
      .insert(record)
      .select('*')
      .single();
    
    if (error) {
      log(`Supabase insert error: ${error.message}`, 'error');
      
      // Write fallback log when Supabase insert fails
      console.warn("Supabase insert failed — writing fallback log.");
      await writeFallbackSyncLog({
        status: logData.status,
        destination: logData.destination,
        durationMs: logData.durationMs,
        errorMessage: logData.errorMessage,
        recordsExported: logData.recordsExported,
        environment: logData.environment,
        metadata: {
          ...logData.metadata,
          supabaseError: error.message,
          supabaseErrorCode: error.code,
          supabaseErrorDetails: error.details
        },
        fallbackReason: `Supabase insert failed: ${error.message}`
      });
      
      throw new Error(`Failed to log sync status: ${error.message}`);
    }
    
    log(`Sync status logged successfully: ${data.id}`, 'info');
    
    // Log additional metadata if available
    if (logData.metadata && Object.keys(logData.metadata).length > 0) {
      log(`Additional metadata: ${JSON.stringify(logData.metadata)}`, 'info');
    }
    
  } catch (error) {
    log(`Error logging sync status: ${error}`, 'error');
    
    // Additional fallback: log to local file (legacy method)
    await logToFallbackFile(logData, error instanceof Error ? error.message : 'Unknown error');
    
    // Don't throw the error to avoid breaking the main operation
    // but log it for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error details:', {
        logData,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }
}

// Fallback logging to local file
async function logToFallbackFile(logData: AuditSyncStatusLog, errorMessage: string): Promise<void> {
  try {
    const fallbackDir = path.join(__dirname, '..', 'fallback-logs');
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    
    const fallbackRecord = {
      timestamp: new Date().toISOString(),
      status: logData.status,
      destination: logData.destination,
      duration_ms: logData.durationMs,
      error_message: sanitizeErrorMessage(logData.errorMessage),
      records_exported: logData.recordsExported,
      environment: logData.environment || getEnvironmentInfo(),
      metadata: logData.metadata || {},
      fallback_error: errorMessage
    };
    
    const fallbackFile = path.join(fallbackDir, `sync-status-fallback-${new Date().toISOString().split('T')[0]}.json`);
    
    // Append to fallback file
    const existingData = fs.existsSync(fallbackFile) 
      ? JSON.parse(fs.readFileSync(fallbackFile, 'utf8')) 
      : [];
    
    existingData.push(fallbackRecord);
    fs.writeFileSync(fallbackFile, JSON.stringify(existingData, null, 2));
    
    log(`Sync status logged to fallback file: ${fallbackFile}`, 'warn');
  } catch (fallbackError) {
    log(`Failed to write fallback log: ${fallbackError}`, 'error');
  }
}

// Utility function to retrieve sync status history
export async function getSyncStatusHistory(
  limit: number = 100,
  status?: 'success' | 'failure',
  destination?: string,
  environment?: string
): Promise<SyncStatusRecord[]> {
  try {
    let query = supabase
      .from('audit_sync_status')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (destination) {
      query = query.eq('destination', destination);
    }
    
    if (environment) {
      query = query.eq('environment', environment);
    }
    
    const { data, error } = await query;
    
    if (error) {
      log(`Error fetching sync status history: ${error.message}`, 'error');
      throw new Error(`Failed to fetch sync status history: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    log(`Error in getSyncStatusHistory: ${error}`, 'error');
    return [];
  }
}

// Utility function to get sync statistics
export async function getSyncStatistics(
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalSyncs: number;
  successCount: number;
  failureCount: number;
  avgDurationMs: number;
  successRate: number;
  recentFailures: SyncStatusRecord[];
}> {
  try {
    let query = supabase
      .from('audit_sync_status')
      .select('*');
    
    if (startDate) {
      query = query.gte('timestamp', startDate.toISOString());
    }
    
    if (endDate) {
      query = query.lte('timestamp', endDate.toISOString());
    }
    
    const { data, error } = await query;
    
    if (error) {
      log(`Error fetching sync statistics: ${error.message}`, 'error');
      throw new Error(`Failed to fetch sync statistics: ${error.message}`);
    }
    
    const syncs = data || [];
    const totalSyncs = syncs.length;
    const successCount = syncs.filter(s => s.status === 'success').length;
    const failureCount = syncs.filter(s => s.status === 'failure').length;
    const avgDurationMs = syncs.length > 0 
      ? syncs.reduce((sum, s) => sum + s.duration_ms, 0) / syncs.length 
      : 0;
    const successRate = totalSyncs > 0 ? (successCount / totalSyncs) * 100 : 0;
    
    // Get recent failures (last 24 hours)
    const recentFailures = syncs
      .filter(s => s.status === 'failure' && 
        new Date(s.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000))
      .slice(0, 10);
    
    return {
      totalSyncs,
      successCount,
      failureCount,
      avgDurationMs,
      successRate,
      recentFailures
    };
  } catch (error) {
    log(`Error in getSyncStatistics: ${error}`, 'error');
    return {
      totalSyncs: 0,
      successCount: 0,
      failureCount: 0,
      avgDurationMs: 0,
      successRate: 0,
      recentFailures: []
    };
  }
}

// Utility function to check if logging is configured
export function isLoggingConfigured(): boolean {
  return !!(supabaseUrl && supabaseServiceKey);
}

// Test function for sync status logging
export async function testSyncStatusLogging(): Promise<void> {
  const testData: AuditSyncStatusLog = {
    status: 'success',
    destination: 'S3',
    durationMs: 1500,
    recordsExported: 1000,
    environment: 'test',
    metadata: {
      test: true,
      timestamp: new Date().toISOString()
    }
  };
  
  log('Testing sync status logging...', 'info');
  await logAuditSyncStatus(testData);
  log('Sync status logging test completed', 'info');
} 