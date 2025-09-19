// Test the current Supabase table structure and our customer logic
import './src/loadEnv.js';
import { getSupabaseClient } from './src/utils/supabaseClient.js';

async function testSupabaseStructure() {
  try {
    console.log('🔄 Testing Supabase table structure and queries...');
    
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('❌ No Supabase client available');
      return;
    }
    
    // Test 1: Check if quotes table exists and get sample data
    console.log('\n--- Test 1: Quotes table ---');
    try {
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .limit(3);
        
      if (quotesError) {
        console.error('❌ Quotes table error:', quotesError.message);
      } else {
        console.log(`✅ Found ${quotes?.length || 0} quotes`);
        if (quotes && quotes.length > 0) {
          console.log('Sample quote columns:', Object.keys(quotes[0]));
          console.log('Sample data:', quotes.map(q => ({ customer: q.customer_name, quote_no: q.quote_no })));
        }
      }
    } catch (err) {
      console.error('❌ Quotes table access failed:', err.message);
    }
    
    // Test 2: Check quote_files table
    console.log('\n--- Test 2: Quote_files table ---');
    try {
      const { data: files, error: filesError } = await supabase
        .from('quote_files')
        .select('*')
        .limit(3);
        
      if (filesError) {
        console.error('❌ Quote_files table error:', filesError.message);
      } else {
        console.log(`✅ Found ${files?.length || 0} quote files`);
        if (files && files.length > 0) {
          console.log('Sample file columns:', Object.keys(files[0]));
        }
      }
    } catch (err) {
      console.error('❌ Quote_files table access failed:', err.message);
    }
    
    // Test 3: Our customer logic with quotes table
    console.log('\n--- Test 3: Customer logic ---');
    try {
      const { data: supabaseQuotes, error } = await supabase
        .from('quotes')
        .select('customer_name, quote_no, date, updated_at, created_at');
        
      if (!error && supabaseQuotes) {
        console.log(`✅ Retrieved ${supabaseQuotes.length} quotes for customer processing`);
        
        // Group by customer
        const customerMap = new Map();
        
        for (const quote of supabaseQuotes) {
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
        
        // This should match what we see in the bucket screenshot
        console.log('\n🎯 This should now match the customer folders in your Supabase bucket!');
        
      } else {
        console.error('❌ Customer query failed:', error?.message);
      }
    } catch (err) {
      console.error('❌ Customer logic test failed:', err.message);
    }
    
  } catch (err) {
    console.error('❌ Test error:', err);
  }
}

testSupabaseStructure().then(() => process.exit(0));