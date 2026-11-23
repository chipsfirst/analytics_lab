// Сертификационные экзамены.
(function () {
  "use strict";
  var LAB = window.LAB, app = LAB.app;
  function shuffle(a) { a=a.slice(); for (var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }
  function quizOptions(q) { return shuffle((q.options||[]).map(function(o,i){return typeof o==="string"?{text:o,ok:i===q.correct}:{text:o.text,ok:!!o.ok};})); }
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
            '<p class="meta">Ваш ответ: ' + (a && a.picked >= 0 ? LAB.esc(q.options[a.picked].text) : "—") +
            " · Правильно: " + LAB.esc(correct ? correct.text : "—") + "</p>" +
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
            String.fromCharCode(1040 + k) + ". " + LAB.esc(o.text) + "</button>";
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
    return function () { if (timer) clearInterval(timer); };
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

  window.EXAMS = { bi: biExamPage, analyst: analystExamPage };
})();
