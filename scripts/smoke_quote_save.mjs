import process from 'process';

const API = process.env.API_BASE || 'http://localhost:4000';
const customer = 'TestCo';
const payload = {
  status: 'draft',
  customer_name: customer,
  customerName: customer,
  project: 'Smoke Test',
  family: 'Plate',
  size: '1/4 x 48 x 96',
  unit: 'SQFT',
  qty: 2,
  tolerance: { symbol: '±', value: 0.125, unit: 'in' },
  qc: { standards: ['ISO 9001'], nde_required: false, mtrs_required: false },
};

async function main() {
  console.log('-> Saving draft…');
  // Backend expects fields at top-level. Spread the payload into the root body.
  const res = await fetch(`${API}/api/quotes/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ draft: true, finalize: false, ...payload }),
  }).then(r => r.json());

  console.log('Response:', res);
  if (!res?.ok) throw new Error('Save failed');

  const { quoteNo, version, storage } = res;
  console.log(`Quote #${quoteNo}, version ${version}`);
  if (storage?.root) {
    console.log('Expected storage paths:');
    console.log(` - ${storage.root}/00-Quote-Form/manifest.json`);
    console.log(` - ${storage.root}/00-Quote-Form/quote.v${version}.json`);
  } else {
    console.log('No storage.root returned by save API. Check backend response.');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
