// MCP Context Block
/*
role: ui-engineer,
tier: Pro,
file: "modules/agent/components/DocCraftAgentChat.tsx",
allowedActions: ["scaffold", "interface", "integrate"],
theme: "user_assistant"
*/

import React, { useState, Suspense } from 'react';
import { useDocCraftAgent } from '../../../src/contexts/AgentContext';
import ChatInputBar from './ChatInputBar';
import AgentMessage from './AgentMessage';
import QuickReplies from './QuickReplies';

// ErrorBoundary fallback
function ErrorFallback({ error }: { error: Error }) {
  return <div className="p-4 text-red-600">Agent error: {error.message}</div>;
}

/**
 * Main DocCraft Agent Chat UI
 * @component
 * @returns {JSX.Element}
 */
const DocCraftAgentChat: React.FC = () => {
  const {
    chatHistory,
    askAgent,
    onboardingStep,
    lastSuggestion,
    workflowGuide,
    resetAgent
  } = useDocCraftAgent();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (msg: string) => {
    setLoading(true);
    setError(null);
    try {
      await askAgent(msg);
    } catch (e: any) {
      setError(e.message || 'Agent failed to respond.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 max-w-md w-full md:w-96 shadow-2xl rounded-lg overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
      style={{ minHeight: open ? 400 : 56 }}
      aria-label="DocCraft Agent Chat"
      role="dialog"
      aria-modal="true"
      data-mcp-source="agentChatUI"
    >
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="agent-chat-panel"
      >
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-blue-800 p-1"><span role="img" aria-label="Agent">🤖</span></span>
          DocCraft Agent
        </span>
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <Suspense fallback={<div className="p-4">Loading agent…</div>}>
          <div id="agent-chat-panel" className="flex flex-col h-[344px] max-h-[60vh]">
            <div className="flex-1 overflow-y-auto p-4 space-y-2" aria-live="polite">
              {chatHistory.map((msg, i) => (
                <AgentMessage key={i} type={msg.sender} content={msg.message} timestamp={undefined} />
              ))}
              {loading && <AgentMessage type="agent" content="Thinking…" timestamp={undefined} loading />}
              {error && <div className="text-red-600" role="alert">{error}</div>}
            </div>
            <QuickReplies onboardingStep={onboardingStep} lastSuggestion={lastSuggestion} workflowGuide={workflowGuide} onReset={resetAgent} />
            <ChatInputBar onSend={handleSend} loading={loading} />
          </div>
        </Suspense>
      )}
    </div>
  );
};

export default DocCraftAgentChat; 