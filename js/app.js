(function () {
  "use strict";

  var app = document.getElementById("app");
  var nav = document.getElementById("nav");
  var cleanup = null;
  var keyHandler = null;
  var tocObserver = null;

  // один обработчик клавиатуры на всю страницу: тесты меняют карточку целиком
  function setKeys(fn) {
    if (keyHandler) document.removeEventListener("keydown", keyHandler);
    keyHandler = fn;
    if (fn) document.addEventListener("keydown", fn);
  }

  var NAV = [
    ["#/", "Главная"],
    ["#/textbook", "Учебник"],
    ["#/tools", "Инструменты"],
    ["#/games", "Игры"],
    ["#/demos", "Демо"],
    ["#/glossary", "Словарь"]
  ];

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // варианты хранятся строками, правильный задан индексом correct
  function quizOptions(q) {
    return shuffle((q.options || []).map(function (o, i) {
      return typeof o === "string" ? { text: o, ok: i === q.correct } : { text: o.text, ok: !!o.ok };
    }));
  }

  var TOPIC_META = {
    analytics: { icon: "target" },
    statistics: { icon: "sigma" },
    gametheory: { icon: "scale" },
    probability: { icon: "dice" },
    data: { icon: "layers" },
    sql: { icon: "database" },
    excel: { icon: "table" },
    python: { icon: "code" },
    cs: { icon: "cpu" },
    regression: { icon: "trend" },
    classification: { icon: "tag" },
    ml: { icon: "network" },
    ai: { icon: "network" },
    marketing: { icon: "trend" },
    simulation: { icon: "gear" },
    timeseries: { icon: "wave" },
    causal: { icon: "link" },
    ethics: { icon: "shield" },
    useful: { icon: "note" },
    bi: { icon: "chart" },
    production: { icon: "gear" }
  };

  var ICONS = {
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
    sigma: '<path d="M18 5H7l5 7-5 7h11"/>',
    scale: '<path d="M12 4v16M5 8h14M7 8l-3 6h6zM17 8l-3 6h6z"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r=".8"/><circle cx="15" cy="15" r=".8"/><circle cx="15" cy="9" r=".8"/><circle cx="9" cy="15" r=".8"/>',
    database: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
    table: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M10 5v14"/>',
    code: '<path d="M9 8l-4 4 4 4M15 8l4 4-4 4"/>',
    cpu: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    trend: '<path d="M4 19V5M4 19h16"/><path d="M7 15l4-4 3 2 5-6"/>',
    tag: '<path d="M4 12V5h7l8 8-7 7-8-8z"/><circle cx="8" cy="9" r="1.2"/>',
    network: '<circle cx="6" cy="7" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="12" cy="17" r="2"/><path d="M8 8l3 7M16 8l-3 7M8 7h8"/>',
    note: '<path d="M6 4h9l4 4v12H6z"/><path d="M9 11h7M9 15h5"/>',
    chart: '<path d="M5 19V5M5 19h15"/><rect x="8" y="12" width="3" height="5"/><rect x="13" y="9" width="3" height="8"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5M3 16l9 5 9-5"/>',
    link: '<path d="M10 14a4 4 0 005.7 0l2.3-2.3a4 4 0 00-5.7-5.7L11 7.3"/><path d="M14 10a4 4 0 00-5.7 0l-2.3 2.3a4 4 0 005.7 5.7L13 16.7"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 001.8 3h10.4A2 2 0 0019 18l-5-9V3"/><path d="M7.5 15h9"/>',
    book: '<path d="M5 5.5A2.5 2.5 0 017.5 3H19v16H7.5A2.5 2.5 0 005 21.5z"/><path d="M5 18.5A2.5 2.5 0 017.5 16H19"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5l2.6-1.5M17.2 9l2.6-1.5"/>',
    wave: '<path d="M3 15c3-7 6-7 9 0s6 7 9 0"/>',
    shield: '<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    star: '<path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.4l6.1-.9z"/>'
  };

  function icon(name) {
    return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      (ICONS[name] || ICONS.book) + "</svg>";
  }

  function chapterIcon(title) {    var s = String(title).toLowerCase();
    if (/корреляц|связ/.test(s)) return "link";
    if (/регресс|предсказ|нелинейн/.test(s)) return "trend";
    if (/кластер|дерев|лес|компонент|ансамбл|фактор/.test(s)) return "network";
    if (/байес|бернулли|вероятн|распредел|случайн|комбинатор|пуассон/.test(s)) return "dice";
    if (/sql|запрос|соедин|подзапрос|оконн|агрегат|таблиц|фильтрац/.test(s)) return "database";
    if (/excel|формул|сводн|впр|ссылки/.test(s)) return "table";
    if (/python|строк|списк|цикл|данные и их типы/.test(s)) return "code";
    if (/гипотез|критери|мощност|доверит|ошибк|бутстрап|перестанов|дисперс|оценк/.test(s)) return "flask";
    if (/игр|равновес|стратег|доминир/.test(s)) return "scale";
    if (/метрик|конверс|когорт|a\/b|эксперимент|валидност/.test(s)) return "target";
    if (/визуализ|график|диаграм|чек-лист/.test(s)) return "chart";
    if (/заметк|вниман|spss/.test(s)) return "note";
    return null;
  }

  function topicIds() {
    var order = window.TOPIC_ORDER || Object.keys(window.TOPICS);
    return order.filter(function (id) { return !!window.TOPICS[id]; })
      .concat(Object.keys(window.TOPICS).filter(function (id) { return order.indexOf(id) < 0; }));
  }

  function path() {
    return location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  }

  function renderNav() {
    var cur = "#/" + path().join("/");
    nav.innerHTML = NAV.map(function (n) {
      var active = n[0] === "#/"
        ? cur === "#/"
        : n[0] === "#/textbook"
          ? /^#\/(textbook|theory|quiz|trainer)/.test(cur)
          : cur.indexOf(n[0]) === 0;
      return '<a href="' + n[0] + '"' + (active ? ' class="active" aria-current="page"' : "") + ">" + n[1] + "</a>";
    }).join("");
  }

  function progressLine(id) {
    var t = window.TOPICS[id];
    var read = window.PROGRESS.readCount(id);
    var q = window.PROGRESS.quiz(id);
    var parts = ["Глав: " + Math.min(read, t.chapters.length) + " из " + t.chapters.length];
    if (q) parts.push("Тест: " + q.best + " из " + q.total);
    return '<p class="meta">' + parts.join(" · ") + "</p>";
  }

  function topicCard(id, cta, linkable) {
    var t = window.TOPICS[id];
    var meta = TOPIC_META[id] || {};
    var links = cta
      ? '<a class="btn primary" href="#/' + cta.kind + "/" + id + '">' + esc(cta.label) + "</a>"
      : '<a class="btn" href="#/theory/' + id + '">Теория</a>' +
        '<a class="btn" href="#/quiz/' + id + '">Тест</a>' +
        '<a class="btn" href="#/trainer/' + id + '">Тренажёр</a>';
    var total = t.chapters.length;
    var read = Math.min(window.PROGRESS.readCount(id), total);
    var pct = total ? Math.round(read / total * 100) : 0;
    return '<div class="card" data-topic="' + id + '"' + (linkable ? ' data-href="#/theory/' + id + '"' : "") + ">" +
      "<h3>" + icon(meta.icon) + esc(t.title) + "</h3>" +
      '<div class="topic-bar" aria-hidden="true"><div style="width:' + pct + '%"></div></div>' +
      "<p>" + esc(t.tag) + "</p>" +
      progressLine(id) +
      '<div class="links">' + links + "</div></div>";
  }

  function entryGrid(registry, prefix, label, primary) {
    return '<div class="grid">' + Object.keys(registry).map(function (id) {
      var item = registry[id];
      return '<div class="card"><h3>' + esc(item.title) + "</h3><p>" + esc(item.tag) + "</p>" +
        '<div class="links"><a class="btn' + (primary ? " primary" : "") + '" href="' + prefix + id + '">' +
        esc(label) + "</a></div></div>";
    }).join("") + "</div>";
  }

  function listPage(kind, title, lead, label) {
    return "<h1>" + esc(title) + "</h1><p class=\"lead\">" + lead + "</p>" +
      '<div class="grid">' + topicIds().map(function (id) {
        return topicCard(id, { kind: kind, label: label });
      }).join("") + "</div>";
  }

  function textbookPage() {
    return "<h1>Учебник</h1>" +
      '<p class="lead">Теория, тесты и тренажёры по каждому разделу — в одном месте. ' +
      "Начните с главы, проверьте себя тестом и закрепите расчёт в тренажёре.</p>" +
      '<div class="grid">' + topicIds().map(function (id) {
        return topicCard(id, null, true);
      }).join("") + "</div>";
  }

  function gamesList() {
    return "<h1>Игры</h1><p class=\"lead\">Короткие интерактивные модели: они показывают, где интуиция ошибается.</p>" +
      entryGrid(window.GAMES, "#/games/", "Играть", true);
  }

  function mountPage(registry, id, rootId, listHref, listName, kind) {
    var item = registry[id];
    if (!item) return "<h1>" + kind + " не найдена</h1>";
    app.innerHTML = '<p><a href="' + listHref + '">&larr; ' + listName + "</a></p><h1>" + esc(item.title) +
      "</h1><p class=\"lead\" style=\"margin-bottom:20px\">" + esc(item.tag) + "</p>" +
      '<div id="' + rootId + '"></div>';
    var fn = item.mount(document.getElementById(rootId));
    if (typeof fn === "function") cleanup = fn;
    return null;
  }

  function demosList() {
    return "<h1>Демонстрации</h1><p class=\"lead\">Интерактивные модели: крутите параметры и смотрите, " +
      "как меняется результат.</p>" + entryGrid(window.DEMOS, "#/demos/", "Открыть", true);
  }

  function sandboxPage() {
    app.innerHTML = '<p><a href="#/theory/sql">&larr; к теории SQL</a></p>' +
      "<h1>Песочница SQL</h1><p class=\"lead\" style=\"margin-bottom:20px\">Настоящая база в браузере: " +
      "пишите любой запрос, схема — в подсказке ниже.</p><div id=\"sandbox\"></div>";
    var fn = window.SANDBOX.mount(document.getElementById("sandbox"));
    if (typeof fn === "function") cleanup = fn;
    return null;
  }

  function pySandboxPage() {
    app.innerHTML = '<p><a href="#/theory/python">&larr; к теории Python</a></p>' +
      "<h1>Песочница Python</h1><p class=\"lead\" style=\"margin-bottom:20px\">Блокнот с ячейками: " +
      "код выполняется в браузере, переменные сохраняются между запусками. " +
      "Shift+Enter — выполнить ячейку.</p><div id=\"pysandbox\"></div>";
    var fn = window.PYSANDBOX.mount(document.getElementById("pysandbox"));
    if (typeof fn === "function") cleanup = fn;
    return null;
  }

  function notebookPage() {
    app.innerHTML = '<p><a href="#/theory/python">&larr; к теории Python</a></p>' +
      '<h1>Python-блокнот: заказы</h1>' +
      '<p class="lead" style="margin-bottom:20px">Датасет <code>bi-orders.csv</code> уже лежит рядом: ' +
      "прочитайте его стандартной библиотекой, посчитайте выручку и разрез по каналам. " +
      "Нажмите «Загрузить Python», затем «Запустить всё».</p>" +
      '<div id="notebook"></div>';
    var root = document.getElementById("notebook");
    var nbCleanup = null;
    cleanup = function () { if (typeof nbCleanup === "function") nbCleanup(); };
    fetch("data/bi-orders.csv").then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    }).then(function (csv) {
      if (!document.getElementById("notebook")) return;
      nbCleanup = window.PYSANDBOX.mount(root, {
        keySuffix: "-bi",
        files: { "bi-orders.csv": csv },
        cells: [
          'import csv\n\nrows = list(csv.DictReader(open("bi-orders.csv", encoding="utf-8")))\nprint("Строк в файле:", len(rows))\nprint(rows[0])',
          'revenue = sum(float(r["revenue"]) for r in rows if r["returned"] == "0")\nprint(f"Выручка без возвратов: {revenue:,.0f} ₽")\nprint(f"Средний чек: {revenue / len(rows):,.0f} ₽")',
          'from collections import Counter\nby_channel = Counter()\nfor r in rows:\n    if r["returned"] == "0":\n        by_channel[r["channel"]] += float(r["revenue"])\nfor ch, total in by_channel.most_common():\n    print(ch, f"{total:,.0f} ₽")'
        ]
      });
    }).catch(function () {
      if (root) root.innerHTML = '<p class="verdict bad">Не удалось загрузить data/bi-orders.csv. ' +
        "Откройте сайт по http:// или https://, а не двойным щелчком по файлу.</p>";
    });
    return null;
  }

  // ---------- роутер ----------

  // Каждый маршрут описывает результат: html, побочный рендер или монтирование.
  function toolsPage() {
    function link(href, title, text, download) {
      return '<a class="home-link" href="' + href + '"' + (download ? " download" : "") + '><b>' + title + '</b><span>' + text + '</span></a>';
    }
    return "<h1>Инструменты</h1>" +
      '<p class="lead">Практика, повторение и песочницы — в одном месте, без длинного списка на главной.</p>' +
      "<h2>Практика и проекты</h2><div class=\"home-links\">" +
      link("#/project", "Сквозной проект", "Данные → SQL → Python → дашборд") +
      link("#/capstone", "Большой проект", "Розница: 6 задач с автопроверкой") +
      link("#/open-project", "Открытый проект", "Подписка: рубрика и защита решения") +
      link("#/pandas-case", "Pandas-кейс", "Отчёт по подписке на четырёх CSV") +
      link("#/dbt-project", "dbt + BI", "Репозиторий, тесты и живой дашборд") +
      link("#/marketing-project", "Записка CMO", "Маркетинговый проект: CAC, ROAS и решение") +
      link("#/datalab", "Практика на данных", "Задачи по CSV с проверкой") +
      link("#/cases", "Кейсы", "12 ситуаций с открытым ответом") +
      link("#/notebook", "Python-блокнот", "Заказы в Pyodide без установки") +
      "</div>" +
      "<h2>Повторение и проверка</h2><div class=\"home-links\">" +
      link("#/session", "30 минут", "Короткая сессия с таймером") +
      link("#/achievements", "Достижения", "Прогресс и качество тестов") +
      link("#/cards", "Карточки", "Повторение терминов") +
      link("#/calc", "Калькуляторы", "Выборка, MDE, LTV и CAC") +
      link("#/analyst-exam", "Сертификация", "20 вопросов на время") +
      link("#/prompt-lab", "Тренажёр промптов", "8 рабочих ситуаций") +
      "</div>" +
      "<h2>Песочницы и офлайн</h2><div class=\"home-links\">" +
      link("#/sandbox", "SQL-песочница", "Запросы к настоящей базе в браузере") +
      link("#/pysandbox", "Python-песочница", "Блокнот на Pyodide") +
      (window.OFFLINE_BUILD
        ? link("#/offline", "Офлайн-версия", "Как установить сайт как приложение")
        : link("analytics-lab-offline.zip", "Офлайн-архив", "Скачать сайт одним файлом", true)) +
      "</div>";
  }

  function drawProgressPanel() {
    var el = document.getElementById("progressPanel");
    if (!el) return;
    var s = window.PROGRESS.summary(window.TOPICS);
    var pct = s.totalChapters ? Math.round(s.chapters / s.totalChapters * 100) : 0;
    var ach = window.ACHIEVEMENTS ? window.ACHIEVEMENTS.count() : 0;
    el.innerHTML = '<div class="progress-strip-inner">' +
      '<div class="progress-strip-top"><span>Прогресс</span><b>' + s.chapters + " / " + s.totalChapters + " глав</b>" +
      '<span class="meta">Тесты: ' + s.quizBest + " / " + s.quizTotal + " · Достижения: " + ach + "</span>" +
      '<a href="#/progress">Подробнее</a></div>' +
      '<div class="progress-strip-bar"><div style="width:' + pct + '%"></div></div></div>';
  }

  function routeFor(p) {
    var seg = p[0], id = p[1];

    if (!seg) return { html: window.HOME_PAGE.page() };

    if (seg === "textbook") return { html: textbookPage() };
    if (seg === "theory") {
      if (id && window.TOPICS[id]) return { html: window.THEORY_PAGE.page(id, p[2]) };
      return { html: listPage("theory", "Теория", "Все разделы: формулы, примеры и разборы.", "Открыть раздел") };
    }
    if (seg === "quiz") {
      if (id && window.TOPICS[id]) return { quiz: id };
      return { html: listPage("quiz", "Тесты", "Восемь случайных вопросов из банка раздела, с разбором каждого ответа.", "Пройти тест") };
    }
    if (seg === "trainer") {
      if (id && window.TOPICS[id]) return { trainer: id };
      return { html: listPage("trainer", "Тренажёры", "Задачи генерируются заново: считать придётся каждый раз, а не запоминать ответы.", "Тренироваться") };
    }
    if (seg === "games") {
      if (id) return { mount: function () { return mountPage(window.GAMES, id, "game", "#/games", "все игры", "Игра"); } };
      return { html: gamesList() };
    }
    if (seg === "demos") {
      if (id) return { mount: function () { return mountPage(window.DEMOS, id, "demo", "#/demos", "все демонстрации", "Демонстрация"); } };
      return { html: demosList() };
    }
    if (seg === "project") return { html: window.PROJECTS.page(), after: window.PROJECTS.bind };
    if (seg === "capstone") return { html: window.PROJECTS.capstonePage(), after: window.PROJECTS.bindCapstone };
    if (seg === "marketing-project") return { html: window.PROJECTS.marketingProjectPage(), after: window.PROJECTS.bindMarketingProject };
    if (seg === "open-project") return { html: window.PROJECTS.openProjectPage(), after: window.PROJECTS.bindOpenProject };
    if (seg === "pandas-case") return { html: window.PANDAS_CASE.page() };
    if (seg === "pandas-lab") return { mount: window.PANDAS_CASE.lab };
    if (seg === "dbt-project") return { html: window.DBT_PROJECT.page(), after: window.DBT_PROJECT.bind };
    if (seg === "datalab") return { html: window.DATALAB.page(), after: window.DATALAB.bind };
    if (seg === "cases") return { html: window.CASES_PAGE.page() };
    if (seg === "prompt-lab") return { html: window.PROMPT_LAB.page(), after: window.PROMPT_LAB.bind };
    if (seg === "cards") return { html: window.CARDS.page(), after: window.CARDS.bind };
    if (seg === "progress") return { html: window.PROGRESS_PAGE.page(), after: window.PROGRESS_PAGE.bind };
    if (seg === "review") return { html: window.REVIEW_PAGE.page(), after: window.REVIEW_PAGE.bind };
    if (seg === "achievements") return { html: window.ACHIEVEMENTS_PAGE.page(), after: window.ACHIEVEMENTS_PAGE.bind };
    if (seg === "session") return { html: window.SESSION.page(), after: window.SESSION.bind };
    if (seg === "calc") return { html: window.CALC.page(), after: window.CALC.bind };
    if (seg === "bi-exam") return { mount: window.EXAMS.bi };
    if (seg === "analyst-exam") return { mount: window.EXAMS.analyst };
    if (seg === "notebook") return { mount: notebookPage };
    if (seg === "changelog") return { html: window.STATIC_PAGES.changelog() };
    if (seg === "sandbox") return { mount: sandboxPage };
    if (seg === "pysandbox") return { mount: pySandboxPage };
    if (seg === "path") return { html: window.PATH_PAGE.page() };
    if (seg === "tools") return { html: toolsPage() };
    if (seg === "cheatsheet") return { html: window.STATIC_PAGES.cheatsheet() };
    if (seg === "glossary") return { html: window.GLOSSARY_PAGE.page(id), after: function () { window.GLOSSARY_PAGE.bind(id); } };
    if (seg === "offline") return { html: window.STATIC_PAGES.offline() };
    if (seg === "search") return { html: window.SEARCH_PAGE.page(id), after: function () { window.SEARCH_PAGE.bind(id); } };
    return { html: '<h1>Страница не найдена</h1><p><a href="#/">На главную</a></p>' };
  }

  function render() {
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    drawProgressPanel();
    if (window.SESSION) window.SESSION.drawDock();
    setKeys(null);
    var p = path();
    renderNav();
    if (window.ACHIEVEMENTS) window.ACHIEVEMENTS.checkAndToast();
    window.scrollTo(0, 0);

    var r = routeFor(p);

    if (r.quiz) {
      window.QUIZ_PAGE.show(r.quiz);
      return;
    }

    if (r.trainer) {
      window.TRAINER_PAGE.show(r.trainer);
      return;
    }

    if (r.mount) {
      var mounted = r.mount();
      if (typeof mounted === "function") cleanup = mounted;
      return mounted;
    }

    var html = r.html;
    var after = r.after || null;

    if (html !== null) {
      app.innerHTML = html;
      window.CHAPTERS.bind();
      var reset = document.getElementById("resetProgress");
      if (reset) reset.addEventListener("click", function () {
        if (confirm("Сбросить прочитанные главы и результаты тестов?")) {
          window.PROGRESS.clear();
          if (window.ACHIEVEMENTS) window.ACHIEVEMENTS.clear();
          window.SEARCH_PAGE.reset();
          render();
        }
      });
      var exportBtn = document.getElementById("exportProgress");
      if (exportBtn) exportBtn.addEventListener("click", function () {
        var blob = new Blob([window.PROGRESS.exportData()], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "analytics-lab-progress.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      });
      var importBtn = document.getElementById("importProgress");
      var importFile = document.getElementById("importFile");
      if (importBtn && importFile) {
        importBtn.addEventListener("click", function () { importFile.click(); });
        importFile.addEventListener("change", function () {
          var f = importFile.files && importFile.files[0];
          if (!f) return;
          var reader = new FileReader();
          reader.onload = function () {
            if (window.PROGRESS.importData(String(reader.result))) {
              window.SEARCH_PAGE.reset();
              render();
            } else {
              alert("Не удалось прочитать файл прогресса.");
            }
          };
          reader.readAsText(f);
          importFile.value = "";
        });
      }
      if (after) after();
    }
  }

  var searchForm = document.getElementById("searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = document.getElementById("searchInput").value.trim();
      location.hash = v ? "#/search/" + encodeURIComponent(v) : "#/search";
    });
  }

  var skipLink = document.querySelector(".skip");
  if (skipLink) skipLink.addEventListener("click", function (e) {
    e.preventDefault();
    app.focus();
    app.scrollIntoView();
  });

  var themeBtn = document.getElementById("themeBtn");  if (themeBtn) {
    var drawTheme = function () {
      var dark = document.documentElement.dataset.theme === "dark";
      themeBtn.setAttribute("aria-label", dark ? "Светлая тема" : "Тёмная тема");
      themeBtn.setAttribute("title", dark ? "Светлая тема" : "Тёмная тема");
    };
    drawTheme();
    themeBtn.addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
      drawTheme();
    });
  }

  app.addEventListener("click", function (e) {
    var card = e.target.closest && e.target.closest(".card[data-href]");
    if (!card || (e.target.closest && e.target.closest("a,button"))) return;
    location.hash = card.getAttribute("data-href");
  });

  function showUpdateToast() {
    if (document.getElementById("swToast")) return;
    var el = document.createElement("div");
    el.id = "swToast";
    el.className = "sw-toast";
    el.innerHTML = "<span>Доступна новая версия</span>" +
      '<button class="btn small" id="swReload" type="button">Обновить</button>';
    document.body.appendChild(el);
    el.querySelector("#swReload").addEventListener("click", function () { location.reload(); });
  }

  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    var hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener("message", function (e) {
      if (e.data && e.data.type === "reload") location.reload();
    });
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (hadController) showUpdateToast();
    });
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        if (!hadController) return;
        reg.addEventListener("updatefound", function () {
          var nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", function () {
            if (nw.state === "installed") showUpdateToast();
          });
        });
      }).catch(function () {});
    });
  }

  function syncVersion() {
    var el = document.getElementById("appVersion");
    if (!el) return;
    if (location.protocol !== "file:") {
      fetch("VERSION", { cache: "no-store" }).then(function (r) {
        return r.ok ? r.text() : "";
      }).then(function (v) {
        v = String(v || "").trim();
        if (/^v\d/.test(v)) el.textContent = v;
      }).catch(function () {});
    }
    var bug = document.getElementById("bugLink");
    if (bug) bug.addEventListener("click", function () {
      var body = "Страница: " + location.href + "\nВерсия: " + el.textContent + "\n\nЧто не так:\n";
      bug.href = "https://github.com/chipsfirst/analytics_lab/issues/new?title=" +
        encodeURIComponent("Ошибка на сайте") + "&body=" + encodeURIComponent(body);
    });
  }

  var paletteIndex = null;
  function initPalette() {
    var box = document.createElement("div");
    box.id = "cmdPalette";
    box.className = "cmd";
    box.hidden = true;
    box.innerHTML = '<div class="cmd-box" role="dialog" aria-modal="true" aria-label="Быстрый поиск">' +
      '<input id="cmdInput" type="search" placeholder="Глава, вопрос или термин…" autocomplete="off">' +
      '<div id="cmdResults" class="cmd-results"></div></div>';
    document.body.appendChild(box);
    var input = box.querySelector("#cmdInput");
    var results = box.querySelector("#cmdResults");
    function close() { box.hidden = true; }
    function open() {
      box.hidden = false;
      input.value = "";
      results.innerHTML = '<p class="meta">Начните вводить запрос. Enter открывает первый результат.</p>';
      input.focus();
    }
    function draw() {
      var q = input.value.trim();
      if (q.length < 2) { results.innerHTML = '<p class="meta">Минимум два символа.</p>'; return; }
      if (!paletteIndex) paletteIndex = window.SEARCH.index(window.TOPICS);
      var hits = window.SEARCH.find(paletteIndex, q).slice(0, 8);
      if (!hits.length) { results.innerHTML = '<p class="meta">Ничего не найдено.</p>'; return; }
      results.innerHTML = hits.map(function (h) {
        return '<a class="cmd-result" href="' + h.entry.href + '"><b>' + esc(h.entry.title) +
          '</b><span>' + esc(h.entry.kind) + " · " + esc(h.entry.topicTitle) + "</span></a>";
      }).join("");
    }
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    input.addEventListener("input", draw);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var first = results.querySelector(".cmd-result");
        if (first) { e.preventDefault(); location.hash = first.getAttribute("href"); close(); }
      }
      if (e.key === "Escape") close();
    });
    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === "k") {
        e.preventDefault();
        if (box.hidden) open(); else close();
      }
    });
  }

  window.LAB.app = app;
  window.LAB.esc = esc;
  window.LAB.icon = icon;
  window.LAB.render = render;
  window.LAB.setKeys = setKeys;
  window.LAB.chapterIcon = chapterIcon;
  window.LAB.topicMeta = TOPIC_META;
  initPalette();
  syncVersion();
  window.SESSION.tick();
  window.SESSION.draw();
  window.addEventListener("hashchange", render);
  render();
})();
