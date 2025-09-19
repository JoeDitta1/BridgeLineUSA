// Test the duplication fix
const API_BASE = 'http://localhost:4000';

async function testQuoteCreation() {
    console.log('🧪 Testing quote creation duplication fix...');
    
    try {
        // Step 1: Create a basic quote (simulating saveQuoteAPI call)
        console.log('\n📝 Step 1: Creating basic quote...');
        const basicQuoteResponse = await fetch(`${API_BASE}/api/quotes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_name: 'TestCustomer',
                date: '2025-01-20',
                description: 'Test Quote',
                status: 'Draft'
            })
        });
        
        const basicQuote = await basicQuoteResponse.json();
        console.log('Basic quote created:', basicQuote);
        
        const quoteNo = basicQuote.quote?.quote_no || basicQuote.quote_no;
        if (!quoteNo) {
            console.error('❌ Failed to create basic quote');
            return;
        }
        
        // Step 2: Save complete meta data (simulating saveQuoteMetaAPI call)
        console.log('\n💾 Step 2: Saving complete form data...');
        const metaResponse = await fetch(`${API_BASE}/api/quotes/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quoteNo: quoteNo,  // Use the extracted quote number
                customerName: 'TestCustomer',
                date: '2025-01-20', 
                description: 'Test Quote Updated', // Slightly different description
                status: 'draft',
                appState: {
                    meta: { customerName: 'TestCustomer', date: '2025-01-20' },
                    rows: [{ description: 'Test Material', quantity: 1 }],
                    nde: []
                }
            })
        });
        
        const metaSave = await metaResponse.json();
        console.log('Meta save result:', metaSave);
        
        // Step 3: Check final quote count
        console.log('\n📊 Step 3: Checking final quote count...');
        const quotesResponse = await fetch(`${API_BASE}/api/quotes`);
        const quotesData = await quotesResponse.json();
        
        console.log(`Final quote count: ${quotesData.quotes?.length || 0}`);
        quotesData.quotes?.forEach((quote, index) => {
            console.log(`  ${index + 1}. ${quote.quote_no} - ${quote.customer_name} (${quote.description})`);
        });
        
        // Step 4: Test folder creation
        console.log('\n📁 Step 4: Testing folder creation...');
        const folderResponse = await fetch(`${API_BASE}/api/quotes/${encodeURIComponent(quoteNo)}/init-folders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_name: 'TestCustomer',
                description: 'Test Quote'
            })
        });
        
        const folderResult = await folderResponse.json();
        console.log('Folder creation result:', folderResult);
        
        console.log('\n✅ Test complete!');
        
        if (quotesData.quotes?.length === 1) {
            console.log('✅ SUCCESS: No duplicates created!');
        } else {
            console.log('❌ FAILURE: Duplicates still being created!');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testQuoteCreation();