import React, { useState, useEffect } from 'react';
import { useChatGPTClient } from '../src/utils/chatgpt-client';
import { useMCP } from '../src/hooks/useMCP';

interface ChatGPTResponse {
  answer: string;
  context: any;
  suggestions: any;
  metadata: any;
}

const ChatGPTIntegrationExample: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filePath, setFilePath] = useState('src/pages/Home.tsx');
  const [response, setResponse] = useState<ChatGPTResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get ChatGPT client
  const chatGPT = useChatGPTClient();

  // Get MCP context for the current file
  const mcp = useMCP(filePath);

  // Example queries
  const exampleQueries = [
    'How to add a new feature to this component?',
    'What is the purpose of this file?',
    'How to fix a common error in this component?',
    'What are the best practices for this file?',
  ];

  // Handle query submission
  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await chatGPT.askAboutFile(filePath, query);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle example query selection
  const handleExampleQuery = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  // Get file context information
  const fileContext = mcp.currentContext;
  const allowedActions = mcp.currentActions;
  const aiGuidance = mcp.currentGuidance;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-4">
          🤖 ChatGPT Integration with DocCraft-AI
        </h1>
        <p className="text-xl opacity-90">
          AI-powered codebase assistance with full MCP context awareness
        </p>
      </div>

      {/* File Context Display */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          📁 Current File Context
        </h2>

        {fileContext ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                File Information
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Role:</span> {fileContext.role}
                </p>
                <p>
                  <span className="font-medium">Description:</span>{' '}
                  {fileContext.description}
                </p>
                <p>
                  <span className="font-medium">Complexity:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      fileContext.complexity === 'high'
                        ? 'bg-red-100 text-red-800'
                        : fileContext.complexity === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {fileContext.complexity}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Permissions & Actions
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Allowed Actions:</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {allowedActions.map((action, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                    >
                      {action}
                    </span>
                  ))}
                </div>
                <p className="mt-3">
                  <span className="font-medium">AI Guidance:</span>
                </p>
                <p className="text-gray-600 italic">{aiGuidance}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No file context available</p>
        )}
      </div>

      {/* ChatGPT Query Interface */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          💬 Ask ChatGPT About Your Code
        </h2>

        {/* File Path Selection */}
        <div className="mb-4">
          <label
            htmlFor="filePath"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            File Path:
          </label>
          <input
            type="text"
            id="filePath"
            value={filePath}
            onChange={e => setFilePath(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., src/pages/Home.tsx"
          />
        </div>

        {/* Query Input */}
        <div className="mb-4">
          <label
            htmlFor="query"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Question:
          </label>
          <textarea
            id="query"
            value={query}
            onChange={e => setQuery(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask ChatGPT about this file, implementation, or any coding question..."
          />
        </div>

        {/* Example Queries */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Try these example queries:
          </p>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((exampleQuery, index) => (
              <button
                key={index}
                onClick={() => handleExampleQuery(exampleQuery)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm transition-colors"
              >
                {exampleQuery}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleQuery}
          disabled={loading || !query.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed"
        >
          {loading ? '🤔 Thinking...' : '🚀 Ask ChatGPT'}
        </button>
      </div>

      {/* Response Display */}
      {response && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            🤖 ChatGPT Response
          </h2>

          <div className="space-y-6">
            {/* Main Answer */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Answer:
              </h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm text-gray-800">
                  {response.answer}
                </pre>
              </div>
            </div>

            {/* Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Next Steps:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {response.suggestions.nextSteps.map(
                    (step: string, index: number) => (
                      <li key={index}>{step}</li>
                    )
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Best Practices:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {response.suggestions.bestPractices.map(
                    (practice: string, index: number) => (
                      <li key={index}>{practice}</li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {/* Warnings */}
            {response.suggestions.warnings &&
              response.suggestions.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">
                    ⚠️ Warnings:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                    {response.suggestions.warnings.map(
                      (warning: string, index: number) => (
                        <li key={index}>{warning}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {/* Metadata */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Response Metadata:
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Query Complexity:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      response.metadata.queryComplexity === 'high'
                        ? 'bg-red-100 text-red-800'
                        : response.metadata.queryComplexity === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {response.metadata.queryComplexity}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Context Used:</span>
                  <span className="ml-2 text-gray-600">
                    {response.metadata.contextUsed.join(', ')}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Timestamp:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(response.metadata.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">❌ Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          ⚡ Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() =>
              chatGPT.getImplementationGuidance(filePath, 'a new feature')
            }
            className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-2xl mb-2">🚀</div>
            <div className="font-medium">Implementation Guide</div>
            <div className="text-sm opacity-90">
              Get guidance for new features
            </div>
          </button>

          <button
            onClick={() => chatGPT.getExplanation(filePath, 'the main purpose')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-2xl mb-2">📚</div>
            <div className="font-medium">File Explanation</div>
            <div className="text-sm opacity-90">
              Understand file purpose and structure
            </div>
          </button>

          <button
            onClick={() => chatGPT.getFixGuidance(filePath, 'common issues')}
            className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-2xl mb-2">🔧</div>
            <div className="font-medium">Fix Guidance</div>
            <div className="text-sm opacity-90">
              Get help with common problems
            </div>
          </button>
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          📊 Integration Status
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              MCP Registry
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Status:</span>
                <span className="ml-2 text-green-600">✅ Active</span>
              </p>
              <p>
                <span className="font-medium">Files Registered:</span>
                <span className="ml-2">
                  {mcp.getContextSummary().totalFiles}
                </span>
              </p>
              <p>
                <span className="font-medium">Current File:</span>
                <span className="ml-2 text-blue-600">{filePath}</span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              ChatGPT Integration
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Status:</span>
                <span className="ml-2 text-green-600">✅ Connected</span>
              </p>
              <p>
                <span className="font-medium">API Endpoint:</span>
                <span className="ml-2 text-gray-600">
                  http://localhost:4000
                </span>
              </p>
              <p>
                <span className="font-medium">Context Awareness:</span>
                <span className="ml-2 text-green-600">✅ Full</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatGPTIntegrationExample;
