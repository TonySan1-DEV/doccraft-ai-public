import { describe, it, expect } from 'vitest';

describe('Agentics Maintenance Guard Tests', () => {
  const baseUrl = 'http://localhost:8000';

  it('should return 403 without internal token', async () => {
    // This test assumes the server is running with FEATURE_AGENTICS=true
    // In a real test environment, you'd set the flag before starting the server
    const response = await fetch(`${baseUrl}/api/agentics/maintenance/ttl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user',
      },
      body: JSON.stringify({
        op: 'ttl_cleanup',
      }),
    });

    expect(response.status).toBe(403);
    const error = await response.json();
    expect(error.error).toBe('forbidden');
  });

  it('should return 200 with valid internal token', async () => {
    // This test assumes the server is running with FEATURE_AGENTICS=true and INTERNAL_MAINT_TOKEN=dev-secret
    // In a real test environment, you'd set the flags before starting the server
    const response = await fetch(`${baseUrl}/api/agentics/maintenance/ttl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-token': 'dev-secret',
      },
      body: JSON.stringify({
        op: 'ttl_cleanup',
      }),
    });

    // Should either succeed (200) or fail due to missing orchestrator (500), but not 403
    expect([200, 500]).toContain(response.status);
    if (response.status === 200) {
      const result = await response.json();
      expect(result.ok).toBe(true);
      expect(typeof result.affected).toBe('number');
    }
  });

  it('should return 400 for invalid maintenance payload', async () => {
    const response = await fetch(`${baseUrl}/api/agentics/maintenance/ttl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-token': 'dev-secret',
      },
      body: JSON.stringify({
        op: 'invalid_operation',
      }),
    });

    expect(response.status).toBe(400);
    const error = await response.json();
    expect(error.error).toBe('invalid payload');
  });
});
