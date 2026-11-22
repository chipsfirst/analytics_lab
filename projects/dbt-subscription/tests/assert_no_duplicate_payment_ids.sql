select
    payment_id,
    count(*) as rows
from {{ ref('stg_payments') }}
group by 1
having count(*) > 1
