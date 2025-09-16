export function getApiBase() {
  // Highest priority: a value injected at runtime (set in index.html below)
  if (typeof window !== "undefined" && window.__API_BASE__) return window.__API_BASE__;

  // Next: a build-time env var if you ever want to set one
  if (process.env.REACT_APP_API_BASE) return process.env.REACT_APP_API_BASE;

  // Detect environment and set appropriate API base
  try {
    const { origin, hostname } = window.location;

    // GitHub Codespaces
    if (hostname.includes('.app.github.dev')) {
      if (hostname.includes('-3000.')) {
        // Frontend is on -3000, backend should be on -4000
        return origin.replace('-3000.', '-4000.');
      }
    }

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:4000';
    }

    // Production or other environments - use relative URLs
    return '';

  } catch (_) {
    // Fallback for server-side rendering or other environments
    return process.env.REACT_APP_API_BASE || 'http://localhost:4000';
  }
}

export const API_BASE = getApiBase();
