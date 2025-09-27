import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hacnyrphweteuobxpzaw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhY255cnBod2V0ZXVvYnhwemF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzM1MjcsImV4cCI6MjA3MTc0OTUyN30.0uxv1rLBBvWTu9ZavepyB1RSPQxYtDiroD9t4kZ0HLw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
