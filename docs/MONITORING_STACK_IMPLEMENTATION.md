# 📊 DocCraft-AI Monitoring Stack Implementation

## Overview

This document describes the complete monitoring stack implementation for DocCraft-AI, including Prometheus metrics collection, Grafana dashboards, AlertManager notifications, and comprehensive alerting rules.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DocCraft-AI   │    │    Prometheus   │    │     Grafana     │
│   Application   │───▶│   (Metrics)     │───▶│  (Dashboards)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐             │
         │              │  AlertManager   │             │
         │              │  (Notifications)│             │
         │              └─────────────────┘             │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Node Exporter │    │   Slack/Email   │    │   Runbooks      │
│  (System Metrics)│   │  (Alerts)       │    │  (Documentation)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Components

### 1. Prometheus Metrics Collection

#### Enhanced Metrics Types

- **HTTP Metrics**: Request duration, error rates, status codes
- **AI Service Metrics**: Request counts, latency, errors, cache hit rates
- **Security Metrics**: Threat detection, threat levels
- **Business Metrics**: User engagement, feature usage, conversions
- **System Metrics**: Memory, CPU, connections
- **Custom Metrics**: Document operations, character interactions, plot analysis

#### Key Metrics

```typescript
// HTTP Performance
http_request_duration_seconds;
http_requests_total;
http_request_errors_total;

// AI Services
ai_requests_total;
ai_latency_seconds;
ai_errors_total;
ai_cache_hit_rate;

// Security
security_threats_total;
security_threat_level;

// Business
user_engagement_total;
feature_usage_total;
conversion_events_total;

// System
doccraft_memory_usage_bytes;
doccraft_cpu_usage_percent;
doccraft_active_connections;
```

### 2. Grafana Dashboards

#### Production Dashboard

The main dashboard includes:

- **System Overview**: Service status, uptime
- **Performance Metrics**: Response times, request rates
- **AI Service Monitoring**: Latency, errors, cache performance
- **Security Monitoring**: Threat levels, security events
- **Business Metrics**: User engagement, feature usage
- **Infrastructure**: Memory, CPU, connections

#### Dashboard Features

- Real-time updates (30s refresh)
- Responsive layout
- Color-coded thresholds
- Drill-down capabilities
- Export functionality

### 3. AlertManager Configuration

#### Alert Categories

- **Critical**: Service down, high error rates, SLA breaches
- **Warning**: High response times, resource usage, performance degradation
- **Info**: Business metrics, user engagement changes

#### Notification Channels

- Slack integration
- Email notifications
- PagerDuty for critical alerts
- Webhook endpoints

### 4. Prometheus Alerting Rules

#### System Alerts

```yaml
- alert: ServiceDown
  expr: up{job="doccraft-ai"} == 0
  for: 1m
  labels:
    severity: critical

- alert: HighResponseTime
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 5
  for: 2m
  labels:
    severity: warning
```

#### AI Service Alerts

```yaml
- alert: AIServiceHighLatency
  expr: histogram_quantile(0.95, rate(ai_latency_seconds_bucket[5m])) > 30
  for: 2m
  labels:
    severity: warning

- alert: LowCacheHitRate
  expr: ai_cache_hit_rate < 0.8
  for: 5m
  labels:
    severity: warning
```

#### Business Alerts

```yaml
- alert: LowUserEngagement
  expr: rate(user_engagement_total[15m]) < 0.1
  for: 10m
  labels:
    severity: warning

- alert: DocumentProcessingIssues
  expr: rate(document_operations_total{status="error"}[5m]) > 0.1
  for: 2m
  labels:
    severity: warning
```

## Implementation

### 1. Server-Side Metrics

The enhanced metrics system is implemented in `server/monitoring/metrics.ts`:

```typescript
// Track AI service requests
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

// Track AI latency
export function trackAILatency(
  service: string,
  model: string,
  operation: string
) {
  const m = initMetrics();
  if (m) {
    return m.aiLatency.startTimer({ service, model, operation });
  }
}

// Update security threat level
export function updateSecurityThreatLevel(level: number) {
  const m = initMetrics();
  if (m) {
    m.securityThreatLevel.set(Math.max(0, Math.min(1, level)));
  }
}
```

### 2. Integration Points

#### Character AI Service

```typescript
import {
  trackAIRequest,
  trackAILatency,
  trackAIError,
} from '../monitoring/metrics';

export async function processCharacterInteraction(
  characterId: string,
  message: string
) {
  // Track request
  trackAIRequest('character-ai', 'gpt-4', 'interaction');

  // Track latency
  const timer = trackAILatency('character-ai', 'gpt-4', 'interaction');

  try {
    const response = await aiService.process(message);
    timer.end();
    return response;
  } catch (error) {
    trackAIError('character-ai', 'gpt-4', 'interaction', error.type);
    throw error;
  }
}
```

#### Document Processing

```typescript
import { trackDocumentOperation } from '../monitoring/metrics';

export async function processDocument(documentId: string, operation: string) {
  try {
    const result = await documentService.process(documentId, operation);
    trackDocumentOperation(operation, 'document', 'success');
    return result;
  } catch (error) {
    trackDocumentOperation(operation, 'document', 'error');
    throw error;
  }
}
```

#### Security Monitoring

```typescript
import {
  trackSecurityThreat,
  updateSecurityThreatLevel,
} from '../monitoring/metrics';

export function detectSecurityThreat(threat: SecurityThreat) {
  trackSecurityThreat(threat.type, threat.severity, threat.source);

  // Update overall threat level
  const currentLevel = calculateThreatLevel();
  updateSecurityThreatLevel(currentLevel);
}
```

### 3. Deployment

#### Local Development

```bash
# Deploy to local minikube/docker-desktop
node scripts/deploy-monitoring.mjs local

# Port forward services
kubectl port-forward -n monitoring service/prometheus 9090:9090
kubectl port-forward -n monitoring service/grafana 3000:3000
```

#### Staging/Production

```bash
# Deploy to staging
node scripts/deploy-monitoring.mjs staging

# Deploy to production
node scripts/deploy-monitoring.mjs production
```

## Configuration

### Environment Variables

```bash
# Enable metrics collection
METRICS_ENABLED=true

# Metrics token for /metrics endpoint
METRICS_TOKEN=your-secure-token

# Monitoring configuration
MONITORING_REPORT_ENABLED=true
MONITORING_REPORT_SAMPLE=1.0
MONITORING_PERSIST_ENABLED=true
MONITORING_PERSIST_SAMPLE=0.25
MONITORING_RETENTION_DAYS=30
```

### Kubernetes Configuration

The monitoring stack is deployed using the configuration in `k8s/monitoring/monitoring-stack.yml`:

- **Prometheus**: Metrics collection and storage
- **Grafana**: Dashboard visualization
- **AlertManager**: Alert routing and notifications
- **Node Exporter**: System metrics collection

## Monitoring Best Practices

### 1. Metric Naming

- Use descriptive names with units
- Follow Prometheus naming conventions
- Include relevant labels for filtering

### 2. Alert Thresholds

- Set realistic thresholds based on SLOs
- Use different severity levels
- Include runbook URLs in alerts

### 3. Dashboard Design

- Focus on key metrics
- Use appropriate visualization types
- Include context and documentation

### 4. Performance Impact

- Sample metrics when appropriate
- Use efficient label cardinality
- Monitor monitoring overhead

## Troubleshooting

### Common Issues

1. **Metrics Not Appearing**
   - Check METRICS_ENABLED environment variable
   - Verify metrics endpoint is accessible
   - Check for metric registration errors

2. **High Cardinality**
   - Limit label values
   - Use metric filtering
   - Monitor Prometheus memory usage

3. **Alert Firing Issues**
   - Verify Prometheus rules configuration
   - Check AlertManager connectivity
   - Validate notification channel settings

### Debug Commands

```bash
# Check Prometheus targets
kubectl port-forward -n monitoring service/prometheus 9090:9090
# Then visit http://localhost:9090/targets

# Check AlertManager
kubectl port-forward -n monitoring service/alertmanager 9093:9093
# Then visit http://localhost:9093

# View Grafana logs
kubectl logs -n monitoring deployment/grafana

# Check metrics endpoint
curl -H "Authorization: Bearer $METRICS_TOKEN" http://localhost:8080/metrics
```

## Future Enhancements

### 1. Advanced Metrics

- **Distributed Tracing**: OpenTelemetry integration
- **Custom Business Metrics**: Revenue, user retention
- **ML Model Performance**: Accuracy, drift detection

### 2. Enhanced Alerting

- **Dynamic Thresholds**: ML-based anomaly detection
- **Alert Correlation**: Group related alerts
- **Escalation Policies**: Automated response workflows

### 3. Integration

- **CI/CD Metrics**: Deployment success rates
- **Cost Monitoring**: Infrastructure cost tracking
- **User Experience**: Real User Monitoring (RUM)

## Conclusion

The DocCraft-AI monitoring stack provides comprehensive visibility into application performance, AI service health, security threats, and business metrics. This implementation follows industry best practices and provides a solid foundation for production operations.

For questions or issues, refer to the runbooks linked in the alert annotations or contact the DevOps team.
