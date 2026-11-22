// Библиотека источников: книги, документация и практические курсы по разделам.
window.SOURCES = {
  analytics: [
    { kind: "книга", author: "Croll, Yoskovitz", title: "Lean Analytics", year: 2013, note: "Как выбрать одну метрику, которая действительно отражает продукт, и не утонуть в дашбордах." },
    { kind: "книга", author: "Kohavi, Tang, Xu", title: "Trustworthy Online Controlled Experiments", year: 2020, note: "Строгий разбор A/B: мощность, подглядывание, guardrail-метрики и типичные ошибки." },
    { kind: "книга", author: "Kaushik", title: "Web Analytics 2.0", year: 2009, note: "Классика веб-аналитики: сегменты, KPI, атрибуция и разница между данными и решениями." },
    { kind: "документация", author: "Google", title: "Analytics Help", url: "https://support.google.com/analytics/", note: "Официальный справочник по интерфейсу, событиям и метрикам GA4." },
    { kind: "статья", author: "Amplitude", title: "Product Analytics Playbook", url: "https://amplitude.com/blog", note: "Практические заметки о продуктовых метриках и воронках." }
  ],
  statistics: [
    { kind: "книга", author: "Брюс, Брюс", title: "Практическая статистика для специалистов Data Science", year: 2022, note: "Описательная статистика, проверка гипотез и регрессия на языке аналитика." },
    { kind: "книга", author: "OpenIntro", title: "OpenIntro Statistics", url: "https://www.openintro.org/book/os/", note: "Бесплатный учебник с задачами, данными и понятными визуализациями." },
    { kind: "документация", author: "NIST/SEMATECH", title: "e-Handbook of Statistical Methods", url: "https://www.itl.nist.gov/div898/handbook/", note: "Инженерный справочник по критериям, распределениям и диагностике моделей." },
    { kind: "книга", author: "Wasserman", title: "All of Statistics", year: 2004, note: "Быстрый и строгий обзор от вероятности до статистического вывода." },
    { kind: "книга", author: "McElreath", title: "Statistical Rethinking", year: 2020, note: "Байесовское моделирование с акцентом на причины, а не на механическое применение тестов." },
    { kind: "документация", author: "SciPy", title: "Statistical functions", url: "https://docs.scipy.org/doc/scipy/reference/stats.html", note: "Реализация распределений и критериев, если нужно считать в Python." }
  ],
  gametheory: [
    { kind: "книга", author: "Dixit, Nalebuff", title: "Стратегические игры", year: 1991, note: "Стратегии без тяжёлой математики: равновесия, доверие и переговоры." },
    { kind: "книга", author: "Davis", title: "Теория игр: искусство стратегического мышления", year: 1997, note: "Введение в игры, доминирование и смешанные стратегии." },
    { kind: "книга", author: "von Neumann, Morgenstern", title: "Theory of Games and Economic Behavior", year: 1944, note: "Основополагающая работа, из которой выросла современная теория игр." },
    { kind: "статья", author: "Stanford Encyclopedia", title: "Game Theory", url: "https://plato.stanford.edu/entries/game-theory/", note: "Философский и понятийный обзор: что считается игрой и равновесием." }
  ],
  probability: [
    { kind: "книга", author: "Феллер", title: "Введение в теорию вероятностей и её приложения", year: 1968, note: "Классика: от аксиом до предельных теорем, с вниманием к интуиции." },
    { kind: "книга", author: "Blitzstein, Hwang", title: "Introduction to Probability", year: 2019, note: "Современный учебник с примерами и задачами на условную вероятность." },
    { kind: "книга", author: "Bertsekas, Tsitsiklis", title: "Introduction to Probability", year: 2008, note: "Строгий курс с большим набором упражнений." },
    { kind: "курс", author: "Khan Academy", title: "Statistics and probability", url: "https://www.khanacademy.org/math/statistics-probability", note: "Быстрое повторение правил сложения, умножения и распределений." }
  ],
  sql: [
    { kind: "документация", author: "PostgreSQL", title: "Documentation", url: "https://www.postgresql.org/docs/", note: "Синтаксис, оконные функции, NULL, планы запросов и индексы." },
    { kind: "курс", author: "SQLBolt", title: "Интерактивный курс SQL", url: "https://sqlbolt.com/", note: "Короткие уроки с немедленной практикой в браузере." },
    { kind: "книга", author: "Molinaro", title: "SQL Cookbook", year: 2020, note: "Рецепты для реальных задач: ранжирование, дедупликация, отчёты." },
    { kind: "книга", author: "Winand", title: "Use The Index, Luke", url: "https://use-the-index-luke.com/", note: "Почему запрос медленный и как читать индексы без магии." },
    { kind: "курс", author: "Mode", title: "SQL Tutorial", url: "https://mode.com/sql-tutorial/", note: "Практика на учебных таблицах с разбором оконных функций." }
  ],
  excel: [
    { kind: "документация", author: "Microsoft", title: "Справка и обучение по Excel", url: "https://support.microsoft.com/excel", note: "Формулы, сводные таблицы, Power Query и горячие клавиши." },
    { kind: "книга", author: "Alexander, Walkenbach", title: "Excel 2019 Bible", year: 2018, note: "Полный справочник по формулам, диаграммам и автоматизации." },
    { kind: "документация", author: "Microsoft", title: "Power Query Documentation", url: "https://learn.microsoft.com/power-query/", note: "Загрузка, очистка и объединение данных без ручных правок." },
    { kind: "статья", author: "Chandoo", title: "Excel Tips", url: "https://chandoo.org/", note: "Приёмы для отчётов, диаграмм и ускорения рутины." }
  ],
  python: [
    { kind: "документация", author: "Python", title: "Официальная документация", url: "https://docs.python.org/3/", note: "Справочник по синтаксису, типам и стандартной библиотеке." },
    { kind: "документация", author: "pandas", title: "User Guide", url: "https://pandas.pydata.org/docs/user_guide/", note: "Таблицы, группировки, пропуски и временные ряды." },
    { kind: "книга", author: "McKinney", title: "Python for Data Analysis", year: 2022, note: "pandas от автора библиотеки: данные, очистка, агрегаты." },
    { kind: "книга", author: "Sweigart", title: "Automate the Boring Stuff", url: "https://automatetheboringstuff.com/", note: "Практическая автоматизация: файлы, таблицы, регулярные выражения." },
    { kind: "курс", author: "Real Python", title: "Tutorials", url: "https://realpython.com/", note: "Короткие разборы с рабочим кодом и объяснением ошибок." }
  ],
  regression: [
    { kind: "книга", author: "James, Witten, Hastie, Tibshirani", title: "An Introduction to Statistical Learning", url: "https://www.statlearning.com/", note: "Регрессия, классификация и оценка моделей с практическими примерами." },
    { kind: "документация", author: "statsmodels", title: "Documentation", url: "https://www.statsmodels.org/stable/index.html", note: "Линейные модели, диагностика и статистические тесты в Python." },
    { kind: "книга", author: "Harrell", title: "Regression Modeling Strategies", year: 2015, note: "Как выбирать признаки, проверять допущения и не переобучать модель." },
    { kind: "книга", author: "Stock, Watson", title: "Introduction to Econometrics", year: 2019, note: "Регрессия в прикладных задачах: эндогенность, инструменты, панели." }
  ],
  classification: [
    { kind: "документация", author: "scikit-learn", title: "Supervised learning", url: "https://scikit-learn.org/stable/supervised_learning.html", note: "Классификаторы, метрики и кросс-валидация с примерами кода." },
    { kind: "книга", author: "Bishop", title: "Pattern Recognition and Machine Learning", year: 2006, note: "Фундаментальный разбор логистической регрессии и байесовских методов." },
    { kind: "книга", author: "Géron", title: "Hands-On Machine Learning", year: 2022, note: "Практика на scikit-learn: от baseline до ансамблей." },
    { kind: "курс", author: "Google", title: "Machine Learning Crash Course", url: "https://developers.google.com/machine-learning/crash-course", note: "Быстрое введение в классификацию, пороги и метрики." }
  ],
  ml: [
    { kind: "документация", author: "scikit-learn", title: "User Guide", url: "https://scikit-learn.org/stable/user_guide.html", note: "Алгоритмы, подготовка признаков, пайплайны и оценка." },
    { kind: "книга", author: "Géron", title: "Hands-On Machine Learning", year: 2022, note: "Практический курс: деревья, ансамбли, нейросети и деплой." },
    { kind: "книга", author: "James и др.", title: "An Introduction to Statistical Learning", url: "https://www.statlearning.com/", note: "Баланс теории и практики без лишней математики." },
    { kind: "курс", author: "Kaggle Learn", title: "Courses", url: "https://www.kaggle.com/learn", note: "Короткие практические курсы с ноутбуками и данными." }
  ],
  useful: [
    { kind: "книга", author: "Knaflic", title: "Storytelling with Data", year: 2015, note: "Как выбрать график, убрать шум и сформулировать вывод." },
    { kind: "документация", author: "IBM", title: "SPSS Statistics Documentation", url: "https://www.ibm.com/docs/en/spss-statistics", note: "Где искать критерии и как читать таблицы вывода." },
    { kind: "книга", author: "Heath", title: "Made to Stick", year: 2007, note: "Почему одни идеи запоминаются, а другие забываются." },
    { kind: "книга", author: "Minto", title: "The Pyramid Principle", year: 1987, note: "Структура убедительного документа: вывод, аргументы, детали." },
    { kind: "книга", author: "Tufte", title: "The Visual Display of Quantitative Information", year: 2001, note: "Классика визуализации данных и борьбы с графическим мусором." }
  ],
  bi: [
    { kind: "документация", author: "Microsoft", title: "Power BI Documentation", url: "https://learn.microsoft.com/power-bi/", note: "Модель данных, DAX, публикация и безопасность." },
    { kind: "документация", author: "Tableau", title: "Help", url: "https://help.tableau.com/", note: "Подключения, вычисления, дашборды и рассказы." },
    { kind: "документация", author: "Yandex Cloud", title: "DataLens Documentation", url: "https://yandex.cloud/ru/docs/datalens/", note: "Чарты, датасеты и публикация в российском облаке." },
    { kind: "книга", author: "Kimball, Ross", title: "The Data Warehouse Toolkit", year: 2013, note: "Размерное моделирование: факты, измерения и гранулярность." },
    { kind: "книга", author: "Few", title: "Information Dashboard Design", year: 2013, note: "Как строить дашборд, который читают за пять секунд." }
  ]
};
