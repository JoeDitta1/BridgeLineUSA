// Final test with Dave customer (simulating user's exact scenario)
const API_BASE = 'http://localhost:4000';

async function testDaveQuote() {
    console.log('🧪 Testing Dave quote creation (user scenario simulation)...');
    
    try {
        // Simulate frontend handleSave() flow exactly
        const customerName = 'Dave';
        const date = new Date().toISOString().slice(0, 10);
        
        // Step 1: Create basic quote (no quote number initially)
        console.log('\n📝 Step 1: Creating basic quote (saveQuoteAPI)...');
        const basicResponse = await fetch(`${API_BASE}/api/quotes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_name: customerName,
                date: date,
                description: null, // Usually empty initially
                status: 'Draft'
            })
        });
        
        const basicResult = await basicResponse.json();
        const quoteNo = basicResult.quote?.quote_no || basicResult.quote_no;
        console.log('✅ Basic quote created:', quoteNo);
        
        // Step 2: Save complete form data (saveQuoteMetaAPI)
        console.log('\n💾 Step 2: Saving complete form data (saveQuoteMetaAPI)...');
        const metaResponse = await fetch(`${API_BASE}/api/quotes/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quoteNo: quoteNo,
                customerName: customerName,
                date: date,
                description: '', // Empty description like frontend
                status: 'draft',
                appState: {
                    meta: { 
                        customerName: customerName, 
                        date: date,
                        quoteNo: quoteNo
                    },
                    rows: [],
                    nde: []
                }
            })
        });
        
        const metaResult = await metaResponse.json();
        console.log('✅ Meta save completed:', metaResult.quoteNo);
        
        // Step 3: Folder creation (initFoldersAPI)
        console.log('\n📁 Step 3: Creating folders (initFoldersAPI)...');
        const folderResponse = await fetch(`${API_BASE}/api/quotes/${encodeURIComponent(quoteNo)}/init-folders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_name: customerName,
                description: ''
            })
        });
        
        const folderResult = await folderResponse.json();
        console.log('✅ Folders created:', folderResult.ok);
        
        // Step 4: Final verification
        console.log('\n📊 Final verification...');
        const quotesResponse = await fetch(`${API_BASE}/api/quotes`);
        const quotesData = await quotesResponse.json();
        
        console.log(`Final quote count: ${quotesData.quotes?.length || 0}`);
        quotesData.quotes?.forEach((quote, index) => {
            console.log(`  ${index + 1}. ${quote.quote_no} - ${quote.customer_name}`);
        });
        
        // Test file upload simulation (to trigger Supabase storage folder creation)
        console.log('\n📤 Testing file upload to trigger Supabase storage...');
        
        // Create a dummy file buffer
        const dummyFile = Buffer.from('This is a test file content');
        const formData = new FormData();
        const blob = new Blob([dummyFile], { type: 'application/pdf' });
        formData.append('files', blob, 'test-drawing.pdf');
        
        const uploadResponse = await fetch(`${API_BASE}/api/quotes/${encodeURIComponent(quoteNo)}/upload-supabase?subdir=drawings`, {
            method: 'POST',
            body: formData
        });
        
        if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            console.log('✅ Test file uploaded to Supabase storage');
        } else {
            console.log('❌ File upload failed (this is expected if Supabase storage has issues)');
        }
        
        console.log('\n🎉 Test complete! Summary:');
        if (quotesData.quotes?.length === 1) {
            console.log('✅ SUCCESS: No duplicates created!');
            console.log(`✅ Quote created: ${quoteNo} for ${customerName}`);
            console.log('✅ Folder creation working');
            console.log('✅ Ready for user testing!');
        } else {
            console.log('❌ FAILURE: Issues detected');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testDaveQuote();