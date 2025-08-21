import { createClient } from '@supabase/supabase-js';
import type { Artifact, Blackboard } from './blackboard.types';

type Deps = {
  supabaseUrl: string;
  serviceKey: string;
};

export function makeSupabaseBlackboard({
  supabaseUrl,
  serviceKey,
}: Deps): Blackboard {
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  return {
    async createRun(userId, initialStatus = 'queued', budget = {}) {
      const { data, error } = await supabase
        .from('agentics_runs')
        .insert({ user_id: userId, status: initialStatus, budget })
        .select('id,status,created_at,updated_at')
        .single();
      if (error) throw error;
      return { id: data.id, status: data.status };
    },

    async updateRun(runId, userId, patch) {
      const { error } = await supabase
        .from('agentics_runs')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', runId)
        .eq('user_id', userId);
      if (error) throw error;
    },

    async saveArtifact(userId, runId, artifact: Artifact, ttlSeconds?: number) {
      const expires_at = ttlSeconds
        ? new Date(Date.now() + ttlSeconds * 1000).toISOString()
        : null;
      const { error } = await supabase.from('agentics_artifacts').insert({
        run_id: runId,
        user_id: userId,
        kind: artifact.kind,
        label: artifact.label,
        data: artifact.data,
        expires_at,
      });
      if (error) throw error;
    },

    async listArtifacts(userId, runId) {
      const { data, error } = await supabase
        .from('agentics_artifacts')
        .select('id,kind,label,data,created_at,expires_at')
        .eq('run_id', runId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(row => ({
        id: row.id,
        kind: row.kind,
        label: row.label,
        data: row.data,
        createdAt: row.created_at,
        expiresAt: row.expires_at ?? undefined,
      }));
    },

    async cleanupExpired() {
      // call the SQL helper function
      const { error } = await supabase.rpc('agentics_delete_expired_artifacts');
      if (error) throw error;
    },

    async listRuns(userId: string, opts?: { limit?: number }) {
      const limit = Math.max(1, Math.min(50, Number(opts?.limit ?? 20)));
      const { data, error } = await supabase
        .from('agentics_runs')
        .select('id,status,created_at,updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map(r => ({
        id: r.id,
        status: r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    },
  };
}
