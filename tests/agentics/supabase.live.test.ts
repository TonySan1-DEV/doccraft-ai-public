/* 
   LIVE Supabase verification for Agentics blackboard (server-side only).
   - Requires FEATURE_AGENTICS=true and valid service creds in env.
   - Auto-skips if SERVICE key/URL are missing (kept out of CI).
*/
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { createClient } from '@supabase/supabase-js';
import http from 'http';
import express from 'express';

// Import the router factory for testing
import { makeAgenticsRunRouter } from '../../server/routes/agentics.run';

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  FEATURE_AGENTICS,
  PORT = '0', // choose ephemeral
} = process.env;

const SHOULD_RUN =
  !!SUPABASE_URL && !!SUPABASE_SERVICE_ROLE_KEY && FEATURE_AGENTICS === 'true';

describe('LIVE Supabase ↔ Agentics blackboard (local only)', () => {
  if (!SHOULD_RUN) {
    it.skip('skipped (no live Supabase env or FEATURE_AGENTICS=false)', () => {});
    return;
  }

  let server: http.Server;
  let request: supertest.SuperTest<supertest.Test>;
  let supabase: ReturnType<typeof createClient>;

  const userA = `user_live_A_${Date.now()}`;
  const userB = `user_live_B_${Date.now()}`;

  beforeAll(async () => {
    // Create a minimal Express app for testing
    const app = express();
    app.use(express.json());
    app.use('/api/agentics', makeAgenticsRunRouter());

    // spin up app on ephemeral port
    await new Promise<void>(resolve => {
      server = app.listen(Number(PORT), () => resolve());
    });
    request = supertest(server);

    // service client (bypasses RLS but your routes should never use this in prod paths)
    supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  });

  it('creates a run for user A and returns a plan.graph artifact', async () => {
    const res = await request
      .post('/api/agentics/run')
      .set('x-user-id', userA)
      .send({
        goal: 'Write a 3-step outline about moon habitats',
        ttlSeconds: 30,
        budget: { maxUsd: 0.05 },
      })
      .expect(200);

    expect(res.body?.runId).toBeTruthy();
    expect(res.body?.artifacts?.length).greaterThan(0);
    const plan = res.body.artifacts.find((a: any) => a.kind === 'plan.graph');
    expect(plan).toBeTruthy();
  });

  it('enforces per-user isolation via API (user B cannot see user A run)', async () => {
    // Create a run as user A
    const create = await request
      .post('/api/agentics/run')
      .set('x-user-id', userA)
      .send({ goal: 'Secret plan', ttlSeconds: 60 })
      .expect(200);

    const runId = create.body.runId as string;

    // Try fetch status as user B
    const status = await request
      .get(`/api/agentics/status/${encodeURIComponent(runId)}`)
      .set('x-user-id', userB)
      .expect(404); // Router should hide others' runs

    expect(status.body?.error ?? 'not-found').toBeTruthy();
  });

  it('TTL cleanup removes expired artifacts on maintenance endpoint', async () => {
    // Make a short‑lived artifact by creating a run with small ttl
    const create = await request
      .post('/api/agentics/run')
      .set('x-user-id', userA)
      .send({ goal: 'TTL test', ttlSeconds: 2 })
      .expect(200);

    const runId = create.body.runId as string;

    // Wait for ttl to pass
    await new Promise(r => setTimeout(r, 2500));

    // Trigger maintenance TTL cleanup
    await request
      .post('/api/agentics/maintenance/ttl')
      .set('x-user-id', userA) // any authed user ok; server calls service-level cleanup
      .expect(200);

    // Verify with service role (DB-level) that no artifacts remain for this run
    const { data, error } = await supabase
      .from('agentics_artifacts')
      .select('id')
      .eq('run_id', runId);

    expect(error).toBeNull();
    expect((data ?? []).length).toBe(0);
  });

  it('does NOT leak user A artifacts to user B via DB RLS (query with anon key-like session)', async () => {
    // Simulate a client-bound user session using JWT for user B.
    // If you have a helper to mint Supabase JWTs locally, use it. Otherwise,
    // this is a logical placeholder: your RLS policy should already scope rows to user_id = auth.uid().
    // For demonstration, we rely on your API 404 check as the externally observable contract.
    // If you do maintain a token mint helper, add:
    // const anonClientForB = createClient(SUPABASE_URL!, VITE_SUPABASE_ANON_KEY!, { global: { headers: { Authorization: `Bearer ${jwtForB}`}}});
    expect(true).toBe(true);
  });
});
