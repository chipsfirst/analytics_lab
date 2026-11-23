// Привязки глав: TOC, клавиши, мини-тесты и поиск по тексту.
(function () {
  "use strict";
  var LAB = window.LAB;
  function path() { return location.hash.replace(/^#\/?/, "").split("/").filter(Boolean); }
  function shuffle(a) { a=a.slice(); for (var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }
  function quizOptions(q) { return shuffle((q.options||[]).map(function(o,i){return typeof o==="string"?{text:o,ok:i===q.correct}:{text:o.text,ok:!!o.ok};})); }
  var tocObserver = null;
  function miniPicks(bank, title) {
    var words = String(title || "").toLowerCase()
      .replace(/[^a-zа-яё0-9\s]/gi, " ").split(/\s+/)
      .filter(function (w) { return w.length > 4; });
    if (!words.length) return null;
    var scored = bank.map(function (q, i) {
      var options = (q.options || []).map(function (o) { return typeof o === "string" ? o : o.text; }).join(" ");
      var text = (q.q + " " + q.explain + " " + options).toLowerCase();
      var s = 0;
      words.forEach(function (w) { if (text.indexOf(w) >= 0) s++; });
      return { i: i, s: s };
    }).filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s; });
    return scored.length >= 3 ? scored.slice(0, 6).map(function (x) { return x.i; }) : null;
  }

  function wrapTables(root) {
    Array.prototype.forEach.call(root.querySelectorAll("article table"), function (t) {
      if (t.parentNode.classList.contains("table-wrap")) return;
      var box = document.createElement("div");
      box.className = "table-wrap";
      box.tabIndex = 0;
      box.setAttribute("role", "region");
      box.setAttribute("aria-label", "Таблица, прокручивается");
      t.parentNode.insertBefore(box, t);
      box.appendChild(t);
    });
    Array.prototype.forEach.call(root.querySelectorAll(".table-wrap"), function (box) {
      box.tabIndex = 0;
      box.setAttribute("role", "region");
      box.setAttribute("aria-label", "Таблица, прокручивается");
    });
  }

  function markInChapter(root, word) {
    if (!word || !root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = walker.nextNode())) {
      var idx = n.nodeValue.toLowerCase().indexOf(String(word).toLowerCase());
      if (idx < 0) continue;
      var range = document.createRange();
      range.setStart(n, idx);
      range.setEnd(n, idx + word.length);
      var mark = document.createElement("mark");
      mark.className = "hl";
      try { range.surroundContents(mark); } catch (e) { return; }
      return;
    }
  }

  function bindChapters() {
    var p = path();
    wrapTables(LAB.app);

    if (p[0] === "theory" && p[1] && p[2] && /^\d+$/.test(p[2])) {
      var target = document.getElementById("ch-" + p[2]);
      if (target) {
        window.PROGRESS.setLast(p[1], Number(p[2]));
        target.scrollIntoView({ behavior: "instant", block: "start" });
        try {
          var jump = JSON.parse(sessionStorage.getItem("searchJump") || "null");
          if (jump && jump.href === "#/" + p.join("/")) {
            markInChapter(target, String(jump.q || "").split(/\s+/)[0]);
            sessionStorage.removeItem("searchJump");
          }
        } catch (e) {}
      }
    }

    Array.prototype.forEach.call(LAB.app.querySelectorAll("a[data-ch]"), function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var i = a.getAttribute("data-ch");
        var s = document.getElementById("ch-" + i);
        if (s) s.scrollIntoView();
        window.PROGRESS.setLast(p[1], Number(i));
        try { history.replaceState(null, "", "#/theory/" + p[1] + "/" + i); } catch (err) {}
      });
    });

    if (tocObserver) { tocObserver.disconnect(); tocObserver = null; }
    var tocLinks = LAB.app.querySelectorAll("aside.toc a[data-ch]");
    var sections = LAB.app.querySelectorAll("article section[id^='ch-']");
    if (tocLinks.length && sections.length && "IntersectionObserver" in window) {
      tocObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var idx = en.target.id.replace("ch-", "");
          Array.prototype.forEach.call(tocLinks, function (a) {
            a.classList.toggle("active", a.getAttribute("data-ch") === idx);
          });
        });
      }, { rootMargin: "-15% 0px -75% 0px" });
      Array.prototype.forEach.call(sections, function (s) { tocObserver.observe(s); });
    }

    Array.prototype.forEach.call(LAB.app.querySelectorAll("[data-mini-start]"), function (b) {
      b.addEventListener("click", function () {
        var box = b.parentNode;
        var bank = window.TOPICS[p[1]].quiz;
        var chIdx = Number(b.getAttribute("data-mini-start"));
        var chapter = window.TOPICS[p[1]].chapters[chIdx];
        var pool = miniPicks(bank, chapter && chapter.title) || bank.map(function (_, k) { return k; });
        var picks = shuffle(pool).slice(0, 3);
        var prepared = {};
        box.innerHTML = picks.map(function (n, qi) {
          var q = bank[n];
          var opts = prepared[qi] = quizOptions(q);
          return '<div class="mini-q" data-q="' + qi + '"><p class="q-text"><b>' + (qi + 1) + ".</b> " + q.q + "</p>" +
            '<div class="options">' + opts.map(function (o, k) {
              return '<button class="option" data-k="' + k + '">' + String.fromCharCode(1040 + k) + ". " + LAB.esc(o.text) + "</button>";
            }).join("") + '</div><div class="explain" aria-live="polite" hidden></div></div>';
        }).join("");
        Array.prototype.forEach.call(box.querySelectorAll(".mini-q"), function (qEl) {
          var qi = Number(qEl.getAttribute("data-q"));
          var opts = prepared[qi];
          var q = bank[picks[qi]];
          Array.prototype.forEach.call(qEl.querySelectorAll(".option"), function (opt) {
            opt.addEventListener("click", function () {
              if (qEl.getAttribute("data-done")) return;
              qEl.setAttribute("data-done", "1");
              var k = Number(opt.getAttribute("data-k"));
              var ok = opts[k].ok;
              qEl.setAttribute("data-ok", ok ? "1" : "0");
              Array.prototype.forEach.call(qEl.querySelectorAll(".option"), function (o, oi) {
                o.disabled = true;
                if (opts[oi].ok) o.classList.add("right");
                else if (oi === k) o.classList.add("wrong");
              });
              var ex = qEl.querySelector(".explain");
              ex.hidden = false;
              ex.innerHTML = "<b>" + (ok ? "Верно" : "Неверно") + "</b>" + q.explain;
              var total = box.querySelectorAll(".mini-q").length;
              if (box.querySelectorAll(".mini-q[data-done]").length === total && !box.querySelector(".mini-sum")) {
                var correct = box.querySelectorAll('.mini-q[data-ok="1"]').length;
                window.PROGRESS.recordMini(p[1], correct, total);
                var sum = document.createElement("p");
                sum.className = "mini-sum";
                sum.textContent = "Верно " + correct + " из " + total;
                box.appendChild(sum);
              }
            });
          });
        });
      });
    });

    var calc = document.getElementById("mdeCalc");
    if (calc) {
      var calcOut = document.getElementById("mdeOut");
      var calcSize = function () {
        var p1 = Number(document.getElementById("mdeP1").value) / 100;
        var p2 = Number(document.getElementById("mdeP2").value) / 100;
        var power = Number(document.getElementById("mdePower").value);
        var alpha = Number(document.getElementById("mdeAlpha").value);
        var za = alpha === 0.01 ? 2.575829 : 1.959964;
        var zp = power === 0.9 ? 1.281552 : 0.841621;
        var d = Math.abs(p2 - p1);
        if (!(p1 > 0 && p1 < 1 && p2 > 0 && p2 < 1) || d < 0.000001) {
          calcOut.textContent = "Введите две разные конверсии от 0 до 100%.";
          return;
        }
        var n = Math.ceil(Math.pow(za + zp, 2) * (p1 * (1 - p1) + p2 * (1 - p2)) / (d * d));
        calcOut.textContent = "Нужно ≈ " + n.toLocaleString("ru-RU") + " наблюдений в каждой группе, всего " +
          (2 * n).toLocaleString("ru-RU") + ".";
      };
      ["mdeP1", "mdeP2", "mdePower", "mdeAlpha"].forEach(function (id) {
        var el = document.getElementById(id);
        el.addEventListener("input", calcSize);
        el.addEventListener("change", calcSize);
      });
      calcSize();
    }

    Array.prototype.forEach.call(LAB.app.querySelectorAll("[data-copy]"), function (b) {
      b.addEventListener("click", function () {
        var url = location.origin + location.pathname + "#/theory/" + p[1] + "/" + b.getAttribute("data-copy");
        function done() {
          var old = b.textContent;
          b.textContent = "Скопировано";
          setTimeout(function () { b.textContent = old; }, 1200);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done, function () { prompt("Ссылка на главу:", url); });
        } else {
          prompt("Ссылка на главу:", url);
        }
      });
    });

    var printBtn = document.getElementById("printSection");
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });

    LAB.setKeys(function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.key === "/") {
        e.preventDefault();
        var s = document.getElementById("searchInput");
        if (s) s.focus();
        return;
      }
      var key = String(e.key).toLowerCase();
      if (key !== "j" && key !== "k") return;
      var secs = LAB.app.querySelectorAll("article section[id^='ch-']");
      if (!secs.length) return;
      e.preventDefault();
      var cur = 0, y = window.scrollY + 90;
      Array.prototype.forEach.call(secs, function (sec, idx) { if (sec.offsetTop <= y) cur = idx; });
      var n = Math.max(0, Math.min(secs.length - 1, cur + (key === "j" ? 1 : -1)));
      window.PROGRESS.setLast(p[1], n);
      try { history.replaceState(null, "", "#/theory/" + p[1] + "/" + n); } catch (err) {}
      secs[n].scrollIntoView();
    });

    Array.prototype.forEach.call(LAB.app.querySelectorAll("button[data-read]"), function (b) {
      b.addEventListener("click", function () {
        var i = Number(b.getAttribute("data-read"));
        var now = !window.PROGRESS.isRead(p[1], i);
        window.PROGRESS.setRead(p[1], i, now);
        window.PROGRESS.setLast(p[1], i);
        b.textContent = now ? "Прочитано" : "Отметить прочитанной";
        b.className = "btn small" + (now ? " is-read" : "");
        b.setAttribute("aria-pressed", String(now));
        var li = LAB.app.querySelectorAll(".toc li")[i];
        if (li) li.classList.toggle("read", now);
      });
    });
  }

  // ---------- тесты ----------

  // ---------- игры и демо ----------

  window.CHAPTERS = { bind: bindChapters };
})();
