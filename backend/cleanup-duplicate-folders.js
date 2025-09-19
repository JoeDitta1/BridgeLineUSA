// Clean up duplicate quote folders
import fs from 'fs/promises';
import path from 'path';
import { getQuotesRoot } from './src/lib/quoteFolders.js';

async function cleanupDuplicateFolders() {
    console.log('🧹 Cleaning up duplicate quote folders...');
    
    try {
        const quotesRoot = getQuotesRoot();
        console.log('Quotes root:', quotesRoot);
        
        // Get all customer directories
        const customerDirs = await fs.readdir(quotesRoot, { withFileTypes: true });
        
        for (const customerEntry of customerDirs) {
            if (!customerEntry.isDirectory()) continue;
            
            const customerName = customerEntry.name;
            const customerPath = path.join(quotesRoot, customerName);
            
            console.log(`\n📁 Processing customer: ${customerName}`);
            
            // Get all quote folders for this customer
            const quoteFolders = await fs.readdir(customerPath, { withFileTypes: true });
            const foldersByQuoteNo = new Map();
            
            // Group folders by quote number
            for (const folder of quoteFolders) {
                if (!folder.isDirectory()) continue;
                
                const folderName = folder.name;
                // Extract quote number (everything before first hyphen, or whole name if no hyphen)
                const quoteNo = folderName.split('-')[0];
                
                if (!foldersByQuoteNo.has(quoteNo)) {
                    foldersByQuoteNo.set(quoteNo, []);
                }
                foldersByQuoteNo.get(quoteNo).push({
                    name: folderName,
                    path: path.join(customerPath, folderName)
                });
            }
            
            // Process each quote number
            for (const [quoteNo, folders] of foldersByQuoteNo) {
                if (folders.length <= 1) {
                    console.log(`  ✅ ${quoteNo}: Only 1 folder (${folders[0].name})`);
                    continue;
                }
                
                console.log(`  🔧 ${quoteNo}: Found ${folders.length} folders, cleaning up...`);
                
                // Sort folders by name length (prefer shorter names = quote number only)
                folders.sort((a, b) => a.name.length - b.name.length);
                
                const keepFolder = folders[0]; // Keep the shortest name (likely just quote number)
                const duplicateFolders = folders.slice(1);
                
                console.log(`    ✅ Keeping: ${keepFolder.name}`);
                
                // Move files from duplicate folders to the main folder, then delete duplicates
                for (const dupFolder of duplicateFolders) {
                    console.log(`    🗑️  Removing duplicate: ${dupFolder.name}`);
                    
                    try {
                        // Check if there are any files in the duplicate folder
                        const subDirs = await fs.readdir(dupFolder.path);
                        let hasFiles = false;
                        
                        for (const subDir of subDirs) {
                            const subDirPath = path.join(dupFolder.path, subDir);
                            const stat = await fs.stat(subDirPath);
                            if (stat.isDirectory()) {
                                const files = await fs.readdir(subDirPath);
                                if (files.length > 0) {
                                    hasFiles = true;
                                    console.log(`      ⚠️  Found files in ${subDir}/`);
                                }
                            }
                        }
                        
                        if (hasFiles) {
                            console.log(`      ⚠️  Skipping deletion - contains files. Please manually review.`);
                        } else {
                            // Safe to delete - no files
                            await fs.rm(dupFolder.path, { recursive: true, force: true });
                            console.log(`      ✅ Deleted empty duplicate folder`);
                        }
                    } catch (error) {
                        console.log(`      ❌ Error processing ${dupFolder.name}:`, error.message);
                    }
                }
            }
        }
        
        console.log('\n✅ Cleanup complete!');
        
    } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
    }
}

cleanupDuplicateFolders();