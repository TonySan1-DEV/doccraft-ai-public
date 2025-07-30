// MCP Context Block
/*
{
  file: "PreferenceVersionHistory.tsx",
  role: "frontend-developer",
  allowedActions: ["ui", "version", "preview"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "preference_versions"
}
*/

import { useState, useCallback } from 'react';
import { useAgentPreferences } from '../contexts/AgentPreferencesContext';
import { PreferenceVersion } from '../services/preferenceVersionService';

interface PreferenceVersionHistoryProps {
  className?: string;
  onVersionRestored?: (version: PreferenceVersion) => void;
}

export function PreferenceVersionHistory({ 
  className = '',
  onVersionRestored 
}: PreferenceVersionHistoryProps) {
  const { 
    versionHistory, 
    isLoadingVersions, 

    restoreVersion, 
    deleteVersion, 
    updateVersionLabel 
  } = useAgentPreferences();

  const [selectedVersion, setSelectedVersion] = useState<PreferenceVersion | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle version restore
  const handleRestore = useCallback(async (version: PreferenceVersion) => {
    if (!confirm(`Are you sure you want to restore version ${version.version_number}? This will create a new version with the restored preferences.`)) {
      return;
    }

    setIsRestoring(true);
    try {
      const success = await restoreVersion(version.id, {
        label: `Restored from version ${version.version_number}`,
        reason: 'User restored from version history'
      });

      if (success) {
        onVersionRestored?.(version);
        setSelectedVersion(null);
      }
    } catch (error) {
      console.error('Failed to restore version:', error);
    } finally {
      setIsRestoring(false);
    }
  }, [restoreVersion, onVersionRestored]);

  // Handle version delete
  const handleDelete = useCallback(async (version: PreferenceVersion) => {
    if (!confirm(`Are you sure you want to delete version ${version.version_number}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(version.id);
    try {
      await deleteVersion(version.id);
    } catch (error) {
      console.error('Failed to delete version:', error);
    } finally {
      setIsDeleting(null);
    }
  }, [deleteVersion]);

  // Handle label editing
  const handleEditLabel = useCallback((version: PreferenceVersion) => {
    setEditingLabel(version.id);
    setNewLabel(version.label || '');
  }, []);

  const handleSaveLabel = useCallback(async (version: PreferenceVersion) => {
    try {
      await updateVersionLabel(version.id, newLabel);
      setEditingLabel(null);
      setNewLabel('');
    } catch (error) {
      console.error('Failed to update label:', error);
    }
  }, [updateVersionLabel, newLabel]);

  const handleCancelLabel = useCallback(() => {
    setEditingLabel(null);
    setNewLabel('');
  }, []);

  // Get preference summary for display
  const getPreferenceSummary = (preferences: any) => {
    const summary = [];
    if (preferences.tone) summary.push(`Tone: ${preferences.tone}`);
    if (preferences.language) summary.push(`Language: ${preferences.language}`);
    if (preferences.copilotEnabled !== undefined) summary.push(`Copilot: ${preferences.copilotEnabled ? 'On' : 'Off'}`);
    if (preferences.memoryEnabled !== undefined) summary.push(`Memory: ${preferences.memoryEnabled ? 'On' : 'Off'}`);
    return summary.join(', ');
  };

  if (isLoadingVersions) {
    return (
      <div className={`preference-version-history ${className}`}>
        <div className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading version history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`preference-version-history ${className}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage and restore previous preference configurations
          </p>
        </div>

        {/* Version List */}
        <div className="max-h-96 overflow-y-auto">
          {versionHistory.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p>No version history yet</p>
              <p className="text-sm mt-1">Your preference changes will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {versionHistory.map((version) => (
                <div 
                  key={version.id} 
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                    version.is_current ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Version Header */}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          Version {version.version_number}
                        </span>
                        {version.is_current && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Current
                          </span>
                        )}
                        {version.label && (
                          <span className="text-sm text-gray-600">
                            "{version.label}"
                          </span>
                        )}
                      </div>

                      {/* Version Details */}
                      <div className="text-sm text-gray-600 mb-2">
                        {formatDate(version.created_at)}
                      </div>

                      {/* Preference Summary */}
                      <div className="text-sm text-gray-700 mb-3">
                        {getPreferenceSummary(version.preferences)}
                      </div>

                      {/* Label Editing */}
                      {editingLabel === version.id ? (
                        <div className="flex items-center space-x-2 mb-3">
                          <input
                            type="text"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter version label..."
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveLabel(version)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelLabel}
                            className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedVersion(version)}
                            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
                          >
                            Preview
                          </button>
                          {!version.is_current && (
                            <>
                              <button
                                onClick={() => handleRestore(version)}
                                disabled={isRestoring}
                                className="text-sm text-green-600 hover:text-green-800 focus:outline-none focus:underline disabled:opacity-50"
                              >
                                {isRestoring ? 'Restoring...' : 'Restore'}
                              </button>
                              <button
                                onClick={() => handleEditLabel(version)}
                                className="text-sm text-gray-600 hover:text-gray-800 focus:outline-none focus:underline"
                              >
                                Edit Label
                              </button>
                              <button
                                onClick={() => handleDelete(version)}
                                disabled={isDeleting === version.id}
                                className="text-sm text-red-600 hover:text-red-800 focus:outline-none focus:underline disabled:opacity-50"
                              >
                                {isDeleting === version.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Version Preview Modal */}
      {selectedVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Version {selectedVersion.version_number} Preview
                </h3>
                <button
                  onClick={() => setSelectedVersion(null)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {selectedVersion.label && (
                <p className="text-sm text-gray-600 mt-1">"{selectedVersion.label}"</p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                Created: {formatDate(selectedVersion.created_at)}
              </p>
            </div>
            
            <div className="px-6 py-4 overflow-y-auto max-h-96">
              <pre className="text-sm bg-gray-50 p-4 rounded-md overflow-x-auto">
                {JSON.stringify(selectedVersion.preferences, null, 2)}
              </pre>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedVersion(null)}
                className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
              {!selectedVersion.is_current && (
                <button
                  onClick={() => handleRestore(selectedVersion)}
                  disabled={isRestoring}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isRestoring ? 'Restoring...' : 'Restore This Version'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 