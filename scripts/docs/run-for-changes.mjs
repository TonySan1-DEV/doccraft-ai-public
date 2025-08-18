import fs from 'fs';
import fsp from 'fs/promises';
import { spawn } from 'node:child_process';
import path from 'path';

function log(msg) {
  console.log(`[docs] ${msg}`);
}
function err(msg) {
  console.error(`[docs:ERROR] ${msg}`);
}
function sh(cmd, args = [], opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts });
    p.on('exit', code =>
      code === 0 ? resolve(0) : reject(new Error(`${cmd} exit ${code}`))
    );
  });
}

async function readPkg() {
  try {
    const raw = await fsp.readFile('package.json', 'utf8');
    return JSON.parse(raw);
  } catch {
    return { scripts: {} };
  }
}

function hasScript(pkg, name) {
  return Boolean(pkg?.scripts?.[name]);
}

function detectPm() {
  if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (fs.existsSync('yarn.lock')) return 'yarn';
  return 'npm';
}
async function runScript(name) {
  const pm = detectPm();
  const cmd =
    pm === 'pnpm'
      ? ['pnpm', 'run', name]
      : pm === 'yarn'
        ? ['yarn', name]
        : ['npm', 'run', name, '--silent'];
  log(`Running ${cmd.join(' ')}`);
  const [bin, ...args] = cmd;
  return sh(bin, args);
}

async function gitDiffFiles() {
  try {
    // try upstream of current branch first
    let base = process.env.DOCS_BASE;
    if (!base) {
      try {
        const out = await new Promise(resolve => {
          const p = spawn(
            'git',
            ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'],
            { shell: true, stdio: ['ignore', 'pipe', 'inherit'] }
          );
          let buf = '';
          p.stdout.on('data', d => (buf += d.toString()));
          p.on('close', () => resolve(buf.trim()));
        });
        if (out) base = out; // e.g., origin/main
      } catch {}
    }
    if (!base) base = 'origin/main';

    const files = await new Promise(resolve => {
      const p = spawn('git', ['diff', '--name-only', `${base}...HEAD`], {
        shell: true,
        stdio: ['ignore', 'pipe', 'inherit'],
      });
      let buf = '';
      p.stdout.on('data', d => (buf += d.toString()));
      p.on('close', () =>
        resolve(
          buf
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean)
        )
      );
    });
    return files;
  } catch {
    return [];
  }
}

(async () => {
  const pkg = await readPkg();
  const changed = await gitDiffFiles();

  if (!changed.length) {
    log('No changed files detected or no git context. Safe fallback.');
    if (hasScript(pkg, 'docs:deps'))
      await runScript('docs:deps').catch(() => {});
    if (hasScript(pkg, 'docs:overview'))
      await runScript('docs:overview').catch(() => {});
    else if (hasScript(pkg, 'docs:all'))
      await runScript('docs:all').catch(() => {});
    process.exit(0);
  }

  log(`Changed files: ${changed.length}`);
  const want = new Set();

  const matchAny = globs =>
    changed.some(f => globs.some(g => f.startsWith(g) || f.includes(g)));

  if (matchAny(['api/', 'server/', 'functions/', 'pages/api/']))
    want.add('api');
  if (matchAny(['prisma/', 'prisma-mongodb/', 'migrations/'])) want.add('db');
  if (matchAny(['src/components/', 'src/app/', 'src/routes/', 'src/pages/']))
    want.add('frontend');
  if (
    matchAny([
      'package.json',
      'vite.config',
      'tsconfig',
      '.github/workflows',
      'Dockerfile',
    ])
  )
    want.add('deps');
  // always refresh overview if available
  want.add('overview');

  log('Targets: ' + Array.from(want).join(', '));

  for (const t of want) {
    const name =
      t === 'api'
        ? 'docs:api'
        : t === 'db'
          ? 'docs:db'
          : t === 'frontend'
            ? 'docs:frontend'
            : t === 'deps'
              ? 'docs:deps'
              : t === 'overview'
                ? 'docs:overview'
                : null;

    if (!name) continue;
    if (!hasScript(pkg, name)) {
      log(`Skipping ${t} (missing script ${name})`);
      continue;
    }
    await runScript(name).catch(e => {
      err(`Generator ${name} failed: ${e.message}`);
    });
  }
})();
