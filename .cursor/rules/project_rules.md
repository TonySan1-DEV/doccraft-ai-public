# DocCraft‑AI Project Rules

## MCP Context Providers

- `repoContext`, `ciContext`, `envContext` must be available for Cursor prompts.
- Providers serve structured JSON data—no secrets are exposed in plain text.

## Prompt Requirements

- Each prompt must specify:
  - `Mode`: Beginner or Advanced
  - `Project`: DocCraft‑AI v3
  - `Providers`: list of required context providers
  - `Goal`: concise statement of user intent
  - `Deliverable`: expected output (patch, code, analysis)

## CI/CD Constraints

- Core jobs fail the pipeline: lint, typecheck, test, coverage, emotionArc.
- Audit jobs are 📊 informational only, enabled via MCP context and optional secrets.

## Security Assurance

- Use OAuth or policy-based controls for MCP tool access.
- Reject prompts referencing unregistered or untrusted tools :contentReference[oaicite:13]{index=13}.
