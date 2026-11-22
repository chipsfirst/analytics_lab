(function () {
  "use strict";

  var app = document.getElementById("app");
  var nav = document.getElementById("nav");
  var cleanup = null;
  var quiz = null;
  var trainer = null;
  var keyHandler = null;

  // один обработчик клавиатуры на всю страницу: тесты меняют карточку целиком
  function setKeys(fn) {
    if (keyHandler) document.removeEventListener("keydown", keyHandler);
    keyHandler = fn;
    if (fn) document.addEventListener("keydown", fn);
  }

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
    var links = cta
      ? '<a class="btn primary" href="#/' + cta.kind + "/" + id + '">' + esc(cta.label) + "</a>"
      : '<a class="btn" href="#/theory/' + id + '">Учебник</a>' +
        '<a class="btn" href="#/quiz/' + id + '">Тест</a>' +
        '<a class="btn" href="#/trainer/' + id + '">Тренажёр</a>';
    return '<div class="card"' + (linkable ? ' data-href="#/theory/' + id + '"' : "") + ">" +
      "<h3>" + esc(t.title) + "</h3>" +
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
    if (!s.chapters && !s.quizTotal) return "";
    return '<div class="card progress-card">' +
      '<div class="stats">' +
      '<div class="stat"><div class="k">глав прочитано</div><div class="v">' + s.chapters + " / " + s.totalChapters + "</div></div>" +
      '<div class="stat"><div class="k">лучшие ответы в тестах</div><div class="v">' +
        s.quizBest + " / " + s.quizTotal + "</div></div>" +
      "</div>" +
      '<div class="btn-row"><a class="btn" href="' + continueHref() + '">Продолжить</a>' +
      '<button class="btn" id="resetProgress">Сбросить прогресс</button></div></div>';
  }

  function home() {
    return '<div class="hero">' +
      "<h1>Аналитика, статистика, теория игр и вероятность</h1>" +
      '<p class="lead">Короткий учебник, тесты с разбором, бесконечные тренажёры на расчёт, ' +
      "интерактивные демонстрации и игры на интуицию. Без регистрации: прогресс хранится в браузере.</p>" +
      '<div class="btn-row"><a class="btn primary" href="#/theory">Начать с теории</a>' +
      '<a class="btn" href="#/path">Маршрут обучения</a>' +
      '<a class="btn" href="#/trainer">Сразу к тренажёрам</a></div>' +
      "</div>" +
      progressBlock() +
      "<h2>Разделы</h2>" +
      '<div class="grid">' + topicIds().map(function (id) { return topicCard(id, null, true); }).join("") + "</div>" +
      "<h2>Демонстрации</h2>" +
      entryGrid(window.DEMOS, "#/demos/", "Открыть") +
      "<h2>Игры</h2>" +
      entryGrid(window.GAMES, "#/games/", "Играть") +
      '<div class="note"><b>Практика SQL</b>В разделе SQL есть <a href="#/sandbox">песочница</a>: ' +
      "настоящая база в браузере, можно писать любые запросы.</div>";
  }

  function listPage(kind, title, lead, label) {
    return "<h1>" + esc(title) + "</h1><p class=\"lead\">" + lead + "</p>" +
      '<div class="grid">' + topicIds().map(function (id) {
        return topicCard(id, { kind: kind, label: label });
      }).join("") + "</div>";
  }

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
      '<div class="reader reader-top"><aside class="toc"><b>Главы</b><ol>' + toc + "</ol>" +
      '<div class="btn-row"><a class="btn" href="#/quiz/' + id + '">Тест</a>' +
      '<a class="btn" href="#/trainer/' + id + '">Тренажёр</a></div>' +
      (id === "sql" ? '<div class="btn-row"><a class="btn" href="#/sandbox">Песочница SQL</a></div>' : "") +
      (id === "python" ? '<div class="btn-row"><a class="btn" href="#/pysandbox">Песочница Python</a></div>' : "") +
      (id === "statistics" ? '<div class="btn-row"><a class="btn" href="#/cheatsheet">Какой критерий выбрать</a></div>' : "") +
      "</aside><article>" + body + "</article></div>";
  }

  function wrapTables(root) {
    Array.prototype.forEach.call(root.querySelectorAll("article table"), function (t) {
      if (t.parentNode.classList.contains("table-wrap")) return;
      var box = document.createElement("div");
      box.className = "table-wrap";
      t.parentNode.insertBefore(box, t);
      box.appendChild(t);
    });
  }

  function bindChapters() {
    var p = path();
    wrapTables(app);

    if (p[0] === "theory" && p[1] && p[2] && /^\d+$/.test(p[2])) {
      var target = document.getElementById("ch-" + p[2]);
      if (target) {
        window.PROGRESS.setLast(p[1], Number(p[2]));
        target.scrollIntoView({ behavior: "instant", block: "start" });
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
        '<div class="card center"><h2 class="quiz-head">' + esc(t.title) +
        (quiz.reviewMode ? " · работа над ошибками" : "") + "</h2>" +
        '<p class="lead center">Правильных ответов: <b>' + quiz.score + " из " + quiz.qs.length +
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

  function pathPage() {
    var tracks = window.TRACKS || [];
    return "<h1>Маршрут обучения</h1>" +
      '<p class="lead">Три последовательности: с чего начать, что читать перед экспериментами и как перейти к Python. ' +
      "Прогресс считается по прочитанным главам.</p>" +
      '<div class="grid">' + tracks.map(function (t) {
        var total = t.steps.length;
        var done = t.steps.filter(function (s) { return window.PROGRESS.isRead(s[0], s[1]); }).length;
        var next = t.steps.filter(function (s) { return !window.PROGRESS.isRead(s[0], s[1]); })[0] || t.steps[0];
        var href = "#/theory/" + next[0] + "/" + next[1];
        var steps = t.steps.map(function (s) {
          var c = window.TOPICS[s[0]].chapters[s[1]];
          var read = window.PROGRESS.isRead(s[0], s[1]);
          return '<li' + (read ? ' class="read"' : "") + ">" +
            '<a href="#/theory/' + s[0] + "/" + s[1] + '">' + esc(c.title) + "</a></li>";
        }).join("");
        return '<div class="card"><h3>' + esc(t.title) + "</h3>" +
          "<p>" + esc(t.tag) + "</p>" +
          '<p class="meta">Пройдено: ' + done + " из " + total + "</p>" +
          '<div class="track-bar"><div style="width:' + Math.round(done / total * 100) + '%"></div></div>' +
          '<div class="links"><a class="btn primary" href="' + href + '">' +
          (done ? "Продолжить" : "Начать") + "</a></div>" +
          '<ol class="track-steps">' + steps + "</ol></div>";
      }).join("") + "</div>";
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

  // Каждый маршрут описывает результат: html, побочный рендер или монтирование.
  function routeFor(p) {
    var seg = p[0], id = p[1];

    if (!seg) return { html: home() };

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
    if (seg === "sandbox") return { mount: sandboxPage };
    if (seg === "pysandbox") return { mount: pySandboxPage };
    if (seg === "path") return { html: pathPage() };
    if (seg === "cheatsheet") return { html: cheatSheetPage() };
    if (seg === "search") return { html: searchPage(id), after: function () { bindSearch(id); } };
    return { html: '<h1>Страница не найдена</h1><p><a href="#/">На главную</a></p>' };
  }

  function render() {
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    setKeys(null);
    var p = path();
    renderNav();
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

  var themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    var drawTheme = function () {
      themeBtn.textContent = document.documentElement.dataset.theme === "dark" ? "Светлая" : "Тёмная";
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

  window.addEventListener("hashchange", render);
  render();
})();
