interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  openai: {
    apiKey: string;
  };
  app: {
    environment: 'development' | 'staging' | 'production';
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableDemo: boolean;
  };
}

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

function validateEnvironment(): AppConfig {
  const missing = requiredEnvVars.filter(varName => !import.meta.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  // Warn about missing OpenAI API key but don't crash the app
  if (!import.meta.env['VITE_OPENAI_API_KEY']) {
    console.warn(
      '⚠️ VITE_OPENAI_API_KEY not found. AI features will be limited.'
    );
  }

  return {
    supabase: {
      url: import.meta.env['VITE_SUPABASE_URL'],
      anonKey: import.meta.env['VITE_SUPABASE_ANON_KEY'],
    },
    openai: {
      apiKey: import.meta.env['VITE_OPENAI_API_KEY'] || '',
    },
    app: {
      environment:
        (import.meta.env[
          'VITE_ENVIRONMENT'
        ] as AppConfig['app']['environment']) || 'development',
      logLevel:
        (import.meta.env['VITE_LOG_LEVEL'] as AppConfig['app']['logLevel']) ||
        'info',
      enableDemo: import.meta.env['VITE_ENABLE_DEMO'] === 'true',
    },
  };
}

export const config = validateEnvironment();
