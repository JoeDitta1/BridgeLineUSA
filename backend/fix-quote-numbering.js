// Fix quote numbering to start from 1
import Database from 'better-sqlite3';

const dbPath = './data/app.db';

console.log('🔧 FIXING QUOTE NUMBERING SYSTEM');
console.log('='.repeat(50));

function fixQuoteNumbering() {
    try {
        const db = new Database(dbPath);
        
        // Check current settings
        console.log('\n📊 Current settings:');
        const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
        
        if (settings) {
            console.log(`  - org_prefix: ${settings.org_prefix}`);
            console.log(`  - system_abbr: ${settings.system_abbr}`);
            console.log(`  - quote_series: ${settings.quote_series}`);
            console.log(`  - quote_pad: ${settings.quote_pad}`);
            console.log(`  - next_quote_seq: ${settings.next_quote_seq} ⚠️`);
        } else {
            console.log('  ❌ No settings found!');
        }
        
        // Reset next_quote_seq to 1
        console.log('\n🔧 Resetting quote sequence to 1...');
        const updateResult = db.prepare('UPDATE settings SET next_quote_seq = 1 WHERE id = 1').run();
        
        if (updateResult.changes > 0) {
            console.log('✅ Successfully reset quote sequence to 1');
        } else {
            console.log('❌ Failed to update settings - creating default settings...');
            
            // Create default settings if none exist
            const insertResult = db.prepare(`
                INSERT OR REPLACE INTO settings (id, org_prefix, system_abbr, quote_series, quote_pad, next_quote_seq)
                VALUES (1, 'SCM', 'Q', '', 4, 1)
            `).run();
            
            if (insertResult.changes > 0) {
                console.log('✅ Created default settings with sequence = 1');
            }
        }
        
        // Verify the fix
        console.log('\n✅ Verification:');
        const newSettings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
        
        if (newSettings) {
            console.log(`  - next_quote_seq: ${newSettings.next_quote_seq}`);
            
            // Test the quote numbering function
            console.log('\n🧪 Testing quote number generation:');
            const s = newSettings;
            const seq = Number(s.next_quote_seq) || 1;
            const padded = String(seq).padStart(Number(s.quote_pad) || 4, '0');
            const parts = [s.org_prefix, s.system_abbr, `${s.quote_series}${padded}`].filter(Boolean);
            const testQuoteNo = parts.join('-');
            
            console.log(`  - Next quote will be: ${testQuoteNo}`);
            
            if (testQuoteNo === 'SCM-Q-0001') {
                console.log('🎉 PERFECT! Next quote will be SCM-Q-0001');
            } else {
                console.log(`⚠️ Unexpected format: ${testQuoteNo}`);
            }
        }
        
        db.close();
        
    } catch (error) {
        console.error('❌ Failed to fix quote numbering:', error);
    }
}

fixQuoteNumbering();