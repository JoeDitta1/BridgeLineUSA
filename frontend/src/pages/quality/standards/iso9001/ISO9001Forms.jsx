import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ISO9001Forms() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedForm, setSelectedForm] = useState(null);
  const navigate = useNavigate();

  const forms = [
    // Document Control Forms
    {
      id: 'F-DOC-001',
      title: 'Document Control Form',
      category: 'Document Control',
      clause: '4.2.3',
      status: 'Active',
      version: '2.0',
      lastUpdated: '2025-08-15',
      description: 'Form for requesting document creation, revision, or obsolescence',
      frequency: 'As needed',
      responsibility: 'All Departments',
      fileType: 'PDF',
      downloadCount: 156
    },
    {
      id: 'F-DOC-002',
      title: 'Document Register',
      category: 'Document Control',
      clause: '4.2.3',
      status: 'Active',
      version: '1.5',
      lastUpdated: '2025-07-20',
      description: 'Master list of all controlled documents in the QMS',
      frequency: 'Continuous',
      responsibility: 'Quality Department',
      fileType: 'Excel',
      downloadCount: 89
    },
    {
      id: 'F-DOC-003',
      title: 'Record Control Log',
      category: 'Document Control',
      clause: '4.2.4',
      status: 'Active',
      version: '1.2',
      lastUpdated: '2025-06-30',
      description: 'Log for tracking quality records location and retention',
      frequency: 'Monthly',
      responsibility: 'Quality Manager',
      fileType: 'Excel',
      downloadCount: 67
    },

    // Management Forms
    {
      id: 'F-MAN-001',
      title: 'Management Review Report',
      category: 'Management',
      clause: '5.6',
      status: 'Active',
      version: '2.1',
      lastUpdated: '2025-09-01',
      description: 'Template for documenting management review meetings and decisions',
      frequency: 'Annual',
      responsibility: 'CEO',
      fileType: 'Word',
      downloadCount: 24
    },
    {
      id: 'F-MAN-002',
      title: 'Quality Objectives Form',
      category: 'Management',
      clause: '5.4.1',
      status: 'Active',
      version: '1.8',
      lastUpdated: '2025-06-10',
      description: 'Form for establishing and tracking quality objectives',
      frequency: 'Annual',
      responsibility: 'Department Heads',
      fileType: 'Excel',
      downloadCount: 45
    },

    // Human Resources Forms
    {
      id: 'F-RES-001',
      title: 'Training Record',
      category: 'Resources',
      clause: '6.2.2',
      status: 'Active',
      version: '2.3',
      lastUpdated: '2025-08-05',
      description: 'Individual employee training and competence record',
      frequency: 'Ongoing',
      responsibility: 'HR Department',
      fileType: 'PDF',
      downloadCount: 234
    },
    {
      id: 'F-RES-002',
      title: 'Competence Evaluation',
      category: 'Resources',
      clause: '6.2.2',
      status: 'Active',
      version: '1.6',
      lastUpdated: '2025-07-15',
      description: 'Form for evaluating employee competence for specific roles',
      frequency: 'Annual',
      responsibility: 'Supervisors',
      fileType: 'PDF',
      downloadCount: 112
    },
    {
      id: 'F-RES-003',
      title: 'Equipment Maintenance Log',
      category: 'Resources',
      clause: '6.3',
      status: 'Active',
      version: '1.4',
      lastUpdated: '2025-08-20',
      description: 'Log for tracking equipment maintenance and repairs',
      frequency: 'Ongoing',
      responsibility: 'Maintenance Team',
      fileType: 'Excel',
      downloadCount: 78
    },

    // Product Realization Forms
    {
      id: 'F-PRD-001',
      title: 'Contract Review Checklist',
      category: 'Product Realization',
      clause: '7.2.2',
      status: 'Active',
      version: '2.0',
      lastUpdated: '2025-09-10',
      description: 'Checklist for reviewing customer contracts and requirements',
      frequency: 'Per contract',
      responsibility: 'Sales Team',
      fileType: 'PDF',
      downloadCount: 189
    },
    {
      id: 'F-PRD-002',
      title: 'Design Review Report',
      category: 'Product Realization',
      clause: '7.3.4',
      status: 'Active',
      version: '1.9',
      lastUpdated: '2025-08-25',
      description: 'Template for documenting design review meetings and decisions',
      frequency: 'Per design phase',
      responsibility: 'Engineering Team',
      fileType: 'Word',
      downloadCount: 134
    },
    {
      id: 'F-PRD-003',
      title: 'Supplier Evaluation Form',
      category: 'Product Realization',
      clause: '7.4.1',
      status: 'Active',
      version: '2.2',
      lastUpdated: '2025-09-05',
      description: 'Form for evaluating and approving new suppliers',
      frequency: 'Per supplier',
      responsibility: 'Procurement Team',
      fileType: 'Excel',
      downloadCount: 156
    },
    {
      id: 'F-PRD-004',
      title: 'Production Control Plan',
      category: 'Product Realization',
      clause: '7.5.1',
      status: 'Active',
      version: '1.7',
      lastUpdated: '2025-08-30',
      description: 'Plan defining production process controls and monitoring',
      frequency: 'Per product',
      responsibility: 'Production Manager',
      fileType: 'Excel',
      downloadCount: 98
    },
    {
      id: 'F-PRD-005',
      title: 'Calibration Certificate',
      category: 'Product Realization',
      clause: '7.6',
      status: 'Active',
      version: '1.3',
      lastUpdated: '2025-07-12',
      description: 'Certificate template for equipment calibration records',
      frequency: 'Per calibration',
      responsibility: 'Quality Department',
      fileType: 'PDF',
      downloadCount: 167
    },

    // Measurement and Improvement Forms
    {
      id: 'F-IMP-001',
      title: 'Internal Audit Report',
      category: 'Improvement',
      clause: '8.2.2',
      status: 'Active',
      version: '2.4',
      lastUpdated: '2025-09-12',
      description: 'Template for documenting internal audit findings and observations',
      frequency: 'Per audit',
      responsibility: 'Internal Auditors',
      fileType: 'Word',
      downloadCount: 145
    },
    {
      id: 'F-IMP-002',
      title: 'Nonconformance Report (NCR)',
      category: 'Improvement',
      clause: '8.3',
      status: 'Active',
      version: '2.1',
      lastUpdated: '2025-08-18',
      description: 'Form for reporting and tracking nonconforming products or processes',
      frequency: 'As needed',
      responsibility: 'All Personnel',
      fileType: 'PDF',
      downloadCount: 278
    },
    {
      id: 'F-IMP-003',
      title: 'Corrective Action Request (CAR)',
      category: 'Improvement',
      clause: '8.5.2',
      status: 'Active',
      version: '2.0',
      lastUpdated: '2025-09-08',
      description: 'Form for requesting and tracking corrective actions',
      frequency: 'As needed',
      responsibility: 'Quality Department',
      fileType: 'PDF',
      downloadCount: 201
    },
    {
      id: 'F-IMP-004',
      title: 'Customer Satisfaction Survey',
      category: 'Improvement',
      clause: '8.2.1',
      status: 'Active',
      version: '1.5',
      lastUpdated: '2025-07-25',
      description: 'Survey template for measuring customer satisfaction',
      frequency: 'Quarterly',
      responsibility: 'Sales Department',
      fileType: 'PDF',
      downloadCount: 89
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

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.clause.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || form.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#22c55e';
      case 'Under Review': return '#f59e0b';
      case 'Obsolete': return '#6b7280';
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

  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'PDF': return '📄';
      case 'Word': return '📝';
      case 'Excel': return '📊';
      default: return '📁';
    }
  };

  return (
    <div style={{ padding: '30px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
            ISO 9001 Forms & Records
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
          Quality forms, checklists, and record templates for ISO 9001:2015 compliance
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
            Search Forms
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

      {/* Forms Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {filteredForms.map(form => (
          <div
            key={form.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setSelectedForm(form)}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>{getFileTypeIcon(form.fileType)}</span>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', marginBottom: '4px' }}>
                    {form.id} • Clause {form.clause}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
                    {form.title}
                  </h3>
                </div>
              </div>
              <div style={{
                padding: '4px 8px',
                borderRadius: '12px',
                background: getStatusColor(form.status),
                color: 'white',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {form.status}
              </div>
            </div>

            {/* Category */}
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '20px',
              background: `${getCategoryColor(form.category)}15`,
              color: getCategoryColor(form.category),
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '15px'
            }}>
              {form.category}
            </div>

            {/* Description */}
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 15px 0',
              lineHeight: '1.4'
            }}>
              {form.description}
            </p>

            {/* Metadata */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '15px'
            }}>
              <div>
                <strong>Version:</strong> {form.version}
              </div>
              <div>
                <strong>File Type:</strong> {form.fileType}
              </div>
              <div>
                <strong>Frequency:</strong> {form.frequency}
              </div>
              <div>
                <strong>Downloads:</strong> {form.downloadCount}
              </div>
            </div>

            {/* Responsibility */}
            <div style={{
              padding: '10px',
              background: '#f9fafb',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>
                Responsibility:
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                {form.responsibility}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{
                flex: 1,
                padding: '8px 12px',
                background: '#3b82f6',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                Download
              </button>
              <button style={{
                flex: 1,
                padding: '8px 12px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                color: '#374151',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Detail Modal */}
      {selectedForm && (
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
            maxWidth: '700px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '48px' }}>{getFileTypeIcon(selectedForm.fileType)}</span>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1f2937' }}>
                    {selectedForm.title}
                  </h2>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {selectedForm.id} • ISO 9001:2015 Clause {selectedForm.clause}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedForm(null)}
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
                  background: getStatusColor(selectedForm.status),
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {selectedForm.status}
                </span>
              </div>
              <div><strong>Version:</strong> {selectedForm.version}</div>
              <div><strong>File Type:</strong> {selectedForm.fileType}</div>
              <div><strong>Category:</strong> {selectedForm.category}</div>
              <div><strong>Frequency:</strong> {selectedForm.frequency}</div>
              <div><strong>Last Updated:</strong> {selectedForm.lastUpdated}</div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#1f2937' }}>
                Description
              </h4>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                {selectedForm.description}
              </p>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#1f2937' }}>
                Usage Information
              </h4>
              <div style={{
                padding: '15px',
                background: '#f3f4f6',
                borderRadius: '8px'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Responsibility:</strong> {selectedForm.responsibility}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Usage Frequency:</strong> {selectedForm.frequency}
                </div>
                <div>
                  <strong>Download Count:</strong> {selectedForm.downloadCount} times
                </div>
              </div>
            </div>

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
                Download Form
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
                Edit Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredForms.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
            No forms found
          </h3>
          <p style={{ fontSize: '14px', margin: 0 }}>
            Try adjusting your search terms or category filter
          </p>
        </div>
      )}
    </div>
  );
}