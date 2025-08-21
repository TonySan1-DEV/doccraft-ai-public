import { describe, it, expect } from 'vitest';

describe('Audio TTS Feature Flag Tests', () => {
  const baseUrl = 'http://localhost:8000';

  it('should return 404 when FEATURE_AUDIOBOOK is false', async () => {
    // This test assumes the server is running with FEATURE_AUDIOBOOK=false
    // In a real test environment, you'd set the flag before starting the server
    const response = await fetch(`${baseUrl}/api/export/audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'hello world',
        provider: 'openai',
        format: 'mp3',
        voice: 'narrator_f',
      }),
    });

    expect(response.status).toBe(404);
  });

  it('should return 404 for any audio export request when flag is off', async () => {
    const response = await fetch(`${baseUrl}/api/export/audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user',
      },
      body: JSON.stringify({
        text: 'test text',
        provider: 'openai',
        format: 'wav',
        voice: 'narrator_m',
      }),
    });

    expect(response.status).toBe(404);
  });
});
