select
    p.payment_id,
    p.user_id,
    p.subscription_id,
    p.payment_date,
    p.amount,
    p.status,
    p.method,
    u.channel,
    s.plan,
    case
        when p.status = 'paid' then p.amount
        when p.status = 'refunded' then -p.amount
        else 0
    end as net_amount,
    case
        when p.payment_date < u.signup_date then false
        when s.end_date is not null and p.payment_date > s.end_date then false
        else true
    end as is_valid_lifecycle
from {{ ref('stg_payments') }} p
left join {{ ref('stg_users') }} u using (user_id)
left join {{ ref('stg_subscriptions') }} s using (subscription_id)
