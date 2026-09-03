const CACHE = "med-ai-dalton-v30-0-5-simplified-study";
const CORE = [
  "/",
  "/index.html",
  "/styles.css?v=30.0.5",
  "/app.js?v=30.0.5",
  "/manifest.webmanifest",
  "/icons/icon.svg"
];

// PDF.js powers the exact page selector. It is cached best-effort on install,
// so once a connected installation has obtained it the PWA can reuse it
// without depending on a fresh CDN request every time.
const PDF_DEPS = [
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.54/pdf.min.mjs",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.54/pdf.worker.min.mjs"
];

self.addEventListener("install", event => {
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(CORE);
    await Promise.all(PDF_DEPS.map(async url=>{
      try{await cache.add(url)}catch(err){console.warn("MEDAI_PDF_DEP_CACHE",url,err)}
    }));
    await self.skipWaiting();
  })());
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
