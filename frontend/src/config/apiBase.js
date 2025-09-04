// One source of truth for API base
export function getApiBase() {
  // 1) Explicit runtime override
  if (typeof window !== "undefined" && window.__API_BASE__) return window.__API_BASE__;

  // 2) Vite/CRA envs (build time)
  const vite = (typeof import.meta !== 'undefined' && import.meta && import.meta.env) ? import.meta.env : {};
  if (vite.VITE_API_BASE) return vite.VITE_API_BASE;
  if (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE) return process.env.REACT_APP_API_BASE;

  // 3) Codespaces/GitHub-style hosts: swap -3000 → -4000
  try {
    const host = window.location.host.replace("-3000.", "-4000.");
    if (host !== window.location.host) {
      return `${window.location.protocol}//${host}`;
    }
  } catch (_) {}

  // 4) Same-origin fallback (use a reverse proxy if available)
  return "";
}
export const API_BASE = getApiBase();
