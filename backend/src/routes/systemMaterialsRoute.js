import express from 'express';
import * as dbModule from '../db.js';

const router = express.Router();
const db = dbModule.default ?? dbModule.db ?? dbModule;

// List families
router.get('/families', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, name FROM material_families ORDER BY name').all() || [];
    res.json({ ok: true, families: rows });
  } catch (e) {
    console.error('[system-materials GET /families] ', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

// CRUD for family
router.post('/families', (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ ok: false, error: 'name required' });
    const info = db.prepare('INSERT INTO material_families (name) VALUES (?)').run(name);
    const fam = db.prepare('SELECT id, name FROM material_families WHERE id = ?').get(info.lastInsertRowid);
    res.json({ ok: true, family: fam });
  } catch (e) {
    console.error('[system-materials POST /families] ', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

router.put('/families/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ ok: false, error: 'name required' });
    db.prepare('UPDATE material_families SET name = ? WHERE id = ?').run(name, id);
    const fam = db.prepare('SELECT id, name FROM material_families WHERE id = ?').get(id);
    res.json({ ok: true, family: fam });
  } catch (e) {
    console.error('[system-materials PUT /families/:id] ', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

router.delete('/families/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    db.prepare('DELETE FROM material_families WHERE id = ?').run(id);
    res.json({ ok: true });
  } catch (e) {
    console.error('[system-materials DELETE /families/:id] ', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

// Specs CRUD
router.get('/specs', (req, res) => {
  try {
    const rows = db.prepare(`SELECT s.id, s.family_id, f.name as family_name, s.grade, s.density, s.unit, s.notes, s.ai_searchable
      FROM material_specs s JOIN material_families f ON s.family_id = f.id ORDER BY f.name, s.grade`).all() || [];
    res.json({ ok: true, specs: rows });
  } catch (e) {
    console.error('[system-materials GET /specs] ', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

router.post('/specs', (req, res) => {
  try {
    const b = req.body || {};
    const stmt = db.prepare('INSERT INTO material_specs (family_id, grade, density, unit, notes, ai_searchable) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(b.family_id, b.grade || null, b.density || null, b.unit || null, b.notes || null, b.ai_searchable ? 1 : 0);
    const row = db.prepare('SELECT id, family_id, grade, density, unit, notes, ai_searchable FROM material_specs WHERE id = ?').get(info.lastInsertRowid);
    res.json({ ok: true, spec: row });
  } catch (e) {
    console.error('[system-materials POST /specs] ', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

router.put('/specs/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const b = req.body || {};
    db.prepare('UPDATE material_specs SET family_id = ?, grade = ?, density = ?, unit = ?, notes = ?, ai_searchable = ? WHERE id = ?')
      .run(b.family_id, b.grade || null, b.density || null, b.unit || null, b.notes || null, b.ai_searchable ? 1 : 0, id);
    const row = db.prepare('SELECT id, family_id, grade, density, unit, notes, ai_searchable FROM material_specs WHERE id = ?').get(id);
    res.json({ ok: true, spec: row });
  } catch (e) {
    console.error('[system-materials PUT /specs/:id] ', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

router.delete('/specs/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    db.prepare('DELETE FROM material_specs WHERE id = ?').run(id);
    res.json({ ok: true });
  } catch (e) {
    console.error('[system-materials DELETE /specs/:id] ', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

// Sizes CRUD
router.get('/sizes', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, family_id, size_label, dims_json FROM material_sizes ORDER BY family_id, size_label').all() || [];
    res.json({ ok: true, sizes: rows });
  } catch (e) {
    console.error('[system-materials GET /sizes] ', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

router.post('/sizes', (req, res) => {
  try {
    const b = req.body || {};
    const stmt = db.prepare('INSERT INTO material_sizes (family_id, size_label, dims_json) VALUES (?, ?, ?)');
    const info = stmt.run(b.family_id, b.size_label || null, b.dims_json || null);
    const row = db.prepare('SELECT id, family_id, size_label, dims_json FROM material_sizes WHERE id = ?').get(info.lastInsertRowid);
    res.json({ ok: true, size: row });
  } catch (e) {
    console.error('[system-materials POST /sizes] ', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

router.put('/sizes/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const b = req.body || {};
    db.prepare('UPDATE material_sizes SET family_id = ?, size_label = ?, dims_json = ? WHERE id = ?')
      .run(b.family_id, b.size_label || null, b.dims_json || null, id);
    const row = db.prepare('SELECT id, family_id, size_label, dims_json FROM material_sizes WHERE id = ?').get(id);
    res.json({ ok: true, size: row });
  } catch (e) {
    console.error('[system-materials PUT /sizes/:id] ', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

router.delete('/sizes/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    db.prepare('DELETE FROM material_sizes WHERE id = ?').run(id);
    res.json({ ok: true });
  } catch (e) {
    console.error('[system-materials DELETE /sizes/:id] ', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

export default router;
