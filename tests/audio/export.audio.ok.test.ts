import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

// Mock the entire modules before importing the route
vi.mock('../../server/adapters/storage', () => ({
  makeSupabaseStorage: vi.fn(() => ({
    putAndSign: vi.fn().mockResolvedValue({
      objectKey: '2025/08/20/adhoc/xyz.mp3',
      signedUrl: 'https://signed.example/foo',
      expiresAt: Math.floor(Date.now() / 1000) + 60,
    }),
  })),
}));

vi.mock('../../server/adapters/tts', () => ({
  makeOpenAITTSEngine: vi.fn(() => ({
    synthesize: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    contentType: vi.fn().mockReturnValue('audio/mpeg'),
  })),
  makeDummyTTSEngine: vi.fn(() => ({
    synthesize: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    contentType: vi.fn().mockReturnValue('audio/wav'),
  })),
}));

// Mock the service
vi.mock('../../server/services/audioExportService', () => ({
  exportAudio: vi.fn().mockResolvedValue({
    ok: true,
    documentId: undefined,
    objectKey: '2025/08/20/adhoc/xyz.mp3',
    signedUrl: 'https://signed.example/foo',
    expiresAt: Math.floor(Date.now() / 1000) + 60,
  }),
}));

// Import the route after mocking
import exportAudioRouter from '../../server/routes/export.audio';

describe('POST /api/export/audio — happy path (dummy provider)', () => {
  let app: express.Application;

  beforeEach(() => {
    process.env.FEATURE_AUDIOBOOK = 'true';
    process.env.AUDIO_BUCKET_NAME = 'test-audio';
    process.env.AUDIO_SIGNED_URL_TTL_SEC = '60';

    app = express();
    app.use(express.json());
    app.use('/', exportAudioRouter);
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.FEATURE_AUDIOBOOK;
    delete process.env.AUDIO_BUCKET_NAME;
    delete process.env.AUDIO_SIGNED_URL_TTL_SEC;
    vi.clearAllMocks();
  });

  it('generates and signs audio when FEATURE_AUDIOBOOK is ON', async () => {
    const response = await request(app).post('/api/export/audio').send({
      text: 'Hello world',
      provider: 'dummy',
      format: 'mp3',
      voice: 'narrator_f',
    });

    expect(response.status).toBe(200);

    const body = response.body;
    expect(body.ok).toBe(true);
    expect(body.signedUrl).toContain('https://');
    expect(body.objectKey).toMatch(
      /^\d{4}\/\d{2}\/\d{2}\/adhoc\/[a-z0-9]+\.mp3$/
    );
    expect(body.expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('handles minimal request with defaults', async () => {
    const response = await request(app).post('/api/export/audio').send({
      text: 'Simple text',
      provider: 'dummy',
    });

    expect(response.status).toBe(200);

    const body = response.body;
    expect(body.ok).toBe(true);
    expect(body.voice).toBeUndefined(); // Should use default
    expect(body.format).toBeUndefined(); // Should use default
  });

  it('validates required fields', async () => {
    const response = await request(app).post('/api/export/audio').send({}); // Missing both text and documentId

    expect(response.status).toBe(400);

    const body = response.body;
    expect(body.ok).toBe(false);
    expect(body.error).toContain('text');
  });
});
