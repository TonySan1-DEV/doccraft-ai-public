type RetentionStrategy = 'pg_cron' | 'internal' | 'none';

interface RetentionConfig {
  strategy: RetentionStrategy;
  days: number;
  startInternalCleanup: (days: number) => void;
  logger: { info: (msg: string) => void; warn: (msg: string) => void };
}

/**
 * Initialize monitoring retention strategy.
 * Ensures only one cleanup mechanism runs to prevent duplicate deletes.
 */
export function initMonitoringRetention(
  config: RetentionConfig
): RetentionStrategy {
  const { strategy, days, startInternalCleanup, logger } = config;

  // Disable retention if days <= 0 or strategy is 'none'
  if (days <= 0 || strategy === 'none') {
    logger.info(
      `Monitoring retention disabled: strategy=${strategy}, days=${days}`
    );
    return 'none';
  }

  if (strategy === 'pg_cron') {
    logger.info(`Using pg_cron for retention cleanup (${days} days)`);
    // pg_cron handles cleanup, don't start internal timer
    return 'pg_cron';
  }

  if (strategy === 'internal') {
    logger.info(`Starting internal retention cleanup timer (${days} days)`);
    startInternalCleanup(days);
    return 'internal';
  }

  // Fallback to none for unknown strategies
  logger.warn(`Unknown retention strategy: ${strategy}, disabling retention`);
  return 'none';
}
