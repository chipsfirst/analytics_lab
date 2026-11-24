// Тесты: состояние и рендер.
(function () {
  "use strict";
  var LAB = window.LAB;
  function shuffle(a) { a=a.slice(); for (var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }
  function quizOptions(q) { return shuffle((q.options||[]).map(function(o,i){return typeof o==="string"?{text:o,ok:i===q.correct}:{text:o.text,ok:!!o.ok};})); }
  var quiz = null;
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

      LAB.app.innerHTML = '<p><a href="#/quiz">&larr; все тесты</a></p>' +
        '<div class="card center"><h2 class="quiz-head">' + LAB.esc(t.title) +
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

      LAB.setKeys(function (e) {
        if (e.key === "Enter") { var a = document.getElementById("again"); if (a) a.click(); }
      });
      return;
    }

    var q = quiz.qs[quiz.i];
    var html = '<p><a href="#/quiz">&larr; все тесты</a></p>' +
      "<h1>" + LAB.esc(t.title) + (quiz.reviewMode ? " · ошибки" : "") + "</h1>" +
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
          String.fromCharCode(1040 + k) + ". " + LAB.esc(o.text) + "</button>";
      }).join("") + "</div>";

    if (quiz.picked >= 0) {
      var chosen = q.options[quiz.picked];
      var right = q.options.filter(function (o) { return o.ok; })[0];
      var why = chosen.ok ? "" : '<p class="meta"><b>Почему не «' + LAB.esc(chosen.text) +
        '»:</b> правильный вариант — «' + LAB.esc(right ? right.text : "") + "».</p>";
      html += '<div class="explain" aria-live="polite"><b>' + (chosen.ok ? "Верно" : "Неверно") +
        "</b>" + why + "<p>" + q.explain + "</p></div>" +
        '<div class="btn-row"><button class="btn primary" id="next">' +
        (quiz.i + 1 < quiz.qs.length ? "Следующий вопрос" : "Результат") + "</button></div>";
    }

    LAB.app.innerHTML = html;

    Array.prototype.forEach.call(LAB.app.querySelectorAll(".option"), function (b) {
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
      var first = LAB.app.querySelector(".option");
      if (first) first.focus();
    });

    LAB.setKeys(function (e) {
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
        var b = LAB.app.querySelector('.option[data-k="' + (k - 1) + '"]');
        if (b) { e.preventDefault(); b.click(); }
      }
    });
  }

  // ---------- тренажёры ----------

  window.QUIZ_PAGE = { show: function (id) { if (!quiz || quiz.id !== id) startQuiz(id); renderQuiz(); } };
})();
