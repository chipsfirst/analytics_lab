// Сквозной проект: dbt-репозиторий, живой BI-дашборд и ревью.
(function () {
  "use strict";

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function parseCsv(text) {
    var rows = [], row = [], cur = "", quoted = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (quoted) {
        if (ch === '"') {
          if (text[i + 1] === '"') { cur += '"'; i++; }
          else quoted = false;
        } else cur += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ",") { row.push(cur); cur = ""; }
      else if (ch === "\n") {
        row.push(cur);
        if (row.length > 1 || row[0] !== "") rows.push(row);
        row = []; cur = "";
      } else if (ch !== "\r") cur += ch;
    }
    if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
    var header = rows.shift() || [];
    return rows.map(function (r) {
      var o = {};
      header.forEach(function (h, i) { o[h.trim()] = r[i] === undefined ? "" : r[i]; });
      return o;
    });
  }

  function toDate(s) {
    if (!s) return null;
    var p = s.split("-");
    if (p.length === 3) return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
    p = s.split(".");
    if (p.length === 3) return new Date(Date.UTC(+p[2], +p[1] - 1, +p[0]));
    return null;
  }

  function money(n) { return Math.round(n).toLocaleString("ru-RU") + " ₽"; }
  function num(n) { return Math.round(n).toLocaleString("ru-RU"); }
  function pct(n) { return (Math.round(n * 10) / 10).toString().replace(".", ",") + "%"; }

  function kpi(label, value, hint) {
    return '<div class="dbt-kpi"><span>' + esc(label) + "</span><b>" + esc(value) +
      '</b><span class="meta">' + esc(hint) + "</span></div>";
  }

  function barRow(label, value, max, display) {
    var width = Math.max(2, Math.round(value / max * 100));
    return '<div class="dbt-bar-row"><span>' + esc(label) + '</span>' +
      '<div class="dbt-bar"><i style="width:' + width + '%"></i></div><b>' + esc(display) + "</b></div>";
  }

  function lineChart(values, labels) {
    var w = 640, h = 180, left = 26, right = 12, top = 16, bottom = 28;
    var max = Math.max.apply(null, values.concat([1]));
    var min = Math.min.apply(null, values.concat([0]));
    var range = max - min || 1;
    var pts = values.map(function (v, i) {
      var x = left + i * (w - left - right) / Math.max(1, values.length - 1);
      var y = h - bottom - (v - min) / range * (h - top - bottom);
      return x.toFixed(1) + "," + y.toFixed(1);
    });
    labels = labels || values.map(function () { return ""; });
    var ticks = labels.map(function (l, i) {
      var x = left + i * (w - left - right) / Math.max(1, values.length - 1);
      return '<text x="' + x.toFixed(1) + '" y="' + (h - 8) + '" font-size="10" fill="currentColor" opacity=".6">' + l + "</text>";
    }).join("");
    return '<svg class="dbt-chart" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="Net revenue по месяцам">' +
      '<line x1="' + left + '" y1="' + (h - bottom) + '" x2="' + (w - right) + '" y2="' + (h - bottom) + '" stroke="currentColor" opacity=".2"/>' +
      '<polyline points="' + pts.join(" ") + '" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>' +
      pts.map(function (p) { var xy = p.split(","); return '<circle cx="' + xy[0] + '" cy="' + xy[1] + '" r="3" fill="currentColor"/>'; }).join("") +
      ticks + "</svg>";
  }

  function page() {
    return [
      "<h1>Сквозной проект: dbt + BI</h1>",
      '<p class="lead">Четыре источника, dbt-репозиторий с тестами, живой дашборд и ревью. ' +
        "Это не упражнение на один запрос: нужно собрать пайплайн, проверить качество и защитить решение.</p>",
      '<div class="card"><h2>Скачать проект</h2>',
      "<p>В архиве — dbt-модели, тесты, CI, README, <code>REVIEW.md</code>, запросы для BI и четыре CSV в <code>seeds/</code>. " +
        "Данные синтетические, но дефекты настоящие: дубли, пропуски, разные форматы дат.</p>",
      '<div class="links"><a class="btn primary" href="dbt-subscription.zip" download>Скачать dbt-subscription.zip</a>',
      '<a class="btn" href="data/sub-users.csv" download>Данные: users</a></div></div>',
      '<div class="grid">',
      '<div class="card"><h3>dbt-репозиторий</h3><p>staging, marts, seeds и профиль DuckDB. ' +
        "Можно запустить локально командой <code>dbt build</code>.</p></div>",
      '<div class="card"><h3>Тесты</h3><p><code>unique</code>, <code>not_null</code>, <code>relationships</code>, ' +
        "<code>accepted_values</code> и два singular-теста на дубли и отрицательные суммы.</p></div>",
      '<div class="card"><h3>BI-дашборд</h3><p>MRR, ARPU, отток, failed payments, динамика и когорта по каналам. ' +
        "Ниже — дашборд, собранный из <code>mart_*</code>, а не из сырых CSV.</p></div>",
      '<div class="card"><h3>Ревью</h3><p>Чек-лист, рубрика и разбор плохого PR. ' +
        "Нужно не только посчитать, но и объяснить, что исправить.</p></div>",
      "</div>",
      "<h2>Lineage</h2>",
      '<pre class="code-block"><code>sub_users ─┐\nsub_subscriptions ─┼─> staging ─> dim_users / fct_payments / mart_* ─> BI\nsub_payments ─┤\nsub_tickets ─┘</code></pre>',
      "<h2>Запуск</h2>",
      '<pre class="code-block"><code>unzip dbt-subscription.zip\ncd dbt-subscription\npython -m venv .venv\nsource .venv/bin/activate\npip install -r requirements.txt\ncp profiles.yml.example profiles.yml\ndbt seed --profiles-dir .\ndbt build --profiles-dir .</code></pre>',
      '<p class="meta">Нужен Python 3.12: <code>scripts/check_python.py</code> сразу отклоняет 3.14, иначе pip уходит в долгую сборку. Seeds уже в архиве.</p>',
      "<h2>Живой дашборд</h2>",
      '<div class="card"><div class="dbt-toolbar"><label>Канал <select id="dbtChannel">' +
        '<option value="">Все каналы</option><option value="paid_search">paid_search</option>' +
        '<option value="social">social</option><option value="referral">referral</option><option value="email">email</option>' +
        "</select></label></div>",
      '<div id="dbtDashboard"><p class="meta">Загрузка данных…</p></div>',
      '<p class="meta" id="dbtDashStatus">Дашборд читает витрины dbt: <code>mart_subscription_health</code>, <code>mart_monthly_revenue</code>, <code>mart_channel_cohort</code> и <code>mart_payment_summary</code>.</p></div>',
      "<h2>Ревью</h2>",
      '<div class="table-wrap"><table><thead><tr><th>Критерий</th><th>0</th><th>1</th><th>2</th></tr></thead><tbody>',
      "<tr><td>Зерно и joins</td><td>Строки размножаются</td><td>Зерно есть, но не проверено</td><td>Зерно явное, дубли и cardinality проверены</td></tr>",
      "<tr><td>Качество данных</td><td>Дефекты не замечены</td><td>Перечислены</td><td>Посчитаны, обработаны и покрыты тестами</td></tr>",
      "<tr><td>dbt-модели</td><td>Одна огромная модель</td><td>Слои есть, тестов мало</td><td>staging/marts, тесты, документация</td></tr>",
      "<tr><td>BI</td><td>Графики без определений</td><td>KPI есть, но не сверены</td><td>Определения, период, сверка с SQL</td></tr>",
      "<tr><td>Коммуникация</td><td>Нет записки</td><td>Есть цифры без решения</td><td>Решение, риск и следующий шаг</td></tr>",
      "</tbody></table></div>",
      '<details class="card"><summary><b>Пример ревью PR</b> — что сказать автору</summary>',
      '<pre class="code-block"><code>select p.*, u.channel\nfrom stg_payments p\nleft join stg_users u using (user_id)\nwhere p.status = \'paid\'</code></pre>',
      "<ol><li><b>Зерно не задано.</b> Непонятно, строка — платёж, пользователь или день. Нужен <code>payment_id</code> и тест <code>unique</code>.</li>" +
        "<li><b><code>select *</code>.</b> Схема поедет при добавлении колонки; перечислите поля явно.</li>" +
        "<li><b><code>left join</code> + фильтр справа.</b> Фактически inner join; если нужны все платежи, фильтр надо перенести.</li>" +
        "<li><b>Возвраты потеряны.</b> Для net revenue нужен отдельный расчёт refunded.</li>" +
        "<li><b>Нет тестов.</b> Добавьте <code>not_null</code>, <code>relationships</code> и тест на дубли.</li>" +
        "<li><b>Нет периода.</b> Непонятно, за какой месяц и на какую дату считается метрика.</li></ol>",
      '<p><b>Как писать ревью:</b> факт → риск → действие. «В <code>fct_payments</code> 15 дублей по <code>payment_id</code>; выручка завышается при join; дедуплицируйте в staging и добавьте тест».</p>',
      "</details>",
      '<div class="card"><h2>Что сдать</h2><ol>' +
        "<li>Ссылку на репозиторий или zip, где <code>dbt build</code> проходит без ошибок.</li>" +
        "<li>Скриншот lineage и список тестов.</li>" +
        "<li>Дашборд: MRR, отток, failed payments и разрез по каналам.</li>" +
        "<li>Записку на 5–7 предложений: решение, риск, следующий шаг.</li>" +
        "<li>Саморевью по чек-листу из <code>REVIEW.md</code>.</li>" +
        "</ol></div>"
    ].join("");
  }

  function bind() {
    var root = document.getElementById("dbtDashboard");
    if (!root) return;
    var select = document.getElementById("dbtChannel");
    var status = document.getElementById("dbtDashStatus");
    var asOf = Date.UTC(2026, 8, 30);
    var cut = Date.UTC(2026, 6, 1);
    var monthNames = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

    function fail() {
      root.innerHTML = '<p class="verdict bad">Не удалось загрузить mart_*. Откройте сайт по http:// или https://.</p>';
    }

    function sum(rows, fn) {
      return rows.reduce(function (n, r) { return n + Number(fn(r) || 0); }, 0);
    }

    function isTrue(v) {
      return String(v).toLowerCase() === "true" || String(v) === "1";
    }

    Promise.all([
      fetch("data/mart_subscription_health.csv").then(function (r) { return r.text(); }),
      fetch("data/mart_monthly_revenue.csv").then(function (r) { return r.text(); }),
      fetch("data/mart_channel_cohort.csv").then(function (r) { return r.text(); }),
      fetch("data/mart_payment_summary.csv").then(function (r) { return r.text(); })
    ]).then(function (texts) {
      var health = parseCsv(texts[0]);
      var monthly = parseCsv(texts[1]);
      var cohort = parseCsv(texts[2]);
      var payments = parseCsv(texts[3]);

      function render(channel) {
        var hs = health.filter(function (h) { return !channel || h.channel === channel; });
        var activeRows = hs.filter(function (h) { return isTrue(h.is_active); });
        var activeUsers = {};
        activeRows.forEach(function (h) { activeUsers[h.user_id] = 1; });
        var mrr = sum(activeRows, function (h) { return h.monthly_price; });
        var arpu = mrr / Math.max(1, Object.keys(activeUsers).length);

        var activeCut = hs.filter(function (h) {
          var st = toDate(h.start_date), en = toDate(h.end_date);
          return st && st <= cut && (!en || en > cut);
        });
        var cancelled = hs.filter(function (h) {
          var en = toDate(h.end_date);
          return en && en >= cut && en <= asOf;
        });
        var churn = activeCut.length ? cancelled.length / activeCut.length * 100 : 0;

        var pays = payments.filter(function (p) { return !channel || p.channel === channel; });
        var totalPay = sum(pays, function (p) { return p.payments; });
        var failed = sum(pays.filter(function (p) { return p.status === "failed"; }), function (p) { return p.payments; });
        var refunds = sum(pays.filter(function (p) { return p.status === "refunded"; }), function (p) { return p.amount; });

        var ms = monthly.filter(function (m) { return !channel || m.channel === channel; });
        var byMonth = {};
        ms.forEach(function (m) {
          var key = m.month.slice(0, 7);
          byMonth[key] = (byMonth[key] || 0) + Number(m.net_revenue);
        });
        var months = Object.keys(byMonth).sort();
        var values = months.map(function (m) { return byMonth[m]; });
        var labels = months.map(function (m) { return monthNames[Number(m.slice(5, 7)) - 1] || m; });

        var byPlan = { basic: 0, pro: 0 };
        activeRows.forEach(function (h) { byPlan[h.plan] = (byPlan[h.plan] || 0) + 1; });
        var maxPlan = Math.max(1, byPlan.basic, byPlan.pro);

        var cohortRows = cohort.filter(function (c) { return !channel || c.channel === channel; });

        root.innerHTML = '<div class="dbt-kpis">' +
          kpi("MRR", money(mrr), "на 30.09.2026") +
          kpi("Активные пользователи", num(Object.keys(activeUsers).length), "с активной подпиской") +
          kpi("ARPU", money(arpu), "MRR / активные") +
          kpi("Отток 90 дней", pct(churn), "июль–сентябрь") +
          kpi("Failed payments", pct(totalPay ? failed / totalPay * 100 : 0), failed + " из " + totalPay) +
          kpi("Возвраты", money(refunds), "по mart_payment_summary") +
          "</div>" +
          '<div class="grid"><div class="card"><h3>MRR по тарифам</h3>' +
          barRow("basic", byPlan.basic, maxPlan, num(byPlan.basic)) +
          barRow("pro", byPlan.pro, maxPlan, num(byPlan.pro)) +
          '</div><div class="card"><h3>Net revenue по месяцам</h3>' + lineChart(values, labels) +
          '<p class="meta">mart_monthly_revenue; оплаченные минус возвраты внутри жизненного цикла.</p></div></div>' +
          '<div class="table-wrap"><table><thead><tr><th>Канал</th><th>Когорта</th><th>Активны</th><th>Доля</th></tr></thead><tbody>' +
          cohortRows.map(function (r) {
            return "<tr><td>" + esc(r.channel) + "</td><td>" + num(r.users) + "</td><td>" + num(r.active_users) + "</td><td>" + pct(Number(r.active_share)) + "</td></tr>";
          }).join("") + "</tbody></table></div>" +
          '<p class="meta">Источники: mart_subscription_health, mart_monthly_revenue, mart_channel_cohort, mart_payment_summary. Канальный фильтр применяется ко всем KPI и графику.</p>';

        if (status) status.textContent = "Дашборд собран из mart_*: " + num(health.length) + " подписок, " + num(monthly.length) + " строк выручки.";
      }

      render("");
      if (select) select.addEventListener("change", function () { render(select.value); });
    }).catch(fail);
  }

  window.DBT_PROJECT = { page: page, bind: bind };
})();
