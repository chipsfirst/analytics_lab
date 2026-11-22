select *
from {{ ref('mart_subscription_health') }}
where is_active
  and monthly_price <= 0
