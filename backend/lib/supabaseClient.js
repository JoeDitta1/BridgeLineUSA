import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// If SUPABASE env vars aren't set, try to load a .env.local for dev convenience.
// Support both starting the server from the repo root or from the backend folder.
try {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const candidates = [
      path.resolve(process.cwd(), '.env.local'),
      path.resolve(process.cwd(), 'backend', '.env.local')
    ];
    for (const maybe of candidates) {
      if (fs.existsSync(maybe)) {
        dotenv.config({ path: maybe });
        // eslint-disable-next-line no-console
        console.log('[supabase] loaded env from', maybe);
        break;
      }
    }
  }
} catch (e) {
  // ignore
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
    global: { headers: { 'X-Client-Info': 'BridgeLineUSA-Server' } }
  });
  console.log('[supabase] client configured');
} else {
  console.warn('[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set; supabase client disabled');
}

export { supabase };
