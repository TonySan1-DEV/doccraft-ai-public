// Robust Jest mock for import.meta.env

// Define the required env vars for DocCraft-AI v3
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'OPENAI_API_KEY',
];

const envVars: Record<string, string> = {};
const usingFallbacks: string[] = [];

// Populate envVars, checking for fallbacks
for (const key of requiredEnvVars) {
  if (process.env[key]) {
    envVars[key] = process.env[key] as string;
  } else {
    // Provide fallback dummy value
    envVars[key] = `${key.toLowerCase()}-fallback`;
    usingFallbacks.push(key);
  }
}

// CI-only debug logging
if (process.env.CI === 'true') {
  console.log('🧪 [CI] Jest setup: Injecting import.meta.env values:', envVars);

  if (usingFallbacks.length > 0) {
    console.warn(
      `⚠️ [CI] Some env vars were missing and replaced with fallbacks: ${usingFallbacks.join(', ')}`
    );
  }
}

// Define global import.meta mock
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: envVars,
    },
  },
});
