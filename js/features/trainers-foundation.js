// Тренажёры: статистика, вероятность, теория игр, SQL, Excel и Python.
(function () {
  "use strict";
  var U = window.TRAINER_UTILS;
  var rndInt = U.rndInt, rndStep = U.rndStep, round = U.round, fmt = U.fmt, C = U.C, num = U.num;
  var parseNum = U.parseNum, esc = U.esc, matrix = U.matrix, sample = U.sample, meanOf = U.meanOf;
  var varOf = U.varOf, nashIn = U.nashIn, sqlTable = U.sqlTable, colLetter = U.colLetter, uniqOptions = U.uniqOptions;
  var randList = U.randList, fact = U.fact;
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
    var wrong = [];
    while (wrong.length < 3) {
      var cand = pool[rndInt(0, pool.length - 1)];
      if (wrong.indexOf(cand) === -1) wrong.push(cand);
    }
    var opts = [it[1]].concat(wrong);
    for (var si = opts.length - 1; si > 0; si--) {
      var sj = rndInt(0, si);
      var tmp = opts[si]; opts[si] = opts[sj]; opts[sj] = tmp;
    }
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


  window.TRAINER_FNS.tMean = tMean;
  window.TRAINER_FNS.tMedian = tMedian;
  window.TRAINER_FNS.tVariance = tVariance;
  window.TRAINER_FNS.tSd = tSd;
  window.TRAINER_FNS.tZ = tZ;
  window.TRAINER_FNS.tSe = tSe;
  window.TRAINER_FNS.tComb = tComb;
  window.TRAINER_FNS.tUnion = tUnion;
  window.TRAINER_FNS.tBayes = tBayes;
  window.TRAINER_FNS.tBinom = tBinom;
  window.TRAINER_FNS.tDice = tDice;
  window.TRAINER_FNS.tAtLeastOne = tAtLeastOne;
  window.TRAINER_FNS.tNash = tNash;
  window.TRAINER_FNS.tDominant = tDominant;
  window.TRAINER_FNS.tMaximin = tMaximin;
  window.TRAINER_FNS.tMixed = tMixed;
  window.TRAINER_FNS.tSqlWhere = tSqlWhere;
  window.TRAINER_FNS.tSqlDistinct = tSqlDistinct;
  window.TRAINER_FNS.tSqlGroupHaving = tSqlGroupHaving;
  window.TRAINER_FNS.tSqlOrderLimit = tSqlOrderLimit;
  window.TRAINER_FNS.tSqlNull = tSqlNull;
  window.TRAINER_FNS.tSqlJoin = tSqlJoin;
  window.TRAINER_FNS.tSqlWindow = tSqlWindow;
  window.TRAINER_FNS.tSqlAvgNull = tSqlAvgNull;
  window.TRAINER_FNS.tXlSumIf = tXlSumIf;
  window.TRAINER_FNS.tXlCountIf = tXlCountIf;
  window.TRAINER_FNS.tXlIf = tXlIf;
  window.TRAINER_FNS.tXlVlookup = tXlVlookup;
  window.TRAINER_FNS.tXlPct = tXlPct;
  window.TRAINER_FNS.tXlAbs = tXlAbs;
  window.TRAINER_FNS.tPySlice = tPySlice;
  window.TRAINER_FNS.tPyType = tPyType;
  window.TRAINER_FNS.tPyConvert = tPyConvert;
  window.TRAINER_FNS.tPyPrec = tPyPrec;
  window.TRAINER_FNS.tPyRange = tPyRange;
  window.TRAINER_FNS.tPyBool = tPyBool;
  window.TRAINER_FNS.tPyFind = tPyFind;
})();
