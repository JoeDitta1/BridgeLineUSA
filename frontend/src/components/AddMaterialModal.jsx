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
          <button className="btn" onClick={onClose}>âœ•</button>
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
