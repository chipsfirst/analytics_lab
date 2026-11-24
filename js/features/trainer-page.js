// Тренажёры: состояние и рендер.
(function () {
  "use strict";
  var LAB = window.LAB;
  function shuffle(a) { a=a.slice(); for (var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }
  var trainer = null;
  function newTask() {
    var gens = window.TRAINERS[trainer.id];
    trainer.task = gens[Math.floor(Math.random() * gens.length)]();
    if (trainer.task.answer.type === "choice") {
      trainer.task.answer.options = shuffle(trainer.task.answer.options);
    }
    trainer.checked = false;
    trainer.value = "";
    trainer.ok = null;
  }

  function renderTrainer() {
    var t = window.TOPICS[trainer.id];
    var task = trainer.task;
    var choice = task.answer.type === "choice";

    var html = '<p><a href="#/trainer">&larr; все тренажёры</a></p>' +
      "<h1>" + LAB.esc(t.title) + "</h1>" +
      '<div class="progress"><span>Задача ' + (trainer.total + 1) +
      " · всего типов: " + window.TRAINERS[trainer.id].length +
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
          LAB.esc(o.text) + "</button>";
      }).join("") + "</div>";
    } else {
      html += '<div class="answer-row"><label class="sr-only" for="ans">Ответ</label>' +
        '<input type="text" id="ans" inputmode="decimal" placeholder="Ваш ответ"' +
        ' value="' + LAB.esc(trainer.value) + '"' + (trainer.checked ? " disabled" : "") + ">" +
        '<button class="btn primary" id="check"' + (trainer.checked ? " disabled" : "") + ">Проверить</button></div>";
    }

    if (trainer.checked) {
      html += '<div class="verdict ' + (trainer.ok ? "ok" : "bad") + '" role="status" aria-live="polite">' +
        (trainer.ok ? "Верно" : "Неверно, правильный ответ: " + correctText(task.answer)) + "</div>" +
        '<div class="explain"><b>Решение</b>' + task.solution + "</div>" +
        '<div class="btn-row"><button class="btn primary" id="next">Следующая задача</button></div>';
    }

    html += "</div>";
    LAB.app.innerHTML = html;

    var input = document.getElementById("ans");
    var check = document.getElementById("check");

    function submit() {
      trainer.value = input ? input.value : trainer.value;
      trainer.ok = window.checkAnswer(task, trainer.value);
      trainer.checked = true;
      trainer.total++;
      if (trainer.ok) trainer.correct++;
      if (window.LEARNING) {
        window.LEARNING.log("trainer", {
          topic: trainer.id,
          skill: window.LEARNING.skillFor(trainer.id, ""),
          correct: trainer.ok ? 1 : 0,
          total: 1
        });
      }
      renderTrainer();
    }

    if (check) {
      check.addEventListener("click", submit);
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
      input.focus();
    }

    Array.prototype.forEach.call(LAB.app.querySelectorAll(".option[data-k]"), function (b) {
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
      return LAB.esc(o ? o.text : "");
    }
    return "<b>" + LAB.esc(String(a.value).replace(".", ",")) + "</b>";
  }

  window.TRAINER_PAGE = { show: function (id) {
    if (!trainer || trainer.id !== id) { trainer = { id: id, correct: 0, total: 0 }; newTask(); }
    renderTrainer();
  } };
})();
