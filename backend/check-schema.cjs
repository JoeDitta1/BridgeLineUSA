const Database = require('better-sqlite3');

try {
  const db = new Database('./data/app.db');
  
  console.log('=== Quotes Table Schema ===');
  const schema = db.prepare('PRAGMA table_info(quotes)').all();
  schema.forEach(col => {
    console.log(`- ${col.name} (${col.type})`);
  });
  
  console.log('\n=== Atlas Copco Quotes ===');
  const quotes = db.prepare(`
    SELECT quote_no, customer_name, description, deleted_at, date 
    FROM quotes 
    WHERE customer_name = ? 
    ORDER BY date DESC
  `).all('Atlas Copco');
  
  if (quotes.length === 0) {
    console.log('No quotes found for Atlas Copco');
  } else {
    quotes.forEach((q, i) => {
      console.log(`${i + 1}. Quote: ${q.quote_no}`);
      console.log(`   Description: ${q.description || 'No description'}`);
      console.log(`   Status: ${q.deleted_at ? 'DELETED' : 'ACTIVE'}`);
      console.log(`   Deleted At: ${q.deleted_at || 'NULL'}`);
      console.log(`   Date: ${q.date}`);
      console.log('');
    });
  }
  
  console.log(`Total quotes: ${quotes.length}`);
  console.log(`Active quotes: ${quotes.filter(q => !q.deleted_at).length}`);
  console.log(`Deleted quotes: ${quotes.filter(q => q.deleted_at).length}`);
  
  db.close();
} catch (error) {
  console.error('Database error:', error.message);
}