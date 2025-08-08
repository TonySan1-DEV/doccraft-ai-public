/** TEMP STUB — replace with real implementation */

export interface OnboardingFlow {
  id: string;
  name: string;
  steps: OnboardingStep[];
  currentStep: number;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: string;
  isCompleted: boolean;
}

export class OnboardingEngine {
  private flows: Map<string, OnboardingFlow> = new Map();
  private activeFlow: OnboardingFlow | null = null;

  constructor() {
    this.initializeFlows();
  }

  private initializeFlows() {
    // Initialize default flows
    const themeFlow: OnboardingFlow = {
      id: 'theme',
      name: 'Theme Analysis Onboarding',
      steps: [
        {
          id: 'theme-step-1',
          title: 'Check for Emotional Drift',
          description:
            'Learn how to identify emotional drift in your narrative',
          content:
            'Use the Emotion Timeline Chart in the dashboard to check for emotional drift.',
          isCompleted: false,
        },
        {
          id: 'theme-step-2',
          title: 'Analyze Theme Conflicts',
          description: 'Identify and resolve theme conflicts in your story',
          content:
            'Use the Theme Analysis panel to identify conflicting themes.',
          isCompleted: false,
        },
      ],
      currentStep: 0,
    };

    this.flows.set('theme', themeFlow);
  }

  startFlow(flowId: string): OnboardingFlow {
    const flow = this.flows.get(flowId);
    if (!flow) {
      throw new Error(`Onboarding flow '${flowId}' not found`);
    }

    this.activeFlow = { ...flow };
    return this.activeFlow;
  }

  getCurrentStep(): OnboardingStep | null {
    if (!this.activeFlow) return null;
    return this.activeFlow.steps[this.activeFlow.currentStep];
  }

  nextStep(): OnboardingStep | null {
    if (!this.activeFlow) return null;

    if (this.activeFlow.currentStep < this.activeFlow.steps.length - 1) {
      this.activeFlow.currentStep++;
      return this.getCurrentStep();
    }
    return null;
  }

  completeStep(stepId: string): void {
    if (!this.activeFlow) return;

    const step = this.activeFlow.steps.find(s => s.id === stepId);
    if (step) {
      step.isCompleted = true;
    }
  }

  getFlow(flowId: string): OnboardingFlow | undefined {
    return this.flows.get(flowId);
  }

  getAllFlows(): OnboardingFlow[] {
    return Array.from(this.flows.values());
  }
}

// Export a singleton instance
export const onboardingEngine = new OnboardingEngine();
