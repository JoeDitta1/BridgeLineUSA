#!/usr/bin/env node

// Test script to simulate quote deletions and check for issues

const API_BASE = 'http://localhost:4000';

async function testQuoteDeletion() {
  console.log('Testing quote deletion functionality...');
  
  try {
    // Get all active quotes
    const quotesRes = await fetch(`${API_BASE}/api/quotes`);
    const quotesData = await quotesRes.json();
    console.log(`Found ${quotesData.length} total quotes`);
    
    // Filter active quotes (not deleted)
    const activeQuotes = quotesData.filter(q => !q.deleted_at);
    console.log(`Found ${activeQuotes.length} active quotes:`);
    activeQuotes.forEach(q => console.log(`  - ${q.quote_no}: ${q.customer_name}`));
    
    if (activeQuotes.length === 0) {
      console.log('No active quotes to test deletion with');
      return;
    }
    
    // Try to soft delete the first active quote
    const testQuote = activeQuotes[0];
    console.log(`\nTrying to soft delete quote: ${testQuote.quote_no}`);
    
    const deleteRes = await fetch(`${API_BASE}/api/admin/quotes/${encodeURIComponent(testQuote.quote_no)}/soft-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const deleteData = await deleteRes.json();
    console.log('Delete response:', deleteData);
    
    if (deleteRes.ok) {
      console.log('✅ Deletion successful!');
      
      // Verify deletion
      const verifyRes = await fetch(`${API_BASE}/api/quotes`);
      const verifyData = await verifyRes.json();
      const stillActive = verifyData.filter(q => !q.deleted_at);
      
      console.log(`Active quotes after deletion: ${stillActive.length}`);
      
      // Restore the quote to not mess up your data
      console.log(`Restoring quote ${testQuote.quote_no}...`);
      const restoreRes = await fetch(`${API_BASE}/api/admin/quotes/${encodeURIComponent(testQuote.quote_no)}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const restoreData = await restoreRes.json();
      if (restoreRes.ok) {
        console.log('✅ Quote restored successfully');
      } else {
        console.log('❌ Failed to restore quote:', restoreData);
      }
      
    } else {
      console.log('❌ Deletion failed:', deleteData);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testQuoteDeletion();
