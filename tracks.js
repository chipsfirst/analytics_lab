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
      ["sql", 0],
      ["sql", 1],
      ["sql", 2],
      ["sql", 3],
      ["statistics", 0],
      ["statistics", 5],
      ["statistics", 7],
      ["statistics", 11]
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
      ["analytics", 1]
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
      ["ml", 0],
      ["ml", 1],
      ["ml", 2]
    ]
  }
];
