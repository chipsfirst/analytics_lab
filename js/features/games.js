// Игры: реестр.
(function () {
  "use strict";
  var F = window.GAME_FNS;
  var montyHall = F.montyHall;
  var prisoners = F.prisoners;
  var blitz = F.blitz;
  var calibration = F.calibration;
  var audit = F.audit;
  var bandit = F.bandit;
  var ultimatum = F.ultimatum;
  var auction = F.auction;
  var scenarioGame = F.scenarioGame;
  var metricDrop = F.metricDrop;
  var queryDetective = F.queryDetective;
  window.GAMES = {
    montyhall: {
      title: "Парадокс Монти Холла",
      tag: "Три двери и проверка интуиции: стоит ли менять выбор",
      mount: montyHall
    },
    prisoners: {
      title: "Дилемма заключённого",
      tag: "Десять раундов против четырёх стратегий",
      mount: prisoners
    },
    blitz: {
      title: "Блиц на 45 секунд",
      tag: "Вопросы из всех разделов на скорость",
      mount: blitz
    },
    calibration: {
      title: "Ставка на вероятность",
      tag: "Оцените шанс события, затем 5000 испытаний",
      mount: calibration
    },
    audit: {
      title: "Аудитор отчёта",
      tag: "Найдите ошибку в чужом выводе",
      mount: audit
    },
    ultimatum: {
      title: "Ультиматум",
      tag: "Принимайте или отклоняйте предложения о дележе 100",
      mount: ultimatum
    },
    auction: {
      title: "Аукцион второй цены",
      tag: "Пять лотов: какую ставку выбрать, если платит соперник",
      mount: auction
    },
    bandit: {
      title: "Многорукий бандит",
      tag: "Сравните ε-жадный алгоритм с делением трафика 50/50",
      mount: bandit
    },
    metricdrop: {
      title: "Почему упала метрика?",
      tag: "Диагностика падения: данные, сегменты и определения",
      mount: metricDrop
    },
    querydetective: {
      title: "SQL-детектив",
      tag: "Пять симптомов: план, NULL, дубли, индексы и порядок",
      mount: queryDetective
    }
  };
})();
