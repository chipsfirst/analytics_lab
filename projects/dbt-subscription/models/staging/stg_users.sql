select
    trim(user_id) as user_id,
    cast(signup_date as date) as signup_date,
    trim(city) as city,
    lower(trim(channel)) as channel,
    trim(age_group) as age_group
from {{ ref('sub_users') }}
where user_id is not null
