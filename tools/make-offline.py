#!/usr/bin/env python3
"""Собирает analytics-lab-offline.zip: сайт целиком плюс локальный запуск."""

import os
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "analytics-lab-offline.zip")
BASE = "analytics-lab-offline"

FILES = [
    "index.html",
    "style.css",
    "js/app.js",
    "js/data.js",
    "js/topics/analytics.js",
    "js/topics/statistics.js",
    "js/topics/gametheory.js",
    "js/topics/probability.js",
    "js/topics/sql.js",
    "js/topics/excel.js",
    "js/topics/python.js",
    "js/topics/cs.js",
    "js/topics/regression.js",
    "js/topics/classification.js",
    "js/topics/ml.js",
    "js/topics/timeseries.js",
    "js/topics/causal.js",
    "js/topics/useful.js",
    "js/topics/ethics.js",
    "js/topics/bi.js",
    "js/topics/production.js",
    "js/core/tracks.js",
    "js/core/cheatsheet.js",
    "js/core/glossary.js",
    "js/features/trainers.js",
    "js/features/games.js",
    "js/core/progress.js",
    "js/core/search.js",
    "js/features/demos.js",
    "js/features/dbt-project.js",
    "js/sandboxes/sql.js",
    "js/sandboxes/python.js",
    "js/sandboxes/pyworker.js",
    "sw.js",
    "VERSION",
    "manifest.webmanifest",
    "icon.svg",
    "icon-180.png",
    "icon-192.png",
    "icon-512.png",
    "vendor/sql-wasm.js",
    "vendor/sql-wasm.wasm",
    "data/case-orders.csv",
    "data/bi-orders.csv",
    "data/dirty-customers.csv",
    "data/retail-users.csv",
    "data/retail-orders.csv",
    "data/retail-events.csv",
    "data/retail-marketing.csv",
    "dbt-subscription.zip",
    "data/sub-users.csv",
    "data/sub-subscriptions.csv",
    "data/sub-payments.csv",
    "data/sub-tickets.csv",
    "data/mart_subscription_health.csv",
    "data/mart_monthly_revenue.csv",
    "data/mart_channel_cohort.csv",
    "data/mart_payment_summary.csv",
    "data/dashboard-sales-template.svg",
    "data/dashboard-product-template.svg",
    "data/dashboard-sales-template.md",
    "data/dashboard-product-template.md",
]

README = """Лаборатория аналитики — офлайн-версия
===============================

Это статический сайт: HTML, CSS и JavaScript без сборки и без бэкенда.

Как запустить
-------------
1. Распакуйте архив.
2. macOS/Linux: выполните `sh start.command` (или откройте start.command двойным щелчком).
   Windows: запустите start.bat.
3. Браузер откроет http://localhost:8000.

Можно открыть и просто index.html двойным щелчком: главы, тесты,
тренажёры, игры, демо, поиск и прогресс работают. Но песочнице SQL нужен
http-сервер: под file:// браузер не отдаёт wasm-файл.

Что работает без интернета
--------------------------
- 147 глав, 295 вопросов, 94 тренажёра, игры, демонстрации, маршруты, шпаргалка;
- прогресс в localStorage, экспорт и импорт прогресса;
- песочница SQL (через локальный сервер из архива).

Что требует интернета
---------------------
- Песочница Python: при первом запуске скачивает ядро Pyodide (~10 МБ) с CDN.
- Первая загрузка шрифтов/иконок не нужна: внешних ресурсов больше нет.

Проверка
--------
Исходный репозиторий: https://github.com/chipsfirst/analytics_lab
Сборка архива: `python3 tools/make-offline.py`.
"""

START_SH = """#!/bin/sh
cd "$(dirname "$0")" || exit 1
PORT=8000
python3 -m http.server "$PORT" >/dev/null 2>&1 &
sleep 1
open "http://localhost:$PORT" 2>/dev/null || xdg-open "http://localhost:$PORT" 2>/dev/null
wait
"""

START_BAT = """@echo off
cd /d "%~dp0"
start "" http://localhost:8000
py -m http.server 8000
"""


def add(zf, name, data):
    info = zipfile.ZipInfo(BASE + "/" + name)
    info.external_attr = 0o755 << 16 if name.endswith(".command") else 0o644 << 16
    info.compress_type = zipfile.ZIP_DEFLATED
    zf.writestr(info, data)


def main():
    missing = [f for f in FILES if not os.path.exists(os.path.join(ROOT, f))]
    if missing:
        raise SystemExit("Нет файлов: " + ", ".join(missing))
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
        for rel in FILES:
            with open(os.path.join(ROOT, rel), "rb") as fh:
                data = fh.read()
            if rel == "index.html":
                data = data.replace(b"</head>", b"<script>window.OFFLINE_BUILD = true;</script>\n</head>", 1)
            zf.writestr(BASE + "/" + rel, data)
        add(zf, "README-OFFLINE.txt", README)
        add(zf, "start.command", START_SH)
        add(zf, "start.bat", START_BAT)
    print("Готово:", OUT, os.path.getsize(OUT), "байт")


if __name__ == "__main__":
    main()
