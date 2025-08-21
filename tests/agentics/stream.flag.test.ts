import { describe, it, expect } from 'vitest';

describe('Agentics SSE Feature Flag Tests', () => {
  const baseUrl = 'http://localhost:8000';

  it('should return 404 when FEATURE_AGENTICS is false', async () => {
    // This test assumes the server is running with FEATURE_AGENTICS=false
    // In a real test environment, you'd set the flag before starting the server
    const response = await fetch(`${baseUrl}/api/agentics/status/NOPE/stream`, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
      },
    });

    expect(response.status).toBe(404);
  });

  it('should return 404 for any agentics status request when flag is off', async () => {
    const response = await fetch(
      `${baseUrl}/api/agentics/status/RUN_PLACEHOLDER/stream`,
      {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          'x-user-id': 'test-user',
        },
      }
    );

    expect(response.status).toBe(404);
  });

  it('should return 404 for agentics run endpoint when flag is off', async () => {
    const response = await fetch(`${baseUrl}/api/agentics/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user',
      },
      body: JSON.stringify({
        input: 'test input',
        ttlSeconds: 3600,
      }),
    });

    expect(response.status).toBe(404);
  });
});
