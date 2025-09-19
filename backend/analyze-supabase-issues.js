// Test Supabase directly to see current state and issues
import './src/loadEnv.js';
import { getSupabaseClient } from './src/utils/supabaseClient.js';

async function analyzeSupabaseIssues() {
  try {
    console.log('🔍 ANALYZING SUPABASE SYNC ISSUES...');
    
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('❌ No Supabase client available');
      return;
    }
    
    // Check 1: All quotes in Supabase
    console.log('\n--- ALL QUOTES IN SUPABASE ---');
    const { data: allQuotes, error: allError } = await supabase
      .from('quotes')
      .select('quote_no, customer_name, created_at, updated_at')
      .order('created_at', { ascending: false });
      
    if (allError) {
      console.error('❌ Error fetching quotes:', allError);
    } else {
      console.log(`📊 Total quotes in Supabase: ${allQuotes?.length || 0}`);
      console.log('Recent quotes:');
      allQuotes?.slice(0, 10).forEach(q => 
        console.log(`  - ${q.quote_no} (${q.customer_name}) - created: ${q.created_at}`)
      );
    }
    
    // Check 2: Look for SCM-Q0004 that was just created
    console.log('\n--- LOOKING FOR SCM-Q0004 ---');
    const { data: q0004, error: q0004Error } = await supabase
      .from('quotes')
      .select('*')
      .eq('quote_no', 'SCM-Q0004');
      
    if (q0004Error) {
      console.error('❌ Error looking for SCM-Q0004:', q0004Error);
    } else if (q0004 && q0004.length > 0) {
      console.log('✅ SCM-Q0004 found in Supabase:', q0004[0]);
    } else {
      console.log('❌ SCM-Q0004 NOT found in Supabase - sync failed!');
    }
    
    // Check 3: GE customer quotes
    console.log('\n--- GE CUSTOMER QUOTES ---');
    const { data: geQuotes, error: geError } = await supabase
      .from('quotes')
      .select('quote_no, customer_name, description, created_at')
      .eq('customer_name', 'GE')
      .order('created_at', { ascending: false });
      
    if (geError) {
      console.error('❌ Error fetching GE quotes:', geError);
    } else {
      console.log(`📊 GE quotes in Supabase: ${geQuotes?.length || 0}`);
      geQuotes?.forEach(q => 
        console.log(`  - ${q.quote_no} - ${q.description} - ${q.created_at}`)
      );
    }
    
    // Check 4: Check if there are quotes with today's date
    console.log('\n--- TODAY\'S QUOTES ---');
    const today = '2025-09-19';
    const { data: todayQuotes, error: todayError } = await supabase
      .from('quotes')
      .select('quote_no, customer_name, date, created_at')
      .eq('date', today);
      
    if (todayError) {
      console.error('❌ Error fetching today\'s quotes:', todayError);
    } else {
      console.log(`📊 Quotes dated ${today}: ${todayQuotes?.length || 0}`);
      todayQuotes?.forEach(q => 
        console.log(`  - ${q.quote_no} (${q.customer_name}) - created: ${q.created_at}`)
      );
    }
    
    // Check 5: Check bucket file structure
    console.log('\n--- CHECKING FILE STRUCTURE ---');
    try {
      const { data: bucketList, error: bucketError } = await supabase
        .storage
        .from('quote-files')
        .list();
        
      if (bucketError) {
        console.error('❌ Error listing bucket contents:', bucketError);
      } else {
        console.log(`📁 Top-level folders in quote-files bucket: ${bucketList?.length || 0}`);
        bucketList?.slice(0, 10).forEach(item => 
          console.log(`  - ${item.name} (${item.id ? 'folder' : 'file'})`)
        );
      }
    } catch (bucketErr) {
      console.error('❌ Bucket access error:', bucketErr.message);
    }
    
  } catch (err) {
    console.error('❌ Analysis error:', err);
  }
}

analyzeSupabaseIssues().then(() => process.exit(0));