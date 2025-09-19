// Fix quote format to remove the dash
import Database from 'better-sqlite3';

const dbPath = './data/app.db';

console.log('🔧 FIXING QUOTE FORMAT TO REMOVE DASH');
console.log('='.repeat(50));

function fixQuoteFormatNoDash() {
    try {
        const db = new Database(dbPath);
        
        console.log('\n📊 Current settings:');
        let settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
        console.log('Current settings:', settings);
        
        // The issue is the format logic creates: [org_prefix, system_abbr, quote_series+padded].join('-')
        // For SCM-Q0001, we need: ['SCM', 'Q0001'].join('-') = 'SCM-Q0001'
        // So we need system_abbr to include the Q and the number
        
        console.log('\n🔧 Method 1: Try setting system_abbr to empty and put Q in quote_series...');
        db.prepare(`
            UPDATE settings 
            SET org_prefix = 'SCM',
                system_abbr = '',
                quote_series = 'Q',
                quote_pad = 4,
                next_quote_seq = 1
            WHERE id = 1
        `).run();
        
        settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
        console.log('Updated settings:', settings);
        
        // Test the format
        const s = settings;
        const seq = Number(s.next_quote_seq) || 1;
        const padded = String(seq).padStart(Number(s.quote_pad) || 4, '0');
        const parts = [s.org_prefix, s.system_abbr, `${s.quote_series}${padded}`].filter(Boolean);
        const testQuoteNo = parts.join('-');
        
        console.log(`📋 Method 1 result: ${testQuoteNo}`);
        
        if (testQuoteNo !== 'SCM-Q0001') {
            console.log('\n🔧 Method 2: Combine everything in org_prefix...');
            
            // Let's see what happens if we put everything in org_prefix
            db.prepare(`
                UPDATE settings 
                SET org_prefix = 'SCM-Q',
                    system_abbr = '',
                    quote_series = '',
                    quote_pad = 4,
                    next_quote_seq = 1
                WHERE id = 1
            `).run();
            
            const settings2 = db.prepare('SELECT * FROM settings WHERE id = 1').get();
            const s2 = settings2;
            const seq2 = Number(s2.next_quote_seq) || 1;
            const padded2 = String(seq2).padStart(Number(s2.quote_pad) || 4, '0');
            const parts2 = [s2.org_prefix, s2.system_abbr, `${s2.quote_series}${padded2}`].filter(Boolean);
            const testQuoteNo2 = parts2.join('-');
            
            console.log(`📋 Method 2 result: ${testQuoteNo2}`);
            
            if (testQuoteNo2 !== 'SCM-Q0001') {
                console.log('\n🔧 Method 3: Check the actual getNextQuoteNo function logic...');
                
                // Let me trace through the exact logic:
                console.log('Debug trace:');
                console.log(`  - org_prefix: "${s2.org_prefix}"`);
                console.log(`  - system_abbr: "${s2.system_abbr}"`);
                console.log(`  - quote_series: "${s2.quote_series}"`);
                console.log(`  - padded: "${padded2}"`);
                console.log(`  - quote_series + padded: "${s2.quote_series}${padded2}"`);
                console.log(`  - parts before filter: [${[s2.org_prefix, s2.system_abbr, `${s2.quote_series}${padded2}`].map(p => `"${p}"`).join(', ')}]`);
                console.log(`  - parts after filter: [${parts2.map(p => `"${p}"`).join(', ')}]`);
                console.log(`  - joined: "${testQuoteNo2}"`);
                
                // The issue might be the join('-') logic
                // Let's try without system_abbr but put the format directly
                db.prepare(`
                    UPDATE settings 
                    SET org_prefix = 'SCM',
                        system_abbr = '',  
                        quote_series = 'Q',
                        quote_pad = 4,
                        next_quote_seq = 1
                    WHERE id = 1
                `).run();
                
                const settings3 = db.prepare('SELECT * FROM settings WHERE id = 1').get();
                const s3 = settings3;
                const seq3 = Number(s3.next_quote_seq) || 1;
                const padded3 = String(seq3).padStart(Number(s3.quote_pad) || 4, '0');
                
                // Manual construction to get SCM-Q0001
                const manualQuoteNo = `${s3.org_prefix}-${s3.quote_series}${padded3}`;
                console.log(`📋 Manual construction: ${manualQuoteNo}`);
                
                if (manualQuoteNo === 'SCM-Q0001') {
                    console.log('✅ Found the right combination!');
                }
            }
        }
        
        db.close();
        
    } catch (error) {
        console.error('❌ Quote format fix failed:', error);
    }
}

fixQuoteFormatNoDash();