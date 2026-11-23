// Тренажёры: аналитика.
(function () {
  "use strict";
  var U = window.TRAINER_UTILS;
  var rndInt = U.rndInt, rndStep = U.rndStep, round = U.round, fmt = U.fmt, num = U.num, esc = U.esc;
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


  window.TRAINER_FNS.tCtr = tCtr;
  window.TRAINER_FNS.tFunnel = tFunnel;
  window.TRAINER_FNS.tRomi = tRomi;
  window.TRAINER_FNS.tLtvCac = tLtvCac;
  window.TRAINER_FNS.tAbLift = tAbLift;
  window.TRAINER_FNS.tRetention = tRetention;
})();
