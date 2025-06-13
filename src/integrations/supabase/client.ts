
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cpdfmyemjrefnhddyrck.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZGZteWVtanJlZm5oZGR5cmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MjcwODAsImV4cCI6MjA1NTQwMzA4MH0.9LwhYWSuTbiqvSGGPAT7nfz8IFZIgnNzYoa_hLQ_2PY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});
