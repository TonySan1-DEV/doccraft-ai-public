// MCP Context Block
/*
{
  file: "reject.ts",
  role: "api-engineer",
  allowedActions: ["validate", "reject", "secure"],
  tier: "Admin",
  contentSensitivity: "medium",
  theme: "writing_assistant"
}
*/

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Types for request and response
interface RejectPatternRequest {
  patternId: string;
  adminId: string;
  reason?: string;
  note?: string;
}

interface RejectPatternResponse {
  success?: boolean;
  error?: string;
  patternId?: string;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Validation functions
function validatePatternId(patternId: string): boolean {
  return typeof patternId === 'string' && patternId.length > 0;
}

function validateAdminId(adminId: string): boolean {
  return typeof adminId === 'string' && adminId.length > 0;
}

function sanitizeReason(reason?: string): string {
  if (!reason) return 'Unspecified';
  
  // Remove HTML tags and scripts
  let sanitized = reason.replace(/<[^>]*>/g, '');
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '');
  
  // Trim whitespace and limit length
  sanitized = sanitized.trim();
  
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500);
  }
  
  return sanitized || 'Unspecified';
}

// Logging function for security monitoring
function logModerationEvent(event: string, details: any) {
  console.log(`[MODERATION] ${event}:`, {
    timestamp: new Date().toISOString(),
    ...details
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RejectPatternResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: RejectPatternRequest = req.body;

    // Validate required fields
    if (!body.patternId || !body.adminId) {
      logModerationEvent('MISSING_REQUIRED_FIELDS', { 
        patternId: body.patternId, 
        adminId: body.adminId,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress 
      });
      return res.status(400).json({ error: 'Missing required fields: patternId and adminId' });
    }

    // Validate pattern ID
    if (!validatePatternId(body.patternId)) {
      logModerationEvent('INVALID_PATTERN_ID', { 
        patternId: body.patternId,
        adminId: body.adminId,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress 
      });
      return res.status(400).json({ error: 'Invalid pattern ID' });
    }

    // Validate admin ID
    if (!validateAdminId(body.adminId)) {
      logModerationEvent('INVALID_ADMIN_ID', { 
        patternId: body.patternId,
        adminId: body.adminId,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress 
      });
      return res.status(400).json({ error: 'Invalid admin ID' });
    }

    // Sanitize rejection reason
    const sanitizedReason = sanitizeReason(body.reason);

    // Check if pattern exists and get current status
    const { data: existingPattern, error: fetchError } = await supabase
      .from('user_prompt_patterns')
      .select('*')
      .eq('id', body.patternId)
      .single();

    if (fetchError || !existingPattern) {
      logModerationEvent('PATTERN_NOT_FOUND', { 
        patternId: body.patternId,
        adminId: body.adminId,
        error: fetchError?.message 
      });
      return res.status(404).json({ error: 'Pattern not found' });
    }

    // Check if pattern is already rejected
    if (existingPattern.moderation_status === 'rejected') {
      logModerationEvent('ALREADY_REJECTED', { 
        patternId: body.patternId,
        adminId: body.adminId 
      });
      return res.status(409).json({ error: 'Pattern is already rejected' });
    }

    // Update pattern status to rejected
    const { data: updatedPattern, error: updateError } = await supabase
      .from('user_prompt_patterns')
      .update({
        moderation_status: 'rejected',
        rejected_by: body.adminId,
        rejection_reason: sanitizedReason,
        moderation_note: body.note || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.patternId)
      .select('*')
      .single();

    if (updateError) {
      logModerationEvent('SUPABASE_UPDATE_ERROR', { 
        patternId: body.patternId,
        adminId: body.adminId,
        error: updateError.message 
      });
      console.error('Supabase update error:', updateError);
      return res.status(500).json({ error: 'Failed to reject pattern' });
    }

    // Log successful rejection
    logModerationEvent('PATTERN_REJECTED', { 
      patternId: body.patternId,
      adminId: body.adminId,
      genre: updatedPattern.genre,
      arc: updatedPattern.arc,
      reason: sanitizedReason,
      note: body.note
    });

    // Optional: Log to audit table
    try {
      await supabase
        .from('pattern_moderation_log')
        .insert({
          pattern_id: body.patternId,
          moderator_id: body.adminId,
          action: 'reject',
          reason: sanitizedReason,
          note: body.note || null,
          created_at: new Date().toISOString()
        });
    } catch (auditError) {
      // Don't fail the main operation if audit logging fails
      console.error('Audit logging failed:', auditError);
    }

    // Return success response
    return res.status(200).json({ 
      success: true, 
      patternId: body.patternId 
    });

  } catch (error) {
    logModerationEvent('UNEXPECTED_ERROR', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress 
    });
    
    console.error('Unexpected error in pattern rejection:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Optional: Add middleware for additional security
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1kb', // Limit request size
    },
  },
}; 