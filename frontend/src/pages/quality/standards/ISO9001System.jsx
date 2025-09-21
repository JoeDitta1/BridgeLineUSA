import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// ISO 9001 Sub-components
import ISO9001Overview from './iso9001/ISO9001Overview';
import ISO9001Procedures from './iso9001/ISO9001Procedures';
import ISO9001Forms from './iso9001/ISO9001Forms';
import ISO9001Audit from './iso9001/ISO9001Audit';
import ISO9001Manual from './iso9001/ISO9001Manual';

export default function ISO9001System() {
  const [implementationStatus, setImplementationStatus] = useState({
    implemented: true,
    auditReady: false,
    lastAudit: null,
    nextAudit: '2025-12-15',
    complianceScore: 87
  });

  const navigate = useNavigate();
  const location = useLocation();

  // ISO 9001:2015 Clause Structure
  const iso9001Clauses = [
    {
      clause: '4',
      title: 'Context of the Organization',
      subclauses: [
        { clause: '4.1', title: 'Understanding the organization and its context', status: 'complete' },
        { clause: '4.2', title: 'Understanding the needs and expectations of interested parties', status: 'complete' },
        { clause: '4.3', title: 'Determining the scope of the quality management system', status: 'complete' },
        { clause: '4.4', title: 'Quality management system and its processes', status: 'in-progress' }
      ]
    },
    {
      clause: '5',
      title: 'Leadership',
      subclauses: [
        { clause: '5.1', title: 'Leadership and commitment', status: 'complete' },
        { clause: '5.2', title: 'Policy', status: 'complete' },
        { clause: '5.3', title: 'Organizational roles, responsibilities and authorities', status: 'complete' }
      ]
    },
    {
      clause: '6',
      title: 'Planning',
      subclauses: [
        { clause: '6.1', title: 'Actions to address risks and opportunities', status: 'in-progress' },
        { clause: '6.2', title: 'Quality objectives and planning to achieve them', status: 'complete' },
        { clause: '6.3', title: 'Planning of changes', status: 'complete' }
      ]
    },
    {
      clause: '7',
      title: 'Support',
      subclauses: [
        { clause: '7.1', title: 'Resources', status: 'complete' },
        { clause: '7.2', title: 'Competence', status: 'complete' },
        { clause: '7.3', title: 'Awareness', status: 'in-progress' },
        { clause: '7.4', title: 'Communication', status: 'complete' },
        { clause: '7.5', title: 'Documented information', status: 'complete' }
      ]
    },
    {
      clause: '8',
      title: 'Operation',
      subclauses: [
        { clause: '8.1', title: 'Operational planning and control', status: 'complete' },
        { clause: '8.2', title: 'Requirements for products and services', status: 'complete' },
        { clause: '8.3', title: 'Design and development of products and services', status: 'not-applicable' },
        { clause: '8.4', title: 'Control of externally provided processes, products and services', status: 'in-progress' },
        { clause: '8.5', title: 'Production and service provision', status: 'complete' },
        { clause: '8.6', title: 'Release of products and services', status: 'complete' },
        { clause: '8.7', title: 'Control of nonconforming outputs', status: 'complete' }
      ]
    },
    {
      clause: '9',
      title: 'Performance Evaluation',
      subclauses: [
        { clause: '9.1', title: 'Monitoring, measurement, analysis and evaluation', status: 'in-progress' },
        { clause: '9.2', title: 'Internal audit', status: 'complete' },
        { clause: '9.3', title: 'Management review', status: 'complete' }
      ]
    },
    {
      clause: '10',
      title: 'Improvement',
      subclauses: [
        { clause: '10.1', title: 'General', status: 'complete' },
        { clause: '10.2', title: 'Nonconformity and corrective action', status: 'complete' },
        { clause: '10.3', title: 'Continual improvement', status: 'in-progress' }
      ]
    }
  ];

  const navigation = [
    { path: '', name: 'Overview', icon: '📊' },
    { path: '/procedures', name: 'Procedures', icon: '📋' },
    { path: '/forms', name: 'Forms & Records', icon: '📄' },
    { path: '/audit', name: 'Audit Management', icon: '🔍' },
    { path: '/manual', name: 'Quality Manual', icon: '📚' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return '#22c55e';
      case 'in-progress': return '#f59e0b';
      case 'not-started': return '#ef4444';
      case 'not-applicable': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'complete': return 'Complete';
      case 'in-progress': return 'In Progress';
      case 'not-started': return 'Not Started';
      case 'not-applicable': return 'N/A';
      default: return 'Unknown';
    }
  };

  const getCurrentPath = () => {
    const path = location.pathname.replace('/quality/standards/iso9001', '');
    return path || '';
  };

  const isActivePath = (navPath) => {
    const currentPath = getCurrentPath();
    return currentPath === navPath;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ISO 9001 Sidebar */}
      <div style={{
        width: '350px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        color: 'white',
        padding: '20px',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        overflowY: 'auto'
      }}>
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '22px', 
            fontWeight: 'bold'
          }}>
            ISO 9001:2015
          </h2>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            opacity: 0.8 
          }}>
            Quality Management Systems - Requirements
          </p>
        </div>

        {/* Status Summary */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '25px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', opacity: 0.9 }}>Compliance Score</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {implementationStatus.complianceScore}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${implementationStatus.complianceScore}%`,
              height: '100%',
              background: '#22c55e',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
            Next Audit: {implementationStatus.nextAudit}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ 
            margin: '0 0 15px 0', 
            fontSize: '16px', 
            fontWeight: 'bold',
            opacity: 0.9 
          }}>
            Navigation
          </h4>
          {navigation.map((nav, idx) => (
            <button
              key={idx}
              onClick={() => navigate(`/quality/standards/iso9001${nav.path}`)}
              style={{
                width: '100%',
                padding: '12px 16px',
                marginBottom: '8px',
                background: isActivePath(nav.path) 
                  ? 'rgba(255,255,255,0.2)' 
                  : 'transparent',
                border: isActivePath(nav.path) 
                  ? '1px solid rgba(255,255,255,0.3)' 
                  : '1px solid transparent',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'left'
              }}
            >
              <span style={{ fontSize: '16px' }}>{nav.icon}</span>
              {nav.name}
            </button>
          ))}
        </div>

        {/* Clause Compliance */}
        <div>
          <h4 style={{ 
            margin: '0 0 15px 0', 
            fontSize: '16px', 
            fontWeight: 'bold',
            opacity: 0.9 
          }}>
            Clause Compliance
          </h4>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {iso9001Clauses.map((clause, idx) => (
              <div key={idx} style={{ marginBottom: '15px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  padding: '10px',
                  marginBottom: '8px'
                }}>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: 'bold',
                    marginBottom: '4px'
                  }}>
                    Clause {clause.clause}: {clause.title}
                  </div>
                </div>
                
                <div style={{ paddingLeft: '10px' }}>
                  {clause.subclauses.map((sub, subIdx) => (
                    <div key={subIdx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      marginBottom: '4px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}>
                      <span style={{ opacity: 0.9 }}>
                        {sub.clause} {sub.title}
                      </span>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: getStatusColor(sub.status)
                      }}></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        background: '#f8f9fa'
      }}>
        {/* Navigation Header - Hide on manual route */}
        {!location.pathname.includes('/manual') && (
          <div style={{
            background: 'white',
            borderBottom: '1px solid #e5e7eb',
            padding: '15px 30px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}>
            {/* Navigation Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => navigate('/quality/standards')}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
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
                ← Quality Standards
              </button>
              <button
                onClick={() => navigate('/quality')}
                style={{
                  padding: '8px 16px',
                  background: '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Quality Home
              </button>
              <button
                onClick={() => navigate(-1)}
                style={{
                  padding: '8px 16px',
                  background: '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ← Previous Page
              </button>
            </div>
          </div>
        )}

        <Routes>
          <Route 
            path="/" 
            element={
              <ISO9001Overview 
                clauses={iso9001Clauses}
                implementationStatus={implementationStatus}
              />
            } 
          />
          <Route 
            path="/procedures/*" 
            element={<ISO9001Procedures clauses={iso9001Clauses} />} 
          />
          <Route 
            path="/forms/*" 
            element={<ISO9001Forms />} 
          />
          <Route 
            path="/audit/*" 
            element={<ISO9001Audit />} 
          />
          <Route 
            path="/manual/*" 
            element={<ISO9001Manual clauses={iso9001Clauses} />} 
          />
        </Routes>
      </div>
    </div>
  );
}