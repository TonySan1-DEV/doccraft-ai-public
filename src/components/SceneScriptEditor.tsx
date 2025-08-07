// MCP Context Block
/*
{
  file: "SceneScriptEditor.tsx",
  role: "editor",
  allowedActions: ["edit", "reorder", "export", "simulate"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "visual_scripting"
}
*/

import React, { useState, useRef, useEffect } from 'react';
import { SceneConfig } from '../types/SceneConfig';
import { CharacterPersona } from '../types/CharacterPersona';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import { Plus, Trash2, Save, Download, Play } from 'lucide-react';

export interface ScriptLine {
  id: string;
  speakerId: string;
  text: string;
}

interface SceneScriptEditorProps {
  scene: SceneConfig;
  initialLines: ScriptLine[];
  participants: CharacterPersona[];
  onSaveScript: (lines: ScriptLine[]) => void;
  onExportScript: (
    lines: ScriptLine[],
    format: 'markdown' | 'text' | 'json'
  ) => void;
  onSimulateScript: (lines: ScriptLine[]) => void;
}

const SceneScriptEditor: React.FC<SceneScriptEditorProps> = ({
  initialLines,
  participants,
  onSaveScript,
  onExportScript,
  onSimulateScript,
}) => {
  const [lines, setLines] = useState<ScriptLine[]>(initialLines);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLineText, setNewLineText] = useState('');
  const [newLineSpeaker, setNewLineSpeaker] = useState(
    participants[0]?.id || ''
  );
  const [exportFormat, setExportFormat] = useState<
    'markdown' | 'text' | 'json'
  >('markdown');
  const [ariaMessage, setAriaMessage] = useState('');
  const editorRef = useRef<HTMLDivElement | null>(null);
  const inputRefs = useRef<{ [id: string]: HTMLInputElement | null }>({});

  // Focus management for keyboard navigation
  useEffect(() => {
    if (editingId && inputRefs.current[editingId]) {
      inputRefs.current[editingId]?.focus();
    }
  }, [editingId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        (document.activeElement as HTMLElement).tagName === 'INPUT'
      )
        return;
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        onSaveScript(lines);
        setAriaMessage('Script saved.');
      }
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        onExportScript(lines, exportFormat);
        setAriaMessage('Script exported.');
      }
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        onSimulateScript(lines);
        setAriaMessage('Simulation started.');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lines, exportFormat, onSaveScript, onExportScript, onSimulateScript]);

  // Drag-and-drop reorder
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(lines);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setLines(reordered);
    setAriaMessage('Line reordered.');
  };

  // Inline edit
  const handleEdit = (id: string, text: string) => {
    setLines(prev => prev.map(l => (l.id === id ? { ...l, text } : l)));
  };
  const handleSpeakerChange = (id: string, speakerId: string) => {
    setLines(prev => prev.map(l => (l.id === id ? { ...l, speakerId } : l)));
  };
  // Add new line
  const handleAddLine = () => {
    if (!newLineText.trim() || !newLineSpeaker) return;
    const newId = String(Date.now());
    setLines(prev => [
      ...prev,
      { id: newId, speakerId: newLineSpeaker, text: newLineText },
    ]);
    setNewLineText('');
    setEditingId(newId);
    setAriaMessage('Line added.');
  };
  // Remove line
  const handleRemoveLine = (id: string) => {
    setLines(prev => prev.filter(l => l.id !== id));
    setAriaMessage('Line removed.');
  };
  // Export
  const handleExport = () => {
    onExportScript(lines, exportFormat);
    setAriaMessage('Script exported.');
  };

  // Keyboard navigation for lines
  const handleLineKeyDown = (
    e: React.KeyboardEvent,
    idx: number,
    id: string
  ) => {
    if (e.key === 'Enter') {
      setEditingId(null);
    } else if (e.key === 'Delete') {
      handleRemoveLine(id);
    } else if (e.key === 'ArrowDown') {
      if (lines[idx + 1]) setEditingId(lines[idx + 1].id);
    } else if (e.key === 'ArrowUp') {
      if (lines[idx - 1]) setEditingId(lines[idx - 1].id);
    }
  };

  return (
    <div
      ref={editorRef}
      className="w-full max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 flex flex-col gap-4"
      role="region"
      aria-label="Script Editor"
      tabIndex={-1}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold text-lg">Script Editor</span>
        <button
          className="ml-auto flex items-center gap-1 px-3 py-1 text-xs rounded bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-200 transition focus:ring-2 focus:ring-green-400"
          onClick={() => {
            onSaveScript(lines);
            setAriaMessage('Script saved.');
          }}
          aria-label="Save Script (Ctrl+S)"
          title="Save Script (Ctrl+S)"
        >
          <Save className="w-4 h-4" /> Save
        </button>
        <button
          className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 transition focus:ring-2 focus:ring-blue-400"
          onClick={handleExport}
          aria-label="Export Script (Ctrl+E)"
          title="Export Script (Ctrl+E)"
        >
          <Download className="w-4 h-4" /> Export
        </button>
        <button
          className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-200 transition focus:ring-2 focus:ring-purple-400"
          onClick={() => {
            onSimulateScript(lines);
            setAriaMessage('Simulation started.');
          }}
          aria-label="Simulate Scene (Ctrl+P)"
          title="Simulate Scene (Ctrl+P)"
        >
          <Play className="w-4 h-4" /> Simulate
        </button>
      </div>
      <div className="flex gap-2 mb-2">
        <label className="text-xs" htmlFor="export-format">
          Export Format:
        </label>
        <select
          id="export-format"
          className="px-2 py-1 rounded border bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-blue-400"
          value={exportFormat}
          onChange={e =>
            setExportFormat(e.target.value as 'markdown' | 'text' | 'json')
          }
          aria-label="Export Format"
        >
          <option value="markdown">Markdown</option>
          <option value="text">Plain Text</option>
          <option value="json">JSON</option>
        </select>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="script-lines">
          {provided => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2"
              role="list"
              aria-label="Script Lines"
            >
              {lines.map((line, idx) => (
                <Draggable key={line.id} draggableId={line.id} index={idx}>
                  {provided => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded p-2 focus-within:ring-2 focus-within:ring-blue-400"
                      role="listitem"
                      aria-grabbed="true"
                      aria-label={`Line ${idx + 1}: ${
                        participants.find(p => p.id === line.speakerId)?.name ||
                        'Unknown'
                      } says ${line.text}`}
                    >
                      <select
                        className="px-2 py-1 rounded border bg-zinc-50 dark:bg-zinc-900 text-xs focus:ring-2 focus:ring-blue-400"
                        value={line.speakerId}
                        onChange={e =>
                          handleSpeakerChange(line.id, e.target.value)
                        }
                        aria-label="Speaker"
                        title="Change Speaker"
                      >
                        {participants.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        ref={el => (inputRefs.current[line.id] = el)}
                        className="flex-1 px-2 py-1 rounded border bg-white dark:bg-zinc-900 text-xs focus:ring-2 focus:ring-blue-400"
                        value={line.text}
                        onChange={e => handleEdit(line.id, e.target.value)}
                        onFocus={() => setEditingId(line.id)}
                        onBlur={() => setEditingId(null)}
                        onKeyDown={e => handleLineKeyDown(e, idx, line.id)}
                        aria-label="Edit Line Text"
                        title="Edit Line (Enter to finish, Delete to remove, ↑/↓ to move)"
                      />
                      <button
                        className="text-red-500 hover:text-red-700 focus:ring-2 focus:ring-red-400"
                        onClick={() => handleRemoveLine(line.id)}
                        title="Delete Line (Delete)"
                        aria-label="Delete Line"
                        type="button"
                        tabIndex={0}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete Line</span>
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div
        className="flex gap-2 mt-4"
        role="group"
        aria-label="Add New Line Controls"
      >
        <select
          className="px-2 py-1 rounded border bg-zinc-50 dark:bg-zinc-900 text-xs focus:ring-2 focus:ring-blue-400"
          value={newLineSpeaker}
          onChange={e => setNewLineSpeaker(e.target.value)}
          aria-label="New Line Speaker"
          title="Select Speaker for New Line"
        >
          {participants.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          className="flex-1 px-2 py-1 rounded border bg-white dark:bg-zinc-900 text-xs focus:ring-2 focus:ring-blue-400"
          placeholder="Add new line..."
          value={newLineText}
          onChange={e => setNewLineText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleAddLine();
          }}
          aria-label="New Line Text"
          title="Type new line and press Enter to add"
        />
        <button
          className="px-3 py-1 rounded bg-green-600 text-white text-xs font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-400"
          onClick={handleAddLine}
          type="button"
          aria-label="Add Line (Enter)"
          title="Add Line (Enter)"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      {/* Inline help and ARIA live region for announcements */}
      <div className="text-xs text-zinc-400 mt-2" aria-live="polite">
        <span>
          Shortcuts: <kbd>Enter</kbd> add/finish, <kbd>Delete</kbd> remove,{' '}
          <kbd>↑/↓</kbd> move, <kbd>Ctrl+S</kbd> save, <kbd>Ctrl+E</kbd> export,{' '}
          <kbd>Ctrl+P</kbd> simulate.
        </span>
        <span className="sr-only" aria-live="assertive">
          {ariaMessage}
        </span>
      </div>
    </div>
  );
};

export default SceneScriptEditor;
