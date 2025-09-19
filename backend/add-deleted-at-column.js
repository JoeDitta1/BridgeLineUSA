// Add missing deleted_at column to Supabase quotes table
import './src/loadEnv.js';
import { getSupabaseClient } from './src/utils/supabaseClient.js';

async function addDeletedAtColumn() {
  try {
    console.log('🔄 Adding deleted_at column to Supabase quotes table...');
    
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('❌ No Supabase client available');
      return;
    }
    
    // Try to add the deleted_at column
    console.log('Attempting to add deleted_at column...');
    
    // Note: We can't use supabase.rpc('exec_sql') without setting it up first
    // So let's just test if we can query with deleted_at to see if it exists
    
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('deleted_at')
        .limit(1);
        
      if (error) {
        if (error.code === '42703') {
          console.log('❌ Column deleted_at does not exist');
          console.log('\n📋 MANUAL ACTION REQUIRED:');
          console.log('Please execute this SQL command in your Supabase SQL Editor:');
          console.log('='.repeat(60));
          console.log('ALTER TABLE quotes ADD COLUMN deleted_at TIMESTAMPTZ NULL;');
          console.log('CREATE INDEX IF NOT EXISTS idx_quotes_deleted ON quotes(deleted_at);');
          console.log('='.repeat(60));
        } else {
          console.error('❌ Other error:', error);
        }
      } else {
        console.log('✅ Column deleted_at already exists!');
        console.log('Sample data:', data);
      }
    } catch (err) {
      console.error('❌ Query error:', err);
    }
    
  } catch (err) {
    console.error('❌ Setup error:', err);
  }
}

addDeletedAtColumn().then(() => process.exit(0));