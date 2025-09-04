import fs from 'fs/promises';
import path from 'path';
import { createFileService } from '../src/fileService.js';

async function run() {
  const svc = createFileService();
  console.log('Using service:', svc.constructor.name);
  const samplePath = path.resolve(new URL('..', import.meta.url).pathname, 'test-sample.txt');
  try {
    await fs.writeFile(samplePath, 'sample file for test ' + Date.now());
    const buffer = await fs.readFile(samplePath);
    const meta = await svc.save({
      parent_type: 'quote',
      parent_id: 'TEST-Q-0001',
      customer_name: 'TestCustomer',
      subdir: 'drawings',
      originalname: 'sample.txt',
      buffer,
      content_type: 'text/plain',
      uploaded_by: null
    });
    console.log('Saved meta:', meta);
    const signed = await svc.signedUrl(meta.object_key, 60);
    console.log('Signed URL:', signed);
  } catch (e) {
    console.error('Test failed:', e);
    process.exitCode = 1;
  }
}

run();
