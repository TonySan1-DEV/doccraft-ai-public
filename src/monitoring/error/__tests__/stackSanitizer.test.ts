import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sanitizeStack } from '../../error/stackSanitizer';
import { captureSafeError } from '../../error/safeError';

function boom() {
  const q = 'token=abc123XYZverylongsupersecrettoken'; // should be redacted
  throw new Error(`Bad call: https://api.example.com/endpoint?${q}`);
}

describe('stack sanitizer', () => {
  it('redacts secrets and strips query', async () => {
    try {
      boom();
    } catch (e) {
      const { message, stack } = await sanitizeStack(e);
      expect(message).not.toMatch(/abc123|supersecret/);
      expect(message).toMatch(/token=<redacted>/); // should be redacted, not removed
      expect(stack).not.toMatch(/abc123|supersecret/);
      expect(stack).not.toMatch(/\?/); // query gone
    }
  });

  it('collapses absolute paths', async () => {
    const fake = new Error('X');
    fake.stack =
      'Error: X\n    at /Users/alice/dev/app/src/file.ts:10:5\n    at file:///C:/Users/Alice/app/src/file.ts:20:10';
    const s = await sanitizeStack(fake);
    expect(s.stack).not.toMatch(/Users\/alice|C:/i);
    expect(s.stack).toMatch(/file\.ts:/);
  });

  it('captureSafeError returns payload and never leaks', async () => {
    const payload = await captureSafeError(new Error('Bearer ABC.DEF.GHI'));
    expect(payload.message).not.toMatch(/Bearer\s+[A-Za-z0-9._-]+/);
    expect(payload.stack).not.toMatch(/Bearer\s+[A-Za-z0-9._-]+/);
  });

  it('redacts various secret patterns', async () => {
    const error = new Error('API call failed');
    error.stack = `
Error: API call failed
    at https://api.example.com/endpoint?apikey=secret123&user=john
    at https://api.example.com/endpoint?authorization=Bearer token123&password=secret456
    at /Users/alice/app/src/file.ts:10:5
    at file:///C:/Users/Alice/app/src/file.ts:20:10
    `;

    const { stack } = await sanitizeStack(error);

    // Should redact secrets
    expect(stack).not.toMatch(/apikey=secret123/);
    expect(stack).not.toMatch(/password=secret456/);
    expect(stack).not.toMatch(/Bearer token123/);

    // Should strip queries
    expect(stack).not.toMatch(/\?/);

    // Should collapse paths
    expect(stack).not.toMatch(/Users\/alice/);
    expect(stack).not.toMatch(/C:/);

    // Should keep filename:line:col
    expect(stack).toMatch(/file\.ts:10:5/);
    expect(stack).toMatch(/file\.ts:20:10/);
  });

  it('handles non-Error objects gracefully', async () => {
    const { message, stack } = await sanitizeStack('String error');
    expect(message).toBe('String error');
    expect(stack).toContain('String error');
  });

  it('limits stack frames to 20', async () => {
    const error = new Error('Test');
    const longStack =
      'Error: Test\n' +
      Array.from({ length: 25 }, (_, i) => `    at frame${i}()`).join('\n');
    error.stack = longStack;

    const { stack } = await sanitizeStack(error);
    const lines = stack.split('\n');

    // Should have header + 20 frames = 21 lines
    expect(lines.length).toBe(21);
    expect(lines[0]).toContain('Test'); // Just check it contains the message
    expect(lines[1]).toContain('frame0()');
    expect(lines[20]).toContain('frame19()');
    expect(lines).not.toContain('frame20()');
  });
});
