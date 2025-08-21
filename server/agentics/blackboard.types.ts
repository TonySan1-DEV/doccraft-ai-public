export type Artifact = {
  id?: string;
  kind: string;
  label: string;
  data: unknown;
  createdAt?: string;
  expiresAt?: string;
};

export type RunStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export type ListRunsOptions = { limit?: number };
export type RunSummary = {
  id: string;
  status: RunStatus;
  createdAt: string;
  updatedAt: string;
};

export type Blackboard = {
  createRun(
    userId: string,
    initialStatus?: RunStatus,
    budget?: Record<string, unknown>
  ): Promise<{ id: string; status: RunStatus }>;
  updateRun(
    runId: string,
    userId: string,
    patch: Partial<{ status: RunStatus; budget: unknown }>
  ): Promise<void>;
  saveArtifact(
    userId: string,
    runId: string,
    artifact: Artifact,
    ttlSeconds?: number
  ): Promise<void>;
  listArtifacts(userId: string, runId: string): Promise<Artifact[]>;
  listRuns?(userId: string, opts?: ListRunsOptions): Promise<RunSummary[]>;
  cleanupExpired(): Promise<void>;
};
