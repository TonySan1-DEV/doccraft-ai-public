# DocCraft-AI Release Readiness Status

This document tracks the readiness gates for DocCraft-AI releases and provides guidance on running local validation checks.

## 🚀 Release Readiness Gates

### 1. MCP Validation

- **Purpose**: Validates Model Context Protocol schema and version compatibility
- **Script**: `pnpm run mcp:validate`
- **Artifact**: `.artifacts/mcp-validate.json`
- **Status**: ✅ PASS

### 2. Prompts Package Tests

- **Purpose**: Ensures prompt templates and management systems work correctly
- **Script**: `pnpm run test:prompts`
- **Artifact**: `.artifacts/release/test.prompts.log`
- **Status**: ✅ PASS

### 3. Agents Smoke Suite

- **Purpose**: Validates core agent functionality and execution plans
- **Script**: `pnpm run test:agents`
- **Artifact**: `.artifacts/release/test.agents.log`
- **Status**: ✅ PASS

### 4. K8s Staging Overlay

- **Purpose**: Validates Kubernetes deployment configuration for staging
- **Validation**: `kubeconform` (requires Docker)
- **File**: `k8s/staging/doccraft-ai-staging.yml`
- **Status**: ✅ PRESENT (requires Docker for validation)

### 5. Staging Rollout Workflow

- **Purpose**: GitHub Actions workflow for automated staging deployments
- **File**: `.github/workflows/staging-rollout.yml`
- **Status**: ✅ PRESENT

### 6. Performance Monitor

- **Purpose**: Lazy-loaded performance monitoring with sourcemap-safe error handling
- **Files**:
  - `src/monitoring/bootPerformanceMonitor.ts`
  - `src/monitoring/error/stackSanitizer.ts`
  - `src/monitoring/error/safeError.ts`
- **Status**: ✅ PRESENT

### 7. Telemetry Route

- **Purpose**: Server-side error monitoring endpoint
- **File**: `server/routes/monitor.ts`
- **Status**: ✅ PRESENT

### 8. Supabase Persistence

- **Purpose**: Database persistence for monitoring data with retention policies
- **Files**:
  - `server/lib/supabaseAdmin.ts`
  - `database/migrations/20250819_monitor_events.sql`
- **Status**: ✅ PRESENT

### 9. Observability Add-ons (Optional)

- **Grafana Dashboards**: `monitoring/grafana/dashboards/`
- **SQL Views**: Not present (optional)
- **CI Purge Workflow**: Not present (optional)
- **Status**: ⚠️ PARTIAL

## 🔧 Local Validation Commands

### Quick Health Check (No Docker)

```bash
pnpm run check:quick:no-docker
```

### Full Health Check (Requires Docker)

```bash
pnpm run check:quick
```

### Individual Checks

```bash
# MCP validation
pnpm run mcp:validate

# Prompts tests
pnpm run test:prompts

# Agents smoke test
pnpm run test:agents

# Build and monitoring checks
pnpm run build
pnpm run build:check:monitor
pnpm run build:check:monitor:size
```

### K8s Validation (Requires Docker)

```bash
# Validate staging overlay
docker run --rm -v "$(pwd):/work" ghcr.io/yannh/kubeconform:latest \
  -strict -summary -ignore-missing-schemas \
  -kubernetes-version 1.32.2 \
  /work/k8s/staging/doccraft-ai-staging.yml
```

## 📊 Environment Posture

### Staging (Enabled)

- `VITE_MONITORING_ENABLED=true`
- `VITE_MONITORING_REPORT=true`
- `VITE_MONITORING_SAMPLE=0.1`
- Server monitoring: ENABLED (via CI secrets)

### Production (Dormant)

- `VITE_MONITORING_ENABLED=false`
- `VITE_MONITORING_REPORT=false`
- `VITE_MONITORING_SAMPLE=0`
- Server monitoring: DISABLED

## 📁 Artifacts Location

- **Release artifacts**: `.artifacts/release/`
- **MCP validation**: `.artifacts/mcp-validate.json`
- **Test logs**: `.artifacts/release/test.*.log`
- **Build analysis**: `.artifacts/release/`

## 🔗 Related Workflows

- **Staging Rollout**: `.github/workflows/staging-rollout.yml`
- **MCP Validation**: `.github/workflows/mcp-validate.yml`
- **Agents & Prompts**: `.github/workflows/agents-prompts.yml`
- **K8s Validation**: `.github/workflows/k8s-overlay-validate.yml`
- **Monitoring Check**: `.github/workflows/monitoring-check.yml`

## 📝 Next Steps

After passing all readiness gates:

1. ✅ Proceed to P1 feature work (agentic upgrades & UI enhancements)
2. 🔄 Monitor staging deployment health
3. 📈 Track performance metrics in staging
4. 🚀 Plan production release when stable

## 🆘 Troubleshooting

### Docker Not Available

- Use `pnpm run check:quick:no-docker` for local validation
- K8s validation will be skipped but other checks will run

### Test Failures

- Check logs in `.artifacts/release/`
- Verify dependencies with `pnpm install`
- Run individual test suites to isolate issues

### Build Issues

- Clear `dist/` directory: `rm -rf dist/`
- Check TypeScript errors: `pnpm run type-check`
- Verify Vite configuration: `pnpm run build:ci`
