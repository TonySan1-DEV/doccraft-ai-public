/*
role: edge-function,
tier: Admin,
file: "supabase/functions/verifyLinkToken/index.ts",
allowedActions: ["verify", "validate", "log"],
theme: "security"
*/

import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

// Types for token verification
interface TokenVerificationRequest {
  token: string;
  visitor_ip?: string;
  visitor_user_agent?: string;
  visitor_country?: string;
  referrer?: string;
}

interface TokenVerificationResponse {
  success: boolean;
  pipeline_id?: string;
  pipeline_data?: {
    id: string;
    title: string;
    status: string;
    mode: string;
    tier: string;
    created_at: string;
    slide_deck_id?: string;
    narrated_deck_id?: string;
    tts_narration_id?: string;
  };
  error?: string;
  expires_at?: string;
  access_count?: number;
  max_access_count?: number;
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async req => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request
    const {
      token,
      visitor_ip,
      visitor_user_agent,
      visitor_country,
      referrer,
    }: TokenVerificationRequest = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Token is required',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get client IP from request headers
    const clientIP =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      visitor_ip ||
      'unknown';

    // Verify token and get pipeline data
    const verificationResult = await verifyTokenAndGetPipeline(token, {
      visitor_ip: clientIP,
      visitor_user_agent:
        visitor_user_agent || req.headers.get('user-agent') || 'unknown',
      visitor_country,
      referrer: referrer || req.headers.get('referer') || 'direct',
    });

    return new Response(JSON.stringify(verificationResult), {
      status: verificationResult.success ? 200 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function verifyTokenAndGetPipeline(
  token: string,
  visitorInfo: {
    visitor_ip: string;
    visitor_user_agent: string;
    visitor_country?: string;
    referrer: string;
  }
): Promise<TokenVerificationResponse> {
  try {
    // First, check if this is a valid token format
    if (!token || token.length < 10) {
      return {
        success: false,
        error: 'Invalid token format',
      };
    }

    // Query the sharable_link_events table to find the pipeline
    const { data: linkEvents, error: linkError } = await supabase
      .from('sharable_link_events')
      .select(
        `
        pipeline_id,
        event_type,
        timestamp,
        access_count,
        unique_visitors
      `
      )
      .eq('link_token', token)
      .eq('event_type', 'created')
      .order('timestamp', { ascending: false })
      .limit(1);

    if (linkError || !linkEvents || linkEvents.length === 0) {
      return {
        success: false,
        error: 'Token not found or invalid',
      };
    }

    const linkEvent = linkEvents[0];
    const pipelineId = linkEvent.pipeline_id;

    // Get pipeline data
    const { data: pipeline, error: pipelineError } = await supabase
      .from('pipelines')
      .select(
        `
        id,
        title,
        status,
        mode,
        tier,
        created_at,
        slide_deck_id,
        narrated_deck_id,
        tts_narration_id
      `
      )
      .eq('id', pipelineId)
      .single();

    if (pipelineError || !pipeline) {
      return {
        success: false,
        error: 'Pipeline not found',
      };
    }

    // Check if pipeline is accessible (completed or has content)
    if (pipeline.status !== 'success' && pipeline.status !== 'completed') {
      return {
        success: false,
        error: 'Pipeline not ready for viewing',
      };
    }

    // Log the access event
    await logShareableLinkAccess(token, pipelineId, visitorInfo);

    return {
      success: true,
      pipeline_id: pipelineId,
      pipeline_data: pipeline,
      access_count: (linkEvent.access_count || 0) + 1,
      max_access_count: 1000, // Default limit
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return {
      success: false,
      error: 'Token verification failed',
    };
  }
}

async function logShareableLinkAccess(
  token: string,
  pipelineId: string,
  visitorInfo: {
    visitor_ip: string;
    visitor_user_agent: string;
    visitor_country?: string;
    referrer: string;
  }
) {
  try {
    // Log the access event
    const { error: logError } = await supabase
      .from('sharable_link_events')
      .insert({
        link_token: token,
        pipeline_id: pipelineId,
        event_type: 'accessed',
        visitor_ip: visitorInfo.visitor_ip,
        visitor_user_agent: visitorInfo.visitor_user_agent,
        visitor_country: visitorInfo.visitor_country,
        referrer: visitorInfo.referrer,
        tier_at_time: 'Free', // Public access is always Free tier
      });

    if (logError) {
      console.error('Failed to log shareable link access:', logError);
    }

    // Update access count
    const { error: updateError } = await supabase.rpc(
      'increment_shareable_link_access_count',
      {
        p_token: token,
        p_pipeline_id: pipelineId,
      }
    );

    if (updateError) {
      console.error('Failed to update access count:', updateError);
    }
  } catch (error) {
    console.error('Error logging shareable link access:', error);
  }
}
