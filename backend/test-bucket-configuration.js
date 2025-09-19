// Test bucket configuration to understand the system
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const configuredBucket = process.env.SUPABASE_BUCKET_UPLOADS;

console.log('🔍 BUCKET CONFIGURATION ANALYSIS');
console.log('='.repeat(50));

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeBuckets() {
    try {
        console.log('📋 Configuration:');
        console.log(`  - SUPABASE_BUCKET_UPLOADS: ${configuredBucket}`);
        console.log('  - Code hardcoded bucket: quote-files');
        
        // List all buckets
        console.log('\n📦 Available buckets:');
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
            console.error('❌ Failed to list buckets:', bucketsError);
            return;
        }
        
        if (!buckets || buckets.length === 0) {
            console.log('  📭 No buckets found');
            return;
        }
        
        for (const bucket of buckets) {
            console.log(`  - ${bucket.name} (id: ${bucket.id}, public: ${bucket.public})`);
        }
        
        // Check what's in each bucket
        const bucketsToCheck = ['quote-files', 'blusa-uploads-prod'];
        
        for (const bucketName of bucketsToCheck) {
            const bucketExists = buckets.some(b => b.name === bucketName);
            
            console.log(`\n📂 Bucket: ${bucketName} ${bucketExists ? '✅' : '❌'}`);
            
            if (!bucketExists) {
                console.log('  📭 Bucket does not exist');
                continue;
            }
            
            // List contents
            const { data: contents, error: contentsError } = await supabase.storage
                .from(bucketName)
                .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
                
            if (contentsError) {
                console.log(`  ❌ Error listing contents: ${contentsError.message}`);
                continue;
            }
            
            if (!contents || contents.length === 0) {
                console.log('  📭 Bucket is empty');
                continue;
            }
            
            console.log(`  📊 Contains ${contents.length} items:`);
            for (const item of contents.slice(0, 10)) { // Show first 10 items
                const type = item.metadata?.mimetype ? 'file' : 'folder';
                const size = item.metadata?.size || 0;
                console.log(`    - ${item.name} (${type}, ${size} bytes)`);
            }
            
            if (contents.length > 10) {
                console.log(`    ... and ${contents.length - 10} more items`);
            }
            
            // If this is blusa-uploads-prod, look for quote-specific items
            if (bucketName === 'blusa-uploads-prod') {
                console.log('\n  🔍 Looking for quote patterns in blusa-uploads-prod...');
                
                // Look for files that match quote patterns
                const quotePatterns = contents.filter(item => 
                    item.name.includes('SCM-Q') || 
                    item.name.includes('quote') ||
                    item.name.toLowerCase().includes('q-')
                );
                
                if (quotePatterns.length > 0) {
                    console.log(`  📋 Found ${quotePatterns.length} quote-related items:`);
                    for (const item of quotePatterns) {
                        console.log(`    - ${item.name}`);
                    }
                } else {
                    console.log('  📭 No quote-related patterns found');
                }
            }
        }
        
        console.log('\n🔍 ANALYSIS SUMMARY:');
        console.log(`  - Environment variable points to: ${configuredBucket}`);
        console.log('  - Code hardcoded to use: quote-files');
        console.log('  - Both buckets exist: need to determine which is active');
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
    }
}

analyzeBuckets();