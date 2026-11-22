// Кеш оболочки приложения. При изменении файлов поднимите версию —
// иначе браузер продолжит отдавать старую копию.
const VERSION = "v22";
const CACHE = "analytics-lab-" + VERSION;

const ASSETS = [
  "./",
  "index.html",
  "style.css",
  "js/app.js",
  "js/data.js",
  "js/topics/analytics.js",
  "js/topics/statistics.js",
  "js/topics/gametheory.js",
  "js/topics/probability.js",
  "js/topics/sql.js",
  "js/topics/excel.js",
  "js/topics/python.js",
  "js/topics/regression.js",
  "js/topics/classification.js",
  "js/topics/ml.js",
  "js/topics/useful.js",
  "js/core/tracks.js",
  "data/case-orders.csv",
  "js/core/cheatsheet.js",
  "js/features/trainers.js",
  "js/features/games.js",
  "js/core/progress.js",
  "js/core/search.js",
  "js/features/demos.js",
  "js/sandboxes/sql.js",
  "js/sandboxes/python.js",
  "js/sandboxes/pyworker.js",
  "manifest.webmanifest",
  "icon.svg",
  "icon-180.png",
  "icon-192.png",
  "icon-512.png",
  "vendor/sql-wasm.js",
  "vendor/sql-wasm.wasm"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => {
        if (request.mode === "navigate") return caches.match("index.html");
        return new Response("Офлайн: файл не найден в кеше.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      });
    })
  );
});
