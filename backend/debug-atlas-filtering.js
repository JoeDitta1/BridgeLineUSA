import Database from 'better-sqlite3';

const db = new Database('./data/app.db');

// Check all folders in Atlas Copco directory
const folders = ['SCM-Q0006', 'SCM-Q0007', 'SCM-Q0008'];

console.log('Checking database for each folder found in filesystem:');
folders.forEach(quoteNo => {
    const dbQuote = db.prepare('SELECT quote_no, customer_name, deleted_at FROM quotes WHERE quote_no = ? LIMIT 1').get(quoteNo);
    if (dbQuote) {
        console.log(`✅ ${quoteNo}: Found in DB - Customer: ${dbQuote.customer_name}, Deleted: ${dbQuote.deleted_at || 'null'}`);
    } else {
        console.log(`❌ ${quoteNo}: NOT found in database`);
    }
});

console.log('\nAll quotes in database:');
const allQuotes = db.prepare('SELECT quote_no, customer_name, deleted_at FROM quotes ORDER BY created_at DESC').all();
allQuotes.forEach(quote => {
    console.log(`  ${quote.quote_no} - ${quote.customer_name} (deleted: ${quote.deleted_at || 'null'})`);
});

db.close();