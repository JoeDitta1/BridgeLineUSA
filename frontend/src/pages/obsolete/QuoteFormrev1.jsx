// src/pages/QuoteForm.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Select from 'react-select';
import UploadButton from '../components/UploadButton';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

/* --------------------------------- Helpers --------------------------------- */

// Last-used price memory (keyed by unit + grade + domestic)
const PRICE_KEY = 'scm_price_history_v2';
const loadPriceMap = () => { try { return JSON.parse(localStorage.getItem(PRICE_KEY) || '{}'); } catch { return {}; } };
const savePriceMap = (m) => localStorage.setItem(PRICE_KEY, JSON.stringify(m));
const priceKey = ({ category, description, unit, grade, domestic }) =>
  [String(category||'').toUpperCase(), String(description||'').toUpperCase(), unit, String(grade||'').toUpperCase(), domestic ? 'DOM' : 'ANY'].join('|');
const getLastPrice = (p) => loadPriceMap()[priceKey(p)] || null;
const setLastPrice = (p, payload) => { const m = loadPriceMap(); m[priceKey(p)] = { ...payload, updatedAt: Date.now() }; savePriceMap(m); };

// Part index (local)
const PARTS_KEY = 'scm_parts_index_v1';
const loadPartsIndex = () => { try { return JSON.parse(localStorage.getItem(PARTS_KEY) || '[]'); } catch { return []; } };
const savePartsIndex = (arr) => localStorage.setItem(PARTS_KEY, JSON.stringify(arr));

/* ------------------------------- Static Options ------------------------------ */
const unitTypes = ['Per Foot', 'Each', 'Sq In'];
const processCatalog = ['Laser Cutting','Grinding','Drilling','Forming','Saw Cutting','Torch Cutting','Fitting','Welding','Sandblast','Paint','Beveling','Machining'];
const outsourcingCatalog = ['Machining','External Painting','Heat Treating','NDE','Other'];
const qualityOptions = ['None','ISO 9001','ASME','UL508a','AWS B31.1','AWS B31.3'];
const ndeOptions = ['RT 5%','RT 10%','RT 100%','PT','MT','UT','VT','Hydro 100%'];


/* ----------------------- Family aliases / normalization ---------------------- */
const FAMILY_ALIASES = {
  'plate': 'Plate',
  'diamond plate': 'Plate',
  'sheetmetal': 'Sheet',
  'sheet metal': 'Sheet',
  'sheet': 'Sheet',
  'pipe': 'Pipe',
  'tube': 'Tube',
  'tubing': 'Tube',
  'sq tube': 'HSS',
  'square tube': 'HSS',
  'square tubing': 'HSS',
  'rect tube': 'HSS',
  'rectangular tube': 'HSS',
  'hss': 'HSS',
  'beam': 'Beam',
  'w-beam': 'W-Beam',
  'wide flange': 'Beam',
  'w shape': 'Beam',
  'channel': 'Channel',
  'c-channel': 'Channel',
  'angle iron': 'Angle',
  'angle': 'Angle',
  'flatbar': 'FlatBar',
  'flat bar': 'FlatBar',
  'roundbar': 'RoundBar',
  'round bar': 'RoundBar',
  'round tube': 'Tube',
  'od tubing': 'Tube',
  'stainless': 'Stainless',
  'aluminum': 'Aluminum',
  'copper': 'Copper',
  'brass': 'Brass',
};
const normalizeFamily = (s) => {
  if (!s) return '';
  const k = String(s).trim().toLowerCase();
  return FAMILY_ALIASES[k] || FAMILY_ALIASES[k.replace(/\s+/g, ' ')] || s;
};

/* -------------------------- Grade options by family -------------------------- */
const gradeOptionsByFamily = {
  Pipe: [
    'SA-106 Gr B','SA-106 Gr C','SA-53 Gr B','A53 Gr B',
    'SA-333 Gr 6','SA-333 Gr 3','SA-252','SA-671','SA-672',
    'SA-335 P11','SA-335 P22',
    'SA-312 TP304','SA-312 TP304L','SA-312 TP316','SA-312 TP316L'
  ],
  Tube: [
    'A500 Gr B','A500 Gr C','A513 Type 1','A513 Type 2',
    'SA-312 TP304','SA-312 TP304L','SA-312 TP316','SA-312 TP316L'
  ],
  Plate: [
    'SA-516-70','SA-516-60','A36','A572-50','A588',
    'SA-387 Gr 11','SA-387 Gr 22',
    'SA-240 304','SA-240 304L','SA-240 316','SA-240 316L'
  ],
  Sheet: [
    'A36','A1011','A572-50',
    'SA-240 304','SA-240 304L','SA-240 316','SA-240 316L',
    '6061-T6','5052-H32'
  ],
  Beam: ['A992','A36','A572-50','A588'],
  Channel: ['A36','A572-50','A588'],
  Angle: ['A36','A572-50','A588'],
  FlatBar: ['A36','A572-50','1018','1045'],
  RoundBar: ['1018','1045','4140','303','304','304L','316','316L'],
  Stainless: ['303','304','304L','316','316L','410'],
  Aluminum: ['6061-T6','6063-T52','5052-H32'],
  Copper: ['C11000 (ETP)','C12200 (DHP)'],
  Brass: ['C36000','C46400'],
  'W-Beam': ['A992','A36'],
  'HSS': ['A500 Gr B','A500 Gr C'],
};

/* -------------------- Sheet gauge table (steel, inches) --------------------- */
const SHEET_GAUGE_IN = {
  24: 0.0239, 23: 0.0269, 22: 0.0299, 21: 0.0329, 20: 0.0359,
  19: 0.0418, 18: 0.0478, 17: 0.0538, 16: 0.0598, 15: 0.0673,
  14: 0.0747, 13: 0.0897, 12: 0.1046, 11: 0.1196, 10: 0.1345,
   9: 0.1495,  8: 0.1644
};

/* ----------------------------- Fraction helpers ----------------------------- */
const gcd = (a, b) => { a=Math.abs(a); b=Math.abs(b); while (b){ const t=b; b=a%b; a=t; } return a||1; };
const toFrac = (inches) => {
  const denom = 16;
  let totalSixteenths = Math.round(inches * denom);
  const whole = Math.floor(totalSixteenths / denom);
  let numr = totalSixteenths % denom;
  if (numr === 0) return `${whole}"`;
  const g = gcd(numr, denom);
  const numR = numr / g, denR = denom / g;
  return whole > 0 ? `${whole}-${numR}/${denR}"` : `${numR}/${denR}"`;
};

/* ----------------------- Generate Plate thickness list ---------------------- */
const genPlateThicknesses = () => {
  const list = [];
  for (let t = 0.125; t <= 1.000001; t += 1/16) list.push(Number(t.toFixed(6)));
  for (let t = 1.25; t <= 8.000001; t += 0.25) list.push(Number(t.toFixed(6)));
  const set = Array.from(new Set(list.map(x => Number(x.toFixed(6))))).sort((a,b)=>a-b);
  return set;
};

/* -------- Normalize materials to react-select options + keyword index -------- */
const toMatOption = (m) => {
  const familyRaw = m.type || m.category || m.family || '';
  const familyKey = normalizeFamily(familyRaw);
  const label = `${familyRaw || 'Material'} - ${m.size || m.description || ''}`.trim();
  const value = `${(m.type||m.category)||''}|${(m.size||m.description)||''}`;
  const kws = new Set([
    String(m.type||''), String(m.category||''), String(m.family||''),
    String(m.description||''), String(m.size||''), familyKey,
  ].filter(Boolean).map(x => String(x).toLowerCase()));
  const add = (...arr) => arr.forEach(t => t && kws.add(String(t).toLowerCase()));
  if (familyKey === 'W-Beam' || familyKey === 'Beam') add('beam','w-beam','wide flange','w shape');
  if (familyKey === 'HSS' || familyKey === 'Tube') add('tube','tubing','hss','rectangular tube','square tube','sq tube');
  if (familyKey === 'FlatBar') add('flat bar');
  if (familyKey === 'RoundBar') add('round bar');
  if (familyKey === 'Sheet') add('sheetmetal','sheet metal');
  return { label, value, familyKey, keywords: Array.from(kws), ...m };
};

// react-select custom filter
const filterOption = (option, rawInput) => {
  const input = String(rawInput || '').trim().toLowerCase();
  if (!input) return true;
  const { label, value, keywords = [] } = option?.data || {};
  const base = `${(label||'').toLowerCase()} ${(value||'').toLowerCase()}`;
  if (base.includes(input)) return true;
  return keywords.some(k => k.includes(input));
};

/* -------------------------------- Math helpers ------------------------------- */
const num = (v) => { if (v === '' || v === null || v === undefined) return 0; const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

/* ------------------------------- Grade helpers ------------------------------ */
export const displayGrade = g => g?.startsWith('__CUSTOM__:') ? g.split(':',2)[1].trim() : g || '';
export const serializeGrade = g => g?.replace(/^__CUSTOM__:/, '').trim();

/* --------------------------- Client-side catalogs --------------------------- */
const DENSITY_STEEL = 0.283; // lb/in^3

const buildPlateOptions = () => {
  const thick = genPlateThicknesses();
  return thick.map(t => toMatOption({
    type: 'Plate',
    size: toFrac(t),
    description: `Plate ${toFrac(t)}`,
    thicknessIn: t,
    density: DENSITY_STEEL,
    weight_per_sqin: Number((t * DENSITY_STEEL).toFixed(6))
  }));
};

const buildSheetOptions = () => {
  const list = [];
  Object.keys(SHEET_GAUGE_IN).forEach(g => {
    const t = SHEET_GAUGE_IN[g];
    list.push(toMatOption({
      type: 'Sheet',
      size: `${g} GA (${t.toFixed(4)}")`,
      description: `Sheet ${g} GA`,
      thicknessIn: t,
      density: DENSITY_STEEL,
      weight_per_sqin: Number((t * DENSITY_STEEL).toFixed(6))
    }));
  });
  return list;
};

const mergeUniqueByValue = (a, b) => {
  const seen = new Set(a.map(x => x.value));
  const extras = b.filter(x => !seen.has(x.value));
  return [...a, ...extras];
};

/* -------------------------- Geometry parsing helpers -------------------------- */
// Parse tokens like 1/4, 0.25, 2", 2.5 in  → inches (number)
const parseInches = (tok) => {
  if (!tok) return NaN;
  const t = String(tok).toLowerCase().replace(/["in]+/g,'').trim();
  if (/^\d+\s*\/\s*\d+$/.test(t)) {
    const [a,b] = t.split('/').map(Number);
    return b ? a/b : NaN;
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
};

// Extract up to 4 numeric dims from size/description, splitting on x, ×, spaces, etc.
const extractDims = (text) => {
  if (!text) return [];
  let s = String(text).toLowerCase()
    .replace(/ga\b.*$/,'')
    .replace(/sch\s*\d+/,'')
    .replace(/[^\dx×\s./-]+/g,' ')
    .replace(/\s+/g,' ')
    .trim();
  const parts = s.split(/x|×/).map(p=>p.trim()).filter(Boolean);
  const dims = [];
  parts.forEach(p=>{
    const tokens = p.split(/[\s-]+/).filter(Boolean);
    const val = tokens.reduce((sum, tk)=> sum + (parseInches(tk)||0), 0);
    if (val>0) dims.push(val);
  });
  return dims.slice(0,4);
};

// Compute lb/ft from cross-section area (in^2) * 12 * density
const wpfFromArea = (areaIn2, density=DENSITY_STEEL) => {
  if (!areaIn2 || areaIn2<=0) return 0;
  return Number((areaIn2 * 12 * density).toFixed(4));
};

/* -------------------------- Weight inference -------------------------- */
/**
 * Attempts to infer weight_per_ft for common shapes if the catalog entry lacks it.
 * Supports:
 *  - FlatBar: width x thickness
 *  - RoundBar: diameter
 *  - Angle: leg1 x leg2 x thickness (approx area = t*(leg1+leg2-t))
 *  - HSS (square/rect tube): b x h x t  (area = b*h - (b-2t)*(h-2t))
 *  - Tube (round tube): OD x Wall  (area = π/4*(OD^2 - (OD-2t)^2))
 */
const inferWeightPerFt = (opt) => {
  const fam = normalizeFamily(opt.type || opt.family || opt.category || '');
  const sizeText = opt.size || opt.description || '';
  const dims = extractDims(sizeText); // inches

  if (!dims.length) return 0;

  if (fam === 'FlatBar' && dims.length >= 2) {
    const [w, t] = dims;
    return wpfFromArea(w * t);
  }
  if (fam === 'RoundBar' && dims.length >= 1) {
    const d = dims[0];
    const area = Math.PI * (d*d) / 4;
    return wpfFromArea(area);
  }
  if (fam === 'Angle' && dims.length >= 3) {
    const [a, b, t] = dims;
    const area = t * (a + b - t); // approximation (no fillets)
    return wpfFromArea(area);
  }
  if (fam === 'HSS' && dims.length >= 3) {
    const [b, h, t] = dims;
    const area = (b * h) - ((b - 2*t) * (h - 2*t));
    if (area > 0) return wpfFromArea(area);
  }
  if (fam === 'Tube' && dims.length >= 2) {
    const [od, wall] = dims;
    const id = Math.max(od - 2*wall, 0);
    const area = (Math.PI/4) * (od*od - id*id);
    if (area > 0) return wpfFromArea(area);
  }
  return 0;
};

// Ensure weight_per_ft / weight_per_sqin where we can infer them.
const augmentOption = (o) => {
  const out = { ...o };
  if (!num(out.weight_per_ft)) {
    const guessed = inferWeightPerFt(out);
    if (guessed > 0) out.weight_per_ft = guessed;
  }
  if (!num(out.weight_per_sqin) && num(out.thicknessIn) && num(out.density)) {
    out.weight_per_sqin = Number((num(out.thicknessIn) * num(out.density)).toFixed(6));
  }
  return out;
};

/* ================================== App ================================== */
export default function QuoteForm() {
  const location = useLocation();
  const pre = location?.state || {};
  const [step, setStep] = useState(1);
  const [uploads, setUploads] = useState([]); // {originalName, fileName}
const removeUpload = (fileName) => {
  setUploads(prev => prev.filter(u => u.fileName !== fileName));
};
  const today = new Date().toISOString().slice(0,10);
  const [meta, setMeta] = useState({
    quoteNo: pre.quoteNo || '',
    date: pre.date || today,
    customerName: pre.customerName || '',
    estimatedBy: pre.estimatedBy || '',
    requestor: pre.requestor || '',
    partNumber: pre.partNumber || '',
    revision: pre.revision || '',
    description: pre.projectDescription || pre.description || '',
    quality: pre.quality || '',
    requireSA: pre.requireSA || false,
    domesticOnly: pre.domesticOnly || false,
    originRestriction: pre.originRestriction || '',
    receivingLaborHours: pre.receivingLaborHours || '',
    receivingRate: pre.receivingRate || '75',
    notes:
      pre.notes ||
      'Quote subject to review of customer PO and drawings. Lead time is an estimate and may vary after receipt of order & materials. ' +
      'NDE/testing per selection. Warranty per standard terms. This quote generated with AI-assisted manufacturing transparency.',
    paymentTerms: pre.paymentTerms || '',
    commissionPct: pre.commissionPct || '',
    breakInFee: pre.breakInFee || '',
    freightMethod: pre.freightMethod || '',
    freightAmount: pre.freightAmount || '',
    salesTaxPct: pre.salesTaxPct || '',
  });

  // Persist “SA” checkbox if ASME chosen
  useEffect(() => { if (/ASME/i.test(meta.quality) && !meta.requireSA) setMeta(m => ({ ...m, requireSA: true })); }, [meta.quality, meta.requireSA]);

  /* ------------------------------ PARTS memory ------------------------------ */
  const [partsIndex, setPartsIndex] = useState([]);
  useEffect(() => { setPartsIndex(loadPartsIndex()); }, []);
  const onChangePartNumber = (value) => {
    setMeta((m) => {
      const next = { ...m, partNumber: value };
      const found = partsIndex.find(p => (p.partNumber || '').toUpperCase() === String(value).toUpperCase());
      if (found) {
        if (!next.revision) next.revision = found.revision || '';
        if (!next.description) next.description = found.title || next.description;
      }
      return next;
    });
  };
  const rememberPart = () => {
    const pn = (meta.partNumber || '').trim(); if (!pn) return;
    const rev = (meta.revision || '').trim(); const title = (meta.description || '').trim();
    setPartsIndex(prev => {
      const copy = [...prev];
      const i = copy.findIndex(p => (p.partNumber || '').toUpperCase() === pn.toUpperCase());
      const entry = { partNumber: pn, revision: rev, title };
      if (i >= 0) copy[i] = { ...copy[i], ...entry }; else copy.unshift(entry);
      savePartsIndex(copy); return copy;
    });
  };

  /* ------------------------------ MATERIALS (catalog) ------------------------------ */
  const [materialOptions, setMaterialOptions] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/materials`);
        const rows = await res.json();
        let base = (rows || []).map(toMatOption).map(augmentOption);
        base = mergeUniqueByValue(base, buildPlateOptions());
        base = mergeUniqueByValue(base, buildSheetOptions());
        base = base.map(augmentOption);
        setMaterialOptions(base);
      } catch {
        let base = [];
        base = mergeUniqueByValue(base, buildPlateOptions());
        base = mergeUniqueByValue(base, buildSheetOptions());
        base = base.map(augmentOption);
        setMaterialOptions(base);
      }
    })();
  }, []);

  /* --------------------------------- ROWS (BOM) --------------------------------- */
  const emptyRow = {
    itemNo: '',
    material: null,
    unitType: 'Per Foot',
    grade: '',
    lengthFt: '',
    qty: '',
    lengthIn: '',
    widthIn: '',
    heightIn: '',
    pricePerFt: '',
    pricePerLb: '',
    priceEach: '',
    totalWeight: '0.00',
    materialCost: '0.00',
    _costEach: '0.00',
    _outCost: 0,
    _procCost: 0,
    processes: [],
    outsourcing: [],
    padConventional: false,
    _uiOpen: true,
    _uiMarkupPct: '',
  };
  const [rows, setRows] = useState(
    pre.bom && Array.isArray(pre.bom)
      ? pre.bom.map(r => ({ _uiOpen: true, _uiMarkupPct: r._uiMarkupPct || '', itemNo: r.itemNo || '', ...r }))
      : [ { ...emptyRow } ]
  );

  /* ----------------------------- NDE suggestions ----------------------------- */
  const [nde, setNde] = useState([]);
  const [ndeSuggested, setNdeSuggested] = useState([]);
  useEffect(() => {
    const usesPipe = rows.some(r => {
      const fam = normalizeFamily(r.material?.type || r.material?.family || r.material?.category || '');
      return String(fam).toLowerCase().includes('pipe');
    });
    const suggest = [];
    if (/ASME|B31\./i.test(meta.quality) && usesPipe) {
      if (!nde.includes('RT 5%')) suggest.push('RT 5%');
      if (!nde.includes('Hydro 100%')) suggest.push('Hydro 100%');
    }
    setNdeSuggested(suggest);
  }, [meta.quality, rows, nde]);

  const setRow = (i, patch, recalc = true) => {
    setRows((prev) => {
      const next = prev.map((r, idx) => idx === i ? { ...r, ...patch } : r);
      return recalc ? recalcAt(next, i) : next;
    });
  };

  const addRow = () => setRows((r) => [...r, { ...emptyRow, itemNo: String((r.length||0)+1) }]);
  const deleteRow = (i) => setRows(r => r.filter((_, idx) => idx !== i));

  const addProcess = (i) => { const p = { name: '', hours: '', rate: '', cost: '0.00' }; setRow(i, { processes: [...rows[i].processes, p] }); };
  const setProcess = (i, pIdx, patch) => { const list = rows[i].processes.map((p, j) => (j === pIdx ? { ...p, ...patch } : p)); setRow(i, { processes: list }); };
  const delProcess = (i, pIdx) => { const list = rows[i].processes.filter((_, j) => j !== pIdx); setRow(i, { processes: list }); };

  const addOut = (i) => { const o = { type: '', cost: '', notes: '' }; setRow(i, { outsourcing: [...rows[i].outsourcing, o] }, true); };
  const setOut = (i, oIdx, patch) => { const list = rows[i].outsourcing.map((o, j) => (j === oIdx ? { ...o, ...patch } : o)); setRow(i, { outsourcing: list }); };
  const delOut = (i, oIdx) => { const list = rows[i].outsourcing.filter((_, j) => j !== oIdx); setRow(i, { outsourcing: list }); };

  /* -------------------------- RECALC (keeps your math) ------------------------- */
  const recalcAt = (list, idx) => {
    const r = { ...list[idx] };

    const m = r.material;
    const unit = r.unitType;

    const qty = Math.max(0, num(r.qty));
    const lenFt = num(r.lengthFt);
    const wpf = num(m?.weight_per_ft);

    const wpsqi = (num(m?.weight_per_sqin) || (m?.thicknessIn && m?.density ? Number((m.thicknessIn * m.density).toFixed(6)) : 0));

    const priceFt = num(r.pricePerFt);
    const priceLb = (num(m?.price_per_lb) || num(r.pricePerLb));
    const priceEa = num(r.priceEach);

    let totalWeight = 0;
    let costEach = 0;
    let costTotal = 0;

    if (unit === 'Per Foot') {
      const wtEach = lenFt * (wpf || 0);
      totalWeight = wtEach * qty;
      costEach = (priceFt > 0) ? (lenFt * priceFt) : (wtEach * priceLb);
      costTotal = costEach * qty;
    } else if (unit === 'Each') {
      totalWeight = 0;
      costEach = priceEa;
      costTotal = qty * priceEa;
    } else if (unit === 'Sq In') {
      const L = num(r.lengthIn), W = num(r.widthIn);
      const areaActual = L * W;
      const areaConventional = (L + 1) * (W + 1);
      const areaUsed = r.padConventional ? areaConventional : areaActual;

      const wtEachUsed = areaUsed * (wpsqi || 0);
      totalWeight = wtEachUsed * qty;
      costEach = wtEachUsed * priceLb;
      costTotal = costEach * qty;
    }

    // processes cost
    let proc = 0;
    const procs = (r.processes || []).map(p => {
      const h = num(p.hours), rate = num(p.rate);
      const c = h * rate; proc += c;
      return { ...p, cost: c.toFixed(2) };
    });

    // outsourcing cost
    let outsource = 0; (r.outsourcing || []).forEach(o => outsource += num(o.cost));

    const updated = {
      ...r,
      processes: procs,
      totalWeight: totalWeight.toFixed(2),
      _procCost: proc,
      _outCost: outsource,
      _costEach: costEach.toFixed(2),
      materialCost: costTotal.toFixed(2),
    };

    const next = [...list];
    next[idx] = updated;

    // remember last price
    if (m) {
      const payload = {};
      if (unit === 'Per Foot' && priceFt) payload.pricePerFt = priceFt;
      if (priceLb) payload.pricePerLb = priceLb;
      if (unit === 'Each' && priceEa) payload.priceEach = priceEa;
      if (Object.keys(payload).length) {
        setLastPrice({
          category: m.type || m.category,
          description: m.size || m.description,
          unit,
          grade: serializeGrade(r.grade) || '',
          domestic: meta.domesticOnly
        }, payload);
      }
    }
    return next;
  };

  // material select
  const onMaterialSelect = (i, selected) => {
    const selectedAug = augmentOption(selected);
    const unitCurrent = rows[i].unitType;
    const famKey = normalizeFamily(selectedAug?.type || selectedAug?.category || selectedAug?.family || '');
    const patch = { material: selectedAug };
    if ((famKey === 'Plate' || famKey === 'Sheet') && unitCurrent !== 'Sq In') {
      patch.unitType = 'Sq In';
      patch.lengthIn = '';
      patch.widthIn = '';
    }

    const last = getLastPrice({
      category: selectedAug?.type || selectedAug?.category,
      description: selectedAug?.size || selectedAug?.description,
      unit: patch.unitType || unitCurrent,
      grade: serializeGrade(rows[i].grade) || '',
      domestic: meta.domesticOnly
    }) || {};
    if ((patch.unitType || unitCurrent) === 'Per Foot' && last.pricePerFt) patch.pricePerFt = String(last.pricePerFt);
    if (last.pricePerLb) patch.pricePerLb = String(last.pricePerLb);
    if ((patch.unitType || unitCurrent) === 'Each' && last.priceEach) patch.priceEach = String(last.priceEach);

    setRow(i, patch, true);
  };

  /* -------------------------- Totals (include MU/fees) -------------------------- */
  const totals = useMemo(() => {
    const materialBase = rows.reduce((s, r) => s + num(r.materialCost), 0);
    const materialWithMarkup = rows.reduce((s, r) => {
      const mu = num(r._uiMarkupPct) / 100;
      return s + (num(r.materialCost) * (1 + mu));
    }, 0);

    const totalWeight = rows.reduce((s, r) => s + num(r.totalWeight), 0);
    const processes = rows.reduce((s, r) => s + num(r._procCost), 0);
    const outsource = rows.reduce((s, r) => s + num(r._outCost), 0);
    const receiving = num(meta.receivingLaborHours) * num(meta.receivingRate);

    const subtotalAfterMarkup = materialWithMarkup + processes + outsource + receiving;

    const breakIn = num(meta.breakInFee);
    const freight = num(meta.freightAmount);
    const commission = subtotalAfterMarkup * (num(meta.commissionPct) / 100);

    const subtotalBeforeTax = subtotalAfterMarkup + breakIn + freight + commission;
    const salesTax = subtotalBeforeTax * (num(meta.salesTaxPct) / 100);

    const grand = subtotalBeforeTax + salesTax;
    const pricePerLb = totalWeight > 0 ? grand / totalWeight : 0;

    return {
      materialBase,
      materialWithMarkup,
      processes,
      outsource,
      receiving,
      breakIn,
      freight,
      commission,
      salesTax,
      grand,
      totalWeight,
      pricePerLb
    };
  }, [rows, meta.receivingLaborHours, meta.receivingRate, meta.breakInFee, meta.freightAmount, meta.commissionPct, meta.salesTaxPct]);

  /* ------------------------------- UI STYLES ------------------------------- */
  const container = { padding: '20px', maxWidth: '1200px', margin: 'auto', fontFamily: 'Arial, sans-serif' };
  const card = { border: '1px solid #e5e7eb', borderRadius: 10, background: '#fff', padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' };
  const sectionTitle = { fontSize: 18, fontWeight: 700, marginBottom: 10 };
  const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
  const grid3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 };
  const input = { display: 'block', padding: '8px 10px', width: '100%', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff' };
  const label = { fontSize: 12, fontWeight: 700, color: '#374151', margin: '8px 0 4px' };
  const button = { padding: '8px 14px', fontWeight: 700, cursor: 'pointer', borderRadius: 8, border: '1px solid #d1d5db', background: '#f9fafb' };
  const primary = { ...button, background: '#2563eb', borderColor: '#2563eb', color: '#fff' };
  const subtle = { fontSize: 12, color: '#6b7280' };

  const rowShell = { border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', background: '#fff' };
  const rowHeader = { display: 'grid', gridTemplateColumns: '0.5fr 1.4fr 1.1fr 0.9fr auto', gap: 8, alignItems: 'center', padding: 12, background: '#f9fafb', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 1 };
  const rowHeaderRight = { display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' };
  const rowTotals = { display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, padding: '10px 12px', background: '#fcfcfd', borderTop: '1px dashed #e5e7eb', color: '#374151' };

  const stickyTotals = { position: 'sticky', bottom: 0, background: '#ffffffcc', backdropFilter: 'blur(3px)', borderTop: '1px solid #e5e7eb', padding: 12, marginTop: 14, borderRadius: 10, boxShadow: '0 -6px 10px rgba(0,0,0,0.03)' };

  /* --------------------------------- Render --------------------------------- */
  return (
    <div style={container}>
      {/* ============================== STEP 1 ============================== */}
      {step === 1 && (
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', marginBottom: 6 }}>
            <h2 style={sectionTitle}>Step 1 — Quote Overview</h2>
            <div style={{ display: 'flex', gap: 8 }}>
<UploadButton onUploaded={(res) => {
  // Normalize single/legacy response into array
  const list = Array.isArray(res) ? res : (res ? [res] : []);
  if (!list.length) return;
  const mapped = list.map(r => ({ originalName: r.originalName || r.originalname || r.name || r.originalName, fileName: r.fileName || r.file_name || r.name || r.filename }));
  setUploads(prev => [...mapped, ...prev]);
}} />    {/* Uploaded files list */}
{uploads.length > 0 && (
  <div style={{ marginTop: 12 }}>
    <div style={{ fontWeight: 700, marginBottom: 6 }}>Uploaded:</div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {uploads.map((u) => (
        <div
          key={u.fileName}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '6px 10px'
          }}
        >
          <a
            href={`http://localhost:4000/uploads/${u.fileName}`}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none', color: '#111' }}
            title="Open uploaded file"
          >
            {u.originalName}
          </a>
          <button
            type="button"
            onClick={() => removeUpload(u.fileName)}
            title="Remove from this quote"
            style={{ border: 'none', background: 'transparent', color: '#b00020', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  </div>
)}         <button style={button} title="Analyze drawings and auto-build BOM — placeholder">AI Build BOM</button>
            </div>
          </div>

          <div style={grid2}>
            <div>
              <label style={label}>Quote Number</label>
              <input style={input} value={meta.quoteNo} onChange={e=>setMeta(m=>({...m,quoteNo:e.target.value}))} />
            </div>
            <div>
              <label style={label}>Date</label>
              <input style={input} type="date" value={meta.date} onChange={e=>setMeta(m=>({...m,date:e.target.value}))} />
            </div>

            <div>
              <label style={label}>Customer Name</label>
              <input style={input} value={meta.customerName} onChange={e=>setMeta(m=>({...m,customerName:e.target.value}))} />
            </div>
            <div>
              <label style={label}>Requestor</label>
              <input style={input} value={meta.requestor} onChange={e=>setMeta(m=>({...m,requestor:e.target.value}))} />
            </div>

            <div>
              <label style={label}>Estimated By</label>
              <input style={input} value={meta.estimatedBy} onChange={e=>setMeta(m=>({...m,estimatedBy:e.target.value}))} />
            </div>
            <div>
              <label style={label}>Payment Terms</label>
              <div style={{ display:'flex', gap:8 }}>
                <select style={{ ...input, flex: 1 }} value={meta.paymentTerms} onChange={e=>setMeta(m=>({...m,paymentTerms:e.target.value}))}>
                  <option value="">-- Select --</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                  <option value="50% Down / Net 30">50% Down / Net 30</option>
                </select>
                <button style={button} title="Add a custom payment term (placeholder)">+ Add</button>
              </div>
            </div>

            <div>
              <label style={label}>Part / Drawing Number</label>
              <input
                style={input}
                list="partNos"
                value={meta.partNumber}
                onChange={e=>onChangePartNumber(e.target.value)}
                onBlur={rememberPart}
              />
              <datalist id="partNos">
                {partsIndex.map(p => (<option key={p.partNumber} value={p.partNumber} />))}
              </datalist>
            </div>
            <div>
              <label style={label}>Revision</label>
              <input style={input} value={meta.revision} onChange={e=>setMeta(m=>({...m,revision:e.target.value}))} onBlur={rememberPart} />
            </div>

            <div style={{ gridColumn: '1/-1' }}>
              <label style={label}>Project Description</label>
              <input style={input} value={meta.description} onChange={e=>setMeta(m=>({...m,description:e.target.value}))} onBlur={rememberPart} />
            </div>

            <div>
              <label style={label}>Quality Preference</label>
              <select style={input} value={meta.quality} onChange={e=>setMeta(m=>({...m,quality:e.target.value}))}>
                <option value="">-- Select --</option>
                {qualityOptions.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
              <div style={{ marginTop: 6, display:'flex', gap:14, alignItems:'center' }}>
                <label style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:13 }}><input type="checkbox" checked={meta.requireSA} onChange={e=>setMeta(m=>({...m,requireSA:e.target.checked}))} />Require SA</label>
                <label style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:13 }}><input type="checkbox" checked={meta.domesticOnly} onChange={e=>setMeta(m=>({...m,domesticOnly:e.target.checked}))} />Domestic Only</label>
              </div>
            </div>
            <div>
              <label style={label}>Origin Restrictions (optional)</label>
              <input style={input} placeholder="e.g., No imports from X / DFARS compliant" value={meta.originRestriction} onChange={e=>setMeta(m=>({...m,originRestriction:e.target.value}))} />
            </div>
          </div>

          <div style={{ marginTop: 14, display:'flex', gap:8, justifyContent:'flex-end' }}>
            <button style={primary} onClick={()=>{ rememberPart(); setStep(2); }}>Next</button>
          </div>
        </div>
      )}

      {/* ============================== STEP 2 ============================== */}
      {step === 2 && (
        <div style={{ ...card, display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <h2 style={sectionTitle}>Step 2 — Bill of Materials & Operations</h2>
            <div style={{ display:'flex', gap:8 }}>
              <button style={button} title="Search with embedded AI (placeholder)">AI Material Search</button>
              <button style={button} onClick={addRow}>+ Add Item</button>
            </div>
          </div>

          {(ndeSuggested.length>0) && (
            <div style={{ background:'#eef7ff', border:'1px solid #b6ddff', padding:10, borderRadius:8 }}>
              <strong>Suggestion:</strong> Based on Quality and materials, consider {ndeSuggested.join(' + ')}.
              <div style={{ marginTop: 6, display:'flex', gap:8, flexWrap:'wrap' }}>
                {ndeSuggested.map(s => (
                  <button key={s} style={{ ...button, background:'#3b82f6', color:'#fff', borderColor:'#3b82f6', padding:'6px 10px' }} onClick={()=>setNde(arr=>arr.includes(s)?arr:[...arr,s])}>
                    Add {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ----------------------------- BOM ROWS ----------------------------- */}
          {rows.map((r, i) => {
            const famRaw = r.material?.type || r.material?.family || r.material?.category || '';
            const famKey = normalizeFamily(famRaw);
            const gradeList = gradeOptionsByFamily[famKey] || [];

            const m = r.material;
            const wpsqi = (num(m?.weight_per_sqin) || (m?.thicknessIn && m?.density ? Number((m.thicknessIn * m.density).toFixed(6)) : 0));
            const priceLbView = num(m?.price_per_lb) || num(r.pricePerLb);

            const L = num(r.lengthIn), W = num(r.widthIn);
            const areaConventional = (L + 1) * (W + 1);
            const qtyUsed = Math.max(1, num(r.qty || 1));
            const quotedWeight = areaConventional * (wpsqi || 0) * qtyUsed;
            const quotedMaterial = quotedWeight * (priceLbView || 0);

            const uiOpen = r._uiOpen ?? true;
            const muPct = num(r._uiMarkupPct);
            const lineTotalWithMU = num(r.materialCost) * (1 + muPct/100);

            return (
              <div key={i} style={rowShell}>
                {/* Row header (sticky) */}
                <div style={rowHeader}>
                  {/* Item # */}
                  <div>
                    <div style={label}>Item #</div>
                    <input style={input} value={r.itemNo} onChange={e=>setRow(i,{ itemNo: e.target.value }, false)} placeholder={`${i+1}`} />
                  </div>

                  {/* Material + AI */}
                  <div>
                    <div style={label}>Material</div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <div style={{ flex: 1 }}>
                        <Select
                          options={materialOptions}
                          value={r.material}
                          onChange={(sel)=>onMaterialSelect(i, sel)}
                          isSearchable
                          filterOption={filterOption}
                        />
                      </div>
                      <button style={button} title="AI material search for bearings/hardware/etc. (placeholder)">AI</button>
                    </div>
                  </div>

                  {/* Grade */}
                  <div>
                    <div style={label}>Grade</div>
                    <select
                      style={input}
                      value={r.grade?.startsWith('__CUSTOM__:') ? '__CUSTOM__' : r.grade}
                      onChange={e=>{
                        const v=e.target.value;
                        if (v === '__CUSTOM__') {
                          const existing = r.grade?.startsWith('__CUSTOM__:') ? r.grade.split(':',2)[1] : '';
                          setRow(i,{ grade:`__CUSTOM__:${existing}` }, false);
                        } else {
                          setRow(i,{ grade:v }, true);
                        }
                      }}
                    >
                      <option value="">-- Select grade --</option>
                      {gradeList.map(g => <option key={g} value={g}>{g}</option>)}
                      <option value="__CUSTOM__">Other (type manually)</option>
                    </select>

                    {r.grade?.startsWith('__CUSTOM__:') && (
                      <input
                        style={{...input, marginTop:6}}
                        placeholder="Type exact grade/spec (e.g., SA-105N, 2205, etc.)"
                        value={r.grade.split(':',2)[1]}
                        onChange={e=>setRow(i,{ grade:`__CUSTOM__:${e.target.value}` }, false)}
                      />
                    )}

                    {(meta.quality.toUpperCase().includes('ASME')
                      && r.grade
                      && !r.grade.replace('__CUSTOM__:', '').toUpperCase().startsWith('SA-')) && (
                      <div style={{ color:'#b00020', marginTop:6, fontSize:12 }}>
                        ASME selected: Grade should be “SA-*”. Please confirm or adjust.
                      </div>
                    )}
                  </div>

                  {/* Unit + Markup */}
                  <div>
                    <div style={label}>Unit</div>
                    <select style={input} value={r.unitType} onChange={e=>setRow(i,{ unitType:e.target.value })}>
                      {unitTypes.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <div style={{ marginTop: 8 }}>
                      <div style={label}>Markup %</div>
                      <input style={input} value={r._uiMarkupPct} onChange={e=>setRow(i, { _uiMarkupPct: e.target.value }, false)} placeholder="e.g., 20" />
                    </div>
                  </div>

                  {/* Always-visible mini totals */}
                  <div style={rowHeaderRight}>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:12, color:'#6b7280' }}>Cost Each (base)</div>
                      <div style={{ fontWeight:800 }}>${r._costEach}</div>
                      <div style={{ fontSize:12, color:'#6b7280' }}>Line Total (w/ MU)</div>
                      <div style={{ fontWeight:800 }}>${lineTotalWithMU.toFixed(2)}</div>
                    </div>
                    <button
                      style={button}
                      onClick={()=>setRow(i, { _uiOpen: !uiOpen }, false)}
                      title={uiOpen ? 'Hide details' : 'Show details'}
                    >
                      {uiOpen ? 'Hide' : 'Details'}
                    </button>
                    <button style={{ ...button, borderColor:'#ef4444', color:'#ef4444' }} onClick={()=>deleteRow(i)}>Delete</button>
                  </div>
                </div>

                {/* Row details (collapsible) */}
                {uiOpen && (
                  <div style={{ padding: 12 }}>
                    {/* Unit-specific bodies */}
                    {r.unitType === 'Per Foot' && (
                      <div style={grid3}>
                        <div>
                          <div style={label}>Length (ft)</div>
                          <input style={input} value={r.lengthFt} onChange={e=>setRow(i,{ lengthFt:e.target.value })} />
                        </div>
                        <div>
                          <div style={label}>Qty</div>
                          <input style={input} value={r.qty} onChange={e=>setRow(i,{ qty:e.target.value })} />
                        </div>
                        <div />
                        <div>
                          <div style={label}>Price per Ft ($/ft)</div>
                          <input style={input} value={r.pricePerFt} onChange={e=>setRow(i,{ pricePerFt:e.target.value })} />
                        </div>
                        <div>
                          <div style={label}>Price per Lb ($/lb) (fallback)</div>
                          <input style={input} value={r.pricePerLb} onChange={e=>setRow(i,{ pricePerLb:e.target.value })} />
                        </div>
                        <div />
                      </div>
                    )}

                    {r.unitType === 'Each' && (
                      <div style={grid3}>
                        <div>
                          <div style={label}>Qty</div>
                          <input style={input} value={r.qty} onChange={e=>setRow(i,{ qty:e.target.value })} />
                        </div>
                        <div>
                          <div style={label}>Price Each ($/ea)</div>
                          <input style={input} value={r.priceEach} onChange={e=>setRow(i,{ priceEach:e.target.value })} />
                        </div>
                        <div />
                      </div>
                    )}

                    {r.unitType === 'Sq In' && (
                      <>
                        <div style={grid3}>
                          <div>
                            <div style={label}>Length (in)</div>
                            <input style={input} value={r.lengthIn} onChange={e=>setRow(i,{ lengthIn:e.target.value })} />
                          </div>
                          <div>
                            <div style={label}>Width (in)</div>
                            <input style={input} value={r.widthIn} onChange={e=>setRow(i,{ widthIn:e.target.value })} />
                          </div>
                          <div>
                            <div style={label}>Qty</div>
                            <input style={input} value={r.qty} onChange={e=>setRow(i,{ qty:e.target.value })} />
                          </div>
                        </div>

                        <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:8 }}>
                          <label style={{ fontSize: 13, display:'inline-flex', alignItems:'center', gap:8 }}>
                            <input
                              type="checkbox"
                              checked={!!r.padConventional}
                              onChange={e=>setRow(i,{ padConventional: e.target.checked }, true)}
                            />
                            <span>Conventional Plate Cutting Price</span>
                          </label>
                          <span style={subtle}>(uses (L + 1") × (W + 1") for weight & pricing)</span>
                        </div>

                        {r.padConventional && (
                          <div style={{ background:'#f5f7ff', border:'1px dashed #9db2ff', padding:10, borderRadius:8, marginTop:6 }}>
                            <div>
                              Pricing Area: ({num(r.lengthIn)} + 1) × ({num(r.widthIn)} + 1) × {Math.max(1,num(r.qty||1))} = <strong>{((num(r.lengthIn)+1)*(num(r.widthIn)+1)*Math.max(1,num(r.qty||1))).toFixed(2)} in²</strong>
                            </div>
                            <div>
                              Pricing Weight: {((num(r.lengthIn)+1)*(num(r.widthIn)+1)).toFixed(2)} × {(wpsqi||0).toFixed(5)} × {Math.max(1,num(r.qty||1))} = <strong>{quotedWeight.toFixed(2)} lb</strong>
                              {!!priceLbView && <> &nbsp; | &nbsp; Est. Material @ ${priceLbView.toFixed(2)}/lb = <strong>${quotedMaterial.toFixed(2)}</strong></>}
                            </div>
                          </div>
                        )}

                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:8 }}>
                          <div>
                            <div style={label}>Price per Lb ($/lb)</div>
                            <input style={input} value={r.pricePerLb} onChange={e=>setRow(i,{ pricePerLb:e.target.value })} />
                          </div>
                          <div />
                        </div>
                      </>
                    )}

                    {/* Totals strip under details */}
                    <div style={rowTotals}>
                      <div><strong>Total Weight:</strong> {r.totalWeight} lb</div>
                      <div><strong>Cost Each (base):</strong> ${r._costEach}</div>
                      <div><strong>Line Total (base):</strong> ${r.materialCost}</div>
                      <div><strong>Line Total (w/ MU):</strong> ${lineTotalWithMU.toFixed(2)}</div>
                      {r.unitType === 'Sq In' && r.padConventional && <div style={{ color:'#2946d1' }}>(Conventional basis)</div>}
                    </div>

                    {/* Processes */}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontWeight: 700, margin: '12px 0 6px' }}>Processes</div>
                      {(r.processes || []).map((p, pIdx) => (
                        <div key={pIdx} style={{display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr 0.6fr auto', gap:8, alignItems:'end', marginBottom:6}}>
                          <div>
                            <div style={label}>Process</div>
                            <select style={input} value={p.name} onChange={e=>setProcess(i, pIdx, { name: e.target.value })}>
                              <option value="">-- Select --</option>
                              {processCatalog.map(x => <option key={x} value={x}>{x}</option>)}
                            </select>
                          </div>
                          <div>
                            <div style={label}>Hours</div>
                            <input style={input} value={p.hours} onChange={e=>setProcess(i, pIdx, { hours: e.target.value })}/>
                          </div>
                          <div>
                            <div style={label}>Rate</div>
                            <input style={input} value={p.rate} onChange={e=>setProcess(i, pIdx, { rate: e.target.value })}/>
                          </div>
                          <div>
                            <div style={label}>Cost</div>
                            <input style={{...input, background:'#f3f4f6'}} value={p.cost} readOnly />
                          </div>
                          <div>
                            <button style={{ ...button, borderColor:'#ef4444', color:'#ef4444' }} onClick={()=>delProcess(i, pIdx)}>Delete</button>
                          </div>
                        </div>
                      ))}
                      <button style={{ ...button, background:'#111827', color:'#fff', borderColor:'#111827' }} onClick={()=>addProcess(i)}>+ Add Process</button>
                    </div>

                    {/* Outsourcing */}
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontWeight: 700, margin: '12px 0 6px' }}>Outsourced Services</div>
                      {(r.outsourcing || []).map((o, oIdx) => (
                        <div key={oIdx} style={{display:'grid', gridTemplateColumns:'1fr 1fr 2fr 0.6fr auto', gap:8, alignItems:'end', marginBottom:6}}>
                          <div>
                            <div style={label}>Type</div>
                            <input style={input} value={o.type} onChange={e=>setOut(i, oIdx, { type: e.target.value })} list={`outsourcing-types`} placeholder="e.g., Machining" />
                            <datalist id="outsourcing-types">
                              {outsourcingCatalog.map(x => <option key={x} value={x} />)}
                            </datalist>
                          </div>
                          <div>
                            <div style={label}>Cost</div>
                            <input style={input} value={o.cost} onChange={e=>setOut(i, oIdx, { cost: e.target.value })}/>
                          </div>
                          <div>
                            <div style={label}>Notes</div>
                            <input style={input} value={o.notes} onChange={e=>setOut(i, oIdx, { notes: e.target.value })}/>
                          </div>
                          <div />
                          <div>
                            <button style={{ ...button, borderColor:'#ef4444', color:'#ef4444' }} onClick={()=>delOut(i, oIdx)}>Delete</button>
                          </div>
                        </div>
                      ))}
                      <button style={{ ...button, background:'#6b7280', color:'#fff', borderColor:'#6b7280' }} onClick={()=>addOut(i)}>+ Add Outsourced Service</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Receiving labor (quote-level) */}
          <div style={card}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Receiving Labor</div>
            <div style={grid2}>
              <div>
                <div style={label}>Hours</div>
                <input style={input} value={meta.receivingLaborHours} onChange={e=>setMeta(m=>({...m,receivingLaborHours:e.target.value}))} />
              </div>
              <div>
                <div style={label}>Rate ($/hr)</div>
                <input style={input} value={meta.receivingRate} onChange={e=>setMeta(m=>({...m,receivingRate:e.target.value}))} />
              </div>
            </div>
          </div>

          {/* Quote-level financials */}
          <div style={{ ...card, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <div>
              <div style={label}>Commission %</div>
              <input style={input} value={meta.commissionPct} onChange={e=>setMeta(m=>({...m, commissionPct: e.target.value}))} placeholder="e.g., 3" />
            </div>
            <div>
              <div style={label}>Break-In Fee ($)</div>
              <input style={input} value={meta.breakInFee} onChange={e=>setMeta(m=>({...m, breakInFee: e.target.value}))} placeholder="e.g., 250" />
            </div>
            <div>
              <div style={label}>Sales Tax %</div>
              <input style={input} value={meta.salesTaxPct} onChange={e=>setMeta(m=>({...m, salesTaxPct: e.target.value}))} placeholder="e.g., 8.25" />
            </div>
            <div>
              <div style={label}>Freight Method</div>
              <select style={input} value={meta.freightMethod} onChange={e=>setMeta(m=>({...m, freightMethod: e.target.value}))}>
                <option value="">-- Select --</option>
                <option value="SCM Truck">SCM Truck</option>
                <option value="3rd Party Freight">3rd Party Freight</option>
                <option value="Will Call">Will Call (no freight)</option>
              </select>
            </div>
            <div>
              <div style={label}>Freight Amount ($)</div>
              <input style={input} value={meta.freightAmount} onChange={e=>setMeta(m=>({...m, freightAmount: e.target.value}))} placeholder="e.g., 180" />
            </div>
          </div>

          {/* Sticky totals for Step 2 */}
          <div style={stickyTotals}>
            <div style={{ display:'flex', gap:18, flexWrap:'wrap', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', gap:18, flexWrap:'wrap' }}>
                <div><strong>Material (base):</strong> ${totals.materialBase.toFixed(2)}</div>
                <div><strong>Material (w/ MU):</strong> ${totals.materialWithMarkup.toFixed(2)}</div>
                <div><strong>Processes:</strong> ${totals.processes.toFixed(2)}</div>
                <div><strong>Outsourcing:</strong> ${totals.outsource.toFixed(2)}</div>
                <div><strong>Receiving:</strong> ${totals.receiving.toFixed(2)}</div>
              </div>
              <div style={{ fontSize: 18 }}><strong>Subtotals → Comm/Freight/Tax applied in Review</strong></div>
            </div>
          </div>

          <div style={{ display:'flex', gap:8, justifyContent:'space-between' }}>
            <button style={button} onClick={()=>setStep(1)}>Back</button>
            <button style={primary} onClick={()=>setStep(3)}>Next</button>
          </div>
        </div>
      )}

      {/* ============================== STEP 3 ============================== */}
      {step === 3 && (
        <div style={{ ...card, display:'flex', flexDirection:'column', gap:12 }}>
          <h2 style={sectionTitle}>Step 3 — Review & Summary</h2>

          <div style={{ ...card, background:'#f9fafb' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
              <div><strong>Quote #:</strong> {meta.quoteNo}</div>
              <div><strong>Date:</strong> {meta.date}</div>
              <div><strong>Estimator:</strong> {meta.estimatedBy}</div>
              <div><strong>Customer:</strong> {meta.customerName}</div>
              <div><strong>Requestor:</strong> {meta.requestor}</div>
              <div><strong>Part/Rev:</strong> {meta.partNumber} {meta.revision ? `• Rev ${meta.revision}` : ''}</div>
              <div style={{ gridColumn:'1/-1' }}><strong>Quality:</strong> {meta.quality} {meta.requireSA ? '(SA required)' : ''} {meta.domesticOnly ? '• Domestic Only' : ''}</div>
              {meta.originRestriction && <div style={{ gridColumn:'1/-1' }}><strong>Origin Restrictions:</strong> {meta.originRestriction}</div>}
              {nde.length>0 && <div style={{ gridColumn:'1/-1' }}><strong>NDE:</strong> {nde.join(', ')}</div>}
              {meta.paymentTerms && <div style={{ gridColumn:'1/-1' }}><strong>Payment Terms:</strong> {meta.paymentTerms}</div>}
            </div>
          </div>

          {/* Materials table */}
          <div style={card}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Materials</div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background:'#f3f4f6' }}>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'left' }}>Item #</th>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'left' }}>Qty</th>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'left' }}>Material</th>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'left' }}>Grade</th>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'left' }}>Unit</th>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'left' }}>Dimensions/Basis</th>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'right' }}>Weight</th>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'right' }}>MU %</th>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'right' }}>Cost Each</th>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'right' }}>Line Total (base)</th>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'right' }}>Line Total (w/ MU)</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const muPct = num(r._uiMarkupPct);
                    const withMU = num(r.materialCost) * (1 + muPct/100);
                    return (
                      <tr key={i}>
                        <td style={{ border:'1px solid #e5e7eb', padding:8 }}>{r.itemNo || (i+1)}</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8 }}>{r.qty || 0}</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8 }}>{r.material?.type || ''} {r.material?.size ? `• ${r.material.size}` : ''}</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8 }}>{displayGrade(r.grade)}</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8 }}>{r.unitType}</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8 }}>
                          {r.unitType === 'Per Foot' && (`Length: ${r.lengthFt || 0} ft`)}
                          {r.unitType === 'Each' && (`Each`)}
                          {r.unitType === 'Sq In' && (`${r.lengthIn || 0} in × ${r.widthIn || 0} in ${r.padConventional ? '(Conventional)' : ''}`)}
                        </td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'right' }}>{r.totalWeight} lb</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'right' }}>{r._uiMarkupPct || 0}%</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'right' }}>${r._costEach}</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'right' }}>${r.materialCost}</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'right' }}>${withMU.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Processes table */}
          <div style={card}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Manufacturing Processes</div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background:'#f3f4f6' }}>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'left' }}>Row</th>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'left' }}>Process</th>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'right' }}>Hours</th>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'right' }}>Rate</th>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'right' }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.flatMap((r, i) =>
                    (r.processes||[]).map((p, j) => (
                      <tr key={`${i}-${j}`}>
                        <td style={{ border:'1px solid #e5e7eb', padding:8 }}>#{i+1}</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8 }}>{p.name}</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'right' }}>{p.hours || 0}</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'right' }}>${p.rate || 0}</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'right' }}>${p.cost || '0.00'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Outsourcing table */}
          <div style={card}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Outsourcing</div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background:'#f3f4f6' }}>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'left' }}>Row</th>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'left' }}>Type</th>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'left' }}>Notes</th>
                    <th style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'right' }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.flatMap((r, i) =>
                    (r.outsourcing||[]).map((o, j) => (
                      <tr key={`${i}-${j}`}>
                        <td style={{ border:'1px solid #e5e7eb', padding:8 }}>#{i+1}</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8 }}>{o.type}</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8 }}>{o.notes}</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8, textAlign:'right' }}>${o.cost || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals card (continues in Part 2/3) */}
          {/* Totals card */}
          <div style={{ ...card, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <div><strong>Total Weight:</strong> {totals.totalWeight.toFixed(2)} lb</div>
              <div><strong>Material Total (base):</strong> ${totals.materialBase.toFixed(2)}</div>
              <div><strong>Material Total (w/ markup):</strong> ${totals.materialWithMarkup.toFixed(2)}</div>
              <div><strong>Process Total:</strong> ${totals.processes.toFixed(2)}</div>
              <div><strong>Outsourcing Total:</strong> ${totals.outsource.toFixed(2)}</div>
              <div><strong>Receiving Labor Total:</strong> ${totals.receiving.toFixed(2)}</div>
              <div><strong>Break-In Fee:</strong> ${totals.breakIn.toFixed(2)}</div>
              <div><strong>Freight:</strong> ${totals.freight.toFixed(2)} {meta.freightMethod ? `• ${meta.freightMethod}` : ''}</div>
              <div><strong>Commission:</strong> ${totals.commission.toFixed(2)} {meta.commissionPct ? `(${num(meta.commissionPct).toFixed(2)}%)` : ''}</div>
              <div><strong>Sales Tax:</strong> ${totals.salesTax.toFixed(2)} {meta.salesTaxPct ? `(${num(meta.salesTaxPct).toFixed(2)}%)` : ''}</div>
              <div style={{ fontSize:18, marginTop:8 }}><strong>Grand Total:</strong> ${totals.grand.toFixed(2)}</div>
              <div><strong>Blended $/lb:</strong> ${totals.pricePerLb.toFixed(2)} /lb</div>
            </div>
            <div>
              <div style={{ fontWeight:700, marginBottom:8 }}>Notes</div>
              <textarea
                style={{ ...input, height: 140, resize:'vertical' }}
                value={meta.notes}
                onChange={e=>setMeta(m=>({...m, notes: e.target.value}))}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:8, justifyContent:'space-between' }}>
            <div style={{ display:'flex', gap:8 }}>
              <button style={button} onClick={()=>setStep(2)}>Back</button>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button style={button} title="Save draft (placeholder)">Save Draft</button>
              <button style={primary} title="Finalize & generate quote (placeholder)">Finalize & Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// End of file
