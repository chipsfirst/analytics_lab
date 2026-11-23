// Страницы pandas-кейса и Pyodide-песочницы.
(function () {
  "use strict";
  var app = document.getElementById("app");
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function pandasCasePage() {
    var files = [
      ["sub-users.csv", "Пользователи", "3 000"],
      ["sub-subscriptions.csv", "Подписки", "3 604"],
      ["sub-payments.csv", "Платежи", "20 672"],
      ["sub-tickets.csv", "Обращения", "2 000"]
    ];
    return "<h1>Pandas-кейс: отчёт по подписке</h1>" +
      '<p class="lead">Один сквозной сценарий на четырёх CSV: загрузка, качество, соединения, метрики, когорты и записка. ' +
      "Без готового ответа: файл-стартер, шесть шагов и рубрика.</p>" +
      '<div class="card"><h2>Бриф</h2><p>Сервис «Пульс» просит аналитика собрать месячный отчёт по подписке. ' +
      "Нужно объяснить, что происходит с выручкой и удержанием, найти один проблемный сегмент и предложить действие на квартал.</p>" +
      '<p><a class="btn primary" href="data/pandas-case-starter.py" download>Скачать стартовый файл</a> ' +
      '<a class="btn" href="#/pandas-lab">Открыть кейс в песочнице</a> ' +
      '<a class="btn" href="#/theory/python/5">Повторить pandas</a> ' +
      '<a class="btn" href="https://github.com/chipsfirst/analytics_lab/issues/new?template=review.md" target="_blank" rel="noopener">Запросить ревью</a></p>' +
      '<p class="meta">Данные синтетические. Запускать можно локально или в песочнице: pandas и чтение CSV уже доступны.</p></div>' +
      '<h2>Данные</h2><div class="grid">' + files.map(function (f) {
        return '<div class="card"><h3><a href="data/' + f[0] + '" download>' + esc(f[1]) + "</a></h3>" +
          '<p class="meta">' + esc(f[2]) + " строк</p></div>";
      }).join("") + "</div>" +
      '<h2>Шесть шагов</h2><div class="grid">' +
      '<div class="card"><h3>1. Загрузка и типы</h3><p>Прочитайте четыре файла, разберитесь с двумя форматами дат, ' +
      "проверьте дубли payment_id и пропуски user_id. Посчитайте, сколько строк теряется на каждом шаге.</p></div>" +
      '<div class="card"><h3>2. Соединение таблиц</h3><p>Соберите платежи с пользователями и подписками. ' +
      "Проверьте зерно и кардинальность, даты до регистрации и после окончания подписки. Не удаляйте аномалии молча.</p></div>" +
      '<div class="card"><h3>3. Метрики</h3><p>Помесячная net revenue, MRR на последний день, ARPU, доля failed payments, ' +
      "возвраты. Для каждой метрики запишите формулу и период.</p></div>" +
      '<div class="card"><h3>4. Когорты</h3><p>Сравните удержание по каналам за январь–март. ' +
      "Найдите разрыв, который меняет решение, и проверьте, не объясняется ли он тарифом.</p></div>" +
      '<div class="card"><h3>5. Поддержка</h3><p>Разберите обращения по категориям и приоритетам. ' +
      "Свяжите нагрузку и удовлетворённость с тарифом или каналом.</p></div>" +
      '<div class="card"><h3>6. Записка</h3><p>Пять пунктов для CMO: решение, три цифры, риск и следующий шаг. ' +
      "Одна страница, без пересказа всех графиков.</p></div>" +
      "</div>" +
      '<h2>Рубрика</h2><div class="table-wrap"><table><thead><tr><th>Критерий</th><th>0</th><th>1</th><th>2</th></tr></thead><tbody>' +
      "<tr><td>Качество</td><td>Дефекты не замечены</td><td>Перечислены без влияния</td><td>Посчитаны и связаны с метрикой</td></tr>" +
      "<tr><td>Код</td><td>Не запускается</td><td>Работает, но без проверок</td><td>Читаемый, с проверками зерна и типов</td></tr>" +
      "<tr><td>Метрики</td><td>Формулы неверны</td><td>Верно, но без определений</td><td>Верно, с периодом и оговорками</td></tr>" +
      "<tr><td>Вывод</td><td>Нет решения</td><td>Есть цифры без действия</td><td>Решение, риск и следующий шаг</td></tr>" +
      "</tbody></table></div>" +
      '<p class="meta">Максимум 8 баллов. 6 и больше — работа, которую можно обсуждать на собеседовании.</p>' +
      '<div class="note"><b>Подсказка.</b> Сначала зафиксируйте определения: что такое активная подписка, ' +
      "как считается отток и входит ли возврат в выручку. Потом считайте — иначе цифры не сойдутся.</div>";
  }

  function pandasLabPage() {
    app.innerHTML = '<p><a href="#/pandas-case">&larr; к кейсу</a></p>' +
      "<h1>Pandas-кейс в песочнице</h1>" +
      '<p class="lead" style="margin-bottom:20px">Четыре CSV уже лежат в рабочей папке, pandas загрузится при первом запуске. ' +
      "Заполните функции, затем запустите последнюю ячейку самопроверки.</p>" +
      '<div id="pandasLab"></div>';
    var root = document.getElementById("pandasLab");
    var nbCleanup = null;
    var names = ["sub-users.csv", "sub-subscriptions.csv", "sub-payments.csv", "sub-tickets.csv"];
    var cells = [
      'import pandas as pd\n\nusers = pd.read_csv("sub-users.csv", parse_dates=["signup_date"])\nsubscriptions = pd.read_csv("sub-subscriptions.csv", parse_dates=["start_date", "end_date"])\npayments = pd.read_csv("sub-payments.csv")\ntickets = pd.read_csv("sub-tickets.csv", parse_dates=["created_at", "resolved_at"])\nraw_payments = payments.copy()\nprint(users.shape, subscriptions.shape, payments.shape, tickets.shape)\nprint(payments["payment_date"].head().tolist())',
      'def audit(users, subscriptions, payments, tickets):\n    checks = [\n        ("duplicate payment_id", payments["payment_id"].duplicated().sum(), "удалить дубли"),\n        ("payments without user_id", payments["user_id"].isna().sum(), "решить, что делать с пропусками"),\n        ("tickets without satisfaction", tickets["satisfaction"].isna().sum(), "не считать как 0"),\n    ]\n    dated = payments.copy()\n    dated["payment_date"] = pd.to_datetime(dated["payment_date"], errors="coerce", format="mixed")\n    dated = dated.merge(users[["user_id", "signup_date"]], on="user_id", how="left")\n    dated = dated.merge(subscriptions[["subscription_id", "end_date"]], on="subscription_id", how="left")\n    checks.append(("payments before signup", (dated["payment_date"] < dated["signup_date"]).sum(), "проверить до очистки"))\n    checks.append(("payments after subscription end", (dated["payment_date"] > dated["end_date"]).sum(), "проверить до очистки"))\n    return pd.DataFrame(checks, columns=["check", "rows", "action"])',
      '# После аудита: приведите даты и уберите дубли\npayments["payment_date"] = pd.to_datetime(payments["payment_date"], errors="coerce", format="mixed")\npayments = payments.drop_duplicates("payment_id")\nprint("После дедупликации:", len(payments))\nprint("Пропуски user_id:", payments["user_id"].isna().sum())',
      'def monthly_revenue(payments):\n    # TODO: оставьте 2026-01..2026-09, разделите paid/refunded, посчитайте net\n    return pd.DataFrame(columns=["month", "paid", "refunded", "net"])',
      'def cohort_retention(users, subscriptions):\n    # TODO: когорта регистрации январь–март 2026, доля активных на 30.09.2026\n    return pd.DataFrame(columns=["channel", "cohort", "active_share"])',
      'from pandas.testing import assert_frame_equal\n\nchecks = audit(users, subscriptions, raw_payments, tickets)\nassert list(checks.columns) == ["check", "rows", "action"], "audit: колонки"\nassert len(checks) >= 3, "audit: мало проверок"\nassert int(checks.loc[checks["check"] == "duplicate payment_id", "rows"].iloc[0]) == 15, "audit: ожидается 15 дублей до очистки"\nassert int(checks.loc[checks["check"] == "payments before signup", "rows"].iloc[0]) == 5, "audit: ожидается 5 платежей до регистрации"\nassert int(checks.loc[checks["check"] == "payments after subscription end", "rows"].iloc[0]) == 30, "audit: ожидается 30 платежей после окончания подписки"\n\nmonthly = monthly_revenue(payments)\nassert list(monthly.columns) == ["month", "paid", "refunded", "net"], "monthly: колонки"\nassert len(monthly) == 9, "monthly: нужен январь–сентябрь 2026"\nassert abs(float(monthly["net"].sum()) - 12955440) < 1, "monthly: net revenue не сходится"\n\ncohort = cohort_retention(users, subscriptions)\nassert list(cohort.columns) == ["channel", "cohort", "active_share"], "cohort: колонки"\nassert len(cohort) == 4, "cohort: нужны четыре канала"\nassert cohort["active_share"].between(0, 1).all(), "cohort: доля должна быть 0..1"\nexpected = {"paid_search": 0.713, "social": 0.708, "email": 0.667, "referral": 0.648}\ngot = cohort.set_index("channel")["active_share"]\nassert set(got.index) == set(expected), "cohort: ожидаются четыре канала"\nassert all(abs(float(got[ch]) - v) < 0.002 for ch, v in expected.items()), "cohort: доли не сходятся"\nprint("Самопроверка структуры пройдена. Сверьте выводы с рубрикой.")'
    ];
    Promise.all(names.map(function (name) {
      return fetch("data/" + name).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      });
    })).then(function (texts) {
      if (!document.getElementById("pandasLab")) return;
      var files = {};
      names.forEach(function (name, i) { files[name] = texts[i]; });
      nbCleanup = window.PYSANDBOX.mount(root, {
        keySuffix: "-pandas-case",
        packages: ["pandas"],
        files: files,
        cells: cells
      });
    }).catch(function () {
      if (root) root.innerHTML = '<p class="verdict bad">Не удалось загрузить CSV. Откройте сайт по http:// или https://, а не двойным щелчком по файлу.</p>';
    });
    return function () { if (typeof nbCleanup === "function") nbCleanup(); };
  }

  window.PANDAS_CASE = { page: pandasCasePage, lab: pandasLabPage };
})();
