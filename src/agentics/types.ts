export type AgentName = 'planner' | 'imagery' | 'audiobook' | 'safety';

export type ArtifactKind =
  | 'plan.graph'
  | 'text.note'
  | 'image.refs'
  | 'audio.refs'
  | 'safety.report';

export interface Artifact<T = unknown> {
  id?: string;
  kind: ArtifactKind;
  by?: AgentName;
  data: T;
  createdAt: number | string;
}

export interface BudgetUsage {
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
}

export interface BudgetCap {
  maxUSD: number;
  hardStop: boolean;
}

export interface RunRequest {
  runId?: string;
  documentId?: string;
  goal?: string;
  topic?: string;
  // feature toggles influence planner output
  enableImagery?: boolean;
  enableAudiobook?: boolean;
  enableSafety?: boolean;
  maxUSD?: number;
}

export type RunId = string;
export type RunStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'unknown';

export type AgentStepEvent =
  | { type: 'start'; runId: string; agent: string; ts: string }
  | { type: 'log'; runId: string; agent: string; message: string; ts: string }
  | {
      type: 'artifact';
      runId: string;
      agent: string;
      kind: ArtifactKind;
      id?: string;
      ts: string;
    }
  | { type: 'done'; runId: string; agent: string; ts: string }
  | {
      type: 'error';
      runId: string;
      agent: string;
      message: string;
      ts: string;
    };

export interface RunStatusResponse {
  runId: string;
  state: 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled';
  message?: string;
  artifacts: Artifact[];
  budget: BudgetUsage;
  startedAt?: string;
  finishedAt?: string;
}
