// frontend/src/pages/QuoteFolderView.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { filePathToUrl } from "../lib/fileUrls";

const API_BASE = (process.env.REACT_APP_API_BASE || "http://localhost:4000").replace(/\/+$/, "");

export default function QuoteFolderView() {
  const { customerName, quoteNo, section } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setError("");
      try {
        const url = `${API_BASE}/api/quotes/${encodeURIComponent(quoteNo)}/files?customer=${encodeURIComponent(customerName)}&section=${encodeURIComponent(section)}`;
        const res = await fetch(url, { credentials: "include" });
        const json = await res.json().catch(() => []);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (!alive) return;
        setFiles(Array.isArray(json) ? json : []);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [customerName, quoteNo, section]);

  const handleFileSelect = (fileName, checked) => {
    const newSelected = new Set(selectedFiles);
    if (checked) {
      newSelected.add(fileName);
    } else {
      newSelected.delete(fileName);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedFiles(new Set(files.map(f => f.name || f.filename || f.base || (f.path || "").split("/").pop())));
    } else {
      setSelectedFiles(new Set());
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0) {
      alert('Please select files to delete');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to soft delete ${selectedFiles.size} selected file(s)? This will hide them from view but they can be restored from the Admin portal.`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      const deletePromises = Array.from(selectedFiles).map(fileName => {
        const url = `${API_BASE}/api/quotes/${encodeURIComponent(quoteNo)}/files/${encodeURIComponent(fileName)}/soft-delete?customer=${encodeURIComponent(customerName)}&section=${encodeURIComponent(section)}`;
        return fetch(url, { method: 'POST', credentials: "include" });
      });

      const results = await Promise.all(deletePromises);
      let allSucceeded = true;
      
      for (const result of results) {
        if (!result.ok) {
          allSucceeded = false;
          break;
        }
      }
      
      if (allSucceeded) {
        // Add a small delay to allow Supabase storage operations to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refresh file list with cache busting
        setSelectedFiles(new Set());
        const timestamp = Date.now();
        const url = `${API_BASE}/api/quotes/${encodeURIComponent(quoteNo)}/files?customer=${encodeURIComponent(customerName)}&section=${encodeURIComponent(section)}&_t=${timestamp}`;
        const res = await fetch(url, { credentials: "include" });
        const json = await res.json().catch(() => []);
        if (res.ok) {
          setFiles(Array.isArray(json) ? json : []);
          console.log('Files after soft delete:', json.length);
        }
        alert(`Successfully soft deleted ${selectedFiles.size} file(s). They can be restored from the Admin portal.`);
      } else {
        alert('Some files could not be deleted. Please try again.');
      }
    } catch (e) {
      alert(`Error deleting files: ${e.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <button
        onClick={() => navigate(`/quotes/customers/${encodeURIComponent(customerName)}`)}
        style={{ padding:"8px 12px", border:"1px solid #d1d5db", borderRadius:8, background:"#f9fafb", cursor:"pointer" }}
      >
        ← Back
      </button>

      <button
        onClick={() => navigate(`/quotes/customers/${encodeURIComponent(customerName)}/${encodeURIComponent(quoteNo)}/quote-form`)}
        style={{ marginLeft: 12, padding:"8px 12px", border:"1px solid #2563eb", borderRadius:8, background:"#2563eb", color:'#fff', cursor:"pointer" }}
      >
        Open Quote Form
      </button>

      <h1 style={{ marginTop: 12 }}>{customerName} / {quoteNo} / {section}</h1>

      {section === 'quote-form' && (
        <div style={{ marginTop: 8 }}>
          <button
            onClick={() => navigate(`/quotes/customers/${encodeURIComponent(customerName)}/${encodeURIComponent(quoteNo)}/quote-form`)}
            style={{ padding: '8px 12px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Open Form
          </button>
        </div>
      )}

      {loading && <div>Loading…</div>}
      {error && <div style={{ color:"#b00020" }}>Failed: {error}</div>}
      {!loading && !error && files.length === 0 && <div>No files found.</div>}

      {!loading && !error && files.length > 0 && (
        <>
          <div style={{ margin: '16px 0', padding: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  type="checkbox"
                  checked={selectedFiles.size === files.length && files.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                Select All ({selectedFiles.size}/{files.length})
              </label>
              
              {selectedFiles.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={deleting}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    opacity: deleting ? 0.6 : 1
                  }}
                >
                  {deleting ? 'Soft Deleting...' : `Soft Delete Selected (${selectedFiles.size})`}
                </button>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              Select files using checkboxes, then click "Soft Delete Selected" to hide them. Files can be restored from Admin portal.
            </div>
          </div>

          <ul style={{ listStyle:"none", padding:0 }}>
            {files.filter(f => {
              // Filter out folders and system files
              const name = f.name || f.filename || f.base || (f.path || "").split("/").pop();
              return name && 
                     name !== 'drawings' && 
                     name !== 'uploads' && 
                     name !== 'vendors' && 
                     name !== 'notes' && 
                     name !== 'exports' &&
                     !name.startsWith('.') &&
                     name.includes('-'); // Only show files that look like part numbers
            }).map((f, i) => {
              // Prefer the URL provided by the backend, fallback to filePathToUrl for legacy data
              const url = f.url || filePathToUrl(f.path || f.fullPath || "");
              const fullName = f.name || f.filename || f.base || (f.path || "").split("/").pop();
              
              // Extract clean part number - remove timestamps and file extensions
              let partNumber = fullName;
              // Remove file extension
              partNumber = partNumber.split('.')[0];
              // Remove timestamp pattern like __2025-09-10T16-57-30-649Z
              partNumber = partNumber.replace(/__\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/, '');
              // Remove any remaining timestamp patterns
              partNumber = partNumber.replace(/_+\d{4}-.*$/, '');
              
              // Ensure the URL is absolute by prepending API_BASE if it starts with /
              const fullUrl = url && url.startsWith('/') ? `${API_BASE}${url}` : url;
              
              return (
                <li key={i} style={{ 
                  border:"1px solid #e5e7eb", 
                  borderRadius:8, 
                  padding:16, 
                  marginBottom:12,
                  backgroundColor: '#fff'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    minHeight: 40
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(fullName)}
                        onChange={(e) => handleFileSelect(fullName, e.target.checked)}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <div>
                        <div style={{ 
                          fontWeight: 600, 
                          fontSize: 16,
                          color: '#1f2937',
                          fontFamily: 'system-ui, -apple-system, sans-serif'
                        }}>
                          {partNumber || "(file)"}
                        </div>
                        <div style={{ 
                          fontSize: 13, 
                          color: "#6b7280",
                          marginTop: 2
                        }}>
                          {f.size != null ? `${Math.round(f.size / 1024)} KB` : ""} 
                          {f.mtime ? ` • ${new Date(f.mtime).toLocaleDateString()}` : ""}
                        </div>
                      </div>
                    </div>
                    {fullUrl && (
                      <button
                        onClick={() => window.open(fullUrl, '_blank')}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                      >
                        Open
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
