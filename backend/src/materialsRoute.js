// src/materialsRoute.js
import express from "express";
import fs from "fs";
import path from "path";
import { createClient } from '@supabase/supabase-js';

// Supabase client (optional, enabled via USE_SUPABASE env)
const USE_SUPABASE = String(process.env.USE_SUPABASE || '').toLowerCase() === '1' ||
                     String(process.env.USE_SUPABASE || '').toLowerCase() === 'true';
const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = (USE_SUPABASE && SUPA_URL && SUPA_KEY) ? createClient(SUPA_URL, SUPA_KEY) : null;

const router = express.Router();

// Your materials.json lives one level up from the Part2 folder
const JSON_PATH = path.resolve(process.cwd(), "..", "frontend", "src", "data", "materials.json");

/** ---------- helpers (non-breaking enrich) ---------- **/

// Parse inches like "3", "3/8", "2-1/2" -> Number(inches)
function parseInches(txt) {
  if (!txt) return NaN;
  const s = String(txt).trim();
  if (s.includes("-")) {
    const [whole, frac] = s.split("-");
    return parseFloat(whole) + parseInches(frac);
  }
  if (s.includes("/")) {
    const [n, d] = s.split("/");
    const nn = parseFloat(n);
    const dd = parseFloat(d);
    if (!isFinite(nn) || !isFinite(dd) || dd === 0) return NaN;
    return nn / dd;
  }
  const n = parseFloat(s);
  return isFinite(n) ? n : NaN;
}

// Angle size strings like "L3x3x1/4" or "L3x2-1/2x3/16"
function parseAngleSize(sizeStr) {
  if (!sizeStr) return null;
  const s = String(sizeStr).trim().toUpperCase();
  if (!s.startsWith("L")) return null;
  const body = s.slice(1);
  const parts = body.split("X");
  if (parts.length < 3) return null;

  const leg1 = parseInches(parts[0]);
  const leg2 = parseInches(parts[1]);
  const thick = parseInches(parts[2]);

  if (![leg1, leg2, thick].every(v => isFinite(v) && v > 0)) return null;
  return { leg1, leg2, thick };
}

// Area ≈ t * (b1 + b2 - t); Weight(lb/ft) ≈ Area(in^2) * 12 * 0.283 ≈ Area * 3.396
function computeAngleWeightPerFt({ leg1, leg2, thick }) {
  const area = thick * (leg1 + leg2 - thick);
  const w = area * 3.396;
  return Math.round(w * 100) / 100; // 2 decimals
}

function enrichMaterialRow(row) {
  const r = { ...row };
  if (r.family && String(r.family).toLowerCase() === "angle") {
    const parsed = parseAngleSize(r.size);
    if (parsed) {
      const w = computeAngleWeightPerFt(parsed);
      if (r.weight_per_ft == null && isFinite(w)) {
        // non-breaking: add a *new* field, leave existing fields untouched
        r.computed_weight_per_ft = w; // lb/ft
      }
    }
  }
  return r;
}

/** ---------- route (same path & behavior) ---------- **/

// GET /api/materials/families
router.get('/families', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('materials').select('category,type');
      if (error) throw error;
      const fams = new Set(
        (data || [])
          .map(r => (r.category || r.type || '').trim())
          .filter(Boolean)
      );
      return res.json({ ok: true, families: [...fams].sort() });
    }

    // JSON fallback
    const text = fs.readFileSync(JSON_PATH, 'utf8');
    const data = JSON.parse(text);
    const list = Array.isArray(data) ? data : Array.isArray(data?.materials) ? data.materials : [];
    const fams = new Set(list.map(m => (m.category || m.type || '').trim()).filter(Boolean));
    res.json({ ok: true, families: [...fams].sort() });
  } catch (e) {
    console.error('[materials:families]', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

// GET /api/materials/by-family?family=Plate
router.get('/by-family', async (req, res) => {
  try {
    const family = (req.query.family || '').trim();
    if (!family) return res.json({ ok: true, items: [] });

    if (supabase) {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .or(`category.eq.${family},type.eq.${family}`);
      if (error) throw error;
      return res.json({ ok: true, count: data.length, items: data });
    }

    // JSON fallback
    const text = fs.readFileSync(JSON_PATH, 'utf8');
    const data = JSON.parse(text);
    const list = Array.isArray(data) ? data : Array.isArray(data?.materials) ? data.materials : [];
    const items = list.filter(m => ((m.category || m.type || '') === family));
    return res.json({ ok: true, count: items.length, items });
  } catch (e) {
    console.error('[materials:by-family]', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

// GET /api/materials (full list)
router.get('/', async (_req, res) => {
  console.log('=== MATERIALS ROUTE HIT ===');
  console.log('Looking for file at:', JSON_PATH);

  try {
    if (supabase) {
      const { data, error } = await supabase.from('materials').select('*');
      if (error) throw error;
      const enriched = (data || []).map(enrichMaterialRow);
      return res.json(enriched);
    }

    // JSON fallback
    const text = fs.readFileSync(JSON_PATH, 'utf8');
    const data = JSON.parse(text);
    const list = Array.isArray(data) ? data : Array.isArray(data?.materials) ? data.materials : [];
    const enriched = list.map(enrichMaterialRow);
    res.json(enriched);
  } catch (e) {
    console.error('ERROR in materials route:', e && e.message ? e.message : e);
    res.json([]);
  }
});

export default router;
