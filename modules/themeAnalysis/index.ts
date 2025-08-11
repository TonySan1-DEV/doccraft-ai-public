export const mcpContext = {
  file: 'modules/themeAnalysis/index.ts',
  role: 'developer',
  allowedActions: ['create', 'harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

// Core types and interfaces
export type {
  ThemeKeyword,
  ThemeCategory,
  ThemeScore,
  ThemeVector,
  ThematicSignal,
  SceneThemeFingerprint,
  ThemeAlignmentReport,
  ThemeConflictReason,
} from './themeTypes';

// Category 2 Theme Analysis Engine
export { ThemeAnalysisEngine } from './services/themeAnalysisEngine';

export type {
  ThemeAnalysisContext,
  ThemeAnalysisResult,
  ThemeComplexityMetrics,
} from './services/themeAnalysisEngine';

// Legacy theme engine (for backward compatibility)
export { analyzeThemeConsistency } from './initThemeEngine';
export type { SceneMeta } from './initThemeEngine';

// Theme conflict analysis
export { generateConflictReason } from './services/themeConflictAnalyzer';

export type { SceneConflictContext } from './services/themeConflictAnalyzer';

// Thematic report export
export { exportThematicAuditMarkdown } from './services/ThematicReportExporter';

// Components
export { default as ThemeMatrixPanel } from './components/ThemeMatrixPanel';
