// Самопроверка логики: node selftest.js
"use strict";

global.window = global;
require("./data.js");
["analytics", "statistics", "gametheory", "probability", "sql", "excel", "python", "regression", "classification", "ml", "useful"]
  .forEach(function (id) { require("./topics/" + id + ".js"); });
require("./trainers.js");
require("./games.js");
require("./progress.js");
require("./search.js");
require("./demos.js");
require("./sandbox.js");
require("./pysandbox.js");
require("./tracks.js");
require("./cheatsheet.js");

var errors = [];
var checks = 0;

function ok(cond, msg) {
  checks++;
  if (!cond) errors.push(msg);
}

// --- структура контента ---
var topicIds = Object.keys(window.TOPICS);
ok(topicIds.length === 11, "ожидалось 11 разделов, найдено " + topicIds.length);

topicIds.forEach(function (id) {
  var t = window.TOPICS[id];
  ok(t.title && t.lead && t.tag, id + ": нет title/lead/tag");
  ok(t.chapters.length >= 4, id + ": меньше 4 глав");
  t.chapters.forEach(function (c, i) {
    ok(c.title && c.html && c.html.length > 300, id + ": глава " + i + " пустая");
  });
  ok(t.quiz.length >= 8, id + ": меньше 8 вопросов");
  t.quiz.forEach(function (q, i) {
    ok(q.options.length >= 3, id + " q" + i + ": меньше 3 вариантов");
    ok(q.correct === 0, id + " q" + i + ": правильный вариант должен быть первым");
    ok(q.explain && q.explain.length > 10, id + " q" + i + ": нет разбора");
    ok(new Set(q.options).size === q.options.length, id + " q" + i + ": дубли вариантов");
  });
});

// --- ссылки внутри глав ---
var linkRe = /href="#\/([a-z]+)(?:\/([a-z0-9]+))?(?:\/(\d+))?"/g;
topicIds.forEach(function (id) {
  window.TOPICS[id].chapters.forEach(function (c, ci) {
    var m;
    linkRe.lastIndex = 0;
    while ((m = linkRe.exec(c.html))) {
      var route = m[1], a = m[2], b = m[3];
      var good;
      if (route === "theory") {
        good = !!(a && window.TOPICS[a] && (b === undefined || window.TOPICS[a].chapters[Number(b)]));
      } else if (route === "quiz" || route === "trainer") {
        good = !!(a && window.TOPICS[a]);
      } else if (route === "games") {
        good = !!(a && window.GAMES[a]);
      } else if (route === "demos") {
        good = !!(a && window.DEMOS[a]);
      } else {
        good = ["sandbox", "pysandbox", "path", "cheatsheet", "search"].indexOf(route) >= 0 && !a;
      }
      ok(good, id + ": битая ссылка #/" + route + (a ? "/" + a : "") + (b ? "/" + b : "") + " в главе " + ci);
    }
  });
});

ok(Array.isArray(window.TRACKS) && window.TRACKS.length === 3, "маршруты: ожидалось 3");
window.TRACKS.forEach(function (t) {
  ok(t.title && t.tag && t.steps.length >= 6, "маршрут " + t.id + " неполный");
  t.steps.forEach(function (s) {
    ok(window.TOPICS[s[0]] && window.TOPICS[s[0]].chapters[s[1]], "маршрут " + t.id + ": битый шаг " + s.join("/"));
  });
});

ok(Array.isArray(window.CHEATSHEET) && window.CHEATSHEET.length >= 10, "шпаргалка: мало строк");
window.CHEATSHEET.forEach(function (r, i) {
  ok(r.task && r.main && r.check, "шпаргалка: строка " + i + " неполная");
});

ok(Object.keys(window.TRAINERS).length === 11, "тренажёры есть не для всех разделов");
topicIds.forEach(function (id) {
  ok(window.TRAINERS[id] && window.TRAINERS[id].length > 0, id + ": нет тренажёров");
});

ok(Object.keys(window.GAMES).length === 6, "ожидалось 6 игр");

// --- генераторы задач: 300 прогонов на каждый ---
topicIds.forEach(function (id) {
  (window.TRAINERS[id] || []).forEach(function (gen, gi) {
    var name = id + "/gen" + gi;
    for (var run = 0; run < 300; run++) {
      var task = gen();
      ok(typeof task.prompt === "string" && task.prompt.length > 3, name + ": нет условия");
      ok(typeof task.solution === "string" && task.solution.length > 3, name + ": нет решения");
      var a = task.answer;
      ok(a && (a.type === "number" || a.type === "choice"), name + ": неверный тип ответа");

      if (a.type === "number") {
        ok(isFinite(a.value), name + ": ответ не число");
        ok(a.tol > 0 && a.tol < 100, name + ": подозрительный допуск " + a.tol);
        var exact = String(a.value);
        ok(window.checkAnswer(task, exact), name + ": точный ответ не принят (" + exact + ")");
        ok(!window.checkAnswer(task, String(a.value + a.tol * 10 + 1)), name + ": принимает заведомо неверный ответ");
        ok(!window.checkAnswer(task, ""), name + ": принимает пустой ответ");
        ok(!window.checkAnswer(task, "abc"), name + ": принимает мусор");
      } else {
        ok(a.options.filter(function (o) { return o.ok; }).length === 1, name + ": должен быть ровно один верный вариант");
        var idx = a.options.findIndex(function (o) { return o.ok; });
        ok(window.checkAnswer(task, String(idx)), name + ": верный вариант не принят");
        ok(!window.checkAnswer(task, String((idx + 1) % a.options.length)), name + ": принимает неверный вариант");
      }
    }
  });
});

// --- конкретные значения ---
// Сочетания считаются вручную: сверяем отдельную реализацию с известными значениями.
function testCombFormula() {
  function C(n, k) { var r = 1; for (var i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }
  var known = [[5, 2, 10], [6, 3, 20], [10, 3, 120], [45, 6, 8145060], [12, 4, 495]];
  known.forEach(function (row) { ok(C(row[0], row[1]) === row[2], "C(" + row[0] + "," + row[1] + ") != " + row[2]); });
}
testCombFormula();

// Равновесие Нэша в известных матрицах
function nashCells(a, b) {
  var out = [];
  for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) {
    if (a[i][j] >= a[1 - i][j] && b[i][j] >= b[i][1 - j]) out.push(i + "," + j);
  }
  return out;
}
ok(nashCells([[3, 0], [5, 1]], [[3, 5], [0, 1]]).join("|") === "1,1", "дилемма заключённого: ожидалось (1,1)");
ok(nashCells([[1, 0], [0, 1]], [[0, 1], [1, 0]]).length === 0, "орлянка не должна иметь чистого равновесия");

// Яндекс-стиль ответа: запятая вместо точки и проценты
var unionTask = { answer: { type: "number", value: 45.5, tol: 0.02 } };
ok(window.checkAnswer(unionTask, "45,5"), "не принимает ответ с запятой");
ok(window.checkAnswer(unionTask, " 45.5 % "), "не принимает ответ с пробелами и знаком процента");

// --- прогресс ---
ok(typeof window.PROGRESS === "object", "PROGRESS не загрузился");
if (window.PROGRESS) {
  window.PROGRESS.clear();
  ok(window.PROGRESS.readCount("sql") === 0, "после сброса прочитанных глав 0");

  window.PROGRESS.setRead("sql", 1, true);
  ok(window.PROGRESS.isRead("sql", 1), "глава не отметилась");
  ok(window.PROGRESS.readCount("sql") === 1, "readCount неверен");
  window.PROGRESS.setRead("sql", 1, false);
  ok(!window.PROGRESS.isRead("sql", 1), "глава не снялась");

  var rec = window.PROGRESS.recordQuiz("sql", [{ idx: 0, ok: true }, { idx: 5, ok: false }]);
  ok(rec.best === 1 && rec.total === 2, "recordQuiz: best/total = " + rec.best + "/" + rec.total);
  ok(rec.review.indexOf(5) >= 0 && rec.review.indexOf(0) < 0, "review собрал не те индексы: " + rec.review);

  var rec2 = window.PROGRESS.recordQuiz("sql", [{ idx: 5, ok: true }]);
  ok(rec2.review.length === 0, "review не очистился после верного ответа");
  ok(rec2.best === 1, "лучший результат не должен уменьшаться");

  var sum = window.PROGRESS.summary(window.TOPICS);
  ok(sum.chapters === 0 && sum.totalChapters >= 25, "summary: " + sum.chapters + "/" + sum.totalChapters);
  window.PROGRESS.clear();
}

// --- поиск и deep links ---
ok(typeof window.SEARCH === "object", "SEARCH не загрузился");
if (window.SEARCH) {
  var index = window.SEARCH.index(window.TOPICS);
  ok(index.length > 25, "индекс слишком мал: " + index.length);
  ok(index.every(function (e) { return /^#\/(theory\/[a-z]+\/\d+|quiz\/[a-z]+)$/.test(e.href); }),
    "в индексе есть ссылка неверного вида");

  var bayes = window.SEARCH.find(index, "байес");
  ok(bayes.length > 0, "поиск не нашёл «Байес»");
  ok(bayes.some(function (h) { return h.entry.href.indexOf("#/theory/probability") === 0; }),
    "поиск по «Байес» не нашёл главу про формулу Байеса");

  var windows = window.SEARCH.find(index, "оконн");
  ok(windows.some(function (h) { return h.entry.href === "#/theory/sql/5"; }), "глава про оконные функции не найдена");
  ok(window.SEARCH.find(index, "б").length === 0, "запрос из одного символа должен отбрасываться");
  ok(window.SEARCH.find(index, "ъъъъъ").length === 0, "мусорный запрос что-то нашёл");
}

// --- демо и песочница ---
ok(Object.keys(window.DEMOS).length === 9, "демонстраций: " + Object.keys(window.DEMOS).length);
Object.keys(window.DEMOS).forEach(function (id) {
  var d = window.DEMOS[id];
  ok(d.title && d.tag && typeof d.mount === "function", "демо " + id + " неполное");
});
ok(typeof window.SANDBOX === "object" && typeof window.SANDBOX.mount === "function", "SANDBOX не загрузился");
ok(typeof window.PYSANDBOX === "object" && typeof window.PYSANDBOX.mount === "function", "PYSANDBOX не загрузился");

if (errors.length) {
  console.error("Провалено проверок: " + errors.length + " из " + checks);
  errors.slice(0, 20).forEach(function (e) { console.error(" - " + e); });
  process.exit(1);
}
console.log("Все проверки пройдены: " + checks);
