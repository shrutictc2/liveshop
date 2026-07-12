// Minimal service worker: caches the app shell so LiveShop installs as a
// standalone app and loads instantly on repeat visits, even offline.
// This is deliberately simple (cache-first for the shell, network for
// everything else) — enough to satisfy installability criteria and
// demonstrate the pattern, not a full offline-first architecture.

const CACHE_NAME = "liveshop-shell-v1";
const APP_SHELL = ["/", "/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Cache-first for the app shell, network-first (falling back to cache)
  // for everything else — keeps the mock live-event stream fresh while
  // still letting the shell load instantly.
  if (APP_SHELL.includes(new URL(event.request.url).pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
