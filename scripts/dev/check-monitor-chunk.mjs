import fs from 'fs';
import path from 'path';
try {
  const manifestPath = ['dist/.vite/manifest.json', 'dist/manifest.json']
    .map(p => path.resolve(p))
    .find(p => fs.existsSync(p));
  if (!manifestPath) {
    console.log('monitor chunk check: manifest not found (skip)');
    process.exit(0);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const has = Object.values(manifest).some(
    e =>
      typeof e === 'object' &&
      e.file &&
      /perf-monitor|monitoring\/performanceMonitor/i.test(JSON.stringify(e))
  );
  console.log(
    `monitor chunk present: ${has ? 'YES' : 'NO (maybe tree-shaken)'}`
  );
  process.exit(0);
} catch {
  process.exit(0);
}
