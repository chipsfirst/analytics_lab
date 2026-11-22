#!/usr/bin/env python3
"""Собирает dbt-проект с seeds из data/sub-*.csv в dbt-subscription.zip."""
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parent.parent
PROJECT = ROOT / "projects" / "dbt-subscription"
OUT = ROOT / "dbt-subscription.zip"
SEEDS = {
    "sub-users.csv": "sub_users.csv",
    "sub-subscriptions.csv": "sub_subscriptions.csv",
    "sub-payments.csv": "sub_payments.csv",
    "sub-tickets.csv": "sub_tickets.csv",
}


def main():
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        for path in sorted(PROJECT.rglob("*")):
            if path.is_file():
                z.write(path, "dbt-subscription/" + str(path.relative_to(PROJECT)))
        for src, dst in SEEDS.items():
            z.write(ROOT / "data" / src, "dbt-subscription/seeds/" + dst)
    print(f"Готово: {OUT} {OUT.stat().st_size} байт")


if __name__ == "__main__":
    main()
