// Теория: главы, шпаргалка и источники.
(function () {
  "use strict";
  var LAB = window.LAB;
  function chapterCheatTerms(html) {
    var terms = [], m, re = /<b>([\s\S]*?)<\/b>/g;
    while ((m = re.exec(html)) && terms.length < 6) {
      var t = m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (t && t.length <= 90 && t !== "Пример." && t !== "Пример" && terms.indexOf(t) < 0) terms.push(t);
    }
    return terms;
  }

  function chapterFormula(html) {
    var m = html.match(/<div class="formula">([\s\S]*?)<\/div>/);
    if (!m) return "";
    return m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 240);
  }

  function chapterCheatsheetHtml(id, c) {
    var terms = chapterCheatTerms(c.html);
    var formula = chapterFormula(c.html);
    var chips = terms.length
      ? '<div class="cheat-chips">' + terms.map(function (t) { return '<span class="cheat-chip">' + LAB.esc(t) + "</span>"; }).join("") + "</div>"
      : '<p class="meta">Ключевые термины — в тексте главы.</p>';
    return '<div class="chapter-cheatsheet"><h3>Автошпаргалка главы</h3>' +
      '<p class="meta">Собрана из выделенных фраз и первой формулы. Это не заменяет конспект.</p>' +
      '<div class="cheat-cols"><div><b>Ключевые понятия</b>' + chips + "</div>" +
      (formula ? '<div><b>Формула или правило</b><code class="cheat-formula">' + LAB.esc(formula) + "</code></div>" : "") +
      "</div>" +
      '<p class="meta"><a href="#/cheatsheet">Все шпаргалки</a> · <a href="#/quiz/' + id + '">Проверить тестом</a> · ' +
      '<a href="#/trainer/' + id + '">Тренажёр</a></p></div>';
  }

  function chapterSourcesHtml(id) {
    var list = (window.SOURCES && window.SOURCES[id]) || [];
    if (!list.length) return "";
    return '<div class="chapter-sources"><h3>Источники раздела</h3>' +
      '<p class="meta">Две ссылки на весь раздел, а не на отдельную главу.</p><ul>' + list.map(function (s) {
      return '<li><a href="' + s.url + '" target="_blank" rel="noopener">' + LAB.esc(s.title) + "</a>" +
        '<span class="meta"> — ' + LAB.esc(s.note) + "</span></li>";
    }).join("") + "</ul></div>";
  }

  function readingTime(html) {
    var text = String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    var words = text ? text.split(" ").length : 0;
    return Math.max(1, Math.round(words / 180));
  }

  function theory(id, chapterIdx) {
    var t = window.TOPICS[id];
    var meta = LAB.topicMeta[id] || {};
    var toc = t.chapters.map(function (c, i) {
      return '<li' + (window.PROGRESS.isRead(id, i) ? ' class="read"' : "") + ">" +
        '<a href="#/theory/' + id + "/" + i + '" data-ch="' + i + '">' + LAB.esc(c.title) + "</a></li>";
    }).join("");

    var body = t.chapters.map(function (c, i) {
      var read = window.PROGRESS.isRead(id, i);
      var prev = i > 0 ? '<a class="btn small" href="#/theory/' + id + "/" + (i - 1) + '" data-ch="' + (i - 1) + '">&larr; ' + LAB.esc(t.chapters[i - 1].title) + "</a>" : "<span></span>";
      var next = i < t.chapters.length - 1 ? '<a class="btn small" href="#/theory/' + id + "/" + (i + 1) + '" data-ch="' + (i + 1) + '">' + LAB.esc(t.chapters[i + 1].title) + " &rarr;</a>" : "<span></span>";
      return '<section id="ch-' + i + '">' +
        '<div class="ch-head"><h2 id="ch-' + i + '-title">' + LAB.icon(LAB.chapterIcon(c.title) || meta.icon) + (i + 1) + ". " + LAB.esc(c.title) + "</h2>" +
        '<span class="ch-actions"><span class="meta ch-time">~' + readingTime(c.html) + ' мин</span>' +
        '<button class="btn small" data-copy="' + i + '">Ссылка</button>' +
        '<button class="btn small' + (read ? " is-read" : "") + '" data-read="' + i + '" aria-pressed="' + read + '">' +
        (read ? "Прочитано" : "Отметить прочитанной") + "</button></span></div>" +
        c.html +
        window.GLOSSARY_PAGE.termsHtml(id, i, c.html) +
        chapterCheatsheetHtml(id, c) +
        chapterSourcesHtml(id) +
        '<p class="meta"><a href="https://github.com/chipsfirst/analytics_lab/issues/new?title=' +
          encodeURIComponent("Ошибка в главе: " + c.title) + "&body=" +
          encodeURIComponent("Раздел: " + t.title + "\nГлава: " + c.title + "\nСсылка: " +
            (window.location.origin + window.location.pathname) + "#/theory/" + id + "/" + i +
            "\n\nЧто не так:\n") + '">Сообщить об ошибке в главе</a></p>' +
        '<div class="ch-nav">' + prev + next + "</div>" +
        '<div class="mini" data-mini="' + i + '"><button class="btn small" data-mini-start="' + i + '">Проверить себя · 3 вопроса</button></div>' +
        "</section>";
    }).join("");

    return '<div class="topic-page" data-topic="' + id + '">' +
      '<p><a href="#/textbook">&larr; все разделы</a></p>' +
      "<h1>" + LAB.icon(meta.icon) + LAB.esc(t.title) + "</h1><p class=\"lead\">" + LAB.esc(t.lead) + "</p>" +
      '<div class="reader reader-top"><aside class="toc"><b>Главы</b><ol>' + toc + "</ol>" +
      '<div class="btn-row"><a class="btn" href="#/quiz/' + id + '">Тест</a>' +
      '<a class="btn" href="#/trainer/' + id + '">Тренажёр</a>' +
      '<button class="btn" id="printSection">Печать</button></div>' +
      (id === "sql" ? '<div class="btn-row"><a class="btn" href="#/sandbox">Песочница SQL</a></div>' : "") +
      (id === "python" ? '<div class="btn-row"><a class="btn" href="#/pysandbox">Песочница Python</a></div>' : "") +
      (id === "statistics" ? '<div class="btn-row"><a class="btn" href="#/cheatsheet">Какой критерий выбрать</a></div>' : "") +
      (id === "bi" ? '<div class="btn-row"><a class="btn" href="#/bi-exam">Сертификация</a></div>' : "") +
      "</aside><article>" + body + "</article></div></div>";
  }

  window.THEORY_PAGE = { page: theory };
})();
