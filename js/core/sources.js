// Источники по разделам: показываются в конце каждой главы.
window.SOURCES = {
  analytics: [
    { title: "Google Analytics: документация", url: "https://developers.google.com/analytics", note: "метрики, отчёты и измерения" },
    { title: "Amplitude: продуктовые метрики", url: "https://amplitude.com/blog", note: "продуктовая аналитика и эксперименты" }
  ],
  data: [
    { title: "dbt: тесты данных", url: "https://docs.getdbt.com/docs/build/data-tests", note: "качество и проверки" },
    { title: "Kimball Group", url: "https://www.kimballgroup.com/", note: "размерное моделирование" }
  ],
  sql: [
    { title: "PostgreSQL: документация", url: "https://www.postgresql.org/docs/current/", note: "SQL, планы и индексы" },
    { title: "Use The Index, Luke", url: "https://use-the-index-luke.com/", note: "производительность SQL" }
  ],
  excel: [
    { title: "Microsoft Excel: справка", url: "https://support.microsoft.com/excel", note: "формулы, сводные таблицы" },
    { title: "Exceljet", url: "https://exceljet.net/", note: "короткие примеры формул" }
  ],
  python: [
    { title: "Python: учебник", url: "https://docs.python.org/3/tutorial/", note: "основы языка" },
    { title: "pandas: user guide", url: "https://pandas.pydata.org/docs/user_guide/", note: "таблицы, join, время" }
  ],
  cs: [
    { title: "MIT 6.006: алгоритмы", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", note: "структуры данных и сложность" },
    { title: "VisuAlgo", url: "https://visualgo.net/en", note: "визуализации алгоритмов" }
  ],
  statistics: [
    { title: "OpenIntro Statistics", url: "https://www.openintro.org/book/os/", note: "базовая статистика" },
    { title: "Seeing Theory", url: "https://seeing-theory.brown.edu/", note: "интерактивная вероятность и статистика" }
  ],
  probability: [
    { title: "Probability Course", url: "https://www.probabilitycourse.com/", note: "распределения и случайные величины" },
    { title: "OpenIntro Statistics", url: "https://www.openintro.org/book/os/", note: "вероятность и вывод" }
  ],
  causal: [
    { title: "Causal Inference: The Mixtape", url: "https://mixtape.scunning.com/", note: "DiD, IV, RDD" },
    { title: "Journal of Economic Perspectives", url: "https://www.aeaweb.org/journals/jep", note: "прикладные статьи по причинности" }
  ],
  bi: [
    { title: "Yandex DataLens: документация", url: "https://datalens.yandex.ru/docs/", note: "дашборды и подключения" },
    { title: "Tableau: справка", url: "https://help.tableau.com/current/pro/desktop/en-us/default.htm", note: "визуализация и дашборды" }
  ],
  production: [
    { title: "dbt: production", url: "https://docs.getdbt.com/docs/deploy/production", note: "запуск и деплой" },
    { title: "dbt: тесты", url: "https://docs.getdbt.com/docs/build/data-tests", note: "контракты и качество" }
  ],
  regression: [
    { title: "An Introduction to Statistical Learning", url: "https://www.statlearning.com/", note: "регрессия и модели" },
    { title: "scikit-learn: линейные модели", url: "https://scikit-learn.org/stable/modules/linear_model.html", note: "практика на Python" }
  ],
  classification: [
    { title: "scikit-learn: обучение с учителем", url: "https://scikit-learn.org/stable/supervised_learning.html", note: "классификация" },
    { title: "Google ML: классификация", url: "https://developers.google.com/machine-learning/crash-course/classification", note: "порог, precision и recall" }
  ],
  ml: [
    { title: "scikit-learn: user guide", url: "https://scikit-learn.org/stable/user_guide.html", note: "модели и пайплайны" },
    { title: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course", note: "базовые идеи ML" }
  ],
  timeseries: [
    { title: "Forecasting: Principles and Practice", url: "https://otexts.com/fpp3/", note: "ETS, ARIMA, бэктест" },
    { title: "pandas: временные ряды", url: "https://pandas.pydata.org/docs/user_guide/timeseries.html", note: "resample и rolling" }
  ],
  gametheory: [
    { title: "Stanford Encyclopedia: Game Theory", url: "https://plato.stanford.edu/entries/game-theory/", note: "понятия и равновесия" },
    { title: "Game Theory (Coursera)", url: "https://www.coursera.org/learn/game-theory-1", note: "видеокурс" }
  ],
  ethics: [
    { title: "152-ФЗ: персональные данные", url: "https://www.consultant.ru/document/cons_doc_LAW_61801/", note: "российское регулирование" },
    { title: "ICO: защита данных", url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/", note: "принципы privacy" }
  ],
  useful: [
    { title: "Storytelling with Data", url: "https://www.storytellingwithdata.com/books", note: "визуализация и подача" },
    { title: "Google: технические заметки", url: "https://abseil.io/resources/swe-book", note: "инженерная культура" }
  ]
};
