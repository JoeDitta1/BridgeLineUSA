# Developer Quickstart (backup-snapshot-20250901-084830)

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
