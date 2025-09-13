import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function analyzePipeMaterials() {
  console.log('🔍 Analyzing pipe materials in Supabase...');
  
  try {
    // Get a sample of pipe materials to understand the structure
    const { data: sampleData, error: sampleError } = await supabase
      .from('materials')
      .select('*')
      .eq('family', 'Pipe')
      .limit(5);
    
    if (sampleError) {
      console.error('Error fetching sample:', sampleError);
      return;
    }
    
    console.log('\n📋 Sample pipe materials structure:');
    sampleData.forEach((pipe, index) => {
      console.log(`\nSample ${index + 1}:`);
      console.log(`  ID: ${pipe.id}`);
      console.log(`  Family: ${pipe.family}`);
      console.log(`  Size: "${pipe.size}"`);
      console.log(`  Description: "${pipe.description}"`);
      console.log(`  Weight per ft: ${pipe.weight_per_ft}`);
      console.log(`  Grade: ${pipe.grade}`);
      console.log(`  Has schedule field: ${pipe.schedule !== undefined ? 'YES' : 'NO'}`);
    });
    
    // Count pipe materials with schedules in size/description
    const { data: pipeData, error: fetchError } = await supabase
      .from('materials')
      .select('id, family, size, description, weight_per_ft, schedule')
      .eq('family', 'Pipe')
      .or('size.ilike.%sch%,size.ilike.%std%,description.ilike.%sch%,description.ilike.%std%');
    
    if (fetchError) {
      console.error('Error fetching pipe data:', fetchError);
      return;
    }
    
    console.log(`\n📊 Found ${pipeData.length} pipe materials with schedule info`);
    
    // Analyze what needs to be cleaned
    const needsCleaning = [];
    
    pipeData.forEach(pipe => {
      const size = pipe.size || '';
      const desc = pipe.description || '';
      
      // Check if this has schedule info that should be separated
      const schedulePattern = /(\d+(?:\/\d+)?)\s+(sch\s+\d+|std|xs|xxs)/i;
      const sizeMatch = size.match(schedulePattern);
      const descMatch = desc.match(schedulePattern);
      
      if (sizeMatch || descMatch) {
        const match = sizeMatch || descMatch;
        const pipeSize = match[1]; // "2" or "1/2"
        const schedule = match[2].toUpperCase(); // "SCH 40" or "STD"
        
        needsCleaning.push({
          id: pipe.id,
          currentSize: size,
          currentDesc: desc,
          proposedSize: pipeSize,
          proposedDesc: `Pipe - ${pipeSize}"`,
          extractedSchedule: schedule,
          currentSchedule: pipe.schedule || '',
          weight_per_ft: pipe.weight_per_ft
        });
      }
    });
    
    console.log(`\n🔧 ${needsCleaning.length} materials need cleaning:`);
    needsCleaning.slice(0, 10).forEach(item => {
      console.log(`  ID ${item.id}: "${item.currentSize}" -> "${item.proposedSize}" + Schedule: "${item.extractedSchedule}"`);
      console.log(`    Weight: ${item.weight_per_ft} lb/ft`);
    });
    
    if (needsCleaning.length > 10) {
      console.log(`    ... and ${needsCleaning.length - 10} more`);
    }
    
    // Check if schedule column exists
    const hasScheduleColumn = sampleData[0].schedule !== undefined;
    console.log(`\n📋 Database info:`);
    console.log(`  - Schedule column exists: ${hasScheduleColumn ? 'YES' : 'NO'}`);
    console.log(`  - Total pipe materials to clean: ${needsCleaning.length}`);
    
    return needsCleaning;
    
  } catch (error) {
    console.error('Error during analysis:', error);
  }
}

// Run the analysis
analyzePipeMaterials().then(() => {
  console.log('\n✅ Analysis complete');
  process.exit(0);
}).catch(error => {
  console.error('Analysis error:', error);
  process.exit(1);
});
