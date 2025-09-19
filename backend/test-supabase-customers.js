// Quick test of Supabase customers query
import './src/loadEnv.js';
import { getSupabaseClient } from './src/utils/supabaseClient.js';

async function testSupabaseCustomers() {
  try {
    console.log('🔄 Testing Supabase customer query...');
    
    const supabase = getSupabaseClient();
    
    // Test the same query we use in customersRoute.js
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select('customer_name')
      .not('customer_name', 'is', null);
    
    if (error) {
      console.error('❌ Supabase query error:', error);
    } else {
      console.log('✅ Supabase quotes data:', quotes?.length || 0, 'rows');
      console.log('Raw data:', quotes);
      
      // Group by customer_name like our endpoint does
      const customers = {};
      quotes?.forEach(quote => {
        if (quote.customer_name) {
          customers[quote.customer_name] = customers[quote.customer_name] || {
            name: quote.customer_name,
            quoteCount: 0,
            lastUpdated: Date.now()
          };
          customers[quote.customer_name].quoteCount++;
        }
      });
      
      const customerList = Object.values(customers);
      console.log('✅ Processed customers:', customerList);
    }
  } catch (err) {
    console.error('❌ Test error:', err);
  }
}

testSupabaseCustomers().then(() => process.exit(0));