// Контент разнесён по файлам js/topics/: один раздел — один файл.
window.TOPICS = {};

// Единый порядок разделов: используется в учебнике, тестах и самопроверке.
// Порядок <script> в index.html должен совпадать с этим списком.
window.TOPIC_ORDER = [
  "analytics",
  "data",
  "sql",
  "excel",
  "python",
  "statistics",
  "probability",
  "causal",
  "bi",
  "production",
  "regression",
  "classification",
  "ml",
  "cs",
  "ai",
  "marketing",
  "simulation",
  "timeseries",
  "gametheory",
  "ethics",
  "useful",
  "toolkit"
];

// Два уровня: с чего начать и что изучать после практики.
window.TOPIC_GROUPS = [
  { id: "base", title: "Базовые", lead: "Старт: понятия, данные, SQL, Python, статистика и BI." },
  { id: "advanced", title: "Продвинутые", lead: "После базы: модели, причинность, продакшен и сложные системы." }
];
window.TOPIC_LEVELS = {
  analytics: "base", data: "base", sql: "base", excel: "base", python: "base",
  statistics: "base", probability: "base", bi: "base", marketing: "base",
  ethics: "base", useful: "base", toolkit: "base",
  causal: "advanced", production: "advanced", regression: "advanced",
  classification: "advanced", ml: "advanced", cs: "advanced", ai: "advanced",
  simulation: "advanced", timeseries: "advanced", gametheory: "advanced"
};
