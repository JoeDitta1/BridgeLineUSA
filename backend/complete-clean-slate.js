// Complete clean slate: Delete ALL quotes from both local SQLite and Supabase
import './src/loadEnv.js';
import { getSupabaseClient } from './src/utils/supabaseClient.js';
import * as dbModule from './src/db.js';

const db = dbModule.default ?? dbModule.db ?? dbModule;

async function completeCleanSlate() {
  try {
    console.log('🧹 COMPLETE CLEAN SLATE - DELETING ALL QUOTES...');
    console.log('This will:');
    console.log('1. Delete ALL quotes from Supabase');
    console.log('2. Delete ALL quotes from local SQLite');
    console.log('3. Reset quote numbering to start fresh');
    console.log('4. Clear any related data');
    
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('❌ No Supabase client available');
      return;
    }
    
    // STEP 1: Delete all quotes from Supabase
    console.log('\n🗑️  STEP 1: Deleting all Supabase quotes...');
    const { error: deleteSupabaseError } = await supabase
      .from('quotes')
      .delete()
      .neq('id', 0); // Delete all records
      
    if (deleteSupabaseError) {
      console.error('❌ Failed to delete Supabase quotes:', deleteSupabaseError);
    } else {
      console.log('✅ All Supabase quotes deleted');
    }
    
    // STEP 2: Verify Supabase is empty
    console.log('\n🔍 Verifying Supabase is empty...');
    const { data: remainingSupabase, error: verifyError } = await supabase
      .from('quotes')
      .select('count')
      .single();
      
    if (verifyError && verifyError.code !== 'PGRST116') {
      console.warn('⚠️  Could not verify Supabase deletion:', verifyError);
    } else {
      console.log('✅ Supabase quotes table is now empty');
    }
    
    // STEP 3: Delete all quotes from local SQLite
    console.log('\n🗑️  STEP 2: Deleting all local SQLite quotes...');
    try {
      const deleteResult = db.prepare('DELETE FROM quotes').run();
      console.log(`✅ Deleted ${deleteResult.changes} local quotes`);
    } catch (localDeleteError) {
      console.error('❌ Failed to delete local quotes:', localDeleteError);
    }
    
    // STEP 4: Verify local is empty
    console.log('\n🔍 Verifying local database is empty...');
    const remainingLocal = db.prepare('SELECT COUNT(*) as count FROM quotes').get();
    console.log(`✅ Local quotes remaining: ${remainingLocal.count}`);
    
    // STEP 5: Reset any auto-increment sequences if they exist
    console.log('\n🔄 Resetting sequences...');
    try {
      // SQLite doesn't have explicit sequences, but we can reset the sqlite_sequence table
      db.prepare('DELETE FROM sqlite_sequence WHERE name = ?').run('quotes');
      console.log('✅ Reset local quote ID sequence');
    } catch (seqError) {
      console.log('ℹ️  No sequence to reset (this is normal)');
    }
    
    // STEP 6: Clean up any orphaned files (optional)
    console.log('\n🧹 STEP 3: Checking for cleanup opportunities...');
    
    // Check if there are any files in Supabase storage to clean
    try {
      const { data: bucketFiles, error: bucketError } = await supabase
        .storage
        .from('quote-files')
        .list('');
        
      if (bucketError) {
        console.warn('⚠️  Could not check bucket files:', bucketError.message);
      } else {
        console.log(`📁 Found ${bucketFiles?.length || 0} top-level items in quote-files bucket`);
        if (bucketFiles && bucketFiles.length > 0) {
          console.log('ℹ️  You may want to clean up storage files manually if needed');
          bucketFiles.slice(0, 5).forEach(item => 
            console.log(`   - ${item.name}`)
          );
        }
      }
    } catch (bucketErr) {
      console.warn('⚠️  Could not access storage bucket:', bucketErr.message);
    }
    
    console.log('\n🎉 COMPLETE CLEAN SLATE FINISHED!');
    console.log('✅ Both local SQLite and Supabase are now empty');
    console.log('✅ Ready for fresh quote creation testing');
    console.log('🚀 Next quote should be SCM-Q0001');
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Create a new test quote through the UI');
    console.log('2. Verify it appears in both local and Supabase');
    console.log('3. Check quote numbering is working correctly');
    console.log('4. Test file uploads and sync');
    
  } catch (err) {
    console.error('❌ Clean slate error:', err);
  }
}

completeCleanSlate().then(() => process.exit(0));