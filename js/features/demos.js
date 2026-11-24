// Демонстрации: реестр.
(function () {
  "use strict";
  var F = window.DEMO_FNS;
  var mountCLT = F.mountCLT;
  var mountSample = F.mountSample;
  var mountRegression = F.mountRegression;
  var mountIntervals = F.mountIntervals;
  var mountSimpson = F.mountSimpson;
  var mountErrors = F.mountErrors;
  var mountBootstrap = F.mountBootstrap;
  var mountPermutation = F.mountPermutation;
  var mountRoc = F.mountRoc;
  var mountPeek = F.mountPeek;
  var mountAiCost = F.mountAiCost;
  var mountMonteCarlo = F.mountMonteCarlo;
  var mountQueue = F.mountQueue;
  var mountCode = F.mountCode;
  window.DEMOS = {
    clt: {
      title: "Центральная предельная теорема",
      tag: "Почему среднее становится нормальным, даже если данные нет",
      mount: mountCLT
    },
    sample: {
      title: "Размер выборки для A/B",
      tag: "Сколько пользователей нужно, чтобы заметить эффект",
      mount: mountSample
    },
    regression: {
      title: "Регрессия к среднему",
      tag: "Почему худшие и лучшие «исправляются» сами",
      mount: mountRegression
    },
    intervals: {
      title: "Доверительные интервалы",
      tag: "Пятьдесят интервалов и пять процентов промахов",
      mount: mountIntervals
    },
    simpson: {
      title: "Парадокс Симпсона",
      tag: "Рост в каждой группе, падение в целом",
      mount: mountSimpson
    },
    errors: {
      title: "Ошибки I и II рода",
      tag: "Цена порога: α, β и мощность теста",
      mount: mountErrors
    },
    bootstrap: {
      title: "Бутстрап",
      tag: "Разброс статистики без формул и допущений",
      mount: mountBootstrap
    },
    permutation: {
      title: "Перестановочный тест",
      tag: "Наблюдаемая разница против случайных перетасовок",
      mount: mountPermutation
    },
    roc: {
      title: "ROC-кривая и порог",
      tag: "Как перенос порога меняет цену ошибок",
      mount: mountRoc
    },
    peek: {
      title: "Подглядывание в A/B",
      tag: "Почему ежедневная проверка p-value повышает ложные срабатывания",
      mount: mountPeek
    },
    aicost: {
      title: "Стоимость AI-фичи",
      tag: "Цена запроса, месяца и решённой задачи",
      mount: mountAiCost
    },
    montecarlo: {
      title: "Монте-Карло для LTV",
      tag: "Диапазон исходов вместо одной цифры",
      mount: mountMonteCarlo
    },
    queue: {
      title: "Очередь поддержки",
      tag: "Загрузка, среднее ожидание и p95",
      mount: mountQueue
    },
    code: {
      title: "SQL, Python и дашборд",
      tag: "Один результат тремя способами",
      mount: mountCode
    }
  };
})();
