// Поиск по контенту: индекс строится из глав и вопросов тестов.
// Модуль не трогает DOM, поэтому его можно проверять из node.

(function () {
  "use strict";

  function strip(html) {
    return String(html)
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function snippet(text, words) {
    var low = text.toLowerCase(), pos = -1;
    for (var i = 0; i < words.length; i++) {
      pos = low.indexOf(words[i]);
      if (pos >= 0) break;
    }
    if (pos < 0) return text.slice(0, 150) + (text.length > 150 ? "…" : "");
    var start = Math.max(0, pos - 55);
    return (start > 0 ? "…" : "") + text.slice(start, start + 170).trim() + (start + 170 < text.length ? "…" : "");
  }

  window.SEARCH = {
    index: function (topics) {
      var out = [];
      Object.keys(topics).forEach(function (id) {
        var t = topics[id];
        t.chapters.forEach(function (c, i) {
          out.push({
            topic: id, topicTitle: t.title, kind: "Глава", title: c.title,
            text: strip(c.html), href: "#/theory/" + id + "/" + i
          });
        });
        t.quiz.forEach(function (q) {
          out.push({
            topic: id, topicTitle: t.title, kind: "Вопрос", title: q.q,
            text: strip(q.options.join(" ")) + " " + strip(q.explain), href: "#/quiz/" + id
          });
        });
      });
      return out;
    },

    find: function (index, query) {
      var q = String(query).trim().toLowerCase();
      if (q.length < 2) return [];
      var words = q.split(/\s+/).filter(Boolean);
      var res = [];

      index.forEach(function (e) {
        var title = e.title.toLowerCase(), text = e.text.toLowerCase();
        var score = 0;
        for (var i = 0; i < words.length; i++) {
          var w = words[i];
          var inTitle = title.indexOf(w) >= 0, inText = text.indexOf(w) >= 0;
          if (!inTitle && !inText) return;
          score += (inTitle ? 5 : 0) + (inText ? 1 : 0);
        }
        res.push({ entry: e, score: score, snippet: snippet(e.text, words) });
      });

      res.sort(function (a, b) { return b.score - a.score; });
      return res.slice(0, 12);
    }
  };
})();
