// MCP Context Block
/*
{
  file: "AdvancedSettingsView.tsx",
  role: "frontend-developer",
  allowedActions: ["preferences", "ui", "accessibility", "diagnostics"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "advanced_settings"
}
*/

import { useState } from 'react';
import { AgentPreferencesPanel } from './AgentPreferencesPanel';
import { AgentBehaviorConsole } from './AgentBehaviorConsole';
import { PromptPreviewPane } from './PromptPreviewPane';
import type { DocumentContext } from '../agent/ContextualPromptEngine';

interface AdvancedSettingsViewProps {
  className?: string;
  documentContext?: DocumentContext;
  showBehaviorConsole?: boolean;
  showPromptPreview?: boolean;
  defaultActiveTab?: 'preferences' | 'behavior' | 'preview';
}

type TabType = 'preferences' | 'behavior' | 'preview';

export function AdvancedSettingsView({
  className = '',
  documentContext,
  showBehaviorConsole = true,
  showPromptPreview = true,
  defaultActiveTab = 'preferences'
}: AdvancedSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultActiveTab);

  // Default document context
  const defaultContext: DocumentContext = {
    scene: "Current writing session",
    arc: "setup",
    characterName: "Main Character"
  };

  const context = documentContext || defaultContext;

  const tabs = [
    {
      id: 'preferences' as TabType,
      label: 'Preferences',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'behavior' as TabType,
      label: 'Behavior Console',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      disabled: !showBehaviorConsole
    },
    {
      id: 'preview' as TabType,
      label: 'Prompt Preview',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      disabled: !showPromptPreview
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Agent Preferences
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Configure how your AI assistant behaves and responds to your writing needs.
              </p>
            </div>
            <AgentPreferencesPanel
              showResetButton={true}
              showPromptPreview={false}
              className="max-w-none"
            />
          </div>
        );

      case 'behavior':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Behavior Console
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Real-time analysis of how your AI agent interprets the current configuration.
              </p>
            </div>
            <AgentBehaviorConsole
              documentContext={context}
              showCopyButton={true}
              collapsible={false}
              defaultExpanded={true}
              refreshInterval={3000}
            />
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Prompt Preview
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                See the actual prompt template being generated based on your current preferences.
              </p>
            </div>
            <PromptPreviewPane
              documentContext={context}
              showFallbackDiagnostics={true}
              collapsible={false}
              defaultCollapsed={false}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Advanced Settings
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Fine-tune your AI assistant's behavior and monitor its interpretation
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="px-6">
          <nav className="flex space-x-8" aria-label="Advanced settings tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } ${
                  tab.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.disabled && (
                  <span className="text-xs text-gray-400">(Disabled)</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
} 