const CACHE = "med-ai-dalton-v24-offline-study-vault";
const CORE = [
  "/",
  "/index.html",
  "/styles.css?v=24.0.0",
  "/app.js?v=24.0.0",
  "/manifest.webmanifest",
  "/icons/icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  // API data is cached in IndexedDB by app.js, not here.
  if (url.pathname.startsWith("/api/")) return;

  if (request.method !== "GET") return;

  // App shell: online-first, cache fallback.
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.ok && url.origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          return (await caches.match("/index.html")) ||
                 (await caches.match("/"));
        }
        return new Response("Sin conexión", {status:503});
      })
  );
});
