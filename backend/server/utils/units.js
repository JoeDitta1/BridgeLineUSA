export function toFeet(value, unit) {
  if (value == null || value === '') return null;
  switch ((unit||'').toLowerCase()) {
    case 'in': return Number(value) / 12;
    case 'mm': return Number(value) / 304.8;
    case 'ft': return Number(value);
    default:   return Number(value);
  }
}
export function normalizeTol({ tol_plus, tol_minus, tol_unit }) {
  // pass-through; kept for future validations
  return {
    tol_plus: tol_plus === '' ? null : Number(tol_plus),
    tol_minus: tol_minus === '' ? null : Number(tol_minus),
    tol_unit: (tol_unit || '').toLowerCase() || null
  };
}
