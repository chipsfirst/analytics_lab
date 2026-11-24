// Тренажёры: время, причинность, этика, BI, данные, прод и CS.
(function () {
  "use strict";
  var U = window.TRAINER_UTILS;
  var rndInt = U.rndInt, rndStep = U.rndStep, round = U.round, fmt = U.fmt, C = U.C, num = U.num;
  var parseNum = U.parseNum, esc = U.esc, matrix = U.matrix, sample = U.sample, meanOf = U.meanOf;
  var varOf = U.varOf, nashIn = U.nashIn, sqlTable = U.sqlTable, colLetter = U.colLetter, uniqOptions = U.uniqOptions;
  var randList = U.randList, fact = U.fact;
  function tSmaCalc() {
    var a = rndInt(60, 150), b = rndInt(60, 150), c = rndInt(60, 150);
    var ans = (a + b + c) / 3;
    return {
      prompt: "Последние три дня продажи были <b>" + a + "</b>, <b>" + b + "</b> и <b>" + c +
        "</b>. Чему равна скользящая средняя с окном 3?",
      solution: "SMA = (" + a + " + " + b + " + " + c + ") / 3 = " + fmt(ans, 2) + ".",
      answer: num(ans, 0.05)
    };
  }

  function tNaiveForecast() {
    var vals = [rndInt(40, 90), rndInt(60, 120), rndInt(50, 140)];
    return {
      prompt: "Продажи за три дня: <b>" + vals.join(", ") + "</b>. Какой прогноз даст наивный метод на следующий день?",
      solution: "Наивный прогноз повторяет последнее известное значение: " + vals[2] + ".",
      answer: num(vals[2], 0.001)
    };
  }

  function tMapeForecast() {
    var a1 = rndStep(80, 140, 10), a2 = rndStep(100, 180, 10);
    var f1 = a1 + rndStep(-20, 20, 10), f2 = a2 + rndStep(-30, 30, 10);
    if (f1 <= 0) f1 = a1 + 10;
    if (f2 <= 0) f2 = a2 + 10;
    var ans = ((Math.abs(f1 - a1) / a1 + Math.abs(f2 - a2) / a2) / 2) * 100;
    return {
      prompt: "Факт: <b>" + a1 + "</b> и <b>" + a2 + "</b>; прогноз: <b>" + f1 + "</b> и <b>" + f2 +
        "</b>. Чему равен MAPE в процентах?",
      solution: "MAPE = среднее относительных ошибок: (|" + f1 + " − " + a1 + "|/" + a1 + " + |" +
        f2 + " − " + a2 + "|/" + a2 + ") / 2 × 100% = " + fmt(ans, 2) + "%.",
      answer: num(ans, 0.05)
    };
  }

  function tAteCalc() {
    var t = rndStep(40, 80, 5), c = t - rndStep(5, 20, 5);
    var ans = (t - c) / 100;
    return {
      prompt: "Средняя конверсия в группе воздействия — <b>" + t + "%</b>, в контрольной — <b>" +
        c + "%</b>. Чему равен ATE в процентных пунктах?",
      solution: "ATE = E[Y|T=1] − E[Y|T=0] = " + t + "% − " + c + "% = " + fmt(ans * 100, 0) + " п.п.",
      answer: num(ans * 100, 0.01)
    };
  }

  function tDiffInDiff() {
    var t0 = rndStep(80, 120, 10), t1 = t0 + rndStep(10, 40, 10);
    var c0 = rndStep(70, 110, 10), c1 = c0 + rndStep(5, 30, 10);
    var ans = (t1 - t0) - (c1 - c0);
    return {
      prompt: "До/после: воздействие <b>" + t0 + " → " + t1 + "</b>, контроль <b>" + c0 + " → " + c1 +
        "</b>. Чему равен эффект diff-in-diff?",
      solution: "DiD = (" + t1 + " − " + t0 + ") − (" + c1 + " − " + c0 + ") = " +
        (t1 - t0) + " − " + (c1 - c0) + " = " + ans + ".",
      answer: num(ans, 0.01)
    };
  }

  function tConfounder() {
    return {
      prompt: "Изучаем эффект скидки на повторную покупку. Какой признак вероятнее всего конфаундер?",
      solution: "Доход клиента влияет и на вероятность получить скидку, и на покупку. Факт покупки — исход, а канал оплаты — скорее следствие.",
      answer: { type: "choice", options: [
        { text: "Доход клиента", ok: true },
        { text: "Факт повторной покупки", ok: false },
        { text: "Номер заказа", ok: false },
        { text: "Цвет кнопки", ok: false }
      ] }
    };
  }


  function tConsentChoice() {
    return {
      prompt: "Какие данные нужны для отчёта по конверсии лендинга?",
      solution: "Для конверсии достаточно идентификатора, события и времени; имя, телефон и адрес не нужны — это лишний риск.",
      answer: { type: "choice", options: [
        { text: "Идентификатор, событие и время", ok: true },
        { text: "Имя, телефон и адрес", ok: false },
        { text: "Паспортные данные", ok: false },
        { text: "Всё, что удалось собрать", ok: false }
      ] }
    };
  }

  function tAnonChoice() {
    return {
      prompt: "Чем псевдонимизация отличается от обезличивания?",
      solution: "При псевдонимизации остаётся ключ, по которому можно восстановить связь с человеком; обезличивание стремится исключить такую возможность.",
      answer: { type: "choice", options: [
        { text: "Псевдонимизацию можно обратить по ключу", ok: true },
        { text: "Псевдонимизация всегда необратима", ok: false },
        { text: "Обезличивание меняет только заголовки", ok: false },
        { text: "Это одно и то же", ok: false }
      ] }
    };
  }

  function tEthicsChoice() {
    return {
      prompt: "Тест повысил удержание, но выросли жалобы и отписки. Что делать?",
      solution: "Этичная оценка смотрит на вред и обратимость, а не только на рост метрики: нужно разобрать жалобы и риски, прежде чем масштабировать.",
      answer: { type: "choice", options: [
        { text: "Разобрать жалобы и риски до масштабирования", ok: true },
        { text: "Масштабировать, раз метрика выросла", ok: false },
        { text: "Скрыть жалобы от команды", ok: false },
        { text: "Отключить сбор обратной связи", ok: false }
      ] }
    };
  }

  function tVizChoice() {
    var cases = [
      { q: "показать, как менялась выручка по месяцам", right: "Линейный график", wrong: ["Круговая диаграмма", "Ящик с усами", "Диаграмма рассеяния"] },
      { q: "сравнить выручку пяти филиалов", right: "Столбиковая диаграмма", wrong: ["Линейный график", "Круговая диаграмма", "Диаграмма рассеяния"] },
      { q: "показать связь цены и спроса по товарам", right: "Диаграмма рассеяния", wrong: ["Столбиковая диаграмма", "Круговая диаграмма", "Линейный график по времени"] },
      { q: "показать доли каналов трафика, которые в сумме дают 100%", right: "Круговая диаграмма", wrong: ["Линейный график", "Ящик с усами", "Диаграмма рассеяния"] },
      { q: "сравнить распределение зарплат по отделам с выбросами", right: "Ящик с усами", wrong: ["Круговая диаграмма", "Диаграмма рассеяния", "Линейный график"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "Задача: " + c.q + ". Какой график подойдёт лучше всего?",
      solution: "Тип графика выбирается по вопросу: здесь подходит «" + c.right + "».",
      answer: { type: "choice", options: opts }
    };
  }

  function tNoteType() {
    var cases = [
      { q: "мысль пришла в метро, записали одной строкой в телефон", right: "Мимолётная", wrong: ["Постоянная", "Проектная"] },
      { q: "разобрали статью и записали вывод своими словами со ссылкой на источник", right: "Постоянная", wrong: ["Мимолётная", "Проектная"] },
      { q: "список задач и черновик отчёта на эту неделю", right: "Проектная", wrong: ["Мимолётная", "Постоянная"] },
      { q: "подчеркнули абзац в книге и закрыли, к записи не возвращались", right: "Мимолётная", wrong: ["Постоянная", "Проектная"] },
      { q: "одна мысль на карточке полными предложениями, со ссылками на другие записи", right: "Постоянная", wrong: ["Мимолётная", "Проектная"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "К какому типу относится заметка: " + c.q + "?",
      solution: "Тип определяется назначением: «" + c.right + "» — так эта запись и должна храниться.",
      answer: { type: "choice", options: opts }
    };
  }


  function tReportFirst() {
    var cases = [
      { q: "выручка выросла на 20%, но период — неполный месяц", right: "Проверить период и базу сравнения", wrong: ["Сразу строить прогноз", "Сменить цвет графика", "Удалить выбросы"] },
      { q: "конверсия выросла с 2% до 4%", right: "Проверить числитель, знаменатель и абсолютный прирост", wrong: ["Считать, что рост ровно 2%", "Сразу внедрять", "Смотреть только на p-value"] },
      { q: "в отчёте показан средний чек, но не указано, входят ли возвраты", right: "Уточнить определение метрики", wrong: ["Доверять цифре", "Удалить метрику", "Считать медиану без данных"] },
      { q: "клиенты стали покупать чаще, но средний чек упал", right: "Проверить, как изменилась общая выручка и её составляющие", wrong: ["Заключить, что стало лучше", "Заключить, что стало хуже", "Игнорировать оба показателя"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "Отчёт: " + c.q + ". Что проверить первым?",
      solution: "Сначала проверяют вопрос, период, определение и базу: «" + c.right + "». Иначе арифметика будет верной, а вывод — нет.",
      answer: { type: "choice", options: opts }
    };
  }

  function tPortfolioProof() {
    var cases = [
      { q: "дашборд с красивыми графиками без исходных данных", right: "Недостаточно: нет воспроизводимости и хода работы", wrong: ["Идеально для портфолио", "Достаточно, если графиков много", "Главное — цветовая палитра"] },
      { q: "ноутбук с SQL, проверками качества и README", right: "Сильный артефакт: виден ход работы и ограничения", wrong: ["Слишком простой", "Не нужен без дашборда", "Нельзя показывать"] },
      { q: "отрицательный результат A/B-теста с интервалом и выводом", right: "Ценный проект: показан дизайн и честный вывод", wrong: ["Неудача, лучше скрыть", "Не считается проектом", "Нужно переделать до значимости"] },
      { q: "скриншот графика без подписи источника", right: "Слабый артефакт: нельзя проверить данные и решение", wrong: ["Достаточно для найма", "Лучше ноутбука", "Главное — аккуратность"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "Что можно сказать о портфолио: " + c.q + "?",
      solution: "Оценивается проверяемость: «" + c.right + "». Исходники, README и ограничения важнее финальной картинки.",
      answer: { type: "choice", options: opts }
    };
  }

  function tBiConversion() {
    var visits = rndInt(2000, 20000);
    var orders = rndInt(50, Math.max(60, Math.floor(visits * 0.08)));
    var ans = orders / visits * 100;
    return {
      prompt: "За неделю <b>" + visits + "</b> визитов и <b>" + orders +
        "</b> заказов. Какова конверсия в заказы, в процентах?",
      solution: "Конверсия = заказы / визиты × 100% = " + orders + " / " + visits + " × 100% = " + fmt(ans, 2) + "%.",
      answer: num(ans, 0.05)
    };
  }

  function tBiChartChoice() {
    var cases = [
      { q: "показать выручку по неделям", right: "Линия", wrong: ["Круговая диаграмма", "Тепловая карта", "Трёхмерные столбики"] },
      { q: "сравнить выручку четырёх каналов", right: "Столбики", wrong: ["Линия", "Круговая диаграмма", "Диаграмма рассеяния"] },
      { q: "показать удержание по когортам и дням", right: "Тепловая карта", wrong: ["Линия", "Круговая диаграмма", "Ящик с усами"] },
      { q: "показать связь цены и числа заказов", right: "Диаграмма рассеяния", wrong: ["Линия по времени", "Круговая диаграмма", "Столбики"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "Задача дашборда: " + c.q + ". Какой тип графика выбрать?",
      solution: "Тип графика определяется вопросом: здесь подходит «" + c.right + "».",
      answer: { type: "choice", options: opts }
    };
  }

  function tDaxChoice() {
    var cases = [
      { q: "посчитать выручку в таблице Sales", right: "SUM(Sales[Amount])", wrong: ["COUNT(Sales[Amount])", "AVERAGE(Sales[Amount])", "MAX(Sales[Amount])"] },
      { q: "посчитать уникальных клиентов", right: "DISTINCTCOUNT(Sales[CustomerId])", wrong: ["COUNT(Sales[CustomerId])", "SUM(Sales[CustomerId])", "AVERAGE(Sales[CustomerId])"] },
      { q: "поделить выручку на заказы без ошибки деления на ноль", right: "DIVIDE([Revenue], [Orders])", wrong: ["[Revenue] / [Orders]", "SUM([Revenue] / [Orders])", "CALCULATE([Revenue]) / [Orders]"] },
      { q: "посчитать продажи за тот же период прошлого года", right: "CALCULATE([Sales], SAMEPERIODLASTYEAR('Date'[Date]))", wrong: ["[Sales] - 1", "SUM([Sales]) / 2", "DIVIDE([Sales], 12)"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "Какое выражение DAX нужно, чтобы " + c.q + "?",
      solution: "Правильный вариант: <code>" + c.right + "</code>. Он соответствует смыслу задачи и не смешивает строки с агрегатами.",
      answer: { type: "choice", options: opts }
    };
  }

  function tLodChoice() {
    var cases = [
      { q: "дата первой покупки каждого клиента", right: "{ FIXED [Customer] : MIN([Order Date]) }", wrong: ["MIN([Order Date])", "{ INCLUDE [Region] : SUM([Sales]) }", "{ EXCLUDE [Category] : SUM([Sales]) }"] },
      { q: "сумма продаж с учётом региона, даже если регион не в графике", right: "{ INCLUDE [Region] : SUM([Sales]) }", wrong: ["{ FIXED [Customer] : MIN([Order Date]) }", "SUM([Sales])", "{ EXCLUDE [Region] : SUM([Sales]) }"] },
      { q: "сумма продаж без разбивки по категории", right: "{ EXCLUDE [Category] : SUM([Sales]) }", wrong: ["SUM([Sales])", "{ INCLUDE [Category] : SUM([Sales]) }", "{ FIXED [Category] : MIN([Sales]) }"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "Какое LOD-выражение Tableau считает: " + c.q + "?",
      solution: "Правильный вариант: <code>" + c.right + "</code>. FIXED задаёт свой уровень, INCLUDE добавляет измерение, EXCLUDE убирает его.",
      answer: { type: "choice", options: opts }
    };
  }

  function tMissingChoice() {
    return {
      prompt: "В поле «возраст» встречаются 999, −3 и пустые значения. Что сделать сначала?",
      solution: "Сначала выяснить смысл значений: 999 и −3 — технические заглушки или ошибки, пусто — отсутствие ответа. Их приводят к NULL, а стратегию заполнения выбирают после этого.",
      answer: { type: "choice", options: [
        { text: "Понять, что означает каждое значение, и привести ошибки к NULL", ok: true },
        { text: "Заменить всё средним", ok: false },
        { text: "Удалить столбец", ok: false },
        { text: "Оставить как есть", ok: false }
      ] }
    };
  }

  function tDataType() {
    return {
      prompt: "Какой тип лучше задать для поля order_date со значениями 2026-01-03?",
      solution: "Это дата. Строка не позволит корректно фильтровать период и считать интервалы; для даты нужен тип DATE или timestamp.",
      answer: { type: "choice", options: [
        { text: "Дата", ok: true },
        { text: "Целое число", ok: false },
        { text: "Текст без изменений", ok: false },
        { text: "Логический", ok: false }
      ] }
    };
  }

  function tDupKey() {
    return {
      prompt: "В таблице 10 строк, но уникальных order_id только 9. Что сделать сначала?",
      solution: "Проверить, откуда дубликат: повторная загрузка, несколько позиций или ошибка ключа. Удалять строки можно только после объяснения причины.",
      answer: { type: "choice", options: [
        { text: "Проверить источник и причину дубликата", ok: true },
        { text: "Удалить первую попавшуюся строку", ok: false },
        { text: "Оставить как есть", ok: false },
        { text: "Умножить суммы на 0,9", ok: false }
      ] }
    };
  }

  function tGrainJoin() {
    return {
      prompt: "10 заказов соединили с 30 позициями по order_id. Сколько строк получится?",
      solution: "JOIN 1:N даёт 30 строк: каждая позиция повторяет заказ. Сумма по заказам после этого задвоится, поэтому позиции сначала агрегируют.",
      answer: { type: "choice", options: [
        { text: "30", ok: true },
        { text: "10", ok: false },
        { text: "40", ok: false },
        { text: "3", ok: false }
      ] }
    };
  }

  function tMissingMNAR() {
    return {
      prompt: "Пропуски в доходе есть только у тех, кто отказался отвечать. Какой это тип пропуска?",
      solution: "MNAR: вероятность пропуска зависит от самого ненаблюдаемого значения. Заполнять медианой вслепую нельзя — это исказит вывод.",
      answer: { type: "choice", options: [
        { text: "MNAR", ok: true },
        { text: "MCAR", ok: false },
        { text: "MAR", ok: false },
        { text: "Обычный шум", ok: false }
      ] }
    };
  }

  function tScaleChoice() {
    return {
      prompt: "Какой метод требует стандартизации признаков перед обучением?",
      solution: "kNN использует расстояния, поэтому крупная шкала одного признака подавляет остальные. Деревья и леса к масштабу устойчивы.",
      answer: { type: "choice", options: [
        { text: "k ближайших соседей", ok: true },
        { text: "Решающее дерево", ok: false },
        { text: "Случайный лес", ok: false },
        { text: "Ни один из них", ok: false }
      ] }
    };
  }

  function tFreshness() {
    return {
      prompt: "Дашборд обновляется ежедневно, но показывает данные недельной давности. Какой тест это поймает?",
      solution: "Нужна проверка свежести: максимальная дата в витрине и время последней успешной загрузки. Без неё старые данные выглядят актуальными.",
      answer: { type: "choice", options: [
        { text: "Проверка максимальной даты и времени загрузки", ok: true },
        { text: "Проверка цветовой палитры", ok: false },
        { text: "Проверка числа столбцов", ok: false },
        { text: "Проверка названия отчёта", ok: false }
      ] }
    };
  }

  function tIdempotent() {
    return {
      prompt: "Ночной ETL случайно запустили дважды за один день. Что должно произойти в хорошем пайплайне?",
      solution: "Повторный запуск должен быть идемпотентным: перезаписать партицию за тот же период, а не добавить её ещё раз. Иначе суммы удвоятся.",
      answer: { type: "choice", options: [
        { text: "Данные за день перезапишутся, дублей не будет", ok: true },
        { text: "Все суммы удвоятся", ok: false },
        { text: "Пайплайн удалит историю", ok: false },
        { text: "Ничего не изменится, но данные останутся старыми", ok: false }
      ] }
    };
  }

  function tProdLayer() {
    var cases = [
      { q: "копию источника без изменений", right: "raw", wrong: ["core", "marts", "BI-дашборд"] },
      { q: "очищенные переиспользуемые заказы и клиентов", right: "core", wrong: ["raw", "staging", "marts"] },
      { q: "витрину под конкретный отчёт", right: "marts", wrong: ["raw", "core", "Excel"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "В каком слое хранить " + c.q + "?",
      solution: "Слой определяется ролью данных: raw — сырьё, core — очищенные сущности, marts — витрины под задачу.",
      answer: { type: "choice", options: opts }
    };
  }

  function tProdDbtTest() {
    var cases = [
      { q: "order_id должен быть уникальным", right: "unique", wrong: ["not_null", "accepted_values", "relationships"] },
      { q: "user_id не должен быть пустым", right: "not_null", wrong: ["unique", "relationships", "accepted_values"] },
      { q: "статус входит в paid, cancelled или refunded", right: "accepted_values", wrong: ["unique", "not_null", "relationships"] },
      { q: "user_id существует в dim_users", right: "relationships", wrong: ["unique", "accepted_values", "not_null"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "Какой тест dbt проверит: " + c.q + "?",
      solution: "Тест выбирают по смыслу ограничения: уникальность, обязательность, допустимые значения или ссылочная целостность.",
      answer: { type: "choice", options: opts }
    };
  }

  function tProdFreshness() {
    var cases = [
      { q: "витрина показывает вчерашние данные", right: "Проверить время последней успешной загрузки и SLA", wrong: ["Перезапустить все задачи подряд", "Очистить кеш браузера", "Изменить определение метрики"] },
      { q: "повторный запуск удвоил выручку", right: "Сделать задачу идемпотентной", wrong: ["Добавить ещё один ретрай", "Удалить историю", "Отключить тесты"] },
      { q: "счёт за хранилище вырос вдвое", right: "Проверить partition pruning и SELECT *", wrong: ["Увеличить число дашбордов", "Запускать чаще", "Отключить кластеризацию"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "Что делать: " + c.q + "?",
      solution: "Сначала диагностика причины, затем точечное исправление. Массовый перезапуск и отключение проверок только маскируют проблему.",
      answer: { type: "choice", options: opts }
    };
  }

  function tShapley() {
    var a = rndStep(20, 50, 10);
    var b = rndStep(20, 50, 10);
    var extra = rndStep(10, 30, 10);
    var ab = a + b + extra;
    var phi = (a + (ab - b)) / 2;
    return {
      prompt: "Коалиционная игра: v(A) = " + a + ", v(B) = " + b + ", v(AB) = " + ab +
        ". Какова доля игрока A по вектору Шепли?",
      solution: "Для двух игроков φA = 1/2 · v(A) + 1/2 · (v(AB) − v(B)) = " +
        a + "/2 + (" + ab + " − " + b + ")/2 = " + fmt(phi, 1) + ".",
      answer: num(phi, 0.1, 1)
    };
  }

  function tSignaling() {
    return {
      prompt: "Расширенная гарантия дорога ненадёжному продавцу и дешева надёжному. Что это за механизм?",
      solution: "Это сигнал: дорогое действие разделяет типы, потому что плохому типу оно обходится дороже.",
      answer: { type: "choice", options: [
        { text: "Сигнал", ok: true },
        { text: "Моральный риск", ok: false },
        { text: "Неблагоприятный отбор", ok: false },
        { text: "Доминирующая стратегия", ok: false }
      ] }
    };
  }

  function tCsComplexity() {
    var cases = [
      { q: "O(log n)", right: "Время растёт логарифмически: бинарный поиск, B-tree", wrong: ["Время не зависит от входа", "Время растёт квадратично", "Это всегда два прохода"] },
      { q: "двойной цикл по n элементам", right: "O(n²)", wrong: ["O(1)", "O(log n)", "O(n)"] },
      { q: "доступ к элементу массива по индексу", right: "O(1)", wrong: ["O(log n)", "O(n)", "O(n²)"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "Какая сложность у операции: " + c.q + "?",
      solution: "Сложность описывает рост числа операций; для этой операции правильный класс — «" + c.right + "».",
      answer: { type: "choice", options: opts }
    };
  }

  function tCsStructure() {
    var cases = [
      { q: "найти пользователя по уникальному email", right: "Хеш-таблица", wrong: ["Очередь", "Стек", "Несортированный массив"] },
      { q: "выбрать заказы за диапазон дат", right: "Упорядоченный индекс (B-tree)", wrong: ["Хеш-таблица", "Стек", "Очередь"] },
      { q: "всегда брать задачу с максимальным приоритетом", right: "Куча", wrong: ["Хеш-таблица", "Массив без порядка", "Стек"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "Что лучше подходит, если нужно " + c.q + "?",
      solution: "Структура выбирается под операцию: «" + c.right + "» делает её дешёвой.",
      answer: { type: "choice", options: opts }
    };
  }

  function tCsIndex() {
    var cases = [
      { q: "индекс по колонке", right: "Ускоряет чтение по фильтру и join, но замедляет запись", wrong: ["Всегда уменьшает таблицу", "Заменяет первичный ключ", "Отключает транзакции"] },
      { q: "индекс по каждой колонке", right: "Запись станет дороже, а планировщик может ошибиться", wrong: ["Все запросы ускорятся", "Таблица исчезнет", "Индексы перестанут обновляться"] },
      { q: "функция в WHERE по индексированной колонке", right: "Обычный индекс может не примениться", wrong: ["Индекс всегда сработает", "Запрос станет быстрее", "СУБД создаст индекс сама"] }
    ];
    var c = cases[rndInt(0, cases.length - 1)];
    var opts = [{ text: c.right, ok: true }].concat(c.wrong.map(function (t) { return { text: t, ok: false }; }));
    var k = rndInt(0, opts.length - 1);
    opts = opts.slice(k).concat(opts.slice(0, k));
    return {
      prompt: "Что верно про " + c.q + "?",
      solution: "Индекс — компромисс: чтение быстрее, запись и место дороже; функция может помешать его использовать.",
      answer: { type: "choice", options: opts }
    };
  }

  function tPyMemory() {
    var rows = rndInt(1, 5) * 1000000;
    var mb = rows * 8 / 1024 / 1024;
    return {
      prompt: "Сколько примерно мегабайт займёт одна колонка int64 на " + rows + " строк?",
      solution: "int64 — 8 байт на значение: " + rows + " × 8 / 1024² = " + fmt(mb, 1) + " МБ (без учёта индекса и служебных структур).",
      answer: num(mb, 0.5, 1)
    };
  }

  function tPyWindow() {
    return {
      prompt: "Что делает df.sort_values('date')['amount'].rolling(7).mean()?",
      solution: "rolling(7) берёт текущую и шесть предыдущих строк: получается скользящее среднее по семи наблюдениям. Данные должны быть отсортированы по времени.",
      answer: { type: "choice", options: [
        { text: "Скользящее среднее по текущей и шести предыдущим строкам", ok: true },
        { text: "Среднее по семи случайным строкам", ok: false },
        { text: "Удаляет каждую седьмую строку", ok: false },
        { text: "Считает среднее по всей таблице", ok: false }
      ] }
    };
  }

  function tToolSource() {
    return {
      prompt: "Где безопаснее скачать Python для учебного проекта?",
      solution: "Официальный сайт python.org даёт проверенный установщик и обновления; сторонние сборки могут содержать лишнее.",
      answer: { type: "choice", options: [
        { text: "С официального сайта python.org", ok: true },
        { text: "С файлообменника без проверки", ok: false },
        { text: "Из архива со взломом", ok: false },
        { text: "Из случайного комментария", ok: false }
      ] }
    };
  }

  function tToolTask() {
    return {
      prompt: "Нужно сравнить два города по средней выручке и сразу увидеть разницу. Что выбрать?",
      solution: "Для небольшого табличного среза и быстрой проверки достаточно Excel или BI; SQL нужен, когда данные уже в базе.",
      answer: { type: "choice", options: [
        { text: "BI-инструмент или сводную таблицу", ok: true },
        { text: "Git", ok: false },
        { text: "Только текстовый редактор", ok: false },
        { text: "Архиватор", ok: false }
      ] }
    };
  }

  function tToolGit() {
    return {
      prompt: "Что делает команда git commit?",
      solution: "Коммит фиксирует изменения в истории репозитория; push отправляет их в удалённый репозиторий.",
      answer: { type: "choice", options: [
        { text: "Сохраняет изменения в истории с сообщением", ok: true },
        { text: "Публикует сайт в интернете", ok: false },
        { text: "Удаляет все файлы проекта", ok: false },
        { text: "Устанавливает Python", ok: false }
      ] }
    };
  }

  window.TRAINER_FNS.tToolSource = tToolSource;
  window.TRAINER_FNS.tToolTask = tToolTask;
  window.TRAINER_FNS.tToolGit = tToolGit;
  window.TRAINER_FNS.tSmaCalc = tSmaCalc;
  window.TRAINER_FNS.tNaiveForecast = tNaiveForecast;
  window.TRAINER_FNS.tMapeForecast = tMapeForecast;
  window.TRAINER_FNS.tAteCalc = tAteCalc;
  window.TRAINER_FNS.tDiffInDiff = tDiffInDiff;
  window.TRAINER_FNS.tConfounder = tConfounder;
  window.TRAINER_FNS.tConsentChoice = tConsentChoice;
  window.TRAINER_FNS.tAnonChoice = tAnonChoice;
  window.TRAINER_FNS.tEthicsChoice = tEthicsChoice;
  window.TRAINER_FNS.tVizChoice = tVizChoice;
  window.TRAINER_FNS.tNoteType = tNoteType;
  window.TRAINER_FNS.tReportFirst = tReportFirst;
  window.TRAINER_FNS.tPortfolioProof = tPortfolioProof;
  window.TRAINER_FNS.tBiConversion = tBiConversion;
  window.TRAINER_FNS.tBiChartChoice = tBiChartChoice;
  window.TRAINER_FNS.tDaxChoice = tDaxChoice;
  window.TRAINER_FNS.tLodChoice = tLodChoice;
  window.TRAINER_FNS.tMissingChoice = tMissingChoice;
  window.TRAINER_FNS.tDataType = tDataType;
  window.TRAINER_FNS.tDupKey = tDupKey;
  window.TRAINER_FNS.tGrainJoin = tGrainJoin;
  window.TRAINER_FNS.tMissingMNAR = tMissingMNAR;
  window.TRAINER_FNS.tScaleChoice = tScaleChoice;
  window.TRAINER_FNS.tFreshness = tFreshness;
  window.TRAINER_FNS.tIdempotent = tIdempotent;
  window.TRAINER_FNS.tProdLayer = tProdLayer;
  window.TRAINER_FNS.tProdDbtTest = tProdDbtTest;
  window.TRAINER_FNS.tProdFreshness = tProdFreshness;
  window.TRAINER_FNS.tShapley = tShapley;
  window.TRAINER_FNS.tSignaling = tSignaling;
  window.TRAINER_FNS.tCsComplexity = tCsComplexity;
  window.TRAINER_FNS.tCsStructure = tCsStructure;
  window.TRAINER_FNS.tCsIndex = tCsIndex;
  window.TRAINER_FNS.tPyMemory = tPyMemory;
  window.TRAINER_FNS.tPyWindow = tPyWindow;
})();
