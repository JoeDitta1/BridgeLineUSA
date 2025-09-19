// Deep dive into blusa-uploads-prod bucket contents
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function exploreBlusa() {
    try {
        console.log('🔍 EXPLORING blusa-uploads-prod BUCKET CONTENTS');
        console.log('='.repeat(60));
        
        // Start with root level
        const { data: rootContents, error: rootError } = await supabase.storage
            .from('blusa-uploads-prod')
            .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
            
        if (rootError) {
            console.log(`❌ Error listing root: ${rootError.message}`);
            return;
        }
        
        console.log(`📂 Root level (${rootContents?.length || 0} items):`);
        for (const item of rootContents || []) {
            const type = item.metadata?.mimetype ? '📄' : '📁';
            console.log(`  ${type} ${item.name}`);
        }
        
        // Look in quotes folder
        if (rootContents?.some(item => item.name === 'quotes')) {
            console.log('\n📁 Exploring quotes folder...');
            
            const { data: quotesContents, error: quotesError } = await supabase.storage
                .from('blusa-uploads-prod')
                .list('quotes', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
                
            if (quotesError) {
                console.log(`❌ Error listing quotes: ${quotesError.message}`);
            } else {
                console.log(`📂 quotes/ (${quotesContents?.length || 0} items):`);
                for (const item of quotesContents || []) {
                    const type = item.metadata?.mimetype ? '📄' : '📁';
                    console.log(`  ${type} ${item.name}`);
                    
                    // If it's a quote folder, look inside
                    if (!item.metadata?.mimetype && item.name.includes('SCM-Q')) {
                        console.log(`    🔍 Looking inside ${item.name}...`);
                        
                        const { data: quoteContents, error: quoteError } = await supabase.storage
                            .from('blusa-uploads-prod')
                            .list(`quotes/${item.name}`, { limit: 50 });
                            
                        if (!quoteError && quoteContents) {
                            for (const subItem of quoteContents.slice(0, 5)) { // Show first 5
                                const subType = subItem.metadata?.mimetype ? '📄' : '📁';
                                const size = subItem.metadata?.size ? ` (${subItem.metadata.size} bytes)` : '';
                                console.log(`      ${subType} ${subItem.name}${size}`);
                            }
                            if (quoteContents.length > 5) {
                                console.log(`      ... and ${quoteContents.length - 5} more items`);
                            }
                        }
                    }
                }
            }
        }
        
        // Look in customers folder if it exists
        if (rootContents?.some(item => item.name === 'customers')) {
            console.log('\n📁 Exploring customers folder...');
            
            const { data: customersContents, error: customersError } = await supabase.storage
                .from('blusa-uploads-prod')
                .list('customers', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
                
            if (customersError) {
                console.log(`❌ Error listing customers: ${customersError.message}`);
            } else {
                console.log(`📂 customers/ (${customersContents?.length || 0} items):`);
                for (const item of customersContents?.slice(0, 10) || []) {
                    const type = item.metadata?.mimetype ? '📄' : '📁';
                    console.log(`  ${type} ${item.name}`);
                }
                if ((customersContents?.length || 0) > 10) {
                    console.log(`  ... and ${customersContents.length - 10} more items`);
                }
            }
        }
        
        console.log('\n🏁 CONCLUSION:');
        console.log('blusa-uploads-prod appears to be a legacy/older bucket structure');
        console.log('Current app code uses quote-files bucket (which is empty after cleanup)');
        console.log('You likely have old data in blusa-uploads-prod that needs migration or cleanup');
        
    } catch (error) {
        console.error('❌ Exploration failed:', error);
    }
}

exploreBlusa();