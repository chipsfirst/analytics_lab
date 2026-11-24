// Конструктор дашборда: фиксированные данные, SQL/Python и настройка экрана.
(function () {
  "use strict";

  var DATA_URL = "data/bi-orders.csv";
  var KEY = "analytics-lab-dashboard-v1";
  var SQL_DEFAULT = "SELECT city, channel, category, units, revenue\nFROM orders\nWHERE returned = 0;";
  var PY_DEFAULT = 'import csv\n\nrows = list(csv.DictReader(open("bi-orders.csv", encoding="utf-8")))\n' +
    'result = [\n    {"city": r["city"], "channel": r["channel"], "category": r["category"],\n' +
    '     "units": int(r["units"]), "revenue": int(r["revenue"])}\n' +
    '    for r in rows if r["returned"] == "0"\n]\nlen(result)';
  var LABELS = {
    order_id: "Заказ", order_date: "Дата", city: "Город", channel: "Канал",
    category: "Категория", units: "Единицы", revenue: "Выручка",
    returned: "Возврат", customer_id: "Клиент"
  };

  var state = {
    rows: [], columns: [], source: "", db: null, csvRows: null, csvText: "",
    prep: null, pyMounted: false, pyCleanup: null,
    config: { dim: "city", metric: "revenue", agg: "sum", chart: "bar" }
  };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function label(key) { return LABELS[key] || key; }

  function fmt(n) {
    if (!isFinite(n)) return "—";
    return (Math.round(n * 10) / 10).toLocaleString("ru-RU");
  }

  function unit(key) {
    return /revenue|amount|price|sum/i.test(key) ? " ₽" : "";
  }

  function isNum(v) {
    return v !== null && v !== "" && v !== undefined && isFinite(Number(v));
  }

  function parseCsv(text) {
    var rows = [], row = [], cur = "", quoted = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (quoted) {
        if (ch === '"') {
          if (text[i + 1] === '"') { cur += '"'; i++; }
          else quoted = false;
        } else cur += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ",") { row.push(cur); cur = ""; }
      else if (ch === "\n") {
        row.push(cur);
        if (row.length > 1 || row[0] !== "") rows.push(row);
        row = []; cur = "";
      } else if (ch !== "\r") cur += ch;
    }
    if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
    var header = rows.shift() || [];
    return rows.map(function (r) {
      var o = {};
      header.forEach(function (h, i) { o[h.trim()] = r[i] === undefined ? "" : r[i]; });
      return o;
    });
  }

  function loadCsv() {
    if (state.csvRows) return Promise.resolve(state.csvRows);
    return fetch(DATA_URL).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    }).then(function (text) {
      state.csvText = text;
      state.csvRows = parseCsv(text);
      return state.csvRows;
    });
  }

  function initDb(rows) {
    if (state.db) return Promise.resolve(state.db);
    if (!window.initSqlJs) return Promise.reject(new Error("Движок sql.js не загрузился."));
    return window.initSqlJs({ locateFile: function (f) { return "vendor/" + f; } }).then(function (SQL) {
      var db = new SQL.Database();
      db.run("CREATE TABLE orders (order_id INTEGER, order_date TEXT, city TEXT, channel TEXT, " +
        "category TEXT, units INTEGER, revenue INTEGER, returned INTEGER, customer_id INTEGER);");
      rows.forEach(function (r) {
        db.run("INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?)", [
          Number(r.order_id), r.order_date, r.city, r.channel, r.category,
          Number(r.units), Number(r.revenue), Number(r.returned), Number(r.customer_id)
        ]);
      });
      state.db = db;
      return db;
    });
  }

  function prepare() {
    if (state.prep) return state.prep;
    state.prep = loadCsv().then(function (rows) { return initDb(rows); });
    return state.prep;
  }

  function normalize(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.slice(0, 2000).filter(function (r) {
      return r && typeof r === "object" && !Array.isArray(r);
    }).map(function (r) {
      var o = {};
      Object.keys(r).forEach(function (k) { o[k] = r[k]; });
      return o;
    });
  }

  function columnsOf(rows) {
    var keys = [];
    rows.slice(0, 50).forEach(function (r) {
      Object.keys(r).forEach(function (k) { if (keys.indexOf(k) === -1) keys.push(k); });
    });
    return keys.map(function (k) {
      var values = rows.map(function (r) { return r[k]; });
      var present = values.filter(function (v) { return v !== null && v !== "" && v !== undefined; });
      return { key: k, numeric: present.length > 0 && present.every(isNum) };
    });
  }

  function aggregate(values, agg) {
    if (agg === "count") return values.length;
    var nums = values.map(Number).filter(function (n) { return isFinite(n); });
    if (!nums.length) return NaN;
    if (agg === "avg") return nums.reduce(function (a, b) { return a + b; }, 0) / nums.length;
    if (agg === "min") return Math.min.apply(null, nums);
    if (agg === "max") return Math.max.apply(null, nums);
    return nums.reduce(function (a, b) { return a + b; }, 0);
  }

  function buildModel(rows, cfg) {
    var map = {};
    rows.forEach(function (r) {
      var key = r[cfg.dim] === null || r[cfg.dim] === undefined || r[cfg.dim] === "" ? "(пусто)" : String(r[cfg.dim]);
      if (!map[key]) map[key] = [];
      map[key].push(cfg.agg === "count" ? 1 : Number(r[cfg.metric]));
    });
    var groups = Object.keys(map).map(function (k) {
      return { label: k, value: aggregate(map[k], cfg.agg) };
    });
    if (cfg.chart === "line") {
      groups.sort(function (a, b) { return a.label.localeCompare(b.label, "ru"); });
    } else {
      groups.sort(function (a, b) {
        var av = isFinite(a.value) ? a.value : -Infinity, bv = isFinite(b.value) ? b.value : -Infinity;
        return bv - av || a.label.localeCompare(b.label, "ru");
      });
    }
    var limit = cfg.chart === "bar" ? 8 : cfg.chart === "table" ? 12 : 24;
    var all = groups;
    groups = groups.slice(0, limit);
    var total = cfg.agg === "count" ? rows.length : aggregate(rows.map(function (r) { return Number(r[cfg.metric]); }), cfg.agg);
    return {
      total: total,
      groups: groups,
      allGroups: all,
      rows: rows.length,
      limit: limit,
      metric: cfg.metric,
      dim: cfg.dim,
      agg: cfg.agg,
      chart: cfg.chart
    };
  }

  function chart(config) {
    if (config.chart === "bar") {
      var max = Math.max.apply(null, config.groups.map(function (g) {
        return isFinite(g.value) ? g.value : 0;
      }).concat([1]));
      return '<div class="dash-bars">' + config.groups.map(function (g) {
        var w = Math.max(2, Math.round((isFinite(g.value) ? g.value : 0) / max * 100));
        return '<div class="dash-bar-row"><span>' + esc(g.label) + '</span>' +
          '<div class="dash-bar"><i style="width:' + w + '%"></i></div>' +
          '<b>' + esc(fmt(g.value)) + '</b></div>';
      }).join("") + "</div>";
    }
    if (config.chart === "line") {
      var w = 720, h = 220, left = 26, right = 14, top = 16, bottom = 32;
      var vals = config.groups.map(function (g) { return isFinite(g.value) ? g.value : 0; });
      var maxV = Math.max.apply(null, vals.concat([1]));
      var minV = Math.min.apply(null, vals.concat([0]));
      var range = maxV - minV || 1;
      var pts = vals.map(function (v, i) {
        var x = left + i * (w - left - right) / Math.max(1, vals.length - 1);
        var y = h - bottom - (v - minV) / range * (h - top - bottom);
        return x.toFixed(1) + "," + y.toFixed(1);
      });
      var step = Math.max(1, Math.ceil(config.groups.length / 8));
      var labels = config.groups.map(function (g, i) {
        if (i % step !== 0 && i !== config.groups.length - 1) return "";
        var x = left + i * (w - left - right) / Math.max(1, vals.length - 1);
        return '<text x="' + x.toFixed(1) + '" y="' + (h - 8) + '" font-size="10" fill="currentColor" opacity=".6">' +
          esc(g.label) + "</text>";
      }).join("");
      return '<svg class="dash-chart" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' +
        esc(label(config.metric) + " по " + label(config.dim)) + '">' +
        '<line x1="' + left + '" y1="' + (h - bottom) + '" x2="' + (w - right) + '" y2="' + (h - bottom) +
        '" stroke="currentColor" opacity=".2"/>' +
        '<polyline points="' + pts.join(" ") + '" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>' +
        pts.map(function (p) {
          var xy = p.split(",");
          return '<circle cx="' + xy[0] + '" cy="' + xy[1] + '" r="3" fill="currentColor"/>';
        }).join("") + labels + "</svg>";
    }
    if (config.chart === "table") {
      return '<div class="table-wrap"><table><thead><tr><th>' + esc(label(config.dim)) +
        "</th><th>" + esc(label(config.metric)) + "</th></tr></thead><tbody>" +
        config.groups.map(function (g) {
          return "<tr><td>" + esc(g.label) + "</td><td>" + esc(fmt(g.value) + unit(config.metric)) + "</td></tr>";
        }).join("") + "</tbody></table></div>";
    }
    return "";
  }

  function render() {
    var out = document.getElementById("dashOut");
    var source = document.getElementById("dashSource");
    var preview = document.getElementById("dashPreview");
    if (!out) return;
    if (source) {
      source.textContent = state.rows.length
        ? "Источник: " + state.source + " · " + state.rows.length + " строк · " + state.columns.length + " колонок"
        : "Источник: выполните SQL-запрос или Python-код.";
    }
    if (!state.rows.length) {
      out.innerHTML = '<div class="card"><p class="meta">Пока нет результата. Выполните запрос слева.</p></div>';
      if (preview) preview.innerHTML = "";
      return;
    }
    var cfg = state.config;
    var model = buildModel(state.rows, cfg);
    var totalText = fmt(model.total) + (cfg.agg === "count" ? "" : unit(cfg.metric));
    out.innerHTML = '<div class="dash-kpis">' +
      '<div class="dash-kpi"><span>' + esc((cfg.agg === "count" ? "Количество строк" : label(cfg.metric))) +
      "</span><b>" + esc(totalText) + "</b><span class=\"meta\">" +
      esc(cfg.agg === "count" ? "всего строк" : "итог по всем строкам") + "</span></div>" +
      '<div class="dash-kpi"><span>Строк в результате</span><b>' + esc(fmt(model.rows)) +
      '</b><span class="meta">' + esc(model.allGroups.length + " групп по «" + label(cfg.dim) + "»") + "</span></div>" +
      "</div>" +
      (cfg.chart === "kpi" ? '<div class="card"><p class="meta">Выберите «Столбцы», «Линия» или «Таблица», чтобы увидеть разрез.</p></div>' :
        '<div class="card"><div class="dash-title"><h2>' + esc(label(cfg.metric) + " по " + label(cfg.dim)) +
        '</h2><span class="meta">' + esc(model.groups.length + " из " + model.allGroups.length) +
        (model.allGroups.length > model.limit ? " · показаны не все" : "") + "</span></div>" +
        chart(model) + '<p class="meta">Агрегат: ' + esc(cfg.agg) + ". Это учебный срез, а не завершённый отчёт.</p></div>");
    if (preview) {
      var keys = state.columns.map(function (c) { return c.key; });
      preview.innerHTML = '<div class="table-wrap"><table><thead><tr>' +
        keys.map(function (k) { return "<th>" + esc(label(k)) + "</th>"; }).join("") +
        "</tr></thead><tbody>" + state.rows.slice(0, 8).map(function (r) {
          return "<tr>" + keys.map(function (k) { return "<td>" + esc(r[k]) + "</td>"; }).join("") + "</tr>";
        }).join("") + "</tbody></table></div><p class=\"meta\">Показаны первые 8 строк.</p>";
    }
  }

  function syncControls() {
    var dimSel = document.getElementById("dashDim");
    var metricSel = document.getElementById("dashMetric");
    var aggSel = document.getElementById("dashAgg");
    var chartSel = document.getElementById("dashChart");
    if (!dimSel || !metricSel || !aggSel || !chartSel) return;
    var cols = state.columns;
    var dims = cols.slice().sort(function (a, b) { return Number(a.numeric) - Number(b.numeric); });
    var metrics = cols.filter(function (c) { return c.numeric; });
    var cfg = state.config;
    if (!dims.some(function (c) { return c.key === cfg.dim; })) cfg.dim = dims.length ? dims[0].key : "";
    if (!metrics.some(function (c) { return c.key === cfg.metric; })) cfg.metric = metrics.length ? metrics[0].key : "__count__";
    if (cfg.metric === "__count__") cfg.agg = "count";
    if (["sum", "avg", "count", "min", "max"].indexOf(cfg.agg) === -1) cfg.agg = "sum";
    if (["bar", "line", "kpi", "table"].indexOf(cfg.chart) === -1) cfg.chart = "bar";

    dimSel.innerHTML = dims.map(function (c) {
      return '<option value="' + esc(c.key) + '">' + esc(label(c.key)) + "</option>";
    }).join("");
    metricSel.innerHTML = '<option value="__count__">Количество строк</option>' + metrics.map(function (c) {
      return '<option value="' + esc(c.key) + '">' + esc(label(c.key)) + "</option>";
    }).join("");
    dimSel.value = cfg.dim;
    metricSel.value = cfg.metric;
    aggSel.value = cfg.agg;
    chartSel.value = cfg.chart;
    saveConfig();
  }

  function setRows(rows, source) {
    state.rows = normalize(rows);
    state.source = source;
    state.columns = columnsOf(state.rows);
    syncControls();
    render();
  }

  function saveConfig() {
    try { localStorage.setItem(KEY, JSON.stringify(state.config)); } catch (e) {}
  }

  function loadConfig() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (v && typeof v === "object") {
        state.config = {
          dim: String(v.dim || "city"), metric: String(v.metric || "revenue"),
          agg: String(v.agg || "sum"), chart: String(v.chart || "bar")
        };
      }
    } catch (e) {}
  }

  function setTab(name) {
    state.tab = name;
    document.querySelectorAll("[data-dash-tab]").forEach(function (b) {
      var on = b.getAttribute("data-dash-tab") === name;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    var sql = document.getElementById("dashSqlPane");
    var py = document.getElementById("dashPyPane");
    if (sql) sql.hidden = name !== "sql";
    if (py) py.hidden = name !== "python";
    if (name === "python") mountPython();
  }

  function mountPython() {
    if (state.pyMounted) return;
    state.pyMounted = true;
    var root = document.getElementById("dashPy");
    if (!root) return;
    root.innerHTML = '<p class="meta">Загрузка данных для Python…</p>';
    loadCsv().then(function () {
      if (!document.getElementById("dashPy")) return;
      state.pyCleanup = window.PYSANDBOX.mount(root, {
        keySuffix: "-dash",
        files: { "bi-orders.csv": state.csvText },
        cells: [PY_DEFAULT],
        onData: function (rows) {
          if (!Array.isArray(rows) || !rows.length) {
            var st = document.getElementById("dashPyStatus");
            if (st) st.textContent = "Python выполнен, но список result пуст или не найден.";
            return;
          }
          setRows(rows, "Python");
          var el = document.getElementById("dashPyStatus");
          if (el) el.textContent = "Готово: " + rows.length + " строк.";
        }
      });
    }).catch(function () {
      root.innerHTML = '<p class="verdict bad">Не удалось загрузить фиксированные данные.</p>';
    });
  }

  function runSql(auto) {
    var ta = document.getElementById("dashSql");
    var status = document.getElementById("dashSqlStatus");
    var btn = document.getElementById("dashRunSql");
    if (!ta || !status || !btn) return;
    var sql = ta.value.trim();
    if (!sql) { status.textContent = "Напишите SQL-запрос."; return; }
    status.textContent = "Выполняю…";
    btn.disabled = true;
    prepare().then(function (db) {
      var res = db.exec(sql);
      var table = null;
      for (var i = res.length - 1; i >= 0; i--) if (res[i].columns && res[i].columns.length) { table = res[i]; break; }
      if (!table) {
        status.textContent = "Запрос выполнен, но не вернул таблицу.";
        return;
      }
      var rows = table.values.map(function (vals) {
        var o = {};
        table.columns.forEach(function (c, j) { o[c] = vals[j]; });
        return o;
      });
      setRows(rows, "SQL");
      status.textContent = "Готово: " + rows.length + " строк.";
      if (auto) status.textContent += " Это стартовый запрос — меняйте его.";
    }).catch(function (e) {
      status.textContent = "Ошибка: " + (e && e.message ? e.message : "не удалось выполнить запрос");
    }).then(function () { btn.disabled = false; });
  }

  function mount() {
    var app = document.getElementById("app");
    if (!app) return null;
    loadConfig();
    state.rows = []; state.columns = []; state.source = ""; state.db = null;
    state.csvRows = null; state.csvText = ""; state.prep = null;
    state.pyMounted = false; state.pyCleanup = null;
    app.innerHTML = '<p><a href="#/tools">&larr; к инструментам</a></p>' +
      "<h1>Конструктор дашборда</h1>" +
      '<p class="lead">Соберите экран из фиксированных данных: напишите SQL или Python, затем выберите разрез, метрику и график. ' +
      "Свои CSV загружать нельзя — набор данных одинаков для всех.</p>" +
      '<div class="card"><div class="dash-tabs" role="tablist">' +
      '<button class="btn active" data-dash-tab="sql" role="tab" aria-selected="true">SQL</button>' +
      '<button class="btn" data-dash-tab="python" role="tab" aria-selected="false">Python</button>' +
      "</div>" +
      '<div id="dashSqlPane" class="dash-pane"><p class="meta" id="dashDataInfo">Фиксированные данные: 28 заказов из bi-orders.csv.</p>' +
      '<label class="sr-only" for="dashSql">SQL-запрос</label>' +
      '<textarea id="dashSql" spellcheck="false" rows="7">' + esc(SQL_DEFAULT) + "</textarea>" +
      '<div class="dash-actions"><button class="btn primary" id="dashRunSql">Выполнить SQL</button>' +
      '<span id="dashSqlStatus" class="meta">Готовлю базу…</span></div></div>' +
      '<div id="dashPyPane" class="dash-pane" hidden><p class="meta">Python получает тот же bi-orders.csv. ' +
      'Код должен оставить список словарей в переменной <code>result</code>; можно вернуть и DataFrame.</p>' +
      '<div id="dashPy"></div><p id="dashPyStatus" class="meta"></p></div></div>' +
      '<div class="card"><h2>Настройка</h2><div class="dash-controls">' +
      '<label>Разрез<select id="dashDim"></select></label>' +
      '<label>Метрика<select id="dashMetric"></select></label>' +
      '<label>Агрегат<select id="dashAgg"><option value="sum">Сумма</option><option value="avg">Среднее</option>' +
      '<option value="count">Количество</option><option value="min">Минимум</option><option value="max">Максимум</option></select></label>' +
      '<label>График<select id="dashChart"><option value="bar">Столбцы</option><option value="line">Линия</option>' +
      '<option value="kpi">Только KPI</option><option value="table">Таблица</option></select></label>' +
      '</div><div class="dash-actions"><button class="btn" id="dashReset">Сбросить настройки</button>' +
      '<span id="dashSource" class="meta"></span></div></div>' +
      '<div id="dashOut"></div>' +
      '<details class="card"><summary><b>Исходные строки</b> — первые 8</summary><div id="dashPreview"></div></details>' +
      '<p class="demo-note">Данные фиксированы: <code>bi-orders.csv</code>, 28 заказов. Это учебный конструктор, ' +
      "а не BI-система: нет загрузки файлов, расписаний и прав доступа.</p>";

    document.querySelectorAll("[data-dash-tab]").forEach(function (b) {
      b.addEventListener("click", function () { setTab(b.getAttribute("data-dash-tab")); });
    });
    document.getElementById("dashRunSql").addEventListener("click", function () { runSql(false); });
    var ta = document.getElementById("dashSql");
    ta.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); runSql(false); }
    });
    ["dashDim", "dashMetric", "dashAgg", "dashChart"].forEach(function (id) {
      document.getElementById(id).addEventListener("change", function () {
        state.config = {
          dim: document.getElementById("dashDim").value,
          metric: document.getElementById("dashMetric").value,
          agg: document.getElementById("dashAgg").value,
          chart: document.getElementById("dashChart").value
        };
        if (state.config.metric === "__count__") state.config.agg = "count";
        saveConfig();
        render();
      });
    });
    document.getElementById("dashReset").addEventListener("click", function () {
      state.config = { dim: "city", metric: "revenue", agg: "sum", chart: "bar" };
      syncControls();
      render();
    });

    prepare().then(function () {
      var info = document.getElementById("dashDataInfo");
      if (info) info.textContent = "Фиксированные данные: " + state.csvRows.length + " заказов из bi-orders.csv. Свои CSV загружать нельзя.";
      runSql(true);
    }).catch(function (e) {
      var status = document.getElementById("dashSqlStatus");
      if (status) status.textContent = "Не удалось подготовить данные: " + (e && e.message ? e.message : "ошибка");
    });

    return function cleanup() {
      if (state.db) { try { state.db.close(); } catch (e) {} state.db = null; }
      if (state.pyCleanup) { try { state.pyCleanup(); } catch (e) {} state.pyCleanup = null; }
      state.pyMounted = false;
    };
  }

  window.DASHBOARD_BUILDER = {
    mount: mount,
    buildModel: buildModel,
    columnsOf: columnsOf,
    parseCsv: parseCsv
  };
})();
