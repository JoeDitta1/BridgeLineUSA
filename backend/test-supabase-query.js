#!/usr/bin/env node

import { getSupabaseClient } from './src/utils/supabaseClient.js';

console.log('Testing Supabase quotes table query...');

const supabase = getSupabaseClient();
if (!supabase) {
  console.error('Failed to get Supabase client');
  process.exit(1);
}

try {
  // Query all quotes from Supabase
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (error) {
    console.error('Supabase query error:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
  } else {
    console.log(`Found ${data.length} quotes in Supabase:`);
    data.forEach((quote, index) => {
      console.log(`${index + 1}. ${quote.quote_no} - ${quote.customer_name || quote.customer} - "${quote.description}" (ID: ${quote.id})`);
    });
    
    // Look specifically for Frank's quote
    const frankQuote = data.find(q => q.customer_name === 'Frank' || q.customer === 'Frank');
    if (frankQuote) {
      console.log('\n✅ Found Frank\'s quote:', frankQuote);
    } else {
      console.log('\n❌ Frank\'s quote not found in Supabase');
    }
  }
} catch (exception) {
  console.error('Exception during query:', exception);
}

console.log('Test completed.');
