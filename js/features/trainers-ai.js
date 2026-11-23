// Тренажёры: AI/LLM-аналитика.
(function () {
  "use strict";
  var U = window.TRAINER_UTILS;

  function tAiEval() {
    var total = 40, passed = 32;
    return {
      prompt: "В eval-наборе 40 кейсов, 32 прошли проверку. Какой процент кейсов прошёл?",
      solution: "32 / 40 × 100 = 80%.",
      answer: U.num(passed / total * 100, 0.01, 1)
    };
  }

  function tAiCost() {
    var requests = 1000, price = 0.02;
    return {
      prompt: "Стоимость одного запроса — 0,02 ₽. Сколько стоит 1000 запросов?",
      solution: "1000 × 0,02 = 20 ₽.",
      answer: U.num(requests * price, 0.01, 2)
    };
  }

  window.TRAINER_FNS.tAiEval = tAiEval;
  window.TRAINER_FNS.tAiCost = tAiCost;
})();
