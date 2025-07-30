import { User } from '@supabase/supabase-js'

declare global {
  // Extend Supabase User type with tier property
  interface ExtendedUser extends User {
    tier?: 'Free' | 'Pro' | 'Admin'
  }

  interface Window {
    logTelemetryEvent?: (eventName: string, data: any) => void;
  }
}

export {}; 