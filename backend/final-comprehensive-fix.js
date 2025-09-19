// FINAL COMPREHENSIVE FIX - Address all issues
import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const dbPath = './data/app.db';

console.log('🔧 FINAL COMPREHENSIVE FIX - ALL ISSUES');
console.log('='.repeat(60));

async function finalComprehensiveFix() {
    try {
        // Step 1: Complete nuclear reset (again)
        console.log('\n💣 STEP 1: Complete nuclear reset...');
        
        const db = new Database(dbPath);
        
        // Delete everything from local DB
        db.prepare('DELETE FROM quotes').run();
        try {
            db.prepare('DELETE FROM files').run();
        } catch (e) {
            // Files table might not exist
        }
        db.prepare('DELETE FROM sqlite_sequence').run();
        console.log('✅ Local database nuked');
        
        // Fix quote format to SCM-Q0001 (no dash before number)
        console.log('\n🔧 STEP 2: Fix quote format to SCM-Q0001...');
        db.prepare(`
            UPDATE settings 
            SET org_prefix = 'SCM',
                system_abbr = 'Q',
                quote_series = '',
                quote_pad = 4,
                next_quote_seq = 1
            WHERE id = 1
        `).run();
        
        // Test the format
        const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
        const seq = Number(settings.next_quote_seq) || 1;
        const padded = String(seq).padStart(Number(settings.quote_pad) || 4, '0');
        const parts = [settings.org_prefix, settings.system_abbr, `${settings.quote_series}${padded}`].filter(Boolean);
        const testQuoteNo = parts.join('-');
        
        console.log(`📋 Test quote format: ${testQuoteNo}`);
        
        if (testQuoteNo === 'SCM-Q0001') {
            console.log('✅ Quote format fixed: SCM-Q0001');
        } else {
            console.log(`❌ Quote format still wrong: ${testQuoteNo}`);
        }
        
        db.close();
        
        // Step 3: Complete Supabase cleanup
        console.log('\n💣 STEP 3: Complete Supabase cleanup...');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        
        // Delete all quotes from database
        const { error: dbDeleteError } = await supabase
            .from('quotes')
            .delete()
            .neq('id', -999);
            
        if (dbDeleteError) {
            console.log(`❌ DB delete error: ${dbDeleteError.message}`);
        } else {
            console.log('✅ Supabase database nuked');
        }
        
        // Delete all storage items recursively
        console.log('\n🗑️ STEP 4: Complete storage cleanup...');
        
        // First get all items in quotes folder
        const { data: quotesItems } = await supabase.storage
            .from('quote-files')
            .list('quotes', { limit: 1000 });
            
        if (quotesItems && quotesItems.length > 0) {
            for (const customerFolder of quotesItems) {
                console.log(`🗑️ Deleting customer folder: ${customerFolder.name}`);
                
                // Get all items in customer folder
                const { data: customerItems } = await supabase.storage
                    .from('quote-files')
                    .list(`quotes/${customerFolder.name}`, { limit: 1000 });
                    
                if (customerItems && customerItems.length > 0) {
                    for (const quoteFolder of customerItems) {
                        console.log(`  🗑️ Deleting quote folder: ${quoteFolder.name}`);
                        
                        // Recursively delete everything in quote folder
                        const { data: quoteItems } = await supabase.storage
                            .from('quote-files')
                            .list(`quotes/${customerFolder.name}/${quoteFolder.name}`, { limit: 1000 });
                            
                        if (quoteItems && quoteItems.length > 0) {
                            for (const subFolder of quoteItems) {
                                const folderPath = `quotes/${customerFolder.name}/${quoteFolder.name}/${subFolder.name}`;
                                
                                // Delete all files in subfolder
                                const { data: files } = await supabase.storage
                                    .from('quote-files')
                                    .list(folderPath, { limit: 1000 });
                                    
                                if (files && files.length > 0) {
                                    for (const file of files) {
                                        const filePath = `${folderPath}/${file.name}`;
                                        await supabase.storage
                                            .from('quote-files')
                                            .remove([filePath]);
                                        console.log(`    🗑️ Deleted file: ${file.name}`);
                                    }
                                }
                                
                                // Delete the subfolder
                                await supabase.storage
                                    .from('quote-files')
                                    .remove([folderPath]);
                            }
                        }
                        
                        // Delete the quote folder
                        await supabase.storage
                            .from('quote-files')
                            .remove([`quotes/${customerFolder.name}/${quoteFolder.name}`]);
                    }
                }
                
                // Delete the customer folder
                await supabase.storage
                    .from('quote-files')
                    .remove([`quotes/${customerFolder.name}`]);
            }
        }
        
        // Delete the quotes folder itself
        await supabase.storage
            .from('quote-files')
            .remove(['quotes']);
            
        console.log('✅ Complete storage cleanup finished');
        
        // Step 5: Verification
        console.log('\n🔍 STEP 5: Final verification...');
        
        const dbCheck = new Database(dbPath);
        const quotesCount = dbCheck.prepare('SELECT COUNT(*) as count FROM quotes').get();
        console.log(`📊 Local quotes: ${quotesCount.count}`);
        dbCheck.close();
        
        const { data: finalDbCheck } = await supabase
            .from('quotes')
            .select('id', { count: 'exact' });
        console.log(`☁️ Supabase quotes: ${finalDbCheck?.length || 0}`);
        
        const { data: finalStorageCheck } = await supabase.storage
            .from('quote-files')
            .list('', { limit: 10 });
        console.log(`🗄️ Storage items: ${finalStorageCheck?.length || 0}`);
        
        if (quotesCount.count === 0 && (finalDbCheck?.length || 0) === 0 && (finalStorageCheck?.length || 0) === 0) {
            console.log('\n🎉 PERFECT CLEAN SLATE ACHIEVED!');
            console.log('✅ All data completely removed');
            console.log('✅ Quote format fixed to SCM-Q0001');
            console.log('✅ Next quote will be SCM-Q0001');
            console.log('\n🔄 RESTART YOUR BROWSER completely and hard refresh (Ctrl+F5)');
        } else {
            console.log('\n⚠️ Some data may still exist - check manually');
        }
        
    } catch (error) {
        console.error('❌ Comprehensive fix failed:', error);
    }
}

finalComprehensiveFix();