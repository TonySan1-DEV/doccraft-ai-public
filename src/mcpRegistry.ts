export interface MCPContext {
  role: string;
  allowedActions: string[];
  theme: string;
  contentSensitivity: string;
  tier?: string;
  roleMeta?: {
    description: string;
    permissions: string[];
    restrictions: string[];
  };
}

export const roleMeta = {
  viewer: {
    description: "Basic read-only access to view content",
    permissions: ["read", "view"],
    restrictions: ["no-edit", "no-delete"]
  },
  editor: {
    description: "Can edit and modify content",
    permissions: ["read", "edit", "preview"],
    restrictions: ["no-delete", "no-admin"]
  },
  admin: {
    description: "Full administrative access",
    permissions: ["read", "edit", "delete", "analyze", "process"],
    restrictions: []
  },
  configurator: {
    description: "Can adjust settings and configurations",
    permissions: ["adjust", "style", "configure"],
    restrictions: ["no-delete", "no-admin"]
  },
  curator: {
    description: "Can manage and organize content",
    permissions: ["refactor", "animate", "style", "organize"],
    restrictions: ["no-delete", "no-admin"]
  },
  uploader: {
    description: "Can add and clean uploaded content",
    permissions: ["add", "clean", "upload"],
    restrictions: ["no-delete", "no-admin"]
  }
};

export const mcpRegistry = {
    "App.tsx": { 
      role: "viewer", 
      allowedActions: ['read'], 
      theme: "general", 
      contentSensitivity: "low",
      tier: "Free",
      roleMeta: roleMeta.viewer
    },
    "main.tsx": { 
      role: "viewer", 
      allowedActions: ['read'], 
      theme: "general", 
      contentSensitivity: "low",
      tier: "Free",
      roleMeta: roleMeta.viewer
    },
    "AuthModal.tsx": { 
      role: "viewer", 
      allowedActions: ['read', 'secure'], 
      theme: "auth", 
      contentSensitivity: "high",
      tier: "Pro",
      roleMeta: roleMeta.viewer
    },
    "ConfigurationBanner.tsx": { 
      role: "configurator", 
      allowedActions: ['adjust', 'style'], 
      theme: "enhancement-ui", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.configurator
    },
    "DocumentEditor.tsx": { 
      role: "editor", 
      allowedActions: ['edit', 'preview'], 
      theme: "doc-edit", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.editor
    },
    "DocumentPreview.tsx": { 
      role: "viewer", 
      allowedActions: ['read'], 
      theme: "general", 
      contentSensitivity: "low",
      tier: "Free",
      roleMeta: roleMeta.viewer
    },
    "DocumentUpload.tsx": { 
      role: "uploader", 
      allowedActions: ['add', 'clean'], 
      theme: "document-import", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.uploader
    },
    "EnhancementPanel.tsx": { 
      role: "configurator", 
      allowedActions: ['adjust', 'style'], 
      theme: "enhancement-ui", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.configurator
    },
    "EnhancementSettings.tsx": { 
      role: "configurator", 
      allowedActions: ['adjust', 'style'], 
      theme: "enhancement-ui", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.configurator
    },
    "ForgotPasswordModal.tsx": { 
      role: "viewer", 
      allowedActions: ['read', 'secure'], 
      theme: "auth", 
      contentSensitivity: "high",
      tier: "Pro",
      roleMeta: roleMeta.viewer
    },
    "Header.tsx": { 
      role: "viewer", 
      allowedActions: ['read'], 
      theme: "general", 
      contentSensitivity: "low",
      tier: "Free",
      roleMeta: roleMeta.viewer
    },
    "ImageRating.tsx": { 
      role: "curator", 
      allowedActions: ['refactor', 'animate', 'style'], 
      theme: "visual-assist", 
      contentSensitivity: "low",
      tier: "Pro",
      roleMeta: roleMeta.curator
    },
    "ImageSuggestions.tsx": { 
      role: "curator", 
      allowedActions: ['refactor', 'animate', 'style'], 
      theme: "visual-assist", 
      contentSensitivity: "low",
      tier: "Pro",
      roleMeta: roleMeta.curator
    },
    "LoginModal.tsx": { 
      role: "viewer", 
      allowedActions: ['read', 'secure'], 
      theme: "auth", 
      contentSensitivity: "high",
      tier: "Pro",
      roleMeta: roleMeta.viewer
    },
    "ManualImageSelector.tsx": { 
      role: "curator", 
      allowedActions: ['refactor', 'animate', 'style'], 
      theme: "visual-assist", 
      contentSensitivity: "low",
      tier: "Pro",
      roleMeta: roleMeta.curator
    },
    "AuthContext.tsx": { 
      role: "viewer", 
      allowedActions: ['read', 'secure'], 
      theme: "auth", 
      contentSensitivity: "high",
      tier: "Pro",
      roleMeta: roleMeta.viewer
    },
    "ThemeContext.tsx": { 
      role: "viewer", 
      allowedActions: ['read'], 
      theme: "general", 
      contentSensitivity: "low",
      tier: "Free",
      roleMeta: roleMeta.viewer
    },
    "Dashboard.tsx": { 
      role: "admin", 
      allowedActions: ['analyze', 'process'], 
      theme: "doc-management", 
      contentSensitivity: "medium",
      tier: "Admin",
      roleMeta: roleMeta.admin
    },
    "Demo.tsx": { 
      // 🎯 Interactive demo presentation page
      // - Step-by-step feature demonstration
      // - Interactive navigation and user control
      // - Confetti celebration and agent integration
      // - Professional conversion-focused experience
      role: "curator", 
      allowedActions: ['refactor', 'animate', 'style', 'organize', 'present'], 
      theme: "demo-presentation", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.curator
    },
    "DocumentProcessor.tsx": { 
      role: "admin", 
      allowedActions: ['analyze', 'process'], 
      theme: "doc-management", 
      contentSensitivity: "medium",
      tier: "Admin",
      roleMeta: roleMeta.admin
    },
    "DocumentView.tsx": { 
      role: "viewer", 
      allowedActions: ['read'], 
      theme: "general", 
      contentSensitivity: "low",
      tier: "Free",
      roleMeta: roleMeta.viewer
    },
    "ProcessDocument.tsx": { 
      role: "viewer", 
      allowedActions: ['read'], 
      theme: "general", 
      contentSensitivity: "low",
      tier: "Free",
      roleMeta: roleMeta.viewer
    },
    "imageSuggester.ts": { 
      role: "curator", 
      allowedActions: ['generate', 'rank'], 
      theme: "visual-assist", 
      contentSensitivity: "low",
      tier: "Pro",
      roleMeta: roleMeta.curator
    },
    "imageFetcher.ts": { 
      role: "curator", 
      allowedActions: ['generate', 'rank', 'insert'], 
      theme: "visual-assist", 
      contentSensitivity: "low",
      tier: "Pro",
      roleMeta: roleMeta.curator
    },
    "imagePlacer.ts": { 
      role: "curator", 
      allowedActions: ['generate', 'rank', 'insert'], 
      theme: "visual-assist", 
      contentSensitivity: "low",
      tier: "Pro",
      roleMeta: roleMeta.curator
    },
    "imagingMode.ts": { 
      role: "configurator", 
      allowedActions: ['adjust', 'configure'], 
      theme: "enhancement-ui", 
      contentSensitivity: "low",
      tier: "Pro",
      roleMeta: roleMeta.configurator
    },
    "useImagingMode.ts": { 
      role: "configurator", 
      allowedActions: ['adjust', 'configure'], 
      theme: "enhancement-ui", 
      contentSensitivity: "low",
      tier: "Pro",
      roleMeta: roleMeta.configurator
    },
    "ImagingModeSelector.tsx": { 
      role: "configurator", 
      allowedActions: ['adjust', 'configure'], 
      theme: "enhancement-ui", 
      contentSensitivity: "low",
      tier: "Pro",
      roleMeta: roleMeta.configurator
    },
    "ebookAnalyzer.ts": { 
      // 📘 eBook section analysis service
      // - Suggests improved titles
      // - Summarizes paragraphs
      // - Extracts topics, keywords, sentiment, and reading level
      role: "analyzer", 
      allowedActions: ['summarize', 'tag', 'label'], 
      theme: "enhancement", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "SectionAnalyzer.tsx": { 
      // 📊 Section analysis UI component
      // - Text input and analysis interface
      // - Displays analysis results with badges
      // - MCP permission-based access control
      role: "analyzer", 
      allowedActions: ['summarize', 'tag', 'label'], 
      theme: "enhancement", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "Sidebar.tsx": { 
      // 🧭 Navigation sidebar component
      // - Role-aware and tier-aware rendering
      // - Mobile responsive with hamburger menu
      // - Role dropdown and user info display
      role: "viewer", 
      allowedActions: ['read', 'navigate'], 
      theme: "navigation", 
      contentSensitivity: "low",
      tier: "Pro",
      roleMeta: roleMeta.viewer
    },
    "EmotionalArc.ts": { 
      // 📊 Emotional arc data types
      // - Defines emotional beats, segments, and reader simulation
      // - Core data structures for emotional analysis
      role: "analyzer", 
      allowedActions: ['analyze', 'simulate', 'visualize', 'suggest'], 
      theme: "writing_suite", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "emotionAnalyzer.ts": { 
      // 🧠 NLP-based emotion analysis service
      // - Analyzes text for emotional indicators
      // - Extracts character emotions and scene sentiment
      role: "analyzer", 
      allowedActions: ['analyze', 'simulate', 'visualize', 'suggest'], 
      theme: "writing_suite", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "arcSimulator.ts": { 
      // 📈 Arc simulation and tension curve generation
      // - Generates normalized tension/empathy graphs
      // - Simulates reader response and engagement
      role: "analyzer", 
      allowedActions: ['analyze', 'simulate', 'visualize', 'suggest'], 
      theme: "writing_suite", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "suggestionEngine.ts": { 
      // 💡 AI-powered optimization suggestions
      // - Generates pacing and emotional beat recommendations
      // - Provides risk assessment and implementation order
      role: "analyzer", 
      allowedActions: ['analyze', 'simulate', 'visualize', 'suggest'], 
      theme: "writing_suite", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "EmotionalArcModule.tsx": { 
      // 🎭 Main emotional arc analysis module
      // - Integrates all emotional analysis services
      // - Provides comprehensive story optimization interface
      role: "developer", 
      allowedActions: ['analyze', 'simulate', 'visualize', 'suggest'], 
      theme: "writing_suite", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "EmotionTimelineChart.tsx": { 
      // 📊 Character emotion timeline visualization
      // - Line chart showing character emotion arcs
      // - Multi-character and individual character views
      role: "developer", 
      allowedActions: ['analyze', 'simulate', 'visualize', 'suggest'], 
      theme: "writing_suite", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "TensionCurveViewer.tsx": { 
      // 📈 Tension and engagement curve visualization
      // - Area graph representing reader tension/engagement
      // - Shows emotional peaks and engagement risks
      role: "developer", 
      allowedActions: ['analyze', 'simulate', 'visualize', 'suggest'], 
      theme: "writing_suite", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "SceneSentimentPanel.tsx": { 
      // 🎭 Per-scene sentiment and empathy breakdown
      // - Detailed scene-by-scene emotional analysis
      // - Character emotion tracking and context clues
      role: "developer", 
      allowedActions: ['analyze', 'simulate', 'visualize', 'suggest'], 
      theme: "writing_suite", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "OptimizationSuggestions.tsx": { 
      // 💡 Real-time AI edit recommendations
      // - Shows optimization suggestions with impact analysis
      // - Risk assessment and implementation guidance
      role: "developer", 
      allowedActions: ['analyze', 'simulate', 'visualize', 'suggest'], 
      theme: "writing_suite", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "CharacterArcSwitch.tsx": { 
      // 🔄 Character arc view toggle
      // - Toggle for multi-character or full-story view
      // - Individual character emotional arc selection
      role: "developer", 
      allowedActions: ['analyze', 'simulate', 'visualize', 'suggest'], 
      theme: "writing_suite", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "EmotionalArcTest.tsx": { 
      // 🧪 Emotional arc module test page
      // - Demonstrates emotional arc analysis functionality
      // - Provides interactive testing interface
      role: "developer", 
      allowedActions: ['analyze', 'simulate', 'visualize', 'suggest'], 
      theme: "writing_suite", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    // Test files
    "emotionArc.spec.tsx": { 
      // 🧪 Comprehensive test suite for emotional arc components
      // - Jest + React Testing Library tests
      // - Accessibility and integration testing
      role: "qa", 
      allowedActions: ['generate', 'test', 'validate', 'mock'], 
      theme: "emotional_modeling", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    // Prompt templates
    "emotionArc.prompt.md": { 
      // 📝 Reusable prompt templates for emotional arc development
      // - Module scaffolding, UI components, testing templates
      // - MCP-compliant development patterns
      role: "prompt-engineer", 
      allowedActions: ['generate', 'template', 'document'], 
      theme: "emotional_modeling", 
      contentSensitivity: "low",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    // CI/CD workflow
    "emotionArc.yml": { 
      // 🚀 GitHub Actions workflow for emotional arc module
      // - Type checking, testing, building, deployment
      // - Vercel deployment with emotionArc route
      role: "devops", 
      allowedActions: ['deploy', 'lint', 'test', 'build'], 
      theme: "deployment", 
      contentSensitivity: "low",
      tier: "Admin",
      roleMeta: roleMeta.admin
    },
    // Documentation files
    "README.md": { 
      // 📖 Comprehensive module documentation
      // - Overview, features, architecture, usage examples
      // - API reference and troubleshooting guide
      role: "project-manager", 
      allowedActions: ['generate', 'document', 'summarize'], 
      theme: "documentation", 
      contentSensitivity: "low",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "CONTRIBUTING.md": { 
      // 🤝 Development guidelines and setup instructions
      // - Code standards, testing, accessibility requirements
      // - Branching strategy and pull request process
      role: "project-manager", 
      allowedActions: ['generate', 'document', 'summarize'], 
      theme: "documentation", 
      contentSensitivity: "low",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "CHANGELOG.md": { 
      // 📝 Version history and milestone tracking
      // - MCP-based contributions and development milestones
      // - Technical debt and future improvements
      role: "project-manager", 
      allowedActions: ['generate', 'document', 'summarize'], 
      theme: "documentation", 
      contentSensitivity: "low",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    // Package configuration files
    "package.json": { 
      // 📦 Standalone package configuration
      // - Scoped package name and version
      // - Dependencies and build scripts
      role: "devops", 
      allowedActions: ['scaffold', 'publish', 'package'], 
      theme: "deployment", 
      contentSensitivity: "low",
      tier: "Admin",
      roleMeta: roleMeta.admin
    },
    "rollup.config.js": { 
      // 🔧 Rollup build configuration
      // - TypeScript bundling and minification
      // - Multiple output formats (CJS/ESM)
      role: "devops", 
      allowedActions: ['scaffold', 'publish', 'package'], 
      theme: "deployment", 
      contentSensitivity: "low",
      tier: "Admin",
      roleMeta: roleMeta.admin
    },
    "tsconfig.build.json": { 
      // ⚙️ TypeScript build configuration
      // - Declaration generation and module resolution
      // - Strict type checking for production builds
      role: "devops", 
      allowedActions: ['scaffold', 'publish', 'package'], 
      theme: "deployment", 
      contentSensitivity: "low",
      tier: "Admin",
      roleMeta: roleMeta.admin
    },
    ".npmignore": { 
      // 🚫 NPM ignore configuration
      // - Excludes tests, docs, and development files
      // - Optimizes package size for publishing
      role: "devops", 
      allowedActions: ['scaffold', 'publish', 'package'], 
      theme: "deployment", 
      contentSensitivity: "low",
      tier: "Admin",
      roleMeta: roleMeta.admin
    },
    "AICharacterDevelopment.tsx": { 
      role: "admin", 
      allowedActions: ["analyze", "process", "enhance"], 
      theme: "character_ai", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "characterAIIntelligence.ts": { 
      role: "admin", 
      allowedActions: ["analyze", "process", "enhance"], 
      theme: "character_ai", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "EnhancedCharacterChat.tsx": { 
      role: "admin", 
      allowedActions: ["analyze", "process", "enhance"], 
      theme: "character_ai", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "enhancedCharacterInteraction.ts": { 
      role: "admin", 
      allowedActions: ["analyze", "process", "enhance"], 
      theme: "character_ai", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "advancedCharacterAI.ts": { 
      role: "admin", 
      allowedActions: ["analyze", "process", "enhance"], 
      theme: "character_ai", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "characterRelationshipEngine.ts": { 
      role: "admin", 
      allowedActions: ["analyze", "process", "enhance"], 
      theme: "character_ai", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "AdvancedCharacterDevelopment.tsx": { 
      role: "admin", 
      allowedActions: ["analyze", "process", "enhance"], 
      theme: "character_ai", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "llmIntegrationService.ts": { 
      role: "admin", 
      allowedActions: ["analyze", "process", "enhance"], 
      theme: "llm_integration", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    },
    "LLMChatInterface.tsx": { 
      role: "admin", 
      allowedActions: ["analyze", "process", "enhance"], 
      theme: "llm_integration", 
      contentSensitivity: "medium",
      tier: "Pro",
      roleMeta: roleMeta.admin
    }
  };

export function buildMCPPrompt(context: MCPContext, file?: string, currentFile?: string): string {
  const timestamp = new Date().toISOString();
  const fileName = file || currentFile || "unknown";
  const role = context.role;
  const actions = context.allowedActions.join(", ");
  const sensitivity = context.contentSensitivity;
  const tier = context.tier || "Free";
  
  return `/* [MCP] Role: ${role} | File: ${fileName} | Actions: ${actions} | Sensitivity: ${sensitivity} | Tier: ${tier} | Timestamp: ${timestamp} */`;
}