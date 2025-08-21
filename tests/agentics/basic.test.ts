import request from 'supertest';
import express from 'express';
import { makeAgenticsRunRouter } from '../../server/routes/agentics.run';

describe('Agentics basic', () => {
  it('returns 404 when feature disabled', async () => {
    process.env.FEATURE_AGENTICS = 'false';
    const app = express()
      .use(express.json())
      .use('/api/agentics', makeAgenticsRunRouter());
    const res = await request(app)
      .post('/api/agentics/run')
      .send({ input: { foo: 'bar' } });
    expect(res.status).toBe(404);
  });

  it('returns 401 when enabled but missing user', async () => {
    process.env.FEATURE_AGENTICS = 'true';
    const app = express()
      .use(express.json())
      .use('/api/agentics', makeAgenticsRunRouter());
    const res = await request(app)
      .post('/api/agentics/run')
      .send({ input: { foo: 'bar' } });
    expect(res.status).toBe(401);
  });

  it('200 on run with user header (memory fallback if supabase not configured)', async () => {
    process.env.FEATURE_AGENTICS = 'true';
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const app = express()
      .use(express.json())
      .use('/api/agentics', makeAgenticsRunRouter());
    const res = await request(app)
      .post('/api/agentics/run')
      .set('x-user-id', 'test-user')
      .send({ input: { demo: true } });
    expect(res.status).toBe(200);
    expect(res.body.runId).toBeTruthy();
  });

  it('TTL maintenance 404 when disabled', async () => {
    process.env.FEATURE_AGENTICS = 'false';
    const app = express()
      .use(express.json())
      .use('/api/agentics', makeAgenticsRunRouter());
    const res = await request(app)
      .post('/api/agentics/maintenance/ttl')
      .send({});
    expect(res.status).toBe(404);
  });
});
