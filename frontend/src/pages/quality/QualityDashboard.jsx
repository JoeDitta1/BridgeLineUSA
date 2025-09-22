import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function QualityDashboard({ activeStandards, complianceStatus, onRefresh }) {
  const [metrics, setMetrics] = useState({
    totalAudits: 12,
    openNCRs: 3,
    trainingCompliance: 87,
    calibrationDue: 5
  });
  
  const navigate = useNavigate();

  // Quality Standards with prominent navigation
  const qualityStandards = [
    {
      id: 'iso9001',
      name: 'ISO 9001:2015',
      description: 'Quality Management Systems',
      status: 'Active',
      compliance: 94,
      icon: '🏆',
      color: '#22c55e',
      route: '/quality/standards/iso9001'
    },
    {
      id: 'asme',
      name: 'ASME Standards',
      description: 'Pressure Equipment & Welding',
      status: 'Available',
      compliance: 0,
      icon: '⚡',
      color: '#3b82f6',
      route: '/quality/standards/asme'
    },
    {
      id: 'api',
      name: 'API 4F/Q1',
      description: 'Pipeline Equipment Quality',
      status: 'Available',
      compliance: 0,
      icon: '🛢️',
      color: '#f59e0b',
      route: '/quality/standards/api'
    },
    {
      id: 'ul508a',
      name: 'UL508A',
      description: 'Industrial Control Panels',
      status: 'Available',
      compliance: 0,
      icon: '⚙️',
      color: '#8b5cf6',
      route: '/quality/standards/ul508a'
    },
    {
      id: 'asmer',
      name: 'ASME R',
      description: 'Pressure Vessel Certification',
      status: 'Available',
      compliance: 0,
      icon: '🔧',
      color: '#ef4444',
      route: '/quality/standards/asmer'
    }
  ];

  const quickActions = [
    {
      title: 'AI Quality Generator',
      description: 'Generate custom quality standards',
      icon: '🤖',
      color: '#8b5cf6',
      route: '/quality/ai-generator'
    },
    {
      title: 'Document Management',
      description: 'Manage procedures and records',
      icon: '📁',
      color: '#3b82f6',
      route: '/quality/documents'
    },
    {
      title: 'Audit Management',
      description: 'Schedule and track audits',
      icon: '🔍',
      color: '#f59e0b',
      route: '/quality/audits'
    },
    {
      title: 'Training Matrix',
      description: 'Employee certifications',
      icon: '🎓',
      color: '#22c55e',
      route: '/quality/training'
    }
  ];

  return (
    <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Navigation Bar */}
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
            Quality Dashboard
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280', 
            margin: 0 
          }}>
            Select a quality standard to begin compliance management
          </p>
        </div>
        
        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
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

      {/* Quality Standards Grid - Main Navigation */}
      <div style={{ marginBottom: '50px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '25px',
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '28px' }}>📋</span>
          Quality Standards
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '25px'
        }}>
          {qualityStandards.map(standard => (
            <div
              key={standard.id}
              onClick={() => navigate(standard.route)}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: `2px solid ${standard.status === 'Active' ? standard.color : '#e5e7eb'}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
            >
              {/* Status Badge */}
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                padding: '6px 12px',
                borderRadius: '20px',
                background: standard.status === 'Active' ? standard.color : '#e5e7eb',
                color: standard.status === 'Active' ? 'white' : '#6b7280',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {standard.status}
              </div>

              {/* Icon */}
              <div style={{
                fontSize: '48px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: `${standard.color}15`,
                margin: '0 auto 20px auto'
              }}>
                {standard.icon}
              </div>

              {/* Content */}
              <h3 style={{
                fontSize: '22px',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
                color: '#1f2937',
                textAlign: 'center'
              }}>
                {standard.name}
              </h3>
              
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 20px 0',
                textAlign: 'center',
                lineHeight: '1.4'
              }}>
                {standard.description}
              </p>

              {/* Compliance Bar */}
              {standard.status === 'Active' && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      Compliance
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: standard.color }}>
                      {standard.compliance}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: '#e5e7eb',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${standard.compliance}%`,
                      height: '100%',
                      background: standard.color,
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              )}

              {/* Call to Action */}
              <div style={{
                marginTop: '25px',
                padding: '12px 20px',
                background: `${standard.color}10`,
                borderRadius: '10px',
                textAlign: 'center',
                color: standard.color,
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {standard.status === 'Active' ? 'Manage System' : 'Setup Standard'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '50px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '25px',
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '28px' }}>⚡</span>
          Quick Actions
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {quickActions.map((action, idx) => (
            <div
              key={idx}
              onClick={() => navigate(action.route)}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '25px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{
                fontSize: '32px',
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: `${action.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {action.icon}
              </div>
              <div>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  margin: '0 0 4px 0',
                  color: '#1f2937'
                }}>
                  {action.title}
                </h4>
                <p style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  margin: 0,
                  lineHeight: '1.3'
                }}>
                  {action.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Metrics */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginBottom: '25px',
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '20px' }}>📊</span>
          System Overview
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>
              {metrics.totalAudits}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Audits</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444', marginBottom: '8px' }}>
              {metrics.openNCRs}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Open NCRs</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#22c55e', marginBottom: '8px' }}>
              {metrics.trainingCompliance}%
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Training Compliance</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
              {metrics.calibrationDue}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Calibrations Due</div>
          </div>
        </div>
      </div>
    </div>
  );
}