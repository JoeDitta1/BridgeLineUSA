const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/quotes/customers',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer demo_token'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Status:', res.statusCode);
      console.log('Total customers:', response.customers?.length || 0);
      
      console.log('\nAll customers:');
      response.customers?.forEach(c => {
        console.log(`- ${c.name}: ${c.quoteCount} quotes`);
      });
      
      const atlas = response.customers?.find(c => c.name === 'Atlas Copco');
      console.log('\nAtlas Copco from customer listing:', atlas);
      
      if (atlas) {
        console.log(`\nCustomer listing shows: ${atlas.quoteCount} quote(s)`);
        console.log('Expected: 1 quote (only active ones)');
        console.log('Issue:', atlas.quoteCount === 2 ? 'COUNTING DELETED QUOTES' : 'Fixed!');
      } else {
        console.log('\nAtlas Copco not found in customer listing');
      }
    } catch(e) {
      console.log('Parse error:', e.message);
      console.log('Raw response (first 500 chars):', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error('API Error:', e.message);
});

req.end();