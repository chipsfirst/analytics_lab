// Тренажёры: симуляции и оптимизация.
(function () {
  "use strict";
  var U = window.TRAINER_UTILS;
  var rndStep = U.rndStep, fmt = U.fmt, num = U.num;

  function tEoqCalc() {
    var demand = rndStep(4000, 30000, 1000);
    var order = rndStep(200, 1200, 50);
    var hold = rndStep(10, 80, 5);
    var ans = Math.sqrt(2 * demand * order / hold);
    return {
      prompt: "Годовой спрос " + fmt(demand) + " шт., стоимость заказа " + fmt(order) +
        " ₽, хранение одной штуки " + fmt(hold) + " ₽/год. Найдите EOQ (округлите до целого).",
      solution: "EOQ = √(2 × D × S / H) = √(2 × " + demand + " × " + order + " / " + hold + ") = " + fmt(ans) + ".",
      answer: num(ans, 1)
    };
  }

  function tQueueUtil() {
    var lambda, mu, c;
    do {
      lambda = rndStep(12, 90, 6);
      mu = rndStep(4, 20, 2);
      c = rndStep(2, 8, 1);
    } while (lambda >= c * mu);
    var ans = lambda / (c * mu) * 100;
    return {
      prompt: "В систему приходит " + lambda + " заявок в час, один канал обслуживает " + mu +
        " заявок в час, каналов " + c + ". Найдите загрузку ρ в процентах (округлите до целого).",
      solution: "ρ = λ / (c × μ) = " + lambda + " / (" + c + " × " + mu + ") = " + fmt(ans) + "%.",
      answer: num(ans, 0.5)
    };
  }

  window.TRAINER_FNS.tEoqCalc = tEoqCalc;
  window.TRAINER_FNS.tQueueUtil = tQueueUtil;
})();
