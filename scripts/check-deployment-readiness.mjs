#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const run = (cmd, args) => {
  const res = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  return res.status === 0;
};

fs.mkdirSync('.artifacts', { recursive: true });
const results = {};

console.log('🔍 Running deployment readiness checks...\n');

results.env = run('node', ['scripts/validate-env-consistency.mjs']);
results.docker = run('node', ['scripts/validate-docker-build.mjs']);

const ok = Object.values(results).every(Boolean);

// Save results
fs.writeFileSync(
  '.artifacts/deploy-readiness.json',
  JSON.stringify({ ...results, ok }, null, 2)
);

if (!ok) {
  console.error('\n❌ Deployment readiness checks failed. See .artifacts/*');
  process.exit(1);
}

console.log('\n🎉 All deployment readiness checks passed.');
console.log('📊 Results saved to .artifacts/deploy-readiness.json');
