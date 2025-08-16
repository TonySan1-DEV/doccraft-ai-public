import fs from 'fs';
import path from 'path';

export async function envContext() {
  const envFile = path.resolve(process.cwd(), 'config/.env.test');
  if (!fs.existsSync(envFile)) return { error: '.env.test not found' };

  const env: Record<string, string> = {};
  const lines = fs.readFileSync(envFile, 'utf-8').split('\n');
  for (const line of lines) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key) {
        env[key] = value || 'NOT_SET';
      }
    }
  }

  return { env };
}
