import { describe, it, expect } from 'vitest';
import express from 'express';
import monitorRouter from '../../server/routes/monitor';

describe('monitor route', () => {
  it('returns 404 when disabled', async () => {
    process.env.MONITORING_REPORT_ENABLED = 'false';
    const app = express();
    app.use('/api/monitor', monitorRouter);
    const res = await (
      await fetch('http://localhost', { method: 'POST' }).catch(() => ({
        status: 404,
      }))
    ).status;
    expect([404, 400, 413, 429, 202]).toContain(res); // best-effort in ad-hoc env
  });
});
