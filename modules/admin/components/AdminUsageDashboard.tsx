// MCP Context Block
/*
{
  file: "AdminUsageDashboard.tsx",
  role: "admin-analytics",
  allowedActions: ["view", "analyze", "export", "monitor", "alert"],
  tier: "Admin",
  contentSensitivity: "high",
  theme: "analytics"
}
*/

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useMCP } from '../../../src/useMCP';

// Types for analytics data
interface AssetDownloadStats {
  asset_type: 'slide' | 'script' | 'audio';
  total_downloads: number;
  successful_downloads: number;
  failed_downloads: number;
  total_file_size_bytes: number;
  avg_file_size_bytes: number;
  unique_users: number;
  last_download: string;
  pipeline_name?: string;
}

interface ShareableLinkStats {
  event_type: 'created' | 'accessed' | 'expired' | 'revoked';
  total_events: number;
  unique_links: number;
  total_access_count: number;
  unique_visitors: number;
  last_event: string;
  pipeline_name?: string;
}

interface TierUsageAnalytics {
  tier: string;
  total_users: number;
  total_downloads: number;
  total_links_created: number;
  avg_downloads_per_user: number;
  avg_links_per_user: number;
  last_activity: string;
}

interface FilterState {
  startDate: string;
  endDate: string;
  assetType: string;
  eventType: string;
  tier: string;
  userId: string;
}

interface ExportOptions {
  format: 'csv' | 'json';
  includeMetadata: boolean;
}

// Alert thresholds constants
const ALERT_THRESHOLDS = {
  FREE_TIER_USAGE_LIMIT: 0.8, // 80% of Free tier allowance
  AUDIO_DOWNLOAD_FREQUENCY: 3, // 3+ audio downloads in a day
  PIPELINE_GENERATION_LIMIT: 5, // 5+ pipelines in 1 day
  PRO_TIER_USAGE_LIMIT: 0.9, // 90% of Pro tier allowance
} as const;

interface UsageAlert {
  id: string;
  user_id: string;
  current_tier: string;
  alert_reason: string;
  severity: 'warning' | 'critical';
  usage_percentage?: number;
  download_count?: number;
  pipeline_count?: number;
  timestamp: string;
  acknowledged?: boolean;
  resolved?: boolean;
  resolved_by?: string;
  resolved_at?: string;
  notes?: string;
}

interface AlertFilters {
  severity: string;
  tier: string;
  acknowledged: string;
  resolved: string;
}

// Real-time subscription types
interface RealtimeStats {
  isLive: boolean;
  lastUpdate: string;
  subscriptionStatus: 'connected' | 'disconnected' | 'error';
}

// Export metadata interface
interface ExportMetadata {
  exportedAt: string;
  exportedBy: string;
  filters: FilterState | AlertFilters;
  dataType: string;
  recordCount: number;
  format: 'csv' | 'json';
}

// Initialize Supabase client with error handling
let supabase: any = null;
try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn(
      'Supabase environment variables not found. Dashboard will show error state.'
    );
  } else {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
}

// Utility functions
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString();
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function getAssetTypeColor(assetType: string): string {
  switch (assetType) {
    case 'slide':
      return 'text-blue-600 bg-blue-50';
    case 'script':
      return 'text-green-600 bg-green-50';
    case 'audio':
      return 'text-purple-600 bg-purple-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

function getEventTypeColor(eventType: string): string {
  switch (eventType) {
    case 'created':
      return 'text-green-600 bg-green-50';
    case 'accessed':
      return 'text-blue-600 bg-blue-50';
    case 'expired':
      return 'text-yellow-600 bg-yellow-50';
    case 'revoked':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

function getTierColor(tier: string): string {
  switch (tier.toLowerCase()) {
    case 'pro':
      return 'text-purple-600 bg-purple-50';
    case 'free':
      return 'text-gray-600 bg-gray-50';
    case 'admin':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-blue-600 bg-blue-50';
  }
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

function getSeverityIcon(severity: string): JSX.Element {
  switch (severity) {
    case 'critical':
      return (
        <svg
          className="h-5 w-5 text-red-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'warning':
      return (
        <svg
          className="h-5 w-5 text-yellow-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="h-5 w-5 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
}

export default function AdminUsageDashboard() {
  // Add error boundary wrapper
  try {
    const mcpContext = useMCP('AdminUsageDashboard.tsx');
    const [downloadStats, setDownloadStats] = useState<AssetDownloadStats[]>(
      []
    );
    const [linkStats, setLinkStats] = useState<ShareableLinkStats[]>([]);
    const [tierAnalytics, setTierAnalytics] = useState<TierUsageAnalytics[]>(
      []
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const [activeTab, setActiveTab] = useState<
      'downloads' | 'links' | 'tiers' | 'alerts'
    >('downloads');

    // Real-time subscription state
    const [realtimeStats, setRealtimeStats] = useState<RealtimeStats>({
      isLive: false,
      lastUpdate: new Date().toISOString(),
      subscriptionStatus: 'disconnected',
    });
    const subscriptionRef = useRef<any>(null);

    // Alert state
    const [alerts, setAlerts] = useState<UsageAlert[]>([]);
    const [alertFilters, setAlertFilters] = useState<AlertFilters>({
      severity: '',
      tier: '',
      acknowledged: '',
      resolved: '',
    });
    const [enableAlertEmails, setEnableAlertEmails] = useState(false);

    // Filter state
    const [filters, setFilters] = useState<FilterState>({
      startDate: '',
      endDate: '',
      assetType: '',
      eventType: '',
      tier: '',
      userId: '',
    });

    // Export options
    const [exportOptions, setExportOptions] = useState<ExportOptions>({
      format: 'csv',
      includeMetadata: true,
    });

    // Check if Supabase is initialized
    if (!supabase) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Configuration Error
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Supabase environment variables are not configured. Please
                      check your environment setup.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Check admin access
    useEffect(() => {
      if (mcpContext.role !== 'admin' && mcpContext.tier !== 'Admin') {
        setError('Access denied. Admin privileges required.');
        return;
      }
    }, [mcpContext]);

    // Real-time subscription setup
    useEffect(() => {
      if (!supabase || mcpContext.role !== 'admin') return;

      const setupRealtimeSubscriptions = async () => {
        try {
          // Subscribe to asset download events
          const downloadChannel = supabase
            .channel('asset_download_events')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'asset_download_events',
              },
              payload => {
                console.log('Asset download event received:', payload);
                setRealtimeStats(prev => ({
                  ...prev,
                  isLive: true,
                  lastUpdate: new Date().toISOString(),
                  subscriptionStatus: 'connected',
                }));
                // Refresh download stats
                loadDownloadStats();
              }
            )
            .subscribe();

          // Subscribe to shareable link events
          const linkChannel = supabase
            .channel('shareable_link_events')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'shareable_link_events',
              },
              payload => {
                console.log('Shareable link event received:', payload);
                setRealtimeStats(prev => ({
                  ...prev,
                  isLive: true,
                  lastUpdate: new Date().toISOString(),
                  subscriptionStatus: 'connected',
                }));
                // Refresh link stats
                loadLinkStats();
              }
            )
            .subscribe();

          subscriptionRef.current = { downloadChannel, linkChannel };

          setRealtimeStats(prev => ({
            ...prev,
            subscriptionStatus: 'connected',
          }));
        } catch (error) {
          console.error('Failed to setup real-time subscriptions:', error);
          setRealtimeStats(prev => ({
            ...prev,
            subscriptionStatus: 'error',
          }));
        }
      };

      setupRealtimeSubscriptions();

      // Cleanup subscriptions on unmount
      return () => {
        if (subscriptionRef.current) {
          subscriptionRef.current.downloadChannel?.unsubscribe();
          subscriptionRef.current.linkChannel?.unsubscribe();
        }
      };
    }, [supabase, mcpContext.role]);

    // Load download statistics
    const loadDownloadStats = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if supabase is available
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }

        let query = supabase.from('asset_download_stats').select('*');

        // Apply filters
        if (filters.startDate) {
          query = query.gte('last_download', filters.startDate);
        }
        if (filters.endDate) {
          query = query.lte('last_download', filters.endDate);
        }
        if (filters.assetType) {
          query = query.eq('asset_type', filters.assetType);
        }
        if (filters.tier) {
          query = query.eq('tier_at_time', filters.tier);
        }

        const { data, error } = await query;

        if (error) {
          // Handle case where view doesn't exist yet
          if (
            error.message.includes(
              'relation "asset_download_stats" does not exist'
            )
          ) {
            console.warn(
              "asset_download_stats view not found. This is normal if the migration hasn't been applied yet."
            );
            setDownloadStats([]);
            return;
          }
          throw new Error(`Failed to load download stats: ${error.message}`);
        }

        setDownloadStats(data || []);
      } catch (err) {
        console.error('Error loading download stats:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load download statistics'
        );
      } finally {
        setLoading(false);
      }
    }, [filters]);

    // Load shareable link statistics
    const loadLinkStats = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if supabase is available
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }

        let query = supabase.from('sharable_link_stats').select('*');

        // Apply filters
        if (filters.startDate) {
          query = query.gte('last_event', filters.startDate);
        }
        if (filters.endDate) {
          query = query.lte('last_event', filters.endDate);
        }
        if (filters.eventType) {
          query = query.eq('event_type', filters.eventType);
        }
        if (filters.tier) {
          query = query.eq('tier_at_time', filters.tier);
        }

        const { data, error } = await query;

        if (error) {
          // Handle case where view doesn't exist yet
          if (
            error.message.includes(
              'relation "sharable_link_stats" does not exist'
            )
          ) {
            console.warn(
              "sharable_link_stats view not found. This is normal if the migration hasn't been applied yet."
            );
            setLinkStats([]);
            return;
          }
          throw new Error(`Failed to load link stats: ${error.message}`);
        }

        setLinkStats(data || []);
      } catch (err) {
        console.error('Error loading link stats:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load link statistics'
        );
      } finally {
        setLoading(false);
      }
    }, [filters]);

    // Load tier usage analytics
    const loadTierAnalytics = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if supabase is available
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }

        const { data, error } = await supabase
          .from('tier_usage_analytics')
          .select('*');

        if (error) {
          // Handle case where view doesn't exist yet
          if (
            error.message.includes(
              'relation "tier_usage_analytics" does not exist'
            )
          ) {
            console.warn(
              "tier_usage_analytics view not found. This is normal if the migration hasn't been applied yet."
            );
            setTierAnalytics([]);
            return;
          }
          throw new Error(`Failed to load tier analytics: ${error.message}`);
        }

        setTierAnalytics(data || []);
      } catch (err) {
        console.error('Error loading tier analytics:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load tier analytics'
        );
      } finally {
        setLoading(false);
      }
    }, []);

    // Load usage alerts
    const loadAlerts = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if supabase is available
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }

        // Query recent asset download events to identify usage patterns
        const { data: downloadEvents, error: downloadError } = await supabase
          .from('asset_download_events')
          .select('*')
          .gte(
            'timestamp',
            new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          ) // Last 24 hours
          .order('timestamp', { ascending: false });

        if (downloadError) {
          // Handle case where table doesn't exist yet
          if (
            downloadError.message.includes(
              'relation "asset_download_events" does not exist'
            )
          ) {
            console.warn(
              "asset_download_events table not found. This is normal if the migration hasn't been applied yet."
            );
            setAlerts([]);
            return;
          }
          throw new Error(
            `Failed to load download events: ${downloadError.message}`
          );
        }

        // Query pipeline generation events (you might need to create this view)
        const { data: pipelineEvents, error: pipelineError } = await supabase
          .from('pipelines')
          .select('id, user_id, created_at, tier')
          .gte(
            'created_at',
            new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          )
          .order('created_at', { ascending: false });

        if (pipelineError) {
          console.warn(
            'Failed to load pipeline events:',
            pipelineError.message
          );
        }

        // Process alerts based on usage patterns
        const alerts: UsageAlert[] = [];
        const userUsage = new Map<
          string,
          {
            downloads: number;
            audioDownloads: number;
            pipelines: number;
            tier: string;
          }
        >();

        // Process download events
        downloadEvents?.forEach(event => {
          const userId = event.user_id;
          const current = userUsage.get(userId) || {
            downloads: 0,
            audioDownloads: 0,
            pipelines: 0,
            tier: event.tier_at_time,
          };

          current.downloads++;
          if (event.asset_type === 'audio') {
            current.audioDownloads++;
          }
          current.tier = event.tier_at_time;

          userUsage.set(userId, current);
        });

        // Process pipeline events
        pipelineEvents?.forEach(event => {
          const userId = event.user_id;
          const current = userUsage.get(userId) || {
            downloads: 0,
            audioDownloads: 0,
            pipelines: 0,
            tier: event.tier,
          };

          current.pipelines++;
          current.tier = event.tier;

          userUsage.set(userId, current);
        });

        // Generate alerts based on thresholds
        userUsage.forEach((usage, userId) => {
          const now = new Date().toISOString();

          // Free tier usage limit alert
          if (usage.tier === 'Free' && usage.downloads >= 8) {
            // Assuming 10 downloads is Free tier limit
            alerts.push({
              id: `free_usage_${userId}_${now}`,
              user_id: userId,
              current_tier: usage.tier,
              alert_reason: `Approaching Free tier usage limit (${usage.downloads}/10 downloads)`,
              severity: 'warning',
              usage_percentage: (usage.downloads / 10) * 100,
              download_count: usage.downloads,
              timestamp: now,
            });
          }

          // Audio download frequency alert for Free users
          if (
            usage.tier === 'Free' &&
            usage.audioDownloads >= ALERT_THRESHOLDS.AUDIO_DOWNLOAD_FREQUENCY
          ) {
            alerts.push({
              id: `audio_freq_${userId}_${now}`,
              user_id: userId,
              current_tier: usage.tier,
              alert_reason: `Frequent audio downloads (${usage.audioDownloads} in 24h) - consider Pro tier`,
              severity: 'warning',
              download_count: usage.audioDownloads,
              timestamp: now,
            });
          }

          // Pipeline generation limit alert
          if (usage.pipelines >= ALERT_THRESHOLDS.PIPELINE_GENERATION_LIMIT) {
            alerts.push({
              id: `pipeline_limit_${userId}_${now}`,
              user_id: userId,
              current_tier: usage.tier,
              alert_reason: `High pipeline generation (${usage.pipelines} in 24h) - consider Pro tier`,
              severity: 'critical',
              pipeline_count: usage.pipelines,
              timestamp: now,
            });
          }

          // Pro tier usage limit alert
          if (usage.tier === 'Pro' && usage.downloads >= 45) {
            // Assuming 50 downloads is Pro tier limit
            alerts.push({
              id: `pro_usage_${userId}_${now}`,
              user_id: userId,
              current_tier: usage.tier,
              alert_reason: `Approaching Pro tier usage limit (${usage.downloads}/50 downloads)`,
              severity: 'warning',
              usage_percentage: (usage.downloads / 50) * 100,
              download_count: usage.downloads,
              timestamp: now,
            });
          }
        });

        setAlerts(alerts);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load usage alerts'
        );
      } finally {
        setLoading(false);
      }
    }, []);

    // Load all data
    const loadAllData = useCallback(async () => {
      await Promise.all([
        loadDownloadStats(),
        loadLinkStats(),
        loadTierAnalytics(),
        loadAlerts(),
      ]);
    }, [loadDownloadStats, loadLinkStats, loadTierAnalytics, loadAlerts]);

    // Load data on mount and filter changes
    useEffect(() => {
      if (mcpContext.role === 'admin' || mcpContext.tier === 'Admin') {
        loadAllData();
      }
    }, [loadAllData, mcpContext]);

    // Handle filter changes
    const handleFilterChange = (key: keyof FilterState, value: string) => {
      setFilters(prev => ({
        ...prev,
        [key]: value,
      }));
    };

    // Apply filters
    const applyFilters = () => {
      loadAllData();
    };

    // Clear filters
    const clearFilters = () => {
      setFilters({
        startDate: '',
        endDate: '',
        assetType: '',
        eventType: '',
        tier: '',
        userId: '',
      });
    };

    // Export data
    const exportData = async (
      dataType: 'downloads' | 'links' | 'tiers' | 'alerts'
    ) => {
      try {
        setExporting(true);

        let data: any[] = [];
        let filename = '';
        let exportMetadata: ExportMetadata;

        switch (dataType) {
          case 'downloads':
            data = downloadStats;
            filename = 'analytics_downloads';
            exportMetadata = {
              exportedAt: new Date().toISOString(),
              exportedBy: mcpContext.role || 'admin',
              filters,
              dataType: 'downloads',
              recordCount: data.length,
              format: exportOptions.format,
            };
            break;
          case 'links':
            data = linkStats;
            filename = 'analytics_links';
            exportMetadata = {
              exportedAt: new Date().toISOString(),
              exportedBy: mcpContext.role || 'admin',
              filters,
              dataType: 'links',
              recordCount: data.length,
              format: exportOptions.format,
            };
            break;
          case 'tiers':
            data = tierAnalytics;
            filename = 'analytics_tiers';
            exportMetadata = {
              exportedAt: new Date().toISOString(),
              exportedBy: mcpContext.role || 'admin',
              filters,
              dataType: 'tiers',
              recordCount: data.length,
              format: exportOptions.format,
            };
            break;
          case 'alerts':
            data = alerts;
            filename = 'analytics_alerts';
            exportMetadata = {
              exportedAt: new Date().toISOString(),
              exportedBy: mcpContext.role || 'admin',
              filters: alertFilters,
              dataType: 'alerts',
              recordCount: data.length,
              format: exportOptions.format,
            };
            break;
        }

        // Add metadata if requested
        if (exportOptions.includeMetadata) {
          data = [
            {
              _metadata: exportMetadata,
              _data: data,
            },
          ];
        }

        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, '-')
          .split('T')[0];
        const finalFilename = `${filename}_${timestamp}`;

        if (exportOptions.format === 'csv') {
          // Convert to CSV with metadata
          let csvContent = '';

          if (exportOptions.includeMetadata) {
            csvContent += `# Export Metadata\n`;
            csvContent += `# Exported At: ${exportMetadata.exportedAt}\n`;
            csvContent += `# Exported By: ${exportMetadata.exportedBy}\n`;
            csvContent += `# Record Count: ${exportMetadata.recordCount}\n`;
            csvContent += `# Filters: ${JSON.stringify(exportMetadata.filters)}\n\n`;
          }

          if (data.length > 0) {
            const actualData = exportOptions.includeMetadata
              ? data[0]._data
              : data;
            const headers = Object.keys(actualData[0] || {}).join(',');
            const rows = actualData.map(row =>
              Object.values(row)
                .map(value =>
                  typeof value === 'string' ? `"${value}"` : value
                )
                .join(',')
            );
            csvContent += [headers, ...rows].join('\n');
          }

          // Try to download, fallback to clipboard
          try {
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${finalFilename}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } catch (downloadError) {
            // Fallback to clipboard
            await navigator.clipboard.writeText(csvContent);
            console.log('Download failed, data copied to clipboard');
          }
        } else {
          // JSON export
          const jsonContent = exportOptions.includeMetadata
            ? JSON.stringify(data, null, 2)
            : JSON.stringify(
                exportOptions.includeMetadata ? data[0]._data : data,
                null,
                2
              );

          try {
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${finalFilename}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } catch (downloadError) {
            // Fallback to clipboard
            await navigator.clipboard.writeText(jsonContent);
            console.log('Download failed, data copied to clipboard');
          }
        }

        // Log export event for audit
        if (
          typeof window !== 'undefined' &&
          (window as any).logTelemetryEvent
        ) {
          (window as any).logTelemetryEvent('admin_export', {
            dataType,
            format: exportOptions.format,
            includeMetadata: exportOptions.includeMetadata,
            recordCount: exportMetadata.recordCount,
            exportedBy: mcpContext.role,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        setError('Failed to export data');
        console.error('Export error:', err);
      } finally {
        setExporting(false);
      }
    };

    // Copy to clipboard
    const copyToClipboard = async (
      dataType: 'downloads' | 'links' | 'tiers' | 'alerts'
    ) => {
      try {
        let data: any[] = [];

        switch (dataType) {
          case 'downloads':
            data = downloadStats;
            break;
          case 'links':
            data = linkStats;
            break;
          case 'tiers':
            data = tierAnalytics;
            break;
          case 'alerts':
            data = alerts;
            break;
        }

        const json = JSON.stringify(data, null, 2);
        await navigator.clipboard.writeText(json);

        // Show success message (you might want to use a toast library)
        console.log('Data copied to clipboard');
      } catch (err) {
        setError('Failed to copy data to clipboard');
      }
    };

    // Enhanced alert management functions
    const markAlertAsResolved = async (alertId: string, notes?: string) => {
      try {
        setAlerts(prev =>
          prev.map(alert =>
            alert.id === alertId
              ? {
                  ...alert,
                  resolved: true,
                  resolved_by: mcpContext.role || 'admin',
                  resolved_at: new Date().toISOString(),
                  notes: notes || alert.notes,
                }
              : alert
          )
        );

        // Log alert resolution for audit
        if (
          typeof window !== 'undefined' &&
          (window as any).logTelemetryEvent
        ) {
          (window as any).logTelemetryEvent('alert_resolved', {
            alertId,
            resolvedBy: mcpContext.role,
            notes,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        setError('Failed to mark alert as resolved');
      }
    };

    const acknowledgeAlert = async (alertId: string) => {
      try {
        setAlerts(prev =>
          prev.map(alert =>
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
          )
        );

        // Log alert acknowledgment for audit
        if (
          typeof window !== 'undefined' &&
          (window as any).logTelemetryEvent
        ) {
          (window as any).logTelemetryEvent('alert_acknowledged', {
            alertId,
            acknowledgedBy: mcpContext.role,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        setError('Failed to acknowledge alert');
      }
    };

    const exportIndividualAlert = async (alert: UsageAlert) => {
      try {
        const alertData = {
          alert,
          exportMetadata: {
            exportedAt: new Date().toISOString(),
            exportedBy: mcpContext.role || 'admin',
            dataType: 'individual_alert',
            recordCount: 1,
            format: 'json',
          },
        };

        const jsonContent = JSON.stringify(alertData, null, 2);
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, '-')
          .split('T')[0];
        const filename = `alert_${alert.id}_${timestamp}.json`;

        try {
          const blob = new Blob([jsonContent], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (downloadError) {
          // Fallback to clipboard
          await navigator.clipboard.writeText(jsonContent);
          console.log('Download failed, alert data copied to clipboard');
        }

        // Log individual alert export for audit
        if (
          typeof window !== 'undefined' &&
          (window as any).logTelemetryEvent
        ) {
          (window as any).logTelemetryEvent('individual_alert_export', {
            alertId: alert.id,
            exportedBy: mcpContext.role,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        setError('Failed to export individual alert');
      }
    };

    // Access denied
    if (mcpContext.role !== 'admin' && mcpContext.tier !== 'Admin') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Access Denied
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Admin privileges are required to view this dashboard.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Usage Analytics Dashboard
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Monitor asset downloads, shareable links, and tier usage
                  analytics
                </p>
              </div>

              {/* Real-time Status Indicator */}
              <div className="flex items-center space-x-3">
                <div
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium ${
                    realtimeStats.subscriptionStatus === 'connected'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : realtimeStats.subscriptionStatus === 'error'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      realtimeStats.subscriptionStatus === 'connected'
                        ? 'bg-green-500 animate-pulse'
                        : realtimeStats.subscriptionStatus === 'error'
                          ? 'bg-red-500'
                          : 'bg-gray-500'
                    }`}
                  ></div>
                  <span>
                    {realtimeStats.subscriptionStatus === 'connected'
                      ? 'Live'
                      : realtimeStats.subscriptionStatus === 'error'
                        ? 'Error'
                        : 'Offline'}
                  </span>
                </div>

                {realtimeStats.isLive && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Last update: {formatDate(realtimeStats.lastUpdate)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  Loading analytics data...
                </span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error Loading Data
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Filters & Export Options
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={e =>
                    handleFilterChange('startDate', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={e => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Asset Type
                </label>
                <select
                  value={filters.assetType}
                  onChange={e =>
                    handleFilterChange('assetType', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Types</option>
                  <option value="slide">Slides</option>
                  <option value="script">Scripts</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
            </div>

            {/* Export Options */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Export Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Export Format
                  </label>
                  <select
                    value={exportOptions.format}
                    onChange={e =>
                      setExportOptions(prev => ({
                        ...prev,
                        format: e.target.value as 'csv' | 'json',
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeMetadata"
                    checked={exportOptions.includeMetadata}
                    onChange={e =>
                      setExportOptions(prev => ({
                        ...prev,
                        includeMetadata: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="includeMetadata"
                    className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                  >
                    Include Export Metadata
                  </label>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={applyFilters}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('downloads')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'downloads'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Asset Downloads
                </button>
                <button
                  onClick={() => setActiveTab('links')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'links'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Shareable Links
                </button>
                <button
                  onClick={() => setActiveTab('tiers')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'tiers'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Tier Analytics
                </button>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'alerts'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Alerts & Upgrade Nudges
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Downloads Tab */}
              {activeTab === 'downloads' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Asset Download Statistics
                      </h3>
                      {realtimeStats.isLive && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                          Live
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => exportData('downloads')}
                        disabled={exporting}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {exporting ? 'Exporting...' : 'Export'}
                      </button>
                      <button
                        onClick={() => copyToClipboard('downloads')}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {downloadStats.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No download statistics available
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Asset Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Total Downloads
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Success Rate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Total Size
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Unique Users
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Last Download
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {downloadStats.map((stat, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAssetTypeColor(stat.asset_type)}`}
                                >
                                  {stat.asset_type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {stat.total_downloads.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {stat.total_downloads > 0
                                  ? `${((stat.successful_downloads / stat.total_downloads) * 100).toFixed(1)}%`
                                  : '0%'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {formatFileSize(stat.total_file_size_bytes)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {stat.unique_users.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(stat.last_download)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Links Tab */}
              {activeTab === 'links' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Shareable Link Statistics
                      </h3>
                      {realtimeStats.isLive && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                          Live
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => exportData('links')}
                        disabled={exporting}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {exporting ? 'Exporting...' : 'Export'}
                      </button>
                      <button
                        onClick={() => copyToClipboard('links')}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {linkStats.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No link statistics available
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Event Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Total Events
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Unique Links
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Total Access
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Unique Visitors
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Last Event
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {linkStats.map((stat, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(stat.event_type)}`}
                                >
                                  {stat.event_type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {stat.total_events.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {stat.unique_links.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {stat.total_access_count.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {stat.unique_visitors.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(stat.last_event)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tiers Tab */}
              {activeTab === 'tiers' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Tier Usage Analytics
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => exportData('tiers')}
                        disabled={exporting}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {exporting ? 'Exporting...' : 'Export'}
                      </button>
                      <button
                        onClick={() => copyToClipboard('tiers')}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {tierAnalytics.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No tier analytics available
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Tier
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Total Users
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Total Downloads
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Links Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Avg Downloads/User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Avg Links/User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Last Activity
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {tierAnalytics.map((stat, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(stat.tier)}`}
                                >
                                  {stat.tier}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {stat.total_users.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {stat.total_downloads.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {stat.total_links_created.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {stat.avg_downloads_per_user.toFixed(1)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {stat.avg_links_per_user.toFixed(1)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(stat.last_activity)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Alerts Tab */}
              {activeTab === 'alerts' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Usage Alerts & Upgrade Nudges
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => exportData('alerts')}
                        disabled={exporting}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {exporting ? 'Exporting...' : 'Export'}
                      </button>
                      <button
                        onClick={() => copyToClipboard('alerts')}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Alert Filters */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Alert Filters
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Severity
                        </label>
                        <select
                          value={alertFilters.severity}
                          onChange={e =>
                            setAlertFilters(prev => ({
                              ...prev,
                              severity: e.target.value,
                            }))
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">All Severities</option>
                          <option value="warning">Warning</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tier
                        </label>
                        <select
                          value={alertFilters.tier}
                          onChange={e =>
                            setAlertFilters(prev => ({
                              ...prev,
                              tier: e.target.value,
                            }))
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">All Tiers</option>
                          <option value="Free">Free</option>
                          <option value="Pro">Pro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Acknowledged
                        </label>
                        <select
                          value={alertFilters.acknowledged}
                          onChange={e =>
                            setAlertFilters(prev => ({
                              ...prev,
                              acknowledged: e.target.value,
                            }))
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">All Alerts</option>
                          <option value="false">Unacknowledged</option>
                          <option value="true">Acknowledged</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Resolved
                        </label>
                        <select
                          value={alertFilters.resolved}
                          onChange={e =>
                            setAlertFilters(prev => ({
                              ...prev,
                              resolved: e.target.value,
                            }))
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">All Alerts</option>
                          <option value="false">Unresolved</option>
                          <option value="true">Resolved</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="enableAlertEmails"
                          checked={enableAlertEmails}
                          onChange={e => setEnableAlertEmails(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="enableAlertEmails"
                          className="ml-2 block text-xs text-gray-900 dark:text-gray-300"
                        >
                          Enable Alert Emails
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Alert Thresholds Info */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Alert Thresholds
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-800 dark:text-blue-200">
                      <div>
                        • Free tier:{' '}
                        {ALERT_THRESHOLDS.FREE_TIER_USAGE_LIMIT * 100}% usage
                        limit
                      </div>
                      <div>
                        • Audio downloads:{' '}
                        {ALERT_THRESHOLDS.AUDIO_DOWNLOAD_FREQUENCY}+ per day
                      </div>
                      <div>
                        • Pipeline generation:{' '}
                        {ALERT_THRESHOLDS.PIPELINE_GENERATION_LIMIT}+ per day
                      </div>
                      <div>
                        • Pro tier:{' '}
                        {ALERT_THRESHOLDS.PRO_TIER_USAGE_LIMIT * 100}% usage
                        limit
                      </div>
                    </div>
                  </div>

                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No usage alerts found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {alerts
                        .filter(alert => {
                          if (
                            alertFilters.severity &&
                            alert.severity !== alertFilters.severity
                          )
                            return false;
                          if (
                            alertFilters.tier &&
                            alert.current_tier !== alertFilters.tier
                          )
                            return false;
                          if (alertFilters.acknowledged !== '') {
                            const isAcknowledged = alert.acknowledged || false;
                            if (
                              alertFilters.acknowledged === 'true' &&
                              !isAcknowledged
                            )
                              return false;
                            if (
                              alertFilters.acknowledged === 'false' &&
                              isAcknowledged
                            )
                              return false;
                          }
                          if (alertFilters.resolved !== '') {
                            const isResolved = alert.resolved || false;
                            if (alertFilters.resolved === 'true' && !isResolved)
                              return false;
                            if (alertFilters.resolved === 'false' && isResolved)
                              return false;
                          }
                          return true;
                        })
                        .map((alert, index) => (
                          <div
                            key={alert.id}
                            className={`border rounded-lg p-4 ${
                              alert.resolved
                                ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                : getSeverityColor(alert.severity)
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  {getSeverityIcon(alert.severity)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(alert.current_tier)}`}
                                    >
                                      {alert.current_tier}
                                    </span>
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        alert.severity === 'critical'
                                          ? 'text-red-600 bg-red-50'
                                          : 'text-yellow-600 bg-yellow-50'
                                      }`}
                                    >
                                      {alert.severity}
                                    </span>
                                    {alert.resolved && (
                                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-50">
                                        Resolved
                                      </span>
                                    )}
                                    {alert.acknowledged && !alert.resolved && (
                                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-blue-600 bg-blue-50">
                                        Acknowledged
                                      </span>
                                    )}
                                    {alert.usage_percentage && (
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {alert.usage_percentage.toFixed(1)}%
                                        usage
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                    {alert.alert_reason}
                                  </p>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                    <span>User: {alert.user_id}</span>
                                    <span>{formatDate(alert.timestamp)}</span>
                                    {alert.download_count && (
                                      <span>
                                        {alert.download_count} downloads
                                      </span>
                                    )}
                                    {alert.pipeline_count && (
                                      <span>
                                        {alert.pipeline_count} pipelines
                                      </span>
                                    )}
                                  </div>
                                  {alert.resolved && alert.resolved_by && (
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                      Resolved by {alert.resolved_by} on{' '}
                                      {formatDate(alert.resolved_at || '')}
                                      {alert.notes && (
                                        <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                                          Notes: {alert.notes}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {!alert.resolved && (
                                  <>
                                    {!alert.acknowledged && (
                                      <button
                                        onClick={() =>
                                          acknowledgeAlert(alert.id)
                                        }
                                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                      >
                                        Acknowledge
                                      </button>
                                    )}
                                    <button
                                      onClick={() =>
                                        markAlertAsResolved(alert.id)
                                      }
                                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                    >
                                      Resolve
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => exportIndividualAlert(alert)}
                                  className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                  Export
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* TODO: Email integration hook to notify admins */}
                  {/* TODO: "Mark as acknowledged" toggle for each alert */}
                </div>
              )}
            </div>
          </div>

          {/* TODO: Jest tests for each analytics section */}
          {/* TODO: Realtime charts using Supabase subscriptions (future) */}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering AdminUsageDashboard:', error);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error Rendering Dashboard
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    An unexpected error occurred while loading the dashboard
                    data.
                  </p>
                  <p>Please try refreshing the page or contact support.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
