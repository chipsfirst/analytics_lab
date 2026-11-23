// Игры: общие помощники.
(function () {
  "use strict";
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function pct(x, n) { return (x / n * 100).toFixed(1).replace(".", ",") + "%"; }

  // ---------- Монти Холл ----------

  function payoff(mine, theirs) {
    if (mine === "C" && theirs === "C") return [3, 3];
    if (mine === "C" && theirs === "D") return [0, 5];
    if (mine === "D" && theirs === "C") return [5, 0];
    return [1, 1];
  }

  function rndInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var CALIB = [
    { q: "Сумма на двух кубиках равна 7", p: 1 / 6, sim: function () { return rndInt(1, 6) + rndInt(1, 6) === 7; } },
    { q: "Хотя бы один орёл за три броска монеты", p: 7 / 8, sim: function () {
      for (var i = 0; i < 3; i++) if (Math.random() < 0.5) return true;
      return false;
    } },
    { q: "Ровно два орла из пяти бросков", p: 10 / 32, sim: function () {
      var n = 0;
      for (var i = 0; i < 5; i++) if (Math.random() < 0.5) n++;
      return n === 2;
    } },
    { q: "Хотя бы одна шестёрка за четыре броска кубика", p: 1 - Math.pow(5 / 6, 4), sim: function () {
      for (var i = 0; i < 4; i++) if (rndInt(1, 6) === 6) return true;
      return false;
    } },
    { q: "Сумма на двух кубиках больше 9", p: 6 / 36, sim: function () { return rndInt(1, 6) + rndInt(1, 6) > 9; } },
    { q: "Случайная карта из колоды 52 — пиковой масти", p: 0.25, sim: function () { return Math.random() < 0.25; } }
  ];
  window.GAME_UTILS = { esc: esc, pct: pct, payoff: payoff, rndInt: rndInt, shuffle: shuffle };
  window.GAME_FNS = window.GAME_FNS || {};
})();
