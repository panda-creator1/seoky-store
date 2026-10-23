const CACHE_NAME = "seoky-cache-v3";
const BASE_PATH = "/seoky-store/";

const CORE_FILES = [
  BASE_PATH,
  BASE_PATH + "index.html",
  BASE_PATH + "style.css",
  BASE_PATH + "script.js",
  BASE_PATH + "manifest.json",
  BASE_PATH + "favicon.svg",
  BASE_PATH + "favicon-32.png",
  BASE_PATH + "favicon-16.png",
  BASE_PATH + "apple-touch-icon.png",
  BASE_PATH + "icon-192.png",
  BASE_PATH + "icon-512.png",
  BASE_PATH + "icon-maskable-512.png"
];

/* product + campaign photography: cached at install too, but a missing
   image must never block the install — hence allSettled below */
const IMAGE_FILES = [
  "seoky-campaign.png",
  "seoky-campaign2.png",
  "seoky-campaign3.png",
  "black-tee.png",
  "gray-tee.png",
  "white-tee.png",
  "navy-blue-tee.png",
  "olive-green-tee.png",
  "sand-tee.png",
  "burgundy-tee.png",
  "faded-blue-tee.png",
  "chocolate-brown-tee.png"
].map((name) => BASE_PATH + name);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(CORE_FILES);
      await Promise.allSettled(IMAGE_FILES.map((url) => cache.add(url)));
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("seoky-cache-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/* the page's "new version" pill posts this when tapped */
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  /* pages: network first, saved copy as the offline fallback */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          return (await caches.match(request)) ||
                 (await caches.match(BASE_PATH + "index.html")) ||
                 (await caches.match(BASE_PATH));
        })
    );
    return;
  }

  /* everything else: stale-while-revalidate — serve the saved copy
     instantly, refresh it quietly in the background */
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
