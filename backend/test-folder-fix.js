// Test the folder duplication fix
const API_BASE = 'http://localhost:4000';

async function testFolderFix() {
    console.log('🧪 Testing folder duplication fix...');
    
    try {
        // Step 1: Create quote with empty description
        console.log('\n📝 Step 1: Creating quote with empty description...');
        const response1 = await fetch(`${API_BASE}/api/quotes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_name: 'TestFolderFix',
                date: '2025-01-20',
                description: '', // Empty description
                status: 'Draft'
            })
        });
        
        const result1 = await response1.json();
        const quoteNo = result1.quote?.quote_no;
        console.log('✅ Quote created:', quoteNo);
        
        // Step 2: Update with description "QUOTE"
        console.log('\n💾 Step 2: Updating quote with description "QUOTE"...');
        const response2 = await fetch(`${API_BASE}/api/quotes/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quoteNo: quoteNo,
                customerName: 'TestFolderFix',
                date: '2025-01-20',
                description: 'QUOTE', // Add description
                status: 'draft',
                appState: {
                    meta: { customerName: 'TestFolderFix', quoteNo: quoteNo },
                    rows: [],
                    nde: []
                }
            })
        });
        
        const result2 = await response2.json();
        console.log('✅ Quote updated:', result2.quoteNo);
        
        // Step 3: Create folders again
        console.log('\n📁 Step 3: Creating folders again...');
        const response3 = await fetch(`${API_BASE}/api/quotes/${encodeURIComponent(quoteNo)}/init-folders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_name: 'TestFolderFix',
                description: 'QUOTE'
            })
        });
        
        const result3 = await response3.json();
        console.log('✅ Folders created:', result3.ok);
        
        // Step 4: Check customer quotes endpoint
        console.log('\n📊 Step 4: Checking customer quotes...');
        const response4 = await fetch(`${API_BASE}/api/quotes/customers/TestFolderFix`);
        const result4 = await response4.json();
        
        console.log(`Found ${result4.quotes?.length || 0} quote folders:`);
        result4.quotes?.forEach((quote, index) => {
            console.log(`  ${index + 1}. ${quote.dirName} (quoteNo: ${quote.quoteNo}, desc: "${quote.description}")`);
        });
        
        if (result4.quotes?.length === 1) {
            console.log('\n✅ SUCCESS: No duplicate folders created!');
        } else {
            console.log('\n❌ FAILURE: Still creating duplicate folders');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testFolderFix();