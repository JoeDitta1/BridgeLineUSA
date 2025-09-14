#!/usr/bin/env node

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'data/app.db'));
const quotesDir = path.join(__dirname, 'data/quotes');

// Helper function to parse quote directory name
function parseQuoteDirName(dirName) {
  // Handle formats like "SCM-Q0024", "SCM-Q0024-Standard Pipe", etc.
  const match = dirName.match(/^([A-Z]+-[QSO]\d+)/);
  return match ? { quoteNo: match[1] } : null;
}

// Get all quotes from database
const dbQuotes = new Set();
try {
  const quotes = db.prepare('SELECT quote_no FROM quotes').all();
  quotes.forEach(q => dbQuotes.add(q.quote_no));
  console.log(`Found ${dbQuotes.size} quotes in database:`);
  Array.from(dbQuotes).sort().forEach(q => console.log(`  ${q}`));
} catch (error) {
  console.error('Error reading database:', error);
  process.exit(1);
}

// Scan filesystem for quote folders
console.log('\nScanning filesystem...');

async function cleanupOrphanedFolders() {
  const customerDirs = fs.readdirSync(quotesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let totalFoldersRemoved = 0;
  let customersToRemove = [];

  for (const customerName of customerDirs) {
    const customerPath = path.join(quotesDir, customerName);
    console.log(`\nChecking customer: ${customerName}`);
    
    try {
      const quoteDirs = fs.readdirSync(customerPath, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

      let quotesRemovedForCustomer = 0;
      
      for (const quoteDirName of quoteDirs) {
        const parsed = parseQuoteDirName(quoteDirName);
        
        if (!parsed) {
          console.log(`  Skipping non-quote folder: ${quoteDirName}`);
          continue;
        }

        const { quoteNo } = parsed;
        const quotePath = path.join(customerPath, quoteDirName);

        if (dbQuotes.has(quoteNo)) {
          console.log(`  ✓ ${quoteDirName} - exists in database`);
        } else {
          console.log(`  ✗ ${quoteDirName} - NOT in database, removing...`);
          try {
            fs.rmSync(quotePath, { recursive: true, force: true });
            totalFoldersRemoved++;
            quotesRemovedForCustomer++;
            console.log(`    Removed: ${quotePath}`);
          } catch (rmError) {
            console.error(`    Error removing ${quotePath}:`, rmError);
          }
        }
      }

      // Check if customer folder is now empty
      const remainingQuotes = fs.readdirSync(customerPath, { withFileTypes: true })
        .filter(d => d.isDirectory());

      if (remainingQuotes.length === 0) {
        console.log(`  Customer ${customerName} has no remaining quotes, marking for removal`);
        customersToRemove.push({ name: customerName, path: customerPath });
      } else {
        console.log(`  Customer ${customerName} has ${remainingQuotes.length} remaining quotes`);
      }

    } catch (error) {
      console.error(`Error processing customer ${customerName}:`, error);
    }
  }

  // Remove empty customer folders
  for (const customer of customersToRemove) {
    try {
      fs.rmSync(customer.path, { recursive: true, force: true });
      console.log(`Removed empty customer folder: ${customer.name}`);
    } catch (error) {
      console.error(`Error removing customer folder ${customer.name}:`, error);
    }
  }

  console.log(`\n=== Cleanup Summary ===`);
  console.log(`Total quote folders removed: ${totalFoldersRemoved}`);
  console.log(`Empty customer folders removed: ${customersToRemove.length}`);
  console.log(`Quotes remaining in database: ${dbQuotes.size}`);
}

cleanupOrphanedFolders()
  .then(() => {
    console.log('\nCleanup completed!');
    db.close();
  })
  .catch(error => {
    console.error('Cleanup failed:', error);
    db.close();
    process.exit(1);
  });
