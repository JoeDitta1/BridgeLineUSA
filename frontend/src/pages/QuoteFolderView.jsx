// frontend/src/pages/QuoteFolderView.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import FileUploadPad from "../components/FileUploadPad";
import { filePathToUrl } from "../lib/fileUrls";
import { API_BASE } from "../config/apiBase";

export default function QuoteFolderView() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const quoteNo = params.quoteNo || "";
  // Route may use :subdir or :section depending on where it's linked from; prefer provided param, then section, then default to drawings
  const subdir = params.subdir || params.section || "drawings";
  // robust customer fallback: route param OR parse from URL
  let customer = params.customer || "";
  if (!customer && location?.pathname) {
    const m = location.pathname.match(/\/quotes\/customers\/([^/]+)\//i);
    if (m && m[1]) customer = decodeURIComponent(m[1]);
  }
  const activeSubdir = subdir;
  React.useEffect(() => {
    if (activeSubdir === 'quote-form') {
      navigate(`/quote/${encodeURIComponent(quoteNo)}`);
    }
  }, [activeSubdir, quoteNo, navigate]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  // keys of selected files for deletion: stored as array of "subdir::filename"
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [deleting, setDeleting] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const url = `${API_BASE}/api/quotes/${encodeURIComponent(quoteNo)}/files?subdir=${encodeURIComponent(activeSubdir)}&customer=${encodeURIComponent(customer || '')}`;
      const res = await fetch(url, { credentials: "include" });
      const json = await res.json().catch(() => []);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const out = Array.isArray(json) ? json : (json && json.files ? json.files : []);
      setFiles(out);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [customer, quoteNo, activeSubdir]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await fetchFiles();
    })();
    return () => { alive = false; };
  }, [fetchFiles]);

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto", position: 'relative' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={() => navigate(`/quotes/customers/${encodeURIComponent(customer || '')}`)}
          style={{ padding:"8px 12px", border:"1px solid #d1d5db", borderRadius:8, background:"#f9fafb", cursor:"pointer" }}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => navigate(`/quote/${encodeURIComponent(quoteNo)}`)}
          className="mb-4 px-4 py-2 rounded-lg border bg-white shadow-sm hover:bg-gray-100"
          style={{ padding: '8px 12px', borderRadius: 8 }}
        >
          Back to Quote Form
        </button>
        {/* Delete selected files button */}
        <button
          type="button"
          onClick={async () => {
            if (!selectedKeys.length) return;
            if (!window.confirm(`Delete ${selectedKeys.length} file(s)? This action is permanent.`)) return;
            setDeleting(true);
            try {
              // build map from key -> file object
              const keyToFile = new Map(files.map(f => {
                const filename = f.label || f.name || f.filename || f.base || (f.path || "").split("/").pop();
                const key = `${f.subdir || ''}::${filename}`;
                return [key, { f, filename }];
              }));
              const results = await Promise.all(selectedKeys.map(async (k) => {
                const entry = keyToFile.get(k);
                if (!entry) return { ok: false, key: k, error: 'not found' };
                const { f, filename } = entry;
                const subdir = f.subdir || '';
                const url = subdir
                  ? `${API_BASE}/api/quotes/${encodeURIComponent(quoteNo)}/files/${encodeURIComponent(subdir)}/${encodeURIComponent(filename)}`
                  : `${API_BASE}/api/quotes/${encodeURIComponent(quoteNo)}/files/${encodeURIComponent(filename)}`;
                const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
                if (!res.ok) return { ok: false, key: k, status: res.status };
                const json = await res.json().catch(() => ({ ok: true }));
                return { ok: json.ok !== false, key: k, json };
              }));
              const failed = results.filter(r => !r.ok);
              if (failed.length) {
                window.alert(`Failed to delete ${failed.length} file(s). See console for details.`);
                console.warn('delete failures', failed);
              }
              setSelectedKeys([]);
              await fetchFiles();
            } catch (e) {
              console.error('Delete selected failed', e);
              window.alert('Delete failed: ' + (e?.message || e));
            } finally {
              setDeleting(false);
            }
          }}
          disabled={selectedKeys.length === 0 || deleting}
          style={{ padding: '8px 10px', borderRadius: 8, background: selectedKeys.length ? '#ef4444' : '#f3f4f6', color: selectedKeys.length ? '#fff' : '#374151', border: '1px solid #e5e7eb', cursor: selectedKeys.length ? 'pointer' : 'default' }}
        >
          {deleting ? 'Deleting…' : `Delete Selected (${selectedKeys.length})`}
        </button>
      </div>

      <h1 style={{ marginTop: 12 }}>{customer || ''} / {quoteNo} / {activeSubdir}</h1>

      {/* Upload pad for common quote sub-folders */}
      {(() => {
        const allowed = ['uploads', 'vendor-quotes', 'quality-info', 'customer-notes', 'photos', 'exports', 'internal-notes', 'change-orders', 'drawings'];
        if (!activeSubdir) return null;
        const key = String(activeSubdir).toLowerCase();
        if (!allowed.includes(key)) return null;
        return (
          // Pin the uploader to the top-right of the page and make it a bit smaller so it doesn't overlap the title.
          // Keep pointerEvents: 'none' on the wrapper so transparent areas don't block underlying links; inner pad remains interactive.
          // Position the uploader at the very top-right (near the Back buttons) so it doesn't overlap file rows.
          <div style={{ position: 'fixed', top: 18, right: 24, width: 150, zIndex: 1000, borderRadius: 8, padding: 4, background: 'rgba(255,255,255,0.96)', border: '1px solid #0b1220', boxShadow: '0 6px 16px rgba(2,6,23,0.08)', pointerEvents: 'none' }}>
            <FileUploadPad
              quoteNo={quoteNo}
              subdir={key}
              customerName={customer}
              accept="*"
              multiple={true}
              onComplete={() => { fetchFiles(); }}
              onError={(e) => console.error('Upload error', e)}
            />
          </div>
        );
      })()}

      {loading && <div>Loading…</div>}
      {error && <div style={{ color:"#b00020" }}>Failed: {error}</div>}
      {!loading && !error && files.length === 0 && <div>No files found.</div>}

      {!loading && !error && files.length > 0 && (
        <ul style={{ listStyle:"none", padding:0 }}>
          {files.map((f, i) => {
            // Prefer explicit signedUrl (from supabase), then relUrl (backend localfs),
            // then try object_key -> /files/<object_key> fallback, else try filePathToUrl.
            const raw = f.signedUrl || f.signed_url || f.relUrl || f.rel_url ||
              (f.object_key ? `/files/${encodeURIComponent(f.object_key).replace(/%2F/g, '/')}` : null) ||
              f.url || filePathToUrl(f.path || f.fullPath || "");
            // If the URL is a relative path (starts with /) assume it's served by the backend
            // and prefix with API_BASE so the browser navigates to backend (not the SPA host).
            const url = (raw && String(raw).startsWith('/')) ? `${API_BASE.replace(/\/+$/, '')}${raw}` : raw;
            const name = f.label || f.name || f.filename || f.base || (f.path || "").split("/").pop();
            const key = `${f.subdir || ''}::${name}`;
            const checked = selectedKeys.includes(key);
            return (
              <li key={i} style={{ border:"1px solid #e5e7eb", borderRadius:10, padding:12, marginBottom:8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelectedKeys(prev => prev.includes(key) ? prev.filter(k=>k!==key) : [...prev, key]);
                      }}
                      style={{ width: 16, height: 16 }}
                    />
                    <div style={{ fontWeight:600 }}>{name || "(file)"}</div>
                  </div>
                  {url && (
                    <div style={{ marginLeft: 12 }}>
                      <a href={url} target="_blank" rel="noreferrer" style={{ position: 'relative', zIndex: 1001, pointerEvents: 'auto', textDecoration: 'none', color: '#2563eb', fontWeight: 600 }}>
                        Open
                      </a>
                    </div>
                  )}
                </div>
                <div style={{ fontSize:12, color:"#6b7280", marginTop: 6 }}>
                  {f.size != null ? `${f.size} bytes` : ""} {f.mtime ? ` • ${new Date(f.mtime).toLocaleString()}` : ""}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
