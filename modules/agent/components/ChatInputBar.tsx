// MCP Context Block
/*
role: ui-engineer,
tier: Pro,
file: "modules/agent/components/ChatInputBar.tsx",
allowedActions: ["scaffold", "interface", "integrate"],
theme: "user_assistant"
*/

import React, { useState, useRef } from "react";

/**
 * ChatInputBar for DocCraft Agent Chat
 * @param {Object} props
 * @param {(msg: string) => void} props.onSend
 * @param {boolean} props.loading
 */
const ChatInputBar: React.FC<{
  onSend: (msg: string) => void;
  loading?: boolean;
}> = ({ onSend, loading }) => {
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    if (input.startsWith("/")) {
      // Command parsing
      if (input === "/reset") {
        setFeedback("Agent reset.");
        onSend("/reset");
      } else if (input === "/onboarding") {
        setFeedback("Onboarding started.");
        onSend("/onboarding");
      } else if (input === "/help") {
        setFeedback("Help requested.");
        onSend("/help");
      } else {
        setFeedback("Unknown command.");
      }
      setInput("");
      return;
    }
    onSend(input);
    setInput("");
    setFeedback("");
  };

  return (
    <div
      className="flex items-center gap-2 p-3 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
      data-mcp-source="agentChatUI"
    >
      <label htmlFor="agent-chat-input" className="sr-only">
        Type your message
      </label>
      <input
        id="agent-chat-input"
        ref={inputRef}
        type="text"
        className="flex-1 rounded px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 dark:text-white"
        placeholder={
          loading ? "Agent is thinking…" : "Type your message or /command"
        }
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !loading) handleSend();
        }}
        aria-label="Agent chat input"
        aria-describedby="agent-chat-feedback"
        disabled={loading}
        autoComplete="off"
      />
      <button
        className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        onClick={handleSend}
        disabled={loading || !input.trim()}
        aria-label="Send message"
      >
        Send
      </button>
      <div id="agent-chat-feedback" className="sr-only" aria-live="polite">
        {feedback}
      </div>
    </div>
  );
};

export default ChatInputBar;
