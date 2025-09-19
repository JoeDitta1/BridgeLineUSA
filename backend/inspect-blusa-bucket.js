// Check if the app uses blusa-uploads-prod bucket and inspect its contents
import './src/loadEnv.js';
import { getSupabaseClient } from './src/utils/supabaseClient.js';

async function inspectBlusaUploadsBucket() {
  try {
    console.log('🔍 INSPECTING BLUSA-UPLOADS-PROD BUCKET...');
    
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('❌ No Supabase client available');
      return;
    }
    
    // STEP 1: List all buckets to see what's available
    console.log('\n📁 STEP 1: Listing all available buckets...');
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
      
    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError);
    } else {
      console.log(`📊 Found ${buckets?.length || 0} buckets:`);
      buckets?.forEach(bucket => 
        console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'}) - created: ${bucket.created_at}`)
      );
    }
    
    // STEP 2: Check if blusa-uploads-prod exists and inspect it
    console.log('\n🔍 STEP 2: Inspecting blusa-uploads-prod bucket...');
    
    try {
      const { data: blusaContents, error: blusaError } = await supabase
        .storage
        .from('blusa-uploads-prod')
        .list('', { limit: 1000 });
        
      if (blusaError) {
        console.error('❌ Failed to access blusa-uploads-prod:', blusaError);
        if (blusaError.message.includes('not found')) {
          console.log('ℹ️  Bucket blusa-uploads-prod does not exist');
        }
      } else {
        console.log(`📊 blusa-uploads-prod contents: ${blusaContents?.length || 0} items`);
        
        if (blusaContents && blusaContents.length > 0) {
          console.log('Contents:');
          blusaContents.forEach(item => 
            console.log(`  - ${item.name} (${item.metadata?.size ? 'file' : 'folder'}) - ${item.updated_at}`)
          );
          
          // Look for SCM-Q-0001 specifically
          const scmItem = blusaContents.find(item => item.name.includes('SCM-Q-0001') || item.name.includes('SCM-Q0001'));
          if (scmItem) {
            console.log(`\n🎯 Found SCM-Q-0001 related item: ${scmItem.name}`);
            
            // If it's a folder, explore it
            if (!scmItem.metadata?.size) {
              console.log('🔍 Exploring SCM-Q-0001 folder...');
              const { data: scmContents, error: scmError } = await supabase
                .storage
                .from('blusa-uploads-prod')
                .list(scmItem.name, { limit: 100 });
                
              if (scmError) {
                console.error('❌ Failed to explore SCM folder:', scmError);
              } else {
                console.log(`📄 SCM folder contents: ${scmContents?.length || 0} items`);
                scmContents?.forEach(subItem => 
                  console.log(`    - ${subItem.name} (${subItem.metadata?.size ? 'file' : 'folder'})`)
                );
              }
            }
          }
        } else {
          console.log('📭 blusa-uploads-prod bucket is empty');
        }
      }
    } catch (blusaErr) {
      console.error('❌ Error accessing blusa-uploads-prod:', blusaErr.message);
    }
    
    // STEP 3: Search codebase for references to blusa-uploads-prod
    console.log('\n🔍 STEP 3: Checking codebase for blusa-uploads-prod references...');
    console.log('Searching for bucket name references in the codebase...');
    
    // We'll need to search the actual files for this bucket name
    console.log('You should search your codebase for:');
    console.log('  - "blusa-uploads-prod"');
    console.log('  - "blusa-uploads"');  
    console.log('  - Any bucket configuration files');
    
    // STEP 4: Compare with current bucket usage
    console.log('\n📋 STEP 4: Current vs Legacy Analysis...');
    console.log('Current system uses: quote-files bucket');
    console.log('Legacy system might use: blusa-uploads-prod bucket');
    console.log('');
    console.log('Possible scenarios:');
    console.log('1. 🗂️  Old bucket from previous system version');
    console.log('2. 🔄 Parallel upload system that needs migration');
    console.log('3. 🧪 Test bucket that can be safely deleted');
    console.log('4. 📦 Backup storage that should be preserved');
    
    // STEP 5: Check environment variables for bucket configuration
    console.log('\n🔧 STEP 5: Checking environment for bucket configuration...');
    const bucketEnvVars = [
      'SUPABASE_BUCKET',
      'UPLOADS_BUCKET', 
      'QUOTE_FILES_BUCKET',
      'BLUSA_BUCKET',
      'STORAGE_BUCKET'
    ];
    
    bucketEnvVars.forEach(envVar => {
      const value = process.env[envVar];
      if (value) {
        console.log(`✅ ${envVar} = ${value}`);
      } else {
        console.log(`❌ ${envVar} = (not set)`);
      }
    });
    
  } catch (err) {
    console.error('❌ Inspection error:', err);
  }
}

inspectBlusaUploadsBucket().then(() => process.exit(0));