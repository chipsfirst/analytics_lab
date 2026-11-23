// Повторение ошибок.
(function () {
  "use strict";
  var LAB = window.LAB;
  function shuffle(a) { a=a.slice(); for (var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }
  function quizOptions(q) { return shuffle((q.options||[]).map(function(o,i){return typeof o==="string"?{text:o,ok:i===q.correct}:{text:o.text,ok:!!o.ok};})); }
  function reviewPage() {
    return '<h1>Повторение ошибок</h1>' +
      '<p class="lead">Вопросы, в которых вы ошибались в тестах и мини-тестах, возвращаются по интервальному ' +
      "повторению. Ответили верно \u2014 интервал растёт; ошиблись \u2014 вопрос можно повторить сразу.</p>" +
      '<div id="reviewList"></div>';
  }

  function bindReview() {
    var list = document.getElementById("reviewList");
    var due = window.PROGRESS.dueReviews();
    if (!due.length) {
      list.innerHTML = '<p class="meta">Повторять пока нечего. Ответите неверно в тесте \u2014 ' +
        'вопрос появится здесь для повторения.</p><p><a class="btn" href="#/quiz">Пройти тест</a></p>';
      return;
    }
    list.innerHTML = due.map(function (r) {
      var t = window.TOPICS[r.topic], q = t && t.quiz && t.quiz[r.idx];
      if (!t || !q) return "";
      var opts = quizOptions(q);
      return '<div class="card review-item" data-topic="' + r.topic + '" data-idx="' + r.idx + '">' +
        '<p class="meta">' + LAB.esc(t.title) + "</p>" +
        "<p><b>" + LAB.esc(q.q) + "</b></p>" +
        '<div class="options">' + opts.map(function (o, k) {
          return '<button class="option" data-k="' + k + '">' + String.fromCharCode(1040 + k) + ". " + LAB.esc(o.text) + "</button>";
        }).join("") +
        '</div><div class="explain" aria-live="polite" hidden></div></div>';
    }).join("") + '<p class="meta">Показываю вопросы из всех разделов.</p>';
    Array.prototype.forEach.call(list.querySelectorAll(".review-item"), function (it) {
      var topic = it.getAttribute("data-topic");
      var idx = Number(it.getAttribute("data-idx"));
      var q = window.TOPICS[topic].quiz[idx];
      var opts = quizOptions(q);
      Array.prototype.forEach.call(it.querySelectorAll(".option"), function (opt) {
        opt.addEventListener("click", function () {
          if (it.getAttribute("data-done")) return;
          it.setAttribute("data-done", "1");
          var k = Number(opt.getAttribute("data-k"));
          var ok = opts[k].ok;
          window.PROGRESS.srsAnswer(topic, idx, ok);
          Array.prototype.forEach.call(it.querySelectorAll(".option"), function (o, oi) {
            o.disabled = true;
            if (opts[oi].ok) o.classList.add("right");
            else if (oi === k) o.classList.add("wrong");
          });
          var ex = it.querySelector(".explain");
          ex.hidden = false;
          ex.innerHTML = "<b>" + (ok ? "Верно" : "Неверно") + "</b> " + q.explain;
        });
      });
    });
  }

  window.REVIEW_PAGE = { page: reviewPage, bind: bindReview };
})();
