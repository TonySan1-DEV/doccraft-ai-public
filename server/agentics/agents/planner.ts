import { BaseAgent } from './base';
import type { RunRequest } from '../../../src/agentics/types';

export function makePlanner() {
  return async function planner({
    userId,
    input,
  }: {
    userId: string;
    input: any;
  }) {
    // Simple planner that just echoes the input for now
    return {
      plan: {
        userId,
        input,
        steps: [
          { id: 'plan', title: 'Plan doc', done: true },
          { id: 'draft', title: 'Draft main body', done: false },
        ],
        createdAt: new Date().toISOString(),
      },
    };
  };
}
