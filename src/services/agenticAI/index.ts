// MCP Context Block
/*
{
  file: "index.ts",
  role: "backend-developer",
  allowedActions: ["export", "index", "integration"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "agentic_ai"
}
*/

// Core Agentic AI Components
export { AgentOrchestrator } from './agentOrchestrator';
export { AgentCoordinationEngine } from './agentCoordination';
export { AdvancedCoordinationEngine } from './coordinationEngine';
export { IntelligentConflictResolver } from './conflictResolver';
export { QualityAssuranceCoordinator } from './qualityAssuranceCoordinator';
export { ModeAwareAgentBehavior } from './modeAwareAgents';
export { EnhancedModeAwareAIService } from './enhancedModeAwareAIService';

// Writing Agents
export { ResearchAgent, OutlineAgent, WritingAgent } from './writingAgents';

// Types and Interfaces
export type {
  AgentTask,
  AgentGoal,
  GoalConstraints,
  TaskPlan,
  TaskResult,
  RecoveryPlan,
  AgentExecution,
  AgentCapability,
} from './agentOrchestrator';

export type {
  AgentInstance,
  AgentPerformance,
  CoordinationRule,
  CoordinationCondition,
  CoordinationAction,
  CoordinationPlan,
  AgentTeamMember,
  ExecutionPhase,
  AgentDependency,
  AgentResult,
  SynthesizedResult,
} from './agentCoordination';

// Advanced Coordination Types
export type {
  ModuleCapability,
  WritingGoal,
  CoordinatedTask,
  CoordinatedResult,
  SynthesizedOutput,
  QualityValidation,
  QualityCheck,
  ImprovementSuggestion,
  ModuleContribution,
} from './coordinationEngine';

// Conflict Resolution Types
export type {
  InterModuleConflict,
  ConflictType,
  ConflictResolution,
  ResolutionDecision,
  ResolutionImplementation,
  ResolutionStep,
  ResolutionStrategy,
  UserPreferenceEngine,
  NarrativeCoherenceAnalyzer,
} from './conflictResolver';

// Quality Assurance Types
export type {
  QualityStandard,
  QualityMetric,
  CrossModuleValidator,
  ModuleResult,
} from './qualityAssuranceCoordinator';

export type {
  ModeAdaptationStrategy,
  UserInteractionPoint,
  QualityThresholds,
} from './modeAwareAgents';

export type {
  AgenticRequest,
  AgenticResponse,
  AgenticAnalysis,
} from './enhancedModeAwareAIService';

export type {
  ResearchResult,
  ResearchFinding,
  ResearchInsight,
  ResearchSource,
  ResearchPlan,
  OutlineResult,
  Outline,
  OutlineSection,
  StructureAnalysis,
  SectionWordCount,
  WritingGuidance,
  QualityPrediction,
  WritingResult,
  GeneratedContent,
  SectionContent,
  QualityMetrics,
  ImprovementSuggestion,
} from './writingAgents';

// Default export for the main service
export { EnhancedModeAwareAIService as default } from './enhancedModeAwareAIService';
