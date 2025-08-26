// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// App (portal) pages
import Home from "./pages/Home";
import QuotesLanding from "./pages/QuotesLanding";
import CustomerQuotes from "./pages/CustomerQuotes";
import CustomerQuoteDetail from "./pages/CustomerQuoteDetail";
import QuoteForm from "./pages/QuoteForm";
import QuoteLog from "./pages/QuoteLog";
import QuoteFiles from "./pages/QuoteFiles";

// Public site / auth
import Marketing from "./pages/Marketing"; // make sure this file exists
import Login from "./pages/Login";         // make sure this file exists

const MKT_AT_ROOT = process.env.REACT_APP_MARKETING_AT_ROOT === "true";

const Stub = ({ title }) => (
  <div style={{ padding: 16 }}>
    <h1 style={{ fontSize: 20, fontWeight: 600 }}>{title}</h1>
    <p style={{ color: "#555" }}>Coming soon.</p>
  </div>
);

export default function App() {
  return (
    <Routes>
      {/* Root: toggle between Marketing and App Home */}
      <Route path="/" element={MKT_AT_ROOT ? <Marketing /> : <Home />} />

      {/* Always provide a direct App entry so employees can bypass marketing */}
      <Route path="/app" element={<Home />} />

      {/* Quotes */}
      <Route path="/quotes" element={<QuotesLanding />} />
      <Route path="/quotes/log" element={<QuoteLog />} />
      <Route path="/quote/new" element={<QuoteForm />} />
      <Route path="/quotes/new" element={<Navigate to="/quote/new" replace />} />
      <Route path="/quotes/:quoteNo/files" element={<QuoteFiles />} />

      {/* Customer quotes navigation */}
      <Route path="/quotes/customers" element={<CustomerQuotes />} />
      <Route path="/quotes/customers/:customerName" element={<CustomerQuoteDetail />} />

      {/* Other modules (stubs for now) */}
      <Route path="/production" element={<Stub title="Production" />} />
      <Route path="/customers"  element={<Stub title="Customers" />} />
      <Route path="/quality"    element={<Stub title="Quality" />} />
      <Route path="/shipping"   element={<Stub title="Shipping" />} />
      <Route path="/equipment"  element={<Stub title="Equipment" />} />

      {/* Public marketing & auth routes */}
      <Route path="/marketing" element={<Marketing />} />
      <Route path="/login" element={<Login />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={MKT_AT_ROOT ? "/marketing" : "/"} replace />} />
    </Routes>
  );
}
