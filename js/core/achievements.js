// Достижения: считаются из прогресса и локальных артефактов, хранят дату открытия.
(function () {
  "use strict";

  var KEY = "analytics-lab-achievements-v1";
  var store = load();

  function load() {
    try {
      var p = JSON.parse(window.localStorage.getItem(KEY) || "{}");
      return p && typeof p === "object" ? p : {};
    } catch (e) { return {}; }
  }

  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function readFlag(key) {
    try { return !!window.localStorage.getItem(key); } catch (e) { return false; }
  }

  function readCount(key) {
    try {
      var p = JSON.parse(window.localStorage.getItem(key) || "{}");
      return p && typeof p === "object" ? Object.keys(p).length : 0;
    } catch (e) { return 0; }
  }

  function read(topic, idx) {
    return !!(window.PROGRESS && window.PROGRESS.isRead(topic, idx));
  }

  var DEFS = [
    { id: "first-chapter", title: "Первый шаг", text: "Прочитайте первую главу", icon: "book", target: 1,
      value: function (c) { return c.chapters; } },
    { id: "ten-chapters", title: "Разогрев", text: "Прочитайте 10 глав", icon: "book", target: 10,
      value: function (c) { return c.chapters; } },
    { id: "fifty-chapters", title: "Половина пути", text: "Прочитайте 50 глав", icon: "layers", target: 50,
      value: function (c) { return c.chapters; } },
    { id: "first-quiz", title: "Проверка", text: "Пройдите первый тест", icon: "target", target: 1,
      value: function (c) { return c.attempts > 0 ? 1 : 0; } },
    { id: "perfect-quiz", title: "Чистый тест", text: "Пройдите тест без ошибок", icon: "shield", target: 1,
      value: function (c) { return c.perfect ? 1 : 0; } },
    { id: "mini-ten", title: "Десять задач", text: "Решите 10 заданий в тренажёрах", icon: "flask", target: 10,
      value: function (c) { return c.miniTotal; } },
    { id: "sql-basics", title: "В базу", text: "Прочитайте первую главу SQL", icon: "database", target: 1,
      value: function () { return read("sql", 0) ? 1 : 0; } },
    { id: "cs-start", title: "Под капот", text: "Прочитайте первую главу Computer Science", icon: "cpu", target: 1,
      value: function () { return read("cs", 0) ? 1 : 0; } },
    { id: "game-theory", title: "Стратег", text: "Прочитайте первую главу теории игр", icon: "scale", target: 1,
      value: function () { return read("gametheory", 0) ? 1 : 0; } },
    { id: "capstone-first", title: "Первый ответ", text: "Решите одну задачу большого проекта", icon: "layers", target: 1,
      value: function (c) { return c.capstone > 0 ? 1 : 0; } },
    { id: "dbt-visited", title: "В прод", text: "Откройте сквозной проект dbt + BI", icon: "gear", target: 1,
      value: function (c) { return c.dbt ? 1 : 0; } },
    { id: "portfolio", title: "Портфолио", text: "Закройте оба проекта: розницу и подписку", icon: "note", target: 2,
      value: function (c) { return (c.capstone >= 6 ? 1 : 0) + (c.open >= 6 ? 1 : 0); } }
  ];

  function context() {
    var s = window.PROGRESS ? window.PROGRESS.summary(window.TOPICS) : { chapters: 0, totalChapters: 0 };
    var attempts = 0, perfect = false;
    Object.keys(window.TOPICS || {}).forEach(function (id) {
      var q = window.PROGRESS && window.PROGRESS.quiz(id);
      if (!q) return;
      attempts += Number(q.attempts) || 0;
      if (q.total > 0 && q.best === q.total) perfect = true;
    });
    var mini = window.PROGRESS ? window.PROGRESS.miniStats() : { total: 0 };
    return {
      chapters: s.chapters || 0,
      attempts: attempts,
      perfect: perfect,
      miniTotal: Number(mini.total) || 0,
      capstone: readCount("analytics-lab-capstone-v1"),
      open: readCount("analytics-lab-open-project-v1"),
      dbt: readFlag("analytics-lab-dbt-visited-v1")
    };
  }

  function list() {
    var c = context();
    return DEFS.map(function (d) {
      var raw = d.value(c);
      return {
        id: d.id,
        title: d.title,
        text: d.text,
        icon: d.icon,
        target: d.target,
        value: Math.min(raw, d.target),
        done: raw >= d.target,
        at: store[d.id] || null
      };
    });
  }

  function check() {
    var c = context();
    var fresh = [];
    DEFS.forEach(function (d) {
      if (!store[d.id] && d.value(c) >= d.target) {
        store[d.id] = Date.now();
        fresh.push(d);
      }
    });
    if (fresh.length) save();
    return fresh;
  }

  function total() { return DEFS.length; }
  function count() { return Object.keys(store).length; }

  function clear() {
    store = {};
    save();
  }

  function toast(items) {
    if (!items.length || !document.body) return;
    var el = document.createElement("div");
    el.className = "achievement-toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.innerHTML = "<b>Достижение открыто</b>" + items.slice(0, 2).map(function (a) {
      return "<span>" + esc(a.title) + "</span>";
    }).join("") + (items.length > 2 ? "<span>и ещё " + (items.length - 2) + "</span>" : "");
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 4500);
  }

  function checkAndToast() {
    var fresh = check();
    toast(fresh);
    return fresh;
  }

  window.ACHIEVEMENTS = {
    list: list,
    check: check,
    checkAndToast: checkAndToast,
    count: count,
    total: total,
    clear: clear
  };
})();
