# Архитектура

Статический сайт без сборки. `index.html` подключает скрипты в порядке зависимостей.

## Контракты

- `window.LAB` — общий контекст: `app`, `esc`, `icon`, `render`, `setKeys`, `chapterIcon`, `topicMeta`. Заполняется в `app.js` при старте.
- `window.TOPICS`, `window.TRAINERS`, `window.DEMOS`, `window.GAMES` — реестры контента.
- `window.PROGRESS`, `window.ACHIEVEMENTS` — состояние в `localStorage`.
- Страницы-модули экспортируют `page()` и при необходимости `bind()`:
  `SESSION`, `PROJECTS`, `PANDAS_CASE`, `CALC`, `CARDS`, `PROMPT_LAB`, `DATALAB`,
  `REVIEW_PAGE`, `CASES_PAGE`, `PATH_PAGE`, `EXAMS`, `GLOSSARY_PAGE`, `QUIZ_PAGE`,
  `TRAINER_PAGE`, `HOME_PAGE`, `THEORY_PAGE`, `CHAPTERS`.
- `CHAPTERS.bind()` вызывается после вставки HTML страницы.

## Порядок загрузки

1. `js/data.js` и `js/topics/*.js` — контент.
2. `js/features/trainers-*` → `trainers.js`; `games-*` → `games.js`; `demos-*` → `demos.js`.
3. `js/core/*` — прогресс, источники, достижения, словарь, поиск, треки.
4. `js/features/*` — страницы; `js/sandboxes/*`.
5. `js/app.js` — роутер, главная оболочка и старт.

## Новый модуль

Добавить файл в:
- `index.html` — в правильном месте порядка;
- `sw.js` — в `ASSETS`;
- `tools/make-offline.py` — в `FILES`;
- `selftest.js` — если модуль нужен для проверок.

Проверки: `python3 tools/check-version.py`, `python3 tools/check-modules.py`, `node selftest.js`, `npm run smoke`.

Полный чек-лист релиза и нового модуля — в `CHECKLIST.md`.

## Ограничения

Сайт работает офлайн; поэтому нет ES-модулей и бандлера. Глобальные контракты и порядок скриптов — осознанный компромисс. Не добавляйте модуль только в `index.html`: `check-modules.py` поймает рассинхронизацию.
