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
import * as dbModule from '../src/db.js';

// Get database connection to access stored credentials
const db = dbModule.default ?? dbModule.db ?? dbModule;

// Get Supabase credentials from kv_store (same as the app)
function getSupabaseCredentials() {
  try {
    const urlRow = db.prepare("SELECT value FROM kv_store WHERE key = 'SUPABASE_URL'").get();
    const serviceKeyRow = db.prepare("SELECT value FROM kv_store WHERE key = 'SUPABASE_SERVICE_KEY'").get();
    
    const supabaseUrl = urlRow?.value;
    const supabaseServiceKey = serviceKeyRow?.value;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Supabase credentials not configured in admin settings');
      console.error('   Please configure SUPABASE_URL and SUPABASE_SERVICE_KEY in the admin panel');
      return null;
    }
    
    return { supabaseUrl, supabaseServiceKey };
  } catch (error) {
    console.error('❌ Failed to get Supabase credentials:', error);
    return null;
  }
}

const credentials = getSupabaseCredentials();
if (!credentials) {
  process.exit(1);
}

const supabase = createClient(credentials.supabaseUrl, credentials.supabaseServiceKey);

/**
 * Clean pipe descriptions by removing "NPS" prefix
 */
function cleanPipeDescription(type, size) {
  if (type === 'Pipe' && size && size.startsWith('NPS ')) {
    return size.replace('NPS ', '');
  }
  return size;
}

/**
 * Create proper label and value for material
 */
function createMaterialLabel(type, size) {
  return `${type} - ${size}`;
}

function createMaterialValue(type, size) {
  return `${type}|${size}`;
}

async function cleanupSupabaseMaterials() {
  console.log('🔄 Starting cleanup of existing Supabase materials...');
  console.log(`🔗 Supabase URL: ${credentials.supabaseUrl}`);
  console.log(`🔑 Service Key: ${credentials.supabaseServiceKey.substring(0, 20)}...`);
  
  try {
    // Get all Pipe materials from Supabase that have "NPS" in the size
    const { data: pipeMaterials, error: fetchError } = await supabase
      .from('materials')
      .select('*')
      .eq('type', 'Pipe')
      .like('size', 'NPS %')
      .order('size');
      
    if (fetchError) {
      console.error('❌ Error fetching Pipe materials:', fetchError);
      return;
    }
    
    if (!pipeMaterials || pipeMaterials.length === 0) {
      console.log('✅ No Pipe materials with "NPS" prefix found - cleanup not needed');
      return;
    }
    
    console.log(`📊 Found ${pipeMaterials.length} Pipe materials with "NPS" prefix to clean`);
    
    // Show what will be cleaned
    console.log('\n📋 Materials to be cleaned:');
    pipeMaterials.slice(0, 5).forEach((m, i) => {
      const cleanedSize = cleanPipeDescription(m.type, m.size);
      console.log(`  ${i+1}. "${m.size}" → "${cleanedSize}" (weight: ${m.weight_per_ft || 'N/A'} lb/ft)`);
    });
    if (pipeMaterials.length > 5) {
      console.log(`  ... and ${pipeMaterials.length - 5} more`);
    }
    
    // Prepare updates
    const updates = pipeMaterials.map(material => {
      const cleanedSize = cleanPipeDescription(material.type, material.size);
      return {
        id: material.id,
        size: cleanedSize,
        description: material.description || cleanedSize,
        label: createMaterialLabel(material.type, cleanedSize),
        value: createMaterialValue(material.type, cleanedSize)
      };
    });
    
    // Update materials one by one (to preserve all existing data)
    let updated = 0;
    let errors = 0;
    
    console.log('\n🔄 Cleaning materials...');
    for (const update of updates) {
      const { error } = await supabase
        .from('materials')
        .update({
          size: update.size,
          description: update.description,
          label: update.label,
          value: update.value
        })
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating material ID ${update.id}:`, error.message);
        errors++;
      } else {
        updated++;
        if (updated % 10 === 0) {
          console.log(`   ✅ Updated ${updated}/${updates.length} materials...`);
        }
      }
    }
    
    console.log(`\n🎉 Cleanup completed!`);
    console.log(`   ✅ Successfully cleaned: ${updated} pipe materials`);
    console.log(`   ❌ Errors: ${errors} materials`);
    
    if (updated > 0) {
      console.log('\n📋 Sample of cleaned materials:');
      const { data: sampleCleaned } = await supabase
        .from('materials')
        .select('type, size, weight_per_ft')
        .eq('type', 'Pipe')
        .not('size', 'like', 'NPS %')
        .limit(5);
        
      sampleCleaned?.forEach((m, i) => {
        console.log(`   ${i+1}. ${m.type} - ${m.size} (${m.weight_per_ft} lb/ft)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run cleanup
cleanupSupabaseMaterials().then(() => {
  console.log('\n🏁 Cleanup script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Cleanup script failed:', error);
  process.exit(1);
});
