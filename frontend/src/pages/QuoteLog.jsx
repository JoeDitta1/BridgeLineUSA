// src/pages/QuoteLog.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { API_BASE } from "../api/base";

const columns = [
  { key: 'quote_no', label: 'Quote No.' },
  { key: 'customer_name', label: 'Customer Name' },
  { key: 'description', label: 'Description' },
  { key: 'date', label: 'Date' },
  { key: 'requested_by', label: 'Requested By' },
  { key: 'estimator', label: 'Estimator' },
  { key: 'sales_order_no', label: 'Sales Order #' },
  { key: 'status', label: 'Status' },
  { key: 'rev', label: 'Rev' },
  { key: 'files', label: 'Files' }, // Files column
];

export default function QuoteLog() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'
  const [q, setQ] = useState('');                 // quick filter
  const [pageSize, setPageSize] = useState(50);   // 10/25/50/100
  const [page, setPage] = useState(1);
  const [dense, setDense] = useState(true);       // compact rows

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/quotes`);
        const data = await res.json();
        if (!alive) return;
        if (!data.ok) throw new Error(data.error || 'Failed to load');
        setRows(Array.isArray(data.quotes) ? data.quotes : []);
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Filter + sort
  const filteredSorted = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = rows;
    if (needle) {
      out = rows.filter(r =>
        [
          r.quote_no, r.customer_name, r.description,
          r.requested_by, r.estimator, r.status, r.sales_order_no, r.rev, r.date
        ]
          .map(x => (x ?? '').toString().toLowerCase())
          .some(s => s.includes(needle))
      );
    }
    const dir = sortDir === 'asc' ? 1 : -1;
    out = [...out].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      if (sortKey === 'rev') return (Number(av) - Number(bv)) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return out;
  }, [rows, q, sortKey, sortDir]);

  // Pagination
  const total = filteredSorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const paged = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, safePage, pageSize]);

  const toggleSort = (key) => {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const goto = (n) => setPage(Math.min(Math.max(1, n), pageCount));

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <h1 style={styles.h1}>Quote Log</h1>
        <div style={styles.actions}>
          <Link to="/quote/new" style={styles.btn}>New Quote</Link>
        </div>
      </header>

      <div style={styles.toolbar}>
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setPage(1); }}
          placeholder="Search quotes…"
          style={styles.search}
        />
        <div style={styles.controlsRow}>
          <label style={styles.label}>
            Sort:
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value)}
              style={styles.select}
            >
              {columns.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </label>
          <button onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))} style={styles.btnSm}>
            {sortDir === 'asc' ? 'Asc ↑' : 'Desc ↓'}
          </button>

          <label style={styles.label}>
            Rows:
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              style={styles.select}
            >
              {[10,25,50,100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>

          <label style={styles.labelChk}>
            <input
              type="checkbox"
              checked={dense}
              onChange={e => setDense(e.target.checked)}
            />
            Dense
          </label>
        </div>
      </div>

      {loading && <div style={styles.info}>Loading…</div>}
      {err && <div style={styles.error}>Error: {err}</div>}

      {/* Compact spreadsheet table */}
      <div style={styles.tableWrap}>
        <table style={{...styles.table, ...(dense ? styles.tableDense : null)}}>
          <thead style={styles.thead}>
            <tr>
              {columns.map(c => (
                <th key={c.key} style={styles.th}>
                  <button onClick={() => toggleSort(c.key)} style={styles.thBtn} title="Sort">
                    {c.label}{' '}
                    {sortKey === c.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map(r => (
              <tr key={r.id}>
                {/* Make quote number clickable → Files page */}
<td style={styles.td}>
  <Link to={`/quote/${encodeURIComponent(r.quote_no)}/edit`}>
    {r.quote_no}
  </Link>
</td>
                <td style={styles.td}>{r.customer_name}</td>
                <td style={styles.td} title={r.description || ''}>{r.description || '—'}</td>
                <td style={styles.td}>{r.date}</td>
                <td style={styles.td}>{r.requested_by || '—'}</td>
                <td style={styles.td}>{r.estimator || '—'}</td>
                <td style={styles.td}>{r.sales_order_no || '—'}</td>
                <td style={styles.td}>{r.status}</td>
                <td style={styles.td}>{r.rev}</td>
                <td style={styles.td}>
                  <Link to={`/quotes/${encodeURIComponent(r.quote_no)}/files`}>Files</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination bar */}
      <div style={styles.pagination}>
        <button style={styles.btnSm} onClick={() => goto(1)} disabled={safePage === 1}>{'<<'}</button>
        <button style={styles.btnSm} onClick={() => goto(safePage - 1)} disabled={safePage === 1}>{'<'}</button>
        <span style={styles.pageInfo}>Page {safePage} / {pageCount} • {total} total</span>
        <button style={styles.btnSm} onClick={() => goto(safePage + 1)} disabled={safePage === pageCount}>{'>'}</button>
        <button style={styles.btnSm} onClick={() => goto(pageCount)} disabled={safePage === pageCount}>{'>>'}</button>
      </div>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 1400, margin: '0 auto', padding: 12 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  h1: { fontSize: 18, margin: 0 },
  actions: { display: 'flex', gap: 8 },
  btn: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, textDecoration: 'none' },

  toolbar: { display: 'grid', gap: 8, marginBottom: 8 },
  search: { padding: 8, borderRadius: 8, border: '1px solid #ddd' },
  controlsRow: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  label: { display: 'flex', alignItems: 'center', gap: 6 },
  labelChk: { display: 'flex', alignItems: 'center', gap: 6, userSelect: 'none' },
  select: { padding: 6, borderRadius: 6, border: '1px solid #ddd' },
  btnSm: { padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, background: '#f8f8f8' },

  tableWrap: { overflowX: 'auto', border: '1px solid #eee', borderRadius: 8 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13, lineHeight: 1.2 },
  tableDense: { fontSize: 12 },
  thead: { position: 'sticky', top: 0, background: '#fff', zIndex: 1 },
  th: { textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' },
  thBtn: { background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 600 },
  td: { padding: '6px 10px', borderBottom: '1px solid #f2f2f2', verticalAlign: 'top', whiteSpace: 'nowrap' },

  info: { padding: 8, color: '#555' },
  error: { padding: 8, color: '#b00020', background: '#ffecec', border: '1px solid #ffd4d4', borderRadius: 6 },

  pagination: { display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end', marginTop: 8 },
  pageInfo: { fontSize: 12, color: '#444' },
};
