// MCP Context Block
/*
{
  file: "PromptPreviewExample.tsx",
  role: "example",
  allowedActions: ["demonstrate", "showcase"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "usability"
}
*/

import React, { useState } from 'react';
import { PromptPreviewPanel } from '../PromptPreviewPanel';
import type { DocumentContext } from '../../agent/ContextualPromptEngine';

// Example usage component
export const PromptPreviewExample: React.FC = () => {
  const [currentDoc, setCurrentDoc] = useState<DocumentContext>({
    scene: 'A coffee shop on a rainy afternoon',
    arc: 'setup',
    characterName: 'Emma'
  });

  const [showPatternDetails, setShowPatternDetails] = useState(true);
  const [isCollapsible, setIsCollapsible] = useState(true);

  const exampleScenarios = [
    {
      name: 'Romance Setup',
      doc: {
        scene: 'A coffee shop on a rainy afternoon',
        arc: 'setup' as const,
        characterName: 'Emma'
      }
    },
    {
      name: 'Mystery Climax',
      doc: {
        scene: 'A dimly lit detective office',
        arc: 'climax' as const,
        characterName: 'Detective Sarah'
      }
    },
    {
      name: 'Sci-Fi Rising',
      doc: {
        scene: 'A futuristic space station',
        arc: 'rising' as const,
        characterName: 'Commander Chen'
      }
    },
    {
      name: 'Fantasy Resolution',
      doc: {
        scene: 'An ancient magical forest',
        arc: 'resolution' as const,
        characterName: 'Mage Elena'
      }
    },
    {
      name: 'Unknown Genre (Fallback)',
      doc: {
        scene: 'A mysterious location',
        arc: 'setup' as const,
        characterName: 'Unknown Character'
      }
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Prompt Preview Panel Examples
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          See how the AI prompt header changes based on different contexts and preferences
        </p>
      </div>

      {/* Controls */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Configuration Options
        </h2>
        
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showPatternDetails}
              onChange={(e) => setShowPatternDetails(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show Pattern Details
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isCollapsible}
              onChange={(e) => setIsCollapsible(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Collapsible Panel
            </span>
          </label>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Example Scenarios
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {exampleScenarios.map((scenario, index) => (
            <button
              key={index}
              onClick={() => setCurrentDoc(scenario.doc)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                currentDoc.scene === scenario.doc.scene
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {scenario.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {scenario.doc.scene}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Arc: {scenario.doc.arc} • Character: {scenario.doc.characterName}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Current Preview
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Scene: {currentDoc.scene}
          </div>
        </div>

        <PromptPreviewPanel
          doc={currentDoc}
          showPatternDetails={showPatternDetails}
          collapsible={isCollapsible}
          className="w-full"
        />
      </div>

      {/* Multiple Previews */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Side-by-Side Comparison
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {exampleScenarios.slice(0, 4).map((scenario, index) => (
            <div key={index} className="space-y-2">
              <h3 className="text-md font-medium text-gray-900 dark:text-white">
                {scenario.name}
              </h3>
              <PromptPreviewPanel
                doc={scenario.doc}
                showPatternDetails={false}
                collapsible={false}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          How to Use
        </h3>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>
            • <strong>Select different scenarios</strong> to see how the prompt header changes
          </p>
          <p>
            • <strong>Toggle pattern details</strong> to show/hide the specific pattern being used
          </p>
          <p>
            • <strong>Use collapsible mode</strong> to save space in your UI
          </p>
          <p>
            • <strong>Watch for fallback warnings</strong> when using unknown genres or arcs
          </p>
          <p>
            • <strong>Real-time updates</strong> happen automatically when context changes
          </p>
        </div>
      </div>

      {/* Integration Code Example */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Integration Example
        </h3>
        <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
{`import { PromptPreviewPanel } from './components/PromptPreviewPanel';

// In your component
const MyComponent = () => {
  const doc = {
    scene: 'A coffee shop',
    arc: 'setup',
    characterName: 'Emma'
  };

  return (
    <PromptPreviewPanel
      doc={doc}
      showPatternDetails={true}
      collapsible={true}
      className="w-full"
    />
  );
};`}
        </pre>
      </div>
    </div>
  );
};

export default PromptPreviewExample; 