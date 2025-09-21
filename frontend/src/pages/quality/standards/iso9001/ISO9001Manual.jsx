import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ISO9001Manual() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [filteredContent, setFilteredContent] = useState([]);
  const navigate = useNavigate();

  const manualSections = [
    {
      id: 'overview',
      title: 'Quality Manual Overview',
      subtitle: 'Introduction and Purpose',
      icon: '📋',
      systemRelevant: true
    },
    {
      id: 'scope',
      title: '1. Scope and Context',
      subtitle: 'Organizational Context & Interested Parties',
      icon: '🎯',
      systemRelevant: true
    },
    {
      id: 'references',
      title: '2. Normative References',
      subtitle: 'Referenced Standards & Documents',
      icon: '📚',
      systemRelevant: true
    },
    {
      id: 'terms',
      title: '3. Terms and Definitions',
      subtitle: 'Quality Management Terminology',
      icon: '📖',
      systemRelevant: true
    },
    {
      id: 'qms',
      title: '4. Quality Management System',
      subtitle: 'QMS Requirements & Process Approach',
      icon: '⚙️',
      systemRelevant: true
    },
    {
      id: 'leadership',
      title: '5. Leadership',
      subtitle: 'Leadership Commitment & Policy',
      icon: '👑',
      systemRelevant: true
    },
    {
      id: 'planning',
      title: '6. Planning',
      subtitle: 'Risk Management & Quality Objectives',
      icon: '📊',
      systemRelevant: true
    },
    {
      id: 'support',
      title: '7. Support',
      subtitle: 'Resources, Competence & Communication',
      icon: '🤝',
      systemRelevant: true
    },
    {
      id: 'operation',
      title: '8. Operation',
      subtitle: 'Operational Planning & Control',
      icon: '🏭',
      systemRelevant: true
    },
    {
      id: 'evaluation',
      title: '9. Performance Evaluation',
      subtitle: 'Monitoring, Audit & Management Review',
      icon: '📈',
      systemRelevant: true
    },
    {
      id: 'improvement',
      title: '10. Improvement',
      subtitle: 'Corrective Action & Continual Improvement',
      icon: '🔄',
      systemRelevant: true
    }
  ];

  // Overview section content
  const overviewContent = {
    title: 'BridgeLineUSA Quality Manual',
    version: '1.0',
    effectiveDate: 'September 20, 2025',
    approvedBy: 'Quality Manager',
    content: [
      {
        heading: 'Purpose and Scope',
        text: `This Quality Manual establishes the framework for BridgeLineUSA's Quality Management System (QMS) in accordance with ISO 9001:2015 requirements. It defines our organization's commitment to quality and provides the foundation for delivering products and services that consistently meet customer and regulatory requirements.`,
        systemNote: 'This manual directly integrates with our digital quality management system for real-time compliance tracking.'
      },
      {
        heading: 'Company Overview',
        text: `BridgeLineUSA specializes in the design, manufacturing, and installation of industrial piping systems, pressure vessels, and custom fabrication solutions. Our commitment to quality ensures safe, reliable, and compliant products for critical infrastructure applications.`,
        systemNote: 'Customer and project data are managed through our integrated CRM and project management modules.'
      },
      {
        heading: 'Quality Policy',
        text: `BridgeLineUSA is committed to delivering exceptional quality in all our products and services. We achieve this through continuous improvement, customer focus, employee engagement, and adherence to applicable standards and regulations. Our QMS ensures consistent quality delivery while driving operational excellence.`,
        systemNote: 'Quality metrics and performance indicators are tracked in real-time through our quality dashboard.'
      },
      {
        heading: 'Document Control',
        text: `This manual is controlled document QM-001. All sections are maintained electronically and subject to regular review and revision. Changes are implemented through our document control system with appropriate approval workflows.`,
        systemNote: 'Document revisions are automatically tracked and distributed through our document management system.'
      }
    ]
  };

  // Section 2: Normative References content
  const normativeReferencesContent = {
    title: 'Section 2: Normative References',
    sections: [
      {
        heading: '2.1 ISO Standards',
        text: `The following referenced documents are indispensable for the application of this document. For dated references, only the edition cited applies. For undated references, the latest edition of the referenced document (including any amendments) applies.`,
        systemNote: 'All referenced standards are maintained in our digital document library with automatic update notifications.',
        standards: [
          {
            standard: 'ISO 9000:2015',
            title: 'Quality management systems — Fundamentals and vocabulary',
            application: 'Provides fundamental concepts, principles and vocabulary for quality management systems'
          },
          {
            standard: 'ISO 9004:2018',
            title: 'Quality management — Quality of an organization — Guidance to achieve sustained success',
            application: 'Provides guidance for organizations to achieve sustained success'
          },
          {
            standard: 'ISO 19011:2018',
            title: 'Guidelines for auditing management systems',
            application: 'Provides guidance on auditing management systems including quality management systems'
          }
        ]
      },
      {
        heading: '2.2 Industry Standards',
        text: `BridgeLineUSA operates in compliance with industry-specific standards relevant to our products and services. These standards are integrated into our quality management system and operational procedures.`,
        systemNote: 'Industry standards compliance is tracked through our certification management module with automated renewal alerts.',
        standards: [
          {
            standard: 'ASME BPVC',
            title: 'Boiler and Pressure Vessel Code',
            application: 'Design, fabrication, and inspection of pressure vessels and boilers'
          },
          {
            standard: 'API Specification 4F',
            title: 'Specification for Drilling and Well Servicing Structures',
            application: 'Design and manufacturing of drilling and well servicing structures'
          },
          {
            standard: 'API Specification Q1',
            title: 'Specification for Quality Management System Requirements for Manufacturing Organizations',
            application: 'Quality management requirements for API monogram program'
          },
          {
            standard: 'UL 508A',
            title: 'Standard for Industrial Control Panels',
            application: 'Safety requirements for industrial control panels'
          },
          {
            standard: 'AWS D1.1',
            title: 'Structural Welding Code — Steel',
            application: 'Welding requirements for structural steel construction'
          }
        ]
      },
      {
        heading: '2.3 Regulatory References',
        text: `BridgeLineUSA complies with applicable federal, state, and local regulations that impact our operations and product quality. These regulatory requirements are integrated into our management system.`,
        systemNote: 'Regulatory compliance status is monitored through our compliance management system with automatic alerts for changes.',
        regulations: [
          {
            regulation: 'OSHA 29 CFR 1910',
            title: 'Occupational Safety and Health Standards',
            application: 'Workplace safety and health requirements'
          },
          {
            regulation: 'EPA 40 CFR',
            title: 'Environmental Protection Agency Regulations',
            application: 'Environmental compliance for manufacturing operations'
          },
          {
            regulation: 'DOT 49 CFR',
            title: 'Department of Transportation Regulations',
            application: 'Transportation and shipping requirements for pressure vessels'
          }
        ]
      },
      {
        heading: '2.4 Customer and Contractual References',
        text: `Customer specifications, contractual requirements, and project-specific standards are managed as controlled documents within our quality management system.`,
        systemNote: 'Customer specifications are automatically linked to project files in our document management system.',
        types: [
          'Customer technical specifications',
          'Project-specific quality requirements',
          'Contractual quality provisions',
          'Customer quality management system requirements',
          'Industry-specific customer standards'
        ]
      }
    ]
  };

  // Section 3: Terms and Definitions content
  const termsDefinitionsContent = {
    title: 'Section 3: Terms and Definitions',
    sections: [
      {
        heading: '3.1 General Quality Terms',
        text: `For the purposes of this document, the terms and definitions given in ISO 9000:2015 apply. Additional terms specific to BridgeLineUSA operations are defined below.`,
        systemNote: 'All quality terms are integrated into our training management system with searchable definitions.',
        terms: [
          {
            term: 'Quality Management System (QMS)',
            definition: 'Management system with regard to quality, including organizational structure, processes, procedures and resources needed to implement quality management.'
          },
          {
            term: 'Continual Improvement',
            definition: 'Recurring activity to enhance performance by increasing the ability to fulfill requirements.'
          },
          {
            term: 'Customer Satisfaction',
            definition: "Customer's perception of the degree to which the customer's requirements have been fulfilled."
          },
          {
            term: 'Nonconformity',
            definition: 'Non-fulfillment of a requirement, whether specified or implied.'
          },
          {
            term: 'Corrective Action',
            definition: 'Action to eliminate the cause of a nonconformity and to prevent recurrence.'
          }
        ]
      },
      {
        heading: '3.2 BridgeLineUSA Specific Terms',
        text: `The following terms are specific to BridgeLineUSA operations and are used throughout this quality manual and associated procedures.`,
        systemNote: 'Company-specific terms are maintained in our knowledge management system with examples and applications.',
        terms: [
          {
            term: 'Pressure Vessel',
            definition: 'A closed container designed to hold gases or liquids at a pressure substantially different from ambient pressure, manufactured in accordance with ASME BPVC Section VIII.'
          },
          {
            term: 'Industrial Piping System',
            definition: 'An assembly of piping components used to convey fluids in industrial applications, designed and fabricated according to applicable codes and standards.'
          },
          {
            term: 'Custom Fabrication',
            definition: 'Manufacturing processes that create products according to customer-specific designs and requirements, including welding, machining, and assembly operations.'
          },
          {
            term: 'Design Review',
            definition: 'Systematic examination of a design to evaluate its ability to fulfill requirements, identify problems, and propose solutions.'
          },
          {
            term: 'Material Traceability',
            definition: 'The ability to trace the history, application, or location of materials through recorded identification numbers and documentation.'
          }
        ]
      },
      {
        heading: '3.3 Process Terms',
        text: `Process-related terms used in BridgeLineUSA quality management system to describe workflow, controls, and measurement activities.`,
        systemNote: 'Process terms are linked to workflow definitions in our business process management system.',
        terms: [
          {
            term: 'Process Approach',
            definition: 'Application of a system of processes within an organization, together with the identification and interactions of these processes, and their management to produce the desired outcome.'
          },
          {
            term: 'Risk-Based Thinking',
            definition: 'Approach to management that considers risks and opportunities in planning and implementing quality management system processes.'
          },
          {
            term: 'Competence',
            definition: 'Ability to apply knowledge and skills to achieve intended results, demonstrated through education, training, or experience.'
          },
          {
            term: 'Documented Information',
            definition: 'Information required to be controlled and maintained by an organization and the medium on which it is contained.'
          },
          {
            term: 'Supplier Evaluation',
            definition: 'Systematic assessment of supplier capability to provide products and services that meet specified requirements.'
          }
        ]
      }
    ]
  };

  // Section 1: Scope & Context content  
  const scopeContextContent = {
    title: 'Section 1: Scope and Context of the Organization',
    sections: [
      {
        heading: '1.1 General',
        text: `This Quality Management System applies to the design, manufacturing, and installation of industrial piping systems, pressure vessels, and custom fabrication solutions at BridgeLineUSA.`,
        systemNote: 'Project scope and requirements are automatically captured in our CRM system during the quote generation process.',
        requirements: [
          'All manufacturing and fabrication operations',
          'Design and engineering services', 
          'Installation and commissioning services',
          'Customer service and technical support',
          'Supply chain management and procurement'
        ]
      },
      {
        heading: '4.1 Understanding the Organization and its Context',
        text: `BridgeLineUSA operates in the industrial manufacturing sector, serving customers in oil & gas, chemical processing, power generation, and infrastructure markets.`,
        systemNote: 'Market analysis and risk factors are tracked in our business intelligence dashboard with automated reporting.',
        internalFactors: [
          'Manufacturing capabilities and capacity',
          'Engineering expertise and certifications',
          'Quality management maturity', 
          'Employee competence and training',
          'Technology and equipment capabilities',
          'Financial performance and stability'
        ],
        externalFactors: [
          'Regulatory requirements (ASME, API, UL)',
          'Market competition and pricing pressures',
          'Customer requirements and expectations',
          'Supplier performance and availability', 
          'Economic conditions and industry trends',
          'Technological developments and innovations'
        ]
      },
      {
        heading: '4.2 Understanding the Needs and Expectations of Interested Parties',
        text: `BridgeLineUSA has identified key interested parties and regularly assesses their needs and expectations.`,
        systemNote: 'Stakeholder feedback is collected and analyzed through our customer portal and supplier management system.',
        interestedParties: [
          {
            party: 'Customers',
            needs: ['Quality products', 'On-time delivery', 'Competitive pricing', 'Technical support'],
            monitoring: 'Customer satisfaction surveys, delivery performance metrics, complaint tracking'
          },
          {
            party: 'Employees', 
            needs: ['Safe workplace', 'Training opportunities', 'Fair compensation', 'Clear procedures'],
            monitoring: 'Safety metrics, training records, employee feedback, competency assessments'
          },
          {
            party: 'Suppliers',
            needs: ['Clear requirements', 'Timely payments', 'Long-term partnerships', 'Fair evaluation'],
            monitoring: 'Supplier scorecards, audit results, delivery performance, quality metrics'
          }
        ]
      },
      {
        heading: '4.3 Determining the Scope of the Quality Management System',
        text: `The scope of BridgeLineUSA's QMS includes all activities related to the design, manufacture, and installation of industrial piping systems and pressure vessels.`,
        systemNote: 'Project boundaries and scope changes are automatically tracked through our project management system.',
        scopeIncludes: [
          'Customer requirement analysis and quotation',
          'Design and engineering services',
          'Material procurement and inspection',
          'Manufacturing and fabrication operations',
          'Quality control and testing',
          'Packaging and shipping',
          'Installation and commissioning',
          'Customer service and technical support'
        ],
        scopeExcludes: [
          'Research and development of new materials',
          'Third-party logistics beyond our control', 
          'Customer-owned equipment maintenance'
        ]
      }
    ]
  };

  // Section 4: Quality Management System content
  const qmsContent = {
    title: 'Section 4: Quality Management System',
    sections: [
      {
        heading: '4.1 Understanding the Organization and its Context',
        text: `BridgeLineUSA has identified internal and external issues that are relevant to its purpose and strategic direction and that affect its ability to achieve the intended results of its quality management system.`,
        systemNote: 'Organizational context is monitored through our business intelligence dashboard with quarterly strategic reviews.',
        contextAnalysis: {
          internal: [
            {
              factor: 'Manufacturing Capabilities',
              description: 'Custom fabrication expertise in pressure vessels, industrial piping, and precision machining',
              impact: 'Core competency enabling quality delivery',
              monitoring: 'Production capacity and capability assessments'
            },
            {
              factor: 'Digital Infrastructure',
              description: 'Integrated ERP, quality management, and production planning systems',
              impact: 'Enhanced process control and traceability',
              monitoring: 'System performance metrics and user adoption rates'
            },
            {
              factor: 'Skilled Workforce',
              description: 'Certified welders, machinists, and quality control personnel',
              impact: 'Quality workmanship and compliance capability',
              monitoring: 'Competence assessments and training records'
            },
            {
              factor: 'Financial Stability',
              description: 'Strong cash flow and investment in modern equipment',
              impact: 'Ability to invest in quality improvements',
              monitoring: 'Financial performance indicators'
            }
          ],
          external: [
            {
              factor: 'Regulatory Environment',
              description: 'ASME, API, OSHA, and environmental regulations',
              impact: 'Compliance requirements affecting operations',
              monitoring: 'Regulatory update tracking and compliance audits'
            },
            {
              factor: 'Market Conditions',
              description: 'Industrial manufacturing demand and economic cycles',
              impact: 'Resource allocation and capacity planning',
              monitoring: 'Market analysis and customer demand forecasting'
            },
            {
              factor: 'Supply Chain',
              description: 'Raw material suppliers and subcontractor capabilities',
              impact: 'Quality and delivery performance',
              monitoring: 'Supplier performance scorecards and audits'
            },
            {
              factor: 'Technology Evolution',
              description: 'Manufacturing technology and quality control innovations',
              impact: 'Competitive advantage and process improvements',
              monitoring: 'Technology trend analysis and ROI assessments'
            }
          ]
        }
      },
      {
        heading: '4.2 Understanding the Needs and Expectations of Interested Parties',
        text: `BridgeLineUSA has determined the interested parties that are relevant to the quality management system and the requirements of these interested parties that are relevant to the quality management system.`,
        systemNote: 'Stakeholder requirements are captured in our CRM system with automated communication and feedback tracking.',
        stakeholders: [
          {
            party: 'Customers',
            needs: [
              'High-quality products meeting specifications',
              'On-time delivery and competitive pricing',
              'Technical support and documentation',
              'Compliance with industry standards'
            ],
            expectations: [
              'Zero defects and full traceability',
              'Responsive customer service',
              'Continuous improvement in quality and delivery'
            ],
            requirements: [
              'ASME code compliance for pressure vessels',
              'API certification requirements',
              'Customer-specific quality procedures',
              'Material test reports and certifications'
            ]
          },
          {
            party: 'Employees',
            needs: [
              'Safe working environment',
              'Competitive compensation and benefits',
              'Training and development opportunities',
              'Clear roles and responsibilities'
            ],
            expectations: [
              'Job security and career advancement',
              'Recognition for quality performance',
              'Modern tools and equipment'
            ],
            requirements: [
              'OSHA safety compliance',
              'Skills development programs',
              'Performance management system'
            ]
          },
          {
            party: 'Regulatory Bodies',
            needs: [
              'Compliance with applicable regulations',
              'Accurate reporting and documentation',
              'Cooperation during inspections'
            ],
            expectations: [
              'Continuous compliance maintenance',
              'Proactive communication of changes',
              'Effective corrective action implementation'
            ],
            requirements: [
              'ASME authorization maintenance',
              'Environmental permit compliance',
              'Safety program implementation'
            ]
          },
          {
            party: 'Suppliers',
            needs: [
              'Clear specifications and requirements',
              'Fair payment terms and conditions',
              'Long-term partnership opportunities'
            ],
            expectations: [
              'Professional business relationships',
              'Timely feedback on performance',
              'Growth opportunities'
            ],
            requirements: [
              'Quality system certification',
              'Material traceability documentation',
              'Delivery performance standards'
            ]
          }
        ]
      },
      {
        heading: '4.3 Determining the Scope of the Quality Management System',
        text: `BridgeLineUSA has determined the boundaries and applicability of the quality management system to establish its scope. The scope is available as documented information and covers all products, services, and processes that affect quality.`,
        systemNote: 'QMS scope is maintained in our document management system with automatic updates when operations change.',
        scope: {
          included: [
            'Design and fabrication of ASME pressure vessels',
            'Industrial piping system manufacturing and installation',
            'Custom machining and mechanical fabrication',
            'Quality control and inspection services',
            'Material procurement and supplier management',
            'Customer engineering support and documentation',
            'Maintenance and repair services for manufactured equipment'
          ],
          excluded: [
            'Research and development of new products',
            'Third-party equipment not manufactured by BridgeLineUSA',
            'Customer-owned facility maintenance beyond our equipment',
            'Transportation services (subcontracted to certified carriers)',
            'Software development (system configuration only)'
          ],
          locations: [
            'Main manufacturing facility - Houston, Texas',
            'Quality control laboratory - Houston, Texas',
            'Customer sites for installation and service (temporary scope)'
          ],
          standards: [
            'ISO 9001:2015 Quality Management Systems',
            'ASME Boiler and Pressure Vessel Code Section VIII',
            'API Specification Q1 Quality Management System',
            'API Specification 4F Drilling and Well Servicing Structures'
          ]
        }
      },
      {
        heading: '4.4 Quality Management System and its Processes',
        text: `BridgeLineUSA has established, implemented, maintained and continually improved a quality management system, including the processes needed and their application throughout the organization.`,
        systemNote: 'Process interactions are mapped in our digital workflow system with real-time monitoring and performance metrics.',
        processes: {
          core: [
            {
              name: 'Sales and Contract Review',
              purpose: 'Convert customer requirements into manufacturable specifications',
              inputs: ['Customer inquiries', 'Technical specifications', 'Regulatory requirements'],
              outputs: ['Approved contracts', 'Engineering drawings', 'Project schedules'],
              controls: ['Contract review procedure', 'Technical feasibility assessment'],
              resources: ['Sales engineers', 'Technical team', 'CRM system'],
              monitoring: ['Quote accuracy', 'Contract compliance', 'Customer satisfaction'],
              systemIntegration: 'Integrated with CRM, engineering database, and project management'
            },
            {
              name: 'Design and Engineering',
              purpose: 'Create detailed designs meeting customer and regulatory requirements',
              inputs: ['Customer specifications', 'Applicable codes and standards', 'Material requirements'],
              outputs: ['Engineering drawings', 'Bills of materials', 'Manufacturing instructions'],
              controls: ['Design review procedure', 'Code compliance verification'],
              resources: ['Design engineers', 'CAD systems', 'Code libraries'],
              monitoring: ['Design review completion', 'Drawing accuracy', 'Change control'],
              systemIntegration: 'CAD integration with manufacturing systems and quality control'
            },
            {
              name: 'Procurement and Supplier Management',
              purpose: 'Ensure materials and services meet quality requirements',
              inputs: ['Material specifications', 'Supplier capabilities', 'Delivery requirements'],
              outputs: ['Qualified materials', 'Certified suppliers', 'Material test reports'],
              controls: ['Supplier evaluation procedure', 'Material inspection protocols'],
              resources: ['Purchasing team', 'Quality inspectors', 'Supplier database'],
              monitoring: ['Supplier performance', 'Material conformity', 'Delivery performance'],
              systemIntegration: 'ERP integration with supplier scorecards and quality tracking'
            },
            {
              name: 'Manufacturing and Production',
              purpose: 'Transform raw materials into finished products meeting specifications',
              inputs: ['Engineering drawings', 'Materials', 'Work instructions'],
              outputs: ['Manufactured products', 'Quality records', 'Test reports'],
              controls: ['Work instructions', 'Quality control plans', 'Equipment maintenance'],
              resources: ['Production equipment', 'Skilled operators', 'Quality tools'],
              monitoring: ['Production metrics', 'Quality indicators', 'Equipment performance'],
              systemIntegration: 'MES integration with quality control and inventory management'
            }
          ],
          support: [
            {
              name: 'Quality Control and Assurance',
              purpose: 'Verify product conformity and system effectiveness',
              activities: ['Incoming inspection', 'In-process monitoring', 'Final inspection', 'Calibration management'],
              systemIntegration: 'Quality management system with automated data collection and reporting'
            },
            {
              name: 'Document and Record Management',
              purpose: 'Control documented information and maintain records',
              activities: ['Document control', 'Record retention', 'Change management', 'Archive management'],
              systemIntegration: 'Document management system with version control and access management'
            },
            {
              name: 'Training and Competence',
              purpose: 'Ensure personnel competence for quality-affecting activities',
              activities: ['Skills assessment', 'Training delivery', 'Competence verification', 'Record maintenance'],
              systemIntegration: 'Learning management system with competence tracking and certification management'
            },
            {
              name: 'Continual Improvement',
              purpose: 'Enhance QMS effectiveness and customer satisfaction',
              activities: ['Performance monitoring', 'Corrective action', 'Preventive action', 'Management review'],
              systemIntegration: 'Business intelligence dashboard with automated alerts and trend analysis'
            }
          ]
        }
      }
    ]
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = manualSections.filter(section => 
        section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContent(filtered);
    } else {
      setFilteredContent(manualSections);
    }
  }, [searchTerm]);

  const renderOverviewSection = () => (
    <div style={{ maxWidth: '900px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        borderRadius: '16px',
        padding: '40px',
        color: 'white',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '48px' }}>📋</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: 'bold' }}>
              {overviewContent.title}
            </h1>
            <div style={{ display: 'flex', gap: '30px', fontSize: '16px', opacity: 0.9 }}>
              <span>Version: {overviewContent.version}</span>
              <span>Effective Date: {overviewContent.effectiveDate}</span>
              <span>Approved By: {overviewContent.approvedBy}</span>
            </div>
          </div>
          <button
            onClick={() => setSelectedSection('')}
            style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ← All Sections
          </button>
        </div>
      </div>

      {overviewContent.content.map((section, index) => (
        <div key={index} style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '25px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            borderBottom: '2px solid #3b82f6',
            paddingBottom: '10px'
          }}>
            {section.heading}
          </h3>
          
          <p style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#374151',
            marginBottom: '20px'
          }}>
            {section.text}
          </p>

          {section.systemNote && (
            <div style={{
              background: '#dbeafe',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              padding: '15px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <span style={{ fontSize: '20px', color: '#3b82f6' }}>🔗</span>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#1e40af',
                  marginBottom: '5px'
                }}>
                  System Integration
                </div>
                <div style={{ fontSize: '14px', color: '#1e40af' }}>
                  {section.systemNote}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderScopeContextSection = () => (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        borderRadius: '16px',
        padding: '40px',
        color: 'white',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '48px' }}>🎯</span>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: 'bold' }}>
              {scopeContextContent.title}
            </h1>
            <p style={{ margin: 0, fontSize: '18px', opacity: 0.9 }}>
              Organizational context, interested parties, and QMS scope definition
            </p>
          </div>
          <button
            onClick={() => setSelectedSection('')}
            style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ← All Sections
          </button>
        </div>
      </div>

      {scopeContextContent.sections.map((section, index) => (
        <div key={index} style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            borderBottom: '3px solid #059669',
            paddingBottom: '10px'
          }}>
            {section.heading}
          </h2>
          
          <p style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#374151',
            marginBottom: '25px'
          }}>
            {section.text}
          </p>

          {section.systemNote && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #059669',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '25px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <span style={{ fontSize: '20px', color: '#059669' }}>🔗</span>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#047857',
                  marginBottom: '5px'
                }}>
                  System Integration
                </div>
                <div style={{ fontSize: '14px', color: '#047857' }}>
                  {section.systemNote}
                </div>
              </div>
            </div>
          )}

          {section.requirements && (
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
                Scope Requirements:
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {section.requirements.map((req, idx) => (
                  <li key={idx} style={{
                    background: '#f9fafb',
                    padding: '10px 15px',
                    marginBottom: '8px',
                    borderRadius: '6px',
                    borderLeft: '4px solid #059669',
                    fontSize: '14px'
                  }}>
                    ✓ {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {section.internalFactors && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '15px' }}>
                  Internal Factors:
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {section.internalFactors.map((factor, idx) => (
                    <li key={idx} style={{
                      background: '#f0f9ff',
                      padding: '8px 12px',
                      marginBottom: '6px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      borderLeft: '3px solid #0ea5e9'
                    }}>
                      • {factor}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '15px' }}>
                  External Factors:
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {section.externalFactors.map((factor, idx) => (
                    <li key={idx} style={{
                      background: '#fef3c7',
                      padding: '8px 12px',
                      marginBottom: '6px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      borderLeft: '3px solid #f59e0b'
                    }}>
                      • {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {section.interestedParties && (
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '15px' }}>
                Interested Parties Analysis:
              </h4>
              <div style={{ display: 'grid', gap: '15px' }}>
                {section.interestedParties.map((party, idx) => (
                  <div key={idx} style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '15px'
                  }}>
                    <h5 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>
                      {party.party}
                    </h5>
                    <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
                      <strong>Needs:</strong> {party.needs.join(', ')}
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569' }}>
                      <strong>Monitoring:</strong> {party.monitoring}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section.scopeIncludes && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginBottom: '25px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
                  Scope Includes:
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {section.scopeIncludes.map((item, idx) => (
                    <li key={idx} style={{
                      background: '#ecfdf5',
                      padding: '8px 12px',
                      marginBottom: '6px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      borderLeft: '3px solid #22c55e'
                    }}>
                      ✓ {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
                  Scope Excludes:
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {section.scopeExcludes.map((item, idx) => (
                    <li key={idx} style={{
                      background: '#fef2f2',
                      padding: '8px 12px',
                      marginBottom: '6px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      borderLeft: '3px solid #ef4444'
                    }}>
                      ✗ {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderReferencesSection = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {normativeReferencesContent.title}
          </h2>
          <p className="text-gray-600 mb-6">
            This section lists the normative references that are indispensable for the application of this quality management system.
          </p>
        </div>

        {normativeReferencesContent.sections.map((section, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{section.heading}</h3>
            <p className="text-gray-700 mb-4">{section.text}</p>
            
            {section.systemNote && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-5 w-5 text-blue-400 flex items-center justify-center">
                      <span className="text-sm font-bold">ℹ</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">{section.systemNote}</p>
                  </div>
                </div>
              </div>
            )}

            {section.standards && (
              <div className="space-y-3">
                {section.standards.map((standard, stdIndex) => (
                  <div key={stdIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                    <div className="font-semibold text-gray-900">{standard.standard}</div>
                    <div className="text-gray-700 font-medium mt-1">{standard.title}</div>
                    <div className="text-gray-600 text-sm mt-2">{standard.application}</div>
                  </div>
                ))}
              </div>
            )}

            {section.regulations && (
              <div className="space-y-3">
                {section.regulations.map((regulation, regIndex) => (
                  <div key={regIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                    <div className="font-semibold text-gray-900">{regulation.regulation}</div>
                    <div className="text-gray-700 font-medium mt-1">{regulation.title}</div>
                    <div className="text-gray-600 text-sm mt-2">{regulation.application}</div>
                  </div>
                ))}
              </div>
            )}

            {section.types && (
              <div className="mt-4">
                <ul className="list-disc list-inside space-y-1">
                  {section.types.map((type, typeIndex) => (
                    <li key={typeIndex} className="text-gray-700">{type}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderTermsSection = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {termsDefinitionsContent.title}
          </h2>
          <p className="text-gray-600 mb-6">
            This section provides definitions for key terms used throughout this quality management system manual.
          </p>
        </div>

        {termsDefinitionsContent.sections.map((section, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{section.heading}</h3>
            <p className="text-gray-700 mb-4">{section.text}</p>
            
            {section.systemNote && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-5 w-5 text-blue-400 flex items-center justify-center">
                      <span className="text-sm font-bold">ℹ</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">{section.systemNote}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {section.terms.map((termItem, termIndex) => (
                <div key={termIndex} className="border-l-4 border-green-400 pl-4 py-2">
                  <dt className="font-semibold text-gray-900 mb-1">{termItem.term}</dt>
                  <dd className="text-gray-700">{termItem.definition}</dd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Section 5: Leadership content
  const leadershipContent = {
    title: 'Section 5: Leadership',
    sections: [
      {
        heading: '5.1 Leadership and Commitment',
        text: `Top management demonstrates leadership and commitment with respect to the quality management system by taking accountability for the effectiveness of the quality management system and ensuring that quality management system requirements are integrated into the organization's business processes.`,
        systemNote: 'Leadership commitment is tracked through our management dashboard with real-time quality metrics and performance indicators.',
        subsections: [
          {
            subheading: '5.1.1 General Leadership Commitment',
            text: `BridgeLineUSA's top management demonstrates leadership and commitment to the quality management system through the following actions:`,
            commitments: [
              {
                commitment: 'Accountability for QMS Effectiveness',
                description: 'Taking responsibility for the effectiveness of the quality management system and ensuring resources are available',
                implementation: 'Monthly QMS performance reviews with documented corrective actions',
                systemIntegration: 'Performance metrics tracked in executive dashboard with automated alerts'
              },
              {
                commitment: 'Policy and Objectives Establishment',
                description: 'Ensuring quality policy and objectives are established and compatible with strategic direction',
                implementation: 'Annual strategic planning process with quality objective alignment',
                systemIntegration: 'Objectives management module with progress tracking and reporting'
              },
              {
                commitment: 'QMS Integration',
                description: 'Ensuring quality management system requirements are integrated into business processes',
                implementation: 'Process integration assessments and workflow optimization',
                systemIntegration: 'Business process management system with quality control points'
              },
              {
                commitment: 'Process Approach Promotion',
                description: 'Promoting the use of the process approach and risk-based thinking',
                implementation: 'Process mapping workshops and risk assessment training programs',
                systemIntegration: 'Process modeling tools with integrated risk assessment capabilities'
              },
              {
                commitment: 'Resource Availability',
                description: 'Ensuring resources needed for the quality management system are available',
                implementation: 'Budget allocation for quality initiatives and infrastructure investments',
                systemIntegration: 'Resource planning module with capacity management and forecasting'
              },
              {
                commitment: 'Importance Communication',
                description: 'Communicating the importance of effective quality management and conforming to QMS requirements',
                implementation: 'Regular town halls, newsletters, and training communications',
                systemIntegration: 'Communication management system with delivery tracking and feedback'
              }
            ]
          },
          {
            subheading: '5.1.2 Customer Focus',
            text: `Top management demonstrates leadership and commitment with respect to customer focus by ensuring that customer and applicable statutory and regulatory requirements are determined, understood and consistently met.`,
            customerFocus: [
              {
                area: 'Customer Requirements Determination',
                description: 'Systematic identification and documentation of customer needs and expectations',
                process: 'Contract review process with customer requirement analysis and specification development',
                systemIntegration: 'CRM system with requirement tracking and customer communication portal'
              },
              {
                area: 'Regulatory Compliance',
                description: 'Identification and compliance with applicable statutory and regulatory requirements',
                process: 'Regulatory monitoring system with compliance tracking and update notifications',
                systemIntegration: 'Compliance management module with automated regulatory change alerts'
              },
              {
                area: 'Customer Satisfaction',
                description: 'Focus on enhancing customer satisfaction through consistent delivery of quality products',
                process: 'Customer satisfaction surveys, feedback analysis, and improvement planning',
                systemIntegration: 'Customer portal with satisfaction tracking and improvement request management'
              },
              {
                area: 'Risk and Opportunity Management',
                description: 'Addressing risks and opportunities that can affect conformity of products and services',
                process: 'Risk assessment process with opportunity identification and action planning',
                systemIntegration: 'Risk management system with automated monitoring and response workflows'
              }
            ]
          }
        ]
      },
      {
        heading: '5.2 Policy',
        text: `Top management establishes, implements and maintains a quality policy that is appropriate to the purpose and context of the organization, provides a framework for setting quality objectives, and includes a commitment to satisfy applicable requirements and to continual improvement of the quality management system.`,
        systemNote: 'Quality policy is maintained in our document management system with controlled distribution and regular review cycles.',
        subsections: [
          {
            subheading: '5.2.1 Establishing the Quality Policy',
            text: `BridgeLineUSA's Quality Policy has been established by top management and demonstrates our commitment to quality excellence:`,
            qualityPolicy: {
              statement: `"BridgeLineUSA is committed to delivering exceptional quality in the design, manufacturing, and installation of industrial piping systems, pressure vessels, and custom fabrication solutions. We achieve this through:
              
              • Customer Focus: Understanding and exceeding customer expectations through innovative solutions and superior service
              • Continuous Improvement: Embracing a culture of continuous improvement in all aspects of our operations
              • Compliance Excellence: Adhering to applicable industry standards, regulations, and customer requirements
              • Employee Engagement: Empowering our team with the knowledge, tools, and authority to deliver quality results
              • Process Excellence: Implementing robust processes that ensure consistent quality and operational efficiency
              • Stakeholder Value: Creating value for customers, employees, suppliers, and the communities we serve
              
              This policy provides the framework for establishing and reviewing quality objectives and is communicated throughout the organization to ensure understanding and implementation at all levels."`,
              approvedBy: 'Chief Executive Officer',
              effectiveDate: 'September 2025',
              reviewFrequency: 'Annual or as needed based on organizational changes',
              systemIntegration: 'Policy management system with automated review notifications and version control'
            }
          },
          {
            subheading: '5.2.2 Communicating the Quality Policy',
            text: `The quality policy is made available and maintained as documented information, communicated within the organization, and available to relevant interested parties as appropriate.`,
            communication: [
              {
                method: 'Internal Communication',
                description: 'Policy communication to all employees through multiple channels',
                channels: ['Employee orientation programs', 'Annual training sessions', 'Workplace displays and posters', 'Company intranet and documentation system'],
                systemIntegration: 'Learning management system with policy awareness tracking'
              },
              {
                method: 'External Communication',
                description: 'Policy availability to customers, suppliers, and regulatory bodies',
                channels: ['Company website quality section', 'Customer portal access', 'Supplier onboarding materials', 'Audit and certification documentation'],
                systemIntegration: 'External portal with controlled document access'
              },
              {
                method: 'Understanding Verification',
                description: 'Ensuring policy understanding throughout the organization',
                verification: ['Training completion assessments', 'Manager understanding checks', 'Employee feedback and questions', 'Audit findings and observations'],
                systemIntegration: 'Training tracking system with competence verification'
              }
            ]
          }
        ]
      },
      {
        heading: '5.3 Organizational Roles, Responsibilities and Authorities',
        text: `Top management ensures that the responsibilities and authorities for relevant roles are assigned, communicated and understood within the organization. Top management assigns the responsibility and authority for ensuring that the quality management system conforms to the requirements of ISO 9001:2015.`,
        systemNote: 'Organizational structure and role definitions are maintained in our HR management system with real-time updates and access control.',
        subsections: [
          {
            subheading: '5.3.1 Quality Management System Roles',
            text: `BridgeLineUSA has established clear roles, responsibilities, and authorities for quality management system implementation and maintenance:`,
            roles: [
              {
                role: 'Chief Executive Officer (CEO)',
                responsibilities: [
                  'Overall accountability for quality management system effectiveness',
                  'Quality policy establishment and communication',
                  'Resource allocation for quality initiatives',
                  'Management review participation and decision-making'
                ],
                authorities: [
                  'Final approval authority for quality policy and objectives',
                  'Budget authorization for quality improvements',
                  'Organizational structure and role assignment decisions',
                  'Strategic direction setting for quality management'
                ],
                systemIntegration: 'Executive dashboard with quality performance metrics and decision support tools'
              },
              {
                role: 'Quality Manager',
                responsibilities: [
                  'Quality management system development and maintenance',
                  'ISO 9001:2015 compliance monitoring and reporting',
                  'Internal audit program management',
                  'Quality training program coordination',
                  'Customer complaint and nonconformance management',
                  'Supplier quality assessment and monitoring'
                ],
                authorities: [
                  'Quality system documentation approval',
                  'Nonconformance investigation and corrective action initiation',
                  'Quality training requirement determination',
                  'Supplier quality assessment and approval recommendations',
                  'Quality-related work stoppage authority when safety or compliance is at risk'
                ],
                systemIntegration: 'Quality management system with full administrative access and reporting capabilities'
              },
              {
                role: 'Operations Manager',
                responsibilities: [
                  'Production quality control implementation',
                  'Quality control plan execution and monitoring',
                  'Production team quality training coordination',
                  'Equipment calibration and maintenance oversight',
                  'Process improvement initiative implementation'
                ],
                authorities: [
                  'Production quality standard enforcement',
                  'Quality control procedure modification approval',
                  'Production equipment quality-related decisions',
                  'Operator qualification and certification authorization',
                  'Process change implementation authority'
                ],
                systemIntegration: 'Manufacturing execution system with quality control integration and real-time monitoring'
              },
              {
                role: 'Engineering Manager',
                responsibilities: [
                  'Design quality control and review processes',
                  'Technical specification development and approval',
                  'Design change control implementation',
                  'Customer requirement analysis and translation',
                  'Product development quality planning'
                ],
                authorities: [
                  'Design specification approval and release',
                  'Engineering change order authorization',
                  'Technical requirement interpretation and clarification',
                  'Design review meeting leadership and decision-making',
                  'Customer technical interface and agreement negotiation'
                ],
                systemIntegration: 'Product lifecycle management system with design control and change management capabilities'
              }
            ]
          },
          {
            subheading: '5.3.2 Process Owner Responsibilities',
            text: `Each business process has designated process owners with defined responsibilities for process performance and improvement:`,
            processOwners: [
              {
                process: 'Sales and Contract Management',
                owner: 'Sales Manager',
                keyResponsibilities: [
                  'Customer requirement capture and documentation',
                  'Contract review and approval coordination',
                  'Customer communication and relationship management',
                  'Sales process improvement and optimization'
                ],
                qualityInterface: 'Ensures customer requirements are clearly defined and achievable within quality standards',
                systemIntegration: 'CRM system with quality requirement tracking and contract compliance monitoring'
              },
              {
                process: 'Design and Engineering',
                owner: 'Engineering Manager',
                keyResponsibilities: [
                  'Design input analysis and specification development',
                  'Design output verification and validation',
                  'Design change control and documentation',
                  'Technical risk assessment and mitigation'
                ],
                qualityInterface: 'Ensures designs meet customer requirements and applicable standards through systematic review and verification',
                systemIntegration: 'Engineering database with design control, review tracking, and change management'
              },
              {
                process: 'Procurement and Supplier Management',
                owner: 'Purchasing Manager',
                keyResponsibilities: [
                  'Supplier evaluation and qualification',
                  'Purchase order specification and approval',
                  'Supplier performance monitoring and improvement',
                  'Material quality verification and acceptance'
                ],
                qualityInterface: 'Ensures purchased materials and services meet specified quality requirements',
                systemIntegration: 'ERP system with supplier scorecards, quality tracking, and automated procurement workflows'
              },
              {
                process: 'Production and Manufacturing',
                owner: 'Operations Manager',
                keyResponsibilities: [
                  'Production planning and scheduling optimization',
                  'Manufacturing process control and monitoring',
                  'Quality control implementation and verification',
                  'Production efficiency and improvement initiatives'
                ],
                qualityInterface: 'Ensures manufacturing processes consistently produce products meeting quality specifications',
                systemIntegration: 'Manufacturing execution system with real-time quality monitoring and process control'
              }
            ]
          },
          {
            subheading: '5.3.3 Authority Matrix and Decision Rights',
            text: `BridgeLineUSA maintains a comprehensive authority matrix that defines decision-making rights and approval levels for quality-related activities:`,
            authorityMatrix: [
              {
                activity: 'Quality Policy Changes',
                level1: 'CEO - Final Approval',
                level2: 'Quality Manager - Recommendation',
                level3: 'Management Team - Review and Input',
                systemControl: 'Document management system with approval workflow and electronic signatures'
              },
              {
                activity: 'Quality Objectives Setting',
                level1: 'CEO - Strategic Approval',
                level2: 'Quality Manager - Operational Definition',
                level3: 'Department Managers - Implementation Planning',
                systemControl: 'Objectives management system with cascading goal alignment and progress tracking'
              },
              {
                activity: 'Corrective Action Approval',
                level1: 'Quality Manager - System-wide Actions',
                level2: 'Department Managers - Department-specific Actions',
                level3: 'Supervisors - Immediate Corrective Actions',
                systemControl: 'CAPA system with automated escalation and approval routing based on impact assessment'
              },
              {
                activity: 'Supplier Quality Issues',
                level1: 'Purchasing Manager - Supplier Disposition',
                level2: 'Quality Manager - Quality Requirements',
                level3: 'Operations Manager - Production Impact',
                systemControl: 'Supplier management system with quality issue tracking and resolution workflows'
              },
              {
                activity: 'Customer Quality Issues',
                level1: 'CEO - Major Customer Issues',
                level2: 'Sales Manager - Customer Communication',
                level3: 'Quality Manager - Technical Resolution',
                systemControl: 'Customer complaint system with escalation rules and resolution tracking'
              }
            ]
          }
        ]
      }
    ]
  };

  const renderLeadershipSection = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {leadershipContent.title}
          </h2>
          <p className="text-gray-600 mb-6">
            This section establishes leadership commitment, quality policy, and organizational roles and responsibilities for the quality management system.
          </p>
        </div>

        {leadershipContent.sections.map((section, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{section.heading}</h3>
            <p className="text-gray-700 mb-4">{section.text}</p>
            
            {section.systemNote && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-5 w-5 text-blue-400 flex items-center justify-center">
                      <span className="text-sm font-bold">ℹ</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">{section.systemNote}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Subsections for Leadership and Commitment */}
            {section.subsections && section.subsections.map((subsection, subIndex) => (
              <div key={subIndex} className="mt-6 border-t border-gray-200 pt-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{subsection.subheading}</h4>
                <p className="text-gray-700 mb-4">{subsection.text}</p>

                {/* Leadership Commitments */}
                {subsection.commitments && (
                  <div className="space-y-4">
                    {subsection.commitments.map((commitment, commitIndex) => (
                      <div key={commitIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h5 className="font-semibold text-gray-900 mb-2">{commitment.commitment}</h5>
                        <p className="text-gray-700 text-sm mb-2">{commitment.description}</p>
                        <p className="text-green-700 text-sm mb-1"><strong>Implementation:</strong> {commitment.implementation}</p>
                        <p className="text-blue-700 text-sm"><strong>System Integration:</strong> {commitment.systemIntegration}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Customer Focus Areas */}
                {subsection.customerFocus && (
                  <div className="space-y-4">
                    {subsection.customerFocus.map((focus, focusIndex) => (
                      <div key={focusIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h5 className="font-semibold text-gray-900 mb-2">{focus.area}</h5>
                        <p className="text-gray-700 text-sm mb-2">{focus.description}</p>
                        <p className="text-green-700 text-sm mb-1"><strong>Process:</strong> {focus.process}</p>
                        <p className="text-blue-700 text-sm"><strong>System Integration:</strong> {focus.systemIntegration}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quality Policy */}
                {subsection.qualityPolicy && (
                  <div className="border border-purple-200 rounded p-6 bg-purple-50 mt-4">
                    <h5 className="font-semibold text-purple-900 mb-4">BridgeLineUSA Quality Policy</h5>
                    <div className="bg-white p-4 rounded border">
                      <div className="whitespace-pre-line text-gray-700 text-sm mb-4">
                        {subsection.qualityPolicy.statement}
                      </div>
                      <div className="border-t border-gray-200 pt-4 text-xs text-gray-600">
                        <div className="grid grid-cols-2 gap-4">
                          <div><strong>Approved By:</strong> {subsection.qualityPolicy.approvedBy}</div>
                          <div><strong>Effective Date:</strong> {subsection.qualityPolicy.effectiveDate}</div>
                          <div><strong>Review Frequency:</strong> {subsection.qualityPolicy.reviewFrequency}</div>
                          <div><strong>System Integration:</strong> {subsection.qualityPolicy.systemIntegration}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Communication Methods */}
                {subsection.communication && (
                  <div className="space-y-4">
                    {subsection.communication.map((comm, commIndex) => (
                      <div key={commIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h5 className="font-semibold text-gray-900 mb-2">{comm.method}</h5>
                        <p className="text-gray-700 text-sm mb-3">{comm.description}</p>
                        {comm.channels && (
                          <div className="mb-2">
                            <p className="text-green-700 text-sm font-semibold mb-1">Channels:</p>
                            <ul className="list-disc list-inside text-green-700 text-sm">
                              {comm.channels.map((channel, channelIndex) => (
                                <li key={channelIndex}>{channel}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {comm.verification && (
                          <div className="mb-2">
                            <p className="text-green-700 text-sm font-semibold mb-1">Verification Methods:</p>
                            <ul className="list-disc list-inside text-green-700 text-sm">
                              {comm.verification.map((method, methodIndex) => (
                                <li key={methodIndex}>{method}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="text-blue-700 text-sm"><strong>System Integration:</strong> {comm.systemIntegration}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Organizational Roles */}
                {subsection.roles && (
                  <div className="space-y-4">
                    {subsection.roles.map((role, roleIndex) => (
                      <div key={roleIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h5 className="font-semibold text-gray-900 mb-3">{role.role}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-2">Responsibilities</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {role.responsibilities.map((resp, respIndex) => (
                                <li key={respIndex}>{resp}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-2">Authorities</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {role.authorities.map((auth, authIndex) => (
                                <li key={authIndex}>{auth}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-white rounded border">
                          <p className="text-xs text-blue-700"><strong>System Integration:</strong> {role.systemIntegration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Process Owners */}
                {subsection.processOwners && (
                  <div className="space-y-4">
                    {subsection.processOwners.map((owner, ownerIndex) => (
                      <div key={ownerIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h5 className="font-semibold text-gray-900 mb-2">{owner.process}</h5>
                        <p className="text-purple-700 text-sm font-semibold mb-2">Owner: {owner.owner}</p>
                        <div className="mb-3">
                          <h6 className="font-semibold text-gray-800 mb-1">Key Responsibilities</h6>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                            {owner.keyResponsibilities.map((resp, respIndex) => (
                              <li key={respIndex}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                        <p className="text-green-700 text-sm mb-2"><strong>Quality Interface:</strong> {owner.qualityInterface}</p>
                        <p className="text-blue-700 text-sm"><strong>System Integration:</strong> {owner.systemIntegration}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Authority Matrix */}
                {subsection.authorityMatrix && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Authority</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Secondary Authority</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supporting Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System Control</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {subsection.authorityMatrix.map((item, itemIndex) => (
                          <tr key={itemIndex}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.activity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.level1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.level2}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.level3}</td>
                            <td className="px-6 py-4 text-sm text-blue-700">{item.systemControl}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Section 6: Planning content
  const planningContent = {
    title: 'Section 6: Planning',
    sections: [
      {
        heading: '6.1 Actions to Address Risks and Opportunities',
        text: `When planning for the quality management system, the organization considers the issues referred to in 4.1 and the requirements referred to in 4.2 and determines the risks and opportunities that need to be addressed to give assurance that the quality management system can achieve its intended results.`,
        systemNote: 'Risk and opportunity management is integrated into our enterprise risk management system with real-time monitoring and automated alert capabilities.',
        subsections: [
          {
            subheading: '6.1.1 Risk and Opportunity Identification',
            text: `BridgeLineUSA has established a systematic approach to identify, assess, and address risks and opportunities that could affect the quality management system's ability to achieve its intended results.`,
            riskCategories: [
              {
                category: 'Strategic Risks',
                description: 'Risks related to organizational strategy and market conditions',
                examples: [
                  'Market demand fluctuations affecting production planning',
                  'Competitive pressures impacting pricing and quality requirements',
                  'Technology changes requiring skill development and equipment updates',
                  'Regulatory changes affecting compliance requirements'
                ],
                opportunities: [
                  'New market segments for specialized fabrication capabilities',
                  'Technology adoption for competitive advantage',
                  'Strategic partnerships for expanded capabilities',
                  'Regulatory compliance as competitive differentiator'
                ],
                systemIntegration: 'Business intelligence dashboard with market trend analysis and strategic planning modules'
              },
              {
                category: 'Operational Risks',
                description: 'Risks related to day-to-day operations and processes',
                examples: [
                  'Equipment failure causing production delays and quality issues',
                  'Supplier quality problems affecting product conformity',
                  'Skilled labor shortages impacting production capacity',
                  'Material defects leading to rework and customer complaints'
                ],
                opportunities: [
                  'Process improvement initiatives for efficiency gains',
                  'Preventive maintenance programs reducing downtime',
                  'Supplier development for enhanced quality and reliability',
                  'Cross-training programs for operational flexibility'
                ],
                systemIntegration: 'Manufacturing execution system with predictive maintenance and quality monitoring'
              },
              {
                category: 'Compliance Risks',
                description: 'Risks related to regulatory and standard compliance',
                examples: [
                  'Code changes affecting design and manufacturing requirements',
                  'Audit findings requiring corrective actions',
                  'Certification maintenance requirements',
                  'Customer specification changes impacting compliance'
                ],
                opportunities: [
                  'Early adoption of new standards for market leadership',
                  'Certification expansion for new market access',
                  'Compliance excellence as customer value proposition',
                  'Industry standard development participation'
                ],
                systemIntegration: 'Compliance management system with regulatory tracking and audit management'
              },
              {
                category: 'Customer Risks',
                description: 'Risks related to customer satisfaction and relationships',
                examples: [
                  'Changing customer requirements affecting product design',
                  'Delivery delays impacting customer satisfaction',
                  'Quality issues leading to customer complaints',
                  'Communication gaps causing misunderstandings'
                ],
                opportunities: [
                  'Enhanced customer engagement for relationship strengthening',
                  'Value-added services for customer retention',
                  'Quality excellence for premium positioning',
                  'Innovation partnerships for mutual growth'
                ],
                systemIntegration: 'CRM system with customer satisfaction tracking and communication management'
              }
            ]
          },
          {
            subheading: '6.1.2 Risk Assessment and Prioritization',
            text: `BridgeLineUSA uses a structured risk assessment methodology to evaluate the likelihood and impact of identified risks and opportunities, enabling prioritized action planning.`,
            assessmentCriteria: {
              likelihood: [
                { level: 'Very Low (1)', description: 'Remote possibility, unlikely to occur in normal circumstances', probability: '< 5%' },
                { level: 'Low (2)', description: 'Unlikely to occur but possible under certain conditions', probability: '5-25%' },
                { level: 'Medium (3)', description: 'May occur under normal operating conditions', probability: '25-50%' },
                { level: 'High (4)', description: 'Likely to occur during normal operations', probability: '50-75%' },
                { level: 'Very High (5)', description: 'Almost certain to occur', probability: '> 75%' }
              ],
              impact: [
                { level: 'Negligible (1)', description: 'Minimal impact on operations, quality, or customer satisfaction', consequences: 'Minor delays, easily correctable issues' },
                { level: 'Minor (2)', description: 'Limited impact requiring management attention', consequences: 'Some rework, customer notification required' },
                { level: 'Moderate (3)', description: 'Significant impact affecting operations or quality', consequences: 'Production delays, customer complaints possible' },
                { level: 'Major (4)', description: 'Serious impact threatening objectives or compliance', consequences: 'Major delays, customer dissatisfaction, regulatory concerns' },
                { level: 'Critical (5)', description: 'Severe impact threatening business continuity', consequences: 'Business interruption, regulatory violations, customer loss' }
              ],
              riskMatrix: [
                { risk: 'Low Risk (1-6)', action: 'Monitor and review quarterly', resources: 'Routine monitoring' },
                { risk: 'Medium Risk (7-12)', action: 'Develop mitigation plans within 30 days', resources: 'Dedicated project team' },
                { risk: 'High Risk (13-20)', action: 'Immediate action required within 7 days', resources: 'Senior management involvement' },
                { risk: 'Critical Risk (21-25)', action: 'Emergency response within 24 hours', resources: 'Executive team engagement' }
              ]
            }
          },
          {
            subheading: '6.1.3 Risk Treatment and Action Planning',
            text: `For identified risks and opportunities, BridgeLineUSA develops and implements appropriate actions to address them, integrating these actions into quality management system processes.`,
            treatmentStrategies: [
              {
                strategy: 'Risk Avoidance',
                description: 'Eliminate the risk by changing processes or removing risk sources',
                examples: [
                  'Redesigning processes to eliminate failure modes',
                  'Selecting alternative suppliers with better quality records',
                  'Implementing backup systems for critical operations',
                  'Avoiding high-risk customer segments or projects'
                ],
                applicability: 'High-impact risks that can be eliminated cost-effectively',
                systemIntegration: 'Process management system with design control and supplier evaluation modules'
              },
              {
                strategy: 'Risk Mitigation',
                description: 'Reduce the likelihood or impact of risks through preventive measures',
                examples: [
                  'Implementing preventive maintenance programs',
                  'Developing supplier quality agreements and monitoring',
                  'Cross-training employees for operational flexibility',
                  'Installing backup equipment and redundant systems'
                ],
                applicability: 'Risks that cannot be eliminated but can be reduced',
                systemIntegration: 'Maintenance management system with predictive analytics and training tracking'
              },
              {
                strategy: 'Risk Transfer',
                description: 'Transfer risk responsibility to third parties through contracts or insurance',
                examples: [
                  'Insurance coverage for equipment damage and business interruption',
                  'Contractual liability transfer to suppliers for material defects',
                  'Performance bonds for critical project deliveries',
                  'Professional liability insurance for design services'
                ],
                applicability: 'Risks that can be economically transferred to other parties',
                systemIntegration: 'Contract management system with insurance tracking and claim management'
              },
              {
                strategy: 'Risk Acceptance',
                description: 'Accept the risk and monitor for changes while preparing contingency plans',
                examples: [
                  'Accepting minor market fluctuation impacts',
                  'Monitoring low-probability regulatory changes',
                  'Accepting limited supplier dependencies with contingency plans',
                  'Tolerating minor process variations within acceptable limits'
                ],
                applicability: 'Low-impact risks or those where treatment costs exceed benefits',
                systemIntegration: 'Risk monitoring dashboard with automated alerts and contingency plan management'
              },
              {
                strategy: 'Opportunity Enhancement',
                description: 'Actively pursue opportunities to maximize potential benefits',
                examples: [
                  'Investing in new technology for competitive advantage',
                  'Developing strategic partnerships for market expansion',
                  'Implementing advanced quality systems for premium positioning',
                  'Training programs for capability development'
                ],
                applicability: 'High-value opportunities aligned with strategic objectives',
                systemIntegration: 'Project management system with opportunity tracking and investment analysis'
              }
            ]
          }
        ]
      },
      {
        heading: '6.2 Quality Objectives and Planning to Achieve Them',
        text: `The organization establishes quality objectives at relevant functions, levels and processes needed for the quality management system. Quality objectives shall be consistent with the quality policy, measurable, take into account applicable requirements, be relevant to conformity of products and services and to enhancement of customer satisfaction.`,
        systemNote: 'Quality objectives are managed through our balanced scorecard system with real-time performance tracking and automated reporting to management.',
        subsections: [
          {
            subheading: '6.2.1 Quality Objectives Framework',
            text: `BridgeLineUSA has established a comprehensive framework for setting, monitoring, and achieving quality objectives that support the organization's strategic direction and quality policy.`,
            objectiveCategories: [
              {
                category: 'Customer Satisfaction Objectives',
                description: 'Objectives focused on meeting and exceeding customer expectations',
                objectives: [
                  {
                    objective: 'Customer Satisfaction Score',
                    target: '≥ 95% satisfaction rating on customer surveys',
                    measurement: 'Quarterly customer satisfaction surveys with 5-point rating scale',
                    responsibility: 'Sales Manager',
                    resources: 'Customer survey system, customer service team',
                    systemIntegration: 'CRM system with automated survey distribution and analysis'
                  },
                  {
                    objective: 'On-Time Delivery Performance',
                    target: '≥ 98% of orders delivered on or before promised date',
                    measurement: 'Monthly delivery performance tracking against committed dates',
                    responsibility: 'Operations Manager',
                    resources: 'Production planning system, logistics coordination',
                    systemIntegration: 'ERP system with delivery tracking and performance analytics'
                  },
                  {
                    objective: 'Customer Complaint Resolution',
                    target: '100% of customer complaints resolved within 48 hours',
                    measurement: 'Complaint response time tracking and resolution status',
                    responsibility: 'Quality Manager',
                    resources: 'Customer service team, technical support resources',
                    systemIntegration: 'Customer complaint management system with automated escalation'
                  }
                ]
              },
              {
                category: 'Quality Performance Objectives',
                description: 'Objectives focused on product and service quality excellence',
                objectives: [
                  {
                    objective: 'First Pass Yield',
                    target: '≥ 99% of products pass final inspection without rework',
                    measurement: 'Monthly tracking of first pass yield by product line',
                    responsibility: 'Operations Manager',
                    resources: 'Quality control team, inspection equipment',
                    systemIntegration: 'Quality management system with real-time defect tracking'
                  },
                  {
                    objective: 'Supplier Quality Performance',
                    target: '≥ 99.5% of incoming materials meet acceptance criteria',
                    measurement: 'Monthly supplier scorecard with quality metrics',
                    responsibility: 'Purchasing Manager',
                    resources: 'Incoming inspection team, supplier quality agreements',
                    systemIntegration: 'Supplier management system with quality performance tracking'
                  },
                  {
                    objective: 'Calibration Compliance',
                    target: '100% of measurement equipment calibrated within due dates',
                    measurement: 'Monthly calibration status reporting and tracking',
                    responsibility: 'Quality Manager',
                    resources: 'Calibration service providers, equipment tracking system',
                    systemIntegration: 'Calibration management system with automated reminders'
                  }
                ]
              },
              {
                category: 'Process Improvement Objectives',
                description: 'Objectives focused on continuous improvement and operational excellence',
                objectives: [
                  {
                    objective: 'Process Improvement Implementation',
                    target: 'Complete 12 process improvement projects annually',
                    measurement: 'Quarterly tracking of improvement project completion',
                    responsibility: 'Quality Manager',
                    resources: 'Improvement teams, project management resources',
                    systemIntegration: 'Project management system with improvement tracking module'
                  },
                  {
                    objective: 'Employee Training Completion',
                    target: '100% of required quality training completed on schedule',
                    measurement: 'Monthly training completion rate by department',
                    responsibility: 'HR Manager',
                    resources: 'Training team, learning management system',
                    systemIntegration: 'Learning management system with competence tracking'
                  },
                  {
                    objective: 'Audit Performance',
                    target: 'Zero major nonconformances in external audits',
                    measurement: 'Annual external audit results and finding categorization',
                    responsibility: 'Quality Manager',
                    resources: 'Internal audit team, corrective action resources',
                    systemIntegration: 'Audit management system with finding tracking and CAPA integration'
                  }
                ]
              }
            ]
          },
          {
            subheading: '6.2.2 Objective Setting and Deployment',
            text: `Quality objectives are established through a systematic process that ensures alignment with organizational strategy and stakeholder needs.`,
            deploymentProcess: [
              {
                phase: 'Strategic Planning',
                description: 'Annual strategic planning process incorporating quality objectives',
                activities: [
                  'Review organizational context and stakeholder requirements',
                  'Analyze previous year performance and lessons learned',
                  'Identify strategic priorities and improvement opportunities',
                  'Set high-level organizational quality objectives'
                ],
                participants: ['Executive team', 'Department managers', 'Quality manager'],
                outputs: ['Strategic quality objectives', 'Resource allocation plans', 'Performance targets'],
                timeline: 'October-November annually',
                systemIntegration: 'Strategic planning module with objective cascade functionality'
              },
              {
                phase: 'Departmental Planning',
                description: 'Department-level objective setting aligned with organizational objectives',
                activities: [
                  'Cascade organizational objectives to departmental level',
                  'Define specific, measurable departmental targets',
                  'Identify required resources and support needs',
                  'Develop action plans and milestone schedules'
                ],
                participants: ['Department managers', 'Team leaders', 'Key personnel'],
                outputs: ['Departmental objectives', 'Action plans', 'Resource requirements'],
                timeline: 'December annually',
                systemIntegration: 'Departmental planning tools with objective alignment tracking'
              },
              {
                phase: 'Implementation Planning',
                description: 'Detailed planning for objective achievement and monitoring',
                activities: [
                  'Develop detailed implementation plans and timelines',
                  'Assign responsibilities and accountability',
                  'Establish monitoring and measurement systems',
                  'Define review and adjustment processes'
                ],
                participants: ['Process owners', 'Project teams', 'Quality personnel'],
                outputs: ['Implementation plans', 'Monitoring systems', 'Review schedules'],
                timeline: 'January annually',
                systemIntegration: 'Project management system with objective tracking and milestone management'
              }
            ]
          },
          {
            subheading: '6.2.3 Monitoring and Review',
            text: `BridgeLineUSA maintains a systematic approach to monitoring progress toward quality objectives and reviewing their continued suitability and effectiveness.`,
            monitoringFramework: {
              frequency: [
                { interval: 'Daily', scope: 'Operational metrics', examples: ['Production quality rates', 'Customer response times', 'Safety incidents'], system: 'Real-time dashboard monitoring' },
                { interval: 'Weekly', scope: 'Process performance', examples: ['Weekly quality reports', 'Supplier performance', 'Training progress'], system: 'Automated weekly reporting' },
                { interval: 'Monthly', scope: 'Departmental objectives', examples: ['Monthly performance reviews', 'Trend analysis', 'Corrective actions'], system: 'Management reporting system' },
                { interval: 'Quarterly', scope: 'Organizational objectives', examples: ['Quarterly business reviews', 'Strategic progress', 'Stakeholder feedback'], system: 'Executive dashboard and board reporting' }
              ],
              reviewProcess: [
                {
                  step: 'Data Collection and Analysis',
                  description: 'Systematic collection and analysis of performance data',
                  activities: ['Automated data extraction from operational systems', 'Manual data collection for qualitative metrics', 'Statistical analysis and trend identification', 'Variance analysis against targets'],
                  systemIntegration: 'Business intelligence platform with automated data integration and analytics'
                },
                {
                  step: 'Performance Assessment',
                  description: 'Evaluation of performance against established objectives',
                  activities: ['Target achievement assessment', 'Root cause analysis for variances', 'Impact assessment on stakeholders', 'Benchmarking against industry standards'],
                  systemIntegration: 'Performance management system with variance analysis and benchmarking capabilities'
                },
                {
                  step: 'Action Planning',
                  description: 'Development of corrective and improvement actions',
                  activities: ['Corrective action planning for underperformance', 'Improvement opportunity identification', 'Resource reallocation decisions', 'Timeline adjustment as needed'],
                  systemIntegration: 'Action planning module with resource allocation and timeline management'
                },
                {
                  step: 'Communication and Reporting',
                  description: 'Communication of results and actions to stakeholders',
                  activities: ['Performance reporting to management', 'Communication to affected departments', 'Stakeholder notification of significant changes', 'Documentation of decisions and rationale'],
                  systemIntegration: 'Communication platform with automated reporting and stakeholder notification'
                }
              ]
            }
          }
        ]
      },
      {
        heading: '6.3 Planning of Changes',
        text: `When the organization determines the need for changes to the quality management system, the changes shall be carried out in a planned manner. The organization shall consider the purpose of the changes and their potential consequences, the integrity of the quality management system, the availability of resources, and the allocation or reallocation of responsibilities and authorities.`,
        systemNote: 'Change management is handled through our integrated change control system with workflow automation and impact assessment capabilities.',
        subsections: [
          {
            subheading: '6.3.1 Change Management Framework',
            text: `BridgeLineUSA has established a comprehensive change management framework to ensure that changes to the quality management system are planned, controlled, and effectively implemented.`,
            changeTypes: [
              {
                type: 'Strategic Changes',
                description: 'Changes affecting organizational strategy and direction',
                examples: [
                  'New market entry requiring capability development',
                  'Acquisition or merger integration affecting processes',
                  'Strategic partnership implementation',
                  'Business model transformation initiatives'
                ],
                approvalLevel: 'Executive team approval required',
                riskAssessment: 'Comprehensive impact analysis including financial, operational, and compliance risks',
                systemIntegration: 'Strategic planning system with change impact modeling and approval workflows'
              },
              {
                type: 'Process Changes',
                description: 'Changes to business processes and procedures',
                examples: [
                  'Manufacturing process improvements and optimizations',
                  'Quality control procedure updates',
                  'Supplier management process enhancements',
                  'Customer service process modifications'
                ],
                approvalLevel: 'Department manager approval with quality manager review',
                riskAssessment: 'Process impact analysis including quality, safety, and performance implications',
                systemIntegration: 'Process management system with version control and impact assessment tools'
              },
              {
                type: 'Technology Changes',
                description: 'Changes involving technology systems and equipment',
                examples: [
                  'ERP system upgrades and implementations',
                  'Manufacturing equipment installations',
                  'Quality management system updates',
                  'Automation and digitalization projects'
                ],
                approvalLevel: 'IT manager and affected department manager approval',
                riskAssessment: 'Technology risk assessment including cybersecurity, data integrity, and operational continuity',
                systemIntegration: 'IT change management system with technical impact analysis and rollback procedures'
              },
              {
                type: 'Organizational Changes',
                description: 'Changes to organizational structure and personnel',
                examples: [
                  'Organizational restructuring and role changes',
                  'New position creation and responsibility allocation',
                  'Training and competency requirement updates',
                  'Management system role and authority modifications'
                ],
                approvalLevel: 'HR manager and executive team approval',
                riskAssessment: 'Organizational impact analysis including competency gaps and transition risks',
                systemIntegration: 'HR management system with organizational modeling and competency tracking'
              }
            ]
          },
          {
            subheading: '6.3.2 Change Control Process',
            text: `All changes to the quality management system follow a standardized change control process to ensure proper evaluation, approval, and implementation.`,
            changeProcess: [
              {
                stage: 'Change Request Initiation',
                description: 'Formal submission of change requests with justification and impact assessment',
                activities: [
                  'Complete change request form with detailed description',
                  'Provide business justification and expected benefits',
                  'Conduct preliminary impact assessment',
                  'Identify stakeholders and affected processes'
                ],
                deliverables: ['Change request document', 'Initial impact assessment', 'Stakeholder identification'],
                approvals: ['Requestor supervisor approval'],
                timeline: '1-2 days',
                systemIntegration: 'Change request portal with automated routing and notification'
              },
              {
                stage: 'Impact Analysis and Planning',
                description: 'Comprehensive analysis of change impacts and development of implementation plan',
                activities: [
                  'Detailed impact analysis on processes, systems, and personnel',
                  'Risk assessment and mitigation planning',
                  'Resource requirement identification and allocation',
                  'Implementation timeline and milestone development'
                ],
                deliverables: ['Impact analysis report', 'Risk assessment', 'Implementation plan', 'Resource plan'],
                approvals: ['Department manager and quality manager review'],
                timeline: '3-5 days for minor changes, 1-2 weeks for major changes',
                systemIntegration: 'Impact analysis tools with process mapping and risk assessment capabilities'
              },
              {
                stage: 'Change Approval',
                description: 'Formal approval process based on change significance and impact',
                activities: [
                  'Present change proposal to appropriate approval authority',
                  'Address questions and concerns from approvers',
                  'Obtain formal written approval or rejection',
                  'Document approval decisions and conditions'
                ],
                deliverables: ['Approval decision', 'Conditions and requirements', 'Implementation authorization'],
                approvals: ['Defined approval authority based on change type and impact'],
                timeline: '1-3 days for routine changes, up to 2 weeks for strategic changes',
                systemIntegration: 'Approval workflow system with electronic signatures and audit trail'
              },
              {
                stage: 'Implementation',
                description: 'Controlled implementation of approved changes with monitoring and verification',
                activities: [
                  'Execute implementation plan according to schedule',
                  'Monitor implementation progress and address issues',
                  'Conduct testing and verification activities',
                  'Train affected personnel on changes'
                ],
                deliverables: ['Implementation progress reports', 'Test results', 'Training records', 'Issue logs'],
                approvals: ['Implementation milestone approvals'],
                timeline: 'Variable based on change complexity',
                systemIntegration: 'Project management system with progress tracking and issue management'
              },
              {
                stage: 'Verification and Closure',
                description: 'Verification of successful implementation and formal change closure',
                activities: [
                  'Verify change objectives have been achieved',
                  'Conduct post-implementation review and evaluation',
                  'Update documentation and procedures',
                  'Close change request and archive documentation'
                ],
                deliverables: ['Verification report', 'Updated documentation', 'Lessons learned', 'Change closure'],
                approvals: ['Change sponsor and quality manager approval'],
                timeline: '1-2 weeks post-implementation',
                systemIntegration: 'Document management system with version control and change history tracking'
              }
            ]
          },
          {
            subheading: '6.3.3 Change Communication and Training',
            text: `Effective communication and training ensure that all affected personnel understand and can effectively work with implemented changes.`,
            communicationStrategy: [
              {
                phase: 'Pre-Implementation',
                purpose: 'Prepare stakeholders for upcoming changes',
                methods: ['Change announcement communications', 'Stakeholder briefing sessions', 'FAQ development and distribution', 'Feedback collection and address'],
                audience: ['All affected personnel', 'Key stakeholders', 'Management team'],
                timeline: '2-4 weeks before implementation',
                systemIntegration: 'Communication platform with targeted messaging and feedback collection'
              },
              {
                phase: 'During Implementation',
                purpose: 'Support stakeholders through the change process',
                methods: ['Regular progress updates', 'Issue reporting and resolution', 'Support desk availability', 'Quick reference guides and job aids'],
                audience: ['Implementation team', 'Affected users', 'Support personnel'],
                timeline: 'Throughout implementation period',
                systemIntegration: 'Help desk system with issue tracking and resolution management'
              },
              {
                phase: 'Post-Implementation',
                purpose: 'Reinforce changes and address ongoing concerns',
                methods: ['Implementation success communication', 'Continuous improvement feedback', 'Additional training as needed', 'Performance monitoring and reporting'],
                audience: ['All personnel', 'Stakeholders', 'Management team'],
                timeline: '1-3 months post-implementation',
                systemIntegration: 'Performance monitoring system with feedback collection and analysis'
              }
            ],
            trainingApproach: [
              {
                method: 'Role-Based Training',
                description: 'Customized training based on specific roles and responsibilities',
                delivery: ['In-person workshops', 'Online training modules', 'On-the-job coaching', 'Peer mentoring'],
                assessment: 'Competency verification through testing and observation',
                systemIntegration: 'Learning management system with role-based curricula and competency tracking'
              },
              {
                method: 'Just-in-Time Training',
                description: 'Training delivered at the point of need during implementation',
                delivery: ['Quick reference cards', 'Interactive job aids', 'Video tutorials', 'Expert support'],
                assessment: 'Performance monitoring and feedback collection',
                systemIntegration: 'Performance support system with embedded training resources'
              },
              {
                method: 'Continuous Learning',
                description: 'Ongoing learning support for sustained change adoption',
                delivery: ['Refresher training sessions', 'Best practice sharing', 'Continuous improvement workshops', 'Knowledge base maintenance'],
                assessment: 'Regular skill assessments and performance reviews',
                systemIntegration: 'Knowledge management system with continuous learning pathways'
              }
            ]
          }
        ]
      }
    ]
  };

  // Section 7: Support content - Part 1 (Foundation and Resources)
  const supportContent = {
    title: 'Section 7: Support',
    sections: [
      {
        heading: '7.1 Resources',
        text: `The organization shall determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the quality management system. The organization shall consider the capabilities of, and constraints on, existing internal resources and what needs to be obtained from external providers.`,
        systemNote: 'Resource management is integrated with our ERP system for real-time resource planning, allocation, and utilization tracking across all business functions.',
        subsections: [
          {
            subheading: '7.1.1 General Resource Requirements',
            text: `BridgeLineUSA has established a systematic approach to identify, acquire, and manage all resources necessary for effective quality management system operation.`,
            resourceCategories: [
              {
                category: 'Human Resources',
                description: 'Personnel with appropriate competence and authority for quality-affecting activities',
                requirements: [
                  'Adequate staffing levels for all quality-critical functions',
                  'Competent personnel with appropriate qualifications and experience',
                  'Clear role definitions and authority assignments',
                  'Succession planning for key quality positions'
                ],
                management: [
                  'Workforce planning based on business forecasts and quality requirements',
                  'Recruitment and selection processes ensuring competence alignment',
                  'Performance management system with quality-focused objectives',
                  'Career development programs for quality capability building'
                ],
                systemIntegration: 'HR management system with competency tracking, performance monitoring, and workforce planning modules'
              },
              {
                category: 'Infrastructure Resources',
                description: 'Physical facilities, equipment, and supporting services required for quality operations',
                requirements: [
                  'Manufacturing facilities designed for efficient and controlled production',
                  'Quality control laboratories with appropriate testing capabilities',
                  'Calibrated measurement and testing equipment',
                  'Information technology infrastructure supporting quality processes'
                ],
                management: [
                  'Facility maintenance programs ensuring optimal operating conditions',
                  'Equipment lifecycle management with preventive maintenance scheduling',
                  'Calibration management system for measurement equipment accuracy',
                  'IT infrastructure management with cybersecurity and data integrity controls'
                ],
                systemIntegration: 'Asset management system with maintenance scheduling, calibration tracking, and performance monitoring'
              },
              {
                category: 'Financial Resources',
                description: 'Financial resources allocated to support quality management system activities',
                requirements: [
                  'Budget allocation for quality system implementation and maintenance',
                  'Investment in quality infrastructure and technology improvements',
                  'Resources for training and competency development',
                  'Funding for quality improvement initiatives and corrective actions'
                ],
                management: [
                  'Annual quality budget planning aligned with strategic objectives',
                  'Cost-benefit analysis for quality investments and improvements',
                  'Financial performance monitoring for quality-related expenditures',
                  'Return on investment tracking for quality initiatives'
                ],
                systemIntegration: 'Financial management system with quality-specific cost centers and ROI tracking capabilities'
              },
              {
                category: 'Knowledge Resources',
                description: 'Organizational knowledge and intellectual assets supporting quality operations',
                requirements: [
                  'Technical knowledge for product design and manufacturing processes',
                  'Quality management system knowledge and best practices',
                  'Industry standards and regulatory requirement knowledge',
                  'Customer-specific requirements and application knowledge'
                ],
                management: [
                  'Knowledge management system for capturing and sharing expertise',
                  'Documentation and procedure management for knowledge preservation',
                  'Expert knowledge transfer programs and mentoring systems',
                  'Continuous learning and knowledge update processes'
                ],
                systemIntegration: 'Knowledge management platform with document control, expert directories, and learning pathways'
              }
            ]
          },
          {
            subheading: '7.1.2 People',
            text: `BridgeLineUSA ensures that personnel performing work under the organization's control are competent on the basis of appropriate education, training, or experience.`,
            personnelFramework: [
              {
                aspect: 'Competency Requirements',
                description: 'Defined competency requirements for all quality-affecting positions',
                elements: [
                  'Education requirements based on technical complexity and responsibility level',
                  'Experience requirements considering industry knowledge and skill development',
                  'Training requirements including both initial and ongoing competency development',
                  'Certification requirements for specialized roles and regulatory compliance'
                ],
                implementation: [
                  'Job analysis and competency profiling for all positions',
                  'Competency assessment methods including testing, observation, and portfolio review',
                  'Individual development planning based on competency gaps',
                  'Regular competency review and update processes'
                ],
                systemIntegration: 'Competency management system with skill matrices, assessment tracking, and development planning'
              },
              {
                aspect: 'Recruitment and Selection',
                description: 'Systematic approach to recruiting and selecting qualified personnel',
                elements: [
                  'Position-specific recruitment strategies targeting qualified candidates',
                  'Selection criteria based on competency requirements and cultural fit',
                  'Interview and assessment processes validating technical and behavioral competencies',
                  'Reference checking and background verification for quality-critical positions'
                ],
                implementation: [
                  'Recruitment planning aligned with business needs and quality requirements',
                  'Structured interview processes with competency-based questions',
                  'Skills testing and practical assessments for technical positions',
                  'Onboarding programs ensuring new hire integration and initial competency development'
                ],
                systemIntegration: 'Recruitment management system with competency matching and candidate assessment tracking'
              },
              {
                aspect: 'Performance Management',
                description: 'Performance management system ensuring sustained competency and contribution',
                elements: [
                  'Performance objectives aligned with quality goals and individual development needs',
                  'Regular performance feedback and coaching for continuous improvement',
                  'Performance evaluation processes measuring both results and competency demonstration',
                  'Recognition and reward systems supporting quality excellence behaviors'
                ],
                implementation: [
                  'Goal setting processes linking individual objectives to organizational quality goals',
                  'Continuous feedback culture with regular check-ins and formal reviews',
                  'Performance improvement planning for addressing competency gaps',
                  'Career advancement pathways supporting long-term engagement and development'
                ],
                systemIntegration: 'Performance management system with goal tracking, feedback collection, and development planning'
              }
            ]
          },
          {
            subheading: '7.1.3 Infrastructure',
            text: `The organization determines, provides and maintains the infrastructure necessary for the operation of its processes and to achieve conformity of products and services.`,
            infrastructureElements: [
              {
                element: 'Manufacturing Facilities',
                description: 'Physical facilities designed and maintained for optimal manufacturing operations',
                components: [
                  'Production areas with appropriate layout and workflow design',
                  'Material storage and handling facilities with environmental controls',
                  'Quality control areas with proper lighting, ventilation, and isolation',
                  'Utility systems providing reliable power, compressed air, and other services'
                ],
                requirements: [
                  'Adequate space for efficient material flow and worker safety',
                  'Environmental controls maintaining temperature, humidity, and cleanliness standards',
                  'Safety systems and emergency procedures protecting personnel and equipment',
                  'Security systems protecting intellectual property and sensitive materials'
                ],
                maintenance: [
                  'Preventive maintenance programs for building systems and infrastructure',
                  'Regular facility inspections and condition assessments',
                  'Emergency response procedures for facility-related incidents',
                  'Continuous improvement initiatives for facility optimization'
                ],
                systemIntegration: 'Facility management system with maintenance scheduling, environmental monitoring, and space optimization'
              },
              {
                element: 'Manufacturing Equipment',
                description: 'Production equipment and tooling required for manufacturing operations',
                components: [
                  'Primary manufacturing equipment including welding, machining, and assembly systems',
                  'Material handling equipment for efficient workflow and safety',
                  'Tooling and fixtures supporting consistent product quality',
                  'Safety equipment and protective systems for personnel protection'
                ],
                requirements: [
                  'Equipment capabilities matching product requirements and quality standards',
                  'Calibration and accuracy requirements for precision manufacturing',
                  'Maintenance requirements ensuring reliable operation and safety',
                  'Operator training and competency requirements for safe and effective operation'
                ],
                maintenance: [
                  'Preventive maintenance schedules based on manufacturer recommendations and usage patterns',
                  'Predictive maintenance using condition monitoring and data analytics',
                  'Emergency repair procedures minimizing production disruptions',
                  'Equipment upgrade and replacement planning for technology advancement'
                ],
                systemIntegration: 'Equipment management system with maintenance tracking, performance monitoring, and lifecycle planning'
              },
              {
                element: 'Quality Control Equipment',
                description: 'Measurement and testing equipment supporting quality verification and validation',
                components: [
                  'Dimensional measurement equipment including coordinate measuring machines and precision instruments',
                  'Non-destructive testing equipment for material and weld inspection',
                  'Pressure testing equipment for vessel and piping system verification',
                  'Material testing equipment for chemical and mechanical property verification'
                ],
                requirements: [
                  'Measurement uncertainty appropriate for product tolerance requirements',
                  'Calibration traceability to national or international standards',
                  'Environmental controls ensuring measurement accuracy and repeatability',
                  'Operator training and certification for complex measurement systems'
                ],
                maintenance: [
                  'Calibration schedules ensuring continued accuracy and traceability',
                  'Preventive maintenance preventing measurement errors and equipment failure',
                  'Calibration record management for audit trail and compliance',
                  'Equipment validation for new or modified measurement processes'
                ],
                systemIntegration: 'Calibration management system with scheduling, record keeping, and uncertainty analysis'
              }
            ]
          }
        ]
      }
    ]
  };

  // Section 7: Support content - Part 2 (Environment, Monitoring Resources, Knowledge)
  const supportContentPart2 = [
    {
      subheading: '7.1.4 Environment for the Operation of Processes',
      text: `The organization determines, provides and maintains the environment necessary for the operation of its processes and to achieve conformity of products and services.`,
      environmentAspects: [
        {
          aspect: 'Physical Environment',
          description: 'Physical conditions and workspace design supporting quality operations',
          elements: [
            'Temperature and humidity controls maintaining optimal working conditions',
            'Lighting systems providing adequate illumination for precision work',
            'Noise control measures ensuring communication and concentration',
            'Cleanliness standards preventing contamination and ensuring product quality'
          ],
          controls: [
            'Environmental monitoring systems with automated alerts for out-of-range conditions',
            'HVAC system maintenance ensuring consistent environmental conditions',
            'Housekeeping procedures maintaining cleanliness and organization',
            'Workspace design optimization for ergonomics and efficiency'
          ],
          systemIntegration: 'Environmental monitoring system with real-time data collection and automated control systems'
        },
        {
          aspect: 'Social Environment',
          description: 'Work culture and interpersonal dynamics supporting quality excellence',
          elements: [
            'Collaborative work culture encouraging quality improvement suggestions',
            'Open communication channels supporting issue identification and resolution',
            'Recognition programs reinforcing quality-focused behaviors',
            'Team-based problem solving for complex quality challenges'
          ],
          controls: [
            'Regular team meetings and communication forums',
            'Employee feedback mechanisms and suggestion systems',
            'Conflict resolution procedures maintaining positive work relationships',
            'Leadership visibility and engagement in quality initiatives'
          ],
          systemIntegration: 'Employee engagement platform with feedback collection and recognition management'
        },
        {
          aspect: 'Psychological Environment',
          description: 'Mental and emotional factors affecting work performance and quality focus',
          elements: [
            'Stress management programs supporting employee well-being',
            'Work-life balance initiatives preventing burnout and maintaining focus',
            'Training and development opportunities building confidence and competence',
            'Clear expectations and feedback reducing uncertainty and anxiety'
          ],
          controls: [
            'Employee assistance programs providing support for personal and work-related challenges',
            'Workload management ensuring reasonable expectations and deadlines',
            'Regular performance feedback and coaching for continuous improvement',
            'Mental health awareness and support resource availability'
          ],
          systemIntegration: 'Employee wellness platform with stress monitoring and support resource management'
        }
      ]
    },
    {
      subheading: '7.1.5 Monitoring and Measuring Resources',
      text: `The organization determines and provides the resources needed to ensure valid and reliable results when monitoring or measuring is used to verify the conformity of products and services to requirements.`,
      monitoringResources: [
        {
          resourceType: 'Measurement Equipment',
          description: 'Instruments and devices used for dimensional and physical property measurement',
          equipment: [
            'Coordinate measuring machines (CMM) for precise dimensional verification',
            'Micrometers, calipers, and gauges for routine dimensional checks',
            'Surface roughness meters for finish quality verification',
            'Hardness testers for material property verification'
          ],
          requirements: [
            'Calibration traceability to national or international measurement standards',
            'Measurement uncertainty analysis ensuring fitness for intended use',
            'Environmental controls maintaining measurement accuracy',
            'Operator training and certification for complex measurement systems'
          ],
          calibrationManagement: [
            'Calibration schedules based on usage frequency and accuracy requirements',
            'Calibration procedures following recognized standards and methods',
            'Calibration records maintaining audit trail and compliance evidence',
            'Out-of-tolerance investigations and corrective action implementation'
          ],
          systemIntegration: 'Calibration management system with automated scheduling, record keeping, and uncertainty tracking'
        },
        {
          resourceType: 'Testing Equipment',
          description: 'Equipment used for material and product performance testing',
          equipment: [
            'Pressure testing systems for vessel and piping verification',
            'Non-destructive testing equipment including ultrasonic and radiographic systems',
            'Material testing machines for tensile, impact, and fatigue testing',
            'Chemical analysis equipment for material composition verification'
          ],
          requirements: [
            'Equipment validation demonstrating fitness for intended testing applications',
            'Calibration and verification using certified reference materials',
            'Operator certification and training for specialized testing methods',
            'Quality control procedures ensuring test result reliability'
          ],
          calibrationManagement: [
            'Performance verification using certified reference standards',
            'Inter-laboratory comparison programs for method validation',
            'Equipment maintenance preventing measurement errors and failures',
            'Documentation of test methods and procedures for consistency'
          ],
          systemIntegration: 'Testing equipment management system with validation tracking and result verification'
        },
        {
          resourceType: 'Monitoring Systems',
          description: 'Systems used for process monitoring and performance measurement',
          equipment: [
            'Process monitoring sensors for temperature, pressure, and flow measurement',
            'Data acquisition systems for real-time process parameter tracking',
            'Statistical process control software for trend analysis and control',
            'Performance dashboards for real-time quality metric visualization'
          ],
          requirements: [
            'Sensor accuracy and response time appropriate for process control needs',
            'Data integrity and security ensuring reliable monitoring information',
            'Alarm and alert systems providing timely notification of process deviations',
            'Integration with process control systems for automated response capabilities'
          ],
          calibrationManagement: [
            'Sensor calibration schedules ensuring continued accuracy',
            'Data validation procedures verifying measurement system performance',
            'Backup and redundancy systems preventing monitoring interruptions',
            'Regular system performance reviews and optimization'
          ],
          systemIntegration: 'Process monitoring platform with real-time data analysis and automated control integration'
        }
      ],
      measurementTraceability: {
        description: 'Systematic approach ensuring measurement traceability to international standards',
        requirements: [
          'Calibration certificates traceable to national or international standards',
          'Measurement uncertainty evaluation for all critical measurements',
          'Reference standard management ensuring continued traceability',
          'Documentation of measurement procedures and traceability chains'
        ],
        implementation: [
          'Selection of accredited calibration laboratories with appropriate scope',
          'Internal reference standard programs for routine calibration activities',
          'Measurement uncertainty budgets for all critical measurement processes',
          'Traceability documentation and record management systems'
        ],
        systemIntegration: 'Metrology management system with traceability tracking and uncertainty analysis capabilities'
      }
    },
    {
      subheading: '7.1.6 Organizational Knowledge',
      text: `The organization determines the knowledge necessary for the operation of its processes and to achieve conformity of products and services. This knowledge shall be maintained and be made available to the extent necessary.`,
      knowledgeManagement: [
        {
          knowledgeType: 'Technical Knowledge',
          description: 'Specialized technical expertise required for product design and manufacturing',
          knowledgeAreas: [
            'Pressure vessel design and ASME code requirements',
            'Welding procedures and qualification requirements',
            'Material properties and selection criteria',
            'Manufacturing processes and quality control methods'
          ],
          acquisitionMethods: [
            'Technical training programs and professional development',
            'Industry conferences and technical society participation',
            'Collaboration with customers and suppliers for knowledge sharing',
            'Research and development activities for innovation and improvement'
          ],
          preservationMethods: [
            'Technical documentation and procedure development',
            'Knowledge transfer programs and mentoring systems',
            'Expert knowledge databases and lessons learned repositories',
            'Cross-training programs ensuring knowledge redundancy'
          ],
          systemIntegration: 'Technical knowledge management platform with expert directories and knowledge repositories'
        },
        {
          knowledgeType: 'Process Knowledge',
          description: 'Understanding of business processes and their optimization',
          knowledgeAreas: [
            'Quality management system processes and interactions',
            'Manufacturing workflow optimization and efficiency improvement',
            'Customer requirement management and satisfaction enhancement',
            'Supplier management and supply chain optimization'
          ],
          acquisitionMethods: [
            'Process improvement projects and continuous improvement initiatives',
            'Benchmarking studies and best practice identification',
            'Employee suggestions and improvement idea programs',
            'External consulting and expert advisory services'
          ],
          preservationMethods: [
            'Process documentation and standard operating procedures',
            'Process improvement project databases and case studies',
            'Training programs and competency development systems',
            'Knowledge sharing forums and communities of practice'
          ],
          systemIntegration: 'Process knowledge management system with procedure libraries and improvement tracking'
        },
        {
          knowledgeType: 'Customer Knowledge',
          description: 'Understanding of customer needs, applications, and market requirements',
          knowledgeAreas: [
            'Customer application requirements and performance expectations',
            'Industry trends and market developments affecting customer needs',
            'Regulatory requirements and compliance expectations in customer markets',
            'Competitive landscape and value proposition differentiation'
          ],
          acquisitionMethods: [
            'Customer feedback collection and analysis programs',
            'Market research and industry analysis activities',
            'Customer site visits and application studies',
            'Sales and customer service team knowledge sharing'
          ],
          preservationMethods: [
            'Customer requirement databases and application guides',
            'Market intelligence reports and trend analysis documentation',
            'Customer success stories and case study development',
            'Sales training programs and customer knowledge transfer'
          ],
          systemIntegration: 'Customer knowledge management system with requirement tracking and market intelligence'
        },
        {
          knowledgeType: 'Regulatory Knowledge',
          description: 'Understanding of regulatory requirements and compliance obligations',
          knowledgeAreas: [
            'ASME Boiler and Pressure Vessel Code requirements and updates',
            'API standards and certification requirements',
            'OSHA safety regulations and workplace requirements',
            'Environmental regulations and compliance obligations'
          ],
          acquisitionMethods: [
            'Regulatory training programs and certification maintenance',
            'Industry association participation and regulatory update monitoring',
            'Regulatory agency communication and guidance interpretation',
            'Legal and compliance consulting services for complex requirements'
          ],
          preservationMethods: [
            'Regulatory compliance databases and requirement tracking systems',
            'Training materials and competency assessment programs',
            'Compliance audit findings and corrective action documentation',
            'Regulatory change management and impact assessment processes'
          ],
          systemIntegration: 'Regulatory knowledge management system with compliance tracking and update notification'
        }
      ],
      knowledgeProtection: {
        description: 'Measures to protect organizational knowledge and intellectual property',
        protectionMethods: [
          'Information security policies and access control systems',
          'Confidentiality agreements and intellectual property protection',
          'Backup and disaster recovery systems preventing knowledge loss',
          'Employee retention strategies maintaining critical knowledge resources'
        ],
        riskMitigation: [
          'Knowledge transfer programs reducing single-point-of-failure risks',
          'Documentation and knowledge capture initiatives',
          'Succession planning for critical knowledge holders',
          'External knowledge source identification and development'
        ],
        systemIntegration: 'Information security and knowledge protection platform with access control and backup systems'
      }
    }
  ];

  // Section 7: Support content - Part 3 (Competence)
  const supportContentPart3 = [
    {
      subheading: '7.2 Competence',
      text: `The organization shall determine the necessary competence of person(s) doing work under its control that affects the performance and effectiveness of the quality management system; ensure that these persons are competent on the basis of appropriate education, training, or experience; where applicable, take actions to acquire the necessary competence, and evaluate the effectiveness of the actions taken; and retain appropriate documented information as evidence of competence.`,
      competenceFramework: [
        {
          competenceArea: 'Technical Competence',
          description: 'Technical skills and knowledge required for quality-affecting work',
          competenceCategories: [
            {
              category: 'Design Engineering Competence',
              description: 'Competency requirements for design engineering personnel',
              competenceMatrix: [
                {
                  position: 'Senior Design Engineer',
                  educationRequirements: [
                    'Bachelor\'s degree in Mechanical Engineering or related field',
                    'Professional Engineer (PE) license preferred',
                    'ASME Section VIII certification for pressure vessel design',
                    'Continuing education in design codes and standards'
                  ],
                  experienceRequirements: [
                    'Minimum 7 years pressure vessel design experience',
                    'Experience with ASME Boiler and Pressure Vessel Code',
                    'Demonstrated expertise in finite element analysis',
                    'Previous experience with customer specification interpretation'
                  ],
                  skillRequirements: [
                    'Proficiency in CAD software (SolidWorks, AutoCAD)',
                    'Advanced knowledge of materials selection and properties',
                    'Understanding of manufacturing processes and constraints',
                    'Strong analytical and problem-solving capabilities'
                  ],
                  competenceAssessment: [
                    'Design portfolio review and technical interview',
                    'Practical design exercise with code compliance verification',
                    'Peer review of completed design projects',
                    'Annual competence review with continuing education verification'
                  ],
                  systemIntegration: 'Competency management system with skill matrices and assessment tracking'
                },
                {
                  position: 'Design Engineer',
                  educationRequirements: [
                    'Bachelor\'s degree in Mechanical Engineering or related field',
                    'ASME training certificates in applicable code sections',
                    'CAD software certification',
                    'Professional development in engineering fundamentals'
                  ],
                  experienceRequirements: [
                    'Minimum 3 years engineering design experience',
                    'Experience with pressure vessel or similar equipment design',
                    'Understanding of manufacturing processes',
                    'Customer interaction and requirement interpretation experience'
                  ],
                  skillRequirements: [
                    'Proficiency in engineering analysis and calculations',
                    'Understanding of design codes and standards',
                    'Basic knowledge of materials and manufacturing processes',
                    'Communication skills for customer and manufacturing interface'
                  ],
                  competenceAssessment: [
                    'Technical interview with design scenarios',
                    'Review of previous design work and calculations',
                    'Mentored project completion with senior engineer oversight',
                    'Quarterly competence review and development planning'
                  ],
                  systemIntegration: 'Training management system with competency progression tracking'
                }
              ]
            },
            {
              category: 'Manufacturing Competence',
              description: 'Competency requirements for manufacturing and production personnel',
              competenceMatrix: [
                {
                  position: 'Certified Welder',
                  educationRequirements: [
                    'High school diploma or equivalent',
                    'Formal welding training program completion',
                    'ASME Section IX welder qualification',
                    'Continuing education in welding technology'
                  ],
                  experienceRequirements: [
                    'Minimum 2 years welding experience in pressure vessel fabrication',
                    'Experience with multiple welding processes (GTAW, SMAW, FCAW)',
                    'Understanding of welding procedure specifications (WPS)',
                    'Experience with material handling and preparation'
                  ],
                  skillRequirements: [
                    'Demonstrated welding skill across qualified processes',
                    'Ability to read and interpret welding symbols and drawings',
                    'Understanding of material properties and heat treatment',
                    'Quality consciousness and attention to detail'
                  ],
                  competenceAssessment: [
                    'Welding qualification tests per ASME Section IX',
                    'Practical welding assessment with quality evaluation',
                    'Written examination on welding procedures and safety',
                    'Semi-annual re-qualification testing'
                  ],
                  systemIntegration: 'Welder qualification management system with test tracking and renewal scheduling'
                },
                {
                  position: 'Quality Control Inspector',
                  educationRequirements: [
                    'High school diploma with technical training preferred',
                    'NDT certification in applicable methods (PT, MT, UT, RT)',
                    'Quality inspection training and certification',
                    'Metrology and measurement training'
                  ],
                  experienceRequirements: [
                    'Minimum 3 years quality inspection experience',
                    'Experience with pressure vessel inspection requirements',
                    'Understanding of ASME code inspection requirements',
                    'Experience with inspection documentation and reporting'
                  ],
                  skillRequirements: [
                    'Proficiency in dimensional measurement techniques',
                    'Ability to interpret drawings, specifications, and standards',
                    'Understanding of manufacturing processes and quality requirements',
                    'Strong documentation and communication skills'
                  ],
                  competenceAssessment: [
                    'NDT certification testing and practical examination',
                    'Measurement uncertainty assessment and capability study',
                    'Inspection procedure knowledge verification',
                    'Annual competence review with recertification tracking'
                  ],
                  systemIntegration: 'Inspector certification management system with competency tracking and renewal alerts'
                }
              ]
            }
          ]
        },
        {
          competenceArea: 'Quality System Competence',
          description: 'Knowledge and skills related to quality management system operation',
          competenceCategories: [
            {
              category: 'Quality Management Competence',
              description: 'Competency requirements for quality management personnel',
              competenceMatrix: [
                {
                  position: 'Quality Manager',
                  educationRequirements: [
                    'Bachelor\'s degree in Engineering, Quality, or related field',
                    'Certified Quality Manager (CQM) or equivalent certification',
                    'ISO 9001 Lead Auditor certification',
                    'Continuing education in quality management principles'
                  ],
                  experienceRequirements: [
                    'Minimum 7 years quality management experience',
                    'Experience with ISO 9001 implementation and maintenance',
                    'Leadership experience in quality improvement initiatives',
                    'Experience with regulatory compliance and customer audits'
                  ],
                  skillRequirements: [
                    'Comprehensive understanding of quality management principles',
                    'Leadership and communication skills',
                    'Statistical analysis and problem-solving capabilities',
                    'Change management and continuous improvement expertise'
                  ],
                  competenceAssessment: [
                    'Professional certification verification and maintenance',
                    'Leadership assessment through 360-degree feedback',
                    'Quality system effectiveness evaluation',
                    'Annual performance review with quality metric assessment'
                  ],
                  systemIntegration: 'Leadership competency system with performance tracking and development planning'
                },
                {
                  position: 'Internal Auditor',
                  educationRequirements: [
                    'Technical degree or equivalent experience',
                    'ISO 9001 Internal Auditor training and certification',
                    'Auditing techniques and methodology training',
                    'Industry-specific standards knowledge'
                  ],
                  experienceRequirements: [
                    'Minimum 2 years experience in quality or operations',
                    'Understanding of business processes and quality requirements',
                    'Experience with audit planning and execution',
                    'Knowledge of corrective action and improvement processes'
                  ],
                  skillRequirements: [
                    'Analytical and investigative skills',
                    'Communication and interpersonal skills',
                    'Understanding of audit principles and techniques',
                    'Report writing and documentation capabilities'
                  ],
                  competenceAssessment: [
                    'Auditor certification examination and practical assessment',
                    'Witnessed audit performance evaluation',
                    'Audit report quality and effectiveness review',
                    'Annual auditor competence review and refresher training'
                  ],
                  systemIntegration: 'Auditor competency system with performance tracking and certification management'
                }
              ]
            }
          ]
        },
        {
          competenceArea: 'Leadership and Management Competence',
          description: 'Leadership skills and management capabilities for quality-affecting roles',
          competenceCategories: [
            {
              category: 'Supervisory Competence',
              description: 'Competency requirements for supervisory and management positions',
              competenceMatrix: [
                {
                  position: 'Production Supervisor',
                  educationRequirements: [
                    'Technical degree or equivalent industry experience',
                    'Supervisory training and leadership development',
                    'Safety management and OSHA compliance training',
                    'Quality system awareness and implementation training'
                  ],
                  experienceRequirements: [
                    'Minimum 5 years production or manufacturing experience',
                    'Previous supervisory or lead person experience',
                    'Understanding of production planning and scheduling',
                    'Experience with quality control and improvement processes'
                  ],
                  skillRequirements: [
                    'Leadership and team management capabilities',
                    'Communication and conflict resolution skills',
                    'Understanding of production processes and quality requirements',
                    'Problem-solving and decision-making abilities'
                  ],
                  competenceAssessment: [
                    'Leadership assessment through team feedback and observation',
                    'Management scenario evaluation and decision-making assessment',
                    'Quality and safety performance review',
                    'Annual performance review with development planning'
                  ],
                  systemIntegration: 'Leadership development system with competency tracking and succession planning'
                }
              ]
            }
          ]
        }
      ],
      competenceDevelopment: {
        description: 'Systematic approach to competence development and maintenance',
        developmentProcess: [
          {
            stage: 'Competence Identification',
            description: 'Identifying required competencies for quality-affecting positions',
            activities: [
              'Job analysis and competency profiling for all positions',
              'Competency matrix development with measurable criteria',
              'Gap analysis comparing current vs. required competencies',
              'Competency requirement documentation and approval'
            ],
            outputs: [
              'Position-specific competency requirements',
              'Competency assessment criteria and methods',
              'Competency gap analysis reports',
              'Training and development needs identification'
            ],
            systemIntegration: 'Competency management system with job profiling and gap analysis capabilities'
          },
          {
            stage: 'Competence Acquisition',
            description: 'Acquiring necessary competencies through training and development',
            activities: [
              'Individual development planning based on competency gaps',
              'Training program design and delivery',
              'External training and certification coordination',
              'Mentoring and on-the-job training programs'
            ],
            outputs: [
              'Individual development plans with specific objectives',
              'Training completion records and certificates',
              'Competency assessment results',
              'Progress tracking and performance improvement'
            ],
            systemIntegration: 'Learning management system with training delivery and progress tracking'
          },
          {
            stage: 'Competence Evaluation',
            description: 'Evaluating the effectiveness of competence development actions',
            activities: [
              'Competency assessment and testing',
              'Performance observation and evaluation',
              'Training effectiveness measurement',
              'Continuous improvement of competency programs'
            ],
            outputs: [
              'Competency assessment reports',
              'Training effectiveness analysis',
              'Performance improvement documentation',
              'Competency program optimization recommendations'
            ],
            systemIntegration: 'Assessment management system with evaluation tracking and effectiveness analysis'
          }
        ]
      },
      competenceRecords: {
        description: 'Documentation and record keeping for competence management',
        recordTypes: [
          {
            recordType: 'Education Records',
            description: 'Documentation of formal education and degrees',
            requirements: [
              'Degree certificates and transcripts',
              'Professional certifications and licenses',
              'Continuing education credits and certificates',
              'Professional development activity records'
            ],
            maintenance: [
              'Annual verification of current certifications',
              'Renewal tracking for time-limited certifications',
              'Continuing education requirement tracking',
              'Professional development planning and review'
            ],
            systemIntegration: 'Credential management system with verification and renewal tracking'
          },
          {
            recordType: 'Training Records',
            description: 'Documentation of internal and external training completion',
            requirements: [
              'Training program completion certificates',
              'Competency assessment results',
              'On-the-job training documentation',
              'Training effectiveness evaluation results'
            ],
            maintenance: [
              'Training database updates and accuracy verification',
              'Retraining schedule management',
              'Training effectiveness monitoring',
              'Training program continuous improvement'
            ],
            systemIntegration: 'Training management system with completion tracking and effectiveness measurement'
          },
          {
            recordType: 'Experience Records',
            description: 'Documentation of relevant work experience and performance',
            requirements: [
              'Employment history and position descriptions',
              'Performance evaluation records',
              'Project participation and achievement documentation',
              'Skills demonstration and practical assessment results'
            ],
            maintenance: [
              'Annual performance review documentation',
              'Experience verification and validation',
              'Skills assessment and update tracking',
              'Career development and progression planning'
            ],
            systemIntegration: 'Performance management system with experience tracking and career development planning'
          }
        ]
      }
    }
  ];

  // Section 7: Support content - Part 4 (Awareness)
  const supportContentPart4 = [
    {
      subheading: '7.3 Awareness',
      text: `The organization shall ensure that persons doing work under the organization's control are aware of the quality policy; relevant quality objectives; their contribution to the effectiveness of the quality management system, including the benefits of improved performance; and the implications of not conforming with the quality management system requirements.`,
      awarenessProgram: [
        {
          awarenessArea: 'Quality Policy Awareness',
          description: 'Ensuring comprehensive understanding of the organization\'s quality policy throughout all levels',
          awarenessElements: [
            {
              element: 'Policy Communication',
              description: 'Multi-channel approach to quality policy communication and understanding',
              communicationMethods: [
                'New employee orientation programs with quality policy introduction',
                'Annual quality policy review sessions for all personnel',
                'Visual displays and posters in work areas highlighting key policy elements',
                'Digital platforms and intranet systems for policy access and updates'
              ],
              verificationMethods: [
                'Policy understanding assessments during orientation',
                'Random knowledge checks through informal discussions',
                'Annual employee surveys measuring policy awareness levels',
                'Management walkabouts with policy discussion integration'
              ],
              effectivenessMeasures: [
                'Percentage of employees demonstrating policy understanding in assessments',
                'Quality policy reference frequency in daily work activities',
                'Employee feedback scores on policy clarity and relevance',
                'Integration of policy principles in decision-making processes'
              ],
              systemIntegration: 'Learning management system with policy awareness tracking and assessment capabilities'
            },
            {
              element: 'Policy Application',
              description: 'Practical application of quality policy principles in daily work activities',
              applicationMethods: [
                'Department-specific policy interpretation sessions',
                'Case study discussions relating policy to actual work situations',
                'Policy-based decision-making frameworks and tools',
                'Regular reinforcement through team meetings and communications'
              ],
              verificationMethods: [
                'Observation of policy-based decision making in work activities',
                'Review of documented decisions for policy alignment',
                'Employee self-assessment of policy application in their roles',
                'Supervisor evaluation of policy integration in work performance'
              ],
              effectivenessMeasures: [
                'Frequency of policy references in work-related decisions',
                'Alignment between policy statements and actual work practices',
                'Employee confidence in applying policy principles',
                'Reduction in policy-related non-conformances'
              ],
              systemIntegration: 'Performance management system with policy application tracking and evaluation'
            }
          ]
        },
        {
          awarenessArea: 'Quality Objectives Awareness',
          description: 'Ensuring understanding of relevant quality objectives and their connection to individual roles',
          awarenessElements: [
            {
              element: 'Objective Understanding',
              description: 'Comprehensive understanding of organizational and departmental quality objectives',
              communicationMethods: [
                'Quality objective cascade sessions from organizational to individual level',
                'Visual management systems displaying current objectives and progress',
                'Regular department meetings with objective review and discussion',
                'Individual performance planning sessions linking personal goals to quality objectives'
              ],
              verificationMethods: [
                'Individual understanding assessments for relevant quality objectives',
                'Team discussions evaluating objective comprehension',
                'Performance review sessions including objective understanding evaluation',
                'Objective-related question integration in regular one-on-one meetings'
              ],
              effectivenessMeasures: [
                'Percentage of employees able to articulate relevant quality objectives',
                'Accuracy of objective understanding across different organizational levels',
                'Employee engagement scores related to objective awareness',
                'Frequency of objective-related discussions in daily work activities'
              ],
              systemIntegration: 'Performance management system with objective communication and understanding tracking'
            },
            {
              element: 'Individual Contribution',
              description: 'Understanding how individual roles contribute to quality objective achievement',
              communicationMethods: [
                'Role-specific objective contribution mapping and communication',
                'Success story sharing highlighting individual contributions to objectives',
                'Regular feedback sessions on individual performance impact on objectives',
                'Team collaboration sessions demonstrating collective contribution to objectives'
              ],
              verificationMethods: [
                'Individual contribution assessment through performance discussions',
                'Self-evaluation of personal impact on quality objective achievement',
                'Peer feedback on collaborative contributions to objective success',
                'Supervisor evaluation of individual contribution understanding'
              ],
              effectivenessMeasures: [
                'Employee ability to describe their specific contribution to quality objectives',
                'Alignment between individual activities and objective achievement',
                'Employee motivation levels related to objective contribution',
                'Frequency of proactive actions supporting objective achievement'
              ],
              systemIntegration: 'Goal management system with individual contribution tracking and impact analysis'
            }
          ]
        },
        {
          awarenessArea: 'Quality Management System Effectiveness',
          description: 'Understanding of QMS benefits and the importance of individual contributions to system effectiveness',
          awarenessElements: [
            {
              element: 'System Benefits Understanding',
              description: 'Awareness of quality management system benefits for customers, organization, and individuals',
              communicationMethods: [
                'QMS benefit communication through success stories and case studies',
                'Customer feedback sharing demonstrating QMS value and impact',
                'Training sessions on QMS principles and their practical benefits',
                'Regular communication of quality achievements and improvements'
              ],
              verificationMethods: [
                'Employee understanding assessment of QMS benefits',
                'Discussion sessions evaluating benefit comprehension',
                'Survey feedback on perceived value of quality management activities',
                'Observation of QMS principle application in daily work'
              ],
              effectivenessMeasures: [
                'Employee ability to articulate QMS benefits for different stakeholders',
                'Positive perception scores regarding QMS value and importance',
                'Voluntary participation in quality improvement initiatives',
                'Proactive identification and reporting of quality improvement opportunities'
              ],
              systemIntegration: 'Quality management platform with benefit communication and understanding measurement'
            },
            {
              element: 'Performance Improvement Benefits',
              description: 'Understanding how improved performance benefits individuals, teams, and the organization',
              communicationMethods: [
                'Performance improvement success story communication and celebration',
                'Training on the connection between individual performance and organizational success',
                'Regular sharing of performance metrics and improvement achievements',
                'Recognition programs highlighting performance improvement contributions'
              ],
              verificationMethods: [
                'Employee understanding assessment of performance improvement benefits',
                'Self-reflection exercises on personal performance improvement impact',
                'Team discussions on collective performance improvement achievements',
                'Performance review sessions including improvement benefit discussion'
              ],
              effectivenessMeasures: [
                'Employee motivation for continuous performance improvement',
                'Frequency of improvement suggestions and initiatives from employees',
                'Positive correlation between performance improvement and employee satisfaction',
                'Reduction in resistance to change and improvement initiatives'
              ],
              systemIntegration: 'Performance improvement system with benefit tracking and communication management'
            }
          ]
        },
        {
          awarenessArea: 'Non-Conformance Implications',
          description: 'Understanding the consequences and implications of not conforming to QMS requirements',
          awarenessElements: [
            {
              element: 'Customer Impact Awareness',
              description: 'Understanding how non-conformances affect customer satisfaction and business relationships',
              communicationMethods: [
                'Case study presentations on customer impact from quality issues',
                'Customer complaint and feedback sharing with relevant personnel',
                'Training on the connection between individual work quality and customer satisfaction',
                'Regular communication of customer quality requirements and expectations'
              ],
              verificationMethods: [
                'Employee understanding assessment of customer impact from non-conformances',
                'Discussion sessions on customer quality requirements and expectations',
                'Role-playing exercises demonstrating customer impact scenarios',
                'Customer-focused thinking evaluation in work activities'
              ],
              effectivenessMeasures: [
                'Employee ability to describe customer impact from quality issues',
                'Increased customer-focused behavior and decision making',
                'Proactive customer quality concern identification and escalation',
                'Reduction in customer quality complaints and issues'
              ],
              systemIntegration: 'Customer feedback system with impact communication and awareness tracking'
            },
            {
              element: 'Business Impact Awareness',
              description: 'Understanding business consequences of non-conformances including costs, reputation, and compliance',
              communicationMethods: [
                'Business impact training including cost of quality and non-conformance',
                'Company performance sharing highlighting quality impact on business results',
                'Regulatory compliance training emphasizing non-conformance consequences',
                'Market reputation and competitive advantage communication related to quality'
              ],
              verificationMethods: [
                'Employee understanding assessment of business impact from non-conformances',
                'Business impact discussion integration in team meetings',
                'Cost of quality awareness evaluation through informal assessments',
                'Business-focused thinking evaluation in problem-solving activities'
              ],
              effectivenessMeasures: [
                'Employee ability to articulate business consequences of quality issues',
                'Increased business-focused decision making in quality-related activities',
                'Proactive cost and risk consideration in quality decisions',
                'Reduction in business impact from quality non-conformances'
              ],
              systemIntegration: 'Business intelligence system with quality impact tracking and communication'
            },
            {
              element: 'Personal Accountability Awareness',
              description: 'Understanding individual responsibility and accountability for quality conformance',
              communicationMethods: [
                'Personal accountability training emphasizing individual responsibility for quality',
                'Role clarification sessions defining quality responsibilities for each position',
                'Accountability framework communication with clear expectations and consequences',
                'Recognition and consequence system communication for quality performance'
              ],
              verificationMethods: [
                'Individual accountability understanding assessment through discussions',
                'Self-assessment of personal responsibility for quality outcomes',
                'Peer feedback on accountability demonstration in work activities',
                'Supervisor evaluation of accountability behavior and attitude'
              ],
              effectivenessMeasures: [
                'Employee demonstration of personal accountability for quality outcomes',
                'Proactive quality issue identification and resolution by individuals',
                'Reduced quality issues attributable to individual performance',
                'Increased ownership and responsibility in quality-related decisions'
              ],
              systemIntegration: 'Accountability management system with personal responsibility tracking and evaluation'
            }
          ]
        }
      ],
      awarenessDelivery: {
        description: 'Systematic approach to delivering and maintaining quality awareness throughout the organization',
        deliveryMethods: [
          {
            method: 'Initial Awareness Training',
            description: 'Comprehensive awareness training for new employees and existing personnel',
            components: [
              'New employee orientation program with quality awareness module',
              'Job-specific quality awareness training based on role requirements',
              'Interactive training sessions with real-world examples and scenarios',
              'Assessment and verification of awareness understanding and application'
            ],
            frequency: 'Upon hire, role change, or significant QMS updates',
            duration: '2-4 hours depending on role complexity and responsibilities',
            deliveryFormat: 'Combination of classroom training, online modules, and practical exercises',
            systemIntegration: 'Learning management system with training delivery and completion tracking'
          },
          {
            method: 'Ongoing Awareness Reinforcement',
            description: 'Continuous reinforcement of quality awareness through regular communication and activities',
            components: [
              'Monthly team meetings with quality awareness topic integration',
              'Quarterly awareness campaigns focusing on specific quality themes',
              'Annual awareness assessment and refresher training',
              'Just-in-time awareness communication for process changes and updates'
            ],
            frequency: 'Monthly team meetings, quarterly campaigns, annual assessments',
            duration: '15-30 minutes for regular reinforcement, 1-2 hours for annual refresher',
            deliveryFormat: 'Team meetings, digital communications, workshops, and interactive sessions',
            systemIntegration: 'Communication platform with awareness campaign management and tracking'
          },
          {
            method: 'Visual Awareness Systems',
            description: 'Visual management systems supporting continuous quality awareness reinforcement',
            components: [
              'Quality policy and objective displays in work areas',
              'Process performance dashboards with quality metrics',
              'Quality improvement project communication boards',
              'Safety and quality reminder signage at critical work points'
            ],
            frequency: 'Continuous display with monthly updates and refreshment',
            duration: 'Continuous exposure with brief daily interaction',
            deliveryFormat: 'Physical displays, digital screens, and workplace signage',
            systemIntegration: 'Digital signage system with content management and scheduling'
          }
        ]
      },
      awarenessAssessment: {
        description: 'Systematic assessment of awareness effectiveness and continuous improvement',
        assessmentMethods: [
          {
            method: 'Knowledge Assessment',
            description: 'Formal assessment of quality awareness knowledge and understanding',
            assessmentTools: [
              'Written assessments covering quality policy, objectives, and system benefits',
              'Practical scenarios testing application of quality awareness in work situations',
              'Verbal assessments through structured interviews and discussions',
              'Peer assessment and feedback on quality awareness demonstration'
            ],
            frequency: 'Annual formal assessments with quarterly informal checks',
            criteria: 'Understanding of quality policy, objectives, system benefits, and non-conformance implications',
            passingStandard: 'Minimum 80% score on formal assessments and satisfactory demonstration in practical scenarios',
            systemIntegration: 'Assessment management system with result tracking and improvement planning'
          },
          {
            method: 'Behavioral Assessment',
            description: 'Assessment of quality awareness demonstration through behavior and work activities',
            assessmentTools: [
              'Workplace observation of quality-focused behavior and decision making',
              'Performance evaluation including quality awareness and application',
              'Customer feedback analysis for quality awareness impact on service delivery',
              'Quality improvement participation and contribution evaluation'
            ],
            frequency: 'Ongoing observation with formal evaluation during annual performance reviews',
            criteria: 'Demonstration of quality awareness in daily work, decision making, and problem solving',
            passingStandard: 'Consistent demonstration of quality awareness in work activities and positive performance evaluation',
            systemIntegration: 'Performance management system with behavioral assessment and tracking capabilities'
          }
        ]
      }
    }
  ];

  // Section 7: Support content - Part 5 (Communication)
  const supportContentPart5 = [
    {
      subheading: '7.4 Communication',
      text: `The organization shall determine the internal and external communications relevant to the quality management system, including on what it will communicate; when to communicate; with whom to communicate; how to communicate; and who communicates.`,
      communicationFramework: [
        {
          communicationType: 'Internal Communication',
          description: 'Systematic approach to internal communication supporting quality management system effectiveness',
          communicationElements: [
            {
              element: 'Quality Policy and Objectives Communication',
              description: 'Communication of quality policy, objectives, and their relevance to organizational roles',
              communicationDetails: {
                whatToCommunicate: [
                  'Quality policy statement and its implications for daily work',
                  'Quality objectives and their connection to individual performance',
                  'Quality policy and objective updates and revisions',
                  'Success stories demonstrating policy and objective achievement'
                ],
                whenToCommunicate: [
                  'During new employee orientation and onboarding',
                  'At the beginning of each fiscal year for objective updates',
                  'Immediately following policy or objective revisions',
                  'Quarterly during performance review cycles'
                ],
                withWhomToCommunicate: [
                  'All employees at appropriate organizational levels',
                  'Management team for policy implementation guidance',
                  'Department heads for objective cascade and implementation',
                  'Team leaders for daily work integration and reinforcement'
                ],
                howToCommunicate: [
                  'Face-to-face presentations and interactive sessions',
                  'Digital communications through intranet and email systems',
                  'Visual displays and posters in work areas',
                  'Team meetings and departmental communications'
                ],
                whoCommunicates: [
                  'Top management for policy communication and endorsement',
                  'Quality Manager for detailed explanation and implementation guidance',
                  'Department managers for departmental objective communication',
                  'Supervisors for daily work integration and reinforcement'
                ],
                systemIntegration: 'Communication management system with message tracking and engagement measurement'
              }
            },
            {
              element: 'Process and Procedure Communication',
              description: 'Communication of quality management system processes, procedures, and work instructions',
              communicationDetails: {
                whatToCommunicate: [
                  'Quality management system process descriptions and interactions',
                  'Work procedures and instructions for quality-affecting activities',
                  'Process changes, updates, and improvement implementations',
                  'Process performance results and improvement opportunities'
                ],
                whenToCommunicate: [
                  'During initial training and competency development',
                  'Prior to implementation of process changes and updates',
                  'Following process audits and improvement initiatives',
                  'During regular process review and optimization cycles'
                ],
                withWhomToCommunicate: [
                  'Process owners and operators directly involved in quality activities',
                  'Support personnel whose work affects process performance',
                  'Management team for process oversight and decision making',
                  'Quality team for process compliance and improvement coordination'
                ],
                howToCommunicate: [
                  'Training sessions and hands-on demonstrations',
                  'Written procedures and visual work instructions',
                  'Process mapping and workflow documentation',
                  'Electronic procedure management systems with version control'
                ],
                whoCommunicates: [
                  'Process owners for detailed process knowledge and requirements',
                  'Quality Manager for compliance requirements and standards',
                  'Training coordinators for skill development and competency building',
                  'Subject matter experts for technical guidance and support'
                ],
                systemIntegration: 'Document management system with version control and change notification'
              }
            },
            {
              element: 'Performance and Quality Results Communication',
              description: 'Communication of quality performance, metrics, and improvement results',
              communicationDetails: {
                whatToCommunicate: [
                  'Quality performance metrics and key performance indicators',
                  'Customer satisfaction results and feedback analysis',
                  'Internal audit findings and corrective action progress',
                  'Quality improvement project results and achievements'
                ],
                whenToCommunicate: [
                  'Monthly through performance dashboards and reports',
                  'Quarterly during management review and business planning cycles',
                  'Immediately following significant quality events or achievements',
                  'Annually during comprehensive quality system review'
                ],
                withWhomToCommunicate: [
                  'Management team for strategic decision making and resource allocation',
                  'Department heads for operational performance management',
                  'All employees for awareness and engagement in quality improvement',
                  'Quality team for detailed analysis and improvement planning'
                ],
                howToCommunicate: [
                  'Performance dashboards and visual management systems',
                  'Formal reports and presentation materials',
                  'Team meetings and departmental communications',
                  'Digital platforms and real-time monitoring systems'
                ],
                whoCommunicates: [
                  'Quality Manager for overall quality system performance',
                  'Process owners for specific process performance results',
                  'Data analysts for metric analysis and trend identification',
                  'Management team for strategic performance communication'
                ],
                systemIntegration: 'Performance management system with real-time reporting and analytics'
              }
            },
            {
              element: 'Change and Improvement Communication',
              description: 'Communication of quality system changes, improvements, and continuous improvement initiatives',
              communicationDetails: {
                whatToCommunicate: [
                  'Planned quality system changes and their rationale',
                  'Improvement initiatives and their expected benefits',
                  'Change implementation timelines and affected processes',
                  'Training and support resources for change implementation'
                ],
                whenToCommunicate: [
                  'During change planning and preparation phases',
                  'Prior to change implementation and go-live activities',
                  'Throughout change implementation for progress updates',
                  'Following change completion for results and lessons learned'
                ],
                withWhomToCommunicate: [
                  'Affected employees and stakeholders for change preparation',
                  'Management team for change approval and resource allocation',
                  'Change champions and team leaders for implementation support',
                  'Training coordinators for skill development and competency updates'
                ],
                howToCommunicate: [
                  'Change communication meetings and information sessions',
                  'Written change notifications and implementation guides',
                  'Training programs and competency development sessions',
                  'Progress updates through multiple communication channels'
                ],
                whoCommunicates: [
                  'Change managers for overall change coordination and communication',
                  'Process owners for technical change details and requirements',
                  'Quality Manager for quality system impact and compliance',
                  'Training coordinators for competency development and support'
                ],
                systemIntegration: 'Change management system with communication planning and tracking'
              }
            }
          ]
        },
        {
          communicationType: 'External Communication',
          description: 'Systematic approach to external communication with customers, suppliers, regulatory bodies, and other stakeholders',
          communicationElements: [
            {
              element: 'Customer Communication',
              description: 'Communication with customers regarding quality requirements, performance, and service delivery',
              communicationDetails: {
                whatToCommunicate: [
                  'Quality policy and commitment to customer satisfaction',
                  'Product specifications, quality standards, and compliance certifications',
                  'Quality performance results and improvement initiatives',
                  'Quality issues, corrective actions, and preventive measures'
                ],
                whenToCommunicate: [
                  'During initial customer engagement and contract negotiation',
                  'Regularly through scheduled quality review meetings',
                  'Immediately upon identification of quality issues or concerns',
                  'Following completion of quality improvement projects'
                ],
                withWhomToCommunicate: [
                  'Customer quality representatives and technical personnel',
                  'Customer management team for strategic quality discussions',
                  'Customer operations personnel for day-to-day quality coordination',
                  'Customer audit teams during quality system assessments'
                ],
                howToCommunicate: [
                  'Formal quality agreements and specification documents',
                  'Regular quality reports and performance dashboards',
                  'Quality review meetings and technical discussions',
                  'Electronic communication systems and customer portals'
                ],
                whoCommunicates: [
                  'Sales team for initial quality commitments and requirements',
                  'Quality Manager for quality system and compliance communication',
                  'Technical team for product specifications and quality standards',
                  'Customer service team for ongoing quality coordination'
                ],
                systemIntegration: 'Customer relationship management system with quality communication tracking'
              }
            },
            {
              element: 'Supplier Communication',
              description: 'Communication with suppliers regarding quality requirements, performance expectations, and improvement initiatives',
              communicationDetails: {
                whatToCommunicate: [
                  'Quality requirements and specifications for supplied products and services',
                  'Quality standards, procedures, and compliance expectations',
                  'Supplier quality performance results and improvement opportunities',
                  'Quality training and development requirements for supplier personnel'
                ],
                whenToCommunicate: [
                  'During supplier selection and qualification processes',
                  'Regularly through supplier performance review cycles',
                  'Following supplier audits and quality assessments',
                  'When quality issues or improvement opportunities are identified'
                ],
                withWhomToCommunicate: [
                  'Supplier quality managers and technical personnel',
                  'Supplier management team for quality commitment and resources',
                  'Supplier operations personnel for quality implementation',
                  'Supplier training coordinators for competency development'
                ],
                howToCommunicate: [
                  'Supplier quality agreements and specification documents',
                  'Regular supplier quality reports and scorecards',
                  'Supplier quality review meetings and assessments',
                  'Training programs and competency development sessions'
                ],
                whoCommunicates: [
                  'Procurement team for quality requirements and supplier selection',
                  'Quality Manager for quality standards and compliance requirements',
                  'Technical team for product specifications and quality expectations',
                  'Supplier quality representatives for ongoing quality coordination'
                ],
                systemIntegration: 'Supplier management system with quality performance tracking and communication'
              }
            },
            {
              element: 'Regulatory and Compliance Communication',
              description: 'Communication with regulatory bodies, certification agencies, and compliance organizations',
              communicationDetails: {
                whatToCommunicate: [
                  'Quality management system documentation and compliance evidence',
                  'Quality performance results and continuous improvement initiatives',
                  'Non-conformance reports and corrective action implementations',
                  'Quality system changes and their impact on compliance requirements'
                ],
                whenToCommunicate: [
                  'During scheduled regulatory inspections and audits',
                  'Following significant quality system changes or updates',
                  'When reporting quality incidents or non-conformances',
                  'During certification and recertification processes'
                ],
                withWhomToCommunicate: [
                  'Regulatory inspectors and compliance auditors',
                  'Certification body representatives and technical experts',
                  'Industry association representatives and standards committees',
                  'Legal and compliance advisors for regulatory guidance'
                ],
                howToCommunicate: [
                  'Formal compliance reports and documentation packages',
                  'Regulatory submission systems and electronic portals',
                  'Compliance meetings and inspection presentations',
                  'Written correspondence and official notifications'
                ],
                whoCommunicates: [
                  'Quality Manager for overall compliance communication and coordination',
                  'Regulatory affairs specialist for specific regulatory requirements',
                  'Technical experts for detailed compliance documentation',
                  'Management team for strategic compliance decisions and commitments'
                ],
                systemIntegration: 'Compliance management system with regulatory communication tracking and documentation'
              }
            }
          ]
        }
      ],
      communicationPlanning: {
        description: 'Systematic approach to communication planning ensuring effective and timely quality-related communication',
        planningElements: [
          {
            element: 'Communication Strategy Development',
            description: 'Development of comprehensive communication strategies for quality management system',
            planningActivities: [
              'Stakeholder analysis and communication needs assessment',
              'Communication objective setting and success criteria definition',
              'Message development and content planning for different audiences',
              'Communication channel selection and resource allocation'
            ],
            planningOutputs: [
              'Communication strategy document with objectives and approaches',
              'Stakeholder communication matrix with requirements and preferences',
              'Message templates and content libraries for consistent communication',
              'Communication schedule and resource allocation plans'
            ],
            systemIntegration: 'Strategic planning system with communication strategy development and tracking'
          },
          {
            element: 'Communication Implementation Planning',
            description: 'Detailed planning for communication implementation and execution',
            planningActivities: [
              'Communication timeline development and milestone setting',
              'Resource allocation and responsibility assignment for communication activities',
              'Communication system and technology setup and configuration',
              'Training and competency development for communication personnel'
            ],
            planningOutputs: [
              'Communication implementation plan with timelines and responsibilities',
              'Resource allocation and budget plans for communication activities',
              'Communication system configuration and user access management',
              'Training plans and competency requirements for communication roles'
            ],
            systemIntegration: 'Project management system with communication implementation tracking and resource management'
          },
          {
            element: 'Communication Effectiveness Monitoring',
            description: 'Monitoring and measurement of communication effectiveness and impact',
            planningActivities: [
              'Communication effectiveness metrics development and baseline establishment',
              'Feedback collection system design and implementation',
              'Communication impact assessment and analysis procedures',
              'Communication improvement planning and implementation processes'
            ],
            planningOutputs: [
              'Communication effectiveness measurement framework and metrics',
              'Feedback collection procedures and analysis methodologies',
              'Communication assessment reports and improvement recommendations',
              'Communication optimization plans and implementation schedules'
            ],
            systemIntegration: 'Analytics platform with communication effectiveness measurement and improvement tracking'
          }
        ]
      }
    }
  ];

  // Section 7: Support content - Part 6 (Documented Information)
  const supportContentPart6 = [
    {
      subheading: '7.5 Documented Information',
      text: `The organization shall control documented information required by the quality management system and by ISO 9001:2015. Documented information required by the quality management system shall be controlled to ensure it is available and suitable for use, where and when it is needed, and adequately protected.`,
      documentedInformationFramework: [
        {
          informationType: 'Document Control',
          description: 'Systematic control of quality management system documents ensuring current, accurate, and accessible information',
          controlElements: [
            {
              element: 'Document Identification and Classification',
              description: 'Systematic identification, classification, and categorization of quality management system documents',
              controlDetails: {
                identificationRequirements: [
                  'Unique document identification numbers and version control',
                  'Document title, purpose, and scope clearly defined',
                  'Document type classification (policy, procedure, work instruction, form)',
                  'Document owner and approval authority identification'
                ],
                classificationSystem: [
                  'Level 1: Quality policies and strategic documents',
                  'Level 2: Core process procedures and system documentation',
                  'Level 3: Work instructions and operational procedures',
                  'Level 4: Forms, templates, and reference materials'
                ],
                versionControl: [
                  'Sequential version numbering with change documentation',
                  'Revision history tracking with change rationale',
                  'Approval workflow for document updates and revisions',
                  'Superseded document archival and retention procedures'
                ],
                accessControl: [
                  'Role-based access permissions and security controls',
                  'Distribution lists and controlled copy management',
                  'External document access protocols and restrictions',
                  'Confidentiality classifications and handling procedures'
                ],
                systemIntegration: 'Document management system with automated identification, classification, and version control'
              }
            },
            {
              element: 'Document Creation and Approval',
              description: 'Standardized processes for document creation, review, approval, and authorization',
              controlDetails: {
                creationStandards: [
                  'Document templates and formatting standards for consistency',
                  'Content development guidelines and quality criteria',
                  'Technical writing standards and language requirements',
                  'Document structure and organization requirements'
                ],
                reviewProcess: [
                  'Technical review for accuracy and completeness',
                  'Compliance review for regulatory and standard requirements',
                  'Usability review for clarity and practical application',
                  'Stakeholder review for impact and implementation feasibility'
                ],
                approvalWorkflow: [
                  'Multi-level approval process with defined authorities',
                  'Subject matter expert validation and sign-off',
                  'Management approval for policy and procedure documents',
                  'Quality manager approval for quality system documents'
                ],
                authorizationControls: [
                  'Digital signature requirements and authentication',
                  'Approval authority matrix and delegation procedures',
                  'Emergency approval procedures for urgent changes',
                  'Approval tracking and audit trail maintenance'
                ],
                systemIntegration: 'Workflow management system with automated routing and approval tracking'
              }
            },
            {
              element: 'Document Distribution and Access',
              description: 'Controlled distribution and access management ensuring current documents are available where needed',
              controlDetails: {
                distributionMethods: [
                  'Electronic distribution through document management system',
                  'Controlled hard copy distribution with tracking',
                  'Web-based access portals for authorized users',
                  'Mobile access applications for field operations'
                ],
                accessManagement: [
                  'User authentication and authorization controls',
                  'Role-based access permissions and restrictions',
                  'Remote access security protocols and monitoring',
                  'Guest access procedures for external stakeholders'
                ],
                availabilityAssurance: [
                  'Multiple distribution channels for critical documents',
                  'Offline access capabilities for essential procedures',
                  'Backup and recovery procedures for document access',
                  'Point-of-use document availability verification'
                ],
                currentVersionControl: [
                  'Automatic updates and obsolete document withdrawal',
                  'Version notification and change communication',
                  'Hard copy replacement and update procedures',
                  'User acknowledgment of document updates and changes'
                ],
                systemIntegration: 'Integrated document distribution system with real-time access tracking and version management'
              }
            },
            {
              element: 'Document Review and Updates',
              description: 'Systematic review and update processes ensuring documents remain current, accurate, and effective',
              controlDetails: {
                reviewSchedule: [
                  'Periodic review cycles based on document type and criticality',
                  'Event-triggered reviews for process changes and improvements',
                  'Annual comprehensive review of all quality system documents',
                  'Continuous monitoring for document effectiveness and usability'
                ],
                updateTriggers: [
                  'Process changes and improvement implementations',
                  'Regulatory updates and compliance requirement changes',
                  'Organizational changes affecting documented procedures',
                  'Audit findings and corrective action implementations'
                ],
                changeManagement: [
                  'Change request procedures and impact assessment',
                  'Change approval workflow and authorization requirements',
                  'Change implementation planning and communication',
                  'Change effectiveness verification and validation'
                ],
                obsoleteControl: [
                  'Systematic withdrawal of obsolete documents',
                  'Archive procedures for historical document retention',
                  'Obsolete document marking and disposal procedures',
                  'Prevention of unintended use of obsolete documents'
                ],
                systemIntegration: 'Change management system with automated review scheduling and update tracking'
              }
            }
          ]
        },
        {
          informationType: 'Record Control',
          description: 'Systematic control of quality records providing evidence of conformity and effective operation of the quality management system',
          controlElements: [
            {
              element: 'Record Identification and Retention',
              description: 'Systematic identification, classification, and retention management of quality records',
              controlDetails: {
                recordCategories: [
                  'Management review records and decision documentation',
                  'Training records and competency evidence',
                  'Calibration and maintenance records for equipment',
                  'Audit records and corrective action documentation'
                ],
                identificationSystem: [
                  'Unique record identification with traceability links',
                  'Record type classification and categorization',
                  'Creation date and source identification',
                  'Responsible party and record owner designation'
                ],
                retentionSchedule: [
                  'Regulatory retention requirements and compliance periods',
                  'Business retention needs and operational requirements',
                  'Legal retention obligations and litigation holds',
                  'Storage optimization and archive management'
                ],
                disposalProcedures: [
                  'Secure disposal methods for confidential records',
                  'Authorization requirements for record destruction',
                  'Disposal documentation and certificate management',
                  'Environmental compliance for disposal methods'
                ],
                systemIntegration: 'Records management system with automated retention scheduling and disposal tracking'
              }
            },
            {
              element: 'Record Storage and Protection',
              description: 'Secure storage and protection of quality records ensuring integrity, accessibility, and confidentiality',
              controlDetails: {
                storageStandards: [
                  'Physical storage requirements for hard copy records',
                  'Electronic storage systems with backup and redundancy',
                  'Environmental controls for record preservation',
                  'Security measures for unauthorized access prevention'
                ],
                protectionMeasures: [
                  'Data encryption for electronic records and transmissions',
                  'Physical security controls for storage areas',
                  'Access logging and monitoring for security auditing',
                  'Disaster recovery procedures for record protection'
                ],
                integrityAssurance: [
                  'Digital signature and authentication controls',
                  'Tamper-evident storage and modification detection',
                  'Regular integrity checks and validation procedures',
                  'Backup verification and recovery testing'
                ],
                accessibilityMaintenance: [
                  'Multiple storage locations for critical records',
                  'Format migration procedures for long-term accessibility',
                  'Retrieval procedures and response time standards',
                  'Emergency access procedures for business continuity'
                ],
                systemIntegration: 'Secure storage system with encryption, monitoring, and disaster recovery capabilities'
              }
            },
            {
              element: 'Record Retrieval and Use',
              description: 'Efficient retrieval and controlled use of quality records for evidence and decision-making purposes',
              controlDetails: {
                retrievalMethods: [
                  'Search capabilities by multiple criteria and attributes',
                  'Index and catalog systems for efficient location',
                  'Cross-reference systems for related record identification',
                  'Automated retrieval for routine reporting and analysis'
                ],
                accessControls: [
                  'User authorization and permission verification',
                  'Purpose verification for record access requests',
                  'Confidentiality controls and non-disclosure requirements',
                  'Access logging and audit trail maintenance'
                ],
                usageMonitoring: [
                  'Record access tracking and usage statistics',
                  'Purpose verification and justification documentation',
                  'Inappropriate use detection and prevention',
                  'Usage pattern analysis for system optimization'
                ],
                evidenceManagement: [
                  'Evidence chain of custody procedures',
                  'Legal hold procedures for litigation support',
                  'Evidence integrity verification and validation',
                  'Expert witness support and testimony preparation'
                ],
                systemIntegration: 'Advanced retrieval system with search capabilities, access controls, and usage analytics'
              }
            }
          ]
        },
        {
          informationType: 'Information Management',
          description: 'Comprehensive information management ensuring quality information is controlled, protected, and effectively utilized',
          controlElements: [
            {
              element: 'Information Architecture',
              description: 'Systematic organization and structure of quality management system information',
              controlDetails: {
                organizationStructure: [
                  'Hierarchical information organization by process and function',
                  'Cross-functional information linking and relationships',
                  'Metadata standards and information categorization',
                  'Information lifecycle management and archival procedures'
                ],
                integrationFramework: [
                  'System integration standards and data exchange protocols',
                  'Information sharing agreements and access permissions',
                  'Data synchronization procedures and conflict resolution',
                  'Master data management and single source of truth'
                ],
                standardization: [
                  'Information format standards and consistency requirements',
                  'Naming conventions and classification systems',
                  'Quality criteria for information accuracy and completeness',
                  'Version control and change management procedures'
                ],
                accessibilityDesign: [
                  'User interface design for intuitive information access',
                  'Search and navigation capabilities for efficient retrieval',
                  'Mobile and remote access optimization',
                  'Accessibility compliance for diverse user needs'
                ],
                systemIntegration: 'Enterprise information architecture with integrated systems and standardized data management'
              }
            },
            {
              element: 'Information Security and Privacy',
              description: 'Comprehensive security and privacy controls protecting quality management system information',
              controlDetails: {
                securityControls: [
                  'Multi-factor authentication and identity verification',
                  'Encryption for data at rest and in transit',
                  'Network security controls and intrusion detection',
                  'Regular security assessments and vulnerability testing'
                ],
                privacyProtection: [
                  'Personal data identification and classification',
                  'Consent management and privacy rights compliance',
                  'Data minimization and purpose limitation principles',
                  'Privacy impact assessments for new systems and processes'
                ],
                riskManagement: [
                  'Information security risk assessments and mitigation',
                  'Threat modeling and attack scenario planning',
                  'Incident response procedures and breach notification',
                  'Business continuity planning for information systems'
                ],
                complianceFramework: [
                  'Regulatory compliance monitoring and reporting',
                  'Industry standard compliance verification',
                  'Internal audit procedures for security controls',
                  'Third-party security assessments and certifications'
                ],
                systemIntegration: 'Comprehensive security management system with monitoring, compliance tracking, and incident response'
              }
            }
          ]
        }
      ],
      implementationFramework: {
        description: 'Systematic implementation framework for documented information control ensuring comprehensive coverage and effectiveness',
        implementationPhases: [
          {
            phase: 'Assessment and Planning',
            description: 'Comprehensive assessment of current state and strategic planning for documented information control',
            activities: [
              'Current state assessment of document and record control practices',
              'Gap analysis against ISO 9001:2015 requirements and best practices',
              'Stakeholder needs analysis and requirement gathering',
              'Implementation roadmap development with timelines and resources'
            ],
            deliverables: [
              'Current state assessment report with findings and recommendations',
              'Gap analysis documentation with prioritized improvement areas',
              'Stakeholder requirements matrix and success criteria',
              'Implementation plan with phases, timelines, and resource allocation'
            ],
            systemIntegration: 'Project management system with assessment tools and planning capabilities'
          },
          {
            phase: 'System Design and Development',
            description: 'Design and development of documented information control systems and procedures',
            activities: [
              'System architecture design and technology selection',
              'Process design and workflow development',
              'User interface design and user experience optimization',
              'Integration planning and data migration procedures'
            ],
            deliverables: [
              'System architecture documentation and technical specifications',
              'Process maps and workflow documentation',
              'User interface prototypes and design specifications',
              'Integration plan and data migration procedures'
            ],
            systemIntegration: 'Development platform with design tools and system integration capabilities'
          },
          {
            phase: 'Implementation and Training',
            description: 'System implementation, user training, and change management',
            activities: [
              'System deployment and configuration management',
              'User training program development and delivery',
              'Change management activities and communication',
              'Pilot testing and feedback incorporation'
            ],
            deliverables: [
              'Deployed systems with user access and permissions',
              'Training materials and competency verification records',
              'Change management plan execution and communication records',
              'Pilot test results and improvement implementations'
            ],
            systemIntegration: 'Training management system with competency tracking and change management tools'
          },
          {
            phase: 'Monitoring and Optimization',
            description: 'Ongoing monitoring, measurement, and continuous improvement of documented information control',
            activities: [
              'Performance monitoring and effectiveness measurement',
              'User feedback collection and analysis',
              'System optimization and enhancement implementation',
              'Continuous improvement planning and execution'
            ],
            deliverables: [
              'Performance reports and effectiveness metrics',
              'User satisfaction surveys and feedback analysis',
              'System optimization plans and enhancement implementations',
              'Continuous improvement roadmap and action plans'
            ],
            systemIntegration: 'Analytics platform with performance monitoring and optimization tracking'
          }
        ]
      }
    }
  ];

  // Section 8: Operation content
  const operationContent = {
    title: '8. Operation',
    sections: [
      {
        heading: '8.1 Operational Planning and Control',
        text: `The organization shall plan, implement and control the processes needed to meet the requirements for the provision of products and services, and to implement the actions determined in Clause 6, by determining the requirements for products and services; establishing criteria for processes and for acceptance of products and services; determining the resources needed to achieve conformity to the product and service requirements; implementing control of the processes in accordance with the criteria; determining and keeping documented information to the extent necessary to have confidence that the processes have been carried out as planned and to demonstrate the conformity of products and services to their requirements.`,
        systemNote: 'BridgeLineUSA implements comprehensive operational planning and control through integrated project management, quality assurance, and risk management systems.',
        subsections: [
          {
            subheading: '8.1.1 Operational Process Planning',
            text: 'Systematic planning of operational processes to ensure consistent delivery of products and services that meet requirements.',
            operationalPlanning: [
              {
                planningArea: 'Project Planning and Management',
                description: 'Comprehensive project planning framework ensuring systematic approach to product and service delivery',
                planningElements: [
                  {
                    element: 'Project Scope and Requirements Definition',
                    description: 'Systematic definition and documentation of project scope, objectives, and requirements',
                    planningDetails: {
                      scopeDefinition: [
                        'Clear definition of project deliverables and success criteria',
                        'Stakeholder identification and requirement gathering',
                        'Constraint identification and risk assessment',
                        'Resource requirement analysis and allocation planning'
                      ],
                      requirementManagement: [
                        'Requirement elicitation and documentation procedures',
                        'Requirement validation and approval processes',
                        'Change control procedures for requirement modifications',
                        'Traceability management throughout project lifecycle'
                      ],
                      deliverableSpecification: [
                        'Detailed specification of all project deliverables',
                        'Quality criteria and acceptance standards definition',
                        'Performance requirements and measurement criteria',
                        'Documentation and reporting requirements'
                      ],
                      systemIntegration: 'Project management system with requirement tracking and scope control capabilities'
                    }
                  },
                  {
                    element: 'Process Design and Workflow Planning',
                    description: 'Design and planning of operational processes and workflows for efficient execution',
                    planningDetails: {
                      processMapping: [
                        'Detailed process mapping and workflow documentation',
                        'Process interdependency analysis and coordination',
                        'Resource flow and bottleneck identification',
                        'Process optimization and efficiency improvements'
                      ],
                      workflowDesign: [
                        'Sequential and parallel activity planning',
                        'Decision points and approval gates definition',
                        'Handoff procedures and responsibility assignment',
                        'Exception handling and escalation procedures'
                      ],
                      resourcePlanning: [
                        'Human resource allocation and skill requirements',
                        'Equipment and facility requirement planning',
                        'Material and supply chain coordination',
                        'Budget allocation and cost control measures'
                      ],
                      systemIntegration: 'Workflow management system with process automation and resource optimization'
                    }
                  },
                  {
                    element: 'Schedule Development and Timeline Management',
                    description: 'Development of realistic schedules and timeline management for project execution',
                    planningDetails: {
                      scheduleDevelopment: [
                        'Activity duration estimation and critical path analysis',
                        'Resource availability and constraint consideration',
                        'Milestone definition and checkpoint establishment',
                        'Buffer time allocation for risk mitigation'
                      ],
                      timelineManagement: [
                        'Schedule monitoring and progress tracking procedures',
                        'Variance analysis and corrective action protocols',
                        'Schedule update and revision management',
                        'Stakeholder communication and reporting procedures'
                      ],
                      milestoneControl: [
                        'Key milestone identification and criteria definition',
                        'Milestone review and approval procedures',
                        'Progress measurement and performance indicators',
                        'Milestone achievement verification and documentation'
                      ],
                      systemIntegration: 'Project scheduling system with real-time tracking and milestone management'
                    }
                  }
                ]
              },
              {
                planningArea: 'Quality Planning and Assurance',
                description: 'Comprehensive quality planning framework ensuring products and services meet specified requirements',
                planningElements: [
                  {
                    element: 'Quality Standards and Criteria Definition',
                    description: 'Definition of quality standards, acceptance criteria, and measurement methods',
                    planningDetails: {
                      qualityStandards: [
                        'Product and service quality specifications',
                        'Performance criteria and measurement standards',
                        'Compliance requirements and regulatory standards',
                        'Customer satisfaction and expectation criteria'
                      ],
                      acceptanceCriteria: [
                        'Clear and measurable acceptance criteria for deliverables',
                        'Inspection and testing requirements',
                        'Documentation and evidence requirements',
                        'Customer approval and sign-off procedures'
                      ],
                      measurementMethods: [
                        'Quality measurement tools and techniques',
                        'Statistical process control methods',
                        'Performance indicator development and tracking',
                        'Quality audit and review procedures'
                      ],
                      systemIntegration: 'Quality management system with standards tracking and measurement automation'
                    }
                  },
                  {
                    element: 'Quality Control and Verification Planning',
                    description: 'Planning of quality control activities and verification procedures throughout operations',
                    planningDetails: {
                      controlActivities: [
                        'In-process quality control checkpoints',
                        'Inspection and testing schedule development',
                        'Quality gate definitions and approval criteria',
                        'Corrective action and improvement procedures'
                      ],
                      verificationProcedures: [
                        'Verification method selection and validation',
                        'Independent review and validation processes',
                        'Documentation and record keeping requirements',
                        'Verification result analysis and reporting'
                      ],
                      qualityAssurance: [
                        'Quality assurance activity planning and scheduling',
                        'Process audit and assessment procedures',
                        'Quality system effectiveness monitoring',
                        'Continuous improvement identification and implementation'
                      ],
                      systemIntegration: 'Quality control system with automated verification and compliance tracking'
                    }
                  }
                ]
              }
            ]
          },
          {
            subheading: '8.1.2 Risk Management in Operations',
            text: 'Systematic identification, assessment, and management of operational risks to ensure consistent performance.',
            riskManagement: [
              {
                riskCategory: 'Operational Risk Assessment',
                description: 'Comprehensive assessment of risks that could impact operational performance and delivery',
                riskElements: [
                  {
                    element: 'Risk Identification and Analysis',
                    description: 'Systematic identification and analysis of operational risks and their potential impacts',
                    riskDetails: {
                      identificationMethods: [
                        'Risk assessment workshops and brainstorming sessions',
                        'Historical data analysis and trend identification',
                        'Stakeholder input and expert judgment',
                        'Process analysis and failure mode identification'
                      ],
                      riskAnalysis: [
                        'Probability and impact assessment matrix',
                        'Root cause analysis and causal factor identification',
                        'Risk interdependency analysis and correlation',
                        'Scenario planning and impact modeling'
                      ],
                      riskCategorization: [
                        'Technical risks affecting product and service quality',
                        'Resource risks including availability and competency',
                        'Schedule risks affecting delivery timelines',
                        'External risks from suppliers and environment'
                      ],
                      systemIntegration: 'Risk management system with identification tools and analysis capabilities'
                    }
                  },
                  {
                    element: 'Risk Mitigation and Control Strategies',
                    description: 'Development and implementation of risk mitigation strategies and control measures',
                    riskDetails: {
                      mitigationStrategies: [
                        'Risk avoidance through process redesign and alternatives',
                        'Risk reduction through controls and safeguards',
                        'Risk transfer through insurance and contracts',
                        'Risk acceptance with monitoring and contingency plans'
                      ],
                      controlMeasures: [
                        'Preventive controls to reduce risk probability',
                        'Detective controls for early risk identification',
                        'Corrective controls for risk response and recovery',
                        'Compensating controls for risk mitigation'
                      ],
                      contingencyPlanning: [
                        'Alternative process and resource identification',
                        'Emergency response and recovery procedures',
                        'Business continuity and disaster recovery plans',
                        'Escalation procedures and decision authorities'
                      ],
                      systemIntegration: 'Risk control system with mitigation tracking and contingency management'
                    }
                  }
                ]
              }
            ]
          },
          {
            subheading: '8.1.3 Change Control in Operations',
            text: 'Systematic control of changes to operational processes to maintain quality and performance.',
            changeControl: [
              {
                controlArea: 'Operational Change Management',
                description: 'Comprehensive change management framework for operational processes and procedures',
                controlElements: [
                  {
                    element: 'Change Request and Evaluation',
                    description: 'Systematic process for requesting, evaluating, and approving operational changes',
                    controlDetails: {
                      changeRequest: [
                        'Standardized change request procedures and forms',
                        'Change justification and business case requirements',
                        'Impact assessment and risk evaluation procedures',
                        'Stakeholder input and consultation processes'
                      ],
                      evaluationCriteria: [
                        'Technical feasibility and implementation complexity',
                        'Resource requirements and availability assessment',
                        'Risk assessment and mitigation planning',
                        'Benefit analysis and return on investment'
                      ],
                      approvalProcess: [
                        'Change approval authority matrix and delegation',
                        'Review committee and decision-making procedures',
                        'Documentation and record keeping requirements',
                        'Communication and notification procedures'
                      ],
                      systemIntegration: 'Change management system with request tracking and approval workflow'
                    }
                  },
                  {
                    element: 'Change Implementation and Monitoring',
                    description: 'Controlled implementation and monitoring of approved operational changes',
                    controlDetails: {
                      implementationPlanning: [
                        'Detailed implementation planning and scheduling',
                        'Resource allocation and responsibility assignment',
                        'Training and competency development requirements',
                        'Testing and validation procedures'
                      ],
                      monitoringProcedures: [
                        'Change implementation progress tracking',
                        'Performance monitoring and effectiveness measurement',
                        'Issue identification and resolution procedures',
                        'Rollback procedures for unsuccessful changes'
                      ],
                      verificationActivities: [
                        'Change verification and validation testing',
                        'User acceptance testing and feedback collection',
                        'Performance baseline comparison and analysis',
                        'Documentation update and revision procedures'
                      ],
                      systemIntegration: 'Implementation tracking system with monitoring and verification capabilities'
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  // Section 8: Operation content - Part 1 (Operational Planning and Control)
  const operationContentPart1 = [
    {
      subheading: '8.1 Operational Planning and Control',
      text: `The organization shall plan, implement and control the processes needed to meet the requirements for the provision of products and services, and to implement the actions determined in Clause 6.`,
      operationalFramework: [
        {
          frameworkType: 'Process Planning Framework',
          description: 'Systematic framework for planning and controlling operational processes',
          frameworkElements: [
            {
              element: 'Process Requirements Definition',
              description: 'Clear definition of process requirements and acceptance criteria',
              requirements: [
                'Product and service requirement specifications',
                'Process performance criteria and measurement standards',
                'Resource requirements and capability specifications',
                'Documentation and record keeping requirements'
              ],
              systemIntegration: 'Requirements management system with specification tracking and validation'
            },
            {
              element: 'Process Control Implementation',
              description: 'Implementation of process controls to ensure consistent performance',
              controls: [
                'Process monitoring and measurement systems',
                'Quality control checkpoints and verification procedures',
                'Corrective action and improvement mechanisms',
                'Performance review and optimization procedures'
              ],
              systemIntegration: 'Process control system with real-time monitoring and automated controls'
            },
            {
              element: 'Resource Management and Allocation',
              description: 'Systematic management and allocation of resources for optimal performance',
              resourceManagement: [
                'Human resource planning and competency management',
                'Equipment and infrastructure resource allocation',
                'Material and supply chain coordination',
                'Budget planning and cost control measures'
              ],
              systemIntegration: 'Resource management system with allocation optimization and tracking'
            }
          ]
        }
      ],
      controlMechanisms: {
        description: 'Comprehensive control mechanisms ensuring operational effectiveness and efficiency',
        mechanisms: [
          {
            mechanism: 'Performance Monitoring and Measurement',
            description: 'Continuous monitoring and measurement of operational performance',
            activities: [
              'Real-time process monitoring and data collection',
              'Key performance indicator tracking and analysis',
              'Trend analysis and performance prediction',
              'Benchmark comparison and best practice identification'
            ],
            outputs: [
              'Performance dashboards and real-time reports',
              'Trend analysis reports and predictions',
              'Benchmark studies and improvement recommendations',
              'Performance review meeting minutes and action plans'
            ],
            systemIntegration: 'Performance management system with analytics and reporting capabilities'
          },
          {
            mechanism: 'Quality Assurance and Control',
            description: 'Systematic quality assurance and control throughout operational processes',
            activities: [
              'Quality planning and control procedure development',
              'In-process quality control and verification',
              'Quality audit and assessment activities',
              'Quality improvement initiative implementation'
            ],
            outputs: [
              'Quality control procedures and work instructions',
              'Quality control records and verification reports',
              'Quality audit reports and corrective action plans',
              'Quality improvement project documentation and results'
            ],
            systemIntegration: 'Quality management system with control automation and tracking'
          },
          {
            mechanism: 'Risk Management and Mitigation',
            description: 'Proactive risk management and mitigation throughout operations',
            activities: [
              'Operational risk identification and assessment',
              'Risk mitigation strategy development and implementation',
              'Risk monitoring and early warning systems',
              'Contingency planning and emergency response'
            ],
            outputs: [
              'Risk registers and assessment documentation',
              'Risk mitigation plans and implementation schedules',
              'Risk monitoring reports and alerts',
              'Contingency plans and emergency response procedures'
            ],
            systemIntegration: 'Risk management system with assessment tools and mitigation tracking'
          }
        ]
      }
    }
  ];

  // Section 8: Operation content - Part 2 (Requirements for Products and Services)
  const operationContentPart2 = [
    {
      subheading: '8.2 Requirements for Products and Services',
      text: `The organization shall determine, review and manage requirements for products and services, including customer communication and changes to requirements.`,
      requirementsFramework: [
        {
          frameworkType: 'Customer Communication Framework',
          description: 'Systematic framework for effective communication with customers regarding products and services',
          communicationElements: [
            {
              element: 'Product and Service Information Communication',
              description: 'Clear and accurate communication of product and service information to customers',
              communicationDetails: {
                informationTypes: [
                  'Product specifications, features, and technical requirements',
                  'Service descriptions, scope, and delivery methods',
                  'Pricing, terms, and conditions of sale or service',
                  'Delivery schedules, installation, and support services'
                ],
                communicationMethods: [
                  'Technical documentation and specification sheets',
                  'Product catalogs and service portfolios',
                  'Websites, digital platforms, and online resources',
                  'Sales presentations and customer meetings'
                ],
                accuracyControls: [
                  'Technical review and validation of product information',
                  'Regular updates to reflect product and service changes',
                  'Version control and document management procedures',
                  'Customer feedback integration and continuous improvement'
                ],
                systemIntegration: 'Customer communication management system with content control and distribution tracking'
              }
            },
            {
              element: 'Inquiry and Quotation Management',
              description: 'Systematic management of customer inquiries and preparation of accurate quotations',
              communicationDetails: {
                inquiryProcessing: [
                  'Structured inquiry receipt and acknowledgment procedures',
                  'Technical feasibility assessment and capability evaluation',
                  'Resource availability and capacity planning analysis',
                  'Risk assessment and mitigation planning for complex requirements'
                ],
                quotationPreparation: [
                  'Detailed technical and commercial proposal development',
                  'Accurate pricing based on cost analysis and market conditions',
                  'Clear terms and conditions including delivery and payment',
                  'Risk allocation and contract terms specification'
                ],
                responseManagement: [
                  'Timely response procedures and customer communication',
                  'Quotation tracking and follow-up procedures',
                  'Customer feedback collection and analysis',
                  'Competitive analysis and pricing strategy optimization'
                ],
                systemIntegration: 'Quote management system with automated workflows and customer relationship tracking'
              }
            },
            {
              element: 'Contract and Order Management',
              description: 'Comprehensive management of contracts and customer orders throughout the lifecycle',
              communicationDetails: {
                contractNegotiation: [
                  'Contract terms negotiation and finalization procedures',
                  'Legal review and risk assessment of contract terms',
                  'Customer requirement clarification and documentation',
                  'Change management procedures for contract modifications'
                ],
                orderProcessing: [
                  'Order receipt, validation, and confirmation procedures',
                  'Order entry and system integration workflows',
                  'Order tracking and status communication to customers',
                  'Order modification and cancellation procedures'
                ],
                deliveryCoordination: [
                  'Delivery schedule communication and coordination',
                  'Progress updates and milestone achievement reporting',
                  'Issue identification and resolution communication',
                  'Delivery confirmation and customer satisfaction verification'
                ],
                systemIntegration: 'Contract and order management system with customer portal and communication automation'
              }
            }
          ]
        },
        {
          frameworkType: 'Requirements Determination Framework',
          description: 'Systematic framework for determining and documenting product and service requirements',
          determinationElements: [
            {
              element: 'Customer Requirements Analysis',
              description: 'Comprehensive analysis and documentation of stated and implied customer requirements',
              analysisDetails: {
                requirementCapture: [
                  'Systematic requirement elicitation through customer interviews',
                  'Technical specification analysis and interpretation',
                  'Use case development and scenario planning',
                  'Stakeholder requirement gathering and consolidation'
                ],
                requirementClassification: [
                  'Functional requirements for product and service capabilities',
                  'Performance requirements including quality and efficiency metrics',
                  'Interface requirements for system integration and compatibility',
                  'Constraint requirements including regulatory and environmental'
                ],
                impliedRequirements: [
                  'Industry standard compliance and best practice requirements',
                  'Safety and security requirements based on intended use',
                  'Regulatory and legal compliance requirements',
                  'Environmental and sustainability requirements'
                ],
                systemIntegration: 'Requirements management system with traceability and change control capabilities'
              }
            },
            {
              element: 'Regulatory and Legal Requirements Assessment',
              description: 'Assessment and integration of applicable regulatory and legal requirements',
              analysisDetails: {
                regulatoryAnalysis: [
                  'Applicable regulation identification and analysis',
                  'Compliance requirement mapping and documentation',
                  'Regulatory change monitoring and impact assessment',
                  'Industry standard and best practice integration'
                ],
                legalRequirements: [
                  'Contract law compliance and legal obligation analysis',
                  'Liability and risk allocation assessment',
                  'Intellectual property and confidentiality requirements',
                  'International trade and export control compliance'
                ],
                complianceVerification: [
                  'Compliance verification procedures and testing',
                  'Documentation and evidence collection for compliance',
                  'Third-party certification and validation when required',
                  'Ongoing compliance monitoring and maintenance'
                ],
                systemIntegration: 'Regulatory compliance management system with monitoring and verification tracking'
              }
            },
            {
              element: 'Technical and Performance Requirements Definition',
              description: 'Definition of detailed technical and performance requirements for products and services',
              analysisDetails: {
                technicalSpecification: [
                  'Detailed technical specification development and documentation',
                  'Performance criteria and measurement standards definition',
                  'Interface and integration requirements specification',
                  'Quality and reliability requirements establishment'
                ],
                performanceMetrics: [
                  'Key performance indicator identification and definition',
                  'Measurement methods and acceptance criteria establishment',
                  'Performance targets and tolerance limits specification',
                  'Performance verification and validation procedures'
                ],
                feasibilityAssessment: [
                  'Technical feasibility analysis and capability assessment',
                  'Resource requirement analysis and availability verification',
                  'Risk assessment and mitigation planning',
                  'Alternative solution evaluation and recommendation'
                ],
                systemIntegration: 'Technical requirements management system with specification control and validation tracking'
              }
            }
          ]
        },
        {
          frameworkType: 'Requirements Review Framework',
          description: 'Systematic framework for reviewing requirements to ensure capability and commitment alignment',
          reviewElements: [
            {
              element: 'Capability Assessment and Verification',
              description: 'Assessment of organizational capability to meet specified requirements',
              assessmentDetails: {
                capabilityEvaluation: [
                  'Technical capability assessment against requirements',
                  'Resource capacity and availability analysis',
                  'Competency and skill requirement evaluation',
                  'Technology and infrastructure capability verification'
                ],
                gapAnalysis: [
                  'Capability gap identification and documentation',
                  'Resource gap analysis and acquisition planning',
                  'Skill gap assessment and training requirement identification',
                  'Technology gap evaluation and upgrade planning'
                ],
                mitigationPlanning: [
                  'Gap mitigation strategy development and implementation planning',
                  'Alternative solution evaluation and selection',
                  'Partnership and subcontracting evaluation when needed',
                  'Risk mitigation and contingency planning'
                ],
                systemIntegration: 'Capability management system with assessment tools and gap analysis capabilities'
              }
            },
            {
              element: 'Commitment Review and Authorization',
              description: 'Review and authorization process for making commitments to customers',
              assessmentDetails: {
                commitmentReview: [
                  'Commercial viability and profitability analysis',
                  'Resource allocation and scheduling feasibility',
                  'Risk assessment and mitigation strategy evaluation',
                  'Strategic alignment and business objective consistency'
                ],
                authorizationProcess: [
                  'Authority matrix and delegation procedures for commitments',
                  'Multi-level review and approval workflow',
                  'Legal and contract review and approval',
                  'Customer credit and payment term evaluation'
                ],
                documentationRequirements: [
                  'Commitment documentation and record keeping',
                  'Authorization trail and audit evidence maintenance',
                  'Customer communication and acknowledgment records',
                  'Change control and modification documentation'
                ],
                systemIntegration: 'Commitment management system with authorization workflow and audit trail capabilities'
              }
            },
            {
              element: 'Change Management and Control',
              description: 'Management and control of changes to requirements throughout the project lifecycle',
              assessmentDetails: {
                changeIdentification: [
                  'Change identification and impact assessment procedures',
                  'Stakeholder notification and communication protocols',
                  'Change documentation and traceability maintenance',
                  'Change urgency and priority classification'
                ],
                changeEvaluation: [
                  'Technical impact assessment and feasibility analysis',
                  'Cost and schedule impact evaluation',
                  'Risk assessment and mitigation planning',
                  'Customer and stakeholder impact analysis'
                ],
                changeImplementation: [
                  'Change approval workflow and authorization procedures',
                  'Implementation planning and resource allocation',
                  'Communication and coordination with affected parties',
                  'Change verification and validation procedures'
                ],
                systemIntegration: 'Change management system with impact analysis and implementation tracking'
              }
            }
          ]
        }
      ],
      managementProcedures: {
        description: 'Comprehensive management procedures for requirements throughout the product and service lifecycle',
        procedures: [
          {
            procedure: 'Requirements Lifecycle Management',
            description: 'End-to-end management of requirements from initial identification through final delivery',
            activities: [
              'Requirements identification, capture, and initial documentation',
              'Requirements analysis, validation, and stakeholder approval',
              'Requirements implementation planning and resource allocation',
              'Requirements verification, validation, and acceptance testing'
            ],
            outputs: [
              'Requirements documentation with traceability matrix',
              'Requirements validation reports and stakeholder sign-offs',
              'Implementation plans with resource allocation and scheduling',
              'Verification and validation test results and acceptance records'
            ],
            systemIntegration: 'Requirements lifecycle management system with full traceability and change control'
          },
          {
            procedure: 'Customer Satisfaction Management',
            description: 'Systematic management of customer satisfaction throughout the engagement',
            activities: [
              'Customer expectation setting and communication management',
              'Regular customer feedback collection and analysis',
              'Customer satisfaction measurement and improvement planning',
              'Customer relationship management and retention strategies'
            ],
            outputs: [
              'Customer expectation documentation and communication records',
              'Customer feedback reports and satisfaction surveys',
              'Customer satisfaction metrics and improvement action plans',
              'Customer relationship management reports and retention strategies'
            ],
            systemIntegration: 'Customer relationship management system with satisfaction tracking and improvement planning'
          },
          {
            procedure: 'Quality Assurance and Control',
            description: 'Quality assurance and control procedures for requirements management',
            activities: [
              'Requirements quality review and validation procedures',
              'Quality gate implementation and checkpoint management',
              'Quality metrics tracking and performance analysis',
              'Quality improvement initiative implementation and monitoring'
            ],
            outputs: [
              'Requirements quality review reports and validation records',
              'Quality gate checklists and checkpoint completion records',
              'Quality metrics dashboards and performance reports',
              'Quality improvement project documentation and results'
            ],
            systemIntegration: 'Quality management system with requirements quality control and improvement tracking'
          }
        ]
      }
    },
    {
      subheading: '8.3 Design and Development',
      text: `The organization shall establish, implement and maintain a design and development process that is appropriate to ensure the subsequent provision of products and services.`,
      requirementsFramework: [
        {
          frameworkType: 'Design and Development Planning',
          description: 'Systematic planning ensures comprehensive coverage of all design and development activities',
          frameworkElements: [
            {
              element: 'Planning Framework',
              description: 'Comprehensive framework for managing design and development planning activities',
              requirements: [
                'Define design and development stages and associated activities',
                'Establish review, verification and validation requirements',
                'Determine responsibilities and authorities for design activities',
                'Manage interfaces between different groups involved in design',
                'Ensure adequate resources including personnel and infrastructure',
                'Control external and internal stakeholder involvement'
              ],
              systemIntegration: 'Design management system with planning and resource allocation tracking'
            },
            {
              element: 'Project Planning',
              description: 'Detailed project planning for effective design implementation',
              requirements: [
                'Develop comprehensive project schedules and milestones',
                'Define deliverables and acceptance criteria for each stage',
                'Establish risk management and mitigation strategies',
                'Plan for resource allocation and capacity management',
                'Define communication and reporting protocols',
                'Establish change management procedures'
              ],
              systemIntegration: 'Project management system integrated with design lifecycle management'
            }
          ]
        },
        {
          frameworkType: 'Design and Development Inputs',
          description: 'Comprehensive inputs ensure complete understanding of requirements',
          frameworkElements: [
            {
              element: 'Requirements Management',
              description: 'Systematic management of all design and development requirements',
              requirements: [
                'Functional and performance requirements definition',
                'Applicable regulatory and legal requirements',
                'Standards and codes of practice requirements',
                'Lessons learned from previous similar designs',
                'Essential requirements for intended use and safe operation',
                'Consequences of potential failures and safety considerations'
              ],
              systemIntegration: 'Requirements management system with traceability and validation tracking'
            },
            {
              element: 'Information Management',
              description: 'Effective management of design-related information and knowledge',
              requirements: [
                'Technical specifications and design criteria',
                'Material properties and environmental considerations',
                'Manufacturing and service provision constraints',
                'Installation, operation and maintenance requirements',
                'End-of-life and disposal considerations',
                'Intellectual property and confidentiality requirements'
              ],
              systemIntegration: 'Knowledge management system with design information repository'
            }
          ]
        },
        {
          frameworkType: 'Design and Development Controls',
          description: 'Systematic controls ensure design integrity and compliance',
          frameworkElements: [
            {
              element: 'Control Framework',
              description: 'Comprehensive framework for design and development control activities',
              requirements: [
                'Design review processes at planned stages',
                'Verification activities to ensure outputs meet inputs',
                'Validation activities to ensure products meet intended use',
                'Configuration management and version control',
                'Design approval and authorization processes',
                'Risk assessment and mitigation activities'
              ],
              systemIntegration: 'Design control system with review and approval workflow management'
            },
            {
              element: 'Quality Assurance',
              description: 'Quality assurance activities throughout design and development',
              requirements: [
                'Independent review and verification processes',
                'Peer review and technical assessment procedures',
                'Compliance verification with standards and regulations',
                'Design optimization and performance validation',
                'Error prevention and defect reduction activities',
                'Continuous improvement integration'
              ],
              systemIntegration: 'Quality assurance system integrated with design control processes'
            }
          ]
        },
        {
          frameworkType: 'Design and Development Outputs',
          description: 'Comprehensive outputs that enable subsequent processes',
          frameworkElements: [
            {
              element: 'Documentation Framework',
              description: 'Complete documentation package for design outputs',
              requirements: [
                'Technical drawings, specifications and models',
                'Material and component specifications',
                'Manufacturing and assembly instructions',
                'Testing and inspection procedures',
                'Installation and commissioning guidelines',
                'Operation and maintenance documentation'
              ],
              systemIntegration: 'Document management system with version control and distribution tracking'
            },
            {
              element: 'Implementation Support',
              description: 'Supporting information for effective implementation',
              requirements: [
                'Training and competency requirements',
                'Quality control and acceptance criteria',
                'Safety and environmental protection measures',
                'Service and support requirements',
                'Lifecycle management considerations',
                'Improvement and modification procedures'
              ],
              systemIntegration: 'Implementation support system with training and quality control integration'
            }
          ]
        },
        {
          frameworkType: 'Design and Development Changes',
          description: 'Systematic management of design changes throughout the lifecycle',
          frameworkElements: [
            {
              element: 'Change Control',
              description: 'Comprehensive change control and management processes',
              requirements: [
                'Change request and evaluation procedures',
                'Impact assessment on products and services',
                'Authorization and approval processes',
                'Implementation planning and scheduling',
                'Verification and validation of changes',
                'Documentation update and communication'
              ],
              systemIntegration: 'Change control system with impact analysis and approval workflow'
            },
            {
              element: 'Change Management',
              description: 'Effective management of design changes and their implications',
              requirements: [
                'Stakeholder notification and consultation',
                'Rollback and recovery procedures',
                'Training and competency updates',
                'Customer and regulatory notification',
                'Configuration management updates',
                'Lessons learned capture and application'
              ],
              systemIntegration: 'Change management system with stakeholder communication and training integration'
            }
          ]
        }
      ]
    },
    {
      subheading: '8.4 Control of Externally Provided Processes, Products and Services',
      text: 'The organization shall ensure that externally provided processes, products and services conform to requirements.',
      requirementsFramework: [
        {
          frameworkType: 'External Provider Control Framework',
          description: 'Comprehensive framework for controlling and monitoring externally provided processes, products and services to ensure conformity with organizational requirements.',
          frameworkElements: [
            {
              element: 'Supplier Selection and Evaluation',
              description: 'Systematic approach to selecting and evaluating external providers based on their ability to provide processes, products and services in accordance with requirements.',
              requirements: [
                'Establish criteria for the evaluation and selection of external providers',
                'Define the type and extent of control to be applied to external providers',
                'Determine the controls to be applied to externally provided processes, products and services',
                'Consider the potential impact of externally provided processes, products and services on organizational capability',
                'Evaluate the effectiveness of controls applied by external providers',
                'Maintain documented information of evaluation results and actions arising from evaluations'
              ],
              systemIntegration: 'Integrated with quality management system requirements, risk management processes, and organizational control procedures'
            },
            {
              element: 'Type and Extent of Control',
              description: 'Framework for determining appropriate control measures for different types of external providers and their offerings.',
              requirements: [
                'Consider the potential impact on organizational capability to consistently provide conforming products and services',
                'Evaluate the degree to which the control of the process is shared with the external provider',
                'Assess the capability of achieving the necessary control through application of verification or validation activities',
                'Define specific control requirements for each type of externally provided process, product or service',
                'Establish monitoring and measurement criteria for external provider performance',
                'Implement corrective action processes for non-conforming external provisions'
              ],
              systemIntegration: 'Connected to process management, performance monitoring, and continuous improvement systems'
            },
            {
              element: 'Information for External Providers',
              description: 'Clear communication framework for conveying requirements and expectations to external providers.',
              requirements: [
                'Communicate processes, products and services to be provided or performed',
                'Specify approval requirements for products and services, methods, processes and equipment',
                'Define competence requirements including any required qualification of persons',
                'Establish interaction requirements between the organization and external provider',
                'Implement control and monitoring of external provider performance by the organization',
                'Verify activities that the organization or its customer intends to perform at external provider premises'
              ],
              systemIntegration: 'Aligned with communication management, competence requirements, and verification processes'
            }
          ]
        },
        {
          frameworkType: 'Outsourced Process Control Framework',
          description: 'Specialized framework for managing processes that are outsourced to external providers while maintaining organizational responsibility.',
          frameworkElements: [
            {
              element: 'Outsourced Process Management',
              description: 'Comprehensive approach to maintaining control and oversight of processes performed by external providers on behalf of the organization.',
              requirements: [
                'Ensure that control over outsourced processes does not absolve the organization of responsibility',
                'Define the type and extent of control to be applied to outsourced processes',
                'Establish verification activities to ensure outsourced processes meet requirements',
                'Implement monitoring systems for outsourced process performance and outcomes',
                'Maintain communication channels with external providers performing outsourced processes',
                'Ensure customer property is safeguarded when involved in outsourced processes'
              ],
              systemIntegration: 'Integrated with quality management system scope, process management, and customer relationship management'
            },
            {
              element: 'External Provider Qualification',
              description: 'Framework for qualifying and maintaining qualified status of external providers.',
              requirements: [
                'Establish qualification criteria based on external provider capability and performance',
                'Conduct initial qualification assessments including on-site evaluations when necessary',
                'Implement ongoing performance monitoring and re-qualification processes',
                'Maintain qualified supplier lists with current qualification status',
                'Define disqualification criteria and processes for non-performing external providers',
                'Document qualification decisions and maintain records of external provider qualifications'
              ],
              systemIntegration: 'Connected to supplier management, performance measurement, and documented information control systems'
            },
            {
              element: 'Verification of Externally Provided Products and Services',
              description: 'Systematic verification framework to ensure externally provided products and services meet specified requirements.',
              requirements: [
                'Define verification activities appropriate to the nature of externally provided products and services',
                'Establish verification criteria and acceptance requirements',
                'Implement inspection and testing procedures for externally provided items',
                'Conduct verification activities at external provider premises when specified',
                'Document verification results and any non-conformities identified',
                'Take appropriate action when externally provided products and services do not meet requirements'
              ],
              systemIntegration: 'Aligned with inspection and testing procedures, non-conformity management, and customer satisfaction processes'
            }
          ]
        }
      ]
    },
    {
      subheading: '8.5 Production and Service Provision',
      text: 'The organization shall implement production and service provision under controlled conditions.',
      requirementsFramework: [
        {
          frameworkType: 'Production Control Framework',
          description: 'Comprehensive framework for implementing controlled conditions during production and service provision to ensure consistent delivery of conforming products and services.',
          frameworkElements: [
            {
              element: 'Controlled Conditions Implementation',
              description: 'Systematic approach to establishing and maintaining controlled conditions for all production and service provision activities.',
              requirements: [
                'Ensure availability of documented information that defines characteristics of products to be produced or services to be provided',
                'Provide availability of documented information that defines activities to be performed',
                'Make available and use suitable monitoring and measuring equipment',
                'Implement monitoring and measurement activities at appropriate stages',
                'Use suitable infrastructure and environment for operation of processes',
                'Appoint competent persons including any required qualification',
                'Validate and regularly revalidate the capability of processes for production and service provision',
                'Implement actions to prevent human error and ensure consistent process execution'
              ],
              systemIntegration: 'Integrated with process management, competence requirements, infrastructure management, and quality control systems'
            },
            {
              element: 'Identification and Traceability',
              description: 'Framework for identifying and tracking products and services throughout production and delivery processes.',
              requirements: [
                'Use suitable means to identify outputs when it is necessary to ensure conformity of products and services',
                'Identify the status of outputs with respect to monitoring and measurement requirements throughout production',
                'Control the unique identification of outputs when traceability is a requirement',
                'Maintain documented information necessary to enable traceability',
                'Ensure identification is maintained throughout the production and service provision process',
                'Implement systems to track product and service status from input through delivery'
              ],
              systemIntegration: 'Connected to documented information control, monitoring and measurement, and customer delivery systems'
            },
            {
              element: 'Customer Property Management',
              description: 'Systematic approach to managing and protecting customer property while under organizational control.',
              requirements: [
                'Exercise care with customer property while it is under organizational control or being used by the organization',
                'Identify, verify, protect and safeguard customer property provided for use or incorporation into products and services',
                'Report to customer when customer property is lost, damaged or otherwise found to be unsuitable for use',
                'Maintain records of customer property identification, verification, protection and safeguarding activities',
                'Implement appropriate storage and handling procedures for customer property',
                'Ensure customer property is clearly identified and segregated from organizational property'
              ],
              systemIntegration: 'Aligned with customer communication, non-conformity management, and property management systems'
            }
          ]
        },
        {
          frameworkType: 'Preservation and Post-Delivery Framework',
          description: 'Framework for preserving product and service conformity during processing, delivery, and post-delivery activities.',
          frameworkElements: [
            {
              element: 'Preservation of Products and Services',
              description: 'Comprehensive approach to maintaining product and service integrity throughout processing and delivery.',
              requirements: [
                'Preserve outputs during production and service provision to the extent necessary to ensure continuing conformity to requirements',
                'Include identification, handling, contamination control, packaging, storage, transmission or transportation, and protection',
                'Apply preservation requirements to constituent parts of a product or service',
                'Implement appropriate environmental controls for preservation activities',
                'Establish procedures for handling, storage, and delivery of products and services',
                'Monitor preservation effectiveness and implement corrective actions when necessary'
              ],
              systemIntegration: 'Integrated with logistics management, environmental control, and quality assurance systems'
            },
            {
              element: 'Post-Delivery Activities',
              description: 'Framework for managing activities and support provided after product delivery or service completion.',
              requirements: [
                'Determine requirements for post-delivery activities associated with products and services',
                'Consider feedback from customers regarding post-delivery experience',
                'Evaluate potential undesired consequences associated with products and services',
                'Assess the nature, use and intended lifetime of products and services',
                'Review customer requirements and feedback for post-delivery activities',
                'Implement warranty, maintenance, and support services as required',
                'Establish processes for handling post-delivery issues and customer complaints'
              ],
              systemIntegration: 'Connected to customer satisfaction measurement, risk management, and continuous improvement processes'
            },
            {
              element: 'Change Control in Production',
              description: 'Systematic approach to managing changes in production and service provision processes.',
              requirements: [
                'Review and control changes for production and service provision to the extent necessary to ensure continuing conformity with requirements',
                'Retain documented information describing the results of the review of changes',
                'Document the person(s) authorizing the change and any necessary actions arising from the review',
                'Evaluate the impact of changes on product and service conformity',
                'Implement validation activities for significant changes to production processes',
                'Communicate changes to relevant personnel and update training as necessary'
              ],
              systemIntegration: 'Aligned with change management, validation processes, and communication management systems'
            }
          ]
        }
      ]
    },
    {
      subheading: '8.6 Release of Products and Services',
      text: 'The organization shall implement planned arrangements to verify that product and service requirements have been met.',
      requirementsFramework: [
        {
          frameworkType: 'Product and Service Release Framework',
          description: 'Comprehensive framework for implementing systematic verification and release processes to ensure products and services meet all specified requirements before delivery to customers.',
          frameworkElements: [
            {
              element: 'Release Authorization Process',
              description: 'Systematic approach to authorizing the release of products and services based on verification of conformity to requirements.',
              requirements: [
                'Implement planned arrangements to verify that product and service requirements have been met',
                'Ensure evidence of conformity with acceptance criteria is maintained',
                'Obtain authorization from relevant authority and customer acceptance where applicable',
                'Document the person(s) authorizing release and any conditions or restrictions',
                'Verify traceability to person(s) authorizing the release for delivery',
                'Maintain records of release decisions and any special conditions applied'
              ],
              systemIntegration: 'Integrated with quality control, verification processes, and customer delivery systems'
            },
            {
              element: 'Verification and Validation Activities',
              description: 'Framework for conducting comprehensive verification and validation to ensure product and service conformity.',
              requirements: [
                'Conduct final inspection and testing activities as specified in planned arrangements',
                'Verify all customer requirements have been met including technical specifications',
                'Validate product and service performance under intended use conditions',
                'Review documentation completeness including certificates, test reports, and compliance records',
                'Confirm packaging, labeling, and delivery instructions meet customer requirements',
                'Ensure any customer-specific requirements or regulatory compliance is verified'
              ],
              systemIntegration: 'Connected to testing procedures, documentation control, and regulatory compliance systems'
            },
            {
              element: 'Release Documentation and Records',
              description: 'Systematic approach to maintaining comprehensive documentation and records supporting release decisions.',
              requirements: [
                'Maintain documented information providing evidence of conformity with acceptance criteria',
                'Document verification and validation activities performed prior to release',
                'Record any deviations, concessions, or special conditions applied during release',
                'Maintain traceability records linking released products to verification activities',
                'Document customer acceptance and any specific release conditions',
                'Ensure release records are readily retrievable and protected from unauthorized changes'
              ],
              systemIntegration: 'Aligned with documented information control, traceability systems, and customer relationship management'
            }
          ]
        }
      ]
    },
    {
      subheading: '8.7 Control of Nonconforming Outputs',
      text: 'The organization shall ensure that outputs that do not conform to their requirements are identified and controlled to prevent their unintended use or delivery.',
      requirementsFramework: [
        {
          frameworkType: 'Nonconformity Control Framework',
          description: 'Comprehensive framework for identifying, controlling, and managing nonconforming outputs to prevent unintended use or delivery while ensuring appropriate corrective actions.',
          frameworkElements: [
            {
              element: 'Identification and Control of Nonconforming Outputs',
              description: 'Systematic approach to identifying and controlling products and services that do not conform to specified requirements.',
              requirements: [
                'Identify outputs that do not conform to their requirements',
                'Control nonconforming outputs to prevent their unintended use or delivery',
                'Take appropriate action based on the nature of the nonconformity and its effect on conformity',
                'Apply the same controls to nonconforming outputs detected after delivery or during use',
                'Segregate, contain, or suspend provision of nonconforming products and services',
                'Inform relevant parties including customers when nonconformity affects delivered products or services'
              ],
              systemIntegration: 'Integrated with quality control, customer communication, and risk management systems'
            },
            {
              element: 'Nonconformity Disposition and Actions',
              description: 'Framework for determining appropriate actions and disposition of nonconforming outputs based on severity and impact.',
              requirements: [
                'Correct the nonconformity where feasible and re-verify conformity to requirements',
                'Segregate, contain, return or suspend provision of products and services',
                'Inform the customer and obtain authorization for acceptance under concession',
                'Take action to preclude the original intended use or application',
                'Evaluate the need for action to eliminate causes of nonconformity',
                'Verify the effectiveness of any corrective action taken'
              ],
              systemIntegration: 'Connected to corrective action processes, customer approval systems, and continuous improvement activities'
            },
            {
              element: 'Nonconformity Documentation and Analysis',
              description: 'Systematic approach to documenting nonconformities and analyzing trends for continuous improvement.',
              requirements: [
                'Retain documented information that describes the nonconformity and actions taken',
                'Document any concessions obtained and the authority for the decision',
                'Maintain records of verification activities following correction of nonconformity',
                'Analyze nonconformity trends and patterns to identify improvement opportunities',
                'Document the nature of nonconformities and their subsequent actions including concessions obtained',
                'Review nonconformity data as input to management review and improvement processes'
              ],
              systemIntegration: 'Aligned with documented information control, data analysis, and management review systems'
            }
          ]
        }
      ]
    }
  ];

  // Section 9: Performance Evaluation Content
  const performanceContent = [
    {
      subheading: '9.1 Monitoring and Measurement',
      text: 'The organization shall determine what needs to be monitored and measured, the methods for monitoring, measurement, analysis and evaluation needed to ensure valid results, and when the monitoring and measuring shall be performed.',
      requirementsFramework: [
        {
          frameworkType: 'Performance Monitoring Framework',
          description: 'Comprehensive framework for establishing systematic monitoring and measurement processes to evaluate quality management system performance and ensure conformity to requirements.',
          frameworkElements: [
            {
              element: 'Customer Satisfaction Monitoring',
              description: 'Systematic approach to monitoring and measuring customer perceptions of the degree to which their needs and expectations have been fulfilled.',
              requirements: [
                'Monitor customer perceptions of the degree to which their needs and expectations have been fulfilled',
                'Determine the methods for obtaining, monitoring and reviewing customer satisfaction information',
                'Establish frequency and timing for customer satisfaction data collection',
                'Analyze customer satisfaction trends and identify improvement opportunities',
                'Use customer satisfaction data as input for management review and improvement processes',
                'Implement corrective actions based on customer satisfaction findings'
              ],
              systemIntegration: 'Integrated with customer relationship management, management review, and continuous improvement processes'
            },
            {
              element: 'Analysis and Evaluation of Performance',
              description: 'Framework for analyzing and evaluating data and information arising from monitoring and measurement activities.',
              requirements: [
                'Analyze and evaluate appropriate data and information arising from monitoring and measurement',
                'Determine the conformity of products and services to requirements',
                'Evaluate the degree of customer satisfaction and identify trends',
                'Assess the performance and effectiveness of the quality management system',
                'Determine if planning has been implemented effectively',
                'Evaluate the effectiveness of actions taken to address risks and opportunities',
                'Assess the performance of external providers and identify improvement needs'
              ],
              systemIntegration: 'Connected to data management, risk management, and performance measurement systems'
            }
          ]
        }
      ]
    },
    {
      subheading: '9.2 Internal Audit',
      text: 'The organization shall conduct internal audits at planned intervals to provide information on whether the quality management system conforms to the organization\'s own requirements and is effectively implemented and maintained.',
      requirementsFramework: [
        {
          frameworkType: 'Internal Audit Framework',
          description: 'Systematic framework for conducting internal audits to verify quality management system conformity and effectiveness.',
          frameworkElements: [
            {
              element: 'Audit Program Management',
              description: 'Comprehensive approach to planning, implementing, and managing the internal audit program.',
              requirements: [
                'Plan, establish, implement and maintain an audit program including frequency, methods, responsibilities, planning requirements and reporting',
                'Define audit criteria and scope for each audit based on importance of processes and results of previous audits',
                'Select auditors and conduct audits to ensure objectivity and impartiality of the audit process',
                'Ensure audit results are reported to relevant management levels',
                'Take correction and corrective actions without undue delay based on audit findings',
                'Retain documented information as evidence of the implementation of the audit program and audit results'
              ],
              systemIntegration: 'Integrated with management review, corrective action processes, and competence management'
            },
            {
              element: 'Auditor Competence and Objectivity',
              description: 'Framework for ensuring internal auditors possess necessary competence and maintain objectivity in audit processes.',
              requirements: [
                'Ensure auditors have competence in audit techniques, quality management principles, and relevant technical areas',
                'Maintain auditor independence and objectivity by not auditing their own work',
                'Provide ongoing training and development for internal auditors',
                'Evaluate auditor performance and effectiveness regularly',
                'Establish criteria for auditor qualification and selection',
                'Ensure auditors understand the organization\'s quality management system and audit requirements'
              ],
              systemIntegration: 'Connected to competence management, training systems, and human resource processes'
            }
          ]
        }
      ]
    },
    {
      subheading: '9.3 Management Review',
      text: 'Top management shall review the organization\'s quality management system, at planned intervals, to ensure its continuing suitability, adequacy, effectiveness and alignment with the strategic direction of the organization.',
      requirementsFramework: [
        {
          frameworkType: 'Management Review Framework',
          description: 'Comprehensive framework for conducting systematic management reviews to ensure quality management system effectiveness and strategic alignment.',
          frameworkElements: [
            {
              element: 'Management Review Planning and Inputs',
              description: 'Systematic approach to planning management reviews and ensuring comprehensive input information.',
              requirements: [
                'Conduct management reviews at planned intervals to ensure continuing suitability, adequacy and effectiveness',
                'Include status of actions from previous management reviews as input',
                'Review changes in external and internal issues that are relevant to the quality management system',
                'Evaluate information on performance and effectiveness of the quality management system including customer satisfaction and feedback from interested parties',
                'Assess the extent to which quality objectives have been met',
                'Review process performance and conformity of products and services',
                'Analyze nonconformities and corrective actions effectiveness',
                'Evaluate monitoring and measurement results and internal audit outcomes',
                'Assess performance of external providers and opportunities for improvement'
              ],
              systemIntegration: 'Integrated with performance monitoring, strategic planning, and organizational governance systems'
            },
            {
              element: 'Management Review Outputs and Actions',
              description: 'Framework for ensuring management review outputs lead to appropriate decisions and actions for quality management system improvement.',
              requirements: [
                'Include decisions and actions related to opportunities for improvement in management review outputs',
                'Determine any need for changes to the quality management system based on review findings',
                'Identify resource needs and allocation decisions to support quality management system effectiveness',
                'Make decisions regarding quality policy and quality objectives modifications if needed',
                'Determine actions to address risks and opportunities identified during the review',
                'Assign responsibilities and timelines for implementation of decisions and actions',
                'Retain documented information as evidence of the results of management reviews'
              ],
              systemIntegration: 'Connected to continuous improvement, resource management, and strategic decision-making processes'
            }
          ]
        }
      ]
    }
  ];

  // Section 10: Improvement Content
  const improvementContent = [
    {
      subheading: '10.1 General',
      text: 'The organization shall determine and select opportunities for improvement and implement any necessary actions to meet customer requirements and enhance customer satisfaction.',
      requirementsFramework: [
        {
          frameworkType: 'Improvement Identification Framework',
          description: 'Systematic framework for identifying, evaluating, and selecting improvement opportunities to enhance quality management system effectiveness and customer satisfaction.',
          frameworkElements: [
            {
              element: 'Improvement Opportunity Identification',
              description: 'Comprehensive approach to identifying opportunities for improvement across all aspects of the quality management system.',
              requirements: [
                'Determine and select opportunities for improvement to meet customer requirements and enhance customer satisfaction',
                'Analyze outputs from analysis and evaluation activities to identify improvement opportunities',
                'Review internal audit results, management review outputs, and customer feedback for improvement potential',
                'Evaluate process performance data and nonconformity trends to identify systemic improvement needs',
                'Consider changes in external and internal issues that may present improvement opportunities',
                'Assess the effectiveness of current improvement actions and identify additional opportunities'
              ],
              systemIntegration: 'Integrated with data analysis, management review, customer feedback, and strategic planning systems'
            },
            {
              element: 'Improvement Action Implementation',
              description: 'Framework for implementing selected improvement actions to enhance quality management system performance.',
              requirements: [
                'Implement necessary actions to meet customer requirements and enhance satisfaction',
                'Establish priorities for improvement actions based on impact and feasibility assessments',
                'Assign responsibilities and resources for improvement action implementation',
                'Set timelines and milestones for improvement action completion',
                'Monitor progress of improvement actions and adjust approaches as needed',
                'Evaluate the effectiveness of implemented improvement actions'
              ],
              systemIntegration: 'Connected to resource management, project management, and performance monitoring systems'
            }
          ]
        }
      ]
    },
    {
      subheading: '10.2 Nonconformity and Corrective Action',
      text: 'When a nonconformity occurs, the organization shall react to the nonconformity, evaluate the need for action to eliminate the causes of nonconformity, implement any action needed, and review the effectiveness of any corrective action taken.',
      requirementsFramework: [
        {
          frameworkType: 'Nonconformity Management Framework',
          description: 'Comprehensive framework for managing nonconformities and implementing effective corrective actions to prevent recurrence.',
          frameworkElements: [
            {
              element: 'Nonconformity Response and Control',
              description: 'Systematic approach to responding to and controlling nonconformities when they occur.',
              requirements: [
                'React to the nonconformity by taking action to control and correct it',
                'Deal with the consequences of the nonconformity including customer impact assessment',
                'Evaluate the need for action to eliminate the causes of nonconformity to prevent recurrence',
                'Determine if similar nonconformities exist or could potentially occur elsewhere',
                'Implement immediate containment actions to prevent further nonconforming outputs',
                'Communicate nonconformity status to relevant parties including customers when appropriate'
              ],
              systemIntegration: 'Integrated with process control, customer communication, and risk management systems'
            },
            {
              element: 'Corrective Action Implementation',
              description: 'Framework for implementing corrective actions to eliminate the causes of nonconformities and prevent recurrence.',
              requirements: [
                'Review and analyze the nonconformity to determine root causes',
                'Determine and implement action needed to eliminate causes and prevent recurrence',
                'Evaluate the effectiveness of any corrective action taken',
                'Update risks and opportunities determined during planning if necessary',
                'Make changes to the quality management system if needed based on corrective action outcomes',
                'Retain documented information as evidence of the nature of nonconformities, actions taken, and results of corrective actions'
              ],
              systemIntegration: 'Connected to root cause analysis, change management, and documentation control systems'
            },
            {
              element: 'Corrective Action Effectiveness Review',
              description: 'Systematic approach to reviewing and validating the effectiveness of corrective actions.',
              requirements: [
                'Monitor the implementation of corrective actions to ensure completion',
                'Verify that corrective actions have eliminated the identified root causes',
                'Confirm that similar nonconformities have not recurred after corrective action implementation',
                'Evaluate the overall impact of corrective actions on quality management system performance',
                'Review corrective action effectiveness during management review processes',
                'Implement additional corrective actions if initial actions prove ineffective'
              ],
              systemIntegration: 'Aligned with performance monitoring, management review, and continuous improvement processes'
            }
          ]
        }
      ]
    },
    {
      subheading: '10.3 Continual Improvement',
      text: 'The organization shall continually improve the suitability, adequacy and effectiveness of the quality management system.',
      requirementsFramework: [
        {
          frameworkType: 'Continual Improvement Framework',
          description: 'Systematic framework for continually improving the suitability, adequacy, and effectiveness of the quality management system.',
          frameworkElements: [
            {
              element: 'Systematic Improvement Process',
              description: 'Comprehensive approach to implementing systematic continual improvement across all aspects of the quality management system.',
              requirements: [
                'Continually improve the suitability, adequacy and effectiveness of the quality management system',
                'Consider the results of analysis and evaluation activities as inputs to continual improvement',
                'Use outputs from management review to identify and prioritize improvement opportunities',
                'Consider customer feedback, internal audit results, and performance data for improvement planning',
                'Evaluate the need for actions to address opportunities for improvement',
                'Implement improvements to enhance customer satisfaction and organizational performance'
              ],
              systemIntegration: 'Integrated with all quality management system processes, strategic planning, and organizational governance'
            },
            {
              element: 'Improvement Culture and Innovation',
              description: 'Framework for fostering a culture of improvement and innovation throughout the organization.',
              requirements: [
                'Promote awareness of the importance of continual improvement at all organizational levels',
                'Encourage employee participation in improvement activities and innovation initiatives',
                'Establish mechanisms for capturing and evaluating improvement suggestions from all personnel',
                'Provide training and resources to support improvement capabilities and methodologies',
                'Recognize and reward successful improvement contributions and innovative solutions',
                'Share improvement successes and lessons learned across the organization'
              ],
              systemIntegration: 'Connected to competence development, communication systems, and organizational culture management'
            },
            {
              element: 'Improvement Performance Measurement',
              description: 'Systematic approach to measuring and evaluating the effectiveness of continual improvement efforts.',
              requirements: [
                'Establish metrics and indicators to measure improvement performance and effectiveness',
                'Monitor progress of improvement initiatives and their impact on quality management system performance',
                'Evaluate the return on investment and value creation from improvement activities',
                'Track trends in customer satisfaction, process performance, and organizational capabilities',
                'Report improvement performance to top management and relevant stakeholders',
                'Use improvement performance data to guide future improvement planning and resource allocation'
              ],
              systemIntegration: 'Aligned with performance measurement, management review, and strategic planning systems'
            }
          ]
        }
      ]
    }
  ];

  const renderSupportSection = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {supportContent.title}
          </h2>
          <p className="text-gray-600 mb-6">
            This section establishes the support framework including resources, competence, awareness, communication, and documented information required for effective quality management system operation.
          </p>
        </div>

        {supportContent.sections.map((section, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{section.heading}</h3>
            <p className="text-gray-700 mb-4">{section.text}</p>
            
            {section.systemNote && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-5 w-5 text-blue-400 flex items-center justify-center">
                      <span className="text-sm font-bold">ℹ</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">{section.systemNote}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Subsections */}
            {section.subsections && section.subsections.map((subsection, subIndex) => (
              <div key={subIndex} className="mt-6 border-t border-gray-200 pt-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{subsection.subheading}</h4>
                <p className="text-gray-700 mb-4">{subsection.text}</p>

                {/* Resource Categories */}
                {subsection.resourceCategories && (
                  <div className="space-y-4">
                    {subsection.resourceCategories.map((category, catIndex) => (
                      <div key={catIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h5 className="font-semibold text-gray-900 mb-2">{category.category}</h5>
                        <p className="text-gray-700 text-sm mb-3">{category.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-2">Requirements</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {category.requirements.map((req, reqIndex) => (
                                <li key={reqIndex}>{req}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-2">Management Approach</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {category.management.map((mgmt, mgmtIndex) => (
                                <li key={mgmtIndex}>{mgmt}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-white rounded border">
                          <p className="text-xs text-blue-700"><strong>System Integration:</strong> {category.systemIntegration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Personnel Framework */}
                {subsection.personnelFramework && (
                  <div className="space-y-4">
                    {subsection.personnelFramework.map((aspect, aspectIndex) => (
                      <div key={aspectIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h5 className="font-semibold text-gray-900 mb-2">{aspect.aspect}</h5>
                        <p className="text-gray-700 text-sm mb-3">{aspect.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-2">Key Elements</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {aspect.elements.map((element, elementIndex) => (
                                <li key={elementIndex}>{element}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-2">Implementation</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {aspect.implementation.map((impl, implIndex) => (
                                <li key={implIndex}>{impl}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-white rounded border">
                          <p className="text-xs text-blue-700"><strong>System Integration:</strong> {aspect.systemIntegration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Infrastructure Elements */}
                {subsection.infrastructureElements && (
                  <div className="space-y-4">
                    {subsection.infrastructureElements.map((element, elementIndex) => (
                      <div key={elementIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h5 className="font-semibold text-gray-900 mb-2">{element.element}</h5>
                        <p className="text-gray-700 text-sm mb-3">{element.description}</p>
                        <div className="space-y-3">
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-2">Components</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {element.components.map((component, compIndex) => (
                                <li key={compIndex}>{component}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-2">Requirements</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {element.requirements.map((req, reqIndex) => (
                                <li key={reqIndex}>{req}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-2">Maintenance</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {element.maintenance.map((maint, maintIndex) => (
                                <li key={maintIndex}>{maint}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-white rounded border">
                          <p className="text-xs text-blue-700"><strong>System Integration:</strong> {element.systemIntegration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* Render additional Support Content Part 2 */}
        {supportContentPart2.map((part2Section, part2Index) => (
          <div key={`part2-${part2Index}`} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">{part2Section.subheading}</h4>
            <p className="text-gray-700 mb-4">{part2Section.text}</p>

            {/* Environment Aspects */}
            {part2Section.environmentAspects && (
              <div className="space-y-4">
                <h5 className="font-semibold text-gray-900 mb-3">Environmental Aspects</h5>
                {part2Section.environmentAspects.map((aspect, aspectIndex) => (
                  <div key={aspectIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                    <h6 className="font-semibold text-gray-900 mb-2">{aspect.aspect}</h6>
                    <p className="text-gray-700 text-sm mb-3">{aspect.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h6 className="font-semibold text-gray-800 mb-2">Elements</h6>
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                          {aspect.elements.map((element, elemIndex) => (
                            <li key={elemIndex}>{element}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-semibold text-gray-800 mb-2">Controls</h6>
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                          {aspect.controls.map((control, controlIndex) => (
                            <li key={controlIndex}>{control}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-white rounded border">
                      <p className="text-xs text-blue-700"><strong>System Integration:</strong> {aspect.systemIntegration}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Monitoring Resources */}
            {part2Section.monitoringResources && (
              <div className="space-y-4">
                <h5 className="font-semibold text-gray-900 mb-3">Monitoring Resources</h5>
                {part2Section.monitoringResources.map((resource, resourceIndex) => (
                  <div key={resourceIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                    <h6 className="font-semibold text-gray-900 mb-2">{resource.resourceType}</h6>
                    <p className="text-gray-700 text-sm mb-3">{resource.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <h6 className="font-semibold text-gray-800 mb-2">Equipment</h6>
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                          {resource.equipment.map((equip, equipIndex) => (
                            <li key={equipIndex}>{equip}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-semibold text-gray-800 mb-2">Requirements</h6>
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                          {resource.requirements.map((req, reqIndex) => (
                            <li key={reqIndex}>{req}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-semibold text-gray-800 mb-2">Calibration Management</h6>
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                          {resource.calibrationManagement.map((cal, calIndex) => (
                            <li key={calIndex}>{cal}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-white rounded border">
                      <p className="text-xs text-blue-700"><strong>System Integration:</strong> {resource.systemIntegration}</p>
                    </div>
                  </div>
                ))}

                {/* Measurement Traceability */}
                {part2Section.measurementTraceability && (
                  <div className="border border-gray-200 rounded p-4 bg-blue-50 mt-4">
                    <h6 className="font-semibold text-gray-900 mb-2">Measurement Traceability</h6>
                    <p className="text-gray-700 text-sm mb-3">{part2Section.measurementTraceability.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h6 className="font-semibold text-gray-800 mb-2">Requirements</h6>
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                          {part2Section.measurementTraceability.requirements.map((req, reqIndex) => (
                            <li key={reqIndex}>{req}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-semibold text-gray-800 mb-2">Implementation</h6>
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                          {part2Section.measurementTraceability.implementation.map((impl, implIndex) => (
                            <li key={implIndex}>{impl}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-white rounded border">
                      <p className="text-xs text-blue-700"><strong>System Integration:</strong> {part2Section.measurementTraceability.systemIntegration}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Knowledge Management */}
            {part2Section.knowledgeManagement && (
              <div className="space-y-4">
                <h5 className="font-semibold text-gray-900 mb-3">Knowledge Management</h5>
                {part2Section.knowledgeManagement.map((knowledge, knowledgeIndex) => (
                  <div key={knowledgeIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                    <h6 className="font-semibold text-gray-900 mb-2">{knowledge.knowledgeType}</h6>
                    <p className="text-gray-700 text-sm mb-3">{knowledge.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <h6 className="font-semibold text-gray-800 mb-2">Knowledge Areas</h6>
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                          {knowledge.knowledgeAreas.map((area, areaIndex) => (
                            <li key={areaIndex}>{area}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-semibold text-gray-800 mb-2">Acquisition Methods</h6>
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                          {knowledge.acquisitionMethods.map((method, methodIndex) => (
                            <li key={methodIndex}>{method}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-semibold text-gray-800 mb-2">Preservation Methods</h6>
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                          {knowledge.preservationMethods.map((pres, presIndex) => (
                            <li key={presIndex}>{pres}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-white rounded border">
                      <p className="text-xs text-blue-700"><strong>System Integration:</strong> {knowledge.systemIntegration}</p>
                    </div>
                  </div>
                ))}

                {/* Knowledge Protection */}
                {part2Section.knowledgeProtection && (
                  <div className="border border-gray-200 rounded p-4 bg-yellow-50 mt-4">
                    <h6 className="font-semibold text-gray-900 mb-2">Knowledge Protection</h6>
                    <p className="text-gray-700 text-sm mb-3">{part2Section.knowledgeProtection.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h6 className="font-semibold text-gray-800 mb-2">Protection Methods</h6>
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                          {part2Section.knowledgeProtection.protectionMethods.map((method, methodIndex) => (
                            <li key={methodIndex}>{method}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-semibold text-gray-800 mb-2">Risk Mitigation</h6>
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                          {part2Section.knowledgeProtection.riskMitigation.map((risk, riskIndex) => (
                            <li key={riskIndex}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-white rounded border">
                      <p className="text-xs text-blue-700"><strong>System Integration:</strong> {part2Section.knowledgeProtection.systemIntegration}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Render additional Support Content Part 3 */}
        {supportContentPart3.map((part3Section, part3Index) => (
          <div key={`part3-${part3Index}`} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">{part3Section.subheading}</h4>
            <p className="text-gray-700 mb-4">{part3Section.text}</p>

            {/* Competence Framework */}
            {part3Section.competenceFramework && (
              <div className="space-y-6">
                <h5 className="font-semibold text-gray-900 mb-3">Competence Framework</h5>
                {part3Section.competenceFramework.map((framework, frameworkIndex) => (
                  <div key={frameworkIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                    <h6 className="font-semibold text-gray-900 mb-2">{framework.competenceArea}</h6>
                    <p className="text-gray-700 text-sm mb-4">{framework.description}</p>
                    
                    {/* Competence Categories */}
                    {framework.competenceCategories && framework.competenceCategories.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="mb-6 border border-gray-300 rounded p-4 bg-white">
                        <h6 className="font-semibold text-gray-900 mb-2">{category.category}</h6>
                        <p className="text-gray-700 text-sm mb-4">{category.description}</p>
                        
                        {/* Competence Matrix */}
                        {category.competenceMatrix && category.competenceMatrix.map((matrix, matrixIndex) => (
                          <div key={matrixIndex} className="mb-4 border border-gray-200 rounded p-3 bg-gray-50">
                            <h6 className="font-semibold text-blue-900 mb-3">{matrix.position}</h6>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div>
                                  <h6 className="font-semibold text-gray-800 mb-2">Education Requirements</h6>
                                  <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                    {matrix.educationRequirements.map((edu, eduIndex) => (
                                      <li key={eduIndex}>{edu}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h6 className="font-semibold text-gray-800 mb-2">Experience Requirements</h6>
                                  <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                    {matrix.experienceRequirements.map((exp, expIndex) => (
                                      <li key={expIndex}>{exp}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <h6 className="font-semibold text-gray-800 mb-2">Skill Requirements</h6>
                                  <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                    {matrix.skillRequirements.map((skill, skillIndex) => (
                                      <li key={skillIndex}>{skill}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h6 className="font-semibold text-gray-800 mb-2">Competence Assessment</h6>
                                  <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                    {matrix.competenceAssessment.map((assessment, assessmentIndex) => (
                                      <li key={assessmentIndex}>{assessment}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 p-2 bg-blue-50 rounded border">
                              <p className="text-xs text-blue-700"><strong>System Integration:</strong> {matrix.systemIntegration}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Competence Development */}
            {part3Section.competenceDevelopment && (
              <div className="space-y-4 mt-6">
                <h5 className="font-semibold text-gray-900 mb-3">Competence Development Process</h5>
                <p className="text-gray-700 text-sm mb-4">{part3Section.competenceDevelopment.description}</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {part3Section.competenceDevelopment.developmentProcess.map((process, processIndex) => (
                    <div key={processIndex} className="border border-gray-200 rounded p-4 bg-gradient-to-b from-blue-50 to-white">
                      <h6 className="font-semibold text-blue-900 mb-2">{process.stage}</h6>
                      <p className="text-gray-700 text-sm mb-3">{process.description}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <h6 className="font-semibold text-gray-800 mb-1 text-sm">Activities</h6>
                          <ul className="list-disc list-inside text-gray-700 text-xs space-y-1">
                            {process.activities.map((activity, activityIndex) => (
                              <li key={activityIndex}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-semibold text-gray-800 mb-1 text-sm">Outputs</h6>
                          <ul className="list-disc list-inside text-gray-700 text-xs space-y-1">
                            {process.outputs.map((output, outputIndex) => (
                              <li key={outputIndex}>{output}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-white rounded border">
                        <p className="text-xs text-blue-700"><strong>System Integration:</strong> {process.systemIntegration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competence Records */}
            {part3Section.competenceRecords && (
              <div className="space-y-4 mt-6">
                <h5 className="font-semibold text-gray-900 mb-3">Competence Records Management</h5>
                <p className="text-gray-700 text-sm mb-4">{part3Section.competenceRecords.description}</p>
                
                <div className="space-y-4">
                  {part3Section.competenceRecords.recordTypes.map((recordType, recordIndex) => (
                    <div key={recordIndex} className="border border-gray-200 rounded p-4 bg-yellow-50">
                      <h6 className="font-semibold text-yellow-900 mb-2">{recordType.recordType}</h6>
                      <p className="text-gray-700 text-sm mb-3">{recordType.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="font-semibold text-gray-800 mb-2">Requirements</h6>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                            {recordType.requirements.map((req, reqIndex) => (
                              <li key={reqIndex}>{req}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-semibold text-gray-800 mb-2">Maintenance</h6>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                            {recordType.maintenance.map((maint, maintIndex) => (
                              <li key={maintIndex}>{maint}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-white rounded border">
                        <p className="text-xs text-blue-700"><strong>System Integration:</strong> {recordType.systemIntegration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Render additional Support Content Part 4 */}
        {supportContentPart4.map((part4Section, part4Index) => (
          <div key={`part4-${part4Index}`} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">{part4Section.subheading}</h4>
            <p className="text-gray-700 mb-4">{part4Section.text}</p>

            {/* Awareness Program */}
            {part4Section.awarenessProgram && (
              <div className="space-y-6">
                <h5 className="font-semibold text-gray-900 mb-3">Quality Awareness Program</h5>
                {part4Section.awarenessProgram.map((program, programIndex) => (
                  <div key={programIndex} className="border border-gray-200 rounded p-4 bg-gradient-to-r from-green-50 to-blue-50">
                    <h6 className="font-semibold text-green-900 mb-2">{program.awarenessArea}</h6>
                    <p className="text-gray-700 text-sm mb-4">{program.description}</p>
                    
                    {/* Awareness Elements */}
                    {program.awarenessElements && program.awarenessElements.map((element, elementIndex) => (
                      <div key={elementIndex} className="mb-4 border border-gray-300 rounded p-3 bg-white">
                        <h6 className="font-semibold text-blue-900 mb-2">{element.element}</h6>
                        <p className="text-gray-700 text-sm mb-3">{element.description}</p>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                          {/* Communication Methods */}
                          {element.communicationMethods && (
                            <div>
                              <h6 className="font-semibold text-gray-800 mb-2">Communication Methods</h6>
                              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                {element.communicationMethods.map((method, methodIndex) => (
                                  <li key={methodIndex}>{method}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Application Methods */}
                          {element.applicationMethods && (
                            <div>
                              <h6 className="font-semibold text-gray-800 mb-2">Application Methods</h6>
                              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                {element.applicationMethods.map((method, methodIndex) => (
                                  <li key={methodIndex}>{method}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Verification Methods */}
                          {element.verificationMethods && (
                            <div>
                              <h6 className="font-semibold text-gray-800 mb-2">Verification Methods</h6>
                              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                {element.verificationMethods.map((method, methodIndex) => (
                                  <li key={methodIndex}>{method}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Effectiveness Measures */}
                          {element.effectivenessMeasures && (
                            <div>
                              <h6 className="font-semibold text-gray-800 mb-2">Effectiveness Measures</h6>
                              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                {element.effectivenessMeasures.map((measure, measureIndex) => (
                                  <li key={measureIndex}>{measure}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 p-2 bg-blue-50 rounded border">
                          <p className="text-xs text-blue-700"><strong>System Integration:</strong> {element.systemIntegration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Awareness Delivery */}
            {part4Section.awarenessDelivery && (
              <div className="space-y-4 mt-6">
                <h5 className="font-semibold text-gray-900 mb-3">Awareness Delivery Methods</h5>
                <p className="text-gray-700 text-sm mb-4">{part4Section.awarenessDelivery.description}</p>
                
                <div className="space-y-4">
                  {part4Section.awarenessDelivery.deliveryMethods.map((method, methodIndex) => (
                    <div key={methodIndex} className="border border-gray-200 rounded p-4 bg-gradient-to-r from-purple-50 to-pink-50">
                      <h6 className="font-semibold text-purple-900 mb-2">{method.method}</h6>
                      <p className="text-gray-700 text-sm mb-3">{method.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-2">Components</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {method.components.map((component, componentIndex) => (
                                <li key={componentIndex}>{component}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-white p-2 rounded border">
                            <p className="text-xs text-gray-700"><strong>Frequency:</strong> {method.frequency}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-white p-2 rounded border">
                            <p className="text-xs text-gray-700"><strong>Duration:</strong> {method.duration}</p>
                          </div>
                          <div className="bg-white p-2 rounded border">
                            <p className="text-xs text-gray-700"><strong>Delivery Format:</strong> {method.deliveryFormat}</p>
                          </div>
                          <div className="bg-blue-50 p-2 rounded border">
                            <p className="text-xs text-blue-700"><strong>System Integration:</strong> {method.systemIntegration}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Awareness Assessment */}
            {part4Section.awarenessAssessment && (
              <div className="space-y-4 mt-6">
                <h5 className="font-semibold text-gray-900 mb-3">Awareness Assessment Methods</h5>
                <p className="text-gray-700 text-sm mb-4">{part4Section.awarenessAssessment.description}</p>
                
                <div className="space-y-4">
                  {part4Section.awarenessAssessment.assessmentMethods.map((assessment, assessmentIndex) => (
                    <div key={assessmentIndex} className="border border-gray-200 rounded p-4 bg-gradient-to-r from-orange-50 to-red-50">
                      <h6 className="font-semibold text-orange-900 mb-2">{assessment.method}</h6>
                      <p className="text-gray-700 text-sm mb-3">{assessment.description}</p>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <h6 className="font-semibold text-gray-800 mb-2">Assessment Tools</h6>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                            {assessment.assessmentTools.map((tool, toolIndex) => (
                              <li key={toolIndex}>{tool}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-white p-2 rounded border">
                            <p className="text-xs text-gray-700"><strong>Frequency:</strong> {assessment.frequency}</p>
                          </div>
                          <div className="bg-white p-2 rounded border">
                            <p className="text-xs text-gray-700"><strong>Criteria:</strong> {assessment.criteria}</p>
                          </div>
                          <div className="bg-green-50 p-2 rounded border">
                            <p className="text-xs text-green-700"><strong>Passing Standard:</strong> {assessment.passingStandard}</p>
                          </div>
                          <div className="bg-blue-50 p-2 rounded border">
                            <p className="text-xs text-blue-700"><strong>System Integration:</strong> {assessment.systemIntegration}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Render additional Support Content Part 5 */}
        {supportContentPart5.map((part5Section, part5Index) => (
          <div key={`part5-${part5Index}`} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">{part5Section.subheading}</h4>
            <p className="text-gray-700 mb-4">{part5Section.text}</p>

            {/* Communication Framework */}
            {part5Section.communicationFramework && (
              <div className="space-y-6">
                <h5 className="font-semibold text-gray-900 mb-3">Communication Framework</h5>
                {part5Section.communicationFramework.map((framework, frameworkIndex) => (
                  <div key={frameworkIndex} className="border border-gray-200 rounded p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h6 className="font-semibold text-indigo-900 mb-2">{framework.communicationType}</h6>
                    <p className="text-gray-700 text-sm mb-4">{framework.description}</p>
                    
                    {/* Communication Elements */}
                    {framework.communicationElements && framework.communicationElements.map((element, elementIndex) => (
                      <div key={elementIndex} className="mb-4 border border-gray-300 rounded p-3 bg-white">
                        <h6 className="font-semibold text-purple-900 mb-2">{element.element}</h6>
                        <p className="text-gray-700 text-sm mb-3">{element.description}</p>
                        
                        {/* Communication Details */}
                        {element.communicationDetails && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {/* What to Communicate */}
                            {element.communicationDetails.whatToCommunicate && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">What to Communicate</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.communicationDetails.whatToCommunicate.map((what, whatIndex) => (
                                    <li key={whatIndex}>{what}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* When to Communicate */}
                            {element.communicationDetails.whenToCommunicate && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">When to Communicate</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.communicationDetails.whenToCommunicate.map((when, whenIndex) => (
                                    <li key={whenIndex}>{when}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* With Whom to Communicate */}
                            {element.communicationDetails.withWhomToCommunicate && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">With Whom to Communicate</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.communicationDetails.withWhomToCommunicate.map((whom, whomIndex) => (
                                    <li key={whomIndex}>{whom}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* How to Communicate */}
                            {element.communicationDetails.howToCommunicate && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">How to Communicate</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.communicationDetails.howToCommunicate.map((how, howIndex) => (
                                    <li key={howIndex}>{how}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Who Communicates */}
                            {element.communicationDetails.whoCommunicates && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Who Communicates</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.communicationDetails.whoCommunicates.map((who, whoIndex) => (
                                    <li key={whoIndex}>{who}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-3 p-2 bg-indigo-50 rounded border">
                          <p className="text-xs text-indigo-700"><strong>System Integration:</strong> {element.communicationDetails?.systemIntegration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Communication Planning */}
            {part5Section.communicationPlanning && (
              <div className="space-y-4 mt-6">
                <h5 className="font-semibold text-gray-900 mb-3">Communication Planning Framework</h5>
                <p className="text-gray-700 text-sm mb-4">{part5Section.communicationPlanning.description}</p>
                
                <div className="space-y-4">
                  {part5Section.communicationPlanning.planningElements.map((element, elementIndex) => (
                    <div key={elementIndex} className="border border-gray-200 rounded p-4 bg-gradient-to-r from-teal-50 to-cyan-50">
                      <h6 className="font-semibold text-teal-900 mb-2">{element.element}</h6>
                      <p className="text-gray-700 text-sm mb-3">{element.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="font-semibold text-gray-800 mb-2">Planning Activities</h6>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                            {element.planningActivities.map((activity, activityIndex) => (
                              <li key={activityIndex}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-semibold text-gray-800 mb-2">Planning Outputs</h6>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                            {element.planningOutputs.map((output, outputIndex) => (
                              <li key={outputIndex}>{output}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-2 bg-teal-50 rounded border">
                        <p className="text-xs text-teal-700"><strong>System Integration:</strong> {element.systemIntegration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Render additional Support Content Part 6 */}
        {supportContentPart6.map((part6Section, part6Index) => (
          <div key={`part6-${part6Index}`} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">{part6Section.subheading}</h4>
            <p className="text-gray-700 mb-4">{part6Section.text}</p>

            {/* Documented Information Framework */}
            {part6Section.documentedInformationFramework && (
              <div className="space-y-6">
                <h5 className="font-semibold text-gray-900 mb-3">Documented Information Control Framework</h5>
                {part6Section.documentedInformationFramework.map((framework, frameworkIndex) => (
                  <div key={frameworkIndex} className="border border-gray-200 rounded p-4 bg-gradient-to-r from-slate-50 to-gray-50">
                    <h6 className="font-semibold text-slate-900 mb-2">{framework.informationType}</h6>
                    <p className="text-gray-700 text-sm mb-4">{framework.description}</p>
                    
                    {/* Control Elements */}
                    {framework.controlElements && framework.controlElements.map((element, elementIndex) => (
                      <div key={elementIndex} className="mb-4 border border-gray-300 rounded p-3 bg-white">
                        <h6 className="font-semibold text-gray-900 mb-2">{element.element}</h6>
                        <p className="text-gray-700 text-sm mb-3">{element.description}</p>
                        
                        {/* Control Details */}
                        {element.controlDetails && (
                          <div className="space-y-4">
                            {/* Identification Requirements */}
                            {element.controlDetails.identificationRequirements && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Identification Requirements</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.identificationRequirements.map((req, reqIndex) => (
                                    <li key={reqIndex}>{req}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Classification System */}
                            {element.controlDetails.classificationSystem && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Classification System</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.classificationSystem.map((classification, classIndex) => (
                                    <li key={classIndex}>{classification}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Version Control */}
                            {element.controlDetails.versionControl && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Version Control</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.versionControl.map((version, versionIndex) => (
                                    <li key={versionIndex}>{version}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Access Control */}
                            {element.controlDetails.accessControl && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Access Control</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.accessControl.map((access, accessIndex) => (
                                    <li key={accessIndex}>{access}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Creation Standards */}
                            {element.controlDetails.creationStandards && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Creation Standards</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.creationStandards.map((standard, standardIndex) => (
                                    <li key={standardIndex}>{standard}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Review Process */}
                            {element.controlDetails.reviewProcess && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Review Process</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.reviewProcess.map((review, reviewIndex) => (
                                    <li key={reviewIndex}>{review}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Approval Workflow */}
                            {element.controlDetails.approvalWorkflow && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Approval Workflow</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.approvalWorkflow.map((approval, approvalIndex) => (
                                    <li key={approvalIndex}>{approval}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Authorization Controls */}
                            {element.controlDetails.authorizationControls && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Authorization Controls</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.authorizationControls.map((auth, authIndex) => (
                                    <li key={authIndex}>{auth}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Distribution Methods */}
                            {element.controlDetails.distributionMethods && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Distribution Methods</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.distributionMethods.map((distribution, distributionIndex) => (
                                    <li key={distributionIndex}>{distribution}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Access Management */}
                            {element.controlDetails.accessManagement && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Access Management</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.accessManagement.map((management, managementIndex) => (
                                    <li key={managementIndex}>{management}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Availability Assurance */}
                            {element.controlDetails.availabilityAssurance && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Availability Assurance</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.availabilityAssurance.map((availability, availabilityIndex) => (
                                    <li key={availabilityIndex}>{availability}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Current Version Control */}
                            {element.controlDetails.currentVersionControl && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Current Version Control</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.currentVersionControl.map((current, currentIndex) => (
                                    <li key={currentIndex}>{current}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Review Schedule */}
                            {element.controlDetails.reviewSchedule && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Review Schedule</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.reviewSchedule.map((schedule, scheduleIndex) => (
                                    <li key={scheduleIndex}>{schedule}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Update Triggers */}
                            {element.controlDetails.updateTriggers && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Update Triggers</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.updateTriggers.map((trigger, triggerIndex) => (
                                    <li key={triggerIndex}>{trigger}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Change Management */}
                            {element.controlDetails.changeManagement && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Change Management</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.changeManagement.map((change, changeIndex) => (
                                    <li key={changeIndex}>{change}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Obsolete Control */}
                            {element.controlDetails.obsoleteControl && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Obsolete Control</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.obsoleteControl.map((obsolete, obsoleteIndex) => (
                                    <li key={obsoleteIndex}>{obsolete}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Record Categories */}
                            {element.controlDetails.recordCategories && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Record Categories</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.recordCategories.map((category, categoryIndex) => (
                                    <li key={categoryIndex}>{category}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Identification System */}
                            {element.controlDetails.identificationSystem && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Identification System</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.identificationSystem.map((system, systemIndex) => (
                                    <li key={systemIndex}>{system}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Retention Schedule */}
                            {element.controlDetails.retentionSchedule && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Retention Schedule</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.retentionSchedule.map((retention, retentionIndex) => (
                                    <li key={retentionIndex}>{retention}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Disposal Procedures */}
                            {element.controlDetails.disposalProcedures && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Disposal Procedures</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.disposalProcedures.map((disposal, disposalIndex) => (
                                    <li key={disposalIndex}>{disposal}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Storage Standards */}
                            {element.controlDetails.storageStandards && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Storage Standards</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.storageStandards.map((storage, storageIndex) => (
                                    <li key={storageIndex}>{storage}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Protection Measures */}
                            {element.controlDetails.protectionMeasures && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Protection Measures</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.protectionMeasures.map((protection, protectionIndex) => (
                                    <li key={protectionIndex}>{protection}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Integrity Assurance */}
                            {element.controlDetails.integrityAssurance && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Integrity Assurance</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.integrityAssurance.map((integrity, integrityIndex) => (
                                    <li key={integrityIndex}>{integrity}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Accessibility Maintenance */}
                            {element.controlDetails.accessibilityMaintenance && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Accessibility Maintenance</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.accessibilityMaintenance.map((accessibility, accessibilityIndex) => (
                                    <li key={accessibilityIndex}>{accessibility}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Retrieval Methods */}
                            {element.controlDetails.retrievalMethods && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Retrieval Methods</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.retrievalMethods.map((retrieval, retrievalIndex) => (
                                    <li key={retrievalIndex}>{retrieval}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Access Controls */}
                            {element.controlDetails.accessControls && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Access Controls</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.accessControls.map((control, controlIndex) => (
                                    <li key={controlIndex}>{control}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Usage Monitoring */}
                            {element.controlDetails.usageMonitoring && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Usage Monitoring</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.usageMonitoring.map((usage, usageIndex) => (
                                    <li key={usageIndex}>{usage}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Evidence Management */}
                            {element.controlDetails.evidenceManagement && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Evidence Management</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.evidenceManagement.map((evidence, evidenceIndex) => (
                                    <li key={evidenceIndex}>{evidence}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Organization Structure */}
                            {element.controlDetails.organizationStructure && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Organization Structure</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.organizationStructure.map((organization, organizationIndex) => (
                                    <li key={organizationIndex}>{organization}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Integration Framework */}
                            {element.controlDetails.integrationFramework && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Integration Framework</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.integrationFramework.map((integration, integrationIndex) => (
                                    <li key={integrationIndex}>{integration}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Standardization */}
                            {element.controlDetails.standardization && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Standardization</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.standardization.map((standardization, standardizationIndex) => (
                                    <li key={standardizationIndex}>{standardization}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Accessibility Design */}
                            {element.controlDetails.accessibilityDesign && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Accessibility Design</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.accessibilityDesign.map((design, designIndex) => (
                                    <li key={designIndex}>{design}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Security Controls */}
                            {element.controlDetails.securityControls && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Security Controls</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.securityControls.map((security, securityIndex) => (
                                    <li key={securityIndex}>{security}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Privacy Protection */}
                            {element.controlDetails.privacyProtection && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Privacy Protection</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.privacyProtection.map((privacy, privacyIndex) => (
                                    <li key={privacyIndex}>{privacy}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Risk Management */}
                            {element.controlDetails.riskManagement && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Risk Management</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.riskManagement.map((risk, riskIndex) => (
                                    <li key={riskIndex}>{risk}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Compliance Framework */}
                            {element.controlDetails.complianceFramework && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Compliance Framework</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.controlDetails.complianceFramework.map((compliance, complianceIndex) => (
                                    <li key={complianceIndex}>{compliance}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-3 p-2 bg-slate-50 rounded border">
                          <p className="text-xs text-slate-700"><strong>System Integration:</strong> {element.controlDetails?.systemIntegration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Implementation Framework */}
            {part6Section.implementationFramework && (
              <div className="space-y-4 mt-6">
                <h5 className="font-semibold text-gray-900 mb-3">Implementation Framework</h5>
                <p className="text-gray-700 text-sm mb-4">{part6Section.implementationFramework.description}</p>
                
                <div className="space-y-4">
                  {part6Section.implementationFramework.implementationPhases.map((phase, phaseIndex) => (
                    <div key={phaseIndex} className="border border-gray-200 rounded p-4 bg-gradient-to-r from-emerald-50 to-teal-50">
                      <h6 className="font-semibold text-emerald-900 mb-2">{phase.phase}</h6>
                      <p className="text-gray-700 text-sm mb-3">{phase.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="font-semibold text-gray-800 mb-2">Activities</h6>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                            {phase.activities.map((activity, activityIndex) => (
                              <li key={activityIndex}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-semibold text-gray-800 mb-2">Deliverables</h6>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                            {phase.deliverables.map((deliverable, deliverableIndex) => (
                              <li key={deliverableIndex}>{deliverable}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-2 bg-emerald-50 rounded border">
                        <p className="text-xs text-emerald-700"><strong>System Integration:</strong> {phase.systemIntegration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderOperationSection = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {operationContent.title}
          </h2>
          <p className="text-gray-600 mb-6">
            This section establishes the operational framework for planning, implementing, and controlling processes needed to meet requirements for product and service provision.
          </p>
        </div>

        {operationContent.sections.map((section, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{section.heading}</h3>
            <p className="text-gray-700 mb-4">{section.text}</p>
            
            {section.systemNote && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-5 w-5 text-blue-400 flex items-center justify-center">
                      <span className="text-sm font-bold">ℹ</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">{section.systemNote}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Subsections */}
            {section.subsections && section.subsections.map((subsection, subIndex) => (
              <div key={subIndex} className="mt-6 border-t border-gray-200 pt-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{subsection.subheading}</h4>
                <p className="text-gray-700 mb-4">{subsection.text}</p>

                {/* Operational Planning */}
                {subsection.operationalPlanning && (
                  <div className="space-y-4">
                    {subsection.operationalPlanning.map((planning, planningIndex) => (
                      <div key={planningIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h5 className="font-semibold text-gray-900 mb-2">{planning.planningArea}</h5>
                        <p className="text-gray-700 text-sm mb-3">{planning.description}</p>
                        
                        {/* Planning Elements */}
                        {planning.planningElements && planning.planningElements.map((element, elementIndex) => (
                          <div key={elementIndex} className="mb-4 border border-gray-300 rounded p-3 bg-white">
                            <h6 className="font-semibold text-blue-900 mb-2">{element.element}</h6>
                            <p className="text-gray-700 text-sm mb-3">{element.description}</p>
                            
                            {/* Planning Details */}
                            {element.planningDetails && (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Scope Definition */}
                                {element.planningDetails.scopeDefinition && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Scope Definition</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.planningDetails.scopeDefinition.map((scope, scopeIndex) => (
                                        <li key={scopeIndex}>{scope}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Requirement Management */}
                                {element.planningDetails.requirementManagement && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Requirement Management</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.planningDetails.requirementManagement.map((req, reqIndex) => (
                                        <li key={reqIndex}>{req}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Deliverable Specification */}
                                {element.planningDetails.deliverableSpecification && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Deliverable Specification</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.planningDetails.deliverableSpecification.map((deliverable, deliverableIndex) => (
                                        <li key={deliverableIndex}>{deliverable}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Process Mapping */}
                                {element.planningDetails.processMapping && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Process Mapping</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.planningDetails.processMapping.map((process, processIndex) => (
                                        <li key={processIndex}>{process}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Workflow Design */}
                                {element.planningDetails.workflowDesign && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Workflow Design</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.planningDetails.workflowDesign.map((workflow, workflowIndex) => (
                                        <li key={workflowIndex}>{workflow}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Resource Planning */}
                                {element.planningDetails.resourcePlanning && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Resource Planning</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.planningDetails.resourcePlanning.map((resource, resourceIndex) => (
                                        <li key={resourceIndex}>{resource}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Schedule Development */}
                                {element.planningDetails.scheduleDevelopment && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Schedule Development</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.planningDetails.scheduleDevelopment.map((schedule, scheduleIndex) => (
                                        <li key={scheduleIndex}>{schedule}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Timeline Management */}
                                {element.planningDetails.timelineManagement && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Timeline Management</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.planningDetails.timelineManagement.map((timeline, timelineIndex) => (
                                        <li key={timelineIndex}>{timeline}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Milestone Control */}
                                {element.planningDetails.milestoneControl && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Milestone Control</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.planningDetails.milestoneControl.map((milestone, milestoneIndex) => (
                                        <li key={milestoneIndex}>{milestone}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Quality Standards */}
                                {element.planningDetails.qualityStandards && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Quality Standards</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.planningDetails.qualityStandards.map((standard, standardIndex) => (
                                        <li key={standardIndex}>{standard}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Acceptance Criteria */}
                                {element.planningDetails.acceptanceCriteria && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Acceptance Criteria</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.planningDetails.acceptanceCriteria.map((criteria, criteriaIndex) => (
                                        <li key={criteriaIndex}>{criteria}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Measurement Methods */}
                                {element.planningDetails.measurementMethods && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Measurement Methods</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.planningDetails.measurementMethods.map((method, methodIndex) => (
                                        <li key={methodIndex}>{method}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Control Activities */}
                                {element.planningDetails.controlActivities && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Control Activities</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.planningDetails.controlActivities.map((activity, activityIndex) => (
                                        <li key={activityIndex}>{activity}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Verification Procedures */}
                                {element.planningDetails.verificationProcedures && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Verification Procedures</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.planningDetails.verificationProcedures.map((verification, verificationIndex) => (
                                        <li key={verificationIndex}>{verification}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Quality Assurance */}
                                {element.planningDetails.qualityAssurance && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Quality Assurance</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.planningDetails.qualityAssurance.map((assurance, assuranceIndex) => (
                                        <li key={assuranceIndex}>{assurance}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="mt-3 p-2 bg-blue-50 rounded border">
                              <p className="text-xs text-blue-700"><strong>System Integration:</strong> {element.planningDetails?.systemIntegration}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Risk Management */}
                {subsection.riskManagement && (
                  <div className="space-y-4">
                    {subsection.riskManagement.map((risk, riskIndex) => (
                      <div key={riskIndex} className="border border-gray-200 rounded p-4 bg-gradient-to-r from-red-50 to-orange-50">
                        <h5 className="font-semibold text-red-900 mb-2">{risk.riskCategory}</h5>
                        <p className="text-gray-700 text-sm mb-3">{risk.description}</p>
                        
                        {/* Risk Elements */}
                        {risk.riskElements && risk.riskElements.map((element, elementIndex) => (
                          <div key={elementIndex} className="mb-4 border border-gray-300 rounded p-3 bg-white">
                            <h6 className="font-semibold text-orange-900 mb-2">{element.element}</h6>
                            <p className="text-gray-700 text-sm mb-3">{element.description}</p>
                            
                            {/* Risk Details */}
                            {element.riskDetails && (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Identification Methods */}
                                {element.riskDetails.identificationMethods && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Identification Methods</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.riskDetails.identificationMethods.map((method, methodIndex) => (
                                        <li key={methodIndex}>{method}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Risk Analysis */}
                                {element.riskDetails.riskAnalysis && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Risk Analysis</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.riskDetails.riskAnalysis.map((analysis, analysisIndex) => (
                                        <li key={analysisIndex}>{analysis}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Risk Categorization */}
                                {element.riskDetails.riskCategorization && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Risk Categorization</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.riskDetails.riskCategorization.map((category, categoryIndex) => (
                                        <li key={categoryIndex}>{category}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Mitigation Strategies */}
                                {element.riskDetails.mitigationStrategies && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Mitigation Strategies</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.riskDetails.mitigationStrategies.map((strategy, strategyIndex) => (
                                        <li key={strategyIndex}>{strategy}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Control Measures */}
                                {element.riskDetails.controlMeasures && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Control Measures</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.riskDetails.controlMeasures.map((measure, measureIndex) => (
                                        <li key={measureIndex}>{measure}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Contingency Planning */}
                                {element.riskDetails.contingencyPlanning && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Contingency Planning</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.riskDetails.contingencyPlanning.map((contingency, contingencyIndex) => (
                                        <li key={contingencyIndex}>{contingency}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="mt-3 p-2 bg-red-50 rounded border">
                              <p className="text-xs text-red-700"><strong>System Integration:</strong> {element.riskDetails?.systemIntegration}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Change Control */}
                {subsection.changeControl && (
                  <div className="space-y-4">
                    {subsection.changeControl.map((change, changeIndex) => (
                      <div key={changeIndex} className="border border-gray-200 rounded p-4 bg-gradient-to-r from-purple-50 to-indigo-50">
                        <h5 className="font-semibold text-purple-900 mb-2">{change.controlArea}</h5>
                        <p className="text-gray-700 text-sm mb-3">{change.description}</p>
                        
                        {/* Control Elements */}
                        {change.controlElements && change.controlElements.map((element, elementIndex) => (
                          <div key={elementIndex} className="mb-4 border border-gray-300 rounded p-3 bg-white">
                            <h6 className="font-semibold text-indigo-900 mb-2">{element.element}</h6>
                            <p className="text-gray-700 text-sm mb-3">{element.description}</p>
                            
                            {/* Control Details */}
                            {element.controlDetails && (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Change Request */}
                                {element.controlDetails.changeRequest && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Change Request</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.controlDetails.changeRequest.map((request, requestIndex) => (
                                        <li key={requestIndex}>{request}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Evaluation Criteria */}
                                {element.controlDetails.evaluationCriteria && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Evaluation Criteria</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.controlDetails.evaluationCriteria.map((criteria, criteriaIndex) => (
                                        <li key={criteriaIndex}>{criteria}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Approval Process */}
                                {element.controlDetails.approvalProcess && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Approval Process</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.controlDetails.approvalProcess.map((approval, approvalIndex) => (
                                        <li key={approvalIndex}>{approval}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Implementation Planning */}
                                {element.controlDetails.implementationPlanning && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Implementation Planning</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.controlDetails.implementationPlanning.map((planning, planningIndex) => (
                                        <li key={planningIndex}>{planning}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Monitoring Procedures */}
                                {element.controlDetails.monitoringProcedures && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Monitoring Procedures</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.controlDetails.monitoringProcedures.map((monitoring, monitoringIndex) => (
                                        <li key={monitoringIndex}>{monitoring}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Verification Activities */}
                                {element.controlDetails.verificationActivities && (
                                  <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Verification Activities</h6>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                      {element.controlDetails.verificationActivities.map((verification, verificationIndex) => (
                                        <li key={verificationIndex}>{verification}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="mt-3 p-2 bg-purple-50 rounded border">
                              <p className="text-xs text-purple-700"><strong>System Integration:</strong> {element.controlDetails?.systemIntegration}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* Render additional Operation Content Part 1 */}
        {operationContentPart1.map((part1Section, part1Index) => (
          <div key={`part1-${part1Index}`} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">{part1Section.subheading}</h4>
            <p className="text-gray-700 mb-4">{part1Section.text}</p>

            {/* Operational Framework */}
            {part1Section.operationalFramework && (
              <div className="space-y-6">
                <h5 className="font-semibold text-gray-900 mb-3">Operational Framework</h5>
                {part1Section.operationalFramework.map((framework, frameworkIndex) => (
                  <div key={frameworkIndex} className="border border-gray-200 rounded p-4 bg-gradient-to-r from-green-50 to-emerald-50">
                    <h6 className="font-semibold text-green-900 mb-2">{framework.frameworkType}</h6>
                    <p className="text-gray-700 text-sm mb-4">{framework.description}</p>
                    
                    {/* Framework Elements */}
                    {framework.frameworkElements && framework.frameworkElements.map((element, elementIndex) => (
                      <div key={elementIndex} className="mb-4 border border-gray-300 rounded p-3 bg-white">
                        <h6 className="font-semibold text-emerald-900 mb-2">{element.element}</h6>
                        <p className="text-gray-700 text-sm mb-3">{element.description}</p>
                        
                        {/* Requirements or Controls or Resource Management */}
                        {element.requirements && (
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-2">Requirements</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {element.requirements.map((requirement, requirementIndex) => (
                                <li key={requirementIndex}>{requirement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {element.controls && (
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-2">Controls</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {element.controls.map((control, controlIndex) => (
                                <li key={controlIndex}>{control}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {element.resourceManagement && (
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-2">Resource Management</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {element.resourceManagement.map((resource, resourceIndex) => (
                                <li key={resourceIndex}>{resource}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="mt-3 p-2 bg-green-50 rounded border">
                          <p className="text-xs text-green-700"><strong>System Integration:</strong> {element.systemIntegration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Control Mechanisms */}
            {part1Section.controlMechanisms && (
              <div className="space-y-4 mt-6">
                <h5 className="font-semibold text-gray-900 mb-3">Control Mechanisms</h5>
                <p className="text-gray-700 text-sm mb-4">{part1Section.controlMechanisms.description}</p>
                
                <div className="space-y-4">
                  {part1Section.controlMechanisms.mechanisms.map((mechanism, mechanismIndex) => (
                    <div key={mechanismIndex} className="border border-gray-200 rounded p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
                      <h6 className="font-semibold text-blue-900 mb-2">{mechanism.mechanism}</h6>
                      <p className="text-gray-700 text-sm mb-3">{mechanism.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="font-semibold text-gray-800 mb-2">Activities</h6>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                            {mechanism.activities.map((activity, activityIndex) => (
                              <li key={activityIndex}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-semibold text-gray-800 mb-2">Outputs</h6>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                            {mechanism.outputs.map((output, outputIndex) => (
                              <li key={outputIndex}>{output}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-2 bg-blue-50 rounded border">
                        <p className="text-xs text-blue-700"><strong>System Integration:</strong> {mechanism.systemIntegration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Render additional Operation Content Part 2 */}
        {operationContentPart2.map((part2Section, part2Index) => (
          <div key={`part2-${part2Index}`} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">{part2Section.subheading}</h4>
            <p className="text-gray-700 mb-4">{part2Section.text}</p>

            {/* Requirements Framework */}
            {part2Section.requirementsFramework && (
              <div className="space-y-6">
                <h5 className="font-semibold text-gray-900 mb-3">Requirements Management Framework</h5>
                {part2Section.requirementsFramework.map((framework, frameworkIndex) => (
                  <div key={frameworkIndex} className="border border-gray-200 rounded p-4 bg-gradient-to-r from-yellow-50 to-orange-50">
                    <h6 className="font-semibold text-yellow-900 mb-2">{framework.frameworkType}</h6>
                    <p className="text-gray-700 text-sm mb-4">{framework.description}</p>
                    
                    {/* Communication Elements */}
                    {framework.communicationElements && framework.communicationElements.map((element, elementIndex) => (
                      <div key={elementIndex} className="mb-4 border border-gray-300 rounded p-3 bg-white">
                        <h6 className="font-semibold text-orange-900 mb-2">{element.element}</h6>
                        <p className="text-gray-700 text-sm mb-3">{element.description}</p>
                        
                        {/* Communication Details */}
                        {element.communicationDetails && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Information Types */}
                            {element.communicationDetails.informationTypes && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Information Types</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.communicationDetails.informationTypes.map((info, infoIndex) => (
                                    <li key={infoIndex}>{info}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Communication Methods */}
                            {element.communicationDetails.communicationMethods && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Communication Methods</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.communicationDetails.communicationMethods.map((method, methodIndex) => (
                                    <li key={methodIndex}>{method}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Accuracy Controls */}
                            {element.communicationDetails.accuracyControls && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Accuracy Controls</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.communicationDetails.accuracyControls.map((control, controlIndex) => (
                                    <li key={controlIndex}>{control}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Inquiry Processing */}
                            {element.communicationDetails.inquiryProcessing && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Inquiry Processing</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.communicationDetails.inquiryProcessing.map((inquiry, inquiryIndex) => (
                                    <li key={inquiryIndex}>{inquiry}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Quotation Preparation */}
                            {element.communicationDetails.quotationPreparation && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Quotation Preparation</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.communicationDetails.quotationPreparation.map((quotation, quotationIndex) => (
                                    <li key={quotationIndex}>{quotation}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Response Management */}
                            {element.communicationDetails.responseManagement && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Response Management</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.communicationDetails.responseManagement.map((response, responseIndex) => (
                                    <li key={responseIndex}>{response}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Contract Negotiation */}
                            {element.communicationDetails.contractNegotiation && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Contract Negotiation</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.communicationDetails.contractNegotiation.map((contract, contractIndex) => (
                                    <li key={contractIndex}>{contract}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Order Processing */}
                            {element.communicationDetails.orderProcessing && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Order Processing</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.communicationDetails.orderProcessing.map((order, orderIndex) => (
                                    <li key={orderIndex}>{order}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Delivery Coordination */}
                            {element.communicationDetails.deliveryCoordination && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Delivery Coordination</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.communicationDetails.deliveryCoordination.map((delivery, deliveryIndex) => (
                                    <li key={deliveryIndex}>{delivery}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-3 p-2 bg-yellow-50 rounded border">
                          <p className="text-xs text-yellow-700"><strong>System Integration:</strong> {element.communicationDetails?.systemIntegration}</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Determination Elements */}
                    {framework.determinationElements && framework.determinationElements.map((element, elementIndex) => (
                      <div key={elementIndex} className="mb-4 border border-gray-300 rounded p-3 bg-white">
                        <h6 className="font-semibold text-orange-900 mb-2">{element.element}</h6>
                        <p className="text-gray-700 text-sm mb-3">{element.description}</p>
                        
                        {/* Analysis Details */}
                        {element.analysisDetails && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Requirement Capture */}
                            {element.analysisDetails.requirementCapture && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Requirement Capture</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.analysisDetails.requirementCapture.map((capture, captureIndex) => (
                                    <li key={captureIndex}>{capture}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Requirement Classification */}
                            {element.analysisDetails.requirementClassification && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Requirement Classification</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.analysisDetails.requirementClassification.map((classification, classificationIndex) => (
                                    <li key={classificationIndex}>{classification}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Implied Requirements */}
                            {element.analysisDetails.impliedRequirements && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Implied Requirements</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.analysisDetails.impliedRequirements.map((implied, impliedIndex) => (
                                    <li key={impliedIndex}>{implied}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Regulatory Analysis */}
                            {element.analysisDetails.regulatoryAnalysis && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Regulatory Analysis</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.analysisDetails.regulatoryAnalysis.map((regulatory, regulatoryIndex) => (
                                    <li key={regulatoryIndex}>{regulatory}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Legal Requirements */}
                            {element.analysisDetails.legalRequirements && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Legal Requirements</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.analysisDetails.legalRequirements.map((legal, legalIndex) => (
                                    <li key={legalIndex}>{legal}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Compliance Verification */}
                            {element.analysisDetails.complianceVerification && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Compliance Verification</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.analysisDetails.complianceVerification.map((compliance, complianceIndex) => (
                                    <li key={complianceIndex}>{compliance}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Technical Specification */}
                            {element.analysisDetails.technicalSpecification && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Technical Specification</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.analysisDetails.technicalSpecification.map((technical, technicalIndex) => (
                                    <li key={technicalIndex}>{technical}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Performance Metrics */}
                            {element.analysisDetails.performanceMetrics && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Performance Metrics</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.analysisDetails.performanceMetrics.map((performance, performanceIndex) => (
                                    <li key={performanceIndex}>{performance}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Feasibility Assessment */}
                            {element.analysisDetails.feasibilityAssessment && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Feasibility Assessment</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.analysisDetails.feasibilityAssessment.map((feasibility, feasibilityIndex) => (
                                    <li key={feasibilityIndex}>{feasibility}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-3 p-2 bg-orange-50 rounded border">
                          <p className="text-xs text-orange-700"><strong>System Integration:</strong> {element.analysisDetails?.systemIntegration}</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Review Elements */}
                    {framework.reviewElements && framework.reviewElements.map((element, elementIndex) => (
                      <div key={elementIndex} className="mb-4 border border-gray-300 rounded p-3 bg-white">
                        <h6 className="font-semibold text-red-900 mb-2">{element.element}</h6>
                        <p className="text-gray-700 text-sm mb-3">{element.description}</p>
                        
                        {/* Assessment Details */}
                        {element.assessmentDetails && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Capability Evaluation */}
                            {element.assessmentDetails.capabilityEvaluation && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Capability Evaluation</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.assessmentDetails.capabilityEvaluation.map((capability, capabilityIndex) => (
                                    <li key={capabilityIndex}>{capability}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Gap Analysis */}
                            {element.assessmentDetails.gapAnalysis && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Gap Analysis</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.assessmentDetails.gapAnalysis.map((gap, gapIndex) => (
                                    <li key={gapIndex}>{gap}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Mitigation Planning */}
                            {element.assessmentDetails.mitigationPlanning && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Mitigation Planning</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.assessmentDetails.mitigationPlanning.map((mitigation, mitigationIndex) => (
                                    <li key={mitigationIndex}>{mitigation}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Commitment Review */}
                            {element.assessmentDetails.commitmentReview && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Commitment Review</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.assessmentDetails.commitmentReview.map((commitment, commitmentIndex) => (
                                    <li key={commitmentIndex}>{commitment}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Authorization Process */}
                            {element.assessmentDetails.authorizationProcess && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Authorization Process</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.assessmentDetails.authorizationProcess.map((authorization, authorizationIndex) => (
                                    <li key={authorizationIndex}>{authorization}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Documentation Requirements */}
                            {element.assessmentDetails.documentationRequirements && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Documentation Requirements</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.assessmentDetails.documentationRequirements.map((documentation, documentationIndex) => (
                                    <li key={documentationIndex}>{documentation}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Change Identification */}
                            {element.assessmentDetails.changeIdentification && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Change Identification</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.assessmentDetails.changeIdentification.map((change, changeIndex) => (
                                    <li key={changeIndex}>{change}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Change Evaluation */}
                            {element.assessmentDetails.changeEvaluation && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Change Evaluation</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.assessmentDetails.changeEvaluation.map((evaluation, evaluationIndex) => (
                                    <li key={evaluationIndex}>{evaluation}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Change Implementation */}
                            {element.assessmentDetails.changeImplementation && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">Change Implementation</h6>
                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                  {element.assessmentDetails.changeImplementation.map((implementation, implementationIndex) => (
                                    <li key={implementationIndex}>{implementation}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-3 p-2 bg-red-50 rounded border">
                          <p className="text-xs text-red-700"><strong>System Integration:</strong> {element.assessmentDetails?.systemIntegration}</p>
                        </div>
                      </div>
                    ))}

                    {/* Framework Elements for Design and Development */}
                    {framework.frameworkElements && framework.frameworkElements.map((element, elementIndex) => (
                      <div key={elementIndex} className="mb-4 border border-gray-300 rounded p-3 bg-white">
                        <h6 className="font-semibold text-orange-900 mb-2">{element.element}</h6>
                        <p className="text-gray-700 text-sm mb-3">{element.description}</p>
                        
                        {/* Requirements */}
                        {element.requirements && (
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-2">Requirements</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {element.requirements.map((requirement, requirementIndex) => (
                                <li key={requirementIndex}>{requirement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* System Integration */}
                        <div className="mt-3 p-2 bg-blue-50 rounded">
                          <p className="text-xs text-blue-700"><strong>System Integration:</strong> {element.systemIntegration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Management Procedures */}
            {part2Section.managementProcedures && (
              <div className="space-y-4 mt-6">
                <h5 className="font-semibold text-gray-900 mb-3">Management Procedures</h5>
                <p className="text-gray-700 text-sm mb-4">{part2Section.managementProcedures.description}</p>
                
                <div className="space-y-4">
                  {part2Section.managementProcedures.procedures.map((procedure, procedureIndex) => (
                    <div key={procedureIndex} className="border border-gray-200 rounded p-4 bg-gradient-to-r from-purple-50 to-pink-50">
                      <h6 className="font-semibold text-purple-900 mb-2">{procedure.procedure}</h6>
                      <p className="text-gray-700 text-sm mb-3">{procedure.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="font-semibold text-gray-800 mb-2">Activities</h6>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                            {procedure.activities.map((activity, activityIndex) => (
                              <li key={activityIndex}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-semibold text-gray-800 mb-2">Outputs</h6>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                            {procedure.outputs.map((output, outputIndex) => (
                              <li key={outputIndex}>{output}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-2 bg-purple-50 rounded border">
                        <p className="text-xs text-purple-700"><strong>System Integration:</strong> {procedure.systemIntegration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPlanningSection = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {planningContent.title}
          </h2>
          <p className="text-gray-600 mb-6">
            This section establishes the framework for risk-based thinking, quality objectives planning, and systematic change management within the quality management system.
          </p>
        </div>

        {planningContent.sections.map((section, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{section.heading}</h3>
            <p className="text-gray-700 mb-4">{section.text}</p>
            
            {section.systemNote && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-5 w-5 text-blue-400 flex items-center justify-center">
                      <span className="text-sm font-bold">ℹ</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">{section.systemNote}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Subsections */}
            {section.subsections && section.subsections.map((subsection, subIndex) => (
              <div key={subIndex} className="mt-6 border-t border-gray-200 pt-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{subsection.subheading}</h4>
                <p className="text-gray-700 mb-4">{subsection.text}</p>

                {/* Risk Categories */}
                {subsection.riskCategories && (
                  <div className="space-y-4">
                    {subsection.riskCategories.map((category, catIndex) => (
                      <div key={catIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h5 className="font-semibold text-gray-900 mb-2">{category.category}</h5>
                        <p className="text-gray-700 text-sm mb-3">{category.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h6 className="font-semibold text-red-800 mb-2">Risk Examples</h6>
                            <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                              {category.examples.map((example, exampleIndex) => (
                                <li key={exampleIndex}>{example}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-semibold text-green-800 mb-2">Opportunities</h6>
                            <ul className="list-disc list-inside text-green-700 text-sm space-y-1">
                              {category.opportunities.map((opportunity, oppIndex) => (
                                <li key={oppIndex}>{opportunity}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-white rounded border">
                          <p className="text-xs text-blue-700"><strong>System Integration:</strong> {category.systemIntegration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Assessment Criteria */}
                {subsection.assessmentCriteria && (
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">Likelihood Assessment</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {subsection.assessmentCriteria.likelihood.map((item, itemIndex) => (
                              <tr key={itemIndex}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.level}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{item.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.probability}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">Impact Assessment</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consequences</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {subsection.assessmentCriteria.impact.map((item, itemIndex) => (
                              <tr key={itemIndex}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.level}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{item.description}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{item.consequences}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">Risk Matrix</h5>
                      <div className="space-y-2">
                        {subsection.assessmentCriteria.riskMatrix.map((matrix, matrixIndex) => (
                          <div key={matrixIndex} className="border border-gray-200 rounded p-3 bg-gray-50">
                            <span className="font-semibold text-gray-900">{matrix.risk}:</span>
                            <span className="text-gray-700 ml-2">{matrix.action}</span>
                            <span className="text-blue-700 ml-4"><strong>Resources:</strong> {matrix.resources}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Treatment Strategies */}
                {subsection.treatmentStrategies && (
                  <div className="space-y-4">
                    {subsection.treatmentStrategies.map((strategy, stratIndex) => (
                      <div key={stratIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h5 className="font-semibold text-gray-900 mb-2">{strategy.strategy}</h5>
                        <p className="text-gray-700 text-sm mb-3">{strategy.description}</p>
                        <div className="mb-3">
                          <h6 className="font-semibold text-gray-800 mb-1">Examples</h6>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                            {strategy.examples.map((example, exampleIndex) => (
                              <li key={exampleIndex}>{example}</li>
                            ))}
                          </ul>
                        </div>
                        <p className="text-green-700 text-sm mb-2"><strong>Applicability:</strong> {strategy.applicability}</p>
                        <p className="text-blue-700 text-sm"><strong>System Integration:</strong> {strategy.systemIntegration}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Objective Categories */}
                {subsection.objectiveCategories && (
                  <div className="space-y-4">
                    {subsection.objectiveCategories.map((category, catIndex) => (
                      <div key={catIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h5 className="font-semibold text-gray-900 mb-2">{category.category}</h5>
                        <p className="text-gray-700 text-sm mb-3">{category.description}</p>
                        <div className="space-y-3">
                          {category.objectives.map((objective, objIndex) => (
                            <div key={objIndex} className="border border-gray-100 rounded p-3 bg-white">
                              <h6 className="font-semibold text-gray-900 mb-2">{objective.objective}</h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div><strong>Target:</strong> {objective.target}</div>
                                <div><strong>Responsibility:</strong> {objective.responsibility}</div>
                                <div><strong>Measurement:</strong> {objective.measurement}</div>
                                <div><strong>Resources:</strong> {objective.resources}</div>
                              </div>
                              <div className="mt-2 p-2 bg-blue-50 rounded">
                                <p className="text-xs text-blue-700"><strong>System Integration:</strong> {objective.systemIntegration}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Deployment Process */}
                {subsection.deploymentProcess && (
                  <div className="space-y-4">
                    {subsection.deploymentProcess.map((phase, phaseIndex) => (
                      <div key={phaseIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h5 className="font-semibold text-gray-900 mb-2">{phase.phase}</h5>
                        <p className="text-gray-700 text-sm mb-3">{phase.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-1">Activities</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {phase.activities.map((activity, actIndex) => (
                                <li key={actIndex}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-1">Participants</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {phase.participants.map((participant, partIndex) => (
                                <li key={partIndex}>{participant}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div><strong>Timeline:</strong> {phase.timeline}</div>
                          <div><strong>Outputs:</strong> {phase.outputs.join(', ')}</div>
                          <div><strong>System:</strong> {phase.systemIntegration}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Monitoring Framework */}
                {subsection.monitoringFramework && (
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">Monitoring Frequency</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interval</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scope</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Examples</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {subsection.monitoringFramework.frequency.map((freq, freqIndex) => (
                              <tr key={freqIndex}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{freq.interval}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{freq.scope}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{freq.examples.join(', ')}</td>
                                <td className="px-6 py-4 text-sm text-blue-700">{freq.system}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">Review Process</h5>
                      <div className="space-y-3">
                        {subsection.monitoringFramework.reviewProcess.map((process, processIndex) => (
                          <div key={processIndex} className="border border-gray-200 rounded p-3 bg-gray-50">
                            <h6 className="font-semibold text-gray-900 mb-2">{process.step}</h6>
                            <p className="text-gray-700 text-sm mb-2">{process.description}</p>
                            <div className="mb-2">
                              <strong className="text-gray-800 text-sm">Activities:</strong>
                              <ul className="list-disc list-inside text-gray-700 text-sm mt-1">
                                {process.activities.map((activity, actIndex) => (
                                  <li key={actIndex}>{activity}</li>
                                ))}
                              </ul>
                            </div>
                            <p className="text-blue-700 text-sm"><strong>System Integration:</strong> {process.systemIntegration}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Change Types */}
                {subsection.changeTypes && (
                  <div className="space-y-4">
                    {subsection.changeTypes.map((changeType, typeIndex) => (
                      <div key={typeIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h5 className="font-semibold text-gray-900 mb-2">{changeType.type}</h5>
                        <p className="text-gray-700 text-sm mb-3">{changeType.description}</p>
                        <div className="mb-3">
                          <h6 className="font-semibold text-gray-800 mb-1">Examples</h6>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                            {changeType.examples.map((example, exampleIndex) => (
                              <li key={exampleIndex}>{example}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div><strong>Approval Level:</strong> {changeType.approvalLevel}</div>
                          <div><strong>Risk Assessment:</strong> {changeType.riskAssessment}</div>
                        </div>
                        <div className="mt-3 p-2 bg-white rounded border">
                          <p className="text-xs text-blue-700"><strong>System Integration:</strong> {changeType.systemIntegration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Change Process */}
                {subsection.changeProcess && (
                  <div className="space-y-4">
                    {subsection.changeProcess.map((stage, stageIndex) => (
                      <div key={stageIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h5 className="font-semibold text-gray-900 mb-2">{stage.stage}</h5>
                        <p className="text-gray-700 text-sm mb-3">{stage.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-1">Activities</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {stage.activities.map((activity, actIndex) => (
                                <li key={actIndex}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-1">Deliverables</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {stage.deliverables.map((deliverable, delIndex) => (
                                <li key={delIndex}>{deliverable}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div><strong>Timeline:</strong> {stage.timeline}</div>
                          <div><strong>Approvals:</strong> {stage.approvals.join(', ')}</div>
                          <div><strong>System:</strong> {stage.systemIntegration}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Communication Strategy */}
                {subsection.communicationStrategy && (
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-900 mb-3">Communication Strategy</h5>
                    {subsection.communicationStrategy.map((comm, commIndex) => (
                      <div key={commIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h6 className="font-semibold text-gray-900 mb-2">{comm.phase}</h6>
                        <p className="text-gray-700 text-sm mb-3">{comm.purpose}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <strong className="text-gray-800 text-sm">Methods:</strong>
                            <ul className="list-disc list-inside text-gray-700 text-sm mt-1">
                              {comm.methods.map((method, methodIndex) => (
                                <li key={methodIndex}>{method}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <strong className="text-gray-800 text-sm">Audience:</strong>
                            <ul className="list-disc list-inside text-gray-700 text-sm mt-1">
                              {comm.audience.map((aud, audIndex) => (
                                <li key={audIndex}>{aud}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div><strong>Timeline:</strong> {comm.timeline}</div>
                          <div><strong>System:</strong> {comm.systemIntegration}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Training Approach */}
                {subsection.trainingApproach && (
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-900 mb-3">Training Approach</h5>
                    {subsection.trainingApproach.map((training, trainIndex) => (
                      <div key={trainIndex} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h6 className="font-semibold text-gray-900 mb-2">{training.method}</h6>
                        <p className="text-gray-700 text-sm mb-3">{training.description}</p>
                        <div className="mb-3">
                          <strong className="text-gray-800 text-sm">Delivery Methods:</strong>
                          <ul className="list-disc list-inside text-gray-700 text-sm mt-1">
                            {training.delivery.map((delivery, delIndex) => (
                              <li key={delIndex}>{delivery}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div><strong>Assessment:</strong> {training.assessment}</div>
                          <div><strong>System:</strong> {training.systemIntegration}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderQMSSection = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {qmsContent.title}
          </h2>
          <p className="text-gray-600 mb-6">
            This section establishes the quality management system requirements including organizational context, stakeholder needs, scope determination, and process approach.
          </p>
        </div>

        {qmsContent.sections.map((section, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{section.heading}</h3>
            <p className="text-gray-700 mb-4">{section.text}</p>
            
            {section.systemNote && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-5 w-5 text-blue-400 flex items-center justify-center">
                      <span className="text-sm font-bold">ℹ</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">{section.systemNote}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Context Analysis for 4.1 */}
            {section.contextAnalysis && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Internal Context Factors</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.contextAnalysis.internal.map((factor, idx) => (
                      <div key={idx} className="border border-gray-200 rounded p-4">
                        <h5 className="font-semibold text-gray-900 mb-2">{factor.factor}</h5>
                        <p className="text-gray-700 text-sm mb-2">{factor.description}</p>
                        <p className="text-green-700 text-sm mb-1"><strong>Impact:</strong> {factor.impact}</p>
                        <p className="text-blue-700 text-sm"><strong>Monitoring:</strong> {factor.monitoring}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">External Context Factors</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.contextAnalysis.external.map((factor, idx) => (
                      <div key={idx} className="border border-gray-200 rounded p-4">
                        <h5 className="font-semibold text-gray-900 mb-2">{factor.factor}</h5>
                        <p className="text-gray-700 text-sm mb-2">{factor.description}</p>
                        <p className="text-green-700 text-sm mb-1"><strong>Impact:</strong> {factor.impact}</p>
                        <p className="text-blue-700 text-sm"><strong>Monitoring:</strong> {factor.monitoring}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stakeholder Analysis for 4.2 */}
            {section.stakeholders && (
              <div className="space-y-4">
                {section.stakeholders.map((stakeholder, idx) => (
                  <div key={idx} className="border border-gray-200 rounded p-4 bg-gray-50">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">{stakeholder.party}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-2">Needs</h5>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {stakeholder.needs.map((need, needIdx) => (
                            <li key={needIdx}>{need}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-2">Expectations</h5>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {stakeholder.expectations.map((expectation, expIdx) => (
                            <li key={expIdx}>{expectation}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-2">Requirements</h5>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {stakeholder.requirements.map((requirement, reqIdx) => (
                            <li key={reqIdx}>{requirement}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Scope Definition for 4.3 */}
            {section.scope && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-lg font-semibold text-green-900 mb-3">Included in Scope</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {section.scope.included.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-red-900 mb-3">Excluded from Scope</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {section.scope.excluded.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Locations</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {section.scope.locations.map((location, idx) => (
                        <li key={idx}>{location}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Applicable Standards</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {section.scope.standards.map((standard, idx) => (
                        <li key={idx}>{standard}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Process Information for 4.4 */}
            {section.processes && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Core Processes</h4>
                  <div className="space-y-4">
                    {section.processes.core.map((process, idx) => (
                      <div key={idx} className="border border-blue-200 rounded p-4 bg-blue-50">
                        <h5 className="font-semibold text-gray-900 mb-2">{process.name}</h5>
                        <p className="text-gray-700 text-sm mb-3">{process.purpose}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-semibold text-gray-800 mb-1">Inputs:</p>
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                              {process.inputs.map((input, inputIdx) => (
                                <li key={inputIdx}>{input}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 mb-1">Outputs:</p>
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                              {process.outputs.map((output, outputIdx) => (
                                <li key={outputIdx}>{output}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-white rounded border">
                          <p className="text-xs text-blue-700"><strong>System Integration:</strong> {process.systemIntegration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Support Processes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.processes.support.map((process, idx) => (
                      <div key={idx} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h5 className="font-semibold text-gray-900 mb-2">{process.name}</h5>
                        <p className="text-gray-700 text-sm mb-3">{process.purpose}</p>
                        <div className="text-sm">
                          <p className="font-semibold text-gray-800 mb-1">Key Activities:</p>
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {process.activities.map((activity, actIdx) => (
                              <li key={actIdx}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-3 p-2 bg-white rounded border">
                          <p className="text-xs text-gray-600"><strong>System Integration:</strong> {process.systemIntegration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPerformanceSection = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Section 9: Performance Evaluation
          </h2>
          <p className="text-gray-700 mb-6">
            This section establishes requirements for monitoring, measurement, analysis, evaluation, internal audit, and management review to ensure the quality management system performs effectively and continues to meet organizational objectives.
          </p>
        </div>

        {/* Render Performance Content */}
        {performanceContent.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">{section.subheading}</h4>
            <p className="text-gray-700 mb-4">{section.text}</p>

            {/* Requirements Framework */}
            {section.requirementsFramework && (
              <div className="space-y-6">
                <h5 className="font-semibold text-gray-900 mb-3">Performance Evaluation Framework</h5>
                {section.requirementsFramework.map((framework, frameworkIndex) => (
                  <div key={frameworkIndex} className="border border-gray-200 rounded p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h6 className="font-semibold text-blue-900 mb-2">{framework.frameworkType}</h6>
                    <p className="text-gray-700 text-sm mb-4">{framework.description}</p>
                    
                    {/* Framework Elements */}
                    {framework.frameworkElements && framework.frameworkElements.map((element, elementIndex) => (
                      <div key={elementIndex} className="mb-4 border border-gray-300 rounded p-3 bg-white">
                        <h6 className="font-semibold text-indigo-900 mb-2">{element.element}</h6>
                        <p className="text-gray-700 text-sm mb-3">{element.description}</p>
                        
                        {/* Requirements */}
                        {element.requirements && (
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-2">Requirements</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {element.requirements.map((requirement, requirementIndex) => (
                                <li key={requirementIndex}>{requirement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* System Integration */}
                        <div className="mt-3 p-2 bg-blue-50 rounded">
                          <p className="text-xs text-blue-700"><strong>System Integration:</strong> {element.systemIntegration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderImprovementSection = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Section 10: Improvement
          </h2>
          <p className="text-gray-700 mb-6">
            This section establishes requirements for identifying improvement opportunities, managing nonconformities and corrective actions, and implementing continual improvement to enhance quality management system effectiveness and customer satisfaction.
          </p>
        </div>

        {/* Render Improvement Content */}
        {improvementContent.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">{section.subheading}</h4>
            <p className="text-gray-700 mb-4">{section.text}</p>

            {/* Requirements Framework */}
            {section.requirementsFramework && (
              <div className="space-y-6">
                <h5 className="font-semibold text-gray-900 mb-3">Improvement Framework</h5>
                {section.requirementsFramework.map((framework, frameworkIndex) => (
                  <div key={frameworkIndex} className="border border-gray-200 rounded p-4 bg-gradient-to-r from-green-50 to-emerald-50">
                    <h6 className="font-semibold text-green-900 mb-2">{framework.frameworkType}</h6>
                    <p className="text-gray-700 text-sm mb-4">{framework.description}</p>
                    
                    {/* Framework Elements */}
                    {framework.frameworkElements && framework.frameworkElements.map((element, elementIndex) => (
                      <div key={elementIndex} className="mb-4 border border-gray-300 rounded p-3 bg-white">
                        <h6 className="font-semibold text-emerald-900 mb-2">{element.element}</h6>
                        <p className="text-gray-700 text-sm mb-3">{element.description}</p>
                        
                        {/* Requirements */}
                        {element.requirements && (
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-2">Requirements</h6>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {element.requirements.map((requirement, requirementIndex) => (
                                <li key={requirementIndex}>{requirement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* System Integration */}
                        <div className="mt-3 p-2 bg-green-50 rounded">
                          <p className="text-xs text-green-700"><strong>System Integration:</strong> {element.systemIntegration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSectionSelector = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      maxWidth: '1200px'
    }}>
      {filteredContent.map(section => (
        <div
          key={section.id}
          onClick={() => setSelectedSection(section.id)}
          style={{
            background: selectedSection === section.id ? '#dbeafe' : 'white',
            border: selectedSection === section.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '25px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
        >
          {section.systemRelevant && (
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: '#22c55e',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              padding: '4px 8px',
              borderRadius: '12px',
              textTransform: 'uppercase'
            }}>
              System
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <span style={{ fontSize: '32px' }}>{section.icon}</span>
            <div>
              <h3 style={{
                margin: '0 0 5px 0',
                fontSize: '18px',
                fontWeight: 'bold',
                color: selectedSection === section.id ? '#1e40af' : '#1f2937'
              }}>
                {section.title}
              </h3>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#6b7280'
              }}>
                {section.subtitle}
              </p>
            </div>
          </div>

          <div style={{
            background: selectedSection === section.id ? '#3b82f6' : '#f3f4f6',
            color: selectedSection === section.id ? 'white' : '#6b7280',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            {selectedSection === section.id ? 'Currently Viewing' : 'Click to View'}
          </div>
        </div>
      ))}
    </div>
  );

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
            ISO 9001:2015 Quality Manual
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280', 
            margin: 0 
          }}>
            Comprehensive quality management system documentation
          </p>
        </div>
        
        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/quality/standards/iso9001')}
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
            ← ISO 9001
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

      {/* Search Bar */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ position: 'relative', maxWidth: '500px' }}>
          <input
            type="text"
            placeholder="Search quality manual sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 45px 12px 20px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
          <span style={{
            position: 'absolute',
            right: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '20px',
            color: '#6b7280'
          }}>
            🔍
          </span>
        </div>
      </div>

      {/* Content Area */}
      {selectedSection === 'overview' ? renderOverviewSection() : 
       selectedSection === 'scope' ? renderScopeContextSection() :
       selectedSection === 'references' ? renderReferencesSection() :
       selectedSection === 'terms' ? renderTermsSection() :
       selectedSection === 'qms' ? renderQMSSection() :
       selectedSection === 'leadership' ? renderLeadershipSection() :
       selectedSection === 'planning' ? renderPlanningSection() :
       selectedSection === 'support' ? renderSupportSection() :
       selectedSection === 'operation' ? renderOperationSection() :
       selectedSection === 'evaluation' ? renderPerformanceSection() :
       selectedSection === 'improvement' ? renderImprovementSection() :
       renderSectionSelector()}
    </div>
  );
}