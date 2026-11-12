# V.2.0 — Implementation Plan

Build in dependency order. Do not claim a stage is done until it is tested.

## Phase 1 — Foundation (this session)

- [x] Next.js + TypeScript + Tailwind scaffold.
- [x] Command Center dashboard UI (7 agents, balance, streams, positions,
      history, overseer logs).
- [x] Watcher section with five views.
- [x] Brand match: dark navy background + cyan/blue/teal/amber accents.
- [ ] Running dev server + address given to Bilal.

## Phase 2 — Database (Supabase)

- schema.sql + migrations: account_state, active_positions, trade_history,
  agent_blackboard, system_guidelines, agent_telemetry.
- Row-level security + least-privilege.
- Indexes, constraints, timestamps.

## Phase 3 — Market data

- DexScreener adapter with timeouts, retries, rate limits, stale-data guard.

## Phase 4 — Safety core

- Deterministic risk engine (allocation, daily cap, SL/TP, duplicate-entry,
  pause/kill-switch).
- Paper execution engine (fills, slippage, fees, PnL, reconciliation, restart
  recovery).

## Phase 5 — Seven agents

- Agent modules + versioned prompts + provider adapters (OpenRouter).
- Structured outputs, telemetry.

## Phase 6 — Orchestration

- Candidate workflow, blackboard, bounded debate, Elias decision.

## Phase 7 — System 01 (API performance)

- RPM/TPM, token buckets, priority queues, concurrency, backoff, jitter,
  Retry-After.

## Phase 8 — System 02 (routing & fallback)

- Model registry, router, capability matcher, provider health, fallback,
  cost control, response validation.

## Phase 9 — System 03 (observability)

- Instrumentation, tracing, anomaly detection, root-cause, self-correction,
  wire Watcher to real data.

## Phase 10 — Telegram + integration + tests

- Telegram alerts (/status, /audit, /pause) with auth.
- Automated tests for risk, ledger, recovery, routing, tracing.
- Deployment docs.
