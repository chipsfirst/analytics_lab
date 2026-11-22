select
    date_trunc('month', payment_date)::date as month,
    count(*) as payments,
    sum(case when status = 'paid' then amount else 0 end) as paid_revenue,
    sum(case when status = 'refunded' then amount else 0 end) as refunds,
    sum(net_amount) as net_revenue
from {{ ref('fct_payments') }}
where is_valid_lifecycle
  and payment_date between date '2026-01-01' and date '2026-09-30'
group by 1
