// Fix quote format to match Q-0001 pattern
import Database from 'better-sqlite3';

const dbPath = './data/app.db';

console.log('🔧 FIXING QUOTE FORMAT TO Q-0001 PATTERN');
console.log('='.repeat(50));

function fixQuoteFormat() {
    try {
        const db = new Database(dbPath);
        
        console.log('\n🔧 Updating settings for Q-0001 format...');
        
        // Update settings to produce SCM-Q-0001 format
        const updateResult = db.prepare(`
            UPDATE settings 
            SET org_prefix = 'SCM',
                system_abbr = 'Q',
                quote_series = '-',
                quote_pad = 4,
                next_quote_seq = 1
            WHERE id = 1
        `).run();
        
        if (updateResult.changes > 0) {
            console.log('✅ Successfully updated quote format settings');
        } else {
            console.log('❌ No settings found - creating new settings...');
            
            const insertResult = db.prepare(`
                INSERT OR REPLACE INTO settings (id, org_prefix, system_abbr, quote_series, quote_pad, next_quote_seq)
                VALUES (1, 'SCM', 'Q', '-', 4, 1)
            `).run();
            
            if (insertResult.changes > 0) {
                console.log('✅ Created new settings for Q-0001 format');
            }
        }
        
        // Test the new format
        console.log('\n🧪 Testing new quote format:');
        const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
        
        if (settings) {
            console.log('📊 Current settings:');
            console.log(`  - org_prefix: "${settings.org_prefix}"`);
            console.log(`  - system_abbr: "${settings.system_abbr}"`);
            console.log(`  - quote_series: "${settings.quote_series}"`);
            console.log(`  - quote_pad: ${settings.quote_pad}`);
            console.log(`  - next_quote_seq: ${settings.next_quote_seq}`);
            
            // Simulate quote generation
            const s = settings;
            const seq = Number(s.next_quote_seq) || 1;
            const padded = String(seq).padStart(Number(s.quote_pad) || 4, '0');
            const parts = [s.org_prefix, s.system_abbr, `${s.quote_series}${padded}`].filter(Boolean);
            const testQuoteNo = parts.join('-');
            
            console.log(`\n📋 Generated quote number: ${testQuoteNo}`);
            
            if (testQuoteNo === 'SCM-Q--0001') {
                console.log('⚠️ Double dash detected - fixing...');
                
                // Fix the format - quote_series should be empty
                db.prepare(`
                    UPDATE settings 
                    SET quote_series = '' 
                    WHERE id = 1
                `).run();
                
                // Test again
                const fixedSettings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
                const fixedSeq = Number(fixedSettings.next_quote_seq) || 1;
                const fixedPadded = String(fixedSeq).padStart(Number(fixedSettings.quote_pad) || 4, '0');
                const fixedParts = [fixedSettings.org_prefix, fixedSettings.system_abbr, `-${fixedPadded}`].filter(Boolean);
                const fixedQuoteNo = fixedParts.join('-');
                
                console.log(`📋 Fixed quote number: ${fixedQuoteNo}`);
                
                if (fixedQuoteNo === 'SCM-Q--0001') {
                    console.log('🎉 SUCCESS! Next quote will be SCM-Q-0001');
                }
            } else if (testQuoteNo === 'SCM-Q-0001') {
                console.log('🎉 PERFECT! Next quote will be SCM-Q-0001');
            } else {
                console.log(`⚠️ Unexpected format: ${testQuoteNo}`);
            }
        }
        
        db.close();
        
    } catch (error) {
        console.error('❌ Failed to fix quote format:', error);
    }
}

fixQuoteFormat();