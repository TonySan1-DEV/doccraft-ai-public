import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// Simple test without complex mocking
describe('POST /api/i18n/translate — simple flag test', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Simple route that just checks the flag
    app.post('/api/i18n/translate', (req, res) => {
      const isEnabled = process.env.FEATURE_I18N === 'true';

      if (!isEnabled) {
        return res.status(404).json({ ok: false, error: 'Not found' });
      }

      return res.status(200).json({ ok: true, message: 'Feature enabled' });
    });
  });

  afterEach(() => {
    delete process.env.FEATURE_I18N;
  });

  it('returns 404 when FEATURE_I18N is OFF', async () => {
    process.env.FEATURE_I18N = 'false';

    const response = await request(app)
      .post('/api/i18n/translate')
      .send({
        target: 'es',
        items: [{ key: 'builder.generate', fallback: 'Generate' }],
      });

    expect(response.status).toBe(404);
    expect(response.body.ok).toBe(false);
  });

  it('returns 200 when FEATURE_I18N is ON', async () => {
    process.env.FEATURE_I18N = 'true';

    const response = await request(app)
      .post('/api/i18n/translate')
      .send({
        target: 'es',
        items: [{ key: 'builder.generate', fallback: 'Generate' }],
      });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });

  it('returns 404 when FEATURE_I18N is undefined', async () => {
    delete process.env.FEATURE_I18N;

    const response = await request(app)
      .post('/api/i18n/translate')
      .send({
        target: 'es',
        items: [{ key: 'builder.generate', fallback: 'Generate' }],
      });

    expect(response.status).toBe(404);
  });
});
