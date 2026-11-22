// Песочница SQL на sql.js: настоящая база в браузере.
// Требует http(s): под file:// браузер не отдаст wasm-файл.

(function () {
  "use strict";

  var SCHEMA = [
    "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, city TEXT, created_at TEXT);",
    "CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, amount NUMERIC, discount NUMERIC, created_at TEXT);",
    "INSERT INTO users VALUES (1,'Анна','Москва','2026-01-05'),(2,'Борис','Казань','2026-01-11')," +
      "(3,'Вера','Москва','2026-01-19'),(4,'Глеб','Сочи','2026-02-02'),(5,'Дина','Казань','2026-02-14');",
    "INSERT INTO orders VALUES (1,1,1200,NULL,'2026-02-01'),(2,1,800,10,'2026-02-04')," +
      "(3,2,2500,5,'2026-02-06'),(4,3,600,NULL,'2026-02-09'),(5,3,1400,15,'2026-02-12')," +
      "(6,1,300,5,'2026-02-15'),(7,2,900,NULL,'2026-02-18'),(8,4,2000,10,'2026-02-21')," +
      "(9,3,750,NULL,'2026-02-24'),(10,2,1100,20,'2026-03-01');"
  ];

  var SCHEMA_HTML =
    '<table><thead><tr><th>Таблица</th><th>Поля</th></tr></thead><tbody>' +
    "<tr><td>users</td><td>id, name, city, created_at</td></tr>" +
    "<tr><td>orders</td><td>id, user_id, amount, discount (бывает NULL), created_at</td></tr>" +
    "</tbody></table>" +
    "<p>5 пользователей, 10 заказов. Попробуйте: сумму по городам, LEFT JOIN, " +
    "COUNT(*) против COUNT(discount), ROW_NUMBER() OVER (PARTITION BY city ORDER BY amount DESC).</p>";

  var PRESETS = [
    ["Все заказы", "SELECT * FROM orders ORDER BY amount DESC;"],
    ["Выручка по городам", "SELECT u.city, COUNT(*) AS orders, SUM(o.amount) AS revenue\n" +
      "FROM orders o JOIN users u ON u.id = o.user_id\nGROUP BY u.city\nORDER BY revenue DESC;"],
    ["Пользователи без заказов", "SELECT u.name, COUNT(o.id) AS orders\n" +
      "FROM users u LEFT JOIN orders o ON o.user_id = u.id\nGROUP BY u.name\nORDER BY orders;"],
    ["Нумерация внутри города", "SELECT u.city, o.amount,\n" +
      "  ROW_NUMBER() OVER (PARTITION BY u.city ORDER BY o.amount DESC) AS rn\n" +
      "FROM orders o JOIN users u ON u.id = o.user_id;"],
    ["COUNT(*) и COUNT(discount)", "SELECT COUNT(*) AS rows_all, COUNT(discount) AS not_null\nFROM orders;"]
  ];

  var engine = null;   // загруженный sql.js
  var db = null;       // текущая база
  var loading = null;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function resetDb() {
    db = new engine.Database();
    SCHEMA.forEach(function (sql) { db.run(sql); });
  }

  function renderTable(res) {
    var rows = res.values.slice(0, 200);
    var head = "<tr>" + res.columns.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr>";
    var body = rows.map(function (r) {
      return "<tr>" + r.map(function (v) {
        return "<td>" + (v === null ? "<i>NULL</i>" : esc(v)) + "</td>";
      }).join("") + "</tr>";
    }).join("");
    return "<table class=\"result-table\"><thead>" + head + "</thead><tbody>" + body + "</tbody></table>" +
      "<p class=\"meta\">Строк в результате: " + res.values.length +
      (res.values.length > 200 ? " (показаны первые 200)" : "") + "</p>";
  }

  window.SANDBOX = {
    mount: function (root) {
      root.innerHTML =
        '<div class="card">' +
        '<div class="sandbox-bar">' +
        '<button class="btn primary" id="sRun">Выполнить</button>' +
        '<select id="sPreset" aria-label="Готовые запросы"><option value="">Готовые запросы…</option>' +
        PRESETS.map(function (p, i) { return '<option value="' + i + '">' + esc(p[0]) + "</option>"; }).join("") +
        "</select>" +
        '<button class="btn" id="sReset">Сбросить базу</button>' +
        "</div>" +
        '<label class="sr-only" for="sQuery">SQL-запрос</label>' +
        '<textarea id="sQuery" spellcheck="false" rows="5">SELECT * FROM orders ORDER BY amount DESC;</textarea>' +
        '<div id="sOut" class="sandbox-out" aria-live="polite">Загрузка движка…</div>' +
        '<details class="schema"><summary>Схема и данные</summary>' + SCHEMA_HTML + "</details>" +
        "</div>";

      var ta = document.getElementById("sQuery");
      var out = document.getElementById("sOut");
      var runBtn = document.getElementById("sRun");

      function say(html) { out.innerHTML = html; }
      function fail(msg) { say('<p class="verdict bad" role="status">' + esc(msg) + "</p>"); }

      if (location.protocol === "file:") {
        say('<p class="verdict bad" role="status">Песочница не работает, если открыть файл двойным щелчком: ' +
          "браузер не отдаёт wasm-файл с локального диска. Запустите <code>python3 -m http.server 8000</code> " +
          "в папке проекта и откройте http://localhost:8000.</p>");
        runBtn.disabled = true;
        return;
      }

      function ensure(cb) {
        if (db) return cb();
        if (!window.initSqlJs) return fail("Движок sql.js не загрузился. Проверьте папку vendor/.");
        if (!loading) {
          loading = window.initSqlJs({ locateFile: function (f) { return "vendor/" + f; } })
            .then(function (SQL) { engine = SQL; resetDb(); })
            .catch(function () { loading = null; throw new Error("load"); });
        }
        loading.then(cb).catch(function () { fail("Не удалось загрузить движок sql.js."); });
      }

      function run() {
        var sql = ta.value.trim();
        if (!sql) return;
        ensure(function () {
          try {
            var res = db.exec(sql);
            if (!res.length) {
              say('<p>Запрос выполнен. Строк изменено: ' + db.getRowsModified() + ".</p>");
            } else {
              say(res.map(renderTable).join(""));
            }
          } catch (e) {
            fail(e.message);
          }
        });
      }

      runBtn.addEventListener("click", run);
      ta.addEventListener("keydown", function (e) {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run();
      });

      document.getElementById("sPreset").addEventListener("change", function (e) {
        if (e.target.value === "") return;
        ta.value = PRESETS[Number(e.target.value)][1];
        e.target.value = "";
        run();
      });

      document.getElementById("sReset").addEventListener("click", function () {
        ensure(function () { resetDb(); say("<p>База восстановлена в исходном виде.</p>"); });
      });

      ensure(function () { say("<p>Готово: пишите запрос и жмите «Выполнить» (или Cmd/Ctrl + Enter).</p>"); });
    }
  };
})();
