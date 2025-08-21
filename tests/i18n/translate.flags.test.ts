import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { makeI18nRouter } from '../../server/routes/i18n.translate';

describe('POST /api/i18n/translate — flags', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', makeI18nRouter());
  });

  afterEach(() => {
    // Clean up environment variables
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

  it('returns 404 when FEATURE_I18N is empty string', async () => {
    process.env.FEATURE_I18N = '';

    const response = await request(app)
      .post('/api/i18n/translate')
      .send({
        target: 'es',
        items: [{ key: 'builder.generate', fallback: 'Generate' }],
      });

    expect(response.status).toBe(404);
  });
});
