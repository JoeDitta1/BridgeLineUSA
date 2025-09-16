import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../../api/base";

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('jwt_token');
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "staff",
    company: ""
  });

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  async function load() {
    try {
      setErr(""); setBusy(true);
      console.log('Loading users from:', `${API_BASE}/api/admin/users`);
      const r = await fetch(`${API_BASE}/api/admin/users`, { 
        headers: getAuthHeaders(),
        credentials: "include" 
      });
      const j = await r.json();
      console.log('Users response:', j);
      if (!r.ok) throw new Error(j?.error || "Failed");
      setUsers(j.users || j || []); // Handle different response formats
    } catch (e) { 
      console.error('Load users error:', e);
      setErr(String(e.message || e)); 
    }
    finally { setBusy(false); }
  }

  async function handleAddUser(e) {
    e.preventDefault();
    try {
      setErr(""); setSuccess(""); setBusy(true);

      if (!newUser.email || !newUser.password || !newUser.role) {
        throw new Error("Email, password, and role are required");
      }

      if (newUser.role === 'oem' && !newUser.company) {
        throw new Error("Company is required for OEM users");
      }

      const response = await fetch(`${API_BASE}/api/admin/users`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(newUser)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to create user");

      setSuccess("User created successfully!");
      setNewUser({ email: "", password: "", full_name: "", role: "staff", company: "" });
      setShowAddForm(false);
      load();
    } catch (e) { 
      setErr(String(e.message || e)); 
    } finally { 
      setBusy(false); 
    }
  }

  async function handleDeleteUser(userId, userEmail) {
    if (!window.confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) {
      return;
    }

    try {
      setErr(""); setSuccess(""); setBusy(true);
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include"
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to delete user");

      setSuccess("User deleted successfully!");
      load();
    } catch (e) { 
      setErr(String(e.message || e)); 
    } finally { 
      setBusy(false); 
    }
  }

  async function handleResetPassword(userId, userEmail) {
    const newPassword = prompt(`Enter new password for ${userEmail}:`);
    if (!newPassword) return;

    if (newPassword.length < 8) {
      setErr("Password must be at least 8 characters long");
      return;
    }

    try {
      setErr(""); setSuccess(""); setBusy(true);
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}/reset-password`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        credentials: "include",
        body: JSON.stringify({ newPassword })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to reset password");

      setSuccess(`Password reset successfully for ${userEmail}!`);
    } catch (e) { 
      setErr(String(e.message || e)); 
    } finally { 
      setBusy(false); 
    }
  }

  async function handleToggleActiveStatus(userId, userEmail, currentStatus) {
    const action = currentStatus ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} user ${userEmail}?`)) {
      return;
    }

    try {
      setErr(""); setSuccess(""); setBusy(true);
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        credentials: "include",
        body: JSON.stringify({ is_active: !currentStatus })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || `Failed to ${action} user`);

      setSuccess(`User ${action}d successfully!`);
      load();
    } catch (e) { 
      setErr(String(e.message || e)); 
    } finally { 
      setBusy(false); 
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 12 }}><Link to="/admin">← Back to Admin</Link></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>User Management</h1>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={busy}
          style={{
            padding: "8px 16px",
            backgroundColor: showAddForm ? "#6b7280" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: busy ? "not-allowed" : "pointer",
            opacity: busy ? 0.6 : 1
          }}
        >
          {showAddForm ? "Cancel" : "+ Add User"}
        </button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div style={{ 
          backgroundColor: "#f9fafb", 
          padding: 16, 
          borderRadius: "8px", 
          marginBottom: 20,
          border: "1px solid #e5e7eb"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>Add New User</h3>
          <form onSubmit={handleAddUser}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontWeight: "500" }}>Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontWeight: "500" }}>Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontWeight: "500" }}>Full Name</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontWeight: "500" }}>Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                  required
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="oem">OEM Partner</option>
                </select>
              </div>
            </div>

            {newUser.role === 'oem' && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 4, fontWeight: "500" }}>Company *</label>
                <input
                  type="text"
                  value={newUser.company}
                  onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                  required={newUser.role === 'oem'}
                  placeholder="Enter OEM company name"
                />
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                disabled={busy}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: busy ? "not-allowed" : "pointer",
                  opacity: busy ? 0.6 : 1
                }}
              >
                {busy ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {busy && <div>Loading…</div>}
      {err && <div style={{ color: "#b00020" }}>{err}</div>}
      {success && <div style={{ color: "#2e7d32" }}>{success}</div>}
      {!busy && users.length === 0 && <div>No users found.</div>}
      {users.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", background: "#f3f4f6" }}>
              <th style={{ padding:8 }}>Email</th>
              <th style={{ padding:8 }}>Name</th>
              <th style={{ padding:8 }}>Role</th>
              <th style={{ padding:8 }}>Company</th>
              <th style={{ padding:8 }}>Status</th>
              <th style={{ padding:8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ padding:8 }}>{u.email || "-"}</td>
                <td style={{ padding:8 }}>{u.full_name || "No name set"}</td>
                <td style={{ padding:8 }}>
                  <span style={{
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    backgroundColor: u.role === 'admin' ? '#fee2e2' : u.role === 'oem' ? '#d1fae5' : '#dbeafe',
                    color: u.role === 'admin' ? '#dc2626' : u.role === 'oem' ? '#059669' : '#2563eb'
                  }}>
                    {u.role?.toUpperCase() || "STAFF"}
                  </span>
                </td>
                <td style={{ padding:8 }}>{u.company || "-"}</td>
                <td style={{ padding:8 }}>
                  <span style={{
                    color: u.is_active ? '#2e7d32' : '#d32f2f'
                  }}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding:8 }}>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    <button
                      onClick={() => setEditingUser(u)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleResetPassword(u.id, u.email)}
                      disabled={busy}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#f59e0b",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: busy ? "not-allowed" : "pointer",
                        fontSize: "12px",
                        opacity: busy ? 0.6 : 1
                      }}
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => handleToggleActiveStatus(u.id, u.email, u.is_active)}
                      disabled={busy}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: u.is_active ? "#f97316" : "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: busy ? "not-allowed" : "pointer",
                        fontSize: "12px",
                        opacity: busy ? 0.6 : 1
                      }}
                    >
                      {u.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.email)}
                      disabled={busy}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: busy ? "not-allowed" : "pointer",
                        fontSize: "12px",
                        opacity: busy ? 0.6 : 1
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: "8px",
            width: "400px",
            maxWidth: "90vw"
          }}>
            <h3 style={{ marginTop: 0 }}>Edit User: {editingUser.email}</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updates = {
                role: formData.get('role'),
                company: formData.get('company'),
                full_name: formData.get('full_name'),
                is_active: formData.get('is_active') === 'on'
              };
              
              fetch(`${API_BASE}/api/admin/users/${editingUser.id}`, {
                method: "PUT",
                headers: { 
                  "Content-Type": "application/json",
                  ...getAuthHeaders()
                },
                credentials: "include",
                body: JSON.stringify(updates)
              })
              .then(r => r.json())
              .then(data => {
                if (data.ok) {
                  setSuccess("User updated successfully!");
                  setEditingUser(null);
                  load();
                } else {
                  setErr(data.error || "Failed to update user");
                }
              })
              .catch(e => setErr(String(e.message || e)));
            }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 4, fontWeight: "500" }}>Full Name</label>
                <input
                  name="full_name"
                  type="text"
                  defaultValue={editingUser.full_name || ''}
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                />
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 4, fontWeight: "500" }}>Role</label>
                <select
                  name="role"
                  defaultValue={editingUser.role}
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="oem">OEM Partner</option>
                </select>
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 4, fontWeight: "500" }}>Company</label>
                <input
                  name="company"
                  type="text"
                  defaultValue={editingUser.company || ''}
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                />
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    name="is_active"
                    type="checkbox"
                    defaultChecked={editingUser.is_active}
                  />
                  <span>Active User</span>
                </label>
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
