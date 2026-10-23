/* SEOKY offline support — bump CACHE_NAME whenever core assets change. */
const CACHE_NAME = "seoky-cache-v3";
const APP_ROOT = new URL("./", self.registration.scope);
const CORE_FILES = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "pwa.js",
  "manifest.json",
  "favicon.svg",
  "icon-192.png",
  "icon-512.png"
].map((path) => new URL(path, APP_ROOT).toString());

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith("seoky-cache-") && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (_) {
        return (await caches.match(request)) ||
          (await caches.match(new URL("index.html", APP_ROOT).toString())) ||
          (await caches.match(APP_ROOT.toString()));
      }
    })());
    return;
  }

  // Return cached files immediately and refresh them in the background.
  event.respondWith((async () => {
    const cached = await caches.match(request);
    const refresh = fetch(request).then(async (response) => {
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    });
    if (cached) {
      event.waitUntil(refresh.catch(() => undefined));
      return cached;
    }
    try { return await refresh; }
    catch (_) { return Response.error(); }
  })());
});
