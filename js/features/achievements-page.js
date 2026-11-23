// Страница достижений: использует общий контекст LAB.
(function () {
  "use strict";
  var LAB = window.LAB;
  function achievementsPage() {
    var list = window.ACHIEVEMENTS.list();
    var done = list.filter(function (a) { return a.done; }).length;
    var legacy = window.PROGRESS.hasLegacyQuizzes();
    return "<h1>Достижения</h1>" +
      '<p class="lead">Маленькие победы, которые складываются в привычку. Достижения за тесты выдаются за первую попытку, а не за лучший результат после перепрохождений.</p>' +
      '<p class="meta">Открыто: ' + done + " из " + list.length + "</p>" +
      (legacy ? '<div class="card"><h3>Старые тесты</h3><p>Некоторые тесты пройдены до появления достижений за первую попытку. ' +
        "Их результаты не учитываются. Можно сбросить историю тестов: уже открытые достижения останутся, а тесты начнутся заново.</p>" +
        '<button class="btn" id="resetQuizHistory">Сбросить историю тестов</button></div>' : "") +
      '<div class="grid">' + list.map(function (a) {
        var pct = Math.round(a.value / a.target * 100);
        return '<div class="card achievement-card ' + (a.done ? "done" : "locked") + '">' +
          '<div class="ach-head"><span class="ach-icon" style="color:' + a.tone + ';background:' + a.tone + '1a">' + LAB.icon(a.icon) + "</span><h3>" + LAB.esc(a.title) + "</h3></div>" +
          "<p>" + LAB.esc(a.text) + "</p>" +
          '<div class="ach-bar"><div style="width:' + pct + '%"></div></div>' +
          '<p class="meta">' + (a.done ? "Открыто" + (a.at ? " " + new Date(a.at).toLocaleDateString("ru-RU") : "") :
            "Прогресс: " + a.value + " из " + a.target) + "</p></div>";
      }).join("") + "</div>";
  }

  function bindAchievements() {
    var btn = document.getElementById("resetQuizHistory");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (!confirm("Сбросить историю тестов? Лучшие результаты и повторения будут удалены, открытые достижения останутся.")) return;
      window.PROGRESS.clearQuizHistory();
      LAB.render();
    });
  }

  window.ACHIEVEMENTS_PAGE = { page: achievementsPage, bind: bindAchievements };
})();
