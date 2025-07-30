// MCP Context Block
/*
role: ui-engineer,
tier: Pro,
file: "modules/agent/components/QuickReplies.tsx",
allowedActions: ["scaffold", "interface", "integrate"],
theme: "user_assistant"
*/

import React from 'react';

/**
 * QuickReplies for DocCraft Agent Chat
 * @param {Object} props
 * @param {string | null} props.onboardingStep
 * @param {string | undefined} props.lastSuggestion
 * @param {string | undefined} props.workflowGuide
 * @param {() => void} props.onReset
 */
const QuickReplies: React.FC<{
  onboardingStep: string | null;
  lastSuggestion?: string;
  workflowGuide?: string;
  onReset: () => void;
}> = ({ onboardingStep, lastSuggestion, workflowGuide, onReset }) => {
  return (
    <div className="flex gap-2 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700" data-mcp-source="agentChatUI">
      {onboardingStep && (
        <button className="px-2 py-1 rounded bg-purple-600 text-white text-xs font-semibold focus:ring-2 focus:ring-purple-400" aria-label="Resume onboarding" tabIndex={0}>
          Resume Onboarding
        </button>
      )}
      {lastSuggestion && (
        <button className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-semibold focus:ring-2 focus:ring-blue-400" aria-label="Suggest next step" tabIndex={0}>
          Suggest Next Step
        </button>
      )}
      {workflowGuide && (
        <button className="px-2 py-1 rounded bg-green-600 text-white text-xs font-semibold focus:ring-2 focus:ring-green-400" aria-label="Show workflow guide" tabIndex={0}>
          Show Workflow Guide
        </button>
      )}
      <button className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold focus:ring-2 focus:ring-gray-400" aria-label="Reset agent" onClick={onReset} tabIndex={0}>
        Reset
      </button>
    </div>
  );
};

export default QuickReplies; 