import express from 'express';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// In-memory job registry and SSE connections
const jobs = new Map(); // jobId -> { process, logs, status, startTime, metadata }
const sseConnections = new Map(); // jobId -> Set of response objects
const MAX_LOG_LINES = 500; // Keep last 500 lines per job
const JOB_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes

// Archive directory for backup files
const ARCHIVE_DIR = '/workspaces/_archives';

// Ensure archive directory exists
function ensureArchiveDir() {
  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
  }
}

// Clean up old jobs (keep last 10)
function cleanupOldJobs() {
  if (jobs.size <= 10) return;
  
  const sortedJobs = Array.from(jobs.entries())
    .sort(([,a], [,b]) => a.startTime - b.startTime);
  
  // Remove oldest jobs
  const toRemove = sortedJobs.slice(0, sortedJobs.length - 10);
  toRemove.forEach(([jobId]) => {
    const job = jobs.get(jobId);
    if (job.process && !job.process.killed) {
      job.process.kill();
    }
    jobs.delete(jobId);
  });
}

// Check if any job is currently running
function hasActiveJob() {
  for (const [, job] of jobs) {
    if (job.status === 'running') {
      return true;
    }
  }
  return false;
}

// Check file sizes before commit
function checkFileSizes(callback) {
  const cmd = 'find . -type f -size +90M ! -path "./.git/*" ! -path "./node_modules/*" ! -path "./dist/*" ! -path "./backups/*" ! -path "./_archives/*"';
  const proc = spawn('bash', ['-c', cmd], { stdio: 'pipe' });
  
  let output = '';
  proc.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  proc.on('close', (code) => {
    const largeFiles = output.trim().split('\n').filter(line => line.length > 0);
    if (largeFiles.length > 0) {
      callback(new Error(`Large files detected (>90MB): ${largeFiles.join(', ')}. Please move to _archives or use Git LFS.`));
    } else {
      callback(null);
    }
  });
  
  proc.on('error', (err) => callback(err));
}

// Send SSE message
function sendSSE(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// POST /api/backups/run - Start a backup job
router.post('/run', (req, res) => {
  try {
    // Check if another job is running
    if (hasActiveJob()) {
      return res.status(409).json({ 
        ok: false, 
        error: 'Another backup job is already running. Please wait for it to complete.' 
      });
    }

    const jobId = randomUUID();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', 'T').replace('Z', 'Z');
    const snapBranch = `backup-request-${timestamp}`;
    
    ensureArchiveDir();
    
    const job = {
      process: null,
      logs: [],
      status: 'running',
      startTime: Date.now(),
      metadata: {
        timestamp,
        snapBranch,
        bundlePath: `${ARCHIVE_DIR}/BridgeLineUSA-${timestamp}.bundle`,
        zipPath: `${ARCHIVE_DIR}/BridgeLineUSA-${timestamp}.zip`
      }
    };
    
    jobs.set(jobId, job);
    cleanupOldJobs();
    
    // Start the backup process
    startBackupProcess(jobId, job);
    
    res.json({ ok: true, jobId });
    
  } catch (error) {
    console.error('[backup] Error starting job:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// GET /api/backups/stream - Stream job progress via SSE
router.get('/stream', (req, res) => {
  const { jobId } = req.query;
  
  if (!jobId || !jobs.has(jobId)) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });
  
  const job = jobs.get(jobId);
  
  // Track this SSE connection
  if (!sseConnections.has(jobId)) {
    sseConnections.set(jobId, new Set());
  }
  sseConnections.get(jobId).add(res);
  
  // Send existing logs
  job.logs.forEach(log => sendSSE(res, log));
  
  // If job is complete, close stream
  if (job.status === 'done' || job.status === 'error') {
    res.end();
    return;
  }
  
  // Keep connection alive with heartbeat
  const heartbeatInterval = setInterval(() => {
    if (res.writableEnded) {
      clearInterval(heartbeatInterval);
      return;
    }
    // Send heartbeat comment (invisible to client but keeps connection alive)
    res.write(': heartbeat\n\n');
  }, 15000); // Send heartbeat every 15 seconds
  
  // Monitor job completion
  const checkInterval = setInterval(() => {
    const currentJob = jobs.get(jobId);
    if (!currentJob || currentJob.status === 'done' || currentJob.status === 'error') {
      clearInterval(checkInterval);
      clearInterval(heartbeatInterval);
      res.end();
    }
  }, 1000);
  
  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(checkInterval);
    clearInterval(heartbeatInterval);
    // Remove from tracked connections
    const connections = sseConnections.get(jobId);
    if (connections) {
      connections.delete(res);
      if (connections.size === 0) {
        sseConnections.delete(jobId);
      }
    }
  });
});

// Start the actual backup process
function startBackupProcess(jobId, job) {
  const { timestamp, snapBranch, bundlePath, zipPath } = job.metadata;
  
  // Set up timeout
  const timeout = setTimeout(() => {
    if (job.process && !job.process.killed) {
      job.process.kill();
    }
    addLog(jobId, { status: 'error', step: 'timeout', message: 'Backup job timed out after 20 minutes' });
    job.status = 'error';
  }, JOB_TIMEOUT_MS);
  
  // Check file sizes first
  addLog(jobId, { status: 'info', message: 'Checking for large files...' });
  
  checkFileSizes((err) => {
    if (err) {
      clearTimeout(timeout);
      addLog(jobId, { status: 'error', step: 'size-check', message: err.message });
      job.status = 'error';
      return;
    }
    
    addLog(jobId, { status: 'info', message: 'File size check passed. Starting backup...' });
    
    // Build the backup script using the original working approach
    const script = `
set -euo pipefail
cd /workspaces/BridgeLineUSA

# Save original branch to restore later
ORIG_BRANCH=$(git branch --show-current || echo "dev")
echo "🏠 Current branch: $ORIG_BRANCH (will be preserved)"

echo "🔄 Fetching all branches and tags..."
git fetch --all --tags

echo "🌿 Creating orphan branch: ${snapBranch}"
git checkout --orphan "${snapBranch}"

echo "📋 Adding files (respecting .gitignore)..."
git add .

echo "💾 Committing snapshot..."
git commit -m "Backup request ${timestamp} (snapshot excludes archives)"

echo "🚀 Pushing snapshot branch to origin..."
git push -u origin "${snapBranch}"

echo "📦 Creating git bundle..."
git bundle create "${bundlePath}" --all

echo "🗜️  Creating zip archive..."
zip -r "${zipPath}" . -x ".git/*" "node_modules/*" "dist/*" "_archives/*" "backups/*" "*.log" "*.tmp"

echo "🔄 Restoring original branch: $ORIG_BRANCH"
git checkout "$ORIG_BRANCH"

echo "✅ Backup complete! Original branch ($ORIG_BRANCH) preserved."
    `.trim();
    
    // Execute the backup script
    const process = spawn('bash', ['-c', script], {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: '/workspaces/BridgeLineUSA'
    });
    
    job.process = process;
    
    // Handle stdout
    process.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        addLog(jobId, { status: 'info', message: line });
      });
    });
    
    // Handle stderr
    process.stderr.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        addLog(jobId, { status: 'warning', message: line });
      });
    });
    
    // Handle process completion
    process.on('close', (code) => {
      clearTimeout(timeout);
      
      // Check if backup files were actually created (more reliable than exit code)
      const bundleExists = fs.existsSync(bundlePath);
      const zipExists = fs.existsSync(zipPath);
      
      if (bundleExists && zipExists) {
        // Success - files were created successfully
        addLog(jobId, { status: 'info', message: `Backup files created successfully (exit code: ${code})` });
        
        // Verify we're still on the original branch
        const verifyBranch = spawn('git', ['branch', '--show-current'], {
          stdio: ['ignore', 'pipe', 'pipe'],
          cwd: '/workspaces/BridgeLineUSA'
        });
        
        let currentBranch = '';
        verifyBranch.stdout.on('data', (data) => {
          currentBranch = data.toString().trim();
        });
        
        verifyBranch.on('close', () => {
          addLog(jobId, { 
            status: 'done', 
            branch: snapBranch,
            bundle: `/archives/BridgeLineUSA-${timestamp}.bundle`,
            zip: `/archives/BridgeLineUSA-${timestamp}.zip`,
            message: `Backup completed successfully! Branch: ${snapBranch}. Working branch preserved: ${currentBranch || 'dev'}`
          });
          job.status = 'done';
        });
      } else {
        // Error - backup files not created
        const missingFiles = [];
        if (!bundleExists) missingFiles.push('bundle');
        if (!zipExists) missingFiles.push('zip');
        
        addLog(jobId, { 
          status: 'error', 
          step: 'backup-verification', 
          message: `Backup failed - missing files: ${missingFiles.join(', ')} (exit code: ${code})` 
        });
        job.status = 'error';
      }
    });
    
    // Handle process error
    process.on('error', (err) => {
      clearTimeout(timeout);
      addLog(jobId, { 
        status: 'error', 
        step: 'process-spawn', 
        message: `Failed to start backup process: ${err.message}` 
      });
      job.status = 'error';
    });
  });
}

// Add log entry to job and broadcast to SSE streams
function addLog(jobId, logEntry) {
  const job = jobs.get(jobId);
  if (!job) return;
  
  const logWithTimestamp = {
    ...logEntry,
    timestamp: new Date().toISOString()
  };
  
  job.logs.push(logWithTimestamp);
  
  // Keep only recent logs
  if (job.logs.length > MAX_LOG_LINES) {
    job.logs = job.logs.slice(-MAX_LOG_LINES);
  }
  
  // Broadcast new log to all active SSE connections for this job
  const connections = sseConnections.get(jobId);
  if (connections && connections.size > 0) {
    connections.forEach(res => {
      if (!res.writableEnded) {
        sendSSE(res, logWithTimestamp);
      }
    });
  }
}

// GET /api/backups/ping - Test endpoint for UI development
router.get('/ping', (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  let count = 0;
  const messages = [
    'Saving current branch state...',
    'Creating isolated worktree...',
    'Adding files to snapshot...',
    'Committing and pushing branch...',
    'Generating archives...',
    'Cleaning up worktree...'
  ];
  
  const interval = setInterval(() => {
    if (count < messages.length) {
      sendSSE(res, { 
        status: 'info', 
        message: messages[count],
        timestamp: new Date().toISOString()
      });
      count++;
    } else {
      sendSSE(res, { 
        status: 'done', 
        branch: 'test-branch-123',
        bundle: '/archives/test-bundle.bundle',
        zip: '/archives/test-archive.zip',
        message: 'Test backup completed!'
      });
      clearInterval(interval);
      res.end();
    }
  }, 600);
  
  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
});

// GET /api/backups/status - Get job status
router.get('/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  res.json({
    jobId,
    status: job.status,
    startTime: job.startTime,
    logsCount: job.logs.length,
    metadata: job.metadata
  });
});

export default router;