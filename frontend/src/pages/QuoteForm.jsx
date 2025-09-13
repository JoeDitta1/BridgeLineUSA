import React, { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Select from 'react-select';
import FileUploadPad from '../components/FileUploadPad';
import FileViewerModal from '../components/FileViewerModal';
import * as priceHistory from '../utils/priceHistory';
import jfetch from '../lib/jfetch';

// Safe wrappers (fall back to local storage map if module binding isn't available at runtime)
const getLastPrice = (args) => (priceHistory.getLastPrice ? priceHistory.getLastPrice(args) : (loadPriceMap()[priceKey({ family: args.category, description: args.description, unit: args.unit, grade: args.grade, domestic: args.domesticOnly })] || null));
const setLastPrice = (args, payload) => (priceHistory.setLastPrice ? priceHistory.setLastPrice(args, payload) : savePriceMap({ ...(loadPriceMap()), [priceKey({ family: args.category, description: args.description, unit: args.unit, grade: args.grade, domestic: args.domesticOnly })]: payload }));

// IMPORTANT: point this at your backend (Node/Express) which will talk to Supabase server-side.
// Prefer Vite-style env (import.meta.env.VITE_API_BASE) when available; fall back to CRA REACT_APP_API_BASE.
// Leave blank in development to use the CRA dev-server proxy.
const API_BASE = ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || process.env.REACT_APP_API_BASE || '');

/* ------------------------------- Local memory ------------------------------- */

const PRICE_KEY = 'scm_price_history_v2';
const loadPriceMap = () => { try { return JSON.parse(localStorage.getItem(PRICE_KEY) || '{}'); } catch { return {}; } };
const savePriceMap = (m) => localStorage.setItem(PRICE_KEY, JSON.stringify(m));
const priceKey = ({ family, description, unit, grade, domestic }) =>
  [String(family||'').toUpperCase(), String(description||'').toUpperCase(), String(unit||'').toUpperCase(), String(grade||''), String(!!domestic)].join('|');

// Parts index (local) — used to remember recently used Part / Drawing numbers
const PARTS_KEY = 'scm_parts_index_v1';
const loadPartsIndex = () => { try { return JSON.parse(localStorage.getItem(PARTS_KEY) || '[]'); } catch { return []; } };
const savePartsIndex = (arr) => localStorage.setItem(PARTS_KEY, JSON.stringify(arr));

/* --------------------------------- Helpers --------------------------------- */

// Formats tolerance like "±0.125 in"
const fmtTol = (tol) => (tol?.symbol || '±') + (tol?.value ?? 0.125) + ' ' + (tol?.unit || 'in');

// crude weight calculators (replace with your authoritative logic as needed)
const toNumber = (v, d=0) => (v === '' || v === undefined || v === null || isNaN(Number(v))) ? d : Number(v);

// Common U/M options (you can extend these; the “unit_type” determines how we weigh)
const UM_OPTIONS = [
  { value: 'EA', label: 'Each', unit_type: 'each' },
  { value: 'FT', label: 'Feet', unit_type: 'length' },
  { value: 'IN', label: 'Inches', unit_type: 'length' },
  { value: 'LB', label: 'Pounds', unit_type: 'weight' },
  { value: 'SQFT', label: 'Sq Ft', unit_type: 'area' },
];

// Default tolerances
const DEFAULT_TOL = { symbol: '±', value: 0.125, unit: 'in' };

// Simple unit type labels used in some UI selects
const unitTypes = ['Per Foot', 'Each', 'Sq In'];

// Small inline component to edit length value/unit and tolerances
function LengthWithUnitAndTol({ row = {}, onChange }) {
  const lv = row.length_value ?? row.length ?? '';
  const lu = row.length_unit || 'in';
  const tolPlus = row.tol_plus ?? DEFAULT_TOL.value;
  const tolMinus = row.tol_minus ?? DEFAULT_TOL.value;
  const tolUnit = row.tol_unit || (row.length_unit || 'in');

  // Debug: Log what the component is receiving
  if (row._isAiGenerated) {
    console.log(`🔍 LengthWithUnitAndTol DEBUG for AI row:`, {
      rowData: {
        length_value: row.length_value,
        length: row.length,
        length_unit: row.length_unit,
        lengthIn: row.lengthIn,
        lengthFt: row.lengthFt
      },
      computedValues: { lv, lu },
      isAiGenerated: row._isAiGenerated
    });
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input type="number" value={lv} onChange={e => onChange({ length_value: e.target.value })} style={{ width: 80 }} />
      <select value={lu} onChange={e => onChange({ length_unit: e.target.value })} style={{ width: 50 }}>
        <option value="ft">ft</option>
        <option value="in">in</option>
        <option value="m">m</option>
      </select>
      <input type="number" step="0.001" value={tolPlus} onChange={e => onChange({ tol_plus: parseFloat(e.target.value) })} style={{ width: 80 }} />
      <input type="number" step="0.001" value={tolMinus} onChange={e => onChange({ tol_minus: parseFloat(e.target.value) })} style={{ width: 80 }} />
      <select value={tolUnit} onChange={e => onChange({ tol_unit: e.target.value })} style={{ width: 50 }}>
        <option value="in">in</option>
        <option value="ft">ft</option>
        <option value="mm">mm</option>
      </select>
    </div>
  );
}

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

// Normalize a family/type string to a canonical label using aliases or title-casing.
const normalizeFamily = (s) => {
  if (!s) return '';
  const k = String(s).trim().toLowerCase();
  if (!k) return '';
  if (FAMILY_ALIASES[k]) return FAMILY_ALIASES[k];
  // Basic cleanup: collapse whitespace and title-case unknown families
  const cleaned = k.replace(/\s+/g, ' ').trim();
  return cleaned.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

// Single source of truth for Plate detection
const isPlateFamily = (family) => normalizeFamily(family).toLowerCase() === 'plate';

// quick money helpers
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// Convert inches/feet helpers
const inToFt = (inches) => inches / 12;
const ftToIn = (feet) => feet * 12;

/* ----------------------------------------------------------------------------
   QuoteForm
---------------------------------------------------------------------------- */

// Removed smaller component: the full, primary QuoteForm component is defined later in this file.
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



/* -------------------------- Quality / inspection options -------------------------- */
const qualityOptions = [
  'ISO 9001',
  'ASME',
  'UL508a',
  'AWS B31.1',
  'AWS B31.3'
];

/* -------------------------- Process & Outsourcing catalogs -------------------------- */
// Small default lists used by the BOM UI. Kept local to the page for simplicity.
const processCatalog = ['Laser Cutting','Grinding','Drilling','Forming','Saw Cutting','Torch Cutting','Fitting','Welding','Sandblast','Paint','Beveling','Machining'];
const outsourcingCatalog = ['Plasma Cutting','Laser Cutting Service','CNC Machining','Anodizing','Galvanizing','Powder Coat','Heat Treat','Welding Shop','Waterjet'];

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
  
  // Special handling for pipes - remove schedule from display
  let displaySize = m.size || m.description || '';
  if (familyKey === 'Pipe' && displaySize) {
    // Remove schedule info (SCH 40, SCH 80, STD, XS, XXS, XH, etc.) from pipe display
    displaySize = displaySize
      .replace(/\s+(sch|schedule)\s*\d+/gi, '')  // Remove "SCH 40", "SCH 80", etc.
      .replace(/\s+(std|standard)/gi, '')        // Remove "STD"  
      .replace(/\s+(xs|extra\s*strong)/gi, '')   // Remove "XS"
      .replace(/\s+(xxs|double\s*extra\s*strong)/gi, '') // Remove "XXS"
      .replace(/\s+(xh|extra\s*heavy)/gi, '')    // Remove "XH"
      .trim();
      
    // Ensure we show pipe size with quotes if it's fractional
    if (displaySize.includes('/')) {
      displaySize = `${displaySize}"`;
    } else if (displaySize && !displaySize.endsWith('"')) {
      displaySize = `${displaySize}"`;
    }
  }
  
  const label = `${familyRaw || 'Material'} - ${displaySize}`.trim();
  const value = `${(m.type||m.category)||''}|${displaySize}`;
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
  if (familyKey === 'Pipe') add('pipe','piping','nps','sch','schedule');
  
  // Store the cleaned size for pipes
  return { 
    ...m, 
    label, 
    value, 
    familyKey, 
    keywords: Array.from(kws),
    cleanSize: familyKey === 'Pipe' ? displaySize : (m.size || m.description || '')
  };
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
    const area = t * (a + b - t);
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

/* ======================= Save helpers for backend ======================= */
async function saveQuoteAPI(payload) {
  // Use jfetch (defensive): it throws on non-2xx and parses JSON safely.
  let data = {};
  try {
    data = await jfetch(`${API_BASE}/api/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quote_no: payload.quote_no || undefined,
        customer_name: payload.customer_name,
        date: payload.date,
        description: payload.description ?? null,
        requested_by: payload.requested_by ?? null,
        estimator: payload.estimator ?? null,
        status: payload.status ?? 'Draft',
        sales_order_no: payload.sales_order_no ?? null,
        rev: Number.isFinite(payload.rev) ? payload.rev : 0
      }),
    });
  } catch (e) {
    // Re-throw with clearer context
    throw new Error(`Save quote failed: ${e.message}`);
  }

  // Normalize common server shapes: some endpoints return { ok:true, quote: { ... } }
  try {
    const nested = data?.quote;
    const nestedQuoteNo = nested?.quote_no || nested?.quoteNo || nested?.quote_no;
    if (!data.quote_no && nestedQuoteNo) {
      data.quote_no = nestedQuoteNo;
    }
    // also support camelCase top-level sometimes used elsewhere
    if (!data.quote_no && data?.quoteNo) data.quote_no = data.quoteNo;
  } catch (e) {
    // noop
  }

  return data;
}

/** Saves full app state to _meta.json + DB (draft/final). */
async function saveQuoteMetaAPI({ meta, rows, nde }, status = 'draft') {
  const payload = {
    quoteNo: (meta.quoteNo || '').trim() || undefined,
    customerName: (meta.customerName || '').trim(),
    description: (meta.description || '').trim() || null,
    requested_by: (meta.requestor || '').trim() || null,
    estimator: (meta.estimatedBy || '').trim() || null,
    date: (meta.date || '').trim(),
    status, // 'draft' | 'final'
    appState: { meta, rows, nde },
  };

  // Use jfetch but preserve 404 behavior (skip)
  try {
    const data = await jfetch(`${API_BASE}/api/quotes/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data;
  } catch (e) {
    // jfetch throws on non-2xx — treat 404 as skipped (backwards-compatible)
    if (String(e.message).includes('HTTP 404')) return { ok: true, skipped: true };
    throw new Error(`Save meta failed: ${e.message}`);
  }
}

/** NEW: Initialize folder tree (idempotent). */
async function initFoldersAPI({ quoteNo, customerName, description }) {
  if (!quoteNo || !customerName) return null;
  try {
    return await jfetch(`${API_BASE}/api/quotes/${encodeURIComponent(quoteNo)}/init-folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_name: customerName, description: description || '' }),
      credentials: 'include',
    });
  } catch (e) {
    // best-effort idempotent init; swallow errors and return null
    console.warn('initFoldersAPI failed:', e.message);
    return null;
  }
}

/* ================================== App ================================== */
export default function QuoteForm() {
  // Debug: Track component renders
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  console.log('🔄 QuoteForm render #', renderCountRef.current);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { quoteNo: routeQuoteNo } = useParams(); // ← used for hydration/navigation
  const pre = location?.state || {};

  const [step, setStep] = useState(1);
  const [uploads, setUploads] = useState([]); // [{name,url,subdir,size,mtime}]
  // Files persisted on the server for this quote (read-only listing)
  const [serverFiles, setServerFiles] = useState([]);
  // Toggle showing uploaded files inline on the Quote form (hide by default to avoid long lists)
  const SHOW_UPLOADED_IN_QUOTEFORM = false;
  // Hover preview URL (small thumbnail, 256px) to show when user hovers a file
  const [hoverPreviewUrl, setHoverPreviewUrl] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // AI BOM state for review modal
  const [aiBomResults, setAiBomResults] = useState(null);
  const [showAiBomReview, setShowAiBomReview] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // AI Progress popup state
  const [showAiProgress, setShowAiProgress] = useState(false);
  const [aiProgressStatus, setAiProgressStatus] = useState('');
  const [aiProgressSteps, setAiProgressSteps] = useState([]);
  const [aiAnalysisComplete, setAiAnalysisComplete] = useState(false);
  const [aiCancelled, setAiCancelled] = useState(false);

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
  useEffect(() => {
    if (/ASME/i.test(meta.quality) && !meta.requireSA) {
      setMeta(m => ({ ...m, requireSA: true }));
    }
  }, [meta.quality, meta.requireSA]);

  /** HYDRATE from _meta.json if we landed on /quote/:quoteNo/edit */
  useEffect(() => {
    let active = true;
    (async () => {
      if (!routeQuoteNo) return;
      try {
        console.log('🔍 LOADING QUOTE META for:', routeQuoteNo);
        const json = await jfetch(`${API_BASE}/api/quotes/${encodeURIComponent(routeQuoteNo)}/meta`);
        console.log('📥 LOADED QUOTE META RESPONSE:', json);
        if (json.ok === false) throw new Error(json.error || 'Failed to load quote meta');
        
        const form = json?.meta?.form || {};
        // Support two shapes: older saves put appState at `form.appState`,
        // newer saves wrote the app state directly under `form` (meta/rows/nde).
        const app = form.appState || form || {};
        
        // If we got data from Supabase but no form data, try local fallback
        if (json.source === 'supabase' && (!app.meta || Object.keys(app.meta || {}).length === 0)) {
          console.log('🔄 Supabase has no form data, trying local fallback...');
          try {
            const localJson = await jfetch(`${API_BASE}/api/quotes/${encodeURIComponent(routeQuoteNo)}/meta?forceLocal=true`);
            if (localJson.ok && localJson.meta?.form) {
              const localForm = localJson.meta.form || {};
              const localApp = localForm.appState || localForm || {};
              if (localApp.meta) {
                console.log('✅ Using local form data instead');
                Object.assign(app, localApp);
              }
            }
          } catch (fallbackError) {
            console.warn('Local fallback failed:', fallbackError);
          }
        }
        
        console.log('🔍 Final app object:', app);
        console.log('🔍 Final app.meta:', app.meta);
        try { 
          console.debug('[QuoteForm hydrate] json:', json); 
          console.debug('[QuoteForm hydrate] app:', app); 
          console.debug('[QuoteForm hydrate] app.meta:', app.meta);
        } catch (e) {}
        if (!active) return;

        if (app.meta) {
          // Ensure all meta fields have defined values to prevent uncontrolled component warnings
          const safeMeta = Object.keys(app.meta).reduce((acc, key) => {
            acc[key] = app.meta[key] == null ? '' : app.meta[key];
            return acc;
          }, {});
          setMeta(prev => ({ ...prev, ...safeMeta, quoteNo: routeQuoteNo }));
          console.log('🔄 Updated meta state with:', safeMeta);
        }
        if (Array.isArray(app.rows)) setRows(app.rows.map(r => ({ _uiOpen: true, _uiMarkupPct: r._uiMarkupPct || '', ...r })));
        if (Array.isArray(app.nde)) setNde(app.nde);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { active = false; };
  }, [routeQuoteNo]);

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
  const [materialCategoryContext, setMaterialCategoryContext] = useState({}); // Track last selected category per row
  useEffect(() => {
    (async () => {
      try {
        console.log('🔍 Loading materials from API:', `${API_BASE}/api/materials`);
        const response = await jfetch(`${API_BASE}/api/materials`);
        console.log('📥 Materials API response:', response);
        
        // Extract materials array from API response
        const rowsRaw = response?.materials || response || [];
        console.log('📊 Materials count:', rowsRaw?.length || 0);

        // 1) Client-generated Plate — tag as 'generic-plate'
        const genericPlateOptions = buildPlateOptions().map(o => ({
          ...o,
          source: 'generic-plate',
          group: 'Generic Plate (Thickness Catalog)'
        }));

        // 2) Server catalog items (from /api/materials)
        const serverOptions = (rowsRaw || []).map(m => {
          const opt = augmentOption(toMatOption(m));
          return {
            ...opt,
            raw: m,
            source: 'server-catalog',
            group: 'Materials Catalog (from JSON)'
          };
        });

        // Sort pipe materials by size (convert fractions to decimals for proper ordering)
        const sortPipesBySize = (options) => {
          const pipeOptions = options.filter(opt => opt.familyKey === 'Pipe');
          const nonPipeOptions = options.filter(opt => opt.familyKey !== 'Pipe');
          
          // Helper function to convert pipe size to decimal for sorting
          const parsePipeSize = (label) => {
            // Extract size from label like "Pipe - 1/2"" or "Pipe - 2""
            const sizeMatch = label.match(/Pipe - (\d+(?:\/\d+)?)"?/);
            if (!sizeMatch) return 0;
            
            const sizeStr = sizeMatch[1];
            if (sizeStr.includes('/')) {
              const [num, den] = sizeStr.split('/').map(Number);
              return num / den;
            } else {
              return parseFloat(sizeStr);
            }
          };
          
          // Sort pipes by size
          const sortedPipes = pipeOptions.sort((a, b) => {
            const sizeA = parsePipeSize(a.label || '');
            const sizeB = parsePipeSize(b.label || '');
            return sizeA - sizeB;
          });
          
          return [...sortedPipes, ...nonPipeOptions];
        };

        const sortedServerOptions = sortPipesBySize(serverOptions);

        // 3) Include sheet/gauge options in the server catalog group so UI shows them too
        const sheetOptions = buildSheetOptions().map(o => ({ ...o, source: 'generic-sheet', group: 'Materials Catalog (from JSON)' }));

        // 4) De-dupe within each source only (don't cross-merge)
        const uniqBy = (arr, keyFn) => {
          const seen = new Set();
          return arr.filter(x => {
            const k = keyFn(x);
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
        };

        const genericPlateUnique = uniqBy(genericPlateOptions, o => o.value);
        const serverUnique = uniqBy([...sortedServerOptions, ...sheetOptions], o => o.value);

        // 5) Provide grouped options to react-select
        const groupedOptions = [
          { label: 'Generic Plate (Thickness Catalog)', options: genericPlateUnique },
          { label: 'Materials Catalog (from JSON)',     options: serverUnique }
        ];

        setMaterialOptions(groupedOptions);
  } catch (err) {
        // fallback: only client-side generated plates & sheets
        const genericPlateOptions = buildPlateOptions().map(o => ({ ...o, source: 'generic-plate', group: 'Generic Plate (Thickness Catalog)' }));
        const sheetOptions = buildSheetOptions().map(o => ({ ...o, source: 'generic-sheet', group: 'Materials Catalog (from JSON)' }));
        const uniqBy = (arr, keyFn) => { const seen = new Set(); return arr.filter(x => { const k = keyFn(x); if (seen.has(k)) return false; seen.add(k); return true; }); };
        const groupedOptions = [
          { label: 'Generic Plate (Thickness Catalog)', options: uniqBy(genericPlateOptions, o => o.value) },
          { label: 'Materials Catalog (from JSON)',     options: uniqBy(sheetOptions, o => o.value) }
        ];
        setMaterialOptions(groupedOptions);
      }
    })();
  }, []);

  // Load persisted files for this quote (server-side listing)
  useEffect(() => {
    let active = true;
    (async () => {
      const q = (meta.quoteNo || routeQuoteNo || '').trim();
      if (!q) return;
      try {
        const list = await jfetch(`${API_BASE}/api/quotes/${encodeURIComponent(q)}/files`);
        if (!active) return;
        if (Array.isArray(list)) setServerFiles(list);
      } catch (e) {
        console.warn('Failed to load server files:', e?.message || e);
      }
    })();
    return () => { active = false; };
  }, [routeQuoteNo, meta.quoteNo]);
  /* --------------------------------- ROWS (BOM) --------------------------------- */
  const emptyRow = {
    itemNo: '',
    material: null,
    unitType: 'Per Foot',
    grade: '',
    schedule: '', // New field for pipe schedules (SCH 40, SCH 80, STD, etc.)
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

  /** Get stored weight override for pipe size + schedule */
  const getWeightOverride = (pipeSize, schedule) => {
    if (!pipeSize || !schedule) return null;
    const key = `pipe_weight_${pipeSize}_${schedule}`.replace(/[^\w]/g, '_');
    const stored = localStorage.getItem(key);
    return stored ? parseFloat(stored) : null;
  };

  /** Store weight override for pipe size + schedule */
  const storeWeightOverride = (pipeSize, schedule, weight) => {
    if (!pipeSize || !schedule) return;
    const key = `pipe_weight_${pipeSize}_${schedule}`.replace(/[^\w]/g, '_');
    localStorage.setItem(key, weight.toString());
    console.log(`🔧 User override stored: ${pipeSize} ${schedule} = ${weight} lbs/ft`);
  };

  /** Enhanced AI BOM extraction with review modal */
  const handleAiExtractBom = async () => {
    const qid = (meta && meta.quoteNo) || routeQuoteNo || '';
    if (!qid) {
      alert('Please select a quote first');
      return;
    }

    console.log('🚀 BUTTON CLICKED - Starting AI BOM extraction v3');
    
    // Try a different approach - set state with functional update to ensure it takes effect
    setShowAiProgress(prev => {
      console.log('🔄 Setting showAiProgress from', prev, 'to true');
      return true;
    });
    
    // Force immediate rendering using flushSync to ensure modal appears instantly
    flushSync(() => {
      console.log('🔄 Running flushSync to force render...');
    });
    
    // Debug: Check if the state was actually set
    console.log('🔍 State after setting - showAiProgress should be true but may show stale value due to closure');
    
    // Small delay to ensure the progress modal renders before continuing
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('📊 Setting initial progress status...');
    // Now set the progress details
    setAiProgressStatus('Initializing AI analysis...');
    setAiProgressSteps(['🚀 Starting AI BOM extraction']);
    setAiAnalysisComplete(false);
    setAiCancelled(false);
    setAiLoading(true);

    try {
      // Update progress
      console.log('📡 Updating progress - connecting to AI service...');
      setAiProgressStatus('Connecting to AI analysis service...');
      setAiProgressSteps(prev => [...prev, '🔗 Connecting to AI service']);
      
      console.log(`Extracting BOM using AI for quote: ${qid}`);
      
      // Check for cancellation before API call
      if (aiCancelled) {
        setAiProgressStatus('Analysis cancelled by user');
        return;
      }
      
      setAiProgressStatus('Analyzing drawings and extracting materials...');
      setAiProgressSteps(prev => [...prev, '📄 Sending drawings to AI for analysis']);
      
      const response = await jfetch(`${API_BASE}/api/quotes/${encodeURIComponent(qid)}/ai/extract-bom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'openai' }),
        credentials: 'include',
      });

      // Check for cancellation after API call
      if (aiCancelled) {
        setAiProgressStatus('Analysis cancelled by user');
        return;
      }

      if (!response.success) {
        console.error('AI BOM extraction failed:', response.error);
        setAiProgressStatus(`❌ Analysis failed: ${response.error}`);
        setAiProgressSteps(prev => [...prev, `❌ Error: ${response.error}`]);
        alert(`AI extraction failed: ${response.error}`);
        return;
      }

      const { extraction } = response;
      if (!extraction?.extractedItems?.length) {
        setAiProgressStatus('❌ No BOM items found in drawings');
        setAiProgressSteps(prev => [...prev, '❌ No materials found - check for BOM tables in drawings']);
        alert('No BOM items found in the drawings. Make sure the quote contains technical drawings with bill of materials.');
        return;
      }

      // Update progress with results
      setAiProgressStatus(`✅ Analysis complete! Found ${extraction.extractedItems.length} materials`);
      setAiProgressSteps(prev => [...prev, 
        `🎯 AI analysis complete`,
        `📋 Found ${extraction.extractedItems.length} BOM items`,
        `🎲 Analysis confidence: ${Math.round((extraction.confidence || 0.7) * 100)}%`
      ]);

      // Transform AI response to match the form structure with smart dimensional mapping
      const transformedItems = extraction.extractedItems.map(item => {
        console.log('🔧 Processing AI item for dimensions:', item);
        
        // Smart dimensional mapping with cross-validation
        let length_value = null;
        let length_unit = 'ft';
        let width_value = null;
        let thickness_value = null;
        
        // Extract dimensions from AI response - keep in original units for Quote Form
        if (item.length !== undefined && item.length !== null) {
          length_value = parseFloat(item.length);
          length_unit = item.lengthUnit || 'in'; // Keep original units - Quote Form expects inches
        }
        
        if (item.width !== undefined && item.width !== null) {
          width_value = parseFloat(item.width);
        }
        
        if (item.thickness !== undefined && item.thickness !== null) {
          thickness_value = parseFloat(item.thickness);
        }
        
        // Keep dimensions in original units (inches) for Quote Form compatibility
        // The Quote Form dimensional fields expect inches, not feet
        console.log(`📏 Keeping ${item.item} dimensions in original units: ${length_value} ${length_unit}`);
        
        // Cross-validation status and notes
        let validationNotes = item.notes || `AI extracted (${Math.round((item.confidence || extraction.confidence || 0.5) * 100)}% confidence)`;
        if (item.dimensionMatch === false) {
          validationNotes += ` [⚠️ DIMENSION MISMATCH: BOM=${item.bomDimension} vs Detail=${item.detailDimension}]`;
        } else if (item.dimensionMatch === true) {
          validationNotes += ` [✅ Dims verified: ${item.bomDimension}]`;
        }
        
        return {
          material: item.item || item.material || '',  // Use AI's item description as the primary material description!
          size: item.size || '',
          schedule: item.schedule || '', // ENHANCED: Include schedule field from AI extraction
          grade: item.grade || '',
          thickness_or_wall: thickness_value || item.thickness_or_wall || '',
          length_value: length_value,
          length_unit: length_unit,
          width_value: width_value, // Add width for plates
          qty: item.qty || 1,
          unit: item.unit || 'Each',
          notes: validationNotes,
          // Additional AI metadata with cross-validation info
          _ai_confidence: item.confidence || extraction.confidence || 0.85,
          _ai_source: 'ai_extraction',
          _dimension_validated: item.dimensionMatch || false,
          _bom_dimension: item.bomDimension || null,
          _detail_dimension: item.detailDimension || null,
          _ai_dimensions: {
            originalLength: item.length,
            originalLengthUnit: item.lengthUnit,
            originalWidth: item.width,
            originalThickness: item.thickness
          }
        };
      });

      // PLATE ENHANCEMENT: For items identified as plates, ensure thickness maps to size field for material matching
      const plateEnhancedItems = transformedItems.map(item => {
        const isPlate = (item.material || '').toLowerCase().includes('plate');
        if (isPlate && item.thickness_or_wall && !item.size) {
          console.log(`🔩 PLATE ENHANCEMENT: Mapping thickness "${item.thickness_or_wall}" to size field for plate material matching`);
          return {
            ...item,
            size: item.thickness_or_wall // Map thickness to size for proper plate material matching
          };
        }
        return item;
      });

      // Show review modal
      console.log('Setting AI BOM results and showing modal:', plateEnhancedItems);
      setAiBomResults({
        items: plateEnhancedItems,
        extraction: extraction,
        timestamp: new Date().toISOString()
      });
      
      // Mark analysis as complete and activate "View Results" button
      setAiAnalysisComplete(true);
      setAiProgressStatus('✅ Ready to review results!');
      setAiProgressSteps(prev => [...prev, '✅ Click "View Results" to review and accept materials']);

    } catch (error) {
      console.error('AI BOM extraction error:', error);
      setAiProgressStatus(`❌ Analysis error: ${error.message || error}`);
      setAiProgressSteps(prev => [...prev, `❌ Error: ${error.message || error}`]);
      alert(`AI extraction error: ${error.message || error}`);
    } finally {
      setAiLoading(false);
    }
  };

  /** Accept AI BOM items and add them to the form */
  /** Enhanced AI BOM items acceptance with material matching and database integration */
  const acceptAiBomItems = async (selectedItems) => {
    if (!selectedItems?.length) return;

    setAiLoading(true);
    try {
      const newRows = [];
      
      for (let index = 0; index < selectedItems.length; index++) {
        const item = selectedItems[index];
        
        console.log(`🔍 PROCESSING AI ITEM ${index + 1}:`, JSON.stringify(item, null, 2));
        
        // Initialize matched material variable for this item
        let matchedMaterial = null;
        
        // Create an AI item structure that addNewMaterialToDatabase expects
        const aiItemForDb = {
          item: item.material || item.item || '',  // Use the material field which contains item description
          material: item.material || item.item || '',
          size: item.size || '',
          grade: item.grade || '',
          qty: item.qty || 1,
          unit: item.unit || 'Each',
          length: item.length_value || item.length || '', // Use transformed length_value
          lengthUnit: item.length_unit || 'in',
          width: item.width_value || item.width || '',    // Use transformed width_value  
          thickness: item.thickness_or_wall || item.thickness || '', // Use transformed thickness
          confidence: item._ai_confidence || 0.8
        };
        
        // ENHANCED UNIVERSAL MATERIAL MATCHING
        // Try to find the best matching material from the existing materialOptions first
        let selectedMaterialOption = null;
        
        console.log(`� UNIVERSAL MATERIAL SEARCH for: "${item.material}" size: "${item.size}" grade: "${item.grade}"`);
        
        // Strategy 1: Search existing materialOptions for the best match
        // First try EXACT matches, then fuzzy matches
        console.log(`🔍 PHASE 1: Looking for EXACT matches first...`);
        
        // Phase 1: Look for exact family + size matches (highest priority)
        for (const group of materialOptions) {
          if (!group.options) continue;
          
          for (const option of group.options) {
            let exactScore = 0;
            
            // Exact family match
            if (option.family?.toLowerCase() === item.material?.toLowerCase()) {
              exactScore += 10000;
            }
            
            // Exact size match  
            if (option.size?.toLowerCase() === item.size?.toLowerCase()) {
              exactScore += 5000;
            }
            
            // For exact matches, skip the scoring algorithm and use directly
            if (exactScore >= 15000) {
              selectedMaterialOption = option;
              console.log(`🎯 EXACT MATCH FOUND (family + size):`, {
                label: option.label,
                family: option.family,
                size: option.size,
                score: exactScore
              });
              break;
            }
          }
          
          if (selectedMaterialOption) break;
        }
        
        // Phase 2: If no exact match, try intelligent fuzzy matching
        if (!selectedMaterialOption) {
          console.log(`🔍 PHASE 2: No exact match found, trying intelligent fuzzy matching...`);
          
          const searchTerms = [
            item.material?.toLowerCase() || '',
            item.size?.toLowerCase() || '',
            item.grade?.toLowerCase() || ''
          ].filter(term => term && term !== '');
          
          console.log(`🔍 Search terms:`, searchTerms);
          
          // DEBUG: Show format of actual material options
          if (materialOptions.length > 0 && materialOptions[0].options?.length > 0) {
            const sampleOption = materialOptions[0].options[0];
            console.log(`📋 SAMPLE REAL OPTION FORMAT:`, {
              label: sampleOption.label,
              value: sampleOption.value,
              family: sampleOption.family,
              type: sampleOption.type,
              size: sampleOption.size,
              category: sampleOption.category,
              hasRaw: !!sampleOption.raw,
              source: sampleOption.source
            });
          }
          
          let bestMatch = null;
          let bestScore = 0;
        
        // Search through all material groups
        for (const group of materialOptions) {
          if (!group.options) continue;
          
          console.log(`🔍 Searching group "${group.label}" (${group.options.length} options)`);
          
          for (const option of group.options) {
            let score = 0;
            const optionTerms = [
              option.label?.toLowerCase() || '',
              option.description?.toLowerCase() || '',
              option.family?.toLowerCase() || '',
              option.size?.toLowerCase() || '',
              option.grade?.toLowerCase() || '',
              option.type?.toLowerCase() || ''
            ].filter(term => term && term !== '');
            
            // Score based on matching terms with improved accuracy
            searchTerms.forEach(searchTerm => {
              if (searchTerm.length < 2) return; // Skip very short terms
              
              optionTerms.forEach(optionTerm => {
                // For numeric terms, be more strict to avoid "2" matching "1/2"
                if (/^\d+$/.test(searchTerm)) {
                  // Exact numeric match gets highest score
                  if (optionTerm === searchTerm) {
                    score += 2000;
                  }
                  // Word boundary numeric match (e.g., "2 SCH" or "2" or "2.5")
                  else if (optionTerm.match(new RegExp(`\\b${searchTerm}\\b`))) {
                    score += 1500;
                  }
                  // Avoid false matches like "2" matching "1/2"
                  else if (optionTerm.includes(`/${searchTerm}`) || optionTerm.includes(`${searchTerm}/`)) {
                    // This is likely a fraction, be more careful
                    if (optionTerm === `1/${searchTerm}` || optionTerm === `${searchTerm}/1`) {
                      score += 100; // Low score for fraction matches
                    }
                    // Don't score "2" matching "1/2" - this is wrong
                  }
                }
                // For non-numeric terms, use the existing logic
                else {
                  // Exact match gets highest score
                  if (optionTerm === searchTerm) {
                    score += 1000;
                  }
                  // Exact word match gets high score
                  else if (optionTerm.includes(` ${searchTerm} `) || optionTerm.includes(`-${searchTerm}-`) || 
                           optionTerm.startsWith(`${searchTerm} `) || optionTerm.endsWith(` ${searchTerm}`) ||
                           optionTerm.startsWith(`${searchTerm}-`) || optionTerm.endsWith(`-${searchTerm}`)) {
                    score += 500;
                  }
                  // Contains match gets lower score
                  else if (optionTerm.includes(searchTerm)) {
                    score += searchTerm.length * 10;
                  }
                  // Partial match gets minimal score  
                  else if (searchTerm.includes(optionTerm) && optionTerm.length > 1) {
                    score += optionTerm.length;
                  }
                }
              });
            });
            
            // SPECIAL HANDLING: Exact family match gets huge bonus
            if (option.family?.toLowerCase() === item.material?.toLowerCase()) {
              score += 2000;
            }
            
            // SPECIAL HANDLING: Exact size match gets huge bonus (critical for pipes)
            if (option.size?.toLowerCase() === item.size?.toLowerCase()) {
              score += 1500;
            }
            
            // SPECIAL HANDLING: For pipes, ensure size matches exactly to avoid "1/2" vs "2" confusion
            if (item.material?.toLowerCase().includes('pipe') && option.family?.toLowerCase().includes('pipe')) {
              const itemSize = item.size?.toLowerCase().trim();
              const optionSize = option.size?.toLowerCase().trim();
              
              // Extract pipe size from option (e.g., "1/2 SCH 10" -> "1/2", "2 SCH 40" -> "2")
              const pipeSizeMatch = optionSize.match(/^(\d+(?:\/\d+)?)\s*/);
              const extractedPipeSize = pipeSizeMatch ? pipeSizeMatch[1] : optionSize;
              
              console.log(`🔧 PIPE SIZE CHECK: Looking for "${itemSize}" vs option "${extractedPipeSize}" (from "${optionSize}")`);
              
              if (extractedPipeSize === itemSize) {
                score += 3000; // Huge bonus for exact pipe size match
                console.log(`✅ EXACT PIPE SIZE MATCH: "${itemSize}" === "${extractedPipeSize}"`);
              } else if (extractedPipeSize.includes(itemSize) && itemSize.length > 1) {
                // Only allow substring match if the search term is substantial
                score += 500;
                console.log(`🔍 Partial pipe size match: "${itemSize}" in "${extractedPipeSize}"`);
              } else {
                // Penalize wrong pipe sizes heavily to prevent "1/2" matching when looking for "2"
                score = Math.max(0, score - 1000);
                console.log(`❌ WRONG PIPE SIZE: "${itemSize}" != "${extractedPipeSize}" (penalty applied)`);
              }
            }
            
            if (score > bestScore && score > 0) {
              bestScore = score;
              bestMatch = option;
              console.log(`🏆 NEW BEST MATCH (score: ${score}):`, {
                label: option.label,
                family: option.family,
                size: option.size,
                grade: option.grade,
                searchingFor: { material: item.material, size: item.size, grade: item.grade }
              });
            }
          }
        }
        
        if (bestMatch && bestScore > 0) {
          selectedMaterialOption = bestMatch;
          console.log(`✅ FUZZY MATCH FOUND (score: ${bestScore}):`, {
            label: bestMatch.label,
            family: bestMatch.family,
            size: bestMatch.size,
            grade: bestMatch.grade
          });
        } else {
          console.log(`❌ NO GOOD FUZZY MATCH FOUND - will create new material`);
        }
        
        } // End of Phase 2 fuzzy matching
        
        // Strategy 2: If no good match found, try database search and creation
        if (!selectedMaterialOption) {
          console.log(`🔧 NO DROPDOWN MATCH - trying database search for "${item.material}"`);
          
          // Try to find or create material in database
          matchedMaterial = await findBestMaterialMatch(aiItemForDb);
          
          console.log(`🔍 DATABASE SEARCH RESULT:`, {
            aiItem: aiItemForDb.material,
            aiGrade: aiItemForDb.grade,
            matchFound: !!matchedMaterial,
            matchedMaterial: matchedMaterial ? {
              label: matchedMaterial.label,
              family: matchedMaterial.family,
              size: matchedMaterial.size,
              grade: matchedMaterial.grade
            } : null
          });
          
          // If no match found, create/add the material to database
          if (!matchedMaterial) {
            console.log(`📝 Creating new material in database: "${aiItemForDb.material}"`);
            matchedMaterial = await addNewMaterialToDatabase(aiItemForDb);
          }
          
          // If we got a database result, search for it in materialOptions or create a proper option
          if (matchedMaterial) {
            // Try to find the newly created/found material in materialOptions
            for (const group of materialOptions) {
              const foundOption = group.options?.find(opt => 
                opt.value === matchedMaterial.value || 
                opt.label === matchedMaterial.label ||
                (opt.raw?.id === matchedMaterial.id)
              );
              if (foundOption) {
                selectedMaterialOption = foundOption;
                console.log(`🎯 Found database material in dropdown:`, foundOption.label);
                break;
              }
            }
            
            // If still not found, create a proper react-select option
            if (!selectedMaterialOption) {
              selectedMaterialOption = {
                label: matchedMaterial.label || `${matchedMaterial.family || item.material} - ${matchedMaterial.size || item.size || 'Unknown'}`,
                value: matchedMaterial.value || `${item.material?.toLowerCase().replace(/\s+/g, '_')}_${item.size || 'unknown'}`,
                family: matchedMaterial.family || item.material,
                type: matchedMaterial.type || matchedMaterial.family || item.material,
                category: matchedMaterial.category || matchedMaterial.family || item.material,
                size: matchedMaterial.size || item.size,
                grade: matchedMaterial.grade || item.grade,
                description: matchedMaterial.description || matchedMaterial.label,
                source: 'ai-created',
                group: 'AI Created Materials',
                // Include all database fields
                id: matchedMaterial.id,
                price_per_unit: matchedMaterial.price_per_unit,
                price_per_lb: matchedMaterial.price_per_lb,
                price_per_ft: matchedMaterial.price_per_ft,
                weight_per_ft: matchedMaterial.weight_per_ft,
                weight_per_sqin: matchedMaterial.weight_per_sqin,
                unit_type: matchedMaterial.unit_type,
                raw: matchedMaterial.raw || matchedMaterial
              };
              console.log(`🆕 Created new material option:`, selectedMaterialOption.label);
            }
          }
        }

        // Determine correct unit type based on material to show proper dimensional fields
        const materialType = (selectedMaterialOption?.family || item.material || '').toLowerCase();
        let unitType = 'Each'; // default
        
        if (materialType.includes('pipe') || materialType.includes('channel') || materialType.includes('angle') || materialType.includes('beam')) {
          unitType = 'Per Foot';  // Shows length fields
        } else if (materialType.includes('plate') || materialType.includes('sheet')) {
          unitType = 'Sq In';     // Shows length × width fields
        }

        // Final validation - if we still don't have a material option, create a basic fallback
        if (!selectedMaterialOption) {
          console.warn(`⚠️ FALLBACK: Creating basic material option for "${item.material}"`);
          selectedMaterialOption = {
            label: `${item.material || 'Unknown'} - ${item.size || 'Size TBD'}`,
            value: `ai_fallback_${item.material?.toLowerCase().replace(/\s+/g, '_') || 'unknown'}`,
            family: item.material || 'Unknown',
            type: item.material || 'Unknown', 
            category: item.material || 'Unknown',
            size: item.size || '',
            grade: item.grade || '',
            description: `AI Generated: ${item.material || 'Unknown Material'}`,
            source: 'ai-fallback',
            group: 'AI Created Materials'
          };
        }
        console.log(`✅ FINAL MATERIAL SELECTION:`, {
          label: selectedMaterialOption?.label,
          family: selectedMaterialOption?.family,
          size: selectedMaterialOption?.size,
          source: selectedMaterialOption?.source
        });

        // Create the row with proper structure
        const newRow = {
          ...emptyRow,
          itemNo: String(index + 1), // Fix: Start from 1, not based on existing rows
          // Material field - use the proper material option
          material: selectedMaterialOption,
          // Use selected material's size or AI item size
          size: selectedMaterialOption?.size || item.size || '',
          // Use selected material's grade or AI item grade
          grade: selectedMaterialOption?.grade || item.grade || '',
          // Set pipe schedule if this is a pipe (from AI extraction)
          schedule: item.schedule || '', // Use the extracted schedule (e.g., "SCH 40")
          // Set proper unit type to show dimensional fields
          unitType: unitType,
          // Dimensional fields - use proper Quote Form field names and CORRECT data sources
          lengthIn: item.length_value || '', // Use the transformed length_value (already in inches)
          widthIn: item.width_value || '',   // Use the transformed width_value (already in inches)  
          heightIn: item.thickness_or_wall || '', // Use the transformed thickness
          lengthFt: unitType === 'Per Foot' ? (item.length_value ? (parseFloat(item.length_value) / 12).toFixed(2) : '') : '', // Convert to feet for Per Foot items
          // Add fields for LengthWithUnitAndTol component (Per Foot items)
          length_value: item.length_value || '', // For LengthWithUnitAndTol component
          length_unit: item.length_unit || 'in', // For LengthWithUnitAndTol component  
          width_value: item.width_value || '',   // For potential width fields
          width_unit: item.width_unit || 'in',   // For potential width fields
          qty: item.qty || 1,
          notes: selectedMaterialOption?.source === 'ai-created' ? 
            `AI created new material (${Math.round(item._ai_confidence * 100)}% confidence)` :
            selectedMaterialOption?.source === 'ai-fallback' ?
            `AI fallback material (${Math.round(item._ai_confidence * 100)}% confidence)` :
            `AI matched existing material (${Math.round(item._ai_confidence * 100)}% confidence)`,
          // Mark as AI-generated for styling/tracking
          _isAiGenerated: true,
          _aiConfidence: item._ai_confidence,
          _matchedFromDatabase: !!matchedMaterial,
          _uiOpen: true  // Fix: Ensure dimensional fields are expanded
        };

        console.log(`✨ FINAL ROW CREATED:`, {
          itemNo: newRow.itemNo,
          material: newRow.material ? `${newRow.material.family} - ${newRow.material.size}` : 'No material',
          grade: newRow.grade,
          schedule: newRow.schedule,
          lengthIn: newRow.lengthIn,
          widthIn: newRow.widthIn,
          heightIn: newRow.heightIn,
          // Check the fields that LengthWithUnitAndTol component uses
          length_value: newRow.length_value,
          length_unit: newRow.length_unit, 
          width_value: newRow.width_value,
          width_unit: newRow.width_unit,
          unitType: newRow.unitType,
          qty: newRow.qty,
          fullMaterial: JSON.stringify(newRow.material, null, 2)
        });

        newRows.push(newRow);
      }

      // Replace rows entirely if starting with just empty row, otherwise append
      setRows(prevRows => {
        // Check if we have just one empty row (initial state)
        const isInitialEmptyState = prevRows.length === 1 && 
                                  prevRows[0].material === null && 
                                  !prevRows[0].itemNo && 
                                  !prevRows[0].qty;
        
        let finalRows;
        if (isInitialEmptyState) {
          // Replace the empty row with AI items
          finalRows = newRows;
        } else {
          // Add AI items to existing rows
          finalRows = [...prevRows, ...newRows];
        }
        
        // Fix itemNo to be sequential for all rows
        return finalRows.map((row, idx) => ({
          ...row,
          itemNo: String(idx + 1)
        }));
      });
      setShowAiBomReview(false);
      setAiBomResults(null);
      
      // CRITICAL: Manually trigger onMaterialSelect for each AI row to set category context
      setTimeout(() => {
        // Get current rows directly from state instead of using setRows callback
        const triggerCallbacks = () => {
          setRows(currentRows => {
            console.log(`🔍 MANUAL CALLBACK TRIGGER: Found ${currentRows.length} total rows`);
            
            // Find the AI-added rows and store them for callback triggering
            const aiRowsToProcess = [];
            currentRows.forEach((row, idx) => {
              console.log(`🔍 ROW ${idx} CHECK:`, {
                isAiGenerated: !!row._isAiGenerated,
                hasMaterial: !!row.material,
                materialFamily: row.material?.family,
                materialLabel: row.material?.label,
                unitType: row.unitType,
                rowLength: currentRows.length
              });
              
              if (row._isAiGenerated && row.material) {
                aiRowsToProcess.push({ idx, row });
              } else {
                console.log(`⏭️ SKIPPING row ${idx}: not AI generated or no material`);
              }
            });
            
            // Process AI rows with callbacks outside of setRows - use setRows to ensure fresh state
            setTimeout(() => {
              setRows(freshRows => {
                console.log(`🔄 CALLBACK PROCESSING: Working with ${freshRows.length} fresh rows`);
                
                aiRowsToProcess.forEach(({ idx, row }) => {
                  console.log(`🎯 ATTEMPTING material selection trigger for row ${idx}:`, {
                    family: row.material?.family,
                    label: row.material?.label,
                    unitTypeExists: row.unitType !== undefined,
                    freshRowExists: !!freshRows[idx]
                  });
                  
                  try {
                    if (row.unitType !== undefined && freshRows[idx]) {
                      console.log(`✅ TRIGGERING category context for row ${idx} directly`);
                      
                      // Set category context directly instead of calling onMaterialSelect
                      if (row.material?.family || row.material?.type || row.material?.category) {
                        const category = row.material.family || row.material.type || row.material.category;
                        setMaterialCategoryContext(prev => ({
                          ...prev,
                          [idx]: category
                        }));
                        console.log(`🏷️ DIRECT category context set for row ${idx}: ${category}`);
                      }
                    } else {
                      console.warn(`⚠️ ROW ${idx} not ready - using fallback category setting`);
                      // Just set the category context manually if row isn't ready
                      if (row.material?.family || row.material?.type || row.material?.category) {
                        const category = row.material.family || row.material.type || row.material.category;
                        setMaterialCategoryContext(prev => ({
                          ...prev,
                          [idx]: category
                        }));
                        console.log(`🏷️ FALLBACK category context set for row ${idx}: ${category}`);
                      }
                    }
                  } catch (error) {
                    console.error(`❌ ERROR setting category context for row ${idx}:`, error);
                    // Fallback to manual category setting
                    if (row.material?.family || row.material?.type || row.material?.category) {
                      const category = row.material.family || row.material.type || row.material.category;
                      setMaterialCategoryContext(prev => ({
                        ...prev,
                        [idx]: category
                      }));
                      console.log(`🏷️ ERROR FALLBACK category context set for row ${idx}: ${category}`);
                    }
                  }
                });
                
                return freshRows; // Don't modify rows, just set category context
              });
            }, 100); // Small delay to avoid setRows conflicts
            
            return currentRows; // Don't change rows, just identify AI rows
          });
        };
        
        triggerCallbacks();
      }, 500); // Longer delay to ensure rows are fully set
      
      // Refresh material options to include newly added materials
      await refreshMaterialOptions();
      
      // CRITICAL: Trigger weight recalculation for all AI-generated rows
      setTimeout(() => {
        setRows(currentRows => {
          console.log(`🔄 TRIGGERING weight recalculation for ${currentRows.length} rows`);
          let updatedRows = [...currentRows];
          
          // Recalculate weights for all AI-generated rows
          currentRows.forEach((row, idx) => {
            if (row._isAiGenerated) {
              console.log(`⚖️ Recalculating weight for AI row ${idx}: ${row.material?.label || 'unknown'}`);
              updatedRows = recalcAt(updatedRows, idx);
            }
          });
          
          return updatedRows;
        });
      }, 200); // Delay to ensure category contexts are set
      
      // Show success message
      alert(`Successfully added ${selectedItems.length} BOM items from AI analysis!`);
      
    } catch (error) {
      console.error('Error accepting AI BOM items:', error);
      alert(`Error adding BOM items: ${error.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  /** Find best matching material in the database using fuzzy matching */
  const findBestMaterialMatch = async (aiItem) => {
    try {
      console.log(`Finding match for AI item:`, aiItem);
      
      // Fetch materials directly from API for reliable matching
      const response = await jfetch(`${API_BASE}/api/materials?limit=1000`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response?.ok || !response?.materials?.length) {
        console.warn('No materials found in database');
        return null;
      }

      const allMaterials = response.materials;
      console.log(`Found ${allMaterials.length} materials to match against`);

      // IMPORTANT: Normalize AI description to match Supabase format
      const aiDescription = aiItem.item || aiItem.material; // Use item first (should be proper format now)
      const aiSize = (aiItem.size || '').toLowerCase().trim();
      const aiGrade = (aiItem.grade || '').toLowerCase().trim();
      
      console.log(`Matching: description="${aiDescription}", size="${aiSize}", grade="${aiGrade}"`);
      
      // Enhanced format matching - look for exact item matches first
      let exactMatch = allMaterials.find(material => {
        const matDesc = (material.description || '').toLowerCase();
        const matSize = (material.size || '').toLowerCase(); // Use size field for matching
        const aiDesc = aiDescription.toLowerCase();
        
        // Only log pipe comparisons to reduce noise
        if (aiDesc.includes('sch')) {
          console.log(`🔍 PIPE: AI "${aiDesc}" vs DB "${matSize}" (${material.family})`);
        }
        
        // Direct size match (most reliable) - must be EXACT match
        if (matSize === aiDesc) {
          console.log(`✅ EXACT SIZE MATCH: "${aiDesc}" === "${matSize}"`);
          return true;
        }
        
        // For pipes, ensure exact size matching (prevent "2 SCH 40" from matching "1/2 SCH 40")
        if (aiDesc.includes('sch') && matSize.includes('sch')) {
          console.log(`🔧 PIPE LOGIC: AI="${aiDesc}" vs DB="${matSize}"`);
          // Split and compare each part
          const aiParts = aiDesc.trim().split(/\s+/);
          const matParts = matSize.trim().split(/\s+/);
          
          console.log(`📊 Parts: AI=[${aiParts.join(',')}] vs DB=[${matParts.join(',')}]`);
          
          // Must have same number of parts and each part must match exactly
          if (aiParts.length === matParts.length) {
            const exactMatch = aiParts.every((part, index) => part === matParts[index]);
            console.log(`🎯 Parts match: ${exactMatch}`);
            if (exactMatch) return true;
          }
        }
        
        // Direct description match (fallback)
        if (matDesc === aiDesc) {
          console.log(`✅ EXACT DESC MATCH: "${aiDesc}" === "${matDesc}"`);
          return true;
        }
        
        // Format variations - try to match common patterns
        if (aiDesc.includes('channel') || aiDesc.startsWith('c')) {
          // Try to match C-Channel formats: "C3x4.1" vs "c3x4.1"
          const cPattern = aiDesc.match(/c[\s]*(\d+(?:\.\d+)?)[\s]*x[\s]*(\d+(?:\.\d+)?)/i);
          if (cPattern && matDesc.includes(`c${cPattern[1]}x${cPattern[2]}`)) return true;
        }
        
        if (aiDesc.includes('angle') || aiDesc.startsWith('l')) {
          // Try to match Angle formats: "L4x3x1/4" variations
          const lPattern = aiDesc.match(/l[\s]*(\d+(?:[.\-]\d+)?)[\s]*x[\s]*(\d+(?:[.\-]\d+)?)[\s]*x[\s]*(\d+(?:\/\d+)?)/i);
          if (lPattern && matDesc.includes(`l${lPattern[1]}x${lPattern[2]}x${lPattern[3]}`)) return true;
        }
        
        if (aiDesc.includes('pipe') || aiDesc.match(/\d+\s*(sch|std|xh|xs)/i)) {
          // Try to match Pipe formats: "2 SCH 40" variations
          const pipePattern = aiDesc.match(/(\d+(?:[.\-\/]\d+)?)\s*(?:inch|in|")?[\s]*(sch|std|xh|xs)[\s]*(\d+)?/i);
          if (pipePattern) {
            const size = pipePattern[1];
            const schedule = pipePattern[2].toLowerCase();
            const number = pipePattern[3] || '';
            const pipeFormat = `${size} ${schedule}${number ? ' ' + number : ''}`.trim().toLowerCase();
            
            // EXACT match against original format
            if (matSize === pipeFormat || matDesc === pipeFormat) {
              console.log(`✅ EXACT PIPE FORMAT MATCH: "${pipeFormat}" === "${matSize}" or "${matDesc}"`);
              return true;
            }
            
            // Also try to match against cleaned format (size only) for new cleaned materials
            const cleanSizeWithQuotes = size.includes('/') ? `${size}"` : `${size}"`;
            const cleanPipeFormat = `pipe - ${cleanSizeWithQuotes}`.toLowerCase();
            if (matSize === cleanPipeFormat || matDesc === cleanPipeFormat) {
              console.log(`✅ CLEANED PIPE FORMAT MATCH: AI "${pipeFormat}" matches clean "${cleanPipeFormat}"`);
              return true;
            }
          }
        }
        
        return false;
      });
      
      if (exactMatch) {
        console.log(`🎯 EXACT MATCH FOUND:`, exactMatch);
        return {
          label: `${exactMatch.family} - ${exactMatch.size}${exactMatch.grade ? ` (${exactMatch.grade})` : ''}`,
          value: `${exactMatch.family}|${exactMatch.size}${exactMatch.grade ? `|${exactMatch.grade}` : ''}`,
          raw: exactMatch,
          source: 'server-catalog',
          group: 'Materials Catalog (from Database)',
          type: exactMatch.family,
          family: exactMatch.family,
          category: exactMatch.family,
          size: exactMatch.size,
          grade: exactMatch.grade,
          description: exactMatch.description
        };
      } else {
        console.log(`❌ NO EXACT MATCH for "${aiItem}"`);
        
        // Log potential pipe matches for debugging - show what 2" pipes are available
        if (aiItem.toLowerCase().includes('2') && aiItem.toLowerCase().includes('sch')) {
          const twoInchPipes = allMaterials.filter(m => 
            (m.description && m.description.toLowerCase().includes('2') && m.description.toLowerCase().includes('sch')) || 
            (m.size && m.size.toLowerCase().includes('2') && m.size.toLowerCase().includes('sch'))
          ).slice(0, 10); // First 10 matches
          
          console.log(`🔍 Available 2" pipe materials in database:`, 
            twoInchPipes.map(m => ({ 
              id: m.id,
              desc: m.description, 
              size: m.size, 
              grade: m.grade 
            }))
          );
        }
      }
      
      // If no exact match, fall back to scoring system
      console.log('No exact match found, using scoring system...');
      
      // If no exact match, fall back to scoring system
      console.log('No exact match found, using scoring system...');
      
      // Find best match using multiple criteria  
      let bestMatch = null;
      let bestScore = 0;

      for (const material of allMaterials) {
        let score = 0;
        const matFamily = (material.family || material.type || '').toLowerCase();
        const matSize = (material.size || '').toLowerCase();
        const matGrade = (material.grade || '').toLowerCase();
        const matDesc = (material.description || '').toLowerCase();
        const aiDescLower = aiDescription.toLowerCase();

        // Family/type matching based on description content
        if (aiDescLower.includes('channel') && (matFamily.includes('channel') || matDesc.includes('channel'))) score += 40;
        else if (aiDescLower.includes('angle') && (matFamily.includes('angle') || matDesc.includes('angle'))) score += 40;
        else if (aiDescLower.includes('pipe') && (matFamily.includes('pipe') || matDesc.includes('pipe'))) score += 40;
        else if (aiDescLower.includes('flange') && (matFamily.includes('flange') || matDesc.includes('flange'))) score += 40;
        else if (aiDescLower.includes('plate') && (matFamily.includes('plate') || matDesc.includes('plate'))) score += 40;
        else if (matDesc.includes('steel') || matFamily.includes('steel')) score += 10;

        // Size matching (high weight)
        if (aiSize && matSize) {
          if (aiSize === matSize) score += 35;
          // For pipes, be more careful with partial matching to avoid "2" matching "1/2"  
          else if (aiDescLower.includes('sch') && matDesc.includes('sch')) {
            // Pipe-specific logic: ensure size numbers match exactly, not as substrings
            const aiSizeNum = aiSize.match(/^(\d+(?:\/\d+)?)/)?.[1];
            const matSizeNum = matSize.match(/^(\d+(?:\/\d+)?)/)?.[1];
            if (aiSizeNum && matSizeNum && aiSizeNum === matSizeNum) {
              score += 25; // Good pipe size match
            }
            // Don't give points for substring matches on pipes
          }
          else if (aiSize.includes('3') && matSize.includes('3')) score += 25; // 3 inch variations
          else if (matSize.includes(aiSize) || aiSize.includes(matSize)) score += 15;
        }

        // Grade matching (high weight)
        if (aiGrade && matGrade) {
          if (aiGrade === matGrade) score += 30;
          else if (matGrade.includes(aiGrade) || aiGrade.includes(matGrade)) score += 15;
        }

        // Description/material type matching
        const aiWords = aiDescLower.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
        const matWords = matDesc.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
        
        for (const aiWord of aiWords) {
          for (const matWord of matWords) {
            if (aiWord === matWord) score += 10;
            else if (aiWord.includes(matWord) || matWord.includes(aiWord)) score += 5;
          }
        }

        // Special matches for common terms
        if (aiDescLower.includes('weld neck') && matDesc.includes('weld neck')) score += 20;
        if (aiDescLower.includes('sch') && matDesc.includes('sch')) score += 15;

        console.log(`Material ${material.id}: ${matFamily} ${matSize} ${matGrade} - Score: ${score}`);

        if (score > bestScore && score >= 30) { // Higher threshold for better matching
          bestScore = score;
          bestMatch = material;
        }
      }

      if (bestMatch) {
        console.log(`✅ MATCH FOUND! Score: ${bestScore}`, bestMatch);
        
        // Convert to the format expected by the form
        const formattedMatch = {
          label: `${bestMatch.family} - ${bestMatch.size}${bestMatch.grade ? ` (${bestMatch.grade})` : ''}`,
          value: `${bestMatch.family}|${bestMatch.size}${bestMatch.grade ? `|${bestMatch.grade}` : ''}`,
          raw: bestMatch,
          source: 'server-catalog',
          group: 'Materials Catalog (from Database)',
          type: bestMatch.family,
          family: bestMatch.family,
          category: bestMatch.family,
          size: bestMatch.size,
          grade: bestMatch.grade,
          description: bestMatch.description
        };
        
        return formattedMatch;
      } else {
        console.log(`❌ No match found for "${aiDescription}" (highest score: ${bestScore})`);
      }

      return null;
    } catch (error) {
      console.error('Error in material matching:', error);
      return null;
    }
  };

  /** Clean and standardize material descriptions to prevent database issues */
  const cleanMaterialDescription = (description) => {
    if (!description) return description;
    
    let cleaned = description;
    
    // Remove problematic non-standard terms
    const problematicTerms = /\b(black|white|regular|standard|normal|plain)\b/gi;
    cleaned = cleaned.replace(problematicTerms, '').trim();
    
    // Clean up multiple spaces and commas
    cleaned = cleaned.replace(/,\s*,/g, ','); // Remove double commas
    cleaned = cleaned.replace(/\s+/g, ' '); // Multiple spaces to single space
    cleaned = cleaned.replace(/,\s*$/, ''); // Remove trailing comma
    cleaned = cleaned.replace(/^,\s*/, ''); // Remove leading comma
    
    // Standardize pipe descriptions
    if (cleaned.toLowerCase().includes('pipe')) {
      // Add SCH 40 if no schedule specified
      if (!cleaned.match(/sch\s*\d+/i)) {
        cleaned = cleaned.replace(/(\d+\"\s*)/i, '$1 SCH 40');
      }
      // Ensure proper format: "Pipe, Carbon Steel, 2\" SCH 40"
      if (!cleaned.toLowerCase().includes('carbon steel') && !cleaned.toLowerCase().includes('stainless')) {
        cleaned = cleaned.replace(/^pipe/i, 'Pipe, Carbon Steel,');
      }
    }
    
    return cleaned.trim();
  };

  /** Add new material to the database */
  const addNewMaterialToDatabase = async (aiItem) => {
    try {
      // Determine material family and create proper description based on the AI item
      let family = 'Misc';
      let description = cleanMaterialDescription(aiItem.item || aiItem.material);  // Clean the description first!
      let unitType = 'each';
      
      console.log('AI PROCESSING:', { 
        original: aiItem.item, 
        cleaned: description, 
        material: aiItem.material 
      }); // DEBUG
      
      const itemLower = (description || '').toLowerCase(); // Use cleaned description
      const materialLower = (aiItem.material || '').toLowerCase();
      
      // Enhanced material categorization using cleaned description
      if (itemLower.includes('pipe') || materialLower.includes('pipe')) {
        family = 'Pipe';
        unitType = 'length';
        // Use cleaned description - problematic terms already removed
        description = description;
      } else if (itemLower.includes('flange') || materialLower.includes('flange')) {
        family = 'Flange';
        unitType = 'each';
        // Use cleaned description
        description = description;
      } else if (itemLower.includes('channel') || materialLower.includes('channel')) {
        family = 'Channel';
        unitType = 'length';
        // Use cleaned description
        description = description;
      } else if (itemLower.includes('angle') || materialLower.includes('angle')) {
        family = 'Angle';
        unitType = 'length';
        // Use cleaned description
        description = description;
      } else if (itemLower.includes('tee') || materialLower.includes('tee')) {
        family = 'Tee';
        unitType = 'each';
        // Use cleaned description
        description = description;
      } else if (itemLower.includes('reducer') || materialLower.includes('reducer')) {
        family = 'Reducer';
        unitType = 'each';
        // Use cleaned description
        description = description;
      } else if (itemLower.includes('plate') || materialLower.includes('plate')) {
        family = 'Plate';
        unitType = 'area';
        // Use cleaned description
        description = description;
      } else if (itemLower.includes('angle') || materialLower.includes('angle')) {
        family = 'Angle';
        unitType = 'length';
        // Use AI's description if detailed enough, otherwise construct it
        description = aiItem.item;
      } else if (itemLower.includes('beam') || materialLower.includes('beam')) {
        family = 'Beam';
        unitType = 'length';
        // Use AI's description if detailed enough, otherwise construct it
        description = aiItem.item;
      } else if (itemLower.includes('bolt') || itemLower.includes('stud') || materialLower.includes('bolt')) {
        family = 'Hardware';
        unitType = 'each';
        // Use AI's description if detailed enough, otherwise construct it
        description = aiItem.item;
      } else if (itemLower.includes('gasket') || materialLower.includes('gasket')) {
        family = 'Hardware';
        unitType = 'each';
        // Use AI's description if detailed enough, otherwise construct it
        description = aiItem.item;
      } else {
        // For weldments and custom items, use the AI item description directly
        family = 'Misc';
        unitType = 'each';
        description = aiItem.item || aiItem.material;
      }

      // Estimate weight based on family and size if possible
      let weightPerFt = null;
      if (family === 'Pipe' && aiItem.size) {
        // Extract schedule from the AI item if available
        const schedule = aiItem.schedule || aiItem.grade || 'SCH 40';
        weightPerFt = estimatePipeWeight(aiItem.size, schedule);
      }

      const newMaterial = {
        family: family,  // This will be mapped to 'type' field in backend
        size: aiItem.size || '',
        unit_type: unitType,
        grade: aiItem.grade || '',
        weight_per_ft: weightPerFt,
        description: description,
        notes: `Added via AI BOM extraction on ${new Date().toISOString().split('T')[0]}`,
        // Add price estimation based on material type
        price_per_unit: family === 'Pipe' ? null : 
                       family === 'Flange' ? 50 : 
                       family === 'Elbow' || family === 'Tee' ? 25 : null
      };

      console.log('Adding new material to database:', newMaterial);

      // POST to materials API
      const response = await jfetch(`${API_BASE}/api/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial),
        credentials: 'include',
      });

      if (response && response.id) {
        // Create option object for the new material that matches existing format
        const newOption = {
          label: `${newMaterial.family} - ${description}`,
          value: `${newMaterial.family}_${newMaterial.size}_${newMaterial.grade}`.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '_'),
          raw: { ...newMaterial, id: response.id },
          source: 'server-catalog',
          group: 'Materials Catalog (from Supabase)',
          type: newMaterial.family,
          family: newMaterial.family,
          category: newMaterial.family,
          size: newMaterial.size,
          grade: newMaterial.grade,
          description: description,
          unit_type: newMaterial.unit_type,
          weight_per_ft: newMaterial.weight_per_ft
        };

        console.log('Successfully added material to database:', newOption);
        return newOption;
      } else {
        throw new Error('Failed to add material to database - no ID returned');
      }

    } catch (error) {
      console.error('Error adding material to database:', error);
      // Return a basic material object even if database addition fails
      // Get family from earlier determination or default
      const itemLower = (aiItem.item || aiItem.material || '').toLowerCase();
      let fallbackFamily = 'Misc';
      if (itemLower.includes('pipe')) fallbackFamily = 'Pipe';
      else if (itemLower.includes('channel')) fallbackFamily = 'Channel';
      else if (itemLower.includes('angle')) fallbackFamily = 'Angle';
      else if (itemLower.includes('flange')) fallbackFamily = 'Flange';
      
      return {
        type: aiItem.material,
        family: fallbackFamily,
        category: fallbackFamily,
        size: aiItem.size,
        grade: aiItem.grade,
        label: `${fallbackFamily} - ${aiItem.item}`,
        value: `${fallbackFamily}_${aiItem.size}`.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '_'),
        description: aiItem.item,
        _newMaterial: true,
        _addFailed: true
      };
    }
  };

  /** Get stored pipe weight override or calculate from formula */
  const getPipeWeight = (size, schedule) => {
    if (!size || !schedule) return null;
    
    // Create storage key
    const key = `pipe_weight_${size}_${schedule}`.replace(/[^\w]/g, '_');
    
    // Check for stored override
    const stored = localStorage.getItem(key);
    if (stored) {
      const weight = parseFloat(stored);
      if (!isNaN(weight)) {
        console.log(`🔧 Using USER OVERRIDE: ${size} ${schedule} = ${weight} lbs/ft`);
        return weight;
      }
    }
    
    // Calculate using formula as fallback
    const calculated = estimatePipeWeight(size, schedule);
    console.log(`🔧 Using CALCULATED weight: ${size} ${schedule} = ${calculated} lbs/ft`);
    return calculated;
  };

  /** Store pipe weight override for future use */
  const storePipeWeight = (size, schedule, weight) => {
    if (!size || !schedule || isNaN(weight)) return;
    
    const key = `pipe_weight_${size}_${schedule}`.replace(/[^\w]/g, '_');
    localStorage.setItem(key, weight.toString());
    console.log(`🔧 Stored pipe weight: ${size} ${schedule} = ${weight} lbs/ft`);
  };

  /** Calculate pipe weight using simplified formula (users can override for accuracy) */
  const estimatePipeWeight = (size, schedule = 'SCH 40') => {
    // Extract numeric size (handle fractions)
    let sizeNum;
    if (typeof size === 'string') {
      if (size.includes('/')) {
        const [num, den] = size.split('/').map(Number);
        sizeNum = num / den;
      } else {
        sizeNum = parseFloat(size.replace(/[^\d.]/g, ''));
      }
    } else {
      sizeNum = parseFloat(size);
    }
    
    if (isNaN(sizeNum)) return null;
    
    // Simplified estimation - users will override with exact weights as needed
    // This provides reasonable starting values
    const scheduleMultiplier = {
      'SCH 5': 0.5,
      'SCH 10': 0.7,
      'SCH 20': 1.0,
      'SCH 30': 1.2,
      'SCH 40': 1.5,
      'SCH 60': 2.0,
      'SCH 80': 2.5,
      'STD': 1.5,
      'XS': 2.5,
      'XH': 3.0,
      'XXS': 4.0
    };
    
    const multiplier = scheduleMultiplier[schedule.toUpperCase()] || 1.5;
    
    // Basic formula: roughly proportional to size squared times wall thickness factor
    const estimatedWeight = sizeNum * sizeNum * multiplier * 0.8;
    
    console.log(`� Pipe estimate: ${sizeNum}" ${schedule} = ${estimatedWeight.toFixed(3)} lbs/ft (users can override)`);
    
    return Math.round(estimatedWeight * 1000) / 1000; // Round to 3 decimal places
  };

  /** Refresh material options after adding new materials */
  const refreshMaterialOptions = async () => {
    try {
      const response = await jfetch(`${API_BASE}/api/materials`);
      const rowsRaw = response?.materials || response || []; // Fix: handle API response structure
      
      const genericPlateOptions = buildPlateOptions().map(o => ({
        ...o,
        source: 'generic-plate',
        group: 'Generic Plate (Thickness Catalog)'
      }));

      const serverOptions = (rowsRaw || []).map(m => {
        const opt = augmentOption(toMatOption(m));
        return {
          ...opt,
          raw: m,
          source: 'server-catalog',
          group: 'Materials Catalog (from JSON)'
        };
      });

      const sheetOptions = buildSheetOptions().map(o => ({ ...o, source: 'generic-sheet', group: 'Materials Catalog (from JSON)' }));

      const uniqBy = (arr, keyFn) => {
        const seen = new Set();
        return arr.filter(x => {
          const k = keyFn(x);
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
      };

      const genericPlateUnique = uniqBy(genericPlateOptions, o => o.value);
      const serverUnique = uniqBy([...serverOptions, ...sheetOptions], o => o.value);

      const groupedOptions = [
        { label: 'Generic Plate (Thickness Catalog)', options: genericPlateUnique },
        { label: 'Materials Catalog (from JSON)',     options: serverUnique }
      ];

      setMaterialOptions(groupedOptions);
    } catch (error) {
      console.warn('Failed to refresh material options:', error);
    }
  };

  const addProcess = (i) => { const p = { name: '', hours: '', minutes: '', rate: '', cost: '0.00' }; setRow(i, { processes: [...rows[i].processes, p] }); };
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
    // Support multiple length fields: legacy `lengthFt` or newer `length_value` with `length_unit`.
    const lengthValueToFeet = (row) => {
      const lf = num(row.lengthFt);
      if (lf > 0) return lf;
      const lv = num(row.length_value);
      if (lv <= 0) return 0;
      const lu = (row.length_unit || 'in').toString().toLowerCase();
      if (lu === 'in' || lu === '"' ) return inToFt(lv);
      if (lu === 'ft' || lu === "'") return lv;
      if (lu === 'm' || lu === 'meter' || lu === 'metre') return lv * 3.28084;
      return lv; // assume feet fallback
    };
    const lenFt = lengthValueToFeet(r);
    let wpf = num(m?.weight_per_ft);
    
    // For pipes, recalculate weight per foot based on current schedule
    if (m?.familyKey === 'Pipe' || m?.family === 'Pipe' || (m?.type && m.type.toLowerCase().includes('pipe'))) {
      const schedule = r.schedule || 'SCH 40';
      const pipeSize = m?.size || m?.cleanSize || '';
      const recalculatedWeight = getPipeWeight(pipeSize, schedule);
      if (recalculatedWeight) {
        wpf = recalculatedWeight;
        console.log(`🔧 Pipe weight: ${pipeSize} ${schedule} = ${wpf} lbs/ft`);
      }
    }

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
      const hours = num(p.hours) || 0;
      const minutes = num(p.minutes) || 0;
      const totalHours = hours + (minutes / 60); // Convert minutes to decimal hours
      const rate = num(p.rate);
      const c = totalHours * rate; 
      proc += c;
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
  // Support grouped option objects (with .source and .raw) or the existing option shape
  const normalized = selected && selected.raw ? { ...selected, ...augmentOption(selected) } : augmentOption(selected);
  const selectedAug = normalized;
  
  // Safety check for row existence
  if (!rows[i]) {
    console.warn(`⚠️ onMaterialSelect: Row ${i} does not exist in rows array (length: ${rows.length})`);
    return;
  }
  
  const unitCurrent = rows[i].unitType;
  const famKey = normalizeFamily(selectedAug?.type || selectedAug?.category || selectedAug?.family || '');
  const patch = { material: selectedAug };
  
  console.log(`🎯 onMaterialSelect CALLED for row ${i}:`, {
    selectedFamily: selectedAug?.family,
    selectedLabel: selectedAug?.label,
    currentUnit: unitCurrent,
    rowExists: !!rows[i]
  });
  
  // Remember the category context for this row
  if (selectedAug?.family || selectedAug?.type || selectedAug?.category) {
    const category = selectedAug?.family || selectedAug?.type || selectedAug?.category;
    setMaterialCategoryContext(prev => ({
      ...prev,
      [i]: category
    }));
  }
  
    // Handle unit type changes based on material family
    if (famKey === 'Plate' || famKey === 'Sheet') {
      // Switching TO plate material - set plate-specific fields
      if (unitCurrent !== 'Sq In') {
        patch.unitType = 'Sq In';
        patch.lengthIn = '';
        patch.widthIn = '';
      }
    } else {
      // Switching FROM plate to non-plate material - reset plate-specific fields
      if (unitCurrent === 'Sq In') {
        patch.unitType = 'Per Foot'; // Default for non-plate materials
        patch.lengthIn = '';
        patch.widthIn = '';
        patch.thicknessIn = ''; // Clear plate thickness
      }
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

  /* --------------------------- Save payload + handler --------------------------- */
  function buildPayloadFromMeta(statusOverride) {
    return {
      quote_no: (meta.quoteNo || '').trim() || undefined,
      customer_name: (meta.customerName || '').trim(),
      date: (meta.date || '').trim(),
      description: (meta.description || '').trim() || null,
      requested_by: (meta.requestor || '').trim() || null,
      estimator: (meta.estimatedBy || '').trim() || null,
      status: statusOverride || 'Draft',
      sales_order_no: null,
      rev: Number.isFinite(Number(meta.revision)) ? Number(meta.revision) : 0
    };
  }

  // UPDATED: save full app state + ensure quote record + init folders (no layout changes)
  async function handleSave(nextStatus = 'Draft', { goto = 'stay' } = {}) {
    if (saving) return;

    if (!meta.customerName?.trim()) { alert('Customer Name is required.'); return; }
    if (!meta.date?.trim()) { alert('Date is required.'); return; }

    const status = /final/i.test(nextStatus) ? 'final' : 'draft';

    try {
      setSaving(true);

      let effectiveQuoteNo = (meta.quoteNo || routeQuoteNo || '').trim();

      if (!effectiveQuoteNo) {
        const out = await saveQuoteAPI(buildPayloadFromMeta('Draft'));
        if (out?.quote_no) {
          effectiveQuoteNo = out.quote_no;
          setMeta(m => ({ ...m, quoteNo: effectiveQuoteNo }));
        }
      }

      const saveData = { meta: { ...meta, quoteNo: effectiveQuoteNo }, rows, nde };
      console.log('💾 SAVING COMPLETE FORM DATA:', {
        meta: Object.keys(saveData.meta).length + ' meta fields',
        rows: saveData.rows.length + ' material rows', 
        nde: saveData.nde.length + ' NDE items',
        totalFormData: JSON.stringify(saveData).length + ' characters'
      });
      
      const result = await saveQuoteMetaAPI(saveData, status);
      console.log('💾 SAVE RESULT:', result);
      effectiveQuoteNo = result.quoteNo || result.quote_no || effectiveQuoteNo;
      console.log('💾 EFFECTIVE QUOTE NO AFTER SAVE:', effectiveQuoteNo);

      // Ensure the folder tree exists for this quote (idempotent).
      // Use the shared helper once to avoid duplicate requests.
      try {
        await initFoldersAPI({
          quoteNo: effectiveQuoteNo,
          customerName: (meta.customerName || '').trim(),
          description: (meta.description || '').trim(),
        });
      } catch (e) {
        console.warn('init-folders warning:', e?.message || e);
      }

      if (effectiveQuoteNo && effectiveQuoteNo !== meta.quoteNo) {
        setMeta(m => ({ ...m, quoteNo: effectiveQuoteNo }));
      }

      // Navigate
      if (goto === 'files' && effectiveQuoteNo) {
        navigate(`/quotes/${encodeURIComponent(effectiveQuoteNo)}/files`);
      } else if (goto === 'log') {
        navigate('/quotes/log');
      } else {
        alert(`${status === 'final' ? 'Finalized' : 'Saved'}: ${effectiveQuoteNo}`);
      }
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  /* ------------------------------- UI STYLES ------------------------------- */
  const container = { padding: '20px', maxWidth: '1200px', margin: 'auto', fontFamily: 'Arial, sans-serif', position: 'relative' };
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
      <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginBottom:10 }}>
        <button style={button} onClick={() => navigate('/dashboard')}>← Dashboard</button>
        <button style={button} onClick={() => navigate('/quotes/log')}>← Quote Log</button>
      </div>
      {/* ============================== STEP 1 ============================== */}
      {step === 1 && (
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', marginBottom: 6 }}>
            <h2 style={sectionTitle}>Step 1 — Quote Overview</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              {/* Quick Save buttons */}
              <button
                style={{ ...button, padding: '6px 10px', fontSize: 13 }}
                disabled={saving}
                onClick={() => handleSave('Draft', { goto: 'stay' })}
                title="Create a quote number now and come back later"
              >
                {saving ? 'Saving…' : 'Quick Save Draft'}
              </button>
              <button
                style={{ ...primary, padding: '6px 10px', fontSize: 13 }}
                disabled={saving}
                onClick={() => handleSave('Finalized', { goto: 'stay' })}
                title="Finalize & save the quote number quickly"
              >
                {saving ? 'Saving…' : 'Quick Finalize & Save'}
              </button>

              {/* Upload area boxed and aligned with buttons */}
              <div style={{ border: '2px solid #0b1220', borderRadius: 10, padding: 8, background: 'transparent', display: 'flex', alignItems: 'center', flexDirection: 'column', marginLeft: 4 }}>
                <FileUploadPad
                quoteNo={meta.quoteNo || routeQuoteNo || ''}
                subdir="drawings"
                accept=".pdf,.dxf,.dwg,.png,.jpg,.jpeg"
                multiple={true}
                customerName={meta.customerName || ''}
                onComplete={async (items) => {
                  console.log('QuoteForm: Upload complete callback, items:', items);
                  // Don't display uploaded files on the Quote form to avoid huge lists.
                  // Still refresh the server-side listing so the folder view shows them elsewhere.
                  try {
                    const q = (meta.quoteNo || routeQuoteNo || '').trim();
                    console.log('QuoteForm: Refreshing server files for quote:', q);
                    if (!q) return;
                    const list = await jfetch(`${API_BASE}/api/quotes/${encodeURIComponent(q)}/files`);
                    console.log('QuoteForm: Server files response:', list);
                    if (Array.isArray(list)) setServerFiles(list);
                  } catch (e) {
                    console.warn('Failed to refresh server files after upload:', e?.message || e);
                  }
                }}
                onError={(err) => console.error(err)}
                />
                <button
                  type="button"
                  onClick={() => navigate(`/quotes/customers/${encodeURIComponent(meta.customerName || pre.customerName || '')}/${encodeURIComponent(meta.quoteNo || routeQuoteNo || '')}/drawings`)}
                  className="mt-4 px-4 py-2 rounded-lg border bg-white shadow-sm hover:bg-gray-100"
                  style={{ marginTop: 8 }}
                >
                  Open Drawings Folder
                </button>
              </div>
            </div>
          </div>

          {/* Uploaded files list */}
          {(SHOW_UPLOADED_IN_QUOTEFORM && (serverFiles.length > 0 || uploads.length > 0)) && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Uploaded:</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(() => {
                  // Merge serverFiles (persisted) with transient uploads, avoiding obvious duplicates by filename
                  const combined = [
                    ...serverFiles,
                    ...uploads.filter(u => !serverFiles.some(sf => (sf.name || '') === (u.name || u.originalname || u.filename)))
                  ];
                  return combined.map((u, idx) => {
                    const filename = u.name || u.originalname || u.fileName || u.filename || '';
                    // Try to find a 256 preview URL (backend includes `previews` array or preview keys)
                    const previewCandidate = (u.previews && Array.isArray(u.previews) && (u.previews.find(p => String(p.size_key) === '256') || u.previews[0])) || null;
                    const previewUrl = previewCandidate?.url || u.preview256 || null;
                    // link href: prefer absolute URL if it's same-origin or points to configured API host; otherwise produce proxied relative path
                    const pageOrigin = window.location.origin;
                    let href = '';
                    if (u?.url && String(u.url).startsWith('http')) {
                      try {
                        const parsed = new URL(u.url);
                        const apiBaseHost = (API_BASE && API_BASE.startsWith('http')) ? new URL(API_BASE).host : null;
                        if (parsed.origin === pageOrigin || (apiBaseHost && parsed.host === apiBaseHost)) href = u.url;
                      } catch (e) { href = ''; }
                    }
                    if (!href) {
                      href = API_BASE ? `${API_BASE}/api/quote-files/${encodeURIComponent(meta.quoteNo || routeQuoteNo)}/files/${encodeURIComponent(filename)}` : `/api/quote-files/${encodeURIComponent(meta.quoteNo || routeQuoteNo)}/files/${encodeURIComponent(filename)}`;
                    }
                    if (href.startsWith('https://localhost') || href.startsWith('https://127.0.0.1')) href = href.replace(/^https:/, 'http:');

                    return (
                      <div
                        key={`${filename}-${idx}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          border: '1px solid #e5e7eb',
                          borderRadius: 8,
                          padding: '6px 10px'
                        }}
                        onMouseEnter={() => { if (previewUrl) setHoverPreviewUrl(previewUrl); }}
                        onMouseLeave={() => { setHoverPreviewUrl(null); }}
                      >
                        <a
                          href={href}
                          style={{ textDecoration: 'none', color: '#111', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                          title="View uploaded file"
                          onClick={(e) => { 
                            e.preventDefault(); 
                            setViewerFile(u); 
                            setViewerOpen(true); 
                          }}
                        >
                          {filename || 'file'}
                          {/* Inline small preview thumbnail when available and hovered */}
                          {previewUrl && hoverPreviewUrl === previewUrl && (
                            <img src={previewUrl} alt="preview" style={{ width: 128, height: 'auto', borderRadius: 6, objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }} />
                          )}
                        </a>
                        {/* Only allow removing transient uploads (not persisted server files) */}
                        {uploads.includes(u) && (
                          <button
                            type="button"
                            onClick={() => setUploads(prev => prev.filter(x => x !== u))}
                            title="Remove from this list"
                            style={{ border: 'none', background: 'transparent', color: '#b00020', cursor: 'pointer', fontWeight: 700 }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

            {/* File viewer modal */}
            <FileViewerModal open={viewerOpen} onClose={() => setViewerOpen(false)} file={viewerFile} quoteNo={meta.quoteNo || routeQuoteNo} />

          <div style={grid2}>
            <div>
              <label style={label}>Quote Number</label>
              <input
                style={input}
                value={meta.quoteNo}
                onChange={e=>setMeta(m=>({...m,quoteNo:e.target.value}))}
                placeholder="(Optional) leave blank to auto-generate"
              />
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
              <button
                style={{ 
                  ...button, 
                  background: aiLoading ? '#9ca3af' : '#2563eb',
                  color: '#fff',
                  borderColor: aiLoading ? '#9ca3af' : '#2563eb'
                }}
                title="Generate BOM suggestions from quote attachments using AI"
                disabled={aiLoading}
                onClick={handleAiExtractBom}
              >
                {aiLoading ? '🤖 Analyzing...' : '🤖 AI Auto BOM'}
              </button>
              
              <button style={button} onClick={addRow}>+ Add Item</button>
              <button
                style={{...button, marginLeft: 8}}
                title="AI material search (non-functioning for now)"
                onClick={() => window.alert('AI Material Search feature coming soon!')}
              >
                AI Material Search
              </button>
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
                      <div 
                        style={{ flex: 1, position: 'relative' }}
                        onMouseEnter={(e) => {
                          // Add obvious hover-to-open behavior
                          const selectControl = e.currentTarget.querySelector('.react-select__control');
                          if (selectControl) {
                            selectControl.style.borderColor = '#2563eb';
                            selectControl.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.2)';
                            selectControl.style.transform = 'scale(1.01)';
                            selectControl.style.transition = 'all 0.2s ease';
                            // Auto-focus on hover to open dropdown
                            const input = selectControl.querySelector('input');
                            if (input && !input.matches(':focus')) {
                              setTimeout(() => input.focus(), 100);
                            }
                          }
                        }}
                        onMouseLeave={(e) => {
                          const selectControl = e.currentTarget.querySelector('.react-select__control');
                          if (selectControl) {
                            selectControl.style.borderColor = '';
                            selectControl.style.boxShadow = '';
                            selectControl.style.transform = '';
                            selectControl.style.transition = '';
                          }
                        }}
                        onClick={() => {
                          // Click to focus and open dropdown
                          const selectInput = document.querySelector(`#material-select-${i} input`);
                          if (selectInput) {
                            selectInput.focus();
                          }
                        }}
                      >
                        {/* Category context indicator */}
                        {materialCategoryContext[i] && (
                          <div style={{
                            position: 'absolute',
                            top: -8,
                            right: 8,
                            background: '#059669',
                            color: 'white',
                            fontSize: 10,
                            padding: '2px 6px',
                            borderRadius: 4,
                            zIndex: 10,
                            fontWeight: 'bold'
                          }}>
                            {materialCategoryContext[i]}
                          </div>
                        )}
                        
                        <Select
                          id={`material-select-${i}`}
                          options={materialOptions}
                          value={r.material}
                          onChange={(sel)=>onMaterialSelect(i, sel)}
                          isSearchable
                          filterOption={filterOption}
                          title={r.material?.label || r.material?.description || 'Select material'}
                          placeholder={
                            materialCategoryContext[i] 
                              ? `Search in ${materialCategoryContext[i]}...` 
                              : "Select material..."
                          }
                          noOptionsMessage={({ inputValue }) => 
                            inputValue && materialCategoryContext[i] 
                              ? `No ${materialCategoryContext[i]} materials found for "${inputValue}"`
                              : inputValue ? `No materials found for "${inputValue}". Try typing a category like "Pipe" or "Angle"` : "Start typing to search materials..."
                          }
                          onMenuOpen={() => {
                            // If we have a category context, pre-populate the search with it
                            if (materialCategoryContext[i] && !r.material) {
                              console.log(`🔍 Opening material dropdown for row ${i} with context: ${materialCategoryContext[i]}`);
                            }
                          }}
                          onInputChange={(inputValue, { action }) => {
                            // Remember partial category searches
                            if (action === 'input-change' && inputValue.length > 2) {
                              // Check if they're typing a category name
                              const categoryMatch = materialOptions.find(group => 
                                group.label && group.label.toLowerCase().includes(inputValue.toLowerCase())
                              );
                              if (categoryMatch && !materialCategoryContext[i]) {
                                setMaterialCategoryContext(prev => ({
                                  ...prev,
                                  [i]: inputValue
                                }));
                              }
                            }
                          }}
                          classNamePrefix="react-select"
                          styles={{
                            control: (provided, state) => ({
                              ...provided,
                              cursor: 'pointer',
                              minHeight: '36px',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: '#2563eb',
                                boxShadow: '0 0 0 1px #2563eb'
                              }
                            }),
                            menu: (provided) => ({
                              ...provided,
                              zIndex: 9999
                            }),
                            placeholder: (provided) => ({
                              ...provided,
                              fontStyle: materialCategoryContext[i] ? 'italic' : 'normal',
                              color: materialCategoryContext[i] ? '#059669' : '#9ca3af'
                            })
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Schedule (for pipes only) + Grade - Combined container */}
                  <div style={{display: 'flex', gap: 8}}>
                    {r.material?.family === 'Pipe' && (
                      <div style={{maxWidth: 120}}>
                        <div style={label}>Schedule</div>
                        <select
                          style={{...input, width: '100%'}}
                          value={r.schedule || ''}
                          onChange={e => setRow(i, { schedule: e.target.value })}
                        >
                          <option value="">-- Select --</option>
                          <option value="SCH 5">SCH 5</option>
                          <option value="SCH 10">SCH 10</option>
                          <option value="SCH 20">SCH 20</option>
                          <option value="SCH 30">SCH 30</option>
                          <option value="SCH 40">SCH 40</option>
                          <option value="SCH 60">SCH 60</option>
                          <option value="SCH 80">SCH 80</option>
                          <option value="SCH 100">SCH 100</option>
                          <option value="SCH 120">SCH 120</option>
                          <option value="SCH 140">SCH 140</option>
                          <option value="SCH 160">SCH 160</option>
                          <option value="STD">STD</option>
                          <option value="XS">XS</option>
                          <option value="XXS">XXS</option>
                        </select>
                        
                        {/* Weight/Ft field BELOW Schedule dropdown in same column */}
                        <div style={{ marginTop: 8 }}>
                          <div style={{...label, fontSize: 11}}>Weight/Ft</div>
                          <input
                            type="number"
                            step="0.001"
                            style={{...input, width: '100%', fontSize: 12}}
                            placeholder={`Est: ${getPipeWeight(r.material?.size, r.schedule)?.toFixed(3) || '0'}`}
                            value={getWeightOverride(r.material?.size, r.schedule) || ''}
                            onChange={e => {
                              const weight = parseFloat(e.target.value);
                              if (!isNaN(weight) && weight > 0) {
                                storeWeightOverride(r.material?.size, r.schedule, weight);
                                // Trigger immediate recalculation
                                setRow(i, {...r}, true); // true = recalc
                              } else if (e.target.value === '') {
                                // Clear override if empty - use same key format as storage functions
                                const key = `pipe_weight_${r.material?.size}_${r.schedule}`.replace(/[^\w]/g, '_');
                                localStorage.removeItem(key);
                                // Trigger immediate recalculation
                                setRow(i, {...r}, true); // true = recalc
                              } else {
                                // For partial/invalid entries, just update the display without storing
                                const updatedRow = {...r};
                                setRow(i, updatedRow, false);
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div style={{maxWidth: 140}}>
                      <div style={label}>Grade</div>
                      <select
                        style={{...input, width: '100%'}}
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
                        <option value="">-- Select --</option>
                        {gradeList.map(g => <option key={g} value={g}>{g}</option>)}
                        <option value="__CUSTOM__">Other (manual)</option>
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
                          <div style={label}>Length + Unit + Tol</div>
                          <LengthWithUnitAndTol row={r} onChange={(patch) => setRow(i, patch)} />
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
                        <div key={pIdx} style={{display:'grid', gridTemplateColumns:'1.2fr 0.5fr 0.5fr 1fr 0.6fr auto', gap:8, alignItems:'end', marginBottom:6}}>
                          <div>
                            <div style={label}>Process</div>
                            <select style={input} value={p.name} onChange={e=>setProcess(i, pIdx, { name: e.target.value })}>
                              <option value="">-- Select --</option>
                              {processCatalog.map(x => <option key={x} value={x}>{x}</option>)}
                            </select>
                          </div>
                          <div>
                            <div style={label}>Hours</div>
                            <input 
                              style={input} 
                              type="number"
                              min="0"
                              value={p.hours} 
                              onChange={e=>setProcess(i, pIdx, { hours: e.target.value })} 
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <div style={label}>Minutes</div>
                            <input 
                              style={input} 
                              type="number"
                              min="0" 
                              max="59"
                              value={p.minutes} 
                              onChange={e=>setProcess(i, pIdx, { minutes: Math.min(59, Math.max(0, e.target.value || 0)) })} 
                              placeholder="0"
                            />
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
                    const withMU = num(r.materialCost) * (1 + muPct / 100);
                    return (
                      <tr key={i}>
                        <td style={{ border:'1px solid #e5e7eb', padding:8 }}>{r.itemNo || (i+1)}</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8 }}>{r.qty || 0}</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8 }}>
                          {r.material?.type || ''}{r.material?.size ? ` • ${r.material.size}` : ''}
                        </td>
                        <td style={{ border:'1px solid #e7eb', padding:8 }}>{displayGrade(r.grade)}</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8 }}>{r.unitType}</td>
                        <td style={{ border:'1px solid #e5e7eb', padding:8 }}>
                                                   {r.unitType === 'Per Foot' && (`Length: ${r.lengthFt || 0} ft`)}
                          {r.unitType === 'Each' && ('Each')}
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
              <button
                style={button}
                disabled={saving}
                onClick={()=>handleSave('Draft', { goto: 'log' })}
                title="Save as Draft and return to Quote Log"
              >
                {saving ? 'Saving…' : 'Save Draft'}
              </button>
              <button
                style={primary}
                disabled={saving}
                onClick={()=>handleSave('Finalized', { goto: 'files' })}
                title="Finalize, save, and open the File Vault"
              >
                {saving ? 'Saving…' : 'Finalize & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Progress Modal - Available on all steps */}
      {console.log('🔎 Checking modal condition - showAiProgress:', showAiProgress)}
      {showAiProgress && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          backdropFilter: 'blur(2px)'
        }}>
          {console.log('🎯 AI Progress Modal is rendering! showAiProgress:', showAiProgress)}
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            maxWidth: 500,
            width: '90%',
            maxHeight: '80%',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            position: 'relative',
            zIndex: 100000
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>🤖 AI Analysis Progress</h2>
              <button 
                style={{ 
                  background: '#ef4444', 
                  color: '#fff', 
                  border: '1px solid #ef4444',
                  borderRadius: 6,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500
                }}
                onClick={() => {
                  setAiCancelled(true);
                  setShowAiProgress(false);
                  setAiLoading(false);
                }}
              >
                ⏹ STOP
              </button>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <div style={{ 
                fontSize: 16, 
                fontWeight: 500, 
                marginBottom: 12,
                color: aiAnalysisComplete ? '#10b981' : '#6b7280'
              }}>
                {aiProgressStatus}
              </div>
              
              <div style={{ 
                background: '#f8fafc', 
                borderRadius: 8, 
                padding: 16,
                maxHeight: 200,
                overflow: 'auto'
              }}>
                {aiProgressSteps.map((step, index) => (
                  <div key={index} style={{ 
                    marginBottom: 8, 
                    fontSize: 14,
                    fontFamily: 'monospace'
                  }}>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                style={{ 
                  background: aiAnalysisComplete ? '#10b981' : '#d1d5db', 
                  color: aiAnalysisComplete ? '#fff' : '#6b7280',
                  border: 'none',
                  borderRadius: 6,
                  padding: '12px 24px',
                  cursor: aiAnalysisComplete ? 'pointer' : 'not-allowed',
                  fontSize: 14,
                  fontWeight: 500
                }}
                disabled={!aiAnalysisComplete}
                onClick={() => {
                  console.log('🎯 View Results button clicked! aiAnalysisComplete:', aiAnalysisComplete);
                  console.log('🎯 Current aiBomResults:', aiBomResults);
                  if (aiAnalysisComplete) {
                    console.log('🎯 Setting showAiProgress to false and showAiBomReview to true');
                    setShowAiProgress(false);
                    setShowAiBomReview(true);
                  }
                }}
              >
                {aiAnalysisComplete ? '📋 View Results' : '⏳ Analyzing...'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI BOM Review Modal - Available on all steps */}
      {console.log('🔎 Checking AI BOM Review Modal condition - showAiBomReview:', showAiBomReview, 'aiBomResults:', !!aiBomResults)}
      {showAiBomReview && aiBomResults && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          {console.log('🎯 AI BOM Review Modal is rendering! showAiBomReview:', showAiBomReview)}
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            maxWidth: '90%',
            maxHeight: '90%',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>🤖 AI BOM Analysis Results</h2>
              <button 
                style={{ ...button, background: '#ef4444', color: '#fff', borderColor: '#ef4444' }}
                onClick={() => setShowAiBomReview(false)}
              >
                ✕ Close
              </button>
            </div>
            
            <div style={{ marginBottom: 16, padding: 12, background: '#f0f9ff', borderRadius: 8, border: '1px solid #0ea5e9' }}>
              <p style={{ margin: 0, fontSize: 14 }}>
                <strong>Analysis Summary:</strong> Found <strong>{aiBomResults.items.length}</strong> BOM items
                with <strong>{Math.round((aiBomResults.extraction.confidence || 0.7) * 100)}%</strong> confidence.
                Review and select items to add to your quote.
              </p>
            </div>

            <div style={{ maxHeight: 400, overflow: 'auto', marginBottom: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: 8, textAlign: 'left', fontSize: 12, fontWeight: 600 }}>Select</th>
                    <th style={{ padding: 8, textAlign: 'left', fontSize: 12, fontWeight: 600 }}>Material</th>
                    <th style={{ padding: 8, textAlign: 'left', fontSize: 12, fontWeight: 600 }}>Size</th>
                    <th style={{ padding: 8, textAlign: 'left', fontSize: 12, fontWeight: 600 }}>Schedule</th>
                    <th style={{ padding: 8, textAlign: 'left', fontSize: 12, fontWeight: 600 }}>Grade</th>
                    <th style={{ padding: 8, textAlign: 'left', fontSize: 12, fontWeight: 600 }}>Length</th>
                    <th style={{ padding: 8, textAlign: 'left', fontSize: 12, fontWeight: 600 }}>Width</th>
                    <th style={{ padding: 8, textAlign: 'left', fontSize: 12, fontWeight: 600 }}>Dims</th>
                    <th style={{ padding: 8, textAlign: 'left', fontSize: 12, fontWeight: 600 }}>Qty</th>
                    <th style={{ padding: 8, textAlign: 'left', fontSize: 12, fontWeight: 600 }}>Unit</th>
                    <th style={{ padding: 8, textAlign: 'left', fontSize: 12, fontWeight: 600 }}>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {aiBomResults.items.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: 8 }}>
                        <input 
                          type="checkbox" 
                          defaultChecked 
                          id={`ai-item-${index}`}
                          style={{ transform: 'scale(1.2)' }}
                        />
                      </td>
                      <td style={{ padding: 8, fontWeight: 500 }}>{item.material}</td>
                      <td style={{ padding: 8 }}>{item.size || '-'}</td>
                      <td style={{ padding: 8, color: '#059669', fontWeight: 500 }}>{item.schedule || '-'}</td>
                      <td style={{ padding: 8 }}>{item.grade || '-'}</td>
                      <td style={{ padding: 8, fontWeight: 500 }}>
                        {item.length_value ? 
                          `${item.length_value} ${item.length_unit || 'in'}` : 
                          (item.length ? `${item.length} ${item.lengthUnit || 'in'}` : '-')
                        }
                      </td>
                      <td style={{ padding: 8, fontWeight: 500 }}>
                        {item.width_value ? 
                          `${item.width_value} in` : 
                          (item.width ? `${item.width} in` : '-')
                        }
                      </td>
                      <td style={{ padding: 8, fontSize: 11 }}>
                        {item._dimension_validated ? 
                          <span style={{ color: '#059669', fontWeight: 600 }}>✅</span> :
                          item.dimensionMatch === false ?
                          <span style={{ color: '#dc2626', fontWeight: 600 }}>⚠️</span> :
                          <span style={{ color: '#6b7280' }}>-</span>
                        }
                      </td>
                      <td style={{ padding: 8 }}>{item.qty}</td>
                      <td style={{ padding: 8 }}>{item.unit}</td>
                      <td style={{ padding: 8 }}>
                        <span style={{ 
                          background: item._ai_confidence > 0.8 ? '#dcfce7' : item._ai_confidence > 0.6 ? '#fef3c7' : '#fed7d7',
                          color: item._ai_confidence > 0.8 ? '#166534' : item._ai_confidence > 0.6 ? '#92400e' : '#991b1b',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600
                        }}>
                          {Math.round(item._ai_confidence * 100)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                style={{ ...button, background: '#6b7280', color: '#fff', borderColor: '#6b7280' }}
                onClick={() => setShowAiBomReview(false)}
              >
                Cancel
              </button>
              <button 
                style={{ ...button, background: '#10b981', color: '#fff', borderColor: '#10b981' }}
                onClick={() => {
                  // Get selected items
                  const checkboxes = document.querySelectorAll('input[id^="ai-item-"]:checked');
                  const selectedItems = Array.from(checkboxes).map(checkbox => {
                    const index = parseInt(checkbox.id.replace('ai-item-', ''));
                    return aiBomResults.items[index];
                  });
                  acceptAiBomItems(selectedItems);
                }}
              >
                Add Selected Items ({aiBomResults.items.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* -------------------------------- AI FUNCTIONS -------------------------------- */
  
  /**
   * Extract BOM from quote files using AI
   * @param {string} quoteId - Quote number/ID
   * @returns {Promise<Array>} - Array of BOM suggestions
   */
  async function aiExtractBom(quoteId) {
    try {
      const response = await jfetch(`${API_BASE}/api/quotes/${encodeURIComponent(quoteId)}/ai/extract-bom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'openai' // Default to OpenAI, could be made configurable
        })
      });

      if (response.success && response.extraction) {
        const items = response.extraction.extractedItems || [];
        console.log(`AI extracted ${items.length} BOM items with confidence ${response.extraction.confidence}`);
        
        // Transform AI response to match QuoteForm expectations
        const suggestions = await Promise.all(items.map(async (item) => {
          // Try to find existing material in database
          let material = null;
          
          // Search for existing material by description/type
          const searchQuery = `${item.materialType} ${item.size}`.trim();
          try {
            const existingMaterial = await searchExistingMaterial(searchQuery);
            if (existingMaterial) {
              material = existingMaterial;
            }
          } catch (e) {
            console.warn('Failed to search existing materials:', e);
          }

          // If no exact match found, try AI material search to create new one
          if (!material) {
            try {
              const aiMaterialResult = await searchMaterialWithAI(searchQuery);
              if (aiMaterialResult && aiMaterialResult.length > 0) {
                material = aiMaterialResult[0]; // Take the first AI suggestion
              }
            } catch (e) {
              console.warn('Failed to find AI material match:', e);
            }
          }

          return {
            material: material || {
              label: `${item.materialType} ${item.size}`,
              value: `${item.materialType}-${item.size}`.toLowerCase().replace(/\s+/g, '-'),
              type: item.materialType,
              family: item.materialType,
              size: item.size,
              grade: item.grade || 'A36',
              unit_type: 'length',
              source: 'ai-generated'
            },
            size: item.size,
            grade: item.grade || 'A36',
            thickness_or_wall: item.thickness || '',
            length_value: item.lengthFeet || parseFloat(item.length) || '',
            length_unit: 'ft',
            qty: item.quantity || 1,
            unit: 'FT',
            notes: item.notes || `AI extracted with ${Math.round((response.extraction.confidence || 0.5) * 100)}% confidence`
          };
        }));

        return suggestions;
      }

      throw new Error(response.error || 'AI extraction failed');
    } catch (error) {
      console.error('AI BOM extraction error:', error);
      alert(`AI BOM extraction failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Search for existing materials in the database
   * @param {string} query - Search query
   * @returns {Promise<Object|null>} - Material object or null
   */
  async function searchExistingMaterial(query) {
    try {
      // Search in current material options first
      const existingOption = materialOptions.find(opt => 
        opt.label.toLowerCase().includes(query.toLowerCase()) ||
        opt.description?.toLowerCase().includes(query.toLowerCase())
      );
      
      if (existingOption) {
        return existingOption;
      }

      // If not found locally, search server
      const response = await jfetch(`${API_BASE}/api/materials?search=${encodeURIComponent(query)}`);
      if (Array.isArray(response) && response.length > 0) {
        const serverResult = response[0];
        return {
          label: serverResult.description || `${serverResult.family} ${serverResult.size}`,
          value: `${serverResult.family}-${serverResult.size}`.toLowerCase().replace(/\s+/g, '-'),
          ...serverResult,
          source: 'server-catalog'
        };
      }

      return null;
    } catch (error) {
      console.error('Error searching existing materials:', error);
      return null;
    }
  }

  /**
   * Search for materials using AI when not found in database
   * @param {string} query - Material description to search for
   * @returns {Promise<Array>} - Array of AI material suggestions
   */
  async function searchMaterialWithAI(query) {
    try {
      const response = await jfetch(`${API_BASE}/api/materials/ai/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (response.ok && response.candidates) {
        return response.candidates.map(candidate => ({
          label: candidate.description || `${candidate.category} ${candidate.size}`,
          value: `ai-${candidate.category}-${candidate.size}`.toLowerCase().replace(/\s+/g, '-'),
          type: candidate.category,
          family: candidate.category,
          size: candidate.size,
          grade: candidate.grade || 'A36',
          unit_type: candidate.unit_type || 'length',
          weight_per_ft: candidate.weight_per_ft,
          source: 'ai-suggestion',
          description: candidate.description,
          alt_names: candidate.alt_names
        }));
      }

      return [];
    } catch (error) {
      console.error('AI material search error:', error);
      return [];
    }
  }

  /**
   * Accept BOM rows and add them to the database
   * @param {string} quoteId - Quote number/ID  
   * @param {Array} bomRows - Array of BOM row objects
   * @returns {Promise<Object>} - Result of the operation
   */
  async function acceptBomRows(quoteId, bomRows) {
    try {
      const response = await jfetch(`${API_BASE}/api/quotes/${encodeURIComponent(quoteId)}/bom/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: bomRows })
      });

      if (response.ok) {
        console.log(`Successfully added ${response.added || bomRows.length} BOM rows to quote ${quoteId}`);
        return response;
      }

      throw new Error(response.error || 'Failed to accept BOM rows');
    } catch (error) {
      console.error('Error accepting BOM rows:', error);
      throw error;
    }
  }
}
// End of file

