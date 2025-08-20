#!/usr/bin/env node
/**
 * Generate a compact status JSON summarizing key docs artifacts,
 * and update an AUTO-GEN:STATUS block in docs/dev/00-overview.md
 * (deterministic, no timestamps).
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as utils from './_utils.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const p = (...x) => path.resolve(root, ...x);
const log = (...a) => console.log('[docs:status]', ...a);

const exists = f => fs.existsSync(f);
const nonEmpty = f => exists(f) && fs.statSync(f).size > 0;
const safeReadJSON = (f, d = null) => {
  try {
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch {
    return d;
  }
};

function summarize() {
  const status = {
    hasSrc: exists(p('src')),
    hasPrismaPg: exists(p('prisma', 'schema.prisma')),
    hasPrismaMongo: exists(p('prisma-mongodb', 'schema.prisma')),
    artifacts: {
      dependencyGraph: nonEmpty(
        p('docs', 'dev', 'refs', 'dependency-graph.md')
      ),
      openapi: nonEmpty(p('docs', 'dev', 'refs', 'openapi.json')),
      prismaPg: nonEmpty(p('docs', 'dev', 'refs', 'prisma-pg.schema.md')),
      prismaMongo: nonEmpty(p('docs', 'dev', 'refs', 'prisma-mongo.schema.md')),
      routeMap: nonEmpty(p('docs', 'dev', 'refs', 'route-map.json')),
      componentMap: nonEmpty(p('docs', 'dev', 'refs', 'component-map.json')),
      frontendMd: nonEmpty(p('docs', 'dev', '04-frontend.md')),
    },
    counts: {
      routes: (() => {
        const j = safeReadJSON(p('docs', 'dev', 'refs', 'route-map.json'), []);
        return Array.isArray(j) ? j.length : 0;
      })(),
      components: (() => {
        const j = safeReadJSON(
          p('docs', 'dev', 'refs', 'component-map.json'),
          {}
        );
        return Object.keys(j).length || 0;
      })(),
      prismaModels: (() => {
        const md = exists(p('docs', 'dev', 'refs', 'prisma-pg.schema.md'))
          ? fs.readFileSync(
              p('docs', 'dev', 'refs', 'prisma-pg.schema.md'),
              'utf8'
            )
          : '';
        const matches = md.match(/^### Model:/gm) || [];
        return matches.length;
      })(),
    },
  };
  return status;
}

function renderStatusMarkdown(s) {
  const lines = [];
  lines.push('<!-- AUTO-GEN:STATUS-START -->');
  lines.push('');
  lines.push('### Docs Guard Status (auto-generated)');
  lines.push('');
  lines.push(`- Routes detected: **${s.counts.routes}**`);
  lines.push(`- Components detected: **${s.counts.components}**`);
  lines.push(`- Prisma models (PG): **${s.counts.prismaModels}**`);
  lines.push('');
  lines.push('**Artifacts:**');
  lines.push('');
  lines.push(
    `- Dependency graph: ${s.artifacts.dependencyGraph ? 'present' : 'missing'}`
  );
  lines.push(`- OpenAPI: ${s.artifacts.openapi ? 'present' : 'missing'}`);
  lines.push(`- Prisma (PG): ${s.artifacts.prismaPg ? 'present' : 'missing'}`);
  lines.push(
    `- Prisma (Mongo): ${s.artifacts.prismaMongo ? 'present' : 'missing'}`
  );
  lines.push(`- Route map: ${s.artifacts.routeMap ? 'present' : 'missing'}`);
  lines.push(
    `- Component map: ${s.artifacts.componentMap ? 'present' : 'missing'}`
  );
  lines.push(
    `- Frontend summary: ${s.artifacts.frontendMd ? 'present' : 'missing'}`
  );
  lines.push('');
  lines.push('<!-- AUTO-GEN:STATUS-END -->');
  lines.push('');
  return lines.join('\n');
}

async function upsertOverviewBlock(markdown) {
  const overviewPath = p('docs', 'dev', '00-overview.md');
  if (!exists(overviewPath)) return; // respect guardrails; base docs already required by verify
  const src = fs.readFileSync(overviewPath, 'utf8');
  const start = '<!-- AUTO-GEN:STATUS-START -->';
  const end = '<!-- AUTO-GEN:STATUS-END -->';
  let next;
  if (src.includes(start) && src.includes(end)) {
    next = src.replace(
      new RegExp(`${start}[\\s\\S]*?${end}`, 'm'),
      markdown.trim()
    );
  } else {
    // Insert after first H1 or append at end
    const idx = src.indexOf('\n');
    if (idx >= 0) next = src + '\n' + markdown;
    else next = src + '\n' + markdown;
  }
  const { changed, reason } = await utils.writeFileIfChanged(
    overviewPath,
    next
  );
  log(
    changed
      ? `updated: ${path.relative(root, overviewPath)}`
      : `unchanged: ${path.relative(root, overviewPath)}`
  );
}

async function main() {
  log('start');
  const status = summarize();
  // 1) Write JSON
  const outJson = p('docs', 'dev', 'refs', 'docs-status.json');
  const jsonContent = JSON.stringify(status, null, 2) + '\n';
  await utils.ensureDir(path.dirname(outJson));
  const { changed } = await utils.writeFileIfChanged(outJson, jsonContent);
  log(
    changed
      ? `wrote: ${path.relative(root, outJson)}`
      : `unchanged: ${path.relative(root, outJson)}`
  );
  // 2) Update overview block
  await upsertOverviewBlock(renderStatusMarkdown(status));
  log('done');
}

main().catch(e => {
  console.error('[docs:status] error:', e?.message || e);
  process.exitCode = 1;
});
