// Карта навыков: где прочитано, где проверено и что подтянуть.
(function () {
  "use strict";
  var LAB = window.LAB;

  function page() {
    var list = window.LEARNING ? window.LEARNING.skills() : [];
    var started = list.some(function (s) { return s.read || s.total; });
    return "<h1>Карта навыков</h1>" +
      '<p class="lead">Навыки считаются по прочитанным главам, тестам, тренажёрам и промптам. ' +
      "Сверху — то, что проседает сильнее: с этого и стоит начать.</p>" +
      (started ? "" : '<div class="note"><b>Пока пусто</b>Пройдите тест или отметьте главу прочитанной — карта начнёт заполняться.</div>') +
      '<div class="grid skills-grid">' + list.map(function (s) {
        var weak = s.percent < 60;
        return '<div class="card skill-card' + (weak ? " weak" : "") + '">' +
          '<div class="skill-head"><h3>' + LAB.esc(s.name) + "</h3><b>" + s.percent + "%</b></div>" +
          '<div class="skill-bar"><i style="width:' + s.percent + '%"></i></div>' +
          '<p class="meta">Главы: ' + s.read + " из " + s.chapters +
          (s.total ? " · тесты: " + s.correct + " из " + s.total : " · тестов пока нет") + "</p>" +
          '<a class="btn small" href="' + s.href + '">' + (weak ? "Подтянуть" : "Открыть") + "</a></div>";
      }).join("") + "</div>";
  }

  window.SKILLS_PAGE = { page: page };
})();
