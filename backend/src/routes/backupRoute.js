import express from 'express';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import fs from 'fs';

const router = express.Router();
const jobs = new Map();
const ARCHIVE_DIR = '/workspaces/_archives';

// Ensure archive directory exists
if (!fs.existsSync(ARCHIVE_DIR)) {
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
}

// POST /api/backups/run
router.post('/run', (req, res) => {
  const jobId = randomUUID();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapBranch = `backup-request-${timestamp}`;
  
  const job = {
    logs: [],
    status: 'running',
    snapBranch,
    bundlePath: `${ARCHIVE_DIR}/BridgeLineUSA-${timestamp}.bundle`,
    zipPath: `${ARCHIVE_DIR}/BridgeLineUSA-${timestamp}.zip`
  };
  
  jobs.set(jobId, job);
  
  const script = `
set -euo pipefail
cd /workspaces/BridgeLineUSA
echo "�� Fetching all branches and tags..."
git fetch --all --tags
echo "🌿 Creating orphan branch: ${snapBranch}"
git checkout --orphan "${snapBranch}"
echo "📋 Adding files..."
git add .
echo "💾 Committing snapshot..."
git commit -m "Backup request ${timestamp}"
echo "🚀 Pushing to origin..."
git push -u origin "${snapBranch}"
echo "📦 Creating bundle..."
git bundle create "${job.bundlePath}" --all
echo "🗜️ Creating zip..."
zip -r "${job.zipPath}" . -x ".git/*" "node_modules/*" "dist/*" "_archives/*" "backups/*"
echo "✅ Backup complete!"
  `;
  
  const process = spawn('bash', ['-c', script], {
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: '/workspaces/BridgeLineUSA'
  });
  
  process.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      job.logs.push({ status: 'info', message: line, timestamp: new Date().toISOString() });
    });
  });
  
  process.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      job.logs.push({ status: 'warning', message: line, timestamp: new Date().toISOString() });
    });
  });
  
  process.on('close', (code) => {
    if (code === 0) {
      job.logs.push({
        status: 'done',
        branch: snapBranch,
        bundle: `/archives/BridgeLineUSA-${timestamp}.bundle`,
        zip: `/archives/BridgeLineUSA-${timestamp}.zip`,
        message: `Backup completed! Branch: ${snapBranch}`,
        timestamp: new Date().toISOString()
      });
      job.status = 'done';
    } else {
      job.logs.push({
        status: 'error',
        message: `Backup failed with exit code ${code}`,
        timestamp: new Date().toISOString()
      });
      job.status = 'error';
    }
  });
  
  job.process = process;
  res.json({ ok: true, jobId });
});

// GET /api/backups/stream
router.get('/stream', (req, res) => {
  const { jobId } = req.query;
  const job = jobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  job.logs.forEach(log => {
    res.write(`data: ${JSON.stringify(log)}\n\n`);
  });
  
  if (job.status === 'done' || job.status === 'error') {
    res.end();
    return;
  }
  
  const interval = setInterval(() => {
    const currentJob = jobs.get(jobId);
    if (!currentJob || currentJob.status === 'done' || currentJob.status === 'error') {
      clearInterval(interval);
      res.end();
    }
  }, 1000);
  
  req.on('close', () => clearInterval(interval));
});

export default router;
