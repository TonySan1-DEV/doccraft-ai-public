import { readFile } from 'fs/promises';

const reportPath = 'audit/i18n-report.json';
let missingTotal = 0;
try {
  const data = JSON.parse(await readFile(reportPath, 'utf8'));
  const byLang = data.missingKeysByLanguage || {};
  for (const [lang, arr] of Object.entries(byLang)) missingTotal += (arr?.length || 0);
} catch (e) {
  console.error('Could not read audit file:', e.message);
  process.exit(1);
}

if (missingTotal > 0) {
  console.error(` i18n missing keys detected: ${missingTotal}`);
  process.exit(1);
} else {
  console.log(' i18n keys complete for audited calls.');
}
