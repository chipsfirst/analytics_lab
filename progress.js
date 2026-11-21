// Прогресс: прочитанные главы и результаты тестов. Хранится в localStorage.
// При недоступном хранилище (file:// в некоторых браузерах, приватный режим)
// модуль молча работает в памяти — сайт не ломается.

(function () {
  "use strict";

  var KEY = "analytics-lab-progress-v1";

  function empty() { return { chapters: {}, quizzes: {} }; }

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return empty();
      var p = JSON.parse(raw);
      return { chapters: p.chapters || {}, quizzes: p.quizzes || {} };
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

  window.PROGRESS = {
    isRead: function (topic, i) { return !!data.chapters[topic + ":" + i]; },

    setRead: function (topic, i, v) {
      var k = topic + ":" + i;
      if (v) data.chapters[k] = 1; else delete data.chapters[k];
      save();
    },

    readCount: readCount,

    quiz: function (topic) { return data.quizzes[topic] || null; },

    // answers: [{ idx, ok }], idx — номер вопроса в банке раздела
    recordQuiz: function (topic, answers) {
      var cur = data.quizzes[topic] || { best: 0, total: 0, attempts: 0, review: [] };
      var score = answers.filter(function (a) { return a.ok; }).length;

      var review = {};
      cur.review.forEach(function (i) { review[i] = 1; });
      answers.forEach(function (a) { if (a.ok) delete review[a.idx]; else review[a.idx] = 1; });

      data.quizzes[topic] = {
        best: Math.max(cur.best, score),
        total: answers.length,
        attempts: cur.attempts + 1,
        lastScore: score,
        review: Object.keys(review).map(Number).sort(function (a, b) { return a - b; })
      };
      save();
      return data.quizzes[topic];
    },

    clear: function () { data = empty(); save(); },

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
