// MCP Context Block
/*
role: ui-engineer,
tier: Pro,
file: "modules/agent/components/AgentMessage.tsx",
allowedActions: ["scaffold", "interface", "integrate"],
theme: "user_assistant"
*/

import React from "react";

/**
 * AgentMessage for DocCraft Agent Chat
 * @param {Object} props
 * @param {'user' | 'agent' | 'system'} props.type
 * @param {string} props.content
 * @param {string | undefined} props.timestamp
 * @param {boolean} [props.loading]
 */
const AgentMessage: React.FC<{
  type: "user" | "agent" | "system";
  content: string;
  timestamp?: string;
  loading?: boolean;
}> = ({ type, content, timestamp, loading }) => {
  const isAgent = type === "agent";
  const isUser = type === "user";
  const isSystem = type === "system";
  return (
    <div
      className={`flex items-start gap-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
      data-mcp-source="agentChatUI"
    >
      {isAgent && (
        <span
          className="rounded-full bg-blue-800 p-1 text-white"
          aria-label="Agent avatar"
          role="img"
        >
          🤖
        </span>
      )}
      {isSystem && (
        <span
          className="rounded-full bg-gray-400 p-1 text-white"
          aria-label="System message"
          role="img"
        >
          ℹ️
        </span>
      )}
      <div
        className={`max-w-xs px-3 py-2 rounded-lg shadow text-sm ${
          isAgent
            ? "bg-blue-100 dark:bg-blue-800 text-gray-900 dark:text-white border border-blue-200 dark:border-blue-700"
            : isUser
            ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
        }`}
        aria-live={loading ? "polite" : undefined}
        aria-busy={loading ? "true" : undefined}
      >
        <div className="whitespace-pre-wrap">{loading ? "…" : content}</div>
        {timestamp && (
          <div className="text-xs text-gray-400 mt-1">{timestamp}</div>
        )}
      </div>
      {isUser && (
        <span
          className="rounded-full bg-gray-500 p-1 text-white"
          aria-label="User avatar"
          role="img"
        >
          🧑
        </span>
      )}
    </div>
  );
};

export default AgentMessage;
