// Калькуляторы аналитика.
(function () {
  "use strict";
  function calcPage() {
    function field(id, label, value, step) {
      return '<label>' + label + '<input id="' + id + '" type="number" inputmode="decimal" step="' + (step || "any") + '" value="' + value + '"></label>';
    }
    return '<h1>Калькуляторы аналитика</h1>' +
      '<p class="lead">Быстрые расчёты для планирования эксперимента и юнит-экономики. ' +
      "Формулы приближённые: для маленьких выборок и редких событий проверяйте результат симуляцией.</p>" +
      '<section class="card calc-card"><h2>Размер выборки для A/B</h2>' +
      '<div class="calc-grid">' + field("csP1", "Конверсия A, %", 10) + field("csP2", "Конверсия B, %", 12) +
      field("csPower", "Мощность", 0.8) + field("csAlpha", "Уровень значимости", 0.05) + "</div>" +
      '<p class="calc-out" id="csOut" aria-live="polite"></p></section>' +
      '<section class="card calc-card"><h2>Минимальный детектируемый эффект</h2>' +
      '<div class="calc-grid">' + field("mdeBase", "Базовая конверсия, %", 10) +
      field("mdeN", "Выборка на группу", 4000) + field("mdePower", "Мощность", 0.8) +
      field("mdeAlpha", "Уровень значимости", 0.05) + "</div>" +
      '<p class="calc-out" id="mdeOut2" aria-live="polite"></p></section>' +
      '<section class="card calc-card"><h2>Длительность теста</h2>' +
      '<div class="calc-grid">' + field("durN", "Нужно на группу", 4000) +
      field("durTraffic", "Трафик в день, всего", 1200) + "</div>" +
      '<p class="calc-out" id="durOut" aria-live="polite"></p></section>' +
      '<section class="card calc-card"><h2>Доверительный интервал доли</h2>' +
      '<div class="calc-grid">' + field("ciConv", "Конверсий", 120) + field("ciVisitors", "Визитов", 1000) + "</div>" +
      '<p class="calc-out" id="ciOut" aria-live="polite"></p></section>' +
      '<section class="card calc-card"><h2>LTV, CAC и окупаемость</h2>' +
      '<div class="calc-grid">' + field("ueArpu", "Выручка с клиента в месяц, ₽", 900) +
      field("ueCac", "CAC, ₽", 2400) + field("ueChurn", "Отток в месяц, %", 5) + "</div>" +
      '<p class="calc-out" id="ueOut" aria-live="polite"></p></section>';
  }

  function bindCalc() {
    function num(id) { return Number((document.getElementById(id) || {}).value); }
    function fmt(n, digits) {
      return Number(n).toLocaleString("ru-RU", { maximumFractionDigits: digits == null ? 0 : digits });
    }
    function zAlpha(a) { return a === 0.01 ? 2.575829 : 1.959964; }
    function zPower(p) { return p === 0.9 ? 1.281552 : 0.841621; }
    function size(p1, p2, power, alpha) {
      var za = zAlpha(alpha), zp = zPower(power), d = Math.abs(p2 - p1);
      if (!(p1 > 0 && p1 < 1 && p2 > 0 && p2 < 1) || d < 0.000001) return null;
      return Math.ceil(Math.pow(za + zp, 2) * (p1 * (1 - p1) + p2 * (1 - p2)) / (d * d));
    }
    function sample() {
      var p1 = num("csP1") / 100, p2 = num("csP2") / 100;
      var n = size(p1, p2, num("csPower"), num("csAlpha"));
      document.getElementById("csOut").textContent = n
        ? "Нужно примерно " + fmt(n) + " наблюдений в каждой группе, всего " + fmt(2 * n) + "."
        : "Введите две разные конверсии от 0 до 100%.";
    }
    function mde() {
      var p1 = num("mdeBase") / 100, n = num("mdeN"), power = num("mdePower"), alpha = num("mdeAlpha");
      if (!(p1 > 0 && p1 < 1) || !(n > 0)) { document.getElementById("mdeOut2").textContent = "Проверьте базовую конверсию и выборку."; return; }
      var za = zAlpha(alpha), zp = zPower(power), lo = 0, hi = 1 - p1;
      for (var i = 0; i < 60; i++) {
        var mid = (lo + hi) / 2, p2 = p1 + mid;
        var req = Math.pow(za + zp, 2) * (p1 * (1 - p1) + p2 * (1 - p2)) / (mid * mid);
        if (req > n) lo = mid; else hi = mid;
      }
      var d = (lo + hi) / 2;
      document.getElementById("mdeOut2").textContent = "При такой выборке тест увидит рост с " +
        fmt(p1 * 100, 1) + "% примерно до " + fmt((p1 + d) * 100, 1) + "%: эффект от " + fmt(d * 100, 1) + " п.п.";
    }
    function duration() {
      var n = num("durN"), traffic = num("durTraffic");
      if (!(n > 0 && traffic > 0)) { document.getElementById("durOut").textContent = "Проверьте выборку и трафик."; return; }
      var days = Math.ceil(2 * n / traffic);
      document.getElementById("durOut").textContent = "Примерно " + fmt(days) + " дней, или " +
        fmt(days / 7, 1) + " недель. Округляйте вверх и не останавливайте тест раньше срока.";
    }
    function interval() {
      var c = num("ciConv"), n = num("ciVisitors");
      if (!(c >= 0 && n > 0 && c <= n)) { document.getElementById("ciOut").textContent = "Конверсий должно быть от 0 до числа визитов."; return; }
      var p = c / n, se = Math.sqrt(p * (1 - p) / n), moe = 1.959964 * se;
      var lo = Math.max(0, p - moe), hi = Math.min(1, p + moe);
      document.getElementById("ciOut").textContent = "Конверсия " + fmt(p * 100, 1) + "%, 95% ДИ: " +
        fmt(lo * 100, 1) + "–" + fmt(hi * 100, 1) + "%. Ширина интервала: ±" + fmt(moe * 100, 1) + " п.п.";
    }
    function unit() {
      var arpu = num("ueArpu"), cac = num("ueCac"), churn = num("ueChurn");
      if (!(arpu > 0 && cac > 0 && churn > 0 && churn < 100)) {
        document.getElementById("ueOut").textContent = "Проверьте выручку, CAC и отток (0–100%).";
        return;
      }
      var ltv = arpu / (churn / 100), ratio = ltv / cac, payback = cac / arpu;
      var verdict = ratio >= 3 ? "запас есть" : ratio >= 1 ? "на границе" : "экономика отрицательная";
      document.getElementById("ueOut").textContent = "LTV ≈ " + fmt(ltv) + " ₽, LTV/CAC = " +
        fmt(ratio, 2) + " (" + verdict + "), окупаемость CAC ≈ " + fmt(payback, 1) + " мес.";
    }
    var map = { csP1: sample, csP2: sample, csPower: sample, csAlpha: sample,
      mdeBase: mde, mdeN: mde, mdePower: mde, mdeAlpha: mde,
      durN: duration, durTraffic: duration, ciConv: interval, ciVisitors: interval,
      ueArpu: unit, ueCac: unit, ueChurn: unit };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.addEventListener("input", map[id]); el.addEventListener("change", map[id]); }
    });
    sample(); mde(); duration(); interval(); unit();
  }

  window.CALC = { page: calcPage, bind: bindCalc };
})();
