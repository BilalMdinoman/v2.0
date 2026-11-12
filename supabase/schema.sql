-- V.2.0 — Supabase schema (Phase 2)
-- Paper trading only. This is the authoritative persistent store.
--
-- The backend daemon writes using the service-role key (which bypasses RLS).
-- The dashboard reads through the anon/authenticated key + RLS policies below.
-- Run this in the Supabase SQL editor, or as the first migration.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

-- Single authoritative row (id = 1) describing the virtual account.
create table if not exists account_state (
  id                    integer primary key check (id = 1),
  starting_balance_usd  numeric(18, 2) not null default 100.00,
  available_cash_usd    numeric(18, 2) not null default 100.00,
  equity_usd            numeric(18, 2) not null default 100.00,
  realized_pnl_usd      numeric(18, 2) not null default 0,
  unrealized_pnl_usd    numeric(18, 2) not null default 0,
  daily_trades          integer not null default 0,
  daily_trade_cap       integer not null default 10,
  daily_realized_pnl_usd numeric(18, 2) not null default 0,
  paused                boolean not null default false,
  last_reconciled_at    timestamptz,
  updated_at            timestamptz not null default now()
);

-- Open paper positions. One row per open position.
create table if not exists active_positions (
  id                uuid primary key default gen_random_uuid(),
  mint_address      text not null unique,
  token_symbol      text not null,
  entry_price       numeric(36, 18) not null,
  fill_price        numeric(36, 18) not null,
  current_price     numeric(36, 18),
  token_quantity    numeric(36, 18) not null,
  amount_usd        numeric(18, 2) not null,
  stop_loss_price   numeric(36, 18) not null,
  take_profit_price numeric(36, 18) not null,
  status            text not null default 'OPEN' check (status in ('OPEN', 'CLOSING')),
  decision_id       uuid,
  workflow_id       text,
  opened_at         timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Immutable ledger of closed trades.
create table if not exists trade_history (
  id                uuid primary key default gen_random_uuid(),
  mint_address      text not null,
  token_symbol      text not null,
  entry_price       numeric(36, 18) not null,
  exit_price        numeric(36, 18) not null,
  net_pnl_usd       numeric(18, 2) not null,
  pnl_pct           numeric(10, 2) not null,
  result            text not null check (result in ('WIN', 'LOSS')),
  rationale         text,
  strategy_version  integer,
  decision_id       uuid,
  workflow_id       text,
  closed_at         timestamptz not null default now()
);

-- Migration: add the workflow link to an existing trade_history table.
alter table trade_history add column if not exists workflow_id text;

-- Inter-agent communication stream (Supabase Realtime enabled below).
create table if not exists agent_blackboard (
  id            uuid primary key default gen_random_uuid(),
  workflow_id   text,
  agent_key     text not null,
  message_type  text not null,
  token_symbol  text,
  text          text,
  payload       jsonb,
  status        text not null default 'OPEN',
  created_at    timestamptz not null default now()
);

-- NOVA's versioned long-term memory / strategy guidelines.
create table if not exists system_guidelines (
  id              uuid primary key default gen_random_uuid(),
  rule_key        text not null,
  rule_value      jsonb not null,
  state           text not null default 'PROPOSED'
                  check (state in ('PROPOSED','UNDER_REVIEW','APPROVED_FOR_TEST','TESTING','VALIDATED','ACTIVE','REJECTED','ROLLED_BACK')),
  source_trade_id uuid,
  evidence        jsonb,
  version         integer not null default 1,
  activated_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ARGUS health metrics.
create table if not exists agent_telemetry (
  id              uuid primary key default gen_random_uuid(),
  agent_key       text not null,
  status          text not null default 'OFFLINE' check (status in ('ONLINE','DEGRADED','OFFLINE')),
  latency_ms      integer,
  error_count     integer not null default 0,
  model_id        text,
  last_active_at  timestamptz,
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Supporting tables (ledger integrity, strategy loop, audit)
-- ---------------------------------------------------------------------------

-- Durable orders (idempotency key on order_id).
create table if not exists paper_orders (
  id            uuid primary key default gen_random_uuid(),
  order_id      text not null unique,
  workflow_id   text,
  mint_address  text not null,
  side          text not null check (side in ('BUY','SELL')),
  size_usd      numeric(18, 2) not null,
  price         numeric(36, 18) not null,
  status        text not null default 'PENDING'
                check (status in ('PENDING','ACCEPTED','REJECTED','FILLED','CANCELED')),
  reason        text,
  created_at    timestamptz not null default now()
);

-- Fills (idempotency key on fill_id).
create table if not exists paper_fills (
  id             uuid primary key default gen_random_uuid(),
  fill_id        text not null unique,
  order_id       uuid references paper_orders(id),
  position_id    uuid,
  side           text not null check (side in ('BUY','SELL')),
  token_quantity numeric(36, 18) not null,
  fill_price     numeric(36, 18) not null,
  fee_usd        numeric(18, 2) not null default 0,
  created_at     timestamptz not null default now()
);

-- Immutable audit trail.
create table if not exists audit_events (
  id          uuid primary key default gen_random_uuid(),
  event_id    text not null unique,
  actor       text not null,
  action      text not null,
  entity_type text,
  entity_id   text,
  details     jsonb,
  created_at  timestamptz not null default now()
);

-- Protected, versioned configuration (risk limits, etc.).
create table if not exists config_versions (
  id           uuid primary key default gen_random_uuid(),
  version      integer not null,
  config       jsonb not null,
  state        text not null default 'PROPOSED' check (state in ('PROPOSED','ACTIVE','ROLLED_BACK')),
  activated_at timestamptz,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_account_state_updated on account_state;
create trigger trg_account_state_updated
  before update on account_state
  for each row execute procedure set_updated_at();

drop trigger if exists trg_active_positions_updated on active_positions;
create trigger trg_active_positions_updated
  before update on active_positions
  for each row execute procedure set_updated_at();

drop trigger if exists trg_system_guidelines_updated on system_guidelines;
create trigger trg_system_guidelines_updated
  before update on system_guidelines
  for each row execute procedure set_updated_at();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists idx_trade_history_closed_at on trade_history (closed_at desc);
create index if not exists idx_trade_history_mint on trade_history (mint_address);
create index if not exists idx_blackboard_workflow on agent_blackboard (workflow_id);
create index if not exists idx_blackboard_created_at on agent_blackboard (created_at desc);
create index if not exists idx_blackboard_agent on agent_blackboard (agent_key);
create index if not exists idx_telemetry_agent on agent_telemetry (agent_key);
create index if not exists idx_guidelines_rule on system_guidelines (rule_key, state);
create index if not exists idx_orders_mint on paper_orders (mint_address);
create index if not exists idx_audit_created_at on audit_events (created_at desc);

-- Seed the single account_state row.
insert into account_state (id) values (1)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Row-level security (least privilege)
-- ---------------------------------------------------------------------------

alter table account_state enable row level security;
alter table active_positions enable row level security;
alter table trade_history enable row level security;
alter table agent_blackboard enable row level security;
alter table system_guidelines enable row level security;
alter table agent_telemetry enable row level security;
alter table paper_orders enable row level security;
alter table paper_fills enable row level security;
alter table audit_events enable row level security;
alter table config_versions enable row level security;

-- Dashboard read access only. No INSERT/UPDATE/DELETE policies for the
-- frontend role; all writes go through the backend service-role key.
-- The dashboard uses the anon key, so each table gets an anon SELECT policy
-- alongside the authenticated one.

drop policy if exists "read account_state" on account_state;
create policy "read account_state" on account_state
  for select to authenticated using (true);
drop policy if exists "read account_state anon" on account_state;
create policy "read account_state anon" on account_state
  for select to anon using (true);

drop policy if exists "read active_positions" on active_positions;
create policy "read active_positions" on active_positions
  for select to authenticated using (true);
drop policy if exists "read active_positions anon" on active_positions;
create policy "read active_positions anon" on active_positions
  for select to anon using (true);

drop policy if exists "read trade_history" on trade_history;
create policy "read trade_history" on trade_history
  for select to authenticated using (true);
drop policy if exists "read trade_history anon" on trade_history;
create policy "read trade_history anon" on trade_history
  for select to anon using (true);

drop policy if exists "read agent_blackboard" on agent_blackboard;
create policy "read agent_blackboard" on agent_blackboard
  for select to authenticated using (true);
drop policy if exists "read agent_blackboard anon" on agent_blackboard;
create policy "read agent_blackboard anon" on agent_blackboard
  for select to anon using (true);

drop policy if exists "read system_guidelines" on system_guidelines;
create policy "read system_guidelines" on system_guidelines
  for select to authenticated using (state = 'ACTIVE');
drop policy if exists "read system_guidelines anon" on system_guidelines;
create policy "read system_guidelines anon" on system_guidelines
  for select to anon using (state = 'ACTIVE');

drop policy if exists "read agent_telemetry" on agent_telemetry;
create policy "read agent_telemetry" on agent_telemetry
  for select to authenticated using (true);
drop policy if exists "read agent_telemetry anon" on agent_telemetry;
create policy "read agent_telemetry anon" on agent_telemetry
  for select to anon using (true);

-- ---------------------------------------------------------------------------
-- Supabase Realtime
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array['agent_blackboard','agent_telemetry','active_positions','trade_history','account_state'] loop
    begin
      execute format('alter publication supabase_realtime add table %I', t);
    exception when others then
      null;
    end;
  end loop;
end $$;
