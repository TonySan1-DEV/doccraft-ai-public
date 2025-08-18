#!/usr/bin/env node

/**
 * DocCraft-AI Overview Update Script
 * 
 * This script updates the overview documentation with recent changes.
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const DOCS_DIR = join(__dirname, '../../docs/dev');
const OVERVIEW_DOC = join(DOCS_DIR, '00-overview.md');

/**
 * Get recent commits since last release
 */
function getRecentCommits() {
  try {
    // Get commits since the last tag, or last 10 commits if no tags
    const output = execSync(
      'git log --oneline --since="1 week ago" -10',
      { encoding: 'utf8', cwd: process.cwd() }
    );
    
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.log('⚠️  Could not get recent commits, using placeholder');
    return ['placeholder - No recent commits available'];
  }
}

/**
 * Parse conventional commits
 */
function parseConventionalCommits(commits) {
  const changes = {
    features: [],
    fixes: [],
    docs: [],
    refactor: [],
    perf: [],
    test: [],
    chore: [],
    other: []
  };
  
  for (const commit of commits) {
    const match = commit.match(/^([a-f0-9]+)\s+(.+)$/);
    if (match) {
      const [, hash, message] = match;
      
      // Parse conventional commit format
      const conventionalMatch = message.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)/);
      if (conventionalMatch) {
        const [, type, scope, description] = conventionalMatch;
        const change = {
          hash: hash.substring(0, 7),
          type,
          scope: scope || 'general',
          description
        };
        
        switch (type) {
          case 'feat':
            changes.features.push(change);
            break;
          case 'fix':
            changes.fixes.push(change);
            break;
          case 'docs':
            changes.docs.push(change);
            break;
          case 'refactor':
            changes.refactor.push(change);
            break;
          case 'perf':
            changes.perf.push(change);
            break;
          case 'test':
            changes.test.push(change);
            break;
          case 'chore':
            changes.chore.push(change);
            break;
          default:
            changes.other.push(change);
        }
      } else {
        // Non-conventional commit
        changes.other.push({
          hash: hash.substring(0, 7),
          type: 'other',
          scope: 'general',
          description: message
        });
      }
    }
  }
  
  return changes;
}

/**
 * Generate changes summary
 */
function generateChangesSummary(changes) {
  let summary = '';
  
  // Features
  if (changes.features.length > 0) {
    summary += '### ✨ New Features\n\n';
    for (const change of changes.features) {
      summary += `- **${change.scope}**: ${change.description} (\`${change.hash}\`)\n`;
    }
    summary += '\n';
  }
  
  // Fixes
  if (changes.fixes.length > 0) {
    summary += '### 🐛 Bug Fixes\n\n';
    for (const change of changes.fixes) {
      summary += `- **${change.scope}**: ${change.description} (\`${change.hash}\`)\n`;
    }
    summary += '\n';
  }
  
  // Documentation
  if (changes.docs.length > 0) {
    summary += '### 📚 Documentation\n\n';
    for (const change of changes.docs) {
      summary += `- **${change.scope}**: ${change.description} (\`${change.hash}\`)\n`;
    }
    summary += '\n';
  }
  
  // Refactoring
  if (changes.refactor.length > 0) {
    summary += '### 🔧 Refactoring\n\n';
    for (const change of changes.refactor) {
      summary += `- **${change.scope}**: ${change.description} (\`${change.hash}\`)\n`;
    }
    summary += '\n';
  }
  
  // Performance
  if (changes.perf.length > 0) {
    summary += '### ⚡ Performance\n\n';
    for (const change of changes.perf) {
      summary += `- **${change.scope}**: ${change.description} (\`${change.hash}\`)\n`;
    }
    summary += '\n';
  }
  
  // Tests
  if (changes.test.length > 0) {
    summary += '### 🧪 Testing\n\n';
    for (const change of changes.test) {
      summary += `- **${change.scope}**: ${change.description} (\`${change.hash}\`)\n`;
    }
    summary += '\n';
  }
  
  // Other changes
  if (changes.other.length > 0) {
    summary += '### 📝 Other Changes\n\n';
    for (const change of changes.other) {
      summary += `- ${change.description} (\`${change.hash}\`)\n`;
    }
    summary += '\n';
  }
  
  if (summary === '') {
    summary = '*No recent changes detected*\n';
  }
  
  return summary;
}

/**
 * Update overview documentation
 */
function updateOverviewDocs(changesSummary) {
  let content = '';
  
  if (existsSync(OVERVIEW_DOC)) {
    content = readFileSync(OVERVIEW_DOC, 'utf8');
  } else {
    console.error('Overview document not found');
    return;
  }
  
  // Update the auto-generated section
  const autoGenPattern = /<!-- AUTO-GEN:BEGIN section=recent-changes -->[\s\S]*?<!-- AUTO-GEN:END section=recent-changes -->/;
  const replacement = `<!-- AUTO-GEN:BEGIN section=recent-changes -->
${changesSummary}
<!-- AUTO-GEN:END section=recent-changes -->`;
  
  if (autoGenPattern.test(content)) {
    content = content.replace(autoGenPattern, replacement);
  } else {
    // Add the section if it doesn't exist
    const sectionPattern = /## 📝 Changes Since Last Release/;
    if (sectionPattern.test(content)) {
      content = content.replace(sectionPattern, `## 📝 Changes Since Last Release

${replacement}`);
    } else {
      // Add at the end before changelog
      const changelogPattern = /^---\s*\n\n\*\*Changelog\*\*/;
      if (changelogPattern.test(content)) {
        content = content.replace(changelogPattern, `## 📝 Changes Since Last Release

${replacement}

---

**Changelog**`);
      }
    }
  }
  
  // Add changelog entry
  const changelogEntry = `- \`${getCurrentCommitHash()}\` - ${new Date().toISOString().split('T')[0]} - Updated overview with recent changes`;
  content = content.replace(/^---\s*\n\n\*\*Changelog\*\*/, `---

**Changelog**
${changelogEntry}`);
  
  writeFileSync(OVERVIEW_DOC, content);
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
  console.log('🔄 Updating overview documentation...');
  
  try {
    // Get recent commits
    const recentCommits = getRecentCommits();
    console.log(`📊 Found ${recentCommits.length} recent commits`);
    
    // Parse conventional commits
    const changes = parseConventionalCommits(recentCommits);
    
    // Generate changes summary
    const changesSummary = generateChangesSummary(changes);
    
    // Update overview documentation
    updateOverviewDocs(changesSummary);
    console.log(`✅ Overview documentation updated`);
    
    console.log('\n🎉 Overview update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating overview:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
