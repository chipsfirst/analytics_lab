# dbt-проект: аналитика подписки

Учебный, но рабочий dbt-проект для сервиса «Пульс». Четыре источника, staging, marts, тесты и CI. Данные синтетические.

## Быстрый старт

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp profiles.yml.example profiles.yml
dbt seed --profiles-dir .
dbt build --profiles-dir .
```

`seeds/` уже содержит четыре CSV. В репозитории сайта они не хранятся: zip собирается из `data/sub-*.csv`.

## Что внутри

| Слой | Модели | Зачем |
|---|---|---|
| seeds | `sub_users`, `sub_subscriptions`, `sub_payments`, `sub_tickets` | сырые выгрузки |
| staging | `stg_users`, `stg_subscriptions`, `stg_payments`, `stg_tickets` | типы, даты, дедупликация |
| marts | `dim_users`, `fct_payments`, `mart_subscription_health`, `mart_monthly_revenue`, `mart_channel_cohort` | витрины для BI |

`stg_payments`:
- поддерживает оба формата дат: ISO и `ДД.ММ.ГГГГ`;
- оставляет одну строку на `payment_id` (15 дублей уходят);
- убирает платежи без `user_id` (120 строк);
- сохраняет статусы `paid`, `failed`, `refunded`.

`fct_payments` добавляет канал, тариф и флаг `is_valid_lifecycle`: платежи до регистрации или после окончания подписки остаются в модели, но не попадают в выручку.

## Проверки

```bash
dbt build --profiles-dir .
dbt test --profiles-dir .
```

Тесты: уникальность ключей, обязательность, допустимые статусы и тарифы, ссылочная целостность, отсутствие дублей платежей и неположительных сумм.

## Дашборд

`dashboard/kpi.sql` — запросы для MRR, ARPU, оттока, failed payments и когорт. `dashboard/README.md` — что вынести на первый экран и как проверять цифры.

## Что сдать

1. Ссылку на репозиторий или архив с `dbt build` без ошибок.
2. Скриншот lineage и список тестов.
3. Дашборд с MRR, оттоком, failed payments и разрезом по каналам.
4. Короткую записку: что меняем в следующем квартале и почему.
5. Саморевью по `REVIEW.md`.
