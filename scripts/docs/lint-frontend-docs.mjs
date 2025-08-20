#!/usr/bin/env node
/**
 * Custom linting checks for generated frontend docs.
 * No external dependencies needed. Exits 1 on violations.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const p = (...xs) => path.resolve(ROOT, ...xs);

const TARGETS = [
  p('docs/dev/04-frontend.md'),
  p('docs/dev/refs/route-map.json'),
  p('docs/dev/refs/component-map.json'),
  p('docs/dev/refs/frontend-summary.md'),
];

function fileContent(fp) {
  try {
    return fs.readFileSync(fp, 'utf8');
  } catch {
    return null;
  }
}

// Custom linting rules
function lintFile(filePath, content) {
  const issues = [];
  const filename = path.basename(filePath);

  // Rule 1: No emoji
  if (/[\u{1F300}-\u{1FAFF}]/u.test(content)) {
    issues.push('Emoji detected in generated docs');
  }

  // Rule 2: Deterministic banner for 04-frontend.md
  if (filename === '04-frontend.md') {
    if (!/<!-- AUTO-GEN:FRONTEND-START/i.test(content)) {
      issues.push('Missing deterministic banner in 04-frontend.md');
    }
  }

  // Rule 3: Auto-generated banner for frontend-summary.md
  if (filename === 'frontend-summary.md') {
    if (!/<!--\s*AUTO-GEN:FRONTEND-SUMMARY/i.test(content)) {
      issues.push('Missing auto-generated banner in frontend-summary.md');
    }
  }

  // Rule 4: No volatile timestamp phrases
  if (/\bgenerated at\b|\blast updated\b|\bbuild time\b/i.test(content)) {
    issues.push(
      'Volatile timestamp phrase found (use deterministic banner instead)'
    );
  }

  return issues;
}

async function main() {
  console.log('[lint:docs:frontend] start');

  let hadFiles = false;
  let errorCount = 0;

  for (const file of TARGETS) {
    const content = fileContent(file);
    if (content == null) continue; // absent is fine (area-aware)
    hadFiles = true;

    const issues = lintFile(file, content);
    if (issues.length > 0) {
      console.log(`\n${path.relative(ROOT, file)}`);
      for (const issue of issues) {
        console.log(`  error  ${issue}`);
        errorCount++;
      }
    }
  }

  if (!hadFiles) {
    console.log('[lint:docs:frontend] skip: no target files present.');
    process.exit(0);
  }

  if (errorCount) {
    console.error(`[lint:docs:frontend] failed with ${errorCount} error(s).`);
    process.exit(1);
  }

  console.log('[lint:docs:frontend] ok');
  process.exit(0);
}

main().catch(e => {
  console.error('[lint:docs:frontend] internal error:', e?.message || e);
  process.exit(1);
});
