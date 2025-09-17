// Test material processing logic
const FAMILY_ALIASES = {
  'plate': 'Plate',
  'diamond plate': 'Plate',
  'sheetmetal': 'Sheet',
  'sheet metal': 'Sheet',
  'sheet': 'Sheet',
  'pipe': 'Pipe',
  'tube': 'Tube',
  'tubing': 'Tube',
  'sq tube': 'HSS',
  'square tube': 'HSS',
  'square tubing': 'HSS',
  'rect tube': 'HSS',
  'rectangular tube': 'HSS',
  'hss': 'HSS',
  'beam': 'Beam',
  'w-beam': 'W-Beam',
  'wide flange': 'Beam',
  'w shape': 'Beam',
  'channel': 'Channel',
  'c-channel': 'Channel',
  'angle iron': 'Angle',
  'angle': 'Angle',
  'flatbar': 'FlatBar',
  'flat bar': 'FlatBar',
  'roundbar': 'RoundBar',
  'round bar': 'RoundBar',
  'round tube': 'Tube',
  'od tubing': 'Tube',
  'stainless': 'Stainless',
  'aluminum': 'Aluminum',
  'copper': 'Copper',
  'brass': 'Brass',
};

const normalizeFamily = (s) => {
  if (!s) return '';
  const k = String(s).trim().toLowerCase();
  if (!k) return '';
  if (FAMILY_ALIASES[k]) return FAMILY_ALIASES[k];
  const cleaned = k.replace(/\s+/g, ' ').trim();
  return cleaned.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const toMatOption = (m) => {
  const familyRaw = m.type || m.category || m.family || '';
  const familyKey = normalizeFamily(familyRaw);

  console.log('Processing material:', {
    raw: familyRaw,
    normalized: familyKey,
    size: m.size,
    description: m.description
  });

  const label = `${familyRaw || 'Material'} - ${m.size || m.description || ''}`.trim();
  const value = `${(m.type||m.category)||''}|${m.size || m.description || ''}`;

  return {
    label,
    value,
    familyKey,
    family: familyRaw,
    size: m.size || m.description || ''
  };
};

// Test with the families from the API
const testMaterials = [
  { family: 'Pipe', size: '2 SCH 40', description: '2 SCH 40' },
  { family: 'Rect Tube', size: '2x3x1/4', description: '2x3x1/4' },
  { family: 'Square Tube', size: '2x2x1/4', description: '2x2x1/4' },
  { family: 'W-Beam', size: 'W8x18', description: 'W8x18' }
];

console.log('Testing material processing:');
testMaterials.forEach(m => {
  const result = toMatOption(m);
  console.log('Result:', result);
  console.log('---');
});