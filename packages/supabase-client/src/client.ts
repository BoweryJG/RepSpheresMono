/// <reference types="vite/client" />

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/** Initialize Supabase client using environment variables. */
export function createClient() {
  const url = import.meta.env.VITE_SUPABASE_URL || process.env.NX_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.NX_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase URL or ANON key');
  return createSupabaseClient(url, key);
}
