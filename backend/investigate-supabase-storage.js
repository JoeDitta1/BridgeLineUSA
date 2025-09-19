// Check what's actually in Supabase storage in detail
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('🔍 DETAILED SUPABASE STORAGE INVESTIGATION');
console.log('='.repeat(60));

async function investigateSupabaseStorage() {
    try {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        
        console.log('\n📦 STORAGE ROOT LEVEL:');
        const { data: rootItems, error: rootError } = await supabase.storage
            .from('quote-files')
            .list('', { limit: 100 });
            
        if (rootError) {
            console.log(`❌ Error: ${rootError.message}`);
            return;
        }
        
        console.log(`Found ${rootItems?.length || 0} items at root:`);
        rootItems?.forEach(item => {
            const type = item.metadata?.mimetype ? '📄' : '📁';
            console.log(`  ${type} ${item.name}`);
        });
        
        // Check quotes folder in detail
        if (rootItems?.some(item => item.name === 'quotes')) {
            console.log('\n📁 QUOTES FOLDER CONTENTS:');
            
            const { data: quotesItems, error: quotesError } = await supabase.storage
                .from('quote-files')
                .list('quotes', { limit: 100 });
                
            if (quotesError) {
                console.log(`❌ Error: ${quotesError.message}`);
            } else {
                console.log(`Found ${quotesItems?.length || 0} items in quotes:`);
                
                for (const item of quotesItems || []) {
                    const type = item.metadata?.mimetype ? '📄' : '📁';
                    console.log(`  ${type} ${item.name}`);
                    
                    // If it's a customer folder, look inside
                    if (!item.metadata?.mimetype) {
                        console.log(`    🔍 Looking inside ${item.name}...`);
                        
                        const { data: customerItems, error: customerError } = await supabase.storage
                            .from('quote-files')
                            .list(`quotes/${item.name}`, { limit: 100 });
                            
                        if (!customerError && customerItems) {
                            customerItems.forEach(custItem => {
                                const custType = custItem.metadata?.mimetype ? '📄' : '📁';
                                console.log(`      ${custType} ${custItem.name}`);
                                
                                // If it's a quote folder, show what's inside
                                if (!custItem.metadata?.mimetype && custItem.name.includes('SCM')) {
                                    console.log(`        💼 Quote folder found: ${custItem.name}`);
                                }
                            });
                        }
                    }
                }
            }
        }
        
        // Check the database entries too
        console.log('\n💾 SUPABASE DATABASE ENTRIES:');
        const { data: dbQuotes, error: dbError } = await supabase
            .from('quotes')
            .select('*')
            .order('id', { ascending: false });
            
        if (dbError) {
            console.log(`❌ Database error: ${dbError.message}`);
        } else {
            console.log(`Found ${dbQuotes?.length || 0} quotes in database:`);
            dbQuotes?.forEach(quote => {
                console.log(`  📋 ${quote.quote_no} - ${quote.customer_name} (ID: ${quote.id})`);
                console.log(`      Created: ${quote.created_at}, Updated: ${quote.updated_at}`);
                if (quote.deleted_at) {
                    console.log(`      🗑️ DELETED: ${quote.deleted_at}`);
                }
            });
        }
        
        console.log('\n🔍 ANALYSIS:');
        console.log('If frontend shows more quotes than backend, issue is likely:');
        console.log('1. Browser cache - need hard refresh');
        console.log('2. Frontend state management - holding old data');
        console.log('3. API response caching');
        
    } catch (error) {
        console.error('❌ Investigation failed:', error);
    }
}

investigateSupabaseStorage();