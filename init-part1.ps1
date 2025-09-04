# init-part1.ps1 — builds Part 1 (client-only) and runs it
$root = Join-Path (Get-Location) 'SCM-AI-Part1'
$dirs = @(
  "$root\client\public",
  "$root\client\src\utils",
  "$root\client\src\components",
  "$root\client\src\pages",
  "$root\client\src\data"
)
$dirs | ForEach-Object { New-Item -Force -ItemType Directory $_ | Out-Null }

@'
{
  "name": "scm-ai-client",
  "version": "1.0.0",
  "private": true,
  "scripts": { "start": "react-scripts start", "build": "react-scripts build" },
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-select": "5.8.0"
  },
  "devDependencies": { "react-scripts": "5.0.1" }
}
'@ | Set-Content -Encoding utf8 "$root\client\package.json"

@'
<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SCM AI — Part 1 (Client)</title>
<style>
:root{--b:#e5e7eb;--t:#111827;--mut:#6b7280;--pri:#0d6efd;}
*{box-sizing:border-box} body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
nav{display:flex;gap:12px;align-items:center;padding:12px;border-bottom:1px solid var(--b);position:sticky;top:0;background:#fff}
a{color:var(--t);text-decoration:none} .btn{padding:8px 12px;border:1px solid var(--b);border-radius:8px;background:#f9fafb;cursor:pointer}
.btn.primary{background:var(--pri);border-color:var(--pri);color:#fff}
.card{border:1px solid var(--b);border-radius:12px;padding:16px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.04)}
label{font-size:12px;font-weight:600;color:#374151;display:block;margin:6px 0}
input,select,textarea{width:100%;padding:8px;border:1px solid var(--b);border-radius:8px}
.hint{font-size:12px;color:var(--mut)} .suggest{background:#f0fdf4;border:1px solid #bbf7d0;padding:6px 8px;border-radius:8px;margin-top:6px;font-size:13px}
.tag{display:inline-block;padding:2px 8px;border-radius:999px;background:#eef2ff;color:#3730a3;font-size:12px}
.container{padding:16px;max-width:1200px;margin:0 auto}
</style></head><body><div id="root"></div></body></html>
'@ | Set-Content -Encoding utf8 "$root\client\public\index.html"

@'
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
createRoot(document.getElementById('root')).render(<App/>);
'@ | Set-Content -Encoding utf8 "$root\client\src\index.js"

@'
import React from 'react';
import QuoteForm from './pages/QuoteForm';
export default function App(){
  return (<div>
    <nav><strong>SCM AI</strong><span className="hint" style={{marginLeft:8}}>Part 1 — Client only</span></nav>
    <div className="container"><QuoteForm/></div>
  </div>);
}
'@ | Set-Content -Encoding utf8 "$root\client\src\App.js"

@'
const KEY='scm_price_history_v1';
export function getHistory(){ try{return JSON.parse(localStorage.getItem(KEY))||{};}catch{return{};} }
export function saveHistory(o){ localStorage.setItem(KEY, JSON.stringify(o||{})); }
export function makeKey({category,description,unit}){ return [category||'GEN',description||'UNKNOWN',unit||'Each'].join('|'); }
export function getLastPrice({category,description,unit}){ const h=getHistory(); return h[makeKey({category,description,unit})]||null; }
export function setLastPrice({category,description,unit,payload}){ const h=getHistory(); h[makeKey({category,description,unit})]={...payload,updatedAt:Date.now()}; saveHistory(h);}
'@ | Set-Content -Encoding utf8 "$root\client\src\utils\priceHistory.js"

@'
export function normalizeLocal(text){
  const raw=(text||'').trim();
  if(!raw) return {confidence:'None'};
  const ws='\\s*'; const X='[xX×]';
  const rxW=new RegExp(`^W${ws}(\\d+?)${ws}${X}${ws}(\\d+)#?$`,'i');
  const rxC=new RegExp(`^C${ws}(\\d+?)${ws}${X}${ws}(\\d+)#?$`,'i');
  const rxL=new RegExp(`^L${ws}(\\d+)(?:${ws}${X}${ws}(\\d+))?${ws}${X}${ws}([.\\d/]+)$`,'i');
  const rxPl=new RegExp(`^(?:A36|PL|Plate)${ws}([\\d./]+)"?$`,'i');
  const mW=raw.match(rxW); if(mW){ return {confidence:'High',best:{family:'W-Beam',size:`W${mW[1]}x${mW[2]}`,unit_type:'Per Foot'}};}
  const mC=raw.match(rxC); if(mC){ return {confidence:'High',best:{family:'Channel',size:`C${mC[1]}x${mC[2]}`,unit_type:'Per Foot'}};}
  const mL=raw.match(rxL); if(mL){ const size=mL[2]?`L${mL[1]}x${mL[2]}x${mL[3]}`:`L${mL[1]}x${mL[1]}x${mL[3]}`; return {confidence:'High',best:{family:'Angle',size,unit_type:'Per Foot'}};}
  const mP=raw.match(rxPl); if(mP){ return {confidence:'High',best:{family:'Plate',size:`A36 ${mP[1]}"`,unit_type:'Sq In'}};}
  return {confidence:'Low'};
}
'@ | Set-Content -Encoding utf8 "$root\client\src\utils\normalizeLocal.js"

@'
import React, { useState, useMemo } from 'react';

const field = 'border rounded px-2 py-1 w-full';
const row = 'grid grid-cols-2 gap-3';
const label = 'text-sm font-semibold';

export default function AddMaterialModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    category: '',
    description: '',
    unit_type: 'Each',
    weight_per_ft: '',
    weight_per_sqin: '',
    price_per_lb: '',
    price_per_ft: '',
    price_each: '',
    notes: ''
  });

  const unit = form.unit_type;
  const showFt = unit === 'Per Foot';
  const showSq = unit === 'Sq In';
  const showEa = unit === 'Each';

  const valid = useMemo(() => {
    if (!form.category?.trim() || !form.description?.trim()) return false;
    if (showEa && !form.price_each) return false;
    if (showFt && !(form.price_per_ft || (form.weight_per_ft && form.price_per_lb))) return false;
    if (showSq && !(form.weight_per_sqin && form.price_per_lb)) return false;
    return true;
  }, [form, showEa, showFt, showSq]);

  const save = () => {
    const m = {
      type: form.category.trim(),
      category: form.category.trim(),
      size: form.description.trim(),
      description: form.description.trim(),
      unit_type: form.unit_type,
      weight_per_ft: num(form.weight_per_ft),
      weight_per_sqin: num(form.weight_per_sqin),
      price_per_lb: num(form.price_per_lb),
      price_per_ft: num(form.price_per_ft),
      price_each: num(form.price_each),
      label: `${form.category.trim()} - ${form.description.trim()}`,
      value: `${form.category.trim()}|${form.description.trim()}`
    };
    onSave(m);
  };

  function num(v) { const n = parseFloat(v); return Number.isFinite(n) ? n : undefined; }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="card" style={{width:'680px', maxWidth:'95vw'}}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Add Material</h3>
          <button className="btn" onClick={onClose}>✕</button>
        </div>

        <div className="space-y-3">
          <div className={row}>
            <div>
              <div className={label}>Category</div>
              <input className={field} value={form.category}
                     onChange={e=>setForm(f=>({...f,category:e.target.value}))}
                     placeholder="e.g., W-Beam, Pipe, Plate" />
            </div>
            <div>
              <div className={label}>Description</div>
              <input className={field} value={form.description}
                     onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                     placeholder={'e.g., W12x65 or A36 3/8"'} />
            </div>
          </div>

          <div>
            <div className={label}>Unit Type</div>
            <select className={field} value={form.unit_type}
                    onChange={e=>setForm(f=>({...f,unit_type:e.target.value}))}>
              <option>Each</option>
              <option>Per Foot</option>
              <option>Sq In</option>
            </select>
          </div>

          {showFt && (
            <div className={row}>
              <div>
                <div className={label}>Weight per Ft (lb/ft)</div>
                <input className={field} value={form.weight_per_ft}
                       onChange={e=>setForm(f=>({...f,weight_per_ft:e.target.value}))} />
              </div>
              <div>
                <div className={label}>Price per Ft ($/ft)</div>
                <input className={field} value={form.price_per_ft}
                       onChange={e=>setForm(f=>({...f,price_per_ft:e.target.value}))} />
              </div>
            </div>
          )}

          {showSq && (
            <div className={row}>
              <div>
                <div className={label}>Weight per Sq In (lb/sq in)</div>
                <input className={field} value={form.weight_per_sqin}
                       onChange={e=>setForm(f=>({...f,weight_per_sqin:e.target.value}))} />
              </div>
              <div>
                <div className={label}>Price per Lb ($/lb)</div>
                <input className={field} value={form.price_per_lb}
                       onChange={e=>setForm(f=>({...f,price_per_lb:e.target.value}))} />
              </div>
            </div>
          )}

          {showEa && (
            <div>
              <div className={label}>Price Each ($/ea)</div>
              <input className={field} value={form.price_each}
                     onChange={e=>setForm(f=>({...f,price_each:e.target.value}))} />
            </div>
          )}

          {!showEa && !showSq && (
            <div>
              <div className={label}>Price per Lb ($/lb) (optional)</div>
              <input className={field} value={form.price_per_lb}
                     onChange={e=>setForm(f=>({...f,price_per_lb:e.target.value}))} />
            </div>
          )}

          <div>
            <div className={label}>Notes (optional)</div>
            <textarea className={field} style={{height:80}} value={form.notes}
                      onChange={e=>setForm(f=>({...f,notes:e.target.value}))} />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary"
                  disabled={!valid} onClick={save}>Save Material</button>
        </div>
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding utf8 "$root\client\src\components\AddMaterialModal.jsx"

@'
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import AddMaterialModal from '../components/AddMaterialModal';
import { getLastPrice, setLastPrice } from '../utils/priceHistory';
import { normalizeLocal } from '../utils/normalizeLocal';
import baseMaterials from '../data/materials.json';

const toOption = (m) => ({ label: `${m.type||m.category} - ${m.size}`, value: `${m.type||m.category}|${m.size}`, ...m });
const inferUnit = (m) => { if (m?.unit_type) return m.unit_type; if (m?.weight_per_sqin) return 'Sq In'; if (m?.price_each) return 'Each'; return 'Per Foot'; };

export default function QuoteForm(){
  const [custom, setCustom] = useState(()=>{ try{return JSON.parse(localStorage.getItem('scm_custom_materials_v1'))||[];}catch{return[];} });
  const [options, setOptions] = useState([]);
  useEffect(()=>{ setOptions([...(baseMaterials||[]),...(custom||[])].map(toOption)); },[custom]);

  const [showAdd, setShowAdd] = useState(false);
  const [suggestion,setSuggestion]=useState(null);

  function blank(){ return { material:null, freeText:'', unitType:'Per Foot', length:'', width:'', height:'', priceEach:'', pricePerFt:'', pricePerLb:'', weightPerSqIn:'', quantity:'1', laborHours:'', rate:'75', materialCost:'', totalCost:'', totalWeight:'' }; }
  const [rows, setRows] = useState([blank()]);

  function setRow(i, patch, recalc=true){
    setRows(prev=>{ const next=[...prev]; next[i]={...next[i],...patch}; if(recalc) calc(next,i); return next; });
  }

  function onSelectMaterial(i, sel){
    const unit = inferUnit(sel);
    const category = sel.type || sel.category || 'GEN';
    const description = sel.size || sel.description || sel.label || '';
    const last = getLastPrice({ category, description, unit });
    const patch = { material: sel, unitType: unit, freeText:'' };
    if(unit==='Each'){ patch.priceEach = last?.priceEach ?? (sel.price_each ?? ''); }
    if(unit==='Per Foot'){ patch.pricePerFt = last?.pricePerFt ?? (sel.price_per_ft ?? ''); patch.pricePerLb = last?.pricePerLb ?? (sel.price_per_lb ?? '0.65'); }
    if(unit==='Sq In'){ patch.weightPerSqIn = last?.weightPerSqIn ?? (sel.weight_per_sqin ?? ''); patch.pricePerLb = last?.pricePerLb ?? (sel.price_per_lb ?? '0.65'); }
    setRow(i, patch, true);
  }

  function onFreeText(i, text){
    setRow(i,{freeText:text}, false);
    if(!text || text.length<3){ setSuggestion(null); return; }
    const data=normalizeLocal(text);
    if(data.best){ setSuggestion({i, data}); } else { setSuggestion(null); }
  }

  function applySuggestion(i, data){
    const sel = { type:data.best.family, category:data.best.family, size:data.best.size, unit_type:data.best.unit_type };
    onSelectMaterial(i, sel);
    setSuggestion(null);
  }

  function calc(list, i){
    const r=list[i]; const qty=parseFloat(r.quantity||0); const hours=parseFloat(r.laborHours||0); const rate=parseFloat(r.rate||0);
    const mat=r.material||{}; const unit=r.unitType||inferUnit(mat);
    let totalWeight=0, materialCost=0;
    if(unit==='Each'){
      const p=parseFloat(r.priceEach||mat.price_each||0);
      materialCost=qty*p;
    }else if(unit==='Per Foot'){
      const L=parseFloat(r.length||0);
      const wpf=parseFloat(mat.weight_per_ft||0);
      const pft=parseFloat(r.pricePerFt||0);
      const plb=parseFloat(r.pricePerLb||mat.price_per_lb||0);
      totalWeight=qty*L*wpf;
      materialCost= pft>0 ? qty*L*pft : totalWeight*plb;
    }else if(unit==='Sq In'){
      const w=parseFloat(r.width||0), h=parseFloat(r.height||0);
      const area=qty*w*h;
      const wpsi=parseFloat(r.weightPerSqIn||mat.weight_per_sqin||0);
      const plb=parseFloat(r.pricePerLb||mat.price_per_lb||0);
      totalWeight=area*wpsi;
      materialCost=totalWeight*plb;
    }
    const labor=hours*rate;
    list[i]={...r, totalWeight: totalWeight? totalWeight.toFixed(2):'', materialCost: materialCost.toFixed(2), totalCost:(materialCost+labor).toFixed(2)};
  }

  const totals = rows.reduce((a,r)=>{ const m=parseFloat(r.materialCost||0); const l=parseFloat(r.laborHours||0)*parseFloat(r.rate||0); a.m+=m; a.l+=l; return a; },{m:0,l:0});

  return (<div>
    <h2>Quote</h2>
    {rows.map((r,i)=>(<div key={i} className="card" style={{marginBottom:12}}>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <div style={{flex:1}}>
          <label>Material (type to auto-map)</label>
          <input value={r.freeText} onChange={e=>onFreeText(i,e.target.value)} placeholder="e.g., W12 x 65"/>
          {suggestion && suggestion.i===i && suggestion.data.best && (
            <div className="suggest">
              Looks like <strong>{suggestion.data.best.family} {suggestion.data.best.size}</strong> —
              <button className="btn" onClick={()=>applySuggestion(i, suggestion.data)} style={{marginLeft:8}}>Apply</button>
              <span className="tag" style={{marginLeft:8}}>{suggestion.data.confidence}</span>
            </div>
          )}
        </div>
        <div style={{flex:1}}>
          <label>Or pick from catalog</label>
          <Select options={options} value={r.material} onChange={sel=>onSelectMaterial(i,sel)}/>
        </div>
        <button className="btn" onClick={()=>setShowAdd(true)}>+ New Material</button>
      </div>

      <label>Unit</label>
      <select value={r.unitType} onChange={e=>setRow(i,{unitType:e.target.value})}>
        <option>Each</option><option>Per Foot</option><option>Sq In</option>
      </select>

      {r.unitType==='Per Foot' && (<>
        <label>Length (ft)</label><input value={r.length} onChange={e=>setRow(i,{length:e.target.value})}/>
        <label>Price per Ft ($/ft)</label><input value={r.pricePerFt} onChange={e=>setRow(i,{pricePerFt:e.target.value})} onBlur={()=>persist(i)}/>
        <label>Price per Lb ($/lb)</label><input value={r.pricePerLb} onChange={e=>setRow(i,{pricePerLb:e.target.value})} onBlur={()=>persist(i)}/>
      </>)}

      {r.unitType==='Each' and (<>
        <label>Price Each ($/ea)</label><input value={r.priceEach} onChange={e=>setRow(i,{priceEach:e.target.value})} onBlur={()=>persist(i)}/>
      </>)}

      {r.unitType==='Sq In' and (<>
        <label>Width (in)</label><input value={r.width} onChange={e=>setRow(i,{width:e.target.value})}/>
        <label>Height (in)</label><input value={r.height} onChange={e=>setRow(i,{height:e.target.value})}/>
        <label>Weight per Sq In (lb/sq in)</label><input value={r.weightPerSqIn} onChange={e=>setRow(i,{weightPerSqIn:e.target.value})} onBlur={()=>persist(i)}/>
        <label>Price per Lb ($/lb)</label><input value={r.pricePerLb} onChange={e=>setRow(i,{pricePerLb:e.target.value})} onBlur={()=>persist(i)}/>
      </>)}

      <label>Qty</label><input value={r.quantity} onChange={e=>setRow(i,{quantity:e.target.value})}/>
      <label>Labor Hours</label><input value={r.laborHours} onChange={e=>setRow(i,{laborHours:e.target.value})}/>
      <label>Rate</label><input value={r.rate} onChange={e=>setRow(i,{rate:e.target.value})}/>

      <div><strong>Total Weight:</strong> {r.totalWeight||'-'} lb</div>
      <div><strong>Material Cost:</strong> ${r.materialCost||'0.00'}</div>
      <div><strong>Total Cost:</strong> ${r.totalCost||'0.00'}</div>
    </div>))}
    <button className="btn" onClick={()=>setRows(r=>[...r, blank()])}>+ Add Item</button>

    <div className="card" style={{marginTop:12}}>
      <div><strong>Material Total:</strong> ${totals.m.toFixed(2)}</div>
      <div><strong>Labor Total:</strong> ${totals.l.toFixed(2)}</div>
      <div><strong>Grand Total:</strong> ${(totals.m+totals.l).toFixed(2)}</div>
    </div>

    <AddMaterialModal open={showAdd} onClose={()=>setShowAdd(false)} onSave={(mat)=>{
      const next=[...custom,mat]; setCustom(next); localStorage.setItem('scm_custom_materials_v1', JSON.stringify(next));
      setOptions([...(baseMaterials||[]),...next].map(toOption)); setShowAdd(false);
    }}/>
  </div>);

  function persist(i){
    const r=rows[i]; if(!r?.material) return;
    const category=r.material.type||r.material.category||'GEN';
    const description=r.material.size||r.material.description||r.material.label||'';
    const unit=r.unitType||inferUnit(r.material);
    if(unit==='Each' && r.priceEach) setLastPrice({category,description,unit,payload:{priceEach:parseFloat(r.priceEach)}});
    if(unit==='Per Foot'){ const payload={}; if(r.pricePerFt) payload.pricePerFt=parseFloat(r.pricePerFt); if(r.pricePerLb) payload.pricePerLb=parseFloat(r.pricePerLb); if(Object.keys(payload).length) setLastPrice({category,description,unit,payload}); }
    if(unit==='Sq In'){ const payload={}; if(r.weightPerSqIn) payload.weightPerSqIn=parseFloat(r.weightPerSqIn); if(r.pricePerLb) payload.pricePerLb=parseFloat(r.pricePerLb); if(Object.keys(payload).length) setLastPrice({category,description,unit,payload}); }
  }
}
'@ | Set-Content -Encoding utf8 "$root\client\src\pages\QuoteForm.jsx"

@'
[
  {"type":"W-Beam","category":"W-Beam","size":"W12x65","unit_type":"Per Foot","weight_per_ft":65,"price_per_lb":0.65},
  {"type":"W-Beam","category":"W-Beam","size":"W8x31","unit_type":"Per Foot","weight_per_ft":31,"price_per_lb":0.65},
  {"type":"Channel","category":"Channel","size":"C6x13","unit_type":"Per Foot","weight_per_ft":13,"price_per_lb":0.65},
  {"type":"Angle","category":"Angle","size":"L3x3x1/4","unit_type":"Per Foot","weight_per_ft":7.1,"price_per_lb":0.65},
  {"type":"Pipe","category":"Pipe","size":"2\" SCH40","unit_type":"Per Foot","weight_per_ft":2.64,"price_per_lb":0.65},
  {"type":"Tube","category":"Tube","size":"2x2x.188","unit_type":"Per Foot","weight_per_ft":5.44,"price_per_lb":0.65},
  {"type":"Plate","category":"Plate","size":"A36 1/4\"","unit_type":"Sq In","weight_per_sqin":0.07075,"price_per_lb":0.65},
  {"type":"Plate","category":"Plate","size":"A36 3/8\"","unit_type":"Sq In","weight_per_sqin":0.106125,"price_per_lb":0.65},
  {"type":"Plate","category":"Plate","size":"A36 1/2\"","unit_type":"Sq In","weight_per_sqin":0.14150,"price_per_lb":0.65},
  {"type":"Hardware","category":"Hardware","size":"1/2\" Bolt, Grade 8","unit_type":"Each","price_each":1.25}
]
'@ | Set-Content -Encoding utf8 "$root\client\src\data\materials.json"

@'
SCM AI — Part 1 (Client Only)
Run it:
  cd client
  npm install
  npm start
'@ | Set-Content -Encoding utf8 "$root\README-PART1.txt"

Write-Host "Installing dependencies..."
Push-Location "$root\client"
# Use cmd to avoid npm.ps1 execution-policy issues
cmd /c npm install
cmd /c npm start
