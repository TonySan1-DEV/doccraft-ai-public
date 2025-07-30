
---
description: DocCraft AI – MCP + Contextual Engineering Rules
alwaysApply: true
---

# Context Engineering Rules

- Always include `mcpRegistry.ts` to understand file context.
- Respect the allowedActions and role per file.
- For new features or components, update the registry.
- Use inline comments like:
  /* MCP: { role: "editor", allowedActions: ["refactor"] } */
- Avoid edits to files with contentSensitivity = "high" unless explicitly asked.
