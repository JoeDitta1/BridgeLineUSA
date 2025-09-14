#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { ensureQuoteFolders } from './backend/src/lib/quoteFolders.js';

async function testMultipleCases() {
  console.log('Testing multiple case variations...');
  
  const quotesRoot = path.join(process.cwd(), 'backend', 'data', 'quotes');
  
  try {
    // Test creating folders with different case variations of same customer
    const customerVariations = ['Paper', 'paper', 'PAPER'];
    
    for (let i = 0; i < customerVariations.length; i++) {
      const customerName = customerVariations[i];
      const result = await ensureQuoteFolders({
        customerName: customerName,
        quoteNo: `Q99${i}`,
        description: `Test Quote ${i}`
      });
      
      console.log(`Created for "${customerName}":`, result.customerDir);
    }
    
    // Check what folders exist
    const entries = await fs.readdir(quotesRoot);
    const paperFolders = entries.filter(entry => 
      entry.toLowerCase().includes('paper')
    );
    
    console.log('Paper customer folders found:', paperFolders);
    
    if (paperFolders.length === 3) {
      console.log('✅ SUCCESS: All three case variations created separate folders');
      console.log('✅ This preserves user input exactly as typed');
    } else {
      console.log('❌ Unexpected folder count:', paperFolders.length);
    }
    
    // Cleanup
    for (const folder of paperFolders) {
      const folderPath = path.join(quotesRoot, folder);
      await fs.rm(folderPath, { recursive: true, force: true });
      console.log('Cleaned up:', folder);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMultipleCases();
