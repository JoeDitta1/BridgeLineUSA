import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

export default function SalesOrderForm({ copyFromQuote }) {
  const [customerName, setCustomerName] = useState(copyFromQuote?.customerName || '');
  const [poNumber, setPoNumber] = useState(copyFromQuote?.poNumber || '');
  const [description, setDescription] = useState(copyFromQuote?.description || '');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  async function handleSave() {
    if (!customerName.trim()) { alert('Customer Name required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/sales-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          po_number: poNumber,
          description,
        }),
        credentials: 'include',
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'save failed');
      navigate(`/sales-orders/${encodeURIComponent(j.order.order_no)}/files`);
    } catch (e) {
      alert('Save failed: ' + String(e?.message || e));
    } finally { setSaving(false); }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h1>New Sales Order</h1>
      <div style={{ display: 'grid', gap: 8 }}>
        <label>Customer Name<input value={customerName} onChange={e=>setCustomerName(e.target.value)} /></label>
        <label>PO Number<input value={poNumber} onChange={e=>setPoNumber(e.target.value)} placeholder="CUST-12345" /></label>
        <label>Description<input value={description} onChange={e=>setDescription(e.target.value)} /></label>
        <div style={{ marginTop: 12 }}>
          <button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Create Sales Order'}</button>
        </div>
      </div>
    </div>
  );
}
