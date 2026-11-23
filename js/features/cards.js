// Карточки для повторения.
(function () {
  "use strict";
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function cardsPage() {
    var options = ['<option value="all">Все вопросы</option>', '<option value="glossary">Словарь терминов</option>'];
    Object.keys(window.TOPICS).forEach(function (id) {
      options.push('<option value="' + id + '">' + esc(window.TOPICS[id].title) + "</option>");
    });
    return "<h1>Карточки</h1>" +
      '<p class="lead">Повторяйте вопросы и термины по карточкам. Отмечайте «Знаю» или «Ещё раз»; экспорт в Anki — кнопкой ниже.</p>' +
      '<div class="btn-row"><label class="sr-only" for="cardsDeck">Колода</label><select id="cardsDeck">' +
      options.join("") + '</select><button class="btn" id="cardsExport">Экспорт в Anki</button></div>' +
      '<div class="card flash-card"><p class="meta" id="cardsMeta">Колода</p><div id="cardsFront" class="flash-front"></div>' +
      '<div id="cardsBack" class="flash-back" hidden></div><div class="btn-row" id="cardsActions">' +
      '<button class="btn primary" id="cardsShow">Показать ответ</button>' +
      '<button class="btn" id="cardsAgain" hidden>Ещё раз</button>' +
      '<button class="btn" id="cardsKnow" hidden>Знаю</button></div></div>' +
      '<p class="meta" id="cardsProgress"></p>';
  }

  function bindCards() {
    var state = { deck: [], i: 0, known: 0, revealed: false };
    var select = document.getElementById("cardsDeck");
    var front = document.getElementById("cardsFront");
    var back = document.getElementById("cardsBack");
    var meta = document.getElementById("cardsMeta");
    var progress = document.getElementById("cardsProgress");
    function build(value) {
      if (value === "glossary") {
        return window.GLOSSARY.map(function (g) {
          return { front: g.term + (g.symbol ? " (" + g.symbol + ")" : ""), back: g.def, tag: "словарь" };
        });
      }
      var ids = value === "all" ? Object.keys(window.TOPICS) : [value];
      var out = [];
      ids.forEach(function (id) {
        window.TOPICS[id].quiz.forEach(function (q) {
          out.push({ front: q.q, back: q.options[q.correct] + ". " + q.explain, tag: window.TOPICS[id].title });
        });
      });
      return out;
    }
    function draw() {
      var card = state.deck[state.i];
      if (!card) {
        front.textContent = "Карточек нет.";
        back.hidden = true;
        meta.textContent = "Колода пуста";
        progress.textContent = "";
        return;
      }
      meta.textContent = card.tag;
      front.innerHTML = esc(card.front);
      back.innerHTML = esc(card.back);
      back.hidden = !state.revealed;
      document.getElementById("cardsShow").hidden = state.revealed;
      document.getElementById("cardsAgain").hidden = !state.revealed;
      document.getElementById("cardsKnow").hidden = !state.revealed;
      progress.textContent = "Карточка " + (state.i + 1) + " из " + state.deck.length + " · знаю: " + state.known;
    }
    function reset() {
      state.deck = build(select.value);
      state.i = 0;
      state.known = 0;
      state.revealed = false;
      draw();
    }
    function next(known) {
      if (known) state.known++;
      state.i++;
      state.revealed = false;
      if (state.i >= state.deck.length) {
        state.i = 0;
        state.deck = state.deck.slice().sort(function () { return Math.random() - 0.5; });
        progress.textContent = "Круг завершён: знаю " + state.known + " из " + state.deck.length + ". Начинаем заново.";
      }
      draw();
    }
    select.addEventListener("change", reset);
    document.getElementById("cardsShow").addEventListener("click", function () {
      state.revealed = true;
      draw();
    });
    document.getElementById("cardsAgain").addEventListener("click", function () { next(false); });
    document.getElementById("cardsKnow").addEventListener("click", function () { next(true); });
    document.getElementById("cardsExport").addEventListener("click", function () {
      var rows = ["front\tback\ttags"];
      state.deck.forEach(function (c) {
        rows.push(String(c.front).replace(/\t/g, " ") + "\t" + String(c.back).replace(/\t/g, " ") + "\t" + String(c.tag).replace(/\t/g, " "));
      });
      var blob = new Blob([rows.join("\n")], { type: "text/tab-separated-values;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "anki-karty.txt";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 200);
    });
    reset();
  }

  window.CARDS = { page: cardsPage, bind: bindCards };
})();
