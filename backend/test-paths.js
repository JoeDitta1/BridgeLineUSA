// Test path resolution
import { getQuotesRoot, ensureQuoteFolders } from './src/lib/quoteFolders.js';
import fs from 'fs';

console.log('Path resolution test:');
const root = getQuotesRoot();
console.log('Root path:', root);
console.log('Root exists:', fs.existsSync(root));

// Test actual folder creation
console.log('\nTesting folder creation...');
try {
    const result = await ensureQuoteFolders({
        customerName: 'Dave',
        quoteNo: 'SCM-Q0001',
        description: 'test'
    });
    
    console.log('Creation result:', result);
    console.log('Customer dir exists:', fs.existsSync(result.customerDir));
    console.log('Quote dir exists:', fs.existsSync(result.quoteDir));
    
    // List what was actually created
    if (fs.existsSync(result.customerDir)) {
        console.log('Customer dir contents:', fs.readdirSync(result.customerDir));
    }
} catch (error) {
    console.error('Folder creation failed:', error);
}