// Clean up Supabase storage bucket - delete all quote folders and files
import './src/loadEnv.js';
import { getSupabaseClient } from './src/utils/supabaseClient.js';

async function cleanupStorageBucket() {
  try {
    console.log('🧹 CLEANING UP SUPABASE STORAGE BUCKET...');
    
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('❌ No Supabase client available');
      return;
    }
    
    // STEP 1: List all contents in the quote-files bucket
    console.log('\n📁 STEP 1: Listing bucket contents...');
    const { data: topLevelItems, error: listError } = await supabase
      .storage
      .from('quote-files')
      .list('', { limit: 1000 });
      
    if (listError) {
      console.error('❌ Failed to list bucket contents:', listError);
      return;
    }
    
    console.log(`📊 Found ${topLevelItems?.length || 0} top-level items:`);
    topLevelItems?.forEach(item => 
      console.log(`   - ${item.name} (${item.metadata ? 'folder' : 'file'})`)
    );
    
    // STEP 2: Handle the 'quotes' folder specifically
    if (topLevelItems?.some(item => item.name === 'quotes')) {
      console.log('\n🗂️  STEP 2: Cleaning quotes folder...');
      
      // List all customer folders inside quotes
      const { data: customerFolders, error: customerError } = await supabase
        .storage
        .from('quote-files')
        .list('quotes', { limit: 1000 });
        
      if (customerError) {
        console.error('❌ Failed to list customer folders:', customerError);
      } else {
        console.log(`📊 Found ${customerFolders?.length || 0} customer folders:`);
        customerFolders?.forEach(folder => 
          console.log(`   - ${folder.name}`)
        );
        
        // Delete each customer folder and its contents
        for (const customerFolder of customerFolders || []) {
          if (customerFolder.name === '.emptyFolderPlaceholder') continue;
          
          console.log(`\n🗑️  Deleting customer folder: ${customerFolder.name}`);
          
          try {
            // List all files in this customer folder recursively
            const { data: allFiles, error: filesError } = await supabase
              .storage
              .from('quote-files')
              .list(`quotes/${customerFolder.name}`, { 
                limit: 1000,
                sortBy: { column: 'name', order: 'asc' }
              });
              
            if (filesError) {
              console.error(`❌ Failed to list files in ${customerFolder.name}:`, filesError);
              continue;
            }
            
            // Collect all file paths to delete
            const filesToDelete = [];
            
            // Function to recursively collect files
            const collectFiles = async (path) => {
              const { data: items, error } = await supabase
                .storage
                .from('quote-files')
                .list(path, { limit: 1000 });
                
              if (error) {
                console.warn(`⚠️  Could not list ${path}:`, error.message);
                return;
              }
              
              for (const item of items || []) {
                const fullPath = `${path}/${item.name}`;
                
                if (item.metadata && item.metadata.size === undefined) {
                  // This is likely a folder, recurse into it
                  await collectFiles(fullPath);
                } else {
                  // This is a file
                  filesToDelete.push(fullPath);
                }
              }
            };
            
            await collectFiles(`quotes/${customerFolder.name}`);
            
            if (filesToDelete.length > 0) {
              console.log(`   📄 Found ${filesToDelete.length} files to delete`);
              
              // Delete files in batches
              const batchSize = 50;
              for (let i = 0; i < filesToDelete.length; i += batchSize) {
                const batch = filesToDelete.slice(i, i + batchSize);
                const { error: deleteError } = await supabase
                  .storage
                  .from('quote-files')
                  .remove(batch);
                  
                if (deleteError) {
                  console.error(`❌ Failed to delete batch ${i}-${i + batchSize}:`, deleteError);
                } else {
                  console.log(`   ✅ Deleted files ${i + 1}-${Math.min(i + batchSize, filesToDelete.length)}`);
                }
              }
            } else {
              console.log(`   📭 No files found in ${customerFolder.name}`);
            }
            
          } catch (err) {
            console.error(`❌ Error processing ${customerFolder.name}:`, err.message);
          }
        }
      }
    }
    
    // STEP 3: Delete any remaining top-level items
    console.log('\n🗑️  STEP 3: Cleaning up remaining items...');
    const itemsToDelete = topLevelItems
      ?.filter(item => item.name !== '.emptyFolderPlaceholder')
      ?.map(item => item.name) || [];
      
    if (itemsToDelete.length > 0) {
      const { error: finalDeleteError } = await supabase
        .storage
        .from('quote-files')
        .remove(itemsToDelete);
        
      if (finalDeleteError) {
        console.error('❌ Failed to delete remaining items:', finalDeleteError);
      } else {
        console.log(`✅ Deleted ${itemsToDelete.length} remaining items`);
      }
    }
    
    // STEP 4: Verify cleanup
    console.log('\n🔍 STEP 4: Verifying cleanup...');
    const { data: finalCheck, error: finalError } = await supabase
      .storage
      .from('quote-files')
      .list('', { limit: 100 });
      
    if (finalError) {
      console.warn('⚠️  Could not verify cleanup:', finalError);
    } else {
      const remainingItems = finalCheck?.filter(item => item.name !== '.emptyFolderPlaceholder') || [];
      if (remainingItems.length === 0) {
        console.log('✅ Storage bucket is now clean!');
      } else {
        console.log(`⚠️  ${remainingItems.length} items still remain:`);
        remainingItems.forEach(item => console.log(`   - ${item.name}`));
      }
    }
    
    console.log('\n🎉 STORAGE CLEANUP COMPLETE!');
    console.log('✅ Quote-files bucket is now clean');
    console.log('🚀 Ready for fresh testing with clean storage');
    
  } catch (err) {
    console.error('❌ Storage cleanup error:', err);
  }
}

cleanupStorageBucket().then(() => process.exit(0));