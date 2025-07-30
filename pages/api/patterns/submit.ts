// MCP Context Block
/*
{
  file: "submit.ts",
  role: "api-engineer",
  allowedActions: ["validate", "persist", "secure"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_assistant"
}
*/

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Types for request and response
interface SubmitPatternRequest {
  userId: string;
  role: "user" | "pro" | "admin";
  genre: string;
  arc: "setup" | "rising" | "failing" | "climax" | "resolution";
  pattern: string;
  tone?: "dramatic" | "lighthearted" | "ironic" | "reflective" | "dark";
}

interface SubmitPatternResponse {
  success?: boolean;
  error?: string;
  patternId?: string;
}

// Rate limiting configuration
const RATE_LIMIT = {
  maxSubmissions: 5,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
};

// In-memory rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Validation functions
function validateRole(role: string): role is "pro" | "admin" {
  return role === "pro" || role === "admin";
}

function validateGenre(genre: string): boolean {
  const validGenres = ["Romance", "Mystery", "Science Fiction", "Fantasy", "Thriller", "Historical", "Contemporary"];
  return validGenres.includes(genre);
}

function validateArc(arc: string): arc is "setup" | "rising" | "failing" | "climax" | "resolution" {
  const validArcs = ["setup", "rising", "failing", "climax", "resolution"];
  return validArcs.includes(arc);
}

function validateTone(tone?: string): tone is "dramatic" | "lighthearted" | "ironic" | "reflective" | "dark" | undefined {
  if (!tone) return true;
  const validTones = ["dramatic", "lighthearted", "ironic", "reflective", "dark"];
  return validTones.includes(tone);
}

function sanitizePattern(pattern: string): string {
  // Remove HTML tags and scripts
  let sanitized = pattern.replace(/<[^>]*>/g, '');
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length
  if (sanitized.length > 300) {
    sanitized = sanitized.substring(0, 300);
  }
  
  return sanitized;
}

function validateRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize rate limit
    rateLimitStore.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs
    });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT.maxSubmissions) {
    return false;
  }
  
  // Increment count
  userLimit.count++;
  return true;
}

// Logging function for security monitoring
function logSecurityEvent(event: string, details: any) {
  console.log(`[SECURITY] ${event}:`, {
    timestamp: new Date().toISOString(),
    ...details
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubmitPatternResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: SubmitPatternRequest = req.body;

    // Validate required fields
    if (!body.userId || !body.role || !body.genre || !body.arc || !body.pattern) {
      logSecurityEvent('MISSING_REQUIRED_FIELDS', { userId: body.userId, role: body.role });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate role (only Pro and Admin users can submit)
    if (!validateRole(body.role)) {
      logSecurityEvent('INVALID_ROLE_ATTEMPT', { 
        userId: body.userId, 
        role: body.role,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress 
      });
      return res.status(403).json({ error: 'Only Pro and Admin users can submit patterns' });
    }

    // Validate genre
    if (!validateGenre(body.genre)) {
      logSecurityEvent('INVALID_GENRE_ATTEMPT', { 
        userId: body.userId, 
        genre: body.genre 
      });
      return res.status(400).json({ error: 'Invalid genre' });
    }

    // Validate arc
    if (!validateArc(body.arc)) {
      logSecurityEvent('INVALID_ARC_ATTEMPT', { 
        userId: body.userId, 
        arc: body.arc 
      });
      return res.status(400).json({ error: 'Invalid narrative arc' });
    }

    // Validate tone (optional)
    if (!validateTone(body.tone)) {
      logSecurityEvent('INVALID_TONE_ATTEMPT', { 
        userId: body.userId, 
        tone: body.tone 
      });
      return res.status(400).json({ error: 'Invalid tone' });
    }

    // Sanitize pattern text
    const sanitizedPattern = sanitizePattern(body.pattern);
    
    if (sanitizedPattern.length === 0) {
      return res.status(400).json({ error: 'Pattern text cannot be empty after sanitization' });
    }

    // Check rate limiting
    if (!validateRateLimit(body.userId)) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { 
        userId: body.userId,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress 
      });
      return res.status(429).json({ 
        error: `Rate limit exceeded. Maximum ${RATE_LIMIT.maxSubmissions} submissions per day.` 
      });
    }

    // Prepare data for insertion
    const patternData = {
      user_id: body.userId,
      genre: body.genre,
      arc: body.arc,
      pattern: sanitizedPattern,
      tone: body.tone || null,
      moderation_status: body.role === 'admin' ? 'approved' : 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('user_prompt_patterns')
      .insert([patternData])
      .select('id')
      .single();

    if (error) {
      logSecurityEvent('SUPABASE_INSERT_ERROR', { 
        userId: body.userId, 
        error: error.message 
      });
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to save pattern' });
    }

    // Log successful submission
    logSecurityEvent('PATTERN_SUBMITTED', { 
      userId: body.userId,
      patternId: data.id,
      genre: body.genre,
      arc: body.arc,
      role: body.role
    });

    // Return success response
    return res.status(200).json({ 
      success: true, 
      patternId: data.id 
    });

  } catch (error) {
    logSecurityEvent('UNEXPECTED_ERROR', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    console.error('Unexpected error in pattern submission:', error);
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