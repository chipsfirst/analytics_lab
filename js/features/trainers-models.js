// Тренажёры: регрессия, классификация и ML.
(function () {
  "use strict";
  var U = window.TRAINER_UTILS;
  var rndInt = U.rndInt, rndStep = U.rndStep, round = U.round, fmt = U.fmt, C = U.C, num = U.num;
  var parseNum = U.parseNum, esc = U.esc, matrix = U.matrix, sample = U.sample, meanOf = U.meanOf;
  var varOf = U.varOf, nashIn = U.nashIn, sqlTable = U.sqlTable, colLetter = U.colLetter, uniqOptions = U.uniqOptions;
  var randList = U.randList, fact = U.fact;
  function tRegPredict() {
    var b0 = rndStep(100, 900, 50);
    var b1 = rndStep(20, 200, 10);
    var x = rndInt(2, 9);
    var y = b0 + b1 * x;
    return {
      prompt: "Уравнение регрессии: <b>ŷ = " + b0 + " + " + b1 + "·x</b>. " +
        "Чему равно предсказание при x = <b>" + x + "</b>?",
      solution: "Подставляем x: " + b0 + " + " + b1 + " × " + x + " = " + y + ".",
      answer: num(y, 0.01)
    };
  }

  function tRegRmse() {
    var pairs = [], se = 0;
    for (var i = 0; i < 3; i++) {
      var y = rndInt(10, 60), p = rndInt(10, 60);
      pairs.push([y, p]);
      se += (y - p) * (y - p);
    }
    var ans = Math.sqrt(se / 3);
    return {
      prompt: "Факт и прогноз по трём наблюдениям: " +
        pairs.map(function (q) { return q[0] + " / " + q[1]; }).join(", ") +
        " (факт / прогноз). Чему равен RMSE? Округлите до сотых.",
      solution: "Ошибки: " + pairs.map(function (q) {
        return q[0] + " − " + q[1] + " = " + (q[0] - q[1]);
      }).join(", ") + ". Сумма квадратов = " + se +
        ", делим на 3 и извлекаем корень: " + fmt(ans) + ".",
      answer: num(ans, 0.02)
    };
  }

  function tRegDummies() {
    var levels = rndInt(3, 6);
    var ans = levels - 1;
    return {
      prompt: "В регрессию со свободным членом включают категориальный признак с <b>" + levels +
        "</b> уровнями. Сколько фиктивных переменных нужно?",
      solution: "P − 1 = " + levels + " − 1 = " + ans + ". Последний уровень определяется остальными; " +
        "добавление ещё одной колонки даёт полную мультиколлинеарность.",
      answer: num(ans, 0.001)
    };
  }


  function tRidgeChoice() {
    return {
      prompt: "Что делает Ridge-регрессия при увеличении λ?",
      solution: "Ridge добавляет штраф λ·Σb². Чем больше λ, тем сильнее коэффициенты стягиваются к нулю; слишком большая λ приводит к недообучению.",
      answer: { type: "choice", options: [
        { text: "Сильнее уменьшает коэффициенты", ok: true },
        { text: "Обнуляет все коэффициенты сразу", ok: false },
        { text: "Увеличивает коэффициенты", ok: false },
        { text: "Отключает свободный член", ok: false }
      ] }
    };
  }

  function tLeakageChoice() {
    return {
      prompt: "Какой признак скорее всего даст утечку target при прогнозе покупки?",
      solution: "Сумма оплаты появляется только после покупки и содержит информацию о целевой переменной. В момент прогноза её ещё нет.",
      answer: { type: "choice", options: [
        { text: "Сумма оплаты за текущий заказ", ok: true },
        { text: "Число визитов за прошлую неделю", ok: false },
        { text: "Город клиента", ok: false },
        { text: "Возраст аккаунта на сегодня", ok: false }
      ] }
    };
  }

  function tClfPrecision() {
    var tp = rndInt(5, 40), fp = rndInt(5, 40);
    var ans = tp / (tp + fp) * 100;
    return {
      prompt: "Модель отметила <b>" + (tp + fp) + "</b> объектов, из них <b>" + tp +
        "</b> действительно относятся к классу 1. Чему равна precision в процентах? Округлите до десятых.",
      solution: "precision = TP / (TP + FP) = " + tp + " / " + (tp + fp) + " = " + fmt(ans, 1) + "%.",
      answer: num(ans, 0.2, 2)
    };
  }

  function tClfRecall() {
    var tp = rndInt(5, 40), fn = rndInt(3, 30);
    var ans = tp / (tp + fn) * 100;
    return {
      prompt: "В данных <b>" + (tp + fn) + "</b> объектов класса 1, модель нашла <b>" + tp +
        "</b>. Чему равен recall в процентах? Округлите до десятых.",
      solution: "recall = TP / (TP + FN) = " + tp + " / " + (tp + fn) + " = " + fmt(ans, 1) + "%.",
      answer: num(ans, 0.2, 2)
    };
  }

  function tClfThreshold() {
    var probs = [];
    for (var i = 0; i < 6; i++) probs.push(Math.round(Math.random() * 100) / 100);
    var thr = [0.3, 0.4, 0.5, 0.6][rndInt(0, 3)];
    var ans = probs.filter(function (p) { return p >= thr; }).length;
    return {
      prompt: "Склонности шести записей: " + probs.map(function (p) { return fmt(p, 2); }).join(", ") +
        ". Порог отсечения <b>" + fmt(thr, 1) + "</b>. Сколько записей будет предсказано как 1?",
      solution: "Отмечаем записи со склонностью не меньше порога: " +
        probs.map(function (p) { return p >= thr ? "1" : "0"; }).join(", ") + ". Итого " + ans + ".",
      answer: num(ans, 0.001)
    };
  }

  function tClfOdds() {
    var b = rndStep(0.2, 1.5, 0.1);
    var ans = Math.exp(b);
    return {
      prompt: "Коэффициент логистической регрессии при признаке равен <b>" + fmt(b, 1) +
        "</b>. Во сколько раз меняются перевесы при росте признака на единицу? Округлите до сотых.",
      solution: "Перевесы умножаются на exp(b) = exp(" + fmt(b, 1) + ") = " + fmt(ans) + ".",
      answer: num(ans, 0.02)
    };
  }

  // ---------- распределения и машинное обучение ----------


  function tPoisson() {
    var lambda = rndInt(1, 6);
    var k = rndInt(0, 4);
    var p = Math.pow(lambda, k) * Math.exp(-lambda) / fact(k) * 100;
    return {
      prompt: "Число событий за час — распределение Пуассона с λ = <b>" + lambda +
        "</b>. Какова вероятность получить ровно <b>" + k +
        "</b> событий? Ответ в процентах, округлите до десятых.",
      solution: "P(X = k) = λᵏ · e^(−λ) / k! = " + Math.pow(lambda, k) + " · " +
        Math.exp(-lambda).toFixed(4) + " / " + fact(k) + " = " + fmt(p / 100, 4) +
        ", то есть " + fmt(p, 1) + "%.",
      answer: num(p, 0.2, 2)
    };
  }

  function tKnnClass() {
    var dists = [1, 2, 3, 4, 5];
    for (var i = dists.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = dists[i]; dists[i] = dists[j]; dists[j] = t;
    }
    var pts = dists.map(function (d) {
      return { d: d, label: Math.random() < 0.5 ? "A" : "B" };
    });
    var nearest = pts.slice().sort(function (a, b) { return a.d - b.d; }).slice(0, 3);
    if (nearest[0].label === nearest[1].label && nearest[1].label === nearest[2].label) {
      nearest[2].label = nearest[2].label === "A" ? "B" : "A";
    }
    var votesA = nearest.filter(function (p) { return p.label === "A"; }).length;
    var ans = votesA >= 2 ? "A" : "B";
    return {
      prompt: "Пять кандидатов: " + pts.map(function (p) {
        return "класс " + p.label + " (d = " + p.d + ")";
      }).join(", ") + ". К какому классу отнесём запись при k = 3?",
      solution: "Три ближайших: " + nearest.map(function (p) {
        return p.label + " (d = " + p.d + ")";
      }).join(", ") + ". Голоса: " + votesA + " за A, " + (3 - votesA) + " за B. Побеждает " + ans + ".",
      answer: {
        type: "choice",
        options: [{ text: "A", ok: ans === "A" }, { text: "B", ok: ans === "B" }]
      }
    };
  }

  function tForestVote() {
    var votes = [];
    for (var i = 0; i < 5; i++) votes.push(Math.random() < 0.5 ? 1 : 0);
    var ones = votes.filter(function (v) { return v === 1; }).length;
    var ans = ones > 2 ? "1" : "0";
    return {
      prompt: "Пять деревьев случайного леса предсказали: <b>" + votes.join(", ") +
        "</b>. Какой класс выберет лес большинством голосов?",
      solution: "Голосов за 1: " + ones + ", за 0: " + (5 - ones) + ". Побеждает класс " + ans + ".",
      answer: {
        type: "choice",
        options: [{ text: "1", ok: ans === "1" }, { text: "0", ok: ans === "0" }]
      }
    };
  }

  function tKmeansAssign() {
    var c1 = rndInt(0, 3);
    var c2 = c1 + rndInt(4, 6);
    var pts = [], guard = 0;
    while (pts.length < 5 && guard++ < 300) {
      var p = rndInt(0, c2 + 3);
      if (Math.abs(p - c1) === Math.abs(p - c2)) continue;
      pts.push(p);
    }
    while (pts.length < 5) pts.push(Math.max(0, c1 - 1));

    var ans = pts.filter(function (p) { return Math.abs(p - c1) < Math.abs(p - c2); }).length;
    return {
      prompt: "Два центроида: <b>" + c1 + "</b> и <b>" + c2 + "</b>. Точки: <b>" + pts.join(", ") +
        "</b>. Сколько точек уйдёт в кластер с центром " + c1 + "?",
      solution: pts.map(function (p) {
        return p + ": до " + c1 + " = " + Math.abs(p - c1) + ", до " + c2 + " = " + Math.abs(p - c2);
      }).join("; ") + ". Ближе к " + c1 + " — " + ans + " точек.",
      answer: num(ans, 0.001)
    };
  }


  function tCalibrationChoice() {
    return {
      prompt: "Модель выдаёт скор 0,8, но положительных среди таких записей только 50%. Что это значит?",
      solution: "Скор не откалиброван: заявленная вероятность не совпадает с фактической частотой. Ранжирование может быть хорошим, но для решения о риске нужна калибровка.",
      answer: { type: "choice", options: [
        { text: "Вероятности не откалиброваны", ok: true },
        { text: "AUC обязательно равен 0,5", ok: false },
        { text: "Порог нужно поставить 0,5", ok: false },
        { text: "Модель нельзя использовать для ранжирования", ok: false }
      ] }
    };
  }

  function tMacroF1() {
    var a = rndStep(40, 90, 10) / 100;
    var b = rndStep(30, 80, 10) / 100;
    var c = rndStep(20, 70, 10) / 100;
    var ans = (a + b + c) / 3;
    return {
      prompt: "F1 по трём классам: <b>" + fmt(a, 1) + "</b>, <b>" + fmt(b, 1) + "</b>, <b>" +
        fmt(c, 1) + "</b>. Чему равен macro-F1?",
      solution: "Macro-F1 — среднее по классам: (" + fmt(a, 1) + " + " + fmt(b, 1) + " + " + fmt(c, 1) +
        ") / 3 = " + fmt(ans, 3) + ".",
      answer: num(ans, 0.02, 3)
    };
  }


  window.TRAINER_FNS.tRegPredict = tRegPredict;
  window.TRAINER_FNS.tRegRmse = tRegRmse;
  window.TRAINER_FNS.tRegDummies = tRegDummies;
  window.TRAINER_FNS.tRidgeChoice = tRidgeChoice;
  window.TRAINER_FNS.tLeakageChoice = tLeakageChoice;
  window.TRAINER_FNS.tClfPrecision = tClfPrecision;
  window.TRAINER_FNS.tClfRecall = tClfRecall;
  window.TRAINER_FNS.tClfThreshold = tClfThreshold;
  window.TRAINER_FNS.tClfOdds = tClfOdds;
  window.TRAINER_FNS.tPoisson = tPoisson;
  window.TRAINER_FNS.tKnnClass = tKnnClass;
  window.TRAINER_FNS.tForestVote = tForestVote;
  window.TRAINER_FNS.tKmeansAssign = tKmeansAssign;
  window.TRAINER_FNS.tCalibrationChoice = tCalibrationChoice;
  window.TRAINER_FNS.tMacroF1 = tMacroF1;
})();
