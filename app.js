// Совместимость со старыми кешами: прежний index.html подключал скрипты
// из корня. Если такой кеш ещё жив, этот файл загрузит актуальные модули.
(function () {
  "use strict";
  if (window.__APP_BOOTSTRAPPED__) return;
  window.__APP_BOOTSTRAPPED__ = true;

  var files = [
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
    "js/core/cheatsheet.js",
    "js/features/trainers.js",
    "js/features/games.js",
    "js/core/progress.js",
    "js/core/search.js",
    "js/features/demos.js",
    "js/sandboxes/sql.js",
    "js/sandboxes/python.js",
    "js/app.js"
  ];

  var i = 0;
  function next() {
    if (i >= files.length) {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener("controllerchange", function () {
          location.reload();
        });
        navigator.serviceWorker.addEventListener("message", function (e) {
          if (e.data && e.data.type === "reload") location.reload();
        });
      }
      return;
    }
    var s = document.createElement("script");
    s.src = files[i++];
    s.onload = next;
    s.onerror = next;
    document.head.appendChild(s);
  }
  next();
})();
