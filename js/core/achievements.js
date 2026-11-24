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

  function promptStats() {
    var empty = { attempts: 0, perfect: 0, sessions: 0 };
    try {
      var p = JSON.parse(window.localStorage.getItem("analytics-lab-prompt-lab-v2") || "{}") || {};
      var attempts = 0, perfect = 0;
      Object.keys(p.attempts || {}).forEach(function (k) { attempts += Number(p.attempts[k]) || 0; });
      Object.keys(p.best || {}).forEach(function (k) { if (Number(p.best[k]) >= 4) perfect++; });
      return { attempts: attempts, perfect: perfect, sessions: Number(p.sessions) || 0 };
    } catch (e) { return empty; }
  }

  function quizFirst(id) {
    var q = window.PROGRESS && window.PROGRESS.quiz(id);
    if (!q) return { score: 0, total: 0 };
    if (Number(q.attempts) === 1 && (q.firstScore === null || q.firstScore === undefined)) {
      return { score: Number(q.best) || 0, total: Number(q.total) || 0 };
    }
    return Number(q.firstTotal) > 0
      ? { score: Number(q.firstScore) || 0, total: Number(q.firstTotal) || 0 }
      : { score: 0, total: 0 };
  }

  function firstAtLeast(id, n) {
    var f = quizFirst(id);
    return f.total > 0 && f.score >= n ? 1 : 0;
  }

  var DEFS = [
    { id: "first-chapter", title: "Первый шаг", text: "Прочитайте первую главу", icon: "book", tone: "#4f46e5", target: 1,
      value: function (c) { return c.chapters; } },
    { id: "five-chapters", title: "Пять глав", text: "Прочитайте пять глав", icon: "book", tone: "#0891b2", target: 5,
      value: function (c) { return c.chapters; } },
    { id: "ten-sections", title: "Десять разделов", text: "Прочитайте хотя бы одну главу в десяти разделах", icon: "layers", tone: "#7c3aed", target: 10,
      value: function (c) { return c.sections; } },
    { id: "twenty-five-chapters", title: "Четверть пути", text: "Прочитайте 25 глав", icon: "trend", tone: "#0f766e", target: 25,
      value: function (c) { return c.chapters; } },
    { id: "fifty-chapters", title: "Полсотни", text: "Прочитайте 50 глав", icon: "star", tone: "#b45309", target: 50,
      value: function (c) { return c.chapters; } },
    { id: "first-quiz", title: "Проверка", text: "Пройдите первый тест", icon: "target", tone: "#0891b2", target: 1,
      value: function (c) { return c.attempts > 0 ? 1 : 0; } },
    { id: "five-tests", title: "Пять тестов", text: "Пройдите тесты в пяти разных разделах", icon: "target", tone: "#2563eb", target: 5,
      value: function (c) { return c.tests; } },
    { id: "ten-tests", title: "Десять тестов", text: "Пройдите тесты в десяти разных разделах", icon: "target", tone: "#7c3aed", target: 10,
      value: function (c) { return c.tests; } },
    { id: "perfect-quiz", title: "Чистый тест", text: "Пройдите тест без ошибок с первой попытки", icon: "shield", tone: "#15803d", target: 1,
      value: function (c) { return c.perfect ? 1 : 0; } },
    { id: "mini-ten", title: "Десять задач", text: "Решите 10 заданий в тренажёрах", icon: "flask", tone: "#a16207", target: 10,
      value: function (c) { return c.miniTotal; } },
    { id: "hundred-mini", title: "Сто задач", text: "Решите 100 заданий в тренажёрах", icon: "flask", tone: "#9a3412", target: 100,
      value: function (c) { return c.miniTotal; } },
    { id: "sql-quiz", title: "SQL-практик", text: "С первой попытки: 7 из 8 в тесте SQL", icon: "database", tone: "#15803d", target: 1,
      value: function () { return firstAtLeast("sql", 7); } },
    { id: "cs-quiz", title: "Под капот", text: "С первой попытки: 7 из 8 в тесте Computer Science", icon: "cpu", tone: "#0891b2", target: 1,
      value: function () { return firstAtLeast("cs", 7); } },
    { id: "pandas-quiz", title: "pandas в руках", text: "С первой попытки: 7 из 8 в тесте Python", icon: "code", tone: "#a16207", target: 1,
      value: function () { return firstAtLeast("python", 7); } },
    { id: "causal-quiz", title: "Причинный вывод", text: "С первой попытки: 7 из 8 в тесте причинности", icon: "link", tone: "#9a3412", target: 1,
      value: function () { return firstAtLeast("causal", 7); } },
    { id: "analytics-quiz", title: "Аналитик", text: "С первой попытки: 7 из 8 в тесте аналитики", icon: "target", tone: "#2563eb", target: 1,
      value: function () { return firstAtLeast("analytics", 7); } },
    { id: "stats-quiz", title: "Статистик", text: "С первой попытки: 7 из 8 в тесте статистики", icon: "flask", tone: "#0f766e", target: 1,
      value: function () { return firstAtLeast("statistics", 7); } },
    { id: "bi-quiz", title: "BI-практик", text: "С первой попытки: 7 из 8 в тесте BI", icon: "chart", tone: "#7c3aed", target: 1,
      value: function () { return firstAtLeast("bi", 7); } },
    { id: "toolkit-quiz", title: "Настроенный сетап", text: "С первой попытки: 7 из 8 в тесте инструментария", icon: "gear", tone: "#475569", target: 1,
      value: function () { return firstAtLeast("toolkit", 7); } },
    { id: "game-theory", title: "Стратег", text: "Прочитайте первую главу теории игр", icon: "scale", tone: "#b45309", target: 1,
      value: function () { return read("gametheory", 0) ? 1 : 0; } },
    { id: "capstone-first", title: "Первый ответ", text: "Решите одну задачу большого проекта", icon: "layers", tone: "#7c3aed", target: 1,
      value: function (c) { return c.capstone > 0 ? 1 : 0; } },
    { id: "dbt-visited", title: "В прод", text: "Откройте сквозной проект dbt + BI", icon: "gear", tone: "#475569", target: 1,
      value: function (c) { return c.dbt ? 1 : 0; } },
    { id: "prompt-first", title: "Первый промпт", text: "Сохраните первую попытку в тренажёре промптов", icon: "note", tone: "#2563eb", target: 1,
      value: function (c) { return c.promptAttempts; } },
    { id: "prompt-five", title: "Пять промптов", text: "Сохраните пять попыток в тренажёре промптов", icon: "note", tone: "#7c3aed", target: 5,
      value: function (c) { return c.promptAttempts; } },
    { id: "prompt-perfect", title: "Сильный промпт", text: "Закройте все критерии хотя бы в одном задании", icon: "shield", tone: "#15803d", target: 1,
      value: function (c) { return c.promptPerfect; } },
    { id: "prompt-session", title: "Короткая сессия", text: "Завершите сессию из трёх задач", icon: "target", tone: "#0891b2", target: 1,
      value: function (c) { return c.promptSessions; } },
    { id: "portfolio", title: "Портфолио", text: "Закройте оба проекта: розницу и подписку", icon: "star", tone: "#db2777", target: 2,
      value: function (c) { return (c.capstone >= 6 ? 1 : 0) + (c.open >= 6 ? 1 : 0); } }
  ];

  function context() {
    var s = window.PROGRESS ? window.PROGRESS.summary(window.TOPICS) : { chapters: 0, totalChapters: 0 };
    var attempts = 0, perfect = false, tests = 0, sections = 0;
    Object.keys(window.TOPICS || {}).forEach(function (id) {
      var q = window.PROGRESS && window.PROGRESS.quiz(id);
      if (q && Number(q.attempts) > 0) tests++;
      if (q) {
        attempts += Number(q.attempts) || 0;
        if (Number(q.firstTotal) > 0 && Number(q.firstScore) === Number(q.firstTotal)) perfect = true;
      }
      if (window.PROGRESS && window.PROGRESS.readCount(id) > 0) sections++;
    });
    var mini = window.PROGRESS ? window.PROGRESS.miniStats() : { total: 0 };
    var prompt = promptStats();
    return {
      chapters: s.chapters || 0,
      sections: sections,
      tests: tests,
      attempts: attempts,
      perfect: perfect,
      miniTotal: Number(mini.total) || 0,
      promptAttempts: prompt.attempts,
      promptPerfect: prompt.perfect,
      promptSessions: prompt.sessions,
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
        tone: d.tone,
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
