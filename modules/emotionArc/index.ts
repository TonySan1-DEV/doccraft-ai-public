// MCP Context Block
/*
{
  file: "modules/emotionArc/index.ts",
  role: "devops",
  allowedActions: ["scaffold", "publish", "package"],
  tier: "Admin",
  contentSensitivity: "low",
  theme: "deployment"
}
*/

// Main module exports
export { default as EmotionalArcModule } from './components/EmotionalArcModule';

// Core services
export { EmotionAnalyzer } from './services/emotionAnalyzer';
export { ArcSimulator } from './services/arcSimulator';
export { SuggestionEngine } from './services/suggestionEngine';

// UI Components
export { default as EmotionTimelineChart } from './components/EmotionTimelineChart';
export { default as TensionCurveViewer } from './components/TensionCurveViewer';
export { default as OptimizationSuggestions } from './components/OptimizationSuggestions';
export { default as SceneSentimentPanel } from './components/SceneSentimentPanel';
export { default as CharacterArcSwitch } from './components/CharacterArcSwitch';

// Type definitions
export type {
  EmotionalBeat,
  ArcSegment,
  ReaderSimResult,
  EmotionalArc,
  CharacterEmotionalProfile,
  StoryEmotionalMap,
  EmotionAnalysisResult,
  SceneEmotionData,
  TensionCurve,
  ArcSimulationResult,
  OptimizationSuggestion,
  StoryOptimizationPlan,
  EmotionAnalyzerConfig,
  ModelProvider,
  ReaderProfile,
  SceneInput,
  AnalysisRequest,
  AnalysisResponse,
  EmotionAnalysisError,
  EmotionAnalysisEvent,
  ValidationResult,
  AnalysisCache,
} from './types/emotionTypes';

// Utilities
export {
  validateEmotionalBeat,
  validateEmotionalArc,
} from './utils/validation';

// Constants
export { EMOTION_CATEGORIES, EMOTION_COLORS } from './constants/emotions';

// Test utilities (for consumers who want to test the module)
// export * from './components/__tests__/testHooks'; // Removed test file export

// Storybook stories (for documentation)
export * from './components/__stories__/EmotionArcStories';

// Version information
export const VERSION = '1.0.0';
export const PACKAGE_NAME = '@doccraft/emotion-arc';

// Module metadata
export const MODULE_INFO = {
  name: PACKAGE_NAME,
  version: VERSION,
  description:
    'AI-powered emotional analysis and optimization for narrative storytelling',
  author: 'DocCraft AI Team',
  license: 'MIT',
  repository: 'https://github.com/your-org/doccraft-ai',
  homepage: 'https://doccraft-ai.com/docs/emotion-arc',
} as const;

// Import components and services for default export
import EmotionalArcModule from './components/EmotionalArcModule';
import { EmotionAnalyzer } from './services/emotionAnalyzer';
import { ArcSimulator } from './services/arcSimulator';
import { SuggestionEngine } from './services/suggestionEngine';
import EmotionTimelineChart from './components/EmotionTimelineChart';
import TensionCurveViewer from './components/TensionCurveViewer';
import OptimizationSuggestions from './components/OptimizationSuggestions';
import SceneSentimentPanel from './components/SceneSentimentPanel';
import CharacterArcSwitch from './components/CharacterArcSwitch';

// Default export for convenience
export default {
  EmotionalArcModule,
  EmotionAnalyzer,
  ArcSimulator,
  SuggestionEngine,
  EmotionTimelineChart,
  TensionCurveViewer,
  OptimizationSuggestions,
  SceneSentimentPanel,
  CharacterArcSwitch,
  VERSION,
  MODULE_INFO,
};
