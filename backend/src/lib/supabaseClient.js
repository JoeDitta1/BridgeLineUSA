import { createClient } from '@supabase/supabase-js';

const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

let supabase = null;
if (SUPA_URL && SUPA_KEY) {
  supabase = createClient(SUPA_URL, SUPA_KEY, {
    auth: { persistSession: false },
  });
}

export function getSupabase() {
  return supabase;
}

export default getSupabase;
