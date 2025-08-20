// scripts/docs/pr-annotate.mjs
// Purpose: Non-fatal PR annotations and summary for missing doc artifacts.
// - Detects changed areas (frontend/db/api/deps/core) using project detector or git fallback.
// - Checks required artifacts like verify-docs but NEVER exits 1.
// - Emits GitHub Workflow Commands (::warning) for inline annotations.
// - Writes a local summary for devs (docs/dev/refs/_pr-annotations.md) and,
//   in CI, appends to $GITHUB_STEP_SUMMARY when available.

import fs from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';

let log = m => console.log(`[pr-annotate] ${m}`);
let warn = m => console.warn(`[pr-annotate] ${m}`);

const ROOT = process.cwd();
const d = (...p) => path.join(ROOT, ...p);

async function exists(p) {
  return !!(await fs.stat(p).catch(() => null));
}
async function read(p) {
  return fs.readFile(p, 'utf8');
}
async function write(p, s) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, s, 'utf8');
}

async function detectAreas() {
  // Try project change-detector
  try {
    const mod = await import(d('scripts/docs/run-for-changes.mjs'));
    if (typeof mod.detectChangedAreas === 'function')
      return new Set(await mod.detectChangedAreas());
    if (typeof mod.getChangedAreas === 'function')
      return new Set(await mod.getChangedAreas());
    if (typeof mod.run === 'function') return new Set(await mod.run());
  } catch {}
  // Fallback to git diff
  let out = '';
  try {
    out = execSync('git diff --name-only HEAD', { encoding: 'utf8' });
  } catch {
    return new Set(['core', 'deps', 'docs', 'frontend', 'db', 'api']);
  }
  const files = out.split(/\r?\n/).filter(Boolean);
  const areas = new Set();
  for (const f of files) {
    if (f.startsWith('src/')) areas.add('frontend');
    if (f.startsWith('prisma/') || f.startsWith('prisma-mongodb/'))
      areas.add('db');
    if (f.includes('openapi')) areas.add('api');
    if (f === 'package.json' || f === 'pnpm-lock.yaml') areas.add('deps');
    if (f.startsWith('scripts/docs/') || f.startsWith('docs/'))
      areas.add('docs');
  }
  areas.add('core');
  if (areas.size === 0) areas.add('core');
  return areas;
}

async function main() {
  log('start');
  const areas = await detectAreas();
  log(`areas: ${Array.from(areas).sort().join(', ')}`);

  const REFS = d('docs/dev/refs');
  const CORE_MD = [
    d('docs/dev/00-overview.md'),
    d('docs/dev/01-architecture.md'),
    d('docs/dev/02-setup-and-env.md'),
    d('docs/dev/03-build-and-deploy.md'),
  ];
  const DEP_GRAPH = d('docs/dev/refs/dependency-graph.md');
  const OPENAPI_JSON = d('docs/dev/refs/openapi.json');
  const API_DRIFT_JSON = d('docs/dev/refs/api-drift.json');

  const ROUTE_JSON = d('docs/dev/refs/route-map.json');
  const COMP_JSON = d('docs/dev/refs/component-map.json');
  const FRONTEND_MD = d('docs/dev/04-frontend.md');
  const FRONT_BLOCK_START = '<!-- AUTO-GEN:FRONTEND-START -->';
  const FRONT_BLOCK_END = '<!-- AUTO-GEN:FRONTEND-END -->';

  const PG_SCHEMA = d('prisma/schema.prisma');
  const MONGO_SCHEMA = d('prisma-mongodb/schema.prisma');
  const PRISMA_PG = d('docs/dev/refs/prisma-pg.schema.md');
  const PRISMA_MONGO = d('docs/dev/refs/prisma-mongo.schema.md');

  const issues = [];

  // Always: baseline docs + key refs presence
  for (const f of CORE_MD) {
    if (!(await exists(f))) {
      issues.push({
        title: 'Missing core doc',
        detail: path.relative(ROOT, f),
        fix: 'Create/restore it',
        cmd: 'pnpm run docs:overview (and commit core docs)',
      });
    }
  }
  if (!(await exists(REFS))) {
    issues.push({
      title: 'Missing refs directory',
      detail: path.relative(ROOT, REFS),
      fix: 'Run generators',
      cmd: 'pnpm run docs:deps && pnpm run docs:api',
    });
  } else {
    if (!(await exists(DEP_GRAPH)))
      issues.push({
        title: 'Missing dependency graph',
        detail: path.relative(ROOT, DEP_GRAPH),
        fix: 'Generate deps graph',
        cmd: 'pnpm run docs:deps',
      });
    if (!(await exists(OPENAPI_JSON)))
      issues.push({
        title: 'Missing OpenAPI ref',
        detail: path.relative(ROOT, OPENAPI_JSON),
        fix: 'Generate OpenAPI',
        cmd: 'pnpm run docs:api',
      });
    
    // Check for API drift if OpenAPI exists
    if (await exists(OPENAPI_JSON) && !(await exists(API_DRIFT_JSON))) {
      issues.push({
        title: 'Missing API drift report',
        detail: path.relative(ROOT, API_DRIFT_JSON),
        fix: 'Generate API drift report',
        cmd: 'pnpm run docs:api-drift',
      });
    } else if (await exists(API_DRIFT_JSON)) {
      try {
        const driftContent = await read(API_DRIFT_JSON);
        const drift = JSON.parse(driftContent);
        
        const missingInOpenAPI = drift.summary?.missingInOpenAPI || 0;
        const missingInCode = drift.summary?.missingInCode || 0;
        const methodDrift = drift.summary?.methodDrift || 0;
        
        if (missingInOpenAPI > 0 || missingInCode > 0 || methodDrift > 0) {
          // Add drift summary to GITHUB_STEP_SUMMARY
          const driftSummary = `\n## API Drift Summary\n\n- Missing in OpenAPI: ${missingInOpenAPI}\n- Missing in Code: ${missingInCode}\n- Method drift: ${methodDrift}\n\n`;
          
          try {
            const sumPath = process.env.GITHUB_STEP_SUMMARY;
            if (sumPath) {
              await fs.appendFile(sumPath, driftSummary, 'utf8');
            }
          } catch (e) {
            // ignore
          }
          
          // Emit warnings for drift (non-fatal)
          if (missingInOpenAPI > 0) {
            const samples = drift.details?.missingInOpenAPI?.slice(0, 10) || [];
            samples.forEach(([method, path]) => {
              console.log(`::warning title=API Drift - Missing in OpenAPI::${method.toUpperCase()} ${path}`);
            });
          }
          
          if (missingInCode > 0) {
            const samples = drift.details?.missingInCode?.slice(0, 10) || [];
            samples.forEach(([method, path]) => {
              console.log(`::warning title=API Drift - Missing in Code::${method.toUpperCase()} ${path}`);
            });
          }
          
          if (methodDrift > 0) {
            const samples = drift.details?.methodDrift?.slice(0, 10) || [];
            samples.forEach(([path, codeMethods, specMethods]) => {
              console.log(`::warning title=API Drift - Method Mismatch::${path} code=[${codeMethods.join(',')}] spec=[${specMethods.join(',')}]`);
            });
          }
        }
      } catch (error) {
        // Ignore parsing errors in PR annotations
      }
    }
  }

  // Frontend area checks
  if (areas.has('frontend')) {
    if (!(await exists(ROUTE_JSON)))
      issues.push({
        title: 'Missing route map',
        detail: path.relative(ROOT, ROUTE_JSON),
        fix: 'Generate route map',
        cmd: 'pnpm run docs:frontend',
      });
    if (!(await exists(COMP_JSON)))
      issues.push({
        title: 'Missing component map',
        detail: path.relative(ROOT, COMP_JSON),
        fix: 'Generate component map',
        cmd: 'pnpm run docs:frontend',
      });
    if (await exists(FRONTEND_MD)) {
      const md = await read(FRONTEND_MD);
      if (!(md.includes(FRONT_BLOCK_START) && md.includes(FRONT_BLOCK_END))) {
        issues.push({
          title: '04-frontend missing AUTO-GEN block',
          detail: path.relative(ROOT, FRONTEND_MD),
          fix: 'Re-generate frontend doc',
          cmd: 'pnpm run docs:frontend',
        });
      }
    } else {
      issues.push({
        title: 'Missing 04-frontend.md',
        detail: path.relative(ROOT, FRONTEND_MD),
        fix: 'Generate frontend overview',
        cmd: 'pnpm run docs:frontend',
      });
    }
  }

  // DB area checks if db changed or prisma dirs present
  const needDb =
    areas.has('db') ||
    (await exists(PG_SCHEMA)) ||
    (await exists(MONGO_SCHEMA));
  if (needDb) {
    if (await exists(PG_SCHEMA)) {
      if (!(await exists(PRISMA_PG)))
        issues.push({
          title: 'Missing Prisma PG schema doc',
          detail: path.relative(ROOT, PRISMA_PG),
          fix: 'Generate Prisma docs',
          cmd: 'pnpm run docs:db',
        });
    }
    if (await exists(MONGO_SCHEMA)) {
      if (!(await exists(PRISMA_MONGO)))
        issues.push({
          title: 'Missing Prisma Mongo schema doc',
          detail: path.relative(ROOT, PRISMA_MONGO),
          fix: 'Generate Prisma docs',
          cmd: 'pnpm run docs:db',
        });
    }
  }

  // Emit workflow annotations + local summary
  let summary = `# Docs Guard Annotations\n\n**Areas:** ${Array.from(areas).sort().join(', ')}\n\n`;
  if (issues.length === 0) {
    summary += '✅ No missing documentation artifacts detected.\n';
  } else {
    summary += `⚠️ ${issues.length} issue(s) detected:\n\n`;
    for (const i of issues) {
      const msg = `${i.title}: ${i.detail} — Fix: ${i.fix} → \`${i.cmd}\``;
      // GitHub annotation (warning, non-fatal)
      console.log(`::warning title=${i.title}::${msg}`);
      summary += `- ${msg}\n`;
    }
  }
  // Write local preview file for non-CI runs
  const LOCAL_SUMMARY = d('docs/dev/refs/_pr-annotations.md');
  await write(LOCAL_SUMMARY, summary);
  log(`summary written: ${path.relative(ROOT, LOCAL_SUMMARY)}`);

  // If running in GitHub, append to step summary
  try {
    const sumPath = process.env.GITHUB_STEP_SUMMARY;
    if (sumPath) {
      await fs.appendFile(sumPath, summary, 'utf8');
      log('appended to GITHUB_STEP_SUMMARY');
    }
  } catch (e) {
    // ignore
  }

  log('done (non-fatal)');
  process.exit(0);
}

main().catch(e => {
  warn(`internal error: ${e?.message || e}`);
  // Still non-fatal
  process.exit(0);
});
