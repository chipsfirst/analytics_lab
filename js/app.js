(function () {
  "use strict";

  var app = document.getElementById("app");
  var nav = document.getElementById("nav");
  var cleanup = null;
  var quiz = null;
  var trainer = null;
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
    shield: '<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/><path d="M9 12l2 2 4-4"/>'
  };

  function icon(name) {
    return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      (ICONS[name] || ICONS.book) + "</svg>";
  }

  function markQuery(text, words) {
    var out = esc(text);
    words.forEach(function (w) {
      if (!w) return;
      var re = new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      out = out.replace(re, "<mark>$1</mark>");
    });
    return out;
  }

  function miniPicks(bank, title) {
    var words = String(title || "").toLowerCase()
      .replace(/[^a-zа-яё0-9\s]/gi, " ").split(/\s+/)
      .filter(function (w) { return w.length > 4; });
    if (!words.length) return null;
    var scored = bank.map(function (q, i) {
      var options = (q.options || []).map(function (o) { return typeof o === "string" ? o : o.text; }).join(" ");
      var text = (q.q + " " + q.explain + " " + options).toLowerCase();
      var s = 0;
      words.forEach(function (w) { if (text.indexOf(w) >= 0) s++; });
      return { i: i, s: s };
    }).filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s; });
    return scored.length >= 3 ? scored.slice(0, 6).map(function (x) { return x.i; }) : null;
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

  function continueHref() {
    var l = window.PROGRESS.last();
    if (l && window.TOPICS[l.id] && window.TOPICS[l.id].chapters[l.i]) {
      return "#/theory/" + l.id + "/" + l.i;
    }
    return "#/theory";
  }

  function progressBlock() {
    var s = window.PROGRESS.summary(window.TOPICS);
    var m = window.PROGRESS.miniStats();
    if (!s.chapters && !s.quizTotal && !m.total) return "";
    return '<div class="card progress-card">' +
      '<div class="stats">' +
      '<div class="stat"><div class="k">глав прочитано</div><div class="v">' + s.chapters + " / " + s.totalChapters + "</div></div>" +
      '<div class="stat"><div class="k">лучшие ответы в тестах</div><div class="v">' +
        s.quizBest + " / " + s.quizTotal + "</div></div>" +
      (m.total ? '<div class="stat"><div class="k">мини-тесты</div><div class="v">' + m.correct + " / " + m.total + "</div></div>" : "") +
      (window.ACHIEVEMENTS && window.ACHIEVEMENTS.count() ? '<div class="stat"><div class="k">достижения</div><div class="v">' + window.ACHIEVEMENTS.count() + " / " + window.ACHIEVEMENTS.total() + "</div></div>" : "") +
      "</div>" +
      '<div class="btn-row"><a class="btn" href="' + continueHref() + '">Продолжить</a>' +
      (window.PROGRESS.dueReviews().length ? '<a class="btn" href="#/review">Повторить ошибки (' +
        window.PROGRESS.dueReviews().length + ")</a>" : "") +
      '<button class="btn" id="exportProgress">Экспорт прогресса</button>' +
      '<button class="btn" id="importProgress">Импорт</button>' +
      '<input type="file" id="importFile" accept=".json,application/json" hidden>' +
      '<button class="btn" id="resetProgress">Сбросить прогресс</button></div></div>';
  }

  function plural(n, one, few, many) {
    var n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
    return many;
  }

  function roadmapBlock() {
    var steps = [
      ["01", "Введение", "Что такое аналитика и чем занимается аналитик", "#/theory/analytics/0"],
      ["02", "Основы", "Метрики, продукт и типы данных", "#/theory/analytics/1"],
      ["03", "SQL", "Запросы, срезы и проверка данных", "#/theory/sql/1"],
      ["04", "Python и pandas", "Очистка, расчёты и таблицы", "#/theory/python/0"],
      ["05", "Эксперименты", "A/B, причинность и решения", "#/theory/causal/0"],
      ["06", "Портфолио", "dbt, BI и защита проекта", "#/dbt-project"]
    ];
    return '<section class="roadmap" aria-labelledby="roadmapTitle">' +
      '<div class="roadmap-head"><div><h2 id="roadmapTitle">С чего начать</h2>' +
      '<p class="meta">Шесть шагов от введения до проекта в портфолио. Ветки — в маршрутах.</p></div>' +
      '<a class="btn" href="#/path">Все маршруты</a></div>' +
      '<div class="roadmap-grid">' + steps.map(function (s) {
        return '<a class="roadmap-step" href="' + s[3] + '"><span class="roadmap-num">' + s[0] +
          "</span><b>" + esc(s[1]) + "</b><small>" + esc(s[2]) + "</small></a>";
      }).join("") + "</div>" +
      '<p class="roadmap-next">Дальше можно углубиться в <a href="#/theory/bi/0">BI</a>, ' +
      '<a href="#/theory/causal/5">причинность</a> или <a href="#/theory/production/0">аналитику в проде</a>.</p></section>';
  }

  function home() {
    var topicCount = Object.keys(window.TOPICS).length;
    var chapterCount = Object.keys(window.TOPICS).reduce(function (n, id) {
      return n + window.TOPICS[id].chapters.length;
    }, 0);
    return '<div class="hero">' +
      "<h1>Лаборатория аналитики</h1>" +
      '<p class="lead">Практикум по аналитике данных: статистика, SQL, Python, BI и эксперименты.<br>' +
      "Короткая теория, тесты и тренажёры. Прогресс хранится в браузере.</p>" +
      '<div class="home-actions">' +
      '<a class="home-action primary" href="#/textbook"><b>Открыть учебник</b><span>' +
        topicCount + " " + plural(topicCount, "раздел", "раздела", "разделов") + ", " +
        chapterCount + " " + plural(chapterCount, "глава", "главы", "глав") + "</span></a>" +
      '<a class="home-action" href="#/path"><b>Маршрут обучения</b><span>Семь треков под цель</span></a>' +
      '<a class="home-action" href="#/trainer"><b>Тренажёры</b><span>Задачи с автопроверкой</span></a>' +
      "</div>" +
      roadmapBlock() +
      '<div class="home-tools"><span>Инструменты:</span>' +
      '<a href="#/project">Сквозной проект</a>' +
      '<a href="#/capstone">Большой проект</a>' +
      '<a href="#/open-project">Открытый проект</a>' +
      '<a href="#/dbt-project">dbt + BI</a>' +
      '<a href="#/achievements">Достижения</a>' +
      '<a href="#/datalab">Практика на данных</a>' +
      '<a href="#/cases">Кейсы</a>' +
      '<a href="#/prompt-lab">Тренажёр промптов</a>' +
      '<a href="#/cards">Карточки</a>' +
      '<a href="#/calc">Калькуляторы</a>' +
      '<a href="#/analyst-exam">Сертификация</a>' +
      '<a href="#/notebook">Python-блокнот</a></div>' +
      "</div>" +
      progressBlock() +
      '<div class="home-links">' +
      '<a class="home-link" href="#/sandbox"><b>SQL-песочница</b><span>Запросы к настоящей базе в браузере</span></a>' +
      '<a class="home-link" href="#/pysandbox"><b>Python-песочница</b><span>Блокнот на Pyodide без установки</span></a>' +
      (window.OFFLINE_BUILD
        ? '<a class="home-link" href="#/offline"><b>Офлайн-версия</b><span>Как установить сайт как приложение</span></a>'
        : '<a class="home-link" href="analytics-lab-offline.zip" download><b>Офлайн-архив</b><span>Скачать сайт одним файлом</span></a>') +
      "</div>";
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

  function theory(id, chapterIdx) {
    var t = window.TOPICS[id];
    var meta = TOPIC_META[id] || {};
    var toc = t.chapters.map(function (c, i) {
      return '<li' + (window.PROGRESS.isRead(id, i) ? ' class="read"' : "") + ">" +
        '<a href="#/theory/' + id + "/" + i + '" data-ch="' + i + '">' + esc(c.title) + "</a></li>";
    }).join("");

    var body = t.chapters.map(function (c, i) {
      var read = window.PROGRESS.isRead(id, i);
      var prev = i > 0 ? '<a class="btn small" href="#/theory/' + id + "/" + (i - 1) + '" data-ch="' + (i - 1) + '">&larr; ' + esc(t.chapters[i - 1].title) + "</a>" : "<span></span>";
      var next = i < t.chapters.length - 1 ? '<a class="btn small" href="#/theory/' + id + "/" + (i + 1) + '" data-ch="' + (i + 1) + '">' + esc(t.chapters[i + 1].title) + " &rarr;</a>" : "<span></span>";
      return '<section id="ch-' + i + '">' +
        '<div class="ch-head"><h2 id="ch-' + i + '-title">' + icon(chapterIcon(c.title) || meta.icon) + (i + 1) + ". " + esc(c.title) + "</h2>" +
        '<span class="ch-actions"><button class="btn small" data-copy="' + i + '">Ссылка</button>' +
        '<button class="btn small' + (read ? " is-read" : "") + '" data-read="' + i + '" aria-pressed="' + read + '">' +
        (read ? "Прочитано" : "Отметить прочитанной") + "</button></span></div>" +
        c.html +
        chapterTermsHtml(id, i, c.html) +
        '<p class="meta"><a href="https://github.com/chipsfirst/analytics_lab/issues/new?title=' +
          encodeURIComponent("Ошибка в главе: " + c.title) + "&body=" +
          encodeURIComponent("Раздел: " + t.title + "\nГлава: " + c.title + "\nСсылка: " +
            (window.location.origin + window.location.pathname) + "#/theory/" + id + "/" + i +
            "\n\nЧто не так:\n") + '">Сообщить об ошибке в главе</a></p>' +
        '<div class="ch-nav">' + prev + next + "</div>" +
        '<div class="mini" data-mini="' + i + '"><button class="btn small" data-mini-start="' + i + '">Проверить себя · 3 вопроса</button></div>' +
        "</section>";
    }).join("");

    return '<div class="topic-page" data-topic="' + id + '">' +
      '<p><a href="#/textbook">&larr; все разделы</a></p>' +
      "<h1>" + icon(meta.icon) + esc(t.title) + "</h1><p class=\"lead\">" + esc(t.lead) + "</p>" +
      '<div class="reader reader-top"><aside class="toc"><b>Главы</b><ol>' + toc + "</ol>" +
      '<div class="btn-row"><a class="btn" href="#/quiz/' + id + '">Тест</a>' +
      '<a class="btn" href="#/trainer/' + id + '">Тренажёр</a>' +
      '<button class="btn" id="printSection">Печать</button></div>' +
      (id === "sql" ? '<div class="btn-row"><a class="btn" href="#/sandbox">Песочница SQL</a></div>' : "") +
      (id === "python" ? '<div class="btn-row"><a class="btn" href="#/pysandbox">Песочница Python</a></div>' : "") +
      (id === "statistics" ? '<div class="btn-row"><a class="btn" href="#/cheatsheet">Какой критерий выбрать</a></div>' : "") +
      (id === "bi" ? '<div class="btn-row"><a class="btn" href="#/bi-exam">Сертификация</a></div>' : "") +
      "</aside><article>" + body + "</article></div></div>";
  }

  function wrapTables(root) {
    Array.prototype.forEach.call(root.querySelectorAll("article table"), function (t) {
      if (t.parentNode.classList.contains("table-wrap")) return;
      var box = document.createElement("div");
      box.className = "table-wrap";
      box.tabIndex = 0;
      box.setAttribute("role", "region");
      box.setAttribute("aria-label", "Таблица, прокручивается");
      t.parentNode.insertBefore(box, t);
      box.appendChild(t);
    });
    Array.prototype.forEach.call(root.querySelectorAll(".table-wrap"), function (box) {
      box.tabIndex = 0;
      box.setAttribute("role", "region");
      box.setAttribute("aria-label", "Таблица, прокручивается");
    });
  }

  function markInChapter(root, word) {
    if (!word || !root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = walker.nextNode())) {
      var idx = n.nodeValue.toLowerCase().indexOf(String(word).toLowerCase());
      if (idx < 0) continue;
      var range = document.createRange();
      range.setStart(n, idx);
      range.setEnd(n, idx + word.length);
      var mark = document.createElement("mark");
      mark.className = "hl";
      try { range.surroundContents(mark); } catch (e) { return; }
      return;
    }
  }

  function bindChapters() {
    var p = path();
    wrapTables(app);

    if (p[0] === "theory" && p[1] && p[2] && /^\d+$/.test(p[2])) {
      var target = document.getElementById("ch-" + p[2]);
      if (target) {
        window.PROGRESS.setLast(p[1], Number(p[2]));
        target.scrollIntoView({ behavior: "instant", block: "start" });
        try {
          var jump = JSON.parse(sessionStorage.getItem("searchJump") || "null");
          if (jump && jump.href === "#/" + p.join("/")) {
            markInChapter(target, String(jump.q || "").split(/\s+/)[0]);
            sessionStorage.removeItem("searchJump");
          }
        } catch (e) {}
      }
    }

    Array.prototype.forEach.call(app.querySelectorAll("a[data-ch]"), function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var i = a.getAttribute("data-ch");
        var s = document.getElementById("ch-" + i);
        if (s) s.scrollIntoView();
        window.PROGRESS.setLast(p[1], Number(i));
        try { history.replaceState(null, "", "#/theory/" + p[1] + "/" + i); } catch (err) {}
      });
    });

    if (tocObserver) { tocObserver.disconnect(); tocObserver = null; }
    var tocLinks = app.querySelectorAll("aside.toc a[data-ch]");
    var sections = app.querySelectorAll("article section[id^='ch-']");
    if (tocLinks.length && sections.length && "IntersectionObserver" in window) {
      tocObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var idx = en.target.id.replace("ch-", "");
          Array.prototype.forEach.call(tocLinks, function (a) {
            a.classList.toggle("active", a.getAttribute("data-ch") === idx);
          });
        });
      }, { rootMargin: "-15% 0px -75% 0px" });
      Array.prototype.forEach.call(sections, function (s) { tocObserver.observe(s); });
    }

    Array.prototype.forEach.call(app.querySelectorAll("[data-mini-start]"), function (b) {
      b.addEventListener("click", function () {
        var box = b.parentNode;
        var bank = window.TOPICS[p[1]].quiz;
        var chIdx = Number(b.getAttribute("data-mini-start"));
        var chapter = window.TOPICS[p[1]].chapters[chIdx];
        var pool = miniPicks(bank, chapter && chapter.title) || bank.map(function (_, k) { return k; });
        var picks = shuffle(pool).slice(0, 3);
        var prepared = {};
        box.innerHTML = picks.map(function (n, qi) {
          var q = bank[n];
          var opts = prepared[qi] = quizOptions(q);
          return '<div class="mini-q" data-q="' + qi + '"><p class="q-text"><b>' + (qi + 1) + ".</b> " + q.q + "</p>" +
            '<div class="options">' + opts.map(function (o, k) {
              return '<button class="option" data-k="' + k + '">' + String.fromCharCode(1040 + k) + ". " + esc(o.text) + "</button>";
            }).join("") + '</div><div class="explain" aria-live="polite" hidden></div></div>';
        }).join("");
        Array.prototype.forEach.call(box.querySelectorAll(".mini-q"), function (qEl) {
          var qi = Number(qEl.getAttribute("data-q"));
          var opts = prepared[qi];
          var q = bank[picks[qi]];
          Array.prototype.forEach.call(qEl.querySelectorAll(".option"), function (opt) {
            opt.addEventListener("click", function () {
              if (qEl.getAttribute("data-done")) return;
              qEl.setAttribute("data-done", "1");
              var k = Number(opt.getAttribute("data-k"));
              var ok = opts[k].ok;
              qEl.setAttribute("data-ok", ok ? "1" : "0");
              Array.prototype.forEach.call(qEl.querySelectorAll(".option"), function (o, oi) {
                o.disabled = true;
                if (opts[oi].ok) o.classList.add("right");
                else if (oi === k) o.classList.add("wrong");
              });
              var ex = qEl.querySelector(".explain");
              ex.hidden = false;
              ex.innerHTML = "<b>" + (ok ? "Верно" : "Неверно") + "</b>" + q.explain;
              var total = box.querySelectorAll(".mini-q").length;
              if (box.querySelectorAll(".mini-q[data-done]").length === total && !box.querySelector(".mini-sum")) {
                var correct = box.querySelectorAll('.mini-q[data-ok="1"]').length;
                window.PROGRESS.recordMini(p[1], correct, total);
                var sum = document.createElement("p");
                sum.className = "mini-sum";
                sum.textContent = "Верно " + correct + " из " + total;
                box.appendChild(sum);
              }
            });
          });
        });
      });
    });

    var calc = document.getElementById("mdeCalc");
    if (calc) {
      var calcOut = document.getElementById("mdeOut");
      var calcSize = function () {
        var p1 = Number(document.getElementById("mdeP1").value) / 100;
        var p2 = Number(document.getElementById("mdeP2").value) / 100;
        var power = Number(document.getElementById("mdePower").value);
        var alpha = Number(document.getElementById("mdeAlpha").value);
        var za = alpha === 0.01 ? 2.575829 : 1.959964;
        var zp = power === 0.9 ? 1.281552 : 0.841621;
        var d = Math.abs(p2 - p1);
        if (!(p1 > 0 && p1 < 1 && p2 > 0 && p2 < 1) || d < 0.000001) {
          calcOut.textContent = "Введите две разные конверсии от 0 до 100%.";
          return;
        }
        var n = Math.ceil(Math.pow(za + zp, 2) * (p1 * (1 - p1) + p2 * (1 - p2)) / (d * d));
        calcOut.textContent = "Нужно ≈ " + n.toLocaleString("ru-RU") + " наблюдений в каждой группе, всего " +
          (2 * n).toLocaleString("ru-RU") + ".";
      };
      ["mdeP1", "mdeP2", "mdePower", "mdeAlpha"].forEach(function (id) {
        var el = document.getElementById(id);
        el.addEventListener("input", calcSize);
        el.addEventListener("change", calcSize);
      });
      calcSize();
    }

    Array.prototype.forEach.call(app.querySelectorAll("[data-copy]"), function (b) {
      b.addEventListener("click", function () {
        var url = location.origin + location.pathname + "#/theory/" + p[1] + "/" + b.getAttribute("data-copy");
        function done() {
          var old = b.textContent;
          b.textContent = "Скопировано";
          setTimeout(function () { b.textContent = old; }, 1200);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done, function () { prompt("Ссылка на главу:", url); });
        } else {
          prompt("Ссылка на главу:", url);
        }
      });
    });

    var printBtn = document.getElementById("printSection");
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });

    setKeys(function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.key === "/") {
        e.preventDefault();
        var s = document.getElementById("searchInput");
        if (s) s.focus();
        return;
      }
      var key = String(e.key).toLowerCase();
      if (key !== "j" && key !== "k") return;
      var secs = app.querySelectorAll("article section[id^='ch-']");
      if (!secs.length) return;
      e.preventDefault();
      var cur = 0, y = window.scrollY + 90;
      Array.prototype.forEach.call(secs, function (sec, idx) { if (sec.offsetTop <= y) cur = idx; });
      var n = Math.max(0, Math.min(secs.length - 1, cur + (key === "j" ? 1 : -1)));
      window.PROGRESS.setLast(p[1], n);
      try { history.replaceState(null, "", "#/theory/" + p[1] + "/" + n); } catch (err) {}
      secs[n].scrollIntoView();
    });

    Array.prototype.forEach.call(app.querySelectorAll("button[data-read]"), function (b) {
      b.addEventListener("click", function () {
        var i = Number(b.getAttribute("data-read"));
        var now = !window.PROGRESS.isRead(p[1], i);
        window.PROGRESS.setRead(p[1], i, now);
        window.PROGRESS.setLast(p[1], i);
        b.textContent = now ? "Прочитано" : "Отметить прочитанной";
        b.className = "btn small" + (now ? " is-read" : "");
        b.setAttribute("aria-pressed", String(now));
        var li = app.querySelectorAll(".toc li")[i];
        if (li) li.classList.toggle("read", now);
      });
    });
  }

  // ---------- тесты ----------

  function startQuiz(id, only) {
    var bank = window.TOPICS[id].quiz;
    var pool = only && only.length
      ? only.filter(function (n) { return n >= 0 && n < bank.length; })
      : bank.map(function (_, i) { return i; });
    pool = shuffle(pool);
    if (!(only && only.length)) pool = pool.slice(0, 8);

    quiz = {
      id: id,
      reviewMode: !!(only && only.length),
      recorded: false,
      qs: pool.map(function (n) {
        var q = bank[n];
        return {
          srcIndex: n,
          q: q.q,
          explain: q.explain,
          options: quizOptions(q)
        };
      }),
      i: 0,
      score: 0,
      picked: -1,
      answers: []
    };
  }

  function renderQuiz() {
    var t = window.TOPICS[quiz.id];

    if (quiz.i >= quiz.qs.length) {
      if (!quiz.recorded) {
        quiz.recorded = true;
        window.PROGRESS.recordQuiz(quiz.id, quiz.answers);
      }
      var stats = window.PROGRESS.quiz(quiz.id) || { best: quiz.score, review: [] };
      var pct = Math.round(quiz.score / quiz.qs.length * 100);
      var review = stats.review || [];
      var isRecord = quiz.score === stats.best && quiz.answers.filter(function (a) { return a.ok; }).length === stats.best;

      app.innerHTML = '<p><a href="#/quiz">&larr; все тесты</a></p>' +
        '<div class="card center"><h2 class="quiz-head">' + esc(t.title) +
        (quiz.reviewMode ? " · работа над ошибками" : "") + "</h2>" +
        '<p class="lead center" role="status">Правильных ответов: <b>' + quiz.score + " из " + quiz.qs.length +
        "</b> (" + pct + "%)</p>" +
        '<p class="meta">Лучший результат: ' + stats.best + " из " + stats.total +
        (isRecord && !quiz.reviewMode ? " — это рекорд" : "") + "</p>" +
        '<div class="btn-row center-row">' +
        (review.length ? '<button class="btn primary" id="review">Разобрать ошибки (' + review.length + ")</button>" : "") +
        '<button class="btn" id="again">Пройти ещё раз</button>' +
        '<a class="btn" href="#/theory/' + quiz.id + '">К теории</a>' +
        '<a class="btn" href="#/trainer/' + quiz.id + '">К тренажёру</a></div></div>';

      var reuse = document.getElementById("again");
      if (reuse) {
        reuse.addEventListener("click", function () { startQuiz(quiz.id); renderQuiz(); });
        reuse.focus();
      }

      var rev = document.getElementById("review");
      if (rev) rev.addEventListener("click", function () { startQuiz(quiz.id, review); renderQuiz(); });

      setKeys(function (e) {
        if (e.key === "Enter") { var a = document.getElementById("again"); if (a) a.click(); }
      });
      return;
    }

    var q = quiz.qs[quiz.i];
    var html = '<p><a href="#/quiz">&larr; все тесты</a></p>' +
      "<h1>" + esc(t.title) + (quiz.reviewMode ? " · ошибки" : "") + "</h1>" +
      '<div class="progress"><span>Вопрос ' + (quiz.i + 1) + " из " + quiz.qs.length +
      " · всего в банке: " + window.TOPICS[quiz.id].quiz.length +
      "</span><span>Верно: " + quiz.score + "</span></div>" +
      '<p class="q-text">' + q.q + "</p>" +
      '<div class="options">' + q.options.map(function (o, k) {
        var cls = "option";
        if (quiz.picked >= 0) {
          if (o.ok) cls += " right";
          else if (k === quiz.picked) cls += " wrong";
        }
        return '<button class="' + cls + '" data-k="' + k + '"' + (quiz.picked >= 0 ? " disabled" : "") + ">" +
          String.fromCharCode(1040 + k) + ". " + esc(o.text) + "</button>";
      }).join("") + "</div>";

    if (quiz.picked >= 0) {
      html += '<div class="explain" aria-live="polite"><b>' + (q.options[quiz.picked].ok ? "Верно" : "Неверно") +
        "</b>" + q.explain + "</div>" +
        '<div class="btn-row"><button class="btn primary" id="next">' +
        (quiz.i + 1 < quiz.qs.length ? "Следующий вопрос" : "Результат") + "</button></div>";
    }

    app.innerHTML = html;

    Array.prototype.forEach.call(app.querySelectorAll(".option"), function (b) {
      b.addEventListener("click", function () {
        quiz.picked = Number(b.getAttribute("data-k"));
        var ok = quiz.qs[quiz.i].options[quiz.picked].ok;
        if (ok) quiz.score++;
        quiz.answers.push({ idx: quiz.qs[quiz.i].srcIndex, ok: ok });
        renderQuiz();
        var nx = document.getElementById("next");
        if (nx) nx.focus();
      });
    });

    var next = document.getElementById("next");
    if (next) next.addEventListener("click", function () {
      quiz.i++; quiz.picked = -1; renderQuiz();
      var first = app.querySelector(".option");
      if (first) first.focus();
    });

    setKeys(function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (quiz.picked >= 0) {
        if (e.key === "Enter") {
          var n = document.getElementById("next");
          if (n) { e.preventDefault(); n.click(); }
        }
        return;
      }
      var k = parseInt(e.key, 10);
      if (k >= 1 && k <= quiz.qs[quiz.i].options.length) {
        var b = app.querySelector('.option[data-k="' + (k - 1) + '"]');
        if (b) { e.preventDefault(); b.click(); }
      }
    });
  }

  // ---------- тренажёры ----------

  function newTask() {
    var gens = window.TRAINERS[trainer.id];
    trainer.task = gens[Math.floor(Math.random() * gens.length)]();
    if (trainer.task.answer.type === "choice") {
      trainer.task.answer.options = shuffle(trainer.task.answer.options);
    }
    trainer.checked = false;
    trainer.value = "";
    trainer.ok = null;
  }

  function renderTrainer() {
    var t = window.TOPICS[trainer.id];
    var task = trainer.task;
    var choice = task.answer.type === "choice";

    var html = '<p><a href="#/trainer">&larr; все тренажёры</a></p>' +
      "<h1>" + esc(t.title) + "</h1>" +
      '<div class="progress"><span>Задача ' + (trainer.total + 1) +
      " · всего типов: " + window.TRAINERS[trainer.id].length +
      "</span><span>Верно: " + trainer.correct + " из " + trainer.total + "</span></div>" +
      '<div class="card">' + task.prompt;

    if (choice) {
      html += '<div class="options top">' + task.answer.options.map(function (o, k) {
        var cls = "option";
        if (trainer.checked) {
          if (o.ok) cls += " right";
          else if (String(k) === trainer.value) cls += " wrong";
        }
        return '<button class="' + cls + '" data-k="' + k + '"' + (trainer.checked ? " disabled" : "") + ">" +
          esc(o.text) + "</button>";
      }).join("") + "</div>";
    } else {
      html += '<div class="answer-row"><label class="sr-only" for="ans">Ответ</label>' +
        '<input type="text" id="ans" inputmode="decimal" placeholder="Ваш ответ"' +
        ' value="' + esc(trainer.value) + '"' + (trainer.checked ? " disabled" : "") + ">" +
        '<button class="btn primary" id="check"' + (trainer.checked ? " disabled" : "") + ">Проверить</button></div>";
    }

    if (trainer.checked) {
      html += '<div class="verdict ' + (trainer.ok ? "ok" : "bad") + '" role="status" aria-live="polite">' +
        (trainer.ok ? "Верно" : "Неверно, правильный ответ: " + correctText(task.answer)) + "</div>" +
        '<div class="explain"><b>Решение</b>' + task.solution + "</div>" +
        '<div class="btn-row"><button class="btn primary" id="next">Следующая задача</button></div>';
    }

    html += "</div>";
    app.innerHTML = html;

    var input = document.getElementById("ans");
    var check = document.getElementById("check");

    function submit() {
      trainer.value = input ? input.value : trainer.value;
      trainer.ok = window.checkAnswer(task, trainer.value);
      trainer.checked = true;
      trainer.total++;
      if (trainer.ok) trainer.correct++;
      renderTrainer();
    }

    if (check) {
      check.addEventListener("click", submit);
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
      input.focus();
    }

    Array.prototype.forEach.call(app.querySelectorAll(".option[data-k]"), function (b) {
      b.addEventListener("click", function () {
        trainer.value = b.getAttribute("data-k");
        submit();
      });
    });

    var next = document.getElementById("next");
    if (next) next.addEventListener("click", function () { newTask(); renderTrainer(); });
  }

  function correctText(a) {
    if (a.type === "choice") {
      var o = a.options.filter(function (x) { return x.ok; })[0];
      return esc(o ? o.text : "");
    }
    return "<b>" + esc(String(a.value).replace(".", ",")) + "</b>";
  }

  // ---------- игры и демо ----------

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

  function examPage(cfg) {
    var bank = cfg.bank;
    var state = null;
    var timer = null;

    app.innerHTML = '<p><a href="' + cfg.back + '">&larr; ' + cfg.backLabel + '</a></p>' +
      '<h1>' + cfg.title + '</h1><p class="lead">' + cfg.lead + '</p>' +
      '<div id="examRoot"></div>';
    var root = document.getElementById("examRoot");

    function fmtTime(sec) {
      var m = Math.floor(sec / 60), s = sec % 60;
      return m + ":" + (s < 10 ? "0" : "") + s;
    }

    function start() {
      if (timer) clearInterval(timer);
      state = {
        qs: bank.map(function (q) {
          return { q: q.q, explain: q.explain, options: quizOptions(q) };
        }),
        i: 0, picked: -1, score: 0, answers: [], left: (cfg.minutes || 15) * 60, done: false
      };
      timer = setInterval(function () {
        if (state.done) return;
        state.left--;
        var clock = document.getElementById("examClock");
        if (clock) clock.textContent = fmtTime(Math.max(0, state.left));
        if (state.left <= 0) finish();
      }, 1000);
      draw();
    }

    function finish() {
      if (!state || state.done) return;
      state.done = true;
      if (timer) { clearInterval(timer); timer = null; }
      draw();
    }

    function draw() {
      if (state.done) {
        var pct = Math.round(state.score / state.qs.length * 100);
        var pass = state.score >= (cfg.pass || 14);
        var review = state.qs.map(function (q, i) {
          var a = state.answers[i];
          var correct = q.options.filter(function (o) { return o.ok; })[0];
          return '<div class="review-item"><p><b>' + (i + 1) + ". " + q.q + "</b></p>" +
            '<p class="meta">Ваш ответ: ' + (a && a.picked >= 0 ? esc(q.options[a.picked].text) : "—") +
            " · Правильно: " + esc(correct ? correct.text : "—") + "</p>" +
            (a && a.ok ? "" : '<p class="meta">' + q.explain + "</p>") + "</div>";
        }).join("");
        root.innerHTML = '<div class="card center"><h2 style="margin-top:0">' + state.score + " из " + state.qs.length +
          " (" + pct + "%)</h2><p class=\"lead center\">" + (pass ? "Сдано. Можно разбирать слабые места." : "Пока не сдано: нужно " + (cfg.pass || 14) + " правильных.") + "</p>" +
          '<div class="btn-row" style="justify-content:center"><button class="btn primary" id="retry">Пройти ещё раз</button>' +
          '<a class="btn" href="' + cfg.back + '">' + cfg.backLabel + '</a></div></div>' +
          '<h2>Разбор</h2>' + review;
        document.getElementById("retry").addEventListener("click", start);
        return;
      }

      var q = state.qs[state.i];
      root.innerHTML = '<div class="progress"><span>Вопрос ' + (state.i + 1) + " из " + state.qs.length +
        '</span><span id="examClock" role="status">' + fmtTime(state.left) + '</span><span>Верно: ' + state.score + "</span></div>" +
        '<p class="q-text">' + q.q + "</p>" +
        '<div class="options">' + q.options.map(function (o, k) {
          var cls = "option";
          if (state.picked >= 0) {
            if (o.ok) cls += " right";
            else if (k === state.picked) cls += " wrong";
          }
          return '<button class="' + cls + '" data-k="' + k + '"' + (state.picked >= 0 ? " disabled" : "") + ">" +
            String.fromCharCode(1040 + k) + ". " + esc(o.text) + "</button>";
        }).join("") + "</div>" +
        (state.picked >= 0 ? '<div class="explain" aria-live="polite"><b>' +
          (q.options[state.picked].ok ? "Верно" : "Неверно") + "</b>" + q.explain + "</div>" +
          '<div class="btn-row"><button class="btn primary" id="examNext">' +
          (state.i + 1 < state.qs.length ? "Следующий вопрос" : "Результат") + "</button></div>" : "");

      Array.prototype.forEach.call(root.querySelectorAll(".option"), function (b) {
        b.addEventListener("click", function () {
          if (state.picked >= 0) return;
          state.picked = Number(b.getAttribute("data-k"));
          var ok = q.options[state.picked].ok;
          if (ok) state.score++;
          state.answers[state.i] = { picked: state.picked, ok: ok };
          draw();
        });
      });
      var next = document.getElementById("examNext");
      if (next) next.addEventListener("click", function () {
        state.i++;
        state.picked = -1;
        if (state.i >= state.qs.length) finish();
        else draw();
      });
    }

    start();
    cleanup = function () { if (timer) clearInterval(timer); };
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

  function pathPage() {
    var tracks = window.TRACKS || [];
    return "<h1>Маршрут обучения</h1>" +
      '<p class="lead">Семь маршрутов: с чего начать, как укрепить статистику, перейти к Python, собрать данные и дашборд, разобраться с экспериментами, моделями и рабочим контуром аналитики. ' +
      "Прогресс считается по прочитанным главам, финальная практика — отдельным шагом.</p>" +
      '<div class="grid">' + tracks.map(function (t) {
        var total = t.steps.length;
        var done = t.steps.filter(function (s) { return window.PROGRESS.isRead(s[0], s[1]); }).length;
        var allDone = total > 0 && done === total;
        var next = t.steps.filter(function (s) { return !window.PROGRESS.isRead(s[0], s[1]); })[0] || t.steps[0];
        var href = allDone && t.final && t.final.length ? t.final[0].href : "#/theory/" + next[0] + "/" + next[1];
        var label = allDone && t.final && t.final.length ? "К практике" : (done ? "Продолжить" : "Начать");
        var steps = t.steps.map(function (s) {
          var c = window.TOPICS[s[0]].chapters[s[1]];
          var read = window.PROGRESS.isRead(s[0], s[1]);
          return '<li' + (read ? ' class="read"' : "") + ">" +
            '<a href="#/theory/' + s[0] + "/" + s[1] + '">' + esc(c.title) + "</a></li>";
        }).join("");
        var finals = (t.final || []).map(function (f) {
          return '<li class="practice"><a href="' + f.href + '">' + esc(f.title) + "</a>" +
            '<span class="meta"> ' + esc(f.note) + "</span></li>";
        }).join("");
        return '<div class="card"><h3>' + esc(t.title) + "</h3>" +
          "<p>" + esc(t.tag) + "</p>" +
          '<p class="meta">Пройдено: ' + done + " из " + total + "</p>" +
          '<div class="track-bar"><div style="width:' + Math.round(done / total * 100) + '%"></div></div>' +
          '<div class="links"><a class="btn primary" href="' + href + '">' + label + "</a></div>" +
          '<ol class="track-steps">' + steps + finals + "</ol></div>";
      }).join("") + "</div>";
  }

  var glossaryTexts = null;
  var termsCache = {};

  function plainText(html) {
    return String(html).replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function entryAliases(e) {
    var list = (e.aliases || [e.term]);
    return list.filter(function (a) {
      return a && (a.length > 2 || /^(α|β|σ|χ²|R²|SE|CI|ДИ|H0|H1|H₀|H₁|P)$/i.test(a));
    }).map(function (a) { return a.toLowerCase(); });
  }

  function glossaryContext() {
    if (glossaryTexts) return glossaryTexts;
    glossaryTexts = [];
    Object.keys(window.TOPICS).forEach(function (id) {
      window.TOPICS[id].chapters.forEach(function (c, i) {
        glossaryTexts.push({ id: id, topicTitle: window.TOPICS[id].title, i: i, title: c.title, text: plainText(c.html) });
      });
    });
    return glossaryTexts;
  }

  function glossaryLinks(entry) {
    var aliases = entryAliases(entry), out = [];
    glossaryContext().forEach(function (ch) {
      if (out.length >= 2) return;
      if (aliases.some(function (a) { return ch.text.indexOf(a) >= 0; })) out.push(ch);
    });
    return out;
  }

  function termsForChapter(html) {
    var text = plainText(html), out = [];
    (window.GLOSSARY || []).forEach(function (e) {
      if (out.length >= 6) return;
      if (entryAliases(e).some(function (a) { return text.indexOf(a) >= 0; })) out.push(e);
    });
    return out;
  }

  function chapterTermsHtml(topicId, i, html) {
    var key = topicId + ":" + i;
    if (!termsCache[key]) termsCache[key] = termsForChapter(html);
    var terms = termsCache[key];
    if (!terms.length) return "";
    return '<p class="chapter-terms"><b>Термины:</b> ' + terms.map(function (e) {
      return '<a href="#/glossary/' + e.id + '">' + esc(e.term) + "</a>";
    }).join(", ") + "</p>";
  }

  function glossaryItem(e) {
    var links = glossaryLinks(e);
    var search = [e.term, e.symbol || "", e.def, (e.aliases || []).join(" ")].join(" ").toLowerCase();
    return '<div class="gloss-item" id="g-' + e.id + '" data-search="' + esc(search) + '">' +
      '<div class="gloss-head"><b class="gloss-term">' + esc(e.term) + "</b>" +
      (e.symbol ? '<span class="gloss-sym">' + esc(e.symbol) + "</span>" : "") + "</div>" +
      '<p class="gloss-def">' + esc(e.def) + "</p>" +
      '<p class="gloss-links">Где читать: ' + (links.length
        ? links.map(function (l) { return '<a href="#/theory/' + l.id + "/" + l.i + '">' + esc(l.title) + "</a>"; }).join(" · ")
        : "—") + "</p></div>";
  }

  function glossaryPage(slug) {
    var data = window.GLOSSARY || [];
    var groups = [];
    data.forEach(function (e) { if (groups.indexOf(e.group) < 0) groups.push(e.group); });
    return "<h1>Словарь аналитика</h1>" +
      '<p class="lead">Короткие определения терминов и обозначений. Ссылка «Где читать» ведёт в главу, где понятие разобрано подробнее.</p>' +
      '<div class="search-row"><label class="sr-only" for="glossFilter">Найти термин</label>' +
      '<input type="search" id="glossFilter" placeholder="Например: альфа, σ, precision" autocomplete="off"></div>' +
      groups.map(function (g) {
        return '<section class="gloss-group"><h2>' + esc(g) + "</h2>" +
          data.filter(function (e) { return e.group === g; }).map(glossaryItem).join("") + "</section>";
      }).join("") +
      '<p class="lead" id="glossEmpty" hidden>Ничего не найдено.</p>';
  }

  function bindGlossary(slug) {
    var input = document.getElementById("glossFilter");
    var items = Array.prototype.slice.call(document.querySelectorAll(".gloss-item"));
    var groups = Array.prototype.slice.call(document.querySelectorAll(".gloss-group"));
    var empty = document.getElementById("glossEmpty");
    function filter() {
      var q = input.value.trim().toLowerCase();
      var any = false;
      items.forEach(function (el) {
        var hit = !q || (el.getAttribute("data-search") || "").indexOf(q) >= 0;
        el.hidden = !hit;
        if (hit) any = true;
      });
      groups.forEach(function (g) {
        g.hidden = !Array.prototype.some.call(g.querySelectorAll(".gloss-item"), function (el) { return !el.hidden; });
      });
      empty.hidden = any;
    }
    if (input) input.addEventListener("input", filter);
    if (slug) {
      var target = document.getElementById("g-" + slug);
      if (target) {
        target.classList.add("target");
        target.scrollIntoView({ block: "center" });
      }
    }
  }

  function projectPage() {
    return '<h1>Сквозной проект</h1>' +
      '<p class="lead">Один датасет и путь от выгрузки до вывода: SQL → Python → метрики → дашборд → решение. ' +
      'Данные: <a href="data/bi-orders.csv" download>bi-orders.csv</a> — 28 заказов за январь–февраль 2026.</p>' +
      '<p class="meta" id="projectProgress">Выполнено этапов: 0 из 5</p>' +
      '<section class="project-stage" data-stage="1"><h2>1. Данные</h2>' +
      '<p>Скачайте файл и проверьте: 28 строк, колонки order_date, city, channel, revenue, returned, order_id.</p>' +
      '<label><input type="checkbox" id="p1"> Данные скачаны и проверены</label></section>' +
      '<section class="project-stage" data-stage="2"><h2>2. SQL</h2>' +
      '<p>Выручка без возвратов: <code>SELECT SUM(revenue) FROM orders WHERE returned = 0;</code></p>' +
      '<div class="answer-row"><label class="sr-only" for="p2">Выручка</label><input type="number" id="p2" placeholder="Ответ"><button class="btn" data-check="2" data-answer="268100">Проверить</button></div></section>' +
      '<section class="project-stage" data-stage="3"><h2>3. Python</h2>' +
      '<p>Средний чек: <code>df[df.returned == 0].revenue.sum() / len(df)</code>.</p>' +
      '<div class="answer-row"><label class="sr-only" for="p3">Средний чек</label><input type="number" id="p3" placeholder="Ответ"><button class="btn" data-check="3" data-answer="9575" data-tol="2">Проверить</button></div></section>' +
      '<section class="project-stage" data-stage="4"><h2>4. Дашборд</h2>' +
      '<p>Соберите экран по шаблону: <a href="data/dashboard-sales-template.md" download>sales-шаблон</a>.</p>' +
      '<label><input type="checkbox" class="p4"> KPI выручки, заказов и среднего чека</label>' +
      '<label><input type="checkbox" class="p4"> Динамика по неделям</label>' +
      '<label><input type="checkbox" class="p4"> Разрез по городам или каналам</label>' +
      '<label><input type="checkbox" class="p4"> Подписаны период и дата обновления</label></section>' +
      '<section class="project-stage" data-stage="5"><h2>5. Вывод</h2>' +
      '<p>Что корректно сказать по данным?</p>' +
      '<div class="options"><button class="option" data-p5="0">Выручка 268 100 ₽ без возвратов, 28 заказов, средний чек 9 575 ₽</button>' +
      '<button class="option" data-p5="1">Выручка 296 700 ₽, потому что возвраты тоже продажи</button>' +
      '<button class="option" data-p5="2">Средний чек нельзя посчитать без гипотезы</button></div></section>';
  }

  function bindProject() {
    var KEY = "analytics-lab-project-v1";
    var done = {};
    try { done = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {}
      var n = Object.keys(done).length;
      var el = document.getElementById("projectProgress");
      if (el) el.textContent = "Выполнено этапов: " + n + " из 5";
      Array.prototype.forEach.call(document.querySelectorAll(".project-stage"), function (s) {
        s.classList.toggle("done", !!done[s.getAttribute("data-stage")]);
      });
    }
    function mark(n) { done[n] = 1; save(); }
    save();
    var p1 = document.getElementById("p1");
    if (p1) {
      p1.checked = !!done["1"];
      p1.addEventListener("change", function () { if (p1.checked) mark("1"); });
    }
    Array.prototype.forEach.call(document.querySelectorAll("[data-check]"), function (b) {
      b.addEventListener("click", function () {
        var n = b.getAttribute("data-check");
        var input = document.getElementById("p" + n);
        var ans = Number(b.getAttribute("data-answer"));
        var tol = Number(b.getAttribute("data-tol") || 1);
        if (Math.abs(Number(input.value) - ans) <= tol) {
          b.textContent = "Верно";
          mark(n);
        } else {
          b.textContent = "Ещё раз";
        }
      });
    });
    var boxes = document.querySelectorAll(".p4");
    if (boxes.length) {
      var all = Array.prototype.every.call(boxes, function (b) { return b.checked; });
      if (all) done["4"] = 1;
      Array.prototype.forEach.call(boxes, function (b) {
        b.addEventListener("change", function () {
          if (Array.prototype.every.call(boxes, function (x) { return x.checked; })) mark("4");
        });
      });
    }
    Array.prototype.forEach.call(document.querySelectorAll("[data-p5]"), function (b) {
      b.addEventListener("click", function () {
        var ok = b.getAttribute("data-p5") === "0";
        b.classList.add(ok ? "right" : "wrong");
        if (ok) mark("5");
      });
    });
  }

  function capstonePage() {
    var tasks = [
      ["k1", "Качество", "Сколько уникальных заказов после удаления дублей order_id?", "COUNT(DISTINCT order_id)", 10000, 0.5],
      ["k2", "Метрики", "Выручка по оплаченным заказам, ₽", "SUM(amount) WHERE status = 'paid' после дедупликации", 21984503, 1],
      ["k3", "Метрики", "Средний чек по оплаченным заказам, ₽", "Выручка / число оплаченных заказов", 2754.61, 0.5],
      ["k4", "Качество", "Доля уникальных заказов без user_id, %", "100 * COUNT(*) с пустым user_id / все заказы", 3.34, 0.05],
      ["k5", "Воронка", "Конверсия из просмотра в покупку по событиям, %", "уникальные покупатели / уникальные зрители × 100", 3.66, 0.1],
      ["k6", "Каналы", "CAC канала с минимальной стоимостью привлечения, ₽", "min(SUM(spend) / SUM(signups)) по каналам", 177.37, 0.5]
    ];
    var files = [
      ["retail-users.csv", "Пользователи", "2 000", "user_id, signup_date, city, channel, age_group"],
      ["retail-orders.csv", "Заказы", "10 020", "order_id, user_id, order_date, status, amount, promo"],
      ["retail-events.csv", "События", "15 000", "event_id, user_id, event_time, event_type"],
      ["retail-marketing.csv", "Маркетинг", "270", "date, channel, spend, clicks, signups"]
    ];
    function task(t) {
      return '<div class="card dl-task" data-cap-task="' + t[0] + '"><p class="meta">' + esc(t[1]) + "</p>" +
        "<h3>" + esc(t[2]) + "</h3>" +
        '<div class="answer-row"><label class="sr-only" for="cap-' + t[0] + '">Ответ</label>' +
        '<input type="text" inputmode="decimal" id="cap-' + t[0] + '" placeholder="Ответ">' +
        '<button class="btn" data-cap="' + t[0] + '" data-answer="' + t[4] + '" data-tol="' + t[5] + '">Проверить</button></div>' +
        '<p class="meta"><code>' + esc(t[3]) + "</code></p></div>";
    }
    return "<h1>Большой проект: розница</h1>" +
      '<p class="lead">Четыре связанные таблицы, 27 тысяч строк и сырые данные. ' +
      "Задача — не посчитать одну цифру, а собрать картину, проверить качество и предложить решение заказчику.</p>" +
      '<div class="card"><h2>Бриф</h2>' +
      "<p>Маркетинг просит решить, куда перенести 20% бюджета между каналами. " +
      "Данные выгружены из трёх систем, часть заказов задвоена, у некоторых нет пользователя. " +
      "Нужны: проверка качества, выручка и средний чек, воронка, CAC по каналам и короткая записка с решением.</p>" +
      '<p class="meta">Ограничение: синтетические данные. Считайте, что это выгрузка за январь–март 2026.</p></div>' +
      '<h2>Файлы</h2><div class="grid">' + files.map(function (f) {
        return '<div class="card"><h3><a href="data/' + f[0] + '" download>' + esc(f[1]) + "</a></h3>" +
          '<p class="meta">' + esc(f[2]) + ' строк</p><p class="meta"><code>' + esc(f[3]) + "</code></p></div>";
      }).join("") + "</div>" +
      '<div class="table-wrap"><table><thead><tr><th>Таблица</th><th>Зерно</th><th>Что проверить</th></tr></thead><tbody>' +
      "<tr><td>users</td><td>пользователь</td><td>уникальность user_id, диапазон дат</td></tr>" +
      "<tr><td>orders</td><td>заказ</td><td>дубли order_id, пропуски user_id, статусы, возвраты</td></tr>" +
      "<tr><td>events</td><td>событие</td><td>типы событий, уникальные пользователи, окно</td></tr>" +
      "<tr><td>marketing</td><td>день × канал</td><td>сумма расходов, знаменатель CAC</td></tr>" +
      "</tbody></table></div>" +
      '<h2>Задачи</h2><p class="meta" id="capProgress">Решено: 0 из ' + tasks.length + "</p>" +
      '<div class="grid">' + tasks.map(task).join("") + "</div>" +
      '<div class="card"><h2>Как сдать</h2><ol>' +
      "<li>Проверка качества: дубли, пропуски, сироты, период, статусы.</li>" +
      "<li>Метрики: выручка, число оплаченных, средний чек, воронка.</li>" +
      "<li>Каналы: CAC, вклад в заказы, ограничения атрибуции.</li>" +
      "<li>Решение: куда перенести бюджет, что проверить до запуска, какие данные нужны ещё.</li>" +
      "<li>Записка на 5–7 предложений: цифра, вывод, риск, следующий шаг.</li>" +
      '</ol><p class="meta">Проверяйте себя по этим пунктам: ответ без допущений и ограничений считается неполным.</p></div>';
  }

  function bindCapstone() {
    var KEY = "analytics-lab-capstone-v1";
    var done = {};
    try { done = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {}
      var el = document.getElementById("capProgress");
      var total = document.querySelectorAll("[data-cap]").length;
      if (el) el.textContent = "Решено: " + Object.keys(done).length + " из " + total;
      Array.prototype.forEach.call(document.querySelectorAll("[data-cap-task]"), function (card) {
        card.classList.toggle("done", !!done[card.getAttribute("data-cap-task")]);
      });
    }
    save();
    Array.prototype.forEach.call(document.querySelectorAll("[data-cap]"), function (btn) {
      var id = btn.getAttribute("data-cap");
      if (done[id]) btn.textContent = "Верно";
      btn.addEventListener("click", function () {
        var input = document.getElementById("cap-" + id);
        var value = Number(String(input.value || "").replace(",", "."));
        var answer = Number(btn.getAttribute("data-answer"));
        var tol = Number(btn.getAttribute("data-tol") || 0.01);
        if (input.value !== "" && Math.abs(value - answer) <= tol + 0.000001) {
          done[id] = 1;
          btn.textContent = "Верно";
          save();
        } else {
          btn.textContent = "Ещё раз";
        }
      });
    });
  }

  function openProjectPage() {
    var files = [
      ["sub-users.csv", "Пользователи", "3 000", "user_id, signup_date, city, channel, age_group"],
      ["sub-subscriptions.csv", "Подписки", "3 604", "subscription_id, user_id, plan, start_date, end_date, status, monthly_price"],
      ["sub-payments.csv", "Платежи", "20 672", "payment_id, user_id, subscription_id, payment_date, amount, status, method"],
      ["sub-tickets.csv", "Обращения", "2 000", "ticket_id, user_id, created_at, category, priority, resolved_at, satisfaction"]
    ];
    var checks = [
      ["quality", "Проверил дубли, пропуски, даты и покрытие периода"],
      ["metrics", "Посчитал MRR, ARPU, отток, failed payments и возвраты"],
      ["segments", "Сравнил каналы или тарифы и объяснил различие"],
      ["hypotheses", "Сформулировал две проверяемые гипотезы с метрикой"],
      ["memo", "Написал записку с решением, риском и следующим шагом"],
      ["repro", "Оставил SQL/Python-код, который повторяет расчёт"]
    ];
    function fileCard(f) {
      return '<div class="card"><h3><a href="data/' + f[0] + '" download>' + esc(f[1]) + "</a></h3>" +
        '<p class="meta">' + esc(f[2]) + " строк</p><p class=\"meta\"><code>" + esc(f[3]) + "</code></p></div>";
    }
    function check(c) {
      return '<label class="open-check"><input type="checkbox" data-open-check="' + c[0] + '"> ' + esc(c[1]) + "</label>";
    }
    return "<h1>Открытый проект: подписка</h1>" +
      '<p class="lead">Здесь нет готовых вопросов и автопроверки. Есть бриф, грязные данные и рубрика. ' +
      "Нужно провести анализ, принять решение и защитить его перед заказчиком.</p>" +
      '<div class="card"><h2>Бриф</h2>' +
      "<p>Сервис «Пульс» продаёт подписку на тренировки. Выручка за девять месяцев — 13,0 млн ₽, " +
      "но MRR последние месяцы почти не растёт, а маркетинг просит увеличить бюджет.</p>" +
      "<p>Нужно понять, где сервис теряет деньги, и предложить одно решение на ближайший квартал. " +
      "Данные выгружены из трёх систем: пользователи, подписки и платежи, плюс обращения в поддержку. " +
      "Часть записей намеренно испорчена.</p>" +
      '<p class="meta">Период: январь–сентябрь 2026. Все данные синтетические. ' +
      "Правильного ответа нет: оценивается ход анализа, допущения и качество решения.</p></div>" +
      '<h2>Файлы</h2><div class="grid">' + files.map(fileCard).join("") + "</div>" +
      '<div class="table-wrap"><table><thead><tr><th>Таблица</th><th>Зерно</th><th>Что проверить</th></tr></thead><tbody>' +
      "<tr><td>users</td><td>пользователь</td><td>уникальность user_id, диапазон регистрации, каналы</td></tr>" +
      "<tr><td>subscriptions</td><td>подписка</td><td>пересечения периодов, статусы, end_date, тариф</td></tr>" +
      "<tr><td>payments</td><td>платёж</td><td>дубли payment_id, пропуски user_id, даты до регистрации и после конца подписки, форматы дат</td></tr>" +
      "<tr><td>tickets</td><td>обращение</td><td>пропуски satisfaction, незакрытые тикеты, категории</td></tr>" +
      "</tbody></table></div>" +
      '<h2>Что сдать</h2><div class="grid">' +
      '<div class="card"><h3>1. Качество данных</h3><p>Найдите дубли, пропуски и аномалии. ' +
      "Покажите, как каждый дефект влияет на метрику, а не просто перечислите строки.</p></div>" +
      '<div class="card"><h3>2. Метрики</h3><p>MRR, ARPU, отток за 90 дней, доля failed payments, возвраты, ' +
      "нагрузка поддержки. Для каждой метрики — формула и период.</p></div>" +
      '<div class="card"><h3>3. Сегменты</h3><p>Сравните каналы, тарифы или когорты. ' +
      "Найдите хотя бы одно различие, которое меняет решение.</p></div>" +
      '<div class="card"><h3>4. Гипотезы</h3><p>Две проверяемые гипотезы: что меняем, какую метрику двигаем, ' +
      "какой эффект считаем достаточным и как проверим.</p></div>" +
      '<div class="card"><h3>5. Записка</h3><p>Одна страница для CMO: решение, три цифры, риск и следующий шаг. ' +
      "Без пересказа всех графиков.</p></div>" +
      '<div class="card"><h3>6. Воспроизводимость</h3><p>SQL- или Python-код, который повторяет расчёт. ' +
      "Достаточно одного файла с комментариями, где что считается.</p></div>" +
      "</div>" +
      '<h2>Рубрика</h2><div class="table-wrap"><table><thead><tr><th>Критерий</th><th>0</th><th>1</th><th>2</th></tr></thead><tbody>' +
      "<tr><td>Качество данных</td><td>Дефекты не замечены</td><td>Перечислены, но без влияния</td><td>Найдены, посчитаны и связаны с метрикой</td></tr>" +
      "<tr><td>Метрики</td><td>Формулы неверны</td><td>Считает верно, но без определений</td><td>Верно, с определениями, периодом и оговорками</td></tr>" +
      "<tr><td>Сегменты</td><td>Нет разреза</td><td>Один разрез без вывода</td><td>Несколько разрезов и объяснение различия</td></tr>" +
      "<tr><td>Гипотезы</td><td>Не проверяемые</td><td>Проверяемые, но без метрики</td><td>Метрика, эффект и дизайн проверки</td></tr>" +
      "<tr><td>Коммуникация</td><td>Нет записки</td><td>Есть цифры, нет решения</td><td>Решение, риск и следующий шаг на одной странице</td></tr>" +
      "</tbody></table></div>" +
      '<p class="meta">Максимум 10 баллов. 8 и больше — уровень, который не стыдно показать на собеседовании.</p>' +
      '<details class="card open-example"><summary><b>Пример сильной сдачи</b> — посмотреть записку и разбор</summary>' +
      '<p class="meta">Цифры ниже посчитаны по этим файлам. Это один из допустимых ответов, а не эталон: важнее ход рассуждения.</p>' +
      "<p><b>Кому:</b> CMO. <b>От:</b> аналитик. <b>Решение:</b> не увеличивать бюджет равномерно. " +
      "Сначала вернуть деньги на failed payments, затем перестроить онбординг referral-пользователей.</p>" +
      "<p><b>Что в данных.</b> В payments 20 672 строки, после дедупликации — 20 657. " +
      "15 дублей payment_id, 120 платежей без user_id, 5 дат до регистрации и 30 после окончания подписки. " +
      "Дубли и пропуски — меньше 1% строк, но даты вне жизненного цикла подписки нельзя молча отбрасывать: " +
      "они меняют когортный анализ.</p>" +
      "<p><b>Экономика.</b> MRR на 30.09.2026 — 1 678 120 ₽, активных подписок 2 388, " +
      "активных пользователей 2 120, ARPU — 791,57 ₽. За 90 дней отток 19,9%. " +
      "Из 20 657 платежей 1 244 failed (6,0%) и 444 возврата (2,1%). " +
      "Выручка по оплаченным — 13,3 млн ₽, возвраты — 0,31 млн ₽.</p>" +
      "<p><b>Сегменты.</b> В когорте января–марта 2026 доля активных на 30.09: paid_search — 71,3%, " +
      "social — 70,8%, email — 66,7%, referral — 64,8%. Разрыв referral и paid_search — 6,5 п.п.: " +
      "гипотеза о слабом онбординге referral выглядит правдоподобнее, чем «плохой трафик».</p>" +
      "<p><b>Две гипотезы.</b> 1) Ретраи failed payments и смена метода оплаты вернут не менее 25% " +
      "несостоявшихся списаний; метрика — recovered revenue, дизайн — пилот на 2 недели с контролем. " +
      "2) Онбординг referral-пользователей повысит их 90-дневное удержание до уровня paid_search; " +
      "метрика — доля активных на 30-й и 90-й день, дизайн — A/B на новых referral-пользователях.</p>" +
      "<p><b>Риск.</b> Статусы подписок и определения оттока могут расходиться с финансовой отчётностью; " +
      "сегменты наблюдательные, а не причинные. Перед внедрением нужно сверить net revenue с бухгалтерией " +
      "и проверить, не сезонный ли это спад.</p>" +
      "<p><b>Следующий шаг.</b> Двухнедельный пилот по failed payments: считаем recovered revenue, " +
      "стоимость ретраев и число жалоб. Если эффект устойчив — масштабируем и только потом перекладываем бюджет.</p>" +
      "<p><b>Почему это хорошо:</b> есть определения метрик, влияние дефектов, сегментный разрез, " +
      "две проверяемые гипотезы, риск и одно конкретное решение. <b>Что доработать:</b> разрез по тарифам " +
      "и способам оплаты, проверка сезонности и сверка с финансовой отчётностью.</p>" +
      "</details>" +
      '<div class="card"><h2>Чек-лист сдачи</h2><div class="open-checks">' + checks.map(check).join("") + "</div>" +
      '<p class="meta" id="openProgress">Готово: 0 из ' + checks.length + "</p></div>";
  }

  function bindOpenProject() {
    var KEY = "analytics-lab-open-project-v1";
    var done = {};
    try { done = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {}
      var total = document.querySelectorAll("[data-open-check]").length;
      var el = document.getElementById("openProgress");
      if (el) el.textContent = "Готово: " + Object.keys(done).length + " из " + total;
    }
    save();
    Array.prototype.forEach.call(document.querySelectorAll("[data-open-check]"), function (box) {
      var id = box.getAttribute("data-open-check");
      box.checked = !!done[id];
      box.addEventListener("change", function () {
        if (box.checked) done[id] = 1; else delete done[id];
        save();
      });
    });
  }

  function achievementsPage() {
    var list = window.ACHIEVEMENTS.list();
    var done = list.filter(function (a) { return a.done; }).length;
    return "<h1>Достижения</h1>" +
      '<p class="lead">Маленькие победы, которые складываются в привычку. Достижения открываются автоматически по прогрессу, тестам, тренажёрам и проектам.</p>' +
      '<p class="meta">Открыто: ' + done + " из " + list.length + "</p>" +
      '<div class="grid">' + list.map(function (a) {
        var pct = Math.round(a.value / a.target * 100);
        return '<div class="card achievement-card ' + (a.done ? "done" : "locked") + '">' +
          "<h3>" + icon(a.icon) + esc(a.title) + "</h3>" +
          "<p>" + esc(a.text) + "</p>" +
          '<div class="ach-bar"><div style="width:' + pct + '%"></div></div>' +
          '<p class="meta">' + (a.done ? "Открыто" + (a.at ? " " + new Date(a.at).toLocaleDateString("ru-RU") : "") :
            "Прогресс: " + a.value + " из " + a.target) + "</p></div>";
      }).join("") + "</div>";
  }

  function calcPage() {
    function field(id, label, value, step) {
      return '<label>' + label + '<input id="' + id + '" type="number" inputmode="decimal" step="' + (step || "any") + '" value="' + value + '"></label>';
    }
    return '<h1>Калькуляторы аналитика</h1>' +
      '<p class="lead">Быстрые расчёты для планирования эксперимента и юнит-экономики. ' +
      "Формулы приближённые: для маленьких выборок и редких событий проверяйте результат симуляцией.</p>" +
      '<section class="card calc-card"><h2>Размер выборки для A/B</h2>' +
      '<div class="calc-grid">' + field("csP1", "Конверсия A, %", 10) + field("csP2", "Конверсия B, %", 12) +
      field("csPower", "Мощность", 0.8) + field("csAlpha", "Уровень значимости", 0.05) + "</div>" +
      '<p class="calc-out" id="csOut" aria-live="polite"></p></section>' +
      '<section class="card calc-card"><h2>Минимальный детектируемый эффект</h2>' +
      '<div class="calc-grid">' + field("mdeBase", "Базовая конверсия, %", 10) +
      field("mdeN", "Выборка на группу", 4000) + field("mdePower", "Мощность", 0.8) +
      field("mdeAlpha", "Уровень значимости", 0.05) + "</div>" +
      '<p class="calc-out" id="mdeOut2" aria-live="polite"></p></section>' +
      '<section class="card calc-card"><h2>Длительность теста</h2>' +
      '<div class="calc-grid">' + field("durN", "Нужно на группу", 4000) +
      field("durTraffic", "Трафик в день, всего", 1200) + "</div>" +
      '<p class="calc-out" id="durOut" aria-live="polite"></p></section>' +
      '<section class="card calc-card"><h2>Доверительный интервал доли</h2>' +
      '<div class="calc-grid">' + field("ciConv", "Конверсий", 120) + field("ciVisitors", "Визитов", 1000) + "</div>" +
      '<p class="calc-out" id="ciOut" aria-live="polite"></p></section>' +
      '<section class="card calc-card"><h2>LTV, CAC и окупаемость</h2>' +
      '<div class="calc-grid">' + field("ueArpu", "Выручка с клиента в месяц, ₽", 900) +
      field("ueCac", "CAC, ₽", 2400) + field("ueChurn", "Отток в месяц, %", 5) + "</div>" +
      '<p class="calc-out" id="ueOut" aria-live="polite"></p></section>';
  }

  function bindCalc() {
    function num(id) { return Number((document.getElementById(id) || {}).value); }
    function fmt(n, digits) {
      return Number(n).toLocaleString("ru-RU", { maximumFractionDigits: digits == null ? 0 : digits });
    }
    function zAlpha(a) { return a === 0.01 ? 2.575829 : 1.959964; }
    function zPower(p) { return p === 0.9 ? 1.281552 : 0.841621; }
    function size(p1, p2, power, alpha) {
      var za = zAlpha(alpha), zp = zPower(power), d = Math.abs(p2 - p1);
      if (!(p1 > 0 && p1 < 1 && p2 > 0 && p2 < 1) || d < 0.000001) return null;
      return Math.ceil(Math.pow(za + zp, 2) * (p1 * (1 - p1) + p2 * (1 - p2)) / (d * d));
    }
    function sample() {
      var p1 = num("csP1") / 100, p2 = num("csP2") / 100;
      var n = size(p1, p2, num("csPower"), num("csAlpha"));
      document.getElementById("csOut").textContent = n
        ? "Нужно примерно " + fmt(n) + " наблюдений в каждой группе, всего " + fmt(2 * n) + "."
        : "Введите две разные конверсии от 0 до 100%.";
    }
    function mde() {
      var p1 = num("mdeBase") / 100, n = num("mdeN"), power = num("mdePower"), alpha = num("mdeAlpha");
      if (!(p1 > 0 && p1 < 1) || !(n > 0)) { document.getElementById("mdeOut2").textContent = "Проверьте базовую конверсию и выборку."; return; }
      var za = zAlpha(alpha), zp = zPower(power), lo = 0, hi = 1 - p1;
      for (var i = 0; i < 60; i++) {
        var mid = (lo + hi) / 2, p2 = p1 + mid;
        var req = Math.pow(za + zp, 2) * (p1 * (1 - p1) + p2 * (1 - p2)) / (mid * mid);
        if (req > n) lo = mid; else hi = mid;
      }
      var d = (lo + hi) / 2;
      document.getElementById("mdeOut2").textContent = "При такой выборке тест увидит рост с " +
        fmt(p1 * 100, 1) + "% примерно до " + fmt((p1 + d) * 100, 1) + "%: эффект от " + fmt(d * 100, 1) + " п.п.";
    }
    function duration() {
      var n = num("durN"), traffic = num("durTraffic");
      if (!(n > 0 && traffic > 0)) { document.getElementById("durOut").textContent = "Проверьте выборку и трафик."; return; }
      var days = Math.ceil(2 * n / traffic);
      document.getElementById("durOut").textContent = "Примерно " + fmt(days) + " дней, или " +
        fmt(days / 7, 1) + " недель. Округляйте вверх и не останавливайте тест раньше срока.";
    }
    function interval() {
      var c = num("ciConv"), n = num("ciVisitors");
      if (!(c >= 0 && n > 0 && c <= n)) { document.getElementById("ciOut").textContent = "Конверсий должно быть от 0 до числа визитов."; return; }
      var p = c / n, se = Math.sqrt(p * (1 - p) / n), moe = 1.959964 * se;
      var lo = Math.max(0, p - moe), hi = Math.min(1, p + moe);
      document.getElementById("ciOut").textContent = "Конверсия " + fmt(p * 100, 1) + "%, 95% ДИ: " +
        fmt(lo * 100, 1) + "–" + fmt(hi * 100, 1) + "%. Ширина интервала: ±" + fmt(moe * 100, 1) + " п.п.";
    }
    function unit() {
      var arpu = num("ueArpu"), cac = num("ueCac"), churn = num("ueChurn");
      if (!(arpu > 0 && cac > 0 && churn > 0 && churn < 100)) {
        document.getElementById("ueOut").textContent = "Проверьте выручку, CAC и отток (0–100%).";
        return;
      }
      var ltv = arpu / (churn / 100), ratio = ltv / cac, payback = cac / arpu;
      var verdict = ratio >= 3 ? "запас есть" : ratio >= 1 ? "на границе" : "экономика отрицательная";
      document.getElementById("ueOut").textContent = "LTV ≈ " + fmt(ltv) + " ₽, LTV/CAC = " +
        fmt(ratio, 2) + " (" + verdict + "), окупаемость CAC ≈ " + fmt(payback, 1) + " мес.";
    }
    var map = { csP1: sample, csP2: sample, csPower: sample, csAlpha: sample,
      mdeBase: mde, mdeN: mde, mdePower: mde, mdeAlpha: mde,
      durN: duration, durTraffic: duration, ciConv: interval, ciVisitors: interval,
      ueArpu: unit, ueCac: unit, ueChurn: unit };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.addEventListener("input", map[id]); el.addEventListener("change", map[id]); }
    });
    sample(); mde(); duration(); interval(); unit();
  }

  function changelogPage() {
    var entries = [
      ["v33", "Сквозной проект, повторение ошибок, калькуляторы и Python-блокнот",
       ["Сквозной проект: данные → SQL → Python → дашборд → вывод.", "Интервальное повторение ошибок из тестов и мини-тестов.",
        "Калькуляторы выборки, MDE, длительности, доверительного интервала и юнит-экономики.",
        "Сертификация аналитика и Python-блокнот с датасетом заказов.", "Главы о байесовском A/B, CUPED и мобильных дашбордах."]],
      ["v32", "BI-лабораторные и сертификация",
       ["Шаблоны дашбордов, датасет bi-orders.csv, лабораторные по трём BI-инструментам.", "Экзамен BI и словарь терминов."]],
      ["v31", "Power BI, Tableau и DataLens", ["Разборы инструментов и сравнение."]],
      ["v30", "BI, закон больших чисел и игры", ["Новый раздел BI, глава о ЗБЧ, аукцион и ультиматум."]],
      ["v1.0.0", "Первый релиз", ["Учебник, тесты, тренажёры, демонстрации и офлайн-архив."]]
    ];
    return "<h1>Что нового</h1><p class=\"lead\">Короткая история изменений. Полная версия — в " +
      '<a href="https://github.com/chipsfirst/analytics_lab/blob/main/CHANGELOG.md">CHANGELOG.md</a>.</p>' +
      entries.map(function (e) {
        return '<section class="card"><h2>' + e[0] + " — " + esc(e[1]) + "</h2><ul>" +
          e[2].map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></section>";
      }).join("");
  }

  function progressPage() {
    var ids = Object.keys(window.TOPICS);
    var totalRead = ids.reduce(function (n, id) { return n + window.PROGRESS.readCount(id); }, 0);
    var totalCh = ids.reduce(function (n, id) { return n + window.TOPICS[id].chapters.length; }, 0);
    var due = window.PROGRESS.dueReviews();
    var weak = 0;
    var cards = ids.map(function (id) {
      var t = window.TOPICS[id];
      var read = Math.min(window.PROGRESS.readCount(id), t.chapters.length);
      var q = window.PROGRESS.quiz(id);
      var m = window.PROGRESS.mini(id);
      var last = q ? (q.lastScore == null ? q.best : q.lastScore) : null;
      var qTotal = q ? q.total : t.quiz.length;
      var weakTopic = (last !== null && qTotal && last / qTotal < 0.6) ||
        (m && m.total && m.correct / m.total < 0.6);
      if (weakTopic) weak++;
      var dueCount = due.filter(function (r) { return r.topic === id; }).length;
      var next = 0;
      while (next < t.chapters.length && window.PROGRESS.isRead(id, next)) next++;
      var href = next < t.chapters.length ? "#/theory/" + id + "/" + next : "#/quiz/" + id;
      var status = weakTopic ? "слабое место" : dueCount ? "пора повторить" : "в норме";
      return '<div class="card progress-topic' + (weakTopic ? " weak" : "") + '"><p class="meta">' + esc(t.title) +
        ' · <b>' + status + '</b></p><div class="topic-bar" aria-hidden="true"><div style="width:' +
        Math.round(read / t.chapters.length * 100) + '%"></div></div>' +
        '<p class="meta">Глав: ' + read + " из " + t.chapters.length +
        " · Тест: " + (last === null ? "—" : last + " из " + qTotal) +
        " · Мини: " + (m && m.total ? m.correct + " из " + m.total : "—") +
        (dueCount ? " · К повторению: " + dueCount : "") + "</p>" +
        '<div class="links"><a class="btn small" href="' + href + '">' +
        (next < t.chapters.length ? "Продолжить" : "К тесту") + "</a>" +
        '<a class="btn small" href="#/quiz/' + id + '">Тест</a></div></div>';
    }).join("");
    return "<h1>Слабые темы</h1>" +
      '<p class="lead">Локальная картина по разделам: что прочитано, где просели тесты и что пора повторить. ' +
      "Данные хранятся только в этом браузере.</p>" +
      '<div class="stats"><div class="stat"><div class="k">глав прочитано</div><div class="v">' + totalRead + " / " + totalCh +
      '</div></div><div class="stat"><div class="k">слабых разделов</div><div class="v">' + weak +
      '</div></div><div class="stat"><div class="k">к повторению</div><div class="v">' + due.length + "</div></div></div>" +
      '<div class="btn-row"><button class="btn" id="exportNotes">Скачать конспект</button>' +
      '<a class="btn" href="#/review">Повторить ошибки</a></div>' +
      '<div class="grid">' + cards + "</div>";
  }

  function bindProgress() {
    var btn = document.getElementById("exportNotes");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var ids = Object.keys(window.TOPICS);
      var parts = ["# Конспект: Лаборатория аналитики", "", "Дата: " + new Date().toLocaleDateString("ru-RU"), ""];
      var count = 0;
      ids.forEach(function (id) {
        var t = window.TOPICS[id], chapterParts = [];
        t.chapters.forEach(function (c, i) {
          if (!window.PROGRESS.isRead(id, i)) return;
          var box = document.createElement("div");
          box.innerHTML = c.html || "";
          Array.prototype.forEach.call(box.querySelectorAll("figure, script, style"), function (el) { el.remove(); });
          var text = (box.textContent || "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
          chapterParts.push("### " + c.title + "\n\n" + text);
          count++;
        });
        if (chapterParts.length) parts.push("## " + t.title + "\n\n" + chapterParts.join("\n\n"));
      });
      if (!count) { btn.textContent = "Сначала отметьте главы"; return; }
      var blob = new Blob([parts.join("\n\n")], { type: "text/markdown;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "konspekt-analitika.md";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 200);
      btn.textContent = "Конспект скачан";
    });
  }

  function cardsPage() {
    var options = ['<option value="all">Все вопросы</option>', '<option value="glossary">Словарь терминов</option>'];
    Object.keys(window.TOPICS).forEach(function (id) {
      options.push('<option value="' + id + '">' + esc(window.TOPICS[id].title) + "</option>");
    });
    return "<h1>Карточки</h1>" +
      '<p class="lead">Повторяйте вопросы и термины по карточкам. Отмечайте «Знаю» или «Ещё раз»; экспорт в Anki — кнопкой ниже.</p>' +
      '<div class="btn-row"><label class="sr-only" for="cardsDeck">Колода</label><select id="cardsDeck">' +
      options.join("") + '</select><button class="btn" id="cardsExport">Экспорт в Anki</button></div>' +
      '<div class="card flash-card"><p class="meta" id="cardsMeta">Колода</p><div id="cardsFront" class="flash-front"></div>' +
      '<div id="cardsBack" class="flash-back" hidden></div><div class="btn-row" id="cardsActions">' +
      '<button class="btn primary" id="cardsShow">Показать ответ</button>' +
      '<button class="btn" id="cardsAgain" hidden>Ещё раз</button>' +
      '<button class="btn" id="cardsKnow" hidden>Знаю</button></div></div>' +
      '<p class="meta" id="cardsProgress"></p>';
  }

  function bindCards() {
    var state = { deck: [], i: 0, known: 0, revealed: false };
    var select = document.getElementById("cardsDeck");
    var front = document.getElementById("cardsFront");
    var back = document.getElementById("cardsBack");
    var meta = document.getElementById("cardsMeta");
    var progress = document.getElementById("cardsProgress");
    function build(value) {
      if (value === "glossary") {
        return window.GLOSSARY.map(function (g) {
          return { front: g.term + (g.symbol ? " (" + g.symbol + ")" : ""), back: g.def, tag: "словарь" };
        });
      }
      var ids = value === "all" ? Object.keys(window.TOPICS) : [value];
      var out = [];
      ids.forEach(function (id) {
        window.TOPICS[id].quiz.forEach(function (q) {
          out.push({ front: q.q, back: q.options[q.correct] + ". " + q.explain, tag: window.TOPICS[id].title });
        });
      });
      return out;
    }
    function draw() {
      var card = state.deck[state.i];
      if (!card) {
        front.textContent = "Карточек нет.";
        back.hidden = true;
        meta.textContent = "Колода пуста";
        progress.textContent = "";
        return;
      }
      meta.textContent = card.tag;
      front.innerHTML = esc(card.front);
      back.innerHTML = esc(card.back);
      back.hidden = !state.revealed;
      document.getElementById("cardsShow").hidden = state.revealed;
      document.getElementById("cardsAgain").hidden = !state.revealed;
      document.getElementById("cardsKnow").hidden = !state.revealed;
      progress.textContent = "Карточка " + (state.i + 1) + " из " + state.deck.length + " · знаю: " + state.known;
    }
    function reset() {
      state.deck = build(select.value);
      state.i = 0;
      state.known = 0;
      state.revealed = false;
      draw();
    }
    function next(known) {
      if (known) state.known++;
      state.i++;
      state.revealed = false;
      if (state.i >= state.deck.length) {
        state.i = 0;
        state.deck = state.deck.slice().sort(function () { return Math.random() - 0.5; });
        progress.textContent = "Круг завершён: знаю " + state.known + " из " + state.deck.length + ". Начинаем заново.";
      }
      draw();
    }
    select.addEventListener("change", reset);
    document.getElementById("cardsShow").addEventListener("click", function () {
      state.revealed = true;
      draw();
    });
    document.getElementById("cardsAgain").addEventListener("click", function () { next(false); });
    document.getElementById("cardsKnow").addEventListener("click", function () { next(true); });
    document.getElementById("cardsExport").addEventListener("click", function () {
      var rows = ["front\tback\ttags"];
      state.deck.forEach(function (c) {
        rows.push(String(c.front).replace(/\t/g, " ") + "\t" + String(c.back).replace(/\t/g, " ") + "\t" + String(c.tag).replace(/\t/g, " "));
      });
      var blob = new Blob([rows.join("\n")], { type: "text/tab-separated-values;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "anki-karty.txt";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 200);
    });
    reset();
  }

  var PROMPT_TASKS = [
    ["Суммаризация встречи", "Сделайте выжимку из транскрипта встречи: решения, задачи, ответственные и сроки. Не добавляйте того, чего не было в тексте.", "Ты помощник аналитика. Ниже транскрипт встречи. Верни: 1) три решения, 2) задачи с ответственным и сроком, 3) открытые вопросы. Если ответственного или срока нет, напиши «не указано». Не выдумывай факты.", ["Задан формат и разделы", "Есть запрет на домыслы", "Указано, что делать с пропусками"]],
    ["Запрос SQL", "Попросите модель составить SQL по схеме заказов: выручка без возвратов по городам за февраль.", "Схема: orders(order_id, city, revenue, returned, order_date). Напиши SQL для PostgreSQL: сумма revenue по city за февраль 2026, returned = 0. Используй только эти поля. Добавь комментарий к каждой строке и не меняй данные.", ["Передана схема и СУБД", "Заданы фильтры и период", "Есть ограничение на изменения", "Запрошено объяснение"]],
    ["Классификация отзывов", "Разметьте 100 отзывов по темам и тональности, верните таблицу.", "Разметь отзывы по темам: доставка, качество, цена, поддержка, other. Тональность: positive, neutral, negative. Верни CSV: id, тема, тональность, цитата. Если тема неочевидна, выбери other и объясни в отдельном столбце. Не меняй исходный текст.", ["Задан набор меток", "Указан формат CSV", "Есть правило для неоднозначных случаев", "Сохранён исходный текст"]],
    ["Разбор A/B", "Объясните результат теста: конверсия выросла на 0,4 п.п., p = 0,06, guardrail ухудшился.", "Ты аналитик. Ниже результаты A/B. Объясни, что можно и что нельзя утверждать. Отдельно разбери p-value, размер эффекта и guardrail. Предложи решение и условия пересмотра. Не называй результат значимым без оговорок.", ["Разделены значимость и эффект", "Учтён guardrail", "Есть решение", "Нет утверждения о причинности без дизайна"]],
    ["Письмо руководителю", "Сформулируйте письмо о переносе запуска на неделю из-за качества данных.", "Напиши письмо руководителю: факт, причина, риск, новое решение и что нужно от него. Тон — нейтральный, 120–150 слов. Не обвиняй команду и не скрывай риск. Закончи конкретным запросом.", ["Есть факт и причина", "Указан риск и новое решение", "Есть конкретный запрос", "Соблюдён тон и объём"]],
    ["Извлечение таблицы", "Извлеките из текста таблицу расходов по каналам.", "Из текста ниже извлеки таблицу: канал, расход, конверсии, выручка. Верни Markdown-таблицу. Если число не указано, поставь «—». Не пересчитывай и не добавляй каналы, которых нет в тексте.", ["Заданы колонки", "Указана обработка пропусков", "Запрещены домыслы", "Формат проверяем"]],
    ["Критика графика", "Проверьте график на манипуляции и предложите исправления.", "Опиши график по изображению: оси, масштаб, подписи, источник, период. Найди три возможные манипуляции. Для каждой предложи исправление. Не угадывай значения, которых не видно.", ["Есть проверка осей и масштаба", "Указаны подписи и период", "Предложены исправления", "Нет выдуманных чисел"]],
    ["RAG-ответ", "Ответьте на вопрос по регламенту и покажите источники.", "Ответь на вопрос, используя только фрагменты ниже. Для каждого утверждения укажи номер фрагмента. Если ответа нет, напиши «в документах нет данных». Не используй внешние знания.", ["Ограничение только контекстом", "Требуются ссылки", "Есть fallback", "Нет внешних знаний"]]
  ];

  function promptLabPage() {
    return "<h1>Тренажёр промптов</h1>" +
      '<p class="lead">Восемь рабочих ситуаций. Напишите свой промпт, затем откройте разбор и проверьте его по критериям. ' +
      "Это не автопроверка: хороший промпт зависит от задачи и контекста.</p>" +
      '<div class="grid">' + PROMPT_TASKS.map(function (t, i) {
        return '<article class="card prompt-card" data-prompt="' + i + '"><p class="meta">Задача ' + (i + 1) + "</p><h3>" + esc(t[0]) + "</h3>" +
          "<p>" + esc(t[1]) + "</p>" +
          '<label class="sr-only" for="prompt-' + i + '">Ваш промпт</label>' +
          '<textarea id="prompt-' + i + '" rows="4" placeholder="Напишите промпт…"></textarea>' +
          '<div class="btn-row"><button class="btn small" data-prompt-show="' + i + '">Показать разбор</button></div>' +
          '<div class="prompt-review" data-prompt-review="' + i + '" hidden><p><b>Каркас:</b> ' + esc(t[2]) + "</p><ul>" +
          t[3].map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div></article>";
      }).join("") + "</div>";
  }

  function bindPromptLab() {
    var KEY = "analytics-lab-prompts-v1";
    var drafts = {};
    try { drafts = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
    Array.prototype.forEach.call(document.querySelectorAll(".prompt-card"), function (card) {
      var i = card.getAttribute("data-prompt");
      var ta = document.getElementById("prompt-" + i);
      if (ta) {
        ta.value = drafts[i] || "";
        ta.addEventListener("input", function () {
          drafts[i] = ta.value;
          try { localStorage.setItem(KEY, JSON.stringify(drafts)); } catch (e) {}
        });
      }
      var b = card.querySelector("[data-prompt-show]");
      if (b) b.addEventListener("click", function () {
        var rev = card.querySelector("[data-prompt-review]");
        if (rev) rev.hidden = !rev.hidden;
      });
    });
  }

  var CASE_BANK = [
    { topic: "Аналитика", title: "Конверсия упала после релиза",
      prompt: "В понедельник выкатили новую форму оплаты. За неделю конверсия в покупку упала с 4,2% до 3,5%. Что проверить до вывода «релиз виноват»?",
      solution: "Сначала проверить определение метрики и полноту данных: не изменился ли знаменатель, не потерялись ли события, не сдвинулся ли период. Затем разрезать по платформам, новым/старым пользователям, каналам и шагам воронки. Сравнить с контрольным периодом и параллельными сегментами, где релиза не было. Учесть сезонность и маркетинговые всплески. Только после этого формулировать причинную гипотезу и, если возможно, проверять её тестом.",
      rubric: ["Проверены определение метрики и качество данных", "Есть разбивка по сегментам и шагам воронки", "Учтены сезонность и внешние изменения", "Вывод отделён от гипотезы"] },
    { topic: "Статистика", title: "p = 0,04, но запускать рано",
      prompt: "A/B-тест дал рост основной метрики с p = 0,04. Guardrail-метрика «время ответа» ухудшилась на 12%. Можно ли запускать?",
      solution: "Формальная значимость не отменяет guardrail. Нужно оценить величину и интервал эффекта, проверить, не был ли это один из многих промежуточных взглядов, и посмотреть на сегменты. Ухудшение времени ответа может быть дороже прироста конверсии. Решение принимают по заранее заданному правилу: если guardrail выходит за допустимый порог, запуск блокируется независимо от p основной метрики.",
      rubric: ["Учтён размер эффекта, а не только p", "Проверено правило остановки и множественность", "Guardrail имеет приоритет", "Есть явное решение и условие пересмотра"] },
    { topic: "Теория игр", title: "Ценовая война двух магазинов",
      prompt: "Два магазина могут держать высокую цену или снижать. Снижение даёт преимущество, если конкурент не снизил, но оба теряют маржу, если снижают вместе. Какой исход устойчив и что может изменить игру?",
      solution: "Это вариант дилеммы заключённого: у каждого есть стимул снизить цену, поэтому равновесие Нэша — обе низкие цены, хотя обе высокие выгоднее. Игру меняют повторяемость и репутация, контракты, дифференциация продукта, издержки и сигналы. В однократной игре без обязательств кооперация неустойчива.",
      rubric: ["Определены игроки, стратегии и выигрыши", "Найдено равновесие и проверено отклонение", "Объяснено, почему оптимум не достигается", "Предложены механизмы изменения игры"] },
    { topic: "Вероятность", title: "Положительный тест на редкую болезнь",
      prompt: "Болезнь встречается у 1% людей. Тест ошибочно положителен у 5% здоровых и пропускает 10% больных. Пациент получил положительный результат. Как оценить вероятность болезни?",
      solution: "Нужно применить формулу Байеса и учесть базу. На 10 000 человек: 100 больных, из них 90 положительных; 9 900 здоровых, из них 495 ложноположительных. Всего 585 положительных, доля истинных — 90/585 ≈ 15%. Высокая точность теста не означает высокую вероятность болезни при редком состоянии.",
      rubric: ["Учтена базовая частота", "Посчитаны TP, FP и все положительные", "Применена формула Байеса", "Сделан вывод о повторном тесте"] },
    { topic: "SQL", title: "Выручка не сходится с дашбордом",
      prompt: "SQL-отчёт даёт 296 700 ₽, дашборд — 268 100 ₽. В таблице есть returned и две даты. Что проверить?",
      solution: "Сверить определение выручки: учитываются ли возвраты, по какой дате считается период, нет ли дубликатов заказов и NULL. Разница 28 600 ₽ — это три возвращённых заказа. Нужно зафиксировать фильтр returned = 0, дату платежа или заказа и гранулярность, затем добавить тест на сходимость.",
      rubric: ["Проверен фильтр возвратов", "Сверена дата учёта", "Проверены дубликаты и NULL", "Определение метрики зафиксировано"] },
    { topic: "Excel", title: "ВПР возвращает не ту строку",
      prompt: "В файле 500 клиентов, у части повторяются email. ВПР по email возвращает неверный город. Как исправить и что проверить?",
      solution: "ВПР возвращает первое совпадение, поэтому при дубликатах ключа результат зависит от порядка. Нужно выбрать уникальный ключ (ID), удалить дубликаты, проверить тип данных и лишние пробелы. Для нескольких совпадений использовать FILTER/XLOOKUP или сводную. Четвёртый аргумент должен быть 0 для точного поиска.",
      rubric: ["Найдена причина дубликатов", "Выбран уникальный ключ", "Проверены типы и пробелы", "Исправлена формула и проверен результат"] },
    { topic: "Python", title: "Скрипт падает на сервере",
      prompt: "Локально скрипт читает CSV и считает выручку, на сервере — UnicodeDecodeError и другая сумма. Что делать?",
      solution: "Явно указать кодировку (utf-8 или windows-1251), проверить разделитель и десятичный разделитель, привести числа из строк к float, обработать пустые значения. Сумму сверить с эталоном. Добавить проверку числа строк и логирование пути к файлу.",
      rubric: ["Указана кодировка", "Проверены разделители и типы", "Обработаны пропуски", "Есть сверка с эталоном и лог"] },
    { topic: "Регрессия", title: "R² = 0,92, а прогноз плохой",
      prompt: "Модель прогноза спроса показывает R² = 0,92 на обучении, но на новых данных ошибается в два раза. Что проверить?",
      solution: "Проверить переобучение и утечки, оценить на отложенной выборке и по времени, посмотреть остатки и ошибки по сегментам. Высокий R² на обучении может быть из-за большого числа признаков или признака из будущего. Нужна временная кросс-валидация и базовая модель.",
      rubric: ["Есть отложенная/временная проверка", "Проверена утечка признаков", "Изучены остатки и сегменты", "Есть baseline и метрика ошибки"] },
    { topic: "Классификация", title: "Мошенничество: accuracy 99%",
      prompt: "Модель определяет мошеннические операции с accuracy 99%. Мошенничеств — 1%. Стоит ли её внедрять?",
      solution: "Accuracy вводит в заблуждение: модель может всегда предсказывать «нет мошенничества» и получить 99%. Нужны precision, recall, PR-AUC и матрица ошибок, а также стоимость FP и FN. Следует выбрать порог под бизнес-риск и проверить на редком классе.",
      rubric: ["Объяснён парадокс accuracy", "Посчитаны precision/recall", "Учтена стоимость ошибок", "Выбран порог и план мониторинга"] },
    { topic: "ИИ и ML", title: "LLM уверенно выдумала цифру",
      prompt: "Модель сделала выжимку отчёта и назвала выручку 1,2 млн, хотя в файле 980 тыс. Как выстроить процесс?",
      solution: "Не считать текст модели источником чисел. Дать ей схему данных и попросить ссылки на фрагменты, а расчёт выполнять кодом. Ввести проверку ключевых чисел, тестовый набор и человек в контуре. Хранить версию промпта и модели.",
      rubric: ["Числа проверяются кодом/источником", "Есть цитаты и тестовый набор", "Есть человек в контуре", "Зафиксированы версии"] },
    { topic: "Полезное", title: "График, который врёт",
      prompt: "На графике выручка выросла «в 3 раза»: ось Y начинается с 90 млн, а не с нуля. Как переделать и что сказать аудитории?",
      solution: "Обрезанная ось преувеличивает визуальный эффект. Для сравнения абсолютных значений начинают с нуля, подписывают единицы и период. Если нужен акцент на изменении, показывают проценты и абсолютные значения, а также поясняют масштаб. Вывод должен опираться на числа, а не на высоту столбца.",
      rubric: ["Замечена обрезанная ось", "Предложен корректный масштаб", "Добавлены подписи и период", "Вывод сверен с числами"] },
    { topic: "BI", title: "Два дашборда — две правды",
      prompt: "В Power BI выручка 268 100, в Tableau 296 700. Оба отчёта строятся из одной таблицы. Как найти причину?",
      solution: "Сравнить определения метрики, фильтры, дату учёта, обработку возвратов и гранулярность. Разница 28 600 — три возвращённых заказа. Нужно зафиксировать каталог метрик, добавить тест сходимости и указать владельца определения.",
      rubric: ["Сверены определения и фильтры", "Найдена разница в возвратах/дате", "Есть каталог метрик", "Добавлен тест сходимости"] }
  ];

  function casesPage() {
    return "<h1>Кейсы с открытым ответом</h1>" +
      '<p class="lead">Двенадцать ситуаций из практики. Сначала сформулируйте свой ответ, затем раскройте разбор и сверьтесь с критериями. ' +
      "Это не тест с одним правильным вариантом: важна логика проверки и следующий шаг.</p>" +
      '<div class="grid">' + CASE_BANK.map(function (c, i) {
        return '<article class="card case-card"><p class="meta">' + esc(c.topic) + "</p><h3>" + (i + 1) + ". " + esc(c.title) + "</h3>" +
          "<p>" + esc(c.prompt) + "</p>" +
          '<details><summary>Разбор и критерии</summary><p>' + esc(c.solution) + "</p><ul>" +
          c.rubric.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></details></article>";
      }).join("") + "</div>";
  }

  function datalabPage() {
    var datasets = [
      ["ab-test.csv", "A/B-тест", "1 200 пользователей, группы A и B, конверсия и выручка.", "user_id, group, converted, revenue"],
      ["churn.csv", "Отток", "600 клиентов: срок, платеж, обращения в поддержку, факт оттока.", "customer_id, tenure_months, monthly_charges, support_calls, churned"],
      ["marketing.csv", "Маркетинг", "90 дней по трём каналам: расходы, клики, конверсии, выручка.", "date, channel, spend, clicks, conversions, revenue"],
      ["dirty-customers.csv", "Грязные данные", "24 строки: дубли, пропуски, разные форматы дат, городов и сумм.", "customer_id, name, email, city, signup_date, amount, status"]
    ];
    var tasks = [
      ["ab1", "A/B-тест", "Сколько всего пользователей в файле?", "SELECT COUNT(*) FROM ab;", 1200, 0.5],
      ["ab2", "A/B-тест", "Сколько конверсий в группе B?", "SELECT SUM(converted) FROM ab WHERE group = 'B';", 87, 0.5],
      ["ab3", "A/B-тест", "Конверсия группы B, %", "100.0 * AVG(converted) для группы B", 14.5, 0.1],
      ["ab4", "A/B-тест", "Выручка на пользователя в группе B, ₽", "SUM(revenue) / COUNT(*) для группы B", 145.5, 0.1],
      ["ch1", "Отток", "Сколько клиентов в файле?", "SELECT COUNT(*) FROM churn;", 600, 0.5],
      ["ch2", "Отток", "Доля оттока, %", "100.0 * AVG(churned)", 21.3, 0.1],
      ["ch3", "Отток", "Средний срок ушедших клиентов, месяцев", "AVG(tenure_months) WHERE churned = 1", 22.4, 0.2],
      ["ch4", "Отток", "Ежемесячная выручка под риском, ₽", "SUM(monthly_charges) WHERE churned = 1", 125320, 1],
      ["mk1", "Маркетинг", "Сколько строк в файле?", "SELECT COUNT(*) FROM marketing;", 90, 0.5],
      ["mk2", "Маркетинг", "Общий ROAS (выручка / расходы)", "SUM(revenue) / SUM(spend)", 9.85, 0.05],
      ["mk3", "Маркетинг", "ROAS канала Email", "SUM(revenue) / SUM(spend) для Email", 40.79, 0.1],
      ["mk4", "Маркетинг", "CAC по всем каналам, ₽", "SUM(spend) / SUM(conversions)", 126.0, 1],
      ["dr1", "Грязные данные", "Сколько уникальных клиентов (различных customer_id)?", "COUNT(DISTINCT customer_id)", 22, 0.5],
      ["dr2", "Грязные данные", "Сколько строк без email?", "COUNT(*) WHERE email пустой", 3, 0.5],
      ["dr3", "Грязные данные", "Сколько уникальных клиентов из Москвы после нормализации города?", "TRIM(LOWER(city)) = 'москва', затем COUNT(DISTINCT customer_id)", 10, 0.5]
    ];
    function task(t) {
      return '<div class="card dl-task" data-task="' + t[0] + '"><p class="meta">' + esc(t[1]) + "</p>" +
        "<h3>" + esc(t[2]) + "</h3>" +
        '<div class="answer-row"><label class="sr-only" for="dl-' + t[0] + '">Ответ</label>' +
        '<input type="text" inputmode="decimal" id="dl-' + t[0] + '" placeholder="Ответ">' +
        '<button class="btn" data-dl="' + t[0] + '" data-answer="' + t[4] + '" data-tol="' + t[5] + '">Проверить</button></div>' +
        '<p class="meta"><code>' + esc(t[3]) + "</code></p></div>";
    }
    return "<h1>Практика на данных</h1>" +
      '<p class="lead">Четыре учебных датасета и ' + tasks.length + ' задач с автопроверкой. Скачайте CSV, считайте в SQL, Python или таблице и введите ответ. ' +
      "Числа с запятой тоже принимаются.</p>" +
      '<div class="grid">' + datasets.map(function (d) {
        return '<div class="card"><h3><a href="data/' + d[0] + '" download>' + esc(d[1]) + "</a></h3>" +
          "<p>" + esc(d[2]) + "</p><p class=\"meta\">" + esc(d[3]) + "</p></div>";
      }).join("") + "</div>" +
      '<h2>Задачи</h2><p class="meta" id="dlProgress">Решено: 0 из ' + tasks.length + '</p>' +
      '<div class="grid">' + tasks.map(task).join("") + "</div>" +
      '<h2>Собери дашборд</h2><p class="lead">Три решения из брифа: выберите вариант и получите разбор.</p>' +
      '<div class="grid">' +
      '<div class="card" data-dbq="0"><h3>Динамика выручки по неделям</h3><div class="options">' +
      '<button class="option" data-db="0" data-ok="0">Круговая диаграмма</button>' +
      '<button class="option" data-db="0" data-ok="1">Линейный график</button>' +
      '<button class="option" data-db="0" data-ok="0">Облако слов</button></div><p class="meta" data-db-out="0"></p></div>' +
      '<div class="card" data-dbq="1"><h3>Что поставить на первый экран?</h3><div class="options">' +
      '<button class="option" data-db="1" data-ok="1">Три KPI, период и один главный график</button>' +
      '<button class="option" data-db="1" data-ok="0">Все 20 графиков сразу</button>' +
      '<button class="option" data-db="1" data-ok="0">Сырую таблицу без фильтров</button></div><p class="meta" data-db-out="1"></p></div>' +
      '<div class="card" data-dbq="2"><h3>Как проверить дашборд перед публикацией?</h3><div class="options">' +
      '<button class="option" data-db="2" data-ok="1">Сверить KPI с эталоном и проверить период</button>' +
      '<button class="option" data-db="2" data-ok="0">Оценить только цвета</button>' +
      '<button class="option" data-db="2" data-ok="0">Добавить ещё графиков</button></div><p class="meta" data-db-out="2"></p></div>' +
      '</div>' +
      '<div class="card"><h3>Мини-проект: дашборд по маркетингу</h3>' +
      "<p>Соберите один экран: расходы, выручка, ROAS по каналам и CAC. Добавьте период и вывод: какой канал масштабировать и почему.</p>" +
      '<p class="meta">Шаблон: <a href="data/dashboard-sales-template.md" download>dashboard-sales-template.md</a>. ' +
      "Проверьте, что сумма расходов и выручки совпадает с файлом.</p></div>";
  }

  function bindDatalab() {
    var KEY = "analytics-lab-datalab-v1";
    var done = {};
    try { done = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {}
      var n = Object.keys(done).length;
      var el = document.getElementById("dlProgress");
      var total = document.querySelectorAll(".dl-task").length;
      if (el) el.textContent = "Решено: " + n + " из " + total;
    }
    save();
    Array.prototype.forEach.call(document.querySelectorAll("[data-dl]"), function (btn) {
      var id = btn.getAttribute("data-dl");
      var card = btn.closest(".dl-task");
      if (done[id] && card) { card.classList.add("done"); btn.textContent = "Верно"; }
      btn.addEventListener("click", function () {
        var input = document.getElementById("dl-" + id);
        var value = Number(String(input.value || "").replace(",", "."));
        var answer = Number(btn.getAttribute("data-answer"));
        var tol = Number(btn.getAttribute("data-tol") || 0.01);
        if (input.value !== "" && Math.abs(value - answer) <= tol + 0.000001) {
          done[id] = 1;
          save();
          btn.textContent = "Верно";
          if (card) card.classList.add("done");
        } else {
          btn.textContent = "Ещё раз";
          if (card) card.classList.remove("done");
        }
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-db]"), function (b) {
      b.addEventListener("click", function () {
        var card = b.closest("[data-dbq]");
        if (!card || card.getAttribute("data-done")) return;
        card.setAttribute("data-done", "1");
        var correct = b.getAttribute("data-ok") === "1";
        Array.prototype.forEach.call(card.querySelectorAll("[data-db]"), function (x) {
          x.disabled = true;
          if (x.getAttribute("data-ok") === "1") x.classList.add("right");
          else if (x === b) x.classList.add("wrong");
        });
        var out = card.querySelector("[data-db-out]");
        if (out) out.textContent = correct ? "Верно." : "Неверно: правильный вариант подсвечен.";
      });
    });
  }

  function reviewPage() {
    return '<h1>Повторение ошибок</h1>' +
      '<p class="lead">Вопросы, в которых вы ошибались в тестах и мини-тестах, возвращаются по интервальному ' +
      "повторению. Ответили верно \u2014 интервал растёт; ошиблись \u2014 вопрос можно повторить сразу.</p>" +
      '<div id="reviewList"></div>';
  }

  function bindReview() {
    var list = document.getElementById("reviewList");
    var due = window.PROGRESS.dueReviews();
    if (!due.length) {
      list.innerHTML = '<p class="meta">Повторять пока нечего. Ответите неверно в тесте \u2014 ' +
        'вопрос появится здесь для повторения.</p><p><a class="btn" href="#/quiz">Пройти тест</a></p>';
      return;
    }
    list.innerHTML = due.map(function (r) {
      var t = window.TOPICS[r.topic], q = t && t.quiz && t.quiz[r.idx];
      if (!t || !q) return "";
      var opts = quizOptions(q);
      return '<div class="card review-item" data-topic="' + r.topic + '" data-idx="' + r.idx + '">' +
        '<p class="meta">' + esc(t.title) + "</p>" +
        "<p><b>" + esc(q.q) + "</b></p>" +
        '<div class="options">' + opts.map(function (o, k) {
          return '<button class="option" data-k="' + k + '">' + String.fromCharCode(1040 + k) + ". " + esc(o.text) + "</button>";
        }).join("") +
        '</div><div class="explain" aria-live="polite" hidden></div></div>';
    }).join("") + '<p class="meta">Показываю вопросы из всех разделов.</p>';
    Array.prototype.forEach.call(list.querySelectorAll(".review-item"), function (it) {
      var topic = it.getAttribute("data-topic");
      var idx = Number(it.getAttribute("data-idx"));
      var q = window.TOPICS[topic].quiz[idx];
      var opts = quizOptions(q);
      Array.prototype.forEach.call(it.querySelectorAll(".option"), function (opt) {
        opt.addEventListener("click", function () {
          if (it.getAttribute("data-done")) return;
          it.setAttribute("data-done", "1");
          var k = Number(opt.getAttribute("data-k"));
          var ok = opts[k].ok;
          window.PROGRESS.srsAnswer(topic, idx, ok);
          Array.prototype.forEach.call(it.querySelectorAll(".option"), function (o, oi) {
            o.disabled = true;
            if (opts[oi].ok) o.classList.add("right");
            else if (oi === k) o.classList.add("wrong");
          });
          var ex = it.querySelector(".explain");
          ex.hidden = false;
          ex.innerHTML = "<b>" + (ok ? "Верно" : "Неверно") + "</b> " + q.explain;
        });
      });
    });
  }

  function offlinePage() {
    var bundled = !!window.OFFLINE_BUILD;
    return "<h1>Офлайн-версия</h1>" +
      '<p class="lead">Сайт работает без интернета двумя способами: установить как приложение или скачать архив и запустить локально.</p>' +
      (bundled
        ? '<div class="note"><b>Вы в архиве</b>Это и есть офлайн-версия: файлы уже распакованы, интернет для глав, тестов и тренажёров не нужен.</div>'
        : '<div class="card"><h3>Архив сайта</h3>' +
          "<p>Все главы, тесты, тренажёры, игры, демонстрации и песочница SQL. Распакуйте и запустите start.command (macOS/Linux) " +
          "или start.bat (Windows).</p>" +
          '<div class="links"><a class="btn primary" href="analytics-lab-offline.zip" download>Скачать ZIP</a></div></div>') +
      "<h2>Как запустить</h2><ol>" +
      "<li>Распакуйте архив.</li>" +
      "<li>macOS/Linux: <code>sh start.command</code>; Windows: <code>start.bat</code>.</li>" +
      "<li>Браузер откроет <code>http://localhost:8000</code>.</li></ol>" +
      '<div class="note"><b>Что нужно знать</b>Песочнице SQL нужен локальный сервер из архива: под file:// браузер не отдаёт wasm-файл. ' +
      "Песочница Python при первом запуске скачивает ядро Pyodide (~10 МБ) с CDN, поэтому ей нужен интернет.</div>" +
      "<h2>Установка как приложение</h2>" +
      "<p>Откройте сайт по https и выберите «Установить приложение» в меню браузера. После первого открытия разделы, тесты и тренажёры " +
      "доступны офлайн; прогресс хранится в браузере.</p>";
  }

  function cheatSheetPage() {
    var rows = window.CHEATSHEET || [];
    return "<h1>Какой критерий выбрать</h1>" +
      '<p class="lead">Сначала задача, потом метод, потом проверка допущений. Таблица не заменяет учебник, ' +
      "но помогает не выбрать t-тест там, где нужен Фридман.</p>" +
      '<div class="table-wrap"><table><thead><tr><th>Задача</th><th>Основной метод</th>' +
      "<th>Если допущения нарушены</th><th>Что проверить</th></tr></thead><tbody>" +
      rows.map(function (r) {
        return "<tr><td>" + esc(r.task) + "</td><td>" + esc(r.main) + "</td><td>" +
          esc(r.alt) + "</td><td>" + esc(r.check) + "</td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<div class="note"><b>Перед расчётом</b>Проверьте независимость наблюдений, форму распределения и выбросы, ' +
      "объём выборки и число сравнений. Гипотезу фиксируйте до того, как смотреть на данные.</div>" +
      '<div class="note"><b>Что писать в выводе</b>Размер эффекта, доверительный интервал, p-уровень и объём выборки. ' +
      "p не говорит, насколько эффект большой или важный.</div>";
  }

  // ---------- поиск ----------

  var searchIndex = null;

  function searchPage(query) {
    if (!searchIndex) searchIndex = window.SEARCH.index(window.TOPICS);
    return "<h1>Поиск</h1><p class=\"lead\">Ищет по главам и вопросам тестов всех разделов.</p>" +
      '<div class="search-row"><label class="sr-only" for="q">Поисковый запрос</label>' +
      '<input type="search" id="q" placeholder="Например: Байес, JOIN, дисперсия" autocomplete="off" value="' +
      esc(query || "") + '"></div><div id="results" class="search-results"></div>';
  }

  function bindSearch(query) {
    var input = document.getElementById("q");
    var box = document.getElementById("results");
    var initial = query ? decodeURIComponent(query) : "";

    function draw(q) {
      if (!q || q.trim().length < 2) {
        box.innerHTML = '<p class="lead">Введите хотя бы два символа.</p>';
        return;
      }
      var hits = window.SEARCH.find(searchIndex, q);
      if (!hits.length) {
        box.innerHTML = '<p class="lead">Ничего не найдено. Попробуйте другое слово.</p>';
        return;
      }
      var words = q.trim().toLowerCase().split(/\s+/).filter(function (w) { return w.length > 1; });
      box.innerHTML = hits.map(function (h) {
        return '<a class="result" href="' + h.entry.href + '">' +
          '<span class="chip">' + esc(h.entry.topicTitle) + " · " + h.entry.kind + "</span>" +
          "<b>" + markQuery(h.entry.title, words) + "</b>" +
          '<span class="result-text">' + markQuery(h.snippet, words) + "</span></a>";
      }).join("");
      Array.prototype.forEach.call(box.querySelectorAll(".result"), function (a) {
        a.addEventListener("click", function () {
          try { sessionStorage.setItem("searchJump", JSON.stringify({ q: q, href: a.getAttribute("href") })); } catch (e) {}
        });
      });
    }

    input.addEventListener("input", function () {
      history.replaceState(null, "", input.value.trim() ? "#/search/" + encodeURIComponent(input.value.trim()) : "#/search");
      draw(input.value);
    });
    draw(initial);
    input.focus();
  }

  function biExamPage() {
    examPage({
      bank: window.TOPICS.bi.quiz,
      title: "Сертификация BI",
      lead: "20 вопросов, 15 минут. Проходной балл — 14 правильных ответов.",
      pass: 14, minutes: 15, back: "#/theory/bi", backLabel: "к разделу BI"
    });
  }

  function analystExamPage() {
    var bank = window.TOPICS.statistics.quiz.slice(0, 7)
      .concat(window.TOPICS.probability.quiz.slice(0, 7), window.TOPICS.analytics.quiz.slice(0, 6));
    examPage({
      bank: bank,
      title: "Сертификация аналитика",
      lead: "20 вопросов по статистике, вероятности и аналитике, 15 минут. Проходной балл — 14 правильных ответов.",
      pass: 14, minutes: 15, back: "#/theory/statistics", backLabel: "к разделу «Статистика»"
    });
  }

  // ---------- роутер ----------

  // Каждый маршрут описывает результат: html, побочный рендер или монтирование.
  function routeFor(p) {
    var seg = p[0], id = p[1];

    if (!seg) return { html: home() };

    if (seg === "textbook") return { html: textbookPage() };
    if (seg === "theory") {
      if (id && window.TOPICS[id]) return { html: theory(id, p[2]) };
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
    if (seg === "project") return { html: projectPage(), after: bindProject };
    if (seg === "capstone") return { html: capstonePage(), after: bindCapstone };
    if (seg === "open-project") return { html: openProjectPage(), after: bindOpenProject };
    if (seg === "dbt-project") return { html: window.DBT_PROJECT.page(), after: window.DBT_PROJECT.bind };
    if (seg === "datalab") return { html: datalabPage(), after: bindDatalab };
    if (seg === "cases") return { html: casesPage() };
    if (seg === "prompt-lab") return { html: promptLabPage(), after: bindPromptLab };
    if (seg === "cards") return { html: cardsPage(), after: bindCards };
    if (seg === "progress") return { html: progressPage(), after: bindProgress };
    if (seg === "review") return { html: reviewPage(), after: bindReview };
    if (seg === "achievements") return { html: achievementsPage() };
    if (seg === "calc") return { html: calcPage(), after: bindCalc };
    if (seg === "bi-exam") return { mount: biExamPage };
    if (seg === "analyst-exam") return { mount: analystExamPage };
    if (seg === "notebook") return { mount: notebookPage };
    if (seg === "changelog") return { html: changelogPage() };
    if (seg === "sandbox") return { mount: sandboxPage };
    if (seg === "pysandbox") return { mount: pySandboxPage };
    if (seg === "path") return { html: pathPage() };
    if (seg === "cheatsheet") return { html: cheatSheetPage() };
    if (seg === "glossary") return { html: glossaryPage(id), after: function () { bindGlossary(id); } };
    if (seg === "offline") return { html: offlinePage() };
    if (seg === "search") return { html: searchPage(id), after: function () { bindSearch(id); } };
    return { html: '<h1>Страница не найдена</h1><p><a href="#/">На главную</a></p>' };
  }

  function render() {
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    setKeys(null);
    var p = path();
    renderNav();
    if (window.ACHIEVEMENTS) window.ACHIEVEMENTS.checkAndToast();
    window.scrollTo(0, 0);

    var r = routeFor(p);

    if (r.quiz) {
      if (!quiz || quiz.id !== r.quiz) startQuiz(r.quiz);
      renderQuiz();
      return;
    }

    if (r.trainer) {
      if (!trainer || trainer.id !== r.trainer) {
        trainer = { id: r.trainer, correct: 0, total: 0 };
        newTask();
      }
      renderTrainer();
      return;
    }

    if (r.mount) return r.mount();

    var html = r.html;
    var after = r.after || null;

    if (html !== null) {
      app.innerHTML = html;
      bindChapters();
      var reset = document.getElementById("resetProgress");
      if (reset) reset.addEventListener("click", function () {
        if (confirm("Сбросить прочитанные главы и результаты тестов?")) {
          window.PROGRESS.clear();
          if (window.ACHIEVEMENTS) window.ACHIEVEMENTS.clear();
          searchIndex = null;
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
              searchIndex = null;
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

  initPalette();
  syncVersion();
  window.addEventListener("hashchange", render);
  render();
})();
