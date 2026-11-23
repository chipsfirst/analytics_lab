"""Pandas-кейс: месячный отчёт по подписке.

Запуск: python pandas-case-starter.py
Данные лежат рядом: sub-users.csv, sub-subscriptions.csv,
sub-payments.csv, sub-tickets.csv.
"""

from pathlib import Path

import pandas as pd

DATA = Path(__file__).resolve().parent


def load() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Прочитайте четыре CSV и приведите даты к datetime."""
    users = pd.read_csv(DATA / "sub-users.csv")
    subscriptions = pd.read_csv(DATA / "sub-subscriptions.csv")
    payments = pd.read_csv(DATA / "sub-payments.csv")
    tickets = pd.read_csv(DATA / "sub-tickets.csv")
    # TODO: разберитесь с форматами дат в payments и created_at/resolved_at.
    return users, subscriptions, payments, tickets


def audit(users, subscriptions, payments, tickets) -> pd.DataFrame:
    """Верните таблицу проверок: проверка, число строк, что делаем."""
    checks = [
        ("duplicate payment_id", payments["payment_id"].duplicated().sum()),
        ("payments without user_id", payments["user_id"].isna().sum()),
        ("payments before signup", 0),
        ("payments after subscription end", 0),
        ("tickets without satisfaction", tickets["satisfaction"].isna().sum()),
    ]
    # TODO: замените нули настоящими расчётами после соединения таблиц.
    return pd.DataFrame(checks, columns=["check", "rows", "action"])


def monthly_revenue(payments: pd.DataFrame) -> pd.DataFrame:
    """Верните месяц, paid, refunded и net revenue."""
    # TODO: приведите payment_date к месяцу, разделите paid/refunded.
    return pd.DataFrame(columns=["month", "paid", "refunded", "net"])


def cohort_retention(users, subscriptions) -> pd.DataFrame:
    """Верните канал, размер когорты и долю активных на 30.09.2026."""
    # TODO: используйте когорту регистрации январь–март 2026.
    return pd.DataFrame(columns=["channel", "cohort", "active_share"])


def main() -> None:
    users, subscriptions, payments, tickets = load()
    print("users", users.shape)
    print("subscriptions", subscriptions.shape)
    print("payments", payments.shape)
    print("tickets", tickets.shape)
    print("\nАудит:")
    print(audit(users, subscriptions, payments, tickets).to_string(index=False))
    print("\nВыручка:")
    print(monthly_revenue(payments).to_string(index=False))
    print("\nКогорты:")
    print(cohort_retention(users, subscriptions).to_string(index=False))
    # TODO: добавьте расчёт MRR, ARPU, failed share, refunds и нагрузку поддержки.
    # TODO: напишите пять пунктов записки для CMO в отдельном markdown-файле.


if __name__ == "__main__":
    main()
