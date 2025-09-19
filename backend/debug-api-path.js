// Debug the exact path the API is using
import { getQuotesRoot } from './src/lib/quoteFolders.js';
import fs from 'fs/promises';
import path from 'path';

async function debugApiPath() {
    console.log('🔍 Debugging API path resolution...');
    
    try {
        const quotesRoot = getQuotesRoot();
        console.log('Quotes root from getQuotesRoot():', quotesRoot);
        
        const customerName = 'Global Geo';
        const customerDir = path.join(quotesRoot, customerName);
        console.log('Customer directory path:', customerDir);
        
        // Check if directory exists
        try {
            await fs.access(customerDir);
            console.log('✅ Customer directory exists');
        } catch {
            console.log('❌ Customer directory does not exist');
            return;
        }
        
        // List directory contents
        const entries = await fs.readdir(customerDir, { withFileTypes: true });
        console.log('Directory entries:', entries.length);
        
        entries.forEach((entry, index) => {
            console.log(`  ${index + 1}. ${entry.name} (${entry.isDirectory() ? 'DIR' : 'FILE'})`);
        });
        
        // Parse each directory name
        entries.forEach(entry => {
            if (entry.isDirectory()) {
                const dirName = entry.name;
                console.log(`\nParsing: "${dirName}"`);
                
                // Apply the same parsing logic as the API
                const s = String(dirName || '').trim();
                let m = s.match(/^(SCM-(?:Q)?\d{3,})(?:-(.*))?$/i);
                if (m) {
                    const quoteNo = m[1];
                    const description = (m[2] || '').trim();
                    console.log(`  ✅ Quote: ${quoteNo}, Description: "${description}"`);
                } else {
                    console.log(`  ❌ No match for pattern`);
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugApiPath();