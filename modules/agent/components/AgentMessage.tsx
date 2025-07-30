// MCP Context Block
/*
role: ui-engineer,
tier: Pro,
file: "modules/agent/components/AgentMessage.tsx",
allowedActions: ["scaffold", "interface", "integrate"],
theme: "user_assistant"
*/

import React from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * AgentMessage for DocCraft Agent Chat
 * @param {Object} props
 * @param {'user' | 'agent' | 'system'} props.type
 * @param {string} props.content
 * @param {string | undefined} props.timestamp
 * @param {boolean} [props.loading]
 */
const AgentMessage: React.FC<{ type: 'user' | 'agent' | 'system'; content: string; timestamp?: string; loading?: boolean }> = ({ type, content, timestamp, loading }) => {
  const isAgent = type === 'agent';
  const isUser = type === 'user';
  const isSystem = type === 'system';
  return (
    <div className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`} data-mcp-source="agentChatUI">
      {isAgent && (
        <span className="rounded-full bg-blue-800 p-1 text-white" aria-label="Agent avatar" role="img">🤖</span>
      )}
      {isSystem && (
        <span className="rounded-full bg-gray-400 p-1 text-white" aria-label="System message" role="img">ℹ️</span>
      )}
      <div className={`max-w-xs px-3 py-2 rounded-lg shadow text-sm ${isAgent ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100' : isUser ? 'bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-100' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}
        aria-live={loading ? 'polite' : undefined}
        aria-busy={loading ? 'true' : undefined}
      >
        <ReactMarkdown>{loading ? '…' : content}</ReactMarkdown>
        {timestamp && <div className="text-xs text-gray-400 mt-1">{timestamp}</div>}
      </div>
      {isUser && (
        <span className="rounded-full bg-green-700 p-1 text-white" aria-label="User avatar" role="img">🧑</span>
      )}
    </div>
  );
};

export default AgentMessage; 