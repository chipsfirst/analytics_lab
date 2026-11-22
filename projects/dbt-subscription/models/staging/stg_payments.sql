with source as (
    select * from {{ ref('sub_payments') }}
),

parsed as (
    select
        trim(payment_id) as payment_id,
        nullif(trim(user_id), '') as user_id,
        trim(subscription_id) as subscription_id,
        coalesce(
            try_strptime(trim(payment_date), '%Y-%m-%d')::date,
            try_strptime(trim(payment_date), '%d.%m.%Y')::date
        ) as payment_date,
        cast(amount as integer) as amount,
        lower(trim(status)) as status,
        lower(trim(method)) as method,
        row_number() over (
            partition by trim(payment_id)
            order by trim(payment_date)
        ) as rn
    from source
)

select
    payment_id,
    user_id,
    subscription_id,
    payment_date,
    amount,
    status,
    method
from parsed
where rn = 1
  and user_id is not null
  and payment_date is not null
