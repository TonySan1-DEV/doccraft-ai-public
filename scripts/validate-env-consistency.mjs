#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const files = [
  'env.template',
  'deploy/production/env.production.template',
].filter(f => fs.existsSync(f));

if (files.length === 0) {
  console.error('❌ No env templates found.');
  process.exit(2);
}

const parseEnv = txt =>
  txt
    .split(/\r?\n/)
    .filter(Boolean)
    .filter(l => !l.startsWith('#'))
    .map(l => l.split('=')[0])
    .filter(Boolean);

const sets = files.map(f => ({
  file: f,
  keys: new Set(parseEnv(fs.readFileSync(f, 'utf8'))),
}));

// (optional) scan k8s env vars
const k8sFile = 'k8s/production/doccraft-ai-deployment.yml';
let k8sKeys = new Set();
if (fs.existsSync(k8sFile)) {
  const raw = fs.readFileSync(k8sFile, 'utf8');
  const matches = [...raw.matchAll(/\bname:\s*([A-Z0-9_]+)/g)];
  matches.forEach(m => k8sKeys.add(m[1]));
}

// Essential frontend variables that must be in env.template
const essentialFrontendVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_ENABLE_COLLABORATION',
  'VITE_ENABLE_ANALYTICS',
  'VITE_ENABLE_VOICE_FEATURES',
  'VITE_APP_ENV',
];

// Essential server variables that must be in production template
const essentialServerVars = [
  'NODE_ENV',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'JWT_SECRET',
  'DATABASE_URL',
  'REDIS_URL',
];

const union = new Set();
sets.forEach(s => s.keys.forEach(k => union.add(k)));
k8sKeys.forEach(k => union.add(k));

// Check essential variables are present
const frontendTemplate = sets.find(s => s.file === 'env.template');
const productionTemplate = sets.find(
  s => s.file === 'deploy/production/env.production.template'
);

const missingEssentialFrontend = frontendTemplate
  ? essentialFrontendVars.filter(k => !frontendTemplate.keys.has(k))
  : [];

const missingEssentialServer = productionTemplate
  ? essentialServerVars.filter(k => !productionTemplate.keys.has(k))
  : [];

const viteViolations = [...union].filter(
  k =>
    (k.startsWith('VITE_') &&
      [
        'OPENAI_API_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'JWT_SECRET',
        'DATABASE_URL',
      ].includes(k.replace(/^VITE_/, ''))) ||
    (!k.startsWith('VITE_') &&
      [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
        'VITE_ENVIRONMENT',
        'VITE_OPENAI_API_KEY',
      ].includes(k))
);

const report = {
  union: [...union].sort(),
  missingEssentialFrontend,
  missingEssentialServer,
  viteViolations,
};

fs.mkdirSync('.artifacts', { recursive: true });
fs.writeFileSync(
  '.artifacts/env-consistency.json',
  JSON.stringify(report, null, 2)
);

if (
  viteViolations.length ||
  missingEssentialFrontend.length ||
  missingEssentialServer.length
) {
  console.error(
    '❌ Env consistency failed. See .artifacts/env-consistency.json'
  );
  if (missingEssentialFrontend.length) {
    console.error(
      `Missing essential frontend vars: ${missingEssentialFrontend.join(', ')}`
    );
  }
  if (missingEssentialServer.length) {
    console.error(
      `Missing essential server vars: ${missingEssentialServer.join(', ')}`
    );
  }
  if (viteViolations.length) {
    console.error(`VITE violations: ${viteViolations.join(', ')}`);
  }
  process.exit(1);
}
console.log('✅ Env consistency OK');
