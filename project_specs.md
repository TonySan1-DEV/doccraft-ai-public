
# 📘 DocCraft AI – Project Specification (MCP-Aware)

## Framework
- React + TypeScript + Vite + Tailwind CSS
- Supabase (planned)

## Active MCP Context Strategy
Each file/component is assigned a role and permission list via `mcpRegistry.ts`.
These guide AI tooling like Cursor and Claude.

## Key Components
- App.tsx: layout container
- DocumentEditor: editor interface
- ImageSuggestions: AI-powered image UI
- Services: document/image handling

## AI Usage
- Use `useMCP("filename")` to inject file-specific context
- Prompt Claude/Cursor with:
  > "Based on @mcpRegistry.ts, refactor this component respecting its role and actions."
