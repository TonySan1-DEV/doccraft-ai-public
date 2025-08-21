import express from 'express';
import ChatGPTIntegrationProvider from './providers/chatgpt-integration';
import MCPRegistry from './mcpRegistry';

const app = express();
app.use(express.json());

// Initialize providers
const chatgptProvider = new ChatGPTIntegrationProvider();
const mcpRegistry = MCPRegistry.getInstance();

// Mock context providers for backward compatibility
const repoContext = async () => ({
  name: 'doccraft-ai-v3',
  version: '3.0.0',
  description: 'Advanced AI-powered document processing platform',
});

const ciContext = async () => ({
  platform: 'GitHub Actions',
  workflows: ['ci.yml', 'test.yml', 'lint.yml'],
  status: 'active',
});

const dbContext = async () => ({
  provider: 'Supabase',
  schema: 'audit_schema, payment_system, feedback_events',
  status: 'connected',
});

const envContext = async () => ({
  environment: process.env['NODE_ENV'] || 'development',
  features: ['contextual_prompting', 'emotional_arc', 'audit_logging'],
});

// Legacy context endpoint
app.post('/context', async (req, res) => {
  const { project, providers } = req.body;
  const context: any = {};

  if (providers.repoContext) context.repo = await repoContext();
  if (providers.ciContext) context.ci = await ciContext();
  if (providers.dbContext) context.db = await dbContext();
  if (providers.envContext) context.env = await envContext();

  res.json({
    project,
    timestamp: new Date().toISOString(),
    context,
  });
});

// ChatGPT Integration Endpoints
app.post('/chatgpt/query', async (req, res) => {
  try {
    const query = req.body;

    if (!query.query) {
      return res.status(400).json({
        error: 'Missing required field: query',
        message: 'Please provide a query string',
      });
    }

    const response = await chatgptProvider.processQuery(query);
    res.json(response);
  } catch (error) {
    console.error('ChatGPT query error:', error);
    res.status(500).json({
      error: 'Failed to process query',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get codebase statistics
app.get('/chatgpt/stats', (req, res) => {
  try {
    const stats = chatgptProvider.getCodebaseStats();
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: 'Failed to get codebase stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// MCP Registry Endpoints
app.get('/mcp/registry/summary', (req, res) => {
  try {
    const summary = mcpRegistry.getContextSummary();
    res.json(summary);
  } catch (error) {
    console.error('Registry summary error:', error);
    res.status(500).json({
      error: 'Failed to get registry summary',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/mcp/registry/file/:filePath', (req, res) => {
  try {
    const filePath = req.params.filePath;
    const context = mcpRegistry.getFileContext(filePath);

    if (!context) {
      return res.status(404).json({
        error: 'File not found',
        message: `No MCP context found for file: ${filePath}`,
      });
    }

    res.json({
      filePath,
      context,
      permissions: {
        allowedActions: mcpRegistry.getAllowedActions(filePath),
        canPerformAction: (action: string) =>
          mcpRegistry.canPerformAction(filePath, action),
      },
    });
  } catch (error) {
    console.error('File context error:', error);
    res.status(500).json({
      error: 'Failed to get file context',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/mcp/registry/search', (req, res) => {
  try {
    const { role, complexity } = req.query;

    let results: any = {};

    if (role) {
      results.byRole = mcpRegistry.searchFilesByRole(role as string);
    }

    if (
      complexity &&
      ['low', 'medium', 'high'].includes(complexity as string)
    ) {
      results.byComplexity = mcpRegistry.getFilesByComplexity(
        complexity as 'low' | 'medium' | 'high'
      );
    }

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Failed to search registry',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      mcp: 'running',
      chatgpt: 'running',
      registry: 'running',
    },
    version: '3.0.0',
  });
});

const PORT = process.env['MCP_PORT'] || 4000;
app.listen(PORT, () => {
  console.log(`✅ Enhanced MCP server running at http://localhost:${PORT}`);
  console.log(`🔌 ChatGPT integration available at /chatgpt/query`);
  console.log(`📊 MCP registry available at /mcp/registry/*`);
  console.log(`💚 Health check available at /health`);
});
