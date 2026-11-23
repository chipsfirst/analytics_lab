// Главная страница.
(function () {
  "use strict";
  var LAB = window.LAB;
  function esc(s) { return LAB.esc(s); }
  function topicIds() { var order = window.TOPIC_ORDER || Object.keys(window.TOPICS); return order.filter(function (id) { return !!window.TOPICS[id]; }).concat(Object.keys(window.TOPICS).filter(function (id) { return order.indexOf(id) < 0; })); }
  function resumeTarget() {
    var ids = topicIds(), all = [], l = window.PROGRESS.last(), lastIdx = -1;
    ids.forEach(function (id) {
      window.TOPICS[id].chapters.forEach(function (c, i) {
        if (l && l.id === id && Number(l.i) === i) lastIdx = all.length;
        all.push({ id: id, i: i });
      });
    });
    if (lastIdx >= 0 && !window.PROGRESS.isRead(all[lastIdx].id, all[lastIdx].i)) {
      return { id: all[lastIdx].id, i: all[lastIdx].i, allRead: false };
    }
    var start = lastIdx >= 0 ? lastIdx + 1 : 0;
    for (var k = 0; k < all.length; k++) {
      var x = all[(start + k) % all.length];
      if (!window.PROGRESS.isRead(x.id, x.i)) {
        return { id: x.id, i: x.i, allRead: false };
      }
    }
    if (all.length) return { id: all[0].id, i: all[0].i, allRead: true };
    return { id: "analytics", i: 0, allRead: false };
  }

  function continueHref() {
    var r = resumeTarget();
    return "#/theory/" + r.id + "/" + r.i;
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
      '<div class="btn-row"><a class="btn" href="' + continueHref() + '">' +
        (resumeTarget().allRead ? "Повторить" : "Продолжить") + "</a>" +
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
    var resume = resumeTarget();
    var resumeTopic = window.TOPICS[resume.id];
    var resumeChapter = resumeTopic && resumeTopic.chapters[resume.i];
    return '<div class="hero">' +
      "<h1>Лаборатория аналитики</h1>" +
      '<p class="lead">Практикум по аналитике данных: статистика, SQL, Python, BI и эксперименты.<br>' +
      "Короткая теория, тесты и тренажёры. Прогресс хранится в браузере.</p>" +
      '<div class="home-actions">' +
      '<a class="home-action primary" href="#/theory/' + resume.id + '/' + resume.i + '">' +
        "<b>" + (resume.allRead ? "Повторить с начала" : (window.PROGRESS.last() ? "Продолжить" : "Начать обучение")) + "</b><span>" +
        esc(resume.allRead ? "Все главы прочитаны" : resumeTopic.title + " · " + resumeChapter.title) + "</span></a>" +
      '<a class="home-action" href="#/path"><b>Маршрут обучения</b><span>Семь треков под цель</span></a>' +
      '<a class="home-action" href="#/trainer"><b>Тренажёры</b><span>Задачи с автопроверкой</span></a>' +
      "</div>" +
      '<p class="meta home-meta">' + topicCount + " " + plural(topicCount, "раздел", "раздела", "разделов") + " · " +
        chapterCount + " " + plural(chapterCount, "глава", "главы", "глав") +
        ' · <a href="#/textbook">Все разделы</a> · <a href="#/tools">Инструменты</a></p>' +
      roadmapBlock() +
      "</div>";
  }

  window.HOME_PAGE = { page: home };
})();
