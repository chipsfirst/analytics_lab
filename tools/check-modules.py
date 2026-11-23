#!/usr/bin/env python3
"""Проверяет, что все локальные JS из index.html есть в sw.js и офлайн-сборке."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def read(path):
    return (ROOT / path).read_text(encoding="utf-8")

index = read("index.html")
scripts = re.findall(r'<script\s+src="([^"]+\.js)"', index)
local = sorted(set(s for s in scripts if not s.startswith(("http://", "https://"))))
sw = set(re.findall(r'"([^"]+\.js)"', read("sw.js")))
offline = set(re.findall(r'"([^"]+\.js)"', read("tools/make-offline.py")))

errors = []
for name in local:
    if not (ROOT / name).exists():
        errors.append(f"нет файла: {name}")
    if name not in sw:
        errors.append(f"нет в sw.js: {name}")
    if name not in offline:
        errors.append(f"нет в офлайн-сборке: {name}")

if errors:
    raise SystemExit("\n".join(errors))
print(f"Модули согласованы: {len(local)} локальных JS")
