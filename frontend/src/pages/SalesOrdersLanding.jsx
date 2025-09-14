import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

export default function SalesOrdersLanding() {
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

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h1>Sales Orders</h1>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => navigate('/sales-orders/new')}>+ New Sales Order</button>
        <Link to="/sales-orders/production-router" style={{ marginLeft: 8 }}>Production Router</Link>
      </div>

      {loading && <div>Loading…</div>}
      {!loading && orders.length === 0 && <div>No sales orders yet.</div>}
      {!loading && orders.length > 0 && (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th>Order</th><th>Customer</th><th>PO</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>{o.order_no}{o.po_number ? ` (PO: ${o.po_number})` : ''}</td>
                  <td>{o.customer_name}</td>
                  <td>{o.po_number || '—'}</td>
                  <td>{o.status}</td>
                  <td><Link to={`/sales-orders/${encodeURIComponent(o.order_no)}/files`}>Files</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
