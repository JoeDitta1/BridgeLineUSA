import getSupabase from '../backend/src/lib/supabaseClient.js';
import process from 'process';

const SUPABASE_BUCKET = process.env.SUPABASE_QUOTES_BUCKET || 'quotes';
const quoteNo = process.env.QUOTE_NO || 'SCM-Q0013';
const customer = process.env.CUSTOMER || 'TestCo';

async function main() {
  const supabase = getSupabase();
  if (!supabase) {
    console.log('Supabase not configured (check backend/.env.local)');
    return;
  }
  const customerSafe = String(customer).toLowerCase().replace(/[^\w-]/g, '_');
  const root = `quotes/${customerSafe}/${quoteNo}/00-Quote-Form`;
  const manifestKey = `${root}/manifest.json`;
  try {
    const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).download(manifestKey).catch(e => ({ data: null, error: e }));
    if (error) {
      console.error('manifest download error:', error.message || error);
      return;
    }
    if (!data) { console.log('No manifest object found'); return; }
    const buf = Buffer.from(await data.arrayBuffer());
    console.log('Manifest contents:\n', buf.toString());
  } catch (e) {
    console.error('check_manifest error:', e?.message || e);
  }
}

main();
