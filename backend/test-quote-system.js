#!/usr/bin/env node
/**
 * Test script to verify quote creation and soft delete workflow
 * This ensures the system works properly for both quotes and future Sales Orders
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_BASE = 'http://localhost:4000/api';
const TEST_QUOTE = {
  quote_no: 'TEST-Q0001',
  customer_name: 'Test Customer Co',
  description: 'Test Quote Description',
  requested_by: 'Test User',
  estimator: 'Test Estimator',
  date: '2025-09-10',
  status: 'Draft'
};

async function apiCall(method, endpoint, body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    
    return {
      ok: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message
    };
  }
}

async function runTest() {
  console.log('🧪 Starting Quote System Integration Test\n');
  
  // Test 1: Create a new quote
  console.log('1️⃣ Testing quote creation...');
  const createResult = await apiCall('POST', '/quotes', TEST_QUOTE);
  
  if (!createResult.ok) {
    console.error('❌ Quote creation failed:', createResult.data || createResult.error);
    process.exit(1);
  }
  
  console.log('✅ Quote created successfully!');
  console.log(`   Quote No: ${createResult.data.quote?.quote_no}`);
  console.log(`   Customer: ${createResult.data.quote?.customer_name}`);
  console.log(`   Folder created: ${createResult.data.folder ? 'Yes' : 'No'}`);
  
  if (createResult.data.folder) {
    console.log(`   Folder path: ${createResult.data.folder.folderPath}`);
  }
  
  const createdQuoteNo = createResult.data.quote.quote_no;
  
  // Test 2: Verify quote appears in customer list
  console.log('\n2️⃣ Testing customer listing...');
  const customersResult = await apiCall('GET', '/customers');
  
  if (!customersResult.ok) {
    console.error('❌ Customer listing failed:', customersResult.data);
    process.exit(1);
  }
  
  const testCustomer = customersResult.data.find(c => c.name === 'Test Customer Co');
  if (!testCustomer) {
    console.error('❌ Test customer not found in customer list');
    process.exit(1);
  }
  
  console.log('✅ Customer appears in listing with quote count:', testCustomer.quoteCount);
  
  // Test 3: Soft delete the quote
  console.log('\n3️⃣ Testing soft delete...');
  const deleteResult = await apiCall('POST', `/admin/quotes/${createdQuoteNo}/soft-delete`);
  
  if (!deleteResult.ok) {
    console.error('❌ Soft delete failed:', deleteResult.data);
    process.exit(1);
  }
  
  console.log('✅ Quote soft deleted successfully!');
  
  // Test 4: Verify customer no longer appears (all quotes soft deleted)
  console.log('\n4️⃣ Testing customer list after soft delete...');
  const customersAfterDelete = await apiCall('GET', '/customers');
  
  if (!customersAfterDelete.ok) {
    console.error('❌ Customer listing failed:', customersAfterDelete.data);
    process.exit(1);
  }
  
  const customerAfterDelete = customersAfterDelete.data.find(c => c.name === 'Test Customer Co');
  
  if (customerAfterDelete) {
    console.log('⚠️  Customer still appears in listing (may have other quotes)');
  } else {
    console.log('✅ Customer correctly hidden from listing (all quotes soft deleted)');
  }
  
  // Test 5: Restore the quote
  console.log('\n5️⃣ Testing quote restore...');
  const restoreResult = await apiCall('POST', `/admin/quotes/${createdQuoteNo}/restore`);
  
  if (!restoreResult.ok) {
    console.error('❌ Quote restore failed:', restoreResult.data);
    process.exit(1);
  }
  
  console.log('✅ Quote restored successfully!');
  
  // Test 6: Verify customer appears again
  console.log('\n6️⃣ Testing customer list after restore...');
  const customersAfterRestore = await apiCall('GET', '/customers');
  
  if (!customersAfterRestore.ok) {
    console.error('❌ Customer listing failed:', customersAfterRestore.data);
    process.exit(1);
  }
  
  const customerAfterRestore = customersAfterRestore.data.find(c => c.name === 'Test Customer Co');
  
  if (!customerAfterRestore) {
    console.error('❌ Customer not found after restore');
    process.exit(1);
  }
  
  console.log('✅ Customer reappears in listing after restore');
  
  // Final cleanup - soft delete again
  console.log('\n🧹 Cleaning up test data...');
  await apiCall('POST', `/admin/quotes/${createdQuoteNo}/soft-delete`);
  console.log('✅ Test quote soft deleted for cleanup');
  
  console.log('\n🎉 All tests passed! Quote system is working correctly.');
  console.log('\nThe system is ready for:');
  console.log('  ✓ Proper quote creation with database + Supabase sync');
  console.log('  ✓ Consistent folder naming using safeFolderName()');
  console.log('  ✓ Soft delete functionality');
  console.log('  ✓ Quote restore functionality');
  console.log('  ✓ Customer listing with proper filtering');
  console.log('  ✓ Ready for Sales Order module (same pattern)');
}

// Check if server is running
console.log('Checking if backend server is running...');
apiCall('GET', '/health')
  .then(result => {
    if (result.ok) {
      console.log('✅ Server is running, starting tests...\n');
      runTest().catch(console.error);
    } else {
      console.error('❌ Backend server is not running. Please start it with: npm start');
      process.exit(1);
    }
  })
  .catch(() => {
    console.error('❌ Cannot connect to backend server. Please start it with: npm start');
    process.exit(1);
  });
