// MCP Context Block
/*
{
  file: "AuditSyncDashboard.tsx",
  role: "audit-monitor",
  allowedActions: ["view", "monitor", "export"],
  tier: "Admin",
  contentSensitivity: "high",
  theme: "monitoring"
}
*/

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useMCP } from '../../useMCP';

// Types for audit sync data
interface AuditSyncStatus {
  id: string;
  timestamp: string;
  status: 'success' | 'failure';
  destination: 'S3' | 'BigQuery';
  durationMs: number;
  errorMessage?: string;
  recordsExported?: number;
  environment?: string;
}

interface SyncSummary {
  totalSyncs: number;
  successCount: number;
  failureCount: number;
  avgDurationMs: number;
  lastSyncTime?: string;
  lastSyncStatus?: 'success' | 'failure';
}

interface FilterState {
  startDate: string;
  endDate: string;
  status: string;
  destination: string;
  environment: string;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Utility functions
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'success': return 'text-green-600 bg-green-50';
    case 'failure': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'success': return '✅';
    case 'failure': return '❌';
    default: return '⏳';
  }
}

function getDestinationIcon(destination: string): string {
  switch (destination) {
    case 'S3': return '☁️';
    case 'BigQuery': return '📊';
    default: return '📁';
  }
}

export default function AuditSyncDashboard() {
  const mcpContext = useMCP('AuditSyncDashboard.tsx');
  const [syncData, setSyncData] = useState<AuditSyncStatus[]>([]);
  const [summary, setSummary] = useState<SyncSummary>({
    totalSyncs: 0,
    successCount: 0,
    failureCount: 0,
    avgDurationMs: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    status: '',
    destination: '',
    environment: ''
  });

  // Check admin access
  const hasAdminAccess = mcpContext.tier === 'Admin';
  const isAuditMonitorEnabled = process.env.NEXT_PUBLIC_AUDIT_MONITOR_ENABLED === 'true';

  // Fetch sync data from Supabase
  const fetchSyncData = useCallback(async () => {
    if (!hasAdminAccess) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('audit_sync_status')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      // Apply filters
      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.destination) {
        query = query.eq('destination', filters.destination);
      }

      if (filters.environment) {
        query = query.eq('environment', filters.environment);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch sync data: ${error.message}`);
      }

      const syncRecords = data || [];
      setSyncData(syncRecords);

      // Calculate summary
      const totalSyncs = syncRecords.length;
      const successCount = syncRecords.filter(r => r.status === 'success').length;
      const failureCount = syncRecords.filter(r => r.status === 'failure').length;
      const avgDurationMs = syncRecords.length > 0 
        ? syncRecords.reduce((sum, r) => sum + r.durationMs, 0) / syncRecords.length 
        : 0;
      const lastSync = syncRecords[0];

      setSummary({
        totalSyncs,
        successCount,
        failureCount,
        avgDurationMs,
        lastSyncTime: lastSync?.timestamp,
        lastSyncStatus: lastSync?.status
      });

      setLastRefresh(new Date());

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sync data');
      console.error('Sync data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [hasAdminAccess, filters]);

  // Load initial data
  useEffect(() => {
    if (hasAdminAccess && isAuditMonitorEnabled) {
      fetchSyncData();
    }
  }, [hasAdminAccess, isAuditMonitorEnabled, fetchSyncData]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchSyncData();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchSyncData]);

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchSyncData();
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: '',
      destination: '',
      environment: ''
    });
  };

  // Export sync data
  const exportSyncData = async (format: 'csv' | 'json') => {
    try {
      let query = supabase
        .from('audit_sync_status')
        .select('*')
        .order('timestamp', { ascending: false });

      // Apply current filters
      if (filters.startDate) query = query.gte('timestamp', filters.startDate);
      if (filters.endDate) query = query.lte('timestamp', filters.endDate);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.destination) query = query.eq('destination', filters.destination);
      if (filters.environment) query = query.eq('environment', filters.environment);

      const { data, error } = await query;

      if (error) throw new Error(`Export failed: ${error.message}`);

      const exportData = data || [];

      if (format === 'csv') {
        // Generate CSV
        const headers = ['Timestamp', 'Status', 'Destination', 'Duration (ms)', 'Records Exported', 'Environment', 'Error Message'];
        const csvContent = [
          headers.join(','),
          ...exportData.map(record => [
            formatTimestamp(record.timestamp),
            record.status,
            record.destination,
            record.durationMs,
            record.recordsExported || 0,
            record.environment || '',
            `"${(record.errorMessage || '').replace(/"/g, '""')}"`
          ].join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-sync-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Generate JSON
        const jsonData = {
          exportDate: new Date().toISOString(),
          filters,
          summary,
          totalRecords: exportData.length,
          data: exportData
        };

        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-sync-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }

      // Log export to audit record
      try {
        await supabase
          .from('audit_sync_status')
          .insert({
            timestamp: new Date().toISOString(),
            status: 'success',
            destination: 'Dashboard',
            durationMs: 0,
            recordsExported: exportData.length,
            environment: 'dashboard-export',
            errorMessage: null
          });
      } catch (auditError) {
        console.error('Failed to log export to audit:', auditError);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      console.error('Export error:', err);
    }
  };

  // If not admin, show access denied
  if (!hasAdminAccess) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-2xl mb-2">🔒</div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Admin Access Required
          </h2>
          <p className="text-red-700">
            This audit sync dashboard is only available to administrators.
          </p>
        </div>
      </div>
    );
  }

  // If audit monitor is disabled
  if (!isAuditMonitorEnabled) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-600 text-2xl mb-2">⚠️</div>
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Audit Monitor Disabled
          </h2>
          <p className="text-yellow-700">
            The audit sync monitoring feature is currently disabled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6" role="main" aria-label="Audit Sync Dashboard">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Audit Sync Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor audit log export operations and sync status in real-time.
        </p>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span>Last refresh: {lastRefresh.toLocaleTimeString()}</span>
          <button
            onClick={fetchSyncData}
            disabled={loading}
            className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
            aria-label="Refresh data now"
          >
            {loading ? 'Refreshing...' : 'Refresh now'}
          </button>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" role="region" aria-label="Sync Summary">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">📊</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Syncs</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalSyncs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">✅</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Success</p>
              <p className="text-2xl font-bold text-green-600">{summary.successCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">❌</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Failures</p>
              <p className="text-2xl font-bold text-red-600">{summary.failureCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">⏱️</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(summary.avgDurationMs)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6" role="region" aria-label="Filters">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date Range */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
            </select>
          </div>

          {/* Destination Filter */}
          <div>
            <label htmlFor="destinationFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Destination
            </label>
            <select
              id="destinationFilter"
              value={filters.destination}
              onChange={(e) => handleFilterChange('destination', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Destinations</option>
              <option value="S3">S3</option>
              <option value="BigQuery">BigQuery</option>
            </select>
          </div>

          {/* Environment Filter */}
          <div>
            <label htmlFor="environmentFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Environment
            </label>
            <select
              id="environmentFilter"
              value={filters.environment}
              onChange={(e) => handleFilterChange('environment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Environments</option>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={applyFilters}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Apply Filters'}
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Auto-refresh toggle */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6" role="region" aria-label="Auto Refresh">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Auto Refresh</h3>
            <p className="text-sm text-gray-500">Refresh data every 60 seconds</p>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Enable</span>
          </label>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6" role="region" aria-label="Export Options">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h2>
        
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={() => exportSyncData('csv')}
            disabled={syncData.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            Export CSV
          </button>
          <button
            onClick={() => exportSyncData('json')}
            disabled={syncData.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6" role="alert">
          <div className="flex">
            <div className="text-red-600 mr-2">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sync History Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" role="region" aria-label="Sync History">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Sync History</h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing {syncData.length} sync operations
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" role="table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                  Records
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                  Environment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                  Error
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {syncData.map((sync, index) => (
                <tr 
                  key={sync.id} 
                  className={`hover:bg-gray-50 focus-within:bg-blue-50 ${
                    sync.status === 'failure' ? 'bg-red-50' : ''
                  }`}
                  tabIndex={0}
                  role="row"
                  aria-label={`Sync ${index + 1}: ${sync.status} to ${sync.destination}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTimestamp(sync.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sync.status)}`}>
                      <span className="mr-1">{getStatusIcon(sync.status)}</span>
                      {sync.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center">
                      <span className="mr-1">{getDestinationIcon(sync.destination)}</span>
                      {sync.destination}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(sync.durationMs)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sync.recordsExported?.toLocaleString() || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sync.environment || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {sync.errorMessage || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {syncData.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sync data found</h3>
            <p className="text-gray-500">
              {filters.status || filters.destination || filters.environment 
                ? 'Try adjusting your filters to see more results.'
                : 'No audit sync operations have been recorded yet.'
              }
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading sync data...</p>
          </div>
        )}
      </div>

      {/* Live Region for Updates */}
      <div aria-live="polite" className="sr-only">
        {loading ? 'Loading sync data...' : `${syncData.length} sync operations loaded`}
      </div>
    </div>
  );
} 