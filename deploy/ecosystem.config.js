module.exports = {
  apps: [
    { name: 'blusa-api', script: 'server.js', cwd: './backend', env: { NODE_ENV: 'production' } },
    { name: 'blusa-worker', script: 'src/workers/quoteSyncWorker.js', cwd: './backend', env: { NODE_ENV: 'production' } }
  ]
};
