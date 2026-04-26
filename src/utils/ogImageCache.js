// Throttled OG image fetcher with in-memory cache.
// Limits concurrent /api/og calls so we don't flood the server.

const cache = new Map();   // articleUrl -> imageUrl | null
const pending = new Map(); // articleUrl -> Promise<string|null>
const queue = [];
let active = 0;
const MAX_CONCURRENT = 5;

function processQueue() {
  while (active < MAX_CONCURRENT && queue.length > 0) {
    const { url, resolve } = queue.shift();
    active++;

    fetch(`/api/og?url=${encodeURIComponent(url)}`)
      .then(r => r.ok ? r.json() : { image: null })
      .then(data => {
        const img = data.image || null;
        cache.set(url, img);
        resolve(img);
      })
      .catch(() => {
        cache.set(url, null);
        resolve(null);
      })
      .finally(() => {
        pending.delete(url);
        active--;
        processQueue();
      });
  }
}

export function getOgImage(articleUrl) {
  if (!articleUrl) return Promise.resolve(null);

  // Return cached result immediately
  if (cache.has(articleUrl)) return Promise.resolve(cache.get(articleUrl));

  // Coalesce duplicate in-flight requests
  if (pending.has(articleUrl)) return pending.get(articleUrl);

  const p = new Promise(resolve => {
    queue.push({ url: articleUrl, resolve });
    processQueue();
  });

  pending.set(articleUrl, p);
  return p;
}
