// Кеш оболочки приложения. При изменении файлов поднимите версию —
// иначе браузер продолжит отдавать старую копию.
const VERSION = "v5";
const CACHE = "analytics-lab-" + VERSION;

const ASSETS = [
  "./",
  "index.html",
  "style.css",
  "app.js",
  "data.js",
  "trainers.js",
  "games.js",
  "progress.js",
  "search.js",
  "demos.js",
  "sandbox.js",
  "manifest.webmanifest",
  "icon.svg",
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
