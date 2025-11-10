import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';
import { env } from './config/env';

const supabaseUrl = env.SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

