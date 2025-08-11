export const mcpContext = {
  file: 'modules/narrativeDashboard/components/RevisionHistoryPanel.tsx',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import React, { useState, useMemo, useCallback } from 'react';
import type { SceneRevision } from '../services/revisionEngine';

interface RevisionHistoryPanelProps {
  revisions: SceneRevision[];
  sceneId: string;
  onUndo: (revision: SceneRevision) => void;
  onRetry: (revision: SceneRevision) => void;
}

function formatTimestamp(ts: number): string {
  if (!ts || isNaN(ts)) return 'Unknown';
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return 'Unknown';
  }
}

// Simple word-level diff (replacement for 'diff' package)
function diffWords(
  oldStr: string,
  newStr: string
): Array<{ value: string; added?: boolean; removed?: boolean }> {
  if (!oldStr || !newStr) return [];

  const oldWords = oldStr.split(/(\s+)/);
  const newWords = newStr.split(/(\s+)/);
  const result: Array<{ value: string; added?: boolean; removed?: boolean }> =
    [];
  let i = 0,
    j = 0;
  while (i < oldWords.length && j < newWords.length) {
    if (oldWords[i] === newWords[j]) {
      result.push({ value: oldWords[i] });
      i++;
      j++;
    } else if (newWords[j] && !oldWords.includes(newWords[j])) {
      result.push({ value: newWords[j], added: true });
      j++;
    } else if (oldWords[i] && !newWords.includes(oldWords[i])) {
      result.push({ value: oldWords[i], removed: true });
      i++;
    } else {
      result.push({ value: oldWords[i], removed: true });
      i++;
    }
  }
  while (i < oldWords.length) {
    result.push({ value: oldWords[i], removed: true });
    i++;
  }
  while (j < newWords.length) {
    result.push({ value: newWords[j], added: true });
    j++;
  }
  return result;
}

function highlightDiff(
  original: string,
  revised: string
): React.ReactElement[] {
  if (!original || !revised) return [];

  const diff = diffWords(original, revised);
  return diff.map((part, idx) =>
    part.added ? (
      <span
        key={idx}
        className="bg-green-200 dark:bg-green-700/40 px-0.5 rounded"
        aria-label="Added"
      >
        {part.value}
      </span>
    ) : part.removed ? (
      <span
        key={idx}
        className="bg-red-200 dark:bg-red-700/40 px-0.5 rounded line-through"
        aria-label="Removed"
      >
        {part.value}
      </span>
    ) : (
      <span key={idx}>{part.value}</span>
    )
  );
}

const RevisionHistoryPanel: React.FC<RevisionHistoryPanelProps> = ({
  revisions,
  sceneId,
  onUndo,
  onRetry,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'inline' | 'side'>('inline');
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);

  const sortedRevisions = useMemo((): SceneRevision[] => {
    if (!Array.isArray(revisions)) return [];
    return [...revisions].sort(
      (a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0)
    );
  }, [revisions]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, idx: number): void => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setSelectedIdx(idx);
      }
    },
    []
  );

  const handleUndo = useCallback(
    (revision: SceneRevision): void => {
      if (!revision) return;
      onUndo(revision);
    },
    [onUndo]
  );

  const handleRetry = useCallback(
    async (revision: SceneRevision): Promise<void> => {
      if (!revision || !sceneId) return;

      setLoadingIdx(
        sortedRevisions.findIndex(r => r.timestamp === revision.timestamp)
      );
      try {
        await onRetry(revision);
      } finally {
        setLoadingIdx(null);
      }
    },
    [sceneId, onRetry, sortedRevisions]
  );

  if (!Array.isArray(revisions) || revisions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No revision history available.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Revision History</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('inline')}
            className={`px-2 py-1 text-xs rounded ${
              viewMode === 'inline'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Inline
          </button>
          <button
            onClick={() => setViewMode('side')}
            className={`px-2 py-1 text-xs rounded ${
              viewMode === 'side'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Side-by-Side
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedRevisions.map((rev, idx) => (
          <div
            key={rev.timestamp ?? idx}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedIdx === idx
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedIdx(idx)}
            onKeyDown={e => handleKeyDown(e, idx)}
            tabIndex={0}
            role="button"
            aria-pressed={selectedIdx === idx}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {formatTimestamp(rev.timestamp ?? 0)}
                </div>
                <div className="text-xs text-gray-500">
                  Confidence: {((rev.confidenceScore ?? 0) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleUndo(rev);
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                  disabled={loadingIdx === idx}
                >
                  Undo
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleRetry(rev);
                  }}
                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded"
                  disabled={loadingIdx === idx}
                >
                  {loadingIdx === idx ? 'Retrying...' : 'Retry'}
                </button>
              </div>
            </div>

            {selectedIdx === idx && (
              <div className="mt-3 pt-3 border-t">
                {viewMode === 'inline' ? (
                  <div className="text-xs whitespace-pre-line">
                    {highlightDiff(rev.originalText ?? '', rev.revisedText)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-medium mb-1">Original</div>
                      <div className="bg-gray-50 p-2 rounded">
                        {rev.originalText ?? 'No original text available'}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Revised</div>
                      <div className="bg-green-50 p-2 rounded">
                        {rev.revisedText}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevisionHistoryPanel;
