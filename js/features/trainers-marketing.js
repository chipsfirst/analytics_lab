// Тренажёры: маркетинговая аналитика.
(function () {
  "use strict";
  var U = window.TRAINER_UTILS;
  var rndStep = U.rndStep, fmt = U.fmt, num = U.num, C = U.C;

  function tCacCalc() {
    var spend = rndStep(2000, 50000, 1000);
    var conv = rndStep(50, 900, 1);
    var ans = spend / conv;
    return {
      prompt: "Канал потратил " + fmt(spend) + " ₽ и привёл " + conv +
        " новых клиентов. Найдите CAC канала (округлите до сотых).",
      solution: "CAC = расходы / клиенты = " + spend + " / " + conv + " = " + fmt(ans) + " ₽.",
      answer: num(ans, 0.02)
    };
  }

  function tRoasCalc() {
    var spend = rndStep(1000, 40000, 500);
    var rev = spend * rndStep(200, 900, 1) / 100;
    var ans = rev / spend;
    return {
      prompt: "Канал потратил " + fmt(spend) + " ₽ и принёс выручку " + fmt(rev) +
        " ₽. Найдите ROAS (выручка / расходы, округлите до сотых).",
      solution: "ROAS = выручка / расходы = " + fmt(rev) + " / " + fmt(spend) + " = " + fmt(ans) + ".",
      answer: num(ans, 0.02)
    };
  }

  window.TRAINER_FNS.tCacCalc = tCacCalc;
  window.TRAINER_FNS.tRoasCalc = tRoasCalc;
})();
