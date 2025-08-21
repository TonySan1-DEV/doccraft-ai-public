import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import exportAudioRouter from '../../server/routes/export.audio';

describe('POST /api/export/audio — flags', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', exportAudioRouter);
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.FEATURE_AUDIOBOOK;
  });

  it('returns 404 when FEATURE_AUDIOBOOK is OFF', async () => {
    process.env.FEATURE_AUDIOBOOK = 'false';

    const response = await request(app)
      .post('/api/export/audio')
      .send({ text: 'hi' });

    expect(response.status).toBe(404);
  });

  it('returns 404 when FEATURE_AUDIOBOOK is undefined', async () => {
    delete process.env.FEATURE_AUDIOBOOK;

    const response = await request(app)
      .post('/api/export/audio')
      .send({ text: 'hi' });

    expect(response.status).toBe(404);
  });

  it('returns 404 when FEATURE_AUDIOBOOK is empty string', async () => {
    process.env.FEATURE_AUDIOBOOK = '';

    const response = await request(app)
      .post('/api/export/audio')
      .send({ text: 'hi' });

    expect(response.status).toBe(404);
  });
});
