# V.2.0 — Architecture

## High-level data flow

```
DexScreener (real market data)
        |
        v
Nova (scan) -> Zarah (sentiment) -> Cipher (strategy) -> Lupus (risk)
        |                                                  |
        +--------------- Orion (supervise) <---------------+
                              |
                              v
                    Deterministic risk engine (code, authoritative)
                              |
                              v
                    Elias (execution manager) -> paper execution engine
                              |
                              v
                    Supabase (ledger + blackboard + memory)
                              |
                Argus (audit + health)  <-->  Watcher (observability)
```

## Layers

1. **Market data** — DexScreener for Solana token/pair/price/volume.
2. **Seven agents** — Python modules, each with a locked model via OpenRouter.
   Agents talk through a shared blackboard (Supabase table).
3. **Three systems** — System 01 wraps every LLM call with rate/queue/retry
   control. System 02 picks the model route. System 03 observes everything.
4. **Paper execution** — deterministic engine; LLMs never mutate the ledger.
5. **Dashboard** — Next.js Command Center + Watcher section.

## Trust boundaries

- The backend is the authoritative trading engine, not the dashboard.
- Frontend never receives provider keys or the Supabase service-role key.
- External data and agent outputs are untrusted until validated.
- Risk limits are protected settings; agents cannot silently rewrite them.

## Directory layout

```
V.2.0/
├── apps/web/          # Next.js dashboard (built first)
├── backend/           # Python daemon + agents + systems (next)
│   ├── agents/        # orion, cipher, lupus, argus, nova, zarah, elias
│   ├── prompts/       # versioned agent prompts
│   ├── systems/       # system_01 (perf), system_02 (routing), system_03 (obs)
│   ├── risk/          # deterministic risk engine
│   ├── execution/     # paper execution engine
│   └── services/      # dexscreener, supabase, telegram
├── supabase/          # migrations + schema.sql
└── docs/              # this spec
```
