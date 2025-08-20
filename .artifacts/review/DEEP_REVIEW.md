# 📊 Deep Codebase Review — DocCraft-AI

**Commit:** unknown

## UI Framework & Pages

- **Pages:** 37
- **Components:** 85
- **Layouts:** 1
- Demo entry: src/pages/Demo.tsx
- Index entry: src/pages/Home.tsx

## API Surface (Express)

- **Routes:** 4
- Health handlers in: 1
- Readiness handlers in: 0
- Metrics handlers in: 0

## Environment & Config

- Env union size: 154
- K8s missing: 0
- VITE violations: 0

## Database (Supabase)

- **Schema/Migration files:** 26
- **Supabase usage files:** 20

## Agentic Layer

- **Agent files:** 4
- **MCP contracts:** 5
- **MCP examples:** 4
- **Agent prompt files:** 1

## Build, Type, Lint, Tests

- Typecheck: see .artifacts/review/typecheck.log
- Lint: see .artifacts/review/lint.log
- Tests (prompts): see .artifacts/review/test.prompts.log
- Tests (agents): see .artifacts/review/test.agents.log
- Build: see .artifacts/review/build.log

## CI/CD & Deploy

- Workflows:

```
staging-rollout.yml
release-candidate.yml
ci.yml
monitoring-check.yml
railway-smoke.yml
k8s-overlay-validate.yml
agents-prompts.yml
mcp-validate.yml
security-scan.yml
deployment-validation.yml
docs-guard.yml
performance-testing.yml.disabled
test-automation.yml.disabled
e2e-testing.yml.disabled
lint-type-check.yml.disabled
lint-type-test.yml.disabled
lint.yml
coverage.yml
test.yml
emotionArc.yml
export-audit-logs.yml
README.md
reingest-audit-logs.yml
```

- K8s files:

```
k8s/doccraft-ai.yml
k8s/staging/
k8s/production/
k8s/monitoring/
```

- Dockerfiles:

```
deploy/production/Dockerfile.production
deploy/production/Dockerfile.production.scan
deploy/production/Dockerfile.production.simple
deploy/staging/Dockerfile.staging
```

- Deploy readiness: (see deploy-readiness.json)

## Security & Supply Chain

- **Workflows scanned:** 22
- **Cosign steps:** 1
- **Kyverno steps:** 1
- Trivy table: see .artifacts/review/trivy.table.txt
- SBOM: see .artifacts/review/sbom.spdx.json

---

## Key Gaps & Recommendations (Draft)

- UI/Demo: ensure Demo.tsx shows agent plan/steps, tool_call/results, token/cost meters, trace download.
- Index: add quick‑start tiles, env readiness booleans, workflow links.
- Agents: enforce MCP contracts (AJV/Zod), add retries/backoff, budget guard, OpenTelemetry traces.
- Env: resolve k8sMissing & VITE violations.
- Deploy: verify docker/k8s parity; add Cosign+Kyverno if not present.
- Monitoring: confirm /metrics endpoints and Prometheus scrape.
