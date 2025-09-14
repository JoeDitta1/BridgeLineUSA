import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../api/base";

export default function SalesOrdersLog() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/sales-orders`);
        const j = await res.json();
        setOrders(j.orders || []);
      } catch (e) {
        console.warn(e);
      } finally { setLoading(false); }
    })();
  }, []);

  const renderLabel = (o) => `${o.order_no}${o.po_number ? ` (PO: ${o.po_number})` : ''}`;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1>Sales Orders</h1>
        <div>
          <button onClick={() => navigate('/sales-orders/new')}>+ New Work Order</button>
          <Link to="/sales-orders/production-router" style={{ marginLeft: 12 }}>Production Router</Link>
        </div>
      </div>

      {loading && <div>Loading…</div>}
      {!loading && orders.length === 0 && <div>No sales orders yet.</div>}

      {!loading && orders.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8 }}>Order</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Customer</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
              <th style={{ textAlign: 'right', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td style={{ padding: 8 }}>{renderLabel(o)}</td>
                <td style={{ padding: 8 }}>{o.customer_name}</td>
                <td style={{ padding: 8 }}>{o.status}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>
                  <Link to={`/sales-orders/${encodeURIComponent(o.order_no)}/form`} style={{ marginRight: 8 }}>Edit</Link>
                  <button onClick={async () => {
                    try {
                      const res = await fetch(`${API_BASE}/api/sales-orders/${encodeURIComponent(o.order_no)}/ai-analyze`, { method: 'POST' });
                      const j = await res.json();
                      alert('AI Analyze: ' + JSON.stringify(j.reports || j, null, 2));
                    } catch (e) { alert('AI analyze failed: ' + e.message); }
                  }}>AI Booster</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
