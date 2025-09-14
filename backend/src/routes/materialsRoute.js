import express from 'express';
import { getSupabaseClient } from '../utils/supabaseClient.js';

const router = express.Router();

/**
 * GET /api/materials/families
 * Returns list of distinct material families from Supabase
 */
router.get('/families', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({ ok: false, error: 'Supabase not configured' });
    }
    
    const { data, error } = await supabase
      .from('materials')
      .select('type')
      .not('type', 'is', null)
      .order('type');
    
    if (error) {
      console.error('[materials:families] supabase error:', error);
      return res.status(500).json({ ok: false, error: 'Failed to fetch families' });
    }
    
    // Get unique types (families)
    const uniqueFamilies = [...new Set(data?.map(r => r.type).filter(Boolean))];
    res.json({ ok: true, families: uniqueFamilies });
  } catch (e) {
    console.error('[materials:families] error:', e);
    res.status(500).json({ ok: false, error: 'Failed to fetch families' });
  }
});

/**
 * GET /api/materials/sizes?family=Pipe
 */
router.get('/sizes', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({ ok: false, error: 'Supabase not configured' });
    }
    
    const { family } = req.query;
    if (!family) return res.status(400).json({ ok: false, error: 'family is required' });
    
    const { data, error } = await supabase
      .from('materials')
      .select('size')
      .eq('type', family)  // Use 'type' instead of 'family'
      .not('size', 'is', null)
      .order('size');
      
    if (error) {
      console.error('[materials:sizes] supabase error:', error);
      return res.status(500).json({ ok: false, error: 'Failed to fetch sizes' });
    }
    
    res.json({ ok: true, sizes: data?.map(r => r.size).filter(Boolean) || [] });
  } catch (e) {
    console.error('[materials:sizes] error:', e);
    res.status(500).json({ ok: false, error: 'Failed to fetch sizes' });
  }
});

/**
 * GET /api/materials?family=Pipe&q=3&limit=100
 * Fetch materials from Supabase
 */
router.get('/', async (req, res) => {
  try {
    console.log('[materials] GET / called with query:', req.query);
    
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('[materials] Supabase not configured');
      return res.status(500).json({ ok: false, error: 'Supabase not configured' });
    }
    
    const { family, q } = req.query;
    const limit = Math.max(1, Math.min(parseInt(req.query.limit || '2000', 10), 2000));

    console.log('[materials] Building query with:', { family, q, limit });

    let query = supabase
      .from('materials')
      .select('id, type, size, unit_type, grade, price_per_unit, description, value, weight_per_ft')
      .limit(limit);

    // Add filters - use 'type' instead of 'family'
    if (family) {
      query = query.eq('type', family);
      console.log('[materials] Added type filter:', family);
    }
    
    if (q) {
      // Search in size, description, value, and grade fields
      query = query.or(`size.ilike.%${q}%,description.ilike.%${q}%,grade.ilike.%${q}%,value.ilike.%${q}%`);
      console.log('[materials] Added text search filter:', q);
    }
    
    query = query.order('type').order('size');
    
    console.log('[materials] Executing Supabase query...');
    const { data, error } = await query;
    
    if (error) {
      console.error('[materials:list] supabase error:', error);
      return res.status(500).json({ ok: false, error: 'Failed to fetch materials', details: error.message });
    }

    console.log('[materials] Query successful, returned', data?.length || 0, 'materials');
    
    // Map the data to match the expected frontend format
    const materials = data?.map(item => ({
      id: item.id,
      family: item.type,  // Map 'type' to 'family' for frontend compatibility
      size: item.size,
      unit_type: item.unit_type,
      grade: item.grade,
      price_per_lb: null,  // Not available in this schema
      price_per_ft: null,  // Not available in this schema  
      price_each: item.price_per_unit,
      description: item.description || item.value,  // Use value as fallback description
      weight_per_ft: item.weight_per_ft
    })) || [];
    
    res.json({ ok: true, materials });
  } catch (e) {
    console.error('[materials:list] error:', e);
    res.status(500).json({ ok: false, error: 'Failed to fetch materials', details: e.message });
  }
});

/**
 * POST /api/materials
 * Add a new material to Supabase
 */
router.post('/', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({ ok: false, error: 'Supabase not configured' });
    }
    
    const { family, size, unit_type, grade, weight_per_ft, weight_per_sqin, description, price_per_lb, price_per_ft } = req.body;
    
    // Validate required fields
    if (!family) {
      return res.status(400).json({ ok: false, error: 'family is required' });
    }
    if (!size) {
      return res.status(400).json({ ok: false, error: 'size is required' });
    }

    // Check if material already exists
    const { data: existing, error: existError } = await supabase
      .from('materials')
      .select('id')
      .eq('type', family)  // Use 'type' field to match Supabase schema
      .eq('size', size)
      .single();

    if (existError && existError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('[materials:post] error checking existing:', existError);
      return res.status(500).json({ ok: false, error: 'Failed to check existing material' });
    }

    if (existing) {
      return res.json({ 
        ok: true, 
        id: existing.id, 
        message: 'Material already exists',
        existing: true 
      });
    }

    // Insert new material
    const { data: newMaterial, error: insertError } = await supabase
      .from('materials')
      .insert([{
        type: family,  // Map 'family' parameter to 'type' field in Supabase
        size,
        unit_type: unit_type || 'each',
        grade: grade || '',
        weight_per_ft: weight_per_ft || null,
        weight_per_sqin: weight_per_sqin || null,
        description: description || '',
        price_per_lb: price_per_lb || null,
        price_per_ft: price_per_ft || null
      }])
      .select()
      .single();

    if (insertError) {
      console.error('[materials:post] insert error:', insertError);
      return res.status(500).json({ ok: false, error: 'Failed to create material' });
    }

    console.log(`Added new material: ${family} - ${size} (ID: ${newMaterial.id})`);

    res.json({ 
      ok: true, 
      id: newMaterial.id,
      material: newMaterial,
      message: 'Material created successfully' 
    });
  } catch (e) {
    console.error('[materials:post] error:', e);
    res.status(500).json({ ok: false, error: 'Failed to create material' });
  }
});

export default router;
