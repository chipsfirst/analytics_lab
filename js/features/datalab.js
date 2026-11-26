// Практика на данных: задачи по CSV.
(function () {
  "use strict";
  var LAB = window.LAB;
  function datalabPage() {
    var datasets = [
      ["ab-test.csv", "A/B-тест", "1 200 пользователей, группы A и B, конверсия и выручка.", "user_id, group, converted, revenue"],
      ["churn.csv", "Отток", "600 клиентов: срок, платеж, обращения в поддержку, факт оттока.", "customer_id, tenure_months, monthly_charges, support_calls, churned"],
      ["marketing.csv", "Маркетинг", "30 дней по трём каналам, 90 строк: расходы, клики, конверсии, выручка.", "date, channel, spend, clicks, conversions, revenue"],
      ["dirty-customers.csv", "Грязные данные", "24 строки: дубли, пропуски, разные форматы дат, городов и сумм.", "customer_id, name, email, city, signup_date, amount, status"]
    ];
    var tasks = [
      ["ab1", "A/B-тест", "Сколько всего пользователей в файле?", "SELECT COUNT(*) FROM ab;", 1200, 0.5],
      ["ab2", "A/B-тест", "Сколько конверсий в группе B?", "SELECT SUM(converted) FROM ab WHERE group = 'B';", 87, 0.5],
      ["ab3", "A/B-тест", "Конверсия группы B, %", "100.0 * AVG(converted) для группы B", 14.5, 0.1],
      ["ab4", "A/B-тест", "Выручка на пользователя в группе B, ₽", "SUM(revenue) / COUNT(*) для группы B", 145.5, 0.1],
      ["ch1", "Отток", "Сколько клиентов в файле?", "SELECT COUNT(*) FROM churn;", 600, 0.5],
      ["ch2", "Отток", "Доля оттока, %", "100.0 * AVG(churned)", 21.3, 0.1],
      ["ch3", "Отток", "Средний срок ушедших клиентов, месяцев", "AVG(tenure_months) WHERE churned = 1", 22.4, 0.2],
      ["ch4", "Отток", "Ежемесячная выручка под риском, ₽", "SUM(monthly_charges) WHERE churned = 1", 125320, 1],
      ["mk1", "Маркетинг", "Сколько строк в файле?", "SELECT COUNT(*) FROM marketing;", 90, 0.5],
      ["mk2", "Маркетинг", "Общий ROAS (выручка / расходы)", "SUM(revenue) / SUM(spend)", 9.85, 0.05],
      ["mk3", "Маркетинг", "ROAS канала Email", "SUM(revenue) / SUM(spend) для Email", 40.79, 0.1],
      ["mk4", "Маркетинг", "CAC по всем каналам, ₽", "SUM(spend) / SUM(conversions)", 126.0, 1],
      ["dr1", "Грязные данные", "Сколько уникальных клиентов (различных customer_id)?", "COUNT(DISTINCT customer_id)", 22, 0.5],
      ["dr2", "Грязные данные", "Сколько строк без email?", "COUNT(*) WHERE email пустой", 3, 0.5],
      ["dr3", "Грязные данные", "Сколько уникальных клиентов из Москвы после нормализации города?", "TRIM(LOWER(city)) = 'москва', затем COUNT(DISTINCT customer_id)", 10, 0.5]
    ];
    function task(t) {
      return '<div class="card dl-task" data-task="' + t[0] + '"><p class="meta">' + LAB.esc(t[1]) + "</p>" +
        "<h3>" + LAB.esc(t[2]) + "</h3>" +
        '<div class="answer-row"><label class="sr-only" for="dl-' + t[0] + '">Ответ</label>' +
        '<input type="text" inputmode="decimal" id="dl-' + t[0] + '" placeholder="Ответ">' +
        '<button class="btn" data-dl="' + t[0] + '" data-answer="' + t[4] + '" data-tol="' + t[5] + '">Проверить</button></div>' +
        '<p class="meta"><code>' + LAB.esc(t[3]) + "</code></p></div>";
    }
    return "<h1>Практика на данных</h1>" +
      '<p class="lead">Четыре учебных датасета и ' + tasks.length + ' задач с автопроверкой. Скачайте CSV, считайте в SQL, Python или таблице и введите ответ. ' +
      "Числа с запятой тоже принимаются.</p>" +
      '<div class="grid">' + datasets.map(function (d) {
        return '<div class="card"><h3><a href="data/' + d[0] + '" download>' + LAB.esc(d[1]) + "</a></h3>" +
          "<p>" + LAB.esc(d[2]) + "</p><p class=\"meta\">" + LAB.esc(d[3]) + "</p></div>";
      }).join("") + "</div>" +
      '<h2>Задачи</h2><p class="meta" id="dlProgress">Решено: 0 из ' + tasks.length + '</p>' +
      '<div class="grid">' + tasks.map(task).join("") + "</div>" +
      '<h2>Собери дашборд</h2><p class="lead">Три решения из брифа: выберите вариант и получите разбор.</p>' +
      '<div class="grid">' +
      '<div class="card" data-dbq="0"><h3>Динамика выручки по неделям</h3><div class="options">' +
      '<button class="option" data-db="0" data-ok="0">Круговая диаграмма</button>' +
      '<button class="option" data-db="0" data-ok="1">Линейный график</button>' +
      '<button class="option" data-db="0" data-ok="0">Облако слов</button></div><p class="meta" data-db-out="0"></p></div>' +
      '<div class="card" data-dbq="1"><h3>Что поставить на первый экран?</h3><div class="options">' +
      '<button class="option" data-db="1" data-ok="1">Три KPI, период и один главный график</button>' +
      '<button class="option" data-db="1" data-ok="0">Все 20 графиков сразу</button>' +
      '<button class="option" data-db="1" data-ok="0">Сырую таблицу без фильтров</button></div><p class="meta" data-db-out="1"></p></div>' +
      '<div class="card" data-dbq="2"><h3>Как проверить дашборд перед публикацией?</h3><div class="options">' +
      '<button class="option" data-db="2" data-ok="1">Сверить KPI с эталоном и проверить период</button>' +
      '<button class="option" data-db="2" data-ok="0">Оценить только цвета</button>' +
      '<button class="option" data-db="2" data-ok="0">Добавить ещё графиков</button></div><p class="meta" data-db-out="2"></p></div>' +
      '</div>' +
      '<div class="card"><h3>Мини-проект: дашборд по маркетингу</h3>' +
      "<p>Соберите один экран: расходы, выручка, ROAS по каналам и CAC. Добавьте период и вывод: какой канал масштабировать и почему.</p>" +
      '<p class="meta">Шаблон: <a href="data/dashboard-sales-template.md" download>dashboard-sales-template.md</a>. ' +
      "Проверьте, что сумма расходов и выручки совпадает с файлом.</p></div>";
  }

  function bindDatalab() {
    var KEY = "analytics-lab-datalab-v1";
    var done = {};
    try { done = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {}
      var n = Object.keys(done).length;
      var el = document.getElementById("dlProgress");
      var total = document.querySelectorAll(".dl-task").length;
      if (el) el.textContent = "Решено: " + n + " из " + total;
    }
    save();
    Array.prototype.forEach.call(document.querySelectorAll("[data-dl]"), function (btn) {
      var id = btn.getAttribute("data-dl");
      var card = btn.closest(".dl-task");
      if (done[id] && card) { card.classList.add("done"); btn.textContent = "Верно"; }
      btn.addEventListener("click", function () {
        var input = document.getElementById("dl-" + id);
        var value = Number(String(input.value || "").replace(",", "."));
        var answer = Number(btn.getAttribute("data-answer"));
        var tol = Number(btn.getAttribute("data-tol") || 0.01);
        if (input.value !== "" && Math.abs(value - answer) <= tol + 0.000001) {
          done[id] = 1;
          save();
          btn.textContent = "Верно";
          if (card) card.classList.add("done");
        } else {
          btn.textContent = "Ещё раз";
          if (card) card.classList.remove("done");
        }
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-db]"), function (b) {
      b.addEventListener("click", function () {
        var card = b.closest("[data-dbq]");
        if (!card || card.getAttribute("data-done")) return;
        card.setAttribute("data-done", "1");
        var correct = b.getAttribute("data-ok") === "1";
        Array.prototype.forEach.call(card.querySelectorAll("[data-db]"), function (x) {
          x.disabled = true;
          if (x.getAttribute("data-ok") === "1") x.classList.add("right");
          else if (x === b) x.classList.add("wrong");
        });
        var out = card.querySelector("[data-db-out]");
        if (out) out.textContent = correct ? "Верно." : "Неверно: правильный вариант подсвечен.";
      });
    });
  }

  window.DATALAB = { page: datalabPage, bind: bindDatalab };
})();
