# Prompt Moderation System Documentation

## Overview

The Prompt Moderation System is a comprehensive solution for safely managing user-submitted prompt patterns in DocCraft-AI. It provides role-based approval workflows, audit trails, and security controls to ensure only safe and appropriate patterns are injected into the AI system.

### Key Components

- **Pattern Submission**: User interface for submitting custom patterns
- **Moderation Workflow**: Role-based approval system
- **Audit Trail**: Comprehensive logging of all pattern activities
- **Security Controls**: MCP enforcement and injection sanitization
- **Export System**: Automated audit log exports for compliance

## 1. User-Submitted Patterns Workflow

### Pattern Storage Schema

```sql
-- User-submitted patterns table
CREATE TABLE user_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  moderation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pattern data schema
CREATE TYPE pattern_status AS ENUM ('pending', 'approved', 'rejected');

-- Indexes for performance
CREATE INDEX idx_user_patterns_user_id ON user_patterns(user_id);
CREATE INDEX idx_user_patterns_status ON user_patterns(status);
CREATE INDEX idx_user_patterns_submitted_at ON user_patterns(submitted_at);
```

### Required Pattern Schema

```typescript
interface UserPattern {
  genre: string;
  tone: string;
  arcs: string[];
  template: string;
  description?: string;
  tags?: string[];
  language?: string;
}

interface PatternSubmission {
  pattern: UserPattern;
  userId: string;
  userEmail: string;
  userRole: string;
  ipAddress: string;
  userAgent: string;
}
```

### API Endpoint Implementation

```typescript
// pages/api/patterns/submit.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { validatePattern, sanitizePattern } from '../../../lib/patternValidation';
import { logAuditEvent } from '../../../lib/auditLogger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pattern, userAgent } = req.body;
    const user = await getAuthenticatedUser(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate pattern schema
    const validationResult = validatePattern(pattern);
    if (!validationResult.isValid) {
      return res.status(400).json({ 
        error: 'Invalid pattern schema',
        details: validationResult.errors 
      });
    }

    // Sanitize pattern content
    const sanitizedPattern = sanitizePattern(pattern);
    
    // Check for unsafe content
    const safetyCheck = await checkPatternSafety(sanitizedPattern);
    if (!safetyCheck.isSafe) {
      await logAuditEvent('pattern_rejected_unsafe', {
        userId: user.id,
        patternId: null,
        reason: safetyCheck.reason,
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress
      });
      
      return res.status(400).json({ 
        error: 'Pattern contains unsafe content',
        reason: safetyCheck.reason 
      });
    }

    // Store pattern in database
    const { data: patternRecord, error } = await supabase
      .from('user_patterns')
      .insert({
        user_id: user.id,
        pattern_data: sanitizedPattern,
        status: 'pending',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to store pattern: ${error.message}`);
    }

    // Log audit event
    await logAuditEvent('pattern_submitted', {
      userId: user.id,
      patternId: patternRecord.id,
      patternGenre: sanitizedPattern.genre,
      patternTone: sanitizedPattern.tone,
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent
    });

    // Notify moderators (if configured)
    await notifyModerators(patternRecord.id, sanitizedPattern);

    return res.status(201).json({
      success: true,
      patternId: patternRecord.id,
      message: 'Pattern submitted for review'
    });

  } catch (error) {
    console.error('Pattern submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Pattern Validation

```typescript
// lib/patternValidation.ts
export function validatePattern(pattern: any): ValidationResult {
  const errors: string[] = [];
  
  // Required fields
  if (!pattern.genre || typeof pattern.genre !== 'string') {
    errors.push('genre is required and must be a string');
  }
  
  if (!pattern.tone || typeof pattern.tone !== 'string') {
    errors.push('tone is required and must be a string');
  }
  
  if (!Array.isArray(pattern.arcs) || pattern.arcs.length === 0) {
    errors.push('arcs must be a non-empty array');
  }
  
  if (!pattern.template || typeof pattern.template !== 'string') {
    errors.push('template is required and must be a string');
  }
  
  // Length limits
  if (pattern.template.length > 2000) {
    errors.push('template must be less than 2000 characters');
  }
  
  if (pattern.description && pattern.description.length > 500) {
    errors.push('description must be less than 500 characters');
  }
  
  // Content validation
  if (pattern.template.includes('{{') || pattern.template.includes('}}')) {
    errors.push('template cannot contain template literals');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function sanitizePattern(pattern: any): UserPattern {
  return {
    genre: pattern.genre.trim(),
    tone: pattern.tone.trim(),
    arcs: pattern.arcs.map((arc: string) => arc.trim()),
    template: pattern.template.trim(),
    description: pattern.description?.trim() || '',
    tags: pattern.tags?.filter((tag: string) => typeof tag === 'string') || [],
    language: pattern.language || 'en'
  };
}
```

## 2. Moderation System

### Role-Based Approval Flow

```typescript
// lib/moderationWorkflow.ts
export enum ModerationRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum PatternStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface ModerationAction {
  patternId: string;
  action: 'approve' | 'reject';
  moderatorId: string;
  reason?: string;
  notes?: string;
}

export async function moderatePattern(action: ModerationAction): Promise<boolean> {
  const { patternId, action: moderationAction, moderatorId, reason, notes } = action;
  
  // Check moderator permissions
  const moderator = await getUserById(moderatorId);
  if (!moderator || !hasModerationPermission(moderator.role)) {
    throw new Error('Insufficient permissions for moderation');
  }
  
  // Get pattern for review
  const { data: pattern, error } = await supabase
    .from('user_patterns')
    .select('*')
    .eq('id', patternId)
    .single();
    
  if (error || !pattern) {
    throw new Error('Pattern not found');
  }
  
  // Update pattern status
  const updateData: any = {
    status: moderationAction === 'approve' ? 'approved' : 'rejected',
    reviewed_at: new Date().toISOString(),
    reviewed_by: moderatorId
  };
  
  if (moderationAction === 'reject') {
    updateData.rejection_reason = reason;
  }
  
  if (notes) {
    updateData.moderation_notes = notes;
  }
  
  const { error: updateError } = await supabase
    .from('user_patterns')
    .update(updateData)
    .eq('id', patternId);
    
  if (updateError) {
    throw new Error(`Failed to update pattern: ${updateError.message}`);
  }
  
  // Log audit event
  await logAuditEvent(`pattern_${moderationAction}d`, {
    patternId,
    moderatorId,
    reason,
    notes,
    originalPattern: pattern.pattern_data
  });
  
  // If approved, inject into pattern library
  if (moderationAction === 'approve') {
    await injectApprovedPattern(pattern.pattern_data);
  }
  
  // Notify user of decision
  await notifyUserOfDecision(pattern.user_id, patternId, moderationAction, reason);
  
  return true;
}
```

### Rejection Reasons Storage

```typescript
// lib/rejectionReasons.ts
export enum RejectionReason {
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  VIOLENCE = 'violence',
  HATE_SPEECH = 'hate_speech',
  SEXUAL_CONTENT = 'sexual_content',
  SPAM = 'spam',
  MALFORMED_TEMPLATE = 'malformed_template',
  DUPLICATE_PATTERN = 'duplicate_pattern',
  TOO_LONG = 'too_long',
  INVALID_SCHEMA = 'invalid_schema',
  OTHER = 'other'
}

export interface RejectionDetails {
  reason: RejectionReason;
  description: string;
  category: 'content' | 'technical' | 'policy';
  requiresReview: boolean;
}

export const REJECTION_REASONS: Record<RejectionReason, RejectionDetails> = {
  [RejectionReason.INAPPROPRIATE_CONTENT]: {
    reason: RejectionReason.INAPPROPRIATE_CONTENT,
    description: 'Content violates community guidelines',
    category: 'content',
    requiresReview: true
  },
  [RejectionReason.VIOLENCE]: {
    reason: RejectionReason.VIOLENCE,
    description: 'Content promotes or glorifies violence',
    category: 'content',
    requiresReview: true
  },
  [RejectionReason.HATE_SPEECH]: {
    reason: RejectionReason.HATE_SPEECH,
    description: 'Content contains hate speech or discrimination',
    category: 'content',
    requiresReview: true
  },
  [RejectionReason.SEXUAL_CONTENT]: {
    reason: RejectionReason.SEXUAL_CONTENT,
    description: 'Content contains inappropriate sexual content',
    category: 'content',
    requiresReview: true
  },
  [RejectionReason.SPAM]: {
    reason: RejectionReason.SPAM,
    description: 'Content appears to be spam or promotional',
    category: 'policy',
    requiresReview: false
  },
  [RejectionReason.MALFORMED_TEMPLATE]: {
    reason: RejectionReason.MALFORMED_TEMPLATE,
    description: 'Template syntax is invalid or malformed',
    category: 'technical',
    requiresReview: false
  },
  [RejectionReason.DUPLICATE_PATTERN]: {
    reason: RejectionReason.DUPLICATE_PATTERN,
    description: 'Pattern is too similar to existing approved pattern',
    category: 'policy',
    requiresReview: false
  },
  [RejectionReason.TOO_LONG]: {
    reason: RejectionReason.TOO_LONG,
    description: 'Pattern exceeds maximum length limits',
    category: 'technical',
    requiresReview: false
  },
  [RejectionReason.INVALID_SCHEMA]: {
    reason: RejectionReason.INVALID_SCHEMA,
    description: 'Pattern does not match required schema',
    category: 'technical',
    requiresReview: false
  },
  [RejectionReason.OTHER]: {
    reason: RejectionReason.OTHER,
    description: 'Other reason (specified in notes)',
    category: 'policy',
    requiresReview: true
  }
};
```

### Unsafe Pattern Filtering

```typescript
// lib/patternSafety.ts
export interface SafetyCheckResult {
  isSafe: boolean;
  reason?: string;
  confidence: number;
  flaggedTerms: string[];
}

export async function checkPatternSafety(pattern: UserPattern): Promise<SafetyCheckResult> {
  const flaggedTerms: string[] = [];
  let confidence = 1.0;
  
  // Check for unsafe keywords
  const unsafeKeywords = [
    'kill', 'murder', 'suicide', 'bomb', 'terrorist', 'hate', 'racist',
    'sex', 'porn', 'nude', 'explicit', 'spam', 'scam', 'phishing'
  ];
  
  const patternText = `${pattern.template} ${pattern.description || ''}`.toLowerCase();
  
  for (const keyword of unsafeKeywords) {
    if (patternText.includes(keyword)) {
      flaggedTerms.push(keyword);
      confidence -= 0.2;
    }
  }
  
  // Check for template injection attempts
  const injectionPatterns = [
    /\{\{.*\}\}/, // Template literals
    /\$\{.*\}/,   // String interpolation
    /<script.*?>/, // Script tags
    /javascript:/, // JavaScript protocol
    /on\w+\s*=/,  // Event handlers
  ];
  
  for (const pattern of injectionPatterns) {
    if (pattern.test(patternText)) {
      flaggedTerms.push('template_injection');
      confidence = 0.0; // Critical security issue
      break;
    }
  }
  
  // Check for excessive length
  if (pattern.template.length > 2000) {
    flaggedTerms.push('excessive_length');
    confidence -= 0.3;
  }
  
  // Check for repetitive content
  const words = patternText.split(/\s+/);
  const wordCount = words.length;
  const uniqueWords = new Set(words).size;
  const repetitionRatio = uniqueWords / wordCount;
  
  if (repetitionRatio < 0.3) {
    flaggedTerms.push('repetitive_content');
    confidence -= 0.2;
  }
  
  const isSafe = confidence > 0.5;
  const reason = flaggedTerms.length > 0 
    ? `Flagged terms: ${flaggedTerms.join(', ')}`
    : undefined;
    
  return {
    isSafe,
    reason,
    confidence,
    flaggedTerms
  };
}
```

## 3. Audit Trail Logic

### Audit Event Schema

```sql
-- Audit events table
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  pattern_id UUID REFERENCES user_patterns(id),
  event_data JSONB NOT NULL,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT,
  request_id TEXT
);

-- Indexes for querying
CREATE INDEX idx_audit_events_event_type ON audit_events(event_type);
CREATE INDEX idx_audit_events_user_id ON audit_events(user_id);
CREATE INDEX idx_audit_events_pattern_id ON audit_events(pattern_id);
CREATE INDEX idx_audit_events_timestamp ON audit_events(timestamp);
```

### Audit Event Types

```typescript
// lib/auditLogger.ts
export enum AuditEventType {
  // Pattern lifecycle events
  PATTERN_SUBMITTED = 'pattern_submitted',
  PATTERN_APPROVED = 'pattern_approved',
  PATTERN_REJECTED = 'pattern_rejected',
  PATTERN_UPDATED = 'pattern_updated',
  PATTERN_DELETED = 'pattern_deleted',
  
  // Moderation events
  MODERATION_STARTED = 'moderation_started',
  MODERATION_COMPLETED = 'moderation_completed',
  MODERATION_ESCALATED = 'moderation_escalated',
  
  // Security events
  PATTERN_REJECTED_UNSAFE = 'pattern_rejected_unsafe',
  INJECTION_ATTEMPT = 'injection_attempt',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  
  // System events
  PATTERN_INJECTED = 'pattern_injected',
  PATTERN_REMOVED = 'pattern_removed',
  AUDIT_EXPORT = 'audit_export'
}

export interface AuditEvent {
  eventType: AuditEventType;
  userId?: string;
  patternId?: string;
  eventData: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
}

export async function logAuditEvent(
  eventType: AuditEventType,
  eventData: Record<string, any>,
  context?: {
    userId?: string;
    patternId?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    requestId?: string;
  }
): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('audit_events')
      .insert({
        event_type: eventType,
        user_id: context?.userId,
        pattern_id: context?.patternId,
        event_data: eventData,
        ip_address: context?.ipAddress,
        user_agent: context?.userAgent,
        session_id: context?.sessionId,
        request_id: context?.requestId
      });

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (error) {
    console.error('Audit logging error:', error);
  }
}
```

### Audit Log Viewing and Export

```typescript
// pages/api/audit/export.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user || !hasAuditPermission(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { startDate, endDate, eventTypes, format = 'json' } = req.body;

    // Build query
    let query = supabase
      .from('audit_events')
      .select(`
        *,
        users:user_id(email, full_name),
        patterns:pattern_id(pattern_data, status)
      `);

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }
    if (eventTypes && eventTypes.length > 0) {
      query = query.in('event_type', eventTypes);
    }

    const { data: events, error } = await query.order('timestamp', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch audit events: ${error.message}`);
    }

    // Format export
    let exportData;
    if (format === 'csv') {
      exportData = formatAuditEventsAsCSV(events);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_events.csv');
    } else {
      exportData = JSON.stringify(events, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_events.json');
    }

    // Log export event
    await logAuditEvent('audit_export', {
      exportedBy: user.id,
      startDate,
      endDate,
      eventTypes,
      format,
      recordCount: events.length
    });

    return res.status(200).send(exportData);

  } catch (error) {
    console.error('Audit export error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

## 4. Security Controls

### MCP Enforcement

```typescript
// lib/mcpEnforcement.ts
export interface MCPPatternPermissions {
  canSubmit: boolean;
  canModerate: boolean;
  canViewAudit: boolean;
  canExportAudit: boolean;
  maxPatternsPerDay: number;
  maxPatternLength: number;
}

export function getPatternPermissions(userRole: string): MCPPatternPermissions {
  switch (userRole) {
    case 'super_admin':
      return {
        canSubmit: true,
        canModerate: true,
        canViewAudit: true,
        canExportAudit: true,
        maxPatternsPerDay: 100,
        maxPatternLength: 5000
      };
    case 'admin':
      return {
        canSubmit: true,
        canModerate: true,
        canViewAudit: true,
        canExportAudit: true,
        maxPatternsPerDay: 50,
        maxPatternLength: 3000
      };
    case 'moderator':
      return {
        canSubmit: true,
        canModerate: true,
        canViewAudit: true,
        canExportAudit: false,
        maxPatternsPerDay: 20,
        maxPatternLength: 2000
      };
    case 'user':
      return {
        canSubmit: true,
        canModerate: false,
        canViewAudit: false,
        canExportAudit: false,
        maxPatternsPerDay: 5,
        maxPatternLength: 1000
      };
    default:
      return {
        canSubmit: false,
        canModerate: false,
        canViewAudit: false,
        canExportAudit: false,
        maxPatternsPerDay: 0,
        maxPatternLength: 0
      };
  }
}
```

### Injection Sanitization

```typescript
// lib/injectionSanitization.ts
export function sanitizePatternForInjection(pattern: UserPattern): string {
  let sanitized = pattern.template;
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '');
  
  // Escape special characters
  sanitized = sanitized.replace(/[&]/g, '&amp;');
  sanitized = sanitized.replace(/["]/g, '&quot;');
  sanitized = sanitized.replace(/[']/g, '&#x27;');
  
  // Remove script tags and event handlers
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/\bon\w+\s*=/gi, '');
  
  // Remove JavaScript protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove template literals
  sanitized = sanitized.replace(/\{\{.*?\}\}/g, '');
  sanitized = sanitized.replace(/\$\{.*?\}/g, '');
  
  // Limit length
  if (sanitized.length > 2000) {
    sanitized = sanitized.substring(0, 2000);
  }
  
  return sanitized;
}

export function validatePatternForInjection(pattern: UserPattern): ValidationResult {
  const errors: string[] = [];
  
  // Check for dangerous patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /\bon\w+\s*=/i,
    /\{\{.*?\}\}/,
    /\$\{.*?\}/,
    /eval\s*\(/i,
    /document\./i,
    /window\./i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(pattern.template)) {
      errors.push('Pattern contains potentially dangerous content');
      break;
    }
  }
  
  // Check length
  if (pattern.template.length > 2000) {
    errors.push('Pattern template exceeds maximum length');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### Rate Limiting and Guardrails

```typescript
// lib/rateLimiting.ts
export interface RateLimitConfig {
  maxSubmissionsPerDay: number;
  maxSubmissionsPerHour: number;
  maxSubmissionsPerMinute: number;
  cooldownPeriod: number; // in minutes
}

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // Get user's submission history
  const { data: submissions, error } = await supabase
    .from('user_patterns')
    .select('submitted_at')
    .eq('user_id', userId)
    .gte('submitted_at', oneDayAgo.toISOString());
    
  if (error) {
    throw new Error(`Failed to check rate limit: ${error.message}`);
  }
  
  const recentSubmissions = submissions || [];
  const submissionsPerMinute = recentSubmissions.filter(
    s => new Date(s.submitted_at) > oneMinuteAgo
  ).length;
  
  const submissionsPerHour = recentSubmissions.filter(
    s => new Date(s.submitted_at) > oneHourAgo
  ).length;
  
  const submissionsPerDay = recentSubmissions.length;
  
  // Check limits
  const permissions = getPatternPermissions(userRole);
  
  if (submissionsPerMinute >= 3) {
    return {
      allowed: false,
      reason: 'Too many submissions per minute',
      retryAfter: 60
    };
  }
  
  if (submissionsPerHour >= permissions.maxPatternsPerDay / 24) {
    return {
      allowed: false,
      reason: 'Too many submissions per hour',
      retryAfter: 3600
    };
  }
  
  if (submissionsPerDay >= permissions.maxPatternsPerDay) {
    return {
      allowed: false,
      reason: 'Daily submission limit reached',
      retryAfter: 86400
    };
  }
  
  return {
    allowed: true,
    remaining: {
      perMinute: 3 - submissionsPerMinute,
      perHour: (permissions.maxPatternsPerDay / 24) - submissionsPerHour,
      perDay: permissions.maxPatternsPerDay - submissionsPerDay
    }
  };
}
```

### Security Monitoring

```typescript
// lib/securityMonitoring.ts
export interface SecurityAlert {
  type: 'injection_attempt' | 'rate_limit_exceeded' | 'suspicious_pattern' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  patternId?: string;
  details: Record<string, any>;
  timestamp: Date;
}

export async function monitorSecurityEvent(event: SecurityAlert): Promise<void> {
  // Log security event
  await logAuditEvent('security_alert', {
    alertType: event.type,
    severity: event.severity,
    userId: event.userId,
    patternId: event.patternId,
    details: event.details
  });
  
  // Send alert for high/critical events
  if (event.severity === 'high' || event.severity === 'critical') {
    await sendSecurityAlert(event);
  }
  
  // Take automatic action for critical events
  if (event.severity === 'critical') {
    await takeAutomaticAction(event);
  }
}

async function sendSecurityAlert(alert: SecurityAlert): Promise<void> {
  // Send to security team
  await sendEmail('security@doccraft-ai.com', {
    subject: `Security Alert: ${alert.type}`,
    body: `Severity: ${alert.severity}\nDetails: ${JSON.stringify(alert.details, null, 2)}`
  });
  
  // Send to Slack/Teams if configured
  if (process.env.SECURITY_WEBHOOK_URL) {
    await sendWebhook(process.env.SECURITY_WEBHOOK_URL, alert);
  }
}

async function takeAutomaticAction(alert: SecurityAlert): Promise<void> {
  switch (alert.type) {
    case 'injection_attempt':
      // Temporarily suspend user
      if (alert.userId) {
        await suspendUser(alert.userId, 'Automatic suspension due to injection attempt');
      }
      break;
      
    case 'rate_limit_exceeded':
      // Extend cooldown period
      if (alert.userId) {
        await extendRateLimitCooldown(alert.userId, 60); // 1 hour
      }
      break;
      
    case 'unauthorized_access':
      // Log IP for potential blocking
      if (alert.details.ipAddress) {
        await logSuspiciousIP(alert.details.ipAddress);
      }
      break;
  }
}
```

## Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Create database tables (user_patterns, audit_events)
- [ ] Implement pattern validation and sanitization
- [ ] Set up basic API endpoints
- [ ] Configure MCP role permissions

### Phase 2: Moderation System
- [ ] Implement role-based approval workflow
- [ ] Create rejection reason system
- [ ] Set up notification system
- [ ] Build moderation UI

### Phase 3: Security Controls
- [ ] Implement rate limiting
- [ ] Add injection sanitization
- [ ] Set up security monitoring
- [ ] Configure automated alerts

### Phase 4: Audit and Compliance
- [ ] Complete audit trail implementation
- [ ] Build audit log viewer
- [ ] Create export functionality
- [ ] Set up compliance reporting

---

*This documentation provides comprehensive coverage of the prompt moderation system. For implementation questions or security concerns, contact the development team.* 