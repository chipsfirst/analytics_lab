// Прогресс: прочитанные главы и результаты тестов. Хранится в localStorage.
// При недоступном хранилище (file:// в некоторых браузерах, приватный режим)
// модуль молча работает в памяти — сайт не ломается.

(function () {
  "use strict";

  var KEY = "analytics-lab-progress-v1";

  function empty() { return { chapters: {}, quizzes: {}, mini: {}, srs: {}, last: null }; }

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return empty();
      var p = JSON.parse(raw);
      return { chapters: p.chapters || {}, quizzes: p.quizzes || {}, mini: p.mini || {}, srs: p.srs || {}, last: p.last || null };
    } catch (e) {
      return empty();
    }
  }

  var data = load();

  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* память */ }
  }

  function readCount(topic) {
    var n = 0;
    for (var k in data.chapters) if (k.indexOf(topic + ":") === 0) n++;
    return n;
  }

  var DAY = 24 * 60 * 60 * 1000;
  function schedule(topic, idx, ok) {
    var key = topic + ":" + idx;
    var cur = data.srs[key] || { step: 0 };
    var step = ok ? Math.min(cur.step + 1, 4) : 0;
    var days = [0, 1, 3, 7, 14][step];
    data.srs[key] = { due: Date.now() + days * DAY, step: step };
    save();
  }

  function dueReviews() {
    var now = Date.now(), out = [], seen = {};
    Object.keys(data.srs).forEach(function (k) {
      seen[k] = 1;
      if (data.srs[k].due <= now) {
        var parts = k.split(":");
        out.push({ topic: parts[0], idx: Number(parts[1]), due: data.srs[k].due });
      }
    });
    Object.keys(data.quizzes).forEach(function (topic) {
      (data.quizzes[topic].review || []).forEach(function (idx) {
        var k = topic + ":" + idx;
        if (!seen[k]) out.push({ topic: topic, idx: idx, due: 0 });
      });
    });
    return out;
  }

  window.PROGRESS = {
    isRead: function (topic, i) { return !!data.chapters[topic + ":" + i]; },

    setRead: function (topic, i, v) {
      var k = topic + ":" + i;
      if (v) data.chapters[k] = 1; else delete data.chapters[k];
      save();
      if (window.LEARNING) window.LEARNING.log("read", { topic: topic, chapter: i, read: !!v });
    },

    readCount: readCount,

    quiz: function (topic) { return data.quizzes[topic] || null; },

    hasLegacyQuizzes: function () {
      return Object.keys(data.quizzes).some(function (topic) {
        var q = data.quizzes[topic];
        return q && Number(q.attempts) > 1 && (q.firstScore === null || q.firstScore === undefined);
      });
    },

    clearQuizHistory: function () {
      data.quizzes = {};
      data.srs = {};
      save();
      if (window.LEARNING) window.LEARNING.clear();
    },

    // answers: [{ idx, ok }], idx — номер вопроса в банке раздела
    recordQuiz: function (topic, answers) {
      var cur = data.quizzes[topic] || { best: 0, total: 0, attempts: 0, review: [] };
      var score = answers.filter(function (a) { return a.ok; }).length;

      var review = {};
      cur.review.forEach(function (i) { review[i] = 1; });
      answers.forEach(function (a) { if (a.ok) delete review[a.idx]; else review[a.idx] = 1; });

      answers.forEach(function (a) { schedule(topic, a.idx, a.ok); });
      var firstScore = cur.attempts ? (typeof cur.firstScore === "number" ? cur.firstScore : null) : score;
      var firstTotal = cur.attempts ? (typeof cur.firstTotal === "number" ? cur.firstTotal : null) : answers.length;
      data.quizzes[topic] = {
        best: Math.max(cur.best, score),
        total: answers.length,
        attempts: cur.attempts + 1,
        lastScore: score,
        firstScore: firstScore,
        firstTotal: firstTotal,
        review: Object.keys(review).map(Number).sort(function (a, b) { return a - b; })
      };
      save();
      if (window.LEARNING) {
        window.LEARNING.log("quiz", {
          topic: topic,
          skill: window.LEARNING.skillFor(topic, ""),
          correct: score,
          total: answers.length
        });
      }
      return data.quizzes[topic];
    },

    srsAnswer: schedule,
    dueReviews: dueReviews,

    recordMini: function (topic, correct, total) {
      var cur = data.mini[topic] || { correct: 0, total: 0, attempts: 0 };
      data.mini[topic] = {
        correct: cur.correct + (Number(correct) || 0),
        total: cur.total + (Number(total) || 0),
        attempts: cur.attempts + 1
      };
      save();
      if (window.LEARNING) {
        window.LEARNING.log("mini", {
          topic: topic,
          skill: window.LEARNING.skillFor(topic, ""),
          correct: Number(correct) || 0,
          total: Number(total) || 0
        });
      }
    },

    mini: function (topic) { return data.mini[topic] || null; },

    miniStats: function () {
      var correct = 0, total = 0;
      Object.keys(data.mini).forEach(function (k) {
        correct += data.mini[k].correct;
        total += data.mini[k].total;
      });
      return { correct: correct, total: total };
    },

    clear: function () {
      data = empty();
      save();
      if (window.LEARNING) window.LEARNING.clear();
    },

    exportData: function () {
      return JSON.stringify({
        app: "analytics-lab",
        v: 1,
        chapters: data.chapters,
        quizzes: data.quizzes,
        mini: data.mini,
        srs: data.srs,
        last: data.last
      }, null, 2);
    },

    importData: function (text) {
      try {
        var p = JSON.parse(text);
        if (!p || typeof p !== "object" || !p.chapters || typeof p.chapters !== "object") return false;
        var chapters = {};
        Object.keys(p.chapters).forEach(function (k) { chapters[k] = 1; });
        var quizzes = {};
        Object.keys(p.quizzes || {}).forEach(function (k) {
          var q = p.quizzes[k] || {};
          quizzes[k] = {
            best: Number(q.best) || 0,
            total: Number(q.total) || 0,
            attempts: Number(q.attempts) || 0,
            lastScore: Number(q.lastScore) || 0,
            firstScore: q.firstScore === null || q.firstScore === undefined ? null : (Number(q.firstScore) || 0),
            firstTotal: Number(q.firstTotal) || Number(q.total) || 0,
            review: Array.isArray(q.review) ? q.review.map(Number).filter(isFinite) : []
          };
        });
        var srs = {};
        Object.keys(p.srs || {}).forEach(function (k) {
          var x = p.srs[k] || {};
          srs[k] = { due: Number(x.due) || 0, step: Math.max(0, Math.min(4, Number(x.step) || 0)) };
        });
        var mini = {};
        Object.keys(p.mini || {}).forEach(function (k) {
          var m = p.mini[k] || {};
          mini[k] = {
            correct: Number(m.correct) || 0,
            total: Number(m.total) || 0,
            attempts: Number(m.attempts) || 0
          };
        });
        var last = p.last && typeof p.last.id === "string" && isFinite(Number(p.last.i))
          ? { id: p.last.id, i: Number(p.last.i) }
          : null;
        data = { chapters: chapters, quizzes: quizzes, mini: mini, srs: srs, last: last };
        save();
        return true;
      } catch (e) {
        return false;
      }
    },

    // последняя открытая глава: к ней ведёт кнопка «Продолжить»
    setLast: function (topic, i) { data.last = { id: topic, i: i }; save(); },

    last: function () { return data.last; },

    masteryParts: function (topic) {
      var t = window.TOPICS && window.TOPICS[topic];
      if (!t || !t.chapters.length) return { score: 0, read: 0, quiz: 0, mini: 0 };
      var read = Math.min(1, readCount(topic) / t.chapters.length);
      var q = data.quizzes[topic];
      var quiz = q && q.firstTotal ? (Number(q.firstScore) || 0) / q.firstTotal : 0;
      var m = data.mini[topic];
      var mini = m && m.total ? Math.min(1, m.correct / m.total) : 0;
      return { score: Math.round(100 * (0.4 * read + 0.4 * quiz + 0.2 * mini)), read: Math.round(read * 100), quiz: Math.round(quiz * 100), mini: Math.round(mini * 100) };
    },

    mastery: function (topic) { return window.PROGRESS.masteryParts(topic).score; },

    summary: function (topics) {
      var chapters = 0, totalChapters = 0, best = 0, total = 0;
      Object.keys(topics).forEach(function (id) {
        var t = topics[id];
        totalChapters += t.chapters.length;
        chapters += Math.min(readCount(id), t.chapters.length);
        var q = data.quizzes[id];
        if (q) { best += q.best; total += q.total; }
      });
      return { chapters: chapters, totalChapters: totalChapters, quizBest: best, quizTotal: total };
    }
  };
})();
