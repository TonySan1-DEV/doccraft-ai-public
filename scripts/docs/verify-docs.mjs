#!/usr/bin/env node
/**
 * Area-aware docs verification (deterministic, Windows-safe).
 * Fails only when related artifacts are missing for *existing* areas.
 *
 * Areas:
 *  - frontend  -> requires: docs/dev/refs/route-map.json, docs/dev/refs/component-map.json, docs/dev/04-frontend.md
 *  - db        -> requires: if prisma/ present -> docs/dev/refs/prisma-pg.schema.md
 *                 if prisma-mongodb/ present -> docs/dev/refs/prisma-mongo.schema.md
 *  - deps      -> requires: docs/dev/refs/dependency-graph.md
 *  - api       -> requires: docs/dev/refs/openapi.json (skeleton acceptable)
 *  - core/docs -> requires: the base dev docs 00-03 to exist
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as utils from './_utils.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const p = (...x) => path.resolve(root, ...x);

const log = (...a) => console.log('[docs:verify]', ...a);
const warn = (...a) => console.warn('[docs:verify]', ...a);
const fail = msg => {
  console.error('[docs:verify] FAIL:', msg);
  process.exitCode = 1;
};

// helpers
const exists = f => fs.existsSync(f);
const nonEmpty = f => exists(f) && fs.statSync(f).size > 0;
const readJSON = f => JSON.parse(fs.readFileSync(f, 'utf8'));

async function listAreas() {
  // Prefer the change detector if present; otherwise infer conservatively.
  try {
    const detector = p('scripts', 'docs', 'run-for-changes.mjs');
    if (exists(detector)) {
      // run node to print simple JSON for interoperability
      const { spawnSync } = await import('node:child_process');
      const out = spawnSync(process.execPath, [detector, '--json'], {
        cwd: root,
      });
      if (out.status === 0 && out.stdout?.length) {
        const parsed = JSON.parse(out.stdout.toString());
        if (Array.isArray(parsed.targets)) return parsed.targets;
      }
    }
  } catch {}
  // Fallback: infer based on presence of directories
  const areas = new Set(['docs', 'core']);
  if (exists(p('src'))) areas.add('frontend');
  if (exists(p('prisma')) || exists(p('prisma-mongodb'))) areas.add('db');
  if (exists(p('package.json'))) areas.add('deps');
  // api is optional; include if refs/openapi.json exists or scripts mention it
  if (exists(p('docs', 'dev', 'refs', 'openapi.json'))) areas.add('api');
  return Array.from(areas);
}

function requireFile(f, hintCmd) {
  if (!nonEmpty(f)) {
    fail(`Missing or empty: ${path.relative(root, f)}. Try: ${hintCmd}`);
  }
}

async function main() {
  log('start');
  const areas = await listAreas();
  log('areas:', areas.join(', '));

  // Always require the core dev docs
  [
    '00-overview.md',
    '01-architecture.md',
    '02-setup-and-env.md',
    '03-build-and-deploy.md',
  ].forEach(name =>
    requireFile(
      p('docs', 'dev', name),
      'git restore docs/dev && ensure base docs exist.'
    )
  );

  // deps → dependency graph
  if (areas.includes('deps')) {
    if (!nonEmpty(p('docs', 'dev', 'refs', 'dependency-graph.md'))) {
      fail('Dependency graph missing. Run: pnpm run docs:deps');
    }
  }

  // api → openapi.json (skeleton acceptable) + api-drift.json
  if (areas.includes('api')) {
    if (!nonEmpty(p('docs', 'dev', 'refs', 'openapi.json'))) {
      fail('OpenAPI refs missing. Run: pnpm run docs:api');
    }
    
    // Require api-drift.json for drift checking
    if (!nonEmpty(p('docs', 'dev', 'refs', 'api-drift.json'))) {
      fail('API drift report missing. Run: pnpm run docs:api-drift');
    }
    
    // Parse drift JSON and fail if any drift detected
    try {
      const driftPath = p('docs', 'dev', 'refs', 'api-drift.json');
      const driftContent = fs.readFileSync(driftPath, 'utf8');
      const drift = JSON.parse(driftContent);
      
      const missingInOpenAPI = drift.summary?.missingInOpenAPI || 0;
      const missingInCode = drift.summary?.missingInCode || 0;
      const methodDrift = drift.summary?.methodDrift || 0;
      
      if (missingInOpenAPI > 0 || missingInCode > 0 || methodDrift > 0) {
        console.error('API drift detected:');
        console.error(`  missingInOpenAPI: ${missingInOpenAPI}`);
        console.error(`  missingInCode: ${missingInCode}`);
        console.error(`  methodDrift: ${methodDrift}`);
        console.error('Fix: update Express routes or run pnpm run docs:api to refresh OpenAPI; if intentional, allowlist in docs/dev/refs/api-drift-allow.json');
        process.exitCode = 1;
      }
    } catch (error) {
      fail(`Could not parse API drift data: ${error.message}`);
    }
  }

  // db → if prisma dirs exist, their docs must exist
  if (areas.includes('db')) {
    if (exists(p('prisma', 'schema.prisma'))) {
      requireFile(
        p('docs', 'dev', 'refs', 'prisma-pg.schema.md'),
        'pnpm run docs:db'
      );
    }
    if (exists(p('prisma-mongodb', 'schema.prisma'))) {
      requireFile(
        p('docs', 'dev', 'refs', 'prisma-mongo.schema.md'),
        'pnpm run docs:db'
      );
    }
  }

  // frontend → route-map.json, component-map.json, frontend-summary.md, and 04-frontend.md must exist
  if (areas.includes('frontend')) {
    requireFile(
      p('docs', 'dev', 'refs', 'route-map.json'),
      'pnpm run docs:frontend'
    );
    requireFile(
      p('docs', 'dev', 'refs', 'component-map.json'),
      'pnpm run docs:frontend'
    );
    requireFile(
      p('docs', 'dev', 'refs', 'frontend-summary.md'),
      'pnpm run docs:frontend'
    );
    requireFile(p('docs', 'dev', '04-frontend.md'), 'pnpm run docs:frontend');

    // Component docs verification (only when src/components exists)
    const compDir = p('src', 'components');
    if (exists(compDir)) {
      requireFile(
        p('docs', 'dev', '06-components.md'),
        'pnpm run docs:components'
      );
      // presence of refs/components dir is sufficient (files vary by codebase)
      if (!exists(p('docs', 'dev', 'refs', 'components'))) {
        fail(
          'Missing components refs directory. Run: pnpm run docs:components'
        );
      }
      
      // Coverage verification with thresholds
      requireFile(
        p('docs', 'dev', 'refs', 'docs-coverage.json'),
        'pnpm run docs:coverage'
      );
      
      // Parse coverage data and enforce thresholds
      try {
        const coveragePath = p('docs', 'dev', 'refs', 'docs-coverage.json');
        const coverageContent = fs.readFileSync(coveragePath, 'utf8');
        const coverage = JSON.parse(coverageContent);
        
        const minComponentPage = parseFloat(process.env.DOCS_GUARD_MIN_COMPONENT_PAGE || '0.85');
        const minPropDesc = parseFloat(process.env.DOCS_GUARD_MIN_PROP_DESC || '0.50');
        
        const componentCoverage = coverage.percentages.componentCoverage;
        const propCoverage = coverage.percentages.propDescriptionCoverage;
        
        let coverageFailed = false;
        const failures = [];
        
        if (componentCoverage < minComponentPage) {
          coverageFailed = true;
          failures.push(`components with pages: ${componentCoverage.toFixed(2)} < ${minComponentPage} (set DOCS_GUARD_MIN_COMPONENT_PAGE to override)`);
        }
        
        if (propCoverage < minPropDesc) {
          coverageFailed = true;
          failures.push(`props with descriptions: ${propCoverage.toFixed(2)} < ${minPropDesc}`);
        }
        
        if (coverageFailed) {
          console.error('Coverage fail:');
          failures.forEach(f => console.error(`  ${f}`));
          console.error(`Run: pnpm run docs:components && pnpm run docs:coverage`);
          process.exitCode = 1;
        }
      } catch (error) {
        fail(`Could not parse coverage data: ${error.message}`);
      }
    }
  }

  // If any fail() occurred, process.exitCode has been set.
  if (process.exitCode === 1) {
    warn('verification failed — see FAIL messages above.');
  } else {
    log('ok');
  }
}

main().catch(e => {
  console.error('[docs:verify] error:', e?.message || e);
  process.exitCode = 1;
});
