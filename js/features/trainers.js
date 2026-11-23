// Тренажёры: генераторы задач. Каждый генератор возвращает
// { prompt, solution, answer: {type:'number', value, tol} | {type:'choice', options:[{text, ok}]} }

(function () {
  "use strict";
  var U = window.TRAINER_UTILS;
  var rndInt = U.rndInt, rndStep = U.rndStep, round = U.round, fmt = U.fmt, C = U.C, num = U.num;
  var parseNum = U.parseNum, esc = U.esc, matrix = U.matrix, sample = U.sample, meanOf = U.meanOf;
  var varOf = U.varOf, nashIn = U.nashIn, sqlTable = U.sqlTable, colLetter = U.colLetter, uniqOptions = U.uniqOptions;
  var randList = U.randList, fact = U.fact;
  var F = window.TRAINER_FNS;
  var tCtr = F.tCtr, tFunnel = F.tFunnel, tRomi = F.tRomi, tLtvCac = F.tLtvCac, tAbLift = F.tAbLift, tRetention = F.tRetention;
  var tMean = F.tMean, tMedian = F.tMedian, tVariance = F.tVariance, tSd = F.tSd, tZ = F.tZ, tSe = F.tSe, tComb = F.tComb, tUnion = F.tUnion, tBayes = F.tBayes, tBinom = F.tBinom, tDice = F.tDice, tAtLeastOne = F.tAtLeastOne, tNash = F.tNash, tDominant = F.tDominant, tMaximin = F.tMaximin, tMixed = F.tMixed, tSqlWhere = F.tSqlWhere, tSqlDistinct = F.tSqlDistinct, tSqlGroupHaving = F.tSqlGroupHaving, tSqlOrderLimit = F.tSqlOrderLimit, tSqlNull = F.tSqlNull, tSqlJoin = F.tSqlJoin, tSqlWindow = F.tSqlWindow, tSqlAvgNull = F.tSqlAvgNull, tXlSumIf = F.tXlSumIf, tXlCountIf = F.tXlCountIf, tXlIf = F.tXlIf, tXlVlookup = F.tXlVlookup, tXlPct = F.tXlPct, tXlAbs = F.tXlAbs, tPySlice = F.tPySlice, tPyType = F.tPyType, tPyConvert = F.tPyConvert, tPyPrec = F.tPyPrec, tPyRange = F.tPyRange, tPyBool = F.tPyBool, tPyFind = F.tPyFind;
  var tRegPredict = F.tRegPredict, tRegRmse = F.tRegRmse, tRegDummies = F.tRegDummies, tRidgeChoice = F.tRidgeChoice, tLeakageChoice = F.tLeakageChoice, tClfPrecision = F.tClfPrecision, tClfRecall = F.tClfRecall, tClfThreshold = F.tClfThreshold, tClfOdds = F.tClfOdds, tPoisson = F.tPoisson, tKnnClass = F.tKnnClass, tForestVote = F.tForestVote, tKmeansAssign = F.tKmeansAssign, tCalibrationChoice = F.tCalibrationChoice, tMacroF1 = F.tMacroF1, tSmaCalc = F.tSmaCalc, tNaiveForecast = F.tNaiveForecast, tMapeForecast = F.tMapeForecast, tAteCalc = F.tAteCalc, tDiffInDiff = F.tDiffInDiff, tConfounder = F.tConfounder, tConsentChoice = F.tConsentChoice, tAnonChoice = F.tAnonChoice, tEthicsChoice = F.tEthicsChoice, tVizChoice = F.tVizChoice, tNoteType = F.tNoteType, tReportFirst = F.tReportFirst, tPortfolioProof = F.tPortfolioProof, tBiConversion = F.tBiConversion, tBiChartChoice = F.tBiChartChoice, tDaxChoice = F.tDaxChoice, tLodChoice = F.tLodChoice, tMissingChoice = F.tMissingChoice, tDataType = F.tDataType, tDupKey = F.tDupKey, tGrainJoin = F.tGrainJoin, tMissingMNAR = F.tMissingMNAR, tScaleChoice = F.tScaleChoice, tFreshness = F.tFreshness, tIdempotent = F.tIdempotent, tProdLayer = F.tProdLayer, tProdDbtTest = F.tProdDbtTest, tProdFreshness = F.tProdFreshness, tShapley = F.tShapley, tSignaling = F.tSignaling, tCsComplexity = F.tCsComplexity, tCsStructure = F.tCsStructure, tCsIndex = F.tCsIndex, tPyMemory = F.tPyMemory, tPyWindow = F.tPyWindow;
  var tAiEval = F.tAiEval, tAiCost = F.tAiCost;
  var tCacCalc = F.tCacCalc, tRoasCalc = F.tRoasCalc, tEoqCalc = F.tEoqCalc, tQueueUtil = F.tQueueUtil;




  window.checkAnswer = function (task, input) {
    var a = task.answer;
    if (a.type === "choice") {
      return a.options[Number(input)] && a.options[Number(input)].ok === true;
    }
    var v = parseNum(input);
    return isFinite(v) && Math.abs(v - a.value) <= a.tol;
  };


  // ---------- аналитика ----------

  function tMad() {
    var xs = randList(5, 1, 40);
    var s = xs.slice().sort(function (a, b) { return a - b; });
    var med = s[2];
    var devs = xs.map(function (x) { return Math.abs(x - med); }).sort(function (a, b) { return a - b; });
    var ans = devs[2];
    return {
      prompt: "Найдите медианное абсолютное отклонение (MAD) набора: <b>" + xs.join(", ") + "</b>.",
      solution: "Медиана набора — " + med + ". Абсолютные отклонения по возрастанию: " + devs.join(", ") +
        ". Медиана отклонений — " + ans + ".",
      answer: num(ans, 0.001)
    };
  }

  function tTrimMean() {
    var xs = randList(5, 1, 60);
    var s = xs.slice().sort(function (a, b) { return a - b; });
    var mid = s.slice(1, 4);
    var ans = mid.reduce(function (a, b) { return a + b; }, 0) / 3;
    return {
      prompt: "Найдите усечённое среднее: отбросьте по одному крайнему значению с каждого конца и усредните " +
        "оставшиеся. Набор: <b>" + xs.join(", ") + "</b>. Округлите до сотых.",
      solution: "Упорядочим: " + s.join(", ") + ". Отбрасываем " + s[0] + " и " + s[4] +
        ", среднее оставшихся: (" + mid.join(" + ") + ") / 3 = " + fmt(ans) + ".",
      answer: num(ans, 0.02)
    };
  }

  function tIqr() {
    var xs = randList(8, 1, 50);
    var s = xs.slice().sort(function (a, b) { return a - b; });
    var q1 = (s[1] + s[2]) / 2;
    var q3 = (s[5] + s[6]) / 2;
    var ans = q3 - q1;
    return {
      prompt: "Найдите межквартильный размах (IQR) набора: <b>" + xs.join(", ") + "</b>. " +
        "Нижняя и верхняя половины — по четыре значения.",
      solution: "Упорядочим: " + s.join(", ") + ". Q₁ — медиана нижней половины: (" + s[1] + " + " + s[2] +
        ") / 2 = " + fmt(q1) + ". Q₃ — медиана верхней половины: (" + s[5] + " + " + s[6] + ") / 2 = " + fmt(q3) +
        ". IQR = " + fmt(q3) + " − " + fmt(q1) + " = " + fmt(ans) + ".",
      answer: num(ans, 0.001)
    };
  }

  // ---------- регрессия и классификация ----------

  window.TRAINERS = {
    analytics: [tCtr, tFunnel, tRomi, tLtvCac, tAbLift, tRetention],
    statistics: [tMean, tMedian, tVariance, tSd, tZ, tSe, tMad, tTrimMean, tIqr, tPoisson],
    probability: [tComb, tUnion, tBayes, tBinom, tDice, tAtLeastOne],
    gametheory: [tNash, tDominant, tMaximin, tMixed, tShapley, tSignaling],
    data: [tMissingChoice, tDataType, tDupKey, tGrainJoin, tMissingMNAR, tScaleChoice, tFreshness, tIdempotent],
    sql: [tSqlWhere, tSqlDistinct, tSqlGroupHaving, tSqlOrderLimit, tSqlNull, tSqlJoin, tSqlWindow, tSqlAvgNull],
    excel: [tXlSumIf, tXlCountIf, tXlIf, tXlVlookup, tXlPct, tXlAbs],
    python: [tPySlice, tPyType, tPyConvert, tPyPrec, tPyRange, tPyBool, tPyFind, tPyMemory, tPyWindow],
    regression: [tRegPredict, tRegRmse, tRegDummies, tRidgeChoice, tLeakageChoice],
    classification: [tClfPrecision, tClfRecall, tClfThreshold, tClfOdds, tCalibrationChoice, tMacroF1],
    ml: [tKnnClass, tForestVote, tKmeansAssign],
    useful: [tVizChoice, tNoteType, tReportFirst, tPortfolioProof],
    ethics: [tConsentChoice, tAnonChoice, tEthicsChoice],
    bi: [tBiConversion, tBiChartChoice, tDaxChoice, tLodChoice],
    cs: [tCsComplexity, tCsStructure, tCsIndex],
    production: [tProdLayer, tProdDbtTest, tProdFreshness],
    timeseries: [tSmaCalc, tNaiveForecast, tMapeForecast],
    causal: [tAteCalc, tDiffInDiff, tConfounder],
    ai: [tAiEval, tAiCost],
    marketing: [tCacCalc, tRoasCalc],
    simulation: [tEoqCalc, tQueueUtil]
  };
})();
