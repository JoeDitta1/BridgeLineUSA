# Developer Quickstart - BridgeLineUSA (Updated 2025-09-17)

This file contains the complete setup to get the BridgeLineUSA application running in GitHub Codespaces or locally.

## Branch to Use
- **Main development branch**: `dev` (contains all latest fixes and Codespaces configuration)

## A — Open in GitHub Codespaces (Recommended)

1. Visit: https://github.com/JoeDitta1/BridgeLineUSA
2. Click Code → Codespaces → Create codespace → choose branch `dev`
3. Wait for the devcontainer to build (includes Node.js, npm, and port forwarding)

## B — Local Development (Alternative)

```bash
git clone https://github.com/JoeDitta1/BridgeLineUSA.git
cd BridgeLineUSA
git checkout dev
```

## Environment Setup

The repository includes all necessary environment files:

- `backend/.env.local` - Backend configuration with Supabase credentials
- `frontend/.env.local` - Frontend configuration with API base URL for Codespaces

These files are already configured and committed to the `dev` branch.

## Starting the Application

From the workspace root in a terminal:

### Backend (Port 4000)
```bash
cd backend
npm install
npm start
```

### Frontend (Port 3000)
```bash
cd frontend
npm install
npm start
```

## Accessing the Application

### In GitHub Codespaces
- **Frontend**: Use the forwarded URL for port 3000 (e.g., `https://random-3000.app.github.dev`)
- **Backend API**: Use the forwarded URL for port 4000 (e.g., `https://random-4000.app.github.dev`)

### Locally
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:4000`

## Testing the Application

1. Open the frontend URL in your browser
2. Navigate to Quotes → Customer Quotes
3. Click on a customer (e.g., "Joe")
4. Click on a quote (e.g., "SCM-Q0003")
5. The quote form should load with file display functionality working

## Key Features Working
- ✅ Quote form loading
- ✅ File display in QuoteForm
- ✅ Customer quote navigation
- ✅ Supabase integration
- ✅ Codespaces compatibility

## Troubleshooting

### If files don't load:
1. Check browser console for API errors
2. Verify the Codespace URLs are correct
3. Ensure both backend and frontend are running

### If WebSocket errors appear:
These are from React development server and don't affect functionality.

## Recent Fixes (2025-09-17)
- Fixed Codespaces API connectivity with proper .env.local configuration
- Resolved file display issues in QuoteForm
- Updated .gitignore to track necessary environment files
- Merged all backend and frontend improvements

---
**Important**: All necessary files are now committed to the `dev` branch. You can safely delete and recreate your Codespace - everything will work!

This file contains a compact, copy-pasteable checklist to open the repository from the backup snapshot branch in a Codespace (recommended) or locally, rebuild the devcontainer (so port 4000 is publicly forwarded), set env vars, install deps, optionally restore a DB snapshot, and start backend + frontend.

Branch to use

- backup branch: `backup-snapshot-20250901-084830`

A — Open the backup branch in Codespaces (recommended)

1. GitHub UI
   - Visit: https://github.com/JoeDitta1/BridgeLineUSA
   - Click Code → Codespaces → Create codespace → choose branch `backup-snapshot-20250901-084830`

2. VS Code (GitHub Codespaces extension)
   - Create new Codespace, pick branch `backup-snapshot-20250901-084830`.

B — Clone & checkout locally (alternative)

```bash
git clone https://github.com/JoeDitta1/BridgeLineUSA.git
cd BridgeLineUSA
git fetch origin
git checkout -b backup-snapshot-20250901-084830 origin/backup-snapshot-20250901-084830
```

Rebuild / Reopen the devcontainer (very important)

- In VS Code (inside Codespace or local Remote-Containers):
  - Command Palette → `Dev Containers: Rebuild Container` (or `Reopen in Container`).
- This applies `devcontainer.json` (it includes `forwardPorts: [4000]`) so Codespaces will expose port 4000 publicly.

Environment variables (edit `.env.local` files)

- Backend (.env.local in `backend/`):
  - SUPABASE_URL=... (optional)
  - SUPABASE_ANON_KEY=... or SUPABASE_SERVICE_ROLE=...
  - USE_SUPABASE=true|false  # set `false` if you don't have keys and want file-only mode
  - EXTERNAL_API_BASE=... (optional)

- Frontend (.env.local in `frontend/`):
  - VITE_API_BASE=https://<your-codespace-id>-4000.app.github.dev
  - (Or leave blank to use CRA proxy to `http://localhost:4000` when developing inside the Codespace)

How to discover the Codespaces public URL for port 4000

- After the devcontainer rebuild/reopen, open VS Code Ports panel. For port 4000 you should see a Public URL like:
  - `https://<random>-4000.app.github.dev`
- Use that value for `VITE_API_BASE` in `frontend/.env.local` (then restart frontend dev server).

Install dependencies & start services (copy/paste)

From the workspace root in a terminal inside the Codespace (or locally if developing local container):

# Backend
```bash
cd backend
npm ci
npm start   # starts node src/index.js (listens on :4000)
# or explicitly: node src/index.js
```

# Frontend
```bash
cd ../frontend
npm ci
npm start   # starts react-scripts dev server on :3000
```

Notes
- If you change `VITE_API_BASE` after the dev server started, stop and restart `npm start` so the front-end picks up the env.
- CRA dev proxy (package.json) points to `http://localhost:4000` so if developing inside the same Codespace you may leave `VITE_API_BASE` blank.

Optional: restore DB / extract backup tarball

Backups live in `backups/` (if present). To extract and restore a snapshot into `backend/data/app.db`:

```bash
cd /workspaces/BridgeLineUSA
# list the backups folder first
ls -lah backups
# extract chosen snapshot (example):
tar -xzvf backups/backup-20250901-084830.tar.gz -C /workspaces/BridgeLineUSA/backups/backup-20250901-084830
# inspect contents, then copy/replace the sqlite file (make a backup first):
cp backend/data/app.db backend/data/app.db.bak
cp backups/backup-20250901-084830/app.db backend/data/app.db
```

Make a backup before replacing any DB file.

Quick smoke tests

- Backend health (inside Codespace):
  - `curl http://localhost:4000/api/health`
- Backend health (from outside via Codespaces public URL):
  - `curl https://<your-codespace-id>-4000.app.github.dev/api/health`
- Frontend: open `http://localhost:3000` (or Codespaces forwarded URL for 3000).
- Try Quote Form: open folder, open Quote Form, Save Draft, navigate away, reopen — form should hydrate.

Useful logs & files to check

- Backend logs: `/tmp/backend.log` (if we use nohup) or check terminal where `npm start` runs
- Frontend logs: `/tmp/frontend.log` (if started via nohup) or check terminal output
- Key files to inspect when debugging: `backend/data/quotes/.../Quote Form/_meta.json`

Secrets caution

- Do NOT commit Supabase service keys into the repo. Use Codespaces secrets, environment secrets, or set `.env.local` locally and do not push it.

If you want me to create this runbook file in the repo now, it's done — this file is `README-DEVELOPER.md` at the repository root.

If you'd like, I can also:
- Add a short convenience script `scripts/start-dev.sh` that runs the install/start sequence for you, or
- Create a PR from the backup branch into `main` (if you want to merge now).

---
Generated: 2025-09-03
