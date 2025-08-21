import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

// Mock the entire modules before importing the route
vi.mock('../../server/adapters/translate', () => ({
  makeDummyTranslate: vi.fn(() => ({
    translate: vi.fn().mockImplementation((items, target) =>
      Promise.resolve(
        items.map((i: any) => ({
          key: i.key,
          text: `${i.fallback} [${target}]`,
        }))
      )
    ),
  })),
  makeOpenAITranslate: vi.fn(() => ({
    translate: vi
      .fn()
      .mockRejectedValue(new Error('OpenAI translate not wired yet.')),
  })),
}));

// Mock the service
vi.mock('../../server/services/i18nService', () => ({
  performTranslation: vi.fn().mockImplementation((adapter, req) =>
    adapter.translate(req.items, req.target, {
      domain: req.domain,
      tone: req.tone,
    })
  ),
}));

// Import the route after mocking
import { makeI18nRouter } from '../../server/routes/i18n.translate';

describe('POST /api/i18n/translate — happy path (dummy)', () => {
  let app: express.Application;

  beforeEach(() => {
    process.env.FEATURE_I18N = 'true';

    app = express();
    app.use(express.json());
    app.use('/', makeI18nRouter({ provider: 'dummy' }));
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.FEATURE_I18N;
    vi.clearAllMocks();
  });

  it('returns translated items when FEATURE_I18N=true', async () => {
    const response = await request(app)
      .post('/api/i18n/translate')
      .send({
        target: 'fr',
        items: [
          { key: 'builder.generate', fallback: 'Generate' },
          { key: 'builder.export', fallback: 'Export' },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.locale).toBe('fr');
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items[0]).toHaveProperty('key', 'builder.generate');
    expect(response.body.items[0].text).toMatch(/\[fr\]$/); // dummy suffix
  });

  it('handles single item translation', async () => {
    const response = await request(app)
      .post('/api/i18n/translate')
      .send({
        target: 'es',
        items: [{ key: 'nav.home', fallback: 'Home' }],
      });

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].text).toBe('Home [es]');
  });

  it('validates required fields', async () => {
    const response = await request(app).post('/api/i18n/translate').send({}); // Missing required fields

    expect(response.status).toBe(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.error).toContain('target');
  });

  it('validates target locale', async () => {
    const response = await request(app)
      .post('/api/i18n/translate')
      .send({
        target: 'invalid',
        items: [{ key: 'test', fallback: 'Test' }],
      });

    expect(response.status).toBe(400);
    expect(response.body.ok).toBe(false);
  });
});
