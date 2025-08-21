import { describe, it, expect } from 'vitest';

describe('Audio Export Guards Tests (Feature ON)', () => {
  const baseUrl = 'http://localhost:8000';

  it('should return 401 without user authentication', async () => {
    // This test assumes the server is running with FEATURE_AUDIOBOOK=true
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

    expect(response.status).toBe(401);
    const error = await response.json();
    expect(error.error).toBe('missing user');
  });

  it('should return 400 for invalid payload (empty text)', async () => {
    const response = await fetch(`${baseUrl}/api/export/audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user',
      },
      body: JSON.stringify({
        text: '',
        provider: 'openai',
        format: 'mp3',
        voice: 'narrator_f',
      }),
    });

    expect(response.status).toBe(400);
    const error = await response.json();
    expect(error.error).toBe('invalid payload');
  });

  it('should return 400 for invalid payload (text too long)', async () => {
    const longText = 'a'.repeat(21000); // Exceeds AUDIO_MAX_TEXT
    const response = await fetch(`${baseUrl}/api/export/audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user',
      },
      body: JSON.stringify({
        text: longText,
        provider: 'openai',
        format: 'mp3',
        voice: 'narrator_f',
      }),
    });

    expect(response.status).toBe(413);
    const error = await response.json();
    expect(error.error).toBe('text too large');
  });

  it('should return 400 for invalid speed value', async () => {
    const response = await fetch(`${baseUrl}/api/export/audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user',
      },
      body: JSON.stringify({
        text: 'hello world',
        provider: 'openai',
        format: 'mp3',
        voice: 'narrator_f',
        speed: 3.0, // Exceeds max speed
      }),
    });

    expect(response.status).toBe(400);
    const error = await response.json();
    expect(error.error).toBe('invalid payload');
  });
});
