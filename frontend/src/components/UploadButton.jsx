// client/src/components/UploadButton.jsx
import React, { useRef, useState } from "react";
import { uploadOne } from "../api/upload";

export default function UploadButton({ onUploaded }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState(null);
  const [err, setErr] = useState("");

  const pick = () => inputRef.current?.click();

  const handle = async (e) => {
    setErr("");
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const res = await uploadOne(f);
      setLast(res);
      onUploaded?.(res); // pass up to parent if provided
    } catch (e) {
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
        <a
          href={`${process.env.REACT_APP_API_BASE || ''}/uploads/${last.fileName}`}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 12 }}
        >
          Open: {last.originalName}
        </a>
      )}
      {err && <div style={{ color: "#b00020", fontSize: 12 }}>{err}</div>}
    </div>
  );
}
