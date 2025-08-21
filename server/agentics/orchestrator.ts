import { makeMemoryBlackboard } from './blackboard.memory';
import { makeSupabaseBlackboard } from './blackboard.supabase';
import type { Blackboard } from './blackboard.types';

export type OrchestratorDeps = {
  planner: (args: { userId: string; input: any }) => Promise<{ plan: any }>;
  blackboard?: Blackboard;
  featureAgentics: boolean;
  env?: {
    SUPABASE_URL?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
  };
};

export type RunAgenticsArgs = {
  userId: string;
  goal: string;
  ttlSeconds?: number;
  budget?: { maxUsd?: number };
  onEvent?: (evt: import('../../src/agentics/types').AgentStepEvent) => void;
};

export function makeOrchestrator(deps: OrchestratorDeps) {
  const { planner, featureAgentics, env = {} } = deps;

  const blackboard: Blackboard =
    deps.blackboard ??
    (featureAgentics && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
      ? makeSupabaseBlackboard({
          supabaseUrl: env.SUPABASE_URL,
          serviceKey: env.SUPABASE_SERVICE_ROLE_KEY,
        })
      : makeMemoryBlackboard());

  return {
    async run({
      userId,
      input,
      onEvent,
    }: {
      userId: string;
      input: any;
      onEvent?: (
        evt: import('../../src/agentics/types').AgentStepEvent
      ) => void;
    }) {
      const { plan } = await deps.planner({ userId, input });
      // create run
      const run = await blackboard.createRun(userId, 'queued', { capUsd: 0.5 });

      onEvent?.({
        type: 'start',
        runId: run.id,
        agent: 'planner',
        ts: new Date().toISOString(),
      });

      await blackboard.updateRun(run.id, userId, { status: 'running' });
      // persist plan as artifact with TTL (24h)
      await blackboard.saveArtifact(
        userId,
        run.id,
        {
          kind: 'plan.graph',
          label: 'planner-output',
          data: plan,
        },
        /* ttlSeconds= */ 60 * 60 * 24
      );

      onEvent?.({
        type: 'artifact',
        runId: run.id,
        agent: 'planner',
        kind: 'plan.graph',
        ts: new Date().toISOString(),
      });
      onEvent?.({
        type: 'done',
        runId: run.id,
        agent: 'planner',
        ts: new Date().toISOString(),
      });

      await blackboard.updateRun(run.id, userId, { status: 'succeeded' });
      return { runId: run.id };
    },
    // expose a maintenance helper for TTL cleanup (used by route below)
    async cleanupTTLs() {
      await blackboard.cleanupExpired();
    },
  };
}
