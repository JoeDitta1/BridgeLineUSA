import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE } from "../api/base";

export default function WorkOrderForm() {
  const { orderNo: routeOrderNo } = useParams();
  const navigate = useNavigate();

  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);

  const [customerName, setCustomerName] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [description, setDescription] = useState("");
  const [copyQuoteId, setCopyQuoteId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/quotes`);
        const j = await res.json();
        if (j && j.quotes) setQuotes(j.quotes);
      } catch (e) { console.warn('load quotes', e); }
      finally { setLoadingQuotes(false); }
    })();
  }, []);

  useEffect(() => {
    if (routeOrderNo) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/api/sales-orders/${encodeURIComponent(routeOrderNo)}`);
          const j = await res.json();
          if (j && j.order) {
            setCustomerName(j.order.customer_name || '');
            setPoNumber(j.order.po_number || '');
            setDescription(j.order.description || '');
          }
        } catch (_) {}
      })();
    }
  }, [routeOrderNo]);

  async function handleCopyQuote() {
    if (!copyQuoteId) return;
    try {
      const res = await fetch(`${API_BASE}/api/quotes/${encodeURIComponent(copyQuoteId)}`);
      if (!res.ok) throw new Error('Quote fetch failed');
      const q = await res.json();
      setCustomerName(q.customer_name || '');
      setDescription(q.description || q.projectDescription || '');
      if (q.sales_order_no) setPoNumber(q.sales_order_no);
    } catch (e) { alert('Failed to copy quote: ' + e.message); }
  }

  async function handleSave() {
    if (!customerName.trim()) { alert('Customer name required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/sales-orders`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_name: customerName, po_number: poNumber, description })
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'save failed');
      const newOrder = j.order;
      navigate(`/sales-orders/${encodeURIComponent(newOrder.order_no)}/form`);
    } catch (e) { alert('Save failed: ' + String(e?.message || e)); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h1>{routeOrderNo ? `Work Order: ${routeOrderNo}` : 'New Work Order'}</h1>

      <div style={{ display: 'grid', gap: 8 }}>
        <label>Copy From Quote
          <select value={copyQuoteId} onChange={e => setCopyQuoteId(e.target.value)} disabled={loadingQuotes}>
            <option value="">— Select Quote to Copy —</option>
            {quotes.map(q => <option key={q.id} value={q.id}>{q.quote_no} — {q.customer_name}</option>)}
          </select>
        </label>
        <button onClick={handleCopyQuote} disabled={!copyQuoteId}>Copy Quote Into Form</button>

        <label>Customer Name
          <input value={customerName} onChange={e => setCustomerName(e.target.value)} />
        </label>

        <label>PO Number
          <input value={poNumber} onChange={e => setPoNumber(e.target.value)} placeholder="CUST-12345" />
        </label>

        <label>Description
          <input value={description} onChange={e => setDescription(e.target.value)} />
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Create / Update Work Order'}</button>
          {routeOrderNo && (
            <button onClick={async () => {
              try {
                const res = await fetch(`${API_BASE}/api/sales-orders/${encodeURIComponent(routeOrderNo)}/ai-analyze`, { method: 'POST' });
                const j = await res.json();
                alert('AI Analyze:\n' + JSON.stringify(j.reports || j, null, 2));
              } catch (e) { alert('AI analyze failed: ' + e.message); }
            }}>AI Booster</button>
          )}
        </div>
      </div>
    </div>
  );
}
