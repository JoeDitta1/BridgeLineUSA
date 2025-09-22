import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ISO9001Overview({ clauses, implementationStatus }) {
  const [selectedClause, setSelectedClause] = useState(null);
  const navigate = useNavigate();

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete': return '✅';
      case 'in-progress': return '🔄';
      case 'not-started': return '❌';
      case 'not-applicable': return '➖';
      default: return '❓';
    }
  };

  const calculateClauseProgress = (clause) => {
    const total = clause.subclauses.length;
    const complete = clause.subclauses.filter(sub => sub.status === 'complete').length;
    const na = clause.subclauses.filter(sub => sub.status === 'not-applicable').length;
    const applicable = total - na;
    return applicable > 0 ? Math.round((complete / applicable) * 100) : 100;
  };

  const quickActions = [
    {
      title: 'Generate Quality Manual',
      description: 'Create audit-ready ISO 9001 Quality Manual',
      icon: '📚',
      color: '#3b82f6',
      action: () => navigate('/quality/standards/iso9001/manual')
    },
    {
      title: 'Schedule Internal Audit',
      description: 'Plan next internal audit cycle',
      icon: '🔍',
      color: '#8b5cf6',
      action: () => navigate('/quality/standards/iso9001/audit')
    },
    {
      title: 'Update Procedures',
      description: 'Review and update documented procedures',
      icon: '📋',
      color: '#f59e0b',
      action: () => navigate('/quality/standards/iso9001/procedures')
    },
    {
      title: 'Manage Forms',
      description: 'Access ISO 9001 forms and records',
      icon: '📄',
      color: '#22c55e',
      action: () => navigate('/quality/standards/iso9001/forms')
    }
  ];

  return (
    <div style={{ padding: '30px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          margin: '0 0 8px 0',
          color: '#1f2937'
        }}>
          ISO 9001:2015 Quality Management System
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#6b7280', 
          margin: 0 
        }}>
          Complete implementation of ISO 9001:2015 requirements for quality management
        </p>
      </div>

      {/* Status Dashboard */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '30px',
        color: 'white'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>
              Implementation Status
            </h3>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '5px' }}>
              {implementationStatus.complianceScore}%
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>
              Overall Compliance
            </div>
          </div>
          
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', opacity: 0.9 }}>
              Audit Status
            </h4>
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>
              {implementationStatus.auditReady ? '✅ Audit Ready' : '🔄 Preparation Needed'}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              Next Audit: {implementationStatus.nextAudit}
            </div>
          </div>
          
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', opacity: 0.9 }}>
              Last Review
            </h4>
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>
              {implementationStatus.lastAudit || 'Not Conducted'}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              Management Review
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.action}
            style={{
              background: 'white',
              border: `2px solid ${action.color}22`,
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: action.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                {action.icon}
              </div>
              <h4 style={{ 
                margin: 0, 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: action.color
              }}>
                {action.title}
              </h4>
            </div>
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              color: '#6b7280',
              lineHeight: '1.4'
            }}>
              {action.description}
            </p>
          </button>
        ))}
      </div>

      {/* Clause Compliance Matrix */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '24px', 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '24px' }}>📊</span>
          Clause Compliance Matrix
        </h3>
        
        <div style={{
          display: 'grid',
          gap: '15px'
        }}>
          {clauses.map((clause, idx) => {
            const progress = calculateClauseProgress(clause);
            
            return (
              <div key={idx} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                overflow: 'hidden',
                background: '#f9fafb'
              }}>
                {/* Clause Header */}
                <div 
                  style={{
                    padding: '15px 20px',
                    background: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onClick={() => setSelectedClause(selectedClause === idx ? null : idx)}
                >
                  <div>
                    <h4 style={{ 
                      margin: '0 0 4px 0', 
                      fontSize: '18px', 
                      fontWeight: 'bold',
                      color: '#1f2937'
                    }}>
                      Clause {clause.clause}: {clause.title}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        {clause.subclauses.length} Requirements
                      </span>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '120px',
                          height: '6px',
                          background: '#e5e7eb',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            background: progress === 100 ? '#22c55e' : progress > 50 ? '#f59e0b' : '#ef4444',
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: 'bold',
                          color: progress === 100 ? '#22c55e' : progress > 50 ? '#f59e0b' : '#ef4444'
                        }}>
                          {progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    fontSize: '20px',
                    transform: selectedClause === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}>
                    ▼
                  </div>
                </div>

                {/* Subclauses (Expandable) */}
                {selectedClause === idx && (
                  <div style={{ padding: '15px 20px' }}>
                    <div style={{
                      display: 'grid',
                      gap: '10px'
                    }}>
                      {clause.subclauses.map((sub, subIdx) => (
                        <div key={subIdx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 15px',
                          background: 'white',
                          borderRadius: '8px',
                          border: `1px solid ${getStatusColor(sub.status)}33`
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontSize: '14px', 
                              fontWeight: 'bold',
                              marginBottom: '2px',
                              color: '#1f2937'
                            }}>
                              {sub.clause} {sub.title}
                            </div>
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span style={{ fontSize: '16px' }}>{getStatusIcon(sub.status)}</span>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              background: getStatusColor(sub.status),
                              color: 'white',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              minWidth: '80px',
                              textAlign: 'center'
                            }}>
                              {getStatusText(sub.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Integration Points (Future Hook Points) */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        marginTop: '30px'
      }}>
        <h3 style={{ 
          margin: '0 0 15px 0', 
          fontSize: '24px', 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '24px' }}>🔗</span>
          System Integration Points
        </h3>
        
        <p style={{ 
          margin: '0 0 20px 0', 
          fontSize: '16px', 
          color: '#6b7280' 
        }}>
          Quality management system integration with other BridgeLineUSA modules
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px'
        }}>
          {[
            { module: 'Production Module', status: 'Ready for Integration', icon: '⚙️', color: '#3b82f6' },
            { module: 'Quote Module', status: 'Hook Points Defined', icon: '💰', color: '#f59e0b' },
            { module: 'OEM Portal', status: 'QC Visibility Ready', icon: '👥', color: '#22c55e' },
            { module: 'Training Matrix', status: 'Certification Tracking', icon: '🎓', color: '#8b5cf6' }
          ].map((integration, idx) => (
            <div key={idx} style={{
              padding: '15px',
              borderRadius: '8px',
              border: `1px solid ${integration.color}33`,
              background: `${integration.color}08`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>{integration.icon}</span>
                <h4 style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  color: integration.color
                }}>
                  {integration.module}
                </h4>
              </div>
              <p style={{ 
                margin: 0, 
                fontSize: '13px', 
                color: '#6b7280' 
              }}>
                {integration.status}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}