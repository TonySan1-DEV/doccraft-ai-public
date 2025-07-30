// MCP Context Block
/*
{
  file: "exportAuditLogs.ts",
  role: "data-exporter",
  allowedActions: ["export", "sync", "backup"],
  tier: "Admin",
  contentSensitivity: "high",
  theme: "compliance"
}
*/

import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { BigQuery } from '@google-cloud/bigquery';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

import { reportSyncFailure } from './utils/reportSyncFailure';
import { logAuditSyncStatus } from './utils/logSyncStatus';

// Load environment variables
dotenv.config();

// Types
interface AuditLogEntry {
  id: string;
  pattern_id: string;
  action: 'approve' | 'reject' | 'revert';
  moderator_id: string;
  reason?: string;
  note?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

interface ExportCheckpoint {
  lastExportTimestamp: string;
  lastExportCount: number;
  lastExportDate: string;
  exportType: 's3' | 'bigquery';
  status: 'success' | 'failed';
  errorMessage?: string;
}

interface ExportConfig {
  type: 's3' | 'bigquery';
  s3Config?: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  bigQueryConfig?: {
    projectId: string;
    datasetId: string;
    tableId: string;
    keyFilename?: string;
  };
  checkpointPath: string;
  batchSize: number;
  retryAttempts: number;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize AWS S3 client
let s3Client: S3Client | null = null;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

// Initialize BigQuery client
let bigQueryClient: BigQuery | null = null;
if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
  bigQueryClient = new BigQuery({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
  });
}

// Utility functions
function log(message: string, level: 'info' | 'error' | 'warn' = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  console.log(logMessage);
  
  // Also write to log file
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  fs.appendFileSync(
    path.join(logDir, `export-audit-logs-${new Date().toISOString().split('T')[0]}.log`),
    logMessage + '\n'
  );
}

function getCheckpointPath(): string {
  return path.join(__dirname, 'checkpoints', 'audit-logs-export.json');
}

function loadCheckpoint(): ExportCheckpoint | null {
  try {
    const checkpointPath = getCheckpointPath();
    const checkpointDir = path.dirname(checkpointPath);
    
    if (!fs.existsSync(checkpointDir)) {
      fs.mkdirSync(checkpointDir, { recursive: true });
    }
    
    if (fs.existsSync(checkpointPath)) {
      const data = fs.readFileSync(checkpointPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    log(`Failed to load checkpoint: ${error}`, 'error');
  }
  
  return null;
}

function saveCheckpoint(checkpoint: ExportCheckpoint): void {
  try {
    const checkpointPath = getCheckpointPath();
    const checkpointDir = path.dirname(checkpointPath);
    
    if (!fs.existsSync(checkpointDir)) {
      fs.mkdirSync(checkpointDir, { recursive: true });
    }
    
    fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));
    log(`Checkpoint saved: ${checkpoint.lastExportTimestamp}`);
  } catch (error) {
    log(`Failed to save checkpoint: ${error}`, 'error');
    throw error;
  }
}

function getDefaultLastExportTime(): string {
  // Default to 24 hours ago if no checkpoint exists
  const defaultTime = new Date();
  defaultTime.setHours(defaultTime.getHours() - 24);
  return defaultTime.toISOString();
}

async function fetchNewAuditLogs(lastExportTimestamp: string): Promise<AuditLogEntry[]> {
  log(`Fetching audit logs since: ${lastExportTimestamp}`);
  
  try {
    const { data, error } = await supabase
      .from('pattern_moderation_log')
      .select('*')
      .gte('created_at', lastExportTimestamp)
      .order('created_at', { ascending: true });
    
    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }
    
    const logs = data || [];
    log(`Fetched ${logs.length} new audit log entries`);
    
    return logs;
  } catch (error) {
    log(`Failed to fetch audit logs: ${error}`, 'error');
    throw error;
  }
}

// Enhanced performExport function with detailed logging
async function performExport(config: ExportConfig): Promise<void> {
  const startTime = Date.now();
  log('Starting audit log export process');
  
  // Load checkpoint
  const checkpoint = loadCheckpoint();
  const lastExportTimestamp = checkpoint?.lastExportTimestamp || getDefaultLastExportTime();
  
  try {
    // Fetch new audit logs
    const logs = await fetchNewAuditLogs(lastExportTimestamp);
    
    if (logs.length === 0) {
      log('No new audit logs to export');
      
      // Log successful sync status even for no-op
      await logAuditSyncStatus({
        status: 'success',
        destination: config.type === 's3' ? 'S3' : 'BigQuery',
        durationMs: Date.now() - startTime,
        recordsExported: 0,
        environment: process.env.NODE_ENV || 'development',
        metadata: {
          exportType: config.type,
          noRecords: true,
          lastExportTimestamp
        }
      });
      
      return;
    }
    
    // Export based on configuration
    let exportedRecords = 0;
    
    if (config.type === 's3') {
      exportedRecords = await exportToS3(logs, config);
    } else if (config.type === 'bigquery') {
      exportedRecords = await exportToBigQuery(logs, config);
    } else {
      throw new Error(`Unsupported export type: ${config.type}`);
    }
    
    // Save successful checkpoint
    const newCheckpoint: ExportCheckpoint = {
      lastExportTimestamp: startTime.toISOString(),
      lastExportCount: logs.length,
      lastExportDate: startTime.toISOString().split('T')[0],
      exportType: config.type,
      status: 'success'
    };
    
    saveCheckpoint(newCheckpoint);
    log(`Export completed successfully: ${logs.length} records exported`);
    
    // Log successful sync status with actual record count
    await logAuditSyncStatus({
      status: 'success',
      destination: config.type === 's3' ? 'S3' : 'BigQuery',
      durationMs: Date.now() - startTime,
      recordsExported: exportedRecords,
      environment: process.env.NODE_ENV || 'development',
      metadata: {
        exportType: config.type,
        recordsProcessed: logs.length,
        exportedRecords,
        lastExportTimestamp,
        checkpoint: newCheckpoint
      }
    });
    
  } catch (error) {
    // Log failed sync status
    await logAuditSyncStatus({
      status: 'failure',
      destination: config.type === 's3' ? 'S3' : 'BigQuery',
      durationMs: Date.now() - startTime,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV || 'development',
      metadata: {
        exportType: config.type,
        lastExportTimestamp,
        stack: error instanceof Error ? error.stack : undefined
      }
    });
    
    throw error;
  }
}

// Enhanced export functions with record counting
async function exportToS3(logs: AuditLogEntry[], config: ExportConfig): Promise<number> {
  if (!s3Client) {
    throw new Error('S3 client not initialized - check AWS credentials');
  }
  
  if (!config.s3Config) {
    throw new Error('S3 configuration missing');
  }
  
  const { bucket, region } = config.s3Config;
  const now = new Date();
  const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `pattern_moderation_log_${now.toISOString().split('T')[0]}_${Date.now()}.json`;
  const key = `audit_logs/${datePath}/${fileName}`;
  
  log(`Exporting ${logs.length} logs to S3: s3://${bucket}/${key}`);
  
  try {
    // Convert to NDJSON format (one JSON object per line)
    const ndjsonContent = logs.map(log => JSON.stringify(log)).join('\n');
    
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: ndjsonContent,
      ContentType: 'application/json',
      Metadata: {
        'export-date': now.toISOString(),
        'record-count': logs.length.toString(),
        'source': 'doccraft-ai-audit-logs'
      }
    });
    
    await s3Client.send(command);
    log(`Successfully exported to S3: s3://${bucket}/${key}`);
    
    return logs.length;
  } catch (error) {
    log(`Failed to export to S3: ${error}`, 'error');
    throw error;
  }
}

async function exportToBigQuery(logs: AuditLogEntry[], config: ExportConfig): Promise<number> {
  if (!bigQueryClient) {
    throw new Error('BigQuery client not initialized - check Google Cloud credentials');
  }
  
  if (!config.bigQueryConfig) {
    throw new Error('BigQuery configuration missing');
  }
  
  const { projectId, datasetId, tableId } = config.bigQueryConfig;
  const dataset = bigQueryClient.dataset(datasetId);
  const table = dataset.table(tableId);
  
  log(`Exporting ${logs.length} logs to BigQuery: ${projectId}.${datasetId}.${tableId}`);
  
  try {
    // Transform data for BigQuery
    const rows = logs.map(log => ({
      ...log,
      created_at: new Date(log.created_at),
      updated_at: new Date(log.updated_at)
    }));
    
    const [job] = await table.insert(rows, {
      schema: {
        fields: [
          { name: 'id', type: 'STRING' },
          { name: 'pattern_id', type: 'STRING' },
          { name: 'action', type: 'STRING' },
          { name: 'moderator_id', type: 'STRING' },
          { name: 'reason', type: 'STRING' },
          { name: 'note', type: 'STRING' },
          { name: 'ip_address', type: 'STRING' },
          { name: 'user_agent', type: 'STRING' },
          { name: 'created_at', type: 'TIMESTAMP' },
          { name: 'updated_at', type: 'TIMESTAMP' }
        ]
      },
      ignoreUnknownValues: true
    });
    
    log(`Successfully exported to BigQuery: ${projectId}.${datasetId}.${tableId}`);
    
    return logs.length;
  } catch (error) {
    log(`Failed to export to BigQuery: ${error}`, 'error');
    throw error;
  }
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  const exportType = args[0] || process.env.EXPORT_TYPE || 's3';
  
  if (!['s3', 'bigquery'].includes(exportType)) {
    log('Invalid export type. Must be "s3" or "bigquery"', 'error');
    process.exit(1);
  }
  
  // Validate environment variables
  if (exportType === 's3') {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      log('AWS credentials not found in environment variables', 'error');
      process.exit(1);
    }
  } else if (exportType === 'bigquery') {
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
      log('Google Cloud Project ID not found in environment variables', 'error');
      process.exit(1);
    }
  }
  
  const config: ExportConfig = {
    type: exportType as 's3' | 'bigquery',
    s3Config: exportType === 's3' ? {
      bucket: process.env.AWS_S3_BUCKET || 'doccraft-audit-logs',
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    } : undefined,
    bigQueryConfig: exportType === 'bigquery' ? {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID!,
      datasetId: process.env.BIGQUERY_DATASET_ID || 'audit_logs',
      tableId: process.env.BIGQUERY_TABLE_ID || 'pattern_moderation_log',
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE
    } : undefined,
    checkpointPath: getCheckpointPath(),
    batchSize: parseInt(process.env.EXPORT_BATCH_SIZE || '1000'),
    retryAttempts: parseInt(process.env.EXPORT_RETRY_ATTEMPTS || '3')
  };
  
  const startTime = Date.now();
  
  try {
    await performExport(config);
    log('Export process completed successfully');
    
    // Log successful sync status
    await logAuditSyncStatus({
      status: 'success',
      destination: exportType === 's3' ? 'S3' : 'BigQuery',
      durationMs: Date.now() - startTime,
      recordsExported: 0, // Will be updated with actual count
      environment: process.env.NODE_ENV || 'development',
      metadata: {
        exportType,
        batchSize: config.batchSize,
        retryAttempts: config.retryAttempts,
        checkpointPath: config.checkpointPath
      }
    });
    
    process.exit(0);
  } catch (error) {
    log(`Export process failed: ${error}`, 'error');
    
    // Log failed sync status
    await logAuditSyncStatus({
      status: 'failure',
      destination: exportType === 's3' ? 'S3' : 'BigQuery',
      durationMs: Date.now() - startTime,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV || 'development',
      metadata: {
        exportType,
        batchSize: config.batchSize,
        retryAttempts: config.retryAttempts,
        checkpointPath: config.checkpointPath,
        stack: error instanceof Error ? error.stack : undefined
      }
    });
    
    // Report the failure to alert system
    try {
      await reportSyncFailure({
        time: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'Audit Export Cron',
        exportType: exportType as 's3' | 'bigquery',
        retryCount: 0
      });
    } catch (alertError) {
      log(`Failed to send alert: ${alertError}`, 'error');
    }
    
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

// Run the script if called directly
if (require.main === module) {
  main().catch(error => {
    log(`Unhandled error in main: ${error}`, 'error');
    process.exit(1);
  });
}

export { performExport, loadCheckpoint, saveCheckpoint }; 