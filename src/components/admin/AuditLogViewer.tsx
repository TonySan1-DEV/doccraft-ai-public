// MCP Context Block
/*
{
  file: "AuditLogViewer.tsx",
  role: "admin-viewer",
  allowedActions: ["view", "filter", "export"],
  tier: "Admin",
  contentSensitivity: "high",
  theme: "audit"
}
*/

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useMCP } from '../../useMCP';

// Types for audit log data
interface AuditLogEntry {
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
  // Joined data from pattern_moderation_history view
  genre?: string;
  arc?: string;
  pattern?: string;
  moderator_email?: string;
}

interface FilterState {
  startDate: string;
  endDate: string;
  action: string;
  moderatorId: string;
  patternId: string;
  genre: string;
  showRejectedWithReason: boolean;
}

interface ExportOptions {
  format: 'json' | 'csv';
  includeMetadata: boolean;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Utility functions
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString();
}

function getActionColor(action: string): string {
  switch (action) {
    case 'approve': return 'text-green-600 bg-green-50';
    case 'reject': return 'text-red-600 bg-red-50';
    case 'revert': return 'text-yellow-600 bg-yellow-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

function getActionIcon(action: string): string {
  switch (action) {
    case 'approve': return '✅';
    case 'reject': return '❌';
    case 'revert': return '🔄';
    default: return '📝';
  }
}

export default function AuditLogViewer() {
  const mcpContext = useMCP('AuditLogViewer.tsx');
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [exporting, setExporting] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    action: '',
    moderatorId: '',
    patternId: '',
    genre: '',
    showRejectedWithReason: false
  });

  // Export options
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeMetadata: true
  });

  // Check admin access
  const hasAdminAccess = mcpContext.tier === 'Admin';

  // Fetch audit logs with filters
  const fetchAuditLogs = useCallback(async (page: number = 1, reset: boolean = false) => {
    if (!hasAdminAccess) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('pattern_moderation_history')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * 50, page * 50 - 1);

      // Apply filters
      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      if (filters.moderatorId) {
        query = query.eq('moderator_id', filters.moderatorId);
      }

      if (filters.patternId) {
        query = query.eq('pattern_id', filters.patternId);
      }

      if (filters.genre) {
        query = query.eq('genre', filters.genre);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters.showRejectedWithReason) {
        query = query.eq('action', 'reject').not('reason', 'is', null);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch audit logs: ${error.message}`);
      }

      const newLogs = data || [];
      
      if (reset) {
        setLogs(newLogs);
        setCurrentPage(1);
      } else {
        setLogs(prev => [...prev, ...newLogs]);
      }

      setTotalCount(count || 0);
      setHasMore(newLogs.length === 50);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
      console.error('Audit log fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [hasAdminAccess, filters]);

  // Load initial data
  useEffect(() => {
    if (hasAdminAccess) {
      fetchAuditLogs(1, true);
    }
  }, [hasAdminAccess, fetchAuditLogs]);

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchAuditLogs(1, true);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      action: '',
      moderatorId: '',
      patternId: '',
      genre: '',
      showRejectedWithReason: false
    });
  };

  // Load more data
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchAuditLogs(currentPage + 1, false);
      setCurrentPage(prev => prev + 1);
    }
  };

  // Export audit logs
  const exportLogs = async () => {
    setExporting(true);
    try {
      let query = supabase
        .from('pattern_moderation_history')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply current filters
      if (filters.action) query = query.eq('action', filters.action);
      if (filters.moderatorId) query = query.eq('moderator_id', filters.moderatorId);
      if (filters.patternId) query = query.eq('pattern_id', filters.patternId);
      if (filters.genre) query = query.eq('genre', filters.genre);
      if (filters.startDate) query = query.gte('created_at', filters.startDate);
      if (filters.endDate) query = query.lte('created_at', filters.endDate);
      if (filters.showRejectedWithReason) {
        query = query.eq('action', 'reject').not('reason', 'is', null);
      }

      const { data, error } = await query;

      if (error) throw new Error(`Export failed: ${error.message}`);

      const exportData = data || [];

      if (exportOptions.format === 'csv') {
        // Generate CSV
        const headers = ['Timestamp', 'Action', 'Pattern ID', 'Genre', 'Arc', 'Moderator', 'Reason', 'Note', 'IP Address'];
        const csvContent = [
          headers.join(','),
          ...exportData.map(log => [
            formatDate(log.created_at),
            log.action,
            log.pattern_id,
            log.genre || '',
            log.arc || '',
            log.moderator_email || log.moderator_id,
            `"${(log.reason || '').replace(/"/g, '""')}"`,
            `"${(log.note || '').replace(/"/g, '""')}"`,
            log.ip_address || ''
          ].join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Generate JSON
        const jsonData = exportOptions.includeMetadata ? {
          exportDate: new Date().toISOString(),
          filters,
          totalRecords: exportData.length,
          data: exportData
        } : exportData;

        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      console.error('Export error:', err);
    } finally {
      setExporting(false);
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
            This audit log viewer is only available to administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6" role="main" aria-label="Audit Log Viewer">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Audit Log Viewer
        </h1>
        <p className="text-gray-600">
          View and export moderation activity logs for transparency and compliance.
        </p>
        {totalCount > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Showing {logs.length} of {totalCount} total records
          </p>
        )}
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
              aria-describedby="date-help"
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

          {/* Action Type */}
          <div>
            <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
              Action Type
            </label>
            <select
              id="action"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
              <option value="revert">Revert</option>
            </select>
          </div>

          {/* Moderator ID */}
          <div>
            <label htmlFor="moderatorId" className="block text-sm font-medium text-gray-700 mb-1">
              Moderator ID
            </label>
            <input
              id="moderatorId"
              type="text"
              value={filters.moderatorId}
              onChange={(e) => handleFilterChange('moderatorId', e.target.value)}
              placeholder="Enter moderator ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Pattern ID */}
          <div>
            <label htmlFor="patternId" className="block text-sm font-medium text-gray-700 mb-1">
              Pattern ID
            </label>
            <input
              id="patternId"
              type="text"
              value={filters.patternId}
              onChange={(e) => handleFilterChange('patternId', e.target.value)}
              placeholder="Enter pattern ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Genre */}
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
              Genre
            </label>
            <select
              id="genre"
              value={filters.genre}
              onChange={(e) => handleFilterChange('genre', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Genres</option>
              <option value="Mystery">Mystery</option>
              <option value="Romance">Romance</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Fantasy">Fantasy</option>
            </select>
          </div>
        </div>

        {/* Special Filter */}
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.showRejectedWithReason}
              onChange={(e) => handleFilterChange('showRejectedWithReason', e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">
              Only show rejected patterns with reason
            </span>
          </label>
        </div>

        {/* Filter Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={applyFilters}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            aria-describedby="filter-status"
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

        <div id="filter-status" className="sr-only" aria-live="polite">
          {loading ? 'Loading filtered results...' : 'Filters applied'}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6" role="region" aria-label="Export Options">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h2>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label htmlFor="exportFormat" className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <select
              id="exportFormat"
              value={exportOptions.format}
              onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'json' | 'csv' }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeMetadata}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Include metadata</span>
            </label>
          </div>

          <button
            onClick={exportLogs}
            disabled={exporting || logs.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : 'Export Logs'}
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

      {/* Audit Logs Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" role="region" aria-label="Audit Logs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" role="table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                  Pattern ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                  Genre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                  Moderator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log, index) => (
                <tr 
                  key={log.id} 
                  className="hover:bg-gray-50 focus-within:bg-blue-50"
                  tabIndex={0}
                  role="row"
                  aria-label={`Log entry ${index + 1}: ${log.action} action on ${log.pattern_id}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      <span className="mr-1">{getActionIcon(log.action)}</span>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {log.pattern_id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.genre || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.moderator_email || log.moderator_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {log.reason || log.note || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ip_address || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {logs.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
            <p className="text-gray-500">
              {filters.action || filters.moderatorId || filters.patternId 
                ? 'Try adjusting your filters to see more results.'
                : 'No moderation activity has been logged yet.'
              }
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading audit logs...</p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && logs.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Live Region for Updates */}
      <div aria-live="polite" className="sr-only">
        {loading ? 'Loading audit logs...' : `${logs.length} audit log entries loaded`}
      </div>
    </div>
  );
} 