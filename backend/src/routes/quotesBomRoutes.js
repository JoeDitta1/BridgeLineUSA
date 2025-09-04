import express from 'express';
import { db } from '../db.js';
import { toFeet, normalizeTol } from '../../server/utils/units.js';

const router = express.Router();

// POST /api/quotes/:id/bom/accept
// body: { rows: [{material,size,grade,thickness_or_wall,length,qty,unit,notes,length_value,length_unit,tol_plus,tol_minus,tol_unit}] }
router.post('/quotes/:id/bom/accept', (req, res) => {
  const quoteId = Number(req.params.id);
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
  const insert = db.prepare(`INSERT INTO quote_bom
    (quote_id, material, size, grade, thickness_or_wall, length, qty, unit, notes,
     length_value, length_unit, tol_plus, tol_minus, tol_unit)
    VALUES (@quote_id, @material, @size, @grade, @thickness_or_wall, @length, @qty, @unit, @notes,
            @length_value, @length_unit, @tol_plus, @tol_minus, @tol_unit)`);

  const tx = db.transaction((items) => items.forEach(r => {
    const lv = r.length_value ?? r.length;             // allow callers to send either
    const lu = (r.length_unit || 'ft');
    const lengthFeet = toFeet(lv, lu);
    const tol = normalizeTol({ tol_plus: r.tol_plus, tol_minus: r.tol_minus, tol_unit: r.tol_unit || lu });
    insert.run({
      quote_id: quoteId,
      material: r.material || '',
      size: r.size || '',
      grade: r.grade || '',
      thickness_or_wall: r.thickness_or_wall || '',
      length: lengthFeet,                // legacy column in feet
      qty: r.qty || 1,
      unit: r.unit || 'Each',
      notes: r.notes || '',
      length_value: lv ?? null,
      length_unit: lu,
      tol_plus: tol.tol_plus,
      tol_minus: tol.tol_minus,
      tol_unit: tol.tol_unit
    });
  }));
  tx(rows);
  res.json({ ok: true, added: rows.length });
});

export default router;
