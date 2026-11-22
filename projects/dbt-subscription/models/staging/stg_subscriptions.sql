select
    trim(subscription_id) as subscription_id,
    trim(user_id) as user_id,
    lower(trim(plan)) as plan,
    cast(start_date as date) as start_date,
    nullif(cast(end_date as varchar), '')::date as end_date,
    lower(trim(status)) as status,
    cast(monthly_price as integer) as monthly_price,
    lower(trim(auto_renew)) = 'yes' as auto_renew
from {{ source('raw', 'sub_subscriptions') }}
where subscription_id is not null
