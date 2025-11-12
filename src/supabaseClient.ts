import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';
import { env } from './config/env';

// Read from environment variables via the env config
const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Fail fast – makes mis-config obvious during development
  throw new Error(
    "Supabase environment variables are missing. " +
    "Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file (local) or Netlify environment variables (production)."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
