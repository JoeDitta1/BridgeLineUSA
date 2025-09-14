import React, { useState } from 'react';
import { API_BASE } from '../api/base';

export default function ProductionRouter() {
  const [orderIdsText, setOrderIdsText] = useState('');
  const [batches, setBatches] = useState(null);
  const [running, setRunning] = useState(false);
  const [err, setErr] = useState('');

  async function runRouter() {
    setErr('');
    const ids = orderIdsText.split(',').map(s => Number(s.trim())).filter(Boolean);
    if (ids.length === 0) { setErr('Enter one or more numeric order IDs (comma separated).'); return; }
    setRunning(true);
    try {
      const res = await fetch(`${API_BASE}/api/sales-orders/production-router`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: ids, options: { batchByMaterial: true } }),
        credentials: 'include'
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Router request failed');
      setBatches(j.batches || []);
    } catch (e) {
      setErr(String(e?.message || e));
      setBatches(null);
    } finally { setRunning(false); }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h1>Production Router</h1>
      <p>Provide sales order numeric IDs (comma separated). Example: 1,2,3</p>

      <div>
        <input
          style={{ width: '100%', padding: 8, fontSize: 14 }}
          value={orderIdsText}
          onChange={e => setOrderIdsText(e.target.value)}
          placeholder="e.g. 1,2,3"
        />
      </div>

      <div style={{ marginTop: 8 }}>
        <button onClick={runRouter} disabled={running}>{running ? 'Running…' : 'Generate Router'}</button>
      </div>

      {err && <div style={{ color: '#b00020', marginTop: 12 }}>{err}</div>}

      {batches && (
        <div style={{ marginTop: 16 }}>
          <h2>Batches ({batches.length})</h2>
          {batches.map((b, i) => (
            <div key={i} style={{ border: '1px solid #ddd', padding: 8, marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>{b.key}</div>
              <div>Items: {b.items.length}</div>
              <ul>
                {b.items.slice(0, 50).map((it, idx) => (
                  <li key={idx}>{it.orderNo} — {JSON.stringify(it.item)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
