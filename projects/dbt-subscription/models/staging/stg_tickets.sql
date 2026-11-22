select
    trim(ticket_id) as ticket_id,
    trim(user_id) as user_id,
    cast(created_at as date) as created_at,
    lower(trim(category)) as category,
    lower(trim(priority)) as priority,
    nullif(trim(resolved_at), '')::date as resolved_at,
    try_cast(nullif(trim(satisfaction), '') as integer) as satisfaction
from {{ ref('sub_tickets') }}
where ticket_id is not null
