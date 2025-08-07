/*
role: api-engineer,
tier: Pro,
file: "pages/api/pipeline-status.ts",
allowedActions: ["query", "serve", "status"],
theme: "pipeline_status"
*/

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../modules/agent/services/supabaseStorage';

// Pipeline status response interface
interface PipelineStatusResponse {
  id: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  mode: 'auto' | 'hybrid' | 'manual';
  features: string[];
  currentStep?: string;
  progress: number;
  errorMessage?: string;
  errorDetails?: any;
  processingTimeMs?: number;
  durationSeconds?: number;
  tier: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  // Linked content IDs
  slideDeckId?: string;
  narratedDeckId?: string;
  ttsNarrationId?: string;
  // Related content titles (for convenience)
  slideDeckTitle?: string;
  narratedDeckTitle?: string;
  ttsAudioUrl?: string;
}

// Error response interface
interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
}

// Success response interface
interface SuccessResponse {
  success: true;
  data: PipelineStatusResponse;
  timestamp: string;
}

// Utility function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Utility function to sanitize pipeline ID
function sanitizePipelineId(pipelineId: string): string {
  return pipelineId.trim();
}

// Utility function to get user ID from request (placeholder for auth integration)
async function getUserIdFromRequest(
  req: NextApiRequest
): Promise<string | null> {
  // TODO: Implement proper authentication
  // For now, we'll rely on Supabase RLS policies
  // This should be replaced with actual auth middleware
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);
      if (!error && user) {
        return user.id;
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  }

  return null;
}

// Main API handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({
        error: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED',
      });
    }

    // Extract and validate pipeline ID
    const { pipelineId } = req.query;

    if (!pipelineId || typeof pipelineId !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid pipelineId parameter',
        code: 'MISSING_PIPELINE_ID',
      });
    }

    const sanitizedPipelineId = sanitizePipelineId(pipelineId);

    if (!isValidUUID(sanitizedPipelineId)) {
      return res.status(400).json({
        error: 'Invalid pipeline ID format',
        code: 'INVALID_PIPELINE_ID_FORMAT',
      });
    }

    // Get user ID for authentication (optional for now)
    const userId = await getUserIdFromRequest(req);

    // Query pipeline status from database
    const { data: pipeline, error } = await supabase
      .from('pipelines')
      .select(
        `
        *,
        slide_decks!slide_deck_id(title),
        narrated_decks!narrated_deck_id(title),
        tts_narrations!tts_narration_id(audio_file_url)
      `
      )
      .eq('id', sanitizedPipelineId)
      .single();

    if (error) {
      console.error('Database query error:', error);

      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Pipeline not found',
          code: 'PIPELINE_NOT_FOUND',
        });
      }

      return res.status(500).json({
        error: 'Failed to retrieve pipeline status',
        code: 'DATABASE_ERROR',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }

    if (!pipeline) {
      return res.status(404).json({
        error: 'Pipeline not found',
        code: 'PIPELINE_NOT_FOUND',
      });
    }

    // TODO: Add proper authentication check
    // For now, we rely on Supabase RLS policies
    // if (userId && pipeline.user_id !== userId) {
    //   return res.status(403).json({
    //     error: "Access denied",
    //     code: "ACCESS_DENIED"
    //   });
    // }

    // Build response object
    const response: PipelineStatusResponse = {
      id: pipeline.id,
      status: pipeline.status,
      mode: pipeline.mode,
      features: pipeline.features || [],
      currentStep: pipeline.current_step,
      progress: pipeline.progress || 0,
      errorMessage: pipeline.error_message,
      errorDetails: pipeline.error_details,
      processingTimeMs: pipeline.processing_time_ms,
      durationSeconds: pipeline.duration_seconds,
      tier: pipeline.tier,
      createdAt: pipeline.created_at,
      updatedAt: pipeline.updated_at,
      startedAt: pipeline.started_at,
      completedAt: pipeline.completed_at,
      slideDeckId: pipeline.slide_deck_id,
      narratedDeckId: pipeline.narrated_deck_id,
      ttsNarrationId: pipeline.tts_narration_id,
      slideDeckTitle: pipeline.slide_decks?.title,
      narratedDeckTitle: pipeline.narrated_decks?.title,
      ttsAudioUrl: pipeline.tts_narrations?.audio_file_url,
    };

    // Return success response
    return res.status(200).json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Pipeline status API error:', error);

    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details:
        process.env.NODE_ENV === 'development'
          ? error instanceof Error
            ? error.message
            : 'Unknown error'
          : undefined,
    });
  }
}

// TODO: Future Enhancements
/*
1. AUTHENTICATION & AUTHORIZATION:
   - Implement proper JWT token validation
   - Add middleware for user authentication
   - Ensure users can only access their own pipelines
   - Add role-based access control for admin users

2. REAL-TIME SUBSCRIPTIONS:
   - Implement WebSocket connections for live updates
   - Add Supabase real-time subscriptions
   - Support multiple client connections per pipeline
   - Add connection management and cleanup

3. RATE LIMITING & SECURITY:
   - Add rate limiting per user/IP
   - Implement request throttling
   - Add API key authentication for external services
   - Add request logging and monitoring

4. ENHANCED RESPONSE DATA:
   - Include estimated completion time
   - Add pipeline performance metrics
   - Include related content previews
   - Add pipeline history and retry information

5. CACHING & PERFORMANCE:
   - Add Redis caching for frequently accessed pipelines
   - Implement response compression
   - Add database query optimization
   - Add CDN integration for static responses

6. MONITORING & ANALYTICS:
   - Add request/response logging
   - Implement performance metrics collection
   - Add error tracking and alerting
   - Add usage analytics and reporting

7. API VERSIONING:
   - Add API version support (v1, v2, etc.)
   - Implement backward compatibility
   - Add deprecation warnings
   - Support multiple response formats

8. BATCH OPERATIONS:
   - Support multiple pipeline status queries
   - Add bulk status updates
   - Implement pipeline comparison endpoints
   - Add user pipeline summary endpoints

9. WEBHOOK INTEGRATION:
   - Add webhook support for status changes
   - Implement event-driven notifications
   - Add custom webhook payloads
   - Support webhook retry mechanisms

10. INTERNATIONALIZATION:
    - Add multi-language error messages
    - Support localized response formats
    - Add timezone-aware timestamps
    - Implement cultural formatting preferences
*/
