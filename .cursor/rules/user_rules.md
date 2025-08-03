# Cursor AI User Rules

## Purpose

Define safe, governed usage of Cursor AI across machines and projects.

### 🧭 Workflow Rules

- Always `git pull --rebase origin main` before committing.
- Use conventional branch names and commit messages.
- Prefer branches over direct `main` commits.

### 🔐 Security & Privacy

- Real secrets must never be injected into prompts.
- Use `.env.test` for testing context.
- MCP is the ONLY allowed mechanism to access secrets or CI metadata.

### 📌 Prompt Modes

- **Beginner**: step-by-step explanations.
- **Advanced**: raw code/config with minimal commentary.

### 🎛 Tiers

- Free: lint/typecheck/test usage.
- Pro: full prompt access including db & CI contexts.
- Admin: can define MCP-prompts and governance.
