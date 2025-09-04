import React, { useEffect, useRef, useState } from 'react';
import jfetch from '../lib/jfetch';

const API_BASE = process.env.REACT_APP_API_BASE || '';

function extOf(name) {
  if (!name) return '';
  const m = name.split('.');
  return m.length > 1 ? m.pop().toLowerCase() : '';
}

export default function FileViewerModal({ open, onClose, file, quoteNo }) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const prevActive = useRef(null);
  const modalRef = useRef(null);

  // pick preferred preview key from file shape
  const selectPreferredPreview = (f) => {
    if (!f) return null;
    // preferred shapes: f.previews [{size_key, url}] or f.previews[].url
    if (Array.isArray(f.previews) && f.previews.length) {
      const p1024 = f.previews.find(p => String(p.size_key) === '1024');
      return (p1024 && p1024.url) ? p1024.url : (f.previews[0].url || null);
    }
    if (f.preview1024) return f.preview1024;
    if (f.preview256) return f.preview256;
    // some endpoints expose original_url + previews under different key names
    if (f.original_url && typeof f.previews === 'object' && f.previews !== null) {
      const byKey = Object.values(f.previews).find(p => p.size_key === '1024');
      if (byKey && byKey.url) return byKey.url;
    }
    // fallback to file.url / original_url
    return f.url || f.original_url || null;
  };

  useEffect(() => {
    if (!open) return;
    prevActive.current = document.activeElement;
    // trap focus inside modal
    const focusable = modalRef.current?.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])') || [];
    if (focusable.length) focusable[0].focus();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; if (prevActive.current && prevActive.current.focus) prevActive.current.focus(); };
  }, [open]);

  // load preferred preview when file changes / open
  useEffect(() => {
    let active = true;
    if (!open || !file) return;
    const tryLoad = async () => {
      setLoading(true);
      setPreviewUrl(null);
      const candidate = selectPreferredPreview(file);
      if (!candidate) {
        setLoading(false);
        setPreviewUrl(null);
        return;
      }

      // Helper to test URL by loading image (works for images and preview images)
      const testUrl = (url) => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error('failed to load preview'));
        // set crossOrigin to anonymous to avoid tainted canvas (not required)
        try { img.crossOrigin = 'anonymous'; } catch (e) {}
        img.src = url;
      });

      try {
        const ok = await testUrl(candidate);
        if (!active) return;
        setPreviewUrl(ok);
        setLoading(false);
      } catch (err) {
        // Possibly signed URL expired — try refreshing listing once
        if (!refreshAttempted) {
          setRefreshAttempted(true);
          try {
            const fresh = await jfetch(`${API_BASE}/api/quotes/${encodeURIComponent(quoteNo)}/files`);
            // find matching file by name
            const fname = file.name || file.originalname || (file.url || '').split('/').slice(-1)[0];
            const updated = (Array.isArray(fresh) ? fresh.find(x => (x.name || '') === fname) : null);
            if (updated) {
              // if updated has previews or new url, retry test
              const newCandidate = selectPreferredPreview(updated);
              if (newCandidate) {
                try {
                  const ok2 = await testUrl(newCandidate);
                  if (!active) return;
                  setPreviewUrl(ok2);
                  setLoading(false);
                  return;
                } catch (e) {
                  // fall through to final fallback
                }
              }
            }
          } catch (e) {
            // ignore fetch error
          }
        }

        // final fallback: try to open original file url if it's an image
        const final = file.url || file.original_url || null;
        if (final) {
          try {
            const ok3 = await testUrl(final);
            if (!active) return;
            setPreviewUrl(ok3);
          } catch (_) {
            setPreviewUrl(null);
          }
        }
        setLoading(false);
      }
    };
    tryLoad();
    return () => { active = false; };
  }, [open, file, quoteNo, refreshAttempted]);

  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        // basic focus trap
        const focusable = modalRef.current?.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])') || [];
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const filename = file?.name || file?.originalname || (file?.url || '').split('/').slice(-1)[0] || 'file';
  const extension = extOf(filename);
  const isPdf = extension === 'pdf' || (file?.mime || '').includes('pdf');

  const originalUrl = file?.original_url || file?.url || file?.originalUrl || null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      <div ref={modalRef} style={{ position: 'relative', maxWidth: '92%', maxHeight: '92%', background: '#fff', borderRadius: 8, padding: 18, boxShadow: '0 12px 40px rgba(0,0,0,0.35)', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 800 }}>{filename}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {originalUrl && (
              <a href={originalUrl} target="_blank" rel="noreferrer noopener">
                <button style={{ padding: '8px 12px', borderRadius: 6 }}>Download</button>
              </a>
            )}
            <button onClick={onClose} style={{ padding: '8px 12px', borderRadius: 6 }}>Close</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ minWidth: 360, maxWidth: '80vw', maxHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loading && (
              <div style={{ textAlign: 'center' }} aria-live="polite">Loading preview…</div>
            )}
            {!loading && previewUrl && (
              isPdf ? (
                // render image preview for PDF; user can open full PDF
                <img src={previewUrl} alt="pdf preview" style={{ maxWidth: '80vw', maxHeight: '80vh', objectFit: 'contain' }} />
              ) : (
                <img
                  src={previewUrl}
                  alt="preview"
                  style={{ maxWidth: '80vw', maxHeight: '80vh', objectFit: 'contain', cursor: 'zoom-in' }}
                  onClick={(e) => {
                    const el = e.currentTarget;
                    if (el.style.objectFit === 'contain') el.style.objectFit = 'cover'; else el.style.objectFit = 'contain';
                  }}
                />
              )
            )}
            {!loading && !previewUrl && (
              <div style={{ textAlign: 'center' }}>No preview available.</div>
            )}
          </div>
          <div style={{ minWidth: 220 }}>
            <div style={{ marginBottom: 8, color: '#6b7280' }}>Details</div>
            <div><strong>Name:</strong> {filename}</div>
            <div><strong>Type:</strong> {file?.mime || extension || 'unknown'}</div>
            <div style={{ marginTop: 12 }}>
              {isPdf && originalUrl && (
                <a href={originalUrl} target="_blank" rel="noreferrer noopener"><button style={{ padding: '8px 12px', borderRadius: 6 }}>Open full PDF</button></a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
