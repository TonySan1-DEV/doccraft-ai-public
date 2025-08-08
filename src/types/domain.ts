/**
 * @fileoverview Domain-specific type definitions for audit and telemetry
 * @module src/types/domain
 */

/**
 * Structured audit details for logging events
 */
export interface AuditDetails {
  /** Resource identifier being audited */
  resourceId?: string;
  /** Resource type (e.g., 'pipeline', 'user', 'document') */
  resourceType?: string;
  /** Action-specific parameters */
  parameters?: Record<string, string | number | boolean | string[] | number[]>;
  /** User agent string */
  userAgent?: string;
  /** IP address (if available) */
  ipAddress?: string;
  /** Session identifier */
  sessionId?: string;
  /** Request timestamp */
  timestamp?: string;
  /** Error details if action failed */
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
  /** Performance metrics */
  performance?: {
    duration: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
  /** Security context */
  security?: {
    authenticationMethod?: string;
    permissions?: string[];
    riskLevel?: 'low' | 'medium' | 'high';
  };
  /** Business context */
  business?: {
    tier: string;
    featureFlags?: string[];
    usageQuota?: number;
    quotaRemaining?: number;
  };
  /** Custom metadata for extensibility */
  custom?: Record<string, string | number | boolean>;
}

/**
 * Structured telemetry metadata for analytics
 */
export interface TelemetryMetadata {
  /** User context */
  userId?: string;
  userTier?: 'Free' | 'Pro' | 'Enterprise';
  sessionId?: string;

  /** Application context */
  pageUrl?: string;
  componentName?: string;
  actionType?: string;

  /** Performance metrics */
  responseTime?: number;
  tokenCount?: number;
  errorCount?: number;

  /** Feature usage */
  featureFlags?: string[];
  enabledFeatures?: string[];

  /** Device/browser info */
  userAgent?: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;

  /** Network context */
  network?: {
    connectionType?: string;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };

  /** Error context */
  error?: {
    type: string;
    message: string;
    stack?: string;
    component?: string;
  };

  /** Usage context */
  usage?: {
    featureName?: string;
    action?: string;
    duration?: number;
    success?: boolean;
  };

  /** Custom data for extensibility */
  customData?: Record<string, string | number | boolean>;
}

/**
 * MCP (Model Context Protocol) context for audit events
 */
export interface MCPContext {
  /** User tier for access control */
  tier: 'Free' | 'Pro' | 'Enterprise' | 'Admin';
  /** User role for permissions */
  role: 'user' | 'admin' | 'moderator' | 'analyst';
  /** Allowed actions for this context */
  allowedActions: string[];
  /** Session timestamp */
  timestamp?: string;
  /** Request identifier */
  requestId?: string;
}

/**
 * Audit event with structured details
 */
export interface AuditEvent {
  /** User identifier */
  userId: string;
  /** Action being performed */
  action: string;
  /** Resource being acted upon */
  resource: string;
  /** Structured audit details */
  details?: AuditDetails;
  /** MCP context for validation */
  mcpContext: MCPContext;
}

/**
 * Telemetry event with structured metadata
 */
export interface TelemetryEvent {
  /** Event type identifier */
  event_type: string;
  /** User identifier */
  user_id?: string;
  /** Pipeline identifier */
  pipeline_id?: string;
  /** Access token */
  token?: string;
  /** Referrer URL */
  referrer?: string;
  /** User agent string */
  user_agent?: string;
  /** Structured telemetry metadata */
  metadata?: TelemetryMetadata;
  /** Event timestamp */
  timestamp?: string;
}

/**
 * Result of telemetry logging operation
 */
export interface TelemetryResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Event identifier if logged */
  event_id?: string;
  /** Error message if failed */
  error?: string;
}

/**
 * Audit log entry with structured data
 */
export interface AuditLog {
  /** Unique identifier */
  id: string;
  /** User identifier */
  user_id: string;
  /** Action performed */
  action: string;
  /** Resource acted upon */
  resource: string;
  /** Structured audit details */
  details: AuditDetails;
  /** Event timestamp */
  timestamp: string;
  /** User tier */
  tier: string;
  /** User role */
  role: string;
  /** MCP context as JSON */
  mcp_json: MCPContext;
  /** Creation timestamp */
  created_at: string;
}
