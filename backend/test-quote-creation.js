// Test quote creation to see what's happening with Supabase sync
import './src/loadEnv.js';
import { getSupabaseClient } from './src/utils/supabaseClient.js';

async function testQuoteCreation() {
  try {
    console.log('🔄 Testing quote creation process...');
    
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('❌ No Supabase client available');
      return;
    }
    
    // Test 1: Check current quotes in Supabase
    console.log('\n--- Test 1: Current Supabase quotes ---');
    const { data: currentQuotes, error: currentError } = await supabase
      .from('quotes')
      .select('quote_no, customer_name, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (currentError) {
      console.error('❌ Error fetching current quotes:', currentError);
    } else {
      console.log(`✅ Found ${currentQuotes?.length || 0} recent quotes:`);
      currentQuotes?.forEach(q => console.log(`  - ${q.quote_no} (${q.customer_name}) - ${q.created_at}`));
    }
    
    // Test 2: Look for SCM-Q0004 specifically
    console.log('\n--- Test 2: Looking for SCM-Q0004 ---');
    const { data: targetQuote, error: targetError } = await supabase
      .from('quotes')
      .select('*')
      .eq('quote_no', 'SCM-Q0004')
      .single();
      
    if (targetError && targetError.code !== 'PGRST116') {
      console.error('❌ Error looking for SCM-Q0004:', targetError);
    } else if (targetQuote) {
      console.log('✅ Found SCM-Q0004 in Supabase:', targetQuote);
    } else {
      console.log('❌ SCM-Q0004 NOT found in Supabase');
    }
    
    // Test 3: Check for GE customer quotes
    console.log('\n--- Test 3: GE customer quotes ---');
    const { data: geQuotes, error: geError } = await supabase
      .from('quotes')
      .select('quote_no, customer_name, created_at')
      .eq('customer_name', 'GE');
      
    if (geError) {
      console.error('❌ Error fetching GE quotes:', geError);
    } else {
      console.log(`✅ Found ${geQuotes?.length || 0} GE quotes:`);
      geQuotes?.forEach(q => console.log(`  - ${q.quote_no} - ${q.created_at}`));
    }
    
    // Test 4: Test quote creation API directly
    console.log('\n--- Test 4: Testing quote creation API ---');
    try {
      const response = await fetch('http://localhost:4000/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote_no: 'SCM-Q9999',
          customer_name: 'TEST-CUSTOMER',
          date: '2025-09-19',
          description: 'Test quote for debugging',
          estimator: 'Joe',
          status: 'Draft'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Quote creation API test successful:', data);
      } else {
        console.error('❌ Quote creation API test failed:', response.status, await response.text());
      }
    } catch (apiError) {
      console.error('❌ Quote creation API test error:', apiError.message);
    }
    
  } catch (err) {
    console.error('❌ Test error:', err);
  }
}

testQuoteCreation().then(() => process.exit(0));