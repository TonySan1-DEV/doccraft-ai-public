// MCP Context Block
/*
role: infra-engineer,
tier: Pro,
file: "modules/agent/services/seedAgentKnowledgeBase.ts",
allowedActions: ["index", "ingest", "cache"],
theme: "agent_context"
*/

import fs from 'fs';
import path from 'path';
import {
  extractPromptEntries,
  extractMarkdownSections,
  normalizeEntry,
  KnowledgeEntry,
} from './knowledgeIndexer';

const ROOT = path.resolve(__dirname, '../../../');
const kb: KnowledgeEntry[] = [];

function ingestReadmes() {
  const modulesDir = path.join(ROOT, 'modules');
  if (!fs.existsSync(modulesDir)) return;
  for (const mod of fs.readdirSync(modulesDir)) {
    const readmePath = path.join(modulesDir, mod, 'README.md');
    if (fs.existsSync(readmePath)) {
      const sections = extractMarkdownSections(readmePath);
      for (const sec of sections) {
        kb.push(
          normalizeEntry({
            ...sec,
            type: 'moduleDoc',
            sourcePath: readmePath,
            mcp: { role: 'user', tier: 'Pro' },
          })
        );
      }
    }
  }
}

function ingestPrompts() {
  const promptDir = path.join(ROOT, 'promptTemplates');
  if (!fs.existsSync(promptDir)) return;
  for (const file of fs.readdirSync(promptDir)) {
    if (file.endsWith('.prompt.md')) {
      const promptPath = path.join(promptDir, file);
      const prompts = extractPromptEntries(promptPath);
      for (const p of prompts) {
        kb.push(
          normalizeEntry({
            ...p,
            type: 'prompt',
            sourcePath: promptPath,
            mcp: { role: p.role, tier: p.tier, theme: p.theme },
          })
        );
      }
    }
  }
}

function ingestWorkflows() {
  const wfDir = path.join(ROOT, 'docs', 'workflowRecipes');
  if (!fs.existsSync(wfDir)) return;
  for (const file of fs.readdirSync(wfDir)) {
    if (file.endsWith('.md')) {
      const wfPath = path.join(wfDir, file);
      const sections = extractMarkdownSections(wfPath);
      for (const sec of sections) {
        kb.push(
          normalizeEntry({
            ...sec,
            type: 'workflow',
            sourcePath: wfPath,
            mcp: { role: 'user', tier: 'Pro' },
          })
        );
      }
    }
  }
}

/** TEMP STUB — replace with real implementation */
export function getKBEntry(query: string, _role: string, _tier: string) {
  // Mock KB lookup - in real implementation, this would search the knowledge base
  const mockKB = [
    {
      id: 'kb-emotion-drift',
      content:
        'To check for emotional drift, use the Emotion Timeline Chart in the dashboard.',
      mcp: {
        role: 'frontend-developer',
        tier: 'Pro',
        theme: 'emotion_analysis',
      },
    },
    {
      id: 'kb-theme-conflicts',
      content:
        'Theme conflicts can be detected using the Theme Matrix Panel in the dashboard.',
      mcp: { role: 'frontend-developer', tier: 'Pro', theme: 'theme_analysis' },
    },
  ];

  return mockKB.filter(
    _entry =>
      query.toLowerCase().includes('emotion') ||
      query.toLowerCase().includes('theme') ||
      query.toLowerCase().includes('drift')
  );
}

export function seedAgentKnowledgeBase() {
  kb.length = 0;
  ingestReadmes();
  ingestPrompts();
  ingestWorkflows();
  // MCP gating: filter out Admin-only if not Pro
  const filtered = kb.filter(
    e => e.mcp.tier === 'Pro' || e.mcp.tier === 'user'
  );
  // Remove duplicates by id
  const unique = Array.from(new Map(filtered.map(e => [e.id, e])).values());
  // Annotate with data-kb-source
  unique.forEach(e => ((e as any)['data-kb-source'] = e.type));
  // Write to agent.kb.json
  fs.writeFileSync(
    path.join(ROOT, 'agent.kb.json'),
    JSON.stringify(unique, null, 2)
  );
  return unique;
}
