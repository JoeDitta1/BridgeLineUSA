// Test the API_BASE resolution in GitHub Codespaces
// This simulates what the frontend should be doing

// Simulate GitHub Codespaces environment
const mockWindow = {
  location: {
    origin: 'https://reimagined-space-tribble-97qgx5r666x7cpgw4-3000.app.github.dev'
  }
};

// Mock the getApiBase function logic
function getApiBase() {
  // Highest priority: a value injected at runtime (set in index.html below)
  if (typeof window !== "undefined" && window.__API_BASE__) return window.__API_BASE__;

  // Next: a build-time env var if you ever want to set one
  if (process.env.REACT_APP_API_BASE) return process.env.REACT_APP_API_BASE;

  // Codespaces: map -3000 host to -4000
  try {
    const { origin } = mockWindow.location;
    if (origin.includes(".app.github.dev") && origin.includes("-3000.")) {
      return origin.replace("-3000.", "-4000.");
    }
  } catch (_) {}

  // Local fallback
  return "http://localhost:4000";
}

console.log('GitHub Codespaces Origin:', mockWindow.location.origin);
console.log('Resolved API_BASE:', getApiBase());
console.log('Should work with HTTPS now! ✅');