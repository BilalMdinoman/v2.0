# V.2.0 — Reconciled Master Spec

This file reconciles the three source documents in the project root:
`master plan.md`, `Systems.md`, and `start here .md`.

## Naming

- Product name: **V.2.0**.
- "Rivara" (used in the master plan) is retired — it was a naming mistake.
- "Aetheris V2.0" (used in Systems.md) was a prior working title; the project
  is now simply **V.2.0**.

## Mission

A seven-agent autonomous AI team that researches and paper-trades Solana
memecoins, using 100% real market data and a 100% virtual ledger, starting
from a $100 balance. The long-term goal is risk-adjusted capital growth with
continuous, evidence-driven self-improvement.

Profitability is something to test, not to promise.

## The seven agents (locked)

| Agent | Role | Model (OpenRouter ID) |
| --- | --- | --- |
| Orion | Master Supervisor | deepseek/deepseek-r1 |
| Cipher | Strategy Generator | deepseek/deepseek-r1 |
| Lupus | Risk Management | deepseek/deepseek-chat |
| Argus | Performance Auditor | deepseek/deepseek-chat |
| Nova | Market Scanner | google/gemini-2.0-flash-001 |
| Zarah | Sentiment Specialist | google/gemini-2.0-flash-001 |
| Elias | Execution Manager | x-ai/grok-3-mini |

Do not rename agents, change their roles, or swap their primary models.

## Key decisions (resolving prompt conflicts)

1. **Roles/models**: Systems.md is authoritative for the locked seven-agent
   config. The master plan's older role names (Scout, Security Auditor, CIO,
   etc.) map onto these new roles. The user's note ("don't contradict
   yourself") confirms the Systems.md model assignments are the chosen ones.
2. **API gateway**: OpenRouter is the single gateway to DeepSeek, Gemini, and
   xAI Grok.
3. **Stack**: Python backend (asyncio + httpx + supabase-py + telegram),
   Next.js + TypeScript + Tailwind frontend, Supabase PostgreSQL.
4. **Execution**: paper trading only. A deterministic risk engine in code is
   authoritative; LLM approval can never override it.

## Scope of the three systems

- System 01 = API Performance & Control Engine (rate limits, queues, retries).
- System 02 = Intelligent Routing & Fallback (model selection, provider health).
- System 03 = Observability, Tracing, Anomaly Detection, Self-Correction
  ("Watcher" in the UI).

## Initial risk defaults

- Starting balance: $100 virtual.
- Max position allocation: 5% of equity.
- Daily trade cap: 10 (no minimum quota — zero is acceptable).
- Stop-loss: 5–10%. Take-profit: 20–50%.
- Minimum reward-to-risk: 2.5:1.
