// client/src/components/UploadButton.jsx
import React, { useRef, useState } from "react";
import { uploadOne, uploadFilesToQuote } from "../api/upload";

// props: onUploaded(result), quoteNo (optional), subdir (optional, defaults to 'uploads')
export default function UploadButton({ onUploaded, quoteNo, subdir = 'uploads' }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState(null);
  const [err, setErr] = useState("");

  const pick = () => inputRef.current?.click();

  const handle = async (e) => {
    setErr("");
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setBusy(true);
      try {
      // If quoteNo provided, upload to quote-specific endpoint under provided subdir
      if (quoteNo) {
        const res = await uploadFilesToQuote(quoteNo, files, subdir);
        setLast(res);
          // Normalize callback payload: always call onUploaded with an ARRAY of items
          const attachments = Array.isArray(res && res.attachments) ? res.attachments
            : Array.isArray(res) ? res
            : (res && res.attachments ? [res.attachments] : (res ? [res] : []));
          onUploaded?.(attachments);
      } else {
        // fallback: upload first file to generic /api/upload (legacy)
        const res = await uploadOne(files[0]);
        setLast(res);
        // legacy single-file response — wrap into an array for consistency
        onUploaded?.(res ? [res] : []);
      }
    } catch (errRes) {
      setErr(errRes?.message || "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = ""; // reset file input
    }
  };

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 6 }}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.zip,.dxf,.dwg,application/pdf,image/*,application/zip"
        style={{ display: "none" }}
        onChange={handle}
      />
      <button
        onClick={pick}
        disabled={busy}
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #d1d5db",
          background: busy ? "#e5e7eb" : "#2563eb",
          color: "#fff",
          fontWeight: 700,
          cursor: busy ? "not-allowed" : "pointer"
        }}
      >
        {busy ? "Uploading..." : "Upload Drawing"}
      </button>

      {last && (
        (() => {
          // Prefer VITE env (import.meta.env) when available, fall back to CRA REACT_APP_API_BASE
          const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || (process.env.REACT_APP_API_BASE || '');
          const base = API_BASE.replace ? API_BASE.replace(/\/+$|^\s+|\s+$/g, '') : API_BASE;
          const href = `${base}/uploads/${last.fileName}`;
          return (
            <a href={href} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
              Open: {last.originalName}
            </a>
          );
        })()
      )}
      {err && <div style={{ color: "#b00020", fontSize: 12 }}>{err}</div>}
    </div>
  );
}
