/**
 * Setup Supabase user_profiles table for OEM module user management
 * This script creates the user_profiles table and sets up RLS policies
 */

import { getSupabaseAdminClient } from '../src/utils/supabaseClient.js';

async function setupUserProfilesTable() {
  console.log('Setting up user_profiles table in Supabase...');
  
  const client = getSupabaseAdminClient();
  if (!client) {
    console.error('❌ Supabase admin client not configured');
    process.exit(1);
  }

  try {
    // Create user_profiles table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'oem')),
        company TEXT,
        full_name TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `;

    console.log('Creating user_profiles table...');
    const { error: tableError } = await client.rpc('exec_sql', { sql: createTableSQL });
    
    if (tableError) {
      console.error('❌ Error creating table:', tableError);
      return;
    }

    // Create indexes for better performance
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_company ON user_profiles(company);
    `;

    console.log('Creating indexes...');
    const { error: indexError } = await client.rpc('exec_sql', { sql: createIndexSQL });
    
    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
      return;
    }

    // Enable RLS on the table
    const enableRLSSQL = `
      ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    `;

    console.log('Enabling Row Level Security...');
    const { error: rlsError } = await client.rpc('exec_sql', { sql: enableRLSSQL });
    
    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError);
      return;
    }

    // Create RLS policies
    const createPoliciesSQL = `
      -- Policy for service role (admin operations)
      CREATE POLICY IF NOT EXISTS "Service role can do everything" ON user_profiles
        FOR ALL USING (true);

      -- Policy for authenticated users to read their own profile
      CREATE POLICY IF NOT EXISTS "Users can read own profile" ON user_profiles
        FOR SELECT USING (auth.uid() = user_id);

      -- Policy for authenticated users to update their own profile
      CREATE POLICY IF NOT EXISTS "Users can update own profile" ON user_profiles
        FOR UPDATE USING (auth.uid() = user_id);
    `;

    console.log('Creating RLS policies...');
    const { error: policyError } = await client.rpc('exec_sql', { sql: createPoliciesSQL });
    
    if (policyError) {
      console.error('❌ Error creating policies:', policyError);
      return;
    }

    // Create a function to create the SQL execution function if it doesn't exist
    const createExecFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    console.log('Creating SQL execution function...');
    const { error: funcError } = await client.rpc('exec_sql', { sql: createExecFunctionSQL });
    
    if (funcError && !funcError.message.includes('already exists')) {
      console.error('❌ Error creating function:', funcError);
      return;
    }

    console.log('✅ User profiles table setup completed successfully!');
    
    // Verify the table was created
    const { data: tables, error: verifyError } = await client
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'user_profiles');
    
    if (verifyError) {
      console.error('❌ Error verifying table creation:', verifyError);
      return;
    }

    if (tables && tables.length > 0) {
      console.log('✅ Table verification successful');
    } else {
      console.log('⚠️  Table verification: user_profiles table not found in schema');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Alternative method using direct SQL if RPC doesn't work
async function setupWithDirectSQL() {
  console.log('Attempting setup with direct SQL queries...');
  
  const client = getSupabaseAdminClient();
  if (!client) {
    console.error('❌ Supabase admin client not configured');
    process.exit(1);
  }

  try {
    // Check if table already exists
    const { data: existingTables } = await client
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (existingTables !== null) {
      console.log('✅ user_profiles table already exists');
      return;
    }
  } catch (error) {
    // Table doesn't exist, continue with creation
    console.log('Table does not exist, creating...');
  }

  // If we can't use SQL functions, provide manual setup instructions
  console.log(`
📋 Manual Supabase Setup Instructions:

1. Go to your Supabase Dashboard > SQL Editor
2. Run this SQL to create the user_profiles table:

CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'oem')),
  company TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_company ON user_profiles(company);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything" ON user_profiles
  FOR ALL USING (true);

CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

3. After running the SQL, test the API endpoints from the frontend
  `);
}

// Run the setup
if (process.argv.includes('--manual')) {
  setupWithDirectSQL();
} else {
  setupUserProfilesTable();
}