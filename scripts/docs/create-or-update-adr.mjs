#!/usr/bin/env node

/**
 * DocCraft-AI ADR Creation Script
 * 
 * This script creates or updates Architecture Decision Records (ADRs).
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const DOCS_DIR = join(__dirname, '../../docs/dev');
const ADR_DIR = join(DOCS_DIR, '11-adr');

/**
 * Get current date in YYYYMMDD format
 */
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Generate ADR filename from title
 */
function generateADRFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

/**
 * Create new ADR
 */
function createADR(title, description = '') {
  const date = getCurrentDate();
  const filename = generateADRFilename(title);
  const adrPath = join(ADR_DIR, `ADR-${date}-${filename}.md`);
  
  const adrContent = `# ADR-${date}: ${title}

## Status

**Status**: Proposed  
**Date**: ${new Date().toISOString().split('T')[0]}  
**Deciders**: Development Team  
**Technical Story**: [Link to issue/PR if applicable]

## Context

${description || 'Describe the context and problem statement that led to this decision.'}

## Decision

**Decision**: [Describe the decision that was made]

**Rationale**: [Explain why this decision was made]

## Consequences

### Positive

- [List positive consequences]

### Negative

- [List negative consequences or trade-offs]

### Neutral

- [List neutral consequences]

## Alternatives Considered

### Alternative 1: [Name]

- **Description**: [Brief description]
- **Pros**: [List pros]
- **Cons**: [List cons]
- **Why rejected**: [Explain why this alternative was not chosen]

### Alternative 2: [Name]

- **Description**: [Brief description]
- **Pros**: [List pros]
- **Cons**: [List cons]
- **Why rejected**: [Explain why this alternative was not chosen]

## Implementation Notes

- [Any implementation details or considerations]
- [Timeline for implementation]
- [Rollback plan if needed]

## Related Decisions

- [List related ADRs or decisions]

## References

- [Links to relevant documentation, RFCs, or discussions]

---

**Changelog**
- \`${getCurrentCommitHash()}\` - ${new Date().toISOString().split('T')[0]} - Created initial ADR
`;

  writeFileSync(adrPath, adrContent);
  return adrPath;
}

/**
 * List existing ADRs
 */
function listADRs() {
  if (!existsSync(ADR_DIR)) {
    return [];
  }
  
  const files = readdirSync(ADR_DIR);
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const content = readFileSync(join(ADR_DIR, file), 'utf8');
      const titleMatch = content.match(/^# ADR-\d+: (.+)$/m);
      const statusMatch = content.match(/\*\*Status\*\*: (.+)/);
      
      return {
        filename: file,
        title: titleMatch ? titleMatch[1] : 'Unknown Title',
        status: statusMatch ? statusMatch[1] : 'Unknown Status'
      };
    });
}

/**
 * Update ADR status
 */
function updateADRStatus(adrFilename, newStatus) {
  const adrPath = join(ADR_DIR, adrFilename);
  
  if (!existsSync(adrPath)) {
    console.error(`ADR file not found: ${adrFilename}`);
    return false;
  }
  
  let content = readFileSync(adrPath, 'utf8');
  
  // Update status
  content = content.replace(
    /\*\*Status\*\*: .+/,
    `**Status**: ${newStatus}`
  );
  
  // Add changelog entry
  const changelogEntry = `- \`${getCurrentCommitHash()}\` - ${new Date().toISOString().split('T')[0]} - Updated status to ${newStatus}`;
  content = content.replace(/^---\s*\n\n\*\*Changelog\*\*/, `---

**Changelog**
${changelogEntry}`);
  
  writeFileSync(adrPath, content);
  return true;
}

/**
 * Get current commit hash
 */
function getCurrentCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Main execution function
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log('📋 DocCraft-AI ADR Management');
  console.log('==============================\n');
  
  try {
    // Ensure ADR directory exists
    if (!existsSync(ADR_DIR)) {
      execSync(`mkdir -p "${ADR_DIR}"`, { stdio: 'inherit' });
    }
    
    switch (command) {
      case 'create':
        if (args.length < 2) {
          console.log('Usage: npm run docs:adr create "Title" [description]');
          process.exit(1);
        }
        
        const title = args[1];
        const description = args[2] || '';
        
        console.log(`🆕 Creating new ADR: ${title}`);
        const adrPath = createADR(title, description);
        console.log(`✅ ADR created: ${adrPath}`);
        break;
        
      case 'list':
        console.log('📋 Existing ADRs:');
        const adrs = listADRs();
        
        if (adrs.length === 0) {
          console.log('  No ADRs found');
        } else {
          for (const adr of adrs) {
            console.log(`  - ${adr.filename}: ${adr.title} (${adr.status})`);
          }
        }
        break;
        
      case 'status':
        if (args.length < 3) {
          console.log('Usage: npm run docs:adr status <filename> <new-status>');
          console.log('Example: npm run docs:adr status ADR-20241201-example.md "Accepted"');
          process.exit(1);
        }
        
        const filename = args[1];
        const newStatus = args[2];
        
        console.log(`🔄 Updating ADR status: ${filename} -> ${newStatus}`);
        if (updateADRStatus(filename, newStatus)) {
          console.log(`✅ ADR status updated successfully`);
        } else {
          process.exit(1);
        }
        break;
        
      default:
        console.log('Available commands:');
        console.log('  create <title> [description]  - Create new ADR');
        console.log('  list                          - List existing ADRs');
        console.log('  status <file> <status>       - Update ADR status');
        console.log('');
        console.log('Examples:');
        console.log('  npm run docs:adr create "Use Vite for Build Tool"');
        console.log('  npm run docs:adr create "Database Schema Design" "Design decisions for user data storage"');
        console.log('  npm run docs:adr list');
        console.log('  npm run docs:adr status ADR-20241201-example.md "Accepted"');
        break;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
