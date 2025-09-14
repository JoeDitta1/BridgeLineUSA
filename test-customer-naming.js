#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { ensureQuoteFolders } from './backend/src/lib/quoteFolders.js';

async function testCustomerNaming() {
  console.log('Testing customer naming consistency...');
  
  // Test case-preserving folder creation
  const testCustomer = 'TestCustomer';
  const quoteNo = 'Q999';
  const description = 'Test Quote';
  
  try {
    // Create folders using our updated function
    const result = await ensureQuoteFolders({
      customerName: testCustomer,
      quoteNo: quoteNo,
      description: description
    });
    
    console.log('Created folders:', result);
    
    // Check what actually exists on disk
    const quotesRoot = path.join(process.cwd(), 'backend', 'data', 'quotes');
    const entries = await fs.readdir(quotesRoot);
    
    const testCustomerFolders = entries.filter(entry => 
      entry.toLowerCase().includes('testcustomer')
    );
    
    console.log('Customer folders found:', testCustomerFolders);
    
    if (testCustomerFolders.length === 1) {
      console.log('✅ SUCCESS: Only one customer folder created');
      console.log('✅ Folder name preserves case:', testCustomerFolders[0]);
    } else {
      console.log('❌ ISSUE: Multiple customer folders found:', testCustomerFolders);
    }
    
    // Cleanup
    if (testCustomerFolders.length > 0) {
      for (const folder of testCustomerFolders) {
        const folderPath = path.join(quotesRoot, folder);
        await fs.rm(folderPath, { recursive: true, force: true });
        console.log('Cleaned up:', folder);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCustomerNaming();
