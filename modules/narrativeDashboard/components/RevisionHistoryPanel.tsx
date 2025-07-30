// MCP Context Block
/*
role: frontend-developer,
tier: Pro,
file: "modules/narrativeDashboard/components/RevisionHistoryPanel.tsx",
allowedActions: ["scaffold", "track", "undo"],
theme: "revision_history"
*/

import React, { useState, useMemo, useCallback } from 'react';
import { useNarrativeSync } from '../../shared/state/useNarrativeSyncContext';
import type { SceneRevision } from '../services/revisionEngine';
import { proposeEdit } from '../services/revisionEngine';

interface RevisionHistoryPanelProps {
  revisions: SceneRevision[];
  sceneId: string;
  onUndo: (revision: SceneRevision) => void;
  onRetry: (revision: SceneRevision) => void;
}

function formatTimestamp(ts: number) {
  return new Date(ts).toLocaleString();
}

// Simple word-level diff (replacement for 'diff' package)
function diffWords(oldStr: string, newStr: string) {
  const oldWords = oldStr.split(/(\s+)/);
  const newWords = newStr.split(/(\s+)/);
  const result: { value: string; added?: boolean; removed?: boolean }[] = [];
  let i = 0, j = 0;
  while (i < oldWords.length && j < newWords.length) {
    if (oldWords[i] === newWords[j]) {
      result.push({ value: oldWords[i] });
      i++; j++;
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

function highlightDiff(original: string, revised: string) {
  const diff = diffWords(original, revised);
  return diff.map((part, idx) =>
    part.added ? (
      <span key={idx} className="bg-green-200 dark:bg-green-700/40 px-0.5 rounded" aria-label="Added">{part.value}</span>
    ) : part.removed ? (
      <span key={idx} className="bg-red-200 dark:bg-red-700/40 px-0.5 rounded line-through" aria-label="Removed">{part.value}</span>
    ) : (
      <span key={idx}>{part.value}</span>
    )
  );
}

const RevisionHistoryPanel: React.FC<RevisionHistoryPanelProps> = ({ revisions, sceneId, onUndo, onRetry }) => {
  const narrativeSync = useNarrativeSync();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'inline' | 'side'>('inline');
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);

  // Memoize sorted revisions (latest first)
  const sortedRevisions = useMemo(() =>
    [...revisions].sort((a, b) => (b as any).timestamp - (a as any).timestamp),
    [revisions]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowDown') {
      setSelectedIdx(i => (i === null ? 0 : Math.min(i + 1, sortedRevisions.length - 1)));
    } else if (e.key === 'ArrowUp') {
      setSelectedIdx(i => (i === null ? 0 : Math.max(i - 1, 0)));
    } else if (e.key === 'Enter' || e.key === ' ') {
      setSelectedIdx(idx);
    }
  };

  // Undo action
  const handleUndo = useCallback(async (rev: SceneRevision) => {
    setLoadingIdx(revisions.indexOf(rev));
    // Rollback logic: could call proposeEdit with previous revision or restore original
    onUndo(rev);
    setLoadingIdx(null);
  }, [onUndo, revisions]);

  // Retry action
  const handleRetry = useCallback(async (rev: SceneRevision) => {
    setLoadingIdx(revisions.indexOf(rev));
    onRetry(rev);
    setLoadingIdx(null);
  }, [onRetry, revisions]);

  return (
    <section
      className="w-full max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 flex flex-col gap-4"
      aria-label="Revision History Panel"
      tabIndex={-1}
    >
      <header className="flex items-center gap-4 mb-2">
        <h2 className="font-bold text-lg flex-1">Revision History</h2>
        <div className="flex gap-2">
          <button
            className={`px-2 py-1 text-xs rounded ${viewMode === 'inline' ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'} focus:ring-2 focus:ring-blue-400`}
            onClick={() => setViewMode('inline')}
            aria-pressed={viewMode === 'inline'}
            aria-label="Inline diff view"
          >
            Inline Diff
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${viewMode === 'side' ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'} focus:ring-2 focus:ring-blue-400`}
            onClick={() => setViewMode('side')}
            aria-pressed={viewMode === 'side'}
            aria-label="Side-by-side diff view"
          >
            Side-by-Side
          </button>
        </div>
      </header>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-700" role="listbox" aria-label="Revision list">
        {sortedRevisions.map((rev, idx) => (
          <li
            key={idx}
            tabIndex={0}
            className={`py-3 px-2 rounded transition ${selectedIdx === idx ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
            aria-label={`Revision ${idx + 1} for scene ${sceneId}`}
            aria-selected={selectedIdx === idx}
            onClick={() => setSelectedIdx(idx)}
            onKeyDown={e => handleKeyDown(e, idx)}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{formatTimestamp((rev as any).timestamp)}</span>
              <span className="text-xs text-green-700 dark:text-green-200 font-semibold">Confidence: {(rev.confidenceScore * 100).toFixed(0)}%</span>
              <span className="text-xs text-blue-700 dark:text-blue-200">Scene: {sceneId}</span>
            </div>
            <div className="text-sm mt-1" aria-label="Change summary">{rev.changeSummary.join('; ')}</div>
            <div className="flex gap-2 mt-2">
              <button
                className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-400"
                onClick={() => setSelectedIdx(idx)}
                aria-label="View diff"
              >
                View Diff
              </button>
              <button
                className="px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 focus:ring-2 focus:ring-yellow-400"
                onClick={() => handleUndo(rev)}
                aria-label="Undo revision"
                disabled={loadingIdx === idx}
              >
                {loadingIdx === idx ? 'Undoing...' : 'Undo'}
              </button>
              <button
                className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 focus:ring-2 focus:ring-blue-400"
                onClick={() => handleRetry(rev)}
                aria-label="Retry AI edit"
                disabled={loadingIdx === idx}
              >
                {loadingIdx === idx ? 'Retrying...' : 'Retry'}
              </button>
            </div>
            {selectedIdx === idx && (
              <div className="mt-3" aria-label="Revision diff view">
                {viewMode === 'inline' ? (
                  <div className="text-xs whitespace-pre-line">{highlightDiff((rev as any).originalText || '', rev.revisedText)}</div>
                ) : (
                  <div className="flex gap-4">
                    <div className="flex-1 bg-zinc-50 dark:bg-zinc-800 p-2 rounded border border-zinc-200 dark:border-zinc-700">
                      <div className="font-semibold mb-1">Original</div>
                      <div className="text-xs whitespace-pre-line">{(rev as any).originalText || ''}</div>
                    </div>
                    <div className="flex-1 bg-green-50 dark:bg-green-900/30 p-2 rounded border border-green-200 dark:border-green-700">
                      <div className="font-semibold mb-1">AI Revision</div>
                      <div className="text-xs whitespace-pre-line">{rev.revisedText}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default React.memo(RevisionHistoryPanel); 