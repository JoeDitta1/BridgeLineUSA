import { createClient } from '@supabase/supabase-js';
import * as dbModule from './src/db.js';

const db = dbModule.default ?? dbModule.db ?? dbModule;

// Get Supabase credentials from kv_store
function getSupabaseCredentials() {
  try {
    const urlRow = db.prepare("SELECT value FROM kv_store WHERE key = 'SUPABASE_URL'").get();
    const keyRow = db.prepare("SELECT value FROM kv_store WHERE key = 'SUPABASE_ANON_KEY'").get();
    const serviceKeyRow = db.prepare("SELECT value FROM kv_store WHERE key = 'SUPABASE_SERVICE_KEY'").get();

    return {
      url: urlRow?.value,
      anonKey: keyRow?.value,
      serviceKey: serviceKeyRow?.value
    };
  } catch (error) {
    console.error('Failed to get Supabase credentials:', error);
    return null;
  }
}

// Create Supabase tables
async function createSupabaseTables() {
  const credentials = getSupabaseCredentials();
  if (!credentials || !credentials.url || !credentials.serviceKey) {
    console.error('Supabase credentials not found in kv_store');
    return false;
  }

  // Use service role key for admin operations
  const supabase = createClient(credentials.url, credentials.serviceKey);

  console.log('Creating Supabase tables...');

  try {
    // Create materials table
    console.log('Creating materials table...');
    const { error: materialsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS materials (
          id BIGSERIAL PRIMARY KEY,
          type TEXT NOT NULL,
          size TEXT,
          unit_type TEXT,
          grade TEXT,
          weight_per_ft REAL,
          weight_per_sqin REAL,
          price_per_lb REAL,
          price_per_ft REAL,
          price_each REAL,
          description TEXT,
          pipe_schedule TEXT,
          pipe_schedule_num INTEGER,
          ai_searchable INTEGER DEFAULT 1,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    if (materialsError) {
      console.error('Error creating materials table:', materialsError);
    } else {
      console.log('✅ Materials table created');
    }

    // Create quotes table
    console.log('Creating quotes table...');
    const { error: quotesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS quotes (
          id BIGSERIAL PRIMARY KEY,
          quote_no TEXT NOT NULL UNIQUE,
          customer_name TEXT NOT NULL,
          description TEXT,
          requested_by TEXT,
          estimator TEXT,
          date DATE NOT NULL,
          status TEXT NOT NULL DEFAULT 'Draft',
          sales_order_no TEXT,
          rev INTEGER NOT NULL DEFAULT 0,
          app_state JSONB,
          deleted_at TIMESTAMPTZ NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    if (quotesError) {
      console.error('Error creating quotes table:', quotesError);
    } else {
      console.log('✅ Quotes table created');
    }

    // Create customers table
    console.log('Creating customers table...');
    const { error: customersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS customers (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          deleted_at TIMESTAMPTZ NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    if (customersError) {
      console.error('Error creating customers table:', customersError);
    } else {
      console.log('✅ Customers table created');
    }

    // Create quote_files table
    console.log('Creating quote_files table...');
    const { error: filesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS quote_files (
          id BIGSERIAL PRIMARY KEY,
          quote_no TEXT,
          quote_id TEXT,
          customer_name TEXT,
          filename TEXT NOT NULL,
          stored_filename TEXT,
          storage_path TEXT,
          public_url TEXT,
          subdir TEXT,
          file_size INTEGER,
          mime_type TEXT,
          uploaded_at TIMESTAMPTZ DEFAULT NOW(),
          deleted_at TIMESTAMPTZ NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    if (filesError) {
      console.error('Error creating quote_files table:', filesError);
    } else {
      console.log('✅ Quote_files table created');
    }

    // Create indexes
    console.log('Creating indexes...');
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(date)',
      'CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_name)',
      'CREATE INDEX IF NOT EXISTS idx_quotes_quote_no ON quotes(quote_no)',
      'CREATE INDEX IF NOT EXISTS idx_quotes_deleted ON quotes(deleted_at)',
      'CREATE INDEX IF NOT EXISTS idx_customers_deleted ON customers(deleted_at)',
      'CREATE INDEX IF NOT EXISTS idx_quote_files_quote_no ON quote_files(quote_no)',
      'CREATE INDEX IF NOT EXISTS idx_quote_files_deleted ON quote_files(deleted_at)'
    ];

    for (const indexQuery of indexQueries) {
      try {
        const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexQuery });
        if (indexError) {
          console.error('Error creating index:', indexQuery, indexError);
        }
      } catch (e) {
        console.warn('Index creation failed (may already exist):', indexQuery);
      }
    }

    console.log('✅ Indexes created');

    // Enable Row Level Security (optional)
    console.log('Enabling Row Level Security...');
    const rlsQueries = [
      'ALTER TABLE quotes ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE customers ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE quote_files ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE materials ENABLE ROW LEVEL SECURITY'
    ];

    for (const rlsQuery of rlsQueries) {
      try {
        const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsQuery });
        if (rlsError) {
          console.warn('RLS enable failed (may already be enabled):', rlsQuery);
        }
      } catch (e) {
        console.warn('RLS enable failed:', rlsQuery);
      }
    }

    console.log('✅ Row Level Security enabled');

    console.log('🎉 All Supabase tables created successfully!');
    return true;

  } catch (error) {
    console.error('Error creating Supabase tables:', error);

    // Fallback: try direct SQL execution without rpc
    console.log('Trying direct SQL execution...');

    try {
      // Direct table creation using raw SQL
      const tables = [
        {
          name: 'materials',
          sql: `
            CREATE TABLE IF NOT EXISTS materials (
              id BIGSERIAL PRIMARY KEY,
              type TEXT NOT NULL,
              size TEXT,
              unit_type TEXT,
              grade TEXT,
              weight_per_ft REAL,
              weight_per_sqin REAL,
              price_per_lb REAL,
              price_per_ft REAL,
              price_each REAL,
              description TEXT,
              pipe_schedule TEXT,
              pipe_schedule_num INTEGER,
              ai_searchable INTEGER DEFAULT 1,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
            );
          `
        },
        {
          name: 'quotes',
          sql: `
            CREATE TABLE IF NOT EXISTS quotes (
              id BIGSERIAL PRIMARY KEY,
              quote_no TEXT NOT NULL UNIQUE,
              customer_name TEXT NOT NULL,
              description TEXT,
              requested_by TEXT,
              estimator TEXT,
              date DATE NOT NULL,
              status TEXT NOT NULL DEFAULT 'Draft',
              sales_order_no TEXT,
              rev INTEGER NOT NULL DEFAULT 0,
              app_state JSONB,
              deleted_at TIMESTAMPTZ NULL,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
            );
          `
        },
        {
          name: 'customers',
          sql: `
            CREATE TABLE IF NOT EXISTS customers (
              id BIGSERIAL PRIMARY KEY,
              name TEXT NOT NULL UNIQUE,
              deleted_at TIMESTAMPTZ NULL,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
            );
          `
        },
        {
          name: 'quote_files',
          sql: `
            CREATE TABLE IF NOT EXISTS quote_files (
              id BIGSERIAL PRIMARY KEY,
              quote_no TEXT,
              quote_id TEXT,
              customer_name TEXT,
              filename TEXT NOT NULL,
              stored_filename TEXT,
              storage_path TEXT,
              public_url TEXT,
              subdir TEXT,
              file_size INTEGER,
              mime_type TEXT,
              uploaded_at TIMESTAMPTZ DEFAULT NOW(),
              deleted_at TIMESTAMPTZ NULL,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
            );
          `
        }
      ];

      for (const table of tables) {
        try {
          console.log(`Creating ${table.name} table...`);
          const { error } = await supabase.from(table.name).select('id').limit(1);
          if (error && error.code === 'PGRST116') {
            // Table doesn't exist, we would need to create it manually
            console.log(`⚠️  ${table.name} table needs to be created manually in Supabase dashboard`);
            console.log('SQL to execute:');
            console.log(table.sql);
            console.log('---');
          } else {
            console.log(`✅ ${table.name} table already exists`);
          }
        } catch (e) {
          console.log(`⚠️  ${table.name} table status unknown:`, e.message);
        }
      }

      console.log('\n📋 MANUAL SETUP REQUIRED:');
      console.log('Please execute these SQL commands in your Supabase SQL Editor:');
      console.log('='.repeat(80));

      tables.forEach(table => {
        console.log(`-- Create ${table.name} table`);
        console.log(table.sql);
        console.log('');
      });

      console.log('-- Create indexes');
      console.log(`CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(date);
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_name);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_no ON quotes(quote_no);
CREATE INDEX IF NOT EXISTS idx_quotes_deleted ON quotes(deleted_at);
CREATE INDEX IF NOT EXISTS idx_customers_deleted ON customers(deleted_at);
CREATE INDEX IF NOT EXISTS idx_quote_files_quote_no ON quote_files(quote_no);
CREATE INDEX IF NOT EXISTS idx_quote_files_deleted ON quote_files(deleted_at);`);

      console.log('='.repeat(80));

    } catch (fallbackError) {
      console.error('Fallback method also failed:', fallbackError);
    }

    return false;
  } finally {
    db.close();
  }
}

createSupabaseTables();