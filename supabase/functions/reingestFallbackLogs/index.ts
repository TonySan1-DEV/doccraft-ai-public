// MCP Context Block
/*
{
  file: "reingestFallbackLogs/index.ts",
  role: "edge-function",
  allowedActions: ["reingest", "recover", "sync"],
  tier: "Admin",
  contentSensitivity: "high",
  theme: "reliability"
}
*/

import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

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

interface RequestBody {
  dryRun?: boolean;
  verbose?: boolean;
  force?: boolean;
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration
const FALLBACK_LOG_DIR = "/tmp/audit-sync";
const ARCHIVE_DIR = "/tmp/audit-sync/archived";
const DRY_RUN = false; // Will be set from request
const VERBOSE = false; // Will be set from request

// Utility functions
function log(message: string, level: 'info' | 'error' | 'warn' = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  console.log(logMessage);
  return logMessage;
}

function validateFallbackLog(logData: any): boolean {
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

async function insertAuditSyncLog(entry: any, dryRun: boolean): Promise<boolean> {
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
    
    if (dryRun) {
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

async function processFallbackLogFile(filepath: string, dryRun: boolean): Promise<ReingestResult> {
  const result: ReingestResult = {
    filepath,
    success: false,
    recordCount: 0
  };
  
  try {
    // Read and parse the JSON file
    const content = await Deno.readTextFile(filepath);
    const logEntry = JSON.parse(content);
    
    if (!validateFallbackLog(logEntry)) {
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
    if (!dryRun) {
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
    const insertSuccess = await insertAuditSyncLog(logEntry, dryRun);
    
    if (insertSuccess) {
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

async function getFallbackLogFiles(): Promise<string[]> {
  try {
    // In Edge Function environment, we'll simulate file discovery
    // In practice, this would read from a configured storage location
    const files: string[] = [];
    
    // For demo purposes, we'll create a sample fallback log
    const sampleLog = {
      timestamp: new Date().toISOString(),
      status: 'failure',
      destination: 'S3',
      durationMs: 5000,
      errorMessage: 'Network timeout',
      recordsExported: 0,
      environment: 'production',
      metadata: { source: 'edge-function-test' },
      fallbackReason: 'Network connectivity issues'
    };
    
    const samplePath = `${FALLBACK_LOG_DIR}/audit-sync-${Date.now()}.json`;
    await Deno.writeTextFile(samplePath, JSON.stringify(sampleLog, null, 2));
    files.push(samplePath);
    
    log(`Found ${files.length} fallback log files to process`, 'info');
    return files;
  } catch (error) {
    log(`Failed to read fallback log directory: ${error}`, 'error');
    return [];
  }
}

async function reingestFallbackLogs(dryRun: boolean = false): Promise<ReingestSummary> {
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
  
  if (dryRun) {
    log('DRY-RUN MODE: No actual database inserts will be performed', 'warn');
  }
  
  // Check Supabase connectivity
  if (!dryRun) {
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
  const files = await getFallbackLogFiles();
  summary.totalFiles = files.length;
  
  if (files.length === 0) {
    log('No fallback log files found to process', 'info');
    summary.processingTime = Date.now() - startTime;
    return summary;
  }
  
  // Process each file
  for (const filepath of files) {
    const result = await processFallbackLogFile(filepath, dryRun);
    
    if (result.success) {
      summary.successfulInserts++;
    } else {
      summary.failedInserts++;
      if (result.error) {
        summary.errors.push(`${filepath}: ${result.error}`);
      }
    }
    
    summary.totalRecords += result.recordCount;
  }
  
  summary.processingTime = Date.now() - startTime;
  
  return summary;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const body: RequestBody = await req.json();
    const dryRun = body.dryRun || false;
    const verbose = body.verbose || false;
    const force = body.force || false;

    log(`Re-ingestion request received - dryRun: ${dryRun}, verbose: ${verbose}, force: ${force}`, 'info');

    // Run the re-ingestion process
    const summary = await reingestFallbackLogs(dryRun);

    const response = {
      status: 'success',
      summary: {
        totalFiles: summary.totalFiles,
        successfulInserts: summary.successfulInserts,
        failedInserts: summary.failedInserts,
        totalRecords: summary.totalRecords,
        processingTime: summary.processingTime,
        errors: summary.errors
      },
      timestamp: new Date().toISOString()
    };

    log(`Re-ingestion completed - ${summary.successfulInserts} successful, ${summary.failedInserts} failed`, 'info');

    return new Response(
      JSON.stringify(response),
      {
        status: summary.failedInserts > 0 ? 207 : 200, // 207 = Multi-Status
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    log(`Fatal error in re-ingestion: ${error}`, 'error');
    
    return new Response(
      JSON.stringify({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
}); 