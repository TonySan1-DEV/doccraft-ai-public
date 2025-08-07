/*
role: analytics-engineer,
tier: Pro,
file: "src/utils/telemetryLogger.ts",
allowedActions: ["log", "track", "analyze"],
theme: "telemetry"
*/

import { supabase } from '../lib/supabase';

// Types for telemetry events
export interface TelemetryEvent {
  event_type: string;
  user_id?: string;
  pipeline_id?: string;
  token?: string;
  referrer?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface TelemetryResult {
  success: boolean;
  event_id?: string;
  error?: string;
}

/**
 * Log telemetry events to Supabase
 * @param eventType - Type of event to log
 * @param metadata - Additional event metadata
 * @returns Promise<TelemetryResult>
 */
export async function logTelemetryEvent(
  eventType: string,
  metadata: Record<string, any> = {}
): Promise<TelemetryResult> {
  try {
    // Get current user if available
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const event: TelemetryEvent = {
      event_type: eventType,
      user_id: user?.id,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    // Log to Supabase
    const { data, error } = await supabase
      .from('telemetry_events')
      .insert({
        event_type: event.event_type,
        user_id: event.user_id,
        pipeline_id: event.pipeline_id,
        metadata: event.metadata,
        timestamp: event.timestamp,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to log telemetry event:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      event_id: data.id,
    };
  } catch (error) {
    console.error('Error logging telemetry event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Log shareable link access events
 * @param pipelineId - Pipeline ID being accessed
 * @param token - Share token used
 * @param metadata - Additional metadata
 * @returns Promise<TelemetryResult>
 */
export async function logShareableLinkAccess(
  pipelineId: string,
  token: string,
  metadata: Record<string, any> = {}
): Promise<TelemetryResult> {
  return logTelemetryEvent('shareable_link_accessed', {
    pipeline_id: pipelineId,
    token,
    referrer: document.referrer,
    user_agent: navigator.userAgent,
    ...metadata,
  });
}

/**
 * Log pipeline creation events
 * @param pipelineId - Pipeline ID created
 * @param mode - Pipeline mode
 * @param tier - User tier
 * @param metadata - Additional metadata
 * @returns Promise<TelemetryResult>
 */
export async function logPipelineCreation(
  pipelineId: string,
  mode: string,
  tier: string,
  metadata: Record<string, any> = {}
): Promise<TelemetryResult> {
  return logTelemetryEvent('pipeline_created', {
    pipeline_id: pipelineId,
    mode,
    tier,
    ...metadata,
  });
}

/**
 * Log pipeline completion events
 * @param pipelineId - Pipeline ID completed
 * @param duration - Processing duration in ms
 * @param metadata - Additional metadata
 * @returns Promise<TelemetryResult>
 */
export async function logPipelineCompletion(
  pipelineId: string,
  duration: number,
  metadata: Record<string, any> = {}
): Promise<TelemetryResult> {
  return logTelemetryEvent('pipeline_completed', {
    pipeline_id: pipelineId,
    duration,
    ...metadata,
  });
}

/**
 * Log error events
 * @param errorType - Type of error
 * @param errorMessage - Error message
 * @param metadata - Additional metadata
 * @returns Promise<TelemetryResult>
 */
export async function logError(
  errorType: string,
  errorMessage: string,
  metadata: Record<string, any> = {}
): Promise<TelemetryResult> {
  return logTelemetryEvent('error', {
    error_type: errorType,
    error_message: errorMessage,
    ...metadata,
  });
}
