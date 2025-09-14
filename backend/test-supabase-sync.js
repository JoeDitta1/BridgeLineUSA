#!/usr/bin/env node

import { getSupabaseClient } from './src/utils/supabaseClient.js';

console.log('Testing Supabase connection and table insert...');

const supabase = getSupabaseClient();
if (!supabase) {
  console.error('Failed to get Supabase client');
  process.exit(1);
}

// Test data matching actual Supabase schema (no deleted_at column)
const testData = {
  quote_no: 'MANUAL-TEST-002',
  customer_name: 'Manual Test Customer V2',
  description: 'Manual test description v2',
  requested_by: 'Test User',
  estimator: 'Test Estimator',
  date: '2025-09-10',
  status: 'Draft',
  sales_order_no: null,
  rev: 0,
  customer: 'Manual Test Customer V2', // Map to customer field
  updated_at: new Date().toISOString()
  // Removed: created_at, deleted_at, tenant_id (let Supabase handle these)
};

console.log('Attempting to insert test data:', testData);

try {
  const { data, error } = await supabase
    .from('quotes')
    .insert(testData)
    .select();
    
  if (error) {
    console.error('Supabase insert error:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
  } else {
    console.log('Success! Inserted data:', data);
  }
} catch (exception) {
  console.error('Exception during insert:', exception);
}

console.log('Test completed.');
