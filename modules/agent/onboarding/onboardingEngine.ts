export interface OnboardingFlow {
  id: string;
  name: string;
  description: string;
  steps: OnboardingStep[];
  currentStep: number;
  isCompleted: boolean;
  estimatedDuration: number; // in minutes
  category: 'feature' | 'workflow' | 'advanced';
  prerequisites?: string[];
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: string;
  isCompleted: boolean;
  isRequired: boolean;
  estimatedTime: number; // in minutes
  type: 'interactive' | 'demonstration' | 'reading' | 'practice';
  actions?: OnboardingAction[];
  validation?: StepValidation;
}

export interface OnboardingAction {
  id: string;
  label: string;
  type: 'button' | 'link' | 'input' | 'select';
  target?: string;
  required?: boolean;
  validation?: (value: any) => boolean;
}

export interface StepValidation {
  type: 'manual' | 'automatic' | 'hybrid';
  criteria: string[];
  autoCheck?: () => Promise<boolean>;
}

export interface UserOnboardingProgress {
  userId: string;
  completedFlows: string[];
  currentFlow?: string;
  stepProgress: Map<string, number>; // flowId -> currentStep
  preferences: OnboardingPreferences;
  lastActivity: Date;
  totalTimeSpent: number; // in minutes
}

export interface OnboardingPreferences {
  preferredPace: 'slow' | 'normal' | 'fast';
  preferredFormat: 'video' | 'text' | 'interactive';
  skipOptionalSteps: boolean;
  enableNotifications: boolean;
  autoAdvance: boolean;
}

export interface OnboardingAnalytics {
  flowId: string;
  stepId: string;
  action: 'start' | 'complete' | 'skip' | 'abandon';
  timestamp: Date;
  timeSpent?: number;
  userFeedback?: number; // 1-5 rating
  notes?: string;
}

export class OnboardingEngine {
  private flows: Map<string, OnboardingFlow> = new Map();
  private activeFlow: OnboardingFlow | null = null;
  private userProgress: Map<string, UserOnboardingProgress> = new Map();
  private analytics: OnboardingAnalytics[] = [];

  constructor() {
    this.initializeFlows();
  }

  private initializeFlows() {
    // Theme Analysis Flow
    const themeFlow: OnboardingFlow = {
      id: 'theme',
      name: 'Theme Analysis Onboarding',
      description: 'Learn to analyze and optimize themes in your narrative',
      category: 'feature',
      estimatedDuration: 15,
      steps: [
        {
          id: 'theme-step-1',
          title: 'Understanding Theme Analysis',
          description: 'Learn what theme analysis can do for your story',
          content:
            "Theme analysis helps identify the underlying messages and motifs in your narrative. It can reveal conflicts, inconsistencies, and opportunities for strengthening your story's thematic elements.",
          isCompleted: false,
          isRequired: true,
          estimatedTime: 3,
          type: 'reading',
          actions: [
            {
              id: 'understand-themes',
              label: 'I understand',
              type: 'button',
              required: true,
            },
          ],
        },
        {
          id: 'theme-step-2',
          title: 'Check for Emotional Drift',
          description:
            'Learn how to identify emotional drift in your narrative',
          content:
            'Use the Emotion Timeline Chart in the dashboard to check for emotional drift. Look for sudden changes in emotional tone that might indicate thematic inconsistencies.',
          isCompleted: false,
          isRequired: true,
          estimatedTime: 5,
          type: 'demonstration',
          actions: [
            {
              id: 'open-emotion-chart',
              label: 'Open Emotion Chart',
              type: 'button',
              target: '/dashboard/emotion-timeline',
            },
            {
              id: 'identify-drift',
              label: 'I found emotional drift',
              type: 'button',
              required: true,
            },
          ],
          validation: {
            type: 'hybrid',
            criteria: ['User opened emotion chart', 'User identified drift'],
            autoCheck: async () => {
              // This would check if user actually opened the chart
              return true; // Placeholder
            },
          },
        },
        {
          id: 'theme-step-3',
          title: 'Analyze Theme Conflicts',
          description: 'Identify and resolve theme conflicts in your story',
          content:
            'Use the Theme Analysis panel to identify conflicting themes. Look for themes that contradict each other or create confusion for readers.',
          isCompleted: false,
          isRequired: true,
          estimatedTime: 7,
          type: 'interactive',
          actions: [
            {
              id: 'open-theme-panel',
              label: 'Open Theme Analysis',
              type: 'button',
              target: '/dashboard/theme-analysis',
            },
            {
              id: 'resolve-conflict',
              label: 'I resolved a theme conflict',
              type: 'button',
              required: true,
            },
          ],
        },
      ],
      currentStep: 0,
      isCompleted: false,
    };

    // Character Development Flow
    const characterFlow: OnboardingFlow = {
      id: 'character',
      name: 'Character Development Onboarding',
      description: 'Master character creation and development tools',
      category: 'workflow',
      estimatedDuration: 20,
      prerequisites: ['theme'],
      steps: [
        {
          id: 'character-step-1',
          title: 'Character Creation Basics',
          description: 'Learn the fundamentals of character creation',
          content:
            'Start by creating detailed character profiles with personality traits, goals, and conflicts. Use the character builder to ensure well-rounded characters.',
          isCompleted: false,
          isRequired: true,
          estimatedTime: 5,
          type: 'interactive',
          actions: [
            {
              id: 'create-character',
              label: 'Create a Character',
              type: 'button',
              target: '/character-builder',
            },
          ],
        },
        {
          id: 'character-step-2',
          title: 'Character Arc Development',
          description:
            'Plan and track character development throughout your story',
          content:
            'Use the character arc tools to plan how your characters will grow and change throughout the narrative.',
          isCompleted: false,
          isRequired: true,
          estimatedTime: 8,
          type: 'demonstration',
          actions: [
            {
              id: 'plan-arc',
              label: 'Plan Character Arc',
              type: 'button',
              target: '/character-arcs',
            },
          ],
        },
        {
          id: 'character-step-3',
          title: 'Character Relationships',
          description: 'Map and develop character relationships',
          content:
            'Create relationship maps to understand how characters interact and influence each other.',
          isCompleted: false,
          isRequired: false,
          estimatedTime: 7,
          type: 'interactive',
          actions: [
            {
              id: 'create-relationship-map',
              label: 'Create Relationship Map',
              type: 'button',
              target: '/character-relationships',
            },
          ],
        },
      ],
      currentStep: 0,
      isCompleted: false,
    };

    // Plot Structure Flow
    const plotFlow: OnboardingFlow = {
      id: 'plot',
      name: 'Plot Structure Onboarding',
      description: 'Learn to structure your story effectively',
      category: 'advanced',
      estimatedDuration: 25,
      prerequisites: ['character'],
      steps: [
        {
          id: 'plot-step-1',
          title: 'Understanding Plot Frameworks',
          description: 'Learn about different plot structures',
          content:
            "Explore various plot frameworks like Three-Act Structure, Hero's Journey, and Save the Cat to find what works for your story.",
          isCompleted: false,
          isRequired: true,
          estimatedTime: 5,
          type: 'reading',
          actions: [
            {
              id: 'explore-frameworks',
              label: 'Explore Frameworks',
              type: 'button',
              target: '/plot-frameworks',
            },
          ],
        },
        {
          id: 'plot-step-2',
          title: 'Scene Organization',
          description: 'Learn to organize scenes within your plot structure',
          content:
            'Use the scene organizer to arrange your scenes according to your chosen plot framework.',
          isCompleted: false,
          isRequired: true,
          estimatedTime: 10,
          type: 'interactive',
          actions: [
            {
              id: 'organize-scenes',
              label: 'Organize Scenes',
              type: 'button',
              target: '/scene-organizer',
            },
          ],
        },
        {
          id: 'plot-step-3',
          title: 'Pacing Analysis',
          description: "Analyze and optimize your story's pacing",
          content:
            'Use pacing tools to ensure your story maintains reader engagement throughout.',
          isCompleted: false,
          isRequired: false,
          estimatedTime: 10,
          type: 'demonstration',
          actions: [
            {
              id: 'analyze-pacing',
              label: 'Analyze Pacing',
              type: 'button',
              target: '/pacing-analysis',
            },
          ],
        },
      ],
      currentStep: 0,
      isCompleted: false,
    };

    this.flows.set('theme', themeFlow);
    this.flows.set('character', characterFlow);
    this.flows.set('plot', plotFlow);
  }

  startFlow(flowId: string, userId: string): OnboardingFlow {
    const flow = this.flows.get(flowId);
    if (!flow) {
      throw new Error(`Onboarding flow '${flowId}' not found`);
    }

    // Check prerequisites
    const userProgress = this.getUserProgress(userId);
    if (flow.prerequisites) {
      const missingPrereqs = flow.prerequisites.filter(
        prereq => !userProgress.completedFlows.includes(prereq)
      );
      if (missingPrereqs.length > 0) {
        throw new Error(`Missing prerequisites: ${missingPrereqs.join(', ')}`);
      }
    }

    this.activeFlow = { ...flow };

    // Update user progress
    userProgress.currentFlow = flowId;
    userProgress.stepProgress.set(flowId, 0);
    this.userProgress.set(userId, userProgress);

    // Log analytics
    this.logAnalytics(userId, flowId, 'start', 0);

    return this.activeFlow;
  }

  getCurrentStep(_userId?: string): OnboardingStep | null {
    if (!this.activeFlow) return null;
    return this.activeFlow.steps[this.activeFlow.currentStep];
  }

  nextStep(userId?: string): OnboardingStep | null {
    if (!this.activeFlow) return null;

    if (this.activeFlow.currentStep < this.activeFlow.steps.length - 1) {
      this.activeFlow.currentStep++;

      if (userId) {
        const userProgress = this.getUserProgress(userId);
        userProgress.stepProgress.set(
          this.activeFlow.id,
          this.activeFlow.currentStep
        );
        this.userProgress.set(userId, userProgress);
      }

      return this.getCurrentStep();
    }
    return null;
  }

  completeStep(stepId: string, userId?: string): void {
    if (!this.activeFlow) return;

    const step = this.activeFlow.steps.find(s => s.id === stepId);
    if (step) {
      step.isCompleted = true;

      if (userId) {
        this.logAnalytics(
          userId,
          this.activeFlow.id,
          'complete',
          step.estimatedTime
        );
      }
    }
  }

  skipStep(stepId: string, userId?: string): void {
    if (!this.activeFlow) return;

    const step = this.activeFlow.steps.find(s => s.id === stepId);
    if (step && !step.isRequired) {
      step.isCompleted = true;

      if (userId) {
        this.logAnalytics(
          userId,
          this.activeFlow.id,
          'skip',
          step.estimatedTime
        );
      }
    }
  }

  completeFlow(flowId: string, userId: string): void {
    const flow = this.flows.get(flowId);
    if (!flow) return;

    flow.isCompleted = true;

    const userProgress = this.getUserProgress(userId);
    if (!userProgress.completedFlows.includes(flowId)) {
      userProgress.completedFlows.push(flowId);
    }
    userProgress.currentFlow = undefined;
    userProgress.stepProgress.delete(flowId);
    this.userProgress.set(userId, userProgress);

    this.logAnalytics(userId, flowId, 'complete', flow.estimatedDuration);
  }

  getFlow(flowId: string): OnboardingFlow | undefined {
    return this.flows.get(flowId);
  }

  getAllFlows(): OnboardingFlow[] {
    return Array.from(this.flows.values());
  }

  getAvailableFlows(userId: string): OnboardingFlow[] {
    const userProgress = this.getUserProgress(userId);
    return this.getAllFlows().filter(flow => {
      // Skip completed flows
      if (userProgress.completedFlows.includes(flow.id)) return false;

      // Check prerequisites
      if (flow.prerequisites) {
        return flow.prerequisites.every(prereq =>
          userProgress.completedFlows.includes(prereq)
        );
      }

      return true;
    });
  }

  getUserProgress(userId: string): UserOnboardingProgress {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, {
        userId,
        completedFlows: [],
        stepProgress: new Map(),
        preferences: {
          preferredPace: 'normal',
          preferredFormat: 'interactive',
          skipOptionalSteps: false,
          enableNotifications: true,
          autoAdvance: false,
        },
        lastActivity: new Date(),
        totalTimeSpent: 0,
      });
    }
    return this.userProgress.get(userId)!;
  }

  updateUserPreferences(
    userId: string,
    preferences: Partial<OnboardingPreferences>
  ): void {
    const userProgress = this.getUserProgress(userId);
    userProgress.preferences = { ...userProgress.preferences, ...preferences };
    userProgress.lastActivity = new Date();
    this.userProgress.set(userId, userProgress);
  }

  getProgressSummary(userId: string): {
    completedFlows: number;
    totalFlows: number;
    currentFlow?: string;
    timeSpent: number;
    completionRate: number;
  } {
    const userProgress = this.getUserProgress(userId);
    const totalFlows = this.getAllFlows().length;

    return {
      completedFlows: userProgress.completedFlows.length,
      totalFlows,
      currentFlow: userProgress.currentFlow,
      timeSpent: userProgress.totalTimeSpent,
      completionRate: (userProgress.completedFlows.length / totalFlows) * 100,
    };
  }

  private logAnalytics(
    userId: string,
    flowId: string,
    action: OnboardingAnalytics['action'],
    timeSpent?: number
  ): void {
    const analytics: OnboardingAnalytics = {
      flowId,
      stepId: this.activeFlow?.steps[this.activeFlow.currentStep]?.id || '',
      action,
      timestamp: new Date(),
      timeSpent,
    };

    this.analytics.push(analytics);

    // Update user progress
    const userProgress = this.getUserProgress(userId);
    userProgress.lastActivity = new Date();
    if (timeSpent) {
      userProgress.totalTimeSpent += timeSpent;
    }
    this.userProgress.set(userId, userProgress);
  }

  getAnalytics(userId?: string): OnboardingAnalytics[] {
    if (userId) {
      return this.analytics.filter(a => a.flowId === this.activeFlow?.id);
    }
    return this.analytics;
  }

  resetUserProgress(userId: string): void {
    this.userProgress.delete(userId);
  }
}

// Export a singleton instance
export const onboardingEngine = new OnboardingEngine();
