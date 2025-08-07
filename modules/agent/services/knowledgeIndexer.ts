// MCP Context Block
/*
role: infra-engineer,
tier: Pro,
file: "modules/agent/services/knowledgeIndexer.ts",
allowedActions: ["index", "ingest", "cache"],
theme: "agent_context"
*/

import fs from 'fs';
import _path from 'path';

export type KnowledgeEntry = {
  id: string;
  type: 'prompt' | 'workflow' | 'moduleDoc' | 'feature';
  title: string;
  content: string;
  sourcePath: string;
  mcp: { role: string; tier: string; theme?: string };
};

export type PromptEntry = {
  title: string;
  prompt: string;
  role: string;
  tier: string;
  theme?: string;
  files?: string[];
  outputPreview?: string;
};

export type DocSection = {
  title: string;
  content: string;
  slug: string;
  tags?: string[];
  mcp?: { role: string; tier: string; theme?: string };
};

/**
 * Extract prompt entries from a .prompt.md file
 */
export function extractPromptEntries(filePath: string): PromptEntry[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const entries: PromptEntry[] = [];
  const promptBlocks = content.split(/---+/g);
  for (const block of promptBlocks) {
    const titleMatch = block.match(/## Prompt: (.+)/);
    const promptMatch = block.match(/\*\*Prompt String:\*\*\n([\s\S]+?)\n\n/);
    const roleMatch = block.match(/\*\*Role:\*\* (.+)/);
    const tierMatch = block.match(/\*\*Tier:\*\* (.+)/);
    const themeMatch = block.match(/\*\*Theme:\*\* (.+)/);
    const filesMatch = block.match(/\*\*Files:\*\* ([^\n]+)/);
    const outputMatch = block.match(/\*\*Output Preview:\*\*\n([\s\S]+?)\n(```|<!--|---)/);
    if (titleMatch && promptMatch && roleMatch && tierMatch) {
      entries.push({
        title: titleMatch[1].trim(),
        prompt: promptMatch[1].trim(),
        role: roleMatch[1].trim(),
        tier: tierMatch[1].trim(),
        theme: themeMatch?.[1]?.trim(),
        files: filesMatch?.[1]?.split(',').map(f => f.trim()),
        outputPreview: outputMatch?.[1]?.trim()
      });
    }
  }
  return entries;
}

/**
 * Extract markdown sections (headers, tables, code) from a README or doc file
 */
export function extractMarkdownSections(filePath: string): DocSection[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const sections: DocSection[] = [];
  let current: DocSection | null = null;
  for (const line of lines) {
    const header = line.match(/^#+\s*(.+)/);
    if (header) {
      if (current) sections.push(current);
      current = { title: header[1].trim(), content: '', slug: header[1].toLowerCase().replace(/\s+/g, '-') };
    } else if (current) {
      current.content += line + '\n';
    }
  }
  if (current) sections.push(current);
  return sections;
}

/**
 * Normalize any entry to a KnowledgeEntry
 */
export function normalizeEntry(input: Partial<PromptEntry | DocSection> & { type: KnowledgeEntry['type']; sourcePath: string; mcp?: KnowledgeEntry['mcp'] }): KnowledgeEntry {
  let content = '';
  if ('prompt' in input && input.prompt) content = input.prompt;
  else if ('content' in input && input.content) content = input.content;
  return {
    id: `${input.type}:${input.title?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(36).slice(2)}`,
    type: input.type,
    title: input.title || '',
    content,
    sourcePath: input.sourcePath,
    mcp: input.mcp || { role: 'user', tier: 'Pro' }
  };
} 