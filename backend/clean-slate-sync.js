// Clean slate solution: Remove all Supabase quotes and re-sync from local
import './src/loadEnv.js';
import { getSupabaseClient } from './src/utils/supabaseClient.js';
import * as dbModule from './src/db.js';

const db = dbModule.default ?? dbModule.db ?? dbModule;

async function cleanSlateSync() {
  try {
    console.log('🧹 CLEAN SLATE SYNCHRONIZATION...');
    console.log('This will:');
    console.log('1. Delete ALL quotes from Supabase');
    console.log('2. Re-sync active quotes from local SQLite');
    console.log('3. Fix quote numbering conflicts');
    
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('❌ No Supabase client available');
      return;
    }
    
    // STEP 1: Delete all quotes from Supabase
    console.log('\n🗑️  STEP 1: Deleting all Supabase quotes...');
    const { error: deleteError } = await supabase
      .from('quotes')
      .delete()
      .neq('id', 0); // Delete all records
      
    if (deleteError) {
      console.error('❌ Failed to delete Supabase quotes:', deleteError);
      return;
    }
    console.log('✅ All Supabase quotes deleted');
    
    // STEP 2: Get active local quotes (non-deleted)
    console.log('\n📤 STEP 2: Getting active local quotes...');
    const activeLocalQuotes = db.prepare(`
      SELECT quote_no, customer_name, description, requested_by, estimator, 
             date, status, sales_order_no, rev, app_state, created_at
      FROM quotes 
      WHERE deleted_at IS NULL
      ORDER BY created_at ASC
    `).all();
    
    console.log(`📊 Found ${activeLocalQuotes.length} active local quotes to sync`);
    
    // STEP 3: Re-sync to Supabase
    console.log('\n🔄 STEP 3: Re-syncing to Supabase...');
    let syncCount = 0;
    let errorCount = 0;
    
    for (const quote of activeLocalQuotes) {
      try {
        const supabaseData = {
          quote_no: quote.quote_no,
          customer_name: quote.customer_name,
          description: quote.description,
          requested_by: quote.requested_by,
          estimator: quote.estimator,
          date: quote.date,
          status: quote.status || 'Draft',
          sales_order_no: quote.sales_order_no,
          rev: quote.rev || 0,
          customer: quote.customer_name,
          app_state: quote.app_state,
          updated_at: new Date().toISOString()
        };
        
        const { error: insertError } = await supabase
          .from('quotes')
          .insert(supabaseData);
          
        if (insertError) {
          console.error(`❌ Failed to sync ${quote.quote_no}:`, insertError.message);
          errorCount++;
        } else {
          console.log(`✅ Synced ${quote.quote_no} (${quote.customer_name})`);
          syncCount++;
        }
      } catch (err) {
        console.error(`❌ Error syncing ${quote.quote_no}:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 SYNC RESULTS:`);
    console.log(`   ✅ Successfully synced: ${syncCount} quotes`);
    console.log(`   ❌ Failed to sync: ${errorCount} quotes`);
    
    // STEP 4: Verify sync
    console.log('\n🔍 STEP 4: Verifying sync...');
    const { data: verifyQuotes, error: verifyError } = await supabase
      .from('quotes')
      .select('quote_no, customer_name, date')
      .order('quote_no', { ascending: true });
      
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log(`✅ Verification: ${verifyQuotes.length} quotes now in Supabase`);
      verifyQuotes.forEach(q => 
        console.log(`   - ${q.quote_no} (${q.customer_name}) - ${q.date}`)
      );
    }
    
    console.log('\n🎉 CLEAN SLATE SYNCHRONIZATION COMPLETE!');
    console.log('The quote numbering should now be consistent between local and Supabase.');
    console.log('New quotes will continue from the highest existing number.');
    
  } catch (err) {
    console.error('❌ Clean slate sync error:', err);
  }
}

// Uncomment the line below to execute the clean slate sync
// cleanSlateSync().then(() => process.exit(0));

console.log('⚠️  READY TO EXECUTE CLEAN SLATE SYNC');
console.log('Uncomment the last line in this file to run the cleanup.');
console.log('This will DELETE ALL quotes from Supabase and re-sync from local.');
console.log('Make sure this is what you want before proceeding!');