// MCP Context Block
/*
{
  file: "patternAuditLogger.ts",
  role: "audit-logger",
  allowedActions: ["log", "audit", "secure"],
  tier: "Admin",
  contentSensitivity: "high",
  theme: "compliance"
}
*/

import { createClient } from '@supabase/supabase-js';

// Types for audit logging
export interface PatternModerationLog {
  patternId: string;
  action: 'approve' | 'reject' | 'revert';
  moderatorId: string;
  reason?: string;
  note?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogEntry {
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

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Validation functions
function validatePatternId(patternId: string): boolean {
  return typeof patternId === 'string' && patternId.length > 0;
}

function validateModeratorId(moderatorId: string): boolean {
  return typeof moderatorId === 'string' && moderatorId.length > 0;
}

function validateAction(action: string): action is 'approve' | 'reject' | 'revert' {
  return ['approve', 'reject', 'revert'].includes(action);
}

function sanitizeText(text?: string): string | null {
  if (!text) return null;
  
  // Remove HTML tags and scripts
  let sanitized = text.replace(/<[^>]*>/g, '');
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '');
  
  // Trim whitespace and limit length
  sanitized = sanitized.trim();
  
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }
  
  return sanitized || null;
}

// Main logging function
export async function logPatternModeration({
  patternId,
  action,
  moderatorId,
  reason,
  note,
  ipAddress,
  userAgent
}: PatternModerationLog): Promise<void> {
  try {
    // Validate inputs
    if (!validatePatternId(patternId)) {
      console.error('[AUDIT] Invalid pattern ID:', patternId);
      throw new Error('Invalid pattern ID');
    }

    if (!validateModeratorId(moderatorId)) {
      console.error('[AUDIT] Invalid moderator ID:', moderatorId);
      throw new Error('Invalid moderator ID');
    }

    if (!validateAction(action)) {
      console.error('[AUDIT] Invalid action:', action);
      throw new Error('Invalid action');
    }

    // Sanitize text inputs
    const sanitizedReason = sanitizeText(reason);
    const sanitizedNote = sanitizeText(note);

    // Prepare audit log entry
    const auditEntry = {
      pattern_id: patternId,
      action: action,
      moderator_id: moderatorId,
      reason: sanitizedReason,
      note: sanitizedNote,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('pattern_moderation_log')
      .insert(auditEntry)
      .select('*')
      .single();

    if (error) {
      console.error('[AUDIT] Supabase error:', error);
      throw new Error(`Failed to log moderation: ${error.message}`);
    }

    // Log success in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT] Moderation logged successfully:', {
        id: data.id,
        patternId,
        action,
        moderatorId,
        timestamp: data.created_at
      });
    }

  } catch (error) {
    console.error('[AUDIT] Error logging pattern moderation:', error);
    
    // Don't throw the error to avoid breaking the main operation
    // but log it for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.error('[AUDIT] Full error details:', {
        patternId,
        action,
        moderatorId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }
}

// Utility function to retrieve audit logs
export async function getPatternModerationHistory(
  patternId?: string,
  moderatorId?: string,
  action?: 'approve' | 'reject' | 'revert',
  limit: number = 100
): Promise<AuditLogEntry[]> {
  try {
    let query = supabase
      .from('pattern_moderation_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (patternId) {
      query = query.eq('pattern_id', patternId);
    }

    if (moderatorId) {
      query = query.eq('moderator_id', moderatorId);
    }

    if (action) {
      query = query.eq('action', action);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[AUDIT] Error fetching moderation history:', error);
      throw new Error(`Failed to fetch moderation history: ${error.message}`);
    }

    return data || [];

  } catch (error) {
    console.error('[AUDIT] Error in getPatternModerationHistory:', error);
    return [];
  }
}

// Utility function to get moderation statistics
export async function getModerationStats(
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalActions: number;
  approvals: number;
  rejections: number;
  reverts: number;
  topModerators: Array<{ moderator_id: string; action_count: number }>;
}> {
  try {
    let query = supabase
      .from('pattern_moderation_log')
      .select('action, moderator_id');

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('[AUDIT] Error fetching moderation stats:', error);
      throw new Error(`Failed to fetch moderation stats: ${error.message}`);
    }

    const actions = data || [];
    const totalActions = actions.length;
    const approvals = actions.filter(a => a.action === 'approve').length;
    const rejections = actions.filter(a => a.action === 'reject').length;
    const reverts = actions.filter(a => a.action === 'revert').length;

    // Calculate top moderators
    const moderatorCounts = actions.reduce((acc, action) => {
      acc[action.moderator_id] = (acc[action.moderator_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topModerators = Object.entries(moderatorCounts)
      .map(([moderator_id, action_count]) => ({ moderator_id, action_count }))
      .sort((a, b) => b.action_count - a.action_count)
      .slice(0, 10);

    return {
      totalActions,
      approvals,
      rejections,
      reverts,
      topModerators
    };

  } catch (error) {
    console.error('[AUDIT] Error in getModerationStats:', error);
    return {
      totalActions: 0,
      approvals: 0,
      rejections: 0,
      reverts: 0,
      topModerators: []
    };
  }
}

// Utility function to export audit logs
export async function exportModerationLogs(
  startDate?: Date,
  endDate?: Date,
  format: 'json' | 'csv' = 'json'
): Promise<string> {
  try {
    let query = supabase
      .from('pattern_moderation_log')
      .select('*')
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('[AUDIT] Error exporting moderation logs:', error);
      throw new Error(`Failed to export moderation logs: ${error.message}`);
    }

    const logs = data || [];

    if (format === 'csv') {
      // Convert to CSV format
      const headers = ['id', 'pattern_id', 'action', 'moderator_id', 'reason', 'note', 'ip_address', 'user_agent', 'created_at'];
      const csvContent = [
        headers.join(','),
        ...logs.map(log => 
          headers.map(header => {
            const value = log[header as keyof typeof log];
            return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
          }).join(',')
        )
      ].join('\n');
      
      return csvContent;
    } else {
      // Return JSON format
      return JSON.stringify(logs, null, 2);
    }

  } catch (error) {
    console.error('[AUDIT] Error in exportModerationLogs:', error);
    throw error;
  }
} 