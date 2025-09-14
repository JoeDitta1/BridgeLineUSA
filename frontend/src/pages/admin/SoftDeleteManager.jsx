import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";

export default function SoftDeleteManager() {
  const [deletedQuotes, setDeletedQuotes] = useState([]);
  const [deletedCustomers, setDeletedCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("quotes");
  const [operation, setOperation] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Load deleted quotes
      const quotesRes = await fetch(`${API_BASE}/api/admin/deleted/quotes`, { 
        credentials: "include" 
      });
      if (quotesRes.ok) {
        const quotesData = await quotesRes.json();
        setDeletedQuotes(quotesData.deletedQuotes || []);
      }

      // Load deleted customers
      const customersRes = await fetch(`${API_BASE}/api/admin/deleted/customers`, { 
        credentials: "include" 
      });
      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setDeletedCustomers(customersData.deletedCustomers || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRestoreQuote = async (quoteNo) => {
    try {
      setOperation(`Restoring quote ${quoteNo}...`);
      const res = await fetch(`${API_BASE}/api/admin/quotes/${encodeURIComponent(quoteNo)}/restore`, {
        method: "POST",
        credentials: "include"
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restore");
      
      setOperation("");
      await loadData(); // Refresh the data
    } catch (err) {
      setError(err.message || "Failed to restore quote");
      setOperation("");
    }
  };

  const handlePermanentDeleteQuote = async (quoteNo) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete quote ${quoteNo}? This cannot be undone.`)) {
      return;
    }
    
    try {
      setOperation(`Permanently deleting quote ${quoteNo}...`);
      const res = await fetch(`${API_BASE}/api/admin/quotes/${encodeURIComponent(quoteNo)}/permanent`, {
        method: "DELETE",
        credentials: "include"
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      
      setOperation("");
      await loadData(); // Refresh the data
    } catch (err) {
      setError(err.message || "Failed to permanently delete quote");
      setOperation("");
    }
  };

  const handleRestoreCustomer = async (customerName) => {
    try {
      setOperation(`Restoring customer ${customerName}...`);
      const res = await fetch(`${API_BASE}/api/admin/customers/${encodeURIComponent(customerName)}/restore`, {
        method: "POST",
        credentials: "include"
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restore");
      
      setOperation("");
      await loadData(); // Refresh the data
    } catch (err) {
      setError(err.message || "Failed to restore customer");
      setOperation("");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString() + " " + new Date(dateStr).toLocaleTimeString();
  };

  const tabStyle = (isActive) => ({
    padding: "8px 16px",
    border: "1px solid #ddd",
    borderRadius: "8px 8px 0 0",
    backgroundColor: isActive ? "#f8f9fa" : "#fff",
    cursor: "pointer",
    fontWeight: isActive ? "bold" : "normal"
  });

  const cardStyle = {
    padding: "16px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "12px",
    backgroundColor: "#fff"
  };

  const buttonStyle = {
    padding: "6px 12px",
    margin: "0 4px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px"
  };

  const restoreButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#28a745",
    color: "white",
    borderColor: "#28a745"
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#dc3545",
    color: "white",
    borderColor: "#dc3545"
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "12px" }}>
        <Link to="/admin" style={{ textDecoration: "none", color: "#111" }}>
          ← Back to Admin Dashboard
        </Link>
      </div>
      
      <h1>Soft Delete Manager</h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        Manage deleted quotes and customers. You can restore them or permanently delete them.
      </p>

      {error && (
        <div style={{ 
          padding: "12px", 
          backgroundColor: "#f8d7da", 
          color: "#721c24", 
          borderRadius: "4px",
          marginBottom: "16px"
        }}>
          Error: {error}
        </div>
      )}

      {operation && (
        <div style={{ 
          padding: "12px", 
          backgroundColor: "#d4edda", 
          color: "#155724", 
          borderRadius: "4px",
          marginBottom: "16px"
        }}>
          {operation}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", marginBottom: "16px", borderBottom: "1px solid #ddd" }}>
        <div
          style={tabStyle(activeTab === "quotes")}
          onClick={() => setActiveTab("quotes")}
        >
          Deleted Quotes ({deletedQuotes.length})
        </div>
        <div
          style={tabStyle(activeTab === "customers")}
          onClick={() => setActiveTab("customers")}
        >
          Deleted Customers ({deletedCustomers.length})
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Quotes Tab */}
          {activeTab === "quotes" && (
            <div>
              {deletedQuotes.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                  No deleted quotes found
                </div>
              ) : (
                deletedQuotes.map((quote) => (
                  <div key={quote.quote_no} style={cardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: "0 0 8px 0" }}>Quote: {quote.quote_no}</h3>
                        <p style={{ margin: "4px 0", color: "#666" }}>
                          <strong>Customer:</strong> {quote.customer_name || "N/A"}
                        </p>
                        <p style={{ margin: "4px 0", color: "#666" }}>
                          <strong>Created:</strong> {formatDate(quote.created_at)}
                        </p>
                        <p style={{ margin: "4px 0", color: "#666" }}>
                          <strong>Deleted:</strong> {formatDate(quote.deleted_at)}
                        </p>
                        <p style={{ margin: "4px 0", color: "#666" }}>
                          <strong>Job Name:</strong> {quote.job_name || "N/A"}
                        </p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <button
                          style={restoreButtonStyle}
                          onClick={() => handleRestoreQuote(quote.quote_no)}
                          disabled={!!operation}
                        >
                          Restore
                        </button>
                        <button
                          style={deleteButtonStyle}
                          onClick={() => handlePermanentDeleteQuote(quote.quote_no)}
                          disabled={!!operation}
                        >
                          Delete Forever
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === "customers" && (
            <div>
              {deletedCustomers.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                  No deleted customers found
                </div>
              ) : (
                deletedCustomers.map((customer, idx) => (
                  <div key={customer.name || idx} style={cardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: "0 0 8px 0" }}>Customer: {customer.name}</h3>
                        <p style={{ margin: "4px 0", color: "#666" }}>
                          <strong>Deleted:</strong> {formatDate(customer.deleted_at)}
                        </p>
                        <p style={{ margin: "4px 0", color: "#888", fontSize: "12px" }}>
                          Restoring a customer will also restore all of their quotes
                        </p>
                      </div>
                      <div>
                        <button
                          style={restoreButtonStyle}
                          onClick={() => handleRestoreCustomer(customer.name)}
                          disabled={!!operation}
                        >
                          Restore Customer & All Quotes
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
