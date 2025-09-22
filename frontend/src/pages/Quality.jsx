import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import QualityDashboard from './quality/QualityDashboard';
import QualityStandards from './quality/QualityStandards';
import DocumentManagement from './quality/DocumentManagement';
import AuditManagement from './quality/AuditManagement';
import TrainingMatrix from './quality/TrainingMatrix';
import CalibrationControl from './quality/CalibrationControl';
import NonConformance from './quality/NonConformance';
import QualityManuals from './quality/QualityManuals';
import QCWorkflow from './quality/QCWorkflow';
import AIQualityGenerator from './quality/AIQualityGenerator';
import { API_BASE } from '../api/base';

function getAuthHeaders() {
  const token = localStorage.getItem("jwt_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

export default function Quality() {
  const [activeStandards, setActiveStandards] = useState([]);
  const [complianceStatus, setComplianceStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Main navigation items for Quality module
  const navigationItems = [
    { 
      path: '/quality', 
      exact: true,
      name: 'Dashboard', 
      icon: '📊',
      description: 'Quality metrics and overview'
    },
    { 
      path: '/quality/standards', 
      name: 'Standards', 
      icon: '📋',
      description: 'Manage quality standards (ISO, ASME, API, etc.)'
    },
    { 
      path: '/quality/documents', 
      name: 'Documents', 
      icon: '📄',
      description: 'Procedures, forms, and document control'
    },
    { 
      path: '/quality/audits', 
      name: 'Audits', 
      icon: '🔍',
      description: 'Internal audits and compliance tracking'
    },
    { 
      path: '/quality/training', 
      name: 'Training', 
      icon: '🎓',
      description: 'Training matrix and certifications'
    },
    { 
      path: '/quality/calibration', 
      name: 'Calibration', 
      icon: '⚖️',
      description: 'Equipment calibration control'
    },
    { 
      path: '/quality/ncr', 
      name: 'NCR/CAPA', 
      icon: '⚠️',
      description: 'Non-conformance and corrective actions'
    },
    { 
      path: '/quality/manuals', 
      name: 'Manuals', 
      icon: '📚',
      description: 'Quality manuals and procedures'
    },
    { 
      path: '/quality/workflow', 
      name: 'QC Workflow', 
      icon: '⚙️',
      description: 'Production QC integration'
    },
    { 
      path: '/quality/ai-generator', 
      name: 'AI Generator', 
      icon: '🤖',
      description: 'Generate custom quality systems'
    }
  ];

  useEffect(() => {
    loadQualityData();
  }, []);

  const loadQualityData = async () => {
    try {
      setLoading(true);
      
      // Load active quality standards
      const standardsRes = await fetch(`${API_BASE}/api/quality/standards`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      
      if (standardsRes.ok) {
        const data = await standardsRes.json();
        setActiveStandards(data.standards || []);
      }

      // Load compliance status
      const complianceRes = await fetch(`${API_BASE}/api/quality/compliance-status`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      
      if (complianceRes.ok) {
        const data = await complianceRes.json();
        setComplianceStatus(data.status || {});
      }
      
    } catch (error) {
      console.error('Failed to load quality data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentPath = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading Quality Management System...
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#f8f9fa'
    }}>
      {/* Navigation Breadcrumb */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>📊</span>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            Quality Management System
          </h1>
        </div>
        
        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '8px 16px',
              background: '#6b7280',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🏠 Main Dashboard
          </button>
        </div>
      </div>

      {/* Main Content Area - No Sidebar */}
      <div>
        <Routes>
          <Route 
            path="/" 
            element={
              <QualityDashboard 
                activeStandards={activeStandards}
                complianceStatus={complianceStatus}
                onRefresh={loadQualityData}
              />
            } 
          />
          <Route 
            path="/standards/*" 
            element={
              <QualityStandards 
                activeStandards={activeStandards}
                onStandardsChange={loadQualityData}
              />
            } 
          />
          <Route path="/documents/*" element={<DocumentManagement />} />
          <Route path="/audits/*" element={<AuditManagement />} />
          <Route path="/training/*" element={<TrainingMatrix />} />
          <Route path="/calibration/*" element={<CalibrationControl />} />
          <Route path="/ncr/*" element={<NonConformance />} />
          <Route path="/manuals/*" element={<QualityManuals />} />
          <Route path="/workflow/*" element={<QCWorkflow />} />
          <Route path="/ai-generator/*" element={<AIQualityGenerator />} />
        </Routes>
      </div>
    </div>
  );
}