import { promises as fs } from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const LOCALES = path.join(SRC, 'locales');

async function exists(p){ try { await fs.access(p); return true; } catch { return false; } }
async function readJSON(p){ try { return JSON.parse(await fs.readFile(p, 'utf8')); } catch { return null; } }

async function findLocales() {
  if (!await exists(LOCALES)) return { langs: [], map: {} };
  const entries = await fs.readdir(LOCALES, { withFileTypes: true });
  const langs = entries.filter(e => e.isDirectory()).map(e => e.name);
  const map = {};
  for (const lang of langs) {
    const dir = path.join(LOCALES, lang);
    const files = (await fs.readdir(dir)).filter(f => f.endsWith('.json'));
    map[lang] = {};
    for (const f of files) {
      const ns = f.replace(/\.json$/, '');
      map[lang][ns] = await readJSON(path.join(dir, f));
    }
  }
  return { langs, map };
}

async function scanTCalls() {
  const files = [];
  async function walk(dir) {
    for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) await walk(p);
      else if (p.endsWith('.ts') || p.endsWith('.tsx')) files.push(p);
    }
  }
  if (await exists(SRC)) await walk(SRC);
  const calls = [];
  const rx = /(?:^|[^a-zA-Z0-9_])(t\(|i18n\.t\()\s*['"]([\w-]+):([\w.-]+)['"]/g;
  for (const f of files) {
    const text = await fs.readFile(f, 'utf8');
    let m; while ((m = rx.exec(text)) !== null) {
      calls.push({ file: path.relative(ROOT, f), ns: m[2], key: m[3] });
    }
  }
  return calls;
}

(async () => {
  const pkg = await readJSON(path.join(ROOT, 'package.json'));
  const { langs, map } = await findLocales();
  const calls = await scanTCalls();

  const namespaces = new Set();
  Object.values(map).forEach(nsMap => Object.keys(nsMap || {}).forEach(n => namespaces.add(n)));

  const missing = {};
  for (const lang of langs) {
    const list = [];
    for (const c of calls) {
      const nsObj = map[lang]?.[c.ns];
      if (!nsObj || !Object.prototype.hasOwnProperty.call(nsObj, c.key)) {
        list.push(c);
      }
    }
    missing[lang] = list;
  }

  const out = {
    repo: path.basename(ROOT),
    meta: {
      languages: langs,
      namespaces: Array.from(namespaces),
      defaultBranchHint: process.env.DEFAULT_BRANCH || 'main'
    },
    packages: {
      dependencies: pkg?.dependencies ?? {},
      devDependencies: pkg?.devDependencies ?? {}
    },
    i18n: {
      localesDirExists: await exists(LOCALES),
      totalTCalls: calls.length,
      sampleCalls: calls.slice(0, 40)
    },
    missingKeysByLanguage: missing
  };

  await fs.mkdir(path.join(ROOT, 'audit'), { recursive: true });
  await fs.writeFile(path.join(ROOT, 'audit/i18n-report.json'), JSON.stringify(out, null, 2));
  console.log('Wrote audit/i18n-report.json');
})();
