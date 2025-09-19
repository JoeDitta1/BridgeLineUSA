import Database from 'better-sqlite3';

const db = new Database('./data/app.db');
const quotes = db.prepare('SELECT quote_no, customer_name, description, created_at FROM quotes WHERE customer_name = ? ORDER BY created_at DESC').all('Atlas Copco');

console.log('Atlas Copco quotes in database:');
quotes.forEach((q, i) => {
    console.log(`  ${i+1}. ${q.quote_no} - ${q.description || 'null'} (${q.created_at})`);
});

console.log(`\nTotal Atlas Copco quotes: ${quotes.length}`);
db.close();