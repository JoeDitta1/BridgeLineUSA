// AGGRESSIVE RESET - Delete everything and fix quote numbering
import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const dbPath = './data/app.db';

console.log('🔥 AGGRESSIVE RESET - DELETING EVERYTHING');
console.log('='.repeat(60));

async function aggressiveReset() {
    try {
        // Step 1: Nuke local database
        console.log('\n💣 STEP 1: Nuclear option on local database...');
        const db = new Database(dbPath);
        
        // Delete ALL quotes
        const deleteQuotes = db.prepare('DELETE FROM quotes');
        const deletedQuotes = deleteQuotes.run();
        console.log(`✅ Deleted ${deletedQuotes.changes} quotes`);
        
        // Delete all files
        try {
            const deleteFiles = db.prepare('DELETE FROM files');
            const deletedFiles = deleteFiles.run();
            console.log(`✅ Deleted ${deletedFiles.changes} file records`);
        } catch (e) {
            console.log('ℹ️ Files table deletion skipped');
        }
        
        // Reset all auto-increment counters
        try {
            db.prepare('DELETE FROM sqlite_sequence').run();
            console.log('✅ Reset ALL auto-increment counters');
        } catch (e) {
            console.log('ℹ️ Auto-increment reset skipped');
        }
        
        // Also clear any other potential quote-related data
        try {
            db.prepare('DELETE FROM sales_orders').run();
            console.log('✅ Cleared sales orders');
        } catch (e) {
            console.log('ℹ️ Sales orders clear skipped');
        }
        
        db.close();
        
        // Step 2: Nuke Supabase
        console.log('\n💣 STEP 2: Nuclear option on Supabase...');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        
        // Delete ALL Supabase quotes
        const { error: deleteError } = await supabase
            .from('quotes')
            .delete()
            .neq('id', -999); // Delete everything
            
        if (deleteError) {
            console.log(`❌ Supabase delete error: ${deleteError.message}`);
        } else {
            console.log('✅ Nuked all Supabase quotes');
        }
        
        // Delete ALL Supabase storage
        const { data: storageItems } = await supabase.storage
            .from('quote-files')
            .list('', { limit: 1000 });
            
        if (storageItems && storageItems.length > 0) {
            for (const item of storageItems) {
                if (item.name === 'quotes') {
                    // Delete everything under quotes folder
                    const { data: quotesContents } = await supabase.storage
                        .from('quote-files')
                        .list('quotes', { limit: 1000 });
                        
                    if (quotesContents) {
                        for (const customer of quotesContents) {
                            const { error: delError } = await supabase.storage
                                .from('quote-files')
                                .remove([`quotes/${customer.name}`]);
                                
                            if (!delError) {
                                console.log(`🗑️ Deleted customer folder: ${customer.name}`);
                            }
                        }
                    }
                }
                
                const { error: delError } = await supabase.storage
                    .from('quote-files')
                    .remove([item.name]);
                    
                if (!delError) {
                    console.log(`🗑️ Deleted: ${item.name}`);
                }
            }
        }
        
        // Step 3: Verify complete destruction
        console.log('\n🔍 STEP 3: Verification...');
        
        const dbCheck = new Database(dbPath);
        const quotesCount = dbCheck.prepare('SELECT COUNT(*) as count FROM quotes').get();
        console.log(`📊 Local quotes remaining: ${quotesCount.count}`);
        dbCheck.close();
        
        const { data: finalSupabaseCheck } = await supabase
            .from('quotes')
            .select('id', { count: 'exact' });
        console.log(`☁️ Supabase quotes remaining: ${finalSupabaseCheck?.length || 0}`);
        
        const { data: finalStorageCheck } = await supabase.storage
            .from('quote-files')
            .list('', { limit: 10 });
        console.log(`🗄️ Storage items remaining: ${finalStorageCheck?.length || 0}`);
        
        if (quotesCount.count === 0 && (finalSupabaseCheck?.length || 0) === 0) {
            console.log('\n🎉 RESET SUCCESSFUL!');
            console.log('System is now completely clean');
            console.log('Next quote WILL be SCM-Q-0001');
        } else {
            console.log('\n❌ RESET INCOMPLETE!');
            console.log('Some data still remains');
        }
        
    } catch (error) {
        console.error('❌ Aggressive reset failed:', error);
    }
}

aggressiveReset();