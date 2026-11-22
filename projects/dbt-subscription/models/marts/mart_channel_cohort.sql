with cohort as (
    select user_id, channel
    from {{ ref('stg_users') }}
    where signup_date between date '2026-01-01' and date '2026-03-31'
),

active as (
    select distinct user_id
    from {{ ref('mart_subscription_health') }}
    where is_active
)

select
    c.channel,
    count(*) as users,
    count(a.user_id) as active_users,
    round(100.0 * count(a.user_id) / count(*), 1) as active_share
from cohort c
left join active a using (user_id)
group by 1
