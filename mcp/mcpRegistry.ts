import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface MCPFileContext {
  role: string;
  description: string;
  allowedActions: string[];
  dependencies: string[];
  relatedFiles: string[];
  aiGuidance: string;
  complexity: 'low' | 'medium' | 'high';
  lastModified?: string;
  testCoverage?: number;
}

export interface MCPProjectContext {
  name: string;
  version: string;
  description: string;
  architecture: string;
  techStack: string[];
  keyComponents: string[];
  developmentGuidelines: string[];
}

export class MCPRegistry {
  private static instance: MCPRegistry;
  private fileContexts: Map<string, MCPFileContext> = new Map();
  private projectContext: MCPProjectContext;

  private constructor() {
    this.initializeProjectContext();
    this.initializeFileContexts();
  }

  public static getInstance(): MCPRegistry {
    if (!MCPRegistry.instance) {
      MCPRegistry.instance = new MCPRegistry();
    }
    return MCPRegistry.instance;
  }

  private initializeProjectContext(): void {
    this.projectContext = {
      name: 'DocCraft-AI v3',
      version: '3.0.0',
      description:
        'Advanced AI-powered document processing platform with contextual prompt engineering and emotional arc analysis',
      architecture:
        'React + TypeScript + Vite + Tailwind CSS with modular MCP-aware architecture',
      techStack: [
        'React 18+',
        'TypeScript 5+',
        'Vite',
        'Tailwind CSS',
        'Supabase',
        'OpenAI API',
        'Jest',
        'Playwright',
        'GitHub Actions',
      ],
      keyComponents: [
        'DocumentEditor',
        'ImageSuggestions',
        'EmotionalArcModule',
        'ContextualPrompting',
        'AuditSystem',
        'PaymentSystem',
      ],
      developmentGuidelines: [
        'Use TypeScript strict mode',
        'Follow MCP registry roles and permissions',
        'Maintain 100% test coverage',
        'Implement proper error handling',
        'Use contextual prompting for AI features',
      ],
    };
  }

  private initializeFileContexts(): void {
    // Core Application Files
    this.addFileContext('src/App.tsx', {
      role: 'Application Root',
      description: 'Main application container with routing and layout',
      allowedActions: ['read', 'modify-layout', 'add-routes'],
      dependencies: ['react-router-dom', 'src/components/Layout'],
      relatedFiles: ['src/components/Layout', 'src/pages/*', 'src/routes'],
      aiGuidance:
        'This is the main entry point. Modify routing and layout structure here.',
      complexity: 'medium',
    });

    this.addFileContext('src/main.tsx', {
      role: 'Application Entry Point',
      description: 'Vite entry point with React rendering and providers',
      allowedActions: ['read', 'modify-providers', 'add-plugins'],
      dependencies: ['react', 'react-dom', 'vite'],
      relatedFiles: ['src/App.tsx', 'src/providers'],
      aiGuidance:
        'Entry point for the application. Add global providers and plugins here.',
      complexity: 'low',
    });

    // Pages
    this.addFileContext('src/pages/Home.tsx', {
      role: 'Home Page Component',
      description: 'Landing page with navigation and feature overview',
      allowedActions: ['read', 'modify-content', 'add-features'],
      dependencies: ['react-router-dom', 'src/components'],
      relatedFiles: ['src/components/Header', 'src/components/Footer'],
      aiGuidance:
        'Main landing page. Add new features and improve user experience here.',
      complexity: 'low',
    });

    this.addFileContext('src/pages/DocumentEditor.tsx', {
      role: 'Document Editor Interface',
      description: 'Core document editing interface with AI assistance',
      allowedActions: ['read', 'modify-editor', 'add-ai-features'],
      dependencies: ['src/modules/editor', 'src/modules/ai'],
      relatedFiles: ['src/modules/editor/*', 'src/modules/ai/*'],
      aiGuidance:
        'Core editing interface. Integrate new AI features and improve UX here.',
      complexity: 'high',
    });

    // Core Modules
    this.addFileContext('src/modules/editor/index.ts', {
      role: 'Editor Module Entry',
      description: 'Editor module exports and configuration',
      allowedActions: ['read', 'modify-exports', 'add-editors'],
      dependencies: ['src/modules/editor/EditorCore'],
      relatedFiles: ['src/modules/editor/*'],
      aiGuidance:
        'Editor module entry point. Add new editor types and configurations here.',
      complexity: 'medium',
    });

    this.addFileContext('src/modules/ai/index.ts', {
      role: 'AI Module Entry',
      description: 'AI services and contextual prompting system',
      allowedActions: ['read', 'modify-ai-services', 'add-prompts'],
      dependencies: [
        'src/modules/ai/ContextualPrompting',
        'src/modules/ai/OpenAIService',
      ],
      relatedFiles: ['src/modules/ai/*'],
      aiGuidance:
        'AI module entry point. Add new AI services and prompt strategies here.',
      complexity: 'high',
    });

    // Emotional Arc Module
    this.addFileContext('src/modules/emotionalArc/EmotionalArcModule.tsx', {
      role: 'Emotional Arc Analysis',
      description: 'Advanced sentiment analysis and emotional journey mapping',
      allowedActions: ['read', 'modify-analysis', 'add-emotions'],
      dependencies: ['src/modules/ai', 'src/utils/analytics'],
      relatedFiles: ['src/modules/emotionalArc/*', 'src/utils/analytics'],
      aiGuidance:
        'Emotional analysis core. Enhance sentiment detection and emotional mapping here.',
      complexity: 'high',
    });

    // Contextual Prompting
    this.addFileContext('src/modules/ai/ContextualPrompting.ts', {
      role: 'Contextual Prompt Engine',
      description:
        'Dynamic prompt generation based on user context and preferences',
      allowedActions: ['read', 'modify-prompts', 'add-contexts'],
      dependencies: ['src/modules/ai/OpenAIService', 'src/utils/context'],
      relatedFiles: ['src/modules/ai/*', 'src/utils/context'],
      aiGuidance:
        'Prompt generation core. Add new context types and prompt strategies here.',
      complexity: 'high',
    });

    // Database & Supabase
    this.addFileContext('supabase/supabase.ts', {
      role: 'Database Client',
      description: 'Supabase client configuration and connection',
      allowedActions: ['read', 'modify-config', 'add-tables'],
      dependencies: ['@supabase/supabase-js'],
      relatedFiles: ['supabase/*.sql', 'src/modules/database'],
      aiGuidance:
        'Database configuration. Add new tables and modify connection settings here.',
      complexity: 'medium',
    });

    // Testing
    this.addFileContext('tests/setup.ts', {
      role: 'Test Configuration',
      description: 'Jest and testing environment setup',
      allowedActions: ['read', 'modify-setup', 'add-mocks'],
      dependencies: ['jest', '@testing-library/react'],
      relatedFiles: ['tests/**/*', 'jest.config.cjs'],
      aiGuidance:
        'Test configuration. Add new test utilities and mock configurations here.',
      complexity: 'low',
    });

    // CI/CD
    this.addFileContext('.github/workflows/ci.yml', {
      role: 'CI Pipeline',
      description: 'GitHub Actions continuous integration workflow',
      allowedActions: ['read', 'modify-workflow', 'add-jobs'],
      dependencies: ['GitHub Actions'],
      relatedFiles: ['.github/workflows/*.yml', 'scripts/*'],
      aiGuidance:
        'CI pipeline configuration. Add new test jobs and deployment steps here.',
      complexity: 'medium',
    });

    // Configuration Files
    this.addFileContext('package.json', {
      role: 'Project Configuration',
      description: 'Dependencies, scripts, and project metadata',
      allowedActions: ['read', 'modify-dependencies', 'add-scripts'],
      dependencies: ['Node.js ecosystem'],
      relatedFiles: ['package-lock.json', 'pnpm-lock.yaml'],
      aiGuidance:
        'Project configuration. Add new dependencies and scripts here.',
      complexity: 'low',
    });

    this.addFileContext('tsconfig.json', {
      role: 'TypeScript Configuration',
      description: 'TypeScript compiler options and project settings',
      allowedActions: ['read', 'modify-options', 'add-paths'],
      dependencies: ['TypeScript'],
      relatedFiles: ['tsconfig.*.json'],
      aiGuidance:
        'TypeScript configuration. Modify compiler options and add path mappings here.',
      complexity: 'low',
    });

    // Documentation
    this.addFileContext('README.md', {
      role: 'Project Documentation',
      description: 'Main project documentation and setup guide',
      allowedActions: ['read', 'modify-content', 'add-sections'],
      dependencies: ['Markdown'],
      relatedFiles: ['docs/**/*.md', '*.md'],
      aiGuidance:
        'Main documentation. Update setup instructions and add new features here.',
      complexity: 'low',
    });
  }

  private addFileContext(filePath: string, context: MCPFileContext): void {
    this.fileContexts.set(filePath, context);
  }

  public getFileContext(filePath: string): MCPFileContext | undefined {
    return this.fileContexts.get(filePath);
  }

  public getProjectContext(): MCPProjectContext {
    return this.projectContext;
  }

  public getAllowedActions(filePath: string): string[] {
    const context = this.getFileContext(filePath);
    return context?.allowedActions || [];
  }

  public canPerformAction(filePath: string, action: string): boolean {
    const allowedActions = this.getAllowedActions(filePath);
    return allowedActions.includes(action);
  }

  public getRelatedFiles(filePath: string): string[] {
    const context = this.getFileContext(filePath);
    return context?.relatedFiles || [];
  }

  public getFileDependencies(filePath: string): string[] {
    const context = this.getFileContext(filePath);
    return context?.dependencies || [];
  }

  public getAIGuidance(filePath: string): string {
    const context = this.getFileContext(filePath);
    return (
      context?.aiGuidance || 'No specific guidance available for this file.'
    );
  }

  public searchFilesByRole(role: string): string[] {
    const files: string[] = [];
    for (const [filePath, context] of this.fileContexts.entries()) {
      if (context.role.toLowerCase().includes(role.toLowerCase())) {
        files.push(filePath);
      }
    }
    return files;
  }

  public getFilesByComplexity(complexity: 'low' | 'medium' | 'high'): string[] {
    const files: string[] = [];
    for (const [filePath, context] of this.fileContexts.entries()) {
      if (context.complexity === complexity) {
        files.push(filePath);
      }
    }
    return files;
  }

  public getContextSummary(): object {
    return {
      project: this.projectContext,
      totalFiles: this.fileContexts.size,
      complexityBreakdown: {
        low: this.getFilesByComplexity('low').length,
        medium: this.getFilesByComplexity('medium').length,
        high: this.getFilesByComplexity('high').length,
      },
      roles: Array.from(
        new Set(Array.from(this.fileContexts.values()).map(c => c.role))
      ),
    };
  }
}

export default MCPRegistry;
