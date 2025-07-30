// MCP Context Block
/*
{
  file: "AdminPromptModerationPanel.tsx",
  role: "ui-engineer",
  allowedActions: ["moderate", "approve", "reject"],
  tier: "Admin",
  contentSensitivity: "medium",
  theme: "writing_assistant"
}
*/

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useMCP } from '../useMCP';
import { registerUserPromptPatterns } from '../engines/PromptPatternLibrary';

// Types
interface PromptPatternSubmission {
  id: string;
  user_id: string;
  genre: string;
  arc: "setup" | "rising" | "failing" | "climax" | "resolution";
  pattern: string;
  tone?: "dramatic" | "lighthearted" | "ironic" | "reflective" | "dark";
  moderation_status: "pending" | "approved" | "rejected";
  moderation_note?: string;
  created_at: string;
  updated_at: string;
}

interface ModerationAction {
  patternId: string;
  action: "approve" | "reject" | "revert";
  note?: string;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AdminPromptModerationPanelProps {
  onModerationComplete?: (action: ModerationAction) => void;
  showRejected?: boolean;
  enableBulkActions?: boolean;
}

const AdminPromptModerationPanel: React.FC<AdminPromptModerationPanelProps> = ({
  onModerationComplete,
  showRejected = false,
  enableBulkActions = true
}) => {
  const mcpContext = useMCP('AdminPromptModerationPanel.tsx');
  const [submissions, setSubmissions] = useState<PromptPatternSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatterns, setSelectedPatterns] = useState<Set<string>>(new Set());
  const [moderationNotes, setModerationNotes] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [filters, setFilters] = useState({
    genre: '',
    arc: '',
    userId: ''
  });

  // Check if user has Admin tier
  const hasAdminAccess = mcpContext.tier === 'Admin';

  // Load submissions from Supabase
  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('user_prompt_patterns')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply status filter based on active tab
      if (activeTab === 'pending') {
        query = query.eq('moderation_status', 'pending');
      } else if (activeTab === 'approved') {
        query = query.eq('moderation_status', 'approved');
      } else if (activeTab === 'rejected') {
        query = query.eq('moderation_status', 'rejected');
      }

      // Apply additional filters
      if (filters.genre) {
        query = query.eq('genre', filters.genre);
      }
      if (filters.arc) {
        query = query.eq('arc', filters.arc);
      }
      if (filters.userId) {
        query = query.ilike('user_id', `%${filters.userId}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setSubmissions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  // Load submissions on mount and when filters change
  useEffect(() => {
    if (hasAdminAccess) {
      loadSubmissions();
    }
  }, [hasAdminAccess, activeTab, filters]);

  // Handle moderation action
  const handleModeration = async (patternId: string, action: 'approve' | 'reject' | 'revert', note?: string) => {
    try {
      const newStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending';
      
      const { error } = await supabase
        .from('user_prompt_patterns')
        .update({
          moderation_status: newStatus,
          moderation_note: note || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', patternId);

      if (error) {
        throw error;
      }

      // If approved, register with the pattern library
      if (action === 'approve') {
        const pattern = submissions.find(s => s.id === patternId);
        if (pattern) {
          registerUserPromptPatterns([{
            genre: pattern.genre,
            patterns: [{
              arc: pattern.arc,
              pattern: pattern.pattern,
              tone: pattern.tone,
              source: 'user'
            }]
          }]);
        }
      }

      // Update local state
      setSubmissions(prev => 
        prev.map(s => 
          s.id === patternId 
            ? { ...s, moderation_status: newStatus, moderation_note: note || undefined }
            : s
        )
      );

      // Clear selection
      setSelectedPatterns(prev => {
        const newSet = new Set(prev);
        newSet.delete(patternId);
        return newSet;
      });

      // Clear moderation note
      setModerationNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[patternId];
        return newNotes;
      });

      // Call callback
      if (onModerationComplete) {
        onModerationComplete({ patternId, action, note });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update submission');
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: 'approve' | 'reject') => {
    const selectedIds = Array.from(selectedPatterns);
    
    for (const patternId of selectedIds) {
      const note = moderationNotes[patternId];
      await handleModeration(patternId, action, note);
    }
    
    setSelectedPatterns(new Set());
    setModerationNotes({});
  };

  // Export patterns
  const exportPatterns = (status: 'approved' | 'rejected' | 'pending') => {
    const patternsToExport = submissions.filter(s => s.moderation_status === status);
    
    const data = {
      patterns: patternsToExport,
      exportedAt: new Date().toISOString(),
      status,
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-patterns-${status}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // If user doesn't have Admin access, show locked message
  if (!hasAdminAccess) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Admin Access Required
        </h3>
        <p className="text-gray-600">
          This moderation panel is only available to administrators.
        </p>
      </div>
    );
  }

  // Filter submissions based on active tab
  const filteredSubmissions = submissions.filter(submission => {
    if (activeTab === 'pending') return submission.moderation_status === 'pending';
    if (activeTab === 'approved') return submission.moderation_status === 'approved';
    if (activeTab === 'rejected') return submission.moderation_status === 'rejected';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Prompt Pattern Moderation
              </h2>
              <p className="text-gray-600 mt-1">
                Review and moderate user-submitted prompt patterns
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportPatterns('approved')}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Export Approved
              </button>
              <button
                onClick={() => exportPatterns('pending')}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Export Pending
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="filter-genre" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Genre
              </label>
              <select
                id="filter-genre"
                value={filters.genre}
                onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Genres</option>
                <option value="Romance">Romance</option>
                <option value="Mystery">Mystery</option>
                <option value="Science Fiction">Science Fiction</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Thriller">Thriller</option>
                <option value="Historical">Historical</option>
                <option value="Contemporary">Contemporary</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter-arc" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Arc
              </label>
              <select
                id="filter-arc"
                value={filters.arc}
                onChange={(e) => setFilters(prev => ({ ...prev, arc: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Arcs</option>
                <option value="setup">Setup</option>
                <option value="rising">Rising</option>
                <option value="failing">Failing</option>
                <option value="climax">Climax</option>
                <option value="resolution">Resolution</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter-user" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by User ID
              </label>
              <input
                id="filter-user"
                type="text"
                value={filters.userId}
                onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
                placeholder="Enter user ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ genre: '', arc: '', userId: '' })}
                className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'pending'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📌 Pending ({submissions.filter(s => s.moderation_status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'approved'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ✅ Approved ({submissions.filter(s => s.moderation_status === 'approved').length})
            </button>
            {showRejected && (
              <button
                onClick={() => setActiveTab('rejected')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ❌ Rejected ({submissions.filter(s => s.moderation_status === 'rejected').length})
              </button>
            )}
          </nav>
        </div>

        {/* Bulk Actions */}
        {enableBulkActions && selectedPatterns.size > 0 && activeTab === 'pending' && (
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedPatterns.size} pattern(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  ✅ Bulk Approve
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  ❌ Bulk Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="px-6 py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading submissions...</p>
          </div>
        )}

        {/* Submissions List */}
        {!loading && (
          <div className="px-6 py-4">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No {activeTab} submissions found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={`p-4 border rounded-lg ${
                      submission.moderation_status === 'approved'
                        ? 'border-green-200 bg-green-50'
                        : submission.moderation_status === 'rejected'
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    role="article"
                    aria-label={`Pattern submission by ${submission.user_id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {submission.arc}
                          </span>
                          <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                            {submission.genre}
                          </span>
                          {submission.tone && (
                            <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                              {submission.tone}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            by {submission.user_id}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{submission.pattern}</p>
                        <p className="text-xs text-gray-500">
                          Submitted: {new Date(submission.created_at).toLocaleDateString()}
                        </p>
                        {submission.moderation_note && (
                          <p className="text-xs text-gray-600 mt-1 italic">
                            Note: {submission.moderation_note}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {activeTab === 'pending' && (
                          <>
                            {enableBulkActions && (
                              <input
                                type="checkbox"
                                checked={selectedPatterns.has(submission.id)}
                                onChange={(e) => {
                                  const newSet = new Set(selectedPatterns);
                                  if (e.target.checked) {
                                    newSet.add(submission.id);
                                  } else {
                                    newSet.delete(submission.id);
                                  }
                                  setSelectedPatterns(newSet);
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                aria-label={`Select pattern ${submission.id} for bulk action`}
                              />
                            )}
                            <textarea
                              placeholder="Moderation note (optional)"
                              value={moderationNotes[submission.id] || ''}
                              onChange={(e) => setModerationNotes(prev => ({
                                ...prev,
                                [submission.id]: e.target.value
                              }))}
                              className="w-32 px-2 py-1 text-xs border border-gray-300 rounded resize-none"
                              rows={2}
                            />
                            <button
                              onClick={() => handleModeration(submission.id, 'approve', moderationNotes[submission.id])}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                              aria-label={`Approve pattern ${submission.id}`}
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handleModeration(submission.id, 'reject', moderationNotes[submission.id])}
                              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              aria-label={`Reject pattern ${submission.id}`}
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}
                        {activeTab === 'approved' && (
                          <button
                            onClick={() => handleModeration(submission.id, 'revert')}
                            className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                            aria-label={`Revert approved pattern ${submission.id} to pending`}
                          >
                            🔁 Revert
                          </button>
                        )}
                        {activeTab === 'rejected' && (
                          <button
                            onClick={() => handleModeration(submission.id, 'approve', moderationNotes[submission.id])}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            aria-label={`Approve rejected pattern ${submission.id}`}
                          >
                            ✅ Approve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPromptModerationPanel; 