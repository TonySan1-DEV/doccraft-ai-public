// Environment Configuration
// Provides fallback values for development when .env is not available

export const env = {
  // Supabase Configuration
  VITE_SUPABASE_URL:
    import.meta.env['VITE_SUPABASE_URL'] || 'https://placeholder.supabase.co',
  VITE_SUPABASE_ANON_KEY:
    import.meta.env['VITE_SUPABASE_ANON_KEY'] || 'placeholder-key',

  // Development Settings
  NODE_ENV: import.meta.env['NODE_ENV'] || 'development',
  VITE_DEV_MODE: import.meta.env['VITE_DEV_MODE'] || 'true',

  // Feature Flags
  VITE_ENABLE_FEEDBACK_SYSTEM:
    import.meta.env['VITE_ENABLE_FEEDBACK_SYSTEM'] || 'true',
  VITE_ENABLE_PRESET_SYSTEM:
    import.meta.env['VITE_ENABLE_PRESET_SYSTEM'] || 'true',
  VITE_ENABLE_PREFERENCE_VERSIONING:
    import.meta.env['VITE_ENABLE_PREFERENCE_VERSIONING'] || 'true',
  VITE_ENABLE_COLLABORATION:
    import.meta.env['VITE_ENABLE_COLLABORATION'] || 'true',
  VITE_ENABLE_AUDIT_LOGS: import.meta.env['VITE_ENABLE_AUDIT_LOGS'] || 'true',

  // Rate Limiting
  VITE_RATE_LIMIT_REQUESTS:
    import.meta.env['VITE_RATE_LIMIT_REQUESTS'] || '100',
  VITE_RATE_LIMIT_WINDOW: import.meta.env['VITE_RATE_LIMIT_WINDOW'] || '900000',

  // Analytics
  VITE_ENABLE_ANALYTICS: import.meta.env['VITE_ENABLE_ANALYTICS'] || 'false',
};

// Log environment status
if (env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
  console.log('🌐 Demo mode - using placeholder Supabase credentials');
}

export default env;
