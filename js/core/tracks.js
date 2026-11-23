// Маршруты обучения: упорядоченные шаги по главам разделов.
window.TRACKS = [
  {
    id: "analyst",
    title: "Аналитик с нуля",
    tag: "Метрики, SQL, проверка гипотез — минимальный набор для первой работы",
    steps: [
      ["analytics", 0],
      ["analytics", 1],
      ["analytics", 2],
      ["analytics", 3],
      ["analytics", 4],
      ["sql", 0],
      ["sql", 1],
      ["sql", 2],
      ["sql", 3],
      ["statistics", 0],
      ["statistics", 5],
      ["statistics", 7],
      ["statistics", 11],
      ["ethics", 0],
      ["ethics", 1],
      ["data", 4],
      ["useful", 7]
    ],
    final: [
      { title: "Большой проект: розница", href: "#/capstone", note: "6 задач с автопроверкой" },
      { title: "Открытый проект: подписка", href: "#/open-project", note: "без готовых ответов, с рубрикой" }
    ]
  },
  {
    id: "stats",
    title: "Статистика для экспериментов",
    tag: "От описательных статистик до мощности, ANOVA и множественных сравнений",
    steps: [
      ["statistics", 0],
      ["statistics", 2],
      ["statistics", 5],
      ["statistics", 6],
      ["statistics", 7],
      ["statistics", 8],
      ["statistics", 9],
      ["statistics", 10],
      ["statistics", 12],
      ["statistics", 13],
      ["analytics", 2]
    ]
  },
  {
    id: "python",
    title: "Python и данные",
    tag: "Синтаксис, pandas, первые модели — с песочницей в браузере",
    steps: [
      ["python", 0],
      ["python", 1],
      ["python", 2],
      ["python", 3],
      ["python", 4],
      ["python", 5],
      ["python", 6],
      ["python", 7],
      ["python", 8],
      ["cs", 0],
      ["cs", 1],
      ["cs", 2],
      ["ml", 0],
      ["ml", 1],
      ["ml", 2]
    ]
  },
  {
    id: "data",
    title: "Данные и BI",
    tag: "От сырого CSV до витрины, семантического слоя и дашборда",
    steps: [
      ["data", 0],
      ["data", 1],
      ["data", 2],
      ["data", 3],
      ["data", 4],
      ["data", 5],
      ["sql", 0],
      ["sql", 1],
      ["sql", 2],
      ["sql", 4],
      ["sql", 7],
      ["excel", 0],
      ["excel", 1],
      ["excel", 3],
      ["bi", 0],
      ["bi", 1],
      ["bi", 4],
      ["production", 0],
      ["production", 2]
    ],
    final: [
      { title: "Открытый проект: подписка", href: "#/open-project", note: "собрать витрину и записку" }
    ]
  },
  {
    id: "experiments",
    title: "Эксперименты и причинность",
    tag: "Гипотезы, A/B-тесты и корректная оценка эффекта",
    steps: [
      ["probability", 0],
      ["probability", 2],
      ["probability", 4],
      ["statistics", 5],
      ["statistics", 8],
      ["statistics", 9],
      ["statistics", 10],
      ["analytics", 2],
      ["causal", 0],
      ["causal", 1],
      ["causal", 2],
      ["causal", 3],
      ["causal", 4],
      ["causal", 5],
      ["causal", 6],
      ["causal", 7],
      ["ethics", 4]
    ]
  },
  {
    id: "models",
    title: "Модели и прогноз",
    tag: "Регрессия, классификация, ML и временные ряды",
    steps: [
      ["regression", 0],
      ["regression", 1],
      ["regression", 5],
      ["regression", 6],
      ["classification", 0],
      ["classification", 1],
      ["classification", 5],
      ["ml", 0],
      ["ml", 2],
      ["ml", 5],
      ["timeseries", 0],
      ["timeseries", 1],
      ["timeseries", 3],
      ["timeseries", 5],
      ["timeseries", 6],
      ["timeseries", 7]
    ]
  },
  {
    id: "production",
    title: "Аналитика в проде",
    tag: "Хранилище, dbt, BI, оркестрация, ревью и мониторинг",
    steps: [
      ["production", 0],
      ["production", 1],
      ["production", 2],
      ["cs", 3],
      ["cs", 4],
      ["cs", 5],
      ["production", 3],
      ["production", 4],
      ["production", 5],
      ["sql", 7],
      ["data", 5],
      ["bi", 12]
    ],
    final: [
      { title: "Сквозной проект: dbt + BI", href: "#/dbt-project", note: "репозиторий, тесты, дашборд и ревью" },
      { title: "Открытый проект: подписка", href: "#/open-project", note: "проверить качество и защитить решение" }
    ]
  }
];
