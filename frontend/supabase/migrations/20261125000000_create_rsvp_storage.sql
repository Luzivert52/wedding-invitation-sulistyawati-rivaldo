create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  request_id text not null unique,
  name text not null check (char_length(name) between 1 and 100),
  email text not null default '' check (octet_length(email) <= 150),
  whatsapp text not null default '' check (char_length(whatsapp) <= 20),
  guests integer not null check (guests between 0 and 20),
  status text not null check (status in ('attending', 'not_attending', 'maybe')),
  message text not null default '' check (char_length(message) <= 500),
  publish boolean not null default false,
  created_at timestamptz not null default now(),
  check (
    (status = 'not_attending' and guests = 0)
    or (status <> 'not_attending' and guests between 1 and 20)
  )
);

create index if not exists rsvps_public_wishes_created_at_idx
  on public.rsvps (created_at desc)
  where publish = true and message <> '';

alter table public.rsvps enable row level security;
revoke all on public.rsvps from anon, authenticated;
grant all on public.rsvps to service_role;

create table if not exists public.rsvp_rate_limits (
  ip_hash text primary key check (ip_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0)
);

alter table public.rsvp_rate_limits enable row level security;
revoke all on public.rsvp_rate_limits from anon, authenticated;
grant all on public.rsvp_rate_limits to service_role;

create or replace function public.consume_rsvp_rate_limit(
  p_ip_hash text,
  p_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_count integer;
begin
  if p_ip_hash !~ '^[a-f0-9]{64}$' or p_limit < 1 then
    raise exception 'Invalid rate-limit arguments';
  end if;

  delete from public.rsvp_rate_limits
  where window_started_at < v_now - interval '10 minutes';

  insert into public.rsvp_rate_limits (ip_hash, window_started_at, request_count)
  values (p_ip_hash, v_now, 1)
  on conflict (ip_hash) do update
  set
    request_count = case
      when public.rsvp_rate_limits.window_started_at <= v_now - interval '1 minute' then 1
      else public.rsvp_rate_limits.request_count + 1
    end,
    window_started_at = case
      when public.rsvp_rate_limits.window_started_at <= v_now - interval '1 minute' then v_now
      else public.rsvp_rate_limits.window_started_at
    end
  returning request_count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_rsvp_rate_limit(text, integer)
  from public, anon, authenticated;
grant execute on function public.consume_rsvp_rate_limit(text, integer)
  to service_role;
