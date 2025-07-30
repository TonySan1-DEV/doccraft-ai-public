// MCP Context Block
/*
{
  file: "reingestFallbackLogs/config.ts",
  role: "config",
  allowedActions: ["configure", "validate"],
  tier: "Admin",
  contentSensitivity: "medium",
  theme: "configuration"
}
*/

export interface ReingestConfig {
  // Database settings
  supabaseUrl: string;
  supabaseServiceKey: string;
  
  // Processing settings
  maxRetries: number;
  batchSize: number;
  timeoutMs: number;
  
  // File system settings
  fallbackLogDir: string;
  archiveDir: string;
  
  // Feature flags
  enableDuplicateCheck: boolean;
  enableArchive: boolean;
  enableDryRun: boolean;
}

export function getConfig(): ReingestConfig {
  return {
    // Database settings
    supabaseUrl: Deno.env.get("SUPABASE_URL") || "",
    supabaseServiceKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    
    // Processing settings
    maxRetries: parseInt(Deno.env.get("REINGEST_MAX_RETRIES") || "3"),
    batchSize: parseInt(Deno.env.get("REINGEST_BATCH_SIZE") || "10"),
    timeoutMs: parseInt(Deno.env.get("REINGEST_TIMEOUT_MS") || "30000"),
    
    // File system settings
    fallbackLogDir: Deno.env.get("FALLBACK_LOG_DIR") || "/tmp/audit-sync",
    archiveDir: Deno.env.get("ARCHIVE_DIR") || "/tmp/audit-sync/archived",
    
    // Feature flags
    enableDuplicateCheck: Deno.env.get("ENABLE_DUPLICATE_CHECK") !== "false",
    enableArchive: Deno.env.get("ENABLE_ARCHIVE") !== "false",
    enableDryRun: Deno.env.get("ENABLE_DRY_RUN") === "true"
  };
}

export function validateConfig(config: ReingestConfig): string[] {
  const errors: string[] = [];
  
  if (!config.supabaseUrl) {
    errors.push("SUPABASE_URL is required");
  }
  
  if (!config.supabaseServiceKey) {
    errors.push("SUPABASE_SERVICE_ROLE_KEY is required");
  }
  
  if (config.maxRetries < 0 || config.maxRetries > 10) {
    errors.push("REINGEST_MAX_RETRIES must be between 0 and 10");
  }
  
  if (config.batchSize < 1 || config.batchSize > 100) {
    errors.push("REINGEST_BATCH_SIZE must be between 1 and 100");
  }
  
  if (config.timeoutMs < 1000 || config.timeoutMs > 300000) {
    errors.push("REINGEST_TIMEOUT_MS must be between 1000 and 300000");
  }
  
  return errors;
} 