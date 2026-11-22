#!/usr/bin/env python3
"""Выгружает mart_* из DuckDB в CSV для статического дашборда."""
from pathlib import Path
import csv
import sys

import duckdb

TABLES = [
    "mart_subscription_health",
    "mart_monthly_revenue",
    "mart_channel_cohort",
    "mart_payment_summary",
]


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: export-marts.py <subscription.duckdb> <output-dir>")
    db, out = Path(sys.argv[1]), Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    con = duckdb.connect(str(db), read_only=True)
    for table in TABLES:
        cur = con.execute(f"select * from main.{table}")
        columns = [d[0] for d in cur.description]
        rows = cur.fetchall()
        path = out / (table + ".csv")
        with path.open("w", encoding="utf-8", newline="") as f:
            w = csv.writer(f)
            w.writerow(columns)
            w.writerows(rows)
        print(f"{path}: {len(rows)} rows")


if __name__ == "__main__":
    main()
