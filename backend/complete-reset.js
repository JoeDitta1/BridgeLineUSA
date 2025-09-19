// Complete system reset - fix all the issues
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const dbPath = path.join(process.cwd(), 'data', 'app.db');
const quotesPath = path.join(process.cwd(), '..', 'data', 'quotes');

console.log('🔧 COMPLETE SYSTEM RESET AND REPAIR');
console.log('='.repeat(60));

async function completeReset() {
    try {
        // Step 1: Clean local database
        console.log('\n🗄️ STEP 1: Cleaning local database...');
        const db = new Database(dbPath);
        
        // Delete all quotes
        const deleteQuotes = db.prepare('DELETE FROM quotes');
        const deletedQuotes = deleteQuotes.run();
        console.log(`✅ Deleted ${deletedQuotes.changes} quotes from local database`);
        
        // Delete all files records
        try {
            const deleteFiles = db.prepare('DELETE FROM files');
            const deletedFiles = deleteFiles.run();
            console.log(`✅ Deleted ${deletedFiles.changes} file records from local database`);
        } catch (filesError) {
            console.log('ℹ️ Files table might not exist, skipping...');
        }
        
        // Reset auto-increment counters
        try {
            db.prepare('DELETE FROM sqlite_sequence WHERE name = "quotes"').run();
            db.prepare('DELETE FROM sqlite_sequence WHERE name = "files"').run();
            console.log('✅ Reset auto-increment counters');
        } catch (seqError) {
            console.log('ℹ️ Auto-increment reset skipped');
        }
        
        db.close();
        
        // Step 2: Clean local file system
        console.log('\n📁 STEP 2: Cleaning local file system...');
        if (fs.existsSync(quotesPath)) {
            const customers = fs.readdirSync(quotesPath);
            let deletedCustomers = 0;
            
            for (const customerName of customers) {
                const customerPath = path.join(quotesPath, customerName);
                if (fs.statSync(customerPath).isDirectory()) {
                    console.log(`  🗑️ Deleting customer folder: ${customerName}`);
                    fs.rmSync(customerPath, { recursive: true, force: true });
                    deletedCustomers++;
                }
            }
            
            console.log(`✅ Deleted ${deletedCustomers} customer folders from filesystem`);
        } else {
            console.log('ℹ️ Quotes directory does not exist');
        }
        
        // Step 3: Clean Supabase database
        console.log('\n☁️ STEP 3: Cleaning Supabase database...');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        
        const { data: supabaseQuotes, error: fetchError } = await supabase
            .from('quotes')
            .select('id');
            
        if (!fetchError && supabaseQuotes && supabaseQuotes.length > 0) {
            const { error: deleteError } = await supabase
                .from('quotes')
                .delete()
                .neq('id', 0); // Delete all records
                
            if (deleteError) {
                console.log(`❌ Supabase delete error: ${deleteError.message}`);
            } else {
                console.log(`✅ Deleted ${supabaseQuotes.length} quotes from Supabase`);
            }
        } else {
            console.log('ℹ️ No quotes found in Supabase database');
        }
        
        // Step 4: Clean Supabase storage
        console.log('\n🗄️ STEP 4: Cleaning Supabase storage...');
        const { data: storageContents, error: listError } = await supabase.storage
            .from('quote-files')
            .list('', { limit: 1000 });
            
        if (!listError && storageContents && storageContents.length > 0) {
            console.log(`  📦 Found ${storageContents.length} items in storage`);
            
            // Delete each item
            for (const item of storageContents) {
                const { error: deleteError } = await supabase.storage
                    .from('quote-files')
                    .remove([item.name]);
                    
                if (deleteError) {
                    console.log(`  ❌ Failed to delete ${item.name}: ${deleteError.message}`);
                } else {
                    console.log(`  🗑️ Deleted: ${item.name}`);
                }
            }
            
            console.log('✅ Cleaned Supabase storage');
        } else {
            console.log('ℹ️ Supabase storage already clean');
        }
        
        // Step 5: Verify clean state
        console.log('\n✅ STEP 5: Verifying clean state...');
        
        // Check database
        const dbCheck = new Database(dbPath);
        const quotesCount = dbCheck.prepare('SELECT COUNT(*) as count FROM quotes').get();
        console.log(`📊 Local quotes: ${quotesCount.count}`);
        dbCheck.close();
        
        // Check filesystem
        const fsExists = fs.existsSync(quotesPath);
        if (fsExists) {
            const fsCustomers = fs.readdirSync(quotesPath).length;
            console.log(`📁 Filesystem customers: ${fsCustomers}`);
        } else {
            console.log('📁 Filesystem: clean (no quotes directory)');
        }
        
        // Check Supabase
        const { data: finalSupabaseCheck } = await supabase
            .from('quotes')
            .select('id', { count: 'exact' });
        console.log(`☁️ Supabase quotes: ${finalSupabaseCheck?.length || 0}`);
        
        console.log('\n🎉 COMPLETE RESET FINISHED!');
        console.log('System is now in true clean slate state');
        console.log('Next quote should be SCM-Q-0001');
        
    } catch (error) {
        console.error('❌ Reset failed:', error);
    }
}

completeReset();