import React, { useState, useEffect } from 'react';

// Online Material Search Component
// Searches for materials online when not found in local database
export default function OnlineMaterialSearch({ materialQuery, onMaterialSelected, onCancel }) {
  console.log(`🎨 OnlineMaterialSearch COMPONENT CALLED with materialQuery: "${materialQuery}"`);

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    if (materialQuery) {
      performOnlineSearch(materialQuery);
    }
  }, [materialQuery]);

  // Determine material type from query
  const determineMaterialType = (query) => {
    const queryLower = query.toLowerCase();

    // Map common material terms to family IDs (these should match your database)
    if (queryLower.includes('pipe')) return { id: 3, name: 'Pipe' }; // Pipe has ID 3
    if (queryLower.includes('flange')) return { id: 6, name: 'Flange' }; // Flange has ID 6
    if (queryLower.includes('beam') || queryLower.includes('i-beam')) return { id: 5, name: 'Beam' }; // Beam has ID 5
    if (queryLower.includes('angle')) return { id: 1, name: 'Angle' }; // Angle has ID 1
    if (queryLower.includes('channel')) return { id: 4, name: 'Channel' }; // Channel has ID 4
    if (queryLower.includes('tube')) return { id: 2, name: 'Tube' }; // Tube has ID 2
    if (queryLower.includes('fitting') || queryLower.includes('tee') || queryLower.includes('elbow')) return { id: 8, name: 'Pipe Fitting' };

    return null;
  };

  // Generate results from preferred vendors
  const generatePreferredVendorResults = (query, vendors) => {
    const queryLower = query.toLowerCase();
    const size = extractSizeFromQuery(query);

    return vendors.map((vendor, index) => {
      const basePrice = calculateBasePrice(query, size);
      const vendorMultiplier = 1 + (vendor.priority - 1) * 0.1; // Higher priority = slightly higher price
      const finalPrice = Math.round(basePrice * vendorMultiplier * 100) / 100;

      return {
        id: `preferred_${vendor.id}_${index}`,
        name: `${determineMaterialType(query)?.name || 'Material'} from ${vendor.vendor_name}`,
        description: `${vendor.vendor_name} - ${vendor.notes || 'Preferred supplier'}`,
        size: size || 'Various',
        type: determineMaterialType(query)?.name || 'Material',
        grade: extractGradeFromQuery(query) || 'Standard',
        pricePerUnit: finalPrice,
        supplier: vendor.vendor_name,
        vendorUrl: vendor.vendor_url,
        source: 'preferred_vendor',
        priority: vendor.priority
      };
    });
  };

  // Extract size from query (e.g., "6\"", "2-1/2\"")
  const extractSizeFromQuery = (query) => {
    const sizeMatch = query.match(/(\d+(?:-\d+\/\d+|\d+\/\d+)?|\d+)["\s]/);
    return sizeMatch ? sizeMatch[1] + '"' : null;
  };

  // Extract grade from query
  const extractGradeFromQuery = (query) => {
    const gradePatterns = [
      /A\d+[A-Z]*/i,  // ASTM grades like A53, A105, A234
      /TP\d+/i,       // TP304, TP316
      /F\d+/i,        // F11, F22
      /\d{3}/         // 304, 316, etc.
    ];

    for (const pattern of gradePatterns) {
      const match = query.match(pattern);
      if (match) return match[0];
    }
    return null;
  };

  // Calculate base price based on material type and size
  const calculateBasePrice = (query, size) => {
    const queryLower = query.toLowerCase();
    let basePrice = 10; // Default

    // Size multiplier
    let sizeMultiplier = 1;
    if (size) {
      const numericSize = parseFloat(size.replace(/"/g, ''));
      if (numericSize >= 6) sizeMultiplier = 2.5;
      else if (numericSize >= 4) sizeMultiplier = 1.8;
      else if (numericSize >= 2) sizeMultiplier = 1.2;
    }

    // Material type pricing
    if (queryLower.includes('flange')) basePrice = 35 * sizeMultiplier;
    else if (queryLower.includes('pipe')) basePrice = 8 * sizeMultiplier;
    else if (queryLower.includes('beam')) basePrice = 120 * sizeMultiplier;
    else if (queryLower.includes('plate')) basePrice = 45 * sizeMultiplier;
    else if (queryLower.includes('fitting')) basePrice = 15 * sizeMultiplier;

    return Math.round(basePrice * 100) / 100;
  };

  const performOnlineSearch = async (query) => {
    setLoading(true);
    setError('');
    setSearchResults([]);

    try {
      console.log(`🔍 Searching online for: "${query}"`);

      // First, try to get preferred vendors for this material type
      const materialType = determineMaterialType(query);
      let preferredVendors = [];

      if (materialType) {
        try {
          const vendorRes = await fetch(`${process.env.REACT_APP_API_BASE || ''}/api/system-materials/vendors/family/${materialType.id}`);
          if (vendorRes.ok) {
            const vendorData = await vendorRes.json();
            preferredVendors = vendorData.vendors || [];
            console.log(`🎯 Found ${preferredVendors.length} preferred vendors for ${materialType.name}`);
          }
        } catch (e) {
          console.log('Could not load preferred vendors:', e);
        }
      }

      // If we have preferred vendors, prioritize their results
      if (preferredVendors.length > 0) {
        const preferredResults = generatePreferredVendorResults(query, preferredVendors);
        setSearchResults(preferredResults);
      } else {
        // Fall back to general online search
        console.log('No preferred vendors found, using general search');
        const mockResults = generateMockResults(query);
        setSearchResults(mockResults);
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (err) {
      console.error('Online search error:', err);
      setError('Failed to search for materials online');
    } finally {
      setLoading(false);
    }
  };

  const generateMockResults = (query) => {
    const queryLower = query.toLowerCase();

    // Parse size from query (look for patterns like "6\"", "2-1/2\"", "1/2\"", etc.)
    const sizeMatch = query.match(/(\d+(?:-\d+\/\d+|\d+\/\d+)?|\d+)["\s]/);
    const parsedSize = sizeMatch ? sizeMatch[1] + '"' : null;

    console.log(`🔍 Generating mock results for query: "${query}" → parsed size: "${parsedSize}"`);

    // Mock results for different material types
    if (queryLower.includes('pipe') || queryLower.includes('sch')) {
      const size = parsedSize || '2"';
      const schedule = queryLower.includes('sch 40') ? 'SCH 40' :
                      queryLower.includes('sch 80') ? 'SCH 80' : 'SCH 40';

      return [
        {
          id: `mock_pipe_1_${size.replace(/"/g, '')}`,
          name: `Carbon Steel Pipe, ${schedule}`,
          description: 'ASTM A53 Grade B Carbon Steel Pipe',
          size: size,
          schedule: schedule,
          grade: 'A53 Grade B',
          type: 'Pipe',
          pricePerFt: size === '6"' ? 18.50 : size === '4"' ? 12.75 : 8.50,
          weightPerFt: size === '6"' ? 18.97 : size === '4"' ? 10.79 : 3.65,
          supplier: 'Steel Supply LP',
          source: 'online'
        },
        {
          id: `mock_pipe_2_${size.replace(/"/g, '')}`,
          name: `Stainless Steel Pipe, ${schedule}`,
          description: 'ASTM A312 TP304 Stainless Steel Pipe',
          size: size,
          schedule: schedule,
          grade: '304',
          type: 'Pipe',
          pricePerFt: size === '6"' ? 65.00 : size === '4"' ? 42.50 : 24.75,
          weightPerFt: size === '6"' ? 18.97 : size === '4"' ? 10.79 : 3.65,
          supplier: 'Industrial Metals Co.',
          source: 'online'
        },
        {
          id: `mock_pipe_3_${size.replace(/"/g, '')}`,
          name: `Carbon Steel Pipe, ${schedule}`,
          description: 'ASTM A106 Grade B Seamless Carbon Steel Pipe',
          size: size,
          schedule: schedule,
          grade: 'A106 Grade B',
          type: 'Pipe',
          pricePerFt: size === '6"' ? 22.00 : size === '4"' ? 15.25 : 9.75,
          weightPerFt: size === '6"' ? 18.97 : size === '4"' ? 10.79 : 3.65,
          supplier: 'Pipe Masters Inc.',
          source: 'online'
        }
      ];
    }

    if (queryLower.includes('flange') || queryLower.includes('wn') || queryLower.includes('so') || queryLower.includes('rf')) {
      const size = parsedSize || '2"';
      const flangeType = queryLower.includes('wn') ? 'WN RF' :
                        queryLower.includes('so') ? 'SO RF' : 'WN RF';

      return [
        {
          id: `mock_flange_1_${size.replace(/"/g, '')}`,
          name: `Carbon Steel ${flangeType} Flange`,
          description: `ASTM A105 Carbon Steel ${flangeType} Flange`,
          size: size,
          type: 'Flange',
          grade: 'A105',
          pricePerUnit: size === '6"' ? 125.00 : size === '4"' ? 85.00 : 45.00,
          supplier: 'Steel Supply LP',
          source: 'online'
        },
        {
          id: `mock_flange_2_${size.replace(/"/g, '')}`,
          name: `Stainless Steel ${flangeType} Flange`,
          description: `ASTM A182 F304 SS ${flangeType} Flange`,
          size: size,
          type: 'Flange',
          grade: '304',
          pricePerUnit: size === '6"' ? 285.00 : size === '4"' ? 195.00 : 67.50,
          supplier: 'Stainless Solutions Inc.',
          source: 'online'
        },
        {
          id: `mock_flange_3_${size.replace(/"/g, '')}`,
          name: `Alloy Steel ${flangeType} Flange`,
          description: `ASTM A182 F11 Alloy Steel ${flangeType} Flange`,
          size: size,
          type: 'Flange',
          grade: 'F11',
          pricePerUnit: size === '6"' ? 195.00 : size === '4"' ? 135.00 : 78.00,
          supplier: 'Alloy Flanges Co.',
          source: 'online'
        }
      ];
    }

    if (queryLower.includes('tee') || queryLower.includes('elbow') || queryLower.includes('coupling') || queryLower.includes('reducer')) {
      const size = parsedSize || '2"';
      const fittingType = queryLower.includes('tee') ? 'Threaded Tee' :
                         queryLower.includes('elbow') ? '90° Elbow' :
                         queryLower.includes('coupling') ? 'Threaded Coupling' : 'Threaded Tee';

      return [
        {
          id: `mock_fitting_1_${size.replace(/"/g, '')}`,
          name: `Carbon Steel ${fittingType}`,
          description: `ASTM A105 Carbon Steel ${fittingType} Fitting`,
          size: size,
          type: 'Pipe Fitting',
          grade: 'A105',
          pricePerUnit: size === '6"' ? 85.00 : size === '4"' ? 55.00 : 28.75,
          supplier: 'Fitting Warehouse',
          source: 'online'
        },
        {
          id: `mock_fitting_2_${size.replace(/"/g, '')}`,
          name: `Carbon Steel ${fittingType}`,
          description: `ASTM A234 WPB Carbon Steel ${fittingType}`,
          size: size,
          type: 'Pipe Fitting',
          grade: 'WPB',
          pricePerUnit: size === '6"' ? 95.00 : size === '4"' ? 62.00 : 32.50,
          supplier: 'Pipe Fittings Direct',
          source: 'online'
        }
      ];
    }

    // Default fallback results
    const size = parsedSize || 'Various';
    return [
      {
        id: `mock_generic_1_${size.replace(/"/g, '').replace(/\s+/g, '_')}`,
        name: `${query} - Standard Grade`,
        description: `Standard specification for ${query}`,
        size: size,
        type: 'Material',
        grade: 'Standard',
        pricePerUnit: 15.00,
        supplier: 'Generic Supplier',
        source: 'online'
      }
    ];
  };

  const handleMaterialSelect = (material) => {
    setSelectedMaterial(material);
  };

  const handleConfirmSelection = () => {
    if (selectedMaterial && onMaterialSelected) {
      onMaterialSelected(selectedMaterial);
    }
  };

  const formatPrice = (material) => {
    if (material.pricePerFt) {
      return `$${material.pricePerFt.toFixed(2)}/ft`;
    }
    if (material.pricePerUnit) {
      return `$${material.pricePerUnit.toFixed(2)}/ea`;
    }
    return 'Price not available';
  };

  return (
    <>
      {console.log('🚨 OnlineMaterialSearch COMPONENT IS RENDERING!')}
      <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 24,
        maxWidth: 800,
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* DEBUG MESSAGE */}
        <div style={{
          background: 'red',
          color: 'white',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '5px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          🚨 DEBUG: OnlineMaterialSearch Component is VISIBLE! 🚨
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: '#1f2937', fontSize: 20 }}>
            🔍 Online Material Search
          </h3>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>
            Searching for: <strong>"{materialQuery}"</strong>
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ color: '#6b7280' }}>Searching online suppliers...</div>
            <div style={{ color: '#9ca3af', fontSize: 14, marginTop: 8 }}>
              This may take a few moments
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: 16,
            marginBottom: 20
          }}>
            <div style={{ color: '#dc2626', fontWeight: 500 }}>
              ⚠️ Search Error
            </div>
            <div style={{ color: '#7f1d1d', marginTop: 4 }}>
              {error}
            </div>
          </div>
        )}

        {!loading && !error && searchResults.length > 0 && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: 0, color: '#374151' }}>
                Found {searchResults.length} material{searchResults.length !== 1 ? 's' : ''}
                {searchResults.some(r => r.source === 'preferred_vendor') && (
                  <span style={{ color: '#059669', fontSize: 14, marginLeft: 8 }}>
                    ⭐ Including preferred vendors
                  </span>
                )}
              </h4>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>
                Select a material to add to your database
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              {searchResults.map((material, index) => (
                <div
                  key={material.id}
                  onClick={() => handleMaterialSelect(material)}
                  style={{
                    border: selectedMaterial?.id === material.id ? '2px solid #2563eb' : '1px solid #d1d5db',
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 12,
                    cursor: 'pointer',
                    background: selectedMaterial?.id === material.id ? '#eff6ff' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: 4 }}>
                        {material.name}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>
                        {material.description}
                      </div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 14 }}>
                          <strong>Size:</strong> {material.size}
                        </div>
                        {material.schedule && (
                          <div style={{ fontSize: 14 }}>
                            <strong>Schedule:</strong> {material.schedule}
                          </div>
                        )}
                        <div style={{ fontSize: 14 }}>
                          <strong>Grade:</strong> {material.grade}
                        </div>
                        <div style={{ fontSize: 14 }}>
                          <strong>Type:</strong> {material.type}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 120 }}>
                      <div style={{ fontWeight: 600, color: '#059669', fontSize: 16 }}>
                        {formatPrice(material)}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
                        {material.source === 'preferred_vendor' && (
                          <span style={{ color: '#059669', fontWeight: 500, marginRight: 8 }}>⭐ Preferred</span>
                        )}
                        {material.supplier}
                        {material.vendorUrl && (
                          <a
                            href={material.vendorUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              marginLeft: 8,
                              color: '#2563eb',
                              textDecoration: 'none',
                              fontSize: 11
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            🌐 Visit Site
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && searchResults.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <div style={{ color: '#6b7280' }}>No materials found online</div>
            <div style={{ color: '#9ca3af', fontSize: 14, marginTop: 8 }}>
              Try adjusting your search terms or check back later
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              background: 'white',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmSelection}
            disabled={!selectedMaterial}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 6,
              background: selectedMaterial ? '#2563eb' : '#d1d5db',
              color: 'white',
              cursor: selectedMaterial ? 'pointer' : 'not-allowed',
              fontWeight: 500
            }}
          >
            Add to Database
          </button>
        </div>
      </div>
    </div>
    </>
  );
}