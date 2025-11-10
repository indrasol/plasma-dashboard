import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';
import { env } from './config/env';

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fail fast – makes mis-config obvious during development
  throw new Error("Supabase environment variables are missing");
}
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: "supabase.auth.token",
    flowType: "pkce",
  },
  global: {
    headers: {
      "X-Client-Info": "centroidAI",
    },
  },
});

