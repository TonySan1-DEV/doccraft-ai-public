import { useMemo, useCallback } from 'react';
import MCPRegistry, {
  MCPFileContext,
  MCPProjectContext,
} from '../../mcp/mcpRegistry';

export interface UseMCPReturn {
  // File-specific context
  getFileContext: (filePath: string) => MCPFileContext | undefined;
  getAllowedActions: (filePath: string) => string[];
  canPerformAction: (filePath: string, action: string) => boolean;
  getRelatedFiles: (filePath: string) => string[];
  getFileDependencies: (filePath: string) => string[];
  getAIGuidance: (filePath: string) => string;

  // Project-wide context
  getProjectContext: () => MCPProjectContext;
  getContextSummary: () => object;

  // Search and filtering
  searchFilesByRole: (role: string) => string[];
  getFilesByComplexity: (complexity: 'low' | 'medium' | 'high') => string[];

  // Utility functions
  validateAction: (
    filePath: string,
    action: string,
    context?: string
  ) => {
    allowed: boolean;
    reason?: string;
    suggestions?: string[];
  };

  // AI assistance
  getAISuggestions: (
    filePath: string,
    task: string
  ) => {
    guidance: string;
    relatedFiles: string[];
    complexity: string;
    bestPractices: string[];
  };
}

export function useMCP(filePath?: string): UseMCPReturn {
  const registry = useMemo(() => MCPRegistry.getInstance(), []);

  const getFileContext = useCallback(
    (path: string) => {
      return registry.getFileContext(path);
    },
    [registry]
  );

  const getAllowedActions = useCallback(
    (path: string) => {
      return registry.getAllowedActions(path);
    },
    [registry]
  );

  const canPerformAction = useCallback(
    (path: string, action: string) => {
      return registry.canPerformAction(path, action);
    },
    [registry]
  );

  const getRelatedFiles = useCallback(
    (path: string) => {
      return registry.getRelatedFiles(path);
    },
    [registry]
  );

  const getFileDependencies = useCallback(
    (path: string) => {
      return registry.getFileDependencies(path);
    },
    [registry]
  );

  const getAIGuidance = useCallback(
    (path: string) => {
      return registry.getAIGuidance(path);
    },
    [registry]
  );

  const getProjectContext = useCallback(() => {
    return registry.getProjectContext();
  }, [registry]);

  const getContextSummary = useCallback(() => {
    return registry.getContextSummary();
  }, [registry]);

  const searchFilesByRole = useCallback(
    (role: string) => {
      return registry.searchFilesByRole(role);
    },
    [registry]
  );

  const getFilesByComplexity = useCallback(
    (complexity: 'low' | 'medium' | 'high') => {
      return registry.getFilesByComplexity(complexity);
    },
    [registry]
  );

  const validateAction = useCallback(
    (path: string, action: string, context?: string) => {
      const fileContext = registry.getFileContext(path);
      const allowed = registry.canPerformAction(path, action);

      if (allowed) {
        return { allowed: true };
      }

      const reason = `Action '${action}' is not allowed for file '${path}'`;
      const suggestions = fileContext?.allowedActions || [];

      return {
        allowed: false,
        reason,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
      };
    },
    [registry]
  );

  const getAISuggestions = useCallback(
    (path: string, task: string) => {
      const fileContext = registry.getFileContext(path);
      const projectContext = registry.getProjectContext();

      if (!fileContext) {
        return {
          guidance: 'File not found in MCP registry',
          relatedFiles: [],
          complexity: 'unknown',
          bestPractices: [],
        };
      }

      const bestPractices = [
        `Follow ${projectContext.name} development guidelines`,
        `Use TypeScript strict mode`,
        `Maintain test coverage`,
        `Follow the file's role: ${fileContext.role}`,
        `Check related files: ${fileContext.relatedFiles.join(', ')}`,
      ];

      return {
        guidance: fileContext.aiGuidance,
        relatedFiles: fileContext.relatedFiles,
        complexity: fileContext.complexity,
        bestPractices,
      };
    },
    [registry]
  );

  // If a filePath is provided, return a focused version with that file's context
  if (filePath) {
    const fileContext = getFileContext(filePath);
    const focusedRegistry = {
      ...registry,
      currentFile: filePath,
      currentContext: fileContext,
      currentActions: getAllowedActions(filePath),
      currentGuidance: getAIGuidance(filePath),
    };

    return {
      getFileContext,
      getAllowedActions,
      canPerformAction,
      getRelatedFiles,
      getFileDependencies,
      getAIGuidance,
      getProjectContext,
      getContextSummary,
      searchFilesByRole,
      getFilesByComplexity,
      validateAction,
      getAISuggestions,
      // Focused context for the specific file
      currentFile: filePath,
      currentContext: fileContext,
      currentActions: getAllowedActions(filePath),
      currentGuidance: getAIGuidance(filePath),
    } as UseMCPReturn & {
      currentFile: string;
      currentContext: MCPFileContext | undefined;
      currentActions: string[];
      currentGuidance: string;
    };
  }

  return {
    getFileContext,
    getAllowedActions,
    canPerformAction,
    getRelatedFiles,
    getFileDependencies,
    getAIGuidance,
    getProjectContext,
    getContextSummary,
    searchFilesByRole,
    getFilesByComplexity,
    validateAction,
    getAISuggestions,
  };
}

// Convenience hook for specific file context
export function useFileMCP(filePath: string) {
  return useMCP(filePath);
}

// Hook for project-wide context only
export function useProjectMCP() {
  const registry = useMemo(() => MCPRegistry.getInstance(), []);

  return {
    getProjectContext: () => registry.getProjectContext(),
    getContextSummary: () => registry.getContextSummary(),
    searchFilesByRole: (role: string) => registry.searchFilesByRole(role),
    getFilesByComplexity: (complexity: 'low' | 'medium' | 'high') =>
      registry.getFilesByComplexity(complexity),
  };
}

export default useMCP;
