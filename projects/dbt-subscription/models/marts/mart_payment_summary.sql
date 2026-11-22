select
    status,
    channel,
    status || '|' || channel as status_channel,
    count(*) as payments,
    sum(amount) as amount
from {{ ref('fct_payments') }}
group by 1, 2
