// scripts/docs/generate-openapi-from-express.mjs
/* eslint-disable no-console */
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

let writeFileIfChanged, ensureDir, log;

// Initialize utils with fallbacks
writeFileIfChanged = async (absFile, content) => {
  try {
    const prev = await fsp.readFile(absFile, 'utf8');
    if (prev === content) return false;
  } catch {}
  await fsp.mkdir(path.dirname(absFile), { recursive: true });
  await fsp.writeFile(absFile, content, 'utf8');
  return true;
};
ensureDir = async p => {
  await fsp.mkdir(p, { recursive: true });
};
log = s => console.log(s);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '../..');
const SERVER_DIR = path.resolve(ROOT, 'server'); // change here if your server lives elsewhere
const REFS_DIR = path.resolve(ROOT, 'docs/dev/refs');
const API_PAGE = path.resolve(ROOT, 'docs/dev/05-api.md');
const OPENAPI_JSON = path.resolve(REFS_DIR, 'openapi.json');
const OPENAPI_SUMMARY = path.resolve(REFS_DIR, 'openapi-summary.md');

const POSIX = p => p.split(path.sep).join('/'); // stable for git paths, Windows-safe

// Heuristics: scan *.ts/*.js in server/**/* for express route registrations
// Supported patterns:
//   app.get("/path", ...)
//   app.post('/path', ...)
//   router.put(`/path/:id`, ...)
//   router[method](path, ...)
// Optional JSDoc above handlers:
//   /**
//    * @summary Create document
//    * @route POST /api/documents
//    * @param {string} id path
//    * @tag Documents
//    * @response 201 Created
//    */
async function collectServerFiles() {
  try {
    await fsp.access(SERVER_DIR, fs.constants.F_OK);
    log(`[api-docs] server dir exists: ${SERVER_DIR}`);
  } catch {
    log(`[api-docs] server dir not found: ${SERVER_DIR}`);
    return [];
  }
  const files = [];
  async function walk(dir) {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith('.')) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        // skip build artifacts by name
        if (['dist', 'build', 'node_modules', 'coverage'].includes(e.name))
          continue;
        await walk(full);
      } else if (/\.(ts|js|mjs|cjs)$/.test(e.name)) {
        files.push(full);
        log(`[api-docs] found server file: ${full}`);
      }
    }
  }
  await walk(SERVER_DIR);
  log(`[api-docs] total server files found: ${files.length}`);
  return files;
}

// Very light parser (regex + small state) to avoid build deps
const routeRegexes = [
  // router.METHOD("path"
  /(?:router|app)\.(get|post|put|delete|patch|options|head)\s*\(\s*([`'"])(.*?)\2/gi,
  // router[method]("path"
  /(?:router|app)\s*\[\s*([`'"])(get|post|put|delete|patch|options|head)\1\s*\]\s*\(\s*([`'"])(.*?)\3/gi,
];

function extractJsDocAbove(content, idx) {
  // find the nearest /** ... */ block before idx
  const start = content.lastIndexOf('/**', idx);
  if (start === -1) return {};
  const end = content.indexOf('*/', start);
  if (end === -1 || end > idx) return {};
  const block = content
    .slice(start + 3, end)
    .split('\n')
    .map(s => s.replace(/^\s*\*\s?/, ''))
    .join('\n');

  // parse lightweight tags
  const meta = {};
  const summary = block.match(/@summary\s+(.+)/i);
  const route = block.match(/@route\s+([A-Z]+)\s+(\S+)/i);
  const tags = [...block.matchAll(/@tag\s+(.+)/gi)].map(m => m[1].trim());
  const responses = [...block.matchAll(/@response\s+(\d{3})\s+(.+)/gi)].map(
    m => ({ code: m[1], desc: m[2].trim() })
  );
  const params = [
    ...block.matchAll(/@param\s+\{([^}]+)\}\s+(\S+)\s*(.*)/gi),
  ].map(m => ({ type: m[1], name: m[2], desc: m[3] || '' }));
  if (summary) meta.summary = summary[1].trim();
  if (route) meta.route = { method: route[1].toLowerCase(), path: route[2] };
  if (tags.length) meta.tags = tags;
  if (responses.length) meta.responses = responses;
  if (params.length) meta.params = params;
  return meta;
}

function normalizePath(p) {
  // Ensure OpenAPI-style path params: :id -> {id}
  return p.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
}

async function buildOpenApi(files) {
  const paths = {}; // { "/api/x": { get: { ... }, post: {...} } }
  const used = [];

  for (const abs of files) {
    const content = await fsp.readFile(abs, 'utf8');
    const fileRel = POSIX(path.relative(ROOT, abs));

    // collect candidates
    for (const rx of routeRegexes) {
      rx.lastIndex = 0;
      let m;
      while ((m = rx.exec(content))) {
        // patterns differ: capture method + path in positions
        let method, rawPath;
        if (m.length === 4) {
          // router.get("path"
          method = m[1].toLowerCase();
          rawPath = m[3];
        } else if (m.length === 5) {
          // router['get']("path"
          method = m[2].toLowerCase();
          rawPath = m[4];
        } else {
          continue;
        }
        const indexInFile = m.index;

        // prefer @route tag if present (can override both)
        const jsdoc = extractJsDocAbove(content, indexInFile);
        if (jsdoc.route) {
          method = jsdoc.route.method || method;
          rawPath = jsdoc.route.path || rawPath;
        }

        if (!rawPath || !/^[./]/.test(rawPath)) {
          // ignore variables/concats for deterministic output
          continue;
        }

        const pth = normalizePath(rawPath);
        const op = {
          summary: jsdoc.summary || '',
          tags: jsdoc.tags || [],
          parameters: (jsdoc.params || [])
            .filter(p => /path/i.test(p.type) || /param/i.test(p.type))
            .map(p => ({
              name: p.name.replace(/^[\[\]]/g, ''),
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: p.desc || '',
            })),
          responses: {},
        };
        for (const r of jsdoc.responses || []) {
          op.responses[r.code] = { description: r.desc };
        }
        if (!Object.keys(op.responses).length) {
          op.responses['200'] = { description: 'OK' };
        }

        paths[pth] = paths[pth] || {};
        // do not overwrite an existing method for determinism; first seen wins
        if (!paths[pth][method]) {
          paths[pth][method] = op;
          used.push({ file: fileRel, method, path: pth });
        }
      }
    }
  }

  // Minimal OpenAPI 3.1 envelope (deterministic; no timestamps)
  const openapi = {
    openapi: '3.1.0',
    info: {
      title: 'DocCraft-AI API (heuristic from Express)',
      version: '0.1.0',
      description:
        'This file is generated by scripts/docs/generate-openapi-from-express.mjs using static scanning. Edit server JSDoc to improve summaries.',
    },
    paths,
  };

  return { openapi, used };
}

function renderSummaryMarkdown(openapi, used) {
  const lines = [
    '<!--',
    ' Auto-generated by scripts/docs/generate-openapi-from-express.mjs',
    ' Deterministic banner: no timestamps.',
    '-->',
    '',
    '# API Summary',
    '',
    `Paths detected: ${Object.keys(openapi.paths).length}`,
    '',
    '## Sample (first 20)',
    '',
    '| Method | Path | Summary |',
    '|---|---|---|',
  ];

  const rows = [];
  for (const p of Object.keys(openapi.paths).sort()) {
    for (const m of Object.keys(openapi.paths[p]).sort()) {
      const s = openapi.paths[p][m].summary || '';
      rows.push(
        `| \`${m.toUpperCase()}\` | \`${p}\` | ${s.replace(/\|/g, '\\|')} |`
      );
    }
  }
  lines.push(...rows.slice(0, 20));

  lines.push(
    '',
    '## Source Files (first 20)',
    '',
    '| File | Method | Path |',
    '|---|---|---|'
  );
  const srcRows = used
    .slice(0, 20)
    .map(u => `| ${u.file} | \`${u.method.toUpperCase()}\` | \`${u.path}\` |`);
  lines.push(...srcRows, '');

  return lines.join('\n');
}

async function upsertApiPage(openapi) {
  const AUTO_START = '<!-- AUTO-GEN:API-START -->';
  const AUTO_END = '<!-- AUTO-GEN:API-END -->';
  const md = [
    '<!--',
    ' Auto-generated section by scripts/docs/generate-openapi-from-express.mjs',
    ' Deterministic banner: no timestamps.',
    '-->',
    '',
    '# Backend API',
    '',
    'This page summarizes the Express API detected by static scanning. Improve accuracy with JSDoc `@route`, `@summary`, `@response`, `@param`, `@tag`.',
    '',
    AUTO_START,
    '',
    '### Overview',
    '',
    `- Paths detected: **${Object.keys(openapi.paths).length}**`,
    '',
    '### Example',
    '',
    '```json',
    JSON.stringify(
      { paths: Object.fromEntries(Object.entries(openapi.paths).slice(0, 1)) },
      null,
      2
    ),
    '```',
    '',
    AUTO_END,
    '',
  ].join('\n');

  // Merge/patch an existing file preserving content outside AUTO-GEN block
  let out = md;
  try {
    const existing = await fsp.readFile(API_PAGE, 'utf8');
    const startIdx = existing.indexOf(AUTO_START);
    const endIdx = existing.indexOf(AUTO_END);
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      out =
        existing.slice(0, startIdx) +
        md.slice(
          md.indexOf(AUTO_START),
          md.indexOf(AUTO_END) + AUTO_END.length
        ) +
        existing.slice(endIdx + AUTO_END.length);
    } else {
      // Prepend our section, keep existing content below
      out = md + '\n' + existing;
    }
  } catch {}
  const wrote = await writeFileIfChanged(API_PAGE, out);
  log(
    `[api-docs] ${wrote ? 'updated' : 'unchanged'}: ${POSIX(path.relative(ROOT, API_PAGE))}`
  );
}

async function main() {
  log('[api-docs] start');

  const files = await collectServerFiles();
  if (!files.length) {
    log('[api-docs] skip: server directory or source files not found.');
    log('[api-docs] done');
    return;
  }

  const { openapi, used } = await buildOpenApi(files);

  // Emit refs
  const openapiStr = JSON.stringify(openapi, null, 2);
  const wroteJson = await writeFileIfChanged(OPENAPI_JSON, openapiStr);
  log(
    `[api-docs] ${wroteJson ? 'wrote' : 'unchanged'}: ${POSIX(path.relative(ROOT, OPENAPI_JSON))}`
  );

  const summaryMd = renderSummaryMarkdown(openapi, used);
  const wroteMd = await writeFileIfChanged(OPENAPI_SUMMARY, summaryMd);
  log(
    `[api-docs] ${wroteMd ? 'wrote' : 'unchanged'}: ${POSIX(path.relative(ROOT, OPENAPI_SUMMARY))}`
  );

  // Upsert 05-api.md with AUTO-GEN
  await upsertApiPage(openapi);

  log('[api-docs] done');
}

main().catch(e => {
  console.error('[api-docs] non-fatal error:', e?.message || e);
  process.exit(0); // never break builds
});
