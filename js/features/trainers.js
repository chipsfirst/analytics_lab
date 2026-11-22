// Тренажёры: генераторы задач. Каждый генератор возвращает
// { prompt, solution, answer: {type:'number', value, tol} | {type:'choice', options:[{text, ok}]} }

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

  window.checkAnswer = function (task, input) {
    var a = task.answer;
    if (a.type === "choice") {
      return a.options[Number(input)] && a.options[Number(input)].ok === true;
    }
    var v = parseNum(input);
    return isFinite(v) && Math.abs(v - a.value) <= a.tol;
  };

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

  // ---------- аналитика ----------

  function tCtr() {
    var shows = rndStep(1000, 20000, 100);
    var clicks = Math.max(1, Math.round(shows * rndInt(5, 120) / 1000));
    var ans = clicks / shows * 100;
    return {
      prompt: "Баннер показан <b>" + shows + "</b> раз, переходов по нему — <b>" + clicks +
        "</b>. Чему равен CTR? Ответ в процентах.",
      solution: "CTR = переходы / показы × 100% = " + clicks + " / " + shows + " × 100% = " + fmt(ans) + "%.",
      answer: num(ans, 0.03)
    };
  }

  function tFunnel() {
    var a = rndInt(30, 70), b = rndInt(20, 60), c = rndInt(10, 50);
    var ans = a * b * c / 10000;
    return {
      prompt: "Воронка из трёх шагов. Конверсии: <b>" + a + "%</b>, <b>" + b + "%</b>, <b>" + c +
        "%</b>. Какова сквозная конверсия в процентах?",
      solution: "Сквозная конверсия — произведение шаговых: " + (a / 100) + " × " + (b / 100) + " × " +
        (c / 100) + " = " + fmt(ans / 100, 4) + ", то есть <b>" + fmt(ans) + "%</b>. Складывать проценты нельзя.",
      answer: num(ans, 0.02, 4)
    };
  }

  function tRomi() {
    var spend = rndStep(50, 500, 10);
    var revenue = Math.round(spend * rndInt(120, 400) / 100);
    var ans = (revenue - spend) / spend * 100;
    return {
      prompt: "Кампания стоила <b>" + spend + " тыс. ₽</b> и принесла <b>" + revenue +
        " тыс. ₽</b> выручки. Чему равен ROMI в процентах?",
      solution: "ROMI = (доход − расход) / расход × 100% = (" + revenue + " − " + spend + ") / " + spend +
        " × 100% = " + fmt(ans) + "%.",
      answer: num(ans, 0.05)
    };
  }

  function tLtvCac() {
    var arpu = rndStep(100, 900, 50);
    var months = rndInt(6, 24);
    var cac = rndStep(500, 3000, 100);
    var ltv = arpu * months;
    var ans = ltv / cac;
    return {
      prompt: "ARPU = <b>" + arpu + " ₽/мес</b>, средний срок жизни пользователя — <b>" + months +
        " мес.</b>, CAC = <b>" + cac + " ₽</b>. Маржинальность 100%. Чему равно LTV/CAC?",
      solution: "LTV = ARPU × срок жизни = " + arpu + " × " + months + " = " + ltv +
        " ₽. LTV/CAC = " + ltv + " / " + cac + " = " + fmt(ans) + ".",
      answer: num(ans, 0.02)
    };
  }

  function tAbLift() {
    var n1 = rndStep(1000, 5000, 100);
    var n2 = rndStep(1000, 5000, 100);
    var base = rndInt(4, 20) / 100;
    var target = base * (1 + rndInt(5, 40) / 100);
    var c1 = Math.max(1, Math.round(n1 * base));
    var c2 = Math.max(1, Math.round(n2 * target));
    var p1 = c1 / n1, p2 = c2 / n2;
    var ans = (p2 - p1) / p1 * 100;
    return {
      prompt: "Группа A: <b>" + n1 + "</b> пользователей, <b>" + c1 + "</b> конверсий. Группа B: <b>" +
        n2 + "</b> пользователей, <b>" + c2 +
        "</b> конверсий. На сколько процентов конверсия B выше конверсии A (относительный прирост)?",
      solution: "Конверсия A = " + c1 + " / " + n1 + " = " + fmt(p1 * 100, 2) + "%. Конверсия B = " + c2 +
        " / " + n2 + " = " + fmt(p2 * 100, 2) + "%. Относительный прирост = (" + fmt(p2 * 100, 2) + " − " +
        fmt(p1 * 100, 2) + ") / " + fmt(p1 * 100, 2) + " × 100% = " + fmt(ans) + "%.",
      answer: num(ans, 0.05)
    };
  }

  function tRetention() {
    var cohort = rndStep(500, 8000, 100);
    var day = rndInt(1, 30);
    var back = Math.max(1, Math.round(cohort * rndInt(5, 60) / 100));
    var ans = back / cohort * 100;
    return {
      prompt: "Когорта дня 0 — <b>" + cohort + "</b> пользователей. На " + day + "-й день вернулось <b>" +
        back + "</b>. Чему равен D" + day + " в процентах?",
      solution: "D" + day + " = вернувшиеся / когорта × 100% = " + back + " / " + cohort + " × 100% = " + fmt(ans) + "%.",
      answer: num(ans, 0.02)
    };
  }

  // ---------- статистика ----------

  function sample() { return Array.from({ length: 5 }, function () { return rndInt(1, 20); }); }
  function meanOf(xs) { return xs.reduce(function (s, x) { return s + x; }, 0) / xs.length; }
  function varOf(xs) { var m = meanOf(xs); return xs.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / xs.length; }

  function tMean() {
    var xs = sample();
    var m = meanOf(xs);
    return {
      prompt: "Найдите среднее арифметическое набора: <b>" + xs.join(", ") + "</b>.",
      solution: "Сумма = " + xs.reduce(function (s, x) { return s + x; }, 0) + ", n = 5, среднее = " + fmt(m) + ".",
      answer: num(m, 0.02)
    };
  }

  function tMedian() {
    var xs = sample();
    var s = xs.slice().sort(function (a, b) { return a - b; });
    return {
      prompt: "Найдите медиану набора: <b>" + xs.join(", ") + "</b>.",
      solution: "Упорядочим: " + s.join(", ") + ". Медиана — центральное значение: " + s[2] + ".",
      answer: num(s[2], 0.001)
    };
  }

  function tVariance() {
    var xs = sample();
    var v = varOf(xs);
    var m = meanOf(xs);
    return {
      prompt: "Найдите дисперсию набора как генеральной совокупности (делить на n): <b>" + xs.join(", ") +
        "</b>. Округлите до сотых.",
      solution: "Среднее = " + fmt(m) + ". Отклонения в квадрате: " +
        xs.map(function (x) { return fmt((x - m) * (x - m)); }).join(", ") +
        ". Сумма = " + fmt(xs.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0)) +
        ", делим на 5: " + fmt(v) + ".",
      answer: num(v, 0.02)
    };
  }

  function tSd() {
    var xs = sample();
    var v = varOf(xs);
    return {
      prompt: "Найдите стандартное отклонение набора (делить на n): <b>" + xs.join(", ") +
        "</b>. Округлите до сотых.",
      solution: "Дисперсия = " + fmt(v) + ", σ = √" + fmt(v) + " = " + fmt(Math.sqrt(v)) + ".",
      answer: num(Math.sqrt(v), 0.02)
    };
  }

  function tZ() {
    var mean = rndInt(50, 200);
    var sd = rndInt(5, 25);
    var x = mean + rndInt(-3, 3) * sd;
    var ans = (x - mean) / sd;
    return {
      prompt: "Среднее <b>" + mean + "</b>, стандартное отклонение <b>" + sd + "</b>, значение <b>" + x +
        "</b>. Чему равен z-score?",
      solution: "z = (x − μ) / σ = (" + x + " − " + mean + ") / " + sd + " = " + fmt(ans, 2) + ".",
      answer: num(ans, 0.01)
    };
  }

  function tSe() {
    var sigma = rndInt(5, 40);
    var n = [16, 25, 36, 49, 64, 100, 144][rndInt(0, 6)];
    var ans = sigma / Math.sqrt(n);
    return {
      prompt: "σ = <b>" + sigma + "</b>, объём выборки n = <b>" + n +
        "</b>. Чему равна стандартная ошибка среднего? Округлите до сотых.",
      solution: "SE = σ / √n = " + sigma + " / " + Math.sqrt(n) + " = " + fmt(ans) + ".",
      answer: num(ans, 0.02)
    };
  }

  // ---------- вероятность ----------

  function tComb() {
    var n = rndInt(5, 12), k = rndInt(2, 4);
    var ans = C(n, k);
    return {
      prompt: "Сколькими способами можно выбрать <b>" + k + "</b> человек из <b>" + n +
        "</b>? Порядок не важен.",
      solution: "C(" + n + ", " + k + ") = " + n + "! / (" + k + "! · " + (n - k) + "!) = " + ans + ".",
      answer: num(ans, 0.001)
    };
  }

  function tUnion() {
    var pa = rndInt(20, 80), pb = rndInt(20, 80), pab = rndInt(5, Math.min(pa, pb) - 1);
    var ans = pa + pb - pab;
    return {
      prompt: "P(A) = <b>" + pa + "%</b>, P(B) = <b>" + pb + "%</b>, P(A ∩ B) = <b>" + pab +
        "%</b>. Чему равно P(A ∪ B) в процентах?",
      solution: "P(A ∪ B) = P(A) + P(B) − P(A ∩ B) = " + pa + " + " + pb + " − " + pab + " = " + ans + "%.",
      answer: num(ans, 0.02)
    };
  }

  function tBayes() {
    var prev = rndInt(1, 10);
    var sens = rndInt(90, 99);
    var fpr = rndInt(1, 10);
    var p = prev / 100, s = sens / 100, f = fpr / 100;
    var ans = p * s / (p * s + (1 - p) * f) * 100;
    return {
      prompt: "Болезнь встречается у <b>" + prev + "%</b> людей. Тест чувствителен в <b>" + sens +
        "%</b> и даёт <b>" + fpr + "%</b> ложноположительных результатов. Результат положительный. " +
        "Какова вероятность болезни в процентах? Округлите до десятых.",
      solution: "P(B|+) = P(+|B)·P(B) / (P(+|B)·P(B) + P(+|¬B)·P(¬B)) = (" + fmt(s * p * 100, 2) + ") / (" +
        fmt(s * p * 100, 2) + " + " + fmt(f * (1 - p) * 100, 2) + ") = " + fmt(ans, 1) + "%.",
      answer: num(ans, 0.2, 2)
    };
  }

  function tBinom() {
    var n = rndInt(3, 6);
    var p = [0.5, 0.4, 0.3, 0.2, 0.6][rndInt(0, 4)];
    var k = rndInt(1, n - 1);
    var ans = C(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k) * 100;
    return {
      prompt: "Биномиальное распределение: n = <b>" + n + "</b>, p = <b>" + String(p).replace(".", ",") +
        "</b>. Найдите P(X = " + k + ") в процентах. Округлите до десятых.",
      solution: "P(X = " + k + ") = C(" + n + ", " + k + ") · p^k · (1 − p)^(n − k) = " + C(n, k) + " · " +
        fmt(Math.pow(p, k) * Math.pow(1 - p, n - k), 4) + " = " + fmt(ans, 1) + "%.",
      answer: num(ans, 0.2, 2)
    };
  }

  function tDice() {
    var s = rndInt(4, 10);
    var fav = 0;
    for (var a = 1; a <= 6; a++) for (var b = 1; b <= 6; b++) if (a + b === s) fav++;
    return {
      prompt: "Бросают два кубика. Сколько элементарных исходов дают в сумме <b>" + s +
        "</b>? Ответ — число исходов из 36.",
      solution: "Переберём пары: " + fav + " исход(ов). Вероятность = " + fav + " / 36 = " + fmt(fav / 36 * 100, 1) + "%.",
      answer: num(fav, 0.001)
    };
  }

  function tAtLeastOne() {
    var p = rndInt(5, 40);
    var n = rndInt(3, 10);
    var ans = (1 - Math.pow(1 - p / 100, n)) * 100;
    return {
      prompt: "Вероятность успеха в одной попытке <b>" + p + "%</b>, попытки независимы. Какова вероятность " +
        "хотя бы одного успеха за <b>" + n + "</b> попыток? Ответ в процентах, округлите до десятых.",
      solution: "P(хотя бы один) = 1 − (1 − p)ⁿ = 1 − " + fmt(Math.pow(1 - p / 100, n), 4) + " = " + fmt(ans, 1) + "%.",
      answer: num(ans, 0.2, 2)
    };
  }

  // ---------- теория игр ----------

  function nashIn(a, b) {
    var cells = [];
    for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) {
      if (a[i][j] >= a[1 - i][j] && b[i][j] >= b[i][1 - j]) cells.push([i, j]);
    }
    return cells;
  }

  function tNash() {
    var fixed = { a: [[3, 0], [5, 1]], b: [[3, 5], [0, 1]] };
    var a, b, cells, attempt;
    for (attempt = 0; attempt < 3000; attempt++) {
      a = [[0, 0], [0, 0]]; b = [[0, 0], [0, 0]];
      for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) { a[i][j] = rndInt(1, 9); b[i][j] = rndInt(1, 9); }
      cells = nashIn(a, b);
      if (cells.length === 1) break;
    }
    if (attempt >= 3000) { a = fixed.a; b = fixed.b; cells = nashIn(a, b); }
    var ci = cells[0][0], cj = cells[0][1];
    var names = ["A1", "A2", "B1", "B2"];
    var okIdx = ci * 2 + cj;
    return {
      prompt: matrix(a, b) + "<p>Укажите ячейку, которая является равновесием Нэша в чистых стратегиях.</p>",
      solution: "В ячейке " + names[okIdx] + " первый игрок получает " + a[ci][cj] +
        " — не меньше, чем при смене строки (" + a[1 - ci][cj] + "), а второй получает " + b[ci][cj] +
        " — не меньше, чем при смене столбца (" + b[ci][1 - cj] +
        "). Никому не выгодно отклоняться в одиночку.",
      answer: {
        type: "choice",
        options: names.map(function (t, k) { return { text: t, ok: k === okIdx }; })
      }
    };
  }

  function tDominant() {
    var a = [[0, 0], [0, 0]];
    a[0][0] = rndInt(4, 9); a[1][0] = rndInt(1, a[0][0] - 1);
    a[0][1] = rndInt(4, 9); a[1][1] = rndInt(1, a[0][1] - 1);
    return {
      prompt: "<p>Выигрыши первого игрока:</p>" +
        '<table class="matrix"><thead><tr><th></th><th>1</th><th>2</th></tr></thead><tbody>' +
        "<tr><th>A</th><td>" + a[0][0] + "</td><td>" + a[0][1] + "</td></tr>" +
        "<tr><th>B</th><td>" + a[1][0] + "</td><td>" + a[1][1] + "</td></tr>" +
        "</tbody></table><p>Какая стратегия первого игрока строго доминирует?</p>",
      solution: "A даёт больше при любом ответе соперника: " + a[0][0] + " &gt; " + a[1][0] + " в первом столбце и " +
        a[0][1] + " &gt; " + a[1][1] + " во втором. Значит, A строго доминирует B, и рациональный игрок выберет A.",
      answer: {
        type: "choice",
        options: [{ text: "A (верхняя)", ok: true }, { text: "B (нижняя)", ok: false }]
      }
    };
  }

  function tMaximin() {
    var a = [[rndInt(1, 9), rndInt(1, 9)], [rndInt(1, 9), rndInt(1, 9)]];
    var mins = [Math.min(a[0][0], a[0][1]), Math.min(a[1][0], a[1][1])];
    var ans = Math.max(mins[0], mins[1]);
    return {
      prompt: "<p>Выигрыши первого игрока:</p>" +
        '<table class="matrix"><thead><tr><th></th><th>1</th><th>2</th></tr></thead><tbody>' +
        "<tr><th>A</th><td>" + a[0][0] + "</td><td>" + a[0][1] + "</td></tr>" +
        "<tr><th>B</th><td>" + a[1][0] + "</td><td>" + a[1][1] + "</td></tr>" +
        "</tbody></table><p>Чему равен гарантированный выигрыш (максимин)?</p>",
      solution: "Худший исход стратегии A — " + mins[0] + ", стратегии B — " + mins[1] +
        ". Максимин = max(" + mins[0] + ", " + mins[1] + ") = " + ans + ".",
      answer: num(ans, 0.001)
    };
  }

  function tMixed() {
    var a, b, c, d, p, attempt;
    for (attempt = 0; attempt < 3000; attempt++) {
      a = rndInt(1, 9); b = rndInt(1, 9); c = rndInt(1, 9); d = rndInt(1, 9);
      var den = a - b - c + d;
      if (den === 0) continue;
      p = (d - c) / den;
      if (p > 0.05 && p < 0.95) break;
    }
    if (attempt >= 3000) { a = 3; b = 1; c = 0; d = 2; p = (d - c) / (a - b - c + d); }
    var pct = p * 100;
    return {
      prompt: "<p>Игра с нулевой суммой, выигрыши первого игрока:</p>" +
        '<table class="matrix"><thead><tr><th></th><th>1</th><th>2</th></tr></thead><tbody>' +
        "<tr><th>A</th><td>" + a + "</td><td>" + b + "</td></tr>" +
        "<tr><th>B</th><td>" + c + "</td><td>" + d + "</td></tr>" +
        "</tbody></table>" +
        "<p>С какой вероятностью (в процентах) первому игроку выбирать стратегию A, чтобы сопернику было " +
        "безразлично, какой столбец играть?</p>",
      solution: "Приравняем ожидаемые выигрыши столбцов: p·" + a + " + (1 − p)·" + c + " = p·" + b +
        " + (1 − p)·" + d + ". Отсюда p = (d − c) / (a − b − c + d) = (" + d + " − " + c + ") / (" + a + " − " +
        b + " − " + c + " + " + d + ") = " + fmt(p, 3) + ", то есть " + fmt(pct, 1) + "%.",
      answer: num(pct, 0.3, 2)
    };
  }

  // ---------- SQL ----------

  var CITIES = ["Москва", "Казань", "Сочи", "Тверь"];

  function sqlTable(cols, rows) {
    return '<table class="matrix"><thead><tr>' + cols.map(function (c) { return "<th>" + c + "</th>"; }).join("") +
      "</tr></thead><tbody>" + rows.map(function (r) {
        return "<tr>" + r.map(function (c) { return "<td>" + (c === null ? "NULL" : c) + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table>";
  }

  function tSqlWhere() {
    var used = {}, rows = [];
    for (var i = 0; i < 6; i++) {
      var amt;
      do { amt = rndStep(100, 2000, 100); } while (used[amt]);
      used[amt] = 1;
      rows.push([i + 1, CITIES[rndInt(0, 3)], amt]);
    }
    var city = CITIES[rndInt(0, 3)];
    var thr = rndStep(300, 1500, 100);
    var match = rows.filter(function (r) { return r[1] === city && r[2] > thr; });
    return {
      prompt: sqlTable(["id", "city", "amount"], rows) +
        "<p>Сколько строк вернёт запрос?</p>" +
        '<div class="formula">SELECT * FROM orders\nWHERE city = \'' + city + '\' AND amount &gt; ' + thr + ";</div>",
      solution: match.length
        ? "Условию удовлетворяют строки id: " + match.map(function (r) { return r[0]; }).join(", ") +
          " — всего " + match.length + "."
        : "Ни одна строка не проходит оба условия одновременно: результат пуст, то есть 0 строк.",
      answer: num(match.length, 0.001)
    };
  }

  function tSqlDistinct() {
    var rows = [], used = {};
    var n = rndInt(4, 6);
    for (var i = 0; i < n; i++) {
      var amt;
      do { amt = rndStep(100, 900, 100); } while (used[amt]);
      used[amt] = 1;
      rows.push([i + 1, CITIES[rndInt(0, 3)], amt]);
    }
    var uniq = {};
    rows.forEach(function (r) { uniq[r[1]] = 1; });
    var ans = Object.keys(uniq).length;
    return {
      prompt: sqlTable(["id", "city", "amount"], rows) +
        "<p>Сколько вернёт запрос?</p>" +
        '<div class="formula">SELECT COUNT(DISTINCT city) FROM orders;</div>',
      solution: "Уникальные города в таблице: " + Object.keys(uniq).join(", ") + " — всего " + ans +
        ". DISTINCT убирает повторы перед подсчётом.",
      answer: num(ans, 0.001)
    };
  }

  function tSqlGroupHaving() {
    var cols = CITIES.slice(0, 3);
    var rows = [];
    for (var i = 0; i < 9; i++) rows.push([i + 1, cols[rndInt(0, 2)], rndStep(100, 900, 100)]);
    var counts = {};
    rows.forEach(function (r) { counts[r[1]] = (counts[r[1]] || 0) + 1; });
    var k = rndInt(2, 3);
    var groups = Object.keys(counts).filter(function (c) { return counts[c] >= k; });
    return {
      prompt: sqlTable(["id", "city", "amount"], rows) +
        "<p>Сколько строк вернёт запрос?</p>" +
        '<div class="formula">SELECT city, COUNT(*) FROM orders\nGROUP BY city\nHAVING COUNT(*) &gt;= ' + k + ";</div>",
      solution: "Считаем заказы по городам: " + Object.keys(counts).map(function (c) {
        return c + " — " + counts[c];
      }).join(", ") + ". Условие COUNT(*) &gt;= " + k + " выполняют " + groups.length + " город(а) — " +
        (groups.length ? groups.join(", ") : "таких нет") + ".",
      answer: num(groups.length, 0.001)
    };
  }

  function tSqlOrderLimit() {
    var used = {}, rows = [];
    for (var i = 0; i < 6; i++) {
      var amt;
      do { amt = rndStep(100, 2000, 100); } while (used[amt]);
      used[amt] = 1;
      rows.push([i + 1, CITIES[rndInt(0, 3)], amt]);
    }
    var sorted = rows.slice().sort(function (a, b) { return b[2] - a[2]; });
    return {
      prompt: sqlTable(["id", "city", "amount"], rows) +
        "<p>Какое значение amount окажется в единственной строке результата?</p>" +
        '<div class="formula">SELECT amount FROM orders\nORDER BY amount DESC\nLIMIT 1;</div>',
      solution: "ORDER BY amount DESC сортирует по убыванию, LIMIT 1 оставляет первую строку — максимальное значение " +
        sorted[0][2] + ".",
      answer: num(sorted[0][2], 0.001)
    };
  }

  function tSqlNull() {
    var rows = [], nulls = 0;
    for (var i = 0; i < 6; i++) {
      var d = Math.random() < 0.34 ? null : rndStep(5, 50, 5);
      if (d === null) nulls++;
      rows.push([i + 1, CITIES[rndInt(0, 3)], d]);
    }
    if (nulls === 0) { rows[2][2] = null; nulls = 1; }
    if (nulls === 6) { rows[0][2] = 10; nulls = 5; }
    var ans = 6 - nulls;
    return {
      prompt: sqlTable(["id", "city", "discount"], rows) +
        "<p>Сколько вернёт запрос?</p>" +
        '<div class="formula">SELECT COUNT(discount) FROM orders;</div>',
      solution: "COUNT(столбец) считает только непустые значения, NULL игнорируется: 6 − " + nulls +
        " = " + ans + ". COUNT(*) вернул бы 6.",
      answer: num(ans, 0.001)
    };
  }

  function tSqlJoin() {
    var users = [[1, "Москва"], [2, "Казань"], [3, "Сочи"], [4, "Тверь"]];
    var orders = [];
    for (var i = 0; i < 6; i++) orders.push([i + 1, Math.random() < 0.85 ? rndInt(1, 4) : 9]);
    var left = Math.random() < 0.5;
    var inner = orders.filter(function (o) { return o[1] >= 1 && o[1] <= 4; }).length;
    var rowsCount = users.reduce(function (s, u) {
      var c = orders.filter(function (o) { return o[1] === u[0]; }).length;
      return s + Math.max(1, c);
    }, 0);
    var ans = left ? rowsCount : inner;
    return {
      prompt: sqlTable(["id", "city"], users) + "<p>Таблица orders:</p>" +
        sqlTable(["id", "user_id"], orders) +
        "<p>Сколько строк вернёт запрос?</p>" +
        '<div class="formula">SELECT * FROM users\n' + (left ? "LEFT JOIN" : "INNER JOIN") +
        " orders ON orders.user_id = users.id;</div>",
      solution: (left
        ? "LEFT JOIN сохраняет всех пользователей. Каждому пользователю достаётся столько строк, сколько у него заказов, " +
          "а если заказов нет — одна строка с NULL. Заказ с user_id = 9 отброшен: для него нет пары."
        : "INNER JOIN оставляет только совпадения: заказы, у которых user_id есть в users. Заказ с user_id = 9 " +
          "и пользователи без заказов в результат не попадают.") + " Итого " + ans + " строк.",
      answer: num(ans, 0.001)
    };
  }

  function tSqlWindow() {
    var rows = [], tries = 0;
    do {
      rows = [];
      for (var i = 0; i < 7; i++) rows.push([i + 1, CITIES[rndInt(0, 2)], rndStep(100, 900, 100)]);
      tries++;
    } while (tries < 100 && (function () {
      var by = {};
      rows.forEach(function (r) { by[r[1]] = (by[r[1]] || 0) + 1; });
      return !Object.keys(by).some(function (c) { return by[c] >= 2; });
    })());

    var by = {};
    rows.forEach(function (r) { if (!by[r[1]]) by[r[1]] = []; by[r[1]].push(r); });
    var city = Object.keys(by).filter(function (c) {
      var amounts = by[c].map(function (r) { return r[2]; });
      return new Set(amounts).size === amounts.length;
    })[0] || Object.keys(by)[0];
    var group = by[city].slice().sort(function (a, b) { return b[2] - a[2]; });
    var top = group[0];

    return {
      prompt: sqlTable(["id", "city", "amount"], rows) +
        "<p>Какой id получит rn = 1 в городе " + city + "?</p>" +
        '<div class="formula">SELECT id, city, amount,\n  ROW_NUMBER() OVER (PARTITION BY city ORDER BY amount DESC) AS rn\nFROM orders;</div>',
      solution: "PARTITION BY city делит строки на группы по городу, ORDER BY amount DESC сортирует внутри группы. " +
        "В городе " + city + " порядок: " + group.map(function (r) {
          return "id " + r[0] + " (amount " + r[2] + ")";
        }).join(" → ") + ". Первым идёт id " + top[0] + ".",
      answer: num(top[0], 0.001)
    };
  }

  function tSqlAvgNull() {
    var rows = [], sum = 0, cnt = 0;
    for (var i = 0; i < 5; i++) {
      var v = i === 2 ? null : rndStep(100, 900, 100);
      if (v !== null) { sum += v; cnt++; }
      rows.push([i + 1, CITIES[rndInt(0, 3)], v]);
    }
    var ans = sum / cnt;
    return {
      prompt: sqlTable(["id", "city", "amount"], rows) +
        "<p>Чему равно AVG(amount)?</p>" +
        '<div class="formula">SELECT AVG(amount) FROM orders;</div>',
      solution: "AVG игнорирует NULL: сумма " + sum + " делится на " + cnt + " непустых значений, а не на 5. " +
        "Получается " + fmt(ans) + ".",
      answer: num(ans, 0.02)
    };
  }

  // ---------- Excel ----------

  function colLetter(n) { return String.fromCharCode(64 + n); }

  function tXlSumIf() {
    var cats = ["Яблоки", "Груши", "Сливы"];
    var rows = [], sums = {};
    for (var i = 0; i < 6; i++) {
      var c = cats[rndInt(0, 2)];
      var v = rndStep(50, 900, 10);
      rows.push([c, v]);
      sums[c] = (sums[c] || 0) + v;
    }
    var pick = Object.keys(sums)[rndInt(0, Object.keys(sums).length - 1)];
    return {
      prompt: sqlTable(["Товар (A)", "Сумма (B)"], rows) +
        "<p>Что вернёт формула <code>=СУММЕСЛИ(A2:A7;\"" + pick + "\";B2:B7)</code>?</p>",
      solution: "СУММЕСЛИ берёт строки, где в первом диапазоне стоит «" + pick + "», и складывает значения " +
        "из второго диапазона: " + sums[pick] + ".",
      answer: num(sums[pick], 0.001)
    };
  }

  function tXlCountIf() {
    var vals = [];
    for (var i = 0; i < 6; i++) vals.push(rndStep(10, 500, 10));
    var thr = rndStep(100, 400, 50);
    var ans = vals.filter(function (v) { return v > thr; }).length;
    return {
      prompt: sqlTable(["Значение (A)"], vals.map(function (v) { return [v]; })) +
        "<p>Что вернёт формула <code>=СЧЁТЕСЛИ(A2:A7;\">" + thr + "\")</code>?</p>",
      solution: "Критерий \">" + thr + "\" строгий: значение должно быть больше " + thr +
        ". Подходят " + ans + " ячеек.",
      answer: num(ans, 0.001)
    };
  }

  function tXlIf() {
    var score = rndInt(40, 100);
    var grade = score >= 90 ? "5" : score >= 75 ? "4" : score >= 60 ? "3" : "2";
    return {
      prompt: "<p>В ячейке A2 значение <b>" + score + "</b>. Что вернёт формула?</p>" +
        '<div class="formula">=ЕСЛИ(A2&gt;=90;"5";ЕСЛИ(A2&gt;=75;"4";ЕСЛИ(A2&gt;=60;"3";"2")))</div>',
      solution: "Проверки идут вложенно сверху вниз. " + score +
        (score >= 90 ? " ≥ 90, значит «5»." :
         score >= 75 ? " меньше 90, но ≥ 75, значит «4»." :
         score >= 60 ? " меньше 75, но ≥ 60, значит «3»." : " меньше 60, значит «2»."),
      answer: {
        type: "choice",
        options: ["5", "4", "3", "2"].map(function (g) { return { text: g, ok: g === grade }; })
      }
    };
  }

  function tXlVlookup() {
    var products = ["Яблоки", "Груши", "Сливы", "Вишня"];
    var rows = products.map(function (p) { return [p, rndStep(50, 900, 10)]; });
    var pick = products[rndInt(0, 3)];
    var price = rows.filter(function (r) { return r[0] === pick; })[0][1];
    return {
      prompt: sqlTable(["Товар (A)", "Цена (B)"], rows) +
        "<p>Что вернёт формула <code>=ВПР(\"" + pick + "\";A2:B5;2;0)</code>?</p>",
      solution: "ВПР ищет «" + pick + "» в первом столбце диапазона A2:B5 и возвращает значение из столбца 2 " +
        "той же строки. Четвёртый аргумент 0 — точное совпадение. Ответ: " + price + ".",
      answer: num(price, 0.001)
    };
  }

  function tXlPct() {
    var old = rndStep(100, 900, 10);
    var delta = rndInt(5, 40) * (Math.random() < 0.3 ? -1 : 1);
    var now = Math.round(old * (1 + delta / 100));
    var ans = (now - old) / old * 100;
    return {
      prompt: "Выручка была <b>" + old + "</b>, стала <b>" + now +
        "</b>. На сколько процентов она изменилась? Укажите число со знаком.",
      solution: "Изменение = (новое − старое) / старое × 100% = (" + now + " − " + old + ") / " + old +
        " × 100% = " + fmt(ans) + "%.",
      answer: num(ans, 0.05)
    };
  }

  function tXlAbs() {
    var dx = rndInt(1, 3), dy = rndInt(1, 4);
    var correct = "=" + colLetter(1 + dx) + (1 + dy) + "*$B$1";
    var variants = [
      correct,
      "=" + colLetter(1 + dx) + (1 + dy) + "*$B$" + (1 + dy),
      "=A1*$B$1",
      "=A" + (1 + dy) + "*$B$" + (1 + dy)
    ];
    var seen = {};
    variants = variants.filter(function (v) {
      if (seen[v]) return false;
      seen[v] = 1;
      return true;
    });
    return {
      prompt: "<p>В ячейке C1 записана формула <code>=A1*$B$1</code>. Её скопировали в ячейку " +
        colLetter(3 + dx) + (1 + dy) + ". Какая формула получится?</p>",
      solution: "Относительная ссылка A1 сдвигается на столько же столбцов и строк, на сколько сдвинули формулу: " +
        colLetter(3 + dx) + (1 + dy) + " на " + dx + " столбц(а) правее и " + dy + " строк(и) ниже, значит A1 → " +
        colLetter(1 + dx) + (1 + dy) + ". Абсолютная $B$1 не меняется. Итог: " + correct + ".",
      answer: {
        type: "choice",
        options: variants.map(function (v) { return { text: v, ok: v === correct }; })
      }
    };
  }

  // ---------- Python ----------

  var PY_WORDS = ["analytics", "statistics", "python", "dataset", "forecast"];

  function uniqOptions(list) {
    var seen = {}, out = [];
    list.forEach(function (v) {
      if (!seen[v]) { seen[v] = 1; out.push(v); }
    });
    return out;
  }

  function tPySlice() {
    var w = PY_WORDS[rndInt(0, PY_WORDS.length - 1)];
    var a = rndInt(1, 3);
    var b = rndInt(a + 2, Math.min(w.length - 1, a + 5));
    var right = w.slice(a, b);
    var opts = uniqOptions([right, w.slice(a, b + 1), w.slice(a - 1, b), w.slice(a, b - 1)]);
    return {
      prompt: '<div class="formula">s = "' + w + '"\ns[' + a + ":" + b + "]</div>" +
        "<p>Какая строка получится?</p>",
      solution: "Срез берёт символы с индексами от " + a + " до " + (b - 1) + " включительно: правый конец в срез " +
        "не входит. Получается «" + right + "».",
      answer: {
        type: "choice",
        options: opts.map(function (v) { return { text: '"' + v + '"', ok: v === right }; })
      }
    };
  }

  function tPyType() {
    var items = [
      ['type(42)', "int", "целое число без кавычек"],
      ['type("42")', "str", "кавычки делают значение строкой"],
      ["type(3.14)", "float", "есть дробная часть"],
      ["type(True)", "bool", "логическое значение"],
      ["type([1, 2])", "list", "квадратные скобки — список"],
      ['type({"a": 1})', "dict", "фигурные скобки с парами — словарь"]
    ];
    var it = items[rndInt(0, items.length - 1)];
    var pool = ["int", "str", "float", "bool", "list", "dict"].filter(function (t) { return t !== it[1]; });
    var wrong = [pool[rndInt(0, pool.length - 1)], pool[rndInt(0, pool.length - 1)]];
    var opts = uniqOptions([it[1]].concat(wrong)).slice(0, 4);
    return {
      prompt: "<p>Что вернёт выражение <code>" + esc(it[0]) + "</code>?</p>",
      solution: "Это " + it[1] + ": " + it[2] + ".",
      answer: {
        type: "choice",
        options: opts.map(function (t) { return { text: t, ok: t === it[1] }; })
      }
    };
  }

  function tPyConvert() {
    var n = rndInt(10, 99), add = rndInt(1, 30);
    var ans = n + add;
    return {
      prompt: '<div class="formula">int("' + n + '") + ' + add + "</div><p>Чему равно выражение?</p>",
      solution: 'int("' + n + '") превращает строку в число ' + n + ", дальше обычное сложение: " +
        n + " + " + add + " = " + ans + ".",
      answer: num(ans, 0.001)
    };
  }

  function tPyPrec() {
    var a = rndInt(2, 9), b = rndInt(2, 9), c = rndInt(2, 9);
    var bracket = Math.random() < 0.5;
    var ans = bracket ? (a + b) * c : a + b * c;
    return {
      prompt: '<div class="formula">' + (bracket ? "(" + a + " + " + b + ") * " + c : a + " + " + b + " * " + c) +
        "</div><p>Чему равно выражение?</p>",
      solution: bracket
        ? "Сначала скобки: " + a + " + " + b + " = " + (a + b) + ", затем умножение: " + (a + b) + " * " + c +
          " = " + ans + "."
        : "Умножение выполняется раньше сложения: " + b + " * " + c + " = " + b * c + ", затем " + a + " + " +
          b * c + " = " + ans + ".",
      answer: num(ans, 0.001)
    };
  }

  function tPyRange() {
    var a = rndInt(1, 5), b = rndInt(a + 5, a + 15), step = rndInt(1, 3);
    var vals = [];
    for (var v = a; v < b; v += step) vals.push(v);
    var ans = vals.reduce(function (s, x) { return s + x; }, 0);
    return {
      prompt: '<div class="formula">sum(range(' + a + ", " + b + ", " + step + "))</div>" +
        "<p>Чему равна сумма?</p>",
      solution: "range(" + a + ", " + b + ", " + step + ") — это " + vals.join(", ") +
        ": правая граница не входит, шаг " + step + ". Сумма " + ans + ".",
      answer: num(ans, 0.001)
    };
  }

  function tPyBool() {
    var items = [
      ['bool("")', false, "пустая строка"],
      ['bool("0")', true, "строка непустая, даже если внутри ноль"],
      ["bool(0)", false, "ноль"],
      ["bool(0.0)", false, "ноль в виде float"],
      ["bool([])", false, "пустой список"],
      ["bool([0])", true, "список непустой"],
      ['bool(" ")', true, "пробел — тоже символ"],
      ['bool("False")', true, "строка непустая; значение внутри не разбирается"],
      ["bool(None)", false, "None"]
    ];
    var it = items[rndInt(0, items.length - 1)];
    return {
      prompt: "<p>Что вернёт выражение <code>" + esc(it[0]) + "</code>?</p>",
      solution: (it[1] ? "True" : "False") + ": " + it[2] +
        ". Пустые значения и ноль ложны, всё остальное истинно.",
      answer: {
        type: "choice",
        options: [{ text: "True", ok: it[1] }, { text: "False", ok: !it[1] }]
      }
    };
  }

  function tPyFind() {
    var w = PY_WORDS[rndInt(0, PY_WORDS.length - 1)];
    var present = Math.random() < 0.7;
    var sub, ans;
    if (present) {
      var i = rndInt(0, w.length - 4);
      sub = w.substr(i, 3);
      ans = i;
    } else {
      sub = "xyz";
      ans = -1;
    }
    return {
      prompt: '<div class="formula">"' + w + '".find("' + sub + '")</div><p>Что вернёт метод?</p>',
      solution: present
        ? "Подстрока «" + sub + "» начинается с индекса " + ans + ", поэтому find вернёт " + ans + "."
        : "Подстроки «" + sub + "» в строке нет, поэтому find возвращает -1 (а не ошибку).",
      answer: num(ans, 0.001)
    };
  }

  function randList(n, min, max) {
    var a = [];
    for (var i = 0; i < n; i++) a.push(rndInt(min, max));
    return a;
  }

  function tMad() {
    var xs = randList(5, 1, 40);
    var s = xs.slice().sort(function (a, b) { return a - b; });
    var med = s[2];
    var devs = xs.map(function (x) { return Math.abs(x - med); }).sort(function (a, b) { return a - b; });
    var ans = devs[2];
    return {
      prompt: "Найдите медианное абсолютное отклонение (MAD) набора: <b>" + xs.join(", ") + "</b>.",
      solution: "Медиана набора — " + med + ". Абсолютные отклонения по возрастанию: " + devs.join(", ") +
        ". Медиана отклонений — " + ans + ".",
      answer: num(ans, 0.001)
    };
  }

  function tTrimMean() {
    var xs = randList(5, 1, 60);
    var s = xs.slice().sort(function (a, b) { return a - b; });
    var mid = s.slice(1, 4);
    var ans = mid.reduce(function (a, b) { return a + b; }, 0) / 3;
    return {
      prompt: "Найдите усечённое среднее: отбросьте по одному крайнему значению с каждого конца и усредните " +
        "оставшиеся. Набор: <b>" + xs.join(", ") + "</b>. Округлите до сотых.",
      solution: "Упорядочим: " + s.join(", ") + ". Отбрасываем " + s[0] + " и " + s[4] +
        ", среднее оставшихся: (" + mid.join(" + ") + ") / 3 = " + fmt(ans) + ".",
      answer: num(ans, 0.02)
    };
  }

  function tIqr() {
    var xs = randList(8, 1, 50);
    var s = xs.slice().sort(function (a, b) { return a - b; });
    var q1 = (s[1] + s[2]) / 2;
    var q3 = (s[5] + s[6]) / 2;
    var ans = q3 - q1;
    return {
      prompt: "Найдите межквартильный размах (IQR) набора: <b>" + xs.join(", ") + "</b>. " +
        "Нижняя и верхняя половины — по четыре значения.",
      solution: "Упорядочим: " + s.join(", ") + ". Q₁ — медиана нижней половины: (" + s[1] + " + " + s[2] +
        ") / 2 = " + fmt(q1) + ". Q₃ — медиана верхней половины: (" + s[5] + " + " + s[6] + ") / 2 = " + fmt(q3) +
        ". IQR = " + fmt(q3) + " − " + fmt(q1) + " = " + fmt(ans) + ".",
      answer: num(ans, 0.001)
    };
  }

  // ---------- регрессия и классификация ----------

  function tRegPredict() {
    var b0 = rndStep(100, 900, 50);
    var b1 = rndStep(20, 200, 10);
    var x = rndInt(2, 9);
    var y = b0 + b1 * x;
    return {
      prompt: "Уравнение регрессии: <b>ŷ = " + b0 + " + " + b1 + "·x</b>. " +
        "Чему равно предсказание при x = <b>" + x + "</b>?",
      solution: "Подставляем x: " + b0 + " + " + b1 + " × " + x + " = " + y + ".",
      answer: num(y, 0.01)
    };
  }

  function tRegRmse() {
    var pairs = [], se = 0;
    for (var i = 0; i < 3; i++) {
      var y = rndInt(10, 60), p = rndInt(10, 60);
      pairs.push([y, p]);
      se += (y - p) * (y - p);
    }
    var ans = Math.sqrt(se / 3);
    return {
      prompt: "Факт и прогноз по трём наблюдениям: " +
        pairs.map(function (q) { return q[0] + " / " + q[1]; }).join(", ") +
        " (факт / прогноз). Чему равен RMSE? Округлите до сотых.",
      solution: "Ошибки: " + pairs.map(function (q) {
        return q[0] + " − " + q[1] + " = " + (q[0] - q[1]);
      }).join(", ") + ". Сумма квадратов = " + se +
        ", делим на 3 и извлекаем корень: " + fmt(ans) + ".",
      answer: num(ans, 0.02)
    };
  }

  function tRegDummies() {
    var levels = rndInt(3, 6);
    var ans = levels - 1;
    return {
      prompt: "В регрессию со свободным членом включают категориальный признак с <b>" + levels +
        "</b> уровнями. Сколько фиктивных переменных нужно?",
      solution: "P − 1 = " + levels + " − 1 = " + ans + ". Последний уровень определяется остальными; " +
        "добавление ещё одной колонки даёт полную мультиколлинеарность.",
      answer: num(ans, 0.001)
    };
  }


  function tRidgeChoice() {
    return {
      prompt: "Что делает Ridge-регрессия при увеличении λ?",
      solution: "Ridge добавляет штраф λ·Σb². Чем больше λ, тем сильнее коэффициенты стягиваются к нулю; слишком большая λ приводит к недообучению.",
      answer: { type: "choice", options: [
        { text: "Сильнее уменьшает коэффициенты", ok: true },
        { text: "Обнуляет все коэффициенты сразу", ok: false },
        { text: "Увеличивает коэффициенты", ok: false },
        { text: "Отключает свободный член", ok: false }
      ] }
    };
  }

  function tLeakageChoice() {
    return {
      prompt: "Какой признак скорее всего даст утечку target при прогнозе покупки?",
      solution: "Сумма оплаты появляется только после покупки и содержит информацию о целевой переменной. В момент прогноза её ещё нет.",
      answer: { type: "choice", options: [
        { text: "Сумма оплаты за текущий заказ", ok: true },
        { text: "Число визитов за прошлую неделю", ok: false },
        { text: "Город клиента", ok: false },
        { text: "Возраст аккаунта на сегодня", ok: false }
      ] }
    };
  }

  function tClfPrecision() {
    var tp = rndInt(5, 40), fp = rndInt(5, 40);
    var ans = tp / (tp + fp) * 100;
    return {
      prompt: "Модель отметила <b>" + (tp + fp) + "</b> объектов, из них <b>" + tp +
        "</b> действительно относятся к классу 1. Чему равна precision в процентах? Округлите до десятых.",
      solution: "precision = TP / (TP + FP) = " + tp + " / " + (tp + fp) + " = " + fmt(ans, 1) + "%.",
      answer: num(ans, 0.2, 2)
    };
  }

  function tClfRecall() {
    var tp = rndInt(5, 40), fn = rndInt(3, 30);
    var ans = tp / (tp + fn) * 100;
    return {
      prompt: "В данных <b>" + (tp + fn) + "</b> объектов класса 1, модель нашла <b>" + tp +
        "</b>. Чему равен recall в процентах? Округлите до десятых.",
      solution: "recall = TP / (TP + FN) = " + tp + " / " + (tp + fn) + " = " + fmt(ans, 1) + "%.",
      answer: num(ans, 0.2, 2)
    };
  }

  function tClfThreshold() {
    var probs = [];
    for (var i = 0; i < 6; i++) probs.push(Math.round(Math.random() * 100) / 100);
    var thr = [0.3, 0.4, 0.5, 0.6][rndInt(0, 3)];
    var ans = probs.filter(function (p) { return p >= thr; }).length;
    return {
      prompt: "Склонности шести записей: " + probs.map(function (p) { return fmt(p, 2); }).join(", ") +
        ". Порог отсечения <b>" + fmt(thr, 1) + "</b>. Сколько записей будет предсказано как 1?",
      solution: "Отмечаем записи со склонностью не меньше порога: " +
        probs.map(function (p) { return p >= thr ? "1" : "0"; }).join(", ") + ". Итого " + ans + ".",
      answer: num(ans, 0.001)
    };
  }

  function tClfOdds() {
    var b = rndStep(0.2, 1.5, 0.1);
    var ans = Math.exp(b);
    return {
      prompt: "Коэффициент логистической регрессии при признаке равен <b>" + fmt(b, 1) +
        "</b>. Во сколько раз меняются перевесы при росте признака на единицу? Округлите до сотых.",
      solution: "Перевесы умножаются на exp(b) = exp(" + fmt(b, 1) + ") = " + fmt(ans) + ".",
      answer: num(ans, 0.02)
    };
  }

  // ---------- распределения и машинное обучение ----------

  function fact(n) {
    var r = 1;
    for (var i = 2; i <= n; i++) r *= i;
    return r;
  }

  function tPoisson() {
    var lambda = rndInt(1, 6);
    var k = rndInt(0, 4);
    var p = Math.pow(lambda, k) * Math.exp(-lambda) / fact(k) * 100;
    return {
      prompt: "Число событий за час — распределение Пуассона с λ = <b>" + lambda +
        "</b>. Какова вероятность получить ровно <b>" + k +
        "</b> событий? Ответ в процентах, округлите до десятых.",
      solution: "P(X = k) = λᵏ · e^(−λ) / k! = " + Math.pow(lambda, k) + " · " +
        Math.exp(-lambda).toFixed(4) + " / " + fact(k) + " = " + fmt(p / 100, 4) +
        ", то есть " + fmt(p, 1) + "%.",
      answer: num(p, 0.2, 2)
    };
  }

  function tKnnClass() {
    var dists = [1, 2, 3, 4, 5];
    for (var i = dists.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = dists[i]; dists[i] = dists[j]; dists[j] = t;
    }
    var pts = dists.map(function (d) {
      return { d: d, label: Math.random() < 0.5 ? "A" : "B" };
    });
    var nearest = pts.slice().sort(function (a, b) { return a.d - b.d; }).slice(0, 3);
    if (nearest[0].label === nearest[1].label && nearest[1].label === nearest[2].label) {
      nearest[2].label = nearest[2].label === "A" ? "B" : "A";
    }
    var votesA = nearest.filter(function (p) { return p.label === "A"; }).length;
    var ans = votesA >= 2 ? "A" : "B";
    return {
      prompt: "Пять кандидатов: " + pts.map(function (p) {
        return "класс " + p.label + " (d = " + p.d + ")";
      }).join(", ") + ". К какому классу отнесём запись при k = 3?",
      solution: "Три ближайших: " + nearest.map(function (p) {
        return p.label + " (d = " + p.d + ")";
      }).join(", ") + ". Голоса: " + votesA + " за A, " + (3 - votesA) + " за B. Побеждает " + ans + ".",
      answer: {
        type: "choice",
        options: [{ text: "A", ok: ans === "A" }, { text: "B", ok: ans === "B" }]
      }
    };
  }

  function tForestVote() {
    var votes = [];
    for (var i = 0; i < 5; i++) votes.push(Math.random() < 0.5 ? 1 : 0);
    var ones = votes.filter(function (v) { return v === 1; }).length;
    var ans = ones > 2 ? "1" : "0";
    return {
      prompt: "Пять деревьев случайного леса предсказали: <b>" + votes.join(", ") +
        "</b>. Какой класс выберет лес большинством голосов?",
      solution: "Голосов за 1: " + ones + ", за 0: " + (5 - ones) + ". Побеждает класс " + ans + ".",
      answer: {
        type: "choice",
        options: [{ text: "1", ok: ans === "1" }, { text: "0", ok: ans === "0" }]
      }
    };
  }

  function tKmeansAssign() {
    var c1 = rndInt(0, 3);
    var c2 = c1 + rndInt(4, 6);
    var pts = [], guard = 0;
    while (pts.length < 5 && guard++ < 300) {
      var p = rndInt(0, c2 + 3);
      if (Math.abs(p - c1) === Math.abs(p - c2)) continue;
      pts.push(p);
    }
    while (pts.length < 5) pts.push(Math.max(0, c1 - 1));

    var ans = pts.filter(function (p) { return Math.abs(p - c1) < Math.abs(p - c2); }).length;
    return {
      prompt: "Два центроида: <b>" + c1 + "</b> и <b>" + c2 + "</b>. Точки: <b>" + pts.join(", ") +
        "</b>. Сколько точек уйдёт в кластер с центром " + c1 + "?",
      solution: pts.map(function (p) {
        return p + ": до " + c1 + " = " + Math.abs(p - c1) + ", до " + c2 + " = " + Math.abs(p - c2);
      }).join("; ") + ". Ближе к " + c1 + " — " + ans + " точек.",
      answer: num(ans, 0.001)
    };
  }


  function tCalibrationChoice() {
    return {
      prompt: "Модель выдаёт скор 0,8, но положительных среди таких записей только 50%. Что это значит?",
      solution: "Скор не откалиброван: заявленная вероятность не совпадает с фактической частотой. Ранжирование может быть хорошим, но для решения о риске нужна калибровка.",
      answer: { type: "choice", options: [
        { text: "Вероятности не откалиброваны", ok: true },
        { text: "AUC обязательно равен 0,5", ok: false },
        { text: "Порог нужно поставить 0,5", ok: false },
        { text: "Модель нельзя использовать для ранжирования", ok: false }
      ] }
    };
  }

  function tMacroF1() {
    var a = rndStep(40, 90, 10) / 100;
    var b = rndStep(30, 80, 10) / 100;
    var c = rndStep(20, 70, 10) / 100;
    var ans = (a + b + c) / 3;
    return {
      prompt: "F1 по трём классам: <b>" + fmt(a, 1) + "</b>, <b>" + fmt(b, 1) + "</b>, <b>" +
        fmt(c, 1) + "</b>. Чему равен macro-F1?",
      solution: "Macro-F1 — среднее по классам: (" + fmt(a, 1) + " + " + fmt(b, 1) + " + " + fmt(c, 1) +
        ") / 3 = " + fmt(ans, 3) + ".",
      answer: num(ans, 0.02, 3)
    };
  }


  function tSmaCalc() {
    var a = rndInt(60, 150), b = rndInt(60, 150), c = rndInt(60, 150);
    var ans = (a + b + c) / 3;
    return {
      prompt: "Последние три дня продажи были <b>" + a + "</b>, <b>" + b + "</b> и <b>" + c +
        "</b>. Чему равна скользящая средняя с окном 3?",
      solution: "SMA = (" + a + " + " + b + " + " + c + ") / 3 = " + fmt(ans, 2) + ".",
      answer: num(ans, 0.05)
    };
  }

  function tNaiveForecast() {
    var vals = [rndInt(40, 90), rndInt(60, 120), rndInt(50, 140)];
    return {
      prompt: "Продажи за три дня: <b>" + vals.join(", ") + "</b>. Какой прогноз даст наивный метод на следующий день?",
      solution: "Наивный прогноз повторяет последнее известное значение: " + vals[2] + ".",
      answer: num(vals[2], 0.001)
    };
  }

  function tMapeForecast() {
    var a1 = rndStep(80, 140, 10), a2 = rndStep(100, 180, 10);
    var f1 = a1 + rndStep(-20, 20, 10), f2 = a2 + rndStep(-30, 30, 10);
    if (f1 <= 0) f1 = a1 + 10;
    if (f2 <= 0) f2 = a2 + 10;
    var ans = ((Math.abs(f1 - a1) / a1 + Math.abs(f2 - a2) / a2) / 2) * 100;
    return {
      prompt: "Факт: <b>" + a1 + "</b> и <b>" + a2 + "</b>; прогноз: <b>" + f1 + "</b> и <b>" + f2 +
        "</b>. Чему равен MAPE в процентах?",
      solution: "MAPE = среднее относительных ошибок: (|" + f1 + " − " + a1 + "|/" + a1 + " + |" +
        f2 + " − " + a2 + "|/" + a2 + ") / 2 × 100% = " + fmt(ans, 2) + "%.",
      answer: num(ans, 0.05)
    };
  }

  function tAteCalc() {
    var t = rndStep(40, 80, 5), c = t - rndStep(5, 20, 5);
    var ans = (t - c) / 100;
    return {
      prompt: "Средняя конверсия в группе воздействия — <b>" + t + "%</b>, в контрольной — <b>" +
        c + "%</b>. Чему равен ATE в процентных пунктах?",
      solution: "ATE = E[Y|T=1] − E[Y|T=0] = " + t + "% − " + c + "% = " + fmt(ans * 100, 0) + " п.п.",
      answer: num(ans * 100, 0.01)
    };
  }

  function tDiffInDiff() {
    var t0 = rndStep(80, 120, 10), t1 = t0 + rndStep(10, 40, 10);
    var c0 = rndStep(70, 110, 10), c1 = c0 + rndStep(5, 30, 10);
    var ans = (t1 - t0) - (c1 - c0);
    return {
      prompt: "До/после: воздействие <b>" + t0 + " → " + t1 + "</b>, контроль <b>" + c0 + " → " + c1 +
        "</b>. Чему равен эффект diff-in-diff?",
      solution: "DiD = (" + t1 + " − " + t0 + ") − (" + c1 + " − " + c0 + ") = " +
        (t1 - t0) + " − " + (c1 - c0) + " = " + ans + ".",
      answer: num(ans, 0.01)
    };
  }

  function tConfounder() {
    return {
      prompt: "Изучаем эффект скидки на повторную покупку. Какой признак вероятнее всего конфаундер?",
      solution: "Доход клиента влияет и на вероятность получить скидку, и на покупку. Факт покупки — исход, а канал оплаты — скорее следствие.",
      answer: { type: "choice", options: [
        { text: "Доход клиента", ok: true },
        { text: "Факт повторной покупки", ok: false },
        { text: "Номер заказа", ok: false },
        { text: "Цвет кнопки", ok: false }
      ] }
    };
  }


  function tConsentChoice() {
    return {
      prompt: "Какие данные нужны для отчёта по конверсии лендинга?",
      solution: "Для конверсии достаточно идентификатора, события и времени; имя, телефон и адрес не нужны — это лишний риск.",
      answer: { type: "choice", options: [
        { text: "Идентификатор, событие и время", ok: true },
        { text: "Имя, телефон и адрес", ok: false },
        { text: "Паспортные данные", ok: false },
        { text: "Всё, что удалось собрать", ok: false }
      ] }
    };
  }

  function tAnonChoice() {
    return {
      prompt: "Чем псевдонимизация отличается от обезличивания?",
      solution: "При псевдонимизации остаётся ключ, по которому можно восстановить связь с человеком; обезличивание стремится исключить такую возможность.",
      answer: { type: "choice", options: [
        { text: "Псевдонимизацию можно обратить по ключу", ok: true },
        { text: "Псевдонимизация всегда необратима", ok: false },
        { text: "Обезличивание меняет только заголовки", ok: false },
        { text: "Это одно и то же", ok: false }
      ] }
    };
  }

  function tEthicsChoice() {
    return {
      prompt: "Тест повысил удержание, но выросли жалобы и отписки. Что делать?",
      solution: "Этичная оценка смотрит на вред и обратимость, а не только на рост метрики: нужно разобрать жалобы и риски, прежде чем масштабировать.",
      answer: { type: "choice", options: [
        { text: "Разобрать жалобы и риски до масштабирования", ok: true },
        { text: "Масштабировать, раз метрика выросла", ok: false },
        { text: "Скрыть жалобы от команды", ok: false },
        { text: "Отключить сбор обратной связи", ok: false }
      ] }
    };
  }

  function tVizChoice() {
    var cases = [
      { q: "показать, как менялась выручка по месяцам", right: "Линейный график", wrong: ["Круговая диаграмма", "Ящик с усами", "Диаграмма рассеяния"] },
      { q: "сравнить выручку пяти филиалов", right: "Столбиковая диаграмма", wrong: ["Линейный график", "Круговая диаграмма", "Диаграмма рассеяния"] },
      { q: "показать связь цены и спроса по товарам", right: "Диаграмма рассеяния", wrong: ["Столбиковая диаграмма", "Круговая диаграмма", "Линейный график по времени"] },
      { q: "показать доли каналов трафика, которые в сумме дают 100%", right: "Круговая диаграмма", wrong: ["Линейный график", "Ящик с усами", "Диаграмма рассеяния"] },
      { q: "сравнить распределение зарплат по отделам с выбросами", right: "Ящик с усами", wrong: ["Круговая диаграмма", "Диаграмма рассеяния", "Линейный график"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "Задача: " + c.q + ". Какой график подойдёт лучше всего?",
      solution: "Тип графика выбирается по вопросу: здесь подходит «" + c.right + "».",
      answer: { type: "choice", options: opts }
    };
  }

  function tNoteType() {
    var cases = [
      { q: "мысль пришла в метро, записали одной строкой в телефон", right: "Мимолётная", wrong: ["Постоянная", "Проектная"] },
      { q: "разобрали статью и записали вывод своими словами со ссылкой на источник", right: "Постоянная", wrong: ["Мимолётная", "Проектная"] },
      { q: "список задач и черновик отчёта на эту неделю", right: "Проектная", wrong: ["Мимолётная", "Постоянная"] },
      { q: "подчеркнули абзац в книге и закрыли, к записи не возвращались", right: "Мимолётная", wrong: ["Постоянная", "Проектная"] },
      { q: "одна мысль на карточке полными предложениями, со ссылками на другие записи", right: "Постоянная", wrong: ["Мимолётная", "Проектная"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "К какому типу относится заметка: " + c.q + "?",
      solution: "Тип определяется назначением: «" + c.right + "» — так эта запись и должна храниться.",
      answer: { type: "choice", options: opts }
    };
  }


  function tReportFirst() {
    var cases = [
      { q: "выручка выросла на 20%, но период — неполный месяц", right: "Проверить период и базу сравнения", wrong: ["Сразу строить прогноз", "Сменить цвет графика", "Удалить выбросы"] },
      { q: "конверсия выросла с 2% до 4%", right: "Проверить числитель, знаменатель и абсолютный прирост", wrong: ["Считать, что рост ровно 2%", "Сразу внедрять", "Смотреть только на p-value"] },
      { q: "в отчёте показан средний чек, но не указано, входят ли возвраты", right: "Уточнить определение метрики", wrong: ["Доверять цифре", "Удалить метрику", "Считать медиану без данных"] },
      { q: "клиенты стали покупать чаще, но средний чек упал", right: "Проверить, как изменилась общая выручка и её составляющие", wrong: ["Заключить, что стало лучше", "Заключить, что стало хуже", "Игнорировать оба показателя"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "Отчёт: " + c.q + ". Что проверить первым?",
      solution: "Сначала проверяют вопрос, период, определение и базу: «" + c.right + "». Иначе арифметика будет верной, а вывод — нет.",
      answer: { type: "choice", options: opts }
    };
  }

  function tPortfolioProof() {
    var cases = [
      { q: "дашборд с красивыми графиками без исходных данных", right: "Недостаточно: нет воспроизводимости и хода работы", wrong: ["Идеально для портфолио", "Достаточно, если графиков много", "Главное — цветовая палитра"] },
      { q: "ноутбук с SQL, проверками качества и README", right: "Сильный артефакт: виден ход работы и ограничения", wrong: ["Слишком простой", "Не нужен без дашборда", "Нельзя показывать"] },
      { q: "отрицательный результат A/B-теста с интервалом и выводом", right: "Ценный проект: показан дизайн и честный вывод", wrong: ["Неудача, лучше скрыть", "Не считается проектом", "Нужно переделать до значимости"] },
      { q: "скриншот графика без подписи источника", right: "Слабый артефакт: нельзя проверить данные и решение", wrong: ["Достаточно для найма", "Лучше ноутбука", "Главное — аккуратность"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "Что можно сказать о портфолио: " + c.q + "?",
      solution: "Оценивается проверяемость: «" + c.right + "». Исходники, README и ограничения важнее финальной картинки.",
      answer: { type: "choice", options: opts }
    };
  }

  function tBiConversion() {
    var visits = rndInt(2000, 20000);
    var orders = rndInt(50, Math.max(60, Math.floor(visits * 0.08)));
    var ans = orders / visits * 100;
    return {
      prompt: "За неделю <b>" + visits + "</b> визитов и <b>" + orders +
        "</b> заказов. Какова конверсия в заказы, в процентах?",
      solution: "Конверсия = заказы / визиты × 100% = " + orders + " / " + visits + " × 100% = " + fmt(ans, 2) + "%.",
      answer: num(ans, 0.05)
    };
  }

  function tBiChartChoice() {
    var cases = [
      { q: "показать выручку по неделям", right: "Линия", wrong: ["Круговая диаграмма", "Тепловая карта", "Трёхмерные столбики"] },
      { q: "сравнить выручку четырёх каналов", right: "Столбики", wrong: ["Линия", "Круговая диаграмма", "Диаграмма рассеяния"] },
      { q: "показать удержание по когортам и дням", right: "Тепловая карта", wrong: ["Линия", "Круговая диаграмма", "Ящик с усами"] },
      { q: "показать связь цены и числа заказов", right: "Диаграмма рассеяния", wrong: ["Линия по времени", "Круговая диаграмма", "Столбики"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "Задача дашборда: " + c.q + ". Какой тип графика выбрать?",
      solution: "Тип графика определяется вопросом: здесь подходит «" + c.right + "».",
      answer: { type: "choice", options: opts }
    };
  }

  function tDaxChoice() {
    var cases = [
      { q: "посчитать выручку в таблице Sales", right: "SUM(Sales[Amount])", wrong: ["COUNT(Sales[Amount])", "AVERAGE(Sales[Amount])", "MAX(Sales[Amount])"] },
      { q: "посчитать уникальных клиентов", right: "DISTINCTCOUNT(Sales[CustomerId])", wrong: ["COUNT(Sales[CustomerId])", "SUM(Sales[CustomerId])", "AVERAGE(Sales[CustomerId])"] },
      { q: "поделить выручку на заказы без ошибки деления на ноль", right: "DIVIDE([Revenue], [Orders])", wrong: ["[Revenue] / [Orders]", "SUM([Revenue] / [Orders])", "CALCULATE([Revenue]) / [Orders]"] },
      { q: "посчитать продажи за тот же период прошлого года", right: "CALCULATE([Sales], SAMEPERIODLASTYEAR('Date'[Date]))", wrong: ["[Sales] - 1", "SUM([Sales]) / 2", "DIVIDE([Sales], 12)"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "Какое выражение DAX нужно, чтобы " + c.q + "?",
      solution: "Правильный вариант: <code>" + c.right + "</code>. Он соответствует смыслу задачи и не смешивает строки с агрегатами.",
      answer: { type: "choice", options: opts }
    };
  }

  function tLodChoice() {
    var cases = [
      { q: "дата первой покупки каждого клиента", right: "{ FIXED [Customer] : MIN([Order Date]) }", wrong: ["MIN([Order Date])", "{ INCLUDE [Region] : SUM([Sales]) }", "{ EXCLUDE [Category] : SUM([Sales]) }"] },
      { q: "сумма продаж с учётом региона, даже если регион не в графике", right: "{ INCLUDE [Region] : SUM([Sales]) }", wrong: ["{ FIXED [Customer] : MIN([Order Date]) }", "SUM([Sales])", "{ EXCLUDE [Region] : SUM([Sales]) }"] },
      { q: "сумма продаж без разбивки по категории", right: "{ EXCLUDE [Category] : SUM([Sales]) }", wrong: ["SUM([Sales])", "{ INCLUDE [Category] : SUM([Sales]) }", "{ FIXED [Category] : MIN([Sales]) }"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "Какое LOD-выражение Tableau считает: " + c.q + "?",
      solution: "Правильный вариант: <code>" + c.right + "</code>. FIXED задаёт свой уровень, INCLUDE добавляет измерение, EXCLUDE убирает его.",
      answer: { type: "choice", options: opts }
    };
  }

  function tMissingChoice() {
    return {
      prompt: "В поле «возраст» встречаются 999, −3 и пустые значения. Что сделать сначала?",
      solution: "Сначала выяснить смысл значений: 999 и −3 — технические заглушки или ошибки, пусто — отсутствие ответа. Их приводят к NULL, а стратегию заполнения выбирают после этого.",
      answer: { type: "choice", options: [
        { text: "Понять, что означает каждое значение, и привести ошибки к NULL", ok: true },
        { text: "Заменить всё средним", ok: false },
        { text: "Удалить столбец", ok: false },
        { text: "Оставить как есть", ok: false }
      ] }
    };
  }

  function tDataType() {
    return {
      prompt: "Какой тип лучше задать для поля order_date со значениями 2026-01-03?",
      solution: "Это дата. Строка не позволит корректно фильтровать период и считать интервалы; для даты нужен тип DATE или timestamp.",
      answer: { type: "choice", options: [
        { text: "Дата", ok: true },
        { text: "Целое число", ok: false },
        { text: "Текст без изменений", ok: false },
        { text: "Логический", ok: false }
      ] }
    };
  }

  function tDupKey() {
    return {
      prompt: "В таблице 10 строк, но уникальных order_id только 9. Что сделать сначала?",
      solution: "Проверить, откуда дубликат: повторная загрузка, несколько позиций или ошибка ключа. Удалять строки можно только после объяснения причины.",
      answer: { type: "choice", options: [
        { text: "Проверить источник и причину дубликата", ok: true },
        { text: "Удалить первую попавшуюся строку", ok: false },
        { text: "Оставить как есть", ok: false },
        { text: "Умножить суммы на 0,9", ok: false }
      ] }
    };
  }

  function tGrainJoin() {
    return {
      prompt: "10 заказов соединили с 30 позициями по order_id. Сколько строк получится?",
      solution: "JOIN 1:N даёт 30 строк: каждая позиция повторяет заказ. Сумма по заказам после этого задвоится, поэтому позиции сначала агрегируют.",
      answer: { type: "choice", options: [
        { text: "30", ok: true },
        { text: "10", ok: false },
        { text: "40", ok: false },
        { text: "3", ok: false }
      ] }
    };
  }

  function tMissingMNAR() {
    return {
      prompt: "Пропуски в доходе есть только у тех, кто отказался отвечать. Какой это тип пропуска?",
      solution: "MNAR: вероятность пропуска зависит от самого ненаблюдаемого значения. Заполнять медианой вслепую нельзя — это исказит вывод.",
      answer: { type: "choice", options: [
        { text: "MNAR", ok: true },
        { text: "MCAR", ok: false },
        { text: "MAR", ok: false },
        { text: "Обычный шум", ok: false }
      ] }
    };
  }

  function tScaleChoice() {
    return {
      prompt: "Какой метод требует стандартизации признаков перед обучением?",
      solution: "kNN использует расстояния, поэтому крупная шкала одного признака подавляет остальные. Деревья и леса к масштабу устойчивы.",
      answer: { type: "choice", options: [
        { text: "k ближайших соседей", ok: true },
        { text: "Решающее дерево", ok: false },
        { text: "Случайный лес", ok: false },
        { text: "Ни один из них", ok: false }
      ] }
    };
  }

  function tFreshness() {
    return {
      prompt: "Дашборд обновляется ежедневно, но показывает данные недельной давности. Какой тест это поймает?",
      solution: "Нужна проверка свежести: максимальная дата в витрине и время последней успешной загрузки. Без неё старые данные выглядят актуальными.",
      answer: { type: "choice", options: [
        { text: "Проверка максимальной даты и времени загрузки", ok: true },
        { text: "Проверка цветовой палитры", ok: false },
        { text: "Проверка числа столбцов", ok: false },
        { text: "Проверка названия отчёта", ok: false }
      ] }
    };
  }

  function tIdempotent() {
    return {
      prompt: "Ночной ETL случайно запустили дважды за один день. Что должно произойти в хорошем пайплайне?",
      solution: "Повторный запуск должен быть идемпотентным: перезаписать партицию за тот же период, а не добавить её ещё раз. Иначе суммы удвоятся.",
      answer: { type: "choice", options: [
        { text: "Данные за день перезапишутся, дублей не будет", ok: true },
        { text: "Все суммы удвоятся", ok: false },
        { text: "Пайплайн удалит историю", ok: false },
        { text: "Ничего не изменится, но данные останутся старыми", ok: false }
      ] }
    };
  }

  window.TRAINERS = {
    analytics: [tCtr, tFunnel, tRomi, tLtvCac, tAbLift, tRetention],
    statistics: [tMean, tMedian, tVariance, tSd, tZ, tSe, tMad, tTrimMean, tIqr, tPoisson],
    probability: [tComb, tUnion, tBayes, tBinom, tDice, tAtLeastOne],
    gametheory: [tNash, tDominant, tMaximin, tMixed],
    data: [tMissingChoice, tDataType, tDupKey, tGrainJoin, tMissingMNAR, tScaleChoice, tFreshness, tIdempotent],
    sql: [tSqlWhere, tSqlDistinct, tSqlGroupHaving, tSqlOrderLimit, tSqlNull, tSqlJoin, tSqlWindow, tSqlAvgNull],
    excel: [tXlSumIf, tXlCountIf, tXlIf, tXlVlookup, tXlPct, tXlAbs],
    python: [tPySlice, tPyType, tPyConvert, tPyPrec, tPyRange, tPyBool, tPyFind],
    regression: [tRegPredict, tRegRmse, tRegDummies, tRidgeChoice, tLeakageChoice],
    classification: [tClfPrecision, tClfRecall, tClfThreshold, tClfOdds, tCalibrationChoice, tMacroF1],
    ml: [tKnnClass, tForestVote, tKmeansAssign],
    useful: [tVizChoice, tNoteType, tReportFirst, tPortfolioProof],
    ethics: [tConsentChoice, tAnonChoice, tEthicsChoice],
    bi: [tBiConversion, tBiChartChoice, tDaxChoice, tLodChoice],
    timeseries: [tSmaCalc, tNaiveForecast, tMapeForecast],
    causal: [tAteCalc, tDiffInDiff, tConfounder]
  };
})();
