select
    u.user_id,
    u.signup_date,
    u.city,
    u.channel,
    u.age_group,
    min(s.start_date) as first_subscription_date,
    count(distinct s.subscription_id) as subscription_count
from {{ ref('stg_users') }} u
left join {{ ref('stg_subscriptions') }} s using (user_id)
group by 1, 2, 3, 4, 5
