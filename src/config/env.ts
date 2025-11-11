interface EnvConfig {
  
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  DEV_BASE_API_URL: string;
  PROD_BASE_API_URL: string;
  LOOKALIKE_API_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  
}

export const env: EnvConfig = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL_1 || import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY_1 || import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  DEV_BASE_API_URL: import.meta.env.VITE_DEV_BASE_API_URL || '',
  PROD_BASE_API_URL: import.meta.env.VITE_PROD_BASE_API_URL || '',
  LOOKALIKE_API_URL: import.meta.env.VITE_LOOKALIKE_API_URL || 'http://localhost:8000/lookalike',
  SUPABASE_SERVICE_ROLE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
};






