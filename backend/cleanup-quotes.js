import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const quotesDir = path.join(__dirname, 'data/quotes');

console.log('Starting cleanup of orphaned quote folders...');
console.log('Quotes directory:', quotesDir);

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
  console.log(`\nFound ${dbQuotes.size} quotes in database:`);
  if (dbQuotes.size > 0) {
    Array.from(dbQuotes).sort().forEach(q => console.log(`  ${q}`));
  } else {
    console.log('  (Database is empty - all filesystem folders will be removed)');
  }
} catch (error) {
  console.error('Error reading database:', error);
  process.exit(1);
}

// Scan filesystem
console.log('\n=== Scanning filesystem ===');
let totalRemoved = 0;
let customersRemoved = 0;

try {
  if (!fs.existsSync(quotesDir)) {
    console.log('Quotes directory does not exist, creating it...');
    fs.mkdirSync(quotesDir, { recursive: true });
    console.log('Cleanup completed - directory was empty');
    process.exit(0);
  }

  const customerDirs = fs.readdirSync(quotesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  console.log(`Found ${customerDirs.length} customer directories`);

  for (const customerName of customerDirs) {
    const customerPath = path.join(quotesDir, customerName);
    console.log(`\nProcessing: ${customerName}`);
    
    try {
      const items = fs.readdirSync(customerPath, { withFileTypes: true });
      const quoteDirs = items.filter(d => d.isDirectory()).map(d => d.name);
      
      if (quoteDirs.length === 0) {
        console.log(`  No quote folders found, removing empty customer folder`);
        fs.rmSync(customerPath, { recursive: true, force: true });
        customersRemoved++;
        continue;
      }

      let quotesKept = 0;
      
      for (const quoteDirName of quoteDirs) {
        const quotePath = path.join(customerPath, quoteDirName);
        const parsed = parseQuoteDirName(quoteDirName);
        
        if (!parsed) {
          console.log(`  ? ${quoteDirName} - doesn't match quote pattern, removing`);
          fs.rmSync(quotePath, { recursive: true, force: true });
          totalRemoved++;
          continue;
        }

        const { quoteNo } = parsed;

        if (dbQuotes.has(quoteNo)) {
          console.log(`  ✓ ${quoteDirName} - keeping (exists in database)`);
          quotesKept++;
        } else {
          console.log(`  ✗ ${quoteDirName} - removing (not in database)`);
          fs.rmSync(quotePath, { recursive: true, force: true });
          totalRemoved++;
        }
      }

      // Remove customer folder if no quotes remain
      if (quotesKept === 0) {
        console.log(`  Removing empty customer folder: ${customerName}`);
        fs.rmSync(customerPath, { recursive: true, force: true });
        customersRemoved++;
      } else {
        console.log(`  Customer ${customerName} kept with ${quotesKept} quotes`);
      }

    } catch (error) {
      console.error(`Error processing customer ${customerName}:`, error.message);
    }
  }

} catch (error) {
  console.error('Error during cleanup:', error);
  process.exit(1);
}

console.log('\n=== Cleanup Summary ===');
console.log(`Quote folders removed: ${totalRemoved}`);
console.log(`Customer folders removed: ${customersRemoved}`);
console.log(`Quotes in database: ${dbQuotes.size}`);

// Verify final state
try {
  const remainingDirs = fs.readdirSync(quotesDir, { withFileTypes: true })
    .filter(d => d.isDirectory()).length;
  console.log(`Remaining customer directories: ${remainingDirs}`);
} catch (error) {
  console.log('Quotes directory is now empty or removed');
}

console.log('\nCleanup completed successfully!');
