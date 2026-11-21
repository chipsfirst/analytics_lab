(function () {
  "use strict";

  var app = document.getElementById("app");
  var nav = document.getElementById("nav");
  var cleanup = null;
  var quiz = null;
  var trainer = null;

  var NAV = [
    ["#/", "Главная"],
    ["#/theory", "Теория"],
    ["#/quiz", "Тесты"],
    ["#/trainer", "Тренажёры"],
    ["#/games", "Игры"],
    ["#/demos", "Демо"]
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

  function topicIds() { return Object.keys(window.TOPICS); }

  function path() {
    return location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  }

  function renderNav() {
    var cur = "#/" + path().join("/");
    nav.innerHTML = NAV.map(function (n) {
      var active = n[0] === "#/" ? cur === "#/" : cur.indexOf(n[0]) === 0;
      return '<a href="' + n[0] + '"' + (active ? ' class="active"' : "") + ">" + n[1] + "</a>";
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

  function topicCard(id) {
    var t = window.TOPICS[id];
    return '<div class="card">' +
      "<h3>" + esc(t.title) + "</h3>" +
      "<p>" + esc(t.tag) + "</p>" +
      progressLine(id) +
      '<div class="links">' +
        '<a class="btn" href="#/theory/' + id + '">Учебник</a>' +
        '<a class="btn" href="#/quiz/' + id + '">Тест</a>' +
        '<a class="btn" href="#/trainer/' + id + '">Тренажёр</a>' +
      "</div></div>";
  }

  function progressBlock() {
    var s = window.PROGRESS.summary(window.TOPICS);
    if (!s.chapters && !s.quizTotal) return "";
    return '<div class="card progress-card">' +
      '<div class="stats">' +
      '<div class="stat"><div class="k">глав прочитано</div><div class="v">' + s.chapters + " / " + s.totalChapters + "</div></div>" +
      '<div class="stat"><div class="k">лучшие ответы в тестах</div><div class="v">' +
        s.quizBest + " / " + s.quizTotal + "</div></div>" +
      "</div>" +
      '<div class="btn-row"><a class="btn" href="#/theory">Продолжить</a>' +
      '<button class="btn" id="resetProgress">Сбросить прогресс</button></div></div>';
  }

  function home() {
    return '<div class="hero">' +
      "<h1>Аналитика, статистика, теория игр и вероятность</h1>" +
      '<p class="lead">Короткий учебник, тесты с разбором, бесконечные тренажёры на расчёт, ' +
      "интерактивные демонстрации и игры на интуицию. Без регистрации: прогресс хранится в браузере.</p>" +
      '<div class="btn-row"><a class="btn primary" href="#/theory">Начать с теории</a>' +
      '<a class="btn" href="#/trainer">Сразу к тренажёрам</a></div>' +
      "</div>" +
      progressBlock() +
      "<h2>Разделы</h2>" +
      '<div class="grid">' + topicIds().map(topicCard).join("") + "</div>" +
      "<h2>Демонстрации</h2>" +
      '<div class="grid">' + Object.keys(window.DEMOS).map(function (id) {
        var d = window.DEMOS[id];
        return '<div class="card"><h3>' + esc(d.title) + "</h3><p>" + esc(d.tag) + "</p>" +
          '<div class="links"><a class="btn" href="#/demos/' + id + '">Открыть</a></div></div>';
      }).join("") + "</div>" +
      "<h2>Игры</h2>" +
      '<div class="grid">' + Object.keys(window.GAMES).map(function (id) {
        var g = window.GAMES[id];
        return '<div class="card"><h3>' + esc(g.title) + "</h3><p>" + esc(g.tag) + "</p>" +
          '<div class="links"><a class="btn" href="#/games/' + id + '">Играть</a></div></div>';
      }).join("") + "</div>" +
      '<div class="note"><b>Практика SQL</b>В разделе SQL есть <a href="#/sandbox">песочница</a>: ' +
      "настоящая база в браузере, можно писать любые запросы.</div>";
  }

  function listPage(kind, title, lead, label) {
    return "<h1>" + escapeHtml(title) + "</h1><p class=\"lead\">" + lead + "</p>" +
      '<div class="grid" style="margin-top:20px">' + topicIds().map(function (id) {
        var t = window.TOPICS[id];
        return '<div class="card"><h3>' + esc(t.title) + "</h3><p>" + esc(t.tag) + "</p>" +
          progressLine(id) +
          '<div class="links"><a class="btn primary" href="#/' + kind + "/" + id + '">' + label + "</a></div></div>";
      }).join("") + "</div>";
  }

  // заголовки страниц задаются в коде, но экранируем на всякий случай
  function escapeHtml(s) { return esc(s); }

  function theory(id, chapterIdx) {
    var t = window.TOPICS[id];
    var toc = t.chapters.map(function (c, i) {
      return '<li' + (window.PROGRESS.isRead(id, i) ? ' class="read"' : "") + ">" +
        '<a href="#/theory/' + id + "/" + i + '" data-ch="' + i + '">' + esc(c.title) + "</a></li>";
    }).join("");

    var body = t.chapters.map(function (c, i) {
      var read = window.PROGRESS.isRead(id, i);
      return '<section id="ch-' + i + '">' +
        '<div class="ch-head"><h2>' + (i + 1) + ". " + esc(c.title) + "</h2>" +
        '<button class="btn small' + (read ? " is-read" : "") + '" data-read="' + i + '" aria-pressed="' + read + '">' +
        (read ? "Прочитано" : "Отметить прочитанной") + "</button></div>" +
        c.html + "</section>";
    }).join("");

    return '<p><a href="#/theory">&larr; все разделы</a></p>' +
      "<h1>" + esc(t.title) + "</h1><p class=\"lead\">" + esc(t.lead) + "</p>" +
      '<div class="reader" style="margin-top:28px"><aside class="toc"><b>Главы</b><ol>' + toc + "</ol>" +
      '<div class="btn-row"><a class="btn" href="#/quiz/' + id + '">Тест</a>' +
      '<a class="btn" href="#/trainer/' + id + '">Тренажёр</a></div>' +
      (id === "sql" ? '<div class="btn-row"><a class="btn" href="#/sandbox">Песочница SQL</a></div>' : "") +
      "</aside><article>" + body + "</article></div>";
  }

  function bindChapters() {
    var p = path();

    if (p[0] === "theory" && p[1] && p[2] && /^\d+$/.test(p[2])) {
      var target = document.getElementById("ch-" + p[2]);
      if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
    }

    Array.prototype.forEach.call(app.querySelectorAll("a[data-ch]"), function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var i = a.getAttribute("data-ch");
        var s = document.getElementById("ch-" + i);
        if (s) s.scrollIntoView();
        try { history.replaceState(null, "", "#/theory/" + p[1] + "/" + i); } catch (err) {}
      });
    });

    Array.prototype.forEach.call(app.querySelectorAll("button[data-read]"), function (b) {
      b.addEventListener("click", function () {
        var i = Number(b.getAttribute("data-read"));
        var now = !window.PROGRESS.isRead(p[1], i);
        window.PROGRESS.setRead(p[1], i, now);
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
          options: shuffle(q.options.map(function (text, i) {
            return { text: text, ok: i === q.correct };
          }))
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
        '<div class="card center"><h2 style="margin-top:8px">' + esc(t.title) +
        (quiz.reviewMode ? " · работа над ошибками" : "") + "</h2>" +
        '<p class="lead" style="margin:0 auto 12px">Правильных ответов: <b>' + quiz.score + " из " + quiz.qs.length +
        "</b> (" + pct + "%)</p>" +
        '<p class="meta">Лучший результат: ' + stats.best + " из " + stats.total +
        (isRecord && !quiz.reviewMode ? " — это рекорд" : "") + "</p>" +
        '<div class="btn-row" style="justify-content:center">' +
        (review.length ? '<button class="btn primary" id="review">Разобрать ошибки (' + review.length + ")</button>" : "") +
        '<button class="btn" id="again">Пройти ещё раз</button>' +
        '<a class="btn" href="#/theory/' + quiz.id + '">К теории</a>' +
        '<a class="btn" href="#/trainer/' + quiz.id + '">К тренажёру</a></div></div>';

      var reuse = document.getElementById("again");
      if (reuse) reuse.addEventListener("click", function () { startQuiz(quiz.id); renderQuiz(); });

      var rev = document.getElementById("review");
      if (rev) rev.addEventListener("click", function () { startQuiz(quiz.id, review); renderQuiz(); });
      return;
    }

    var q = quiz.qs[quiz.i];
    var html = '<p><a href="#/quiz">&larr; все тесты</a></p>' +
      "<h1>" + esc(t.title) + (quiz.reviewMode ? " · ошибки" : "") + "</h1>" +
      '<div class="progress"><span>Вопрос ' + (quiz.i + 1) + " из " + quiz.qs.length +
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
      });
    });

    var next = document.getElementById("next");
    if (next) next.addEventListener("click", function () {
      quiz.i++; quiz.picked = -1; renderQuiz();
    });
  }

  // ---------- тренажёры ----------

  function newTask() {
    var gens = window.TRAINERS[trainer.id];
    trainer.task = gens[Math.floor(Math.random() * gens.length)]();
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
      "</span><span>Верно: " + trainer.correct + " из " + trainer.total + "</span></div>" +
      '<div class="card">' + task.prompt;

    if (choice) {
      html += '<div class="options" style="margin-top:16px">' + task.answer.options.map(function (o, k) {
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
      '<div class="grid" style="margin-top:20px">' + Object.keys(window.GAMES).map(function (id) {
        var g = window.GAMES[id];
        return '<div class="card"><h3>' + esc(g.title) + "</h3><p>" + esc(g.tag) + "</p>" +
          '<div class="links"><a class="btn primary" href="#/games/' + id + '">Играть</a></div></div>';
      }).join("") + "</div>";
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
      "как меняется результат.</p>" +
      '<div class="grid" style="margin-top:20px">' + Object.keys(window.DEMOS).map(function (id) {
        var d = window.DEMOS[id];
        return '<div class="card"><h3>' + esc(d.title) + "</h3><p>" + esc(d.tag) + "</p>" +
          '<div class="links"><a class="btn primary" href="#/demos/' + id + '">Открыть</a></div></div>';
      }).join("") + "</div>";
  }

  function sandboxPage() {
    app.innerHTML = '<p><a href="#/theory/sql">&larr; к теории SQL</a></p>' +
      "<h1>Песочница SQL</h1><p class=\"lead\" style=\"margin-bottom:20px\">Настоящая база в браузере: " +
      "пишите любой запрос, схема — в подсказке ниже.</p><div id=\"sandbox\"></div>";
    var fn = window.SANDBOX.mount(document.getElementById("sandbox"));
    if (typeof fn === "function") cleanup = fn;
    return null;
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
      box.innerHTML = hits.map(function (h) {
        return '<a class="result" href="' + h.entry.href + '">' +
          '<span class="chip">' + esc(h.entry.topicTitle) + " · " + h.entry.kind + "</span>" +
          "<b>" + esc(h.entry.title) + "</b>" +
          '<span class="result-text">' + esc(h.snippet) + "</span></a>";
      }).join("");
    }

    input.addEventListener("input", function () {
      history.replaceState(null, "", input.value.trim() ? "#/search/" + encodeURIComponent(input.value.trim()) : "#/search");
      draw(input.value);
    });
    draw(initial);
    input.focus();
  }

  // ---------- роутер ----------

  function render() {
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    var p = path();
    renderNav();
    window.scrollTo(0, 0);
    var html = null;
    var after = null;

    if (p.length === 0) html = home();
    else if (p[0] === "theory" && p[1] && window.TOPICS[p[1]]) html = theory(p[1], p[2]);
    else if (p[0] === "theory") html = listPage("theory", "Теория", "Все разделы: формулы, примеры и разборы.", "Открыть раздел");
    else if (p[0] === "quiz" && p[1] && window.TOPICS[p[1]]) {
      if (!quiz || quiz.id !== p[1]) startQuiz(p[1]);
      renderQuiz();
      return;
    } else if (p[0] === "quiz") html = listPage("quiz", "Тесты", "Восемь случайных вопросов из банка раздела, с разбором каждого ответа.", "Пройти тест");
    else if (p[0] === "trainer" && p[1] && window.TOPICS[p[1]]) {
      if (!trainer || trainer.id !== p[1]) {
        trainer = { id: p[1], correct: 0, total: 0 };
        newTask();
      }
      renderTrainer();
      return;
    } else if (p[0] === "trainer") html = listPage("trainer", "Тренажёры", "Задачи генерируются заново: считать придётся каждый раз, а не запоминать ответы.", "Тренироваться");
    else if (p[0] === "games" && p[1]) return mountPage(window.GAMES, p[1], "game", "#/games", "все игры", "Игра");
    else if (p[0] === "games") html = gamesList();
    else if (p[0] === "demos" && p[1]) return mountPage(window.DEMOS, p[1], "demo", "#/demos", "все демонстрации", "Демонстрация");
    else if (p[0] === "demos") html = demosList();
    else if (p[0] === "sandbox") return sandboxPage();
    else if (p[0] === "search") { html = searchPage(p[1]); after = function () { bindSearch(p[1]); }; }
    else html = "<h1>Страница не найдена</h1><p><a href=\"#/\">На главную</a></p>";

    if (html !== null) {
      app.innerHTML = html;
      bindChapters();
      var reset = document.getElementById("resetProgress");
      if (reset) reset.addEventListener("click", function () {
        if (confirm("Сбросить прочитанные главы и результаты тестов?")) {
          window.PROGRESS.clear();
          searchIndex = null;
          render();
        }
      });
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

  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  window.addEventListener("hashchange", render);
  render();
})();
