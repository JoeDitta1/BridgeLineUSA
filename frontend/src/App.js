// src/App.js
import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import QuoteForm from './pages/QuoteForm';
import QuoteLog from './pages/QuoteLog';
import QuoteFiles from './pages/QuoteFiles';


function Nav() {
  return (
    <nav style={styles.nav}>
      <Link to="/quotes" style={styles.navLink}>Quote Log</Link>
      <Link to="/quote/new" style={styles.navLink}>New Quote</Link>
    </nav>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Navigate to="/quotes" replace />} />
        <Route path="/quotes" element={<QuoteLog />} />
        <Route path="/quote/new" element={<QuoteForm />} />
	<Route path="/quotes/:quoteNo/files" element={<QuoteFiles />} />
        {/* add more routes later */}
      </Routes>
    </>
  );
}

const styles = {
  nav: { display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #eee', flexWrap: 'wrap' },
  navLink: { textDecoration: 'none', padding: '6px 10px', border: '1px solid #ddd', borderRadius: 8 },
};
