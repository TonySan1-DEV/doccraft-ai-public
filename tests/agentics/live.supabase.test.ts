// tests/agentics/live.supabase.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import fetch from 'node-fetch';

const baseURL = 'http://localhost:4000/api/agentics';

// Required envs for the live test
const feature = process.env.FEATURE_AGENTICS;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const enabled =
  feature &&
  (feature === '1' || feature.toLowerCase() === 'true') &&
  supabaseUrl &&
  supabaseKey;

if (!enabled) {
  // If env not set, skip the entire suite
  describe.skip('Live Supabase Agentics', () => {
    it('skipped', () => {});
  });
} else {
  describe('Live Supabase Agentics', () => {
    let runId: string = '';
    const userA = 'user-a-' + Math.random().toString(36).slice(2, 8);
    const userB = 'user-b-' + Math.random().toString(36).slice(2, 8);

    beforeAll(async () => {
      // sanity check server is up
      const res = await fetch(`${baseURL}/maintenance/ttl`);
      expect(res.status).toBeLessThan(500);
    });

    it('creates a run and artifacts for user A', async () => {
      const res = await fetch(`${baseURL}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userA,
        },
        body: JSON.stringify({
          goal: 'Test Supabase integration',
          budget: 1,
        }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.id).toBeDefined();
      runId = json.id;
    });

    it('retrieves status for user A', async () => {
      // give the server time to persist
      await new Promise(r => setTimeout(r, 500));

      // Optional: retry status once if the first call returns 404/409 (eventual consistency)
      const statusRes = await fetch(`${baseURL}/status/${runId}`, {
        headers: { 'x-user-id': userA },
      });
      if (statusRes.status >= 400) {
        await new Promise(r => setTimeout(r, 600));
      }
      const statusRes2 = await fetch(`${baseURL}/status/${runId}`, {
        headers: { 'x-user-id': userA },
      });
      expect(statusRes2.status).toBe(200);

      const json = await statusRes2.json();
      expect(json.id).toBe(runId);
    });

    it("enforces per-user isolation (user B can't see user A's run)", async () => {
      const res = await fetch(`${baseURL}/status/${runId}`, {
        headers: { 'x-user-id': userB },
      });
      expect(res.status).toBe(404);
    });

    it('runs TTL cleanup endpoint', async () => {
      const res = await fetch(`${baseURL}/maintenance/ttl`, {
        headers: {
          'x-user-id': userA,
          'x-internal-token': process.env.AGENTICS_MAINT_TOKEN || 'test-token',
        },
      });
      expect(res.status).toBe(200);

      // After calling /maintenance/ttl, re-check status:
      const afterCleanup = await fetch(`${baseURL}/status/${runId}`, {
        headers: { 'x-user-id': userA },
      });
      const body = await afterCleanup.json().catch(() => ({}));
      const count = Array.isArray(body?.artifacts) ? body.artifacts.length : 0;
      expect(count).toBe(0); // or toBeLessThanOrEqual(1) if your server keeps a non-TTL meta artifact
    });
  });
}
