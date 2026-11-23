// Поиск по главам и вопросам.
(function () {
  "use strict";
  var LAB = window.LAB;
  var searchIndex = null;
  function markQuery(text, words) {
    var out = LAB.esc(text);
    words.forEach(function (w) {
      if (!w) return;
      var re = new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      out = out.replace(re, "<mark>$1</mark>");
    });
    return out;
  }
  // ---------- поиск ----------

  var searchIndex = null;

  function searchPage(query) {
    if (!searchIndex) searchIndex = window.SEARCH.index(window.TOPICS);
    return "<h1>Поиск</h1><p class=\"lead\">Ищет по главам и вопросам тестов всех разделов.</p>" +
      '<div class="search-row"><label class="sr-only" for="q">Поисковый запрос</label>' +
      '<input type="search" id="q" placeholder="Например: Байес, JOIN, дисперсия" autocomplete="off" value="' +
      LAB.esc(query || "") + '"></div><div id="results" class="search-results"></div>';
  }

  function bindSearch(query) {
    var input = document.getElementById("q");
    var box = document.getElementById("results");
    var initial = query ? decodeURIComponent(query) : "";

    function draw(q) {
      if (!q || q.trim().length < 2) {
        box.innerHTML = '<p class="lead">Введите хотя бы два символа.</p>';
        return;
      }
      var hits = window.SEARCH.find(searchIndex, q);
      if (!hits.length) {
        box.innerHTML = '<p class="lead">Ничего не найдено. Попробуйте другое слово.</p>';
        return;
      }
      var words = q.trim().toLowerCase().split(/\s+/).filter(function (w) { return w.length > 1; });
      box.innerHTML = hits.map(function (h) {
        return '<a class="result" href="' + h.entry.href + '">' +
          '<span class="chip">' + LAB.esc(h.entry.topicTitle) + " · " + h.entry.kind + "</span>" +
          "<b>" + markQuery(h.entry.title, words) + "</b>" +
          '<span class="result-text">' + markQuery(h.snippet, words) + "</span></a>";
      }).join("");
      Array.prototype.forEach.call(box.querySelectorAll(".result"), function (a) {
        a.addEventListener("click", function () {
          try { sessionStorage.setItem("searchJump", JSON.stringify({ q: q, href: a.getAttribute("href") })); } catch (e) {}
        });
      });
    }

    input.addEventListener("input", function () {
      history.replaceState(null, "", input.value.trim() ? "#/search/" + encodeURIComponent(input.value.trim()) : "#/search");
      draw(input.value);
    });
    draw(initial);
    input.focus();
  }

  window.SEARCH_PAGE = { page: searchPage, bind: bindSearch, reset: function () { searchIndex = null; } };
})();
