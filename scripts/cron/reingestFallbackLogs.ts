// MCP Context Block
/*
{
  file: "reingestFallbackLogs.ts",
  role: "recovery-tool",
  allowedActions: ["reingest", "recover", "sync"],
  tier: "Admin",
  contentSensitivity: "high",
  theme: "reliability"
}
*/

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { FallbackSyncLog } from './utils/fallbackJsonLogger';
import { notifyReingestionResult } from './utils/notifyReingestionResult';

// Load environment variables
dotenv.config();

// Types for re-ingestion
interface ReingestResult {
  filepath: string;
  success: boolean;
  error?: string;
  recordCount: number;
}

interface ReingestSummary {
  totalFiles: number;
  successfulInserts: number;
  failedInserts: number;
  totalRecords: number;
  errors: string[];
  processingTime: number;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration
const FALLBACK_LOG_DIR = path.join(process.cwd(), 'logs', 'audit-sync');
const ARCHIVE_DIR = path.join(FALLBACK_LOG_DIR, 'archived');
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Utility functions
function log(message: string, level: 'info' | 'error' | 'warn' = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  console.log(logMessage);
  
  // Also write to recovery log file
  const recoveryLogDir = path.join(process.cwd(), 'logs', 'recovery');
  if (!fs.existsSync(recoveryLogDir)) {
    fs.mkdirSync(recoveryLogDir, { recursive: true });
  }
  
  fs.appendFileSync(
    path.join(recoveryLogDir, `reingest-${new Date().toISOString().split('T')[0]}.log`),
    logMessage + '\n'
  );
}

function validateFallbackLog(logData: any): logData is FallbackSyncLog {
  // Check required fields
  if (!logData.timestamp || typeof logData.timestamp !== 'string') {
    return false;
  }
  
  if (!logData.status || !['success', 'failure'].includes(logData.status)) {
    return false;
  }
  
  if (!logData.destination || !['S3', 'BigQuery', 'Postgres', 'Azure'].includes(logData.destination)) {
    return false;
  }
  
  if (typeof logData.durationMs !== 'number' || logData.durationMs < 0) {
    return false;
  }
  
  return true;
}

function parseJsonFile(filepath: string): FallbackSyncLog | null {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const parsed = JSON.parse(content);
    
    if (!validateFallbackLog(parsed)) {
      log(`Invalid schema in file: ${filepath}`, 'error');
      return null;
    }
    
    return parsed as FallbackSyncLog;
  } catch (error) {
    log(`Failed to parse file ${filepath}: ${error}`, 'error');
    return null;
  }
}

async function insertAuditSyncLog(entry: FallbackSyncLog): Promise<boolean> {
  try {
    const record = {
      timestamp: entry.timestamp,
      status: entry.status,
      destination: entry.destination,
      duration_ms: entry.durationMs,
      error_message: entry.errorMessage || null,
      records_exported: entry.recordsExported || null,
      environment: entry.environment || null,
      metadata: {
        ...entry.metadata,
        reingestedFromFallback: true,
        reingestTimestamp: new Date().toISOString(),
        originalFallbackReason: entry.fallbackReason
      }
    };
    
    if (DRY_RUN) {
      log(`[DRY-RUN] Would insert: ${JSON.stringify(record, null, 2)}`, 'info');
      return true;
    }
    
    const { error } = await supabase
      .from('audit_sync_status')
      .insert(record);
    
    if (error) {
      log(`Supabase insert error: ${error.message}`, 'error');
      return false;
    }
    
    return true;
  } catch (error) {
    log(`Failed to insert audit sync log: ${error}`, 'error');
    return false;
  }
}

async function archiveFile(filepath: string): Promise<boolean> {
  try {
    if (DRY_RUN) {
      log(`[DRY-RUN] Would archive: ${filepath}`, 'info');
      return true;
    }
    
    // Ensure archive directory exists
    if (!fs.existsSync(ARCHIVE_DIR)) {
      fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
    }
    
    const filename = path.basename(filepath);
    const archivePath = path.join(ARCHIVE_DIR, filename);
    
    // Move file to archive
    fs.renameSync(filepath, archivePath);
    
    log(`Archived: ${filepath} → ${archivePath}`, 'info');
    return true;
  } catch (error) {
    log(`Failed to archive file ${filepath}: ${error}`, 'error');
    return false;
  }
}

function getFallbackLogFiles(): string[] {
  try {
    if (!fs.existsSync(FALLBACK_LOG_DIR)) {
      log(`Fallback log directory does not exist: ${FALLBACK_LOG_DIR}`, 'warn');
      return [];
    }
    
    const files = fs.readdirSync(FALLBACK_LOG_DIR)
      .filter(file => file.startsWith('audit-sync-') && file.endsWith('.json'))
      .map(file => path.join(FALLBACK_LOG_DIR, file))
      .sort(); // Process oldest files first
    
    log(`Found ${files.length} fallback log files to process`, 'info');
    return files;
  } catch (error) {
    log(`Failed to read fallback log directory: ${error}`, 'error');
    return [];
  }
}

async function processFallbackLogFile(filepath: string): Promise<ReingestResult> {
  const result: ReingestResult = {
    filepath,
    success: false,
    recordCount: 0
  };
  
  try {
    // Parse the JSON file
    const logEntry = parseJsonFile(filepath);
    
    if (!logEntry) {
      result.error = 'Invalid schema or parse error';
      return result;
    }
    
    result.recordCount = 1;
    
    if (VERBOSE) {
      log(`Processing: ${filepath}`, 'info');
      log(`  Status: ${logEntry.status}`, 'info');
      log(`  Destination: ${logEntry.destination}`, 'info');
      log(`  Duration: ${logEntry.durationMs}ms`, 'info');
    }
    
    // Check for potential duplicates (optional safety feature)
    if (!DRY_RUN) {
      const { data: existing } = await supabase
        .from('audit_sync_status')
        .select('id')
        .eq('timestamp', logEntry.timestamp)
        .eq('destination', logEntry.destination)
        .eq('status', logEntry.status)
        .limit(1);
      
      if (existing && existing.length > 0) {
        log(`Skipping duplicate entry: ${filepath}`, 'warn');
        result.success = true; // Consider it successful since it's already in DB
        return result;
      }
    }
    
    // Insert into Supabase
    const insertSuccess = await insertAuditSyncLog(logEntry);
    
    if (insertSuccess) {
      // Archive the file on successful insert
      const archiveSuccess = await archiveFile(filepath);
      
      if (!archiveSuccess) {
        log(`Warning: Failed to archive ${filepath} after successful insert`, 'warn');
      }
      
      result.success = true;
      log(`Successfully re-ingested: ${filepath}`, 'info');
    } else {
      result.error = 'Supabase insert failed';
      log(`Failed to re-ingest: ${filepath}`, 'error');
    }
    
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
    log(`Error processing ${filepath}: ${result.error}`, 'error');
  }
  
  return result;
}

async function reingestFallbackLogs(): Promise<ReingestSummary> {
  const startTime = Date.now();
  const summary: ReingestSummary = {
    totalFiles: 0,
    successfulInserts: 0,
    failedInserts: 0,
    totalRecords: 0,
    errors: [],
    processingTime: 0
  };
  
  log('Starting fallback log re-ingestion process', 'info');
  
  if (DRY_RUN) {
    log('DRY-RUN MODE: No actual database inserts will be performed', 'warn');
  }
  
  // Check Supabase connectivity
  if (!DRY_RUN) {
    try {
      const { error } = await supabase
        .from('audit_sync_status')
        .select('id')
        .limit(1);
      
      if (error) {
        log(`Supabase connectivity test failed: ${error.message}`, 'error');
        summary.errors.push(`Supabase connectivity failed: ${error.message}`);
        return summary;
      }
      
      log('Supabase connectivity confirmed', 'info');
    } catch (error) {
      log(`Supabase connectivity test failed: ${error}`, 'error');
      summary.errors.push(`Supabase connectivity failed: ${error}`);
      return summary;
    }
  }
  
  // Get all fallback log files
  const files = getFallbackLogFiles();
  summary.totalFiles = files.length;
  
  if (files.length === 0) {
    log('No fallback log files found to process', 'info');
    summary.processingTime = Date.now() - startTime;
    return summary;
  }
  
  // Process each file
  for (const filepath of files) {
    const result = await processFallbackLogFile(filepath);
    
    if (result.success) {
      summary.successfulInserts++;
    } else {
      summary.failedInserts++;
      if (result.error) {
        summary.errors.push(`${path.basename(filepath)}: ${result.error}`);
      }
    }
    
    summary.totalRecords += result.recordCount;
  }
  
  summary.processingTime = Date.now() - startTime;
  
  return summary;
}

function printSummary(summary: ReingestSummary): void {
  console.log('\n' + '='.repeat(60));
  console.log('FALLBACK LOG RE-INGESTION SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`Total Files Processed: ${summary.totalFiles}`);
  console.log(`Successful Inserts: ${summary.successfulInserts}`);
  console.log(`Failed Inserts: ${summary.failedInserts}`);
  console.log(`Total Records: ${summary.totalRecords}`);
  console.log(`Processing Time: ${summary.processingTime}ms`);
  
  if (summary.errors.length > 0) {
    console.log('\nErrors:');
    summary.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  if (DRY_RUN) {
    console.log('\n⚠️  DRY-RUN MODE: No actual changes were made');
  }
  
  console.log('='.repeat(60) + '\n');
}

// Main execution
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
      console.log(`
Fallback Log Re-ingestion Tool

Usage: ts-node reingestFallbackLogs.ts [options]

Options:
  --dry-run     Show what would be done without making changes
  --verbose     Show detailed processing information
  --help, -h    Show this help message

Examples:
  ts-node reingestFallbackLogs.ts                    # Normal execution
  ts-node reingestFallbackLogs.ts --dry-run         # Test run
  ts-node reingestFallbackLogs.ts --verbose         # Detailed output
      `);
      process.exit(0);
    }
    
    // Validate environment
    if (!supabaseUrl || !supabaseServiceKey) {
      log('Missing Supabase environment variables', 'error');
      process.exit(1);
    }
    
    // Run the re-ingestion process
    const summary = await reingestFallbackLogs();
    
    // Print summary
    printSummary(summary);
    
    // Send notifications (unless in dry-run mode)
    if (!DRY_RUN) {
      try {
        const status = summary.failedInserts === 0 ? 'success' : 
                      summary.successfulInserts === 0 ? 'failure' : 'partial';
        
        await notifyReingestionResult({
          successCount: summary.successfulInserts,
          failureCount: summary.failedInserts,
          totalFiles: summary.totalFiles,
          durationMs: summary.processingTime,
          errorSummary: summary.errors.length > 0 ? summary.errors : undefined,
          status
        });
      } catch (notificationError) {
        log(`Failed to send notifications: ${notificationError}`, 'error');
        // Don't fail the entire process for notification errors
      }
    } else {
      log('Skipping notifications in dry-run mode', 'info');
    }
    
    // Exit with appropriate code
    if (summary.failedInserts > 0) {
      log(`Re-ingestion completed with ${summary.failedInserts} failures`, 'warn');
      process.exit(1);
    } else {
      log('Re-ingestion completed successfully', 'info');
      process.exit(0);
    }
    
  } catch (error) {
    log(`Fatal error: ${error}`, 'error');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export {
  reingestFallbackLogs,
  processFallbackLogFile,
  parseJsonFile,
  insertAuditSyncLog,
  archiveFile,
  getFallbackLogFiles,
  validateFallbackLog
}; 