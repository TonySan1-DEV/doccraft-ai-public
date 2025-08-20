const REDACT = '【redacted】';
const TOKEN_RE = /(api[_-]?key|authorization|token|secret|password|cookie)/i;

function redactValue(v: unknown): unknown {
  if (typeof v !== 'string') return v;
  // crude email & IPv4/IPv6 masks
  const maskedEmail = v.replace(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    REDACT
  );
  const maskedIp = maskedEmail
    .replace(/\b\d{1,3}(\.\d{1,3}){3}\b/g, REDACT)
    .replace(/\b([a-f0-9:]{2,}:){2,}[a-f0-9]{2,}\b/gi, REDACT)
    .replace(/::\d*/g, REDACT) // Handle ::1, ::2, ::, etc.
    .replace(/::[a-f0-9]*/g, REDACT); // Handle ::abc, ::def, etc.
  return maskedIp;
}

/** Deeply sanitize arbitrary payloads while preserving structure. */
export function sanitizeMonitorPayload(input: unknown): unknown {
  if (input === null || typeof input !== 'object') return redactValue(input);
  if (Array.isArray(input)) return input.map(sanitizeMonitorPayload);

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (TOKEN_RE.test(k)) {
      out[k] = REDACT;
      continue;
    }
    if (k === 'ip' || k === 'user_ip' || k === 'ip_address') {
      out[k] = REDACT;
      continue;
    }
    out[k] = sanitizeMonitorPayload(v);
  }
  return out;
}
