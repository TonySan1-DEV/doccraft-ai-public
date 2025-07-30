// src/useMCP.ts
import { mcpRegistry, MCPContext, buildMCPPrompt } from './mcpRegistry';

export function useMCP(fileName: string): MCPContext {
  // MCP Dev Override: auto-assign 'admin' in dev if no mcpRole is set
  const role =
    (typeof localStorage !== 'undefined' && localStorage.getItem('mcpRole')) ||
    (import.meta.env.DEV ? 'admin' : 'guest');

  const registryContext = (mcpRegistry as Record<string, MCPContext>)[fileName] || {
    role: "viewer",
    allowedActions: ["view"],
    theme: "general",
    contentSensitivity: "low",
    tier: "Free",
    roleMeta: {
      description: "Default context for unknown files",
      permissions: ["read"],
      restrictions: ["no-edit", "no-delete"]
    }
  };

  return {
    ...registryContext,
    role
  };
}

export function getMCPPrompt(fileName: string): string {
  const context = useMCP(fileName);
  return buildMCPPrompt(context, fileName);
} 