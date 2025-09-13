# Backup System Documentation

## Overview
The BridgeLineUSA backup system provides a safe, automated way to create snapshots of your codebase and push them to GitHub with downloadable archives.

## Features
- **One-Click Backup**: Start backups from the Admin interface
- **Real-Time Progress**: Live streaming of backup progress via Server-Sent Events
- **Safe Snapshots**: Creates orphan Git branches with timestamp names
- **Multiple Formats**: Generates both Git bundles and ZIP archives
- **File Size Protection**: Prevents inclusion of files larger than 90MB
- **Download Support**: Direct download links for generated archives

## How to Use

### From the Admin Interface
1. Navigate to **Admin → Backups**
2. Click **"Run Backup Now"**
3. Monitor real-time progress in the modal
4. Download bundle or ZIP when complete
5. Access the new Git branch on GitHub

### Manual API Usage
```bash
# Start a backup job
curl -X POST http://localhost:4000/api/backups/run

# Stream progress (replace jobId)
curl -N "http://localhost:4000/api/backups/stream?jobId=<jobId>"

# Test the streaming UI
curl -N "http://localhost:4000/api/backups/ping"
```

## What Gets Backed Up

### Included
- All tracked files respecting `.gitignore`
- Current branch state and uncommitted changes
- Complete Git history (in bundle format)

### Excluded
- `.git/` directory (except in bundles)
- `node_modules/`
- `dist/` and build artifacts  
- `backups/` and `_archives/` directories
- Files larger than 90MB
- Log and temporary files

## Output Files

### Git Branch
- Name format: `backup-request-YYYY-MM-DDTHH-MM-SSZ`
- Pushed to GitHub automatically
- Contains snapshot of current state
- Viewable at: `https://github.com/JoeDitta1/BridgeLineUSA/tree/<branch-name>`

### Archive Files
Stored in `/workspaces/_archives/`:

1. **Git Bundle** (`.bundle`)
   - Complete repository history
   - All branches and tags
   - Can restore entire repo: `git clone file.bundle`

2. **ZIP Archive** (`.zip`)
   - Working directory snapshot
   - Excludes .git directory
   - Easy file browsing

## Safety Features

### File Size Checks
- Scans for files >90MB before backup
- Aborts with error if large files detected
- Suggests using Git LFS or moving to _archives

### Timeout Protection
- 20-minute maximum backup time
- Automatic process termination
- Clear error messages

### Concurrency Control
- Only one backup job at a time
- Clear status messages for conflicts
- Job registry tracks active processes

### Security
- Path traversal protection on downloads
- Respects .gitignore patterns
- No secrets included in snapshots

## API Endpoints

### POST `/api/backups/run`
Starts a new backup job.

**Response:**
```json
{
  "ok": true,
  "jobId": "uuid-string"
}
```

### GET `/api/backups/stream?jobId=<id>`
Stream real-time backup progress via Server-Sent Events.

**Events:**
```json
{"status": "info", "message": "Step description", "timestamp": "ISO-8601"}
{"status": "done", "branch": "branch-name", "bundle": "/path", "zip": "/path"}
{"status": "error", "step": "step-name", "message": "Error description"}
```

### GET `/api/backups/ping`
Test endpoint that simulates a backup with fake progress messages.

### GET `/archives/<filename>`
Download backup archive files.

## Troubleshooting

### Common Issues

**Large File Error**
```
Large files detected (>90MB): ./some-large-file.zip
```
- Move large files to `_archives/` directory
- Or set up Git LFS for the file type
- Commit changes and retry backup

**Backup Already Running**
```
Another backup job is already running
```
- Wait for current backup to complete
- Check Admin interface for progress
- Jobs timeout after 20 minutes

**Git Push Failed**
- Ensure GitHub authentication is working
- Check network connectivity
- Verify repository permissions

### Log Files
- Backend logs: Check terminal or `server.log`
- Backup progress: Available in Admin UI
- Job registry: In-memory, lost on restart

## Testing

### Test the UI Without Real Backup
Use the **"Test UI"** button to simulate backup progress without creating actual files.

### Manual Testing
```bash
# Test Server-Sent Events
curl -N "http://localhost:4000/api/backups/ping"

# Check health
curl "http://localhost:4000/api/health"

# List archive files
ls -la /workspaces/_archives/
```

## Architecture

### Backend Components
- `backupRoute.js` - Main backup logic and API endpoints
- Server-Sent Events for real-time progress
- Child process spawning for Git operations
- In-memory job registry with cleanup

### Frontend Components  
- `Backups.jsx` - Admin interface with modal
- EventSource for real-time log streaming
- Download functionality for archives
- Error handling and status display

### File Structure
```
/workspaces/_archives/          # Archive storage
├── BridgeLineUSA-TIMESTAMP.bundle
├── BridgeLineUSA-TIMESTAMP.zip
└── ...

backend/src/routes/
├── backupRoute.js             # Backup API
└── ...

frontend/src/pages/admin/
├── Backups.jsx               # Backup UI
└── ...
```

## Security Considerations

1. **No Secrets**: Backup process excludes sensitive files
2. **Path Validation**: Archive downloads prevent directory traversal
3. **Size Limits**: Prevents repository bloat
4. **Process Isolation**: Backup runs in separate child process
5. **Timeout Limits**: Prevents runaway processes
6. **GitHub Auth**: Uses existing Codespace authentication

## Future Enhancements

### Potential Improvements
- Scheduled automated backups
- Backup retention policies  
- Email notifications on completion
- Integration with GitHub Actions
- Incremental backup support
- Backup verification and integrity checks

### GitHub Actions Integration
Consider adding `.github/workflows/backup-on-request.yml` to handle backup creation in GitHub's infrastructure instead of Codespaces.