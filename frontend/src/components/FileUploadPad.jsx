import React, { useRef, useState, useCallback } from "react";
import { API_BASE } from "../config/apiBase";

export default function FileUploadPad({
  quoteNo,                     // required (SCM-Q-####)
  subdir = "drawings",         // e.g. drawings | uploads | vendor | photos | qc
  customerName,
  accept = ".pdf,.dxf,.dwg,.png,.jpg,.jpeg",
  multiple = true,
  maxSizeMB = 500,
  onComplete = () => {},
  onError = (e) => console.error(e),
}) {
  const inputRef = useRef(null);
  const [items, setItems] = useState([]); // { id, file, name, size, pct, state }

  const addFiles = useCallback((list) => {
    const next = [];
    for (const f of list) {
      if (!f) continue;
      if (f.size > maxSizeMB * 1024 * 1024) {
        onError(new Error(`"${f.name}" exceeds ${maxSizeMB} MB`));
        continue;
      }
      next.push({
        id: crypto.randomUUID(),
        file: f,
        name: f.name,
        size: f.size,
        pct: 0,
        state: "queued",
      });
    }
    setItems((cur) => [...cur, ...next]);
  }, [maxSizeMB, onError]);

  const handleBrowse = () => inputRef.current?.click();

  const onDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files || []);
  };

  const onPaste = (e) => {
    const files = [];
    for (const item of e.clipboardData.items) {
      if (item.kind === "file") {
        const f = item.getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length) addFiles(files);
  };

  const uploadAll = async () => {
    try {
      const queued = items.filter(i => i.state === "queued");
      if (!queued.length) return;

      // Build multipart/form-data with field name "files" (multer memoryStorage expects this)
  const form = new FormData();
  queued.forEach(q => form.append("files", q.file, q.name));
  if (customerName) form.append('customerName', customerName);

      setItems(cur => cur.map(x => queued.some(q => q.id === x.id) ? { ...x, state: "uploading", pct: 10 } : x));

      // POST to existing route (no backend changes required)
      const resp = await fetch(
        `${API_BASE}/api/quotes/${encodeURIComponent(quoteNo)}/upload?subdir=${encodeURIComponent(subdir)}`,
        {
          method: "POST",
          body: form,
          credentials: "include",
        }
      );

      let data = null;
      let text = "";
      try { text = await resp.text(); } catch (e) { /* ignore */ }
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }

      if (!resp.ok || !data?.ok) {
        const msg = (data && (data.error || data.message)) || text || `Upload failed (${resp.status})`;
        throw new Error(msg);
      }

      // Mark all queued as done
      const queuedIds = new Set(queued.map(q => q.id));
      setItems(cur => cur.map(x => queuedIds.has(x.id) ? ({ ...x, state: "done", pct: 100 }) : x));

      // Let parent refresh attachment list
  const attachments = Array.isArray(data.attachments) ? data.attachments : (data.files || []);
  onComplete(attachments);
    } catch (err) {
      setItems(cur => cur.map(x => x.state === "uploading" ? { ...x, state: "failed", pct: 0 } : x));
      onError(err);
    }
  };
  
  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-xl w-full max-w-lg mx-auto my-4 p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors"
      role="region"
      aria-label="File upload"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onPaste={onPaste}
  // Ensure the pad itself receives pointer events even if the wrapper disables them.
  onClick={(e) => e.stopPropagation()}
  style={{ minHeight: "140px", pointerEvents: 'auto' }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: "none" }}
        onChange={(e) => addFiles(e.target.files || [])}
      />
      <div className="space-y-3">
        {/* Upload icon */}
        <div>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 3v9" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 7l4-4 4 4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 15v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="text-gray-600 text-sm">
          Drag & drop files here, paste from clipboard, or
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleBrowse(); }}
          className="px-4 py-2 rounded-lg border bg-white shadow-sm hover:bg-gray-100"
        >
          Browse…
        </button>
      </div>

      {!!items.length && (
        <div className="mt-6 w-full space-y-2 text-left">
          {/* keep existing progress list */}
          {items.map((it) => (
            <div key={it.id} className="border rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div className="truncate">{it.name}</div>
                <div className="text-xs text-gray-500">{(it.size/1024/1024).toFixed(2)} MB</div>
              </div>
              <div className="h-2 bg-gray-200 rounded mt-2 overflow-hidden">
                <div
                  className={`h-full ${it.state==="failed" ? "bg-red-500" : "bg-blue-600"}`}
                  style={{ width: `${it.pct ?? (it.state==="done" ? 100 : it.state==="queued" ? 0 : 50)}%` }}
                />
              </div>
              <div className="text-xs mt-1 text-gray-600 capitalize">{it.state}</div>
            </div>
          ))}
          <div className="pt-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); uploadAll(); }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
