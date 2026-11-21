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

  window.TRAINERS = {
    analytics: [tCtr, tFunnel, tRomi, tLtvCac, tAbLift, tRetention],
    statistics: [tMean, tMedian, tVariance, tSd, tZ, tSe],
    probability: [tComb, tUnion, tBayes, tBinom, tDice, tAtLeastOne],
    gametheory: [tNash, tDominant, tMaximin, tMixed],
    sql: [tSqlWhere, tSqlDistinct, tSqlGroupHaving, tSqlOrderLimit, tSqlNull, tSqlJoin, tSqlWindow, tSqlAvgNull],
    excel: [tXlSumIf, tXlCountIf, tXlIf, tXlVlookup, tXlPct, tXlAbs]
  };
})();
