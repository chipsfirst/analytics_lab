// Кеш оболочки приложения. При изменении файлов поднимите версию —
// иначе браузер продолжит отдавать старую копию.
const VERSION = "0.7.7";
const CACHE = "analytics-lab-" + VERSION;

const ASSETS = [
  "./",
  "index.html",
  "style.css",
  "js/core/lab.js",
  "js/features/session.js",
  "js/features/achievements-page.js",
  "js/features/search-page.js",
  "js/features/progress-page.js",
  "js/core/prompt-tasks.js",
  "js/features/prompt-lab.js",
  "js/features/datalab.js",
  "js/features/review-page.js",
  "js/features/cases-page.js",
  "js/features/path-page.js",
  "js/features/exams.js",
  "js/features/quiz-page.js",
  "js/features/trainer-page.js",
  "js/features/home-page.js",
  "js/features/theory-page.js",
  "js/features/chapters-bindings.js",
  "js/features/glossary-page.js",
  "js/features/static-pages.js",
  "js/features/projects.js",
  "js/features/pandas-case.js",
  "js/features/calc.js",
  "js/features/cards.js",
  "js/app.js",
  "js/data.js",
  "js/topics/analytics.js",
  "js/topics/statistics.js",
  "js/topics/gametheory.js",
  "js/topics/probability.js",
  "js/topics/data.js",
  "js/topics/sql.js",
  "js/topics/excel.js",
  "js/topics/python.js",
  "js/topics/cs.js",
  "js/topics/regression.js",
  "js/topics/classification.js",
  "js/topics/ml.js",
  "js/topics/timeseries.js",
  "js/topics/causal.js",
  "js/topics/useful.js",
  "js/topics/ethics.js",
  "js/topics/bi.js",
  "js/topics/production.js",
  "js/core/tracks.js",
  "VERSION",
  "data/case-orders.csv",
  "data/ab-test.csv",
  "data/churn.csv",
  "data/marketing.csv",
  "data/bi-orders.csv",
  "data/dirty-customers.csv",
  "dbt-subscription.zip",
  "data/retail-users.csv",
  "data/retail-orders.csv",
  "data/retail-events.csv",
  "data/retail-marketing.csv",
  "data/pandas-case-starter.py",
  "data/sub-users.csv",
  "data/sub-subscriptions.csv",
  "data/sub-payments.csv",
  "data/sub-tickets.csv",
  "data/mart_subscription_health.csv",
  "data/mart_monthly_revenue.csv",
  "data/mart_channel_cohort.csv",
  "data/mart_payment_summary.csv",
  "data/dashboard-sales-template.svg",
  "data/dashboard-product-template.svg",
  "data/dashboard-sales-template.md",
  "data/dashboard-product-template.md",
  "js/core/cheatsheet.js",
  "js/core/glossary.js",
  "js/features/trainers-core.js",
  "js/features/trainers-analytics.js",
  "js/features/trainers-foundation.js",
  "js/features/trainers-models.js",
  "js/features/trainers-practice.js",
  "js/features/trainers.js",
  "js/features/dbt-project.js",
  "js/features/games-core.js",
  "js/features/games-views.js",
  "js/features/games.js",
  "js/core/progress.js",
  "js/core/sources.js",
  "js/core/achievements.js",
  "js/core/search.js",
  "js/features/demos-core.js",
  "js/features/demos-views.js",
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
