// Deep inspection and aggressive cleanup of Supabase storage
import './src/loadEnv.js';
import { getSupabaseClient } from './src/utils/supabaseClient.js';

async function aggressiveStorageCleanup() {
  try {
    console.log('🔍 DEEP INSPECTION OF SUPABASE STORAGE...');
    
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('❌ No Supabase client available');
      return;
    }
    
    // STEP 1: Deep inspection - list everything recursively
    console.log('\n📁 STEP 1: Deep recursive listing...');
    
    const listRecursively = async (path = '', depth = 0) => {
      const indent = '  '.repeat(depth);
      console.log(`${indent}📂 Listing: ${path || 'ROOT'}`);
      
      const { data: items, error } = await supabase
        .storage
        .from('quote-files')
        .list(path, { limit: 1000 });
        
      if (error) {
        console.error(`${indent}❌ Error listing ${path}:`, error);
        return [];
      }
      
      const allPaths = [];
      
      for (const item of items || []) {
        const fullPath = path ? `${path}/${item.name}` : item.name;
        console.log(`${indent}- ${item.name} (${item.metadata?.size ? 'file' : 'folder'})`);
        
        allPaths.push(fullPath);
        
        // If it's a folder (no size metadata), recurse into it
        if (!item.metadata?.size && depth < 10) { // Prevent infinite recursion
          const subPaths = await listRecursively(fullPath, depth + 1);
          allPaths.push(...subPaths);
        }
      }
      
      return allPaths;
    };
    
    const allPaths = await listRecursively();
    console.log(`\n📊 Total paths found: ${allPaths.length}`);
    
    // STEP 2: Try different deletion strategies
    console.log('\n🗑️  STEP 2: Attempting aggressive deletion...');
    
    // Strategy 1: Delete all files first (from deepest to shallowest)
    console.log('\n📄 Strategy 1: Deleting all files...');
    const sortedPaths = allPaths.sort((a, b) => b.split('/').length - a.split('/').length);
    
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const path of sortedPaths) {
      try {
        const { error } = await supabase
          .storage
          .from('quote-files')
          .remove([path]);
          
        if (error) {
          console.log(`❌ Failed to delete ${path}: ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ Deleted: ${path}`);
          deletedCount++;
        }
      } catch (err) {
        console.log(`❌ Exception deleting ${path}: ${err.message}`);
        errorCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n📊 Deletion results: ${deletedCount} deleted, ${errorCount} errors`);
    
    // STEP 3: Nuclear option - try to delete everything at once
    console.log('\n💥 STEP 3: Nuclear option - bulk delete...');
    
    if (allPaths.length > 0) {
      try {
        const { error: bulkError } = await supabase
          .storage
          .from('quote-files')
          .remove(allPaths);
          
        if (bulkError) {
          console.error('❌ Bulk delete failed:', bulkError);
        } else {
          console.log('✅ Bulk delete successful');
        }
      } catch (bulkErr) {
        console.error('❌ Bulk delete exception:', bulkErr.message);
      }
    }
    
    // STEP 4: Final verification
    console.log('\n🔍 STEP 4: Final verification...');
    const { data: finalCheck, error: finalError } = await supabase
      .storage
      .from('quote-files')
      .list('', { limit: 1000 });
      
    if (finalError) {
      console.error('❌ Final check failed:', finalError);
    } else {
      console.log(`📊 Items remaining: ${finalCheck?.length || 0}`);
      if (finalCheck && finalCheck.length > 0) {
        console.log('Remaining items:');
        finalCheck.forEach(item => 
          console.log(`  - ${item.name} (${item.metadata?.size ? 'file' : 'folder'})`)
        );
      } else {
        console.log('✅ Bucket is completely empty!');
      }
    }
    
    // STEP 5: Alternative approach - check if we can empty the entire bucket
    console.log('\n🔄 STEP 5: Alternative - checking bucket operations...');
    
    try {
      // List with different options
      const { data: altList, error: altError } = await supabase
        .storage
        .from('quote-files')
        .list('', { 
          limit: 1000,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });
        
      if (altError) {
        console.error('❌ Alternative listing failed:', altError);
      } else {
        console.log(`📊 Alternative listing found: ${altList?.length || 0} items`);
        
        if (altList && altList.length > 0) {
          console.log('\n⚠️  STORAGE CLEANUP MAY BE INCOMPLETE');
          console.log('You may need to manually delete items in the Supabase dashboard:');
          console.log('1. Go to your Supabase project dashboard');
          console.log('2. Navigate to Storage > quote-files');
          console.log('3. Manually delete all folders and files');
          console.log('4. Or delete and recreate the entire bucket');
        }
      }
    } catch (altErr) {
      console.error('❌ Alternative check failed:', altErr.message);
    }
    
  } catch (err) {
    console.error('❌ Aggressive cleanup error:', err);
  }
}

aggressiveStorageCleanup().then(() => process.exit(0));