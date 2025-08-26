import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Marketing.css";

export default function Login() {
  const nav = useNavigate();
  const next = new URLSearchParams(useLocation().search).get("next") || "/";

  const demoSignin = (role="customer") => {
    // demo only: stash role; real app will call backend
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
