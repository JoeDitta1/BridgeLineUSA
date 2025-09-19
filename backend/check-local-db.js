// Check local SQLite database for the GE quote
import './src/loadEnv.js';
import * as dbModule from './src/db.js';

const db = dbModule.default ?? dbModule.db ?? dbModule;

try {
  console.log('🔍 CHECKING LOCAL SQLITE DATABASE...');
  
  // Check 1: All quotes in local DB
  console.log('\n--- ALL LOCAL QUOTES ---');
  const allQuotes = db.prepare(`
    SELECT quote_no, customer_name, date, created_at, deleted_at, status 
    FROM quotes 
    ORDER BY created_at DESC 
    LIMIT 10
  `).all();
  
  console.log(`📊 Total recent quotes in local DB: ${allQuotes?.length || 0}`);
  allQuotes.forEach(q => 
    console.log(`  - ${q.quote_no} (${q.customer_name}) - ${q.date} - deleted: ${q.deleted_at ? 'YES' : 'NO'} - status: ${q.status}`)
  );
  
  // Check 2: Look for SCM-Q0004 specifically
  console.log('\n--- SCM-Q0004 IN LOCAL DB ---');
  const q0004Local = db.prepare(`
    SELECT * FROM quotes WHERE quote_no = 'SCM-Q0004'
  `).get();
  
  if (q0004Local) {
    console.log('✅ SCM-Q0004 found in local DB:', q0004Local);
  } else {
    console.log('❌ SCM-Q0004 NOT found in local DB');
  }
  
  // Check 3: Look for GE customer quotes
  console.log('\n--- GE CUSTOMER QUOTES IN LOCAL DB ---');
  const geQuotes = db.prepare(`
    SELECT quote_no, customer_name, date, created_at, deleted_at 
    FROM quotes 
    WHERE customer_name = 'GE'
    ORDER BY created_at DESC
  `).all();
  
  console.log(`📊 GE quotes in local DB: ${geQuotes?.length || 0}`);
  geQuotes.forEach(q => 
    console.log(`  - ${q.quote_no} - ${q.date} - deleted: ${q.deleted_at ? 'YES' : 'NO'} - created: ${q.created_at}`)
  );
  
  // Check 4: Today's quotes
  console.log('\n--- TODAY\'S QUOTES IN LOCAL DB ---');
  const todayQuotes = db.prepare(`
    SELECT quote_no, customer_name, date, created_at, deleted_at 
    FROM quotes 
    WHERE date = '2025-09-19'
    ORDER BY created_at DESC
  `).all();
  
  console.log(`📊 Quotes dated 2025-09-19 in local DB: ${todayQuotes?.length || 0}`);
  todayQuotes.forEach(q => 
    console.log(`  - ${q.quote_no} (${q.customer_name}) - deleted: ${q.deleted_at ? 'YES' : 'NO'} - created: ${q.created_at}`)
  );
  
  // Check 5: Next quote number
  console.log('\n--- NEXT QUOTE NUMBER ---');
  const maxQuote = db.prepare(`
    SELECT quote_no FROM quotes 
    WHERE quote_no LIKE 'SCM-Q%' 
    ORDER BY CAST(SUBSTR(quote_no, 6) AS INTEGER) DESC 
    LIMIT 1
  `).get();
  
  if (maxQuote) {
    const currentNum = parseInt(maxQuote.quote_no.replace('SCM-Q', ''));
    console.log(`🔢 Highest quote number: ${maxQuote.quote_no} (${currentNum})`);
    console.log(`🔢 Next quote number should be: SCM-Q${String(currentNum + 1).padStart(4, '0')}`);
  }
  
} catch (err) {
  console.error('❌ Database check error:', err);
} finally {
  // Don't close the db as it might be used elsewhere
}

console.log('\n✅ Local database check complete');