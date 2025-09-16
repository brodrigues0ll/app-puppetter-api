const CACHE_NAME = "PocketFlow";
const urlsToCache = [
  "/",
  "/settings",
  "/src/app/page.js",
  "/src/app/settings/page.js",
  "/src/app/globals.css",
];

// Install service worker - skip waiting to activate immediately
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Cache aberto");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Skip waiting to activate the new service worker immediately
        return self.skipWaiting();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch new version
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback for offline navigation
        if (event.request.destination === "document") {
          return caches.match("/");
        }
      })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Listen for messages from the client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
