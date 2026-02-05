 // Supabase client for Mana Angadi project
 // Hardcoded to bypass Cloud-managed environment variables
 import { createClient } from '@supabase/supabase-js';
 import type { Database } from '@/integrations/supabase/types';
 
 // Mana Angadi Supabase project credentials
 const SUPABASE_URL = 'https://yrqxuwttnqcewivcfmgu.supabase.co';
 const SUPABASE_ANON_KEY = 'sb_publishable_lkEVcieLZBOPHqM3lXENww_CYQSP9Eh';
 
 export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Log the connected Supabase project on app load
console.log(`[Supabase] Connected to: ${SUPABASE_URL}`);
