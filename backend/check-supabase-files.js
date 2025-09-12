import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://fkpgfejyiafpigktyeyg.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcGdmZWp5aWFmcGlna3R5ZXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzMzA1NzEsImV4cCI6MjA0MDkwNjU3MX0.3qGxXFc1zXx22j7GZZC8q4HKQJvNJBFJKFSuF_cXCts';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseFiles() {
  try {
    console.log('Checking Supabase storage for SCM-Q0062 files...');
    
    // Check the path that should contain SCM-Q0062 drawings
    const { data: files, error } = await supabase.storage
      .from('quotes')
      .list('SLB/SCM-Q0062/drawings', {
        limit: 100,
        offset: 0,
      });
    
    if (error) {
      console.log('Error accessing SLB/SCM-Q0062/drawings:', error);
    } else {
      console.log(`Found ${files.length} files in SLB/SCM-Q0062/drawings:`);
      files.forEach((file, i) => {
        console.log(`File ${i + 1}:`);
        console.log('  Name:', file.name);
        console.log('  Size:', file.metadata?.size || 'unknown');
        console.log('  Last Modified:', file.updated_at);
        console.log('  MIME Type:', file.metadata?.mimetype || 'unknown');
        console.log('');
      });
    }
    
    // Also check without the drawings subfolder
    console.log('\nChecking SLB/SCM-Q0062/ (root)...');
    const { data: rootFiles, error: rootError } = await supabase.storage
      .from('quotes')
      .list('SLB/SCM-Q0062', {
        limit: 100,
        offset: 0,
      });
    
    if (rootError) {
      console.log('Error accessing SLB/SCM-Q0062/:', rootError);
    } else {
      console.log(`Found ${rootFiles.length} items in SLB/SCM-Q0062/:`);
      rootFiles.forEach((item, i) => {
        console.log(`Item ${i + 1}:`);
        console.log('  Name:', item.name);
        console.log('  Size:', item.metadata?.size || 'folder');
        console.log('');
      });
    }

    // Check if there are any files with 1624 or 5459 in the name anywhere in SLB
    console.log('\nSearching all SLB files for 1624 or 5459...');
    const { data: slbFiles, error: slbError } = await supabase.storage
      .from('quotes')
      .list('SLB', {
        limit: 1000,
        offset: 0,
      });
    
    if (!slbError && slbFiles) {
      console.log(`Found ${slbFiles.length} items in SLB folder`);
      // We'll need to recursively check subfolders
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSupabaseFiles();
