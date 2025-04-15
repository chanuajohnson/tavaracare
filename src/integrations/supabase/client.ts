
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables from .env files
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const CURRENT_ENV = import.meta.env.VITE_ENV || 'development';

// Improved error handling for Supabase initialization
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(`
    ⚠️ Missing Supabase Credentials ⚠️
    
    Required environment variables not found:
    ${!SUPABASE_URL ? '- VITE_SUPABASE_URL' : ''}
    ${!SUPABASE_ANON_KEY ? '- VITE_SUPABASE_ANON_KEY' : ''}
    
    Troubleshooting Steps:
    1. Check .env.development and .env.production files
    2. Verify Lovable project environment variables
    3. Confirm GitHub secrets are correctly configured
  `);
}

// Fallback values for development (optional)
const developmentFallbackUrl = 'https://cpdfmyemjrefnhddyrck.supabase.co';
const developmentFallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZGZteWVtanJlZm5oZGR5cmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MjcwODAsImV4cCI6MjA1NTQwMzA4MH0.9LwhYWSuTbiqvSGGPAT7nfz8IFZIgnNzYoa_hLQ_2PY';

const finalSupabaseUrl = SUPABASE_URL || (CURRENT_ENV === 'development' ? developmentFallbackUrl : '');
const finalSupabaseKey = SUPABASE_ANON_KEY || (CURRENT_ENV === 'development' ? developmentFallbackKey : '');

export const supabase = createClient<Database>(
  finalSupabaseUrl,
  finalSupabaseKey, 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'x-client-env': CURRENT_ENV,
        'x-app-version': '1.0',
      },
    },
  }
);

// Logging environment details
console.log(`Supabase Initialization Details:`);
console.log(`- Environment: ${CURRENT_ENV}`);
console.log(`- Supabase URL: ${finalSupabaseUrl ? '[MASKED]' : 'UNDEFINED'}`);
console.log(`- Using Fallback Credentials: ${!SUPABASE_URL || !SUPABASE_ANON_KEY}`);

export default supabase;
