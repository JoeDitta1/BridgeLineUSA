import express from 'express';
import { db } from '../db.js';

const router = express.Router();

/**
 * GET /api/materials/families
 * Returns list of distinct material families
 */
router.get('/families', (req, res) => {
  try {
    const rows = db.prepare(`SELECT DISTINCT family FROM materials ORDER BY family`).all();
    res.json({ ok: true, families: rows.map(r => r.family) });
  } catch (e) {
    console.error('[materials:families] error:', e);
    res.status(500).json({ ok: false, error: 'Failed to fetch families' });
  }
});

/**
 * GET /api/materials/sizes?family=Plate
 */
router.get('/sizes', (req, res) => {
  try {
    const { family } = req.query;
    if (!family) return res.status(400).json({ ok: false, error: 'family is required' });
    const rows = db.prepare(`SELECT size FROM materials WHERE family = ? ORDER BY size`).all(family);
    res.json({ ok: true, sizes: rows.map(r => r.size) });
  } catch (e) {
    console.error('[materials:sizes] error:', e);
    res.status(500).json({ ok: false, error: 'Failed to fetch sizes' });
  }
});

/**
 * GET /api/materials?family=Plate&q=2x2&limit=100
 */
router.get('/', (req, res) => {
  try {
    const { family, q } = req.query;
    const limit = Math.max(1, Math.min(parseInt(req.query.limit || '100', 10), 1000));

    let sql = `
      SELECT id, family, size, unit_type, grade,
             price_per_lb, price_per_ft, price_each, description
      FROM materials
    `;
    const where = [];
    const params = [];

    if (family) { where.push('family = ?'); params.push(family); }
    if (q) {
      where.push(`(size LIKE ? OR IFNULL(description,'') LIKE ? OR IFNULL(grade,'') LIKE ?)`);
      params.push(\`%\${q}%\`, \`%\${q}%\`, \`%\${q}%\`);
    }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY family, size LIMIT ?';
    params.push(limit);

    const rows = db.prepare(sql).all(...params);
    res.json({ ok: true, materials: rows });
  } catch (e) {
    console.error('[materials:list] error:', e);
    res.status(500).json({ ok: false, error: 'Failed to fetch materials' });
  }
});

export default router;
