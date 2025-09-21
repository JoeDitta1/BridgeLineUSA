import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ISO9001Procedures() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const navigate = useNavigate();

  const procedures = [
    // Document Control (4.2.3)
    {
      id: 'DOC-001',
      title: 'Document and Data Control',
      category: 'Document Control',
      clause: '4.2.3',
      status: 'Approved',
      version: '2.1',
      approver: 'Quality Manager',
      lastReview: '2025-08-15',
      nextReview: '2026-08-15',
      description: 'Procedure for controlling documented information required by the quality management system',
      attachments: ['Document Control Form', 'Document Register Template']
    },
    {
      id: 'DOC-002', 
      title: 'Record Control',
      category: 'Document Control',
      clause: '4.2.4',
      status: 'Approved',
      version: '1.3',
      approver: 'Quality Manager',
      lastReview: '2025-07-20',
      nextReview: '2026-07-20',
      description: 'Procedure for identification, storage, protection, retrieval, retention and disposition of records',
      attachments: ['Records Retention Schedule', 'Record Control Log']
    },

    // Management Responsibility (5.0)
    {
      id: 'MAN-001',
      title: 'Management Review',
      category: 'Management',
      clause: '5.6',
      status: 'Approved',
      version: '1.5',
      approver: 'CEO',
      lastReview: '2025-09-01',
      nextReview: '2026-09-01',
      description: 'Procedure for systematic review of the QMS by top management',
      attachments: ['Management Review Agenda Template', 'Review Report Template']
    },
    {
      id: 'MAN-002',
      title: 'Quality Policy and Objectives',
      category: 'Management',
      clause: '5.2, 5.4.1',
      status: 'Approved',
      version: '2.0',
      approver: 'CEO',
      lastReview: '2025-06-10',
      nextReview: '2026-06-10',
      description: 'Establishment and communication of quality policy and measurable objectives',
      attachments: ['Quality Policy Statement', 'Objectives Template']
    },

    // Resource Management (6.0)
    {
      id: 'RES-001',
      title: 'Human Resources and Competence',
      category: 'Resources',
      clause: '6.2',
      status: 'Approved',
      version: '1.8',
      approver: 'HR Manager',
      lastReview: '2025-08-05',
      nextReview: '2026-08-05',
      description: 'Procedure for ensuring personnel competence and training requirements',
      attachments: ['Training Matrix', 'Competence Evaluation Form']
    },
    {
      id: 'RES-002',
      title: 'Infrastructure and Work Environment',
      category: 'Resources',
      clause: '6.3, 6.4',
      status: 'Approved',
      version: '1.2',
      approver: 'Operations Manager',
      lastReview: '2025-07-15',
      nextReview: '2026-07-15',
      description: 'Management of infrastructure and work environment to achieve product conformity',
      attachments: ['Infrastructure Checklist', 'Environment Control Log']
    },

    // Product Realization (7.0)
    {
      id: 'PRD-001',
      title: 'Sales and Contract Review',
      category: 'Product Realization',
      clause: '7.2',
      status: 'Approved',
      version: '2.3',
      approver: 'Sales Manager',
      lastReview: '2025-09-10',
      nextReview: '2026-09-10',
      description: 'Procedure for reviewing customer requirements and contracts',
      attachments: ['Contract Review Checklist', 'Customer Requirements Form']
    },
    {
      id: 'PRD-002',
      title: 'Design and Development',
      category: 'Product Realization',
      clause: '7.3',
      status: 'Approved',
      version: '1.7',
      approver: 'Engineering Manager',
      lastReview: '2025-08-25',
      nextReview: '2026-08-25',
      description: 'Control of design and development processes',
      attachments: ['Design Control Matrix', 'Design Review Checklist']
    },
    {
      id: 'PRD-003',
      title: 'Purchasing and Supplier Control',
      category: 'Product Realization',
      clause: '7.4',
      status: 'Approved',
      version: '2.1',
      approver: 'Procurement Manager',
      lastReview: '2025-09-05',
      nextReview: '2026-09-05',
      description: 'Control of purchasing processes and supplier evaluation',
      attachments: ['Approved Supplier List', 'Supplier Evaluation Form']
    },
    {
      id: 'PRD-004',
      title: 'Production and Service Provision',
      category: 'Product Realization',
      clause: '7.5.1',
      status: 'Approved',
      version: '1.9',
      approver: 'Production Manager',
      lastReview: '2025-08-30',
      nextReview: '2026-08-30',
      description: 'Control of production and service provision processes',
      attachments: ['Work Instructions Template', 'Production Control Plan']
    },
    {
      id: 'PRD-005',
      title: 'Control of Monitoring and Measuring Equipment',
      category: 'Product Realization', 
      clause: '7.6',
      status: 'Approved',
      version: '1.4',
      approver: 'Quality Manager',
      lastReview: '2025-07-12',
      nextReview: '2026-07-12',
      description: 'Calibration and control of measurement equipment',
      attachments: ['Calibration Schedule', 'Equipment Register']
    },

    // Measurement and Improvement (8.0)
    {
      id: 'IMP-001',
      title: 'Internal Audits',
      category: 'Improvement',
      clause: '8.2.2',
      status: 'Approved',
      version: '2.0',
      approver: 'Quality Manager',
      lastReview: '2025-09-12',
      nextReview: '2026-09-12',
      description: 'Planning and conducting internal quality audits',
      attachments: ['Audit Schedule', 'Audit Checklist Template', 'Audit Report Template']
    },
    {
      id: 'IMP-002',
      title: 'Control of Nonconforming Product',
      category: 'Improvement',
      clause: '8.3',
      status: 'Approved',
      version: '1.6',
      approver: 'Quality Manager',
      lastReview: '2025-08-18',
      nextReview: '2026-08-18',
      description: 'Identification and control of nonconforming product',
      attachments: ['Nonconformance Report Template', 'Disposition Form']
    },
    {
      id: 'IMP-003',
      title: 'Corrective and Preventive Action',
      category: 'Improvement',
      clause: '8.5.2, 8.5.3',
      status: 'Approved',
      version: '2.2',
      approver: 'Quality Manager',
      lastReview: '2025-09-08',
      nextReview: '2026-09-08',
      description: 'Implementation of corrective and preventive actions',
      attachments: ['CAPA Form', 'Root Cause Analysis Template']
    }
  ];

  const categories = [
    'all',
    'Document Control',
    'Management', 
    'Resources',
    'Product Realization',
    'Improvement'
  ];

  const filteredProcedures = procedures.filter(proc => {
    const matchesSearch = proc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proc.clause.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || proc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#22c55e';
      case 'Under Review': return '#f59e0b';
      case 'Draft': return '#6b7280';
      default: return '#ef4444';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Document Control': '#3b82f6',
      'Management': '#8b5cf6',
      'Resources': '#22c55e',
      'Product Realization': '#f59e0b',
      'Improvement': '#ef4444'
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div style={{ padding: '30px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
            ISO 9001 Procedures
          </h1>
          <button
            onClick={() => navigate('/quality/standards/iso9001')}
            style={{
              padding: '10px 20px',
              background: '#6b7280',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ← Back to ISO 9001
          </button>
        </div>
        <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
          Documented procedures required for ISO 9001:2015 compliance
        </p>
      </div>

      {/* Search and Filter */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '20px',
        marginBottom: '30px',
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>
            Search Procedures
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, ID, or clause number..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              minWidth: '200px'
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Procedures Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        {filteredProcedures.map(proc => (
          <div
            key={proc.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setSelectedProcedure(proc)}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', marginBottom: '4px' }}>
                  {proc.id} • Clause {proc.clause}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
                  {proc.title}
                </h3>
              </div>
              <div style={{
                padding: '4px 8px',
                borderRadius: '12px',
                background: getStatusColor(proc.status),
                color: 'white',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {proc.status}
              </div>
            </div>

            {/* Category */}
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '20px',
              background: `${getCategoryColor(proc.category)}15`,
              color: getCategoryColor(proc.category),
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '15px'
            }}>
              {proc.category}
            </div>

            {/* Description */}
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 15px 0',
              lineHeight: '1.4'
            }}>
              {proc.description}
            </p>

            {/* Metadata */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              <div>
                <strong>Version:</strong> {proc.version}
              </div>
              <div>
                <strong>Approver:</strong> {proc.approver}
              </div>
              <div>
                <strong>Last Review:</strong> {proc.lastReview}
              </div>
              <div>
                <strong>Next Review:</strong> {proc.nextReview}
              </div>
            </div>

            {/* Attachments */}
            {proc.attachments && proc.attachments.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '5px' }}>
                  Attachments:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {proc.attachments.map((attachment, idx) => (
                    <span key={idx} style={{
                      padding: '2px 6px',
                      background: '#f3f4f6',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: '#374151'
                    }}>
                      📎 {attachment}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Procedure Detail Modal */}
      {selectedProcedure && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1f2937' }}>
                  {selectedProcedure.title}
                </h2>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {selectedProcedure.id} • ISO 9001:2015 Clause {selectedProcedure.clause}
                </div>
              </div>
              <button
                onClick={() => setSelectedProcedure(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '25px',
              padding: '20px',
              background: '#f9fafb',
              borderRadius: '12px'
            }}>
              <div>
                <strong>Status:</strong>
                <span style={{
                  marginLeft: '8px',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  background: getStatusColor(selectedProcedure.status),
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {selectedProcedure.status}
                </span>
              </div>
              <div><strong>Version:</strong> {selectedProcedure.version}</div>
              <div><strong>Approver:</strong> {selectedProcedure.approver}</div>
              <div><strong>Category:</strong> {selectedProcedure.category}</div>
              <div><strong>Last Review:</strong> {selectedProcedure.lastReview}</div>
              <div><strong>Next Review:</strong> {selectedProcedure.nextReview}</div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#1f2937' }}>
                Description
              </h4>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                {selectedProcedure.description}
              </p>
            </div>

            {selectedProcedure.attachments && selectedProcedure.attachments.length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#1f2937' }}>
                  Attachments & Forms
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedProcedure.attachments.map((attachment, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      background: '#f3f4f6',
                      borderRadius: '8px'
                    }}>
                      <span style={{ fontSize: '16px' }}>📎</span>
                      <span style={{ fontSize: '14px', color: '#374151' }}>{attachment}</span>
                      <button style={{
                        marginLeft: 'auto',
                        padding: '4px 8px',
                        background: '#3b82f6',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                style={{
                  padding: '10px 20px',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                View Full Document
              </button>
              <button
                style={{
                  padding: '10px 20px',
                  background: '#f59e0b',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Edit Procedure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredProcedures.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
            No procedures found
          </h3>
          <p style={{ fontSize: '14px', margin: 0 }}>
            Try adjusting your search terms or category filter
          </p>
        </div>
      )}
    </div>
  );
}