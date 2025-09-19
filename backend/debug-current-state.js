// Debug current system state to understand the issues
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const dbPath = path.join(process.cwd(), 'data', 'app.db');
const quotesPath = path.join(process.cwd(), '..', 'data', 'quotes');

console.log('🔍 DEBUGGING CURRENT SYSTEM STATE');
console.log('='.repeat(60));

// Check local SQLite database
console.log('\n📊 LOCAL DATABASE STATE:');
try {
    const db = new Database(dbPath);
    
    // Check quotes table
    const quotes = db.prepare('SELECT * FROM quotes ORDER BY id DESC').all();
    console.log(`📋 Quotes in database: ${quotes.length}`);
    quotes.forEach(quote => {
        console.log(`  - ID: ${quote.id}, Quote: ${quote.quote_no}, Customer: ${quote.customer_name}, Status: ${quote.status}`);
        if (quote.deleted_at) {
            console.log(`    ❌ DELETED: ${quote.deleted_at}`);
        }
    });
    
    // Check customers
    const customers = db.prepare('SELECT DISTINCT customer_name FROM quotes WHERE deleted_at IS NULL').all();
    console.log(`\n👥 Active customers: ${customers.length}`);
    customers.forEach(customer => {
        console.log(`  - ${customer.customer_name}`);
    });
    
    db.close();
} catch (dbError) {
    console.error('❌ Database error:', dbError.message);
}

// Check local file system
console.log('\n📁 LOCAL FILE SYSTEM:');
try {
    if (fs.existsSync(quotesPath)) {
        const customers = fs.readdirSync(quotesPath);
        console.log(`📂 Customer folders: ${customers.length}`);
        
        customers.forEach(customerName => {
            const customerPath = path.join(quotesPath, customerName);
            if (fs.statSync(customerPath).isDirectory()) {
                console.log(`\n  📁 ${customerName}:`);
                const quotes = fs.readdirSync(customerPath).filter(item => {
                    const itemPath = path.join(customerPath, item);
                    return fs.statSync(itemPath).isDirectory();
                });
                quotes.forEach(quote => {
                    console.log(`    - ${quote}`);
                });
            }
        });
    } else {
        console.log('📭 Quotes directory does not exist');
    }
} catch (fsError) {
    console.error('❌ File system error:', fsError.message);
}

// Check Supabase database
console.log('\n☁️ SUPABASE DATABASE:');
try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: supabaseQuotes, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .order('id', { ascending: false });
        
    if (quotesError) {
        console.log(`❌ Error: ${quotesError.message}`);
    } else {
        console.log(`📋 Supabase quotes: ${supabaseQuotes?.length || 0}`);
        supabaseQuotes?.forEach(quote => {
            console.log(`  - ID: ${quote.id}, Quote: ${quote.quote_no}, Customer: ${quote.customer_name}`);
        });
    }
} catch (supabaseError) {
    console.error('❌ Supabase error:', supabaseError.message);
}

// Check Supabase storage
console.log('\n🗄️ SUPABASE STORAGE:');
try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: bucketContents, error: storageError } = await supabase.storage
        .from('quote-files')
        .list('', { limit: 100 });
        
    if (storageError) {
        console.log(`❌ Storage error: ${storageError.message}`);
    } else {
        console.log(`📦 Storage contents: ${bucketContents?.length || 0} items`);
        bucketContents?.forEach(item => {
            const type = item.metadata?.mimetype ? '📄' : '📁';
            console.log(`  ${type} ${item.name}`);
        });
    }
} catch (storageError) {
    console.error('❌ Storage error:', storageError.message);
}

console.log('\n🏁 ANALYSIS COMPLETE');