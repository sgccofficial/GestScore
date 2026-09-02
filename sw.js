const CACHE_NAME = "gestscore-v4";

const urlsToCache = [
  "/",
  "/index.html",
  "/bmicalc.html",
  "/manifest.json",
  "/icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of urlsToCache) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (err) {
          console.error('Failed to cache', url, err);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (e) => {

  // Handle page navigation
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(async () => {
        // Serve the appropriate cached HTML file based on the request URL
        const url = new URL(e.request.url);
        if (url.pathname.endsWith("bmicalc.html")) {
          return await caches.match("/bmicalc.html", { ignoreSearch: true });
        }
        return (await caches.match("/", { ignoreSearch: true })) || (await caches.match("/index.html", { ignoreSearch: true }));
      })
    );
    return;
  }

  // Handle other requests (css, js, images)
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((res) => {
      return res || fetch(e.request);
    })
  );
});
