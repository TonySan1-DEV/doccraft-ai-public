<!-- data-mcp-source="agent_extensions_release_notes" -->

## v2.1.0 (2025-07-23)

### ✨ Features
- Added `/export report` and slash command interface for chat agent
- Integrated voice input mode with speech recognition + synthesis (Pro only)
- Launched agent-aware command palette (`Cmd+P`) for fast access
- Language + tone config for multilingual agent messages
- Accessibility-first mic button UI

### 🧪 Tests
- Playwright E2E coverage for CLI + voice + command palette flows
- Snapshot and accessibility coverage added to agent shell

### ♿ Accessibility
- ARIA roles and keyboard shortcuts for all agent extensions
- Visual indicators for mic input and command executions

### 📦 Deployment
- GitHub Actions pipeline with tier gating + MCP validation
- Secure command fallback handling (XSS safe)

---

**Docs:**
- See [agentExtensions.md](../../docs/agentExtensions.md) for user help
- See [agentExtensions.prompt.md](../../promptTemplates/agentExtensions.prompt.md) for onboarding and MCP prompt templates 