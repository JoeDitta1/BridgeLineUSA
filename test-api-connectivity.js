// Test script to verify frontend-backend connectivity
// Run this in the browser console or as a Node.js script

const API_BASE = 'http://0.0.0.0:4000';

async function testMaterialsAPI() {
  console.log('🔍 Testing materials API connectivity...');
  console.log('API Base:', API_BASE);

  try {
    const response = await fetch(`${API_BASE}/api/materials`);
    const data = await response.json();

    console.log('✅ API Response Status:', response.status);
    console.log('📊 Materials Count:', data.materials?.length || 0);

    if (data.materials && data.materials.length > 0) {
      console.log('🎯 Sample Materials:');
      data.materials.slice(0, 5).forEach((m, i) => {
        console.log(`  ${i+1}. ${m.family} - ${m.size} (${m.grade || 'No grade'})`);
      });

      // Check for expected material families
      const families = [...new Set(data.materials.map(m => m.family))];
      console.log('🏷️ Available Material Families:', families);

      const expectedFamilies = ['Pipe', 'Rect Tube', 'Square Tube', 'W-Beam'];
      const foundFamilies = expectedFamilies.filter(f => families.includes(f));
      console.log('✅ Found Expected Families:', foundFamilies);
      console.log('❌ Missing Families:', expectedFamilies.filter(f => !families.includes(f)));
    }

    return { success: true, count: data.materials?.length || 0 };
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    return { success: false, error: error.message };
  }
}

// For Node.js execution
if (typeof window === 'undefined') {
  testMaterialsAPI().then(result => {
    console.log('Test Result:', result);
    process.exit(result.success ? 0 : 1);
  });
}

// For browser console
if (typeof window !== 'undefined') {
  window.testMaterialsAPI = testMaterialsAPI;
  console.log('🔧 Run testMaterialsAPI() in the console to test connectivity');
}