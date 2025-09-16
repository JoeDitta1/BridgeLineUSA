import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Marketing.css";
import { API_BASE } from "../api/base";

export default function Login() {
  const nav = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // NEW: default to /app when marketing is at root
  const MKT_AT_ROOT = process.env.REACT_APP_MARKETING_AT_ROOT === "true";
  const defaultNext = MKT_AT_ROOT ? "/app" : "/";
  const next = params.get("next") || defaultNext;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store the JWT token
        localStorage.setItem("jwt_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Navigate to the next page
        nav(next, { replace: true });
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const demoSignin = (role = "customer") => {
    localStorage.setItem("role", role);
    nav(next, { replace: true });
  };

  return (
    <div className="mkt-wrap" style={{minHeight:"100vh"}}>
      <div className="mkt-header"><div className="mkt-brand">BridgeLineUSA</div><Link to="/marketing">Back</Link></div>
      <div className="mkt-hero">
        <h1>Sign in</h1>

        {/* Real login form */}
        <form onSubmit={handleLogin} style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 16,
                marginBottom: 12
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 16
              }}
            />
          </div>

          {error && (
            <div style={{
              color: "#d32f2f",
              marginBottom: 16,
              padding: "8px",
              background: "#ffebee",
              borderRadius: 4
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#ccc" : "#1976d2",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: 16
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Demo buttons for testing */}
        <p style={{ color: "#666", marginBottom: 16 }}>Demo buttons (bypass auth for testing):</p>
        <div className="mkt-hero-actions">
          <button className="mkt-cta" onClick={()=>demoSignin("customer")}>Customer Demo</button>
          <button className="mkt-secondary" onClick={()=>demoSignin("employee")}>Manufacturing Demo</button>
        </div>
      </div>
    </div>
  );
}
