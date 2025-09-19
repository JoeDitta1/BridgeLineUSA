// Debug folder creation and Supabase sync issues
import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const dbPath = './data/app.db';
const quotesPath = path.join(process.cwd(), '..', 'data', 'quotes');

console.log('🔍 DEBUGGING FOLDER CREATION AND SUPABASE SYNC');
console.log('='.repeat(60));

async function debugFolderCreation() {
    try {
        // Check current quote in database
        console.log('\n📊 Current Quote in Database:');
        const db = new Database(dbPath);
        const quotes = db.prepare('SELECT * FROM quotes').all();
        quotes.forEach(quote => {
            console.log(`  - Quote: ${quote.quote_no}`);
            console.log(`  - Customer: ${quote.customer_name}`);
            console.log(`  - Description: ${quote.description}`);
            console.log(`  - Status: ${quote.status}`);
            console.log(`  - Created: ${quote.created_at}`);
        });
        db.close();
        
        // Check filesystem folders
        console.log('\n📁 Filesystem Check:');
        console.log(`Looking in: ${quotesPath}`);
        
        if (fs.existsSync(quotesPath)) {
            const customers = fs.readdirSync(quotesPath);
            console.log(`Found ${customers.length} customer folders:`);
            
            customers.forEach(customerName => {
                const customerPath = path.join(quotesPath, customerName);
                if (fs.statSync(customerPath).isDirectory()) {
                    console.log(`\n  📁 Customer: ${customerName}`);
                    
                    const quotes = fs.readdirSync(customerPath);
                    quotes.forEach(quoteFolderName => {
                        const quotePath = path.join(customerPath, quoteFolderName);
                        if (fs.statSync(quotePath).isDirectory()) {
                            console.log(`    📄 Quote folder: ${quoteFolderName}`);
                            
                            // Check subfolders
                            const subfolders = fs.readdirSync(quotePath);
                            subfolders.forEach(subfolder => {
                                console.log(`      📂 ${subfolder}`);
                            });
                        }
                    });
                }
            });
        } else {
            console.log('📭 Quotes directory does not exist');
        }
        
        // Check Supabase storage detailed
        console.log('\n☁️ Supabase Storage Detailed Check:');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        
        const { data: storageItems, error: storageError } = await supabase.storage
            .from('quote-files')
            .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
            
        if (storageError) {
            console.log(`❌ Storage error: ${storageError.message}`);
        } else {
            console.log(`📦 Storage root items: ${storageItems?.length || 0}`);
            storageItems?.forEach(item => {
                const type = item.metadata?.mimetype ? '📄' : '📁';
                console.log(`  ${type} ${item.name} (created: ${item.created_at})`);
            });
            
            // Look specifically for quotes folder
            if (storageItems?.some(item => item.name === 'quotes')) {
                console.log('\n📁 Checking quotes folder...');
                
                const { data: quotesFolder, error: qError } = await supabase.storage
                    .from('quote-files')
                    .list('quotes', { limit: 100 });
                    
                if (!qError && quotesFolder) {
                    console.log(`Found ${quotesFolder.length} items in quotes folder:`);
                    quotesFolder.forEach(item => {
                        const type = item.metadata?.mimetype ? '📄' : '📁';
                        console.log(`    ${type} ${item.name}`);
                    });
                } else {
                    console.log('❌ Failed to list quotes folder:', qError?.message);
                }
            }
        }
        
        // Test folder creation API endpoint
        console.log('\n🧪 Testing Folder Creation API:');
        
        if (quotes.length > 0) {
            const testQuote = quotes[0];
            console.log(`Testing folder creation for: ${testQuote.quote_no} - ${testQuote.customer_name}`);
            
            try {
                const response = await fetch(`http://localhost:4000/api/quotes/${encodeURIComponent(testQuote.quote_no)}/init-folders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer_name: testQuote.customer_name,
                        description: testQuote.description || 'test'
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Folder creation API response:', result);
                } else {
                    const errorText = await response.text();
                    console.log('❌ Folder creation API failed:', response.status, errorText);
                }
            } catch (apiError) {
                console.log('❌ Folder creation API error:', apiError.message);
            }
        }
        
        console.log('\n🔍 POTENTIAL ISSUES:');
        console.log('1. Folder creation not triggered during quote save');
        console.log('2. Supabase folder creation disabled or failing');
        console.log('3. Case sensitivity issues (Dave vs DAVE)');
        console.log('4. Double quote creation causing race conditions');
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

debugFolderCreation();