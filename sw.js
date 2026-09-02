const CACHE_NAME = "gestscore-v2";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./bmicalc.html",
        "./manifest.json",
        "./icon.png"
      ]);
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
      fetch(e.request).catch(() => {
        // Serve the appropriate cached HTML file based on the request URL
        const url = new URL(e.request.url);
        if (url.pathname.endsWith("bmicalc.html")) {
          return caches.match("./bmicalc.html");
        }
        return caches.match("./index.html");
      })
    );
    return;
  }

  // Handle other requests (css, js, images)
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});
