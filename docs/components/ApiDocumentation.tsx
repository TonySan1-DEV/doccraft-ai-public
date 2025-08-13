import React, { useState } from 'react';
import {
  Book,
  Code,
  Zap,
  Shield,
  Globe,
  Download,
  Play,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';

export const ApiDocumentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedEndpoint, setSelectedEndpoint] = useState('/ai/process');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, identifier: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(identifier);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Book className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  DocCraft-AI API
                </h1>
                <p className="text-sm text-gray-600">
                  World-class AI writing platform API
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                v3.0.0
              </span>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Get API Key
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white h-screen sticky top-0 shadow-sm overflow-y-auto">
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Getting Started
                </h3>
                <ul className="mt-3 space-y-2">
                  <li>
                    <button
                      onClick={() => setActiveSection('overview')}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'overview'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Overview
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveSection('authentication')}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'authentication'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Authentication
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveSection('quickstart')}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'quickstart'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Quick Start
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  API Endpoints
                </h3>
                <ul className="mt-3 space-y-2">
                  <li>
                    <button
                      onClick={() => {
                        setActiveSection('endpoints');
                        setSelectedEndpoint('/ai/process');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'endpoints' &&
                        selectedEndpoint === '/ai/process'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      AI Processing
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveSection('endpoints');
                        setSelectedEndpoint('/ai/emotional-arc');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'endpoints' &&
                        selectedEndpoint === '/ai/emotional-arc'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Emotional Analysis
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveSection('endpoints');
                        setSelectedEndpoint('/ai/mode/configure');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'endpoints' &&
                        selectedEndpoint === '/ai/mode/configure'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Mode Configuration
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveSection('endpoints');
                        setSelectedEndpoint('/analytics/performance');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'endpoints' &&
                        selectedEndpoint === '/analytics/performance'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Performance Analytics
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  SDKs & Tools
                </h3>
                <ul className="mt-3 space-y-2">
                  <li>
                    <button
                      onClick={() => setActiveSection('sdks')}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'sdks'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      SDKs
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveSection('postman')}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'postman'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Postman Collection
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {activeSection === 'overview' && <OverviewSection />}
          {activeSection === 'authentication' && <AuthenticationSection />}
          {activeSection === 'quickstart' && <QuickStartSection />}
          {activeSection === 'endpoints' && (
            <EndpointSection endpoint={selectedEndpoint} />
          )}
          {activeSection === 'sdks' && <SDKSection />}
          {activeSection === 'postman' && <PostmanSection />}
        </main>
      </div>
    </div>
  );
};

const OverviewSection: React.FC = () => (
  <div className="max-w-4xl">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">
      DocCraft-AI API Documentation
    </h1>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
      <div className="flex items-center mb-4">
        <Zap className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold text-blue-900">
          World-Class AI Writing Platform
        </h2>
      </div>
      <p className="text-blue-800">
        DocCraft-AI is a revolutionary AI-powered writing platform with a 9.2/10
        technical excellence rating. Our API provides access to cutting-edge AI
        writing assistance with three distinct modes for different use cases.
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <Code className="h-8 w-8 text-green-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Easy Integration
        </h3>
        <p className="text-gray-600">
          Simple REST API with comprehensive SDKs for all major programming
          languages.
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <Zap className="h-8 w-8 text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Lightning Fast
        </h3>
        <p className="text-gray-600">
          Sub-500ms response times with intelligent caching and performance
          optimization.
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <Shield className="h-8 w-8 text-purple-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Enterprise Security
        </h3>
        <p className="text-gray-600">
          GDPR compliant with comprehensive audit logging and enterprise-grade
          security.
        </p>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Revolutionary Mode System
      </h2>
      <div className="space-y-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600 font-bold">M</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">MANUAL Mode</h3>
            <p className="text-gray-600">
              Complete user control. AI responds only to explicit requests.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-bold">H</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">HYBRID Mode</h3>
            <p className="text-gray-600">
              Collaborative assistance with contextual suggestions and user
              control.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-purple-600 font-bold">A</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">FULLY_AUTO Mode</h3>
            <p className="text-gray-600">
              Proactive AI with comprehensive assistance and real-time
              optimization.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AuthenticationSection: React.FC = () => (
  <div className="max-w-4xl">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">Authentication</h1>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
      <div className="flex items-center mb-4">
        <AlertCircle className="h-6 w-6 text-yellow-600 mr-2" />
        <h2 className="text-lg font-semibold text-yellow-900">
          API Key Required
        </h2>
      </div>
      <p className="text-yellow-800">
        All API requests require authentication using an API key in the
        X-API-Key header. Get your API key from the DocCraft-AI dashboard.
      </p>
    </div>

    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Header Authentication
        </h2>
        <div className="bg-gray-900 rounded-lg p-4">
          <code className="text-green-400">
            X-API-Key: dca_live_your_api_key_here
          </code>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Example Request
        </h2>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-green-400 text-sm">
            {`curl -X POST https://api.doccraft-ai.com/v3/ai/process \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: dca_live_your_api_key_here" \\
  -H "X-Mode: HYBRID" \\
  -d '{
    "type": "content-enhancement",
    "content": "Your content here"
  }'`}
          </pre>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Security Best Practices
        </h3>
        <ul className="space-y-2 text-gray-600">
          <li>
            • Keep your API key secure and never expose it in client-side code
          </li>
          <li>• Use environment variables for API key storage</li>
          <li>• Rotate API keys regularly</li>
          <li>• Monitor API usage for suspicious activity</li>
        </ul>
      </div>
    </div>
  </div>
);

const QuickStartSection: React.FC = () => (
  <div className="max-w-4xl">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">Quick Start Guide</h1>

    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          1. Get Your API Key
        </h2>
        <div className="bg-gray-900 rounded-lg p-4">
          <code className="text-green-400">
            # Get your API key from: https://doccraft-ai.com/dashboard/api-keys
          </code>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          2. Make Your First Request
        </h2>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-green-400 text-sm">
            {`curl -X POST https://api.doccraft-ai.com/v3/ai/process \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: dca_live_your_api_key_here" \\
  -H "X-Mode: HYBRID" \\
  -d '{
    "type": "content-enhancement",
    "content": "The old lighthouse stood on the cliff.",
    "context": {
      "genre": "creative-fiction",
      "tone": "mysterious"
    },
    "options": {
      "enhanceEmotion": true,
      "addSensoryDetails": true
    }
  }'`}
          </pre>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          3. Handle the Response
        </h2>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-green-400 text-sm">
            {`{
  "success": true,
  "content": "The ancient lighthouse stood like a weathered sentinel on the jagged cliff, its broken windows staring blindly into the storm-churned sea.",
  "enhancements": [
    {
      "type": "emotional-depth",
      "description": "Added atmospheric tension and mystery",
      "confidence": 0.92
    },
    {
      "type": "sensory-details", 
      "description": "Enhanced visual and tactile imagery",
      "confidence": 0.88
    }
  ],
  "suggestions": [
    "Consider adding backstory about the lighthouse keeper",
    "Potential for metaphorical development of isolation themes"
  ],
  "performance": {
    "processingTime": 245,
    "cacheHit": false,
    "mode": "HYBRID"
  }
}`}
          </pre>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Success! 🎉
        </h3>
        <p className="text-blue-800">
          You've successfully enhanced content using DocCraft-AI's revolutionary
          AI system. The response includes the enhanced content, detailed
          enhancements applied, suggestions for further improvement, and
          performance metrics showing sub-500ms processing time.
        </p>
      </div>
    </div>
  </div>
);

const EndpointSection: React.FC<{ endpoint: string }> = ({ endpoint }) => {
  const endpointData = {
    '/ai/process': {
      title: 'AI Processing',
      description:
        "Process writing requests through DocCraft-AI's revolutionary mode-aware AI system.",
      method: 'POST',
      url: 'https://api.doccraft-ai.com/v3/ai/process',
      headers: [
        { name: 'X-API-Key', required: true, description: 'Your API key' },
        {
          name: 'X-Mode',
          required: true,
          description: 'AI behavior mode (MANUAL, HYBRID, FULLY_AUTO)',
        },
        {
          name: 'X-Request-ID',
          required: false,
          description: 'Unique request identifier',
        },
      ],
      requestBody: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            required: true,
            enum: [
              'content-enhancement',
              'document-optimization',
              'creative-assistance',
            ],
          },
          content: { type: 'string', required: true, maxLength: 50000 },
          context: { type: 'object', required: false },
          options: { type: 'object', required: false },
        },
      },
    },
    '/ai/emotional-arc': {
      title: 'Emotional Arc Analysis',
      description:
        'Analyze the emotional journey and sentiment progression in content.',
      method: 'POST',
      url: 'https://api.doccraft-ai.com/v3/ai/emotional-arc',
      headers: [
        { name: 'X-API-Key', required: true, description: 'Your API key' },
      ],
      requestBody: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            required: true,
            description: 'Content to analyze',
          },
          analysisDepth: {
            type: 'string',
            required: false,
            enum: ['basic', 'detailed', 'comprehensive'],
          },
          context: { type: 'object', required: false },
        },
      },
    },
    '/ai/mode/configure': {
      title: 'Mode Configuration',
      description:
        'Configure and customize AI mode behavior for your application.',
      method: 'POST',
      url: 'https://api.doccraft-ai.com/v3/ai/mode/configure',
      headers: [
        { name: 'X-API-Key', required: true, description: 'Your API key' },
      ],
      requestBody: {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            required: true,
            enum: ['MANUAL', 'HYBRID', 'FULLY_AUTO'],
          },
          settings: { type: 'object', required: false },
        },
      },
    },
    '/analytics/performance': {
      title: 'Performance Analytics',
      description: 'Retrieve comprehensive performance metrics and analytics.',
      method: 'GET',
      url: 'https://api.doccraft-ai.com/v3/analytics/performance',
      headers: [
        { name: 'X-API-Key', required: true, description: 'Your API key' },
      ],
      queryParams: [
        {
          name: 'startDate',
          type: 'string',
          required: false,
          description: 'Start date (ISO 8601)',
        },
        {
          name: 'endDate',
          type: 'string',
          required: false,
          description: 'End date (ISO 8601)',
        },
        {
          name: 'mode',
          type: 'string',
          required: false,
          enum: ['MANUAL', 'HYBRID', 'FULLY_AUTO'],
        },
      ],
    },
  };

  const data = endpointData[endpoint as keyof typeof endpointData];

  return (
    <div className="max-w-4xl">
      <div className="flex items-center mb-6">
        <div
          className={`px-3 py-1 rounded text-sm font-medium mr-4 ${
            data.method === 'GET'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {data.method}
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{data.title}</h1>
      </div>

      <p className="text-gray-600 mb-8">{data.description}</p>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Endpoint URL
          </h2>
          <div className="bg-gray-900 rounded-lg p-4">
            <code className="text-green-400">{data.url}</code>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Headers</h2>
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Header
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Required
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.headers.map((header, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {header.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {header.required ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {header.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {data.requestBody && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Request Body
            </h2>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                {JSON.stringify(data.requestBody, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {data.queryParams && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Query Parameters
            </h2>
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parameter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Required
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.queryParams.map((param, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {param.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {param.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {param.required ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {param.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SDKSection: React.FC = () => (
  <div className="max-w-4xl">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">SDKs & Libraries</h1>

    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            JavaScript/TypeScript SDK
          </h2>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
            Official
          </span>
        </div>
        <p className="text-gray-600 mb-4">
          Official Node.js and browser SDK with full TypeScript support and
          comprehensive error handling.
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Installation</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <code className="text-green-400">
                npm install @doccraft-ai/sdk
              </code>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Basic Usage</h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                {`import { DocCraftAI } from '@doccraft-ai/sdk';

const client = new DocCraftAI({
  apiKey: 'dca_live_your_api_key_here',
  mode: 'HYBRID'
});

const result = await client.ai.enhance({
  content: 'Your content here',
  type: 'content-enhancement'
});

console.log(result.content);`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Python SDK</h2>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
            Official
          </span>
        </div>
        <p className="text-gray-600 mb-4">
          Python SDK with async support, comprehensive error handling, and
          integration examples.
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Installation</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <code className="text-green-400">pip install doccraft-ai</code>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Basic Usage</h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                {`from doccraft_ai import DocCraftAI

client = DocCraftAI(api_key='your_key')
result = client.ai.enhance(
    content='Your content here',
    type='content-enhancement'
)

print(result.content)`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Community SDKs
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">PHP SDK</h3>
            <p className="text-sm text-gray-600 mb-2">
              Community-maintained PHP SDK
            </p>
            <code className="text-sm text-blue-600">
              composer require doccraft-ai/php-sdk
            </code>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Go SDK</h3>
            <p className="text-sm text-gray-600 mb-2">
              Official Go SDK with gRPC support
            </p>
            <code className="text-sm text-blue-600">
              go get github.com/doccraft-ai/go-sdk
            </code>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PostmanSection: React.FC = () => (
  <div className="max-w-4xl">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">
      Postman Collection
    </h1>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
      <div className="flex items-center mb-4">
        <Globe className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold text-blue-900">
          Ready-to-Use API Testing
        </h2>
      </div>
      <p className="text-blue-800">
        Download our comprehensive Postman collection to test all API endpoints
        with pre-configured requests, environment variables, and example
        responses.
      </p>
    </div>

    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Download Collection
        </h2>
        <div className="flex items-center space-x-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Download Postman Collection
          </button>
          <span className="text-sm text-gray-500">v3.0.0 - Updated 2024</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Collection Features
        </h2>
        <ul className="space-y-2 text-gray-600">
          <li>• Pre-configured requests for all endpoints</li>
          <li>• Environment variables for easy API key management</li>
          <li>• Example request bodies and responses</li>
          <li>• Automated testing scenarios</li>
          <li>• Performance monitoring examples</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Setup
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              1. Import Collection
            </h3>
            <p className="text-gray-600">
              Download and import the collection into Postman
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              2. Set Environment Variables
            </h3>
            <p className="text-gray-600">
              Configure your API key and base URL in the environment
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">3. Start Testing</h3>
            <p className="text-gray-600">
              Use the pre-configured requests to test all endpoints
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ApiDocumentation;
