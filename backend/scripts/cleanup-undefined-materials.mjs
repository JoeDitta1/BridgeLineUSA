#!/usr/bin/env node
/**
 * Remove materials with "undefined" in their descriptions from Supabase
 */

import { getSupabaseAdminClient } from '../src/utils/supabaseClient.js';

async function cleanupUndefinedMaterials() {
  console.log('🧹 Cleaning up materials with "undefined" in descriptions...');
  
  try {
    // Get Supabase admin client
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      console.error('❌ Could not get Supabase admin client');
      return;
    }
    
    // Find materials with "undefined" in size or description
    const { data: problematicMaterials, error: fetchError } = await supabase
      .from('materials')
      .select('id, type, size, description')
      .or('size.ilike.%undefined%, description.ilike.%undefined%');
      
    if (fetchError) {
      console.error('❌ Error fetching problematic materials:', fetchError);
      return;
    }
    
    console.log(`📊 Found ${problematicMaterials?.length || 0} materials with "undefined"`);
    
    if (!problematicMaterials || problematicMaterials.length === 0) {
      console.log('✅ No problematic materials found');
      return;
    }
    
    // Show what will be deleted
    console.log('\n🗑️  Materials to be deleted:');
    problematicMaterials.forEach(m => {
      console.log(`   - ID: ${m.id}, Type: ${m.type}, Size: "${m.size}", Desc: "${m.description}"`);
    });
    
    // Delete problematic materials
    const ids = problematicMaterials.map(m => m.id);
    const { error: deleteError } = await supabase
      .from('materials')
      .delete()
      .in('id', ids);
      
    if (deleteError) {
      console.error('❌ Error deleting materials:', deleteError);
      return;
    }
    
    console.log(`\n✅ Successfully deleted ${ids.length} problematic materials`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run cleanup
cleanupUndefinedMaterials().then(() => {
  console.log('\\n🏁 Cleanup completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Cleanup failed:', error);
  process.exit(1);
});
