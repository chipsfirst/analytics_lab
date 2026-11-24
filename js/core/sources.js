// Источники по разделам: показываются в конце каждой главы.
window.SOURCES = {
  analytics: [
    { title: "Google Analytics: документация", url: "https://developers.google.com/analytics", note: "метрики, отчёты и измерения" },
    { title: "Amplitude: продуктовые метрики", url: "https://amplitude.com/blog", note: "продуктовая аналитика и эксперименты" },
    { title: "Код — журнал Яндекс Практикума", url: "https://thecode.media/", note: "практические статьи о данных и технологиях" }
  ],
  data: [
    { title: "dbt: тесты данных", url: "https://docs.getdbt.com/docs/build/data-tests", note: "качество и проверки" },
    { title: "Kimball Group", url: "https://www.kimballgroup.com/", note: "размерное моделирование" },
    { title: "Locally Optimistic", url: "https://locallyoptimistic.com/", note: "блог об аналитике и data-платформах" }
  ],
  sql: [
    { title: "PostgreSQL: документация", url: "https://www.postgresql.org/docs/current/", note: "SQL, планы и индексы" },
    { title: "Use The Index, Luke", url: "https://use-the-index-luke.com/", note: "производительность SQL" },
    { title: "Brent Ozar: блог", url: "https://www.brentozar.com/blog/", note: "производительность SQL и планы запросов" }
  ],
  excel: [
    { title: "Microsoft Excel: справка", url: "https://support.microsoft.com/excel", note: "формулы, сводные таблицы" },
    { title: "Exceljet", url: "https://exceljet.net/", note: "короткие примеры формул" },
    { title: "Chandoo", url: "https://chandoo.org/wp/", note: "практические приёмы Excel и визуализация" }
  ],
  python: [
    { title: "Python: учебник", url: "https://docs.python.org/3/tutorial/", note: "основы языка" },
    { title: "pandas: user guide", url: "https://pandas.pydata.org/docs/user_guide/", note: "таблицы, join, время" },
    { title: "Real Python", url: "https://realpython.com/", note: "практические статьи по Python" }
  ],
  cs: [
    { title: "MIT 6.006: алгоритмы", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", note: "структуры данных и сложность" },
    { title: "VisuAlgo", url: "https://visualgo.net/en", note: "визуализации алгоритмов" },
    { title: "Julia Evans", url: "https://jvns.ca/", note: "заметки о системах, базах и отладке" }
  ],
  statistics: [
    { title: "OpenIntro Statistics", url: "https://www.openintro.org/book/os/", note: "базовая статистика" },
    { title: "Seeing Theory", url: "https://seeing-theory.brown.edu/", note: "интерактивная вероятность и статистика" },
    { title: "Simply Statistics", url: "https://simplystatistics.org/", note: "блог о статистике и анализе данных" }
  ],
  probability: [
    { title: "Probability Course", url: "https://www.probabilitycourse.com/", note: "распределения и случайные величины" },
    { title: "OpenIntro Statistics", url: "https://www.openintro.org/book/os/", note: "вероятность и вывод" },
    { title: "John D. Cook", url: "https://www.johndcook.com/blog/", note: "короткие заметки о вероятности и статистике" }
  ],
  causal: [
    { title: "Causal Inference: The Mixtape", url: "https://mixtape.scunning.com/", note: "DiD, IV, RDD" },
    { title: "Journal of Economic Perspectives", url: "https://www.aeaweb.org/journals/jep", note: "прикладные статьи по причинности" },
    { title: "Causal Inference for the Brave and True", url: "https://matheusfacure.github.io/python-causality-handbook/landing-page.html", note: "практикум по причинному выводу на Python" }
  ],
  bi: [
    { title: "Yandex DataLens: документация", url: "https://datalens.yandex.ru/docs/", note: "дашборды и подключения" },
    { title: "Tableau: справка", url: "https://help.tableau.com/current/pro/desktop/en-us/default.htm", note: "визуализация и дашборды" },
    { title: "Код: пять визуализаций", url: "https://thecode.media/5-visual", note: "разбор видов графиков для данных" }
  ],
  production: [
    { title: "dbt: production", url: "https://docs.getdbt.com/docs/deploy/production", note: "запуск и деплой" },
    { title: "dbt: тесты", url: "https://docs.getdbt.com/docs/build/data-tests", note: "контракты и качество" },
    { title: "Data Engineering Weekly", url: "https://www.dataengineeringweekly.com/", note: "новости и практика data-инженерии" }
  ],
  regression: [
    { title: "An Introduction to Statistical Learning", url: "https://www.statlearning.com/", note: "регрессия и модели" },
    { title: "scikit-learn: линейные модели", url: "https://scikit-learn.org/stable/modules/linear_model.html", note: "практика на Python" },
    { title: "Regression and Other Stories", url: "https://avehtari.github.io/ROS-Examples/", note: "примеры и код к книге" }
  ],
  classification: [
    { title: "scikit-learn: обучение с учителем", url: "https://scikit-learn.org/stable/supervised_learning.html", note: "классификация" },
    { title: "Google ML: классификация", url: "https://developers.google.com/machine-learning/crash-course/classification", note: "порог, precision и recall" },
    { title: "Interpretable ML Book", url: "https://christophm.github.io/interpretable-ml-book/", note: "как объяснять модели" }
  ],
  ai: [
    { title: "OpenAI: Evals", url: "https://platform.openai.com/docs/guides/evals", note: "как строить и запускать eval-наборы" },
    { title: "RAGAS", url: "https://docs.ragas.io/", note: "метрики retrieval и groundedness для RAG" },
    { title: "Lilian Weng", url: "https://lilianweng.github.io/", note: "обзоры по LLM и AI" }
  ],
  marketing: [
    { title: "Google Ads: атрибуция", url: "https://support.google.com/google-ads/answer/1722022", note: "модели атрибуции и отчёты" },
    { title: "Robyn: MMM", url: "https://robynrmm.org/", note: "маркетинг-микс и калибровка" },
    { title: "Avinash Kaushik", url: "https://www.kaushik.net/avinash/", note: "маркетинговая аналитика и измерение" }
  ],
  simulation: [
    { title: "SimPy", url: "https://simpy.readthedocs.io/", note: "дискретно-событийное моделирование" },
    { title: "SciPy: linprog", url: "https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.linprog.html", note: "линейная оптимизация" },
    { title: "System Dynamics Society", url: "https://systemdynamics.org/", note: "системная динамика и моделирование" }
  ],
  ml: [
    { title: "scikit-learn: user guide", url: "https://scikit-learn.org/stable/user_guide.html", note: "модели и пайплайны" },
    { title: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course", note: "базовые идеи ML" },
    { title: "Chip Huyen", url: "https://huyenchip.com/blog/", note: "ML-системы и инженерия" }
  ],
  timeseries: [
    { title: "Forecasting: Principles and Practice", url: "https://otexts.com/fpp3/", note: "ETS, ARIMA, бэктест" },
    { title: "pandas: временные ряды", url: "https://pandas.pydata.org/docs/user_guide/timeseries.html", note: "resample и rolling" },
    { title: "Hyndsight", url: "https://robjhyndman.com/hyndsight/", note: "блог о прогнозировании" }
  ],
  gametheory: [
    { title: "Stanford Encyclopedia: Game Theory", url: "https://plato.stanford.edu/entries/game-theory/", note: "понятия и равновесия" },
    { title: "Game Theory (Coursera)", url: "https://www.coursera.org/learn/game-theory-1", note: "видеокурс" },
    { title: "Mind Your Decisions", url: "https://mindyourdecisions.com/blog/", note: "игровые задачи и стратегии" }
  ],
  ethics: [
    { title: "152-ФЗ: персональные данные", url: "https://www.consultant.ru/document/cons_doc_LAW_61801/", note: "российское регулирование" },
    { title: "ICO: защита данных", url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/", note: "принципы privacy" },
    { title: "Ada Lovelace Institute", url: "https://www.adalovelaceinstitute.org/blog/", note: "исследования об AI и обществе" }
  ],
  useful: [
    { title: "Storytelling with Data", url: "https://www.storytellingwithdata.com/books", note: "визуализация и подача" },
    { title: "Google: технические заметки", url: "https://abseil.io/resources/swe-book", note: "инженерная культура" },
    { title: "Lenny's Newsletter", url: "https://www.lennysnewsletter.com/", note: "продукт, аналитика и коммуникация" }
  ],
  toolkit: [
    { title: "Python: документация", url: "https://docs.python.org/3/", note: "язык и стандартная библиотека" },
    { title: "VS Code: документация", url: "https://code.visualstudio.com/docs", note: "редактор, терминал и расширения" },
    { title: "JupyterLab: документация", url: "https://jupyterlab.readthedocs.io/en/stable/", note: "блокноты и ячейки" },
    { title: "PostgreSQL: документация", url: "https://www.postgresql.org/docs/", note: "СУБД и SQL" },
    { title: "SQLite: документация", url: "https://www.sqlite.org/docs.html", note: "встраиваемая база в одном файле" },
    { title: "DBeaver: документация", url: "https://dbeaver.com/docs/dbeaver/", note: "SQL-клиент и подключения" },
    { title: "Power BI: документация", url: "https://learn.microsoft.com/en-us/power-bi/", note: "Desktop, сервис и DAX" },
    { title: "Tableau: справка", url: "https://help.tableau.com/current/pro/desktop/en-us/default.htm", note: "Desktop и визуализация" },
    { title: "Looker Studio: справка", url: "https://support.google.com/looker-studio/", note: "отчёты в браузере" },
    { title: "Metabase: документация", url: "https://www.metabase.com/docs/latest/", note: "self-service BI" },
    { title: "Excel: справка", url: "https://support.microsoft.com/en-us/excel", note: "формулы, сводные и Power Query" },
    { title: "Google Sheets: справка", url: "https://support.google.com/docs/", note: "таблицы и совместная работа" },
    { title: "R: руководства", url: "https://cran.r-project.org/manuals.html", note: "язык и статистические пакеты" },
    { title: "RStudio: документация", url: "https://docs.posit.co/ide/user/", note: "IDE для R" },
    { title: "SPSS: документация", url: "https://www.ibm.com/docs/en/spss-statistics", note: "статистические процедуры" },
    { title: "Git: документация", url: "https://git-scm.com/docs", note: "команды и концепции" },
    { title: "Docker: документация", url: "https://docs.docker.com/", note: "образы, контейнеры и Compose" },
    { title: "OpenSSH: руководство", url: "https://www.openssh.com/manual.html", note: "ssh, scp и ключи" },
    { title: "GNU nano: документация", url: "https://www.nano-editor.org/docs.php", note: "простой терминальный редактор" },
    { title: "Vim: документация", url: "https://www.vim.org/docs.php", note: "режимы и команды" },
    { title: "Emacs: руководство", url: "https://www.gnu.org/software/emacs/manual/", note: "редактор и среда" },
    { title: "Bash: руководство", url: "https://www.gnu.org/software/bash/manual/", note: "оболочка и команды" },
    { title: "Windows: документация", url: "https://learn.microsoft.com/en-us/windows/", note: "система, PowerShell и WSL" },
    { title: "macOS: поддержка", url: "https://support.apple.com/macos", note: "система и терминал" },
    { title: "Ubuntu: документация", url: "https://documentation.ubuntu.com/", note: "Linux и пакеты" },
    { title: "tmux: вики", url: "https://github.com/tmux/tmux/wiki", note: "долгие SSH-сессии" }
  ]
};
