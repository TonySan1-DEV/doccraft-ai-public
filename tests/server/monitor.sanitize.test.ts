import { describe, it, expect } from 'vitest';
import { sanitizeMonitorPayload } from '../../server/monitoring/sanitize';

describe('sanitizeMonitorPayload', () => {
  it('redacts emails, IPs, and obvious secret fields', () => {
    const before = {
      user: { email: 'alice@example.com', name: 'Alice' },
      context: { ip: '203.0.113.42', userAgent: 'Mozilla/5.0' },
      headers: {
        Authorization: 'Bearer xyz',
        'x-api-key': 'abc123',
        cookie: 'session=abcdef',
      },
      text: 'contact me at bob@example.org',
      nested: [{ ip_address: '2001:0db8:85a3:0000:0000:8a2e:0370:7334' }],
    };

    const after = sanitizeMonitorPayload(before) as any;

    // structure preserved
    expect(after.user.name).toBe('Alice');

    // emails redacted
    expect(after.user.email).toBe('【redacted】');
    expect(after.text).not.toContain('@');

    // IPs redacted
    expect(after.context.ip).toBe('【redacted】');
    expect(after.nested[0].ip_address).toBe('【redacted】');

    // secret-ish keys redacted
    expect(after.headers.Authorization).toBe('【redacted】');
    expect(after.headers['x-api-key']).toBe('【redacted】');
    expect(after.headers.cookie).toBe('【redacted】');

    // benign fields unchanged
    expect(after.context.userAgent).toBe('Mozilla/5.0');
  });

  it('handles primitive values correctly', () => {
    expect(sanitizeMonitorPayload('test@example.com')).toBe('【redacted】');
    expect(sanitizeMonitorPayload('192.168.1.1')).toBe('【redacted】');
    expect(sanitizeMonitorPayload('normal text')).toBe('normal text');
    expect(sanitizeMonitorPayload(42)).toBe(42);
    expect(sanitizeMonitorPayload(null)).toBe(null);
    expect(sanitizeMonitorPayload(undefined)).toBe(undefined);
  });

  it('handles arrays correctly', () => {
    const before = [
      'user@example.com',
      '10.0.0.1',
      { email: 'admin@test.org', ip: '172.16.0.1' },
      'normal string',
    ];

    const after = sanitizeMonitorPayload(before) as any[];

    expect(after[0]).toBe('【redacted】');
    expect(after[1]).toBe('【redacted】');
    expect(after[2].email).toBe('【redacted】');
    expect(after[2].ip).toBe('【redacted】');
    expect(after[3]).toBe('normal string');
  });

  it('redacts various IP formats', () => {
    const testCases = [
      '192.168.1.1',
      '10.0.0.1',
      '172.16.0.1',
      '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
      '::1',
      'fe80::1ff:fe23:4567:890a',
    ];

    testCases.forEach(ip => {
      expect(sanitizeMonitorPayload(ip)).toBe('【redacted】');
    });
  });

  it('redacts various email formats', () => {
    const testCases = [
      'user@example.com',
      'admin@test.org',
      'user.name@domain.co.uk',
      'user+tag@example.net',
    ];

    testCases.forEach(email => {
      expect(sanitizeMonitorPayload(email)).toBe('【redacted】');
    });
  });

  it('preserves non-sensitive data structures', () => {
    const before = {
      metrics: { count: 42, rate: 0.5 },
      tags: ['production', 'api'],
      config: { timeout: 5000, retries: 3 },
      metadata: { version: '1.0.0', environment: 'prod' },
    };

    const after = sanitizeMonitorPayload(before) as any;

    expect(after.metrics.count).toBe(42);
    expect(after.metrics.rate).toBe(0.5);
    expect(after.tags).toEqual(['production', 'api']);
    expect(after.config.timeout).toBe(5000);
    expect(after.metadata.version).toBe('1.0.0');
  });
});
