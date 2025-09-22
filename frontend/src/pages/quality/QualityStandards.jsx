import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ISO9001System from './standards/ISO9001System';
import ASMESystem from './standards/ASMESystem';
import APISystem from './standards/APISystem';
import UL508ASystem from './standards/UL508ASystem';
import ASMERSystem from './standards/ASMERSystem';

export default function QualityStandards({ activeStandards, onStandardsChange }) {
  const [availableStandards, setAvailableStandards] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const standardsLibrary = [
    {
      id: 'iso9001',
      name: 'ISO 9001:2015',
      description: 'Quality Management Systems - Requirements',
      category: 'Quality Management',
      icon: '🌐',
      color: '#3b82f6',
      requirements: 10,
      procedures: 15,
      forms: 25,
      implemented: true,
      auditReady: true
    },
    {
      id: 'asme',
      name: 'ASME Boiler & Pressure Vessel Code',
      description: 'Section VIII - Pressure Vessels',
      category: 'Pressure Equipment',
      icon: '⚙️',
      color: '#ef4444',
      requirements: 8,
      procedures: 12,
      forms: 18,
      implemented: false,
      auditReady: false
    },
    {
      id: 'api',
      name: 'API 4F/Q1',
      description: 'Quality Program for API Monogram Program',
      category: 'Oil & Gas',
      icon: '🛢️',
      color: '#f59e0b',
      requirements: 12,
      procedures: 18,
      forms: 22,
      implemented: false,
      auditReady: false
    },
    {
      id: 'ul508a',
      name: 'UL508A',
      description: 'Standard for Industrial Control Panels',
      category: 'Electrical Safety',
      icon: '⚡',
      color: '#8b5cf6',
      requirements: 6,
      procedures: 8,
      forms: 12,
      implemented: false,
      auditReady: false
    },
    {
      id: 'asmer',
      name: 'ASME R',
      description: 'Repair & Alteration of Pressure Equipment',
      category: 'Pressure Equipment',
      icon: '🔧',
      color: '#22c55e',
      requirements: 7,
      procedures: 10,
      forms: 15,
      implemented: false,
      auditReady: false
    }
  ];

  useEffect(() => {
    setAvailableStandards(standardsLibrary);
  }, []);

  const handleStandardSelect = (standardId) => {
    const standard = standardsLibrary.find(s => s.id === standardId);
    setSelectedStandard(standard);
    navigate(`/quality/standards/${standardId}`);
  };

  const handleImplementStandard = async (standardId) => {
    console.log('Implementing standard:', standardId);
    
    const updatedStandards = availableStandards.map(std => 
      std.id === standardId 
        ? { ...std, implemented: true }
        : std
    );
    setAvailableStandards(updatedStandards);
    
    if (onStandardsChange) {
      onStandardsChange();
    }
  };

  const getImplementationStatus = (standard) => {
    if (standard.implemented && standard.auditReady) {
      return { text: 'Audit Ready', color: '#22c55e', bgColor: '#dcfce7' };
    } else if (standard.implemented) {
      return { text: 'Implemented', color: '#f59e0b', bgColor: '#fef3c7' };
    } else {
      return { text: 'Not Implemented', color: '#6b7280', bgColor: '#f3f4f6' };
    }
  };

  // If we're on a specific standard route, render that component
  const currentPath = location.pathname.split('/').pop();
  if (currentPath !== 'standards') {
    return (
      <Routes>
        <Route path="/iso9001/*" element={<ISO9001System />} />
        <Route path="/asme/*" element={<ASMESystem />} />
        <Route path="/api/*" element={<APISystem />} />
        <Route path="/ul508a/*" element={<UL508ASystem />} />
        <Route path="/asmer/*" element={<ASMERSystem />} />
      </Routes>
    );
  }

  return (
    <div style={{ padding: '30px' }}>
      {/* Navigation Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '15px 0',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            margin: '0 0 8px 0',
            color: '#1f2937'
          }}>
            Quality Standards Library
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280', 
            margin: 0 
          }}>
            Configure and manage quality management systems
          </p>
        </div>
        
        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/quality')}
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
            ← Quality Home
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
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ← Previous Page
          </button>
        </div>
      </div>

      {/* Standards Library Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '25px',
        marginBottom: '30px'
      }}>
        {availableStandards.map(standard => {
          const status = getImplementationStatus(standard);
          
          return (
            <div
              key={standard.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => handleStandardSelect(standard.id)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)';
                e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
              }}
            >
              {/* Status Badge */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                padding: '6px 12px',
                borderRadius: '20px',
                background: status.bgColor,
                color: status.color,
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {status.text}
              </div>

              {/* Icon & Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: `${standard.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {standard.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: '0 0 6px 0',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>
                    {standard.name}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {standard.description}
                  </p>
                </div>
              </div>

              {/* Category */}
              <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '20px',
                background: `${standard.color}10`,
                color: standard.color,
                fontSize: '12px',
                fontWeight: 'bold',
                marginBottom: '20px'
              }}>
                {standard.category}
              </div>

              {/* Statistics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '15px',
                marginBottom: '25px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: standard.color,
                    marginBottom: '4px'
                  }}>
                    {standard.requirements}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Requirements
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: standard.color,
                    marginBottom: '4px'
                  }}>
                    {standard.procedures}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Procedures
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: standard.color,
                    marginBottom: '4px'
                  }}>
                    {standard.forms}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Forms
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {standard.implemented ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStandardSelect(standard.id);
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      background: standard.color,
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Manage System
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImplementStandard(standard.id);
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      background: `${standard.color}15`,
                      border: `1px solid ${standard.color}`,
                      borderRadius: '8px',
                      color: standard.color,
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Implement Standard
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Quality Generator CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
        borderRadius: '16px',
        padding: '30px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🤖</div>
        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          Need a Custom Quality Standard?
        </h3>
        <p style={{
          margin: '0 0 25px 0',
          fontSize: '16px',
          opacity: 0.9,
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Use our AI Quality Generator to create custom quality management systems 
          tailored to your specific industry requirements and regulations.
        </p>
        <button
          onClick={() => navigate('/quality/ai-generator')}
          style={{
            padding: '15px 30px',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '10px',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '20px' }}>✨</span>
          Generate Custom Standard
        </button>
      </div>
    </div>
  );
}