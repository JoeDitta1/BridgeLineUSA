// Test the customers API endpoint
import fetch from 'node-fetch';

async function testCustomersAPI() {
  try {
    console.log('🔄 Testing customers API endpoint...');
    
    const response = await fetch('http://localhost:4000/api/quotes/customers');
    
    if (!response.ok) {
      console.error('❌ API Response not OK:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
    
    if (data.ok && data.customers) {
      console.log(`📊 Found ${data.customers.length} customers`);
      data.customers.forEach(customer => {
        console.log(`  - ${customer.name} (${customer.quoteCount} quotes)`);
      });
    }
    
  } catch (err) {
    console.error('❌ Test error:', err.message);
  }
}

testCustomersAPI().then(() => process.exit(0));