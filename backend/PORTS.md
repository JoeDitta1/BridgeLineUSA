Backend port
------------

The backend listens on port 4000 by default. In a Codespace or devcontainer this port is forwarded
by the `.devcontainer/devcontainer.json` which includes `forwardPorts: [4000]` to make the server
accessible from the host/browser (and appear in the workspace ports UI).

To run the backend locally inside the container:

  cd backend
  npm install
  npm run start

If you don't see port 4000 in the workspace ports UI, rebuild the devcontainer or restart the
container so the new devcontainer.json takes effect.
