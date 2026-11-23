// Страница слабых тем и экспорт конспекта.
(function () {
  "use strict";
  var LAB = window.LAB;
  function progressPage() {
    var ids = Object.keys(window.TOPICS);
    var totalRead = ids.reduce(function (n, id) { return n + window.PROGRESS.readCount(id); }, 0);
    var totalCh = ids.reduce(function (n, id) { return n + window.TOPICS[id].chapters.length; }, 0);
    var due = window.PROGRESS.dueReviews();
    var weak = 0;
    var cards = ids.map(function (id) {
      var t = window.TOPICS[id];
      var read = Math.min(window.PROGRESS.readCount(id), t.chapters.length);
      var q = window.PROGRESS.quiz(id);
      var m = window.PROGRESS.mini(id);
      var last = q ? (q.lastScore == null ? q.best : q.lastScore) : null;
      var qTotal = q ? q.total : t.quiz.length;
      var weakTopic = (last !== null && qTotal && last / qTotal < 0.6) ||
        (m && m.total && m.correct / m.total < 0.6);
      if (weakTopic) weak++;
      var dueCount = due.filter(function (r) { return r.topic === id; }).length;
      var next = 0;
      while (next < t.chapters.length && window.PROGRESS.isRead(id, next)) next++;
      var href = next < t.chapters.length ? "#/theory/" + id + "/" + next : "#/quiz/" + id;
      var status = weakTopic ? "слабое место" : dueCount ? "пора повторить" : "в норме";
      return '<div class="card progress-topic' + (weakTopic ? " weak" : "") + '"><p class="meta">' + LAB.esc(t.title) +
        ' · <b>' + status + '</b></p><div class="topic-bar" aria-hidden="true"><div style="width:' +
        Math.round(read / t.chapters.length * 100) + '%"></div></div>' +
        '<p class="meta">Глав: ' + read + " из " + t.chapters.length +
        " · Тест: " + (last === null ? "—" : last + " из " + qTotal) +
        " · Мини: " + (m && m.total ? m.correct + " из " + m.total : "—") +
        (dueCount ? " · К повторению: " + dueCount : "") + "</p>" +
        '<div class="links"><a class="btn small" href="' + href + '">' +
        (next < t.chapters.length ? "Продолжить" : "К тесту") + "</a>" +
        '<a class="btn small" href="#/quiz/' + id + '">Тест</a></div></div>';
    }).join("");
    return "<h1>Слабые темы</h1>" +
      '<p class="lead">Локальная картина по разделам: что прочитано, где просели тесты и что пора повторить. ' +
      "Данные хранятся только в этом браузере.</p>" +
      '<div class="stats"><div class="stat"><div class="k">глав прочитано</div><div class="v">' + totalRead + " / " + totalCh +
      '</div></div><div class="stat"><div class="k">слабых разделов</div><div class="v">' + weak +
      '</div></div><div class="stat"><div class="k">к повторению</div><div class="v">' + due.length + "</div></div></div>" +
      '<div class="btn-row"><button class="btn" id="exportNotes">Скачать конспект</button>' +
      '<a class="btn" href="#/review">Повторить ошибки</a></div>' +
      '<div class="grid">' + cards + "</div>";
  }

  function bindProgress() {
    var btn = document.getElementById("exportNotes");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var ids = Object.keys(window.TOPICS);
      var parts = ["# Конспект: Лаборатория аналитики", "", "Дата: " + new Date().toLocaleDateString("ru-RU"), ""];
      var count = 0;
      ids.forEach(function (id) {
        var t = window.TOPICS[id], chapterParts = [];
        t.chapters.forEach(function (c, i) {
          if (!window.PROGRESS.isRead(id, i)) return;
          var box = document.createElement("div");
          box.innerHTML = c.html || "";
          Array.prototype.forEach.call(box.querySelectorAll("figure, script, style"), function (el) { el.remove(); });
          var text = (box.textContent || "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
          chapterParts.push("### " + c.title + "\n\n" + text);
          count++;
        });
        if (chapterParts.length) parts.push("## " + t.title + "\n\n" + chapterParts.join("\n\n"));
      });
      if (!count) { btn.textContent = "Сначала отметьте главы"; return; }
      var blob = new Blob([parts.join("\n\n")], { type: "text/markdown;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "konspekt-analitika.md";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 200);
      btn.textContent = "Конспект скачан";
    });
  }

  window.PROGRESS_PAGE = { page: progressPage, bind: bindProgress };
})();
