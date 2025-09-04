// frontend/src/lib/fileUrls.js
// Turn an absolute filesystem path from the API into a browser URL
// served by the backend's static /files handler.
export function filePathToUrl(absPath) {
  if (!absPath) return null;
  const marker = "/data/quotes/";               // matches backend absolute path segment
  const i = absPath.indexOf(marker);
  if (i === -1) return null;

  const tail = absPath.slice(i + marker.length); // e.g. "Atlas/SCM-Q0015-.../Drawings/foo.pdf"
  const base = (process.env.REACT_APP_API_BASE || "http://localhost:4000")
    .replace(/\/+$/, "");                        // no trailing slash

  // Encode path but keep slashes
  return `${base}/files/${encodeURIComponent(tail).replace(/%2F/g, "/")}`;
}
