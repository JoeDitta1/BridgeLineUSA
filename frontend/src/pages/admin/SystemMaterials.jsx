import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || '';

export default function SystemMaterials() {
  const [families, setFamilies] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const [familyForm, setFamilyForm] = useState({ id: null, name: '' });
  const [specForm, setSpecForm] = useState({ id: null, family_id: '', grade: '', density: '', unit: '', notes: '', ai_searchable: 1 });
  const [sizeForm, setSizeForm] = useState({ id: null, family_id: '', size_label: '', dims_json: '' });

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, []);

  async function loadAll() {
    try {
      setBusy(true); setErr('');
      const [fRes, sRes, zRes] = await Promise.all([
        fetch(`${API_BASE}/api/system-materials/families`),
        fetch(`${API_BASE}/api/system-materials/specs`),
        fetch(`${API_BASE}/api/system-materials/sizes`)
      ]);
      const [fJ, sJ, zJ] = await Promise.all([fRes.json(), sRes.json(), zRes.json()]);
      if (!fRes.ok) throw new Error(fJ.error || 'families load failed');
      if (!sRes.ok) throw new Error(sJ.error || 'specs load failed');
      if (!zRes.ok) throw new Error(zJ.error || 'sizes load failed');
      setFamilies(fJ.families || []);
      setSpecs(sJ.specs || []);
      setSizes(zJ.sizes || []);
    } catch (e) {
      setErr(String(e?.message || e));
    } finally { setBusy(false); }
  }

  // Family actions
  async function saveFamily(e) {
    e?.preventDefault();
    try {
      setBusy(true); setErr('');
      const method = familyForm.id ? 'PUT' : 'POST';
      const url = familyForm.id ? `${API_BASE}/api/system-materials/families/${familyForm.id}` : `${API_BASE}/api/system-materials/families`;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: familyForm.name }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'family save failed');
      setFamilyForm({ id: null, name: '' });
      await loadAll();
    } catch (e) { setErr(String(e?.message || e)); } finally { setBusy(false); }
  }

  async function editFamily(f) { setFamilyForm({ id: f.id, name: f.name }); }
  async function deleteFamily(id) { if (!confirm('Delete family?')) return; await fetch(`${API_BASE}/api/system-materials/families/${id}`, { method: 'DELETE' }); await loadAll(); }

  // Spec actions
  async function saveSpec(e) {
    e?.preventDefault();
    try {
      setBusy(true); setErr('');
      const method = specForm.id ? 'PUT' : 'POST';
      const url = specForm.id ? `${API_BASE}/api/system-materials/specs/${specForm.id}` : `${API_BASE}/api/system-materials/specs`;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(specForm) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'spec save failed');
      setSpecForm({ id: null, family_id: '', grade: '', density: '', unit: '', notes: '', ai_searchable: 1 });
      await loadAll();
    } catch (e) { setErr(String(e?.message || e)); } finally { setBusy(false); }
  }
  function editSpec(s) { setSpecForm({ id: s.id, family_id: s.family_id, grade: s.grade, density: s.density, unit: s.unit, notes: s.notes, ai_searchable: s.ai_searchable }); }
  async function deleteSpec(id) { if (!confirm('Delete spec?')) return; await fetch(`${API_BASE}/api/system-materials/specs/${id}`, { method: 'DELETE' }); await loadAll(); }

  // Size actions
  async function saveSize(e) {
    e?.preventDefault();
    try {
      setBusy(true); setErr('');
      const method = sizeForm.id ? 'PUT' : 'POST';
      const url = sizeForm.id ? `${API_BASE}/api/system-materials/sizes/${sizeForm.id}` : `${API_BASE}/api/system-materials/sizes`;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sizeForm) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'size save failed');
      setSizeForm({ id: null, family_id: '', size_label: '', dims_json: '' });
      await loadAll();
    } catch (e) { setErr(String(e?.message || e)); } finally { setBusy(false); }
  }
  function editSize(s) { setSizeForm({ id: s.id, family_id: s.family_id, size_label: s.size_label, dims_json: s.dims_json }); }
  async function deleteSize(id) { if (!confirm('Delete size?')) return; await fetch(`${API_BASE}/api/system-materials/sizes/${id}`, { method: 'DELETE' }); await loadAll(); }

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 12 }}><Link to="/admin">← Back to Admin</Link></div>
      <h1>System Materials (Admin)</h1>
      {err && <div style={{ color: '#b00020' }}>{err}</div>}
      <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
        <div style={{ flex: 1 }}>
          <h3>Families</h3>
          <form onSubmit={saveFamily} style={{ marginBottom: 8 }}>
            <input value={familyForm.name} onChange={e => setFamilyForm(f => ({ ...f, name: e.target.value }))} placeholder='Family name' required />
            <button type='submit' disabled={busy} style={{ marginLeft: 8 }}>{familyForm.id ? 'Save' : 'Add'}</button>
            {familyForm.id && <button type='button' onClick={() => setFamilyForm({ id: null, name: '' })} style={{ marginLeft: 8 }}>Clear</button>}
          </form>
          <div style={{ border: '1px solid #eee', padding: 8, borderRadius: 6 }}>
            {busy && <div>Loading…</div>}
            {!busy && families.map(f => (
              <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <div>{f.name}</div>
                <div>
                  <button onClick={() => editFamily(f)} style={{ marginRight: 6 }}>Edit</button>
                  <button onClick={() => deleteFamily(f.id)} style={{ color: '#b00020' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Specs</h3>
          <form onSubmit={saveSpec} style={{ marginBottom: 8 }}>
            <select value={specForm.family_id} onChange={e => setSpecForm(s => ({ ...s, family_id: e.target.value }))} required>
              <option value=''>Choose family</option>
              {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <input value={specForm.grade} onChange={e => setSpecForm(s => ({ ...s, grade: e.target.value }))} placeholder='Grade' style={{ marginLeft: 8 }} />
            <input value={specForm.density} onChange={e => setSpecForm(s => ({ ...s, density: e.target.value }))} placeholder='Density' style={{ marginLeft: 8 }} />
            <div style={{ marginTop: 8 }}>
              <input value={specForm.unit} onChange={e => setSpecForm(s => ({ ...s, unit: e.target.value }))} placeholder='Unit' />
              <label style={{ marginLeft: 8 }}><input type='checkbox' checked={!!specForm.ai_searchable} onChange={e => setSpecForm(s => ({ ...s, ai_searchable: e.target.checked ? 1 : 0 }))} /> AI Searchable</label>
            </div>
            <div style={{ marginTop: 8 }}>
              <textarea value={specForm.notes} onChange={e => setSpecForm(s => ({ ...s, notes: e.target.value }))} rows={3} placeholder='Notes' style={{ width: '100%' }} />
            </div>
            <div style={{ marginTop: 8 }}>
              <button type='submit' disabled={busy}>{specForm.id ? 'Save' : 'Add Spec'}</button>
              {specForm.id && <button type='button' onClick={() => setSpecForm({ id: null, family_id: '', grade: '', density: '', unit: '', notes: '', ai_searchable: 1 })} style={{ marginLeft: 8 }}>Clear</button>}
            </div>
          </form>
          <div style={{ border: '1px solid #eee', padding: 8, borderRadius: 6 }}>
            {specs.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <div><strong>{s.family_name}</strong> - {s.grade} {s.unit ? `(${s.unit})` : ''}</div>
                <div>
                  <button onClick={() => editSpec(s)} style={{ marginRight: 6 }}>Edit</button>
                  <button onClick={() => deleteSpec(s.id)} style={{ color: '#b00020' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Sizes</h3>
          <form onSubmit={saveSize} style={{ marginBottom: 8 }}>
            <select value={sizeForm.family_id} onChange={e => setSizeForm(s => ({ ...s, family_id: e.target.value }))} required>
              <option value=''>Choose family</option>
              {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <input value={sizeForm.size_label} onChange={e => setSizeForm(s => ({ ...s, size_label: e.target.value }))} placeholder='Size label' style={{ marginLeft: 8 }} required />
            <div style={{ marginTop: 8 }}>
              <textarea value={sizeForm.dims_json} onChange={e => setSizeForm(s => ({ ...s, dims_json: e.target.value }))} rows={3} placeholder='dims JSON (optional)' style={{ width: '100%' }} />
            </div>
            <div style={{ marginTop: 8 }}>
              <button type='submit' disabled={busy}>{sizeForm.id ? 'Save' : 'Add Size'}</button>
              {sizeForm.id && <button type='button' onClick={() => setSizeForm({ id: null, family_id: '', size_label: '', dims_json: '' })} style={{ marginLeft: 8 }}>Clear</button>}
            </div>
          </form>
          <div style={{ border: '1px solid #eee', padding: 8, borderRadius: 6 }}>
            {sizes.map(sz => (
              <div key={sz.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <div>{families.find(f => f.id === sz.family_id)?.name || 'Unknown'} - {sz.size_label}</div>
                <div>
                  <button onClick={() => editSize(sz)} style={{ marginRight: 6 }}>Edit</button>
                  <button onClick={() => deleteSize(sz.id)} style={{ color: '#b00020' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
