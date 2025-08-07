/*
role: ai-engineer,
tier: Pro,
file: "modules/agent/services/auditLogger.ts",
allowedActions: ["log", "audit", "track"],
theme: "security_audit"
*/

import { supabase } from './supabaseStorage';

// Types for audit logging
export interface AssetDownloadEvent {
  user_id: string;
  pipeline_id: string;
  asset_type: 'slide' | 'script' | 'audio';
  asset_id?: string;
  user_agent?: string;
  ip_address?: string;
  tier_at_time: string;
  download_method: 'signed_url' | 'direct' | 'preview';
  file_size_bytes?: number;
  success: boolean;
  error_message?: string;
  session_id?: string;
  referrer?: string;
  country_code?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet' | 'unknown';
}

export interface ShareableLinkEvent {
  user_id: string;
  pipeline_id: string;
  event_type: 'created' | 'accessed' | 'expired' | 'revoked';
  referrer?: string;
  tier_at_time: string;
  link_token?: string;
  visitor_ip?: string;
  visitor_user_agent?: string;
  visitor_country?: string;
  visitor_device_type?: 'desktop' | 'mobile' | 'tablet' | 'unknown';
}

export interface AuditLogResult {
  success: boolean;
  event_id?: string;
  error?: string;
}

/**
 * Log asset download event to Supabase
 * @param event - Asset download event data
 * @returns Promise<AuditLogResult>
 */
export async function logAssetDownload(event: AssetDownloadEvent): Promise<AuditLogResult> {
  try {
    // Get user agent and IP from browser
    const userAgent = navigator.userAgent;
    const sessionId = generateSessionId();
    
    // Enhanced event data
    const enhancedEvent = {
      ...event,
      user_agent: event.user_agent || userAgent,
      session_id: event.session_id || sessionId,
      device_type: event.device_type || detectDeviceType(userAgent),
      timestamp: new Date().toISOString(),
    };

    // Call Supabase function to log the event
    const { data, error } = await supabase.rpc('log_asset_download', {
      p_user_id: enhancedEvent.user_id,
      p_pipeline_id: enhancedEvent.pipeline_id,
      p_asset_type: enhancedEvent.asset_type,
      p_asset_id: enhancedEvent.asset_id,
      p_user_agent: enhancedEvent.user_agent,
      p_ip_address: enhancedEvent.ip_address,
      p_tier_at_time: enhancedEvent.tier_at_time,
      p_download_method: enhancedEvent.download_method,
      p_file_size_bytes: enhancedEvent.file_size_bytes,
      p_success: enhancedEvent.success,
      p_error_message: enhancedEvent.error_message,
      p_session_id: enhancedEvent.session_id,
      p_referrer: enhancedEvent.referrer,
      p_country_code: enhancedEvent.country_code,
      p_device_type: enhancedEvent.device_type,
    });

    if (error) {
      console.error('Failed to log asset download event:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      event_id: data,
    };
  } catch (error) {
    console.error('Error logging asset download event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Log shareable link event to Supabase
 * @param event - Shareable link event data
 * @returns Promise<AuditLogResult>
 */
export async function logShareableLinkEvent(event: ShareableLinkEvent): Promise<AuditLogResult> {
  try {
    // Get user agent and IP from browser
    const userAgent = navigator.userAgent;
    
    // Enhanced event data
    const enhancedEvent = {
      ...event,
      visitor_user_agent: event.visitor_user_agent || userAgent,
      visitor_device_type: event.visitor_device_type || detectDeviceType(userAgent),
      timestamp: new Date().toISOString(),
    };

    // Call Supabase function to log the event
    const { data, error } = await supabase.rpc('log_sharable_link_event', {
      p_user_id: enhancedEvent.user_id,
      p_pipeline_id: enhancedEvent.pipeline_id,
      p_event_type: enhancedEvent.event_type,
      p_referrer: enhancedEvent.referrer,
      p_tier_at_time: enhancedEvent.tier_at_time,
      p_link_token: enhancedEvent.link_token,
      p_visitor_ip: enhancedEvent.visitor_ip,
      p_visitor_user_agent: enhancedEvent.visitor_user_agent,
      p_visitor_country: enhancedEvent.visitor_country,
      p_visitor_device_type: enhancedEvent.visitor_device_type,
    });

    if (error) {
      console.error('Failed to log shareable link event:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      event_id: data,
    };
  } catch (error) {
    console.error('Error logging shareable link event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get user's download statistics
 * @param userId - User ID
 * @param pipelineId - Optional pipeline ID to filter
 * @returns Promise<any>
 */
export async function getUserDownloadStats(userId: string, pipelineId?: string) {
  try {
    let query = supabase
      .from('asset_download_stats')
      .select('*')
      .eq('user_id', userId);

    if (pipelineId) {
      query = query.eq('pipeline_id', pipelineId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to get user download stats:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting user download stats:', error);
    return null;
  }
}

/**
 * Get user's shareable link statistics
 * @param userId - User ID
 * @param pipelineId - Optional pipeline ID to filter
 * @returns Promise<any>
 */
export async function getUserShareableLinkStats(userId: string, pipelineId?: string) {
  try {
    let query = supabase
      .from('sharable_link_stats')
      .select('*')
      .eq('user_id', userId);

    if (pipelineId) {
      query = query.eq('pipeline_id', pipelineId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to get user shareable link stats:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting user shareable link stats:', error);
    return null;
  }
}

/**
 * Get tier usage analytics (admin only)
 * @returns Promise<any>
 */
export async function getTierUsageAnalytics() {
  try {
    const { data, error } = await supabase
      .from('tier_usage_analytics')
      .select('*')
      .order('tier_at_time', { ascending: true });

    if (error) {
      console.error('Failed to get tier usage analytics:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting tier usage analytics:', error);
    return null;
  }
}

// Utility functions

/**
 * Generate a unique session ID
 * @returns string
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Detect device type from user agent
 * @param userAgent - Browser user agent string
 * @returns 'desktop' | 'mobile' | 'tablet' | 'unknown'
 */
function detectDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
  const ua = userAgent.toLowerCase();
  
  // Check for mobile devices
  if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua)) {
    // Check for tablets specifically
    if (/ipad|tablet|playbook|silk/i.test(ua)) {
      return 'tablet';
    }
    return 'mobile';
  }
  
  // Check for desktop
  if (/windows|macintosh|linux/i.test(ua)) {
    return 'desktop';
  }
  
  return 'unknown';
}

/**
 * Get client IP address (if available)
 * @returns Promise<string | undefined>
 */
async function getClientIP(): Promise<string | undefined> {
  try {
    // Try to get IP from a public service
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Could not determine client IP:', error);
    return undefined;
  }
}

/**
 * Get country code from IP (if available)
 * @param ip - IP address
 * @returns Promise<string | undefined>
 */
async function getCountryFromIP(ip: string): Promise<string | undefined> {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    return data.country_code;
  } catch (error) {
    console.warn('Could not determine country from IP:', error);
    return undefined;
  }
}

// Enhanced logging functions with automatic data collection

/**
 * Log asset download with automatic data collection
 * @param event - Basic event data
 * @returns Promise<AuditLogResult>
 */
export async function logAssetDownloadEnhanced(event: Omit<AssetDownloadEvent, 'ip_address' | 'country_code'>): Promise<AuditLogResult> {
  try {
    // Get additional data automatically
    const ip = await getClientIP();
    const countryCode = ip ? await getCountryFromIP(ip) : undefined;
    
    const enhancedEvent: AssetDownloadEvent = {
      ...event,
      ip_address: ip,
      country_code: countryCode,
    };

    return await logAssetDownload(enhancedEvent);
  } catch (error) {
    console.error('Error in enhanced asset download logging:', error);
    // Fallback to basic logging
    return await logAssetDownload(event as AssetDownloadEvent);
  }
}

/**
 * Log shareable link event with automatic data collection
 * @param event - Basic event data
 * @returns Promise<AuditLogResult>
 */
export async function logShareableLinkEventEnhanced(event: Omit<ShareableLinkEvent, 'visitor_ip' | 'visitor_country'>): Promise<AuditLogResult> {
  try {
    // Get additional data automatically
    const ip = await getClientIP();
    const countryCode = ip ? await getCountryFromIP(ip) : undefined;
    
    const enhancedEvent: ShareableLinkEvent = {
      ...event,
      visitor_ip: ip,
      visitor_country: countryCode,
    };

    return await logShareableLinkEvent(enhancedEvent);
  } catch (error) {
    console.error('Error in enhanced shareable link logging:', error);
    // Fallback to basic logging
    return await logShareableLinkEvent(event as ShareableLinkEvent);
  }
}

// TODO: Add logging hooks in videoDeliveryPanel.tsx
// - Log asset downloads when user clicks download buttons
// - Log shareable link creation when user creates share links
// - Log shareable link access when links are accessed
// - Add error handling for failed logging attempts
// - Add analytics dashboard for admins (future)
// - Add rate limiting for logging calls
// - Add batch logging for performance optimization
