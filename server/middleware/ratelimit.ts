import rateLimit from 'express-rate-limit';
import type { RequestHandler } from 'express';

export const rlAudio: RequestHandler = rateLimit({
  windowMs: 60_000,
  limit: 30, // 30 req/min per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const rid = (req as any).rid || 'unknown';
    res.status(429).json({ error: 'rate_limited', rid });
  },
});

export const rlAgentics: RequestHandler = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const rid = (req as any).rid || 'unknown';
    res.status(429).json({ error: 'rate_limited', rid });
  },
});

// General API rate limiter for other routes
export const apiLimiter: RequestHandler = rateLimit({
  windowMs: 60_000,
  limit: 100, // 100 req/min per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const rid = (req as any).rid || 'unknown';
    res.status(429).json({ error: 'rate_limited', rid });
  },
});
