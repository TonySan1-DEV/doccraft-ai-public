// MCP Context Block
/*
{
  file: "coordinationEngine.ts",
  role: "backend-developer",
  allowedActions: ["service", "ai", "coordination", "agent"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "agent_coordination"
}
*/

import { SystemMode, WritingContext } from '../../types/systemModes';
import { ModuleNameType } from '../../types/security';
import { IntelligentConflictResolver } from './conflictResolver';
import { QualityAssuranceCoordinator } from './qualityAssuranceCoordinator';
import { PerformanceMonitor } from '../cache/performanceMonitor';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Module Capability Interface
 * Defines what each module can do and its current state
 */
export interface ModuleCapability {
  moduleName: ModuleNameType;
  capabilities: string[];
  currentStatus: 'idle' | 'active' | 'busy' | 'error';
  performanceMetrics: {
    averageExecutionTime: number;
    successRate: number;
    qualityScore: number;
    lastOptimization: Date;
  };
  dependencies: ModuleNameType[];
  estimatedWorkload: number;
}

/**
 * Writing Goal Interface
 * High-level writing objective that requires multi-module coordination
 */
export interface WritingGoal {
  id: string;
  title: string;
  description: string;
  type:
    | 'content_generation'
    | 'content_analysis'
    | 'content_optimization'
    | 'content_synthesis';
  priority: 'low' | 'medium' | 'high' | 'critical';
  requirements: {
    needsEmotionalAnalysis: boolean;
    needsStructuralAnalysis: boolean;
    needsStyleAnalysis: boolean;
    needsThematicAnalysis: boolean;
    needsCharacterDevelopment: boolean;
    qualityLevel: 'draft' | 'polished' | 'publication_ready';
    targetAudience: string;
    genre: string;
  };
  constraints: {
    maxExecutionTime: number;
    qualityThreshold: number;
    userPreferences: any;
    collaborationMode: 'autonomous' | 'collaborative' | 'advisory';
  };
  context: WritingContext;
}

/**
 * Coordinated Task Interface
 * Individual task within a coordinated workflow
 */
export interface CoordinatedTask {
  id: string;
  moduleName: ModuleNameType;
  taskType: string;
  description: string;
  dependencies: string[];
  estimatedDuration: number;
  priority: number;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  executionTime?: number;
  qualityMetrics?: any;
}

/**
 * Coordination Plan Interface
 * Comprehensive plan for coordinating multiple modules
 */
export interface CoordinationPlan {
  id: string;
  goalId: string;
  moduleTasks: CoordinatedTask[];
  executionPhases: ExecutionPhase[];
  dependencies: ModuleDependency[];
  estimatedDuration: number;
  status: 'planning' | 'executing' | 'completed' | 'failed';
  metadata: {
    createdAt: Date;
    lastUpdated: Date;
    userMode: SystemMode;
    optimizationLevel: number;
  };
}

export interface ExecutionPhase {
  id: string;
  name: string;
  type: 'sequential' | 'parallel' | 'conditional';
  tasks: string[];
  dependencies: string[];
  estimatedDuration: number;
  criticalPath: boolean;
}

export interface ModuleDependency {
  from: ModuleNameType;
  to: ModuleNameType;
  type: 'data' | 'result' | 'approval' | 'coordination';
  description: string;
  critical: boolean;
}

/**
 * Coordinated Result Interface
 * Unified result from multi-module coordination
 */
export interface CoordinatedResult {
  result: SynthesizedOutput;
  quality: QualityValidation;
  conflicts: number;
  executionTime: number;
  moduleContributions: ModuleContribution[];
  metadata: {
    goalId: string;
    modulesInvolved: ModuleNameType[];
    coordinationPlanId: string;
    timestamp: Date;
  };
}

export interface SynthesizedOutput {
  content: any;
  insights: string[];
  recommendations: string[];
  nextSteps: string[];
  confidence: number;
}

export interface QualityValidation {
  overallScore: number;
  moduleScores: Map<ModuleNameType, number>;
  passed: boolean;
  improvements: ImprovementSuggestion[];
  validationDetails: QualityCheck[];
}

export interface QualityCheck {
  moduleName: ModuleNameType;
  checkType: string;
  passed: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
}

export interface ImprovementSuggestion {
  moduleName: ModuleNameType;
  suggestion: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: number;
  implementation: string;
}

export interface ModuleContribution {
  moduleName: ModuleNameType;
  contribution: string;
  impact: number;
  quality: number;
  executionTime: number;
}

// ============================================================================
// ADVANCED COORDINATION ENGINE
// ============================================================================

/**
 * Advanced Coordination Engine
 * Manages sophisticated multi-agent coordination with intelligent conflict resolution
 * and quality assurance across all 5 modules
 */
export class AdvancedCoordinationEngine {
  private moduleCapabilities: Map<ModuleNameType, ModuleCapability>;
  private executionQueue: CoordinatedTask[];
  private conflictResolver: IntelligentConflictResolver;
  private qualityAssurance: QualityAssuranceCoordinator;
  private activePlans: Map<string, CoordinationPlan>;
  private performanceHistory: CoordinatedResult[];

  constructor(
    private performanceMonitor: PerformanceMonitor,
    private userPreferences: any // WriterProfileContext
  ) {
    this.moduleCapabilities = this.initializeModuleCapabilities();
    this.executionQueue = [];
    this.conflictResolver = new IntelligentConflictResolver();
    this.qualityAssurance = new QualityAssuranceCoordinator();
    this.activePlans = new Map();
    this.performanceHistory = [];
  }

  /**
   * Initialize module capabilities for all 5 modules
   */
  private initializeModuleCapabilities(): Map<
    ModuleNameType,
    ModuleCapability
  > {
    const capabilities = new Map<ModuleNameType, ModuleCapability>();

    // Emotion Arc Module
    capabilities.set('emotionArc', {
      moduleName: 'emotionArc',
      capabilities: [
        'emotional_analysis',
        'character_development',
        'emotional_coherence',
      ],
      currentStatus: 'idle',
      performanceMetrics: {
        averageExecutionTime: 2000,
        successRate: 0.95,
        qualityScore: 0.88,
        lastOptimization: new Date(),
      },
      dependencies: [],
      estimatedWorkload: 1.0,
    });

    // Narrative Dashboard Module
    capabilities.set('narrativeDashboard', {
      moduleName: 'narrativeDashboard',
      capabilities: [
        'narrative_tracking',
        'story_structure',
        'plot_progression',
      ],
      currentStatus: 'idle',
      performanceMetrics: {
        averageExecutionTime: 1500,
        successRate: 0.92,
        qualityScore: 0.85,
        lastOptimization: new Date(),
      },
      dependencies: ['emotionArc'],
      estimatedWorkload: 1.2,
    });

    // Plot Structure Module
    capabilities.set('plotStructure', {
      moduleName: 'plotStructure',
      capabilities: [
        'plot_analysis',
        'structure_optimization',
        'conflict_mapping',
      ],
      currentStatus: 'idle',
      performanceMetrics: {
        averageExecutionTime: 3000,
        successRate: 0.89,
        qualityScore: 0.82,
        lastOptimization: new Date(),
      },
      dependencies: ['narrativeDashboard'],
      estimatedWorkload: 1.5,
    });

    // Style Profile Module
    capabilities.set('styleProfile', {
      moduleName: 'styleProfile',
      capabilities: [
        'style_analysis',
        'voice_consistency',
        'tone_optimization',
      ],
      currentStatus: 'idle',
      performanceMetrics: {
        averageExecutionTime: 1800,
        successRate: 0.94,
        qualityScore: 0.87,
        lastOptimization: new Date(),
      },
      dependencies: [],
      estimatedWorkload: 0.8,
    });

    // Theme Analysis Module
    capabilities.set('themeAnalysis', {
      moduleName: 'themeAnalysis',
      capabilities: [
        'thematic_analysis',
        'symbol_detection',
        'meaning_coherence',
      ],
      currentStatus: 'idle',
      performanceMetrics: {
        averageExecutionTime: 2500,
        successRate: 0.91,
        qualityScore: 0.84,
        lastOptimization: new Date(),
      },
      dependencies: ['emotionArc', 'plotStructure'],
      estimatedWorkload: 1.3,
    });

    return capabilities;
  }

  /**
   * Coordinate multi-module task execution with intelligent conflict resolution
   */
  async coordinateMultiModuleTask(
    writingGoal: WritingGoal,
    context: WritingContext
  ): Promise<CoordinatedResult> {
    const startTime = performance.now();

    try {
      // Record coordination start
      await this.performanceMonitor.recordOrchestrationMetrics({
        taskType: writingGoal.type,
        executionTime: 0,
        cacheHit: false,
        qualityScore: 0,
        agentsUsed: 0,
        modulesCoordinated: 0,
        timestamp: Date.now(),
        userId: context.userId,
      });

      // Intelligent task decomposition across modules
      const moduleRequirements = await this.analyzeModuleRequirements(
        writingGoal,
        context
      );
      const coordinationPlan = await this.createCoordinationPlan(
        moduleRequirements,
        writingGoal
      );

      // Execute coordinated tasks with real-time monitoring
      let moduleResults = await this.executeCoordinatedTasks(coordinationPlan);

      // Detect and resolve conflicts between module outputs
      const conflicts = await this.detectInterModuleConflicts(moduleResults);
      if (conflicts.length > 0) {
        const resolutions = await this.conflictResolver.resolveConflicts(
          conflicts,
          context
        );
        moduleResults = await this.applyConflictResolutions(
          moduleResults,
          resolutions
        );
      }

      // Quality assurance and synthesis
      const qualityValidation = await this.qualityAssurance.validateResults(
        moduleResults,
        writingGoal
      );
      const synthesizedResult = await this.synthesizeModuleOutputs(
        moduleResults,
        context
      );

      // Record coordination metrics
      const coordinationTime = performance.now() - startTime;
      await this.recordCoordinationMetrics(
        writingGoal,
        moduleResults,
        coordinationTime
      );

      const result: CoordinatedResult = {
        result: synthesizedResult,
        quality: qualityValidation,
        conflicts: conflicts.length,
        executionTime: coordinationTime,
        moduleContributions: this.analyzeModuleContributions(moduleResults),
        metadata: {
          goalId: writingGoal.id,
          modulesInvolved: Array.from(this.moduleCapabilities.keys()),
          coordinationPlanId: coordinationPlan.id,
          timestamp: new Date(),
        },
      };

      // Store result for performance analysis
      this.performanceHistory.push(result);
      if (this.performanceHistory.length > 100) {
        this.performanceHistory.shift();
      }

      return result;
    } catch (error) {
      await this.handleCoordinationError(error, writingGoal, context);
      throw error;
    }
  }

  /**
   * Analyze module requirements based on writing goal
   */
  private async analyzeModuleRequirements(
    writingGoal: WritingGoal,
    context: WritingContext
  ): Promise<Map<ModuleNameType, string[]>> {
    const requirements = new Map<ModuleNameType, string[]>();

    // Analyze emotional analysis needs
    if (writingGoal.requirements.needsEmotionalAnalysis) {
      requirements.set('emotionArc', [
        'character_emotional_state',
        'emotional_arc_progression',
        'emotional_coherence_validation',
      ]);
    }

    // Analyze narrative structure needs
    if (writingGoal.requirements.needsStructuralAnalysis) {
      requirements.set('narrativeDashboard', [
        'story_structure_analysis',
        'narrative_flow_optimization',
        'plot_point_alignment',
      ]);
      requirements.set('plotStructure', [
        'plot_structure_validation',
        'conflict_resolution_mapping',
        'story_beat_optimization',
      ]);
    }

    // Analyze style and voice needs
    if (writingGoal.requirements.needsStyleAnalysis) {
      requirements.set('styleProfile', [
        'voice_consistency_check',
        'style_coherence_analysis',
        'tone_optimization',
      ]);
    }

    // Analyze thematic elements
    if (writingGoal.requirements.needsThematicAnalysis) {
      requirements.set('themeAnalysis', [
        'thematic_coherence_validation',
        'symbol_meaning_analysis',
        'theme_conflict_detection',
      ]);
    }

    // Character development coordination
    if (writingGoal.requirements.needsCharacterDevelopment) {
      const emotionArcReqs = requirements.get('emotionArc') || [];
      emotionArcReqs.push(
        'character_arc_development',
        'character_relationship_analysis'
      );
      requirements.set('emotionArc', emotionArcReqs);
    }

    return requirements;
  }

  /**
   * Create comprehensive coordination plan
   */
  private async createCoordinationPlan(
    moduleRequirements: Map<ModuleNameType, string[]>,
    writingGoal: WritingGoal
  ): Promise<CoordinationPlan> {
    const tasks: CoordinatedTask[] = [];
    const phases: ExecutionPhase[] = [];
    const dependencies: ModuleDependency[] = [];

    // Create tasks for each module
    for (const [moduleName, requirements] of moduleRequirements) {
      const moduleCapability = this.moduleCapabilities.get(moduleName);
      if (!moduleCapability) continue;

      const task: CoordinatedTask = {
        id: `${moduleName}-${Date.now()}`,
        moduleName,
        taskType: 'analysis',
        description: `Execute ${requirements.join(', ')} for ${moduleName}`,
        dependencies: [],
        estimatedDuration: moduleCapability.estimatedWorkload * 2000,
        priority: writingGoal.priority === 'critical' ? 1 : 2,
        status: 'pending',
      };

      tasks.push(task);
    }

    // Create execution phases
    const phase1: ExecutionPhase = {
      id: 'phase-1',
      name: 'Foundation Analysis',
      type: 'parallel',
      tasks: tasks
        .filter(t => ['emotionArc', 'styleProfile'].includes(t.moduleName))
        .map(t => t.id),
      dependencies: [],
      estimatedDuration: 3000,
      criticalPath: true,
    };

    const phase2: ExecutionPhase = {
      id: 'phase-2',
      name: 'Structural Analysis',
      type: 'sequential',
      tasks: tasks
        .filter(t =>
          ['narrativeDashboard', 'plotStructure'].includes(t.moduleName)
        )
        .map(t => t.id),
      dependencies: [phase1.id],
      estimatedDuration: 4500,
      criticalPath: true,
    };

    const phase3: ExecutionPhase = {
      id: 'phase-3',
      name: 'Thematic Synthesis',
      type: 'sequential',
      tasks: tasks.filter(t => t.moduleName === 'themeAnalysis').map(t => t.id),
      dependencies: [phase2.id],
      estimatedDuration: 2500,
      criticalPath: false,
    };

    phases.push(phase1, phase2, phase3);

    // Create module dependencies
    dependencies.push(
      {
        from: 'emotionArc',
        to: 'narrativeDashboard',
        type: 'data',
        description: 'Emotional context for narrative analysis',
        critical: true,
      },
      {
        from: 'narrativeDashboard',
        to: 'plotStructure',
        type: 'result',
        description: 'Narrative structure for plot optimization',
        critical: true,
      },
      {
        from: 'emotionArc',
        to: 'themeAnalysis',
        type: 'data',
        description: 'Emotional themes for thematic analysis',
        critical: false,
      },
      {
        from: 'plotStructure',
        to: 'themeAnalysis',
        type: 'result',
        description: 'Plot structure for theme validation',
        critical: true,
      }
    );

    const plan: CoordinationPlan = {
      id: `plan-${Date.now()}`,
      goalId: writingGoal.id,
      moduleTasks: tasks,
      executionPhases: phases,
      dependencies,
      estimatedDuration: 10000,
      status: 'planning',
      metadata: {
        createdAt: new Date(),
        lastUpdated: new Date(),
        userMode: context.currentMode,
        optimizationLevel: 1,
      },
    };

    this.activePlans.set(plan.id, plan);
    return plan;
  }

  /**
   * Execute coordinated tasks according to plan
   */
  private async executeCoordinatedTasks(
    plan: CoordinationPlan
  ): Promise<any[]> {
    const results: any[] = [];

    // Execute phases sequentially
    for (const phase of plan.executionPhases) {
      if (phase.type === 'parallel') {
        // Execute parallel tasks
        const parallelResults = await Promise.all(
          phase.tasks.map(taskId => this.executeTask(taskId, plan))
        );
        results.push(...parallelResults);
      } else {
        // Execute sequential tasks
        for (const taskId of phase.tasks) {
          const result = await this.executeTask(taskId, plan);
          results.push(result);
        }
      }
    }

    return results;
  }

  /**
   * Execute individual task
   */
  private async executeTask(
    taskId: string,
    plan: CoordinationPlan
  ): Promise<any> {
    const task = plan.moduleTasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    task.status = 'executing';
    const startTime = performance.now();

    try {
      // Simulate module execution (in real implementation, this would call actual modules)
      const result = await this.simulateModuleExecution(task);

      task.status = 'completed';
      task.result = result;
      task.executionTime = performance.now() - startTime;

      return result;
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  /**
   * Simulate module execution (placeholder for actual module calls)
   */
  private async simulateModuleExecution(task: CoordinatedTask): Promise<any> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, task.estimatedDuration));

    // Return simulated result based on module type
    switch (task.moduleName) {
      case 'emotionArc':
        return {
          emotionalState: 'conflicted',
          characterArcs: ['protagonist_growth', 'antagonist_decline'],
          emotionalCoherence: 0.85,
        };
      case 'narrativeDashboard':
        return {
          storyStructure: 'three_act',
          plotPoints: ['inciting_incident', 'climax', 'resolution'],
          narrativeFlow: 0.88,
        };
      case 'plotStructure':
        return {
          plotStructure: 'hero_journey',
          conflicts: ['internal_conflict', 'external_conflict'],
          structureOptimization: 0.82,
        };
      case 'styleProfile':
        return {
          voiceConsistency: 0.9,
          styleCoherence: 0.87,
          toneOptimization: 'balanced',
        };
      case 'themeAnalysis':
        return {
          thematicCoherence: 0.84,
          symbols: ['journey', 'transformation'],
          themeConflicts: [],
        };
      default:
        return { analysis: 'completed', confidence: 0.8 };
    }
  }

  /**
   * Detect conflicts between module outputs
   */
  private async detectInterModuleConflicts(
    moduleResults: any[]
  ): Promise<any[]> {
    const conflicts: any[] = [];

    // Analyze emotional vs narrative conflicts
    const emotionResult = moduleResults.find(r => r.emotionalState);
    const narrativeResult = moduleResults.find(r => r.storyStructure);

    if (emotionResult && narrativeResult) {
      if (
        emotionResult.emotionalState === 'conflicted' &&
        narrativeResult.narrativeFlow < 0.8
      ) {
        conflicts.push({
          type: 'emotional_narrative_mismatch',
          severity: 'medium',
          description: "Emotional conflict doesn't align with narrative flow",
          modules: ['emotionArc', 'narrativeDashboard'],
        });
      }
    }

    // Analyze plot vs theme conflicts
    const plotResult = moduleResults.find(r => r.plotStructure);
    const themeResult = moduleResults.find(r => r.thematicCoherence);

    if (plotResult && themeResult) {
      if (
        plotResult.structureOptimization < 0.8 &&
        themeResult.thematicCoherence < 0.8
      ) {
        conflicts.push({
          type: 'plot_theme_inconsistency',
          severity: 'high',
          description: 'Plot structure and thematic elements are misaligned',
          modules: ['plotStructure', 'themeAnalysis'],
        });
      }
    }

    return conflicts;
  }

  /**
   * Apply conflict resolutions to module results
   */
  private async applyConflictResolutions(
    moduleResults: any[],
    resolutions: any[]
  ): Promise<any[]> {
    // Apply each resolution to the affected modules
    for (const resolution of resolutions) {
      // Update module results based on resolution
      // This is a simplified implementation - in practice, you'd have more sophisticated logic
      console.log(`Applying resolution: ${resolution.type}`, resolution);
    }

    return moduleResults;
  }

  /**
   * Synthesize outputs from all modules
   */
  private async synthesizeModuleOutputs(
    moduleResults: any[],
    context: WritingContext
  ): Promise<SynthesizedOutput> {
    const insights: string[] = [];
    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    // Extract insights from each module
    for (const result of moduleResults) {
      if (result.emotionalState) {
        insights.push(`Character emotional state: ${result.emotionalState}`);
      }
      if (result.storyStructure) {
        insights.push(`Story structure: ${result.storyStructure}`);
      }
      if (result.plotStructure) {
        insights.push(`Plot structure: ${result.plotStructure}`);
      }
      if (result.voiceConsistency) {
        insights.push(`Voice consistency: ${result.voiceConsistency}`);
      }
      if (result.thematicCoherence) {
        insights.push(`Thematic coherence: ${result.thematicCoherence}`);
      }
    }

    // Generate recommendations based on results
    if (context.currentMode === 'FULLY_AUTO') {
      recommendations.push('Consider deepening emotional character arcs');
      recommendations.push('Optimize plot structure for better pacing');
      recommendations.push('Strengthen thematic consistency across scenes');
    }

    // Suggest next steps
    nextSteps.push('Review and refine character motivations');
    nextSteps.push('Strengthen plot point connections');
    nextSteps.push('Enhance thematic symbolism');

    return {
      content: {
        summary: 'Multi-module analysis completed successfully',
        details: moduleResults,
      },
      insights,
      recommendations,
      nextSteps,
      confidence: 0.85,
    };
  }

  /**
   * Analyze module contributions to final result
   */
  private analyzeModuleContributions(
    moduleResults: any[]
  ): ModuleContribution[] {
    return moduleResults.map(result => {
      let moduleName: ModuleNameType = 'emotionArc';
      let contribution = 'Analysis completed';
      let impact = 0.8;
      let quality = 0.8;
      let executionTime = 2000;

      // Determine module name and extract metrics
      if (result.emotionalState) {
        moduleName = 'emotionArc';
        contribution = 'Emotional analysis and character development';
        impact = 0.9;
        quality = result.emotionalCoherence || 0.8;
      } else if (result.storyStructure) {
        moduleName = 'narrativeDashboard';
        contribution = 'Narrative structure and flow analysis';
        impact = 0.85;
        quality = result.narrativeFlow || 0.8;
      } else if (result.plotStructure) {
        moduleName = 'plotStructure';
        contribution = 'Plot structure optimization';
        impact = 0.8;
        quality = result.structureOptimization || 0.8;
      } else if (result.voiceConsistency) {
        moduleName = 'styleProfile';
        contribution = 'Style and voice consistency';
        impact = 0.75;
        quality = result.voiceConsistency || 0.8;
      } else if (result.thematicCoherence) {
        moduleName = 'themeAnalysis';
        contribution = 'Thematic analysis and coherence';
        impact = 0.8;
        quality = result.thematicCoherence || 0.8;
      }

      return {
        moduleName,
        contribution,
        impact,
        quality,
        executionTime,
      };
    });
  }

  /**
   * Record coordination metrics for performance analysis
   */
  private async recordCoordinationMetrics(
    writingGoal: WritingGoal,
    moduleResults: any[],
    executionTime: number
  ): Promise<void> {
    const avgQuality =
      moduleResults.reduce((sum, result) => {
        const quality =
          result.emotionalCoherence ||
          result.narrativeFlow ||
          result.structureOptimization ||
          result.voiceConsistency ||
          result.thematicCoherence ||
          0.8;
        return sum + quality;
      }, 0) / moduleResults.length;

    await this.performanceMonitor.recordOrchestrationMetrics({
      taskType: writingGoal.type,
      executionTime,
      cacheHit: false,
      qualityScore: avgQuality,
      agentsUsed: moduleResults.length,
      modulesCoordinated: moduleResults.length,
      timestamp: Date.now(),
      userId: writingGoal.context.userId,
    });
  }

  /**
   * Handle coordination errors gracefully
   */
  private async handleCoordinationError(
    error: any,
    writingGoal: WritingGoal,
    context: WritingContext
  ): Promise<void> {
    console.error('Coordination error:', error);

    // Record error metrics
    await this.performanceMonitor.recordErrorMetrics({
      errorType: 'coordination_failure',
      errorMessage:
        error instanceof Error ? error.message : 'Unknown coordination error',
      context: {
        goalId: writingGoal.id,
        userMode: context.currentMode,
        modulesInvolved: Array.from(this.moduleCapabilities.keys()),
      },
      timestamp: Date.now(),
      severity: 'high',
    });

    // Update plan status if applicable
    for (const plan of this.activePlans.values()) {
      if (plan.goalId === writingGoal.id) {
        plan.status = 'failed';
        break;
      }
    }
  }

  /**
   * Get coordination performance statistics
   */
  getPerformanceStats(): {
    totalTasks: number;
    averageExecutionTime: number;
    successRate: number;
    averageQuality: number;
    recentConflicts: number;
  } {
    if (this.performanceHistory.length === 0) {
      return {
        totalTasks: 0,
        averageExecutionTime: 0,
        successRate: 0,
        averageQuality: 0,
        recentConflicts: 0,
      };
    }

    const totalTasks = this.performanceHistory.length;
    const averageExecutionTime =
      this.performanceHistory.reduce((sum, r) => sum + r.executionTime, 0) /
      totalTasks;
    const successRate =
      this.performanceHistory.filter(r => r.quality.passed).length / totalTasks;
    const averageQuality =
      this.performanceHistory.reduce(
        (sum, r) => sum + r.quality.overallScore,
        0
      ) / totalTasks;
    const recentConflicts = this.performanceHistory
      .slice(-10)
      .reduce((sum, r) => sum + r.conflicts, 0);

    return {
      totalTasks,
      averageExecutionTime,
      successRate,
      averageQuality,
      recentConflicts,
    };
  }

  /**
   * Get current module status
   */
  getModuleStatus(): Map<ModuleNameType, ModuleCapability> {
    return new Map(this.moduleCapabilities);
  }

  /**
   * Get active coordination plans
   */
  getActivePlans(): CoordinationPlan[] {
    return Array.from(this.activePlans.values());
  }
}
