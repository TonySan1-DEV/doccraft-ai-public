// MCP Registry – agent module
export const agentMCP = {
  module: "agent",
  role: ["ui-engineer", "ai-engineer", "api-engineer"],
  tier: "Pro",
  actions: ["subscribe", "listen", "update", "orchestrate", "persist", "pipeline"],
  theme: "doc2video_ui",
  status: "finalized",
  next: "script_editing"
};

// Script Editor MCP
export const scriptEditorMCP = {
  module: "scriptEditor",
  role: ["ui-engineer"],
  tier: "Pro",
  actions: ["subscribe", "listen", "update"],
  theme: "script_editing",
  status: "finalized",
  next: "pipeline_resume"
};

// Pipeline Orchestrator MCP
export const pipelineOrchestratorMCP = {
  module: "pipelineOrchestrator",
  role: ["ai-engineer"],
  tier: "Pro",
  actions: ["orchestrate", "persist", "pipeline"],
  theme: "workflow_orchestration",
  status: "finalized",
  next: "script_editing"
};

// MCP Guards for Script Editing
export const scriptEditingGuards = {
  canEditScript: (tier: string): boolean => {
    return tier === 'Pro' || tier === 'Premium';
  },
  
  canResumePipeline: (tier: string, mode: string): boolean => {
    return (tier === 'Pro' || tier === 'Premium') && 
           (mode === 'hybrid' || mode === 'manual');
  },
  
  canPausePipeline: (tier: string, mode: string): boolean => {
    return (tier === 'Pro' || tier === 'Premium') && 
           (mode === 'hybrid' || mode === 'manual');
  }
};
