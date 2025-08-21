import React from 'react';
import { isAgenticsEnabled } from '@/config/flags';
import type { Artifact, RunId } from '@/agentics/types';

type State =
  | { status: 'idle' }
  | { status: 'running'; runId: string }
  | { status: 'completed'; runId: string; artifacts: Artifact[] }
  | { status: 'error'; error: string };

export function useAgentics() {
  if (!isAgenticsEnabled()) {
    throw new Error('Agentics is disabled by feature flag.');
  }
  const [state, setState] = React.useState<State>({ status: 'idle' });
  const abortRef = React.useRef<AbortController | null>(null);

  const start = React.useCallback(async (payload: Record<string, any> = {}) => {
    const ac = new AbortController();
    abortRef.current = ac;
    setState({ status: 'running', runId: 'pending' });
    const r = await fetch('/api/agentics/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ac.signal,
    });
    if (!r.ok) {
      setState({ status: 'error', error: `start_failed_${r.status}` });
      return;
    }
    const { runId } = (await r.json()) as { runId: RunId };
    setState({ status: 'running', runId });
    // simple poll until completed
    const poll = async () => {
      if (abortRef.current?.signal.aborted) return;
      const pr = await fetch(`/api/agentics/runs/${runId}`);
      if (!pr.ok) {
        setTimeout(poll, 900);
        return;
      }
      const pj = await pr.json();
      if (pj?.status === 'completed') {
        setState({
          status: 'completed',
          runId,
          artifacts: (pj.artifacts ?? []) as Artifact[],
        });
      } else if (pj?.status === 'failed') {
        setState({ status: 'error', error: 'run_failed' });
      } else {
        setTimeout(poll, 900);
      }
    };
    poll();
  }, []);

  const stop = React.useCallback(() => {
    abortRef.current?.abort();
    setState({ status: 'idle' });
    abortRef.current = null;
  }, []);

  return { state, start, stop };
}

export function subscribeAgentSteps(runId: string) {
  const url = new URL(
    `/api/agentics/status/${encodeURIComponent(runId)}/stream`,
    window.location.origin
  );
  return new EventSource(url.toString());
}
