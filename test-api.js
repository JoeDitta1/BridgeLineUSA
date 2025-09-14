#!/usr/bin/env node

// Simple test script to verify deletion API

const API_BASE = 'http://localhost:4000';

async function testDeletion() {
  console.log('Testing deletion API...');
  
  try {
    // First, get a list of all quotes
    console.log('Fetching quotes...');
    const quotesRes = await fetch(`${API_BASE}/api/quotes`);
    if (!quotesRes.ok) {
      throw new Error(`Failed to fetch quotes: ${quotesRes.status}`);
    }
    
    const quotes = await quotesRes.json();
    console.log(`Found ${quotes.length} total quotes`);
    
    // Filter to active quotes
    const activeQuotes = quotes.filter(q => !q.deleted_at);
    console.log(`Found ${activeQuotes.length} active quotes`);
    
    if (activeQuotes.length === 0) {
      console.log('No active quotes to test deletion with');
      return;
    }
    
    console.log('First 3 active quotes:');
    activeQuotes.slice(0, 3).forEach(q => {
      console.log(`  - ${q.quote_no}: ${q.customer_name}`);
    });
    
    // Test the deletion API endpoint (but don't actually delete)
    const testQuote = activeQuotes[0];
    console.log(`Testing deletion API for quote: ${testQuote.quote_no}`);
    
    // Just check if the endpoint exists
    const deleteRes = await fetch(`${API_BASE}/api/admin/quotes/${encodeURIComponent(testQuote.quote_no)}/soft-delete`, {
      method: 'OPTIONS', // Use OPTIONS to test without actually deleting
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`Deletion endpoint response: ${deleteRes.status}`);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testDeletion();
