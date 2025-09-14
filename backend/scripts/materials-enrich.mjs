// scripts/materials-enrich.mjs  (Node ESM)
// Enrich C:\SCM-AI\materials.json with default grades and computed weight_per_ft where missing.

import fs from 'fs';
import path from 'path';

// ---- CONFIG ----
const MATERIALS_PATH = 'C:\\SCM-AI\\materials.json';
const DRY_RUN = process.argv.includes('--dry');

// ---- helpers: parsing dimensions (inches) ----
function parseInches(txt) {
  if (txt == null) return NaN;
  const s = String(txt).trim();
  if (!s) return NaN;
  if (s.includes('-')) {
    const [whole, frac] = s.split('-');
    return parseFloat(whole) + parseInches(frac);
  }
  if (s.includes('/')) {
    const [n, d] = s.split('/');
    const nn = parseFloat(n), dd = parseFloat(d);
    if (!isFinite(nn) || !isFinite(dd) || dd === 0) return NaN;
    return nn / dd;
  }
  const n = parseFloat(s);
  return isFinite(n) ? n : NaN;
}

// General density factor: in^2 * 12 (in/ft) * 0.283 (lb/in^3) = 3.396
const FACTOR = 3.396;

// Parse “L3x2-1/2x3/16”
function parseAngle(size) {
  if (!size) return null;
  const s = String(size).toUpperCase().replace(/\s+/g, '');
  if (!s.startsWith('L')) return null;
  const [leg1, leg2, thick] = s.slice(1).split('X');
  const L1 = parseInches(leg1), L2 = parseInches(leg2), T = parseInches(thick);
  if ([L1, L2, T].every(v => isFinite(v) && v > 0)) return { L1, L2, T };
  return null;
}

// Parse HSS/Tube Rect/Sq: “2x3x1/4”, “2x2x3/16”
function parseRectTube(size) {
  if (!size) return null;
  const s = String(size).toUpperCase().replace(/\s+/g, '');
  const parts = s.split('X');
  if (parts.length < 3) return null;
  const B = parseInches(parts[0]), H = parseInches(parts[1]), T = parseInches(parts[2]);
  if ([B, H, T].every(v => isFinite(v) && v > 0)) return { B, H, T };
  return null;
}

// Parse Round tube/pipe: “2-1/2x.250”, “3x1/4”
function parseRound(size) {
  if (!size) return null;
  const s = String(size).toUpperCase().replace(/\s+/g, '');
  const parts = s.split('X');
  if (parts.length < 2) return null;
  const OD = parseInches(parts[0]);
  // allow .250 or 1/4
  const tRaw = parts[1].startsWith('.') ? parts[1] : parts[1];
  const T = parts[1].startsWith('.') ? parseFloat(parts[1]) : parseInches(tRaw);
  if ([OD, T].every(v => isFinite(v) && v > 0)) return { OD, T };
  return null;
}

// Weight calculators
function wAngle({ L1, L2, T }) {
  const area = T * (L1 + L2 - T);
  return +(area * FACTOR).toFixed(2);
}
function wRect({ B, H, T }) {
  const area = B * H - (B - 2 * T) * (H - 2 * T);
  return +(area * FACTOR).toFixed(2);
}
function wRound({ OD, T }) {
  const ID = OD - 2 * T;
  const area = Math.PI / 4 * (OD * OD - ID * ID);
  return +(area * FACTOR).toFixed(2);
}

// Basic family/type checks
function isStainless(str = '') {
  const s = String(str).toLowerCase();
  return s.includes('stainless') || /\bss\b/i.test(s);
}
function familyOf(row) {
  const fam = (row.family || row.category || row.type || '').toString();
  return fam;
}

// Grade defaults
function assignDefaultGrade(row) {
  const fam = familyOf(row).toLowerCase();
  const desc = `${row.description || ''} ${row.label || ''} ${row.value || ''}`.toLowerCase();
  if (row.grade && String(row.grade).trim()) return row.grade;

  if (isStainless(desc)) return '304';

  if (/\bw[-\s]?beam\b/i.test(fam) || /\bw[-\s]?beam\b/i.test(desc)) return 'A992';
  if (/hss|rect.*tube|square.*tube/i.test(desc) || /hss|tube/i.test(fam)) return 'A500';

  if (/angle|flat|plate|bar/i.test(fam) || /angle|flat|plate|bar/i.test(desc)) return 'A36';

  // fallback unchanged
  return row.grade ?? null;
}

// Try compute weight_per_ft if missing
function computeMissingWeight(row) {
  const fam = familyOf(row).toLowerCase();
  const size = row.size || row.description || row.label || '';
  if (row.weight_per_ft != null && row.weight_per_ft !== '') return row.weight_per_ft;

  // Angle
  if (/angle/i.test(fam) || /^l\d/i.test(String(size).trim().toLowerCase())) {
    const p = parseAngle(size);
    if (p) return wAngle(p);
  }
  // Rect / Square tube (HSS)
  if (/hss|tube|rect|square/i.test(fam + ' ' + size)) {
    const pRect = parseRectTube(size);
    if (pRect) return wRect(pRect);
    const pRound = parseRound(size);
    if (pRound) return wRound(pRound);
  }
  // Pipe (OD x t)
  if (/pipe/i.test(fam + ' ' + size)) {
    const pRound = parseRound(size);
    if (pRound) return wRound(pRound);
  }

  return row.weight_per_ft ?? null;
}

// ---- main ----
function main() {
  if (!fs.existsSync(MATERIALS_PATH)) {
    console.error(`materials.json not found at: ${MATERIALS_PATH}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(MATERIALS_PATH, 'utf8');
  let data = JSON.parse(raw);
  const list = Array.isArray(data) ? data : Array.isArray(data?.materials) ? data.materials : [];

  let changed = 0;
  const out = list.map((row) => {
    const updated = { ...row };
    // grade
    const newGrade = assignDefaultGrade(updated);
    if ((updated.grade ?? null) !== newGrade) {
      updated.grade = newGrade;
      changed++;
    }
    // weight
    const newW = computeMissingWeight(updated);
    if (newW != null && newW !== '' && updated.weight_per_ft == null) {
      updated.weight_per_ft = newW;
      changed++;
    }
    return updated;
  });

  if (DRY_RUN) {
    console.log(`[DRY] Would update ${changed} fields across ${out.length} records. No file written.`);
    process.exit(0);
  }

  // Backup
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = MATERIALS_PATH.replace(/\.json$/i, `.${ts}.bak.json`);
  fs.writeFileSync(backupPath, raw, 'utf8');

  // Write
  if (Array.isArray(data)) {
    fs.writeFileSync(MATERIALS_PATH, JSON.stringify(out, null, 2), 'utf8');
  } else {
    data.materials = out;
    fs.writeFileSync(MATERIALS_PATH, JSON.stringify(data, null, 2), 'utf8');
  }

  console.log(`Updated ${MATERIALS_PATH}. Changed fields: ${changed}. Backup at: ${backupPath}`);
}

main();
