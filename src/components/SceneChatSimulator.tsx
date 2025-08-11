import React, { useState, useEffect, useRef } from 'react';
import { SceneConfig } from '../types/SceneConfig';

import { useSceneConfig } from '../hooks/useSceneConfig';
import { SceneMessage } from '../services/simulateSceneDialog';
import { useAuth } from '../contexts/AuthContext';
import {
  Loader2,
  Sparkles,
  User,
  Play,
  RefreshCw,
  Download,
  Pause,
  SkipForward,
  RotateCw,
  Edit3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SceneScriptEditor from './SceneScriptEditor';
import { CSSTransition, SwitchTransition } from 'react-transition-group';

interface SceneChatSimulatorProps {
  sceneId?: string;
}

// Utility: Format export
function formatExport(
  config: SceneConfig,
  messages: SceneMessage[],
  format: 'text' | 'json' | 'markdown'
): string {
  if (format === 'json') {
    return JSON.stringify({ scene: config, messages }, null, 2);
  }
  if (format === 'markdown') {
    let md = `# ${config.title}\n\n**Setting:** ${config.setting}\n`;
    if (config.tone) md += `**Tone:** ${config.tone}\n`;
    if (config.objective) md += `**Objective:** ${config.objective}\n`;
    md += '\n---\n\n';
    messages.forEach(m => {
      md += `**${m.speakerName}:** ${m.text}\n\n`;
    });
    return md;
  }
  // Plain text
  let txt = `${config.title}\nSetting: ${config.setting}\n`;
  if (config.tone) txt += `Tone: ${config.tone}\n`;
  if (config.objective) txt += `Objective: ${config.objective}\n`;
  txt += '\n';
  messages.forEach(m => {
    txt += `${m.speakerName}: ${m.text}\n`;
  });
  return txt;
}

const SceneChatSimulator: React.FC<SceneChatSimulatorProps> = ({ sceneId }) => {
  const { user } = useAuth();
  const isPro = user?.tier === 'Pro' || user?.tier === 'Admin';
  const {
    config,
    loading: sceneLoading,
    error: sceneError,
  } = useSceneConfig(sceneId);
  const [messages, setMessages] = useState<SceneMessage[]>([]);
  const [input, setInput] = useState('');
  const [autoMode, setAutoMode] = useState(true);
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [exportFormat, setExportFormat] = useState<
    'text' | 'json' | 'markdown'
  >('text');

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [messagesToShow, setMessagesToShow] = useState<SceneMessage[]>([]);
  const [playbackIntervalId, setPlaybackIntervalId] =
    useState<NodeJS.Timeout | null>(null);
  const [scriptMode, setScriptMode] = useState(false);
  const delayMsPerMessage = 1500;

  // For accessibility and focus management
  const playbackControlsRef = useRef<HTMLDivElement | null>(null);
  const scriptEditorRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, sceneLoading]);

  // Reset conversation
  const handleReset = () => {
    setMessages([]);
    setInput('');
    setSelectedSpeaker(null);
  };

  // Handle user input or AI progression

  // Upgrade CTA for Free users
  const handleUpgradeClick = () => {
    toast('Upgrade to Pro to unlock scene simulation!', {
      icon: '✨',
      style: { background: '#1e293b', color: '#fff' },
    });
  };

  const handleExport = () => {
    if (!config) return;
    const data = formatExport(config, messages, exportFormat);
    const blob = new Blob([data], {
      type:
        exportFormat === 'json'
          ? 'application/json'
          : exportFormat === 'markdown'
            ? 'text/markdown'
            : 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.title.replace(/\s+/g, '_')}_scene.${
      exportFormat === 'json'
        ? 'json'
        : exportFormat === 'markdown'
          ? 'md'
          : 'txt'
    }`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    setShowExport(false);
  };

  // Playback effect
  useEffect(() => {
    if (isPlaying && messages.length > 0) {
      if (currentStep < messages.length) {
        const interval = setInterval(() => {
          setMessagesToShow(prev => {
            if (currentStep < messages.length) {
              return messages.slice(0, currentStep + 1);
            }
            return prev;
          });
          setCurrentStep(prev => prev + 1);
        }, delayMsPerMessage);
        setPlaybackIntervalId(interval);
        return () => clearInterval(interval);
      } else {
        setIsPlaying(false);
        setPlaybackIntervalId(null);
      }
    } else {
      setMessagesToShow(messages);
      setCurrentStep(messages.length);
      if (playbackIntervalId) clearInterval(playbackIntervalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentStep, messages]);

  const handlePlay = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setMessagesToShow([]);
  };
  const handlePause = () => {
    setIsPlaying(false);
    if (playbackIntervalId) clearInterval(playbackIntervalId);
  };
  const handleResume = () => {
    setIsPlaying(true);
  };
  const handleSkip = () => {
    setIsPlaying(false);
    setMessagesToShow(messages);
    setCurrentStep(messages.length);
    if (playbackIntervalId) clearInterval(playbackIntervalId);
  };
  const handleRestart = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setMessages([]);
  };

  // Add keyboard shortcuts (moved after function definitions)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        (document.activeElement as HTMLElement).tagName === 'INPUT'
      )
        return;
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlay();
      }
      if (e.key === 'p' || e.key === 'P') {
        handlePause();
      }
      if (e.key === 'r' || e.key === 'R') {
        if (e.shiftKey) handleRestart();
        else handleResume();
      }
      if (e.key === 'End') {
        handleSkip();
      }
      if (e.key === 'e' || e.key === 'E') {
        setScriptMode(m => !m);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handlePlay,
    handlePause,
    handleResume,
    handleSkip,
    handleRestart,
    setScriptMode,
  ]);

  if (sceneLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-500 dark:text-zinc-300">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading scene...
      </div>
    );
  }
  if (sceneError) {
    return <div className="text-red-500 text-center">{sceneError}</div>;
  }
  if (!config) {
    return <div className="text-center text-zinc-400">No scene loaded.</div>;
  }

  // Progress meter for playback
  const playbackProgress =
    messages.length > 0 ? (currentStep / messages.length) * 100 : 0;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 flex flex-col gap-4">
      {/* Scene Info */}
      <div className="border-b pb-4 mb-2">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <div>
            <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
              {config.title}
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-300">
              {config.setting}
            </div>
            {config.tone && (
              <div className="text-xs text-blue-500">Tone: {config.tone}</div>
            )}
            {config.objective && (
              <div className="text-xs text-green-500">
                Objective: {config.objective}
              </div>
            )}
          </div>
          <button
            className="ml-auto flex items-center gap-1 px-3 py-1 text-xs rounded bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 transition"
            onClick={handleReset}
            title="Reset Scene"
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
          {isPro && (
            <button
              className="ml-2 flex items-center gap-1 px-3 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 transition"
              onClick={() => setShowExport(true)}
              title="Export Scene"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          )}
        </div>
        {/* Export Modal/Dropdown */}
        {showExport && (
          <div className="absolute z-50 mt-2 right-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded shadow-lg p-4 flex flex-col gap-2">
            <div className="font-semibold mb-2">Export Scene As:</div>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="exportFormat"
                value="text"
                checked={exportFormat === 'text'}
                onChange={() => setExportFormat('text')}
              />
              Plain Text
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="exportFormat"
                value="markdown"
                checked={exportFormat === 'markdown'}
                onChange={() => setExportFormat('markdown')}
              />
              Markdown
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="exportFormat"
                value="json"
                checked={exportFormat === 'json'}
                onChange={() => setExportFormat('json')}
              />
              JSON
            </label>
            <div className="flex gap-2 mt-3">
              <button
                className="px-4 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                onClick={handleExport}
              >
                Download
              </button>
              <button
                className="px-4 py-1 rounded bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-zinc-700"
                onClick={() => setShowExport(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {/* Participants */}
        <div className="flex gap-4 mt-3">
          {config.participants.map(p => (
            <div key={p.id} className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-lg font-bold text-white shadow">
                {p.name[0]}
              </div>
              <div className="text-xs font-semibold mt-1 text-zinc-700 dark:text-zinc-200">
                {p.name}
              </div>
              <div className="text-[10px] text-zinc-400">{p.archetype}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat History */}
      <SwitchTransition mode="out-in">
        <CSSTransition
          key={scriptMode ? 'script' : 'sim'}
          timeout={300}
          classNames="fade-slide"
          nodeRef={scriptMode ? scriptEditorRef : playbackControlsRef}
          onEntered={() => {
            if (scriptMode && scriptEditorRef.current)
              scriptEditorRef.current.focus();
            if (!scriptMode && playbackControlsRef.current)
              playbackControlsRef.current.focus();
          }}
        >
          {scriptMode ? (
            <div
              ref={scriptEditorRef}
              tabIndex={-1}
              aria-label="Script Editor Panel"
              className="outline-none"
            >
              <SceneScriptEditor
                scene={config}
                initialLines={messages.map((m, i) => ({
                  id: String(i),
                  speakerId:
                    config.participants.find(p => p.name === m.speakerName)
                      ?.id || '',
                  text: m.text,
                }))}
                participants={config.participants}
                onSaveScript={() => {}}
                onExportScript={() => {}}
                onSimulateScript={() => {}}
              />
            </div>
          ) : (
            <div
              ref={playbackControlsRef}
              tabIndex={-1}
              aria-label="Scene Playback Panel"
              className="outline-none"
            >
              {/* Playback Progress Meter */}
              {isPlaying && (
                <div
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded mb-2"
                  aria-label="Playback Progress"
                >
                  <div
                    className="h-2 bg-blue-500 rounded transition-all duration-300"
                    style={{ width: `${playbackProgress}%` }}
                  />
                </div>
              )}
              {/* Chat History with current speaker highlight */}
              <div
                className="flex-1 min-h-[200px] max-h-96 overflow-y-auto px-1 space-y-3"
                aria-live="polite"
                aria-label="Scene Dialogue"
              >
                {messagesToShow.length === 0 && (
                  <div className="text-center text-zinc-400 pt-8">
                    Start the scene to see your characters interact!
                  </div>
                )}
                {messagesToShow.map((msg, idx) => {
                  const isCurrent = isPlaying && idx === currentStep - 1;
                  const speaker = config.participants.find(
                    p => p.name === msg.speakerName
                  );
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 ${
                        isCurrent
                          ? 'bg-blue-50 dark:bg-blue-900 ring-2 ring-blue-400'
                          : ''
                      } rounded transition-all duration-300`}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow ${
                          speaker
                            ? 'bg-gradient-to-br from-blue-400 to-purple-600'
                            : 'bg-zinc-400'
                        }`}
                        aria-label={
                          speaker ? `${speaker.name} avatar` : 'Unknown speaker'
                        }
                      >
                        {speaker ? speaker.name[0] : '?'}
                      </div>
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-lg shadow text-sm whitespace-pre-line border-2 ${
                          speaker
                            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                            : 'border-zinc-300 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100'
                        } ${isCurrent ? 'font-bold' : ''}`}
                        aria-label={`${msg.speakerName}: ${msg.text}`}
                      >
                        <span className="font-bold">{msg.speakerName}:</span>{' '}
                        {msg.text}
                        <div className="mt-1 text-[10px] text-right text-zinc-400">
                          {new Date(
                            msg.timestamp || Date.now()
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Playback Controls with tooltips and ARIA */}
              <div
                className="flex gap-2 mt-2"
                role="group"
                aria-label="Playback Controls"
              >
                <button
                  className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-200 transition focus:ring-2 focus:ring-green-400"
                  onClick={handlePlay}
                  disabled={isPlaying || messages.length === 0}
                  title="Play Scene (Space)"
                  aria-label="Play Scene"
                >
                  <Play
                    className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`}
                  />{' '}
                  Play
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-200 transition focus:ring-2 focus:ring-yellow-400"
                  onClick={handlePause}
                  disabled={!isPlaying}
                  title="Pause (P)"
                  aria-label="Pause"
                >
                  <Pause className="w-4 h-4" /> Pause
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 transition focus:ring-2 focus:ring-blue-400"
                  onClick={handleResume}
                  disabled={isPlaying || currentStep >= messages.length}
                  title="Resume (R)"
                  aria-label="Resume"
                >
                  <Play className="w-4 h-4" /> Resume
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 transition focus:ring-2 focus:ring-gray-400"
                  onClick={handleSkip}
                  disabled={currentStep >= messages.length}
                  title="Skip to End (End)"
                  aria-label="Skip to End"
                >
                  <SkipForward className="w-4 h-4" /> Skip
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-200 transition focus:ring-2 focus:ring-purple-400"
                  onClick={handleRestart}
                  title="Restart (Shift+R)"
                  aria-label="Restart"
                >
                  <RotateCw className="w-4 h-4" /> Restart
                </button>
                <button
                  className={`flex items-center gap-1 px-3 py-1 text-xs rounded ${
                    scriptMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300'
                  } transition focus:ring-2 focus:ring-blue-400`}
                  onClick={() => setScriptMode(m => !m)}
                  title={
                    scriptMode
                      ? 'Switch to Simulation Mode (E)'
                      : 'Switch to Script Editor Mode (E)'
                  }
                  aria-label={
                    scriptMode
                      ? 'Switch to Simulation Mode'
                      : 'Switch to Script Editor Mode'
                  }
                >
                  <Edit3 className="w-4 h-4" />{' '}
                  {scriptMode ? 'Simulation' : 'Script Editor'}
                </button>
              </div>
              {/* Inline help */}
              <div className="text-xs text-zinc-400 mt-2" aria-live="polite">
                <span>
                  Tip: Use <kbd>Space</kbd> to play, <kbd>P</kbd> to pause,{' '}
                  <kbd>R</kbd> to resume, <kbd>End</kbd> to skip,{' '}
                  <kbd>Shift+R</kbd> to restart, <kbd>E</kbd> to toggle editor.
                </span>
              </div>
            </div>
          )}
        </CSSTransition>
      </SwitchTransition>

      {/* Input and Controls */}
      {isPro ? (
        <div className="flex items-center gap-2 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-300">
              Mode:
            </span>
            <button
              type="button"
              className={`px-2 py-1 rounded text-xs font-semibold border ${
                autoMode
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-zinc-700'
              }`}
              onClick={() => setAutoMode(true)}
              disabled={autoMode}
            >
              <Play className="w-3 h-3 inline mr-1" /> AI
            </button>
            <button
              type="button"
              className={`px-2 py-1 rounded text-xs font-semibold border ${
                !autoMode
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-zinc-700'
              }`}
              onClick={() => setAutoMode(false)}
              disabled={!autoMode}
            >
              <User className="w-3 h-3 inline mr-1" /> Manual
            </button>
          </div>
          {!autoMode && (
            <select
              className="ml-2 px-2 py-1 rounded border bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
              value={selectedSpeaker || ''}
              onChange={e => setSelectedSpeaker(e.target.value)}
              required
            >
              <option value="" disabled>
                Select Speaker
              </option>
              {config.participants.map(p => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          <input
            type="text"
            className="flex-1 px-3 py-2 rounded border bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
            placeholder={
              autoMode
                ? 'Let AI continue the scene...'
                : 'Suggest dialog for selected character'
            }
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={
              sceneLoading ||
              (autoMode && true) ||
              (!autoMode && !selectedSpeaker)
            }
            autoComplete="off"
          />
          <div className="flex gap-2 mt-2">
            {isPro && (
              <>
                <button
                  className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-200 transition"
                  onClick={handlePlay}
                  disabled={isPlaying || messages.length === 0}
                  title="Play Scene"
                >
                  <Play className="w-4 h-4" /> Play
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-200 transition"
                  onClick={handlePause}
                  disabled={!isPlaying}
                  title="Pause"
                >
                  <Pause className="w-4 h-4" /> Pause
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 transition"
                  onClick={handleResume}
                  disabled={isPlaying || currentStep >= messages.length}
                  title="Resume"
                >
                  <Play className="w-4 h-4" /> Resume
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 transition"
                  onClick={handleSkip}
                  disabled={currentStep >= messages.length}
                  title="Skip to End"
                >
                  <SkipForward className="w-4 h-4" /> Skip
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-200 transition"
                  onClick={handleRestart}
                  title="Restart"
                >
                  <RotateCw className="w-4 h-4" /> Restart
                </button>
                <button
                  className={`flex items-center gap-1 px-3 py-1 text-xs rounded ${
                    scriptMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300'
                  } transition`}
                  onClick={() => setScriptMode(m => !m)}
                  title="Script Editor Mode"
                >
                  <Edit3 className="w-4 h-4" />{' '}
                  {scriptMode ? 'Simulation' : 'Script Editor'}
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-xs text-blue-600 dark:text-blue-300 mt-1">
          <button
            className="underline hover:text-blue-800"
            onClick={handleUpgradeClick}
            type="button"
          >
            Upgrade to Pro to unlock scene simulation
          </button>
        </div>
      )}
    </div>
  );
};

export default SceneChatSimulator;

// Add fade-slide CSS (in your global CSS or as a style block)
/*
.fade-slide-enter {
  opacity: 0;
  transform: translateY(20px);
}
.fade-slide-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms, transform 300ms;
}
.fade-slide-exit {
  opacity: 1;
  transform: translateY(0);
}
.fade-slide-exit-active {
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 300ms, transform 300ms;
}
*/
