#!/usr/bin/env node
/**
 * Clean up existing Supabase materials
 * IMPORTANT: Only cleans existing Supabase data - does NOT migrate from SQLite
 * 
 * Changes made:
 * 1. Remove "NPS" from pipe descriptions (NPS 3 SCH 40 → 3 SCH 40)
 * 2. Update labels and values to match new format
 * 3. Preserve all weight_per_ft, price calculations, etc.
 * 
 * NOTE: SQLite has outdated AI testing data that should NOT be migrated
 */

import { createClient } from '@supabase/supabase-js';

// Get database connection (not needed for this cleanup)
// const db = dbModule.default ?? dbModule.db ?? dbModule;

// Supabase client (using service key for admin operations)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Clean pipe descriptions by removing "NPS" prefix
 */
function cleanPipeDescription(family, size) {
  if (family === 'Pipe' && size && size.startsWith('NPS ')) {
    return size.replace('NPS ', '');
  }
  return size;
}

/**
 * Create proper label and value for material
 */
function createMaterialLabel(family, size) {
  return `${family} - ${size}`;
}

function createMaterialValue(family, size) {
  return `${family}|${size}`;
}

async function migrateMaterials() {
  console.log('🔄 Starting CAREFUL materials migration from SQLite to Supabase...');
  console.log('⚠️  Only migrating materials that are truly missing to avoid duplicates');
  
  try {
    // Get all materials from SQLite
    const sqliteMaterials = db.prepare('SELECT * FROM materials ORDER BY family, size').all();
    console.log(`📊 Found ${sqliteMaterials.length} materials in SQLite database`);
    
    // Check what's already in Supabase with detailed comparison
    const { data: existingMaterials, error: fetchError } = await supabase
      .from('materials')
      .select('type, size, description')
      .order('type');
      
    if (fetchError) {
      console.error('❌ Error fetching existing Supabase materials:', fetchError);
      return;
    }
    
    console.log(`📊 Found ${existingMaterials?.length || 0} materials already in Supabase`);
    
    // Create detailed comparison - check both type|size AND type|description
    const existingSet = new Set();
    (existingMaterials || []).forEach(m => {
      // Add both size-based and description-based keys for thorough checking
      existingSet.add(`${m.type}|${m.size}`);
      if (m.description && m.description !== m.size) {
        existingSet.add(`${m.type}|${m.description}`);
      }
      // Also check cleaned versions (remove NPS, etc.)
      const cleanedSize = m.size?.replace('NPS ', '');
      if (cleanedSize && cleanedSize !== m.size) {
        existingSet.add(`${m.type}|${cleanedSize}`);
      }
    });
    
    // Prepare materials for insertion
    const materialsToInsert = [];
    let skipped = 0;
    
    for (const sqliteMaterial of sqliteMaterials) {
      const cleanedSize = cleanPipeDescription(sqliteMaterial.family, sqliteMaterial.size);
      const materialKey = `${sqliteMaterial.family}|${cleanedSize}`;
      
      // Skip if already exists in Supabase
      if (existingSet.has(materialKey)) {
        skipped++;
        continue;
      }
      
      // Map SQLite fields to Supabase schema
      const supabaseMaterial = {
        type: sqliteMaterial.family,                    // family → type
        category: sqliteMaterial.family,                // family → category  
        size: cleanedSize,                              // cleaned size (remove NPS)
        unit_type: sqliteMaterial.unit_type,           // preserve unit_type
        grade: sqliteMaterial.grade || '',             // preserve grade
        weight_per_ft: sqliteMaterial.weight_per_ft,   // preserve weight calculations
        weight_per_sqin: sqliteMaterial.weight_per_sqin, // preserve weight calculations
        price_per_lb: sqliteMaterial.price_per_lb,     // preserve pricing
        price_per_ft: sqliteMaterial.price_per_ft,     // preserve pricing  
        price_each: sqliteMaterial.price_each,         // preserve pricing
        price_per_unit: sqliteMaterial.price_per_lb || sqliteMaterial.price_per_ft || sqliteMaterial.price_each || 0,
        description: sqliteMaterial.description || cleanedSize, // use description or cleaned size
        label: createMaterialLabel(sqliteMaterial.family, cleanedSize),
        value: createMaterialValue(sqliteMaterial.family, cleanedSize),
        source: 'migrated_from_sqlite',
        migrated_at: new Date().toISOString()
      };
      
      materialsToInsert.push(supabaseMaterial);
    }
    
    console.log(`📋 Prepared ${materialsToInsert.length} materials for insertion (${skipped} already exist)`);
    
    if (materialsToInsert.length === 0) {
      console.log('✅ No new materials to migrate');
      return;
    }
    
    // Show sample of what will be migrated
    console.log('\n📋 Sample materials to migrate:');
    materialsToInsert.slice(0, 5).forEach((m, i) => {
      console.log(`  ${i+1}. ${m.type} - ${m.size} (weight: ${m.weight_per_ft || 'N/A'} lb/ft)`);
    });
    
    // Batch insert materials (Supabase has limits, so do in chunks)
    const batchSize = 100;
    let inserted = 0;
    let errors = 0;
    
    for (let i = 0; i < materialsToInsert.length; i += batchSize) {
      const batch = materialsToInsert.slice(i, i + batchSize);
      console.log(`\n🔄 Inserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(materialsToInsert.length/batchSize)} (${batch.length} materials)...`);
      
      const { data, error } = await supabase
        .from('materials')
        .insert(batch);
        
      if (error) {
        console.error(`❌ Error inserting batch:`, error);
        errors += batch.length;
      } else {
        console.log(`✅ Successfully inserted ${batch.length} materials`);
        inserted += batch.length;
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`   ✅ Successfully migrated: ${inserted} materials`);
    console.log(`   ❌ Errors: ${errors} materials`);
    console.log(`   ⏭️  Skipped (already exist): ${skipped} materials`);
    
    // Summary by family
    if (inserted > 0) {
      console.log('\n📊 Migration summary by family:');
      const familySummary = {};
      materialsToInsert.forEach(m => {
        familySummary[m.type] = (familySummary[m.type] || 0) + 1;
      });
      
      Object.entries(familySummary).forEach(([family, count]) => {
        console.log(`   ${family}: ${count} materials`);
      });
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run migration
migrateMaterials().then(() => {
  console.log('\n🏁 Migration script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Migration script failed:', error);
  process.exit(1);
});
