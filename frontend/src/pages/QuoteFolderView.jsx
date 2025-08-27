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

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <button
        onClick={() => navigate(`/quotes/customers/${encodeURIComponent(customerName)}`)}
        style={{ padding:"8px 12px", border:"1px solid #d1d5db", borderRadius:8, background:"#f9fafb", cursor:"pointer" }}
      >
        ← Back
      </button>

      <h1 style={{ marginTop: 12 }}>{customerName} / {quoteNo} / {section}</h1>

      {loading && <div>Loading…</div>}
      {error && <div style={{ color:"#b00020" }}>Failed: {error}</div>}
      {!loading && !error && files.length === 0 && <div>No files found.</div>}

      {!loading && !error && files.length > 0 && (
        <ul style={{ listStyle:"none", padding:0 }}>
          {files.map((f, i) => {
            const url = f.url || filePathToUrl(f.path || f.fullPath || "");
            const name = f.name || f.filename || f.base || (f.path || "").split("/").pop();
            return (
              <li key={i} style={{ border:"1px solid #e5e7eb", borderRadius:10, padding:12, marginBottom:8 }}>
                <div style={{ fontWeight:600 }}>{name || "(file)"}</div>
                <div style={{ fontSize:12, color:"#6b7280" }}>
                  {f.size != null ? `${f.size} bytes` : ""} {f.mtime ? ` • ${new Date(f.mtime).toLocaleString()}` : ""}
                </div>
                {url && <div style={{ marginTop:8 }}><a href={url} target="_blank" rel="noreferrer">Open</a></div>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
