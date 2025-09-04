BridgeLineUSA — Developer runbook

Rebuild devcontainer and start the app (backend + frontend)

1) Rebuild the Codespace / devcontainer

- In the Codespace Command Palette (F1) choose: "Dev Containers: Rebuild Container" or "Remote-Containers: Rebuild Container".
- Wait for the rebuild to finish.

2) Open two terminals in the container and run:

```bash
# Terminal A — backend
cd /workspaces/BridgeLineUSA/backend
npm ci
npm start

# Terminal B — frontend
cd /workspaces/BridgeLineUSA/frontend
npm ci
npm start
```

Notes:
- The devcontainer now uses the Node 20 development image so `node` and `npm` will be available inside the container.
- Ports forwarded: 3000 (frontend) and 4000 (backend). The Codespaces public URL will be shown in the top-right "Ports" view once the servers are running.
- If you still see `node: command not found` after rebuilding, fully close and re-open the Codespace (Reopen in Container). Rebuild may be necessary.

Branch with snapshot/backup: `backup-snapshot-20250901-084830`

If you want, I can also start both servers and tail logs once you confirm the devcontainer is rebuilt.
