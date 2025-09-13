require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkPipeData() {
  console.log('Checking pipe materials in Supabase...');
  
  const { data: materials, error } = await supabase
    .from('materials')
    .select('id, family, size, description, grade')
    .ilike('size', '%sch%')
    .limit(20);
    
  if (error) {
    console.error('Error:', error);
    return;
  }
    
  console.log(`\nFound ${materials?.length || 0} pipe materials:`);
  materials?.forEach(m => {
    console.log(`- Size: "${m.size}" | Desc: "${m.description}" | Grade: "${m.grade}" | Family: "${m.family}"`);
  });
  
  // Also check for the specific "2 SCH 40" pattern
  console.log('\n\nSearching for "2" SCH materials:');
  const { data: twoInch } = await supabase
    .from('materials')
    .select('id, family, size, description, grade')
    .ilike('size', '%2%sch%')
    .limit(10);
    
  twoInch?.forEach(m => {
    console.log(`- Size: "${m.size}" | Desc: "${m.description}" | Grade: "${m.grade}"`);
  });
}

checkPipeData().then(() => process.exit(0));
