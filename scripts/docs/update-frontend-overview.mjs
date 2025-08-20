#!/usr/bin/env node

/**
 * DocCraft-AI Frontend Overview Updater
 * 
 * Updates docs/dev/00-overview.md with frontend component information
 * from the generated frontend-summary.md
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const DOCS_DIR = join(__dirname, '../../docs/dev');
const REFS_DIR = join(__dirname, '../../docs/dev/refs');
const OVERVIEW_FILE = join(DOCS_DIR, '00-overview.md');
const FRONTEND_SUMMARY = join(REFS_DIR, 'frontend-summary.md');

/**
 * Extract component count and sample from frontend summary
 */
function extractFrontendInfo() {
  if (!existsSync(FRONTEND_SUMMARY)) {
    return {
      totalComponents: 0,
      sampleComponents: [],
      hasProps: 0
    };
  }
  
  try {
    const content = readFileSync(FRONTEND_SUMMARY, 'utf8');
    
    // Extract total components
    const totalMatch = content.match(/\*\*Total Components Detected:\*\* (\d+)/);
    const totalComponents = totalMatch ? parseInt(totalMatch[1]) : 0;
    
    // Extract sample components (first 10 with props)
    const sampleComponents = [];
    const componentMatches = content.matchAll(/#### `([^`]+)`\n\n\*\*File:\*\* `([^`]+)`\n\n\*\*Type:\*\* ([^\n]+)\n\n\*\*Description:\*\* ([^\n]+)/g);
    
    let count = 0;
    for (const match of componentMatches) {
      if (count >= 10) break;
      
      const [, name, file, type, description] = match;
      
      // Check if this component has props
      const hasProps = content.includes(`#### \`${name}\`\n\n**File:** \`${file}\`\n\n**Type:** ${type}\n\n**Description:** ${description}\n\n**Props:**\n\n| Name | Type | Default | Description |`);
      
      sampleComponents.push({
        name,
        file,
        type,
        description,
        hasProps
      });
      
      count++;
    }
    
    // Count components with props
    const hasProps = sampleComponents.filter(comp => comp.hasProps).length;
    
    return {
      totalComponents,
      sampleComponents,
      hasProps
    };
  } catch (error) {
    console.log(`[frontend-overview] Warning: Could not read frontend summary: ${error.message}`);
    return {
      totalComponents: 0,
      sampleComponents: [],
      hasProps: 0
    };
  }
}

/**
 * Generate frontend overview content
 */
function generateFrontendOverview(frontendInfo) {
  if (frontendInfo.totalComponents === 0) {
    return `### Frontend Component Summary

No React components detected in the current codebase.

Run \`pnpm run docs:frontend\` to scan for components.`;
  }
  
  let content = `### Frontend Component Summary

**Total Components Detected:** ${frontendInfo.totalComponents}
**Components with Props:** ${frontendInfo.hasProps}

**Sample Components (first 10):**

| Component | File | Type | Has Props |
|-----------|------|------|-----------|`;

  for (const comp of frontendInfo.sampleComponents) {
    const hasPropsText = comp.hasProps ? '✅' : '❌';
    content += `\n| \`${comp.name}\` | \`${comp.file}\` | ${comp.type} | ${hasPropsText} |`;
  }
  
  content += `\n\n*Run \`pnpm run docs:frontend\` to regenerate the complete component list.*`;
  
  return content;
}

/**
 * Update overview.md with frontend information
 */
function updateOverview(frontendOverview) {
  if (!existsSync(OVERVIEW_FILE)) {
    console.log('[frontend-overview] Warning: Overview file not found');
    return false;
  }
  
  try {
    let content = readFileSync(OVERVIEW_FILE, 'utf8');
    
    // Update the AUTO-GEN:FRONTEND block
    const frontendPattern = /<!-- AUTO-GEN:FRONTEND-START -->[\s\S]*?<!-- AUTO-GEN:FRONTEND-END -->/;
    const frontendReplacement = `<!-- AUTO-GEN:FRONTEND-START -->
${frontendOverview}
<!-- AUTO-GEN:FRONTEND-END -->`;
    
    if (frontendPattern.test(content)) {
      content = content.replace(frontendPattern, frontendReplacement);
    } else {
      console.log('[frontend-overview] Warning: AUTO-GEN:FRONTEND block not found in overview');
      return false;
    }
    
    writeFileSync(OVERVIEW_FILE, content);
    return true;
  } catch (error) {
    console.log(`[frontend-overview] Error updating overview: ${error.message}`);
    return false;
  }
}

/**
 * Main execution function
 */
function main() {
  console.log('[frontend-overview] start');
  
  try {
    // Extract frontend information
    const frontendInfo = extractFrontendInfo();
    console.log(`[frontend-overview] found: ${frontendInfo.totalComponents} components`);
    
    // Generate frontend overview
    const frontendOverview = generateFrontendOverview(frontendInfo);
    
    // Update overview.md
    if (updateOverview(frontendOverview)) {
      console.log('[frontend-overview] updated: docs/dev/00-overview.md');
    } else {
      console.log('[frontend-overview] warning: could not update overview');
    }
    
    console.log('[frontend-overview] done');
    
  } catch (error) {
    console.error('[frontend-overview] error:', error.message);
    // Always exit 0 (non-fatal) as per requirements
    process.exit(0);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
