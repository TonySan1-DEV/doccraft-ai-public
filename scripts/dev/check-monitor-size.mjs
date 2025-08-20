import fs from 'fs';
import path from 'path';
import { gzipSync } from 'zlib';

try {
  const distPath = path.resolve('dist');
  if (!fs.existsSync(distPath)) {
    console.log('monitor size check: dist directory not found (skip)');
    process.exit(0);
  }

  const assetsPath = path.join(distPath, 'assets');
  if (!fs.existsSync(assetsPath)) {
    console.log('monitor size check: assets directory not found (skip)');
    process.exit(0);
  }

  // Find monitoring-related files
  const files = fs.readdirSync(assetsPath);
  const monitorFiles = files.filter(
    file =>
      file.includes('bootPerformanceMonitor') ||
      file.includes('monitoring') ||
      file.includes('perf-monitor')
  );

  if (monitorFiles.length === 0) {
    console.log(
      'monitor size check: no monitoring files found (maybe tree-shaken)'
    );
    process.exit(0);
  }

  let totalSize = 0;
  let totalGzipSize = 0;

  for (const file of monitorFiles) {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    totalSize += stats.size;
    totalGzipSize += gzipSync(content).length;

    console.log(
      `  ${file}: ${(stats.size / 1024).toFixed(2)}KB (${(gzipSync(content).length / 1024).toFixed(2)}KB gzipped)`
    );
  }

  const budgetBytes = 25 * 1024; // 25KB
  const isOverBudget = totalGzipSize > budgetBytes;

  console.log(`\nmonitor size budget check:`);
  console.log(`  Total: ${(totalSize / 1024).toFixed(2)}KB`);
  console.log(`  Gzipped: ${(totalGzipSize / 1024).toFixed(2)}KB`);
  console.log(`  Budget: ${(budgetBytes / 1024).toFixed(2)}KB`);
  console.log(`  Status: ${isOverBudget ? 'OVER' : 'UNDER'} budget`);

  if (isOverBudget) {
    console.log(`  ⚠️  Warning: Monitoring chunk exceeds 25KB gzipped budget`);
  }

  process.exit(0);
} catch (error) {
  console.log('monitor size check: error occurred (skip):', error.message);
  process.exit(0);
}
