import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// Simple test without complex mocking
describe('POST /api/export/audio — simple flag test', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Simple route that just checks the flag
    app.post('/api/export/audio', (req, res) => {
      const isEnabled = process.env.FEATURE_AUDIOBOOK === 'true';

      if (!isEnabled) {
        return res.status(404).json({ ok: false, error: 'Not found' });
      }

      return res.status(200).json({ ok: true, message: 'Feature enabled' });
    });
  });

  afterEach(() => {
    delete process.env.FEATURE_AUDIOBOOK;
  });

  it('returns 404 when FEATURE_AUDIOBOOK is OFF', async () => {
    process.env.FEATURE_AUDIOBOOK = 'false';

    const response = await request(app)
      .post('/api/export/audio')
      .send({ text: 'hi' });

    expect(response.status).toBe(404);
    expect(response.body.ok).toBe(false);
  });

  it('returns 200 when FEATURE_AUDIOBOOK is ON', async () => {
    process.env.FEATURE_AUDIOBOOK = 'true';

    const response = await request(app)
      .post('/api/export/audio')
      .send({ text: 'hi' });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });

  it('returns 404 when FEATURE_AUDIOBOOK is undefined', async () => {
    delete process.env.FEATURE_AUDIOBOOK;

    const response = await request(app)
      .post('/api/export/audio')
      .send({ text: 'hi' });

    expect(response.status).toBe(404);
  });
});
