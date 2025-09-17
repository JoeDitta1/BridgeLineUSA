#!/usr/bin/env node

/**
 * Fix Supabase Schema Script
 * Adds missing columns to existing Supabase tables
 */

import { createClient } from '@supabase/supabase-js';
import * as dbModule from './src/db.js';

const db = dbModule.default ?? dbModule.db ?? dbModule;

// Get Supabase credentials from local database
function getSupabaseCredentials() {
  try {
    const urlRow = db.prepare("SELECT value FROM kv_store WHERE key = 'SUPABASE_URL'").get();
    const keyRow = db.prepare("SELECT value FROM kv_store WHERE key = 'SUPABASE_SERVICE_KEY'").get();

    const supabaseUrl = urlRow?.value;
    const supabaseServiceKey = keyRow?.value;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Supabase credentials not found in local database');
      console.log('Please configure Supabase URL and Service Key in Admin Settings first');
      process.exit(1);
    }

    return { supabaseUrl, supabaseServiceKey };
  } catch (error) {
    console.error('❌ Failed to get Supabase credentials:', error.message);
    process.exit(1);
  }
}

// Main function to fix schema
async function fixSupabaseSchema() {
  console.log('🔧 Starting Supabase schema fix...');

  const { supabaseUrl, supabaseServiceKey } = getSupabaseCredentials();

  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔍 Checking current table schemas...');

    // Check quotes table schema
    console.log('\n📋 Checking quotes table...');
    const { data: quotesColumns, error: quotesError } = await supabase
      .rpc('get_table_columns', { table_name: 'quotes' });

    if (quotesError) {
      console.log('❌ Could not check quotes table columns via RPC, trying direct query...');

      // Try to query the table to see what columns exist
      const { data: quotesData, error: queryError } = await supabase
        .from('quotes')
        .select('*')
        .limit(1);

      if (queryError) {
        console.error('❌ Failed to query quotes table:', queryError.message);
      } else {
        console.log('✅ Quotes table exists');
        if (quotesData && quotesData.length > 0) {
          console.log('📊 Sample row columns:', Object.keys(quotesData[0]));
        }
      }
    } else {
      console.log('📊 Quotes table columns:', quotesColumns);
    }

    // Check quote_files table schema
    console.log('\n📋 Checking quote_files table...');
    const { data: filesColumns, error: filesError } = await supabase
      .rpc('get_table_columns', { table_name: 'quote_files' });

    if (filesError) {
      console.log('❌ Could not check quote_files table columns via RPC, trying direct query...');

      const { data: filesData, error: queryError } = await supabase
        .from('quote_files')
        .select('*')
        .limit(1);

      if (queryError) {
        console.error('❌ Failed to query quote_files table:', queryError.message);
      } else {
        console.log('✅ quote_files table exists');
        if (filesData && filesData.length > 0) {
          console.log('📊 Sample row columns:', Object.keys(filesData[0]));
        }
      }
    } else {
      console.log('📊 quote_files table columns:', filesColumns);
    }

    console.log('\n🔧 Applying schema fixes...');

    // SQL commands to add missing columns
    const schemaFixes = [
      // Add app_state column to quotes table
      `ALTER TABLE quotes ADD COLUMN IF NOT EXISTS app_state JSONB;`,

      // Add uploaded_at column to quote_files table
      `ALTER TABLE quote_files ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ DEFAULT NOW();`,

      // Add other potentially missing columns for quotes table
      `ALTER TABLE quotes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;`,
      `ALTER TABLE quotes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();`,

      // Add other potentially missing columns for quote_files table
      `ALTER TABLE quote_files ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;`,
      `ALTER TABLE quote_files ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';`,

      // Create indexes if they don't exist
      `CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(date);`,
      `CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_name);`,
      `CREATE INDEX IF NOT EXISTS idx_quotes_quote_no ON quotes(quote_no);`,
      `CREATE INDEX IF NOT EXISTS idx_quotes_deleted ON quotes(deleted_at);`,
      `CREATE INDEX IF NOT EXISTS idx_quote_files_quote_no ON quote_files(quote_no);`,
      `CREATE INDEX IF NOT EXISTS idx_quote_files_uploaded ON quote_files(uploaded_at);`,
      `CREATE INDEX IF NOT EXISTS idx_quote_files_deleted ON quote_files(deleted_at);`
    ];

    for (const sql of schemaFixes) {
      try {
        console.log(`Executing: ${sql.split(' ADD COLUMN')[0]}...`);
        const { error } = await supabase.rpc('exec_sql', { sql });

        if (error) {
          console.warn(`⚠️  Failed to execute: ${sql}`);
          console.warn(`   Error: ${error.message}`);
        } else {
          console.log(`✅ Successfully executed schema fix`);
        }
      } catch (execError) {
        console.warn(`⚠️  Exception executing: ${sql}`);
        console.warn(`   Error: ${execError.message}`);
      }
    }

    console.log('\n🔍 Verifying fixes...');

    // Test the quotes table with app_state column
    try {
      const testData = {
        quote_no: 'TEST-SCHEMA-FIX',
        customer_name: 'Schema Test',
        description: 'Testing schema fix',
        date: new Date().toISOString().split('T')[0],
        status: 'Draft',
        rev: 0,
        app_state: JSON.stringify({ test: 'schema fix successful' })
      };

      const { data, error } = await supabase
        .from('quotes')
        .upsert(testData, { onConflict: 'quote_no' })
        .select();

      if (error) {
        console.error('❌ Schema fix failed - quotes table still missing app_state:', error.message);
      } else {
        console.log('✅ Schema fix successful - quotes table can handle app_state column');

        // Clean up test record
        await supabase
          .from('quotes')
          .delete()
          .eq('quote_no', 'TEST-SCHEMA-FIX');
      }
    } catch (testError) {
      console.error('❌ Schema test failed:', testError.message);
    }

    // Test the quote_files table with uploaded_at column
    try {
      const testFileData = {
        quote_no: 'TEST-SCHEMA-FIX',
        filename: 'test_file.pdf',
        storage_path: 'test/path',
        public_url: 'https://test.com/file.pdf',
        subdir: 'drawings',
        file_size: 1024,
        mime_type: 'application/pdf',
        uploaded_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('quote_files')
        .insert(testFileData)
        .select();

      if (error) {
        console.error('❌ Schema fix failed - quote_files table still missing columns:', error.message);
      } else {
        console.log('✅ Schema fix successful - quote_files table can handle all required columns');

        // Clean up test record
        await supabase
          .from('quote_files')
          .delete()
          .eq('filename', 'test_file.pdf')
          .eq('quote_no', 'TEST-SCHEMA-FIX');
      }
    } catch (testError) {
      console.error('❌ Schema test failed:', testError.message);
    }

    console.log('\n🎉 Schema fix process completed!');
    console.log('If you see any ❌ errors above, you may need to manually run the SQL commands in your Supabase dashboard.');

  } catch (error) {
    console.error('❌ Failed to fix Supabase schema:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixSupabaseSchema().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});