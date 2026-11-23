// Общие помощники тренажёров: случайные числа, форматирование, матрицы.
(function () {
  "use strict";
  function rndInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  function rndStep(min, max, step) { return min + step * rndInt(0, Math.floor((max - min) / step)); }

  function round(x, d) { var k = Math.pow(10, d === undefined ? 2 : d); return Math.round(x * k) / k; }

  function fmt(x, d) { return round(x, d).toFixed(d === undefined ? 2 : d).replace(".", ","); }

  function C(n, k) { var r = 1; for (var i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }

  function num(value, tol, d) { return { type: "number", value: round(value, d === undefined ? 2 : d), tol: tol }; }

  function parseNum(s) {
    var v = String(s).replace(/\s/g, "").replace(/%/g, "").replace(",", ".");
    return parseFloat(v);
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function matrix(a, b, rowNames, colNames) {
    rowNames = rowNames || ["A", "B"];
    colNames = colNames || ["1", "2"];
    var head = "<tr><th></th>" + colNames.map(function (c) { return "<th>" + c + "</th>"; }).join("") + "</tr>";
    var rows = [0, 1].map(function (i) {
      return "<tr><th>" + rowNames[i] + "</th>" + [0, 1].map(function (j) {
        return "<td>" + a[i][j] + (b ? ", " + b[i][j] : "") + "</td>";
      }).join("") + "</tr>";
    }).join("");
    return '<p>Выигрыши в ячейках: <b>первый игрок, второй игрок</b>.</p>' +
      '<table class="matrix"><thead>' + head + "</thead><tbody>" + rows + "</tbody></table>";
  }

  function sample() { return Array.from({ length: 5 }, function () { return rndInt(1, 20); }); }

  function meanOf(xs) { return xs.reduce(function (s, x) { return s + x; }, 0) / xs.length; }

  function varOf(xs) { var m = meanOf(xs); return xs.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / xs.length; }

  function nashIn(a, b) {
    var cells = [];
    for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) {
      if (a[i][j] >= a[1 - i][j] && b[i][j] >= b[i][1 - j]) cells.push([i, j]);
    }
    return cells;
  }

  function sqlTable(cols, rows) {
    return '<table class="matrix"><thead><tr>' + cols.map(function (c) { return "<th>" + c + "</th>"; }).join("") +
      "</tr></thead><tbody>" + rows.map(function (r) {
        return "<tr>" + r.map(function (c) { return "<td>" + (c === null ? "NULL" : c) + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table>";
  }

  function colLetter(n) { return String.fromCharCode(64 + n); }

  function uniqOptions(list) {
    var seen = {}, out = [];
    list.forEach(function (v) {
      if (!seen[v]) { seen[v] = 1; out.push(v); }
    });
    return out;
  }

  function randList(n, min, max) {
    var a = [];
    for (var i = 0; i < n; i++) a.push(rndInt(min, max));
    return a;
  }

  function fact(n) {
    var r = 1;
    for (var i = 2; i <= n; i++) r *= i;
    return r;
  }
  window.TRAINER_FNS = window.TRAINER_FNS || {};
  window.TRAINER_UTILS = {
    rndInt: rndInt, rndStep: rndStep, round: round, fmt: fmt, C: C, num: num,
    parseNum: parseNum, esc: esc, matrix: matrix, sample: sample, meanOf: meanOf,
    varOf: varOf, nashIn: nashIn, sqlTable: sqlTable, colLetter: colLetter,
    uniqOptions: uniqOptions, randList: randList, fact: fact
  };
})();
