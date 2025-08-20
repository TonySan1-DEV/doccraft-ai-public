/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // Add other environment variables as needed
  
  // DocCraft-AI Feature Flags
  readonly VITE_FEATURE_I18N: string;
  readonly VITE_FEATURE_AGENTICS: string;
  readonly VITE_FEATURE_AUDIOBOOK: string;
  readonly VITE_FEATURE_CHILDRENS_GENRE: string;
  readonly VITE_FEATURE_ENHANCED_IMAGERY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
