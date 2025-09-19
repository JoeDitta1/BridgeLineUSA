// Verify the final quote format is correct
import Database from 'better-sqlite3';

const dbPath = './data/app.db';

console.log('✅ VERIFYING FINAL QUOTE FORMAT');
console.log('='.repeat(40));

function verifyQuoteFormat() {
    try {
        const db = new Database(dbPath);
        
        // Get current settings
        const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
        console.log('\n📊 Current settings:');
        console.log(`  - org_prefix: "${settings.org_prefix}"`);
        console.log(`  - system_abbr: "${settings.system_abbr}"`);
        console.log(`  - quote_series: "${settings.quote_series}"`);
        console.log(`  - quote_pad: ${settings.quote_pad}`);
        console.log(`  - next_quote_seq: ${settings.next_quote_seq}`);
        
        // Simulate the exact getNextQuoteNo logic
        const s = settings;
        const seq = Number(s.next_quote_seq) || 1;
        const padded = String(seq).padStart(Number(s.quote_pad) || 4, '0');
        const parts = [s.org_prefix, s.system_abbr, `${s.quote_series}${padded}`].filter(Boolean);
        const quoteNo = parts.join('-');
        
        console.log('\n🧪 Quote generation simulation:');
        console.log(`  - Next sequence: ${seq}`);
        console.log(`  - Padded: ${padded}`);
        console.log(`  - Parts: [${parts.map(p => `"${p}"`).join(', ')}]`);
        console.log(`  - Final quote: ${quoteNo}`);
        
        if (quoteNo === 'SCM-Q0001') {
            console.log('\n🎉 QUOTE FORMAT PERFECT!');
            console.log('✅ Next quote will be: SCM-Q0001');
            console.log('✅ System ready for testing');
        } else {
            console.log(`\n❌ Quote format still wrong: ${quoteNo}`);
        }
        
        db.close();
        
    } catch (error) {
        console.error('❌ Verification failed:', error);
    }
}

verifyQuoteFormat();