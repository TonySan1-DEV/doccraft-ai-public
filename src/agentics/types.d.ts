export type AgentName = 'planner' | 'imagery' | 'audiobook' | 'safety';
export type ArtifactKind = 'plan.graph' | 'text.note' | 'image.refs' | 'audio.refs' | 'safety.report';
export interface Artifact<T = unknown> {
    id: string;
    kind: ArtifactKind;
    by: AgentName;
    data: T;
    createdAt: string;
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
    documentId: string;
    goal: string;
    enableImagery?: boolean;
    enableAudiobook?: boolean;
    enableSafety?: boolean;
    maxUSD?: number;
}
export interface RunStatus {
    runId: string;
    state: 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled';
    message?: string;
    artifacts: Artifact[];
    budget: BudgetUsage;
    startedAt?: string;
    finishedAt?: string;
}
//# sourceMappingURL=types.d.ts.map