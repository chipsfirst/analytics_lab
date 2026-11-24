// Учебные события и рекомендации: один следующий шаг и карта навыков.
(function () {
  "use strict";

  var KEY = "analytics-lab-events-v1";
  var MAX = 800;
  var events = load();

  function load() {
    try {
      var p = JSON.parse(window.localStorage.getItem(KEY) || "[]");
      return Array.isArray(p) ? p : [];
    } catch (e) { return []; }
  }

  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX))); } catch (e) {}
  }

  function log(type, data) {
    if (!type) return;
    var e = { type: type, at: Date.now() };
    if (data && typeof data === "object") {
      Object.keys(data).forEach(function (k) { e[k] = data[k]; });
    }
    events.push(e);
    if (events.length > MAX) events = events.slice(-MAX);
    save();
  }

  function topicTitle(id) {
    return (window.TOPICS && window.TOPICS[id] && window.TOPICS[id].title) || id;
  }

  function skillFor(topic, chapterTitle) {
    var t = String(chapterTitle || "").toLowerCase();
    if (topic === "sql") {
      if (/join|соедин/.test(t)) return "SQL · JOIN";
      if (/оконн|window|row_number|rank|lag/.test(t)) return "SQL · окна";
      if (/group|агрег|having/.test(t)) return "SQL · агрегаты";
      if (/подзапрос|cte|with/.test(t)) return "SQL · подзапросы";
      if (/индекс|explain|план|оптимиз/.test(t)) return "SQL · оптимизация";
      return "SQL";
    }
    if (topic === "statistics") {
      if (/доверит|интервал/.test(t)) return "Статистика · интервалы";
      if (/гипотез|p-знач|p-value|критери/.test(t)) return "Статистика · гипотезы";
      if (/регресс/.test(t)) return "Статистика · регрессия";
      if (/бутстрап|перестанов/.test(t)) return "Статистика · ресемплинг";
      return "Статистика";
    }
    if (topic === "probability") {
      if (/байес|условн/.test(t)) return "Вероятность · Байес";
      if (/распредел|пуассон|бином/.test(t)) return "Вероятность · распределения";
      return "Вероятность";
    }
    if (topic === "analytics") {
      if (/метрик|конверс|воронк|retention|удерж/.test(t)) return "Аналитика · метрики";
      if (/a\/b|эксперимент|тест/.test(t)) return "Аналитика · эксперименты";
      return "Аналитика";
    }
    var defaults = {
      data: "Данные", excel: "Excel", python: "Python", causal: "Причинность",
      bi: "BI", production: "Продакшен", regression: "Регрессия",
      classification: "Классификация", ml: "ML", cs: "Computer Science",
      ai: "ИИ", marketing: "Маркетинг", simulation: "Симуляция",
      timeseries: "Временные ряды", gametheory: "Теория игр",
      ethics: "Этика", useful: "Практика", toolkit: "Инструментарий"
    };
    return defaults[topic] || topicTitle(topic);
  }

  function topicIds() {
    var order = window.TOPIC_ORDER || Object.keys(window.TOPICS || {});
    return order.filter(function (id) { return !!window.TOPICS[id]; });
  }

  function firstUnread(id) {
    if (!window.PROGRESS || !window.TOPICS[id]) return null;
    var chapters = window.TOPICS[id].chapters;
    for (var i = 0; i < chapters.length; i++) {
      if (!window.PROGRESS.isRead(id, i)) return i;
    }
    return null;
  }

  function nextStep() {
    var due = window.PROGRESS ? window.PROGRESS.dueReviews() : [];
    if (due.length) {
      var d = due[0];
      return {
        kind: "Повторение",
        title: "Разобрать ошибки",
        text: "В очереди " + due.length + " повторений. Начните с «" + topicTitle(d.topic) + "».",
        href: "#/review",
        cta: "Повторить ошибки",
        why: "Повторение по расписанию важнее новой главы."
      };
    }

    var weak = null;
    topicIds().forEach(function (id) {
      var q = window.PROGRESS && window.PROGRESS.quiz(id);
      if (!q || !Number(q.attempts)) return;
      var pct = Number(q.best) / Math.max(1, Number(q.total));
      if (pct < 0.6 && (!weak || pct < weak.pct)) weak = { id: id, pct: pct, q: q };
    });
    if (weak) {
      var chapter = firstUnread(weak.id);
      if (chapter === null) chapter = 0;
      return {
        kind: "Слабое место",
        title: "Подтянуть: " + topicTitle(weak.id),
        text: "Лучший результат — " + weak.q.best + " из " + weak.q.total +
          ". Перечитайте главу и закрепите тренажёром.",
        href: "#/theory/" + weak.id + "/" + chapter,
        cta: "Учиться",
        why: "Тест показал меньше 60%; сначала теория, затем практика."
      };
    }

    var last = window.PROGRESS && window.PROGRESS.last();
    if (last && last.id && window.TOPICS[last.id]) {
      var li = Number(last.i);
      if (!window.PROGRESS.isRead(last.id, li)) {
        return {
          kind: "Продолжение",
          title: "Продолжить: " + topicTitle(last.id),
          text: "Вы остановились на главе «" + window.TOPICS[last.id].chapters[li].title + "».",
          href: "#/theory/" + last.id + "/" + li,
          cta: "Продолжить",
          why: "Продолжайте с места, где остановились."
        };
      }
    }

    var unread = null;
    topicIds().some(function (id) {
      var i = firstUnread(id);
      if (i !== null) { unread = { id: id, i: i }; return true; }
      return false;
    });
    if (unread) {
      return {
        kind: "Новая тема",
        title: "Начать: " + topicTitle(unread.id),
        text: "Первая непрочитанная глава: «" + window.TOPICS[unread.id].chapters[unread.i].title + "».",
        href: "#/theory/" + unread.id + "/" + unread.i,
        cta: "Открыть главу",
        why: "Это следующий шаг по порядку разделов."
      };
    }

    return {
      kind: "Закрепление",
      title: "Повторить изученное",
      text: "Все главы прочитаны. Проверьте ошибки и пройдите тест в слабом разделе.",
      href: "#/review",
      cta: "К повторению",
      why: "Поддерживайте знания, а не только собирайте галочки."
    };
  }

  function skills() {
    var map = {};
    function add(name, kind, correct, total, topic, chapter) {
      if (!map[name]) map[name] = { name: name, read: 0, chapters: 0, correct: 0, total: 0, attempts: 0, topic: topic || "", chapter: chapter === undefined ? 0 : chapter };
      if (kind === "read") map[name].read++;
      if (kind === "chapter") map[name].chapters++;
      if (kind === "quiz" || kind === "trainer" || kind === "prompt") {
        map[name].correct += Number(correct) || 0;
        map[name].total += Number(total) || 0;
        map[name].attempts++;
      }
    }
    topicIds().forEach(function (id) {
      var t = window.TOPICS[id];
      t.chapters.forEach(function (c, i) {
        var name = skillFor(id, c.title);
        add(name, "chapter", 0, 0, id, i);
        if (window.PROGRESS && window.PROGRESS.isRead(id, i)) add(name, "read", 0, 0, id, i);
      });
      var q = window.PROGRESS && window.PROGRESS.quiz(id);
      if (q && Number(q.attempts)) add(skillFor(id, ""), "quiz", q.best, q.total, id, 0);
    });
    events.forEach(function (e) {
      if (e.type === "trainer" || e.type === "prompt") {
        add(e.skill || "Практика", e.type, e.correct, e.total, e.topic || "", 0);
      }
    });
    return Object.keys(map).map(function (name) {
      var r = map[name];
      var readPct = r.chapters ? r.read / r.chapters : 0;
      var quizPct = r.total ? r.correct / r.total : 0;
      var pct = r.total ? Math.round((readPct * 0.4 + quizPct * 0.6) * 100) : Math.round(readPct * 100);
      return {
        name: name, read: r.read, chapters: r.chapters,
        correct: r.correct, total: r.total, attempts: r.attempts, percent: pct,
        href: r.topic ? "#/theory/" + r.topic + "/" + (r.chapter || 0) : "#/textbook"
      };
    }).sort(function (a, b) { return a.percent - b.percent || b.total - a.total; });
  }

  function eventCount() { return events.length; }
  function recent(n) { return events.slice(-(n || 10)).reverse(); }

  window.LEARNING = { log: log, nextStep: nextStep, skills: skills, skillFor: skillFor, eventCount: eventCount, recent: recent, clear: function () { events = []; save(); } };
})();
