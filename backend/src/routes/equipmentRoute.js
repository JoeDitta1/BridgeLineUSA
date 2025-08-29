import express from 'express';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import multer from 'multer';
import { fileURLToPath } from 'url';
import * as dbModule from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = dbModule.default ?? dbModule.db ?? dbModule;
const router = express.Router();

// Upload storage: backend/data/uploads/equipment/<equipmentId>/
const UPLOADS_ROOT = path.join(process.cwd(), 'data', 'uploads', 'equipment');
await fsPromises.mkdir(UPLOADS_ROOT, { recursive: true });

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const equipmentId = String(req.params.id || req.body.equipment_id || 'unknown');
      const dest = path.join(UPLOADS_ROOT, equipmentId);
      await fsPromises.mkdir(dest, { recursive: true });
      cb(null, dest);
    } catch (e) {
      cb(e);
    }
  },
  filename: (_req, file, cb) => {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const base = path.parse(file.originalname).name.replace(/\s+/g, '_');
    const ext = path.extname(file.originalname);
    cb(null, `${base}__${ts}${ext}`);
  }
});
const upload = multer({ storage });

/* GET /api/equipment - list */
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM equipment ORDER BY id DESC').all() || [];
    res.json({ ok: true, equipment: rows });
  } catch (e) {
    console.error('[equipment:GET /] error:', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

/* GET /api/equipment/:id - detail with docs */
router.get('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const row = db.prepare('SELECT * FROM equipment WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ ok: false, error: 'Not found' });
    const docs = db.prepare('SELECT id, equipment_id, path, label, created_at FROM equipment_docs WHERE equipment_id = ? ORDER BY id DESC').all(id) || [];
    res.json({ ok: true, equipment: row, docs });
  } catch (e) {
    console.error('[equipment:GET /:id] error:', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

/* POST /api/equipment - create */
router.post('/', (req, res) => {
  try {
    const b = req.body || {};
    const stmt = db.prepare(`
      INSERT INTO equipment (name, type, status, location, manual_path, capabilities_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      String(b.name || '').trim(),
      b.type ?? null,
      b.status ?? null,
      b.location ?? null,
      b.manual_path ?? null,
      b.capabilities_json ? String(b.capabilities_json) : null
    );
    const created = db.prepare('SELECT * FROM equipment WHERE id = ?').get(result.lastInsertRowid);
    res.json({ ok: true, equipment: created });
  } catch (e) {
    console.error('[equipment:POST /] error:', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

/* PUT /api/equipment/:id - update */
router.put('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const b = req.body || {};
    const stmt = db.prepare(`
      UPDATE equipment
      SET name = ?, type = ?, status = ?, location = ?, manual_path = ?, capabilities_json = ?
      WHERE id = ?
    `);
    stmt.run(
      String(b.name || '').trim(),
      b.type ?? null,
      b.status ?? null,
      b.location ?? null,
      b.manual_path ?? null,
      b.capabilities_json ? String(b.capabilities_json) : null,
      id
    );
    const updated = db.prepare('SELECT * FROM equipment WHERE id = ?').get(id);
    if (!updated) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, equipment: updated });
  } catch (e) {
    console.error('[equipment:PUT /:id] error:', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

/* DELETE /api/equipment/:id - remove (and cascade docs) */
router.delete('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const stmt = db.prepare('DELETE FROM equipment WHERE id = ?');
    stmt.run(id);
    const dir = path.join(UPLOADS_ROOT, String(id));
    try { if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true }); } catch (_) {}
    res.json({ ok: true });
  } catch (e) {
    console.error('[equipment:DELETE /:id] error:', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

/* GET /api/equipment/:id/docs - list docs */
router.get('/:id/docs', (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = db.prepare('SELECT id, equipment_id, path, label, created_at FROM equipment_docs WHERE equipment_id = ? ORDER BY id DESC').all(id) || [];
    res.json({ ok: true, docs: rows });
  } catch (e) {
    console.error('[equipment:GET docs] error:', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

/* POST /api/equipment/:id/manual - upload manual/file */
router.post('/:id/manual', upload.single('file'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const equipment = db.prepare('SELECT id FROM equipment WHERE id = ?').get(id);
    if (!equipment) return res.status(404).json({ ok: false, error: 'Equipment not found' });
    if (!req.file) return res.status(400).json({ ok: false, error: 'No file uploaded' });

    const relPath = path.relative(process.cwd(), req.file.path).replace(/\\/g, '/');
    const label = req.body.label || req.file.originalname || null;

    db.prepare('INSERT INTO equipment_docs (equipment_id, path, label) VALUES (?, ?, ?)').run(id, relPath, label);
    const doc = db.prepare('SELECT id, equipment_id, path, label, created_at FROM equipment_docs WHERE id = ?').get(db.prepare('SELECT last_insert_rowid() as id').get().id);

    db.prepare('UPDATE equipment SET manual_path = ? WHERE id = ?').run(relPath, id);

    res.json({ ok: true, doc });
  } catch (e) {
    console.error('[equipment:POST manual] error:', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

export default router;
