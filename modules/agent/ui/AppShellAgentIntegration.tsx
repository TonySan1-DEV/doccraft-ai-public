// MCP Context Block
/*
role: frontend-engineer,
tier: Pro,
file: "modules/agent/ui/AppShellAgentIntegration.tsx",
allowedActions: ["integrate", "toggle", "wire"],
theme: "agent_ui"
*/

import React, { Suspense, lazy } from 'react';
import { DocCraftAgentProvider } from '../../../src/contexts/AgentContext';
import { useAgentToggle } from '../hooks/useAgentToggle';
import { GlobalHotkeyAgentHandler } from './GlobalHotkeyAgentHandler';

// Lazy load the agent chat panel for performance
const AgentChatPanel = lazy(() => import('../components/DocCraftAgentChat'));

interface AppShellAgentIntegrationProps {
  children: React.ReactNode;
  currentUser?: {
    role: string;
    tier: string;
  };
}

// MCP permission check
function hasPermission(feature: string, user?: { role: string; tier: string }): boolean {
  if (!user) return false;
  
  // Define feature permissions
  const featurePermissions: Record<string, { roles: string[]; tiers: string[] }> = {
    agent: {
      roles: ['frontend-developer', 'backend-developer', 'admin', 'qa-engineer'],
      tiers: ['Pro', 'Admin']
    }
  };

  const permission = featurePermissions[feature];
  if (!permission) return false;

  return permission.roles.includes(user.role) && permission.tiers.includes(user.tier);
}

export const AppShellAgentIntegration: React.FC<AppShellAgentIntegrationProps> = ({ 
  children, 
  currentUser 
}) => {
  const { isAgentVisible, showAgent, hideAgent } = useAgentToggle();

  // Check MCP access
  if (!hasPermission('agent', currentUser)) {
    return <>{children}</>;
  }

  return (
    <DocCraftAgentProvider>
      <div className="relative">
        {/* Main app content */}
        {children}

        {/* Agent Chat Panel - conditionally rendered */}
        {isAgentVisible && (
          <Suspense fallback={
            <div 
              className="fixed bottom-4 right-4 w-96 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Loading Assistant...</span>
              </div>
            </div>
          }>
            <AgentChatPanel />
          </Suspense>
        )}

        {/* Global hotkey handler */}
        <GlobalHotkeyAgentHandler 
          onToggle={() => isAgentVisible ? hideAgent() : showAgent()}
          isVisible={isAgentVisible}
        />

        {/* Agent Trigger Button */}
        <AgentTriggerButton 
          isVisible={isAgentVisible}
          onToggle={() => isAgentVisible ? hideAgent() : showAgent()}
          hasAccess={hasPermission('agent', currentUser)}
        />
      </div>
    </DocCraftAgentProvider>
  );
};

// Agent trigger button component
interface AgentTriggerButtonProps {
  isVisible: boolean;
  onToggle: () => void;
  hasAccess: boolean;
}

const AgentTriggerButton: React.FC<AgentTriggerButtonProps> = ({ 
  isVisible, 
  onToggle, 
  hasAccess 
}) => {
  if (!hasAccess) {
    return (
      <button
        className="fixed bottom-4 right-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        onClick={() => {
          // Show upgrade modal/toast
          console.warn('MCP block: User needs Pro tier to access agent');
        }}
        title="Upgrade to Pro to access the DocCraft Assistant"
        aria-label="Upgrade to Pro to access the DocCraft Assistant"
      >
        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    );
  }

  return (
    <button
      className={`fixed bottom-4 right-4 p-3 rounded-full shadow-lg transition-all duration-200 ${
        isVisible 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
      }`}
      onClick={onToggle}
      title={`${isVisible ? 'Close' : 'Open'} Assistant (Cmd+Shift+A)`}
      aria-label={`${isVisible ? 'Close' : 'Open'} DocCraft Assistant`}
      aria-pressed={isVisible}
      role="button"
    >
      {isVisible ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )}
    </button>
  );
}; 