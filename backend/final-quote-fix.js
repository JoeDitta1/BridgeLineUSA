// Final fix for quote numbering format
import Database from 'better-sqlite3';

const dbPath = './data/app.db';

console.log('🎯 FINAL QUOTE NUMBERING FIX');
console.log('='.repeat(40));

function finalQuoteNumberingFix() {
    try {
        const db = new Database(dbPath);
        
        console.log('\n🔧 Setting correct quote format for SCM-Q-0001...');
        
        // The logic is: [org_prefix, system_abbr, quote_series + padded].join('-')
        // For SCM-Q-0001, we want: ['SCM', 'Q', '0001'].join('-') = 'SCM-Q-0001'
        
        const updateResult = db.prepare(`
            UPDATE settings 
            SET org_prefix = 'SCM',
                system_abbr = 'Q',
                quote_series = '',
                quote_pad = 4,
                next_quote_seq = 1
            WHERE id = 1
        `).run();
        
        console.log(`✅ Updated ${updateResult.changes} settings record(s)`);
        
        // Verify the fix works
        console.log('\n🧪 Testing quote generation logic:');
        
        const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
        console.log('📊 Settings:', settings);
        
        // Simulate the exact logic from getNextQuoteNo()
        const s = settings;
        const seq = Number(s.next_quote_seq) || 1;
        const padded = String(seq).padStart(Number(s.quote_pad) || 4, '0');
        const parts = [s.org_prefix, s.system_abbr, `${s.quote_series}${padded}`].filter(Boolean);
        const quoteNo = parts.join('-');
        
        console.log(`📋 Logic breakdown:`);
        console.log(`  - seq: ${seq}`);
        console.log(`  - padded: ${padded}`);
        console.log(`  - quote_series + padded: "${s.quote_series}${padded}"`);
        console.log(`  - parts: [${parts.map(p => `"${p}"`).join(', ')}]`);
        console.log(`  - final: ${quoteNo}`);
        
        if (quoteNo === 'SCM-Q-0001') {
            console.log('\n🎉 PERFECT! Quote numbering fixed!');
            console.log('Next quote will be: SCM-Q-0001');
        } else {
            console.log(`\n❌ Still wrong format: ${quoteNo}`);
        }
        
        db.close();
        
    } catch (error) {
        console.error('❌ Final fix failed:', error);
    }
}

finalQuoteNumberingFix();