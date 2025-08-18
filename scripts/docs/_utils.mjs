import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

export async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

export async function writeFileIfChanged(filePath, content) {
  await ensureDir(path.dirname(filePath));
  let old = null;
  try {
    old = await fsp.readFile(filePath, 'utf8');
  } catch {}
  if (old === content) return { changed: false };
  await fsp.writeFile(filePath, content, 'utf8');
  return { changed: true };
}

export function logStep(msg) {
  console.log(`[docs] ${msg}`);
}

export function exitError(msg) {
  console.error(`[docs:ERROR] ${msg}`);
  process.exit(1);
}
