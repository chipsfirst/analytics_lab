// Тренажёр промптов.
(function () {
  "use strict";
  var LAB = window.LAB;
  function promptLabPage() {
    return "<h1>Тренажёр промптов</h1>" +
      '<p class="lead">' + window.PROMPT_TASKS.length + ' рабочих ситуаций. Напишите свой промпт, затем откройте разбор и проверьте его по критериям. ' +
      "Это не автопроверка: хороший промпт зависит от задачи и контекста.</p>" +
      '<div class="grid">' + window.PROMPT_TASKS.map(function (t, i) {
        return '<article class="card prompt-card" data-prompt="' + i + '"><p class="meta">Задача ' + (i + 1) + "</p><h3>" + LAB.esc(t[0]) + "</h3>" +
          "<p>" + LAB.esc(t[1]) + "</p>" +
          '<label class="sr-only" for="prompt-' + i + '">Ваш промпт</label>' +
          '<textarea id="prompt-' + i + '" rows="4" placeholder="Напишите промпт…"></textarea>' +
          '<div class="btn-row"><button class="btn small" data-prompt-show="' + i + '">Показать разбор</button></div>' +
          '<div class="prompt-review" data-prompt-review="' + i + '" hidden><p><b>Каркас:</b> ' + LAB.esc(t[2]) + "</p><ul>" +
          t[3].map(function (x) { return "<li>" + LAB.esc(x) + "</li>"; }).join("") + "</ul></div></article>";
      }).join("") + "</div>";
  }

  function bindPromptLab() {
    var KEY = "analytics-lab-prompts-v1";
    var drafts = {};
    try { drafts = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
    Array.prototype.forEach.call(document.querySelectorAll(".prompt-card"), function (card) {
      var i = card.getAttribute("data-prompt");
      var ta = document.getElementById("prompt-" + i);
      if (ta) {
        ta.value = drafts[i] || "";
        ta.addEventListener("input", function () {
          drafts[i] = ta.value;
          try { localStorage.setItem(KEY, JSON.stringify(drafts)); } catch (e) {}
        });
      }
      var b = card.querySelector("[data-prompt-show]");
      if (b) b.addEventListener("click", function () {
        var rev = card.querySelector("[data-prompt-review]");
        if (rev) rev.hidden = !rev.hidden;
      });
    });
  }



  window.PROMPT_LAB = { page: promptLabPage, bind: bindPromptLab };
})();
