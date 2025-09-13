// frontend/src/pages/CustomerQuoteDetail.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

const API_BASE = (process.env.REACT_APP_API_BASE || 'http://localhost:4000').replace(/\/+$/, '');

export default function CustomerQuoteDetail() {
  // Route param is :customerName (keep a fallback if router supplied :slug previously)
  const params = useParams();
  const slug = params.customerName ?? params.slug ?? Object.values(params)[0] ?? '';

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState(decodeURIComponent(slug || ''));
  const [quotes, setQuotes] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [deletingQuoteNo, setDeletingQuoteNo] = useState(null); // Track which quote is being deleted

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setError('');
      try {
        const res = await fetch(`${API_BASE}/api/quotes/customers/${encodeURIComponent(slug || '')}`, { credentials: 'include' });
        const json = await res.json().catch(()=>({}));
        if (!res.ok || json.ok === false) throw new Error(json.error || `HTTP ${res.status}`);
        if (!alive) return;
        setCustomer(json.customer ?? decodeURIComponent(slug));
        setQuotes(Array.isArray(json.quotes) ? json.quotes : []);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || String(e));
        setQuotes([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  const stats = useMemo(() => ({ count: quotes.length }), [quotes]);

  const container = { padding: 20, maxWidth: 1100, margin: '0 auto' };
  const button    = { padding:'10px 14px', borderRadius:10, border:'1px solid #d1d5db', background:'#f9fafb', fontWeight:700, cursor:'pointer' };
  const primary   = { ...button, background:'#2563eb', color:'#fff', borderColor:'#2563eb' };
  const grid      = { display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))' };
  const card      = { border:'1px solid #e5e7eb', borderRadius:12, padding:14, background:'#fff' };

  const gotoSection = (qNo, section) => {
    if (!section) return;
    navigate(`/quotes/customers/${encodeURIComponent(customer)}/${encodeURIComponent(qNo)}/${section}`);
  };

  const handleSoftDeleteQuote = async (quoteNo) => {
    // Prevent multiple deletions at once
    if (deleting || deletingQuoteNo) {
      console.log('Deletion already in progress, skipping');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete quote ${quoteNo}? You can restore it from the admin panel.`)) {
      return;
    }
    
    try {
      setDeleting(true);
      setDeletingQuoteNo(quoteNo);
      
      console.log('Making deletion API call for quote:', quoteNo);
      const res = await fetch(`${API_BASE}/api/admin/quotes/${encodeURIComponent(quoteNo)}/soft-delete`, {
        method: 'POST',
        credentials: 'include'
      });
      
      console.log('API response status:', res.status);
      const data = await res.json();
      console.log('API response data:', data);
      
      if (!res.ok) throw new Error(data.error || 'Failed to delete quote');
      
      // Remove the deleted quote from the local state
      console.log('Current quotes before filtering:', quotes.map(q => ({ quoteNo: q.quoteNo, quote_no: q.quote_no })));
      const newQuotes = quotes.filter(quote => {
        // Check both possible quote number fields
        const matches = quote.quoteNo === quoteNo || quote.quote_no === quoteNo;
        console.log(`Quote ${quote.quoteNo || quote.quote_no} matches ${quoteNo}?`, matches);
        return !matches;
      });
      console.log('New quotes after filtering:', newQuotes.map(q => ({ quoteNo: q.quoteNo, quote_no: q.quote_no })));
      
      setQuotes(newQuotes);
      alert(`Quote ${quoteNo} has been deleted successfully.`);
      
    } catch (err) {
      console.error(`Error deleting quote:`, err);
      alert(`Failed to delete quote: ${err.message}`);
    } finally {
      setDeleting(false);
      setDeletingQuoteNo(null);
    }
  };

  const handleSoftDeleteCustomer = async () => {
    if (!window.confirm(`Are you sure you want to delete customer "${customer}" and ALL their quotes? You can restore them from the admin panel.`)) {
      return;
    }
    
    try {
      setDeleting(true);
      const res = await fetch(`${API_BASE}/api/admin/customers/${encodeURIComponent(customer)}/soft-delete`, {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete customer');
      
      // Go back to customers list
      navigate('/quotes/customers');
    } catch (err) {
      alert(`Failed to delete customer: ${err.message}`);
      setDeleting(false);
    }
  };

  const sectionOptions = [
    ['drawings','Drawings'],
    ['uploads','Uploads'],
    ['vendor-quotes','Vendor Quotes'],
    ['quality-info','Quality Info'],
    ['customer-notes','Customer Notes'],
    ['photos','Photos'],
    ['exports','Exports'],
    ['internal-notes','Internal Notes'],
    ['change-orders','Change Orders'],
    ['quote-form','Quote Form'],
  ];

  return (
    <div style={container}>
      <div style={{ marginBottom: 8 }}>
        <button onClick={() => navigate('/quotes/customers')} style={button}>← Back to Customers</button>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h1 style={{ margin:0, fontSize:28, fontWeight:800 }}>{customer || '(No name)'}</h1>
        <div style={{ display:'flex', gap:10 }}>
          <Link to="/quotes/new" state={{ customerName: customer }}>
            <button style={primary}>+ New Quote</button>
          </Link>
          <button 
            style={{...button, backgroundColor: '#dc3545', color: 'white', borderColor: '#dc3545'}} 
            onClick={handleSoftDeleteCustomer}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Customer'}
          </button>
        </div>
      </div>

      <div style={{ margin:'8px 0 16px' }}><strong>{stats.count}</strong> total quote(s)</div>

      {loading && <div>Loading…</div>}
      {error && <div style={{ color:'#b00020', marginBottom: 12 }}>Failed to load: {error}</div>}

      {!loading && !error && quotes.length === 0 && (
        <div style={{ border: '1px dashed #d1d5db', borderRadius: 12, padding: 18, color: '#374151', background: '#fafafa' }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No quote folders yet</div>
          <div>Quote folders will be created when you save new quotes for this customer.</div>
          <div style={{ marginTop: 12 }}>
            <Link to="/quotes/new" state={{ customerName: customer }}>
              <button style={{ ...primary, padding: '12px 18px' }}>Create First Quote</button>
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && quotes.length > 0 && (
        <div style={grid}>
          {quotes.map(q => (
            <div key={q.dirName} style={card}>
              <div style={{ fontWeight:800 }}>{q.quoteNo}{q.description ? ` — ${q.description}` : ''}</div>
              <div style={{ fontSize:12, color:'#6b7280' }}>Updated {new Date(q.mtimeMs).toLocaleString()}</div>
              <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
                <button style={button} onClick={() => gotoSection(q.quoteNo, 'drawings')}>Open Drawings</button>
                <button style={button} onClick={() => gotoSection(q.quoteNo, 'uploads')}>Open Uploads</button>
                <select
                  aria-label="Open section"
                  defaultValue=""
                  onChange={(e)=>gotoSection(q.quoteNo, e.target.value)}
                  style={{ ...button, padding:'10px 10px' }}
                >
                  <option value="" disabled>Open…</option>
                  {sectionOptions.map(([val,label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                <button 
                  style={{
                    ...button, 
                    backgroundColor: deleting ? '#6c757d' : '#dc3545', 
                    color: 'white', 
                    borderColor: deleting ? '#6c757d' : '#dc3545', 
                    fontSize: '12px',
                    opacity: deleting ? 0.6 : 1,
                    cursor: deleting ? 'not-allowed' : 'pointer'
                  }} 
                  onClick={() => handleSoftDeleteQuote(q.quoteNo)}
                  disabled={deleting}
                >
                  {deletingQuoteNo === q.quoteNo ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
