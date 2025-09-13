// client/src/components/UploadButton.jsx
import React, { useRef, useState } from "react";
import { API_BASE } from "../api/base";

export default function UploadButton({ onUploaded, quoteNo = '', subdir = 'uploads', multiple = false }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState(null);
  const [err, setErr] = useState("");

  const pick = () => {
    if (!quoteNo) {
      setErr('Please save the quote (create a Quote Number) before uploading files.');
      return;
    }
    inputRef.current?.click();
  };

  const handle = async (e) => {
    setErr("");
    console.log('UploadButton: Starting upload, quoteNo:', quoteNo, 'subdir:', subdir);
    if (!quoteNo) {
      setErr('Please save the quote (create a Quote Number) before uploading files.');
      e.target.value = "";
      return;
    }
    const files = Array.from(e.target.files || []).slice(0, multiple ? undefined : 1);
    if (files.length === 0) return;
    console.log('UploadButton: Selected files:', files.map(f => f.name));
    setBusy(true);
    try {
      const fd = new FormData();
      for (const f of files) fd.append('files', f);

      const url = `${API_BASE}/api/quotes/${encodeURIComponent(quoteNo)}/upload-supabase?subdir=${encodeURIComponent(subdir)}`;
      console.log('UploadButton: Uploading to Supabase URL:', url);
      const res = await fetch(url, { method: 'POST', body: fd, credentials: 'include' });
      console.log('UploadButton: Response status:', res.status, res.statusText);
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Upload failed (${res.status}): ${txt}`);
      }
      const j = await res.json();
      console.log('UploadButton: Response data:', j);
      // j.uploaded or j.uploaded array; normalize
  const uploaded = j.uploaded || j.uploadedFiles || [];
      console.log('UploadButton: Uploaded files:', uploaded);
      setLast(uploaded);
      onUploaded?.(uploaded);
      console.log('UploadButton: Called onUploaded with:', uploaded);
    } catch (e) {
      console.error('UploadButton: Error:', e);
      setErr(e?.message || "Upload failed");
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
        multiple={multiple}
        accept=".pdf,.png,.jpg,.jpeg,.webp,.zip,.dxf,.dwg,application/pdf,image/*,application/zip"
        style={{ display: "none" }}
        onChange={handle}
      />
      <button
        onClick={pick}
        disabled={busy || !quoteNo}
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #d1d5db",
          background: busy || !quoteNo ? "#e5e7eb" : "#2563eb",
          color: "#fff",
          fontWeight: 700,
          cursor: busy ? "not-allowed" : "pointer"
        }}
      >
        {busy ? "Uploading..." : "Upload Drawing"}
      </button>

      {!quoteNo && (
        <div style={{ fontSize: 12, color: '#6b7280' }}>Save the quote first to get a Quote Number, then upload drawings.</div>
      )}

      {last && Array.isArray(last) && last.length > 0 && (
        <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>
          ✅ Uploaded {last.length} file{last.length !== 1 ? 's' : ''} successfully
        </div>
      )}
      {err && <div style={{ color: "#b00020", fontSize: 12 }}>{err}</div>}
    </div>
  );
}
