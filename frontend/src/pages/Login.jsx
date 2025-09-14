import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Marketing.css";

export default function Login() {
  const nav = useNavigate();
  const params = new URLSearchParams(useLocation().search);

  // NEW: default to /app when marketing is at root
  const MKT_AT_ROOT = process.env.REACT_APP_MARKETING_AT_ROOT === "true";
  const defaultNext = MKT_AT_ROOT ? "/app" : "/";
  const next = params.get("next") || defaultNext;

  const demoSignin = (role = "customer") => {
    localStorage.setItem("role", role);
    nav(next, { replace: true });
  };
  
  return (
    <div className="mkt-wrap" style={{minHeight:"100vh"}}>
      <div className="mkt-header"><div className="mkt-brand">BridgeLineUSA</div><Link to="/marketing">Back</Link></div>
      <div className="mkt-hero">
        <h1>Sign in</h1>
        <p>Demo buttons for now—wire to real auth later.</p>
        <div className="mkt-hero-actions">
          <button className="mkt-cta" onClick={()=>demoSignin("customer")}>Customer Sign in</button>
          <button className="mkt-secondary" onClick={()=>demoSignin("employee")}>Manufacturing User</button>
        </div>
      </div>
    </div>
  );
}
