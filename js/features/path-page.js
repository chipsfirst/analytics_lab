// Маршруты обучения.
(function () {
  "use strict";
  var LAB = window.LAB;
  function pathPage() {
    var tracks = window.TRACKS || [];
    return "<h1>Маршрут обучения</h1>" +
      '<p class="lead">Семь маршрутов: с чего начать, как укрепить статистику, перейти к Python, собрать данные и дашборд, разобраться с экспериментами, моделями и рабочим контуром аналитики. ' +
      "Прогресс считается по прочитанным главам, финальная практика — отдельным шагом.</p>" +
      '<div class="grid">' + tracks.map(function (t) {
        var total = t.steps.length;
        var done = t.steps.filter(function (s) { return window.PROGRESS.isRead(s[0], s[1]); }).length;
        var allDone = total > 0 && done === total;
        var next = t.steps.filter(function (s) { return !window.PROGRESS.isRead(s[0], s[1]); })[0] || t.steps[0];
        var href = allDone && t.final && t.final.length ? t.final[0].href : "#/theory/" + next[0] + "/" + next[1];
        var label = allDone && t.final && t.final.length ? "К практике" : (done ? "Продолжить" : "Начать");
        var steps = t.steps.map(function (s) {
          var c = window.TOPICS[s[0]].chapters[s[1]];
          var read = window.PROGRESS.isRead(s[0], s[1]);
          return '<li' + (read ? ' class="read"' : "") + ">" +
            '<a href="#/theory/' + s[0] + "/" + s[1] + '">' + LAB.esc(c.title) + "</a></li>";
        }).join("");
        var finals = (t.final || []).map(function (f) {
          return '<li class="practice"><a href="' + f.href + '">' + LAB.esc(f.title) + "</a>" +
            '<span class="meta"> ' + LAB.esc(f.note) + "</span></li>";
        }).join("");
        return '<div class="card"><h3>' + LAB.esc(t.title) + "</h3>" +
          "<p>" + LAB.esc(t.tag) + "</p>" +
          '<p class="meta">Пройдено: ' + done + " из " + total + "</p>" +
          '<div class="track-bar"><div style="width:' + Math.round(done / total * 100) + '%"></div></div>' +
          '<div class="links"><a class="btn primary" href="' + href + '">' + label + "</a></div>" +
          '<ol class="track-steps">' + steps + finals + "</ol></div>";
      }).join("") + "</div>";
  }

  window.PATH_PAGE = { page: pathPage };
})();
