#!/usr/bin/env python3
"""Раннее и понятное падение на неподдерживаемой версии Python."""
import sys

SUPPORTED = {(3, 10), (3, 11), (3, 12), (3, 13)}
current = sys.version_info[:2]
if current not in SUPPORTED:
    sys.stderr.write(
        "dbt-duckdb в этом проекте проверен на Python 3.10–3.13.\n"
        f"Сейчас запущен Python {sys.version.split()[0]}.\n"
        "Для Python 3.14 готового wheel нет: установка уходит в сборку и может зависнуть.\n"
        "Создайте окружение на Python 3.12:\n"
        "  python3.12 -m venv .venv\n"
        "  source .venv/bin/activate\n"
        "  pip install -r requirements.txt\n"
    )
    raise SystemExit(1)
print(f"Python {sys.version.split()[0]} подходит для dbt-duckdb.")
