import type { Blackboard } from './blackboard.types';

export function makeMemoryBlackboard(): Blackboard {
  const artifacts = new Map<string, any[]>();
  const runs = new Map<string, { id: string; status: string; budget: any }>();

  return {
    async createRun(userId, initialStatus = 'queued', budget = {}) {
      const id = crypto.randomUUID();
      runs.set(id, { id, status: initialStatus, budget });
      return { id, status: initialStatus };
    },

    async updateRun(runId, userId, patch) {
      const run = runs.get(runId);
      if (run) {
        Object.assign(run, patch);
      }
    },

    async saveArtifact(userId, runId, artifact, ttlSeconds?) {
      const list = artifacts.get(runId) ?? [];
      list.push({
        ...artifact,
        id: artifact.id ?? crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        expiresAt: ttlSeconds
          ? new Date(Date.now() + ttlSeconds * 1000).toISOString()
          : undefined,
      });
      artifacts.set(runId, list);
    },

    async listArtifacts(userId, runId) {
      const list = artifacts.get(runId) ?? [];
      // Filter out expired artifacts
      const now = new Date();
      return list.filter(
        artifact => !artifact.expiresAt || new Date(artifact.expiresAt) > now
      );
    },

    async cleanupExpired() {
      const now = new Date();
      for (const [runId, list] of artifacts.entries()) {
        const filtered = list.filter(
          artifact => !artifact.expiresAt || new Date(artifact.expiresAt) > now
        );
        artifacts.set(runId, filtered);
      }
    },
  };
}
