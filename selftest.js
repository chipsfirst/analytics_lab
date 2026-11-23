// Самопроверка логики: node selftest.js
"use strict";

global.window = global;
require("./js/data.js");
(window.TOPIC_ORDER || []).forEach(function (id) {
  require("./js/topics/" + id + ".js");
});
require("./js/features/trainers.js");
require("./js/features/dbt-project.js");
require("./js/features/games.js");
require("./js/core/progress.js");
require("./js/core/achievements.js");
require("./js/core/glossary.js");
require("./js/core/search.js");
require("./js/features/demos.js");
require("./js/sandboxes/sql.js");
require("./js/sandboxes/python.js");
require("./js/core/tracks.js");
require("./js/core/cheatsheet.js");

var errors = [];
var checks = 0;

function ok(cond, msg) {
  checks++;
  if (!cond) errors.push(msg);
}

// --- структура контента ---
var topicIds = Object.keys(window.TOPICS);
ok(topicIds.length === 18, "ожидалось 18 разделов, найдено " + topicIds.length);
ok((window.TOPIC_ORDER || []).join() === topicIds.join(), "порядок TOPIC_ORDER не совпадает с порядком загрузки разделов");

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

var totalChapters = topicIds.reduce(function (n, id) { return n + window.TOPICS[id].chapters.length; }, 0);
var totalQuiz = topicIds.reduce(function (n, id) { return n + window.TOPICS[id].quiz.length; }, 0);
var totalTrainers = topicIds.reduce(function (n, id) { return n + (window.TRAINERS[id] || []).length; }, 0);
ok(totalChapters === 151, "глав: " + totalChapters);
ok(totalQuiz === 305, "вопросов: " + totalQuiz);
ok(totalTrainers === 96, "тренажёров: " + totalTrainers);

var seenQuestions = Object.create(null);
topicIds.forEach(function (id) {
  window.TOPICS[id].quiz.forEach(function (q, i) {
    var key = q.q.toLowerCase().replace(/\s+/g, " ").trim();
    ok(!seenQuestions[key], id + " q" + i + ": дубль вопроса «" + q.q.slice(0, 50) + "»");
    seenQuestions[key] = true;
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

ok(window.DBT_PROJECT && typeof window.DBT_PROJECT.page === "function" && typeof window.DBT_PROJECT.bind === "function", "dbt-проект: страница не загрузилась");
ok(window.ACHIEVEMENTS && typeof window.ACHIEVEMENTS.list === "function" && window.ACHIEVEMENTS.total() >= 10, "достижения: модуль не загрузился");
ok(Array.isArray(window.TRACKS) && window.TRACKS.length === 7, "маршруты: ожидалось 7");
ok(window.TOPICS.production && window.TOPICS.production.chapters.length === 6 && window.TOPICS.production.quiz.length === 12, "production: 6 глав / 12 вопросов");
ok(window.TOPICS.analytics && window.TOPICS.analytics.chapters.length === 10 && window.TOPICS.analytics.quiz.length === 25, "analytics: 10 глав / 25 вопросов");
ok(window.TOPICS.gametheory && window.TOPICS.gametheory.chapters.length === 9 && window.TOPICS.gametheory.quiz.length === 16, "gametheory: 9 глав / 16 вопросов");
ok(window.TOPICS.cs && window.TOPICS.cs.chapters.length === 6 && window.TOPICS.cs.quiz.length === 12, "cs: 6 глав / 12 вопросов");
ok((window.TRAINERS.production || []).length === 3, "production: тренажёры");
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

ok(Object.keys(window.TRAINERS).length === 18, "тренажёры есть не для всех разделов");
topicIds.forEach(function (id) {
  ok(window.TRAINERS[id] && window.TRAINERS[id].length > 0, id + ": нет тренажёров");
});

ok(Object.keys(window.GAMES).length === 10, "ожидалось 10 игр");

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
  ok(index.every(function (e) { return /^#\/(theory\/[a-z]+\/\d+|quiz\/[a-z]+|glossary\/[a-z0-9-]+)$/.test(e.href); }),
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
ok(Object.keys(window.DEMOS).length === 10, "демонстраций: " + Object.keys(window.DEMOS).length);
Object.keys(window.DEMOS).forEach(function (id) {
  var d = window.DEMOS[id];
  ok(d.title && d.tag && typeof d.mount === "function", "демо " + id + " неполное");
});
ok(typeof window.SANDBOX === "object" && typeof window.SANDBOX.mount === "function", "SANDBOX не загрузился");
ok(typeof window.PYSANDBOX === "object" && typeof window.PYSANDBOX.mount === "function", "PYSANDBOX не загрузился");

// --- датасеты: проверяем только в Node, браузерный прогон их пропускает ---
if (typeof process !== "undefined" && process.versions && process.versions.node) {
  var fs = require("fs");
  function parseCsvLine(line) {
    var cells = [], cur = "", quoted = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') quoted = false;
        else cur += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ",") { cells.push(cur); cur = ""; }
      else cur += ch;
    }
    cells.push(cur);
    return cells;
  }
  function csv(name) {
    var lines = fs.readFileSync("data/" + name, "utf8").trim().split(/\r?\n/);
    var head = parseCsvLine(lines.shift());
    return lines.map(function (line) {
      var cells = parseCsvLine(line), row = {};
      head.forEach(function (h, i) { row[h] = cells[i]; });
      return row;
    });
  }
  function complete(rows) {
    return rows.every(function (r) {
      return Object.keys(r).every(function (k) { return r[k] !== ""; });
    });
  }
  var ab = csv("ab-test.csv");
  ok(ab.length === 1200 && complete(ab), "ab-test: строки/пропуски");
  ok(new Set(ab.map(function (r) { return r.user_id; })).size === 1200, "ab-test: user_id не уникален");
  ok(ab.filter(function (r) { return r.group === "A"; }).length === 600, "ab-test: группа A");
  ok(ab.filter(function (r) { return r.group === "B" && r.converted === "1"; }).length === 87, "ab-test: конверсии B");

  var co = csv("case-orders.csv");
  ok(co.length === 800 && complete(co), "case-orders: строки/пропуски");
  ok(co.filter(function (r) { return r.group === "A" && Number(r.orders) > 0; }).length === 43, "case-orders: покупатели A");
  ok(co.filter(function (r) { return r.group === "B" && Number(r.orders) > 0; }).length === 53, "case-orders: покупатели B");

  var ch = csv("churn.csv");
  ok(ch.length === 600 && complete(ch), "churn: строки/пропуски");
  ok(ch.filter(function (r) { return r.churned === "1"; }).length === 128, "churn: ушедшие");
  ok(ch.filter(function (r) { return r.churned === "1"; })
    .reduce(function (n, r) { return n + Number(r.monthly_charges || 0); }, 0) === 125320, "churn: выручка под риском");

  var mk = csv("marketing.csv");
  ok(mk.length === 90 && complete(mk), "marketing: строки/пропуски");
  var mkSpend = mk.reduce(function (n, r) { return n + Number(r.spend); }, 0);
  var mkRev = mk.reduce(function (n, r) { return n + Number(r.revenue); }, 0);
  var mkMail = mk.filter(function (r) { return r.channel === "Email"; });
  var mailRoas = mkMail.reduce(function (n, r) { return n + Number(r.revenue); }, 0) / mkMail.reduce(function (n, r) { return n + Number(r.spend); }, 0);
  ok(Math.abs(mkRev / mkSpend - 9.85) < 0.01, "marketing: ROAS");
  ok(Math.abs(mailRoas - 40.79) < 0.01, "marketing: Email ROAS");

  var bi = csv("bi-orders.csv");
  ok(bi.length === 28 && complete(bi), "bi-orders: строки/пропуски");
  var net = bi.filter(function (r) { return r.returned === "0"; })
    .reduce(function (n, r) { return n + Number(r.revenue); }, 0);
  ok(bi.filter(function (r) { return r.returned === "1"; }).length === 3, "bi-orders: возвраты");
  ok(net === 268100, "bi-orders: выручка без возвратов");
  ok(Math.round(net / 28) === 9575 && Math.round(net / 25) === 10724, "bi-orders: AOV");

  var dirty = csv("dirty-customers.csv");
  ok(dirty.length === 24, "dirty-customers: строки");
  ok(new Set(dirty.map(function (r) { return r.customer_id; })).size === 22, "dirty-customers: уникальные клиенты");
  ok(dirty.filter(function (r) { return !r.email || !r.email.trim(); }).length === 3, "dirty-customers: пропуски email");
  ok(dirty[0].amount === "1 200,50" && dirty[0].status === "active", "dirty-customers: кавычки и запятая в сумме");
  ok(new Set(dirty.filter(function (r) { return r.city.trim().toLowerCase() === "москва"; })
    .map(function (r) { return r.customer_id; })).size === 10, "dirty-customers: Москва");

  var ru = csv("retail-users.csv");
  ok(ru.length === 2000 && new Set(ru.map(function (r) { return r.user_id; })).size === 2000, "retail-users: строки/ключи");

  var ro = csv("retail-orders.csv");
  ok(ro.length === 10020, "retail-orders: строки");
  var orderMap = {};
  ro.forEach(function (r) { orderMap[r.order_id] = r; });
  ok(Object.keys(orderMap).length === 10000, "retail-orders: уникальные заказы");
  var paid = Object.keys(orderMap).map(function (k) { return orderMap[k]; })
    .filter(function (r) { return r.status === "paid"; });
  ok(paid.length === 7981, "retail-orders: оплаченные");
  ok(paid.reduce(function (n, r) { return n + Number(r.amount); }, 0) === 21984503, "retail-orders: выручка");
  ok(Object.keys(orderMap).filter(function (k) { return !orderMap[k].user_id; }).length === 334, "retail-orders: пропуски user_id");

  var re = csv("retail-events.csv");
  ok(re.length === 15000, "retail-events: строки");
  var viewers = new Set(re.filter(function (r) { return r.event_type === "view"; }).map(function (r) { return r.user_id; }));
  var buyers = new Set(re.filter(function (r) { return r.event_type === "purchase"; }).map(function (r) { return r.user_id; }));
  ok(Math.abs(100 * buyers.size / viewers.size - 3.66) < 0.01, "retail-events: конверсия");

  var rm = csv("retail-marketing.csv");
  ok(rm.length === 270, "retail-marketing: строки");
  var minCac = null;
  ["paid_search", "social", "email"].forEach(function (ch) {
    var rows = rm.filter(function (r) { return r.channel === ch; });
    var cac = rows.reduce(function (n, r) { return n + Number(r.spend); }, 0) /
      rows.reduce(function (n, r) { return n + Number(r.signups); }, 0);
    if (minCac === null || cac < minCac) minCac = cac;
  });
  ok(Math.abs(minCac - 177.37) < 0.01, "retail-marketing: минимальный CAC");

  var su = csv("sub-users.csv");
  ok(su.length === 3000 && new Set(su.map(function (r) { return r.user_id; })).size === 3000, "sub-users: строки/ключи");

  var ss = csv("sub-subscriptions.csv");
  ok(ss.length === 3604 && new Set(ss.map(function (r) { return r.subscription_id; })).size === 3604, "sub-subscriptions: строки/ключи");

  var sp = csv("sub-payments.csv");
  ok(sp.length === 20672, "sub-payments: строки");
  var paySeen = {}, payUnique = [];
  sp.forEach(function (r) { if (!paySeen[r.payment_id]) { paySeen[r.payment_id] = 1; payUnique.push(r); } });
  ok(payUnique.length === 20657 && sp.length - payUnique.length === 15, "sub-payments: дубли");
  ok(payUnique.filter(function (r) { return !r.user_id; }).length === 120, "sub-payments: пропуски user_id");

  var st = csv("sub-tickets.csv");
  ok(st.length === 2000, "sub-tickets: строки");
  ok(st.filter(function (r) { return !r.satisfaction; }).length === 158, "sub-tickets: пропуски satisfaction");
}

if (errors.length) {
  console.error("Провалено проверок: " + errors.length + " из " + checks);
  errors.slice(0, 20).forEach(function (e) { console.error(" - " + e); });
  process.exit(1);
}
console.log("Все проверки пройдены: " + checks);
