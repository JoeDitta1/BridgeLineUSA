export default async function jfetch(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  if (!res.ok) {
    const body = text ? text : '(no body)';
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${body.slice(0, 200)}`);
  }
  try {
    return text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error(`Invalid JSON from ${url}: ${text.slice(0,200)}`);
  }
}
