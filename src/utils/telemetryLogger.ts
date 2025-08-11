/*
role: analytics-engineer,
tier: Pro,
file: "src/utils/telemetryLogger.ts",
allowedActions: ["log", "track", "analyze"],
theme: "telemetry"
*/

import { supabase } from '../lib/supabase';
import {
  TelemetryMetadata,
  TelemetryEvent,
  TelemetryResult,
} from '../types/domain';

/**
 * Log telemetry events to Supabase
 * @param eventType - Type of event to log
 * @param metadata - Additional event metadata
 * @returns Promise<TelemetryResult>
 */
export async function logTelemetryEvent(
  eventType: string,
  metadata: TelemetryMetadata = {}
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
      metadata: {
        ...metadata,
        userId: user?.id,
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
      },
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
  metadata: TelemetryMetadata = {}
): Promise<TelemetryResult> {
  return logTelemetryEvent('shareable_link_accessed', {
    ...metadata,
    customData: {
      pipelineId,
      token,
      referrer: document.referrer,
    },
  });
}

/**
 * Log pipeline creation events
 * @param pipelineId - Pipeline ID created
 * @param mode - Creation mode
 * @param tier - User tier
 * @param metadata - Additional metadata
 * @returns Promise<TelemetryResult>
 */
export async function logPipelineCreation(
  pipelineId: string,
  mode: string,
  tier: string,
  metadata: TelemetryMetadata = {}
): Promise<TelemetryResult> {
  return logTelemetryEvent('pipeline_created', {
    ...metadata,
    userTier: tier as 'Free' | 'Pro' | 'Enterprise',
    customData: {
      pipelineId,
      mode,
      tier,
    },
  });
}

/**
 * Log pipeline completion events
 * @param pipelineId - Pipeline ID completed
 * @param duration - Completion duration in ms
 * @param metadata - Additional metadata
 * @returns Promise<TelemetryResult>
 */
export async function logPipelineCompletion(
  pipelineId: string,
  duration: number,
  metadata: TelemetryMetadata = {}
): Promise<TelemetryResult> {
  return logTelemetryEvent('pipeline_completed', {
    ...metadata,
    responseTime: duration,
    customData: {
      pipelineId,
      duration,
    },
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
  metadata: TelemetryMetadata = {}
): Promise<TelemetryResult> {
  return logTelemetryEvent('error_occurred', {
    ...metadata,
    errorCount: 1,
    error: {
      type: errorType,
      message: errorMessage,
    },
    customData: {
      errorType,
      errorMessage,
    },
  });
}

/**
 * Log feature usage events
 * @param featureName - Name of feature used
 * @param action - Action performed
 * @param metadata - Additional metadata
 * @returns Promise<TelemetryResult>
 */
export async function logFeatureUsage(
  featureName: string,
  action: string,
  metadata: TelemetryMetadata = {}
): Promise<TelemetryResult> {
  return logTelemetryEvent('feature_used', {
    ...metadata,
    actionType: action,
    usage: {
      featureName,
      action,
      success: true,
    },
    customData: {
      featureName,
      action,
    },
  });
}

/**
 * Log performance metrics
 * @param metricName - Name of metric
 * @param value - Metric value
 * @param unit - Unit of measurement
 * @param metadata - Additional metadata
 * @returns Promise<TelemetryResult>
 */
export async function logPerformanceMetric(
  metricName: string,
  value: number,
  unit: string,
  metadata: TelemetryMetadata = {}
): Promise<TelemetryResult> {
  return logTelemetryEvent('performance_metric', {
    ...metadata,
    customData: {
      metricName,
      value,
      unit,
    },
  });
}

/**
 * Log user interaction events
 * @param interactionType - Type of interaction
 * @param target - Target of interaction
 * @param metadata - Additional metadata
 * @returns Promise<TelemetryResult>
 */
export async function logUserInteraction(
  interactionType: string,
  target: string,
  metadata: TelemetryMetadata = {}
): Promise<TelemetryResult> {
  return logTelemetryEvent('user_interaction', {
    ...metadata,
    actionType: interactionType,
    usage: {
      action: interactionType,
      success: true,
    },
    customData: {
      interactionType,
      target,
    },
  });
}
