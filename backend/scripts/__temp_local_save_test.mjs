import { LocalFsDriver } from '../src/fileService.js';
import fs from 'fs';

(async function() {
  try {
    const drv = new LocalFsDriver({});
    const buf = Buffer.from('hello local test');
    const meta = await drv.save({ parent_type: 'quote', parent_id: 'TEST-LOCAL', customer_name: 'ACME', subdir: 'drawings', originalname: 'test.txt', buffer: buf, content_type: 'text/plain' });
    console.log('saved:', meta);
    // read back file exists
    const base = process.cwd() + '/data/quotes/ACME/TEST-LOCAL/drawings';
    const files = fs.readdirSync(base);
    console.log('files in dir:', files);
  } catch (e) {
    console.error('error:', e);
    process.exit(1);
  }
})();
