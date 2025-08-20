import client from 'prom-client';

type Metrics = {
  registry: client.Registry;
  httpDuration: client.Histogram<string>;
  httpErrors: client.Counter<string>;
  opDuration: client.Histogram<string>;
  // Enhanced metrics for complete monitoring
  aiRequests: client.Counter<string>;
  aiLatency: client.Histogram<string>;
  aiErrors: client.Counter<string>;
  aiCacheHitRate: client.Gauge<string>;
  securityThreats: client.Counter<string>;
  securityThreatLevel: client.Gauge<string>;
  userSessions: client.Gauge<string>;
  documentOperations: client.Counter<string>;
  characterInteractions: client.Counter<string>;
  plotAnalysis: client.Counter<string>;
  styleAnalysis: client.Counter<string>;
  // System metrics
  memoryUsage: client.Gauge<string>;
  cpuUsage: client.Gauge<string>;
  activeConnections: client.Gauge<string>;
  // Business metrics
  userEngagement: client.Counter<string>;
  featureUsage: client.Counter<string>;
  conversionEvents: client.Counter<string>;
};

let cached: Metrics | null = null;

export function initMetrics(): Metrics | null {
  if (cached) return cached;

  const enabled = String(process.env.METRICS_ENABLED ?? 'false') === 'true';
  if (!enabled) return null;

  const buckets = (
    process.env.METRICS_DEFAULT_BUCKETS ?? '0.025,0.05,0.1,0.25,0.5,1,2.5,5,10'
  )
    .split(',')
    .map(s => Number(s.trim()))
    .filter(n => Number.isFinite(n) && n > 0);

  const registry = new client.Registry();
  client.collectDefaultMetrics({ register: registry });

  const httpDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request latency',
    labelNames: ['method', 'route', 'status'] as const,
    buckets,
    registers: [registry],
  });

  const httpErrors = new client.Counter({
    name: 'http_request_errors_total',
    help: 'HTTP request errors by status code class',
    labelNames: ['method', 'route', 'status'] as const,
    registers: [registry],
  });

  const opDuration = new client.Histogram({
    name: 'doccraft_op_duration_seconds',
    help: 'Operation latency (db, llm, storage, etc.)',
    labelNames: ['op', 'ok'] as const,
    buckets,
    registers: [registry],
  });

  // AI-specific metrics
  const aiRequests = new client.Counter({
    name: 'ai_requests_total',
    help: 'Total AI service requests',
    labelNames: ['service', 'model', 'operation'] as const,
    registers: [registry],
  });

  const aiLatency = new client.Histogram({
    name: 'ai_latency_seconds',
    help: 'AI service response latency',
    labelNames: ['service', 'model', 'operation'] as const,
    buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30],
    registers: [registry],
  });

  const aiErrors = new client.Counter({
    name: 'ai_errors_total',
    help: 'AI service errors',
    labelNames: ['service', 'model', 'operation', 'error_type'] as const,
    registers: [registry],
  });

  const aiCacheHitRate = new client.Gauge({
    name: 'ai_cache_hit_rate',
    help: 'AI service cache hit rate (0-1)',
    labelNames: ['service'] as const,
    registers: [registry],
  });

  // Security metrics
  const securityThreats = new client.Counter({
    name: 'security_threats_total',
    help: 'Security threats detected',
    labelNames: ['threat_type', 'severity', 'source'] as const,
    registers: [registry],
  });

  const securityThreatLevel = new client.Gauge({
    name: 'security_threat_level',
    help: 'Current security threat level (0-1)',
    registers: [registry],
  });

  // User and session metrics
  const userSessions = new client.Gauge({
    name: 'user_sessions_active',
    help: 'Number of active user sessions',
    labelNames: ['tier', 'status'] as const,
    registers: [registry],
  });

  // Document and content metrics
  const documentOperations = new client.Counter({
    name: 'document_operations_total',
    help: 'Document operations performed',
    labelNames: ['operation', 'type', 'status'] as const,
    registers: [registry],
  });

  const characterInteractions = new client.Counter({
    name: 'character_interactions_total',
    help: 'Character AI interactions',
    labelNames: ['interaction_type', 'character_id', 'status'] as const,
    registers: [registry],
  });

  const plotAnalysis = new client.Counter({
    name: 'plot_analysis_total',
    help: 'Plot analysis operations',
    labelNames: ['analysis_type', 'status'] as const,
    registers: [registry],
  });

  const styleAnalysis = new client.Counter({
    name: 'style_analysis_total',
    help: 'Style analysis operations',
    labelNames: ['analysis_type', 'status'] as const,
    registers: [registry],
  });

  // System metrics
  const memoryUsage = new client.Gauge({
    name: 'doccraft_memory_usage_bytes',
    help: 'Memory usage in bytes',
    labelNames: ['type'] as const,
    registers: [registry],
  });

  const cpuUsage = new client.Gauge({
    name: 'doccraft_cpu_usage_percent',
    help: 'CPU usage percentage',
    registers: [registry],
  });

  const activeConnections = new client.Gauge({
    name: 'doccraft_active_connections',
    help: 'Number of active connections',
    labelNames: ['type'] as const,
    registers: [registry],
  });

  // Business metrics
  const userEngagement = new client.Counter({
    name: 'user_engagement_total',
    help: 'User engagement events',
    labelNames: ['event_type', 'user_tier', 'feature'] as const,
    registers: [registry],
  });

  const featureUsage = new client.Counter({
    name: 'feature_usage_total',
    help: 'Feature usage tracking',
    labelNames: ['feature', 'user_tier', 'action'] as const,
    registers: [registry],
  });

  const conversionEvents = new client.Counter({
    name: 'conversion_events_total',
    help: 'Conversion and upgrade events',
    labelNames: ['event_type', 'from_tier', 'to_tier'] as const,
    registers: [registry],
  });

  cached = {
    registry,
    httpDuration,
    httpErrors,
    opDuration,
    aiRequests,
    aiLatency,
    aiErrors,
    aiCacheHitRate,
    securityThreats,
    securityThreatLevel,
    userSessions,
    documentOperations,
    characterInteractions,
    plotAnalysis,
    styleAnalysis,
    memoryUsage,
    cpuUsage,
    activeConnections,
    userEngagement,
    featureUsage,
    conversionEvents,
  };
  return cached;
}

/** Helper to time arbitrary async operations. */
export async function instrument<T>(
  op: string,
  fn: () => Promise<T>
): Promise<T> {
  const m = initMetrics();
  if (!m) return fn();
  const end = m.opDuration.startTimer({ op });
  try {
    const result = await fn();
    end({ ok: 'true' });
    return result;
  } catch (err) {
    end({ ok: 'false' });
    throw err;
  }
}

/** Helper to track AI service metrics */
export function trackAIRequest(
  service: string,
  model: string,
  operation: string
) {
  const m = initMetrics();
  if (m) {
    m.aiRequests.inc({ service, model, operation });
  }
}

/** Helper to track AI latency */
export function trackAILatency(
  service: string,
  model: string,
  operation: string
) {
  const m = initMetrics();
  if (m) {
    return m.aiLatency.startTimer({ service, model, operation });
  }
  return { end: () => ({ service, model, operation }) };
}

/** Helper to track AI errors */
export function trackAIError(
  service: string,
  model: string,
  operation: string,
  errorType: string
) {
  const m = initMetrics();
  if (m) {
    m.aiErrors.inc({ service, model, operation, error_type: errorType });
  }
}

/** Helper to update cache hit rate */
export function updateCacheHitRate(service: string, hitRate: number) {
  const m = initMetrics();
  if (m) {
    m.aiCacheHitRate.set({ service }, Math.max(0, Math.min(1, hitRate)));
  }
}

/** Helper to track security threats */
export function trackSecurityThreat(
  threatType: string,
  severity: string,
  source: string
) {
  const m = initMetrics();
  if (m) {
    m.securityThreats.inc({ threat_type: threatType, severity, source });
  }
}

/** Helper to update security threat level */
export function updateSecurityThreatLevel(level: number) {
  const m = initMetrics();
  if (m) {
    m.securityThreatLevel.set(Math.max(0, Math.min(1, level)));
  }
}

/** Helper to track user sessions */
export function updateUserSessions(
  tier: string,
  status: string,
  count: number
) {
  const m = initMetrics();
  if (m) {
    m.userSessions.set({ tier, status }, count);
  }
}

/** Helper to track document operations */
export function trackDocumentOperation(
  operation: string,
  type: string,
  status: string
) {
  const m = initMetrics();
  if (m) {
    m.documentOperations.inc({ operation, type, status });
  }
}

/** Helper to track character interactions */
export function trackCharacterInteraction(
  interactionType: string,
  characterId: string,
  status: string
) {
  const m = initMetrics();
  if (m) {
    m.characterInteractions.inc({
      interaction_type: interactionType,
      character_id: characterId,
      status,
    });
  }
}

/** Helper to track plot analysis */
export function trackPlotAnalysis(analysisType: string, status: string) {
  const m = initMetrics();
  if (m) {
    m.plotAnalysis.inc({ analysis_type: analysisType, status });
  }
}

/** Helper to track style analysis */
export function trackStyleAnalysis(analysisType: string, status: string) {
  const m = initMetrics();
  if (m) {
    m.styleAnalysis.inc({ analysis_type: analysisType, status });
  }
}

/** Helper to track system metrics */
export function updateSystemMetrics() {
  const m = initMetrics();
  if (!m) return;

  // Memory usage
  const memUsage = process.memoryUsage();
  m.memoryUsage.set({ type: 'rss' }, memUsage.rss);
  m.memoryUsage.set({ type: 'heapTotal' }, memUsage.heapTotal);
  m.memoryUsage.set({ type: 'heapUsed' }, memUsage.heapUsed);
  m.memoryUsage.set({ type: 'external' }, memUsage.external);

  // CPU usage (simplified - in production you might want more sophisticated CPU tracking)
  const startUsage = process.cpuUsage();
  setTimeout(() => {
    const endUsage = process.cpuUsage(startUsage);
    const cpuPercent = (endUsage.user + endUsage.system) / 1000000; // Convert to seconds
    m.cpuUsage.set(cpuPercent);
  }, 100);
}

/** Helper to track user engagement */
export function trackUserEngagement(
  eventType: string,
  userTier: string,
  feature: string
) {
  const m = initMetrics();
  if (m) {
    m.userEngagement.inc({
      event_type: eventType,
      user_tier: userTier,
      feature,
    });
  }
}

/** Helper to track feature usage */
export function trackFeatureUsage(
  feature: string,
  userTier: string,
  action: string
) {
  const m = initMetrics();
  if (m) {
    m.featureUsage.inc({ feature, user_tier: userTier, action });
  }
}

/** Helper to track conversion events */
export function trackConversionEvent(
  eventType: string,
  fromTier: string,
  toTier: string
) {
  const m = initMetrics();
  if (m) {
    m.conversionEvents.inc({
      event_type: eventType,
      from_tier: fromTier,
      to_tier: toTier,
    });
  }
}
