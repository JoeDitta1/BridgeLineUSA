// Emergency diagnostic - check what's really in the system
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const dbPath = path.join(process.cwd(), 'data', 'app.db');
const quotesPath = path.join(process.cwd(), '..', 'data', 'quotes');

console.log('🚨 EMERGENCY DIAGNOSTIC - WHAT IS ACTUALLY IN THE SYSTEM');
console.log('='.repeat(70));

async function emergencyCheck() {
    try {
        // Check local database with detailed info
        console.log('\n🔍 LOCAL DATABASE DEEP DIVE:');
        const db = new Database(dbPath);
        
        // Check quotes table structure
        const tableInfo = db.prepare("PRAGMA table_info(quotes)").all();
        console.log('📋 Quotes table structure:');
        tableInfo.forEach(col => {
            console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
        });
        
        // Get ALL quotes including soft-deleted
        const allQuotes = db.prepare('SELECT * FROM quotes ORDER BY id DESC').all();
        console.log(`\n📊 ALL quotes (including soft-deleted): ${allQuotes.length}`);
        allQuotes.forEach(quote => {
            console.log(`  - ID: ${quote.id}, Quote: ${quote.quote_no}, Customer: ${quote.customer_name}, Status: ${quote.status}`);
            if (quote.deleted_at) {
                console.log(`    🗑️ SOFT DELETED: ${quote.deleted_at}`);
            }
            console.log(`    📅 Created: ${quote.created_at}, Updated: ${quote.updated_at}`);
        });
        
        // Check only active quotes
        const activeQuotes = db.prepare('SELECT * FROM quotes WHERE deleted_at IS NULL ORDER BY id DESC').all();
        console.log(`\n✅ ACTIVE quotes only: ${activeQuotes.length}`);
        activeQuotes.forEach(quote => {
            console.log(`  - ID: ${quote.id}, Quote: ${quote.quote_no}, Customer: ${quote.customer_name}`);
        });
        
        // Check if there are any other tables with quote data
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        console.log(`\n📋 All database tables:`);
        tables.forEach(table => {
            const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
            console.log(`  - ${table.name}: ${count.count} records`);
        });
        
        db.close();
        
        // Check filesystem in detail
        console.log('\n📁 FILESYSTEM DEEP DIVE:');
        console.log(`Checking path: ${quotesPath}`);
        
        if (fs.existsSync(quotesPath)) {
            const items = fs.readdirSync(quotesPath, { withFileTypes: true });
            console.log(`📂 Items in quotes directory: ${items.length}`);
            
            items.forEach(item => {
                if (item.isDirectory()) {
                    console.log(`\n  📁 Customer: ${item.name}`);
                    const customerPath = path.join(quotesPath, item.name);
                    const quotes = fs.readdirSync(customerPath, { withFileTypes: true });
                    quotes.forEach(quote => {
                        if (quote.isDirectory()) {
                            console.log(`    📄 Quote: ${quote.name}`);
                        }
                    });
                } else {
                    console.log(`  📄 File: ${item.name}`);
                }
            });
        } else {
            console.log('📭 Quotes directory does not exist');
        }
        
        // Check Supabase in detail
        console.log('\n☁️ SUPABASE DEEP DIVE:');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        
        // Check quotes table
        const { data: supabaseQuotes, error: quotesError } = await supabase
            .from('quotes')
            .select('*')
            .order('id', { ascending: false });
            
        if (quotesError) {
            console.log(`❌ Supabase quotes error: ${quotesError.message}`);
        } else {
            console.log(`📊 Supabase quotes: ${supabaseQuotes?.length || 0}`);
            supabaseQuotes?.forEach(quote => {
                console.log(`  - ID: ${quote.id}, Quote: ${quote.quote_no}, Customer: ${quote.customer_name}`);
                if (quote.deleted_at) {
                    console.log(`    🗑️ DELETED: ${quote.deleted_at}`);
                }
            });
        }
        
        // Check storage
        const { data: storageItems, error: storageError } = await supabase.storage
            .from('quote-files')
            .list('', { limit: 1000 });
            
        if (storageError) {
            console.log(`❌ Storage error: ${storageError.message}`);
        } else {
            console.log(`🗄️ Storage items: ${storageItems?.length || 0}`);
            storageItems?.forEach(item => {
                console.log(`  - ${item.name} (${item.metadata?.mimetype || 'folder'})`);
            });
        }
        
        // Check if there's cached data in the browser or elsewhere
        console.log('\n🔍 POSSIBLE ISSUES:');
        console.log('1. Browser cache - try hard refresh (Ctrl+F5)');
        console.log('2. Database connection - check if using correct database file');
        console.log('3. Multiple database files - search for other app.db files');
        console.log('4. Development vs production environments');
        
    } catch (error) {
        console.error('❌ Emergency diagnostic failed:', error);
    }
}

emergencyCheck();