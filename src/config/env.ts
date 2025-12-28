interface EnvConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  DEV_BASE_API_URL: string;
  PROD_BASE_API_URL: string;
  STAGE_BASE_API_URL?: string;
  APP_ENV?: string; // dev | stage | prod
  SUPABASE_SERVICE_ROLE_KEY: string;
  LOOKALIKE_API_URL?: string; // legacy optional
}

export const env: EnvConfig = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  DEV_BASE_API_URL: import.meta.env.VITE_DEV_BASE_API_URL || '',
  PROD_BASE_API_URL: import.meta.env.VITE_PROD_BASE_API_URL || '',
  STAGE_BASE_API_URL: import.meta.env.VITE_STAGE_BASE_API_URL,
  APP_ENV: import.meta.env.VITE_APP_ENV,
  SUPABASE_SERVICE_ROLE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
  LOOKALIKE_API_URL: import.meta.env.VITE_LOOKALIKE_API_URL, // optional legacy override
};






