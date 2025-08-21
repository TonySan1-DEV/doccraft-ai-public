# 🤖 ChatGPT Integration Guide for DocCraft-AI

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Advanced Features](#advanced-features)

## 🎯 Overview

The ChatGPT Integration for DocCraft-AI provides **AI-powered codebase assistance** with full **MCP (Model Context Protocol) awareness**. This means ChatGPT can understand your entire codebase structure, file roles, permissions, and relationships to provide contextual, accurate assistance.

### ✨ Key Features

- **🔍 Context-Aware Responses**: ChatGPT understands file roles, complexity, and relationships
- **🛡️ Permission Validation**: Ensures suggested actions are allowed for specific files
- **📚 AI Guidance Integration**: Provides file-specific development guidance
- **🔗 Relationship Analysis**: Understands dependencies and related files
- **⚡ Quick Actions**: Pre-built queries for common development tasks

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   ChatGPT      │    │  MCP Server      │    │  MCP Registry   │
│   Client       │◄──►│  (Express.js)    │◄──►│  (File Context) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Hook    │    │  ChatGPT         │    │  File Context   │
│   (useMCP)      │    │  Provider        │    │  Mapping        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Components

1. **MCP Registry** (`mcp/mcpRegistry.ts`): Maps all files with roles, permissions, and context
2. **ChatGPT Provider** (`mcp/providers/chatgpt-integration.ts`): Processes queries with codebase context
3. **MCP Server** (`mcp/server.ts`): RESTful API endpoints for ChatGPT integration
4. **Client Utility** (`src/utils/chatgpt-client.ts`): Easy-to-use client for components
5. **React Hooks** (`src/hooks/useMCP.ts`): React integration for MCP context

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- DocCraft-AI v3 project running
- MCP server configured

### 1. Start the MCP Server

```bash
# Navigate to project root
cd doccraft-ai-v3

# Install dependencies (if not already done)
npm install

# Start MCP server
npm run mcp

# Or in development mode with auto-restart
npm run mcp:watch
```

### 2. Verify Server Status

```bash
# Check health endpoint
curl http://localhost:4000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-XX...",
  "services": {
    "mcp": "running",
    "chatgpt": "running",
    "registry": "running"
  },
  "version": "3.0.0"
}
```

### 3. Test ChatGPT Integration

```bash
# Test a simple query
curl -X POST http://localhost:4000/chatgpt/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the purpose of src/pages/Home.tsx?",
    "context": {
      "filePath": "src/pages/Home.tsx"
    }
  }'
```

## 💡 Usage Examples

### Basic Usage in React Components

```tsx
import React, { useState } from 'react';
import { useChatGPTClient } from '../utils/chatgpt-client';
import { useMCP } from '../hooks/useMCP';

const MyComponent: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);

  // Get ChatGPT client
  const chatGPT = useChatGPTClient();

  // Get MCP context for current file
  const mcp = useMCP('src/components/MyComponent.tsx');

  const handleAskChatGPT = async () => {
    try {
      const result = await chatGPT.askAboutFile(
        'src/components/MyComponent.tsx',
        query
      );
      setResponse(result);
    } catch (error) {
      console.error('ChatGPT query failed:', error);
    }
  };

  return (
    <div>
      <textarea
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Ask ChatGPT about this component..."
      />
      <button onClick={handleAskChatGPT}>Ask ChatGPT</button>

      {response && (
        <div>
          <h3>Answer:</h3>
          <pre>{response.answer}</pre>

          <h3>Next Steps:</h3>
          <ul>
            {response.suggestions.nextSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

### Quick Actions

```tsx
// Get implementation guidance
const guidance = await chatGPT.getImplementationGuidance(
  'src/pages/Home.tsx',
  'a new feature'
);

// Get file explanation
const explanation = await chatGPT.getExplanation(
  'src/modules/ai/ContextualPrompting.ts',
  'the main purpose'
);

// Get fix guidance
const fixHelp = await chatGPT.getFixGuidance(
  'src/components/Editor.tsx',
  'common errors'
);
```

### Batch Queries

```tsx
// Ask multiple questions at once
const results = await chatGPT.batchQuery([
  {
    query: 'How to add a new feature?',
    context: { filePath: 'src/pages/Home.tsx' },
  },
  {
    query: 'What are the dependencies?',
    context: { filePath: 'src/modules/ai/index.ts' },
  },
]);
```

### Streaming Responses

```tsx
// Stream long responses
const stream = chatGPT.streamQuery(
  'Explain the entire architecture of this component',
  { filePath: 'src/components/ComplexComponent.tsx' }
);

for await (const chunk of stream) {
  console.log('Received:', chunk);
  // Update UI with streaming content
}
```

## 🔌 API Reference

### ChatGPT Query Endpoint

**POST** `/chatgpt/query`

```typescript
interface ChatGPTQuery {
  query: string; // Your question
  context?: {
    filePath?: string; // Target file path
    action?: string; // Action you want to perform
    task?: string; // Type of task
    complexity?: 'low' | 'medium' | 'high';
  };
  options?: {
    includeCode?: boolean; // Include file content
    includeDependencies?: boolean; // Include dependency info
    includeRelatedFiles?: boolean; // Include related files
    maxResponseLength?: number; // Limit response length
  };
}
```

**Response:**

```typescript
interface ChatGPTResponse {
  answer: string; // AI-generated response
  context: {
    fileContext?: any; // File-specific context
    projectContext?: any; // Project-wide context
    permissions?: {
      allowed: boolean; // Action permission status
      reason?: string; // Permission explanation
      suggestions?: string[]; // Alternative actions
    };
    relatedFiles?: string[]; // Related file paths
    dependencies?: string[]; // File dependencies
  };
  suggestions: {
    nextSteps: string[]; // Recommended next steps
    bestPractices: string[]; // Best practices to follow
    warnings?: string[]; // Potential issues
  };
  metadata: {
    timestamp: string; // Response timestamp
    queryComplexity: 'low' | 'medium' | 'high';
    contextUsed: string[]; // Context types used
  };
}
```

### MCP Registry Endpoints

**GET** `/mcp/registry/summary` - Get registry overview
**GET** `/mcp/registry/file/:filePath` - Get specific file context
**GET** `/mcp/registry/search` - Search by role or complexity

### Health Check

**GET** `/health` - Server status and service health

## 📚 Best Practices

### 1. Always Use MCP Context

```tsx
// ✅ GOOD: Use MCP context
const mcp = useMCP('src/pages/Home.tsx');
if (mcp.canPerformAction('src/pages/Home.tsx', 'add-features')) {
  // Safe to add features
}

// ❌ BAD: Ignore MCP context
// Directly modify files without checking permissions
```

### 2. Leverage File-Specific Guidance

```tsx
// ✅ GOOD: Use file-specific AI guidance
const mcp = useFileMCP('src/modules/ai/ContextualPrompting.ts');
const guidance = mcp.currentGuidance;
console.log('AI suggests:', guidance);

// ❌ BAD: Generic approach
// Apply same pattern to all files
```

### 3. Validate Actions Before Execution

```tsx
// ✅ GOOD: Validate actions
const validation = mcp.validateAction('src/App.tsx', 'modify-layout');
if (validation.allowed) {
  // Proceed with modification
} else {
  console.warn(`Action not allowed: ${validation.reason}`);
  console.log(`Try: ${validation.suggestions?.join(', ')}`);
}
```

### 4. Consider File Relationships

```tsx
// ✅ GOOD: Check related files
const relatedFiles = mcp.getRelatedFiles('src/pages/Home.tsx');
const dependencies = mcp.getFileDependencies('src/pages/Home.tsx');

// Consider impact on related files before modifications
```

### 5. Use Appropriate Query Complexity

```tsx
// For simple questions
const simple = await chatGPT.getExplanation(
  'src/utils/helpers.ts',
  'the purpose'
);

// For implementation guidance
const complex = await chatGPT.getImplementationGuidance(
  'src/modules/ai/index.ts',
  'new service'
);

// For architectural changes
const architectural = await chatGPT.query(
  'How to refactor this for better performance?',
  {
    filePath: 'src/App.tsx',
    complexity: 'high',
  }
);
```

## 🔧 Troubleshooting

### Common Issues

#### 1. MCP Server Not Running

**Symptoms:**

- Connection refused errors
- Timeout errors
- 404 responses

**Solutions:**

```bash
# Check if server is running
curl http://localhost:4000/health

# Start server if not running
npm run mcp

# Check logs for errors
npm run mcp:watch
```

#### 2. File Not Found in Registry

**Symptoms:**

- "File not found in MCP registry" errors
- Missing file context

**Solutions:**

```typescript
// Check if file is registered
const mcp = useMCP();
const context = mcp.getFileContext('src/MyFile.tsx');

if (!context) {
  console.warn('File not in MCP registry. Add it to mcpRegistry.ts');
}
```

#### 3. Permission Denied

**Symptoms:**

- "Action not permitted" responses
- Permission validation failures

**Solutions:**

```typescript
// Check allowed actions
const mcp = useMCP('src/MyFile.tsx');
const actions = mcp.getAllowedActions('src/MyFile.tsx');
console.log('Allowed actions:', actions);

// Use alternative actions
const suggestions = mcp.getAISuggestions('src/MyFile.tsx', 'my task');
console.log('AI suggestions:', suggestions);
```

#### 4. Slow Responses

**Symptoms:**

- Long response times
- Timeout errors

**Solutions:**

```typescript
// Increase timeout
const client = new ChatGPTClient({ timeout: 60000 });

// Use streaming for long responses
const stream = chatGPT.streamQuery('complex question', context);
for await (const chunk of stream) {
  // Handle streaming response
}
```

### Debug Mode

Enable debug logging:

```typescript
// Set debug environment variable
process.env.DEBUG = 'chatgpt-integration:*';

// Or enable in client
const client = new ChatGPTClient({
  debug: true,
});
```

## 🚀 Advanced Features

### 1. Custom Context Providers

```typescript
// Create custom context provider
class CustomContextProvider {
  async getContext(filePath: string) {
    // Custom logic for context generation
    return {
      role: 'Custom Role',
      description: 'Custom description',
      allowedActions: ['custom-action'],
      // ... other context properties
    };
  }
}

// Register with MCP registry
const registry = MCPRegistry.getInstance();
registry.registerContextProvider('custom', new CustomContextProvider());
```

### 2. Response Caching

```typescript
// Implement response caching
class CachedChatGPTClient extends ChatGPTClient {
  private cache = new Map<string, any>();

  async query(query: string, context?: any, options?: any) {
    const cacheKey = JSON.stringify({ query, context, options });

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const response = await super.query(query, context, options);
    this.cache.set(cacheKey, response);

    return response;
  }
}
```

### 3. Custom Response Formats

```typescript
// Custom response processing
const customResponse = await chatGPT.query('my question', context, {
  ...options,
  customFormat: 'markdown',
  includeCodeSnippets: true,
  includeTestExamples: true,
});
```

### 4. Integration with External Tools

```typescript
// Integrate with VS Code extension
const vscodeIntegration = {
  async getCurrentFile() {
    // Get current file from VS Code
    return vscode.window.activeTextEditor?.document.fileName;
  },

  async applySuggestion(suggestion: string) {
    // Apply suggestion to current file
    // Implementation depends on VS Code API
  },
};
```

## 📖 Examples Directory

The `examples/` directory contains working examples:

- `chatgpt-integration-example.tsx` - Full integration example
- `mcp-usage-examples.tsx` - MCP hook usage examples
- `permission-validation.tsx` - Action validation examples

## 🔗 Related Documentation

- [MCP Setup Guide](./MCP_SETUP.md)
- [Project Architecture](./ARCHITECTURE.md)
- [Development Guidelines](./DEVELOPMENT.md)
- [API Reference](./API_REFERENCE.md)

## 🤝 Contributing

To contribute to the ChatGPT integration:

1. Follow the MCP rules in `.cursor/rules/mcp.md`
2. Use the MCP registry for file context
3. Test with the example components
4. Update documentation for new features

## 📞 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the MCP rules and guidelines
3. Test with the example components
4. Check server logs and health endpoints

---

_This integration provides ChatGPT with full awareness of your DocCraft-AI codebase, enabling contextual, accurate, and permission-aware AI assistance for development tasks._
