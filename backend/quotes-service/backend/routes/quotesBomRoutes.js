import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// POST /api/quotes/:id/bom/accept
// body: { rows: [{material,size,grade,thickness_or_wall,length,qty,unit,notes}] }
router.post('/quotes/:id/bom/accept', (req, res) => {
  const quoteId = Number(req.params.id);
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
  const insert = db.prepare(`INSERT INTO quote_bom
    (quote_id, material, size, grade, thickness_or_wall, length, qty, unit, notes)
    VALUES (@quote_id, @material, @size, @grade, @thickness_or_wall, @length, @qty, @unit, @notes)`);
  const tx = db.transaction((items) => items.forEach(r => insert.run({ quote_id: quoteId, ...r })));
  tx(rows);
  res.json({ ok: true, added: rows.length });
});

export default router;