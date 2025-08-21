import { Request, Response } from 'express';
import MCPRegistry from '../mcpRegistry';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface ChatGPTQuery {
  query: string;
  context?: {
    filePath?: string;
    action?: string;
    task?: string;
    complexity?: 'low' | 'medium' | 'high';
  };
  options?: {
    includeCode?: boolean;
    includeDependencies?: boolean;
    includeRelatedFiles?: boolean;
    maxResponseLength?: number;
  };
}

export interface ChatGPTResponse {
  answer: string;
  context: {
    fileContext?: any;
    projectContext?: any;
    permissions?: {
      allowed: boolean;
      reason?: string;
      suggestions?: string[];
    };
    relatedFiles?: string[];
    dependencies?: string[];
  };
  suggestions: {
    nextSteps: string[];
    bestPractices: string[];
    warnings?: string[];
  };
  metadata: {
    timestamp: string;
    queryComplexity: 'low' | 'medium' | 'high';
    contextUsed: string[];
  };
}

export class ChatGPTIntegrationProvider {
  private registry: MCPRegistry;

  constructor() {
    this.registry = MCPRegistry.getInstance();
  }

  /**
   * Process a ChatGPT query with full codebase context
   */
  public async processQuery(query: ChatGPTQuery): Promise<ChatGPTResponse> {
    try {
      const { query: userQuery, context, options } = query;

      // Get project context
      const projectContext = this.registry.getProjectContext();

      // Get file context if specified
      let fileContext = undefined;
      let permissions = undefined;
      let relatedFiles: string[] = [];
      let dependencies: string[] = [];

      if (context?.filePath) {
        fileContext = this.registry.getFileContext(context.filePath);

        if (context.action) {
          permissions = {
            allowed: this.registry.canPerformAction(
              context.filePath,
              context.action
            ),
            reason: this.registry.canPerformAction(
              context.filePath,
              context.action
            )
              ? 'Action is permitted for this file'
              : 'Action is not permitted for this file',
            suggestions: this.registry.getAllowedActions(context.filePath),
          };
        }

        relatedFiles = this.registry.getRelatedFiles(context.filePath);
        dependencies = this.registry.getFileDependencies(context.filePath);
      }

      // Generate AI response based on context
      const answer = await this.generateAIResponse(userQuery, {
        fileContext,
        projectContext,
        permissions,
        context: context || {},
      });

      // Get next steps and best practices
      const suggestions = this.generateSuggestions(userQuery, {
        fileContext,
        projectContext,
        permissions,
        context: context || {},
      });

      // Determine query complexity
      const queryComplexity = this.assessQueryComplexity(
        userQuery,
        fileContext
      );

      return {
        answer,
        context: {
          fileContext: options?.includeCode ? fileContext : undefined,
          projectContext: options?.includeCode ? projectContext : undefined,
          permissions,
          relatedFiles: options?.includeRelatedFiles ? relatedFiles : undefined,
          dependencies: options?.includeDependencies ? dependencies : undefined,
        },
        suggestions,
        metadata: {
          timestamp: new Date().toISOString(),
          queryComplexity,
          contextUsed: this.getContextUsed(context, options),
        },
      };
    } catch (error) {
      console.error('Error processing ChatGPT query:', error);
      throw new Error(
        `Failed to process query: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate AI response based on codebase context
   */
  private async generateAIResponse(
    query: string,
    context: any
  ): Promise<string> {
    const { fileContext, projectContext, permissions } = context;

    let response = '';

    // Add project context
    if (projectContext) {
      response += `Based on the ${projectContext.name} (${projectContext.version}) codebase:\n\n`;
    }

    // Add file context if available
    if (fileContext) {
      response += `**File Context**: ${fileContext.role}\n`;
      response += `**Description**: ${fileContext.description}\n`;
      response += `**Complexity**: ${fileContext.complexity}\n\n`;

      if (fileContext.aiGuidance) {
        response += `**AI Guidance**: ${fileContext.aiGuidance}\n\n`;
      }
    }

    // Add permission context
    if (permissions) {
      if (permissions.allowed) {
        response += `✅ **Action Permitted**: The requested action is allowed for this file.\n\n`;
      } else {
        response += `❌ **Action Not Permitted**: ${permissions.reason}\n`;
        if (permissions.suggestions && permissions.suggestions.length > 0) {
          response += `**Suggested Actions**: ${permissions.suggestions.join(', ')}\n\n`;
        }
      }
    }

    // Add query-specific response
    response += `**Response to your query**: ${query}\n\n`;

    // Generate contextual response based on query type
    if (
      query.toLowerCase().includes('how to') ||
      query.toLowerCase().includes('implement')
    ) {
      response += this.generateImplementationResponse(query, context);
    } else if (
      query.toLowerCase().includes('what is') ||
      query.toLowerCase().includes('explain')
    ) {
      response += this.generateExplanationResponse(query, context);
    } else if (
      query.toLowerCase().includes('fix') ||
      query.toLowerCase().includes('error')
    ) {
      response += this.generateFixResponse(query, context);
    } else {
      response += this.generateGeneralResponse(query, context);
    }

    return response;
  }

  /**
   * Generate implementation-focused response
   */
  private generateImplementationResponse(query: string, context: any): string {
    const { fileContext, projectContext } = context;

    let response = '**Implementation Guidance**:\n\n';

    if (fileContext) {
      response += `1. **Follow File Role**: This file serves as ${fileContext.role.toLowerCase()}\n`;
      response += `2. **Respect Complexity**: This is a ${fileContext.complexity} complexity file\n`;
      response += `3. **Check Dependencies**: Ensure ${fileContext.dependencies.join(', ')} are properly imported\n`;
    }

    if (projectContext) {
      response += `4. **Follow Project Guidelines**: ${projectContext.developmentGuidelines.join(', ')}\n`;
      response += `5. **Use Tech Stack**: Leverage ${projectContext.techStack.join(', ')}\n`;
    }

    response += `\n**Next Steps**:\n`;
    response += `- Review related files for patterns\n`;
    response += `- Implement with proper error handling\n`;
    response += `- Add comprehensive tests\n`;
    response += `- Follow TypeScript strict mode\n`;

    return response;
  }

  /**
   * Generate explanation-focused response
   */
  private generateExplanationResponse(query: string, context: any): string {
    const { fileContext, projectContext } = context;

    let response = '**Explanation**:\n\n';

    if (fileContext) {
      response += `This file (${fileContext.role}) is responsible for ${fileContext.description}.\n\n`;
      response += `**Key Aspects**:\n`;
      response += `- **Role**: ${fileContext.role}\n`;
      response += `- **Complexity**: ${fileContext.complexity}\n`;
      response += `- **Dependencies**: ${fileContext.dependencies.join(', ')}\n`;
      response += `- **Related Files**: ${fileContext.relatedFiles.join(', ')}\n\n`;
    }

    if (projectContext) {
      response += `**Project Context**:\n`;
      response += `- **Architecture**: ${projectContext.architecture}\n`;
      response += `- **Key Components**: ${projectContext.keyComponents.join(', ')}\n`;
    }

    return response;
  }

  /**
   * Generate fix-focused response
   */
  private generateFixResponse(query: string, context: any): string {
    const { fileContext, permissions } = context;

    let response = '**Fix Guidance**:\n\n';

    if (permissions && !permissions.allowed) {
      response += `⚠️ **Permission Issue**: ${permissions.reason}\n`;
      response += `Consider using one of these allowed actions: ${permissions.suggestions?.join(', ')}\n\n`;
    }

    if (fileContext) {
      response += `**File-Specific Fixes**:\n`;
      response += `1. Check file dependencies: ${fileContext.dependencies.join(', ')}\n`;
      response += `2. Review related files: ${fileContext.relatedFiles.join(', ')}\n`;
      response += `3. Follow file role: ${fileContext.role}\n`;
      response += `4. Respect complexity level: ${fileContext.complexity}\n\n`;
    }

    response += `**General Fix Steps**:\n`;
    response += `- Check console for error messages\n`;
    response += `- Verify imports and dependencies\n`;
    response += `- Review related file changes\n`;
    response += `- Run tests to verify fixes\n`;

    return response;
  }

  /**
   * Generate general response
   */
  private generateGeneralResponse(query: string, context: any): string {
    const { projectContext } = context;

    let response = '**General Guidance**:\n\n';

    if (projectContext) {
      response += `For the ${projectContext.name} project:\n`;
      response += `- **Architecture**: ${projectContext.architecture}\n`;
      response += `- **Tech Stack**: ${projectContext.techStack.join(', ')}\n`;
      response += `- **Key Components**: ${projectContext.keyComponents.join(', ')}\n\n`;
    }

    response += `**Best Practices**:\n`;
    response += `- Always check MCP registry for file context\n`;
    response += `- Follow established patterns and conventions\n`;
    response += `- Maintain test coverage and code quality\n`;
    response += `- Use TypeScript strict mode\n`;

    return response;
  }

  /**
   * Generate suggestions for next steps and best practices
   */
  private generateSuggestions(
    query: string,
    context: any
  ): { nextSteps: string[]; bestPractices: string[]; warnings?: string[] } {
    const { fileContext, projectContext, permissions } = context;

    const nextSteps: string[] = [];
    const bestPractices: string[] = [];
    const warnings: string[] = [];

    // Next steps based on context
    if (fileContext) {
      nextSteps.push(`Review ${fileContext.role} implementation patterns`);
      nextSteps.push(
        `Check related files: ${fileContext.relatedFiles.join(', ')}`
      );
      nextSteps.push(
        `Verify dependencies: ${fileContext.dependencies.join(', ')}`
      );
    }

    if (projectContext) {
      nextSteps.push(`Follow ${projectContext.name} development guidelines`);
      nextSteps.push(
        `Use established tech stack: ${projectContext.techStack.join(', ')}`
      );
    }

    // Best practices
    bestPractices.push('Use MCP registry for context-aware development');
    bestPractices.push('Follow file roles and permissions');
    bestPractices.push('Maintain TypeScript strict mode');
    bestPractices.push('Add comprehensive tests');
    bestPractices.push('Document changes with context');

    // Warnings
    if (permissions && !permissions.allowed) {
      warnings.push(`Action not permitted: ${permissions.reason}`);
    }

    if (fileContext && fileContext.complexity === 'high') {
      warnings.push('High complexity file - proceed with caution');
    }

    return {
      nextSteps,
      bestPractices,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Assess query complexity
   */
  private assessQueryComplexity(
    query: string,
    fileContext?: any
  ): 'low' | 'medium' | 'high' {
    const queryLower = query.toLowerCase();

    // High complexity indicators
    if (
      queryLower.includes('architecture') ||
      queryLower.includes('refactor') ||
      queryLower.includes('migrate') ||
      queryLower.includes('optimize')
    ) {
      return 'high';
    }

    // Medium complexity indicators
    if (
      queryLower.includes('implement') ||
      queryLower.includes('add feature') ||
      queryLower.includes('modify') ||
      queryLower.includes('integrate')
    ) {
      return 'medium';
    }

    // Low complexity indicators
    if (
      queryLower.includes('explain') ||
      queryLower.includes('what is') ||
      queryLower.includes('how to') ||
      queryLower.includes('show')
    ) {
      return 'low';
    }

    // Default based on file context
    return fileContext?.complexity || 'medium';
  }

  /**
   * Get context usage information
   */
  private getContextUsed(context?: any, options?: any): string[] {
    const used: string[] = [];

    if (context?.filePath) used.push('file-context');
    if (context?.action) used.push('action-permissions');
    if (context?.task) used.push('task-context');
    if (context?.complexity) used.push('complexity-level');
    if (options?.includeCode) used.push('code-content');
    if (options?.includeDependencies) used.push('dependencies');
    if (options?.includeRelatedFiles) used.push('related-files');

    return used;
  }

  /**
   * Get codebase statistics for ChatGPT
   */
  public getCodebaseStats(): object {
    const summary = this.registry.getContextSummary();
    const projectContext = this.registry.getProjectContext();

    return {
      project: projectContext,
      summary,
      mcpFeatures: {
        totalFiles: summary.totalFiles,
        complexityBreakdown: summary.complexityBreakdown,
        roles: summary.roles,
      },
      integration: {
        provider: 'ChatGPT Integration Provider',
        version: '1.0.0',
        features: [
          'Context-aware responses',
          'Permission validation',
          'File relationship analysis',
          'AI guidance integration',
          'Best practices suggestions',
        ],
      },
    };
  }
}

export default ChatGPTIntegrationProvider;
