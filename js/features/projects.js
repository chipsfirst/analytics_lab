// Проекты: сквозной, большой и открытый.
(function () {
  "use strict";
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function projectPage() {
    return '<h1>Сквозной проект</h1>' +
      '<p class="lead">Один датасет и путь от выгрузки до вывода: SQL → Python → метрики → дашборд → решение. ' +
      'Данные: <a href="data/bi-orders.csv" download>bi-orders.csv</a> — 28 заказов за январь–февраль 2026.</p>' +
      '<p class="meta" id="projectProgress">Выполнено этапов: 0 из 5</p>' +
      '<section class="project-stage" data-stage="1"><h2>1. Данные</h2>' +
      '<p>Скачайте файл и проверьте: 28 строк, колонки order_date, city, channel, revenue, returned, order_id.</p>' +
      '<label><input type="checkbox" id="p1"> Данные скачаны и проверены</label></section>' +
      '<section class="project-stage" data-stage="2"><h2>2. SQL</h2>' +
      '<p>Выручка без возвратов: <code>SELECT SUM(revenue) FROM orders WHERE returned = 0;</code></p>' +
      '<div class="answer-row"><label class="sr-only" for="p2">Выручка</label><input type="number" id="p2" placeholder="Ответ"><button class="btn" data-check="2" data-answer="268100">Проверить</button></div></section>' +
      '<section class="project-stage" data-stage="3"><h2>3. Python</h2>' +
      '<p>Средний чек: <code>df[df.returned == 0].revenue.sum() / len(df[df.returned == 0])</code>.</p>' +
      '<div class="answer-row"><label class="sr-only" for="p3">Средний чек</label><input type="number" id="p3" placeholder="Ответ"><button class="btn" data-check="3" data-answer="10724" data-tol="2">Проверить</button></div></section>' +
      '<section class="project-stage" data-stage="4"><h2>4. Дашборд</h2>' +
      '<p>Соберите экран по шаблону: <a href="data/dashboard-sales-template.md" download>sales-шаблон</a>.</p>' +
      '<label><input type="checkbox" class="p4"> KPI выручки, заказов и среднего чека</label>' +
      '<label><input type="checkbox" class="p4"> Динамика по неделям</label>' +
      '<label><input type="checkbox" class="p4"> Разрез по городам или каналам</label>' +
      '<label><input type="checkbox" class="p4"> Подписаны период и дата обновления</label></section>' +
      '<section class="project-stage" data-stage="5"><h2>5. Вывод</h2>' +
      '<p>Что корректно сказать по данным?</p>' +
      '<div class="options"><button class="option" data-p5="0">Выручка 268 100 ₽ без возвратов, 25 оплаченных заказов, средний чек 10 724 ₽</button>' +
      '<button class="option" data-p5="1">Выручка 296 700 ₽, потому что возвраты тоже продажи</button>' +
      '<button class="option" data-p5="2">Средний чек нельзя посчитать без гипотезы</button></div></section>';
  }

  function bindProject() {
    var KEY = "analytics-lab-project-v1";
    var done = {};
    try { done = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {}
      var n = Object.keys(done).length;
      var el = document.getElementById("projectProgress");
      if (el) el.textContent = "Выполнено этапов: " + n + " из 5";
      Array.prototype.forEach.call(document.querySelectorAll(".project-stage"), function (s) {
        s.classList.toggle("done", !!done[s.getAttribute("data-stage")]);
      });
    }
    function mark(n) { done[n] = 1; save(); }
    save();
    var p1 = document.getElementById("p1");
    if (p1) {
      p1.checked = !!done["1"];
      p1.addEventListener("change", function () { if (p1.checked) mark("1"); });
    }
    Array.prototype.forEach.call(document.querySelectorAll("[data-check]"), function (b) {
      b.addEventListener("click", function () {
        var n = b.getAttribute("data-check");
        var input = document.getElementById("p" + n);
        var ans = Number(b.getAttribute("data-answer"));
        var tol = Number(b.getAttribute("data-tol") || 1);
        if (Math.abs(Number(input.value) - ans) <= tol) {
          b.textContent = "Верно";
          mark(n);
        } else {
          b.textContent = "Ещё раз";
        }
      });
    });
    var boxes = document.querySelectorAll(".p4");
    if (boxes.length) {
      var all = Array.prototype.every.call(boxes, function (b) { return b.checked; });
      if (all) done["4"] = 1;
      Array.prototype.forEach.call(boxes, function (b) {
        b.addEventListener("change", function () {
          if (Array.prototype.every.call(boxes, function (x) { return x.checked; })) mark("4");
        });
      });
    }
    Array.prototype.forEach.call(document.querySelectorAll("[data-p5]"), function (b) {
      b.addEventListener("click", function () {
        var ok = b.getAttribute("data-p5") === "0";
        b.classList.add(ok ? "right" : "wrong");
        if (ok) mark("5");
      });
    });
  }

  function capstonePage() {
    var tasks = [
      ["k1", "Качество", "Сколько уникальных заказов после удаления дублей order_id?", "COUNT(DISTINCT order_id)", 10000, 0.5],
      ["k2", "Метрики", "Выручка по оплаченным заказам, ₽", "SUM(amount) WHERE status = 'paid' после дедупликации", 21984503, 1],
      ["k3", "Метрики", "Средний чек по оплаченным заказам, ₽", "Выручка / число оплаченных заказов", 2754.61, 0.5],
      ["k4", "Качество", "Доля уникальных заказов без user_id, %", "100 * COUNT(*) с пустым user_id / все заказы", 3.34, 0.05],
      ["k5", "Воронка", "Конверсия из просмотра в покупку по событиям, %", "уникальные покупатели / уникальные зрители × 100", 3.66, 0.1],
      ["k6", "Каналы", "CAC канала с минимальной стоимостью привлечения, ₽", "min(SUM(spend) / SUM(signups)) по каналам", 177.37, 0.5]
    ];
    var files = [
      ["retail-users.csv", "Пользователи", "2 000", "user_id, signup_date, city, channel, age_group"],
      ["retail-orders.csv", "Заказы", "10 020", "order_id, user_id, order_date, status, amount, promo"],
      ["retail-events.csv", "События", "15 000", "event_id, user_id, event_time, event_type"],
      ["retail-marketing.csv", "Маркетинг", "270", "date, channel, spend, clicks, signups"]
    ];
    function task(t) {
      return '<div class="card dl-task" data-cap-task="' + t[0] + '"><p class="meta">' + esc(t[1]) + "</p>" +
        "<h3>" + esc(t[2]) + "</h3>" +
        '<div class="answer-row"><label class="sr-only" for="cap-' + t[0] + '">Ответ</label>' +
        '<input type="text" inputmode="decimal" id="cap-' + t[0] + '" placeholder="Ответ">' +
        '<button class="btn" data-cap="' + t[0] + '" data-answer="' + t[4] + '" data-tol="' + t[5] + '">Проверить</button></div>' +
        '<p class="meta"><code>' + esc(t[3]) + "</code></p></div>";
    }
    return "<h1>Большой проект: розница</h1>" +
      '<p class="lead">Четыре связанные таблицы, 27 тысяч строк и сырые данные. ' +
      "Задача — не посчитать одну цифру, а собрать картину, проверить качество и предложить решение заказчику.</p>" +
      '<div class="card"><h2>Бриф</h2>' +
      "<p>Маркетинг просит решить, куда перенести 20% бюджета между каналами. " +
      "Данные выгружены из трёх систем, часть заказов задвоена, у некоторых нет пользователя. " +
      "Нужны: проверка качества, выручка и средний чек, воронка, CAC по каналам и короткая записка с решением.</p>" +
      '<p class="meta">Ограничение: синтетические данные. Считайте, что это выгрузка за январь–март 2026.</p></div>' +
      '<h2>Файлы</h2><div class="grid">' + files.map(function (f) {
        return '<div class="card"><h3><a href="data/' + f[0] + '" download>' + esc(f[1]) + "</a></h3>" +
          '<p class="meta">' + esc(f[2]) + ' строк</p><p class="meta"><code>' + esc(f[3]) + "</code></p></div>";
      }).join("") + "</div>" +
      '<div class="table-wrap"><table><thead><tr><th>Таблица</th><th>Зерно</th><th>Что проверить</th></tr></thead><tbody>' +
      "<tr><td>users</td><td>пользователь</td><td>уникальность user_id, диапазон дат</td></tr>" +
      "<tr><td>orders</td><td>заказ</td><td>дубли order_id, пропуски user_id, статусы, возвраты</td></tr>" +
      "<tr><td>events</td><td>событие</td><td>типы событий, уникальные пользователи, окно</td></tr>" +
      "<tr><td>marketing</td><td>день × канал</td><td>сумма расходов, знаменатель CAC</td></tr>" +
      "</tbody></table></div>" +
      '<h2>Задачи</h2><p class="meta" id="capProgress">Решено: 0 из ' + tasks.length + "</p>" +
      '<div class="grid">' + tasks.map(task).join("") + "</div>" +
      '<div class="card"><h2>Как сдать</h2><ol>' +
      "<li>Проверка качества: дубли, пропуски, сироты, период, статусы.</li>" +
      "<li>Метрики: выручка, число оплаченных, средний чек, воронка.</li>" +
      "<li>Каналы: CAC, вклад в заказы, ограничения атрибуции.</li>" +
      "<li>Решение: куда перенести бюджет, что проверить до запуска, какие данные нужны ещё.</li>" +
      "<li>Записка на 5–7 предложений: цифра, вывод, риск, следующий шаг.</li>" +
      '</ol><p class="meta">Проверяйте себя по этим пунктам: ответ без допущений и ограничений считается неполным.</p></div>';
  }

  function bindCapstone() {
    var KEY = "analytics-lab-capstone-v1";
    var done = {};
    try { done = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {}
      var el = document.getElementById("capProgress");
      var total = document.querySelectorAll("[data-cap]").length;
      if (el) el.textContent = "Решено: " + Object.keys(done).length + " из " + total;
      Array.prototype.forEach.call(document.querySelectorAll("[data-cap-task]"), function (card) {
        card.classList.toggle("done", !!done[card.getAttribute("data-cap-task")]);
      });
    }
    save();
    Array.prototype.forEach.call(document.querySelectorAll("[data-cap]"), function (btn) {
      var id = btn.getAttribute("data-cap");
      if (done[id]) btn.textContent = "Верно";
      btn.addEventListener("click", function () {
        var input = document.getElementById("cap-" + id);
        var value = Number(String(input.value || "").replace(",", "."));
        var answer = Number(btn.getAttribute("data-answer"));
        var tol = Number(btn.getAttribute("data-tol") || 0.01);
        if (input.value !== "" && Math.abs(value - answer) <= tol + 0.000001) {
          done[id] = 1;
          btn.textContent = "Верно";
          save();
        } else {
          btn.textContent = "Ещё раз";
        }
      });
    });
  }

  function openProjectPage() {
    var files = [
      ["sub-users.csv", "Пользователи", "3 000", "user_id, signup_date, city, channel, age_group"],
      ["sub-subscriptions.csv", "Подписки", "3 604", "subscription_id, user_id, plan, start_date, end_date, status, monthly_price"],
      ["sub-payments.csv", "Платежи", "20 672", "payment_id, user_id, subscription_id, payment_date, amount, status, method"],
      ["sub-tickets.csv", "Обращения", "2 000", "ticket_id, user_id, created_at, category, priority, resolved_at, satisfaction"]
    ];
    var checks = [
      ["quality", "Проверил дубли, пропуски, даты и покрытие периода"],
      ["metrics", "Посчитал MRR, ARPU, отток, failed payments и возвраты"],
      ["segments", "Сравнил каналы или тарифы и объяснил различие"],
      ["hypotheses", "Сформулировал две проверяемые гипотезы с метрикой"],
      ["memo", "Написал записку с решением, риском и следующим шагом"],
      ["repro", "Оставил SQL/Python-код, который повторяет расчёт"],
      ["assumptions", "Зафиксировал допущения, ограничения и альтернативные объяснения"],
      ["stability", "Проверил решение на устойчивость: сегменты, сезонность и цена ошибки"]
    ];
    function fileCard(f) {
      return '<div class="card"><h3><a href="data/' + f[0] + '" download>' + esc(f[1]) + "</a></h3>" +
        '<p class="meta">' + esc(f[2]) + " строк</p><p class=\"meta\"><code>" + esc(f[3]) + "</code></p></div>";
    }
    function check(c) {
      return '<label class="open-check"><input type="checkbox" data-open-check="' + c[0] + '"> ' + esc(c[1]) + "</label>";
    }
    return "<h1>Открытый проект: подписка</h1>" +
      '<p class="lead">Здесь нет готовых вопросов и автопроверки. Есть бриф, грязные данные и рубрика. ' +
      "Нужно провести анализ, принять решение и защитить его перед заказчиком.</p>" +
      '<div class="card"><h2>Бриф</h2>' +
      "<p>Сервис «Пульс» продаёт подписку на тренировки. Выручка за девять месяцев — 13,0 млн ₽, " +
      "но MRR последние месяцы почти не растёт, а маркетинг просит увеличить бюджет.</p>" +
      "<p>Нужно понять, где сервис теряет деньги, и предложить одно решение на ближайший квартал. " +
      "Данные выгружены из трёх систем: пользователи, подписки и платежи, плюс обращения в поддержку. " +
      "Часть записей намеренно испорчена.</p>" +
      '<p class="meta">Период: январь–сентябрь 2026. Все данные синтетические. ' +
      "Правильного ответа нет: оценивается ход анализа, допущения и качество решения.</p></div>" +
      '<h2>Файлы</h2><div class="grid">' + files.map(fileCard).join("") + "</div>" +
      '<div class="table-wrap"><table><thead><tr><th>Таблица</th><th>Зерно</th><th>Что проверить</th></tr></thead><tbody>' +
      "<tr><td>users</td><td>пользователь</td><td>уникальность user_id, диапазон регистрации, каналы</td></tr>" +
      "<tr><td>subscriptions</td><td>подписка</td><td>пересечения периодов, статусы, end_date, тариф</td></tr>" +
      "<tr><td>payments</td><td>платёж</td><td>дубли payment_id, пропуски user_id, даты до регистрации и после конца подписки, форматы дат</td></tr>" +
      "<tr><td>tickets</td><td>обращение</td><td>пропуски satisfaction, незакрытые тикеты, категории</td></tr>" +
      "</tbody></table></div>" +
      '<h2>Что сдать</h2><div class="grid">' +
      '<div class="card"><h3>1. Качество данных</h3><p>Найдите дубли, пропуски и аномалии. ' +
      "Покажите, как каждый дефект влияет на метрику, а не просто перечислите строки.</p></div>" +
      '<div class="card"><h3>2. Метрики</h3><p>MRR, ARPU, отток за 90 дней, доля failed payments, возвраты, ' +
      "нагрузка поддержки. Для каждой метрики — формула и период.</p></div>" +
      '<div class="card"><h3>3. Сегменты</h3><p>Сравните каналы, тарифы или когорты. ' +
      "Найдите хотя бы одно различие, которое меняет решение.</p></div>" +
      '<div class="card"><h3>4. Гипотезы</h3><p>Две проверяемые гипотезы: что меняем, какую метрику двигаем, ' +
      "какой эффект считаем достаточным и как проверим.</p></div>" +
      '<div class="card"><h3>5. Записка</h3><p>Одна страница для CMO: решение, три цифры, риск и следующий шаг. ' +
      "Без пересказа всех графиков.</p></div>" +
      '<div class="card"><h3>6. Воспроизводимость</h3><p>SQL- или Python-код, который повторяет расчёт. ' +
      "Достаточно одного файла с комментариями, где что считается.</p></div>" +
      "</div>" +
      '<h2>Рубрика</h2><div class="table-wrap"><table><thead><tr><th>Критерий</th><th>0</th><th>1</th><th>2</th></tr></thead><tbody>' +
      "<tr><td>Качество данных</td><td>Дефекты не замечены</td><td>Перечислены, но без влияния</td><td>Найдены, посчитаны и связаны с метрикой</td></tr>" +
      "<tr><td>Метрики</td><td>Формулы неверны</td><td>Считает верно, но без определений</td><td>Верно, с определениями, периодом и оговорками</td></tr>" +
      "<tr><td>Сегменты</td><td>Нет разреза</td><td>Один разрез без вывода</td><td>Несколько разрезов и объяснение различия</td></tr>" +
      "<tr><td>Гипотезы</td><td>Не проверяемые</td><td>Проверяемые, но без метрики</td><td>Метрика, эффект и дизайн проверки</td></tr>" +
      "<tr><td>Коммуникация</td><td>Нет записки</td><td>Есть цифры, нет решения</td><td>Решение, риск и следующий шаг на одной странице</td></tr>" +
      "</tbody></table></div>" +
      '<p class="meta">Максимум 10 баллов. 8 и больше — уровень, который не стыдно показать на собеседовании.</p>' +
      '<details class="card open-example"><summary><b>Пример сильной сдачи</b> — посмотреть записку и разбор</summary>' +
      '<p class="meta">Цифры ниже посчитаны по этим файлам. Это один из допустимых ответов, а не эталон: важнее ход рассуждения.</p>' +
      "<p><b>Кому:</b> CMO. <b>От:</b> аналитик. <b>Решение:</b> не увеличивать бюджет равномерно. " +
      "Сначала вернуть деньги на failed payments, затем перестроить онбординг referral-пользователей.</p>" +
      "<p><b>Что в данных.</b> В payments 20 672 строки, после дедупликации — 20 657. " +
      "15 дублей payment_id, 120 платежей без user_id, 5 дат до регистрации и 30 после окончания подписки. " +
      "Дубли и пропуски — меньше 1% строк, но даты вне жизненного цикла подписки нельзя молча отбрасывать: " +
      "они меняют когортный анализ.</p>" +
      "<p><b>Экономика.</b> MRR на 30.09.2026 — 1 678 120 ₽, активных подписок 2 388, " +
      "активных пользователей 2 120, ARPU — 791,57 ₽. За 90 дней отток 19,9%. " +
      "Из 20 657 платежей 1 244 failed (6,0%) и 444 возврата (2,1%). " +
      "Выручка по оплаченным — 13,3 млн ₽, возвраты — 0,31 млн ₽.</p>" +
      "<p><b>Сегменты.</b> В когорте января–марта 2026 доля активных на 30.09: paid_search — 71,3%, " +
      "social — 70,8%, email — 66,7%, referral — 64,8%. Разрыв referral и paid_search — 6,5 п.п.: " +
      "гипотеза о слабом онбординге referral выглядит правдоподобнее, чем «плохой трафик».</p>" +
      "<p><b>Две гипотезы.</b> 1) Ретраи failed payments и смена метода оплаты вернут не менее 25% " +
      "несостоявшихся списаний; метрика — recovered revenue, дизайн — пилот на 2 недели с контролем. " +
      "2) Онбординг referral-пользователей повысит их 90-дневное удержание до уровня paid_search; " +
      "метрика — доля активных на 30-й и 90-й день, дизайн — A/B на новых referral-пользователях.</p>" +
      "<p><b>Риск.</b> Статусы подписок и определения оттока могут расходиться с финансовой отчётностью; " +
      "сегменты наблюдательные, а не причинные. Перед внедрением нужно сверить net revenue с бухгалтерией " +
      "и проверить, не сезонный ли это спад.</p>" +
      "<p><b>Следующий шаг.</b> Двухнедельный пилот по failed payments: считаем recovered revenue, " +
      "стоимость ретраев и число жалоб. Если эффект устойчив — масштабируем и только потом перекладываем бюджет.</p>" +
      "<p><b>Почему это хорошо:</b> есть определения метрик, влияние дефектов, сегментный разрез, " +
      "две проверяемые гипотезы, риск и одно конкретное решение. <b>Что доработать:</b> разрез по тарифам " +
      "и способам оплаты, проверка сезонности и сверка с финансовой отчётностью.</p>" +
      "</details>" +
      '<div class="card"><h2>Чек-лист сдачи</h2><div class="open-checks">' + checks.map(check).join("") + "</div>" +
      '<p class="meta" id="openProgress">Готово: 0 из ' + checks.length + "</p></div>";
  }

  function bindOpenProject() {
    var KEY = "analytics-lab-open-project-v1";
    var done = {};
    try { done = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {}
      var total = document.querySelectorAll("[data-open-check]").length;
      var el = document.getElementById("openProgress");
      if (el) el.textContent = "Готово: " + Object.keys(done).length + " из " + total;
    }
    save();
    Array.prototype.forEach.call(document.querySelectorAll("[data-open-check]"), function (box) {
      var id = box.getAttribute("data-open-check");
      box.checked = !!done[id];
      box.addEventListener("change", function () {
        if (box.checked) done[id] = 1; else delete done[id];
        save();
      });
    });
  }

  function marketingProjectPage() {
    return "<h1>Проект: записка CMO</h1>" +
      '<p class="lead">Три канала, один месяц и решение о бюджете. Нужно посчитать экономику, ' +
      "увидеть ограничения атрибуции и написать записку на одну страницу.</p>" +
      '<p class="meta" id="mpProgress">Готово: 0 из 6</p>' +
      '<section class="project-stage" data-mp-stage="data"><h2>1. Данные</h2>' +
      '<p>Скачайте <a href="data/marketing.csv" download>marketing.csv</a>: дата, канал, расходы, клики, конверсии и выручка.</p>' +
      '<label><input type="checkbox" data-mp-check="data"> Проверил период, каналы и пропуски</label></section>' +
      '<section class="project-stage" data-mp-stage="cac"><h2>2. CAC поиска</h2>' +
      '<p>Расходы на поиск разделите на конверсии поиска. Округлите до сотых.</p>' +
      '<div class="answer-row"><label class="sr-only" for="mpCac">CAC поиска</label>' +
      '<input type="number" id="mpCac" step="0.01" placeholder="₽">' +
      '<button class="btn" data-mp-answer="156.14" data-mp-tol="0.5" data-mp-id="cac">Проверить</button></div></section>' +
      '<section class="project-stage" data-mp-stage="roas"><h2>3. ROAS email</h2>' +
      '<p>Выручку email разделите на расходы email. Округлите до сотых.</p>' +
      '<div class="answer-row"><label class="sr-only" for="mpRoas">ROAS email</label>' +
      '<input type="number" id="mpRoas" step="0.01" placeholder="×">' +
      '<button class="btn" data-mp-answer="40.79" data-mp-tol="0.1" data-mp-id="roas">Проверить</button></div></section>' +
      '<section class="project-stage" data-mp-stage="decision"><h2>4. Решение</h2>' +
      '<p>Какой вывод корректен по этим данным?</p><div class="options">' +
      '<button class="option" data-mp-option="0">Email дешевле по CAC, но перед перераспределением нужен holdout: last-click не доказывает инкремент</button>' +
      '<button class="option" data-mp-option="1">Нужно сразу отключить поиск: у него самый высокий CAC</button>' +
      '<button class="option" data-mp-option="2">ROAS 40 у email доказывает, что весь бюджет нужно отдать email</button>' +
      "</div></section>" +
      '<section class="project-stage" data-mp-stage="memo"><h2>5. Записка</h2>' +
      '<label><input type="checkbox" data-mp-check="memo"> Есть решение, три цифры, ограничение и следующий шаг</label>' +
      '<label><input type="checkbox" data-mp-check="risk"> Указан риск атрибуции или сезонности</label></section>' +
      '<section class="project-stage" data-mp-stage="next"><h2>6. Следующий шаг</h2>' +
      '<label><input type="checkbox" data-mp-check="next"> Предложен geo-тест или holdout с метрикой успеха</label></section>' +
      '<div class="card"><h2>Подсказки</h2><ul>' +
      "<li>Итого расходы: 300 724 ₽, конверсии: 2 386, выручка: 2 963 394 ₽.</li>" +
      "<li>CAC: поиск — 156,14 ₽, соцсети — 194,27 ₽, email — 31,20 ₽.</li>" +
      "<li>ROAS: поиск — 7,93, соцсети — 6,23, email — 40,79.</li>" +
      "<li>Email часто закрывает уже разогретый спрос. Низкий CAC не равен инкрементальному эффекту.</li>" +
      "</ul></div>";
  }

  function bindMarketingProject() {
    var KEY = "analytics-lab-marketing-project-v1";
    var done = {};
    try { done = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
    function total() {
      return document.querySelectorAll("[data-mp-check]").length +
        document.querySelectorAll("[data-mp-answer]").length + 1;
    }
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {}
      var el = document.getElementById("mpProgress");
      if (el) el.textContent = "Готово: " + Object.keys(done).length + " из " + total();
      Array.prototype.forEach.call(document.querySelectorAll("[data-mp-stage]"), function (sec) {
        sec.classList.toggle("done", !!done[sec.getAttribute("data-mp-stage")]);
      });
    }
    function mark(id) { done[id] = 1; save(); }
    save();
    Array.prototype.forEach.call(document.querySelectorAll("[data-mp-check]"), function (box) {
      var id = box.getAttribute("data-mp-check");
      box.checked = !!done[id];
      box.addEventListener("change", function () {
        if (box.checked) mark(id); else { delete done[id]; save(); }
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-mp-answer]"), function (btn) {
      var id = btn.getAttribute("data-mp-id");
      if (done[id]) btn.textContent = "Верно";
      btn.addEventListener("click", function () {
        var input = document.getElementById(id === "cac" ? "mpCac" : "mpRoas");
        var value = Number(String(input.value || "").replace(",", "."));
        var answer = Number(btn.getAttribute("data-mp-answer"));
        var tol = Number(btn.getAttribute("data-mp-tol") || 0.01);
        if (input.value !== "" && Math.abs(value - answer) <= tol) {
          btn.textContent = "Верно";
          mark(id);
        } else {
          btn.textContent = "Ещё раз";
        }
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-mp-option]"), function (btn) {
      btn.addEventListener("click", function () {
        var ok = btn.getAttribute("data-mp-option") === "0";
        btn.classList.add(ok ? "right" : "wrong");
        if (ok) mark("decision");
      });
    });
  }

  window.PROJECTS = {
    page: projectPage,
    bind: bindProject,
    capstonePage: capstonePage,
    bindCapstone: bindCapstone,
    openProjectPage: openProjectPage,
    bindOpenProject: bindOpenProject,
    marketingProjectPage: marketingProjectPage,
    bindMarketingProject: bindMarketingProject
  };
})();
