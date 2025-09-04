// src/pages/QuoteFiles.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || '';

export default function QuoteFiles() {
  const { quoteNo } = useParams();
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function load() {
    try {
      setErr(''); setBusy(true);
      const r = await fetch(`${API_BASE}/api/quote-files/${encodeURIComponent(quoteNo)}/files`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setRows(Array.isArray(j) ? j : []);
    } catch (e) { setErr(String(e.message || e)); }
    finally { setBusy(false); }
  }
  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [quoteNo]);

  async function upload(e) {
    const f = e.target.files;
    if (!f?.length) return;
    const form = new FormData();
    for (const file of f) form.append('files', file);
    setBusy(true);
    try {
      const r = await fetch(`${API_BASE}/api/quote-files/${encodeURIComponent(quoteNo)}/files`, {
        method: 'POST', body: form
      });
      if (!r.ok) throw new Error(`Upload failed ${r.status}`);
      await load();
    } catch (e) { alert(String(e.message || e)); }
    finally { setBusy(false); }
  }

  async function del(name) {
    if (!window.confirm(`Delete ${name}?`)) return;
    const r = await fetch(`${API_BASE}/api/quote-files/${encodeURIComponent(quoteNo)}/files/${encodeURIComponent(name)}`, { method: 'DELETE' });
    if (r.ok) load(); else alert('Delete failed');
  }

  return (
    <div style={{maxWidth:900,margin:'0 auto',padding:16}}>
      <h1 style={{marginBottom:8}}>Files — {quoteNo}</h1>
      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <Link to="/quotes" style={{border:'1px solid #ddd',padding:'6px 10px',borderRadius:6,textDecoration:'none'}}>← Back to Quote Log</Link>
        <label style={{border:'1px solid #ddd',padding:'6px 10px',borderRadius:6,cursor:'pointer'}}>
          {busy ? 'Uploading…' : 'Choose Files'}
          <input type="file" multiple style={{display:'none'}} onChange={upload} disabled={busy} />
        </label>
      </div>
      {err && <div style={{color:'#b00020',marginBottom:8}}>Error: {err}</div>}
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead>
          <tr>
            <th style={th}>Name</th>
            <th style={th}>Size</th>
            <th style={th}>Modified</th>
            <th style={thRight}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.name}>
              <td style={td}>{(() => {
                // Prefer backend-provided absolute URL (r.url). If it's relative, build absolute from API_BASE.
                const BACKEND_ORIGIN = API_BASE || `${window.location.protocol}//${window.location.hostname}:4000`;
                // If backend returned an absolute URL, only use it when it points to the same origin
                // as the current page (or matches API_BASE). Otherwise fall back to the proxied API
                // path (/api/quote-files/...) which the dev server will forward to the backend.
                const pageOrigin = window.location.origin;
                let href = '';
                if (r && r.url && String(r.url).startsWith('http')) {
                  try {
                    const parsed = new URL(r.url);
                    const apiBaseHost = (API_BASE && API_BASE.startsWith('http')) ? new URL(API_BASE).host : null;
                    if (parsed.origin === pageOrigin || (apiBaseHost && parsed.host === apiBaseHost)) {
                      href = r.url;
                    }
                  } catch (e) {
                    href = '';
                  }
                }
                if (!href) {
                  const proxied = `${API_BASE || ''}/api/quote-files/${encodeURIComponent(quoteNo)}/files/${encodeURIComponent(r.name)}`;
                  // If API_BASE is blank, make it relative so CRA dev proxy handles it
                  href = (API_BASE ? proxied : `/api/quote-files/${encodeURIComponent(quoteNo)}/files/${encodeURIComponent(r.name)}`);
                }
                // Ensure localhost links use http scheme (dev server doesn't use TLS)
                if (href.startsWith('https://localhost') || href.startsWith('https://127.0.0.1')) {
                  href = href.replace(/^https:/, 'http:');
                }
                return (<a href={href} target="_blank" rel="noreferrer noopener">{r.name}</a>);
              })()}</td>
              <td style={td}>{(r.size/1024).toFixed(1)} KB</td>
              <td style={td}>{new Date(r.modifiedAt).toLocaleString()}</td>
              <td style={tdRight}>
                <button onClick={()=>del(r.name)} style={{border:'1px solid #ddd',padding:'4px 8px',borderRadius:6}}>Delete</button>
              </td>
            </tr>
          ))}
          {rows.length===0 && (
            <tr><td colSpan="4" style={{padding:10,color:'#555'}}>No files yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const th = {textAlign:'left',borderBottom:'1px solid #eee',padding:'6px 8px'};
const thRight = {...th,textAlign:'right'};
const td = {borderBottom:'1px solid #f2f2f2',padding:'6px 8px',verticalAlign:'top'};
const tdRight = {...td,textAlign:'right'};
