// MCP Context Block
/*
{
  file: "fallbackJsonLogger.ts",
  role: "fallback-logger",
  allowedActions: ["write", "backup", "persist"],
  tier: "Admin",
  contentSensitivity: "high",
  theme: "reliability"
}
*/

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Types for fallback sync logging
export interface FallbackSyncLog {
  timestamp: string;
  status: 'success' | 'failure';
  destination: 'S3' | 'BigQuery' | 'Postgres' | 'Azure';
  durationMs: number;
  errorMessage?: string;
  recordsExported?: number;
  environment?: string;
  metadata?: Record<string, any>;
  fallbackReason?: string;
}

export interface FallbackLogMetadata {
  stack?: string;
  jobId?: string;
  exportType?: string;
  batchSize?: number;
  retryAttempts?: number;
  checkpointPath?: string;
  supabaseError?: string;
  [key: string]: any;
}

// Utility functions
function ensureLogDirectory(): string {
  const logDir = path.join(process.cwd(), 'logs', 'audit-sync');
  
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    return logDir;
  } catch (error) {
    console.error(`Failed to create log directory: ${error}`);
    // Fallback to current directory if we can't create the logs directory
    return path.join(process.cwd(), 'audit-sync-fallback');
  }
}

function sanitizeForFilename(timestamp: string): string {
  return timestamp.replace(/[:.]/g, '-').replace(/[TZ]/g, '');
}

function getEnvironmentInfo(): string {
  const env = process.env.NODE_ENV || 'development';
  const region = process.env.AWS_REGION || process.env.GOOGLE_CLOUD_REGION || 'unknown';
  const project = process.env.GOOGLE_CLOUD_PROJECT_ID || 'unknown';
  
  return `${env.toUpperCase()} | ${region} | ${project}`;
}

function validateFallbackSyncLog(data: Partial<FallbackSyncLog>): boolean {
  // Validate required fields
  if (!data.status || !['success', 'failure'].includes(data.status)) {
    console.error('Invalid status: must be "success" or "failure"');
    return false;
  }
  
  if (!data.destination || !['S3', 'BigQuery', 'Postgres', 'Azure'].includes(data.destination)) {
    console.error('Invalid destination: must be "S3", "BigQuery", "Postgres", or "Azure"');
    return false;
  }
  
  if (typeof data.durationMs !== 'number' || data.durationMs < 0) {
    console.error('Invalid duration: must be a non-negative number');
    return false;
  }
  
  // Validate error message for failure status
  if (data.status === 'failure' && !data.errorMessage) {
    console.warn('Warning: failure status should include error message');
  }
  
  return true;
}

function sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> {
  if (!metadata) return {};
  
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === 'string') {
      // Remove sensitive data from string values
      let sanitizedValue = value;
      
      // Remove AWS credentials
      sanitizedValue = sanitizedValue.replace(/AWS_[A-Z_]+=[^&\s]+/g, 'AWS_***');
      
      // Remove Supabase credentials
      sanitizedValue = sanitizedValue.replace(/SUPABASE_[A-Z_]+=[^&\s]+/g, 'SUPABASE_***');
      
      // Remove Google Cloud credentials
      sanitizedValue = sanitizedValue.replace(/GOOGLE_[A-Z_]+=[^&\s]+/g, 'GOOGLE_***');
      
      // Remove passwords and keys
      sanitizedValue = sanitizedValue.replace(/password[^&\s]*=[^&\s]+/gi, 'password=***');
      sanitizedValue = sanitizedValue.replace(/key[^&\s]*=[^&\s]+/gi, 'key=***');
      sanitizedValue = sanitizedValue.replace(/secret[^&\s]*=[^&\s]+/gi, 'secret=***');
      
      // Truncate if too long
      if (sanitizedValue.length > 1000) {
        sanitizedValue = sanitizedValue.substring(0, 1000) + '... (truncated)';
      }
      
      sanitized[key] = sanitizedValue;
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Main fallback logging function
export async function writeFallbackSyncLog(data: {
  status: 'success' | 'failure';
  destination: 'S3' | 'BigQuery' | 'Postgres' | 'Azure';
  durationMs: number;
  errorMessage?: string;
  recordsExported?: number;
  environment?: string;
  metadata?: Record<string, any>;
  fallbackReason?: string;
}): Promise<void> {
  try {
    // Validate input
    if (!validateFallbackSyncLog(data)) {
      throw new Error('Invalid fallback sync log data');
    }
    
    // Ensure log directory exists
    const logDir = ensureLogDirectory();
    
    // Generate timestamp and filename
    const timestamp = new Date().toISOString();
    const sanitizedTimestamp = sanitizeForFilename(timestamp);
    const filename = `audit-sync-${sanitizedTimestamp}.json`;
    const filepath = path.join(logDir, filename);
    
    // Prepare log record
    const logRecord: FallbackSyncLog = {
      timestamp,
      status: data.status,
      destination: data.destination,
      durationMs: data.durationMs,
      errorMessage: data.errorMessage,
      recordsExported: data.recordsExported,
      environment: data.environment || getEnvironmentInfo(),
      metadata: sanitizeMetadata(data.metadata),
      fallbackReason: data.fallbackReason || 'Supabase insert failed'
    };
    
    // Write to file
    await fs.promises.writeFile(
      filepath,
      JSON.stringify(logRecord, null, 2),
      'utf8'
    );
    
    console.log(`Fallback sync log written: ${filepath}`);
    
  } catch (error) {
    console.error(`Failed to write fallback sync log: ${error}`);
    
    // Last resort: try to write to current directory
    try {
      const emergencyFile = path.join(process.cwd(), `emergency-sync-log-${Date.now()}.json`);
      const emergencyRecord = {
        timestamp: new Date().toISOString(),
        status: data.status,
        destination: data.destination,
        durationMs: data.durationMs,
        errorMessage: data.errorMessage,
        environment: data.environment || getEnvironmentInfo(),
        metadata: sanitizeMetadata(data.metadata),
        fallbackReason: data.fallbackReason || 'Supabase insert failed',
        emergencyWrite: true,
        originalError: error instanceof Error ? error.message : 'Unknown error'
      };
      
      await fs.promises.writeFile(
        emergencyFile,
        JSON.stringify(emergencyRecord, null, 2),
        'utf8'
      );
      
      console.log(`Emergency sync log written: ${emergencyFile}`);
    } catch (emergencyError) {
      console.error(`Failed to write emergency sync log: ${emergencyError}`);
      // At this point, we've exhausted all fallback options
      // The sync result is lost, but we've logged the attempt
    }
  }
}

// Utility function to read fallback logs
export async function readFallbackSyncLogs(
  limit: number = 100,
  status?: 'success' | 'failure',
  destination?: string
): Promise<FallbackSyncLog[]> {
  try {
    const logDir = path.join(process.cwd(), 'logs', 'audit-sync');
    
    if (!fs.existsSync(logDir)) {
      return [];
    }
    
    const files = fs.readdirSync(logDir)
      .filter(file => file.startsWith('audit-sync-') && file.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, limit);
    
    const logs: FallbackSyncLog[] = [];
    
    for (const file of files) {
      try {
        const filepath = path.join(logDir, file);
        const content = await fs.promises.readFile(filepath, 'utf8');
        const logRecord = JSON.parse(content) as FallbackSyncLog;
        
        // Apply filters
        if (status && logRecord.status !== status) continue;
        if (destination && logRecord.destination !== destination) continue;
        
        logs.push(logRecord);
      } catch (parseError) {
        console.error(`Failed to parse fallback log ${file}: ${parseError}`);
      }
    }
    
    return logs;
  } catch (error) {
    console.error(`Failed to read fallback sync logs: ${error}`);
    return [];
  }
}

// Utility function to get fallback log statistics
export async function getFallbackLogStatistics(): Promise<{
  totalLogs: number;
  successCount: number;
  failureCount: number;
  avgDurationMs: number;
  destinations: Record<string, number>;
  recentLogs: FallbackSyncLog[];
}> {
  try {
    const logs = await readFallbackSyncLogs(1000);
    
    const totalLogs = logs.length;
    const successCount = logs.filter(log => log.status === 'success').length;
    const failureCount = logs.filter(log => log.status === 'failure').length;
    const avgDurationMs = logs.length > 0 
      ? logs.reduce((sum, log) => sum + log.durationMs, 0) / logs.length 
      : 0;
    
    // Count by destination
    const destinations: Record<string, number> = {};
    logs.forEach(log => {
      destinations[log.destination] = (destinations[log.destination] || 0) + 1;
    });
    
    // Get recent logs (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogs = logs
      .filter(log => new Date(log.timestamp) > oneDayAgo)
      .slice(0, 10);
    
    return {
      totalLogs,
      successCount,
      failureCount,
      avgDurationMs,
      destinations,
      recentLogs
    };
  } catch (error) {
    console.error(`Failed to get fallback log statistics: ${error}`);
    return {
      totalLogs: 0,
      successCount: 0,
      failureCount: 0,
      avgDurationMs: 0,
      destinations: {},
      recentLogs: []
    };
  }
}

// Utility function to clean old fallback logs
export async function cleanupOldFallbackLogs(daysToKeep: number = 30): Promise<number> {
  try {
    const logDir = path.join(process.cwd(), 'logs', 'audit-sync');
    
    if (!fs.existsSync(logDir)) {
      return 0;
    }
    
    const files = fs.readdirSync(logDir)
      .filter(file => file.startsWith('audit-sync-') && file.endsWith('.json'));
    
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    let deletedCount = 0;
    
    for (const file of files) {
      try {
        const filepath = path.join(logDir, file);
        const content = await fs.promises.readFile(filepath, 'utf8');
        const logRecord = JSON.parse(content) as FallbackSyncLog;
        
        if (new Date(logRecord.timestamp) < cutoffDate) {
          await fs.promises.unlink(filepath);
          deletedCount++;
        }
      } catch (error) {
        console.error(`Failed to process fallback log ${file}: ${error}`);
      }
    }
    
    console.log(`Cleaned up ${deletedCount} old fallback logs`);
    return deletedCount;
  } catch (error) {
    console.error(`Failed to cleanup old fallback logs: ${error}`);
    return 0;
  }
}

// Utility function to sync fallback logs to Supabase (for recovery)
export async function syncFallbackLogsToSupabase(
  supabaseClient: any,
  batchSize: number = 50
): Promise<{ synced: number; errors: number }> {
  try {
    const logs = await readFallbackSyncLogs(1000);
    let synced = 0;
    let errors = 0;
    
    // Process in batches
    for (let i = 0; i < logs.length; i += batchSize) {
      const batch = logs.slice(i, i + batchSize);
      
      try {
        const records = batch.map(log => ({
          timestamp: log.timestamp,
          status: log.status,
          destination: log.destination,
          duration_ms: log.durationMs,
          error_message: log.errorMessage,
          records_exported: log.recordsExported,
          environment: log.environment,
          metadata: {
            ...log.metadata,
            fallbackReason: log.fallbackReason,
            syncedFromFallback: true,
            syncTimestamp: new Date().toISOString()
          }
        }));
        
        const { error } = await supabaseClient
          .from('audit_sync_status')
          .insert(records);
        
        if (error) {
          console.error(`Failed to sync batch ${i / batchSize + 1}: ${error.message}`);
          errors += batch.length;
        } else {
          synced += batch.length;
        }
      } catch (batchError) {
        console.error(`Failed to sync batch ${i / batchSize + 1}: ${batchError}`);
        errors += batch.length;
      }
    }
    
    console.log(`Synced ${synced} fallback logs to Supabase (${errors} errors)`);
    return { synced, errors };
  } catch (error) {
    console.error(`Failed to sync fallback logs to Supabase: ${error}`);
    return { synced: 0, errors: 1 };
  }
}

// Test function for fallback logging
export async function testFallbackSyncLogging(): Promise<void> {
  const testData = {
    status: 'success' as const,
    destination: 'S3' as const,
    durationMs: 1500,
    recordsExported: 1000,
    environment: 'test',
    metadata: {
      test: true,
      timestamp: new Date().toISOString()
    },
    fallbackReason: 'Test fallback logging'
  };
  
  console.log('Testing fallback sync logging...');
  await writeFallbackSyncLog(testData);
  console.log('Fallback sync logging test completed');
} 