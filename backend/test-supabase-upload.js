// Test Supabase upload functionality
import { createClient } from '@supabase/supabase-js';
import { uploadFileToSupabase } from './src/utils/supabaseClient.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('🧪 TESTING SUPABASE UPLOAD FUNCTIONALITY');
console.log('='.repeat(60));

async function testSupabaseUpload() {
    try {
        console.log('\n🔍 Step 1: Test Supabase connection...');
        
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        
        // Check bucket exists
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        if (bucketsError) {
            console.error('❌ Failed to list buckets:', bucketsError);
            return;
        }
        
        const quoteFilesBucket = buckets.find(b => b.name === 'quote-files');
        if (!quoteFilesBucket) {
            console.error('❌ quote-files bucket does not exist!');
            return;
        }
        
        console.log('✅ quote-files bucket exists');
        
        // Test basic upload with a dummy file
        console.log('\n🔍 Step 2: Test file upload...');
        
        const testFile = {
            originalname: 'test-file.txt',
            buffer: Buffer.from('This is a test file for upload verification'),
            size: 44,
            mimetype: 'text/plain'
        };
        
        try {
            const result = await uploadFileToSupabase(
                testFile,
                'SCM-Q-TEST',
                'drawings',
                'TEST-CUSTOMER'
            );
            
            console.log('✅ Upload successful:', result);
            
            // Verify file exists in storage
            const { data: verification, error: verifyError } = await supabase.storage
                .from('quote-files')
                .list('quotes/TEST-CUSTOMER/SCM-Q-TEST/drawings', { limit: 10 });
                
            if (verifyError) {
                console.log('⚠️ Verification error:', verifyError.message);
            } else {
                console.log('✅ Verification - files found:', verification?.length || 0);
                verification?.forEach(file => {
                    console.log(`  - ${file.name}`);
                });
            }
            
            // Clean up test file
            const cleanupPath = result.path || result.storage_path;
            if (cleanupPath) {
                const { error: deleteError } = await supabase.storage
                    .from('quote-files')
                    .remove([cleanupPath]);
                    
                if (deleteError) {
                    console.log('⚠️ Cleanup warning:', deleteError.message);
                } else {
                    console.log('🧹 Test file cleaned up');
                }
            }
            
        } catch (uploadError) {
            console.error('❌ Upload failed:', uploadError.message);
            return;
        }
        
        console.log('\n🎉 SUPABASE UPLOAD TEST COMPLETE');
        console.log('Upload functionality is working correctly');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testSupabaseUpload();