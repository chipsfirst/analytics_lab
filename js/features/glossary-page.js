// Словарь терминов и подсказки в главах.
(function () {
  "use strict";
  var LAB = window.LAB;
  function esc(s) { return LAB.esc(s); }
  var glossaryTexts = null;
  var termsCache = {};

  function plainText(html) {
    return String(html).replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function entryAliases(e) {
    var list = (e.aliases || [e.term]);
    return list.filter(function (a) {
      return a && (a.length > 2 || /^(α|β|σ|χ²|R²|SE|CI|ДИ|H0|H1|H₀|H₁|P)$/i.test(a));
    }).map(function (a) { return a.toLowerCase(); });
  }

  function glossaryContext() {
    if (glossaryTexts) return glossaryTexts;
    glossaryTexts = [];
    Object.keys(window.TOPICS).forEach(function (id) {
      window.TOPICS[id].chapters.forEach(function (c, i) {
        glossaryTexts.push({ id: id, topicTitle: window.TOPICS[id].title, i: i, title: c.title, text: plainText(c.html) });
      });
    });
    return glossaryTexts;
  }

  function glossaryLinks(entry) {
    var aliases = entryAliases(entry), out = [];
    glossaryContext().forEach(function (ch) {
      if (out.length >= 2) return;
      if (aliases.some(function (a) { return ch.text.indexOf(a) >= 0; })) out.push(ch);
    });
    return out;
  }

  function termsForChapter(html) {
    var text = plainText(html), out = [];
    (window.GLOSSARY || []).forEach(function (e) {
      if (out.length >= 6) return;
      if (entryAliases(e).some(function (a) { return text.indexOf(a) >= 0; })) out.push(e);
    });
    return out;
  }

  function chapterTermsHtml(topicId, i, html) {
    var key = topicId + ":" + i;
    if (!termsCache[key]) termsCache[key] = termsForChapter(html);
    var terms = termsCache[key];
    if (!terms.length) return "";
    return '<p class="chapter-terms"><b>Термины:</b> ' + terms.map(function (e) {
      return '<a href="#/glossary/' + e.id + '">' + esc(e.term) + "</a>";
    }).join(", ") + "</p>";
  }

  function glossaryRow(e) {
    var links = glossaryLinks(e);
    var search = [e.term, e.symbol || "", e.def, (e.aliases || []).join(" ")].join(" ").toLowerCase();
    return '<tr class="gloss-item" id="g-' + e.id + '" data-search="' + esc(search) + '">' +
      '<td class="gloss-term-cell"><b class="gloss-term">' + esc(e.term) + "</b>" +
      (e.symbol ? '<span class="gloss-sym">' + esc(e.symbol) + "</span>" : "") + "</td>" +
      '<td><p class="gloss-def">' + esc(e.def) + "</p></td>" +
      '<td><p class="gloss-links">' + (links.length
        ? links.map(function (l) { return '<a href="#/theory/' + l.id + "/" + l.i + '">' + esc(l.title) + "</a>"; }).join(" · ")
        : "—") + "</p></td></tr>";
  }

  function glossaryPage(slug) {
    var data = window.GLOSSARY || [];
    var groups = [];
    data.forEach(function (e) { if (groups.indexOf(e.group) < 0) groups.push(e.group); });
    return "<h1>Словарь аналитика</h1>" +
      '<p class="lead">Короткие определения терминов и обозначений. Ссылка «Где читать» ведёт в главу, где понятие разобрано подробнее.</p>' +
      '<div class="search-row"><label class="sr-only" for="glossFilter">Найти термин</label>' +
      '<input type="search" id="glossFilter" placeholder="Например: альфа, σ, precision" autocomplete="off"></div>' +
      groups.map(function (g) {
        var rows = data.filter(function (e) { return e.group === g; });
        return '<section class="gloss-group"><h2>' + esc(g) + "</h2>" +
          '<div class="table-wrap"><table class="gloss-table"><thead><tr><th>Термин</th><th>Определение</th><th>Где читать</th></tr></thead><tbody>' +
          rows.map(glossaryRow).join("") + "</tbody></table></div></section>";
      }).join("") +
      '<p class="lead" id="glossEmpty" hidden>Ничего не найдено.</p>';
  }

  function bindGlossary(slug) {
    var input = document.getElementById("glossFilter");
    var items = Array.prototype.slice.call(document.querySelectorAll(".gloss-item"));
    var groups = Array.prototype.slice.call(document.querySelectorAll(".gloss-group"));
    var empty = document.getElementById("glossEmpty");
    function filter() {
      var q = input.value.trim().toLowerCase();
      var any = false;
      items.forEach(function (el) {
        var hit = !q || (el.getAttribute("data-search") || "").indexOf(q) >= 0;
        el.hidden = !hit;
        if (hit) any = true;
      });
      groups.forEach(function (g) {
        g.hidden = !Array.prototype.some.call(g.querySelectorAll(".gloss-item"), function (el) { return !el.hidden; });
      });
      empty.hidden = any;
    }
    if (input) input.addEventListener("input", filter);
    if (slug) {
      var target = document.getElementById("g-" + slug);
      if (target) {
        target.classList.add("target");
        target.scrollIntoView({ block: "center" });
      }
    }
  }

  window.GLOSSARY_PAGE = { page: glossaryPage, bind: bindGlossary, termsHtml: chapterTermsHtml };
})();
