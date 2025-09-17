import { createClient } from '@supabase/supabase-js';
import * as dbModule from './src/db.js';

const db = dbModule.default ?? dbModule.db ?? dbModule;

// Test Supabase connectivity
async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');

    // Get credentials from kv_store
    const urlRow = db.prepare("SELECT value FROM kv_store WHERE key = 'SUPABASE_URL'").get();
    const keyRow = db.prepare("SELECT value FROM kv_store WHERE key = 'SUPABASE_ANON_KEY'").get();

    const supabaseUrl = urlRow?.value;
    const supabaseAnonKey = keyRow?.value;

    console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
    console.log('Supabase Key:', supabaseAnonKey ? 'Found' : 'Missing');

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase credentials not found in kv_store');
      return false;
    }

    // Create client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client created');

    // Test basic connectivity
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('Supabase connection failed:', error.message);
      return false;
    }

    console.log('Supabase connection successful!');
    console.log('Available buckets:', data?.map(b => b.name) || []);

    // Check if our bucket exists
    const quoteFilesBucket = data?.find(b => b.name === 'quote-files');
    if (quoteFilesBucket) {
      console.log('✅ quote-files bucket found');
    } else {
      console.log('⚠️  quote-files bucket not found');
    }

    return true;
  } catch (error) {
    console.error('Test failed:', error.message);
    return false;
  } finally {
    db.close();
  }
}

testSupabaseConnection();