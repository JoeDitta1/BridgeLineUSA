// Direct test of customers route logic
import './src/loadEnv.js';
import { getSupabaseClient } from './src/utils/supabaseClient.js';

async function testCustomersLogic() {
  try {
    console.log('🔄 Testing customer logic directly...');
    
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('❌ No Supabase client available');
      return;
    }
    
    console.log('✅ Supabase client available, testing queries...');
    
    // Test 1: Get all quotes (no filter)
    console.log('\n--- Test 1: All quotes ---');
    const { data: allQuotes, error: allError } = await supabase
      .from('quotes')
      .select('customer_name, quote_no, deleted_at, created_at, updated_at')
      .limit(5);
      
    if (allError) {
      console.error('❌ All quotes error:', allError);
    } else {
      console.log(`✅ Found ${allQuotes?.length || 0} total quotes (sample)`);
      allQuotes?.forEach(q => console.log(`  - ${q.customer_name}: ${q.quote_no} (deleted: ${q.deleted_at})`));
    }
    
    // Test 2: Non-deleted quotes only (our current filter)
    console.log('\n--- Test 2: Non-deleted quotes ---');
    const { data: activeQuotes, error: activeError } = await supabase
      .from('quotes')
      .select('customer_name, quote_no, deleted_at, created_at, updated_at')
      .is('deleted_at', null);
      
    if (activeError) {
      console.error('❌ Active quotes error:', activeError);
    } else {
      console.log(`✅ Found ${activeQuotes?.length || 0} active quotes`);
      
      // Group by customer like our endpoint does
      const customerMap = new Map();
      
      for (const quote of activeQuotes || []) {
        const customerName = quote.customer_name;
        if (!customerName) continue;
        
        if (!customerMap.has(customerName)) {
          customerMap.set(customerName, {
            name: customerName,
            slug: customerName,
            quoteCount: 0,
            lastUpdated: 0
          });
        }
        
        const customer = customerMap.get(customerName);
        customer.quoteCount++;
        
        const updateTime = new Date(quote.updated_at || quote.created_at).getTime();
        if (updateTime > customer.lastUpdated) {
          customer.lastUpdated = updateTime;
        }
      }
      
      const customers = Array.from(customerMap.values())
        .sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
        
      console.log(`📊 Processed into ${customers.length} customers:`);
      customers.forEach(c => console.log(`  - ${c.name} (${c.quoteCount} quotes)`));
    }
    
    // Test 3: Table structure
    console.log('\n--- Test 3: Table structure ---');
    const { data: tableInfo, error: tableError } = await supabase
      .from('quotes')
      .select('*')
      .limit(1);
      
    if (tableInfo && tableInfo.length > 0) {
      console.log('✅ Table columns:', Object.keys(tableInfo[0]));
    }
    
  } catch (err) {
    console.error('❌ Test error:', err);
  }
}

testCustomersLogic().then(() => process.exit(0));