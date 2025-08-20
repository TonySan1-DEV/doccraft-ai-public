import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initMonitoringRetention } from '../../server/monitoring/initRetention';

describe('initMonitoringRetention', () => {
  let startInternalCleanup: (days: number) => void;
  let logger: any;

  beforeEach(() => {
    startInternalCleanup = vi.fn();
    logger = { info: vi.fn(), warn: vi.fn() };
  });

  it('pg_cron: does not start internal timer', () => {
    const mode = initMonitoringRetention({
      strategy: 'pg_cron',
      days: 7,
      startInternalCleanup,
      logger,
    });
    expect(mode).toBe('pg_cron');
    expect(startInternalCleanup).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      'Using pg_cron for retention cleanup (7 days)'
    );
  });

  it('internal: starts internal timer exactly once', () => {
    const mode = initMonitoringRetention({
      strategy: 'internal',
      days: 3,
      startInternalCleanup,
      logger,
    });
    expect(mode).toBe('internal');
    expect(startInternalCleanup).toHaveBeenCalledTimes(1);
    expect(startInternalCleanup).toHaveBeenCalledWith(3);
    expect(logger.info).toHaveBeenCalledWith(
      'Starting internal retention cleanup timer (3 days)'
    );
  });

  it('days<=0: disables retention', () => {
    const mode = initMonitoringRetention({
      strategy: 'internal',
      days: 0,
      startInternalCleanup,
      logger,
    });
    expect(mode).toBe('none');
    expect(startInternalCleanup).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      'Monitoring retention disabled: strategy=internal, days=0'
    );
  });

  it('none: disables retention', () => {
    const mode = initMonitoringRetention({
      strategy: 'none',
      days: 7,
      startInternalCleanup,
      logger,
    });
    expect(mode).toBe('none');
    expect(startInternalCleanup).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      'Monitoring retention disabled: strategy=none, days=7'
    );
  });

  it('negative days: disables retention', () => {
    const mode = initMonitoringRetention({
      strategy: 'internal',
      days: -1,
      startInternalCleanup,
      logger,
    });
    expect(mode).toBe('none');
    expect(startInternalCleanup).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      'Monitoring retention disabled: strategy=internal, days=-1'
    );
  });

  it('unknown strategy: disables retention with warning', () => {
    const mode = initMonitoringRetention({
      strategy: 'unknown' as any,
      days: 7,
      startInternalCleanup,
      logger,
    });
    expect(mode).toBe('none');
    expect(startInternalCleanup).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      'Unknown retention strategy: unknown, disabling retention'
    );
  });

  it('handles edge case of zero days with pg_cron', () => {
    const mode = initMonitoringRetention({
      strategy: 'pg_cron',
      days: 0,
      startInternalCleanup,
      logger,
    });
    expect(mode).toBe('none');
    expect(startInternalCleanup).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      'Monitoring retention disabled: strategy=pg_cron, days=0'
    );
  });
});
