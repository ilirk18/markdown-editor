/* Markdown Editor service worker — precaches the app shell so it works
   offline. Bump CACHE_VERSION whenever any precached file changes. */
var CACHE_VERSION = "md-editor-v2";
var PRECACHE = [
  ".",
  "index.html",
  "style.css",
  "theme-light.css",
  "theme-prishtina.css",
  "app.js",
  "modules/rendering.js",
  "vendor/marked.min.js",
  "vendor/purify.min.js",
  "vendor/html2pdf.bundle.min.js",
  "vendor/highlight.min.js",
  "vendor/lz-string.min.js",
  "manifest.json",
  "favicon.svg",
  "favicon-light.svg"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(PRECACHE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key !== CACHE_VERSION) return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;

  var url = new URL(req.url);

  // Same-origin: cache-first (mermaid.min.js is large and lazy-loaded, so
  // it lands in the runtime cache the first time it is requested).
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req, { ignoreSearch: url.pathname.endsWith("index.html") || url.pathname.endsWith("/") }).then(function (cached) {
        if (cached) return cached;
        return fetch(req).then(function (res) {
          if (res && res.ok) {
            var copy = res.clone();
            caches.open(CACHE_VERSION).then(function (cache) { cache.put(req, copy); });
          }
          return res;
        });
      })
    );
    return;
  }

  // Google Fonts: stale-while-revalidate so icons/fonts survive offline
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(
      caches.match(req).then(function (cached) {
        var network = fetch(req).then(function (res) {
          if (res && (res.ok || res.type === "opaque")) {
            var copy = res.clone();
            caches.open(CACHE_VERSION + "-fonts").then(function (cache) { cache.put(req, copy); });
          }
          return res;
        }).catch(function () { return cached; });
        return cached || network;
      })
    );
  }
});
