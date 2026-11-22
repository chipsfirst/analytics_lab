with as_of as (
    select date '{{ var("as_of_date", "2026-09-30") }}' as as_of_date
)

select
    s.subscription_id,
    s.user_id,
    u.channel,
    s.plan,
    s.status,
    s.monthly_price,
    s.start_date,
    s.end_date,
    case
        when s.status = 'active'
         and s.start_date <= a.as_of_date
         and (s.end_date is null or s.end_date > a.as_of_date)
        then true
        else false
    end as is_active
from {{ ref('stg_subscriptions') }} s
join {{ ref('stg_users') }} u using (user_id)
cross join as_of a
