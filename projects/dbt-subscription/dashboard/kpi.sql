-- MRR на 30.09.2026
select sum(monthly_price) as mrr
from {{ ref('mart_subscription_health') }}
where is_active;

-- ARPU
select
    sum(monthly_price) / count(distinct user_id) as arpu
from {{ ref('mart_subscription_health') }}
where is_active;

-- Отток за 90 дней: отмены с 01.07 по 30.09 к активным на 01.07
select
    100.0 * count(*) filter (where end_date between date '2026-07-01' and date '2026-09-30')
    / nullif(count(*) filter (where start_date <= date '2026-07-01'
        and (end_date is null or end_date > date '2026-07-01')), 0) as churn_90d
from {{ ref('stg_subscriptions') }};

-- Failed payments и возвраты
select
    status,
    count(*) as payments,
    sum(amount) as amount
from {{ ref('stg_payments') }}
group by 1;

-- Когорта января–марта по каналам
select * from {{ ref('mart_channel_cohort') }};
