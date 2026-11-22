// Кеш оболочки приложения. При изменении файлов поднимите версию —
// иначе браузер продолжит отдавать старую копию.
const VERSION = "v35";
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
  "js/topics/bi.js",
  "js/core/tracks.js",
  "VERSION",
  "data/case-orders.csv",
  "data/bi-orders.csv",
  "data/dashboard-sales-template.svg",
  "data/dashboard-product-template.svg",
  "data/dashboard-sales-template.md",
  "data/dashboard-product-template.md",
  "js/core/cheatsheet.js",
  "js/core/glossary.js",
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
      // cache: "reload" — иначе при установке можно получить старые файлы
      // из HTTP-кеша браузера и закешировать их под новой версией.
      .then((cache) => cache.addAll(ASSETS.map((url) => new Request(new URL(url, self.registration.scope).href, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const hadOld = keys.some((k) => k !== CACHE);
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
    if (hadOld) {
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.postMessage({ type: "reload" }));
    }
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Навигацию берём из сети: иначе старый index.html может ссылаться
  // на уже удалённые файлы и страница останется пустой.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put("index.html", copy));
        }
        return response;
      }).catch(() => caches.match("index.html"))
    );
    return;
  }

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
